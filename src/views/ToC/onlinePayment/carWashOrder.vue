<template><payment-order-board :config="config" /></template>
<script>
import PaymentOrderBoard from './components/PaymentOrderBoard.vue'
export default {
  name: 'CarWashOrder',
  components: { PaymentOrderBoard },
  data() {
    return {
      config: {
        title: '洗车服务',
        apiNamespace: 'tocCarWashOrder',
        icon: 'el-icon-brush',
        primaryLabel: '服务费用',
        primaryKey: 'carNumber',
        fields: [
          { key: 'userId', label: '用户编号', required: true },
          { key: 'carNumber', label: '车牌号码', required: true },
          { key: 'amount', label: '服务费用', type: 'amount', required: true },
          { key: 'payTime', label: '支付时间', type: 'datetime' },
          { key: 'orderNo', label: '订单号' }
        ]
      }
    }
  }
}
</script>
