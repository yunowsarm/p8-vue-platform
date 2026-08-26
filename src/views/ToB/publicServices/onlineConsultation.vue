<!-- ToB 在线咨询路由入口：以用户模式装配在线咨询独立业务组件。 -->
<template><online-consultation-page mode="user" /></template>

<script>
import OnlineConsultationPage from '@/features/public-services/online-consultation/OnlineConsultationPage'

export default { name: 'OnlineConsultation', components: { OnlineConsultationPage } }
</script>
