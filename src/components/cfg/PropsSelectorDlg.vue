<template>
  <div>
    <a-modal
      width="40%"
      title="属性选择"
      :visible="pDlgVisible"
      @ok="handleOk"
      @cancel="pDlgVisible = false"
    >
      <a-table
        :data-source="properties"
        :columns="columns"
        :pagination="false"
        :row-key="(record,index) => {return index}"
        :row-selection="rowSelection"
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
            @click="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
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
          <a style="margin-right: 8px" @click="edit(record)">
            <a-icon type="edit"
          /></a>
          <a @click="deleteRecord(record.uid)"> <a-icon type="delete" /></a>
        </template>
        <template slot="customRender" slot-scope="text, record, index, column">
          <span v-if="searchText && searchedColumn === column.dataIndex">
            <template
              v-for="(fragment, i) in text
                .toString()
                .split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))"
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
    </a-modal>
  </div>
</template>
<script>
export default {
  props: ["properties", "propertiesSelected", "selectType"],
  name: "PropsSelecorDlg",
  computed: {
    rowSelection() {
      if (this.selectType) {
        return {
          selectedRowKeys: this.selectedRowKeys,
          onChange: this.onSelectChange,
          type: this.selectType,
        };
      }
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange,
        type: "checkbox",
      };
    },
  },
  data() {
    return {
      selectedRowKeys: [],
      searchText: "",
      isNew: false,
      propEdited: {},
      pDlgVisible: false,
      searchInput: null,
      searchedColumn: "",
      selectedRows:[],

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
          dataIndex: "data_type.type",
          key: "data_type",
        },
        {
          title: "公用",
          dataIndex: "published",
          key: "published",
        },
        {
          title: "访问方式",
          dataIndex: "access_mode",
          key: "access_mode",
        },
        
      ],
    };
  },
  methods: {
    Show(funOK) {
      if (this.propertiesSelected) {
        this.selectedRowKeys = JSON.parse(JSON.stringify(this.propertiesSelected))//Object.assign([], this.propertiesSelected);
      } else {
        this.selectedRowKeys = [];
      }

      this.pDlgVisible = true;
      this.funOK = funOK;
    },
    handleOk() {
      if (this.funOK) {
        this.funOK(this.selectedRowKeys,this.selectedRows);
        this.pDlgVisible = false;
      }
    },
    onSelectChange(selectedRowKeys,selectedRows) {
      //console.log(selectedRowKeys,this);
      this.selectedRowKeys = selectedRowKeys;
      this.selectedRows = selectedRows
    },
    handleSearch(selectedKeys, confirm, dataIndex) {
      confirm();
      this.searchText = selectedKeys[0];
      this.searchedColumn = dataIndex;
    },

    handleReset(clearFilters) {
      clearFilters();
      this.searchText = "";
    },
  },
};
</script>