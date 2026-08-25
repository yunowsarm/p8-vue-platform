<!-- ToC 园区活动路由页面：使用通用内容组件展示园区活动。 -->
<template><LifeServiceBoard :config="config" /></template>
<script>
import LifeServiceBoard from '@/components/business/ContentBoard'
export default {
  name: 'ToCEventActivity',
  components: { LifeServiceBoard },
  data() {
    return {
      config: {
        title: '园区活动',
        apiNamespace: 'tocEventActivity',
        icon: 'el-icon-calendar',
        primaryLabel: '活动标题',
        primaryKey: 'title',
        contentKey: 'content',
        contentLabel: '活动内容',
        timeKey: 'startTime',
        filterKey: 'sceneType',
        defaultStatus: '报名中',
        statusOptions: ['草稿', '报名中', '报名截止', '活动结束', '已取消'],
        fields: [
          { key: 'title', label: '标题', required: true },
          { key: 'sceneType', label: '场景类型', options: ['企业活动', '公益活动', '文体活动', '培训沙龙'], required: true },
          { key: 'content', label: '内容', type: 'textarea', required: true },
          { key: 'location', label: '地点', required: true },
          { key: 'startTime', label: '开始时间', type: 'datetime', required: true },
          { key: 'endTime', label: '结束时间', type: 'datetime', required: true },
          { key: 'publisherId', label: '发布人编号', required: true },
          { key: 'publishTime', label: '发布时间', type: 'datetime', required: true }
        ]
      }
    }
  }
}
</script>
