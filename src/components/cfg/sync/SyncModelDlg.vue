<template>
  <div>
    <a-modal v-model="show" title="同步物模型" @ok="handleOk">
      <a-form-model>
        <a-form-model-item label="地址">
          <a-input style="width: 60%" v-model="svrAddr" />
        </a-form-model-item>
        <a-form-model-item label="用户名">
          <a-input style="width: 60%" v-model="username" />
        </a-form-model-item>
        <a-form-model-item label="密码">
          <a-input style="width: 60%" v-model="password" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>
<script>
export default {
  data() {
    return {
      show: false,
      svrAddr: "127.0.0.1:18866",
      username: "IOT2021",
      password: "Mima2021@)@!",
      fun: null,
      parent: null,
      param:null,
    };
  },
  methods: {
    handleOk() {
      if (this.fun) {
        const _this = this;
        this.fun(this,this.param).then(() => (_this.show = false));
      }

      //this.show = false
    },
    showDlg(fun, parent,param) {
      this.fun = fun;
      this.parent = parent;
      this.show = true;
      this.param = param
    },
  },
};
</script>