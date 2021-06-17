<template>
  <div>
    <a-modal
      title="选择量"
      :visible="visible"
      @ok="handleOk"
      @cancel="visible = false"
    >
      <a-form-model
        :model="mete"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 14 }"
      >
        <a-form-model-item label="物模型">
          <a-cascader
            :options="catalogs"
            :fieldNames="{
              label: 's_name',
              value: 'uid',
              children: 'children',
            }"
            placeholder="请选择"
            @change="onModelChange"
            v-model="selValue"
          />
        </a-form-model-item>
        <a-form-model-item label="量类型">
          <a-select
            @select="onTypeSelect"
            v-model="mete.mete_type"
            :disabled="mete.tmodel_id === ''"
          >
            <a-select-option value="properties">属性</a-select-option>
            <a-select-option value="events">事件</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="量">
          <a-select
            :options="metes"
            @select="onMeteSelected"
            v-model="mete.mete_id"
            :disabled="mete.tmodel_id === '' || mete.mete_type === ''"
          >
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="量" v-if="hasSubID">
          <a-select
            :options="subids"
            @select="onMeteSelected"
            v-model="mete.mete_subid"
          >
          </a-select>
        </a-form-model-item>
        <a-form-model-item
          label="量内索引模式"
          v-if="mete.mete_type === 'properties'"
        >
          <a-select
            :disabled="
              metes && metes.length === 0 && mete.meteType === 'events'
            "
            v-model="mete.mete_index_mode"
          >
            <a-select-option value="fixed">固定</a-select-option>
            <a-select-option value="auto">所有</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item
          label="量内索引"
          v-if="
            mete.mete_type === 'properties' && mete.mete_index_mode === 'fixed'
          "
        >
          <a-input
            style="width: 30%"
            v-model="mete.mete_index_expression"
          ></a-input>
          多个索引用逗号隔开，如0,1,2,3
        </a-form-model-item>
        <a-form-model-item label="同类设备编号">
          <a-select :disabled="mete.tmodel_id === ''" v-model="mete.no_type">
            <a-select-option value="fixed">固定</a-select-option>
            <a-select-option value="all">所有</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="同类设备编号" v-if="mete.no_type === 'fixed'">
          <a-input
            style="width: 30%"
            v-model="mete.thing_sno_expression"
          ></a-input>
          多个编号用逗号隔开，如0,1,2,3
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>
<script>
import { get } from "@/services/crud";
export default {
  props: ["type"],
  computed: {
    catalogs() {
      return this.$store.state.tmodel.catalogModelTree;
    },
  },
  data() {
    return {
      mete: {},
      visible: false,
      funSave: null,
      owner: null,
      selValue: [],
      model: {},
      metes: [],
      hasSubID: false,
    };
  },
  methods: {
    Show(mete, fun, parent) {
      if (mete) {
        this.mete = JSON.parse(JSON.stringify(mete))
      } else {
        this.mete = {};
      }
      this.funSave = fun;
      this.owner = parent;
      this.visible = true;
    },
    handleOk() {
      if (this.funSave) {
        if (this.mete.no_type !== "fixed") {
          this.mete.thing_sno_expression = "";
        }
        if (this.mete.mete_index_mode !== "fixed") {
          this.mete.mete_index_expression = "";
        }
        const _this = this;
        this.funSave(this.owner, this.mete).then(() => {
          _this.visible = false;
        });
      }
    },
    onMeteSelected(key) {
      const mete = this.metes.find((m) => {
        return m.value === key;
      });
      if (mete) {
        this.mete.mete_name = mete.label;
      }
      if (mete.obj) {
        console.log("**************", mete);
        if (mete.obj.data_type && mete.obj.data_type.specs) {
          if (mete.obj.data_type.specs.type === "array") {
            this.hasMeteIndex = false;
            if(mete.obj.data_type.specs.item && mete.obj.data_type.specs.item.data_type){
              this.hasSubID = mete.obj.data_type.specs.item.data_type.type === 'struct'
            }
          } else {
            this.hasMeteIndex = true;
            if (mete.obj.data_type.specs.type === "struct") {
              this.hasSubID = true;
            } else {
              this.hasSubID = false
            }
          }
        }
      }
    },
    onModelChange(vals, options) {
      console.log(vals, options);
      const length = vals.length;
      if (length > 0) {
        const id = vals[length - 1];
        this.mete.tmodel_id = id;

        get("tmodel", id).then((res) => {
          if (res && res.data && res.data.result) {
            let model = res.data.result;
            if (model.body && typeof model.body === "string") {
              model.jbody = JSON.parse(model.body);
            } else {
              model.jbody = model.body;
            }
            this.model = model;
            this.mete.tmodel_name = model.s_name;
          }
          this.onTypeSelect(this.meteType);
        });
      }
    },
    onTypeSelect(val) {
      if (val && this.model && this.model.jbody) {
        if (val === "properties" || val === "events") {
          this.metes = this.model.jbody[val].map((x) => {
            return { label: x.name, value: x.identifier, obj: x };
          });
        } else {
          this.metes = [];
        }
      }
    },
  },
};
</script>