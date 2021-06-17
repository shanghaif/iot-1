<template>
  <div>
    <a-button size="small" @click="add">增加</a-button>
    <a-modal
      title="结构项"
      :visible="pDlgVisible"
      @ok="saveItem"
      @cancel="pDlgVisible = false"
    >
      <p-cfg-base
        :property="itemEdited"
        :isNew="isNew"
        hasPublished="false"
        hasArrayType="false"
        hasStructType="false"
      ></p-cfg-base>
      <data-type-base
        :typeHasArray="false"
        :dataType="itemEdited.data_type"
      ></data-type-base>
    </a-modal>
    <a-table
      :columns="columns"
      :data-source="specs"
      size="small"
      style="width:100%"
      :pagination="false"
      :row-key="(record) => record.identifier"
    >
      <template slot="operation" slot-scope="text, record">
        <div>
          <a-popconfirm
            v-if="specs.length"
            title="是否确认删除?"
            @confirm="() => onDelete(record.identifier)"
          >
            <a href="javascript:;">删除</a>
          </a-popconfirm>
          <a-divider type="vertical" />
          <a @click="() => edit(record)">编辑</a>
        </div>
      </template>
    </a-table>
  </div>
</template>
<script>
import DataTypeBase from "./DataTypeBase.vue";
//import PCfg from "./PCfg"
import PCfgBase from "./PCfgBase.vue";
export default {
  props: ["specs"],
  components: {
    PCfgBase,
    DataTypeBase,
  },
  name: "StructType",
  methods: {
    onDelete(key) {
      const iEdit = this.specs.findIndex((p) => {
        return p.identifier === key;
      });
      if (iEdit >= 0) {
        this.specs.splice(iEdit, 1);
      }
    },
    edit(record) {
      this.itemEdited =  JSON.parse(JSON.stringify(record));
      this.isNew = false
      this.pDlgVisible = true;
    },
    add() {
      this.isNew = true;
      this.itemEdited = { data_type: { type: "int", specs: {} } };
      this.pDlgVisible = true;
    },
    saveItem() {
      const id = this.itemEdited.identifier;
      const name = this.itemEdited.name;
      let iEdit = this.specs.findIndex((p) => {
        return p.name === name && p.identifier !== id;
      });
      if (iEdit >= 0) {
        this.$message.error("名称不能重复");
        return;
      }
      iEdit = this.specs.findIndex((p) => {
        return p.identifier === id;
      });
      if (iEdit >= 0) {
        this.specs[iEdit] = this.itemEdited;
      } else {
        console.log("!!!!!!!!!!!!push item", this.itemEdited);
        this.specs.push(this.itemEdited);
      }
      this.pDlgVisible = false
    },
  },
  data() {
    return {
      pDlgVisible: false,
      isNew: true,
      itemEdited: {},
      columns: [
        {
          title: "名称",
          dataIndex: "name",
          key: "name",
        },
        {
          title: "子id",
          dataIndex: "identifier",
          key: "identifier",
        },
         {
          title: "类型",
          dataIndex: "data_type.type",
          key: "type",
        },
        {
          title: "操作",
          dataIndex: "operation",
          key: "operation",
          scopedSlots: { customRender: "operation" },
        },
      ],
    };
  },
};
</script>
<style scoped>
</style>