<template>
  <div>
    <a-tree
      @select="onThingSelected"
      :replaceFields="{ title: 's_name', key: 'uid' }"
      :load-data="onLoadData"
      :tree-data="thingTree"
      @expand="onExpand"
      ref="ttree"
      
    />
  </div>
</template>
<script>
export default {
  data(){
    return {
      
    }
  },
  computed: {
    thingTree() {
      return this.$store.state.thingView.stationTree;
    },
  },
  watch:{
    'thingTree':function(){
      //this.expandedKeys = []
      console.log("************thingtree changed----------------")
      if (this.$refs.ttree.expandedKeys){
        this.$refs.ttree.expandedKeys.length = 0 // = []
      }
      
    }

  },
  mounted() {
   
    this.refresh();
  },
  created() {
    this.refresh();
  },
  methods: {
    refresh() {
      this.$store.dispatch("thingView/refreshStations", "");
    },
    onLoadData(treeNode) {
      console.log(treeNode.dataRef);
      if (treeNode.dataRef.children && treeNode.dataRef.children.length > 0) {
        return new Promise((resolve) => {
          resolve();
        });
      }
     

      return new Promise((re, rej) => {
        this.$store
          .dispatch("thingView/refreshStations", treeNode.dataRef.uid)
          .then(() => {
            console.log("&&&&&&&&&&&&&", treeNode.dataRef);
            re();
          })
          .catch((err) => {
            rej(err);
          });
      });
    },
    onExpand(expandedKeys, {expanded, node}){
      if (expanded){
        if (!node.dataRef.children || node.dataRef.children.length == 0){
          this.onLoadData(node)
        }
        
      }

    },
    onThingSelected(keys){
      if(keys && keys.length == 1){
        console.log("^^^^^^^^^^^",keys[0])
        this.$emit("thing-select",keys[0])
      }
    },
    handleVisiable(e) {  
      if (e.target.visibilityState === 'visible') {  
        this.refresh()
      }  
    },
  }
};
</script>
