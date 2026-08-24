<template><LifeServiceBoard :config="config" /></template>
<script>
import LifeServiceBoard from './components/LifeServiceBoard.vue'
import { createTravelTicketConfig } from './components/lifeServiceConfigs'

export default {
  name: 'ToCTravelTicket',
  components: { LifeServiceBoard },
  data() {
    return {
      config: createTravelTicketConfig({ readOnly: true })
    }
  }
}
</script>
