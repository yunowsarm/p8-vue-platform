<template><public-service-board :config="config" /></template>
<script>
import PublicServiceBoard from './components/PublicServiceBoard'
export default { name: 'EnterpriseNews', components: { PublicServiceBoard }, data() { return { config: { title: '企业动态', itemName: '企业动态', icon: 'el-icon-office-building', description: '展示企业新闻、产品发布、荣誉成果和合作动态，支持按企业检索。', idPrefix: 'EN', primaryKey: 'newsType', primaryLabel: '动态类型', timeKey: 'publishTime', contentKey: 'content', fields: [{ key: 'companyId', label: '企业', required: true }, { key: 'title', label: '标题', required: true, wide: true }, { key: 'newsType', label: '动态类型', required: true, options: ['企业新闻', '产品发布', '荣誉成果', '合作动态'] }, { key: 'publishTime', label: '发布时间', type: 'datetime', required: true }, { key: 'content', label: '内容', type: 'textarea', required: true }] } } } }
</script>
