<!-- ToC 园区动态路由页面：使用通用内容组件展示园区动态。 -->
<template><LifeServiceBoard :config="config" /></template>
<script>
import LifeServiceBoard from '@/components/business/ContentBoard'
export default {
  name: 'ToCParkNews',
  components: { LifeServiceBoard },
  data() {
    return {
      config: {
        title: '园区动态',
        apiNamespace: 'tocParkNews',
        icon: 'el-icon-news',
        primaryLabel: '动态标题',
        primaryKey: 'title',
        contentKey: 'content',
        contentLabel: '动态内容',
        timeKey: 'publishTime',
        filterKey: 'type',
        defaultStatus: '已发布',
        statusOptions: ['草稿', '已发布', '已下线'],
        fields: [
          { key: 'title', label: '标题', required: true },
          { key: 'type', label: '类型', options: ['园区新闻', '运营动态', '建设进展', '服务动态'], required: true },
          { key: 'sceneType', label: '场景类型', options: ['园区通用', '企业服务', '公众展示'] },
          { key: 'content', label: '内容', type: 'textarea', required: true },
          { key: 'publisherId', label: '发布人编号', required: true },
          { key: 'publishTime', label: '发布时间', type: 'datetime', required: true }
        ]
      }
    }
  }
}
</script>
