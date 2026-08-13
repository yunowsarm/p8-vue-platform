<template><communication-board :config="config" /></template>
<script>
import CommunicationBoard from './components/CommunicationBoard.vue'
export default {
  name: 'TopicDiscussion',
  components: { CommunicationBoard },
  data() {
    return {
      config: {
        title: '园区话题',
        apiNamespace: 'tocTopicDiscussion',
        icon: 'el-icon-chat-dot-round',
        primaryLabel: '话题标题',
        primaryKey: 'title',
        contentKey: 'content',
        contentLabel: '话题内容',
        timeKey: 'publishTime',
        defaultStatus: '待审核',
        counterFields: [
          { key: 'viewCount', icon: 'el-icon-view' },
          { key: 'replyCount', icon: 'el-icon-chat-line-round' }
        ],
        fields: [
          { key: 'userId', label: '发布人编号', required: true },
          { key: 'title', label: '标题', required: true },
          { key: 'publishTime', label: '发布时间', type: 'datetime', required: true },
          { key: 'content', label: '内容', type: 'textarea', required: true },
          { key: 'viewCount', label: '查看次数' },
          { key: 'replyCount', label: '回复次数' }
        ]
      }
    }
  }
}
</script>
