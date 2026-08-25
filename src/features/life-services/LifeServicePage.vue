<!-- 生活服务共享页面：按 feature 和 mode 组合业务定义与终端操作策略。 -->
<template>
  <content-board :config="config" :policy="policy" />
</template>

<script>
import ContentBoard from '@/components/business/ContentBoard'
import { createTalentServiceConfig, createTravelTicketConfig, createUserSurveyConfig } from './definitions'
import { LIFE_SERVICE_POLICIES } from './policies'

const factories = Object.freeze({
  talentService: createTalentServiceConfig,
  travelTicket: createTravelTicketConfig,
  userSurvey: createUserSurveyConfig
})

export default {
  name: 'LifeServicePage',
  components: { ContentBoard },
  props: {
    feature: { type: String, required: true },
    mode: { type: String, default: 'user' }
  },
  computed: {
    config() {
      const factory = factories[this.feature]
      if (!factory) throw new Error(`未知生活服务功能：${this.feature}`)
      return factory({ readOnly: this.mode === 'readonly' })
    },
    policy() {
      return LIFE_SERVICE_POLICIES[this.mode] || LIFE_SERVICE_POLICIES.readonly
    }
  }
}
</script>
