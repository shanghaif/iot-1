<template>
  <div>
    <a-button-group v-if="showToolBar" style="margin-top: 25px">
      <a-button v-if="canPlus" icon="plus" @click="addOne"></a-button>
      <a-button icon="edit" @click="edit"></a-button>
      <a-button icon="delete" @click="removeOne"></a-button>
      <a-button icon="reload" @click="refresh"></a-button>
    </a-button-group>
    <a-directory-tree
      style="margin-top: 15px"
      :tree-data="stations"
      default-expand-all
      @select="onSelect"
    >
    </a-directory-tree>
  </div>
</template>
<script>
export default {
  props: {
    showToolBar: {
      type: Boolean,
      required: false,
      default: true,
      sel: null,
    },
  },
  computed: {
    stations() {
      return this.$store.state.station.stationTree;
    },
    canPlus() {
      if (process.env.VUE_APP_TYPE === "edge") {
        return (
          (this.$store.state.station.stations &&
            this.$store.state.station.stations.length == 0) ||
          !this.$store.state.station.stations
        );
      }
      return true;
    },
  },
  mounted() {},
  data() {
    return {};
  },
  methods: {
    onSelect(keys) {
      console.log("---------------", keys);
      //this.keys = keys;
      if (keys && keys.length > 0) {
        this.$emit("tree-selected", keys[0]);
        this.sel = keys[0];
      }
    },
    refresh() {
      this.$store.dispatch("station/refreshStations");
    },
    addOne() {
      this.$emit("tree-add");
    },
    removeOne() {
      this.$store.dispatch("station/removeActiveStation");
    },
    edit() {
      this.$emit("tree-edit", this.sel);
    },
  },
};
</script>
