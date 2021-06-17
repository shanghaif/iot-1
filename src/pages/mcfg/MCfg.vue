<template>
  <div style="padding: 10px">
    <a-card>
      <input
        type="file"
        id="files"
        ref="refFile"
        style="display: none"
        v-on:change="fileLoad"
      />
      <sync-model-dlg ref="syncDlg"></sync-model-dlg>
      <div>
        <a-space class="operator">
          <a-button @click="addNew" type="primary">新建物模型</a-button>
          <a-button @click="importRecord" type="primary">导入物模型</a-button>
          <a-button @click="loadModelsFromCloud" type="primary" v-if="isEdge"
            >从云端同步物模型</a-button
          >
          <a-button @click="refresh">刷新</a-button>
          <a-button @click="editCatalog">编辑行业分类</a-button>
          <a-button @click="exportCatalog">导出行业分类</a-button>
          <a-button @click="importCatalog">导入行业分类</a-button>
        </a-space>
        <catalog-dlg ref="catalogDlg"></catalog-dlg>
        <container-dlg ref="ContainerDlg"></container-dlg>
        <t-model-dlg ref="TModelDlg"></t-model-dlg>
        <protocol-service-dlg ref="ProtocolDlg"></protocol-service-dlg>
        <a-table :columns="columns" :dataSource="tmodels" style="height: 100%" :row-key="(r,index)=>{return index}">
          <template slot="name" slot-scope="text, record">
            <a @click="edit(record)">{{ text }}</a>
          </template>
          <template slot="action" slot-scope="text, record">
            <a-space class="operator">
              <a @click="edit(record)"> <a-icon type="edit" />编辑</a>
              <a-dropdown>
                <a class="ant-dropdown-link" @click="(e) => e.preventDefault()">
                  物模型扩展 <a-icon type="down" />
                </a>
                <a-menu slot="overlay">
                  <a-menu-item>
                    <a @click="editContainerRule(record)">
                      <a-icon type="control" />默认规则</a
                    >
                  </a-menu-item>
                  <a-menu-item>
                    <a @click="editProtocol(record)">
                      <a-icon type="apartment" />协议接入</a
                    >
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
              <a-dropdown>
                <a class="ant-dropdown-link" @click="(e) => e.preventDefault()">
                  同步 <a-icon type="down" />
                </a>
                <a-menu slot="overlay">
                  <a-menu-item>
                    <a @click="exportRecord(record)">
                      <a-icon type="export" />导出为文件</a
                    >
                  </a-menu-item>
                  <a-menu-item v-if="isEdge">
                    <a href="javascript:;" @click="setModelToCloud(record.uid)"
                      >向云端同步</a
                    >
                  </a-menu-item>
                  <a-menu-item v-if="isEdge">
                    <a href="javascript:;" @click="getModelToCloud(record.uid)"
                      >从云端同步</a
                    >
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
              <a @click="deleteRecord(record.uid)">
                <a-icon type="delete" />删除</a
              >
            </a-space>
          </template>
        </a-table>
      </div>
    </a-card>
  </div>
</template>

<script>
const columns = [
  {
    title: "名称",
    dataIndex: "s_name",
    scopedSlots: { customRender: "name" },
  },
  {
    title: "id",
    dataIndex: "uid",
    sorter: true,
  },
  {
    title: "说明",
    dataIndex: "desc",
    scopedSlots: { customRender: "description" },
  },
  {
    title: "分类",
    dataIndex: "catalog_name",
    sorter: true,
  },
  {
    title: "操作",
    scopedSlots: { customRender: "action" },
  },
];

//import ModelBaseProperty from "@/components/cfg/ModelBaseProperty";
import TModelDlg from "@/components/cfg/TModelDlg";
import ContainerDlg from "@/components/cfg/ContainerDlg";
import FileSaver from "file-saver";
import CatalogDlg from "@/components/cfg/CatalogDlg";
import ProtocolServiceDlg from "@/components/cfg/ProtocolServiceDlg";
import { get, post } from "@/services/crud";
import SyncModelDlg from "../../components/cfg/sync/SyncModelDlg.vue";
export default {
  name: "MCfg",
  components: {
    TModelDlg,
    ContainerDlg,
    CatalogDlg,
    ProtocolServiceDlg,
    SyncModelDlg,
    //ModelBaseProperty,
  },
  computed: {
    tmodels() {
      return this.$store.state.tmodel.tmodels;
    },
    isEdge() {
      return process.env.VUE_APP_TYPE === "edge";
    },
  },
  mounted() {
    this.refresh();
  },
  data() {
    return {
      advanced: false,
      columns: columns,
      activeModel: {},
      selectedRows: [],
      currentRecord: {},
      currentModelID: "",
      fileType: "",
      mid: "",
    };
  },
  /*authorize: {
    deleteRecord: 'delete'
  },*/
  methods: {
    editProtocol(model) {
      if (model) {
        this.currentModelID = model.uid;
        get("tmodelprotocol", model.uid).then((res) => {
          const data = res.data;
          if (data && data.result) {
            let protocols = data.result;
            this.$refs.ProtocolDlg.Show(this.updateProtocol, this, protocols);
          }
        });
      }
    },
    updateProtocol(_this, protocols,uid) {
      console.log(_this, protocols);
      let mid = uid ? uid : _this.currentModelID
      const mp = { model_id: mid, protocols: protocols };
      post("tmodelprotocol", mp);
    },
    refresh() {
      this.selectedRows = [];
      const _this = this;
      this.$store.dispatch("tmodel/refreshTModels").then(() => {
        const ms = _this.$store.state.tmodel.tmodels;
        if (ms && ms.length > 0) {
          _this.activeModel = ms[0];
        } else {
          this.activeModel = undefined;
        }
      });
    },
    importRecord() {
      this.fileType = "model";
      this.$refs.refFile.dispatchEvent(new MouseEvent("click"));
    },
    importCatalog() {
      this.fileType = "catalog";
      this.$refs.refFile.dispatchEvent(new MouseEvent("click"));
    },
    fileLoad() {
       const selectedFile = this.$refs.refFile.files[0];
      var reader = new FileReader();
      //const record = this.currentRecord
      console.log("XXXXXXXXXXXXXXXXXXXX", selectedFile);
      reader.readAsText(selectedFile);
      const _this = this;
      reader.onload = function () {
        console.log("--------------", this.result);
        const data = JSON.parse(this.result);
        if (_this.fileType === "model") {
          let protocols = data.protocols
          delete data['protocols'] 
          _this.$store.dispatch("tmodel/saveTModel", data);
          if(protocols){
            
            protocols = protocols.map(x=>{
              return {model_id:data.uid,protocol_path:x}
            })
            _this.updateProtocol(_this, protocols,data.uid);
          }
          
        } else {
          data.forEach((catalog) => {
            _this.$store.dispatch("tmodel/newCatalog", catalog);
          });
        }
        //const blob = new Blob([data], {type: ''})
        //FileSaver.saveAs(blob, filepath)
      };
    },
    editCatalog() {
      this.$refs.catalogDlg.Show();
    },
    exportRecord(record) {
      //this.currentRecord = record
     let oldbody = record.body;
      if (typeof oldbody === "string") {
        record.body = JSON.parse(oldbody);
      }
      get("tmodelprotocol", record.uid).then((res2) => {
        if (res2 && res2.data && res2.data.result) {
          var protocols = res2.data.result.map((p) => {
            //return{label: p.protocol_path,value:p.protocol_path}
            return p.protocol_path;
          });
          record.protocols = protocols;
          const data = JSON.stringify(record);
          const blob = new Blob([data], { type: "" });
          const filepath = record.s_name + ".json";
          FileSaver.saveAs(blob, filepath);
          record.body = oldbody;
          delete record["protocols"];
        }
      });
    },
    exportCatalog() {
      let catalogcache = this.$store.state.tmodel.catalogCache;
      let catalogs = [];
      for (let c in catalogcache) {
        catalogs.push(catalogcache[c]);
      }
      const data = JSON.stringify(catalogs);
      const blob = new Blob([data], { type: "" });
      const filepath = catalogs.s_name + ".json";
      FileSaver.saveAs(blob, filepath);
    },
    loadFromCloud(child) {
      return child.$store.dispatch("tmodel/syncModels", {
        un: child.username,
        pd: child.password,
        addr: child.svrAddr,
      });
    },
    loadModelsFromCloud() {
      this.$refs.syncDlg.showDlg(this.loadFromCloud);
    },
    toCloud(child, mid) {
      return this.$store.dispatch("tmodel/ModelToCloud", {
        un: child.username,
        pd: child.password,
        addr: child.svrAddr,
        uid: mid,
      });
    },
    setModelToCloud(mid) {
      this.$refs.syncDlg.showDlg(this.toCloud,this, mid);
    },
    fromCloud(child, mid) {
      return this.$store.dispatch("tmodel/ModelFromCloud", {
        un: child.username,
        pd: child.password,
        addr: child.svrAddr,
        uid: mid,
      });
    },
    getModelToCloud(mid) {
      this.$refs.syncDlg.showDlg(this.fromCloud,this, mid);
    },
    deleteRecord(key) {
      console.log("delete------------", key);
      this.$store.dispatch("tmodel/removeTModel", key);
      this.selectedRows = [];
    },
    toggleAdvanced() {
      this.advanced = !this.advanced;
    },
    onSelectChange() {
      this.$message.info("选中行改变了");
    },
    addNew() {
      this.$refs.TModelDlg.Show();
    },
    edit(tmodel) {
      this.$refs.TModelDlg.Show(tmodel);
    },
    editContainerRule(tmodel) {
      console.log(tmodel);
      var containner_rule = tmodel.containner_rule;
      var containRule;
      if (!containner_rule) {
        containner_rule = {};
        containRule = [];
      } else if (typeof containner_rule == "string") {
        containner_rule = JSON.parse(containner_rule);
        if (!containner_rule) {
          containner_rule = {};
        }
      }
      containRule = containner_rule.contain_rule;
      if (!containRule) {
        containRule = [];
      }

      this.$refs.ContainerDlg.Show(containRule, (rules) => {
        return new Promise((re, rej) => {
          if (typeof containner_rule === "string") {
            containner_rule = JSON.parse(containner_rule);
          }
          if (typeof rules === "string") {
            rules = JSON.parse(rules);
          }
          containner_rule.contain_rule = rules;
          tmodel.containner_rule = containner_rule;

          this.$store
            .dispatch("tmodel/saveTModel", tmodel)
            .then(() => re())
            .catch((err) => {
              rej(err);
            });
        });
      });
    },
  },
};
</script>

<style lang="less" scoped>
.search {
  margin-bottom: 54px;
}
.fold {
  width: calc(100% - 216px);
  display: inline-block;
}
.operator {
  margin-bottom: 18px;
}
@media screen and (max-width: 900px) {
  .fold {
    width: 100%;
  }
}
</style>