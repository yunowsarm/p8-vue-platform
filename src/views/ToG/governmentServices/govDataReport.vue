<!-- 政府端数据上报只读入口：复用办事大厅数据上报页面，仅查看已通过的上报记录。 -->
<template><data-report-page mode="readonly" title="数据上报统计" :list-type="1" :list-status="2" /></template>

<script>
import DataReportPage from '@/features/service-hall/data-report/DataReportPage'

export default {
  name: 'GovDataReport',
  components: { DataReportPage }
}
</script>
