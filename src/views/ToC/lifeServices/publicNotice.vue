<!-- ToC 通知公告路由入口：以查看模式装配通知公告独立业务组件。 -->
<template><public-notice-page mode="viewer" :api-namespace="apiNamespace" /></template>

<script>
import PublicNoticePage from '@/features/public-services/public-notice/PublicNoticePage'

export default {
  name: 'ToCPublicNotice',
  components: { PublicNoticePage },
  props: { apiNamespace: { type: String, default: 'tocPublicNotice' } }
}
</script>
