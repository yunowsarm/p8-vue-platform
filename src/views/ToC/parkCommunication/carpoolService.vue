<template><communication-board :config="config" /></template>
<script>
import CommunicationBoard from './components/CommunicationBoard.vue'
export default {
  name: 'CarpoolService',
  components: { CommunicationBoard },
  data() {
    return {
      config: {
        title: '园区拼车',
        apiNamespace: 'tocCarpoolService',
        icon: 'el-icon-truck',
        primaryLabel: '出发地点',
        primaryKey: 'startPoint',
        contentKey: 'contact',
        contentLabel: '联系方式',
        timeKey: 'publishTime',
        filterKey: 'type',
        defaultStatus: '待拼车',
        statusOptions: ['待拼车', '已满员', '已出发', '已取消'],
        fields: [
          { key: 'userId', label: '发布人编号', required: true },
          { key: 'type', label: '类型', options: ['找车', '找乘客'], required: true },
          { key: 'startPoint', label: '起点', required: true },
          { key: 'endPoint', label: '终点', required: true },
          { key: 'time', label: '出发时间', type: 'datetime', required: true },
          { key: 'seats', label: '座位数', required: true },
          { key: 'contact', label: '联系方式', required: true },
          { key: 'publishTime', label: '发布时间', type: 'datetime', required: true }
        ]
      }
    }
  }
}
</script>
