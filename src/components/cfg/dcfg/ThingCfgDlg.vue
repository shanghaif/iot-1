<template>
  <div>
    <a-modal
      title="被监控对象"
      :visible="visible"
      @ok="handleOk"
      @cancel="visible = false"
    >
      <a-form-model
        ref="ruleForm"
        :model="item"
        :rules="rules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 12 }"
      >
        <a-form-model-item ref="tmodel" label="物模型" prop="tmodelName">
          <a-select
            v-model="item.model_id"
            placeholder="请选择"
            @select="onSelectModel"
          >
            <a-select-option v-for="d in tmodels" :key="d.uid">
              {{ d.s_name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item ref="name" label="名称" prop="name">
          <a-input
            v-model="item.s_name"
            @blur="
              () => {
                $refs.name.onFieldBlur();
              }
            "
          />
        </a-form-model-item>
        <a-form-model-item
          ref="uid"
          label="id"
          prop="uid"
          v-if="item.uid != ''"
        >
          <a-input v-model="item.uid" :disabled="!item.isNew" />
        </a-form-model-item>
        <a-form-model-item label="接入点">
          <a-select v-model="item.proxy_thing_id" style="width: 70%">
            <a-select-option
              v-for="edge in edges"
              :key="edge.uid"
              :value="edge.uid"
            >
              {{ edge.s_name }}
            </a-select-option>
          </a-select>
          <a-button @click="refreshEdges">刷新</a-button>
        </a-form-model-item>
        <a-form-model-item ref="status" label="开通状态" prop="status">
          <a-select v-model="item.status_used">
            <a-select-option value="-1">施工中</a-select-option>
            <a-select-option value="1">启用</a-select-option>
            <a-select-option value="0">停用</a-select-option>
            <a-select-option value="-2">未知</a-select-option>
          </a-select>
        </a-form-model-item>
      </a-form-model>
      <a-form-model>
        <a-form-model-item ref="params" label="设备参数" prop="params">
          <a-modal
            title="Title"
            :visible="showParamDlg"
            @ok="setParamOK"
            @cancel="showParamDlg = false"
          >
            <a-input v-model="paramValue"></a-input>
          </a-modal>
          <a-tabs default-active-key="1">
            <a-tab-pane key="1" tab="设备参数">
              <a-table
                :data-source="item.params"
                :columns="pcolumns"
                :rowKey="(record) => record.param_id"
              >
                <template slot="operation" slot-scope="text, record, index">
                  <a @click="() => edit(record, index)">修改</a>
                </template>
              </a-table>
            </a-tab-pane>
            <a-tab-pane key="2" tab="设备协议服务">
              <a-radio-group
                :options="protocols"
                v-model="item.protocol_path"
              ></a-radio-group>
            </a-tab-pane>
          </a-tabs>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>
<script>
import { get } from "@/services/crud";
const pcolumns = [
  {
    title: "名称",
    dataIndex: "name",
    width: "25%",
  },
  {
    title: "id",
    dataIndex: "param_id",
  },
  {
    title: "类型",
    dataIndex: "data_type.type",
  },
  {
    title: "值",
    dataIndex: "param_value",
    width: "40%",
  },
  {
    title: "operation",
    dataIndex: "operation",
    scopedSlots: { customRender: "operation" },
  },
];

export default {
  computed: {
    tmodels() {
      return this.$store.state.tmodel.tmodels;
    },
    edges() {
      let edges = this.$store.state.thingView.edges;
      if (!edges) {
        edges = [];
      }
      if (
        edges.findIndex((e) => {
          return e.uid == "";
        }) == -1
      ) {
        edges.push({ uid: "", s_name: "直连云端" });
      }

      return edges;
    },
  },
  data() {
    return {
      pcolumns,
      visible: false,
      callback: null,
      owner: null,
      item: {},
      paramValue: "",
      paramIndex: 0,
      showParamDlg: false,
      curRecord: {},
      protocols: [],
      rules: {
        /*
        name: [
          {
            required: true,
            message: "名称不能为空，长度3-100",
            trigger: "blur",
          },
          {
            min: 3,
            max: 100,
            message: "Length should be 3 to 100",
            trigger: "blur",
          },
        ],
        */
      },
    };
  },
  methods: {
    refreshEdges() {
      this.$store.dispatch("thingView/refreshEdges");
    },
    Show(callback, owner, item) {
      console.log("****************", item);
      this.callback = callback;
      this.owner = owner;
      this.paramValue = "";
      this.protocols = [];
      const _this = this;
      this.refreshEdges();
      //this.$store.dispatch("tmodel/refreshTModels").then(() => {
      if (item.uid && item.uid !== "" && !item.isNew) {
        //item.params = []
        get("thingparam", item.uid).then((res) => {
          if (res && res.data && res.data.result) {
            item.params = res.data.result;
            console.log("get params---------------", item);
          }
          _this.item = JSON.parse(JSON.stringify(item));
          if (item.model_id) {
            _this.onSelectModel(item.model_id);
          }

          get("tmodelprotocol", item.model_id).then((res2) => {
            if (res2 && res2.data && res2.data.result) {
              _this.protocols = res2.data.result.map((p) => {
                return{label: p.protocol_path,value:p.protocol_path}
              });
              _this.protocols.push("{label:'空白',value:''}")
            }
            _this.visible = true;
          });
        });
      } else {
        _this.item = JSON.parse(JSON.stringify(item));
        _this.visible = true;
      }

      //});
    },
    edit(record, index) {
      console.log("************", record);
      this.paramValue = record.param_value;
      this.curRecord = record;
      this.showParamDlg = true;
      this.paramIndex = index;
    },
    onSelectModel(val) {
      const m = this.$store.state.tmodel.tmodelCache[val];
      let body = {};
      if (m.body && typeof m.body === "string") {
        body = JSON.parse(m.body);
      } else if (m.body) {
        body = m.body;
      }
      console.log("------------", body);
      if (body && body.params) {
        this.params = [];
        if (!this.item.params) {
          this.item.params = [];
        }
        body.params.forEach((p) => {
          const param = this.item.params.find((ip) => {
            return p.identifier == ip.param_id;
          });
          if (!param) {
            this.item.params.push({
              name: p.name,
              param_id: p.identifier,
              param_value: "",
            });
          } else {
            param.name = p.name;
          }
        });
      } else {
        this.item.params = [];
      }
       let _this = this;
      get("tmodelprotocol", m.uid).then((res2) => {
        if (res2 && res2.data && res2.data.result) {
          _this.protocols = res2.data.result.map((p) => {
            return{label: p.protocol_path,value:p.protocol_path}
          });
          //_this.protocols.push("不选")
          _this.protocols.push({label:'空白',value:''})
        }
      });
    },
    setParamOK() {
      this.curRecord.param_value = this.paramValue;
      this.$set(this.item.params, this.paramIndex, this.curRecord);
      console.log("!!!!!!", this.curRecord);
      this.showParamDlg = false;
    },
    handleOk() {
      if (this.callback) {
        if (typeof this.item.status_used === "string") {
          this.item.status_used = Number(this.item.status_used);
        }
        if (this.item.proxy_thing_id != "") {
          this.item.is_proxy = false;
        } else {
          this.item.is_proxy = true;
        }
        this.callback(this.owner, this);
        this.visible = false;
      }
    },
  },
};
</script>
