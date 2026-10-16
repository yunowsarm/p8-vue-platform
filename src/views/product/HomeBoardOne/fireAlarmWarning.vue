<template>
  <section v-loading="loading" class="home-fire-reminders" aria-label="消防维保到期提醒" element-loading-text="正在加载到期提醒">
    <div v-if="error" class="home-fire-reminders__error" role="alert">
      <span>{{ error }}</span>
      <el-button type="text" :disabled="loading" @click="loadWarnings">重新加载</el-button>
    </div>
    <reminder-list v-else :reminders="reminders" :page-size="pageSize" active @size-change="pageSize = $event" @view-plan="viewPlan" />
  </section>
</template>

<script>
import ReminderList from '@/views/smartIOT/security/fireAlarm/ReminderList.vue'
import { loadMaintenanceCollection, normalizeMaintenanceData, buildMaintenanceReminders } from '@/service/maintenance'

export default {
  name: 'FireAlarmWarning',
  components: { ReminderList },
  data() {
    return { loading: false, error: '', devices: [], plans: [], pageSize: 10 }
  },
  computed: {
    reminders() {
      return buildMaintenanceReminders(this.plans, this.devices)
    }
  },
  created() {
    this.loadWarnings()
  },
  methods: {
    async loadWarnings() {
      if (this.loading) return
      this.loading = true
      this.error = ''
      try {
        // 与fireAlarm.vue一致，完整关联设备、类型、计划和登记记录后计算到期提醒。
        const collections = await Promise.all(['deviceType', 'device', 'plan', 'record'].map((resource) => loadMaintenanceCollection(this.$api, resource)))
        const data = normalizeMaintenanceData(...collections)
        this.devices = data.devices
        this.plans = data.plans
      } catch (error) {
        this.error = error.message || '到期提醒加载失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    viewPlan(planId) {
      if (!planId) return
      return this.$router.push({ path: '/fireAlarm1', query: { planId: String(planId) } })
    }
  }
}
</script>

<style lang="scss" scoped>
.home-fire-reminders {
  height: 100%;
  min-height: 320px;
  padding: 0 14px;
  box-sizing: border-box;
  color: #33465e;
  background: #fff;
  border: 1px solid #e7edf5;
  border-radius: 7px;
}
.home-fire-reminders__error {
  display: flex;
  min-height: 160px;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #909399;
  font-size: 13px;
}
.home-fire-reminders ::v-deep {
  .maintenance-list {
    display: flex;
    height: 100%;
    min-height: 320px;
    flex-direction: column;
  }
  .toolbar,
  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .toolbar {
    min-height: 58px;
    flex-shrink: 0;
    padding: 8px 0;
    box-sizing: border-box;
  }
  .toolbar .el-input {
    max-width: 100%;
  }
  .maintenance-table-area {
    display: flex;
    min-height: 0;
    flex: 1;
    padding-bottom: 12px;
  }
  .maintenance-table-area > .el-table {
    min-height: 0;
    flex: 1;
  }
  .el-table th {
    color: #24364d;
    background: #f5f8f8;
  }
  .el-table__fixed::before,
  .el-table__fixed-right::before {
    display: none;
  }
  .pagination-row {
    display: flex;
    min-height: 64px;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 0;
    box-sizing: border-box;
    border-top: 1px solid #e7edf5;
    flex-wrap: wrap;
  }
  .pagination-summary {
    display: flex;
    align-items: center;
    gap: 16px;
    color: #8996a9;
    font-size: 12px;
    white-space: nowrap;
  }
  .pagination-summary b {
    margin: 0 3px;
    color: #33465e;
  }
  .el-pagination {
    max-width: 100%;
    overflow-x: auto;
  }
  .urgency-mark {
    display: inline-flex;
    align-items: center;
    color: #d38520;
    font-size: 11px;
    white-space: nowrap;
  }
  .urgency-mark i {
    width: 6px;
    height: 6px;
    margin-right: 5px;
    background: currentColor;
    border-radius: 50%;
  }
  .urgency-mark.danger {
    color: #db414a;
  }
  .urgency-mark.today {
    color: #d77b17;
  }
}
</style>
