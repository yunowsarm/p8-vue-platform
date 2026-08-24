<template>
  <public-service-board :config="config" />
</template>

<script>
import PublicServiceBoard from './components/PublicServiceBoard'
import { createDocumentDownloadConfig } from './components/documentDownloadConfig'

export default {
  name: 'DocumentDownload',
  components: { PublicServiceBoard },
  data() {
    return {
      // 企业端只可查阅资料，不提供新增、编辑或删除入口。
      config: createDocumentDownloadConfig({ readOnly: true })
    }
  }
}
</script>
