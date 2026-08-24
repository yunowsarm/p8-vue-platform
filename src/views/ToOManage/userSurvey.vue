<template><LifeServiceBoard :config="config" /></template>

<script>
import LifeServiceBoard from '../ToC/lifeServices/components/LifeServiceBoard.vue'
import { createUserSurveyConfig } from '../ToC/lifeServices/components/lifeServiceConfigs'

export default {
  name: 'ToOUserSurvey',
  components: { LifeServiceBoard },
  data() {
    return { config: createUserSurveyConfig() }
  }
}
</script>
