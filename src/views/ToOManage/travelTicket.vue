<template><LifeServiceBoard :config="config" /></template>

<script>
import LifeServiceBoard from '../ToC/lifeServices/components/LifeServiceBoard.vue'
import { createTravelTicketConfig } from '../ToC/lifeServices/components/lifeServiceConfigs'

export default {
  name: 'ToOTravelTicket',
  components: { LifeServiceBoard },
  data() {
    return { config: createTravelTicketConfig() }
  }
}
</script>
