<!-- 业务表单基础字段：只负责渲染单个输入控件，不包含任何具体业务配置。 -->
<template>
  <el-form-item :label="field.label" :prop="field.key">
    <el-select v-if="field.key === 'companyId'" :value="value" clearable filterable :loading="enterpriseLoading" placeholder="请选择企业" class="record-field-full" @input="$emit('input', $event)">
      <el-option v-for="enterprise in enterpriseOptions" :key="enterprise.id" :label="enterprise.label" :value="enterprise.id" />
    </el-select>

    <el-select v-else-if="field.options" :value="value" clearable filterable :placeholder="'请选择' + field.label" class="record-field-full" @input="$emit('input', $event)">
      <el-option v-for="option in field.options" :key="optionValue(option)" :label="optionLabel(option)" :value="optionValue(option)" />
    </el-select>

    <el-date-picker
      v-else-if="field.type === 'datetime' || field.type === 'date'"
      :value="value"
      :type="field.type"
      :value-format="field.type === 'date' ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm:ss'"
      :format="field.type === 'date' ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm'"
      :placeholder="'请选择' + field.label"
      class="record-field-full"
      @input="$emit('input', $event)" />

    <el-input-number
      v-else-if="field.type === 'number' || field.type === 'amount'"
      :value="value"
      :min="field.min"
      :max="field.max"
      :step="field.step || 1"
      :precision="field.type === 'amount' ? 2 : field.precision"
      controls-position="right"
      class="record-field-full"
      @input="$emit('input', $event)" />

    <el-input
      v-else-if="field.type === 'textarea'"
      :value="value"
      type="textarea"
      :rows="field.rows || 4"
      :maxlength="field.maxlength || 500"
      show-word-limit
      resize="none"
      :placeholder="'请填写' + field.label"
      @input="$emit('input', $event)" />

    <el-input v-else :value="value" :maxlength="field.maxlength || 100" :placeholder="'请输入' + field.label" @input="$emit('input', $event)" />
  </el-form-item>
</template>

<script>
export default {
  name: 'BusinessRecordField',
  props: {
    field: { type: Object, required: true },
    value: { type: [String, Number, Array, Object, Date], default: '' },
    enterpriseOptions: { type: Array, default: () => [] },
    enterpriseLoading: { type: Boolean, default: false }
  },
  methods: {
    optionLabel(option) {
      return option && typeof option === 'object' ? option.label : option
    },
    optionValue(option) {
      return option && typeof option === 'object' ? option.value : option
    }
  }
}
</script>

<style scoped>
.record-field-full {
  width: 100%;
}
</style>
