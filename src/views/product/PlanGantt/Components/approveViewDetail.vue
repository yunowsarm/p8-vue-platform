<template>
  <div style="height: 100%">
    <common-dialog
      title="查看计划详情"
      :visible="isView"
      class="w_dialog"
      style="z-index: 99999"
      :show-handle-btn="false"
      :dialog-config="dialogConfig"
      @handle-cancel="handleCancel"
      @handle-ok="handleOk"
      width="80%"
      @close="handleCancel"
      :dialog-height="700"
    >
      <template #dialog>
        <div id="couerDiv" style="background: #ffffff;height: calc(100% - 30px); z-index: 9999 !important;">
          <impact-analysis :plan-info-id="planInfoId" :create-page="createPage" :read-only="readOnlyVisible" :change-id="approveContentView.changeId" :wholeDescribeId="wholeDescribeId"></impact-analysis>
        </div>
      </template>
    </common-dialog>
  </div>
</template>
<script>
import ImpactAnalysis from './impactAnalysis'
import { P8Dialog as CommonDialog } from 'p8-components-ui'
export default {
  name: 'SubmitChange',
  components: {
    ImpactAnalysis,
    CommonDialog
  },
  props: {
    isView: {
      type: Boolean,
      default: false
    },
    planInfoId: {
      type: String
    },
    createPage: {
      type: String
    },
    wholeDescribeId: {
      type: String
    },
    approveContentView: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      dialogHeight: 400,
      readOnlyVisible: true,
      dialogConfig: {
        modal: false
      }
    }
  },
  methods: {
    handleCancel() {
      this.$emit('close')
    },
    handleOk() {
      this.handleCancel()
    }
  }
}
</script>
<style lang="scss">
.w_dialog {
  font-size: initial;
  z-index: 99999 !important;
  #couerDiv {
    z-index: 9999 !important;
  }
}
</style>
