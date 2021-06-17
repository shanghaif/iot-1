<template>
  <div>
    <a-table
      :columns="columns"
      :data-source="alarms"
      :rowKey="(record, index) => index"
      size="small"
    ></a-table>
  </div>
</template>
<script>
const columns = [
  {
    title: "设备",
    dataIndex: "thing_name",
  },
  {
    title: "告警",
    dataIndex: "alarm_name",
  },

  {
    title: "索引",
    dataIndex: "mindex",
  },
  {
    title: "级别",
    dataIndex: "level",
  },
  {
    title: "告警时间",
    dataIndex: "alarm_time",
  },
  {
    title: "消除时间",
    dataIndex: "clear_time",
  },
  {
    title: "设备id",
    dataIndex: "t_id",
  },
];

export default {
  data() {
    return {
      columns,
    };
  },
  props: ["alarms"],
};
</script>
