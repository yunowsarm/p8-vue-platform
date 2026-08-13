<template><payment-order-board :config="config" /></template>
<script>
import PaymentOrderBoard from './components/PaymentOrderBoard.vue'
export default {
  name: 'LifeServiceOrder',
  components: { PaymentOrderBoard },
  data() {
    return {
      config: {
        title: '生活服务',
        apiNamespace: 'tocLifeServiceOrder',
        icon: 'el-icon-service',
        primaryLabel: '服务费用',
        primaryKey: 'serviceType',
        fields: [
          { key: 'userId', label: '用户编号', required: true },
          { key: 'serviceType', label: '服务类型', options: ['家政服务', '快递代收', '维修服务', '便民代办'], required: true },
          { key: 'amount', label: '服务费用', type: 'amount', required: true },
          { key: 'payTime', label: '支付时间', type: 'datetime' },
          { key: 'orderNo', label: '订单号' }
        ]
      }
    }
  }
}
</script>
