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
  name: 'FileBorrowingProcess',
  components: { FormList },
  mixins: [processApproveMixin],
  data () {
    return {
      processDefinitionKey: 'fileApply'
    }
  },
  methods: {
    getDefaultApproveInfoConfig () {
      const config = {}
      this.row.forEach(item => {
        if (!item.ID) return
        config[item.ID] = {
          filed1: { label: '档案名称', value: item.ARCHIVENAME || '' },
          filed2: { label: '借阅人', value: item.BORROWNAME || '' },
          filed3: { label: '借阅日期', value: item.FORMATDATE1 || '' }
        }
      })
      return config
    }
  }
}
</script>

<style lang="scss" src="./tools/processDialog.scss"></style>
