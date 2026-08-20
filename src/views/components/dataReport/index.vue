<template><data-report-board :config="config" /></template>

<script>
import DataReportBoard from '../../ToB/serviceHall/components/DataReportBoard'

export default {
  name: 'DataReportView',
  components: { DataReportBoard },
  data() {
    return {
      config: {
        title: '数据上报查看',
        icon: 'el-icon-upload2',
        idPrefix: 'DR',
        readOnly: true,
        listParams: { type: 1 },
        primaryKey: 'reportType',
        primaryLabel: '上传分类',
        timeKey: 'reportTime',
        contentKey: 'reportContent',
        contentLabel: '上报内容',
        uploadField: 'uploadFiles',
        uploadResponseField: 'uploadFiles',
        summaryDefinitions: [
          { title: '全部数据上报', all: true, note: '企业数据统一归集', icon: 'el-icon-document', color: 'blue' },
          { title: '知识产权', category: '知识产权', note: '知识产权相关材料', icon: 'el-icon-collection', color: 'orange' },
          { title: '财务数据', category: '财务数据', note: '企业财务相关材料', icon: 'el-icon-money', color: 'cyan' },
          { title: '员工数据', category: '员工数据', note: '企业员工相关材料', icon: 'el-icon-user', color: 'green' }
        ],
        fields: [
          { key: 'companyId', label: '企业 ID', required: true },
          { key: 'reportType', label: '上传分类', options: ['知识产权', '财务数据', '员工数据'], required: true },
          { key: 'reportTime', label: '上报时间', type: 'datetime', required: true },
          { key: 'reportContent', label: '上报内容', type: 'textarea', required: true }
        ]
      }
    }
  }
}
</script>
