<!-- 公共数据上报路由入口：以只读模式装配数据上报独立业务组件。 -->
<template><data-report-page mode="readonly" title="数据上报查看" :list-type="1" /></template>

<script>
import DataReportPage from '@/features/service-hall/data-report/DataReportPage'

export default {
  name: 'DataReportView',
  components: { DataReportPage }
}
</script>
