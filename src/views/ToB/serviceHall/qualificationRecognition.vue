<template><service-application-board :config="config" /></template>

<script>
import ServiceApplicationBoard from './components/ServiceApplicationBoard'

export default {
  name: 'QualificationRecognition',
  components: { ServiceApplicationBoard },
  data() {
    return {
      config: {
        title: '资质认定', icon: 'el-icon-medal', idPrefix: 'QR',
        primaryKey: 'qualificationType', primaryLabel: '资质类型', timeKey: 'applyTime',
        contentKey: 'applyReason', contentLabel: '申请原因', defaultStatus: '待审核',
        fields: [
          { key: 'companyId', label: '企业 ID', required: true },
          { key: 'qualificationType', label: '资质类型', required: true, options: ['高新技术企业', '专精特新企业', '科技型中小企业', '创新型中小企业'] },
          { key: 'applyTime', label: '申请时间', type: 'datetime', required: true },
          { key: 'contactName', label: '联系人', required: true },
          { key: 'contactPhone', label: '联系电话', required: true },
          { key: 'applyReason', label: '申请原因', type: 'textarea', required: true }
        ],
        records: []
      }
    }
  }
}
</script>
