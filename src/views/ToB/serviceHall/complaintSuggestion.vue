<!-- ToB 建议投诉路由入口：只装配建议投诉独立业务组件。 -->
<template><complaint-suggestion-page mode="user" /></template>

<script>
import ComplaintSuggestionPage from '@/features/service-hall/complaint-suggestion/ComplaintSuggestionPage'

export default { name: 'ComplaintSuggestion', components: { ComplaintSuggestionPage } }
</script>
