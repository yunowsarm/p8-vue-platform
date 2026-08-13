<template><PolicyServiceBoard :config="config" /></template>
<script>
import PolicyServiceBoard from './components/PolicyServiceBoard.vue'
const config = {
  title: '政策推送',
  namespace: 'togPolicyPush',
  icon: 'el-icon-position',
  searchLabel: '关联政策、推送对象、推送人',
  titleKey: 'pushTarget',
  contentKey: 'pushTarget',
  timeKey: 'pushTime',
  statusKey: 'status',
  defaultStatus: '待发送',
  statusOptions: ['待发送', '发送中', '已完成'],
  advanceLabels: ['开始推送', '确认发送完成'],
  metaFields: [
    { key: 'policyId', label: '关联政策', source: 'policy', icon: 'el-icon-reading' },
    { key: 'pushUserId', label: '推送人', icon: 'el-icon-user' }
  ],
  fields: [
    { key: 'policyId', label: '推送政策', source: 'policy' },
    {
      key: 'pushTarget',
      label: '推送对象',
      type: 'select',
      options: [
        { label: '全部园区企业', value: '全部园区企业' },
        { label: '高新技术企业', value: '高新技术企业' },
        { label: '科技型中小企业', value: '科技型中小企业' },
        { label: '指定企业', value: '指定企业' }
      ]
    },
    { key: 'pushTime', label: '计划推送时间', type: 'datetime' },
    { key: 'pushUserId', label: '推送人ID' }
  ]
}
export default { name: 'PolicyPush', components: { PolicyServiceBoard }, data: () => ({ config }) }
</script>
