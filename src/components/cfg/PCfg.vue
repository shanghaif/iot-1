<template>
  <div>
    <p-cfg-base
      :property="property"
      :isNew="isNew"
      :hasPublished="hasPublished"
      :hasStructType="hasStructType"
      :hasArrayType="hasArrayType"
    ></p-cfg-base>
    <a-collapse accordion default-active-key="1">
      <a-collapse-panel key="1" header="数据类型">
        <div>
          <data-type-ctrl
            :dataType="property.data_type"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            :typeHasArray="hasArrayType"
            :typeHasStruct="hasStructType"
          ></data-type-ctrl>
        </div>
      </a-collapse-panel>
      <a-collapse-panel header="描述" key="3">
        <a-form-model :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-form-model-item label="描述" prop="desc">
            <a-input v-model="property.desc" type="textarea" />
          </a-form-model-item>
        </a-form-model>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>
<script>
import DataTypeCtrl from "@/components/cfg/DataTypeCtrl.vue";
import PCfgBase from "./PCfgBase.vue";
//import SaveCfg from './savecfg/SaveCfg.vue';

export default {
  name: "PCfg",
  props: ["property", "isNew", "hasPublished", "hasStructType", "hasArrayType"],
  components: {
    DataTypeCtrl,
    PCfgBase,
    //SaveCfg,
  },
  computed: {
    canSave() {
      if (this.property) {
        if (this.property.data_type.type == "struct") {
          return false;
        }
        if (this.property.data_type.type == "array") {
          return this.property.data_type.specs.item.type !== "struct";
        }
      }
      return true;
    },
    storeParentItem() {
      if (this.property) {
        if (this.property.data_type.type != "struct") {
          return this.property.data_type;
        }
        if (this.property.data_type.type == "array") {
          if (this.property.data_type.specs.item.type != "struct") {
            return this.property.data_type.specs.item;
          }
        }
      }
      return {};
    },
  },
  watch: {
    "property.data_type"(newValue) {
      this.data_type = newValue;
    },
    deep: true,
  },
  data() {
    return {
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      //property.data_type
      data_type: {},
      rules: {
        name: [{ required: true, message: "名称不能为空", trigger: "blur" }],
        identifier: [
          { required: true, message: "id不能为空", trigger: "blur" },
        ],
      },
    };
  },
};
</script>