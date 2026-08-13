<template><LifeServiceBoard :config="config" /></template>
<script>
import LifeServiceBoard from './components/LifeServiceBoard.vue'
export default {
  name: 'ToCTalentService',
  components: { LifeServiceBoard },
  data() {
    return {
      config: {
        title: '人才服务',
        apiNamespace: 'tocTalentService',
        icon: 'el-icon-user',
        primaryLabel: '职位名称',
        primaryKey: 'jobTitle',
        contentKey: 'description',
        contentLabel: '职位描述',
        timeKey: 'publishTime',
        defaultStatus: '招聘中',
        statusOptions: ['招聘中', '已暂停', '已截止'],
        fields: [
          { key: 'jobTitle', label: '职位名称', required: true },
          { key: 'company', label: '公司名称', required: true },
          { key: 'salary', label: '薪资', required: true },
          { key: 'description', label: '职位描述', type: 'textarea', required: true },
          { key: 'contact', label: '联系方式', required: true },
          { key: 'publishTime', label: '发布时间', type: 'datetime', required: true }
        ]
      }
    }
  }
}
</script>
