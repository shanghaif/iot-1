<template>
  <div>
    <div style="margin-top: 5px">
      <a-checkbox
        @change="store.is_period = !store.is_period"
        :checked="store.is_period"
        >整时存储</a-checkbox
      >
      <a-select
        size="small"
        :disabled="!store.is_period"
        v-model="store.period_type"
        style="width: 60%"
      >
        <a-select-option value="10"> 10分钟存储 </a-select-option>
        <a-select-option value="15"> 15分钟存储 </a-select-option>
        <a-select-option value="20"> 20分钟存储 </a-select-option>
        <a-select-option value="30"> 30分钟存储 </a-select-option>
        <a-select-option value="60"> 整点存储 </a-select-option>
      </a-select>
    </div>
    <div style="margin-top: 12px">
      <a-checkbox
        @change="store.is_rate = !store.is_rate"
        :checked="store.is_rate"
        >变化存储</a-checkbox
      >超过
      <a-input
        size="small"
        style="width: 20%"
        :disabled="!store.is_rate"
        v-model="store.rate_limit"
      ></a-input
      >%
    </div>
    <div style="margin-top: 12px">
      <a-checkbox
        @change="store.is_range = !store.is_range"
        :checked="store.is_range"
        >范围存储</a-checkbox
      >小于
      <a-input
        v-model="store.range_limit_max"
        size="small"
        :disabled="!store.is_range"
        style="width: 20%"
      ></a-input
      >大于
      <a-input
        v-model="store.range_limit_min"
        size="small"
        :disabled="!store.is_range"
        style="width: 20%"
      ></a-input>
    </div>
    <a-checkbox
      @change="store.is_all = !store.is_all"
      :checked="store.is_all"
      style="margin-top: 12px"
      >尽量存储</a-checkbox
    >
  </div>
</template>
<script>
export default {
  data() {
    return {
      store: {},
    };
  },
  watch: {
    storeInfo: {
      handler(nv) {
        console.log("**************%%%%%%%%%%%%%%%", nv, this);
        //this.store = nv
        this.$set(this, "store", nv);
      },
      immediate: true,
      deep: true,
    },
  },
  props: ["storeInfo"],
  methods: {},
};
</script>