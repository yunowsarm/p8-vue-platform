<!-- 管理端在线咨询路由入口：以管理模式加载咨询回复共享页面。 -->
<template><online-consultation-page mode="admin" /></template>

<script>
import OnlineConsultationPage from '@/features/public-services/online-consultation/OnlineConsultationPage'

export default { name: 'ToOOnlineConsultation', components: { OnlineConsultationPage } }
</script>
