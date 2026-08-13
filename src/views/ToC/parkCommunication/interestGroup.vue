<template><communication-board :config="config" /></template>
<script>
import CommunicationBoard from './components/CommunicationBoard.vue'
export default {
  name: 'InterestGroup',
  components: { CommunicationBoard },
  data() {
    return {
      config: {
        title: '园区圈子',
        apiNamespace: 'tocInterestGroup',
        icon: 'el-icon-connection',
        primaryLabel: '圈子名称',
        primaryKey: 'name',
        contentKey: 'description',
        contentLabel: '圈子描述',
        hasStatus: true,
        defaultStatus: '正常',
        fields: [
          { key: 'name', label: '圈子名称', required: true },
          { key: 'description', label: '描述', type: 'textarea', required: true }
        ]
      }
    }
  }
}
</script>
