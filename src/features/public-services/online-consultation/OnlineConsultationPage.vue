<!-- 在线咨询共享页面：根据 mode 切换用户提交和管理人员回复能力。 -->
<template>
  <public-service-board :config="config" :policy="policy" />
</template>

<script>
import PublicServiceBoard from '@/components/business/ApplicationBoard/PublicServiceBoard'
import { PUBLIC_SERVICE_POLICIES } from '../policies'
import { createOnlineConsultationConfig } from './definition'

export default {
  name: 'OnlineConsultationPage',
  components: { PublicServiceBoard },
  props: {
    mode: { type: String, default: 'user' }
  },
  computed: {
    config() {
      return createOnlineConsultationConfig({ replyMode: this.mode === 'admin' })
    },
    policy() {
      return this.mode === 'admin' ? PUBLIC_SERVICE_POLICIES.consultationAdmin : PUBLIC_SERVICE_POLICIES.consultationUser
    }
  }
}
</script>

<style lang="scss">
/* 详情抽屉挂载到 body，因此图标主题必须使用全局选择器。 */
.application-detail-drawer .hero-icon.online-consultation-detail-icon {
  background: #2f7cdf !important;
  color: #fff !important;
}

.application-detail-drawer .hero-icon.online-consultation-detail-icon > i {
  color: inherit;
}
</style>
