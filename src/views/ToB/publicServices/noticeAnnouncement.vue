<template><public-service-board :config="config" /></template>
<script>
import PublicServiceBoard from './components/PublicServiceBoard'
export default {
  name: 'NoticeAnnouncement',
  components: { PublicServiceBoard },
  data() {
    return {
      config: {
        title: '通知公告',
        itemName: '公告',
        icon: 'el-icon-bell',
        description: '面向园区用户发布重要通知、服务提醒与事项说明。',
        idPrefix: 'NA',
        primaryKey: 'sceneType',
        primaryLabel: '场景类型',
        timeKey: 'publishTime',
        contentKey: 'content',
        fields: [
          { key: 'title', label: '标题', required: true, wide: true },
          { key: 'sceneType', label: '场景类型', required: true, options: ['园区服务', '运营通知', '紧急提醒', '其他'] },
          { key: 'publisherName', label: '发布人', required: true },
          { key: 'publishTime', label: '发布时间', type: 'datetime', required: true },
          { key: 'content', label: '内容', type: 'textarea', required: true }
        ]
      }
    }
  }
}
</script>
