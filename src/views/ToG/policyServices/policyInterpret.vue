<template><PolicyServiceBoard :config="config" /></template>
<script>
import PolicyServiceBoard from './components/PolicyServiceBoard.vue'
const config = {
  title: '图文解读',
  namespace: 'togPolicyInterpret',
  icon: 'el-icon-picture-outline',
  searchLabel: '解读标题、关联政策、发布人',
  titleKey: 'title',
  contentKey: 'content',
  timeKey: 'publishTime',
  defaultStatus: '已发布',
  metaFields: [
    { key: 'policyId', label: '关联政策', source: 'policy', icon: 'el-icon-reading' },
    { key: 'publisherId', label: '发布人', icon: 'el-icon-user' }
  ],
  fields: [
    { key: 'policyId', label: '关联政策', source: 'policy' },
    { key: 'title', label: '解读标题' },
    { key: 'publisherId', label: '发布人ID' },
    { key: 'publishTime', label: '发布时间', type: 'datetime' },
    { key: 'content', label: '解读内容', type: 'textarea', wide: true, rows: 7 }
  ]
}
export default { name: 'PolicyInterpret', components: { PolicyServiceBoard }, data: () => ({ config }) }
</script>
