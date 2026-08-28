<!-- ToC 租车服务路由入口：只装配租车服务独立业务组件。 -->
<template><car-rental-page mode="user" /></template>
<script>
import CarRentalPage from '@/features/life-services/car-rental/CarRentalPage'
export default { name: 'ToCCarRental', components: { CarRentalPage } }
</script>
