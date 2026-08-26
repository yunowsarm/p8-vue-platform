<!-- ToB 服务需求路由入口：只装配服务需求独立业务组件。 -->
<template><service-request-page mode="user" /></template>

<script>
import ServiceRequestPage from '@/features/service-hall/service-request/ServiceRequestPage'

export default { name: 'ServiceNeeds', components: { ServiceRequestPage } }
</script>
