<template><PolicyServiceBoard :config="config" /></template>
<script>
import PolicyServiceBoard from './components/PolicyServiceBoard.vue'
const policyTypes = [
  { label: '科技创新', value: '科技创新' },
  { label: '产业扶持', value: '产业扶持' },
  { label: '人才引进', value: '人才引进' },
  { label: '绿色发展', value: '绿色发展' },
  { label: '融资服务', value: '融资服务' }
]
const userTypes = [
  { label: '企业用户', value: '企业用户' },
  { label: '园区工作人员', value: '园区工作人员' },
  { label: '服务机构', value: '服务机构' }
]

const config = {
  title: '政策订阅',
  namespace: 'togPolicySubscribe',
  icon: 'el-icon-bell',
  searchLabel: '用户、用户类型、订阅政策',
  titleKey: 'userId',
  contentKey: 'policyTypes',
  timeKey: 'subscribeTime',
  typeKey: 'userType',
  typeLabel: '用户类型',
  typeOptions: userTypes,
  statusKey: 'status',
  defaultStatus: '生效中',
  statusOptions: ['生效中', '已取消'],
  advanceLabels: ['取消订阅'],
  metaFields: [
    { key: 'userType', label: '用户类型', icon: 'el-icon-user' },
    { key: 'policyTypes', label: '订阅范围', icon: 'el-icon-collection-tag' }
  ],
  fields: [
    { key: 'userId', label: '用户ID' },
    { key: 'userType', label: '用户类型', type: 'select', options: userTypes },
    { key: 'policyTypes', label: '订阅政策类型', type: 'select', multiple: true, options: policyTypes, wide: true },
    { key: 'subscribeTime', label: '订阅时间', type: 'datetime' }
  ]
}
export default { name: 'PolicySubscribe', components: { PolicyServiceBoard }, data: () => ({ config }) }
</script>
