<!-- 对内通知公告路由入口：加载对内公告列表，仅提供查看能力。 -->
<template><public-notice-page mode="viewer" api-namespace="tobPublicNotice" :notice-type="0" /></template>

<script>
import PublicNoticePage from '@/features/public-services/public-notice/PublicNoticePage'

export default {
  name: 'InsidePublicNotice',
  components: { PublicNoticePage }
}
</script>
