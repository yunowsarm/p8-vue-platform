<template><LifeServiceBoard :config="config" /></template>

<script>
//通知公告管理
import LifeServiceBoard from '../ToC/lifeServices/components/LifeServiceBoard.vue'
import { createPublicNoticeConfig } from '../ToC/lifeServices/components/publicNoticeConfig'

export default {
  name: 'ToOPublicNotice',
  components: { LifeServiceBoard },
  data() {
    return {
      config: createPublicNoticeConfig({ apiNamespace: 'tobPublicNotice', readOnly: false })
    }
  }
}
</script>
