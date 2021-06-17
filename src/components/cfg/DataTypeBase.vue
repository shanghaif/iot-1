<template>
  <div>
    <a-tabs default-active-key="1">
      <a-tab-pane key="1" tab="数据类型">
        <a-form-model
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          :model="dataType"
        >
          <a-form-model-item label="类型">
            <a-select
              placeholder="选择数据类型"
              v-model="type"
              @select="onSelectChange"
              style="width: 80%"
            >
              <a-select-option value="percentage">百分比</a-select-option>
              <a-select-option value="int">整数</a-select-option>
              <a-select-option value="float">浮点</a-select-option>
              <a-select-option value="text"> 字符串 </a-select-option>
              <a-select-option value="date"> 日期 </a-select-option>
               <a-select-option value="bool"> 布尔 </a-select-option>
              <a-select-option value="enum"> 枚举 </a-select-option>
              <a-select-option value="stream"> 媒体流 </a-select-option>
              <a-select-option value="struct" v-if="typeHasStruct == 'true'">
                结构
              </a-select-option>
              <a-select-option value="array" v-if="typeHasArray == 'true'">
                数组
              </a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item label="数组大小" v-if="dataType.type === 'array'">
            <a-input-number
              v-model="dataType.specs.size"
              :min="0"
            ></a-input-number>
          </a-form-model-item>
        </a-form-model>
        <a-divider dashed v-if="dataType.type === 'array'" orientation="left"
          >数组成员</a-divider
        >
        <a-divider dashed v-if="dataType.type === 'struct'" orientation="left"
          >结构成员</a-divider
        >
        <common-type
          v-if="
            dataType &&
            dataType !== '' &&
            dataType.type !== 'array' &&
            dataType.type !== 'struct' &&
            dataType.type !== 'date' &&
            dataType.type !== 'percentage' &&
            dataType.type !== 'enum' &&
            dataType.type !== 'bool'
          "
          :specs="dataType.specs"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          :type="dataType.type"
        ></common-type>

        <enum-type
          v-if="dataType.type === 'enum'"
          :specs="dataType.specs"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        ></enum-type>
      </a-tab-pane>
      <a-tab-pane key="2" tab="存储策略" v-if="canSave">
        <save-cfg :item="dataType"></save-cfg>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script>
import CommonType from "./CommonType.vue";
//import StructType from "./StructType.vue";
import EnumType from "./EnumType.vue";
import SaveCfg from "@/components/cfg/savecfg/SaveCfg.vue";

export default {
  name: "DataTypeBase",
  components: {
    CommonType,
    EnumType, //StructType
    SaveCfg,
  },
  props: [
    "dataType",
    "labelCol",
    "wrapperCol",
    "typeHasArray",
    "typeHasStruct",
  ],
  computed: {
    canSave() {
      if (this.dataType) {
        if (this.dataType.type == "struct") {
          return false;
        }
        if (this.dataType.type == "array") {
          return false;
        }
      }
      return true;
    },
  },
  data() {
    return {
      type: "",
    };
  },
  watch: {
    "dataType.type": {
      handler(val, old) {
        console.log("wach changed----", val, old, this.dataType);

        if (val) {
          this.$emit("data-type-changed", val, this);
          this.type = val;
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    onSelectChange(val) {
      this.setType(val);
      console.log("-----select change----", val, this.dataType.type);
    },
    setType(newName) {
      //this.dataType.type = newName;
      this.$set(this.dataType, "type", newName);
      this.$emit("data-type-changed", newName, this);
      console.log(
        "-------watch----datatype.type",
        this,
        this.dataType,
        newName
      );
      //const isArray = newNameDatatype ? Array.isArray(newNameDatatype.specs) : false
      if (newName === "struct" || newName === "enum") {
        this.dataType.specs = [];
        this.dataType.edge_store = { is_period: true, period_type: "60" };
        this.dataType.cloud_store = { is_all: true };
      } else if (newName === "array") {
        this.dataType.specs = {
          size: 1,
          item: {
            type: "",
            edge_store: { is_period: true, period_type: "60" },
            cloud_store: { is_all: true },
            specs: {},
          },
        };
      } else {
        if (
          newName !== "text" &&
          newName !== "stream" &&
          newName !== "percentage"
        ) {
          if (!this.dataType.cloud_store) {
            this.dataType.cloud_store = { is_period: true, period_type: "60" };
          }
          if (!this.dataType.edge_store) {
            this.dataType.cloud_store = { is_all: true };
          }
          if (!this.dataType.specs) {
            this.dataType.specs = { unit: "", unit_name: "", max: 0, min: 0 };
          }
        }
      }
    },
  },
};
</script>