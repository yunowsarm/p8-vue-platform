<!-- ToB 诉求反馈路由入口：只装配建议、投诉和服务需求业务组件。 -->
<template><complaint-suggestion-page mode="user" /></template>

<script>
import ComplaintSuggestionPage from '@/features/service-hall/complaint-suggestion/ComplaintSuggestionPage'

export default { name: 'ComplaintSuggestion', components: { ComplaintSuggestionPage } }
</script>
