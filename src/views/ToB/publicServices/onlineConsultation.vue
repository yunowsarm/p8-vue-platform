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
