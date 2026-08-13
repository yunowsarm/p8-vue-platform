<template><payment-order-board :config="config" /></template>
<script>
import PaymentOrderBoard from './components/PaymentOrderBoard.vue'
export default {
  name: 'AccountRecharge',
  components: { PaymentOrderBoard },
  data() {
    return {
      config: {
        title: '在线充值',
        apiNamespace: 'tocAccountRecharge',
        icon: 'el-icon-wallet',
        primaryLabel: '充值金额',
        primaryKey: 'payMethod',
        fields: [
          { key: 'userId', label: '用户编号', required: true },
          { key: 'amount', label: '充值金额', type: 'amount', required: true },
          { key: 'rechargeTime', label: '充值时间', type: 'datetime', required: true },
          { key: 'orderNo', label: '订单号' },
          { key: 'payMethod', label: '支付方式', options: ['微信支付', '支付宝', '银行卡', '余额支付'], required: true }
        ]
      }
    }
  }
}
</script>
