<template><public-service-board :config="config" /></template>
<script>
import PublicServiceBoard from './components/PublicServiceBoard'
export default { name: 'OnlineConsultation', components: { PublicServiceBoard }, data() { return { config: { title: '在线咨询', itemName: '咨询', icon: 'el-icon-service', description: '提交园区服务咨询，由专员受理、回复并形成可追踪的服务记录。', idPrefix: 'OC', primaryKey: 'consultType', primaryLabel: '咨询类型', timeKey: 'consultTime', contentKey: 'content', isConsultation: true, fields: [{ key: 'companyId', label: '企业', required: true }, { key: 'contactName', label: '咨询人', required: true }, { key: 'contactPhone', label: '联系电话', required: true }, { key: 'consultType', label: '咨询类型', required: true, options: ['政策咨询', '园区服务', '办事流程', '其他'] }, { key: 'consultTime', label: '咨询时间', type: 'datetime', required: true }, { key: 'content', label: '咨询内容', type: 'textarea', required: true }, { key: 'reply', label: '回复内容', type: 'textarea' }] } } } }
</script>
