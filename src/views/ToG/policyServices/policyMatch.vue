<template><PolicyServiceBoard :config="config" /></template>
<script>
import PolicyServiceBoard from './components/PolicyServiceBoard.vue'
const config = {
  title: '智能匹配',
  namespace: 'togPolicyMatch',
  icon: 'el-icon-connection',
  projectTransfer: true,
  searchLabel: '政策、匹配企业、匹配度',
  titleKey: 'companyId',
  contentKey: 'policyId',
  timeKey: 'matchTime',
  statusKey: 'status',
  defaultStatus: '已匹配',
  statusOptions: ['已匹配', '已推荐', '已转申报'],
  advanceLabels: ['推荐给企业', '转项目申报'],
  metaFields: [
    { key: 'policyId', label: '匹配政策', source: 'policySubscribe', icon: 'el-icon-reading' },
    { key: 'matchDegree', label: '匹配度', type: 'number', suffix: '%', icon: 'el-icon-data-line' }
  ],
  fields: [
    { key: 'policyId', label: '匹配政策', source: 'policySubscribe' },
    { key: 'companyId', label: '匹配企业', source: 'enterprise' },
    { key: 'matchDegree', label: '匹配度', type: 'number', min: 0, max: 100, suffix: '%' },
    { key: 'matchTime', label: '匹配时间', type: 'datetime' }
  ]
}
export default { name: 'PolicyMatch', components: { PolicyServiceBoard }, data: () => ({ config }) }
</script>
