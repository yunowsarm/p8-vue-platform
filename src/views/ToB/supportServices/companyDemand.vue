<template><supporting-service-board :config="config" /></template>
<script>
import SupportingServiceBoard from './components/SupportingServiceBoard'
export default { name: 'CompanyDemand', components: { SupportingServiceBoard }, data() { return { config: { title: '企业需求', itemName: '需求', icon: 'el-icon-s-order', idPrefix: 'CD', primaryKey: 'demandContent', primaryLabel: '需求内容', cardTitleText: '企业需求', timeKey: 'publishTime', contentKey: 'demandContent', fields: [{ key: 'companyId', label: '企业', required: true }, { key: 'publishTime', label: '发布时间', type: 'datetime', required: true }, { key: 'contactName', label: '联系人', required: true }, { key: 'contactPhone', label: '联系电话', required: true }, { key: 'demandContent', label: '需求内容', type: 'textarea', required: true }] } } } }
</script>
