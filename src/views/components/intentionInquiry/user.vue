<!-- 线索管理普通端入口：仅查询当前用户负责的线索。 -->
<template>
  <div>
    <lead-management-page class="intention-inquiry-page" mode="user" :list-params="{ viewType: 1 }" :enable-invalid-lead-application="true" @invalid-lead-application="openInvalidLeadApplication" />

    <el-dialog title="无效线索申请" :visible.sync="invalidLeadApplicationVisible" width="600px" append-to-body :close-on-click-modal="false" @closed="invalidLeadApplicationRecord = null">
      <invalid-lead-application
        v-if="invalidLeadApplicationVisible && invalidLeadApplicationRecord"
        :row="[invalidLeadApplicationRecord]"
        :business-ids="[invalidLeadApplicationRecord.id]"
        :approve-info-map="[invalidLeadApplicationRecord]"
        @close="invalidLeadApplicationVisible = false" />
    </el-dialog>
  </div>
</template>

<script>
import LeadManagementPage from './components/LeadManagementPage'
import InvalidLeadApplication from '../processDialog/InvalidLeadApplication'

export default {
  name: 'IntentionInquiryUser',
  components: { LeadManagementPage, InvalidLeadApplication },
  data() {
    return {
      invalidLeadApplicationVisible: false,
      invalidLeadApplicationRecord: null
    }
  },
  methods: {
    openInvalidLeadApplication(record) {
      this.invalidLeadApplicationRecord = record
      this.invalidLeadApplicationVisible = true
    }
  }
}
</script>
