<template>
  <div>
    <a-form-model
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
      :model="specs"
    >
      <a-form-model-item label="范围" v-if="type === 'int' || type === 'float'">
        最小值<a-input
          v-model="specs.min"
          style="width: 30%;margin:0 0 5px 0;"
        />最大值<a-input style="width: 30%;" v-model="specs.max" />
      </a-form-model-item>
      <a-form-model-item label="单位" v-if="type==='int' || type === 'float'">
        <a-input v-model="specs.unit" style="width:80%"></a-input>
      </a-form-model-item>
      <a-form-model-item label="单位名称" v-if="type==='int' || type === 'float'">
        <a-input v-model="specs.unit_name" style="width:80%"></a-input>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>
<script>
export default {
  props: ["labelCol", "wrapperCol", "specs", "type"],
  name: "CommonType",
};
</script>