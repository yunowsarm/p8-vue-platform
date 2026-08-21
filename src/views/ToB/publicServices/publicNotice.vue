<template>
  <LifeServiceBoard :config="config" />
</template>

<script>
import LifeServiceBoard from '../../ToC/lifeServices/components/LifeServiceBoard.vue'
import { createPublicNoticeConfig } from '../../ToC/lifeServices/components/publicNoticeConfig'

export default {
  name: 'ToBPublicNotice',
  components: { LifeServiceBoard },
  data() {
    return {
      config: createPublicNoticeConfig({ apiNamespace: 'tobPublicNotice' })
    }
  }
}
</script>
