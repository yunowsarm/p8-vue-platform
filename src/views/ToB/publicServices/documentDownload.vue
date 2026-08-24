<template><public-service-board :config="config" /></template>
<script>
import PublicServiceBoard from './components/PublicServiceBoard'
export default {
  name: 'DocumentDownload',
  components: { PublicServiceBoard },
  data() {
    return {
      config: {
        title: '资料下载',
        itemName: '资料',
        icon: 'el-icon-folder-opened',
        description: '提供办事指南、表单模板和园区资料，并记录资料版本与下载留痕。',
        idPrefix: 'DD',
        primaryKey: 'category',
        primaryLabel: '资料分类',
        timeKey: 'publishTime',
        contentKey: 'description',
        isDownload: true,
        actionLabel: '查看并下载',
        fields: [
          { key: 'title', label: '资料标题', required: true, wide: true },
          { key: 'category', label: '资料分类', required: true, options: ['办事指南', '表单模板', '园区手册', '宣传资料', '其他'] },
          { key: 'version', label: '版本号', required: true },
          { key: 'fileName', label: '文件名称', required: true },
          { key: 'publishTime', label: '发布时间', type: 'datetime', required: true },
          { key: 'description', label: '资料描述', type: 'textarea', required: true }
        ]
      }
    }
  }
}
</script>
