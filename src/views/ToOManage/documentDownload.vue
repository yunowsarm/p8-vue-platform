<!-- 管理端资料下载路由入口：以管理模式加载资料维护共享页面。 -->
<template><document-download-page mode="admin" /></template>

<script>
import DocumentDownloadPage from '@/features/public-services/document-download/DocumentDownloadPage'

export default { name: 'ToODocumentDownload', components: { DocumentDownloadPage } }
</script>
