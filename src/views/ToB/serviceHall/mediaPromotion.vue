<!-- ToB 媒体宣传路由入口：只装配媒体宣传独立业务组件。 -->
<template><media-promotion-page mode="user" /></template>

<script>
import MediaPromotionPage from '@/features/service-hall/media-promotion/MediaPromotionPage'

export default { name: 'MediaPromotion', components: { MediaPromotionPage } }
</script>
