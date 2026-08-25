<!-- 公共数据上报路由入口：以只读模式复用服务大厅的数据上报页面。 -->
<template><service-application-page feature="dataReport" mode="readonly" :config-overrides="configOverrides" /></template>

<script>
import ServiceApplicationPage from '@/features/service-hall/ServiceApplicationPage'

export default {
  name: 'DataReportView',
  components: { ServiceApplicationPage },
  data() {
    return { configOverrides: { title: '数据上报查看', listParams: { type: 1 } } }
  }
}
</script>
