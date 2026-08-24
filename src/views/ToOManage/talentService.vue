<template><LifeServiceBoard :config="config" /></template>

<script>
import LifeServiceBoard from '../ToC/lifeServices/components/LifeServiceBoard.vue'
import { createTalentServiceConfig } from '../ToC/lifeServices/components/lifeServiceConfigs'

export default {
  name: 'ToOTalentService',
  components: { LifeServiceBoard },
  data() {
    return { config: createTalentServiceConfig() }
  }
}
</script>
