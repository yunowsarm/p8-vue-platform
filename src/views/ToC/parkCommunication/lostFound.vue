<template><communication-board :config="config" /></template>
<script>
import CommunicationBoard from './components/CommunicationBoard.vue'
export default {
  name: 'LostFound',
  components: { CommunicationBoard },
  data() {
    return {
      config: {
        title: '失物招领',
        apiNamespace: 'tocLostFound',
        icon: 'el-icon-goods',
        primaryLabel: '物品标题',
        primaryKey: 'title',
        contentKey: 'content',
        contentLabel: '物品说明',
        timeKey: 'publishTime',
        filterKey: 'type',
        defaultStatus: '待认领',
        statusOptions: ['待认领', '已认领', '已关闭'],
        fields: [
          { key: 'userId', label: '发布人编号', required: true },
          { key: 'type', label: '类型', options: ['失物招领', '寻物启事'], required: true },
          { key: 'title', label: '标题', required: true },
          { key: 'content', label: '内容', type: 'textarea', required: true },
          { key: 'contact', label: '联系方式', required: true },
          { key: 'publishTime', label: '发布时间', type: 'datetime', required: true }
        ]
      }
    }
  }
}
</script>
