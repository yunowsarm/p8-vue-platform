<template><LifeServiceBoard :config="config" /></template>
<script>
import LifeServiceBoard from './components/LifeServiceBoard.vue'
export default {
  name: 'ToCCarInsurance',
  components: { LifeServiceBoard },
  data() {
    return {
      config: {
        title: '汽车保险',
        apiNamespace: 'tocCarInsurance',
        icon: 'el-icon-umbrella',
        primaryLabel: '保险名称',
        primaryKey: 'insuranceName',
        contentKey: 'description',
        contentLabel: '保险说明',
        filterKey: 'insuranceType',
        defaultStatus: '在售',
        statusOptions: ['在售', '暂停销售', '已下架'],
        fields: [
          { key: 'insuranceName', label: '保险名称', required: true },
          { key: 'insuranceType', label: '保险类型', options: ['交强险', '商业险', '车损险', '第三者责任险'], required: true },
          { key: 'price', label: '价格（元）', type: 'amount', required: true },
          { key: 'description', label: '描述', type: 'textarea', required: true }
        ]
      }
    }
  }
}
</script>
