<template><supporting-service-board :config="config" /></template>
<script>
import SupportingServiceBoard from './components/SupportingServiceBoard'
export default { name: 'IndustryAssociation', components: { SupportingServiceBoard }, data() { return { config: { title: '行业协会', itemName: '协会', icon: 'el-icon-connection', idPrefix: 'IA', primaryKey: 'name', primaryLabel: '协会名称', cardTitleKey: 'name', contactNameKey: 'contact', timeKey: 'itemCreateTime', contentKey: 'description', fields: [{ key: 'name', label: '协会名称', required: true, wide: true }, { key: 'contact', label: '联系人', required: true }, { key: 'contactPhone', label: '联系电话', required: true }, { key: 'address', label: '地址', required: true, wide: true }, { key: 'description', label: '协会描述', type: 'textarea', required: true }] } } } }
</script>
