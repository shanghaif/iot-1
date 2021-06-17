<template>
  <a-dropdown
    :trigger="['click']"
    v-model="show"
  >
    <div slot="overlay">
      <a-spin :spinning="loading">
        <a-tabs
          class="dropdown-tabs"
          :tabBarStyle="{ textAlign: 'center' }"
          :style="{ width: '500px' }"
        >
          <a-tab-pane
            tab="告警"
            key="1"
          >
            <!-- <a-table
              :data-source="activeAlarm"
              :rowKey="(record,index)=>index"
              size="small"
              :columns="columns"
            ></a-table> -->
            <a-table
              :data-source="activeAlarm"
              :rowKey="(record,index)=>index"
              size="small"
              :columns="columns"
              :pagination="pagination"
              :page-size.sync="pageSize"
              @change="handleTableChange"
            ></a-table>
          </a-tab-pane>
          <a-tab-pane
            tab="事件"
            key="2"
          >
            <a-list class="tab-pane"></a-list>
          </a-tab-pane>
          <a-tab-pane
            tab="待办"
            key="3"
          >
            <a-list class="tab-pane"></a-list>
          </a-tab-pane>
        </a-tabs>
      </a-spin>
    </div>
    <span
      @click="fetchNotice"
      class="header-notice"
    >
      <a-badge
        class="notice-badge"
        :count="alarmCount"
      >
        <a-icon
          :class="['header-notice-icon']"
          type="bell"
        />
      </a-badge>
    </span>
  </a-dropdown>
</template>

<script>
export default {
  name: 'HeaderNotice',
  data() {
    return {
      loading: false,
      show: false,
      pageSize: 1,
      data: [],
      pagination: {},
      columns: [
        {
          title: '设备',
          dataIndex: 'thing_name'
        },
        {
          title: '告警',
          dataIndex: 'alarm_name'
        },

        {
          title: '索引',
          dataIndex: 'mindex'
        },
        {
          title: '级别',
          dataIndex: 'level'
        },
        {
          title: '时间',
          dataIndex: 'alarm_time'
        }
      ]
    }
  },
  computed: {
    activeAlarm1() {
      return [
        {
          alarm_id: 'temperature_high',
          alarm_name: '温度高',
          clear_time: 0,
          flag: 'BEGIN',
          level: 3,
          m_name: '',
          mindex: 0,
          sub_name: '',
          t_id: 'temperature@run-6.exe',
          thing_name: 'run-6.exe',
          time: 1623742150
        },
        {
          alarm_id: 'temperature_high',
          alarm_name: '温度高',
          clear_time: 0,
          flag: 'BEGIN',
          level: 3,
          m_name: '',
          mindex: 0,
          sub_name: '',
          t_id: 'temperature@run-6.exe',
          thing_name: 'run-6.exe',
          time: 1623742150
        }
      ]
    },
    activeAlarm() {
      return this.$store.state.activeAlarm.activeAlarms
    },
    alarmCount() {
      const alarms = this.$store.state.activeAlarm.activeAlarms
      if (alarms) {
        return alarms.length
      }
      return 0
    }
  },
  beforeCreate() {
    // you should check in this action that items already loaded earlier as well
  },
  mounted() {
    // console.log('hello------------------------------222')
    // this.$store.dispatch('activeAlarm/refreshActiveAlarm')
    // this.data = this.activeAlarm1
    // this.pagination.total = 200
    // this.pagination.pageSize = 10
  },
  methods: {
    handleTableChange(pagination) {
      console.log(pagination)
      const pager = { ...this.pagination }
      // pager.current = pagination.current
      // this.pagination = pager
      // this.fetch({
      //   results: pagination.pageSize,
      //   page: pagination.current,
      //   sortField: sorter.field,
      //   sortOrder: sorter.order,
      //   ...filters
      // })
    },
    fetchNotice() {
      if (this.loading) {
        this.loading = false
        return
      }
      this.loadding = true
      setTimeout(() => {
        this.loadding = false
      }, 1000)
    }
  }
}
</script>

<style lang="less">
.header-notice {
  display: inline-block;
  transition: all 0.3s;
  span {
    vertical-align: initial;
  }
  .notice-badge {
    color: inherit;
    .header-notice-icon {
      font-size: 16px;
      padding: 4px;
    }
  }
}
.dropdown-tabs {
  background-color: @base-bg-color;
  box-shadow: 0 2px 8px @shadow-color;
  border-radius: 4px;
  .tab-pane {
    padding: 0 24px 12px;
    min-height: 250px;
  }
}
</style>