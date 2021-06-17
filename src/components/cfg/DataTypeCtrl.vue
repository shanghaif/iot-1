<template>
  <div>
    <data-type-base
      v-on:data-type-changed="onDataTypeChanged"
      :dataType="dataType"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
      :typeHasArray="typeHasArray"
      :typeHasStruct="typeHasStruct"
    >
    </data-type-base>
    <struct-type
      v-if="type === 'struct'"
      :specs="dataType.specs"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
    ></struct-type>
    <data-type-ctrl
      v-if="type === 'array'"
      typeHasStruct="true"
      :dataType="dataType.specs.item"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
    ></data-type-ctrl>
  </div>
</template>
<script>
import StructType from "./StructType.vue";
import DataTypeBase from "./DataTypeBase.vue";
//import DataType from './DataType.vue';
export default {
  name: "DataTypeCtrl",
  components: {
    StructType,
    DataTypeBase,
    //DataType,
  },
  watch: {
    "dataType.type": {
      handler(val, old) {
        console.log("datatypectrl-----", val, old, this.dataType);
      },
      deep: true,
      immediate: true,
    },
  },
  data() {
    return {
      type: "",
    };
  },
  methods: {
    onDataTypeChanged(value) {
      //this.$set(this.dataType,'type',value)
      this.type = value;
    },
  },
  props: [
    "dataType",
    "labelCol",
    "wrapperCol",
    "typeHasArray",
    "typeHasStruct",
  ],
};
</script>