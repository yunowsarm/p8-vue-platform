<template>
  <section class="overview-grid" tabindex="-1">
    <article class="surface category-panel">
      <div class="surface-head">
        <div>
          <h3>
            <i class="el-icon-pie-chart"></i>
            设备类型与计划覆盖
          </h3>
          <p>已安排计划设备 / 台账设备总数</p>
        </div>
        <span class="head-note">共 {{ categoryStats.length }} 类</span>
      </div>
      <div class="category-list">
        <el-empty v-if="!categoryStats.length" description="暂无设备类型" :image-size="64" />
        <div v-for="item in categoryStats" :key="item.name" class="category-row">
          <div class="category-meta">
            <span>
              <i :style="{ background: item.color }"></i>
              {{ item.name }}
            </span>
            <b>{{ item.maintained }}/{{ item.total }}</b>
          </div>
          <div class="category-progress"><i :style="{ width: (item.total ? Math.round((item.maintained / item.total) * 100) : 0) + '%', background: item.color }"></i></div>
        </div>
      </div>
    </article>

    <article class="surface progress-panel">
      <div class="surface-head">
        <div>
          <h3>
            <i class="el-icon-data-line"></i>
            本月维保进度
          </h3>
          <p>计划 {{ monthProgress.total }} 台次，已完成 {{ monthProgress.completed }} 台次</p>
        </div>
        <el-button type="text" size="mini" @click="$emit('navigate', 'plans')">
          进入计划管理
          <i class="el-icon-arrow-right"></i>
        </el-button>
      </div>
      <div class="progress-layout">
        <div class="progress-ring" :style="{ background: 'conic-gradient(' + progressColor + ' ' + monthProgress.percent + '%, #edf1f5 0)' }">
          <div>
            <strong :style="{ color: progressColor }">{{ monthProgress.percent }}%</strong>
            <span>本月完成率</span>
          </div>
        </div>
        <div class="progress-stats">
          <div>
            <span>
              <i class="dot completed"></i>
              已完成
            </span>
            <strong>
              {{ monthProgress.completed }}
              <small>次</small>
            </strong>
          </div>
          <div>
            <span>
              <i class="dot pending"></i>
              待执行
            </span>
            <strong>
              {{ monthProgress.total - monthProgress.completed }}
              <small>次</small>
            </strong>
          </div>
          <div>
            <span>
              <i class="dot overdue"></i>
              逾期任务
            </span>
            <strong>
              {{ reminders.filter((item) => item.overdueDays > 0).length }}
              <small>次</small>
            </strong>
          </div>
        </div>
      </div>
      <div class="month-summary">
        <span>
          本月计划
          <b>{{ monthProgress.plans }} 项</b>
        </span>
        <span>
          待安排设备
          <b>{{ unplannedCount }} 台</b>
        </span>
        <span>
          维保记录
          <b>{{ recordCount }} 条</b>
        </span>
      </div>
    </article>

    <article class="surface reminder-panel">
      <div class="surface-head">
        <div>
          <h3>
            <i class="el-icon-alarm-clock"></i>
            近期维保提醒
          </h3>
          <p>按到期紧急程度自动排序</p>
        </div>
        <el-button type="text" size="mini" @click="$emit('navigate', 'reminders')">
          进入提醒管理
          <i class="el-icon-arrow-right"></i>
        </el-button>
      </div>
      <div class="reminder-list">
        <button v-for="item in reminders.slice(0, 5)" :key="item.id" type="button" class="reminder-item" @click="$emit('view-plan', item.planId)">
          <span :class="['date-box', item.overdueDays > 0 ? 'overdue' : item.overdueDays === 0 ? 'today' : 'upcoming']">
            <b>{{ item.dueDate.slice(8) }}</b>
            <small>{{ item.dueDate.slice(5, 7) }}月</small>
          </span>
          <span class="reminder-info">
            <b>{{ item.device }}</b>
            <small>{{ item.location }}</small>
          </span>
          <span :class="['reminder-status', item.overdueDays >= 0 ? 'danger' : 'warning']">{{ item.status }}</span>
        </button>
        <el-empty v-if="!reminders.length" description="暂无到期维保任务" :image-size="72" />
      </div>
    </article>
  </section>
</template>

<script>
export default {
  name: 'MaintenanceOverview',
  props: {
    categoryStats: { type: Array, required: true },
    monthProgress: { type: Object, required: true },
    reminders: { type: Array, required: true },
    unplannedCount: { type: Number, required: true },
    recordCount: { type: Number, required: true }
  },
  computed: {
    progressColor() {
      const percent = Number(this.monthProgress.percent) || 0
      return percent >= 100 ? '#20a77a' : percent >= 60 ? '#337dd5' : percent >= 30 ? '#e6a23c' : '#f05065'
    }
  }
}
</script>

<style lang="scss">
.fire-maintenance-page .overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr) minmax(0, 1.3fr);
  flex: 1;
  min-height: 0;
  align-items: stretch;
  gap: 12px;
  margin-bottom: 0;
}

.fire-maintenance-page .overview-grid > .surface {
  display: flex;
  min-height: 0;
  flex-direction: column;
  overflow: auto;
}

.fire-maintenance-page .surface {
  min-width: 0;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 7px;
  box-shadow: 0 2px 9px rgba(30, 49, 79, 0.035);
}

.fire-maintenance-page .surface-head {
  display: flex;
  min-height: 58px;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 9px 14px;
  border-bottom: 1px solid #edf1f5;
}

.fire-maintenance-page .surface-head h3,
.fire-maintenance-page .surface-head p {
  margin: 0;
}

.fire-maintenance-page .surface-head h3 {
  color: #26364d;
  font-size: 13px;
}

.fire-maintenance-page .surface-head h3 i {
  margin-right: 6px;
  color: var(--primary);
}

.fire-maintenance-page .surface-head p {
  margin-top: 3px;
  color: #98a2b2;
  font-size: 10px;
}

.fire-maintenance-page .head-note {
  color: #8996a9;
  font-size: 10px;
}

.fire-maintenance-page .category-list {
  display: flex;
  min-height: 0;
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: space-evenly;
  padding: 16px 16px 18px;
}

.fire-maintenance-page .category-row {
  margin-bottom: 12px;
}

.fire-maintenance-page .category-row:last-child {
  margin-bottom: 0;
}

.fire-maintenance-page .category-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #5c6a7f;
  font-size: 13px;
  line-height: 20px;
}

.fire-maintenance-page .category-meta span {
  display: flex;
  align-items: center;
}

.fire-maintenance-page .category-meta i {
  width: 8px;
  height: 8px;
  margin-right: 8px;
  border-radius: 2px;
}

.fire-maintenance-page .category-meta b {
  color: #34445c;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.fire-maintenance-page .category-progress {
  height: 8px;
  overflow: hidden;
  background: #edf1f5;
  border-radius: 4px;
}

.fire-maintenance-page .category-progress i {
  display: block;
  height: 100%;
  border-radius: 3px;
}

.fire-maintenance-page .progress-layout {
  display: flex;
  min-height: 260px;
  flex: 1 0 auto;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.fire-maintenance-page .progress-ring {
  position: relative;
  display: flex;
  width: 160px;
  height: 160px;
  flex: 0 0 160px;
  align-items: center;
  justify-content: center;
  background: conic-gradient(#2f78d7 0 81.3%, #e8eef6 81.3% 100%);
  border-radius: 50%;
  box-shadow: 0 12px 28px rgba(47, 120, 215, 0.13);
}

.fire-maintenance-page .progress-ring::before {
  position: absolute;
  width: 124px;
  height: 124px;
  background: #fff;
  border-radius: 50%;
  content: '';
}

.fire-maintenance-page .progress-ring div {
  position: relative;
  z-index: 1;
  text-align: center;
}

.fire-maintenance-page .progress-ring strong,
.fire-maintenance-page .progress-ring span {
  display: block;
}

.fire-maintenance-page .progress-ring strong {
  color: #254267;
  font-size: 34px;
  line-height: 42px;
  font-variant-numeric: tabular-nums;
}

.fire-maintenance-page .progress-ring span {
  margin-top: 4px;
  color: #8b97a9;
  font-size: 12px;
  line-height: 18px;
}

.fire-maintenance-page .progress-stats {
  display: grid;
  width: 100%;
  order: -1;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.fire-maintenance-page .progress-stats > div {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  margin: 0;
  padding: 0 8px;
  color: #68768a;
  font-size: 13px;
  line-height: 20px;
  border-right: 1px solid #edf1f6;
}

.fire-maintenance-page .progress-stats > div:last-child {
  border-right: 0;
}

.fire-maintenance-page .progress-stats strong {
  color: #2a3d58;
  font-size: 22px;
  line-height: 28px;
  font-variant-numeric: tabular-nums;
}

.fire-maintenance-page .progress-stats small {
  margin-left: 4px;
  color: #8a96a8;
  font-size: 12px;
  font-weight: 400;
}

.fire-maintenance-page .dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 7px;
  border-radius: 50%;
}

.fire-maintenance-page .dot.completed {
  background: #2f78d7;
}

.fire-maintenance-page .dot.pending {
  background: #b7c3d1;
}

.fire-maintenance-page .dot.overdue {
  background: #e4545c;
}

.fire-maintenance-page .month-summary {
  display: grid;
  flex-shrink: 0;
  grid-template-columns: repeat(3, 1fr);
  margin: 0 14px 12px;
  padding: 12px 9px;
  background: #f7f9fc;
  border-radius: 5px;
}

.fire-maintenance-page .month-summary span {
  color: #8a96a8;
  text-align: center;
  font-size: 12px;
  line-height: 18px;
}

.fire-maintenance-page .month-summary b {
  display: block;
  margin-top: 4px;
  color: #3f5067;
  font-size: 14px;
  line-height: 20px;
  font-variant-numeric: tabular-nums;
}

.fire-maintenance-page .reminder-list {
  min-height: 0;
  flex: 1 1 auto;
  padding: 10px 14px 14px;
}

.fire-maintenance-page .reminder-item {
  display: flex;
  width: 100%;
  min-height: 58px;
  align-items: center;
  gap: 12px;
  padding: 10px 6px;
  color: inherit;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid #f0f2f6;
  cursor: pointer;
  transition: background 0.18s;
}

.fire-maintenance-page .reminder-item:hover {
  background: #f7faff;
}

.fire-maintenance-page .reminder-item:focus-visible {
  outline: 2px solid #409eff;
  outline-offset: -2px;
}

.fire-maintenance-page .date-box {
  display: flex;
  width: 46px;
  height: 42px;
  flex: 0 0 46px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: #f1f5fa;
  border-radius: 5px;
}

.fire-maintenance-page .date-box b {
  color: #486078;
  font-size: 16px;
  line-height: 18px;
  font-variant-numeric: tabular-nums;
}

.fire-maintenance-page .date-box small {
  color: #8e99a9;
  font-size: 11px !important;
  line-height: 15px !important;
}

.fire-maintenance-page .date-box.overdue {
  background: #ffebed;
}

.fire-maintenance-page .date-box.overdue b {
  color: #d9434c;
}

.fire-maintenance-page .date-box.today {
  background: #fff2df;
}

.fire-maintenance-page .date-box.today b {
  color: #db861d;
}

.fire-maintenance-page .date-box.upcoming {
  background: #edf4ff;
}

.fire-maintenance-page .date-box.upcoming b {
  color: #2f78d7;
}

.fire-maintenance-page .reminder-info {
  min-width: 0;
  flex: 1;
}

.fire-maintenance-page .reminder-info b,
.fire-maintenance-page .reminder-info small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fire-maintenance-page .reminder-info b {
  color: #35455c;
  font-size: 13px;
  line-height: 20px;
}

.fire-maintenance-page .reminder-info small {
  margin-top: 4px;
  color: #929dae;
  font-size: 12px !important;
  line-height: 18px !important;
}

.fire-maintenance-page .reminder-status {
  flex: 0 0 auto;
  padding: 3px 8px;
  font-size: 12px !important;
  line-height: 18px;
  background: #fff7f7;
  border-radius: 10px;
}

.fire-maintenance-page .reminder-status.danger {
  color: #d94750;
}

.fire-maintenance-page .reminder-status.warning {
  color: #db891f;
  background: #fff8ec;
}
</style>
