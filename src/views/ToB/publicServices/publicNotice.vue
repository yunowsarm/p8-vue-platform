<!-- ToB 通知公告路由入口：以查看模式装配通知公告独立业务组件。 -->
<template><public-notice-page mode="viewer" api-namespace="tobPublicNotice" /></template>

<script>
import PublicNoticePage from '@/features/public-services/public-notice/PublicNoticePage'

export default { name: 'ToBPublicNotice', components: { PublicNoticePage } }
</script>
