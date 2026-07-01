<!-- 资产采购 -->
<template>
  <div class="process-approve-dialog process-approve-dialog--tall">
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
  name: 'AssetPurchaseProcess',
  components: { FormList },
  mixins: [processApproveMixin],
  data () {
    return {
      processDefinitionKey: 'assetPurchaseApprove'
    }
  },
  methods: {
    getDefaultApproveInfoConfig () {
      const config = {}
      this.row.forEach(item => {
        if (!item.ID) return
        config[item.ID] = {
          filed1: { label: '申请部门', value: item.DEPARTMENT || '' },
          filed2: { label: '申请人', value: item.PERSONNAME || '' },
          filed3: { label: '用途分类', value: item.USECLASSIFICATION || '' },
          filed4: { label: '紧急程度', value: item.URGENCYLEVEL || '' }
        }
      })
      return config
    }
  }
}
</script>

<style lang="scss" src="./tools/processDialog.scss"></style>
