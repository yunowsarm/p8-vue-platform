<!-- 管理端调查问卷路由入口：以管理模式装配调查问卷独立业务组件。 -->
<template><user-survey-page mode="admin" /></template>
<script>
import UserSurveyPage from '@/features/life-services/user-survey/UserSurveyPage'
export default { name: 'ToOUserSurvey', components: { UserSurveyPage } }
</script>
