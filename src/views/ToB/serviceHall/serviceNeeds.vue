<template><service-application-board :config="config" /></template>

<script>
import ServiceApplicationBoard from './components/ServiceApplicationBoard'

export default {
  name: 'ServiceNeeds',
  components: { ServiceApplicationBoard },
  data() {
    return {
      config: {
        title: '服务需求', icon: 'el-icon-service', idPrefix: 'SR',
        primaryKey: 'requestType', primaryLabel: '需求类型', timeKey: 'requestTime',
        contentKey: 'requestContent', contentLabel: '需求内容', defaultStatus: '待受理',
        fields: [
          { key: 'companyId', label: '企业 ID', required: true },
          { key: 'requestType', label: '需求类型', required: true, options: ['政务服务咨询', '企业运营服务', '人才与招聘服务', '政策申报服务', '场地与设施服务', '其他服务'] },
          { key: 'requestTime', label: '提交时间', type: 'datetime', required: true },
          { key: 'contactName', label: '联系人', required: true },
          { key: 'contactPhone', label: '联系电话', required: true },
          { key: 'requestContent', label: '需求内容', type: 'textarea', required: true },
          { key: 'remark', label: '备注', type: 'textarea' }
        ],
        records: []
      }
    }
  }
}
</script>
