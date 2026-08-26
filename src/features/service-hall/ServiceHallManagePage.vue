<!-- 服务大厅管理聚合页：切换四个独立业务组件，服务需求统一归入诉求反馈。 -->
<template>
  <main class="service-hall-manage">
    <section class="manage-surface">
      <el-tabs v-model="activeTab" class="service-tabs" stretch>
        <el-tab-pane v-for="item in tabs" :key="item.name" :name="item.name">
          <span slot="label">
            <i :class="item.icon" aria-hidden="true"></i>
            {{ item.label }}
          </span>
        </el-tab-pane>
      </el-tabs>
      <component :is="activeItem.component" :key="activeItem.name" mode="admin" />
    </section>
  </main>
</template>

<script>
import ComplaintSuggestionPage from './complaint-suggestion/ComplaintSuggestionPage'
import DataReportPage from './data-report/DataReportPage'
import QualificationRecognitionPage from './qualification-recognition/QualificationRecognitionPage'
import ResourceConnectionPage from './resource-connection/ResourceConnectionPage'

const SERVICE_TABS = [
  { name: 'complaint-suggestion', label: '诉求反馈', icon: 'el-icon-chat-dot-round', component: ComplaintSuggestionPage },
  { name: 'data-report', label: '数据上报', icon: 'el-icon-upload2', component: DataReportPage },
  { name: 'qualification-recognition', label: '资质认定', icon: 'el-icon-medal', component: QualificationRecognitionPage },
  { name: 'resource-connection', label: '资源对接', icon: 'el-icon-connection', component: ResourceConnectionPage }
]

export default {
  name: 'ServiceHallManagePage',
  data() {
    return { activeTab: SERVICE_TABS[0].name, tabs: SERVICE_TABS }
  },
  computed: {
    activeItem() {
      return this.tabs.find((item) => item.name === this.activeTab) || this.tabs[0]
    }
  }
}
</script>

<style scoped>
.service-hall-manage {
  min-height: 100%;
  padding: 12px;
  box-sizing: border-box;
  background: #f6f8fb;
}
.manage-surface {
  min-height: 660px;
  border: 1px solid #e5ebf2;
  border-radius: 10px;
  background: #fff;
  overflow: hidden;
}
.service-tabs {
  margin: 0 20px;
}
.service-tabs i {
  margin-right: 6px;
}
@media (max-width: 760px) {
  .service-hall-manage {
    padding: 8px;
  }
  .service-tabs {
    margin: 0 8px;
  }
}
</style>
