<template><payment-order-board :config="config" /></template>
<script>
import PaymentOrderBoard from './components/PaymentOrderBoard.vue'
export default {
  name: 'ParkingPayment',
  components: { PaymentOrderBoard },
  data() {
    return {
      config: {
        title: '停车缴费',
        apiNamespace: 'tocParkingPayment',
        icon: 'el-icon-truck',
        primaryLabel: '停车费用',
        primaryKey: 'carNumber',
        fields: [
          { key: 'userId', label: '用户编号', required: true },
          { key: 'carNumber', label: '车牌号码', required: true },
          { key: 'parkingTime', label: '入场时间', type: 'datetime', required: true },
          { key: 'amount', label: '应付金额', type: 'amount', required: true },
          { key: 'payTime', label: '支付时间', type: 'datetime' },
          { key: 'orderNo', label: '订单号' }
        ]
      }
    }
  }
}
</script>
