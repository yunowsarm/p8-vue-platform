<!-- ToB 园区活动路由页面：使用公共服务组件展示和维护园区活动。 -->
<template><public-service-board :config="config" /></template>
<script>
import PublicServiceBoard from '@/components/business/ApplicationBoard/PublicServiceBoard'
export default { name: 'ParkActivity', components: { PublicServiceBoard }, data() { return { config: { title: '园区活动', itemName: '活动', icon: 'el-icon-date', description: '集中展示园区活动安排，支持报名说明、时间地点与活动回顾。', idPrefix: 'PA', primaryKey: 'sceneType', primaryLabel: '活动场景', timeKey: 'publishTime', contentKey: 'content', fields: [{ key: 'title', label: '活动标题', required: true, wide: true }, { key: 'sceneType', label: '活动场景', required: true, options: ['企业服务', '文体活动', '培训沙龙', '招商活动'] }, { key: 'startTime', label: '开始时间', type: 'datetime', required: true }, { key: 'endTime', label: '结束时间', type: 'datetime', required: true }, { key: 'location', label: '活动地点', required: true }, { key: 'publisherName', label: '发布人', required: true }, { key: 'publishTime', label: '发布时间', type: 'datetime', required: true }, { key: 'content', label: '活动内容', type: 'textarea', required: true }] } } } }
</script>
