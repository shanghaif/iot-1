<template>
  <div>
    <a-button-group>
      <a-button @click="add">增加</a-button>
      <a-button @click="addBatch">批量添加</a-button>
    </a-button-group>
    <props-selector-dlg
      ref="PropertyDlg"
      :properties="publishedProperties"
      :selectType="stype"
    ></props-selector-dlg>
    <a-modal
      width="30%"
      title="属性配置"
      :visible="pDlgVisible"
      @ok="saveProperty"
      @cancel="pDlgVisible = false"
    >
      <p-cfg
        :property="propEdited"
        :isNew="isNew"
        hasPublished="true"
        hasArrayType="true"
        hasStructType="true"
      ></p-cfg>
    </a-modal>
    <p></p>
    <a-table
      :data-source="properties"
      size="small"
      :columns="columns"
      :pagination="false"
      :rowKey="(record) => record.identifier"
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
        <a-popconfirm
          title="请确认是否删除该项目?"
          ok-text="删除"
          cancel-text="放弃"
          @confirm="deleteRecord(record.identifier)"
        >
          <a> <a-icon type="delete" /></a>
        </a-popconfirm>
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
  </div>
</template>

<script>
import PCfg from "@/components/cfg/PCfg.vue";

import PropsSelectorDlg from "@/components/cfg/PropsSelectorDlg.vue";
import { get } from "@/services/crud";
export default {
  props: ["properties"],
  name: "MPCfg",
  components: {
    PCfg,
    PropsSelectorDlg,
  },
  data() {
    return {
      stype: "radio",
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      searchText: "",
      publishedProperties: [],
      isNew: false,
      propEdited: {},
      pDlgVisible: false,
      searchInput: null,
      searchedColumn: "",
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
          title: "存储条件",
          dataIndex: "store_rule",
          key: "store_rule",
        },
        {
          title: "访问",
          dataIndex: "access_mode",
          key: "access_mode",
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
    addBatch() {
      this.stype = "checkbox";
      const _this = this;
      get("/tmodel/", "query?published=true&type=properties").then((re) => {
        if (re && re.data && re.data.result) {
          _this.publishedProperties = re.data.result.map((x) => x.body);
          _this.$refs.PropertyDlg.Show((keys, selections) => {
            if (selections && selections.length > 0) {
              selections.forEach((sel) => {
                const index = _this.properties.findIndex((p) => {
                  return p.identifier === sel.identifier || p.name === sel.name;
                });
                if (index < 0) {
                  _this.properties.push(sel);
                }
              });
            }
          });
        }
      });
    },
    selPublisedProperty() {
      this.stype = "radio";
      const _this = this;
      get("/tmodel/", "query?published=true&type=properties").then((re) => {
        if (re && re.data && re.data.result) {
          _this.publishedProperties = re.data.result.map((x) => x.body);
          _this.$refs.PropertyDlg.Show((keys, selections) => {
            if (selections && selections.length > 0) {
              _this.propEdited = JSON.parse(JSON.stringify(selections[0]));
              //Object.assign({}, selections[0]);
            }
          });
        }
      });
    },
    initRecord() {
      if (!this.propEdited.data_type) {
        this.propEdited.data_type = {
          type: "float",
          specs: { min: 0, max: 0, item: { type: "", specs: {} } },
        };
      }
    },
    edit(record) {
      this.propEdited = JSON.parse(JSON.stringify(record)); //Object.assign({},record); Object.assign
      console.log(
        "*******************add edit is**********record************",
        this.propEdited,
        record
      );
      this.initRecord();
      this.isNew = false;
      this.pDlgVisible = true;
    },
    deleteRecord(uid) {
      const index = this.properties.findIndex((p) => {
        return p.identifier === uid;
      });
      if (index >= 0) {
        this.properties.splice(index, 1);
      }
    },
    add() {
      this.propEdited = { access_mode: "r", published: "false" };

      this.initRecord();
      this.isNew = true;
      this.pDlgVisible = true;
    },
    saveProperty() {
      if (!this.properties) {
        this.properties = [this.propEdited];
      } else {
        if (this.propEdited && this.propEdited.name) {
          if (this.propEdited.name.indexOf(".") != -1) {
            this.$message.error("名称不能包括特殊字符'.'");
            return;
          }
        }
        const pid = this.propEdited.identifier;
        const inamesame = this.properties.findIndex((p) => {
          return p.name === this.propEdited.name && pid !== p.identifier;
        });
        if (inamesame >= 0) {
          this.$message.error("名称不能重复");
          return;
        }

        const ifound = this.properties.findIndex((p) => {
          return p.identifier === pid;
        });
        if (this.isNew && ifound >= 0) {
          this.$message.error("id不能重复");
          return;
        }

        if (ifound >= 0 && !this.isNew) {
          console.log(
            "**********************edit*********properties**********",
            this.propEdited,
            this.properties[ifound]
          );
          this.properties[ifound] = this.propEdited;
        } else if (ifound < 0 && this.isNew) {
          this.properties.push(this.propEdited);
        }
      }
      this.pDlgVisible = false;
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