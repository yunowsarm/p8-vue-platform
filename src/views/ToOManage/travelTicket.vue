<!-- 管理端旅行门票路由入口：以管理模式装配旅行门票独立业务组件。 -->
<template><travel-ticket-page mode="admin" /></template>
<script>
import TravelTicketPage from '@/features/life-services/travel-ticket/TravelTicketPage'
export default { name: 'ToOTravelTicket', components: { TravelTicketPage } }
</script>
