<template>
  <div>
    <a-range-picker
      :show-time="{ format: 'HH:mm' }"
      format="YYYY-MM-DD HH:mm"
      :placeholder="['开始时间', '结束时间']"
      @change="onChange"
      @ok="onOk"
    />
    <a-button  @click="queryHistroyAlarm"
      >查询</a-button
    >
    <alarm-table :alarms="alarms"></alarm-table>
  </div>
</template>
<script>
import alarmTable from "@/components/alarm/alarmTable.vue";
import { getAlarmHistory } from "@/services/alarmAPI.js";
export default {
  props: ["thing"],
  components: { alarmTable },
  data() {
    return {
      dataRange: [],
      alarms: [],
    };
  },
  methods: {
    queryHistroyAlarm() {
      let _this = this;
      getAlarmHistory(this.thing.uid,'',-1,this.dateRange[0],this.dateRange[1]).then((data)=>{
          _this.alarms = data
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
  },
};
</script>