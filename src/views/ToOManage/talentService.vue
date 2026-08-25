<!-- 管理端人才服务路由入口：以管理模式加载生活服务共享页面。 -->
<template><life-service-page feature="talentService" mode="admin" /></template>

<script>
import LifeServicePage from '@/features/life-services/LifeServicePage'

export default { name: 'ToOTalentService', components: { LifeServicePage } }
</script>
