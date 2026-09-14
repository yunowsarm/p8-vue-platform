<!-- 意向咨询普通端入口：仅查询当前用户的接待登记。 -->
<template>
  <online-consultation-page
    class="intention-inquiry-page"
    mode="user"
    api-namespace="reception"
    page-title="意向咨询"
    page-description="登记来访企业或个人的意向咨询信息。"
    search-placeholder="搜索企业、联系人或联系电话"
    :list-params="{ viewType: 1 }"
    :show-create="false"
    compact />
</template>

<script>
import OnlineConsultationPage from '@/features/public-services/online-consultation/OnlineConsultationPage'

export default {
  name: 'IntentionInquiryUser',
  components: { OnlineConsultationPage }
}
</script>
