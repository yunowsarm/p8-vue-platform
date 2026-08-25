<!-- ToB 在线咨询路由入口：以用户模式加载在线咨询共享页面。 -->
<template><online-consultation-page mode="user" /></template>

<script>
import OnlineConsultationPage from '@/features/public-services/online-consultation/OnlineConsultationPage'

export default { name: 'OnlineConsultation', components: { OnlineConsultationPage } }
</script>
