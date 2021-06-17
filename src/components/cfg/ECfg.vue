<template>
  <div>
    <base-cfg
      :obj="event"
      :isNew="isNew"
      :hasPublished="hasPublished"
    ></base-cfg>
    <a-form-model
      :model="event"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
    >
      <a-form-model-item label="类型" prop="access_mode">
        <a-select v-model="event.type" placeholder="类型" default-value="alarm">
          <a-select-option value="alarm"> 告警 </a-select-option>
          <a-select-option value="notify"> 通知 </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="级别" prop="level">
        <a-select default-value="3" v-model="event.level" placeholder="级别">
          <a-select-option value="1"> 1 </a-select-option>
          <a-select-option value="2"> 2 </a-select-option>
          <a-select-option value="3"> 3 </a-select-option>
          <a-select-option value="4"> 4 </a-select-option>
          <a-select-option value="5"> 5 </a-select-option>
          <a-select-option value="6"> 6 </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="告警延时" prop="level">
        <a-input-number defaultValue=0 v-model="event.delay"></a-input-number>
      </a-form-model-item>
      <a-form-model-item label="上报内容" prop="level">
        <a-tabs default-active-key="1">
          <a-tab-pane key="1" tab="属性">
            <a-button size="small" @click="addProperty">选择属性</a-button>
            <props-selector-dlg
              ref="PropertyDlg"
              :properties="properties"
              :propertiesSelected="event.properties_ref"
            ></props-selector-dlg>
            <a-table
              :columns="columnsProp"
              :pagination="false"
              :data-source="propRef"
              :row-key="
                (r) => {
                  return r.identifier;
                }
              "
            >
              <span slot="name" slot-scope="text">{{ text }}</span>
            </a-table>
          </a-tab-pane>
          <a-tab-pane key="2" tab="自定义参数">
            <a-button size="small" @click="addParam">增加</a-button>
            <a-modal
              title="参数"
              :visible="paramDlgVisible"
              @ok="saveRules"
              @cancel="paramDlgVisible = false"
            >
              <p-cfg
                :property="paramEdited"
                :isNew="isNewParam"
                hasPublished="true"
                hasArrayType="true"
                hasStructType="true"
              ></p-cfg>
            </a-modal>
            <a-table
              size="small"
              :columns="columnsParam"
              :data-source="event.output_data"
              :pagination="false"
              :row-key="
                (r) => {
                  return r.identifier;
                }
              "
            >
              <span slot="name" slot-scope="text">{{ text }}</span>
              <template slot="operation" slot-scope="text, record">
                <a-popconfirm
                  title="是否确认删除本项目?"
                  @confirm="() => onDelete(record.identifier)"
                >
                  <a href="javascript:;">删除</a>
                </a-popconfirm>
                <a-divider type="vertical" />
                <a @click="editParam(record)">编辑</a>
              </template>
            </a-table>
          </a-tab-pane>
        </a-tabs>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>
<script>
//import DataTypeCtrl from "@/components/cfg/DataTypeCtrl.vue";
import BaseCfg from "@/components/cfg/BaseCfg.vue";
import PCfg from "@/components/cfg/PCfg.vue";
import PropsSelectorDlg from "@/components/cfg/PropsSelectorDlg.vue";
export default {
  name: "ECfg",
  props: ["event", "isNew", "hasPublished", "properties"],
  components: {
    //DataTypeCtrl,
    BaseCfg,
    PCfg,
    PropsSelectorDlg,
  },
  computed: {
    propRef() {
      if (!this.event || !this.event.properties_ref) {
        return [];
      }
      return this.event.properties_ref;
    },
  },
  methods: {
    onDelete(id) {
      //const _this = this
      let index = this.event.output_data.findIndex((p) => {
        return p.identifier === id;
      });
      if (index >= 0) {
        this.event.output_data.splice(index, 1);
        //return
      }
    },
    addProperty() {
      //const event = this.event
      const self = this;
      this.$refs.PropertyDlg.Show((index, select) => {
        //self.properties_ref = select
        //self.event.properties_ref = select
        self.$set(self.event, "properties_ref", select);
      });
    },
    addParam() {
      this.paramEdited = {
        data_type: { type: "int", specs: { unit: "", unit_name: "" } },
      };
      this.isNewParam = true;
      this.paramDlgVisible = true;
    },
    editParam(record) {
      this.paramEdited = JSON.parse(JSON.stringify(record))
      this.isNewParam = false;
      this.paramDlgVisible = true;
    },
    saveRules() {
      if (!this.paramEdited.name || this.paramEdited.name === "") {
        this.paramEdited.name = this.paramEdited.identifier;
      }
      if (this.event.output_data) {
        //名称重复问题
        const _this = this;
        let index = this.event.output_data.findIndex((p) => {
          return (
            p.identifier != _this.paramEdited.identifier &&
            p.name === _this.paramEdited.name
          );
        });
        if (index >= 0) {
          this.$message.error("名称重复");
          return;
        }
        index = this.event.output_data.findIndex((p) => {
          return p.identifier === _this.paramEdited.identifier;
        });
        if (index >= 0) {
          this.$set(
            this.event.output_data,
            index,
            JSON.parse(JSON.stringify(this.paramEdited)),
            //Object.assign({}, this.paramEdited)
          );
        } else {
          this.event.output_data.push(JSON.parse(JSON.stringify(this.paramEdited)));
        }
      }
      this.paramDlgVisible = false;
    },
  },
  data() {
    return {
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      paramEdited: {},
      paramDlgVisible: false,
      isNewParam: false,
      properties_ref: [],
      columnsProp: [
        {
          title: "名称",
          width: 100,
          dataIndex: "name",
          key: "name",
          fixed: "left",
        },
        {
          title: "id",
          width: 100,
          dataIndex: "identifier",
          key: "identifier",
          fixed: "left",
        },
      ],
      columnsParam: [
        {
          title: "名称",
          width: 100,
          dataIndex: "name",
          key: "name",
          fixed: "left",
        },
        {
          title: "id",
          width: 100,
          dataIndex: "identifier",
          key: "identifier",
          fixed: "left",
        },
        { title: "类型", width: 100, dataIndex: "type", key: "type" },
        {
          title: "操作",
          key: "operation",
          fixed: "right",
          width: 100,
          scopedSlots: { customRender: "operation" },
        },
      ],
    };
  },
};
</script>