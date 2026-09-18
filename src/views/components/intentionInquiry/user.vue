<!-- 线索管理普通端入口：仅查询当前用户负责的线索。 -->
<template>
  <lead-management-page class="intention-inquiry-page" mode="user" :list-params="{ viewType: 1 }" />
</template>

<script>
import LeadManagementPage from './components/LeadManagementPage'

export default {
  name: 'IntentionInquiryUser',
  components: { LeadManagementPage }
}
</script>
