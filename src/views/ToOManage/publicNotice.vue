<template><LifeServiceBoard :config="config" /></template>

<script>
//通知公告管理
import LifeServiceBoard from '../ToC/lifeServices/components/LifeServiceBoard.vue'

export default {
  name: 'ToOPublicNotice',
  components: { LifeServiceBoard },
  data() {
    return {
      config: {
        title: '通知公告',
        apiNamespace: 'tobPublicNotice',
        autoPublisher: true,
        publisherNameKey: 'createByName',
        hasStatus: false,
        icon: 'el-icon-bell',
        primaryLabel: '公告标题',
        primaryKey: 'title',
        contentKey: 'content',
        contentLabel: '公告内容',
        timeKey: 'publishTime',
        filterKey: 'sceneType',
        fields: [
          { key: 'title', label: '标题', required: true },
          { key: 'sceneType', label: '场景类型', options: ['园区动态', '企业动态', '安全提醒', '活动通知'], required: true },
          { key: 'content', label: '内容', type: 'textarea', required: true },
          { key: 'createByName', label: '发布人', hideInForm: true },
          { key: 'publishTime', label: '发布时间', type: 'datetime', hideInForm: true }
        ]
      }
    }
  }
}
</script>
