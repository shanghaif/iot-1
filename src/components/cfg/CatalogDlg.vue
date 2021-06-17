<template>
  <div>
    <a-modal
      v-model="visible"
      title="类别编辑（行业属性）"
      ok-text="确认"
      cancel-text="取消"
      @ok="visible = false"
    >
      <a-modal
        title="Title"
        :visible="addDlgVisible"
        @ok="handleSaveCatalogOk"
        @cancel="addDlgVisible = false"
      >
        名称<a-input v-model="newName"></a-input>
        <p></p>
        <p>说明<a-input v-model="disc" type="textarea"></a-input></p>
        <p>
          JSON<vue-json-editor
            v-model="body"
            :show-btns="false"
            :mode="'code'"
            lang="zh"
          ></vue-json-editor>
        </p>
      </a-modal>
      <a-button @click="addNewCatalog">增加</a-button>
      <a-button @click="rename">编辑</a-button>
      <a-popconfirm  ok-text="Yes" cancel-text="No" @confirm="remove">
        <template slot="title">
          <p>一旦执行删除操作数据将无法恢复，是否继续执行？</p>
        </template>
        <a-button>删除</a-button>
      </a-popconfirm>
      <a-button @click="refresh">刷新</a-button>
      <div>
        <a-tree :tree-data="catalogs" default-expand-all @select="onSelect">
          <template slot="title" slot-scope="{ title }">
            <span>
              {{title}}
            </span>
          </template>
        </a-tree>
      </div>
    </a-modal>
  </div>
</template>
<script>
import vueJsonEditor from "vue-json-editor";
export default {
  components: {
    vueJsonEditor,
  },
  computed: {
    catalogs() {
      return this.$store.state.tmodel.catalogs;
    },
  },
  data() {
    return {
      visible: false,
      curNode: undefined,
      addDlgVisible: false,
      newName: "",
      isRename: false,
      parentRename: "",
      disc: "",
      body: "",
    };
  },
  methods: {
    refresh() {
      this.$store.dispatch("tmodel/refreshCatalogs");
    },
    onSelect(keys) {
      if (keys && keys.length > 0) {
        this.curNode = keys[0];
      } else {
        this.curNode = undefined;
      }
    },
    remove() {
      if (this.curNode) {
        const _this = this
        this.$store.dispatch("tmodel/removeCatalog", this.curNode).then(()=>{
          _this.curNode = undefined
        })
        //this.curNode = undefined;
      }
    },
    addNewCatalog() {
      this.newName = "";
      this.disc = "";
      this.body = {};
      this.isRename = false;
      this.addDlgVisible = true;
    },
    rename() {
      if (this.curNode) {
        this.isRename = true;
        const id = this.curNode;
        const catalog = this.$store.state.tmodel.catalogCache[id];
        if (catalog) {
          this.newName = catalog.s_name;
          this.parentRename = catalog.parent_id;
          this.disc = catalog.disc;
          const t = typeof(catalog.body)
          if (t === 'string'){
            this.body = JSON.parse(catalog.body)
          }else{
            this.body = catalog.body
          }
          
        }
        this.addDlgVisible = true;
      }
    },
    handleSaveCatalogOk() {
      const item = {
        uid: this.isRename ? this.curNode : this.newName,
        s_name: this.newName,
        parent_id: this.isRename
          ? this.parentRename
          : this.curNode
          ? this.curNode
          : "COMMON",
        disc: this.disc,
        body: this.body,
      };
      const _this = this;
      const saveMode = this.isRename ? 'saveCatalog' : 'newCatalog'
      this.$store.dispatch("tmodel/" + saveMode, item).then(() => {
        _this.refresh();
        _this.addDlgVisible = false;
      });
      
      //this.curNode = undefined
    },
    Show() {
      this.refresh();
      this.visible = true;
    },
  },
};
</script>