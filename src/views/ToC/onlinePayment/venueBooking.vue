<template><payment-order-board :config="config" /></template>
<script>
import PaymentOrderBoard from './components/PaymentOrderBoard.vue'
export default {
  name: 'VenueBooking',
  components: { PaymentOrderBoard },
  data() {
    return {
      config: {
        title: '场地预定',
        apiNamespace: 'tocVenueBooking',
        icon: 'el-icon-date',
        primaryLabel: '预定费用',
        primaryKey: 'venueId',
        fields: [
          { key: 'userId', label: '用户编号', required: true },
          { key: 'venueId', label: '场地编号', required: true },
          { key: 'bookDate', label: '预定日期', type: 'date', required: true },
          { key: 'startTime', label: '开始时间', type: 'datetime', required: true },
          { key: 'endTime', label: '结束时间', type: 'datetime', required: true },
          { key: 'amount', label: '预定费用', type: 'amount', required: true },
          { key: 'payTime', label: '支付时间', type: 'datetime' },
          { key: 'orderNo', label: '订单号' }
        ]
      }
    }
  }
}
</script>
