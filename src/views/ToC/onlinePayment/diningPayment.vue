<template><payment-order-board :config="config" /></template>
<script>
import PaymentOrderBoard from './components/PaymentOrderBoard.vue'
export default {
  name: 'DiningPayment',
  components: { PaymentOrderBoard },
  data() {
    return {
      config: {
        title: '餐饮消费',
        apiNamespace: 'tocDiningPayment',
        icon: 'el-icon-food',
        primaryLabel: '消费金额',
        primaryKey: 'shopId',
        fields: [
          { key: 'userId', label: '用户编号', required: true },
          { key: 'shopId', label: '餐饮商户', required: true },
          { key: 'amount', label: '消费金额', type: 'amount', required: true },
          { key: 'payTime', label: '支付时间', type: 'datetime' },
          { key: 'orderNo', label: '订单号' }
        ]
      }
    }
  }
}
</script>
