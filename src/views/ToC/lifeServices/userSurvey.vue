<!-- ToC 调查问卷路由入口：以用户模式加载生活服务共享页面。 -->
<template><life-service-page feature="userSurvey" mode="user" /></template>

<script>
import LifeServicePage from '@/features/life-services/LifeServicePage'

export default { name: 'ToCUserSurvey', components: { LifeServicePage } }
</script>
