<template><communication-board :config="config" /></template>
<script>
import CommunicationBoard from './components/CommunicationBoard.vue'
export default {
  name: 'HobbyChannel',
  components: { CommunicationBoard },
  data() {
    return {
      config: {
        title: '兴趣频道',
        apiNamespace: 'tocHobbyChannel',
        icon: 'el-icon-microphone',
        primaryLabel: '频道名称',
        primaryKey: 'name',
        contentKey: 'description',
        contentLabel: '频道描述',
        hasStatus: false,
        fields: [
          { key: 'name', label: '频道名称', required: true },
          { key: 'description', label: '描述', type: 'textarea', required: true }
        ]
      }
    }
  }
}
</script>
