<!-- 无效线索申请 -->
<template>
  <div class="process-approve-dialog">
    <form-list
      v-if="isReady"
      ref="form"
      label-width="150px"
      :data-source="selectUserBeforehandDataSource"
      :form="selectUserBeforehandFormData"
      :is-custom-validate="true"
      @custom-validate="handleSubmit"
      @saved="handleClose" />
    <div v-else v-loading="loading" class="process-approve-dialog__loading" element-loading-text="加载中..." element-loading-spinner="el-icon-loading" />
  </div>
</template>

<script>
import { P8Form as FormList } from 'p8-components-ui'
import processApproveMixin from './tools/processApproveMixin'

export default {
  name: 'InvalidLeadApplication',
  components: { FormList },
  mixins: [processApproveMixin],
  data() {
    return {
      processDefinitionKey: 'InvalidLeadApplication'
    }
  },
  methods: {
    buildDataSource(res) {
      processApproveMixin.methods.buildDataSource.call(this, res)
      this.selectUserBeforehandDataSource.push({
        type: 'textarea',
        labelText: '申请无效理由',
        fieldName: 'reason',
        placeholder: '请输入申请无效理由',
        colLayout: 'singleCol',
        fieldConfig: { rows: 4 },
        rules: [{ required: true, trigger: 'blur', message: '请填写申请无效理由' }]
      })
      this.$set(this.selectUserBeforehandFormData, 'reason', this.resolvedApproveInfoMap[0]?.reason || '')
    },
    getDefaultApproveInfoConfig() {
      const config = {}
      this.row.forEach((item) => {
        const businessId = item.ID || item.id
        if (!businessId) return
        config[businessId] = {
          filed1: { label: '企业名称', value: item.enterprise || '' },
          filed2: { label: '联系人', value: item.contactName || '' },
          filed3: { label: '联系电话', value: item.contactPhone || '' }
        }
      })
      return config
    },
    isRequestSuccess(response) {
      const head = response?.head || response?.data?.head
      if (head && (String(head.success) === 'false' || String(head.code) !== '200')) return false
      return response?.result !== false && response?.result !== 'false'
    },
    async handleSubmit(formParams) {
      const reason = String(formParams.reason || '').trim()
      if (!reason) {
        this.$message.warning('请填写申请无效理由')
        return
      }
      if (!this.resolvedBusinessIds.length) {
        this.$message.error('未获取到线索 ID，无法提交申请')
        return
      }
      try {
        const responses = await Promise.all(this.resolvedBusinessIds.map((id) => this.$api['reception.edit']({ id, reason })))
        if (responses.some((response) => !this.isRequestSuccess(response))) {
          this.$message.error('保存申请无效理由失败')
          return
        }
        processApproveMixin.methods.handleSubmit.call(this, { ...formParams, reason })
      } catch (error) {
        this.$message.error('保存申请无效理由失败，请稍后重试')
      }
    }
  }
}
</script>

<style lang="scss" src="./tools/processDialog.scss"></style>
