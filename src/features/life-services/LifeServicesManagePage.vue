<!-- 园区服务管理聚合页：统一维护租车、问卷、班车和旅行门票信息。 -->
<template>
  <main class="life-services-manage">
    <section class="manage-surface">
      <el-tabs v-model="activeTab" class="service-tabs" stretch>
        <el-tab-pane v-for="item in tabs" :key="item.name" :name="item.name">
          <span slot="label" class="service-tab-label">
            <i :class="item.icon" aria-hidden="true"></i>
            <span>{{ item.label }}</span>
          </span>
        </el-tab-pane>
      </el-tabs>
      <component :is="activeItem.component" :key="activeItem.name" v-bind="activeItem.props" />
    </section>
  </main>
</template>

<script>
import CarRentalPage from './car-rental/CarRentalPage'
import ShuttleBusBoard from './shuttle-bus/ShuttleBusBoard'
import TravelTicketPage from './travel-ticket/TravelTicketPage'
import UserSurveyPage from './user-survey/UserSurveyPage'

const LIFE_SERVICE_TABS = [
  { name: 'car-rental', label: '租车服务', icon: 'el-icon-truck', component: CarRentalPage, props: { mode: 'admin' } },
  { name: 'user-survey', label: '问卷调查', icon: 'el-icon-document-checked', component: UserSurveyPage, props: { mode: 'admin' } },
  { name: 'shuttle-bus', label: '园区班车', icon: 'el-icon-guide', component: ShuttleBusBoard, props: { readOnly: false } },
  { name: 'travel-ticket', label: '旅行门票', icon: 'el-icon-picture-outline-round', component: TravelTicketPage, props: { mode: 'admin' } }
]

export default {
  name: 'LifeServicesManagePage',
  data() {
    return { activeTab: LIFE_SERVICE_TABS[0].name, tabs: LIFE_SERVICE_TABS }
  },
  computed: {
    activeItem() {
      return this.tabs.find((item) => item.name === this.activeTab) || this.tabs[0]
    }
  }
}
</script>

<style lang="scss" scoped>
.life-services-manage {
  min-height: 100%;
  padding: 12px;
  box-sizing: border-box;
  background: #f6f8fb;
}

.manage-surface {
  min-height: 660px;
  overflow: hidden;
  border: 1px solid #e5ebf2;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 8px 28px rgba(45, 67, 95, 0.06);
}

.service-tabs {
  margin: 18px 20px 0;

  ::v-deep .el-tabs__header {
    margin: 0 0 18px;
    padding: 6px;
    border: 1px solid #e7edf5;
    border-radius: 12px;
    background: #f5f8fc;
  }

  ::v-deep .el-tabs__nav-wrap::after,
  ::v-deep .el-tabs__active-bar {
    display: none;
  }

  ::v-deep .el-tabs__item {
    height: 44px;
    padding: 0 14px;
    border-radius: 8px;
    color: #607087;
    font-weight: 500;
    line-height: 44px;
    transition: color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
  }

  ::v-deep .el-tabs__item:hover {
    color: #2f7cdf;
    background: rgba(47, 124, 223, 0.06);
  }

  ::v-deep .el-tabs__item.is-active {
    color: #236dc9;
    background: #fff;
    box-shadow: 0 3px 12px rgba(47, 124, 223, 0.14);
  }

  ::v-deep .el-tabs__item:focus-visible {
    outline: 3px solid rgba(47, 124, 223, 0.28);
    outline-offset: 1px;
  }
}

.service-tab-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;

  i {
    font-size: 16px;
  }
}

@media (max-width: 760px) {
  .life-services-manage {
    padding: 8px;
  }

  .service-tabs {
    margin: 10px 8px 0;

    ::v-deep .el-tabs__item {
      padding: 0 7px;
      font-size: 13px;
    }
  }

  .service-tab-label {
    gap: 4px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .service-tabs ::v-deep .el-tabs__item {
    transition: none;
  }
}
</style>
