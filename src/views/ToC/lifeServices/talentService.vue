<!-- ToC 人才服务路由入口：以用户模式加载生活服务共享页面。 -->
<template><life-service-page feature="talentService" mode="user" /></template>

<script>
import LifeServicePage from '@/features/life-services/LifeServicePage'

export default { name: 'ToCTalentService', components: { LifeServicePage } }
</script>
