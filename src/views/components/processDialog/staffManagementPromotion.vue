<!-- 员工升职 -->
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
      @saved="handleClose"
    />
    <div
      v-else
      v-loading="loading"
      class="process-approve-dialog__loading"
      element-loading-text="加载中..."
      element-loading-spinner="el-icon-loading"
    />
  </div>
</template>

<script>
import { P8Form as FormList } from 'p8-components-ui'
import processApproveMixin from './tools/processApproveMixin'

export default {
  name: 'StaffManagementPromotion',
  components: { FormList },
  mixins: [processApproveMixin],
  data () {
    return {
      processDefinitionKey: 'personPromotion'
    }
  },
  methods: {
    getDefaultApproveInfoConfig () {
      const config = {}
      this.row.forEach(item => {
        if (!item.ID) return
        config[item.ID] = {
          filed1: { label: '员工姓名', value: item.NAME || '' },
          filed2: { label: '部门名称', value: item.DEPTNAME || '' },
          filed3: { label: '岗位名称', value: item.JOBNAME || '' },
          filed4: { label: '联系电话', value: item.PHONE || '' }
        }
      })
      return config
    }
  }
}
</script>

<style lang="scss" src="./tools/processDialog.scss"></style>
