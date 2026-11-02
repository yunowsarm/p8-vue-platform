<!-- 线索管理普通端入口：仅查询当前用户负责的线索。 -->
<template>
  <div>
    <lead-management-page
      class="intention-inquiry-page"
      mode="user"
      :list-params="{ viewType: 1 }"
      :enable-invalid-lead-application="true"
      @invalid-lead-application="openInvalidLeadApplication"
      @invalid-lead-progress="openInvalidLeadProgress" />

    <el-dialog title="无效线索申请" :visible.sync="invalidLeadApplicationVisible" width="600px" append-to-body :close-on-click-modal="false" @closed="invalidLeadApplicationRecord = null">
      <invalid-lead-application
        v-if="invalidLeadApplicationVisible && invalidLeadApplicationRecord"
        :row="[invalidLeadApplicationRecord]"
        :business-ids="[invalidLeadApplicationRecord.id]"
        :approve-info-map="[invalidLeadApplicationRecord]"
        @success="handleInvalidLeadApplicationSuccess"
        @close="invalidLeadApplicationVisible = false" />
    </el-dialog>
    <el-dialog :visible.sync="progressVisible" custom-class="invalid-lead-progress-dialog" fullscreen append-to-body :show-close="false" :close-on-click-modal="false" @closed="progressRecord = null">
      <process-dialog-view
        v-if="progressVisible && progressRecord"
        :business-id="String(progressRecord.id || progressRecord.ID || '')"
        process-definition-key="InvalidLeadApplication"
        @close="progressVisible = false" />
    </el-dialog>
  </div>
</template>

<script>
import LeadManagementPage from './components/LeadManagementPage'
import InvalidLeadApplication from '../processDialog/InvalidLeadApplication'
import ProcessDialogView from '../processDialogView'

export default {
  name: 'IntentionInquiryUser',
  components: { LeadManagementPage, InvalidLeadApplication, ProcessDialogView },
  data() {
    return {
      invalidLeadApplicationVisible: false,
      invalidLeadApplicationRecord: null,
      progressVisible: false,
      progressRecord: null
    }
  },
  methods: {
    openInvalidLeadApplication(record) {
      this.invalidLeadApplicationRecord = record
      this.invalidLeadApplicationVisible = true
    },
    handleInvalidLeadApplicationSuccess() {
      if (!this.invalidLeadApplicationRecord) return
      this.$set(this.invalidLeadApplicationRecord, 'approve_status', '0')
      this.$set(this.invalidLeadApplicationRecord, 'approveStatus', '0')
    },
    openInvalidLeadProgress(record) {
      this.progressRecord = record
      this.progressVisible = true
    }
  }
}
</script>

<style lang="scss">
.invalid-lead-progress-dialog.el-dialog {
  margin: 0;
  overflow: hidden;
  .el-dialog__header {
    display: none;
  }
  .el-dialog__body {
    height: 100%;
    padding: 0;
    box-sizing: border-box;
  }
}
</style>
