<!-- ToC 通知公告路由入口：以查看模式加载指定 API 命名空间的公告页面。 -->
<template><public-notice-page mode="viewer" :api-namespace="apiNamespace" /></template>

<script>
import PublicNoticePage from '@/features/public-services/public-notice/PublicNoticePage'

export default {
  name: 'ToCPublicNotice',
  components: { PublicNoticePage },
  props: { apiNamespace: { type: String, default: 'tocPublicNotice' } }
}
</script>
