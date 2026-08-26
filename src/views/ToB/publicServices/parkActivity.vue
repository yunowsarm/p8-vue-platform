<!-- ToB 园区活动路由入口：只装配园区活动独立业务组件。 -->
<template><park-activity-page /></template>
<script>
import ParkActivityPage from '@/features/public-services/park-activity/ParkActivityPage'
export default { name: 'ParkActivity', components: { ParkActivityPage } }
</script>
