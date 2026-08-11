<template><service-application-board :config="config" /></template>

<script>
import ServiceApplicationBoard from './components/ServiceApplicationBoard'

export default {
  name: 'MediaPromotion',
  components: { ServiceApplicationBoard },
  data() {
    return {
      config: {
        title: '媒体宣传', icon: 'el-icon-picture-outline', idPrefix: 'MP',
        primaryKey: 'promotionChannel', primaryLabel: '宣传渠道', timeKey: 'applyTime',
        contentKey: 'promotionContent', contentLabel: '宣传内容', defaultStatus: '待审核',
        fields: [
          { key: 'companyId', label: '企业 ID', required: true },
          { key: 'promotionChannel', label: '宣传渠道', required: true, options: ['园区公众号', '园区官网', '媒体专栏', '线下活动'] },
          { key: 'applyTime', label: '申请时间', type: 'datetime', required: true },
          { key: 'contactName', label: '联系人', required: true },
          { key: 'contactPhone', label: '联系电话', required: true },
          { key: 'promotionContent', label: '宣传内容', type: 'textarea', required: true }
        ],
        records: []
      }
    }
  }
}
</script>
