<!-- ToB 资料下载路由入口：以查看模式装配资料下载独立业务组件。 -->
<template><document-download-page mode="viewer" /></template>

<script>
import DocumentDownloadPage from '@/features/public-services/document-download/DocumentDownloadPage'

export default { name: 'DocumentDownload', components: { DocumentDownloadPage } }
</script>
