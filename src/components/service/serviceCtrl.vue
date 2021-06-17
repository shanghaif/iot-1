<template>
  <div style="margin: 5px 0 0 10px" v-if="thing">
    <a-form-model layout="inline">
      <a-form-model-item label="服务">
        <a-select style="width: 200px" v-model="serviceId" :labelInValue="true">
          <a-select-option
            v-for="item in services"
            :key="item.identifier"
            :value="item.identifier"
          >
            {{ item.name }}
          </a-select-option>
        </a-select>

        <a-button @click="ctrl" :loading="loading">控制</a-button>
      </a-form-model-item>
    </a-form-model>
    <a-form-model>
      <a-form-model-item label="参数">
        <a-table
          :loading="loading"
          :data-source="inputParams"
          :pagination="false"
          size="small"
          :columns="columns"
          :rowKey="(record) => record.identifier"
        >
          <template slot="value" slot-scope="text, record">
            <a-input
              v-if="record.editable"
              style="margin: -5px 0"
              :value="text"
              @change="(e) => handleChange(e.target.value, record)"
            />
            <template v-else>
              {{ text }}
            </template>
          </template>
          <template slot="operation" slot-scope="text, record">
            <div class="editable-row-operations">
              <span v-if="record.editable">
                <a @click="() => save(record)">保存</a>
              </span>
              <span v-else>
                <a :disabled="editingKey !== ''" @click="() => edit(record)"
                  >编辑</a
                >
              </span>
            </div>
          </template>
        </a-table>
      </a-form-model-item>
    </a-form-model>
    <a-form-model>
      <a-form-model-item label="返回结果">
        <a-table
          :loading="loading"
          :data-source="outputParams"
          :pagination="false"
          size="small"
          :columns="resultColumns"
          :rowKey="(record) => record.identifier"
        >
        </a-table>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>
<script>
import { put } from "@/services/crud";
const columns = [
  {
    title: "名称",
    dataIndex: "name",
  },
  {
    title: "id",
    dataIndex: "identifier",
  },
  {
    title: "值",
    dataIndex: "value",
    scopedSlots: { customRender: "value" },
  },
  {
    title: "操作",
    dataIndex: "operation",
    scopedSlots: { customRender: "operation" },
  },
];
const resultColumns = [
 
  {
    title: "id",
    dataIndex: "identifier",
  },
  {
    title: "值",
    dataIndex: "value",
    scopedSlots: { customRender: "value" },
  },
];
export default {
  props: ["thing"],
  data() {
    return {
      serviceId: "",
      inputParams: [],
      columns,
      editingKey: "",
      index: 0,
      loading: false,
      outputParams:[],
      resultColumns,
    };
  },
  watch: {
    serviceId(newV) {
      console.log("))))))))", newV);
      if (newV && newV.key) {
        let service = this.services.find((s) => {
          return s.identifier == newV.key;
        });
        if (service) {
          this.inputParams = service.input_data.map((i) => {
            return { name: i.name, identifier: i.identifier, value: "" };
          });
          console.log("))))))))", service.input_data, this.inputParams);
        }
      } else {
        this.inputParams = [];
      }
    },
  },
  computed: {
    services() {
      if (this.thing && this.thing.model) {
        return this.thing.model.obody.services;
      }
      return [];
    },
  },
  methods: {
    edit(record) {
      record.editable = !record.editable;
      this.editingKey = record.identifier;
      const newData = [...this.inputParams];
      this.inputParams = newData;
    },
    handleChange(value, record) {
      record.value = value;
      const newData = [...this.inputParams];
      this.inputParams = newData;
    },
    save(record) {
      this.editingKey = "";
      //this.$set(record,'editable',false)
      record.editable = false;
      const newData = [...this.inputParams];
      this.inputParams = newData;
    },
    ctrl() {
      let params = {};
      this.inputParams.forEach((element) => {
        params[element.identifier] = element.value;
      });
      let ctrlcmd = {
        identifier: this.serviceId.key,
        tid: this.thing.uid,
        index: this.index,
        params: params,
      };
      this.loading = true;
      let _this = this;
      _this.outputParams = []
      put("api/service", ctrlcmd, "uid=" + this.$store.state.activeAlarm.sid)
        .catch((err) => {
          console.log(err);
        }).then((res)=>{
          if(res && res.data && res.data.result){
            
            for(let id in res.data.result.result){
              _this.outputParams.push({identifier:id,value:res.data.result.result[id]})
            }
          }
        })
        .finally(() => {
          _this.loading = false;
        });
    },
  },
};
</script>
