<template><service-application-board :config="config" /></template>

<script>
import ServiceApplicationBoard from './components/ServiceApplicationBoard'

export default {
  name: 'DataReport',
  components: { ServiceApplicationBoard },
  data() {
    return {
      config: {
        title: '数据上报', icon: 'el-icon-upload2', idPrefix: 'DR',
        primaryKey: 'reportType', primaryLabel: '上报类型', timeKey: 'reportTime',
        contentKey: 'reportContent', contentLabel: '上报内容', defaultStatus: '待受理',
        fields: [
          { key: 'companyId', label: '企业 ID', required: true },
          { key: 'reportType', label: '上报类型', required: true, options: ['经营数据', '产值数据', '用工数据', '能耗数据'] },
          { key: 'reportTime', label: '上报时间', type: 'datetime', required: true },
          { key: 'reportContent', label: '上报内容', type: 'textarea', required: true }
        ],
        records: []
      }
    }
  }
}
</script>
