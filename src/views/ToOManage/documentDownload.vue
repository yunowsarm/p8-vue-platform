<template>
  <public-service-board :config="config" />
</template>

<script>
import PublicServiceBoard from '../ToB/publicServices/components/PublicServiceBoard'
import { createDocumentDownloadConfig } from '../ToB/publicServices/components/documentDownloadConfig'

export default {
  name: 'ToODocumentDownload',
  components: { PublicServiceBoard },
  data() {
    return {
      // 管理端保留新增、编辑、删除及批量删除操作。
      config: createDocumentDownloadConfig({ readOnly: false })
    }
  }
}
</script>
