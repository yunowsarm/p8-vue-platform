<template><GovernmentServiceBoard :config="config" /></template>
<script>
import GovernmentServiceBoard from './components/GovernmentServiceBoard.vue'
export default {
  name: 'GovApproval',
  components: { GovernmentServiceBoard },
  data() {
    return {
      config: {
        title: '行政审批服务',
        apiNamespace: 'togGovApproval',
        icon: 'el-icon-s-check',
        primaryLabel: '审批类型',
        primaryKey: 'approvalType',
        typeLabel: '审批类型',
        typeOptions: ['行政许可', '备案登记', '事项确认', '其他审批'],
        timeKey: 'applyTime',
        statusKey: 'approveStatus',
        statusOptions: ['待受理', '已受理', '审批中', '已办结'],
        flow: ['提交申请', '受理', '审批', '办结'],
        fields: [
          { key: 'companyId', label: '企业ID', required: true },
          { key: 'approvalType', label: '审批类型', options: ['行政许可', '备案登记', '事项确认', '其他审批'], required: true },
          { key: 'applyTime', label: '申请时间', type: 'datetime', required: true },
          { key: 'contactName', label: '联系人', required: true },
          { key: 'contactPhone', label: '联系电话', required: true }
        ]
      }
    }
  }
}
</script>
