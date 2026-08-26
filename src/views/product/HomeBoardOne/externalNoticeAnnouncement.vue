<!-- 首页对外通知公告入口：固定加载 type 为 1 的对外公告。 -->
<template><notice-announcement :notice-type="1" /></template>

<script>
import NoticeAnnouncement from './noticeAnnouncement.vue'

export default {
  name: 'ExternalNoticeAnnouncement',
  components: { NoticeAnnouncement }
}
</script>
