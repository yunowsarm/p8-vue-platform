<template><public-service-board :config="config" /></template>
<script>
import PublicServiceBoard from './components/PublicServiceBoard'
export default { name: 'BenefitPolicy', components: { PublicServiceBoard }, data() { return { config: { title: '惠企政策', itemName: '政策', icon: 'el-icon-reading', description: '汇集政策要点、申报条件、办理入口与有效期，帮助企业快速匹配。', idPrefix: 'BP', primaryKey: 'policyType', primaryLabel: '政策类型', timeKey: 'publishTime', contentKey: 'content', fields: [{ key: 'title', label: '政策标题', required: true, wide: true }, { key: 'policyType', label: '政策类型', required: true, options: ['税费减免', '科技创新', '人才支持', '融资扶持', '其他'] }, { key: 'validity', label: '有效期', required: true }, { key: 'publisherName', label: '发布单位', required: true }, { key: 'publishTime', label: '发布时间', type: 'datetime', required: true }, { key: 'content', label: '政策内容', type: 'textarea', required: true }] } } } }
</script>
