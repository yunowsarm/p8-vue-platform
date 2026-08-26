<!-- ToC 人才服务路由入口：以用户模式装配人才服务独立业务组件。 -->
<template><talent-service-page mode="user" /></template>
<script>
import TalentServicePage from '@/features/life-services/talent-service/TalentServicePage'
export default { name: 'ToCTalentService', components: { TalentServicePage } }
</script>
