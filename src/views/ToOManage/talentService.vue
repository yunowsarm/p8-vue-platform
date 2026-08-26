<!-- 管理端人才服务路由入口：以管理模式装配人才服务独立业务组件。 -->
<template><talent-service-page mode="admin" /></template>
<script>
import TalentServicePage from '@/features/life-services/talent-service/TalentServicePage'
export default { name: 'ToOTalentService', components: { TalentServicePage } }
</script>
