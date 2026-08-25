<!-- 管理端调查问卷路由入口：以管理模式加载生活服务共享页面。 -->
<template><life-service-page feature="userSurvey" mode="admin" /></template>

<script>
import LifeServicePage from '@/features/life-services/LifeServicePage'

export default { name: 'ToOUserSurvey', components: { LifeServicePage } }
</script>
