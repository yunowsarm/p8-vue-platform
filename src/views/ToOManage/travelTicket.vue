<!-- 管理端旅行门票路由入口：以管理模式加载生活服务共享页面。 -->
<template><life-service-page feature="travelTicket" mode="admin" /></template>

<script>
import LifeServicePage from '@/features/life-services/LifeServicePage'

export default { name: 'ToOTravelTicket', components: { LifeServicePage } }
</script>
