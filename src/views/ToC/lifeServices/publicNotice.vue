<!-- ToC 外部通知公告路由入口：仅查看对外公告，不提供修改和删除操作。 -->
<template><public-notice-page mode="viewer" :api-namespace="apiNamespace" :notice-type="1" /></template>

<script>
import PublicNoticePage from '@/features/public-services/public-notice/PublicNoticePage'

export default {
  name: 'ToCPublicNotice',
  components: { PublicNoticePage },
  props: { apiNamespace: { type: String, default: 'tocPublicNotice' } }
}
</script>
