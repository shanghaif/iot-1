<template>
  <div>
    <base-cfg :obj="property" :isNew="isNew" :hasPublished="hasPublished"></base-cfg>
    <a-form-model
      :model="property"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
    >
      <a-form-model-item label="模式" prop="access_mode">
        <a-select
          
          style="width:80%"
          v-model="property.access_mode"
          placeholder="读写方式"
        >
          <a-select-option value="r"> 只读 </a-select-option>
          <a-select-option value="rw"> 读写 </a-select-option>
          <a-select-option value="w"> 只写 </a-select-option>
          <a-select-option value="const"> 固定值 </a-select-option>
        </a-select>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>
<script>
//import DataTypeCtrl from "@/components/cfg/DataTypeCtrl.vue";
import BaseCfg from "@/components/cfg/BaseCfg.vue";
export default {
  name: "PCfgBase",
  props: ["property", "isNew", "hasPublished"],
  components: {
    //DataTypeCtrl,
    BaseCfg
  },
  data() {
    return {
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
     
    };
  },
};
</script>