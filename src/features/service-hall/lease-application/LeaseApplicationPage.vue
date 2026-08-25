<!-- 租赁申请共享页面：用户端和管理端复用同一业务定义，仅切换操作策略。 -->
<template>
  <application-board :config="config" :policy="policy" />
</template>

<script>
import ApplicationBoard from '@/components/business/ApplicationBoard'
import { getLeaseApplicationConfig } from './definition'
import { getLeaseApplicationPolicy } from './policies'

export default {
  name: 'LeaseApplicationPage',
  components: { ApplicationBoard },
  props: {
    mode: { type: String, default: 'user' }
  },
  computed: {
    config() {
      return getLeaseApplicationConfig(this.mode)
    },
    policy() {
      return getLeaseApplicationPolicy(this.mode)
    }
  }
}
</script>
