<!-- ToC 园区活动路由入口：只装配公众端园区活动独立业务组件。 -->
<template><event-activity-page /></template>
<script>
import EventActivityPage from '@/features/life-services/event-activity/EventActivityPage'
export default { name: 'ToCEventActivity', components: { EventActivityPage } }
</script>
