<template>
  
  <div>
    <a-modal
      title="Title"
      :visible="bodyShow"
      @ok="bodyShow=false"
      @cancel="bodyShow=false"
    >
      <p>{{textBody}}</p>
    </a-modal>
    <a-form-model
      :model="newItem"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 14 }"
    >
      <a-form-model-item label="名称*">
        <a-input v-model="newItem.s_name" />
      </a-form-model-item>
      <a-form-model-item label="id">
        <a-input :disabled="!isNew" v-model="newItem.uid" />
      </a-form-model-item>
      <a-form-model-item label="场站">
        <a-switch v-model="newItem.is_station"></a-switch>
      </a-form-model-item>
       <a-form-model-item label="边缘控制器">
        <a-switch v-model="newItem.is_edge_control"></a-switch>
      </a-form-model-item>
      <a-form-model-item label="类别*">
        <a-tree-select
          v-model="newItem.catalog_id"
          style="width: 60%"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
          @select="selectCatalog"
          :tree-data="catalogs"
          placeholder="Please select"
          tree-default-expand-all
        >
        </a-tree-select>
        <a-button @click="editCatalogs">编辑分类</a-button>
        <catalog-dlg ref="CatalogDlg"></catalog-dlg>
      </a-form-model-item>
      <a-form-model-item label="说明">
        <a-input v-model="newItem.desc" type="textarea" />
        <a-button @click="openBody">导出</a-button>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>

<script>
import CatalogDlg from "./CatalogDlg.vue";
export default {
  components: { CatalogDlg },
  props: ["newItem", "isNew"],
  computed: {
    catalogs() {
      return this.$store.state.tmodel.catalogs;
    },
    textBody(){
      if(this.newItem){
        return JSON.stringify(this.newItem)
      }
      return ""
    }
  },
  data() {
    return {
      catalog: "",
      checked: false,
      bodyShow:false,
    };
  },
  methods: {
    openBody() {
      this.bodyShow = true
    },
    onStationCheck(e) {
      this.newItem.is_station = e.target.checked;
      this.checked = e.target.checked;
    },
    editCatalogs() {
      this.$refs.CatalogDlg.Show();
    },
    selectCatalog(value, node, extra) {
      console.log(value, node, extra);
      if (value) {
        const catalog = this.$store.state.tmodel.catalogCache[value];
        if (catalog) {
          this.newItem.catalog = catalog;
        }
      }
    },
  },
};
</script>