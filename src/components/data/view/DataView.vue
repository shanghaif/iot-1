<template>
  <div style="margin: 5px 0 0 10px" v-if="thing">
    <a-tabs default-active-key="100">
      <a-tab-pane tab="设备视图" key="100">
        <thing-view :thing="thing"></thing-view>
      </a-tab-pane>
      <a-tab-pane
        tab="视频"
        key="1"
        v-if="videoStream && videoStream.stream_options"
      >
        {{ thing.s_name }}
        <a-button @click="refreshVideoOptions">获取视频地址</a-button>
        <a-select v-model="videoAddr" style="width: 220px" allowClear>
          <a-select-option
            style="width: 300px"
            v-for="(item, index) in videoStream.stream_options"
            :key="index"
            :value="item.video_addr_option.flv_over_ws"
          >
            {{ item.name }}
          </a-select-option>
        </a-select>
        <a-popconfirm>
          <template slot="title">
            <p>{{ videoStream.stream_options }}</p>
          </template>
          <a-button :disabled="videoAddr == ''">详细信息</a-button>
        </a-popconfirm>

        <a-button :disabled="videoAddr == ''" @click="play">播放</a-button>
        <a-button @click="stop">停止</a-button>

        <div id="videoWnd">
          <video
            name="videoElement"
            class="centeredVideo"
            id="videoElement"
            controls
            width="1024"
            height="576"
            autoplay
          >
            Your browser is too old which doesn't support HTML5 video.
          </video>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" tab="数据">
        <a-form-model layout="inline">
          <a-form-model-item label="属性">
            <a-select
              style="width: 220px"
              v-model="currentPID"
              :labelInValue="true"
            >
              <a-select-option
                v-for="item in properties"
                :key="item.identifier"
                :value="item.identifier"
              >
                {{ item.name }}
              </a-select-option>
            </a-select>
            <a-range-picker
              v-if="queryHistroryData"
              :show-time="{ format: 'HH:mm' }"
              format="YYYY-MM-DD HH:mm"
              :placeholder="['开始时间', '结束时间']"
              @change="onChange"
              @ok="onOk"
            />
            <a-button :disabled="currentPID == null" @click="queryData"
              >查询</a-button
            >
          </a-form-model-item>
        </a-form-model>
        <a-tabs default-active-key="1" @change="onTypeChanged">
          <a-tab-pane tab="数据" key="1">
            <a-table
              :columns="columns"
              :data-source="datas"
              :row-key="
                (r, index) => {
                  return index;
                }
              "
            >
              <div
                slot="filterDropdown"
                slot-scope="{
                  setSelectedKeys,
                  selectedKeys,
                  confirm,
                  clearFilters,
                  column,
                }"
                style="padding: 8px"
              >
                <a-input
                  v-ant-ref="(c) => (searchInput = c)"
                  :placeholder="`Search ${column.dataIndex}`"
                  :value="selectedKeys[0]"
                  style="width: 188px; margin-bottom: 8px; display: block"
                  @change="
                    (e) =>
                      setSelectedKeys(e.target.value ? [e.target.value] : [])
                  "
                  @pressEnter="
                    () => handleSearch(selectedKeys, confirm, column.dataIndex)
                  "
                />
                <a-button
                  type="primary"
                  icon="search"
                  size="small"
                  style="width: 90px; margin-right: 8px"
                  @click="
                    () => handleSearch(selectedKeys, confirm, column.dataIndex)
                  "
                >
                  Search
                </a-button>
                <a-button
                  size="small"
                  style="width: 90px"
                  @click="() => handleReset(clearFilters)"
                >
                  Reset
                </a-button>
              </div>
              <a-icon
                slot="filterIcon"
                slot-scope="filtered"
                type="search"
                :style="{ color: filtered ? '#108ee9' : undefined }"
              />
              <template
                slot="customRender"
                slot-scope="text, record, index, column"
              >
                <span v-if="searchText && searchedColumn === column.dataIndex">
                  <template
                    v-for="(fragment, i) in text
                      .toString()
                      .split(
                        new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i')
                      )"
                  >
                    <mark
                      v-if="fragment.toLowerCase() === searchText.toLowerCase()"
                      :key="i"
                      class="highlight"
                      >{{ fragment }}</mark
                    >
                    <template v-else>{{ fragment }}</template>
                  </template>
                </span>
                <template v-else>
                  {{ text }}
                </template>
              </template>
            </a-table>
          </a-tab-pane>
          <a-tab-pane tab="曲线" key="2">
            <div
              id="chart"
              ref="chart"
              style="width: 600px; height: 460px"
            ></div>
          </a-tab-pane>
        </a-tabs>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script>
let echarts = require("echarts");
let flvjs = require("@/services/player/flv.js");
console.log("----------------", echarts);
import {
  getRealData,
  getHistroyData,
  getVideoOptions,
} from "@/services/dataAPI";
import ThingView from "@/components/data/view/ThingView";

const columns = [
  {
    title: "值",
    dataIndex: "value",
  },
  {
    title: "采集时间",
    dataIndex: "picktime",
  },
  {
    title: "名称",
    dataIndex: "pn",
    key: "name",
  },

  {
    title: "子属性",
    dataIndex: "sname",
    scopedSlots: {
      filterDropdown: "filterDropdown",
      filterIcon: "filterIcon",
      customRender: "customRender",
    },
    onFilter: (value, record) =>
      record.sname.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => {
          this.searchInput.focus();
        });
      }
    },
  },
  {
    title: "索引",
    dataIndex: "pi",
    scopedSlots: {
      filterDropdown: "filterDropdown",
      filterIcon: "filterIcon",
      customRender: "customRender",
    },
    onFilter: (value, record) =>
      record.pi.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => {
          this.searchInput.focus();
        });
      }
    },
  },
];
export default {
  components: {
    ThingView,
  },
  props: ["thing", "queryHistroryData"],
  watch: {
    thing: function (val) {
      this.refreshVideoOptions();
    },
  },
  computed: {
    properties() {
      if (this.thing && this.thing.model) {
        return this.thing.model.obody.properties;
      }
      return [];
    },
    /*
    videoStream() {
      if (this.thing && this.thing.model) {
        var streams = [];
        var _this = this;
        this.thing.model.obody.properties.forEach((p) => {
          if (p.identifier !== _this.currentPID.key) {
            return;
          }
          if (p.data_type.type == "stream") {
            streams.push(p);
          } else {
            if (p.data_type.type == "struct" || p.data_type.type == "array") {
              if (p.data_type.specs.item.type == "stream") {
                streams.push(p.data_type.speces.item);
              }
              let items = [];
              if (Array.isArray(p.data_type.specs)) {
                items = p.data_type.specs;
              }
              if (
                p.data_type.specs &&
                p.data_type.specs.item &&
                p.data_type.specs.item.specs
              ) {
                if (Array.isArray(p.data_type.specs.item.specs)) {
                  items = p.data_type.specs.item.specs;
                }
              }
              if (items.length > 0) {
                items.forEach((item) => {
                  if (item.data_type.type == "stream") {
                    streams.push(item);
                  }
                });
              }
            }
          }
        });
        return streams;
      }
      return [];
    },*/
  },
  mounted() {},
  data() {
    return {
      datas: [],
      columns,
      currentPID: {},
      dateRange: [],
      chart: null,
      //videoID: "",
      searchText: "",
      videoCount: 0,
      uris: [],
      flvPlayer: null,
      videoAddr: "",
      videoStream: [],
      chartOption: {
        tooltip: {
          trigger: "axis", // 显示横坐标值
        },
      },
    };
  },
  methods: {
    handleSearch(selectedKeys, confirm, dataIndex) {
      confirm();
      this.searchText = selectedKeys[0];
      this.searchedColumn = dataIndex;
    },

    handleReset(clearFilters) {
      clearFilters();
      this.searchText = "";
    },
    initChart() {
      if (!this.chart) {
        this.chart = echarts.init(this.$refs.chart);
      }
    },
    refreshVideoOptions() {
      const _this = this;
      getVideoOptions(this.thing.uid).then((option) => {
        _this.videoStream = option;
        _this.videoAddr = undefined;
      });
    },
    onTypeChanged(key) {
      if (key == "2") {
        let _this = this;
        setTimeout(() => {
          _this.initChart();
          _this.handleData(this.datas);
        }, 300);
      }
    },
    handleData(data) {
      this.datas = data;
      if (this.datas) {
        this.datas.sort((a, b) => {
          return a.pick_time - b.pick_time;
        });
      }
      if (this.chart) {
        this.initChart();
        let series = {};
        this.chartOption.xAxis = {
          type: "time",
          splitLine: {
            show: false,
          },
        };
        this.chartOption.yAxis = { type: "value" };
        data.forEach((element) => {
          let id =
            element.tid +
            "_" +
            element.pi +
            "_" +
            element.pid +
            "_" +
            element.sid;
          //element[id] = id
          if (!series[id]) {
            series[id] = {
              type: "line",
              data: [],
              name: element.pn + "#" + element.pi + "#" + element.sname,
            };
          }

          series[id].data.push([element.picktime, element.value]);
        });
        this.chartOption.series = [];
        this.chartOption.legend = { data: [] };
        for (let s in series) {
          this.chartOption.series.push({
            name: series[s].name,
            data: series[s].data,
            type: "line",
          });
          this.chartOption.legend.data.push(series[s].name);
        }
        this.chartOption.legend.data.sort((a, b) => {
          let al = a.length;
          let bl = b.length;
          return al == bl ? (a > b ? 1 : -1) : al - bl;
        });
        this.chartOption.series.sort((a, b) => {
          let al = a.name.length;
          let bl = b.name.length;
          return al == bl ? (a.name > b.name ? 1 : -1) : al - bl;
          //return a.name > b.name ? 1: -1
        });
        this.chart.setOption(this.chartOption);
      }
    },
    queryData() {
      return this.queryHistroryData
        ? this.getHistroyData()
        : this.queryRealData();
    },
    queryRealData() {
      let _this = this;

      getRealData(this.thing.uid, this.currentPID.key, "", -1).then((data) => {
        //let series = {};
        _this.handleData(data);
      });
    },
    getHistroyData() {
      let _this = this;

      getHistroyData(
        this.thing.uid,
        this.currentPID.key,
        "",
        -1,
        this.dateRange[0],
        this.dateRange[1]
      ).then((data) => {
        _this.handleData(data);
      });
    },
    onChange(value, dateString) {
      this.dateRange = dateString;
      console.log("Selected Time: ", value);
      console.log("Formatted Selected Time: ", dateString);
    },
    onOk(value) {
      console.log("onOk: ", value);
    },

    play() {
      var videoElement = document.getElementById("videoElement");
      this.flvPlayer = flvjs.createPlayer({
        type: "flv",
        isLive: true,
        hasAudio: false,
        hasVideo: true,
        enableStashBuffer: true,
        url: this.videoAddr,
      });
      this.flvPlayer.attachMediaElement(videoElement);
      this.flvPlayer.on("scriptdata_arrived", function (e) {
        if (e.onTimeUpdate) {
          console.log("on script data ....." + e.onTimeUpdate.abstime);
        }
      });
      this.flvPlayer.load();
      this.flvPlayer.play();
    },
    stop() {
      if (this.flvPlayer) {
        this.flvPlayer.pause();
        this.flvPlayer.unload();
        this.flvPlayer.detachMediaElement();
        this.flvPlayer.destroy();
        this.flvPlayer = null;
      }
    },
  },
};
</script>