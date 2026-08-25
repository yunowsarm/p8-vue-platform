<!-- ToB 园区动态路由页面：使用公共服务组件展示和维护园区动态。 -->
<template><public-service-board :config="config" /></template>
<script>
import PublicServiceBoard from '@/components/business/ApplicationBoard/PublicServiceBoard'
export default { name: 'ParkNews', components: { PublicServiceBoard }, data() { return { config: { title: '园区动态', itemName: '动态', icon: 'el-icon-news', description: '展示园区运营、建设、服务及招商相关的最新动态。', idPrefix: 'PN', primaryKey: 'type', primaryLabel: '动态类型', timeKey: 'publishTime', contentKey: 'content', fields: [{ key: 'title', label: '标题', required: true, wide: true }, { key: 'type', label: '动态类型', required: true, options: ['园区运营', '园区建设', '企业服务', '招商动态'] }, { key: 'sceneType', label: '场景类型', required: true, options: ['园区内', '园区外', '线上活动'] }, { key: 'publisherName', label: '发布人', required: true }, { key: 'publishTime', label: '发布时间', type: 'datetime', required: true }, { key: 'content', label: '内容', type: 'textarea', required: true }] } } } }
</script>
