<!-- ToB 安全专栏路由入口：只装配安全专栏独立业务组件。 -->
<template><safety-column-page /></template>
<script>
import SafetyColumnPage from '@/features/public-services/safety-column/SafetyColumnPage'
export default { name: 'SafetyColumn', components: { SafetyColumnPage } }
</script>
