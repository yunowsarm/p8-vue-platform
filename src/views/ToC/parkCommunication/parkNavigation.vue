<template><communication-board :config="config" /></template>
<script>
import CommunicationBoard from './components/CommunicationBoard.vue'
export default {
  name: 'ParkNavigation',
  components: { CommunicationBoard },
  data() {
    return {
      config: {
        title: '园区导航',
        apiNamespace: 'tocParkNavigation',
        icon: 'el-icon-location-information',
        primaryLabel: '地点名称',
        primaryKey: 'name',
        contentKey: 'description',
        contentLabel: '地点描述',
        filterKey: 'type',
        hasStatus: false,
        fields: [
          { key: 'name', label: '地点名称', required: true },
          { key: 'type', label: '类型', options: ['办公服务', '商业配套', '公共设施', '停车交通', '休闲运动'], required: true },
          { key: 'location', label: '坐标', required: true },
          { key: 'description', label: '描述', type: 'textarea', required: true }
        ]
      }
    }
  }
}
</script>
