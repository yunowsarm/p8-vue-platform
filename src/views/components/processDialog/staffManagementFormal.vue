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
  name: 'StaffManagementFormal',
  components: { FormList },
  mixins: [processApproveMixin],
  data () {
    return {
      processDefinitionKey: 'personFormal'
    }
  }
}
</script>

<style lang="scss" src="./tools/processDialog.scss"></style>
