<!-- ToB 内部通知公告路由入口：仅查看对内公告，不提供修改和删除操作。 -->
<template><public-notice-page mode="viewer" api-namespace="tobPublicNotice" :notice-type="1" /></template>

<script>
import PublicNoticePage from '@/features/public-services/public-notice/PublicNoticePage'

export default { name: 'ToBPublicNotice', components: { PublicNoticePage } }
</script>
