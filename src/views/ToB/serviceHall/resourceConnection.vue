<template><service-application-board :config="config" /></template>

<script>
import ServiceApplicationBoard from './components/ServiceApplicationBoard'

export default {
  name: 'ResourceConnection',
  components: { ServiceApplicationBoard },
  data() {
    return {
      config: {
        title: '资源对接', icon: 'el-icon-connection', idPrefix: 'RC',
        primaryKey: 'resourceType', primaryLabel: '资源类型', timeKey: 'applyTime',
        contentKey: 'connectContent', contentLabel: '对接内容', defaultStatus: '待受理',
        fields: [
          { key: 'companyId', label: '企业 ID', required: true },
          { key: 'resourceType', label: '资源类型', required: true, options: ['技术资源', '人才资源', '金融资源', '市场资源', '场地资源'] },
          { key: 'resourceDesc', label: '资源描述', type: 'textarea', required: true },
          { key: 'connectTarget', label: '对接目标', required: true },
          { key: 'connectContent', label: '对接内容', type: 'textarea', required: true },
          { key: 'applyTime', label: '申请时间', type: 'datetime', required: true },
          { key: 'contactName', label: '联系人', required: true },
          { key: 'contactPhone', label: '联系电话', required: true },
          { key: 'remark', label: '备注', type: 'textarea' }
        ],
        records: []
      }
    }
  }
}
</script>
