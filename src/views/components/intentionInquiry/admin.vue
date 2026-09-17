<!-- 线索管理端入口：查看全部线索、分配负责人并记录跟进。 -->
<template>
  <lead-management-page
    class="intention-inquiry-page"
    mode="admin"
    api-namespace="reception"
    page-title="线索管理"
    page-description="管理园区线索、分配负责人并记录跟进情况。"
    search-placeholder="搜索企业、联系人或联系电话"
    :list-params="{ viewType: 0 }"
    create-action-label="新建线索"
    compact
    allocation-enabled
    follow-up-enabled />
</template>

<script>
import LeadManagementPage from './components/LeadManagementPage'

export default {
  name: 'IntentionInquiryAdmin',
  components: { LeadManagementPage }
}
</script>
