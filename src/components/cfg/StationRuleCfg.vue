<template>
  <div>
    <a-button type="primary" @click="add">新增规则</a-button>
    <a-table></a-table>
    <a-modal
      title="站内规则"
      :visible="ruleDlgVisible"
      @ok="handleOk"
      @cancel="ruleDlgVisible = false"
    >
      <a-form-model
        ref="ruleForm"
        :model="rule"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 14 }"
      >
        <a-form-model-item ref="ruleID" label="规则id" prop="id">
          <a-input
            v-model="rule.id"
            @blur="
              () => {
                $refs.ruleID.onFieldBlur();
              }
            "
          />
        </a-form-model-item>
        <a-form-model-item ref="templateName" label="模板" prop="templateName">
          <a-select>
            <a-select-option value="generator">数据衍生规则</a-select-option>
            <a-select-option value="linkage">联动规则</a-select-option>
          </a-select>
        </a-form-model-item>
        <mete-selector-dlg ref="meteSelectorDlg"></mete-selector-dlg>
        <a-form-model-item ref="targetMete" label="目标量" prop="name">
          <mete-display
            v-if="target.mete_id != undefined && target.mete_id != ''"
            :meteInfo="target"
          ></mete-display>
          <a-tag style="background: #fff; borderstyle: dashed">
            <a-icon type="plus" @click="addTargetMete" /> 选择量
          </a-tag>
        </a-form-model-item>
        <a-form-model-item label="源头量" prop="sourceMetes">
          <a-tag>物模型/类型/id/subid 同类索引 量索引</a-tag>
          <a-tag style="background: #fff; borderstyle: dashed">
            <a-icon type="plus" /> 新建
          </a-tag>
        </a-form-model-item>
        <a-form-model-item label="表达式" prop="expression">
          <a-input v-model="rule.expression" type="textarea" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>
<script>
import MeteSelectorDlg from "@/components/cfg/MeteSelectorDlg";
import MeteDisplay from "./MeteDisplay.vue";
export default {
  components: {
    MeteSelectorDlg,
    MeteDisplay,
  },
  data() {
    return {
      ruleDlgVisible: false,
      rule: {},
      target: {},
    };
  },
  methods: {
    handleOk() {},
    add() {
      this.ruleDlgVisible = true;
    },
    addTargetMete() {
      //var mete = {}
      this.target.id = "target";
      this.$refs.meteSelectorDlg.Show(
        this.target,
        (self, mete) => {
          return new Promise((re, rej) => {
            if (mete) {
              self.target = mete;
              re()
            }
            else{
              rej()
            }
          });
        },
        this
      );
    },
  },
};
</script>
<style scoped>
</style>