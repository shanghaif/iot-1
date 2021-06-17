<template>
  <div>
       <a-modal
            title="参数"
            :visible="paramDlgVisible"
            @ok="saveParams"
            @cancel="paramDlgVisible = false"
        >
            <p-cfg :property="paramEdited" :isNew="isNewParam" hasPublished='true' hasArrayType='true' hasStructType='true'></p-cfg>
        </a-modal>
    <a-button @click="add">增加</a-button>
    <a-modal
      title="服务配置"
      :visible="sDlgVisible"
      @ok="saveService"
      @cancel="sDlgVisible = false"
    >
     <base-cfg :obj="serviceEdited" :isNew="isNew"></base-cfg>
      <a-form-model
      :model="serviceEdited"
      :label-col="labelCol" 
      :wrapper-col="wrapperCol"
    >
      <a-form-model-item label="类型" prop="call_type">
        <a-select
          style="width:60%"
          v-model="serviceEdited.call_type"
          placeholder="选择是否同步"
        >
          <a-select-option value="async"> 异步 </a-select-option>
          <a-select-option value="sync"> 同步 </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="输入参数" prop="input_data">
          <a-button size="small" @click="addParam(serviceEdited.input_data)">增加</a-button>
          <a-table size="small" :data-source="serviceEdited.input_data" :columns="columnParams" :pagination="false" :row-key="(record)=>record.identifier">
               <template slot="operation" slot-scope="text, record">
                        <a-popconfirm
                        title="是否确认删除本项目?"
                        @confirm="() => onDeleteParam(serviceEdited.input_data,record.identifier)"
                        >
                            <a href="javascript:;">删除</a>
                        </a-popconfirm>
                        <a-divider type="vertical" />
                            <a @click="onEditParam(serviceEdited.input_data,record)">编辑</a>
                    </template>
          </a-table>
      </a-form-model-item>
      <a-form-model-item  label="输出参数">
           <a-button size="small" @click="addParam(serviceEdited.output_data)">增加</a-button>
          <a-table size="small" :data-source="serviceEdited.output_data" :columns="columnParams" :pagination="false" :row-key="(record)=>record.identifier">
               <template slot="operation" slot-scope="text, record">
                        <a-popconfirm
                        title="是否确认删除本项目?"
                        @confirm="() => onDeleteParam(serviceEdited.output_data,record.identifier)"
                        >
                            <a href="javascript:;">删除</a>
                        </a-popconfirm>
                        <a-divider type="vertical" />
                            <a @click="onEditParam(serviceEdited.output_data,record)">编辑</a>
                    </template>
          </a-table>
      </a-form-model-item>
      </a-form-model>
    </a-modal>
    <a-table :data-source="services" :columns="columns" :pagination="false" :row-key="(record)=>record.identifier">
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
        <a @click="deleteRecord(record)"> <a-icon type="delete" /></a>
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
  </div>
</template>

<script>
import BaseCfg from "@/components/cfg/BaseCfg.vue";
import PCfg from "@/components/cfg/PCfg.vue";
export default {
  props: ["services"],
  name:'MSCfg',
  components: {
    BaseCfg,
    PCfg
  },
  data() {
    return {
      searchText: "",
      paramDlgVisible:false,
      serviceEdited: {},
      sDlgVisible: false,
      searchInput: null,
      searchedColumn: "",
      labelCol: { span: 4 },
      wrapperCol: { span: 14},
      isNew:false,
      isNewParam:false,
      currentData:[],
      paramEdited:{},
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
          dataIndex: "call_type",
          key: "call_type",
        },
        {
          title: "公用",
          dataIndex: "published",
          key: "published",
        },
        {
          title: "操作",
          key: "operation",
          scopedSlots: { customRender: "action" },
        },
      ],
      columnParams:[
          { title: '名称', width: 100, dataIndex: 'name', key: 'name', fixed: 'left' },
           { title: 'id', width: 100, dataIndex: 'identifier', key: 'identifier', fixed: 'left' },
           { title: '类型', width: 100, dataIndex: 'type', key: 'type' },
           {
                title: '操作',
                key: 'operation',
                fixed: 'right',
                width: 100,
                scopedSlots: { customRender: 'operation' },
            },
      ]
    };
  },
  methods: {
    handleSearch(selectedKeys, confirm, dataIndex) {
      confirm();
      this.searchText = selectedKeys[0];
      this.searchedColumn = dataIndex;
    },
    addParam(array){
        this.currentData = array
        this.isNewParam = true
        this.paramEdited = {data_type:{type:'text',specs:{}}}
         
        this.paramDlgVisible = true
    },
    onDeleteParam(array,key){
        if(array){
            const index = array.findIndex(p=>{
                return p.identifier === key
            })
            if(index >= 0){
                array.splice(index,1)
            }
        }
    },
    onEditParam(array,record){
        this.paramEdited = JSON.parse(JSON.stringify(record))
        this.isNewParam = false
        this.currentData = array
        this.paramDlgVisible = true
    },
    saveParams(){
          if(!this.paramEdited.name || this.paramEdited.name === ''){
             
              this.paramEdited.name = this.paramEdited.identifier
          }
          if(this.currentData){
              //名称重复问题
              const _this = this
              let index = this.currentData.findIndex(p=>{
                  return p.identifier != _this.paramEdited.identifier && p.name === _this.paramEdited.name
              })
              if(index >= 0){
                  this.$message.error("名称重复")
                  return
              }
              index = this.currentData.findIndex(p=>{
                  return p.identifier === _this.paramEdited.identifier
              }) 
              if(index >= 0){
                
                  this.$set(this.currentData,index,JSON.parse(JSON.stringify(this.paramEdited)))
              }
              else{
                  this.currentData.push(JSON.parse(JSON.stringify(this.paramEdited)))
              }
          }
          this.paramDlgVisible = false
      },
    handleReset(clearFilters) {
      clearFilters();
      this.searchText = "";
    },
    initRecord(){
      if(!this.serviceEdited.output_data){
        this.serviceEdited.output_data = []
       
      }
       if(!this.serviceEdited.input_data){
        this.serviceEdited.input_data = []
       
      }
    },
    edit(record) {
      this.serviceEdited = JSON.parse(JSON.stringify(record))
      this.initRecord()
      this.isNew = false
      this.sDlgVisible = true;
    },
    deleteRecord(record) {
        const index = this.services.findIndex(e=>{
            return e.identifier == record.identifier
        })
        if(index >= 0){
            this.services.splice(index,1)
        }

    },
    add() {
      this.serviceEdited = { call_type: "sync", published: "false"};
      this.initRecord()
      this.isNew = true
      this.sDlgVisible = true;
    },
    saveService() {
      if (!this.services) {
        this.services = [this.serviceEdited];
      } else {
        const pid = this.serviceEdited.identifier;
        const inamesame = this.services.findIndex((p) => {
          return p.name === this.serviceEdited.name && pid !== p.identifier;
        });
        if(inamesame >= 0){
           this.$message.error('名称不能重复');
          return;
        }

        const ifound = this.services.findIndex((p) => {
          return p.identifier === pid;
        });
        if (ifound >= 0) {
          //this.services[ifound] = this.serviceEdited;
          this.$set(this.services,ifound,this.serviceEdited)
        } else {
          this.services.push(this.serviceEdited);
        }
      }
      this.sDlgVisible = false;
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