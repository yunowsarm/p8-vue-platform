<!-- 线索管理端入口：查看全部线索、分配负责人并记录跟进。 -->
<template>
  <lead-management-page class="intention-inquiry-page" mode="admin" :list-params="{ viewType: 0 }" />
</template>

<script>
import LeadManagementPage from './components/LeadManagementPage'

export default {
  name: 'IntentionInquiryAdmin',
  components: { LeadManagementPage }
}
</script>
