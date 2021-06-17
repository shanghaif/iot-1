<template>
  <div>
    <area-dlg ref="areaDlg"></area-dlg>
    <a-form-model
      layout="inline"
      v-if="station"
    >
      <a-form-model-item label="名称">
        <a-input
          placeholder="名称"
          v-model="station.s_name"
        > </a-input>
      </a-form-model-item>
      <a-form-model-item label="id">
        <a-input
          v-model="station.uid"
          :disabled="true"
        > </a-input>
      </a-form-model-item>

      <a-form-model-item label="区域">
        {{station.area_name}}
        <a-button
          icon="edit"
          size="small"
          @click="showAreaDlg"
        ></a-button>
      </a-form-model-item>
      <a-form-model-item label="级别">
        <a-select
          default-value="3"
          placeholder="级别"
        >
          <a-select-option value="1"> 1 </a-select-option>
          <a-select-option value="2"> 2 </a-select-option>
          <a-select-option value="3"> 3 </a-select-option>
          <a-select-option value="4"> 4 </a-select-option>
          <a-select-option value="5"> 5 </a-select-option>
          <a-select-option value="6"> 6 </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="状态">
        <a-select default-value="1">
          <a-select-option value="-1">施工中</a-select-option>
          <a-select-option value="1">启用</a-select-option>
          <a-select-option value="0">停用</a-select-option>
          <a-select-option value="-2">未知</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item>
        <a-button-group>
          <a-button
            type="primary"
            @click="save()"
          > 保存 </a-button>
          <a-button
            type="primary"
            style="margin-left: 2px"
            @click="refresh"
          > 刷新 </a-button>
        </a-button-group>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>
<script>
import AreaDlg from './AreaDlg.vue'
//import {get} from '@/services/crud'

//import AreaTree from './AreaTree.vue';

export default {
  components: {
    AreaDlg
    //AreaTree,
  },
  data() {
    return {
      currentArea: {}
    }
  },
  computed: {
    station() {
      return this.$store.state.station.activeStation
    }
  },
  methods: {
    save(station) {
      if (!station) {
        station = this.$store.state.station.activeStation
      }
      let _this = this
      _this.$store.dispatch('station/saveStation', station).then(() => {
        _this.$store.dispatch('station/refreshActiveStation', {
          id: station.uid
        })
      })
    },
    refresh() {
      this.$store.dispatch('station/refreshActiveStation', {
        id: this.station.uid
      })
    },
    showAreaDlg() {
      const _this = this
      this.$refs.areaDlg.Show(this.station, (path) => {
        let station = JSON.parse(JSON.stringify(_this.station)) //Object.assign({}, _this.station);
        station.area_id = path[path.length - 1]
        _this.save(station)
      })
    }
  }
}
</script>

AreaCascader