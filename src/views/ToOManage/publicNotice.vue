<!-- 管理端通知公告路由入口：加载可新增、编辑和删除公告的共享页面。 -->
<template><public-notice-page mode="admin" api-namespace="tobPublicNotice" /></template>

<script>
import PublicNoticePage from '@/features/public-services/public-notice/PublicNoticePage'

export default { name: 'ToOPublicNotice', components: { PublicNoticePage } }
</script>
