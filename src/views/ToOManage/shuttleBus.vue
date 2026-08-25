<!-- 管理端园区班车路由入口：加载可维护班车线路的共享业务组件。 -->
<template><ShuttleBusBoard /></template>

<script>
import ShuttleBusBoard from '@/features/life-services/shuttle-bus/ShuttleBusBoard.vue'

export default {
  name: 'ToOShuttleBus',
  components: { ShuttleBusBoard }
}
</script>
