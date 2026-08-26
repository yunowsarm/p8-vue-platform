<!-- ToB 资源对接路由入口：只装配资源对接独立业务组件。 -->
<template><resource-connection-page mode="user" /></template>

<script>
import ResourceConnectionPage from '@/features/service-hall/resource-connection/ResourceConnectionPage'

export default { name: 'ResourceConnection', components: { ResourceConnectionPage } }
</script>
