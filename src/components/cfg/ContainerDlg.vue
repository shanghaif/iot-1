<template>
  <div>
    <a-modal
      title="默认规则"
      :visible="visible"
      @ok="handleOk"
      @cancel="visible = false"
    >
      <a-tabs>
        <a-tab-pane key="1" tab="默认子设备">
          <a-button @click="add()">新建</a-button>

          <a-table
            :columns="columns"
            :data-source="subItems"
            :row-key="
              (r) => {
                return r.value.model_id;
              }
            "
            bordered
          >
            <template slot="model" slot-scope="text, record">
              <a-cascader
                v-if="record.editable"
                :options="catalogs"
                :fieldNames="{
                  label: 's_name',
                  value: 'uid',
                  children: 'children',
                }"
                placeholder="请选择"
                v-model="modelSel"
                @change="
                  (val, selectedOptions) =>
                    onModelChange(val, selectedOptions, record)
                "
              />
              <template v-else>
                {{text}}
              </template>
            </template>
            <template slot="prefix" slot-scope="text, record">
              <a-input
                v-if="record.editable"
                style="margin: -5px 0"
                v-model="itemEditted.value.prefix"
              ></a-input>
              <template v-else>
                {{text}}
              </template>
            </template>
            <template slot="count" slot-scope="text, record">
              <a-input-number
                v-if="record.editable"
                style="margin: -5px 0"
                v-model="itemEditted.value.count"
              ></a-input-number>
              <template v-else>
                {{text}}
              </template>
            </template>
            <template slot="action" slot-scope="text, record, index">
              <div class="editable-row-operations">
                <span v-if="record.editable">
                  <a @click="() => save(record, index)">保存</a>
                  <a-popconfirm
                    title="是否放弃?"
                    @confirm="() => cancel(record)"
                  >
                    <a>取消</a>
                  </a-popconfirm>
                </span>
                <span v-else>
                  <a
                    :disabled="editingKey !== ''"
                    @click="() => edit(record, index)"
                    >编辑</a
                  >
                </span>

                <a-popconfirm
                  title="是否删除?"
                  @confirm="() => deleteItem(record, index)"
                >
                  <a>删除</a>
                </a-popconfirm>
              </div>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="2" tab="默认规则" force-render >
          <station-rule-cfg></station-rule-cfg>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
  </div>
</template>
<script>

import StationRuleCfg from './StationRuleCfg.vue';
const columns = [
  {
    title: "设备物模型",
    dataIndex: "modelName",
    scopedSlots: { customRender: "model" },
  },
  {
    title: "个数",
    dataIndex: "value.count",
    scopedSlots: { customRender: "count" },
  },
  {
    title: "名称前缀",
    dataIndex: "value.prefix",
    scopedSlots: { customRender: "prefix" },
  },
  {
    title: "操作",
    key: "action",
    scopedSlots: { customRender: "action" },
  },
];
export default {
  components:{
    StationRuleCfg
  },
  computed: {
    catalogs() {
      return this.$store.state.tmodel.catalogModelTree;
    },
  },
  data() {
    return {
      visible: false,
      containRule: {},
      funSave: null,
      columns,
      subItems: [],
      itemEditted: {},
      modelSel: [],
      editingKey: "",
    };
  },
  methods: {
    add() {
      console.log("----------------------");
      this.modelSel = [];
      const item = this.subItems.find((s) => {
        return s.model_id == "";
      });
      if (!item) {
        this.itemEditted = {
          editable: true,
          value: { model_id: "", count: 1 },
        };
        this.subItems.push({ editable: true, value: { model_id: "" } });
      }
    },
    handleOk() {
      if (this.funSave) {
        const _this = this;
        this.funSave(
          this.subItems.map((x) => {
            return x.value;
          })
        ).then(() => {
          _this.visible = false;
        });
      }
    },
    edit(record) {
      this.modelSel = [];
      this.editingKey = record.value.model_id;
      record.editable = true;
      this.itemEditted = JSON.parse(JSON.stringify(record))
    },
    Show(rules, funSave) {
      this.funSave = funSave;
      const target = JSON.parse(JSON.stringify(rules))
      const modalcache = this.$store.state.tmodel.tmodelCache;
      this.subItems = target.map((x) => {
        const m = modalcache[x.model_id];
        const name = m ? m.s_name : "";
        return {
          value: x,
          editable: false,
          modelName: name,
        };
      });
      //this.subItems = rules;
      //this.owner = _this;
      this.modelSel = [];
      this.visible = true;
    },
    save(record, indexSet) {
      if (
        this.itemEditted.value.model_id == "" ||
        !this.itemEditted.value.model_id
      ) {
        this.$message.warn("请选择物模型");
        return;
      }
      const index = this.subItems.findIndex((s) => {
        return s.value.model_id === this.itemEditted.value.model_id;
      });
      if (index >= 0 && indexSet != index) {
        this.$message.warn(
          "请重新选择物模型，物模型不能重复." +
            "目前选择与第" +
            (index + 1) +
            "项重复"
        );
        return;
      }
      for (let item in this.itemEditted) {
        record[item] = this.itemEditted[item];
      }
      if (!record.value) {
        record.value = {};
      }
      for (let item in this.itemEditted.value) {
        record.value[item] = this.itemEditted.value[item];
      }

      record.editable = false;
      this.editingKey = "";
    },
    cancel(record) {
      record.editable = false;
      this.editingKey = "";
    },
    deleteItem(record, index) {
      this.subItems.splice(index, 1);
    },
    onModelChange(val, selectedOptions, record) {
      console.log(val, selectedOptions, record);
      if (selectedOptions) {
        const len = selectedOptions.length;
        if (len > 0) {
          this.$set(
            this.itemEditted.value,
            "model_id",
            selectedOptions[len - 1].uid
          );
          this.$set(
            this.itemEditted.value,
            "prefix",
            selectedOptions[len - 1].s_name
          );
          this.$set(
            this.itemEditted,
            "modelName",
            selectedOptions[len - 1].s_name
          );
        }
      }
    },
  },
};
</script>
<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}
</style>