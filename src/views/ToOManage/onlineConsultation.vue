<template><public-service-board :config="config" /></template>

<script>
import PublicServiceBoard from '../ToB/publicServices/components/PublicServiceBoard'
import { createOnlineConsultationConfig } from '../ToB/publicServices/components/onlineConsultationConfig'

export default {
  name: 'ToOOnlineConsultation',
  components: { PublicServiceBoard },
  data() {
    return { config: createOnlineConsultationConfig({ replyMode: true }) }
  }
}
</script>
