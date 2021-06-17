<template>
  <div>
    <a-tabs default-active-key="1">
      <a-tab-pane key="1" tab="边缘存储规则">
        <part-save :storeInfo="item.edge_store"></part-save>
      </a-tab-pane>
      <a-tab-pane key="2" tab="云端存储规则">
        <part-save :storeInfo="item.cloud_store"></part-save>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script>
import PartSave from "./PartSave.vue";
export default {
  components: { PartSave },
  data() {
    return {};
  },
  props: ["item"],
  watch: {
    "item.edge_store": {
      handler(nv) {
        this.item.edge_store = nv
        if (!nv) {
          this.item.edge_store = {
            is_rate: false,
            is_range: false,
            is_period: false,
            is_all: true,
            period_type: "60",
          };
        }
        this.edge_store = this.item.edge_store;
        console.log("&&&&&&&&&&&&&&&&&&&&&&&&-----------",this.edge_store )
      },
      deep: true,
      immediate: true,
    },
    "item.cloud_store": {
      handler(nv) {
        this.item.cloud_store = nv
        if (!nv) {
          this.item.cloud_store = {
            is_rate: false,
            is_range: false,
            is_period: false,
            is_all: true,
            period_type: "60",
          };
        }
        this.cloud_store = this.item.cloud_store;
        console.log("&&&&&&&&&&&&&&&&&&&&&&&&-----------",this.cloud_store )
      },
      //deep: true,
      immediate: true,
    },
  },
  methods: {
    onChange(e) {
      console.log(`checked = ${e.target.checked}`);
    },
  },
};
</script>