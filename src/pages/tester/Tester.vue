<template>
  <div class="new-page">
    <a-layout>
      <a-layout-sider
        breakpoint="lg"
        collapsed-width="0"
        width="250"
        class="left-sider"
      >
        <a-button @click="refresh">刷新</a-button>
        <thing-tree ref="objTree" @thing-select="selectTreeNode"></thing-tree>
      </a-layout-sider>
      <a-layout>
        <a-layout-content style="margin: 0 0 0 5px">
          <div class="content" :style="{ minHeight: minHeight + 'px' }">
            <a-tabs default-active-key="1">
              <a-tab-pane key="1" tab="属性实时视图">
                <data-view :thing="thing"></data-view>
              </a-tab-pane>
              <a-tab-pane key="2" tab="属性历史视图">
                <data-view :thing="thing" :queryHistroryData="true"></data-view>
              </a-tab-pane>
              <a-tab-pane key="4" tab="实时告警视图">
                <alarm-table :alarms="activeAlarm"></alarm-table>
              </a-tab-pane>
              <a-tab-pane key="5" tab="历史告警视图">
                <alarm-history :thing="thing"></alarm-history>
              </a-tab-pane>
              <a-tab-pane key="6" tab="服务视图">
                <service-ctrl :thing="thing"></service-ctrl>
              </a-tab-pane>
            </a-tabs>
          </div>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>
<script>
//import PageLayout from '@/layouts/PageLayout'

import ThingTree from "@/components/data/thingTree/ThingTree.vue";
import DataView from "@/components/data/view/DataView.vue";
import AlarmTable from "../../components/alarm/alarmTable.vue";
import AlarmHistory from "../../components/alarm/alarmHistroy.vue";
import ServiceCtrl from "../../components/service/serviceCtrl.vue";

export default {
  components: {
    ThingTree,
    DataView,
    AlarmTable,
    AlarmHistory,
    ServiceCtrl,
  },
  computed: {
    activeAlarm() {
      if (this.thing) {
        return this.$store.state.activeAlarm.activeAlarms.filter((a) => {
          return a.t_id == this.thing.uid;
        });
      }
      return [];
    },
    alarmCount() {
      const alarms = this.$store.state.activeAlarm.activeAlarms;
      if (alarms) {
        return alarms.length;
      }
      return 0;
    },
    minHeight() {
      return document.body.clientHeight - 150;
    },
  },
  mounted() {
    document.addEventListener("visibilitychange", this.handleVisiable);
    this.refresh();
  },

  data() {
    return {
      thing: null,
      //curStation: null,
      //addNew: true,
    };
  },
  methods: {
    refresh() {
      console.log("---------refresh-------------");
      this.$store.dispatch("thingView/refreshStations");
    },
    handleVisiable(e) {
      if (e.target.visibilityState === "visible") {
        this.refresh();
      }
    },
    setThing(tid) {
      let thing = this.$store.state.thingView.thingCache[tid];
      if (!thing && this.$store.state.thingView.stationCache) {
        thing = this.$store.state.thingView.stationCache[tid];
      }
      this.thing = thing;
    },
    selectTreeNode(tid) {
      //let _this = this
      this.setThing(tid)
      console.log("%%%%%%%%%%", this.thing);
      if (!this.thing || !this.thing.children || this.thing.children.length == 0) {
        var _this = this
        this.$store.dispatch("thingView/refreshStations", tid).then(() => {
          _this.setThing(tid)
        });
      }
    },
  },
};
</script>
<style lang="less">
@import "index";
</style>
