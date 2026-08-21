<template><LifeServiceBoard :config="config" /></template>
<script>
import LifeServiceBoard from './components/LifeServiceBoard.vue'
import { createPublicNoticeConfig } from './components/publicNoticeConfig'

export default {
  name: 'ToCPublicNotice',
  components: { LifeServiceBoard },
  props: {
    apiNamespace: { type: String, default: 'tocPublicNotice' }
  },
  data() {
    return {
      config: createPublicNoticeConfig({ apiNamespace: this.apiNamespace })
    }
  }
}
</script>
