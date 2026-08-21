<template>
  <LifeServiceBoard :config="config" />
</template>

<script>
import LifeServiceBoard from '../../ToC/lifeServices/components/LifeServiceBoard.vue'

export default {
  name: 'ToBPublicNotice',
  components: { LifeServiceBoard },
  data() {
    return {
      config: {
        title: '通知公告',
        apiNamespace: 'tobPublicNotice',
        readOnly: true,
        publisherNameKey: 'createByName',
        hasStatus: false,
        icon: 'el-icon-bell',
        primaryLabel: '公告标题',
        primaryKey: 'title',
        contentKey: 'content',
        contentLabel: '公告内容',
        timeKey: 'publishTime',
        filterKey: 'sceneType',
        fields: [
          { key: 'title', label: '标题' },
          { key: 'sceneType', label: '场景类型', options: ['园区通用', '企业动态', '安全提醒', '活动通知'] },
          { key: 'content', label: '内容', type: 'textarea' },
          { key: 'createByName', label: '发布人' },
          { key: 'publishTime', label: '发布时间', type: 'datetime' }
        ]
      }
    }
  }
}
</script>
