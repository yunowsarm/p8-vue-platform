<template><public-service-board :config="config" /></template>
<script>
import PublicServiceBoard from './components/PublicServiceBoard'
import { createOnlineConsultationConfig } from './components/onlineConsultationConfig'

export default {
  name: 'OnlineConsultation',
  components: { PublicServiceBoard },
  data() {
    return {
      config: createOnlineConsultationConfig()
    }
  }
}
</script>

<style lang="scss">
/* 抽屉会挂载到 body，使用全局选择器确保详情头图标样式生效。 */
.application-detail-drawer .hero-icon.online-consultation-detail-icon {
  background: #2f7cdf !important;
  color: #fff !important;
}

.application-detail-drawer .hero-icon.online-consultation-detail-icon > i {
  color: inherit;
}
</style>
