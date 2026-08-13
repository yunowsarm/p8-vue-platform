<template><LifeServiceBoard :config="config" /></template>
<script>
import LifeServiceBoard from './components/LifeServiceBoard.vue'
export default {
  name: 'ToCUserSurvey',
  components: { LifeServiceBoard },
  data() {
    return {
      config: {
        title: '调查问卷',
        apiNamespace: 'tocUserSurvey',
        icon: 'el-icon-document-checked',
        primaryLabel: '问卷标题',
        primaryKey: 'title',
        contentKey: 'description',
        contentLabel: '问卷说明',
        timeKey: 'startTime',
        defaultStatus: '进行中',
        statusOptions: ['草稿', '进行中', '已结束', '已关闭'],
        fields: [
          { key: 'title', label: '标题', required: true },
          { key: 'description', label: '描述', type: 'textarea', required: true },
          { key: 'startTime', label: '开始时间', type: 'datetime', required: true },
          { key: 'endTime', label: '结束时间', type: 'datetime', required: true }
        ]
      }
    }
  }
}
</script>
