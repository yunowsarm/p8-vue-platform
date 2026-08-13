<template><PolicyServiceBoard :config="config" /></template>
<script>
import PolicyServiceBoard from './components/PolicyServiceBoard.vue'
const config = {
  title: '项目申报',
  namespace: 'togProjectApplication',
  icon: 'el-icon-s-claim',
  searchLabel: '项目名称、企业、联系人',
  titleKey: 'projectName',
  contentKey: 'projectName',
  timeKey: 'applyTime',
  statusKey: 'approveStatus',
  defaultStatus: '待受理',
  statusOptions: ['待受理', '已受理', '审核中', '已立项'],
  advanceLabels: ['受理申请', '提交审核', '确认立项'],
  metaFields: [
    { key: 'companyId', label: '申报企业', source: 'enterprise', icon: 'el-icon-office-building' },
    { key: 'contactName', label: '联系人', icon: 'el-icon-user' },
    { key: 'contactPhone', label: '电话', icon: 'el-icon-phone-outline' }
  ],
  fields: [
    { key: 'companyId', label: '申报企业', source: 'enterprise' },
    { key: 'projectName', label: '项目名称' },
    { key: 'applyTime', label: '申请时间', type: 'datetime' },
    { key: 'contactName', label: '联系人' },
    { key: 'contactPhone', label: '联系电话' }
  ]
}
export default { name: 'ProjectApplication', components: { PolicyServiceBoard }, data: () => ({ config }) }
</script>
