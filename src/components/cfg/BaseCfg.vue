<template>
    <div>
    <a-form-model
      :model="obj"
      :rules="rules"
      :label-col="labelCol" 
      :wrapper-col="wrapperCol"
    >
      <a-form-model-item ref="name" label="名称(不能包括.)" prop="name">
        <a-input
          style="width:60%"
          v-model="obj.name"
          @blur="
            () => {
              $refs.name.onFieldBlur();
              //checkName()
            }
          "
        />
      </a-form-model-item>
      <a-form-model-item ref="identifier" label="ID" prop="identifier">
        <a-input
          v-if="isNew"
          v-model="obj.identifier"
          style="width:60%"
          @blur="
            () => {
              $refs.name.onFieldBlur();
            }
          "
        />
        <span v-else>{{obj.identifier}}</span>
      </a-form-model-item>
      <!--
      <a-form-model-item label="公用" prop="published" v-if="hasPublished==='true'">
        <a-select
          style="width:60%"
          v-model="obj.published"
          placeholder="选择是否公用"
        >
          <a-select-option value="true"> 公用 </a-select-option>
          <a-select-option value="false"> 私有 </a-select-option>
        </a-select>
      </a-form-model-item>
      -->
    </a-form-model>
  </div>
</template>
<script>
export default {
  props: ["obj", "isNew", "hasPublished"],
  name: "BaseCfg",
   data() {
    return {
      labelCol: { span: 4 },
      wrapperCol: { span: 14},
      rules: {
        name: [{ required: true, message: "名称不能为空", trigger: "blur" },
        {validator:this.checkName}],
        identifier: [
          { required: true, message: "id不能为空", trigger: "blur" },
        ],
      },
    };
  },
  methods:{
    checkName(rule, value, callback){
      if(value && value.indexOf(".") != -1){
        callback("名称中不能包括.")
        return
      }
      callback();
    }
  }
};
</script>