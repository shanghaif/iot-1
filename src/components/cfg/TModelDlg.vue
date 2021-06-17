<template>
  <div>
    <a-modal
      v-model="visible"
      title="物模型编辑"
      ok-text="确认"
      cancel-text="取消"
      width="40%"
      @ok="ok"
      @cancel="cancel"
    >
      <template slot="footer">
        <a-button key="cancel" @click="cancel"> 取消 </a-button>
        <a-button key="save" @click="save(false)"> 保存 </a-button>
        <a-button key="submit" type="primary" @click="ok"> 确认 </a-button>
      </template>
      <a-tabs :tab-position="mode" v-model="activeTab">
        <a-tab-pane key="base" tab="基础信息">
          <model-base-property
            :isNew="isNew"
            :newItem="acticeModel"
          ></model-base-property>
        </a-tab-pane>
        <a-tab-pane key="property" tab="属性">
          <m-p-cfg :properties="properties"></m-p-cfg>
        </a-tab-pane>
        <a-tab-pane key="event" tab="事件/告警">
          <m-e-cfg
            :events="events"
            :properties="properties"
            :rules="rules"
          ></m-e-cfg>
        </a-tab-pane>
        <a-tab-pane key="service" tab="服务">
          <m-s-cfg :services="services"></m-s-cfg>
        </a-tab-pane>
        <a-tab-pane key="params" tab="设备参数">
          <params-cfg :params="params"></params-cfg>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
  </div>
</template>
<script>
import ModelBaseProperty from "@/components/cfg/ModelBaseProperty";
import MPCfg from "@/components/cfg/MPCfg";
import MECfg from "@/components/cfg/MECfg";
import MSCfg from "@/components/cfg/MSCfg";
import ParamsCfg from "@/components/cfg/ParamsCfg";

const nanoid = require("nanoid");

export default {
  name: "TModelDlg",
  //props:["form"],
  components: {
    ModelBaseProperty,
    MPCfg,
    MECfg,
    MSCfg,
    ParamsCfg,
  },
  data() {
    return {
      //onOKfun: null,
      visible: false,
      acticeModel: {},
      mode: "top",
      isNew: true,
      properties: [],
      params: [],
      rules: [],
      events: [],
      services: [],
      isSaved: false,
      activeTab: "base",
      isAutoSave: false,
    };
  },
  methods: {
    getObj(body, name) {
      if (body && body[name]) {
        return body[name];
      }
      return [];
    },

    Show(item) {
      this.activeTab = "base";
      this.isSaved = false;
      if (item) {
        this.isNew = false;
        this.acticeModel = Object.assign(item);
      } else {
        this.isNew = true;
        this.acticeModel = {
          s_name: "新增",
          uid: "m_" + nanoid.nanoid(),
          catalog_id: "COMMON",
          body: "{}",
        };

        //this.onOKfun = onOKfun;
      }
      //let props = [];
      if (typeof this.acticeModel.body === "string") {
        this.acticeModel.obody = JSON.parse(this.acticeModel.body);
      } else {
        this.acticeModel.obody = this.acticeModel.body;
      }

      this.properties = this.getObj(this.acticeModel.obody, "properties");
      this.events = this.getObj(this.acticeModel.obody, "events");
      this.services = this.getObj(this.acticeModel.obody, "services");
      this.rules = this.getObj(this.acticeModel.obody, "rules");
      this.params = this.getObj(this.acticeModel.obody, "params");

      //this.properties = this.acticeModel.obody ? (this.acticeModel.obody.properties ? this.acticeModel.properties :[]) :[]

      this.$store.dispatch("tmodel/refreshCatalogs");
      this.visible = true;
      var _this = this;
      this.timer = setInterval(() => {
        if (!_this.isNew) {
          this.isAutoSave = true
          _this.save();
        }
      }, 60000);
      //this.refresh();
    },

    getExpression(range, pid, subid) {
      let isLeftE = range.indexOf("[") != -1;
      let isRightE = range.indexOf("]") != -1;
      let parts = range
        .replace("(", "")
        .replace("[", "")
        .replace("]", "")
        .replace(")", "")
        .split(",");
      let spid = pid + (subid != "" && subid ? "." + subid : "");
      let expression =
        "(" +
        parts[0] +
        "<" +
        (isLeftE ? "=" : "") +
        "{{" +
        spid +
        "}}" +
        ") &&(" +
        "{{" +
        spid +
        "}}" +
        "<" +
        (isRightE ? "=" : "") +
        parts[1] +
        ")";
      return expression;
    },
    save(isAutoSave) {
      //const self = this;
      //this.onOKfun()
      this.isAutoSave = isAutoSave ? isAutoSave : false
      this.acticeModel.body = {
        properties: this.properties,
        events: this.events,
        services: this.services,
        rules: this.rules,
        params: this.params,
      };
      this.rules.forEach((element) => {
        let isEventRules =
          element.identifier.indexOf("-event_conditions") >= 0 ||
          element.identifier.indexOf("-alarm_conditions") >= 0;
        if (isEventRules) {
          element.content.forEach((c) => {
            delete c.property;
            let subname =
              c.subItem && c.subItem.label ? "" + c.subItem.label : "";
            let subid = c.subItem && c.subItem.key ? "_" + c.subItem.key : "";
            let event = {
              identifier:
                element.property.identifier + subid + "_" + c.id_suffix,
              name: element.property.name + subname + c.name_suffix,
              level: c.level,
              published: "true",
              type:
                element.identifier.indexOf("-alarm_conditions") >= 0
                  ? "alarm"
                  : "notify",
              from_property: true,
              delay: parseInt(c.delay),
            };
            c.expression = this.getExpression(
              c.range,
              element.property.identifier,
              c.subItem ? c.subItem.key : undefined
            );
            c.target_id = event.identifier;
            c.is_event = true;
            const oldindex = this.events.findIndex((e) => {
              return e.identifier == event.identifier;
            });
            if (oldindex == -1) {
              this.events.push(event);
            } else {
              this.events[oldindex] = event;
            }
          });
        }
      });
      this.acticeModel.obody = undefined;
      const _this = this;
      const isnew = this.isNew && !this.isSaved;
      //const body = this.acticeModel.body
      //this.acticeModel.body = JSON.stringify(this.acticeModel.body)

      //this.acticeModel.body.properties = this.properties
      return this.$store
        .dispatch(
          "tmodel/" + (isnew ? "newTModel" : "saveTModel"),
          this.acticeModel
        )
        .then(() => {
          //_this.acticeModel.body = body
          _this.isSaved = true;
          if(!this.isAutoSave)
          {
            this.$message.success("保存成功", 3);
          }
          
        });
    },
    ok() {
      const _this = this;
      this.isAutoSave = false
      this.save(true).then(() => {
        _this.cancel();
      });
    },
    cancel() {
      clearInterval(this.timer);
      this.visible = false;
    },
    editParams() {},
  },
};
</script>