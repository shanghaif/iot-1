<template>
  <div>
    <a-modal
      v-model="visible"
      title="接入协议"
      ok-text="确认"
      cancel-text="取消"
      @cancel="visible = false"
      @ok="OK"
    >
      <a-modal
        v-model="protocolDlgVisible"
        title="接入协议"
        ok-text="确认"
        cancel-text="取消"
        @cancel="protocolDlgVisible = false"
        @ok="ProtocolOK"
      >
        <a-form-model>
          <a-form-model-item label="路径">
            <a-input v-model="curItem.protocol_path"></a-input>
          </a-form-model-item>
          <a-form-model-item label="运行参数">
            <vue-json-editor
              v-model="curItem.param"
              :show-btns="false"
              :mode="'code'"
              lang="zh"
            ></vue-json-editor>
          </a-form-model-item>
        </a-form-model>
      </a-modal>
      <a-button type="primary" @click="addProtocol">增加</a-button>
      <a-table
        size="small"
        :columns="pcolumn"
        :data-source="protocols"
        :rowKey="(record) => record.protocol_path"
      >
        <template slot="operation" slot-scope="text, record">
          <a-space>
            <a-popconfirm
              title="请确认是否删除?"
              @confirm="() => onDelete(record)"
            >
              <a href="javascript:;">删除</a>
            </a-popconfirm>
            <a href="javascript:;" @click="editProtocol(record)">编辑</a>
          </a-space>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>
<script>
import vueJsonEditor from "vue-json-editor";
const pcolumn = [
  {
    title: "路径",
    dataIndex: "protocol_path",
  },
  {
    title: "参数",
    dataIndex: "sparam",
  },
  {
    title: "操作",
    dataIndex: "operation",
    scopedSlots: { customRender: "operation" },
  },
];
export default {
  components: {
    vueJsonEditor,
  },
  data() {
    return {
      pcolumn,
      protocols: [],
      visible: false,
      fun: null,
      owner: null,
      protocolDlgVisible: false,
      isNew: false,
      curItem: {},
    };
  },
  methods: {
    Show(fun, owner, protocols) {
      this.fun = fun;
      this.owner = owner;
      this.visible = true;
      this.protocols = JSON.parse(JSON.stringify(protocols));
    },
    OK() {
      if (this.fun && this.owner) {
        this.fun(this.owner, this.protocols);
      }
      this.visible = false;
    },
    ProtocolOK() {
      if (this.curItem.param) {
        this.curItem.sparam = JSON.stringify(this.curItem.param);
      }
      if (this.isNew) {
        this.protocols.push(this.curItem);
      } else {
        const index = this.protocols.findIndex((p) => {
          return p.protocol_path === this.curItem.protocol_path;
        });
        if (index >= 0) {
          this.$set(this.protocols, index, this.curItem);
        }
      }
      this.protocolDlgVisible = false;
    },
    onDelete(protocol) {
      const index = this.protocols.findIndex((p) => {
        return p.protocol_path === protocol.protocol_path;
      });
      if (index >= 0) {
        this.protocols.splice(index, 1);
      }
    },
    editProtocol(protocol) {
      this.curItem =  JSON.parse(JSON.stringify(protocol));
      this.isNew = false;
      this.protocolDlgVisible = true;
    },
    addProtocol() {
      this.isNew = true;
      this.curItem = {};
      this.protocolDlgVisible = true;
    },
  },
};
</script>
<style scoped>
</style>
