<!-- 服务大厅单业务共享页面：组合指定业务定义、终端模式和配置覆盖项。 -->
<template>
  <application-board :config="config" :policy="policy" />
</template>

<script>
import ApplicationBoard from '@/components/business/ApplicationBoard'
import { getServiceHallConfig } from './definitions'
import { getServiceHallPolicy, mergeActionPolicy } from './policies'

export default {
  name: 'ServiceApplicationPage',
  components: { ApplicationBoard },
  props: {
    feature: { type: String, required: true },
    mode: { type: String, default: 'user' },
    configOverrides: { type: Object, default: () => ({}) },
    policyOverrides: { type: Object, default: () => ({}) }
  },
  computed: {
    config() {
      return getServiceHallConfig(this.feature, this.mode, this.configOverrides)
    },
    policy() {
      return mergeActionPolicy(getServiceHallPolicy(this.feature, this.mode), this.policyOverrides)
    }
  }
}
</script>
