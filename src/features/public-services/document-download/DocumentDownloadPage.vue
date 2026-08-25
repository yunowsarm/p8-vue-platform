<!-- 资料下载共享页面：用户端只读查看，管理端启用内容维护操作。 -->
<template>
  <public-service-board :config="config" :policy="policy" />
</template>

<script>
import PublicServiceBoard from '@/components/business/ApplicationBoard/PublicServiceBoard'
import { PUBLIC_SERVICE_POLICIES } from '../policies'
import { createDocumentDownloadConfig } from './definition'

export default {
  name: 'DocumentDownloadPage',
  components: { PublicServiceBoard },
  props: {
    mode: { type: String, default: 'viewer' }
  },
  computed: {
    config() {
      return createDocumentDownloadConfig({ readOnly: this.mode !== 'admin' })
    },
    policy() {
      return this.mode === 'admin' ? PUBLIC_SERVICE_POLICIES.editor : PUBLIC_SERVICE_POLICIES.viewer
    }
  }
}
</script>
