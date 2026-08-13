<template><LifeServiceBoard :config="config" /></template>
<script>
import LifeServiceBoard from './components/LifeServiceBoard.vue'
export default {
  name: 'ToCTravelTicket',
  components: { LifeServiceBoard },
  data() {
    return {
      config: {
        title: '旅行门票',
        apiNamespace: 'tocTravelTicket',
        icon: 'el-icon-picture-outline-round',
        primaryLabel: '景点名称',
        primaryKey: 'scenicName',
        contentKey: 'description',
        contentLabel: '门票说明',
        filterKey: 'ticketType',
        defaultStatus: '在售',
        statusOptions: ['在售', '售罄', '已下架'],
        fields: [
          { key: 'scenicName', label: '景点名称', required: true },
          { key: 'ticketType', label: '门票类型', options: ['成人票', '儿童票', '学生票', '团体票'], required: true },
          { key: 'price', label: '价格（元）', type: 'amount', required: true },
          { key: 'discount', label: '折扣', required: true },
          { key: 'description', label: '描述', type: 'textarea', required: true }
        ]
      }
    }
  }
}
</script>
