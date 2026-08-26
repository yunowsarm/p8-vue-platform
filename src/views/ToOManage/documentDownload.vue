<!-- 管理端资料下载路由入口：以管理模式装配资料下载独立业务组件。 -->
<template><document-download-page mode="admin" /></template>

<script>
import DocumentDownloadPage from '@/features/public-services/document-download/DocumentDownloadPage'

export default { name: 'ToODocumentDownload', components: { DocumentDownloadPage } }
</script>
