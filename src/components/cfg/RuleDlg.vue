<template>
  <div>
    <a-modal
      title="告警条件"
      :visible="conditionDlgShow"
      @ok="saveCondition"
      @cancel="conditionDlgShow = false"
    >
      <a-form-model
        ref="ruleForm"
        :model="currentC"
        :rules="rules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 10 }"
      >
        <a-form-model-item ref="id_suffix" label="id后缀" prop="id_suffix">
          <a-auto-complete
            :disabled="!isConditonNew"
            :data-source="idsuffixes"
            style="width: 200px"
            placeholder="input here"
            v-model="currentC.id_suffix"
            @blur="
              () => {
                $refs.id_suffix.onFieldBlur();
              }
            "
          />
        </a-form-model-item>
        <a-form-model-item
          ref="name_suffix"
          label="名称后缀"
          prop="name_suffix"
        >
          <a-auto-complete
            :data-source="namesuffixes"
            style="width: 200px"
            placeholder="input here"
            v-model="currentC.name_suffix"
            @blur="
              () => {
                $refs.name_suffix.onFieldBlur();
              }
            "
          />
        </a-form-model-item>
        <a-form-model-item has-feedback ref="range" label="阈值" prop="range">
          <a-auto-complete
            :data-source="ranges"
            style="width: 200px"
            placeholder="input here"
            v-model="currentC.range"
            @blur="
              () => {
                $refs.range.onFieldBlur();
              }
            "
          />
        </a-form-model-item>
        <a-form-model-item
          ref="subItem"
          label="子属性"
          prop="subItem"
          v-if="hasSubItem"
        >
          <a-select v-model="currentC.subItem"  label-in-value >
            <a-select-option
              v-for="item in subItems"
              :key="item.identifier"
              :value="item.identifier"
            >
              {{item.name}}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item ref="delay" label="延时(秒)" prop="delay">
          <a-input
            v-model="currentC.delay"
            @blur="
              () => {
                $refs.delay.onFieldBlur();
              }
            "
          />
        </a-form-model-item>
        <a-form-model-item label="级别" prop="level">
          <a-select
            style="width: 30%"
            default-value="3"
            v-model="currentC.level"
            placeholder="级别"
          >
            <a-select-option value=1> 1 </a-select-option>
            <a-select-option value=2> 2 </a-select-option>
            <a-select-option value=3> 3 </a-select-option>
            <a-select-option value=4> 4 </a-select-option>
            <a-select-option value=5> 5 </a-select-option>
            <a-select-option value=6> 6 </a-select-option>
          </a-select>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>
<script>
export default {
  computed: {
    subItems() {
      if (this.currentC && this.currentC.property) {
        if (
          this.currentC.property.data_type &&
          this.currentC.property.data_type.type === "struct"
        ) {
          return this.currentC.property.data_type.specs;
        }
        if (
          this.currentC.property.data_type &&
          this.currentC.property.data_type.type === "array" &&
          this.currentC.property.data_type.specs.item &&
          this.currentC.property.data_type.specs.item.type == "struct"
        ) {
          return this.currentC.property.data_type.specs.item.specs;
        }
      }
      return [];
    },
    hasSubItem() {
      if (this.currentC && this.currentC.property) {
        if (
          this.currentC.property.data_type &&
          this.currentC.property.data_type.type === "struct"
        ) {
          return true;
        }
        if (
          this.currentC.property.data_type &&
          this.currentC.property.data_type.type === "array" &&
          this.currentC.property.data_type.specs.item &&
          this.currentC.property.data_type.specs.item.type == "struct"
        ) {
          return true;
        }
      }
      return false;
    },
  },
  data() {
    let checkRange = (rule, value, callback) => {
      if (value == "" || !value) {
        callback(new Error("请填写范围，不能为空"));
        return;
      }
      var expr = /^(\(|\[)(-?\d+)(\.\d+)?,(-?\d+)(\.\d+)?(\]|\))$/;
      var isRight = expr.test(value);
      if (isRight) {
        const parts = value.split(",");
        let min = parts[0].substr(1);
        let max = parts[1].substr(0, parts[1].length - 1);
        if (Number(min) < Number(max)) {
          callback();
        } else {
          callback(new Error("格式错误，左边的数字应大于右边的数字"));
        }
      } else {
        callback(new Error("格式错误，范围的格式为[1,2]或(3,4)或[3,4),(3,4]"));
      }
    };
    return {
      currentC: {},

      isConditonNew: false,
      parentwindow: null,
      saveFun: null,
      conditionDlgShow: false,
      idsuffixes: [
        "low",
        "too_low",
        "extra_low",
        "high",
        "too_high",
        "extra_high",
      ],
      namesuffixes: ["低", "过低", "超低", "高", "过高", "超高"],
      ranges: ["(", "[", ",", ")", "]"],
      rules: {
        range: [
          {
            validator: checkRange,
            required: true,
            //pattern: /^\(|\[(-?\d+)(\.\d+)?,(-?\d+)(\.\d+)?\)|\]$/,
            //message: "请填入范围，范围的格式为[1,2]或(3,4)或[3,4),(3,4]",
            trigger: "blur",
          },
        ],
        delay: [
          {
            required: true,
            pattern: /\d+$/,
            message:
              "请填入延时秒数，不支持小数，0为不延时。延时的作用是消除频繁告警。",
            trigger: "blur",
          },
        ],
        name_suffix: [
          {
            required: true,
            message: "请填入后缀名称，建议使用中文",
            trigger: "blur",
          },
        ],
        id_suffix: [
          {
            required: true,
            message: "请填入后缀名称，建议不要使用中文",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    editCondition(record, saveFun, self) {
      this.subItem = {};
      this.parentwindow = self;
      this.currentC =  JSON.parse(JSON.stringify(record));
      this.isConditonNew = false;
      this.saveFun = saveFun;
      this.conditionDlgShow = true;
    },

    addCondition(saveFun, self, property) {
      this.subItem = {};
      this.parentwindow = self;
      this.isConditonNew = true;
      this.currentC = {
        level: 3,
        delay: 0,
        name_suffix: "高",
        id_suffix: "high",
        property: property,
        subItem:{},
        
      };
      this.saveFun = saveFun;
      this.conditionDlgShow = true;
    },
    saveCondition() {
      const _this = this
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          const ret = _this.saveFun
            ? _this.saveFun(_this.parentwindow, _this.currentC)
            : true;
          if (ret) {
            _this.conditionDlgShow = false;
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
  },
};
</script>