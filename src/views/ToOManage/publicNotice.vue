<!-- 管理端通知公告路由入口：以管理模式装配通知公告独立业务组件。 -->
<template><public-notice-page mode="admin" api-namespace="tobPublicNotice" /></template>

<script>
import PublicNoticePage from '@/features/public-services/public-notice/PublicNoticePage'

export default { name: 'ToOPublicNotice', components: { PublicNoticePage } }
</script>
