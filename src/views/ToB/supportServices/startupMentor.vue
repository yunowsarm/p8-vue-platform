<!-- ToB 创业导师路由页面：使用配套服务组件维护创业导师信息。 -->
<template><supporting-service-board :config="config" /></template>
<script>
import SupportingServiceBoard from '@/components/business/ApplicationBoard/SupportingServiceBoard'
export default { name: 'StartupMentor', components: { SupportingServiceBoard }, data() { return { config: { title: '创业导师', itemName: '导师', icon: 'el-icon-user-solid', idPrefix: 'SM', primaryKey: 'specialty', primaryLabel: '专长领域', cardTitleKey: 'name', contactNameKey: 'contact', timeKey: 'itemCreateTime', contentKey: 'introduction', fields: [{ key: 'name', label: '姓名', required: true }, { key: 'title', label: '头衔', required: true }, { key: 'specialty', label: '专长', required: true, options: ['企业管理', '市场营销', '融资财税', '技术创新', '人力资源', '其他'] }, { key: 'contact', label: '联系方式', required: true }, { key: 'introduction', label: '导师介绍', type: 'textarea', required: true }] } } } }
</script>
