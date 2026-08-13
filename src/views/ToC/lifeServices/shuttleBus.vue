<template><LifeServiceBoard :config="config" /></template>
<script>
import LifeServiceBoard from './components/LifeServiceBoard.vue'
export default {
  name: 'ToCShuttleBus',
  components: { LifeServiceBoard },
  data() {
    return {
      config: {
        title: '园区班车',
        apiNamespace: 'tocShuttleBus',
        icon: 'el-icon-truck',
        primaryLabel: '线路名称',
        primaryKey: 'lineName',
        contentKey: 'startPoint',
        contentLabel: '起点',
        timeKey: 'startTime',
        defaultStatus: '运行中',
        statusOptions: ['运行中', '临时停运', '已收车'],
        fields: [
          { key: 'lineName', label: '线路名称', required: true },
          { key: 'startPoint', label: '起点', required: true },
          { key: 'endPoint', label: '终点', required: true },
          { key: 'startTime', label: '发车时间', type: 'datetime', required: true },
          { key: 'endTime', label: '收车时间', type: 'datetime', required: true },
          { key: 'interval', label: '发车间隔（分钟）', type: 'number', required: true }
        ]
      }
    }
  }
}
</script>
