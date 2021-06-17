<template>
  <div>
    <a-modal
      title="区域选择"
      :visible="visible"
      @ok="handleOk"
      @cancel="visible = false"
    >
      <area-cascader  v-model="areaPath"></area-cascader>
    </a-modal>
  </div>
</template>
<script>
//import AreaTree from "../dcfg/AreaTree.vue";
import AreaCascader from '../dcfg/AreaCascader.vue';
export default {
  components: {
    //AreaCascader
    //AreaTree,
    AreaCascader,
  },
  data() {
    return {
      area: {},
      station: {},
      areaPath:[],
      funSave: null,
      visible: false,
    };
  },
  methods: {
    Show(station, fun) {
      //this.$store.dispatch()
      //this.$store.dispatch("area/refreshAreas")
      this.station = station;
      if(station.area_path != ""){
        this.areaPath = JSON.parse(station.area_path)
      }
      
      //this.areaID = areaID;
      this.funSave = fun;
      this.visible = true;
    },
    handleOk() {
      if (this.funSave) {
        this.funSave(this.areaPath);
        this.visible = false;
      }
    },
  },
};
</script>