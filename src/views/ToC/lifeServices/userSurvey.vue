<template><LifeServiceBoard :config="config" /></template>
<script>
import LifeServiceBoard from './components/LifeServiceBoard.vue'
import { createUserSurveyConfig } from './components/lifeServiceConfigs'

export default {
  name: 'ToCUserSurvey',
  components: { LifeServiceBoard },
  data() {
    return {
      config: createUserSurveyConfig({ readOnly: true })
    }
  }
}
</script>
