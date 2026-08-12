<template><public-service-board :config="config" /></template>
<script>
import PublicServiceBoard from './components/PublicServiceBoard'
export default { name: 'SafetyColumn', components: { PublicServiceBoard }, data() { return { config: { title: '安全专栏', itemName: '安全文章', icon: 'el-icon-warning-outline', description: '发布安全法规、风险提示、演练通知和安全知识，支持分级展示。', idPrefix: 'SC', primaryKey: 'type', primaryLabel: '安全类型', timeKey: 'publishTime', contentKey: 'content', fields: [{ key: 'title', label: '标题', required: true, wide: true }, { key: 'type', label: '安全类型', required: true, options: ['消防安全', '生产安全', '治安安全', '应急演练'] }, { key: 'publisherName', label: '发布人', required: true }, { key: 'publishTime', label: '发布时间', type: 'datetime', required: true }, { key: 'content', label: '内容', type: 'textarea', required: true }] } } } }
</script>
