<!-- ToC 租车服务路由页面：使用通用内容组件展示车辆租赁服务。 -->
<template><LifeServiceBoard :config="config" /></template>
<script>
import LifeServiceBoard from '@/components/business/ContentBoard'
export default {
  name: 'ToCCarRental',
  components: { LifeServiceBoard },
  data() {
    return {
      config: {
        title: '租车服务',
        apiNamespace: 'tocCarRental',
        icon: 'el-icon-truck',
        primaryLabel: '车型',
        primaryKey: 'carType',
        contentKey: 'plateNo',
        contentLabel: '车牌号',
        defaultStatus: '可租',
        statusOptions: ['可租', '已租出', '维修中', '已下架'],
        fields: [
          { key: 'carType', label: '车型', options: ['轿车', 'SUV', '商务车', '新能源车'], required: true },
          { key: 'plateNo', label: '车牌号', required: true },
          { key: 'rentPrice', label: '租金（元/天）', type: 'amount', required: true }
        ]
      }
    }
  }
}
</script>
