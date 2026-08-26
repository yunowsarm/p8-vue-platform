<!-- ToC 调查问卷路由入口：以用户模式装配调查问卷独立业务组件。 -->
<template><user-survey-page mode="user" /></template>
<script>
import UserSurveyPage from '@/features/life-services/user-survey/UserSurveyPage'
export default { name: 'ToCUserSurvey', components: { UserSurveyPage } }
</script>
