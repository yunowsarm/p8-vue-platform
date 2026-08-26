<!-- ToB 园区动态路由入口：只装配园区动态独立业务组件。 -->
<template><park-news-page /></template>
<script>
import ParkNewsPage from '@/features/public-services/park-news/ParkNewsPage'
export default { name: 'ParkNews', components: { ParkNewsPage } }
</script>
