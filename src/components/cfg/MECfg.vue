<template>
  <div>
    <a-modal
      title="事件配置"
      :visible="eDlgVisible"
      @ok="saveEvent"
      @cancel="eDlgVisible = false"
    >
      <e-cfg
        :event="eventEdited"
        :properties="properties"
        :isNew="isNew"
        hasPublished="true"
        hasArrayType="true"
        hasStructType="true"
      ></e-cfg>
    </a-modal>
    <a-tabs default-active-key="1" v-model="activeKey">
      <a-tab-pane key="2" tab="通过属性定义的事件">
        <rule-cfg :properties="properties" :rules="rules"></rule-cfg>
      </a-tab-pane>
      <a-tab-pane key="1" tab="自定义事件">
        <a-button-group>
          <a-button @click="add">增加</a-button>
        </a-button-group>
        <a-table
          :data-source="events"
          :columns="columns"
          :pagination="false"
          :row-key="(record) => record.identifier"
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
                (e) => setSelectedKeys(e.target.value ? [e.target.value] : [])
              "
              @pressEnter="
                () => handleSearch(selectedKeys, confirm, column.dataIndex)
              "
            />
            <a-button
              type="primary"
              icon="search"
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
          <template slot="action" slot-scope="text, record">
            <a style="margin-right: 8px" @click="edit(record)" v-if="!record.from_property">
              <a-icon type="edit"
            /></a>
            <a @click="deleteRecord(record)"> <a-icon type="delete" v-if="!record.from_property"/></a>
          </template>
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
                  >{{fragment}}</mark
                >
                <template v-else>{{fragment}}</template>
              </template>
            </span>
            <template v-else>
              {{text}}
            </template>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import ECfg from "@/components/cfg/ECfg.vue";
import RuleCfg from "./RuleCfg.vue";

export default {
  props: ["events", "properties", "rules"],
  name: "MPCfg",
  components: {
    ECfg,
    RuleCfg,
  },
  data() {
    return {
      /*upLimit: "",
      
      lowLimit: "",
      alarmLevel: 2,
      upLowDlgVisible: false,*/
      //activeTab: "1",
      activeKey: "1",
      searchText: "",
      eventEdited: {},
      eDlgVisible: false,
      searchInput: null,
      searchedColumn: "",
      isNew: false,
      columns: [
        {
          title: "名称",
          dataIndex: "name",
          key: "name",
          scopedSlots: {
            filterDropdown: "filterDropdown",
            filterIcon: "filterIcon",
            customRender: "customRender",
          },
          onFilter: (value, record) =>
            record.name.toString().toLowerCase().includes(value.toLowerCase()),
          onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
              setTimeout(() => {
                this.searchInput.focus();
              }, 0);
            }
          },
        },
        {
          title: "id",
          dataIndex: "identifier",
          key: "identifier",
          scopedSlots: {
            filterDropdown: "filterDropdown",
            filterIcon: "filterIcon",
            customRender: "customRender",
          },
          onFilter: (value, record) =>
            record.identifier
              .toString()
              .toLowerCase()
              .includes(value.toLowerCase()),
          onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
              setTimeout(() => {
                this.searchInput.focus();
              });
            }
          },
        },
        {
          title: "类型",
          dataIndex: "type",
          key: "type",
        },
        {
          title: "公用",
          dataIndex: "published",
          key: "published",
        },
        {
          title: "等级",
          dataIndex: "level",
          key: "level",
        },
        {
          title: "操作",
          key: "operation",
          scopedSlots: { customRender: "action" },
        },
      ],
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
    initRecord() {
      if (!this.eventEdited.output_data) {
        this.eventEdited.output_data = [];
      }
    },
    edit(record) {
      this.eventEdited = JSON.parse(JSON.stringify(record)),
      this.initRecord();

      this.isNew = false;
      this.activeKey = "1";
      this.eDlgVisible = true;
    },
    deleteRecord(record) {
      const index = this.events.findIndex((e) => {
        return e.identifier == record.identifier;
      });
      if (index >= 0) {
        this.events.splice(index, 1);
      }
    },
    add() {
      this.eventEdited = { type: "alarm", published: "false", level: 3 };
      this.initRecord();
      this.isNew = true;
      this.activeKey = "1";
      this.eDlgVisible = true;
    },

    saveLimit() {
      if (!this.sel) {
        return;
      }
      if (this.upLimit != "") {
        this.createAlarmByLimit("high", 0, this.upLimit);
      }
      if (this.lowLimit != "") {
        this.createAlarmByLimit("low", 0, this.lowLimit);
      }
    },
    saveEvent() {
      if (!this.events) {
        this.events = [this.eventEdited];
      } else {
        const pid = this.eventEdited.identifier;
        const inamesame = this.events.findIndex((p) => {
          return p.name === this.eventEdited.name && pid !== p.identifier;
        });
        if (inamesame >= 0) {
          this.$message.error("名称不能重复");
          return;
        }

        const ifound = this.events.findIndex((p) => {
          return p.identifier === pid;
        });
        if (ifound >= 0) {
          //this.events[ifound] = this.eventEdited;
          this.$set(this.events, ifound, this.eventEdited);
        } else {
          this.events.push(this.eventEdited);
        }
      }
      this.eDlgVisible = false;
    },
  },
};
</script>
<style scoped>
.highlight {
  background-color: rgb(255, 192, 105);
  padding: 0px;
}
</style>