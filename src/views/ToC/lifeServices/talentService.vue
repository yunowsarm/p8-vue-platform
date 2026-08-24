<template><LifeServiceBoard :config="config" /></template>
<script>
import LifeServiceBoard from './components/LifeServiceBoard.vue'
import { createTalentServiceConfig } from './components/lifeServiceConfigs'

export default {
  name: 'ToCTalentService',
  components: { LifeServiceBoard },
  data() {
    return {
      config: createTalentServiceConfig({ readOnly: true })
    }
  }
}
</script>
