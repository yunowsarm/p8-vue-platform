<!-- ToB 商机资源路由页面：使用配套服务组件维护企业商机信息。 -->
<template><supporting-service-board :config="config" /></template>
<script>
import SupportingServiceBoard from '@/components/business/ApplicationBoard/SupportingServiceBoard'
export default { name: 'BusinessOpportunity', components: { SupportingServiceBoard }, data() { return { config: { title: '商机资源共享', itemName: '商机', icon: 'el-icon-share', idPrefix: 'BO', primaryKey: 'type', primaryLabel: '商机类型', timeKey: 'publishTime', contentKey: 'content', fields: [{ key: 'companyId', label: '发布企业', required: true }, { key: 'title', label: '标题', required: true, wide: true }, { key: 'type', label: '商机类型', required: true, options: ['供需合作', '项目招商', '技术合作', '采购需求', '其他'] }, { key: 'publishTime', label: '发布时间', type: 'datetime', required: true }, { key: 'contactName', label: '联系人', required: true }, { key: 'contactPhone', label: '联系电话', required: true }, { key: 'content', label: '商机内容', type: 'textarea', required: true }] } } } }
</script>
