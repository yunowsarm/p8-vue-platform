<!-- ToB 资质认定路由入口：以用户模式复用服务大厅共享申请页面。 -->
<template><service-application-page feature="qualificationRecognition" mode="user" /></template>

<script>
import ServiceApplicationPage from '@/features/service-hall/ServiceApplicationPage'

export default { name: 'QualificationRecognition', components: { ServiceApplicationPage } }
</script>
