<!-- 服务大厅管理聚合页：以标签页复用六类申请定义和管理端操作策略。 -->
<template>
  <main class="service-hall-manage">
    <section class="manage-surface">
      <el-tabs v-model="activeTab" class="service-tabs" stretch>
        <el-tab-pane v-for="item in tabs" :key="item.name" :name="item.name">
          <span slot="label">
            <i :class="item.config.icon" aria-hidden="true"></i>
            {{ item.label }}
          </span>
        </el-tab-pane>
      </el-tabs>
      <application-board :key="activeItem.name" :config="activeItem.config" :policy="activeItem.policy" />
    </section>
  </main>
</template>

<script>
import ApplicationBoard from '@/components/business/ApplicationBoard'
import { getServiceHallConfig, SERVICE_HALL_TABS } from './definitions'
import { getServiceHallPolicy } from './policies'

export default {
  name: 'ServiceHallManagePage',
  components: { ApplicationBoard },
  data() {
    return { activeTab: SERVICE_HALL_TABS[0].name }
  },
  computed: {
    tabs() {
      return SERVICE_HALL_TABS.map((item) =>
        Object.assign({}, item, {
          config: getServiceHallConfig(item.feature, 'admin'),
          policy: getServiceHallPolicy(item.feature, 'admin')
        })
      )
    },
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
