<template><LifeServiceBoard :config="config" /></template>
<script>
import LifeServiceBoard from './components/LifeServiceBoard.vue'
export default {
  name: 'ToCCarRentalInfo',
  components: { LifeServiceBoard },
  data() {
    return {
      config: {
        title: '租车申请',
        apiNamespace: 'tocCarRentalInfo',
        icon: 'el-icon-tickets',
        primaryLabel: '车辆编号',
        primaryKey: 'carId',
        contentKey: 'userId',
        contentLabel: '用户编号',
        timeKey: 'rentStart',
        defaultStatus: '待确认',
        statusOptions: ['待确认', '已确认', '租用中', '已归还', '已取消'],
        fields: [
          { key: 'carId', label: '车辆编号', required: true },
          { key: 'userId', label: '用户编号', required: true },
          { key: 'rentStart', label: '租车开始日期', type: 'date', required: true },
          { key: 'rentEnd', label: '租车结束日期', type: 'date', required: true },
          { key: 'totalPrice', label: '总租金（元）', type: 'amount', required: true }
        ]
      }
    }
  }
}
</script>
