<!-- 管理端租赁申请路由入口：以管理模式加载租赁申请共享页面。 -->
<template>
  <lease-application-page mode="admin" />
</template>

<script>
import LeaseApplicationPage from '@/features/service-hall/lease-application/LeaseApplicationPage'

export default {
  name: 'LeaseApplicationManage',
  components: { LeaseApplicationPage }
}
</script>
