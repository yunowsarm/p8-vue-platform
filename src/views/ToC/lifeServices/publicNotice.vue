<template><LifeServiceBoard :config="config" /></template>
<script>
import LifeServiceBoard from './components/LifeServiceBoard.vue'
export default {
  name: 'ToCPublicNotice',
  components: { LifeServiceBoard },
  data() {
    return {
      config: {
        title: '通知公告',
        apiNamespace: 'tocPublicNotice',
        icon: 'el-icon-bell',
        primaryLabel: '公告标题',
        primaryKey: 'title',
        contentKey: 'content',
        contentLabel: '公告内容',
        timeKey: 'publishTime',
        filterKey: 'sceneType',
        defaultStatus: '已发布',
        statusOptions: ['草稿', '已发布', '已下线'],
        fields: [
          { key: 'title', label: '标题', required: true },
          { key: 'sceneType', label: '场景类型', options: ['园区通用', '企业服务', '安全提醒', '活动通知'], required: true },
          { key: 'content', label: '内容', type: 'textarea', required: true },
          { key: 'publisherId', label: '发布人编号', required: true },
          { key: 'publishTime', label: '发布时间', type: 'datetime', required: true }
        ]
      }
    }
  }
}
</script>
