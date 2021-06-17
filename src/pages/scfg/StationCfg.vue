<template>
  <div>
    <a-card :loading="loading">
      <div :class="advanced ? 'search' : null">
        <a-form layout="horizontal">
          <div :class="advanced ? null : 'fold'">
            <a-row>
              <a-col :md="8" :sm="24">
                <a-form-item
                  label="区域:"
                  :labelCol="{ span: 5 }"
                  :wrapperCol="{ span: 18, offset: 1 }"
                >
                  <area-cascader
                    v-model="currentArea"
                    :ChangeOnSelect="true"
                  ></area-cascader>
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item
                  label="名称:"
                  :labelCol="{ span: 5 }"
                  :wrapperCol="{ span: 18, offset: 1 }"
                >
                  <a-input placeholder="请输入" v-model="name" />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item
                  label="id"
                  :labelCol="{ span: 5 }"
                  :wrapperCol="{ span: 18, offset: 1 }"
                >
                  <a-input
                    style="width: 100%"
                    v-model="uid"
                    placeholder="请输入"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row v-if="advanced">
              <a-col :md="8" :sm="24">
                <a-form-item
                  label="物模型："
                  :labelCol="{ span: 5 }"
                  :wrapperCol="{ span: 18, offset: 1 }"
                >
                  <a-cascader
                    :options="catalogs"
                    :fieldNames="{
                      label: 's_name',
                      value: 'uid',
                      children: 'children',
                    }"
                    placeholder="请选择"
                    @change="onModelChange"
                  />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item
                  label="状态："
                  :labelCol="{ span: 5 }"
                  :wrapperCol="{ span: 18, offset: 1 }"
                >
                  <a-select placeholder="请选择" v-model="status">
                    <a-select-option value="1">使用中</a-select-option>
                    <a-select-option value="0">停止</a-select-option>
                    <a-select-option value="-1">施工中</a-select-option>
                    <a-select-option value="-2">未知</a-select-option>
                    <a-select-option value="-3">所有</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item
                  label="级别："
                  :labelCol="{ span: 5 }"
                  :wrapperCol="{ span: 18, offset: 1 }"
                >
                  <a-select default-value="5" v-model="level">
                    <a-select-option value="0">所有</a-select-option>
                    <a-select-option v-for="i in 10" :key="i" :value="i">
                      {{i}}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </div>
          <span style="float: right; margin-top: 3px">
            <a-button type="primary" @click="searchStation">查询</a-button>
            <a-button style="margin-left: 8px">重置</a-button>
            <a @click="toggleAdvanced" style="margin-left: 8px">
              {{advanced ? "收起" : "展开"}}
              <a-icon :type="advanced ? 'up' : 'down'" />
            </a>
          </span>
        </a-form>
      </div>
      <div>
        <a-space class="operator">
          <a-button @click="addNew" type="primary">新建</a-button>
          <a-button @click="addNew" type="primary">批量建立</a-button>
          <a-button @click="importRecord" type="primary">导入</a-button>
          <a-button @click="refresh">刷新</a-button>
        </a-space>
        <station-dlg ref="stationDlg" :isNew="isNew"></station-dlg>
        <thing-cfg-dlg ref="thingDlg"></thing-cfg-dlg>
        <a-table
          @expand="expand"
          :loading="loading"
          :columns="columns"
          :dataSource="stations"
          :pagination="true"
          :row-key="
            (r) => {
              return r.uid;
            }
          "
        >
          <template slot="status" slot-scope="text, record">
            <span v-if="record.status_used === -2">未知</span>
            <span v-if="record.status_used === 1">使用中</span>
            <span v-if="record.status_used === 0">停用</span>
            <span v-if="record.status_used === -1">施工中</span>
          </template>
          <template slot="action" slot-scope="text, record">
            <a style="margin-right: 8px" @click="addThing(record)">
              <a-icon type="plus" @click="addThing(record)" />被监控对象</a
            >
            <a style="margin-right: 8px" >
              <a-icon type="edit"></a-icon>
              编辑
            </a>
            <a @click="deleteRecord(record.uid)">
              <a-icon type="delete" />删除
            </a>
          </template>
          <p slot="expandedRowRender" slot-scope="record">
            <template v-for="child in record.things">
              <a-dropdown-button
                :key="child.uid"
                style="margin: 5px; font-size: 14px"
              >
                {{child.s_name}}
                <a-menu slot="overlay">
                  <a-menu-item>
                    <a href="javascript:;" @click="editThing(child,record)">编辑</a>
                  </a-menu-item>
                  <a-menu-item>
                    <a href="javascript:;" @click="removeDev(child, record)"
                      >删除</a
                    >
                  </a-menu-item>
                </a-menu>
              </a-dropdown-button>
            </template>
          </p>
        </a-table>
      </div>
    </a-card>
  </div>
</template>
<script>
import AreaCascader from "../../components/cfg/scfg/AreaCascader.vue";
import StationDlg from "../../components/cfg/dcfg/StationDlg.vue";
import ThingCfgDlg from "../../components/cfg/dcfg/ThingCfgDlg.vue";
import { post, remove, get, search, update } from "@/services/crud";
const columns = [
  {
    title: "编号id",
    dataIndex: "uid",
    key: "uid",
  },
  {
    title: "区域",
    dataIndex: "area_name",
    key: "area_name",
  },
  {
    title: "名称",
    dataIndex: "s_name",
    key: "s_name",
  },
  {
    title: "状态",
    dataIndex: "status_used",
    key: "status_used",
    scopedSlots: { customRender: "status" },
  },
  {
    title: "级别",
    dataIndex: "level",
    key: "level",
  },
  {
    title: "描述",
    dataIndex: "desc",
    key: "desc",
  },
  {
    title: "操作",
    scopedSlots: { customRender: "action" },
  },
];
export default {
  data() {
    return {
      advanced: false,
      columns,
      currentArea: {},
      stations: [],
      name: "",
      uid: "",
      modelId: "",
      level: 0,
      status: -3,
      isNew: false,
      loading: false,
      curStation: null,
    };
  },
  computed: {
    catalogs() {
      return this.$store.state.tmodel.catalogModelTree;
    },
  },
  components: { StationDlg, AreaCascader, ThingCfgDlg },
  mounted() {
    this.refresh();
  },
  methods: {
    thingAction(fun, owner, item) {
      //const item = dlg.$data.item
      const _this = owner;
      fun("thing", item).then((res) => {
        console.log("***************", res);
        if (res && res.data && res.data.result) {
          item.uid = res.data.result.uid;
        }
        if (item.station) {
          console.log(item);
          fun("thingstation", {
            thing_id: item.uid,
            station_id: item.station.uid,
          }).finally(() => {
            _this.expand(true, _this.curStation);
          }).then(()=>{
            //let itemparams = item.params
            let setParams = {
              thing_id:item.uid,
              values : item.params
            }
            fun("thingparam",setParams)
          }
          );
        }
      });
    },
    addThingToSvr(owner, dlg) {
      const item = dlg.$data.item;
      console.log("add item--------------",item)
      owner.thingAction(post, owner, item);
    },
    updateThingToSvr(owner, dlg) {
      const item = dlg.$data.item;
      console.log("update item--------------",item)
      owner.thingAction(update, owner, item);
    },
    addThing(record) {
      this.curStation = record;
      console.log("-------------", record);
      this.loading = true
      this.$refs.thingDlg.Show(this.addThingToSvr, this, {
        isNew: true,
        station: record,
      });
      this.loading = false
    },
    editThing(child,record) {
      this.curStation = record;
      console.log("-------------", record);
      const item = Object.assign({},child)
      item.isNew = false
      item.station = record
      this.$refs.thingDlg.Show(this.updateThingToSvr, this, item);
    },
    removeDev(child, parent) {
      let _this = this;
      remove("thing", child.uid).finally(() => {
        _this.expand(true, parent);
      });
    },
    expand(expanded, record) {
      console.log("2---------------", expanded, record);
      if (expanded) {
        this.loading = true;
        const _this = this;
        get("station/" + record.uid, "?children=true")
          .then((res) => {
            if (res && res.data) {
              record.things = res.data.result;
            }
          })
          .finally(() => {
            _this.loading = false;
          });
      }
    },
    toggleAdvanced() {
      this.advanced = !this.advanced;
    },
    confirm() {
      var createChildren;
      let _this = this;
      return new Promise((re) => {
        _this.$confirm({
          title: "创建子设备",
          content: "是否根据配置创建子设备?",
          onOk() {
            //const mid = station.model_id//找到模板
            //console.log(station);
            createChildren = true;
            re(createChildren);
          },
          onCancel() {
            createChildren = false;
            re(createChildren);
          },
        });
      });
    },
    save(_this, station) {
      //const _this = this
      if (this.addNew) {
        this.confirm().then((createChildren) => {
          _this.$store
            .dispatch("station/newStation", {
              station,
              hasChildren: createChildren,
            })
            .then(() => {
              _this.$refs.stationDlg.Close();
            });
        });
      } else {
        _this.$store.dispatch("station/updateStation", station).then(() => {
          _this.$refs.stationDlg.Close();
        });
      }
    },
    addNew() {
      this.isNew = true;
      this.$refs.stationDlg.Show(this.save, undefined, this);
    },
    importRecord() {},
    refresh() {
      //const _this = this
      this.searchStation();
    },
    onModelChange(val) {
      if (val && val.length > 0) {
        const sel = val[val.length - 1];
        this.modelId = sel;
      } else {
        this.modelId = "";
      }
    },
    deleteRecord(uid) {
      const _this = this;
      this.$store.dispatch("station/removeStation", uid).then(() => {
        let index = _this.stations.findIndex((s) => {
          return s.uid == uid;
        });
        if (index >= 0) {
          _this.stations.splice(index, 1);
        }
      });
    },
    searchStation() {
      console.log("-----", this.currentArea);
      let condition = {};
      if (this.currentArea && this.currentArea.obj) {
        condition["areas.whole_name"] = this.currentArea.obj.s_name;
      }
      if (this.name != "") {
        condition["stations.s_name"] = this.name;
      }
      if (this.uid != "") {
        condition["stations.uid"] = this.uid;
      }
      if (this.modelId != "") {
        condition["things.model_id"] = this.modelId;
      }
      if (this.level != 0) {
        condition["stations.level"] = this.level;
      }
      if (this.status != -3) {
        condition["things.status_used"] = this.status;
      }
      this.stations = [];
      search("station", condition).then((res) => {
        if (res.data.result) {
          this.stations = res.data.result;
        }
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