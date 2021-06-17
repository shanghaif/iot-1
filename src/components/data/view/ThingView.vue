<template>
  <div>
    <a-modal
      title="曲线"
      :visible="curShow"
      @ok="curShow = false"
      @cancel="curShow = false"
    >
      <a-tabs default-active-key="1">
        <a-tab-pane key="1" tab="曲线">
          <div id="chart" ref="chart" style="width: 600px; height: 460px"></div>
        </a-tab-pane>
        <a-tab-pane key="2" tab="数据">
          <a-table
            :columns="columns"
            :data-source="curLine"
            :row-key="
              (r, index) => {
                return index;
              }
            "
          ></a-table>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
    <a-descriptions title="设备信息">
      <a-descriptions-item label="名称">
        {{ thing.s_name }}
      </a-descriptions-item>
      <a-descriptions-item label="id">
        {{ thing.uid }}
      </a-descriptions-item>
      <a-descriptions-item label="物模型">
        {{ thing.model_id }}
      </a-descriptions-item>
    </a-descriptions>
    <a-button @click="refresh">查询</a-button>
    <a-table
      :columns="columns"
      :data-source="data"
      :row-key="
        (r, index) => {
          return index;
        }
      "
    >
      <span slot="action" slot-scope="text, record">
        <a-space>
          <a @click="queryLine(record, 'recent')">最近数据</a>
          <a @click="queryLine(record, 'hour')">当日曲线</a>
        </a-space>
      </span></a-table
    >
  </div>
</template>
<script>
import { getEx } from "@/services/crud.js";
let echarts = require("echarts");
var moment = require("moment");
const columns = [
  {
    title: "值",
    dataIndex: "sv",
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
  {
    title: "操作",
    dataIndex: "action",
    scopedSlots: { customRender: "action" },
  },
];
export default {
  data() {
    return {
      columns,
      curLine: [],
      curShow: false,
      chartOption: {
        tooltip: {
          trigger: "axis", // 显示横坐标值
        },
      },
    };
  },
  props: ["thing"],
  computed: {
    data() {
      if (this.$store.state.thingView.activeThing) {
        return this.$store.state.thingView.activeThing.values;
      }
      return [];
    },
  },
  methods: {
    refresh() {
      if (this.thing && this.thing.uid) {
        this.$store.dispatch("thingView/refreshActiveThing", this.thing.uid);
      }
    },
    handleData(data) {
      this.datas = data;
      if (this.datas) {
        this.datas.sort((a, b) => {
          return a.pick_time - b.pick_time;
        });
      }
      this.initChart();
      if (this.chart) {
        //this.initChart();
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

          series[id].data.push([element.picktime, element.v]);
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
    initChart() {
      if (!this.chart) {
        this.chart = echarts.init(this.$refs.chart);
      }
    },
    queryLine(record, type) {
      var _this = this;
      getEx(
        "data/view/",
        this.thing.uid +
          "?kind=" +
          type +
          "&pid=" +
          record.pid +
          "&subid=" +
          record.sid +
          "&index=" +
          record.pi
      ).then((res) => {
        if (res && res.data && res.data.result) {
          res.data.result.forEach((d) => {
            d.picktime = moment.unix(d.pick_time).format();
          });
        }

        _this.curShow = true;
        setTimeout(() => {
          _this.handleData(res.data.result);
          _this.curLine = res.data.result;
        }, 500);
      });
    },
  },
};
</script>