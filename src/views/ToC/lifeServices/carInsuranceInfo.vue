<!-- ToC 保险投保记录路由入口：只装配投保记录独立业务组件。 -->
<template><car-insurance-info-page /></template>
<script>
import CarInsuranceInfoPage from '@/features/life-services/car-insurance-info/CarInsuranceInfoPage'
export default { name: 'ToCCarInsuranceInfo', components: { CarInsuranceInfoPage } }
</script>
