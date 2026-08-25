<!-- ToB 租赁申请路由入口：以用户模式加载租赁申请共享页面。 -->
<template>
  <lease-application-page mode="user" />
</template>

<script>
import LeaseApplicationPage from '@/features/service-hall/lease-application/LeaseApplicationPage'

export default {
  name: 'LeaseApplication',
  components: { LeaseApplicationPage }
}
</script>
