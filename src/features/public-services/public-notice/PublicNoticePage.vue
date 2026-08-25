<!-- 通知公告共享页面：通过 mode 和 apiNamespace 适配企业端、个人端及管理端。 -->
<template>
  <content-board :config="config" :policy="policy" />
</template>

<script>
import ContentBoard from '@/components/business/ContentBoard'
import { PUBLIC_SERVICE_POLICIES } from '../policies'
import { createPublicNoticeConfig } from './definition'

export default {
  name: 'PublicNoticePage',
  components: { ContentBoard },
  props: {
    mode: { type: String, default: 'viewer' },
    apiNamespace: { type: String, required: true }
  },
  computed: {
    config() {
      return createPublicNoticeConfig({ apiNamespace: this.apiNamespace, readOnly: this.mode !== 'admin' })
    },
    policy() {
      return this.mode === 'admin' ? PUBLIC_SERVICE_POLICIES.editor : PUBLIC_SERVICE_POLICIES.viewer
    }
  }
}
</script>
