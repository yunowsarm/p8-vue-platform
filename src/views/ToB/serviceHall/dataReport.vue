<!-- ToB 数据上报路由入口：以用户模式复用服务大厅共享申请页面。 -->
<template><service-application-page feature="dataReport" mode="user" /></template>

<script>
import ServiceApplicationPage from '@/features/service-hall/ServiceApplicationPage'

export default { name: 'DataReport', components: { ServiceApplicationPage } }
</script>
