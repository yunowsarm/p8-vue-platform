<template>
  <service-application-board :config="config" />
</template>

<script>
import ServiceApplicationBoard from './components/ServiceApplicationBoard'

export default {
  name: 'ComplaintSuggestion',
  components: { ServiceApplicationBoard },
  data() {
    return {
      config: {
        title: '建议投诉',
        icon: 'el-icon-chat-dot-round',
        idPrefix: 'SC',
        apiNamespace: 'feedbackComplaint',
        primaryKey: 'type',
        primaryLabel: '类型',
        timeKey: 'submitTime',
        contentKey: 'content',
        contentLabel: '内容',
        defaultStatus: '待回复',
        fields: [
          { key: 'companyId', label: '企业', required: true },
          { key: 'contactName', label: '联系人', required: true },
          { key: 'contactPhone', label: '联系电话', required: true },
          { key: 'type', label: '类型', type: 'select', required: true, options: ['建议', '投诉'] },
          { key: 'submitTime', label: '提交时间', type: 'datetime', required: true },
          { key: 'content', label: '内容', type: 'textarea', required: true },
          { key: 'reply', label: '回复内容', type: 'textarea', hideInCreateForm: true }
        ],
        records: []
      }
    }
  }
}
</script>
