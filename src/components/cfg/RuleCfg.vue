<template>
  <div>
    <props-selector-dlg
      ref="pSelDlg"
      :properties="properties"
      selectType="radio"
    ></props-selector-dlg>
    <a-modal
      title="告警条件配置"
      :visible="upLowDlgVisible"
      @ok="saveLimit"
      @cancel="upLowDlgVisible = false"
    >
      <a-button-group>
        <a-button @click="addCondition">增加</a-button>
      </a-button-group>
      <a-table
        :columns="pColumns"
        :data-source="conditions"
        :pagination="false"
      >
        <a
          slot="name"
          slot-scope="text, record"
          @click="editCondition(record)"
          >{{ text }}</a
        >
        <template slot="action" slot-scope="text, record">
          <a style="margin-right: 8px" @click="editCondition(record)">
            <a-icon type="edit"
          /></a>
          <a-popconfirm
            title="请确认是否删除该项目?"
            ok-text="删除"
            cancel-text="放弃"
            @confirm="deleteCondition(record.id_suffix)"
          >
            <a> <a-icon type="delete" /></a>
          </a-popconfirm>
        </template>
      </a-table>
    </a-modal>
    <rule-dlg ref="paramDlg"></rule-dlg>
    <a-button-group>
      <a-button @click="add">增加</a-button>
    </a-button-group>
    <a-table
      :columns="columns"
      :data-source="events"
      :pagination="false"
      :row-key="
        (r) => {
          return r.identifier;
        }
      "
    >
      <a slot="name" slot-scope="text, record" @click="editRecord(record)">{{
        text
      }}</a>
      <template slot="html" slot-scope="text">
        <p v-html="text"></p>
      </template>
      <template slot="action" slot-scope="text, record">
        <a style="margin-right: 8px" @click="editRecord(record)">
          <a-icon type="edit"
        /></a>
        <a-popconfirm
          title="请确认是否删除该项目?"
          ok-text="删除"
          cancel-text="放弃"
          @confirm="deleteRecord(record)"
        >
          <a> <a-icon type="delete" /></a>
        </a-popconfirm>
      </template>
    </a-table>
  </div>
</template>

<script>
import PropsSelectorDlg from "./PropsSelectorDlg.vue";
import RuleDlg from "./RuleDlg";
const pColumns = [
  {
    title: "id后缀",
    dataIndex: "id_suffix",
    key: "idsuffix",
    scopedSlots: { customRender: "name" },
  },
  {
    title: "子属性",
    dataIndex: "subname",
    key: "subname",
  },
  {
    title: "名称后缀",
    dataIndex: "name_suffix",
    key: "namesuffix",
  },
  {
    title: "范围",
    dataIndex: "range",
    key: "range",
    scopedSlots: { customRender: "name" },
  },
  {
    title: "级别",
    dataIndex: "level",
    key: "level",
  },
  {
    title: "延时",
    dataIndex: "delay",
    key: "delay",
  },

  {
    title: "操作",
    dataIndex: "action",
    key: "action",
    scopedSlots: { customRender: "action" },
  },
];
const columns = [
  {
    title: "相关属性",
    dataIndex: "property.name",
    key: "propertyName",
    fixed: "left",
    scopedSlots: { customRender: "name" },
  },
  {
    title: "配置",
    dataIndex: "cfg",
    key: "cfg",
    scopedSlots: { customRender: "html" },
  },

  {
    title: "操作",
    dataIndex: "action",
    key: "action",
    scopedSlots: { customRender: "action" },
    fixed: "right",
  },
];
//_h_sno
export default {
  props: ["rules", "properties"],
  components: {
    PropsSelectorDlg,
    RuleDlg,
  },
  computed: {
    conditions() {
      let result = [];
      if (this.rules && this.itemEdited && this.itemEdited) {
        if (this.itemEdited.content) {
          //this.itemEdited.identifier = condition.identifier
          let i = 0;
          result = this.itemEdited.content.map((c) => {
            return {
              range: c.range,
              level: c.level,
              delay: c.delay,
              key: i++,
              id_suffix: c.id_suffix,
              name_suffix: c.name_suffix,
              subname: c.subItem ? c.subItem.label : "-",
              subItem: c.subItem,
            };
          });
          console.log("*************", result);

          return result;
        }
      }
      return result;
    },
    events() {
      let result = [];
      if (this.rules) {
        this.rules.forEach((element) => {
          if (element.identifier) {
            let isEventRules =
              element.identifier.indexOf("-event_conditions") >= 0 ||
              element.identifier.indexOf("-alarm_conditions") >= 0;
            if (isEventRules) {
              let item = { element: element };
              /*item.value = element.value.value
              item.level = element.value.level*/
              item.identifier = element.identifier;
              item.property = this.properties.find((p) => {
                return item.element.identifier.indexOf(p.identifier) === 0;
              });
              //item.cfg = element.content.name_suffix + ":" + element.con
              let cfg = "";

              element.content.forEach((c) => {
                let subname = c.subItem && c.subItem.label ? c.subItem.label  : "";
              
                cfg +=
                  "<p>" +
                  (subname !="" && !subname ? subname : "") +
                  "." +
                  c.name_suffix +
                  ":" +
                  c.range +
                  " 等级:" +
                  c.level +
                  " 延时:" +
                  c.delay;
              });
              item.cfg = cfg;

              result.push(item);
            }
          }
        });
      }
      return result;
    },
  },
  data() {
    return {
      columns: columns,
      pColumns: pColumns,
      itemEdited: { content: [] },
      upLowDlgVisible: false,
      isNew: false,
      //selectContent: null,
      //currentC: {},
      isConditonNew: true,
      //conditionDlgShow: false,
    };
  },
  methods: {
    editCondition(record) {
      this.isConditonNew = false;
      this.$refs.paramDlg.editCondition(record, this.saveEditCondition, this);
    },
    deleteCondition(key) {
      if (!this.itemEdited.content) {
        this.itemEdited.content = [];
      }
      const index = this.itemEdited.content.findIndex((c) => {
        return c.id_suffix === key;
      });
      if (index >= 0) {
        this.itemEdited.content.splice(index, 1);
      }
    },
    //配置告警条件
    addCondition() {
      this.isConditonNew = true;
      this.$refs.paramDlg.addCondition(
        this.saveNewCondition,
        this,
        this.itemEdited.property
      );
    },
    saveNewCondition(self, currentC) {
      if (!self.itemEdited.content) {
        self.itemEdited.content = [];
      }
      const index = self.itemEdited.content.findIndex((c) => {
        return c.id_suffix === currentC.id_suffix && c.subItem.key == currentC.subItem.key;
      });

      if (index == -1) {
        self.itemEdited.content.push(currentC);
        if (self.checkRange(self.itemEdited.content) == false) {
          this.$confirm({
            title: "是否保存",
            content:
              "您设置的告警条件中有相交的告警区间，也就是说，可能存在一次触发两个不同告警的情况，是否继续？",
            onOk() {
              return new Promise((resolve) => {
                resolve();
              });
            },
            onCancel() {
              self.itemEdited.content.splice(
                self.itemEdited.content.length - 1,
                1
              );
            },
          });
        }
      }
      return true;
    },
    saveEditCondition(self, currentC) {
      if (!self.itemEdited.content) {
        self.itemEdited.content = [];
      }
      const index = self.itemEdited.content.findIndex((c) => {
        return c.id_suffix === currentC.id_suffix;
      });

      if (index != -1) {
        const old = self.itemEdited.content[index];
        self.$set(self.itemEdited.content, index, currentC);
        if (self.checkRange(self.itemEdited.content) == false) {
          this.$confirm({
            title: "是否保存",
            content:
              "您设置的告警条件中有相交的告警区间，也就是说，可能存在一次触发两个不同告警的情况，是否继续？",
            onOk() {
              return new Promise((resolve) => {
                resolve();
              });
            },
            onCancel() {
              self.$set(self.itemEdited.content, index, old);
            },
          });
        }
      }
      return true;
    },
    add() {
      this.isNew = true;

      this.editItem({
        identifier: "",
        content: [],
      });
    },
    editItem(itemEdited) {
      const _this = this;
      this.$refs.pSelDlg.Show((keys, sel) => {
        if (sel && sel.length > 0) {
          _this.itemEdited = itemEdited;

          const id = sel[0].identifier + "-alarm_conditions";
          const param = _this.rules.find((p) => {
            return p.identifier === id;
          });
          if (param) {
            _this.itemEdited =  JSON.parse(JSON.stringify(param));
            _this.isNew = false;
          }
          _this.itemEdited.property = sel[0];
          _this.itemEdited.identifier = id;
          _this.upLowDlgVisible = true;
          if (_this.isNew) {
            _this.addCondition();
          }
        }
      });
    },
    saveLimit() {
      /*this.createAlarmByLimit(
        this.itemEdited.limitType,
        this.itemEdited.sno,
        this.itemEdited.value.value,
        this.itemEdited.value.level,
       
      );*/

      const index = this.rules.findIndex((p) => {
        return p.identifier === this.itemEdited.identifier;
      });
      if (index != -1) {
        this.$set(this.rules, index, this.itemEdited);
      } else {
        this.rules.push(this.itemEdited);
      }
      this.upLowDlgVisible = false;
    },
    isLess(a, b, isAOpen) {
      return a < b ? true : a > b ? false : isAOpen;
    },
    checkRange(content) {
      if (content && content.length > 1) {
        const array = content.map((c) => {
          const parts = c.range.split(",");
          let min = parseFloat(parts[0].substr(1));
          let max = parseFloat(parts[1].substr(0, parts[1].length - 1));
          let result = { max: max, min: min };
          if (parts[0][0] === "(") {
            result.leftOpen = true;
          }
          if (parts[1].indexOf(")") != -1) {
            result.rightOpen = true;
          }
          return result;
        });
        for (let i = 0; i < array.length; i++) {
          for (let j = i + 1; j < array.length; j++) {
            let isLess = this.isLess(
              array[j].max,
              array[i].min,
              array[j].rightOpen
            );
            if (isLess) {
              continue;
            }
            isLess = this.isLess(
              array[i].max,
              array[j].min,
              array[i].rightOpen
            );
            if (isLess) {
              continue;
            }
            return false;
          }
        }
      }
      return true;
    },
    deleteRecord(param) {
      const index = this.rules.findIndex((p) => {
        return p.identifier === param.element.identifier;
      });
      if (index >= 0) {
        this.rules.splice(index, 1);
      }
    },
    editRecord(param) {
      this.isNew = false;
      this.itemEdited = {
        identifier: param.element.identifier,
        content: Object.assign([], param.element.content),
        property: param.element.property,
      };
      this.upLowDlgVisible = true;
    },
  },
};
</script>