<template>
  <div>
    <a-cascader
      style="width: 300px"
      :options="areas"
      :load-data="loadData"
      placeholder="请选择"
      :value="value"
      :change-on-select="ChangeOnSelect"
      @change="onAreaChange"
    />
  </div>
</template>
<script>
import { getChildren } from "@/services/area";
export default {
  props: {
    value: {
      type: Array,
      default() {
        return [];
      },
    },
    ChangeOnSelect: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  watch: {
    value() {
      this.load();
    },
  },
  data() {
    return {
      areas: [],
      //valueSelected:[]
    };
  },
  computed: {},
  mounted() {
    this.load();
  },
  methods: {
    async loadItem(_this, current, re) {
      if (_this.value && _this.value.length > 0) {
        for (let i = 0; i < _this.value.length - 1; i++) {
          current = await _this.getChildren(current, _this.value, i);
        }
        await re();
      }
    },
    getChildren(current, value, index) {
      let _this = this;
      return new Promise((resolve) => {
        getChildren(_this.value[index]).then((res) => {
          let next = null;
          if (res.data && res.data.result) {
            if (current) {
              let children = res.data.result.map((x) => {
                let item = {
                  label: x.s_name,
                  value: x.uid,
                  isLeaf: x.level === 4,
                  obj: x,
                };

                if (x.uid == value[index + 1]) {
                  next = item;
                }
                return item;
              });
              _this.$set(current, "children", children);
              current = next;
            }
          }
          resolve(next);
        });
      });
    },
    load() {
      const _this = this;
      return new Promise((re, rej) => {
        getChildren(0)
          .then((res) => {
            if (res.data && res.data.result) {
              let privence = null;
              if (_this.value && _this.value.length > 0) {
                privence = _this.value[0];
              }
              let current = null;
              _this.areas = res.data.result.map((x) => {
                let item = {
                  label: x.s_name,
                  value: x.uid,
                  isLeaf: x.level === 4,
                  obj: x,
                };
                if (x.uid == privence) {
                  current = item;
                }
                return item;
              });
              _this.loadItem(_this, current, re);
            }
          })
          .catch((err) => {
            rej(err);
          });
      });
    },

    getSelect(selectedOptions) {
      const index = selectedOptions.length - 1;
      if (index < 0) {
        return;
      }
      //const _this = this;
      const targetOption = selectedOptions[index];
      //this.station.area_id = targetOption.uid
      return targetOption;
    },
    loadData(selectedOptions) {
      const targetOption = this.getSelect(selectedOptions);
      if (!targetOption) {
        return;
      }

      if (targetOption.isLeaf) {
        return;
      }
      if (targetOption.children && targetOption.children.length > 0) {
        return;
      }
      const _this = this;
      getChildren(targetOption.value)
        .then((res) => {
          if (res.data && res.data.result) {
            targetOption.children = res.data.result.map((x) => {
              return {
                label: x.s_name,
                value: x.uid,
                isLeaf: x.level === 4,
                lon: x.lon,
                lat: x.lat,
                obj: x,
              };
            });
            _this.areas = [..._this.areas];
          }
        })
        .finally(() => {
          targetOption.loading = false;
        });

      // load options lazily
    },

    onAreaChange(val, selectedOptions) {
      /*var obj = undefined
      if(val && val.length > 0){
        obj = this.getSelect(selectedOptions)
      }*/
      this.$emit("area-change", val, selectedOptions);
      this.$emit("input", val);
    },
  },
};
</script>
<style scoped>
</style>
