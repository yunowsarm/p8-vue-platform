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

const config = {
  title: '政策说明',
  namespace: 'togEnterprisePolicy',
  icon: 'el-icon-reading',
  searchLabel: '标题、政策类型、发布人',
  titleKey: 'title',
  contentKey: 'content',
  timeKey: 'publishTime',
  typeKey: 'policyType',
  typeLabel: '政策类型',
  typeOptions: policyTypes,
  statusKey: 'status',
  defaultStatus: '草稿',
  statusOptions: ['草稿', '已发布', '已下架'],
  advanceLabels: ['发布政策', '下架政策'],
  metaFields: [
    { key: 'policyType', label: '政策类型', icon: 'el-icon-collection-tag' },
    { key: 'publisherId', label: '发布人', icon: 'el-icon-user' }
  ],
  fields: [
    { key: 'title', label: '政策标题' },
    { key: 'policyType', label: '政策类型', type: 'select', options: policyTypes },
    { key: 'publisherId', label: '发布人ID' },
    { key: 'publishTime', label: '发布时间', type: 'datetime' },
    { key: 'content', label: '政策内容', type: 'textarea', wide: true, rows: 7 }
  ]
}
export default { name: 'EnterprisePolicy', components: { PolicyServiceBoard }, data: () => ({ config }) }
</script>
