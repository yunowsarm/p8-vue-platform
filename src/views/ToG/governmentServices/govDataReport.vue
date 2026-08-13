<template><GovernmentServiceBoard :config="config" /></template>
<script>
import GovernmentServiceBoard from './components/GovernmentServiceBoard.vue'
export default { name: 'GovDataReport', components: { GovernmentServiceBoard }, data() { return { config: { title: '数据上报统计', apiNamespace: 'togGovDataReport', icon: 'el-icon-data-analysis', primaryLabel: '上报类型', primaryKey: 'reportType', typeLabel: '上报类型', typeOptions: ['经营数据', '就业数据', '产值数据', '安全数据', '其他数据'], timeKey: 'reportTime', statusKey: 'status', statusOptions: ['待校验', '待审核', '审核中', '已归档'], flow: ['填报提交', '数据校验', '审核确认', '归档'], fields: [{ key: 'companyId', label: '企业ID', required: true }, { key: 'reportType', label: '上报类型', options: ['经营数据', '就业数据', '产值数据', '安全数据', '其他数据'], required: true }, { key: 'reportTime', label: '上报时间', type: 'datetime', required: true }, { key: 'reportContent', label: '上报内容', type: 'textarea', required: true }] } } } }
</script>
