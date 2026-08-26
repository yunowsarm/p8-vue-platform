<!-- ToB 租赁申请路由入口：以用户模式装配租赁申请独立业务组件。 -->
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
