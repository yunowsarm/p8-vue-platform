<template>
  <div style="height: 100%">
    <div class="couerDivClass" id="couerDiv">
      <div class="top" :style="{ height: commandButtonBarHeight }">
        <command-button-bar
          :panel-data="thirdMenuParam.specialPlan && thirdMenuParam.specialPlan.includes('SPECIAL_PLAN') ? thematicBarData : barData"
          :selected-tasks="selectedTasks"
          :gantt-name="ganttName"
          :plan-info-id="planInfoId"
          :special-plan="thirdMenuParam.specialPlan"
          :task-id="taskId"
          @change-command-button="changeCommandButton"
        ></command-button-bar>
      </div>
      <div class="bottom" :class="expandBottom">
        <plan-gantt
          :plan-info-id="planInfoId"
          :whole-describe-id="wholeDescribeId"
          :plan-info-status="planInfoStatus"
          :task-id="taskId"
          :plan-end-date-array="planEndDateArray"
          :plan-begin-date-array="planBeginDateArray"
          :create-page="createPage"
          :flag="thirdMenuParam.specialPlan"
          :project-category="thirdMenuParam.projectCategory"
          :select-record="thirdMenuParam.selectRecord"
          :panel-data="thirdMenuParam.specialPlan && thirdMenuParam.specialPlan.includes('SPECIAL_PLAN') ? thematicBarData : barData"
          @select-task="selectTask"
          @show-detail="showDetail"
          @save-success="detailDrawerClosed"
          :task-status="taskStatus"
        ></plan-gantt>
      </div>
    </div>
    <el-drawer :title="detailTitle" :append-to-body="true" size="50%" :destroy-on-close="true" :wrapper-closable="false" @closed="detailDrawerClosed" :visible.sync="detailVisible">
      <plan-attribute
        @save-success="detailDrawerClosed"
        :create-page="createPage"
        :task-id="selectTaskId"
        :att-read-only="readOnly"
        :view-type="viewType"
        :gantt-name="ganttName"
        :status="status"
        :plan-info-id="planInfoId"
      ></plan-attribute>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.couerDivClass {
  height: 100% !important;
  box-sizing: border-box;
  overflow: scroll;
  overflow-x: hidden;
  overflow-y: hidden;
  z-index: 2000 !important;
}
#couerDiv {
  background: $base-bg-color;
}
.top {
  position: relative;
  // margin-bottom: 8px;
  background: $base-white-color;
  border-left: 1px solid $base-line-color;
  border-right: 1px solid $base-line-color;
  // border-radius: 6px;
  overflow: hidden;
}
.bottom {
  position: relative;
  border: 1px solid $base-line-color;
  // border-bottom-left-radius: 6px;
  // border-bottom-right-radius: 6px;
  box-shadow: 5px 5px 13px $base-bg-shadow;
  background: $base-white-color;
  overflow: hidden;
}
.bottom.single {
  height: calc(100% - 60px);
}
.bottom.double {
  height: calc(100% - 74px);
}
.bottom.tabs {
  height: calc(100% - 148px);
}
.bottom.hiddenTabs {
  height: calc(100% - 42px);
}
</style>

<script>
import { mapGetters } from 'vuex'
import PlanGantt from './Components/planGantt'
import { Drawer } from 'p8-components-ui'
// import { CommandButtonBarData } from '@/assets/commonJS/ganttJS/commandButtonBarData'
// import { CommandButtonBarDataDoubleRow } from '@/assets/commonJS/ganttJS/PlanMonitoringGantt/commandButtonBarDataDoubleRow'
// import { CommandButtonBarDataSingleRow } from '@/assets/commonJS/ganttJS/PlanMonitoringGantt/commandButtonBarDataSingleRow'
import { CommandButtonBarData } from '@/assets/commonJS/ganttJS/PlanMonitoringGantt/commandButtonBarData'
import { CommandButtonBarDataDoubleRow } from '@/assets/commonJS/ganttJS/PlanMonitoringGantt/commandButtonBarDataDoubleRow'
import { CommandButtonBarDataSingleRow } from '@/assets/commonJS/ganttJS/PlanMonitoringGantt/commandButtonBarDataSingleRow'
import CommandButtonBar from '@/components/gantt/Components/CommandButtonBar'
import planAttribute from '../PlanGantt/Components/planAttribute'
export default {
  name: 'PlanGanttManage',
  data() {
    return {
      viewType: '',
      defaultKey: '1',
      advanced: false,
      selectedTasks: [],
      selectTaskId: '',
      detailVisible: false,
      readOnly: false,
      detailTitle: '',
      drawerConfig: {
        modal: false
      },
      planInfoId: '',
      planBeginDateArray: [],
      planEndDateArray: [],
      wholeDescribeId: '',
      planInfoStatus: '',
      taskId: null,
      createPage: '',
      ganttName: '',
      barData: this.ganttButtonMode === 'double' ? CommandButtonBarDataDoubleRow : CommandButtonBarDataSingleRow,
      thematicBarData: this.ganttButtonMode === 'double' ? CommandButtonBarDataDoubleRow : CommandButtonBarDataSingleRow,
      taskStatus: {},
      status: '',
      advance: true,
      commandButtonBarHeight: this.ganttButtonMode === 'tabs' ? '145px' : this.ganttButtonMode === 'double' ? '72px' : '58px'
    }
  },
  props: {
    thirdMenuParam: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  watch: {
    ganttButtonMode: {
      handler(val) {
        this.barData = val === 'tabs' ? CommandButtonBarData : val === 'double' ? CommandButtonBarDataDoubleRow : CommandButtonBarDataSingleRow
        this.thematicBarData = val === 'double' ? CommandButtonBarDataDoubleRow : CommandButtonBarDataSingleRow
        if (val == 'tabs') {
          this.commandButtonBarHeight = '145px'
        }
        if (val == 'double') {
          this.commandButtonBarHeight = '72px'
        }
        if (val == 'single') {
          this.commandButtonBarHeight = '58px'
        }
      },
      immediate: true
    }
  },
  components: {
    'el-drawer': Drawer,
    planAttribute,
    PlanGantt,
    CommandButtonBar
  },
  beforeMount() {},
  created() {},
  mounted() {
    this.planInfoId = this.thirdMenuParam.ID || ''
    this.planInfoStatus = this.thirdMenuParam.EXECUTESTATE
    this.taskId = this.thirdMenuParam.taskId || ''
    this.createPage = this.thirdMenuParam.createPage || 'compile'
    this.wholeDescribeId = this.thirdMenuParam.WHOLEDESCRIBEID
    this.planBeginDateArray = this.thirdMenuParam.planBeginDateArray || []
    this.planEndDateArray = this.thirdMenuParam.planEndDateArray || []
  },
  computed: {
    expandBottom() {
      if (this.ganttButtonMode == 'tabs' && this.advance) {
        return 'tabs'
      }
      if (this.ganttButtonMode == 'tabs' && !this.advance) {
        return 'hiddenTabs'
      }
      if (this.ganttButtonMode == 'double') {
        return 'double'
      }
      if (this.ganttButtonMode == 'single') {
        return 'single'
      }
      return ''
    },
    ...mapGetters(['ganttButtonMode', 'ganttRightButtons'])
  },
  methods: {
    selectTask(selectDatas, ganttName) {
      this.selectedTasks = selectDatas
      this.ganttName = ganttName
    },
    toggleAdvanced() {
      this.advanced = !this.advanced
    },
    tabBarExtraContent() {},
    showDetail(selectTask, ganttName, viewType) {

      this.detailVisible = true
      this.ganttName = ganttName
      this.selectTaskId = selectTask.id
      this.status = selectTask.status
      this.detailTitle = selectTask.name
      this.viewType = viewType
    },
    detailDrawerClosed(res) {
      this.detailVisible = false
      this.selectTaskId = ''
      this.detailTitle = ''
    },
    changeCommandButton(advance) {
      this.advance = advance
      if (advance) {
        this.commandButtonBarHeight = '152px'
      } else {
        this.commandButtonBarHeight = '40px'
      }
    }
  }
}
</script>
