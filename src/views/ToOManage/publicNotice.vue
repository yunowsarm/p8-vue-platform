<!-- 管理端通知公告路由入口：查看全部公告，并以管理模式装配通知公告业务组件。 -->
<template><public-notice-page mode="admin" api-namespace="tobPublicNotice" :notice-type="2" /></template>

<script>
import PublicNoticePage from '@/features/public-services/public-notice/PublicNoticePage'

export default { name: 'ToOPublicNotice', components: { PublicNoticePage } }
</script>
