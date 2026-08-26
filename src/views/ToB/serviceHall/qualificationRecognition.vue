<!-- ToB 资质认定路由入口：只装配资质认定独立业务组件。 -->
<template><qualification-recognition-page mode="user" /></template>

<script>
import QualificationRecognitionPage from '@/features/service-hall/qualification-recognition/QualificationRecognitionPage'

export default { name: 'QualificationRecognition', components: { QualificationRecognitionPage } }
</script>
