<!-- ToC 园区班车路由入口：以只读模式加载班车共享业务组件。 -->
<template><ShuttleBusBoard read-only /></template>

<script>
import ShuttleBusBoard from '@/features/life-services/shuttle-bus/ShuttleBusBoard.vue'

export default {
  name: 'ToCShuttleBus',
  components: { ShuttleBusBoard }
}
</script>
