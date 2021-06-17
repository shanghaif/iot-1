<template>
  <div style="background-color: #ececec; padding: 20px">
    <a-row :gutter="24">
      <a-col :span="12">
        <a-card title="行业" :bordered="false">
          <a-tree-select
            v-model="cvalue"
            style="width: 60%"
            :tree-data="treeData"
            tree-default-expand-all
            search-placeholder="请选择行业"
          />
          <catalog-dlg ref="CatalogDlg"></catalog-dlg>
          <a-button @click="onEditCatalog" type="primary">编辑行业</a-button>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="配置项" :bordered="false"> </a-card>
      </a-col>
    </a-row>
  </div>
</template>
<script>

import CatalogDlg from './CatalogDlg.vue';
export default {
  components: { CatalogDlg},
  props: ["ctype","cname"],
  computed:{
      treeData(){
          return this.$store.state[this.ctype][this.cname]
      },
  },
  data(){
      return  {
          cvalue : "",
          
      }
  },
   methods: {
      onEditCatalog(){
          this.$refs.CatalogDlg.Show()
      }
  },
};
</script>
<style scoped>
</style>