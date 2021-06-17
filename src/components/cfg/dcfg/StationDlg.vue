<template>
  <div>
    <a-modal v-model="visible" title="配置场站" @ok="handleOk">
      <div v-if="isEdge" style="margin: 0 0 0 25px">
        边缘计算控制器只能配置一个场站，建立场站后会自动配置一个边缘计算控制器
      </div>
      <a-checkbox
        :disabled="isEdge"
        style="margin: 5px 0 0 25px"
        @change="onTopChange"
        :checked="isTop"
      >
        顶级基站
      </a-checkbox>
      <a-form-model
        ref="ruleForm"
        :model="station"
        :rules="rules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 14 }"
        style="margin: 25px 0 0 0"
      >
        <a-form-model-item label="物模型">
          <a-cascader
            :options="catalogs"
            :fieldNames="{
              label: 's_name',
              value: 'uid',
              children: 'children',
            }"
            placeholder="请选择"
            change-on-select
            @change="onModelChange"
            v-model="selValue"
          />
        </a-form-model-item>

        <a-form-model-item label="区域">
          <area-cascader
            ref="areaSelector"
            @area-change="onAreaChange"
            v-model="area"
          >
          </area-cascader>
        </a-form-model-item>
        <a-form-model-item :disabled="!isNew" ref="uid" label="ID" prop="uid">
          <a-input v-model="station.uid"></a-input>
        </a-form-model-item>
        <a-form-model-item label="名称" ref="s_name" prop="s_name">
          <a-auto-complete
            v-model="station.s_name"
            :data-source="nameCache"
            style="width: 200px"
            placeholder="input here"
          />
        </a-form-model-item>
        <a-form-model-item ref="level" label="级别" prop="level">
          <a-select default-value="5" v-model="station.level">
            <a-select-option v-for="i in 10" :key="i" :value="i">
              {{ i }}
            </a-select-option>
          </a-select>
        </a-form-model-item>

        <a-form-model-item ref="lon" label="经度" prop="lon">
          <a-input v-model="station.lon"></a-input>
        </a-form-model-item>
        <a-form-model-item label="纬度">
          <a-input v-model="station.lat"></a-input>
        </a-form-model-item>
        <a-form-model-item ref="desc" label="描述" prop="desc">
          <a-textarea v-model="station.desc"></a-textarea>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>
<script>
//import { getChildren } from "@/services/area";
import AreaCascader from "./AreaCascader";
import { handleDataAsTree } from "@/services/crud";

export default {
  props: ["isNew"],
  components: {
    AreaCascader,
  },
  data() {
    return {
      visible: false,
      station: { area: {}, area_id: -1 },
      saveFun: null,
      parent: null,
      areas: [],
      rules: {},
      areaName: "",
      modelName: "",
      nameSet: new Set(),
      nameCache: [],
      selValue: [],
      catalogs: [],
      area: [],
      isTop: false,
    };
  },
  computed: {
    isEdge(){
      return process.env.VUE_APP_TYPE === "edge"
    }
  },
  mounted() {
    if (process.env.VUE_APP_TYPE === "edge") {
      this.isTop = true;
    }
  },
  methods: {
    setParent() {
      if (this.isTop) {
        this.station.parent_id = "";
      } else {
        let activeStation = this.$store.state.station.activeStation;
        if (activeStation) {
          this.station.parent_id = activeStation.uid;
        }
      }
    },
    onTopChange(e) {
      console.log(`checked = ${e.target.checked}`);
      this.isTop = e.target.checked;
    },
    initCatalogs() {
      let cacheC = [];
      for (let id in this.$store.state.tmodel.catalogCache) {
        const catalog = this.$store.state.tmodel.catalogCache[id];
        const newCatalog =  JSON.parse(JSON.stringify(catalog));//Object.assign({}, catalog);
        newCatalog.isLeaf = false;
        cacheC.push(newCatalog);
      }
      let { tree, cache } = handleDataAsTree(cacheC);
      let models = this.$store.state.tmodel.tmodels.filter((m) => {
        return m.is_station === true;
      });
      let nmodels = models.map((m) => {
        return  JSON.parse(JSON.stringify(m));//Object.assign({}, m);
      });
      nmodels.forEach((m) => {
        m.isLeaf = true;
        m.title = m.s_name;
        m.value = m.uid;
        if (m.catalog_id) {
          const c = cache[m.catalog_id];
          if (c) {
            if (c.children) {
              c.children.push(m);
            } else {
              c.children = [m];
            }
          }
        }
      });
      this.catalogs = tree;
    },
    showDlg(fun, item, parent) {
      this.initCatalogs();
      this.selValue = [];
      if (item) {
        this.station =  JSON.parse(JSON.stringify(item));
      } else {
        this.station = {};
        let _this = this;
        setTimeout(() => {
          _this.$refs.areaSelector.valueSelect = [];
        }, 300);
      }
      this.saveFun = fun;
      this.parent = parent;

      //let _this = this;
      this.visible = true;
    },
    Show(fun, item, parent) {
      let _this = this;
      if (this.$store.state.tmodel.catalogs.length == 0) {
        this.$store.dispatch("tmodel/refreshTModels").then(() => {
          _this.showDlg(fun, item, parent);
        });
      } else {
        _this.showDlg(fun, item, parent);
      }
    },

    handleOk() {
      if (this.saveFun) {
        this.setParent();
        if (this.station.area_id == -1) {
          this.station.area_id = 1;
        }
        this.saveFun(this.parent, this.station);
      }
    },
    Close() {
      this.visible = false;
    },

    getSelect(selectedOptions) {
      if (!selectedOptions) {
        return;
      }
      const index = selectedOptions.length - 1;
      if (index < 0) {
        return;
      }
      //const _this = this;
      const targetOption = selectedOptions[index];
      //this.station.area_id = targetOption.uid
      return targetOption;
    },
    onAreaChange(val, selectedOptions) {
      const targetOption = this.getSelect(selectedOptions);
      if (!targetOption) {
        return;
      }
      this.station.lon = targetOption.lon;
      this.station.lat = targetOption.lat;
      this.areaName = targetOption.label;
      this.station.area_id = targetOption.value;
      this.station.lon = targetOption.lon;
      this.station.lat = targetOption.lat;
      this.nameSet.add(targetOption.label);
      this.nameSet.add(targetOption.label + this.modelName);
      this.nameCache = Array.from(this.nameSet);
      if (this.station.model_id) {
        if (this.station.s_name == "" || !this.station.s_name) {
          this.station.s_name = this.areaName + this.modelName;
        }
      }
    },
    onModelChange(val, selectedOptions) {
      const targetOption = this.getSelect(selectedOptions);
      if (!targetOption) {
        return;
      }
      if (targetOption.isCatalog) {
        return;
      }
      this.station.model_id = targetOption.uid;

      this.modelName = targetOption.s_name;
      this.nameSet.add(targetOption.s_name);
      this.nameSet.add(this.areaName + targetOption.s_name);
      this.nameCache = Array.from(this.nameSet);
    },
  },
};
</script>
<style scoped>
</style>