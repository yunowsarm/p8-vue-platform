<!-- ToB 数据上报路由入口：只装配数据上报独立业务组件。 -->
<template><data-report-page mode="user" /></template>

<script>
import DataReportPage from '@/features/service-hall/data-report/DataReportPage'

export default { name: 'DataReport', components: { DataReportPage } }
</script>
