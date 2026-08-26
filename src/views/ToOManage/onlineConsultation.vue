<!-- 管理端在线咨询路由入口：以管理模式装配在线咨询独立业务组件。 -->
<template><online-consultation-page mode="admin" /></template>

<script>
import OnlineConsultationPage from '@/features/public-services/online-consultation/OnlineConsultationPage'

export default { name: 'ToOOnlineConsultation', components: { OnlineConsultationPage } }
</script>
