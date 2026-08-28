<!-- 配套服务管理聚合页：统一维护资源信息并处理商机、会议室和设施租赁审核。 -->
<template>
  <main class="supporting-services-manage">
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
import BusinessOpportunityPage from './business-opportunity/BusinessOpportunityPage'
import FacilityRentalPage from './facility-rental/FacilityRentalPage'
import IndustryAssociationPage from './industry-association/IndustryAssociationPage'
import MeetingRoomBookingPage from './meeting-room-booking/MeetingRoomBookingPage'
import ServiceOrganizationPage from './service-organization/ServiceOrganizationPage'
import StartupMentorPage from './startup-mentor/StartupMentorPage'

const SUPPORTING_SERVICE_TABS = [
  { name: 'business-opportunity', label: '商机资源', icon: 'el-icon-share', component: BusinessOpportunityPage },
  { name: 'industry-association', label: '行业协会', icon: 'el-icon-connection', component: IndustryAssociationPage },
  { name: 'startup-mentor', label: '创业导师', icon: 'el-icon-user-solid', component: StartupMentorPage },
  { name: 'service-organization', label: '服务机构', icon: 'el-icon-office-building', component: ServiceOrganizationPage },
  { name: 'meeting-room-booking', label: '会议室预定', icon: 'el-icon-date', component: MeetingRoomBookingPage },
  { name: 'facility-rental', label: '设施设备租赁', icon: 'el-icon-setting', component: FacilityRentalPage }
]

export default {
  name: 'SupportingServicesManagePage',
  data() {
    return { activeTab: SUPPORTING_SERVICE_TABS[0].name, tabs: SUPPORTING_SERVICE_TABS }
  },
  computed: {
    activeItem() {
      return this.tabs.find((item) => item.name === this.activeTab) || this.tabs[0]
    }
  }
}
</script>

<style lang="scss" scoped>
.supporting-services-manage {
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
    padding: 0 12px;
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
  gap: 6px;

  i {
    font-size: 16px;
  }
}

@media (max-width: 900px) {
  .service-tabs {
    margin: 10px 8px 0;

    ::v-deep .el-tabs__header {
      overflow-x: auto;
    }

    ::v-deep .el-tabs__nav {
      min-width: 720px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .service-tabs ::v-deep .el-tabs__item {
    transition: none;
  }
}
</style>
