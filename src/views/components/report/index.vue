<template>
  <div class="report-page">
    <el-tabs v-model="activeTab" type="border-card" class="report-tabs">
      <el-tab-pane label="周报" name="weekly">
        <report-form
          :config="weeklyConfig"
          :header-info="weeklyHeader"
          :current-plan-list="weeklyCurrentPlan"
          :work-desc-list="weeklyWorkDesc"
          :next-plan-list="weeklyNextPlan"
          :notes="weeklyNotes"
          @update:header-info="weeklyHeader = $event"
          @update:current-plan-list="weeklyCurrentPlan = $event"
          @update:work-desc-list="weeklyWorkDesc = $event"
          @update:next-plan-list="weeklyNextPlan = $event"
        />
      </el-tab-pane>
      <el-tab-pane label="月报" name="monthly">
        <report-form
          :config="monthlyConfig"
          :header-info="monthlyHeader"
          :current-plan-list="monthlyCurrentPlan"
          :next-plan-list="monthlyNextPlan"
          :notes="monthlyNotes"
          @update:header-info="monthlyHeader = $event"
          @update:current-plan-list="monthlyCurrentPlan = $event"
          @update:next-plan-list="monthlyNextPlan = $event"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import ReportForm from './ReportForm.vue'
import {
  createWeeklyCurrentPlanRow,
  createWeeklyWorkDescRow,
  createWeeklyNextPlanRow,
  createMonthlyCurrentPlanRow,
  createMonthlyNextPlanRow,
  weeklyConfig,
  monthlyConfig,
  weeklyNotes,
  monthlyNotes,
  mockHeaderInfo
} from './mockData'

export default {
  name: 'TargetReport',
  components: { ReportForm },
  data () {
    return {
      activeTab: 'weekly',
      weeklyConfig,
      monthlyConfig,
      weeklyNotes,
      monthlyNotes,
      weeklyHeader: { ...mockHeaderInfo },
      monthlyHeader: { ...mockHeaderInfo },
      weeklyCurrentPlan: [
        createWeeklyCurrentPlanRow(1, {
          content: '完成项目前期手续梳理及报批材料整理',
          workType: '计划工作',
          planPercent: '80',
          resultType: '阶段性成果',
          resultDesc: '已完成材料初稿',
          completeDate: '2026-07-05',
          actualPercent: '75',
          completeType: '基本完成',
          completeTypeDesc: '待最终确认'
        }),
        createWeeklyCurrentPlanRow(2, {
          content: '组织部门周例会并输出会议纪要',
          workType: '常规工作',
          planPercent: '100',
          resultType: '过程记录',
          resultDesc: '会议纪要已归档',
          completeDate: '2026-07-04',
          actualPercent: '100',
          completeType: '已完成',
          completeTypeDesc: ''
        }),
        createWeeklyCurrentPlanRow(3)
      ],
      weeklyWorkDesc: [
        createWeeklyWorkDescRow(1, {
          description: '前期手续梳理现场照片及进度说明',
          remark: '已同步项目组'
        }),
        createWeeklyWorkDescRow(2),
        createWeeklyWorkDescRow(3)
      ],
      weeklyNextPlan: [
        createWeeklyNextPlanRow(1, {
          content: '提交项目立项申请及相关支撑材料',
          workType: '计划工作',
          planPercent: '100',
          resultType: '审批通过',
          resultDesc: '取得立项批复',
          startDate: '2026-07-08',
          endDate: '2026-07-11'
        }),
        createWeeklyNextPlanRow(2),
        createWeeklyNextPlanRow(3)
      ],
      monthlyCurrentPlan: [
        createMonthlyCurrentPlanRow(1, {
          content: '完成年度重点项目的立项与可研编制',
          workType: '计划工作',
          planPercent: '100',
          resultType: '成果文件',
          resultDesc: '形成可研报告初稿',
          completeDate: '2026-07-25',
          actualPercent: '60',
          completeType: '进行中',
          completeTypeDesc: '外部评审待安排',
          basis: '项目任务书',
          actualStatus: '正常推进',
          actualDate: '2026-07-20'
        }),
        createMonthlyCurrentPlanRow(2),
        createMonthlyCurrentPlanRow(3)
      ],
      monthlyNextPlan: [
        createMonthlyNextPlanRow(1, {
          content: '推进项目招标采购前期准备工作',
          workType: '计划工作',
          planPercent: '100',
          resultType: '采购文件',
          resultDesc: '完成招标文件编制',
          startDate: '2026-08-01',
          endDate: '2026-08-20'
        }),
        createMonthlyNextPlanRow(2),
        createMonthlyNextPlanRow(3)
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.report-page {
  height: 100%;
  padding: 12px;
  box-sizing: border-box;
  background: #f5f7fa;
  overflow: auto;
}

.report-tabs {
  min-height: calc(100% - 24px);

  ::v-deep .el-tabs__content {
    padding: 0;
  }
}
</style>
