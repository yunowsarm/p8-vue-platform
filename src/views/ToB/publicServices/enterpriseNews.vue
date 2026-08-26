<!-- ToB 企业动态路由入口：只装配企业动态独立业务组件。 -->
<template><enterprise-news-page /></template>
<script>
import EnterpriseNewsPage from '@/features/public-services/enterprise-news/EnterpriseNewsPage'
export default { name: 'EnterpriseNews', components: { EnterpriseNewsPage } }
</script>
