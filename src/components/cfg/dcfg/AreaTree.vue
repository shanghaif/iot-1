<template>
  <div>
    <a-tree-select
      v-model="aid"
      style="width: 100%"
      :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
      :tree-data="areas"
      placeholder="Please select"
      tree-default-expand-all
      @change="onSelectNodeChanged"
      :replaceFields="{
          title:'s_name', key:'uid', value: 'uid'
      }"
    ></a-tree-select>
  </div>
</template>
<script>
export default {
    props:['areaID'],
    computed:{
      areas(){
        return this.$store.state.area.areas
      }
    },
    data() {
      return {
        aid:''
      }
    },
    watch:{
      areaID(value){
        this.aid = value
      }
    },
    methods: {
      onSelectNodeChanged(val){
        this.$emit("change",val)
      }
    },

}
</script>