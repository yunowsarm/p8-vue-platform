<!-- ToC 保险投保记录路由页面：使用通用内容组件维护用户投保信息。 -->
<template><LifeServiceBoard :config="config" /></template>
<script>
import LifeServiceBoard from '@/components/business/ContentBoard'
export default {
  name: 'ToCCarInsuranceInfo',
  components: { LifeServiceBoard },
  data() {
    return {
      config: {
        title: '保险投保记录',
        apiNamespace: 'tocCarInsuranceInfo',
        icon: 'el-icon-document-checked',
        primaryLabel: '保险编号',
        primaryKey: 'insuranceId',
        contentKey: 'carNo',
        contentLabel: '车牌号',
        timeKey: 'buyTime',
        defaultStatus: '待支付',
        statusOptions: ['待支付', '已支付', '已生效', '已取消'],
        fields: [
          { key: 'insuranceId', label: '保险编号', required: true },
          { key: 'userId', label: '用户编号', required: true },
          { key: 'carNo', label: '车牌号', required: true },
          { key: 'buyTime', label: '购买时间', type: 'datetime', required: true },
          { key: 'amount', label: '购买数量', type: 'number', required: true },
          { key: 'totalPrice', label: '总价（元）', type: 'amount', required: true }
        ]
      }
    }
  }
}
</script>
