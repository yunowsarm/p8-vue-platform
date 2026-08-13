<template><payment-order-board :config="config" /></template>
<script>
import PaymentOrderBoard from './components/PaymentOrderBoard.vue'
export default {
  name: 'SportsPayment',
  components: { PaymentOrderBoard },
  data() {
    return {
      config: {
        title: '运动健身',
        apiNamespace: 'tocSportsPayment',
        icon: 'el-icon-football',
        primaryLabel: '消费金额',
        primaryKey: 'sportType',
        fields: [
          { key: 'userId', label: '用户编号', required: true },
          { key: 'sportType', label: '运动类型', options: ['健身', '游泳', '羽毛球', '篮球', '乒乓球'], required: true },
          { key: 'venueId', label: '场馆编号', required: true },
          { key: 'amount', label: '消费金额', type: 'amount', required: true },
          { key: 'payTime', label: '支付时间', type: 'datetime' },
          { key: 'orderNo', label: '订单号' }
        ]
      }
    }
  }
}
</script>
