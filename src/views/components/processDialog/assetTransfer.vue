<!-- 资产调拨 -->
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
  name: 'AssetTransferProcess',
  components: { FormList },
  mixins: [processApproveMixin],
  data () {
    return {
      processDefinitionKey: 'assetTransfer'
    }
  },
  methods: {
    getDefaultApproveInfoConfig () {
      const config = {}
      this.row.forEach(item => {
        if (!item.ID) return
        config[item.ID] = {
          filed1: { label: '资产名称', value: item.ASSETNAME || '' },
          filed2: { label: '数量', value: item.QUANTITY ?? '' },
          filed3: { label: '调拨人', value: item.USERNAME || '' }
        }
      })
      return config
    }
  }
}
</script>

<style lang="scss" src="./tools/processDialog.scss"></style>
