<template>
  <div>
    <a-button @click="addParams">增加</a-button>
    <a-modal
      title="参数"
      :visible="paramsDlgVisible"
      @ok="editParams()"
      @cancel="paramsDlgVisible = false"
    >
      <div>
        <a-form-model :labelCol="{ span: 4 }" :wrapperCol="{ span: 12 }">
          <a-form-model-item label="名称">
            <a-input v-model="param.name" style="width: 80%"></a-input>
          </a-form-model-item>
          <a-form-model-item label="id">
            <a-input v-model="param.identifier" style="width: 80%" :disabled="!isNew"></a-input>
          </a-form-model-item>
          <a-form-model-item label="默认值">
            <a-input v-model="param.default" style="width: 80%"></a-input>
          </a-form-model-item>
           <a-form-model-item label="正则表达式" >
            <a-input v-model="param.regular" style="width: 80%"></a-input>
          </a-form-model-item>
        </a-form-model>
        <data-type-base
          :typeHasArray="false"
          :typeHasStruct="false"
          :labelCol="{ span: 4 }"
          :wrapperCol="{ span: 12 }"
          :dataType="param.data_type"
        ></data-type-base>
      </div>
    </a-modal>

    <a-table
      :data-source="params"
      :columns="pcolumns"
      :rowKey="(record) => record.identifier"
    >
      <template slot="operation" slot-scope="text, record">
        <a-space>
          <span><a @click="editParam(record)">编辑</a></span>
          <span><a @click="deleteParam(record)">删除</a></span>
        </a-space>
      </template>
    </a-table>
  </div>
</template>
<script>
import DataTypeBase from "./DataTypeBase.vue";
const pcolumns = [
  {
    title: "参数名称",
    dataIndex: "name",
    width: "20%",
    scopedSlots: { customRender: "name" },
  },
  {
    title: "参数ID",
    dataIndex: "identifier",
    width: "20%",
    scopedSlots: { customRender: "identifier" },
  },
  {
    title: "类型",
    dataIndex: "data_type.type",
    width: "20%",
  },
   {
    title: "默认值",
    dataIndex: "default",
    width: "20%",
  },
  {
    title: "操作",
    dataIndex: "operation",
    scopedSlots: { customRender: "operation" },
  },
];
export default {
  props: ["params"],
  components: {
    DataTypeBase,
  },
  data() {
    return {
      pcolumns,
      paramsDlgVisible: false,
      isNew: false,
      param: { data_type: { specs: {} } },
      editingKey: "",
    };
  },
  methods: {
    addParams() {
      this.param = { data_type: { specs: {} } ,defualt:''};
      this.isNew = true;
      this.paramsDlgVisible = true;
    },
    editParams() {
      if (this.isNew) {
        this.params.push(this.param);
      } else {
        const index = this.params.findIndex((p) => {
          return p.identifier === this.param.identifier;
        });
        if (index >= 0) {
          this.$set(this.params, index, this.param);
        }
      }
      this.paramsDlgVisible = false;
    },
    editParam(record) {
      this.isNew = false;
      if(record.defualt == undefined){
        record.defualt = ""
      }
      this.param = JSON.parse(JSON.stringify(record))
      this.paramsDlgVisible = true;
    },
    deleteParam(record) {
      const index = this.params.findIndex((p) => {
        return p.identifier === record.identifier;
      });
      if (index >= 0) {
        this.params.splice(index, 1);
      }
    },
  },
};
</script>
