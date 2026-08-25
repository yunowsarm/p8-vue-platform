<!-- ToB 服务机构路由页面：使用配套服务组件维护园区服务机构。 -->
<template><supporting-service-board :config="config" /></template>
<script>
import SupportingServiceBoard from '@/components/business/ApplicationBoard/SupportingServiceBoard'
export default { name: 'ServiceOrganization', components: { SupportingServiceBoard }, data() { return { config: { title: '服务机构', itemName: '机构', icon: 'el-icon-office-building', idPrefix: 'SO', primaryKey: 'type', primaryLabel: '机构类型', cardTitleKey: 'name', contactNameKey: 'contact', timeKey: 'itemCreateTime', contentKey: 'description', fields: [{ key: 'name', label: '机构名称', required: true, wide: true }, { key: 'type', label: '机构类型', required: true, options: ['法律服务', '财税服务', '知识产权', '人力资源', '金融服务', '其他'] }, { key: 'contact', label: '联系人', required: true }, { key: 'contactPhone', label: '联系电话', required: true }, { key: 'address', label: '地址', required: true, wide: true }, { key: 'description', label: '机构简介', type: 'textarea', required: true }] } } } }
</script>
