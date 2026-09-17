<!-- 线索管理普通端入口：仅查询当前用户负责的线索。 -->
<template>
  <online-consultation-page
    class="intention-inquiry-page"
    mode="user"
    api-namespace="reception"
    page-title="线索管理"
    page-description="查看本人负责的线索并记录跟进情况。"
    search-placeholder="搜索企业、联系人或联系电话"
    :list-params="{ viewType: 1 }"
    :show-create="false"
    compact
    follow-up-enabled />
</template>

<script>
import OnlineConsultationPage from '@/features/public-services/online-consultation/OnlineConsultationPage'

export default {
  name: 'IntentionInquiryUser',
  components: { OnlineConsultationPage }
}
</script>
