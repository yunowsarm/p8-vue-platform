<!-- 服务大厅管理聚合页：切换四个独立业务组件，服务需求统一归入诉求反馈。 -->
<template>
  <main class="service-hall-manage">
    <section class="manage-surface">
      <el-tabs v-model="activeTab" class="service-tabs" stretch>
        <el-tab-pane v-for="item in tabs" :key="item.name" :name="item.name">
          <span slot="label" class="service-tab-label">
            <i :class="item.icon" aria-hidden="true"></i>
            <span>{{ item.label }}</span>
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
  border-radius: 14px;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 8px 28px rgba(45, 67, 95, 0.06);
}
.service-tabs {
  margin: 18px 20px 0;
}
.service-tab-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}
.service-tab-label i {
  font-size: 16px;
}
.service-tabs ::v-deep .el-tabs__header {
  margin: 0 0 18px;
  padding: 6px;
  border: 1px solid #e7edf5;
  border-radius: 12px;
  background: #f5f8fc;
}
.service-tabs ::v-deep .el-tabs__nav-wrap::after,
.service-tabs ::v-deep .el-tabs__active-bar {
  display: none;
}
.service-tabs ::v-deep .el-tabs__item {
  height: 44px;
  padding: 0 14px;
  border-radius: 8px;
  color: #607087;
  font-weight: 500;
  line-height: 44px;
  transition: color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}
.service-tabs ::v-deep .el-tabs__item:hover {
  color: #2f7cdf;
  background: rgba(47, 124, 223, 0.06);
}
.service-tabs ::v-deep .el-tabs__item.is-active {
  color: #236dc9;
  background: #fff;
  box-shadow: 0 3px 12px rgba(47, 124, 223, 0.14);
}
.service-tabs ::v-deep .el-tabs__item:focus-visible {
  outline: 3px solid rgba(47, 124, 223, 0.28);
  outline-offset: 1px;
}
@media (max-width: 760px) {
  .service-hall-manage {
    padding: 8px;
  }
  .service-tabs {
    margin: 10px 8px 0;
  }
  .service-tabs ::v-deep .el-tabs__header {
    padding: 4px;
  }
  .service-tabs ::v-deep .el-tabs__item {
    height: 42px;
    padding: 0 6px;
    font-size: 13px;
    line-height: 42px;
  }
  .service-tab-label {
    gap: 4px;
  }
  .service-tab-label i {
    font-size: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .service-tabs ::v-deep .el-tabs__item {
    transition: none;
  }
}
</style>
