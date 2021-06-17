<template>
  <div class="display-flex">
    
    <a-dropdown>
      <div class="header-avatar" style="cursor: pointer">
        <a-avatar
          class="avatar"
          size="small"
          shape="circle"
          :src="user.avatar"
        />
        <span class="name">{{ user.name }}</span>
      </div>
      <a-menu :class="['avatar-menu']" slot="overlay">
        <a-menu-item>
          <a-icon type="user" />
          <span>个人中心</span>
        </a-menu-item>
        <a-menu-item>
          <a-icon type="setting" />
          <span>设置</span>
        </a-menu-item>
        <a-menu-divider />
        <a-menu-item @click="logout">
          <a-icon style="margin-right: 8px" type="poweroff" />
          <span>退出登录</span>
        </a-menu-item>
      </a-menu>
    </a-dropdown>
    <div style="margin:0 0 0 5px">:{{selfID}}</div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { logout } from "@/services/user";

export default {
  created(){
    this.$store.dispatch("config/refreshConfig")
  },
  name: "HeaderAvatar",
  computed: {
    ...mapGetters("account", ["user"]),
    selfID(){
      return this.$store.state.config.config.self ? this.$store.state.config.config.self.ID : ""
    }
  },
  methods: {
    logout() {
      logout();
      this.$router.push("/login");
    },
  },
};
</script>

<style lang="less">
.display-flex {
  display: flex;
}

.header-avatar {
  display: inline-flex;
  .avatar,
  .name {
    align-self: center;
  }
  .avatar {
    margin-right: 8px;
  }
  .name {
    font-weight: 500;
  }
}
.avatar-menu {
  width: 150px;
}
</style>
