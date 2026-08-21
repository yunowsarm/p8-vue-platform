<template><lost-found-board :config="config" /></template>
<script>
import LostFoundBoard from './components/LostFoundBoard.vue'
export default {
  name: 'LostFound',
  components: { LostFoundBoard },
  data() {
    return {
      config: {
        title: '失物招领',
        apiNamespace: 'tocLostFound',
        primaryLabel: '物品标题',
        primaryKey: 'title',
        contentKey: 'content',
        contentLabel: '物品说明',
        timeKey: 'publishTime',
        currentUserIdKey: 'userId',
        filterKey: 'type',
        showMineFilter: true,
        canAdvanceStatus: true,
        uploadField: 'uploadFiles',
        uploadResponseField: 'uploadFiles',
        uploadLabel: '附件',
        uploadLimit: 9,
        uploadTip: '单个附件不超过 10MB，最多上传 9 个。',
        // 状态随发布类型变化：失物招领等待失主认领，寻物启事等待失主确认已找到。
        typeStatusOptions: {
          失物招领: ['待认领', '已认领'],
          寻物启事: ['寻找中', '已找到']
        },
        fields: [
          { key: 'userId', label: '发布人编号', required: true, hidden: true },
          { key: 'userName', label: '发布人', hidden: true, responseOnly: true },
          { key: 'type', label: '类型', options: ['失物招领', '寻物启事'], required: true },
          { key: 'title', label: '标题', required: true },
          { key: 'content', label: '内容', type: 'textarea', required: true },
          { key: 'contact', label: '联系方式', required: true },
          { key: 'publishTime', label: '发布时间', type: 'datetime', required: true, hidden: true, autoNow: true }
        ]
      }
    }
  }
}
</script>
