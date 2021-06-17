<template>
    <div>
        <base-cfg :obj="event" :isNew="isNew" :hasPublished="hasPublished"></base-cfg>
        <a-form-model :label-col="labelCol" :wrapper-col="wrapperCol">
             <a-form-model-item label="类型" prop="type">
                <a-select default-value="alarm" v-model="event.type">
                    <a-select-option value="alarm">告警</a-select-option>
                    <a-select-option value="notify">通知</a-select-option>
                </a-select>
            </a-form-model-item>
             <a-form-model-item label="等级" prop="level" v-model="event.level">
                <a-select default-value="alarm">
                    <a-select-option value=1>1级</a-select-option>
                    <a-select-option value=2>2级</a-select-option>
                    <a-select-option value=3>3级</a-select-option>
                    <a-select-option value=4>4级</a-select-option>
                </a-select>
            </a-form-model-item>
            <a-form-model-item label="描述" prop="desc">
                <a-input v-model="event.desc" type="textarea" />
            </a-form-model-item>
        </a-form-model>
    </div>
</template>
<script>
export default {
  props:["event","isNew","hasPublished"],
  name: "EventCfg",
};
</script>