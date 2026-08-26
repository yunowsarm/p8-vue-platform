<!-- ToC 园区动态路由入口：只装配公众端园区动态独立业务组件。 -->
<template><park-news-page /></template>
<script>
import ParkNewsPage from '@/features/life-services/park-news/ParkNewsPage'
export default { name: 'ToCParkNews', components: { ParkNewsPage } }
</script>
