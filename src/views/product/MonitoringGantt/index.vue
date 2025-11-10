<template>
  <div style="height: 100%">
    <div v-if="!isMobile"
         class="couerDivClass"
         id="couerDiv">

      <P8SplitPane :class="splitPaneDisable ? 'disable_split_pane' : ''"
                   className='split_pane'
                   split="vertical"
                   @resize="paneSizeChange"
                   :defaultPercent="defaultPercent"
                   :minPercent="0">
        <template #paneL>
          <div class="top"
               :style="{ height: commandButtonBarHeight }">
            <command-button-bar ref="commandBottonBar"
                                :key="dateTime"
                                :panel-data="thirdMenuParam.specialPlan && thirdMenuParam.specialPlan.includes('SPECIAL_PLAN') ? thematicBarData : barData"
                                :selected-tasks="selectedTasks"
                                :gantt-name="ganttName"
                                :plan-info-id="planInfoId"
                                :special-plan="thirdMenuParam.specialPlan"
                                :task-id="taskId"
                                @change-command-button="changeCommandButton"></command-button-bar>
          </div>
          <div class="bottom"
               :style="{height: expandBottom}">
            <plan-gantt ref="planGantt"
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
                        @open="openLocation"
                        @show-detail="showDetail"
                        @switch-task="switchTask"
                        @save-success="detailDrawerClosed"
                        :task-status="taskStatus"></plan-gantt>
          </div>
        </template>
        <template #paneR>
          <div v-if="defaultPercent <99"
               class="x-style"><i class="el-dialog__close el-icon el-icon-close"
               @click="closeClick"></i></div>
          <ProgressHistory v-if="defaultPercent <99 && pageType === 'history'"
                           :key="renderKey"
                           :task-id="selectTaskId" />

          <plan-attribute v-if="defaultPercent <99 && pageType !== 'history'"
                          :key="renderKey"
                          @save-success="detailDrawerClosed"
                          :create-page="createPage"
                          :task-id="selectTaskId"
                          :wholeDescribeId="wholeDescribeId"
                          :att-read-only="readOnly"
                          :view-type="viewType"
                          :gantt-name="ganttName"
                          :status="status"
                          :defaultPercent="defaultPercent"
                          :plan-info-id="planInfoId"></plan-attribute>
        </template>
      </P8SplitPane>
    </div>

    <command-location v-if="dialogVisible"
                      :visible="dialogVisible"
                      @close="closeLocation">
      <template>
        <location-view ref="planGanttView"
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
                       :panel-data="btnData"
                       :task-status="taskStatus"
                       @onChangeTask="onChangeTask"></location-view>
      </template>
    </command-location>
    <!-- <el-drawer :title="detailTitle"
               :append-to-body="true"
               size="50%"
               :destroy-on-close="true"
               :wrapper-closable="false"
               @closed="detailDrawerClosed"
               :visible.sync="detailVisible">
      <plan-attribute @save-success="detailDrawerClosed"
                      :create-page="createPage"
                      :task-id="selectTaskId"
                      :att-read-only="readOnly"
                      :view-type="viewType"
                      :gantt-name="ganttName"
                      :status="status"
                      :plan-info-id="planInfoId"></plan-attribute>
    </el-drawer> -->
  </div>
</template>

<style lang="scss" scoped>
.x-style {
  float: right;
  font-size: 20px;
  margin-right: 15px;
  margin-top: 10px;
}
.couerDivClass {
  height: 100% !important;
  box-sizing: border-box;
  overflow: scroll;
  overflow-x: hidden;
  overflow-y: hidden;
  // z-index: 2000 !important;
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
.disable_split_pane ::v-deep .splitter-pane-resizer {
  display: none;
}
</style>

<script>
import { mapGetters } from 'vuex'
import PlanGantt from './Components/planGantt'
import { Drawer, P8SplitPane } from 'p8-components-ui'
// import { CommandButtonBarData } from '@/assets/commonJS/ganttJS/commandButtonBarData'
// import { CommandButtonBarDataDoubleRow } from '@/assets/commonJS/ganttJS/PlanMonitoringGantt/commandButtonBarDataDoubleRow'
// import { CommandButtonBarDataSingleRow } from '@/assets/commonJS/ganttJS/PlanMonitoringGantt/commandButtonBarDataSingleRow'
import { CommandButtonBarData } from '@/assets/commonJS/ganttJS/PlanMonitoringGantt/commandButtonBarData'
import { CommandButtonBarDataDoubleRow } from '@/assets/commonJS/ganttJS/PlanMonitoringGantt/commandButtonBarDataDoubleRow'
import { CommandButtonBarDataSingleRow } from '@/assets/commonJS/ganttJS/PlanMonitoringGantt/commandButtonBarDataSingleRow'
import CommandButtonBar from '@/components/gantt/Components/CommandButtonBar'
import planAttribute from '../PlanGantt/Components/planAttribute'
import CommandLocation from '@/components/gantt/Components/CommandLocation'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import locationView from '../PlanGantt/Components/planGantt/locationView'
import ProgressHistory from '../PlanGantt/Components/progressHistory'
export default {
  name: 'PlanGanttManage',
  data () {
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
      defaultPercent: 100,
      renderKey: new Date().getTime(),
      firstEntry: true,
      pageType: '',
      taskId: null,
      createPage: '',
      ganttName: '',
      barData: this.ganttButtonMode === 'double' ? CommandButtonBarDataDoubleRow : CommandButtonBarDataSingleRow,
      thematicBarData: this.ganttButtonMode === 'double' ? CommandButtonBarDataDoubleRow : CommandButtonBarDataSingleRow,
      taskStatus: {},
      status: '',
      advance: true,
      dialogVisible: false, // gantt定位弹出框
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
      handler (val) {
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
    },
    userSettingAll: {
      handler (val) {
        let isGroup = val.PlanButton ? val.PlanButton[0].value.isGroup : this.ganttIsGroup
        if (this.ganttButtonMode == 'tabs') {
          if (isGroup === '1') {
            this.commandButtonBarHeight = this.advance ? '160px' : '40px'
            this.expandBottom = 'calc(100% - 160px)'
          } else {
            this.commandButtonBarHeight = '160px'
            this.expandBottom = 'calc(100% - 160px)'
          }
        }
        if (this.ganttButtonMode == 'double') {
          if (isGroup === '1') {
            this.commandButtonBarHeight = '72px'
            this.expandBottom = 'calc(100% - 72px)'
          } else {
            this.commandButtonBarHeight = '54px'
            this.expandBottom = 'calc(100% - 55px)'
          }
        }
        if (this.ganttButtonMode == 'single') {
          if (isGroup === '1') {
            this.commandButtonBarHeight = '58px'
            this.expandBottom = 'calc(100% - 55px)'
          } else {
            this.commandButtonBarHeight = '40px'
            this.expandBottom = 'calc(100% - 40px)'
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  components: {
    'el-drawer': Drawer,
    planAttribute,
    PlanGantt,
    CommandButtonBar,
    CommandLocation,
    locationView,
    P8SplitPane,
    ProgressHistory
  },
  beforeMount () { },
  created () {
    this.firstEntry = true
  },
  mounted () {
    if (this.isMobile) {
      return this.$message({
        message: '暂不支持，请前往PC端查看',
        offset: 100,
        duration: 3000,
        type: 'warning'
      })
    }
    this.planInfoId = this.thirdMenuParam.ID || ''
    this.planInfoStatus = this.thirdMenuParam.EXECUTESTATE
    this.taskId = this.thirdMenuParam.taskId || ''
    this.createPage = this.thirdMenuParam.createPage || 'compile'
    this.wholeDescribeId = this.thirdMenuParam.WHOLEDESCRIBEID
    this.planBeginDateArray = this.thirdMenuParam.planBeginDateArray || []
    this.planEndDateArray = this.thirdMenuParam.planEndDateArray || []
  },
  computed: {
    isMobile () {
      return this.$store.getters.isMobile
    },
    splitPaneDisable () {
      const myGantt = GanttObject.getGanttObject(this.ganttName)
      if (!this.selectTaskId) {
        return true
      } else return myGantt.getGlobalTaskIndex(this.selectTaskId) === 0 && (this.createPage === 'planChange' || this.createPage === 'compile');
    },
    // expandBottom () {
    //   if (this.ganttButtonMode == 'tabs' && this.advance) {
    //     return 'tabs'
    //   }
    //   if (this.ganttButtonMode == 'tabs' && !this.advance) {
    //     return 'hiddenTabs'
    //   }
    //   if (this.ganttButtonMode == 'double') {
    //     return 'double'
    //   }
    //   if (this.ganttButtonMode == 'single') {
    //     return 'single'
    //   }
    //   return ''
    // },
    ...mapGetters(['ganttButtonMode', 'ganttRightButtons', 'userSettingAll', 'ganttIsGroup'])
  },
  methods: {
    switchTask (task) {
      if (!task.id) return
      // let myGantt = GanttObject.getGanttObject(this.ganttName)
      // myGantt.updateTask(task.id)
      this.selectTaskId = task.id
      this.renderKey = new Date().getTime()
    },
    eleteTaskCallback () {
      this.selectTaskId = '';
      this.closeClick();
    },
    switchTask (task) {
      if (!task.id) return
      // let myGantt = GanttObject.getGanttObject(this.ganttName)
      // myGantt.updateTask(task.id);
      this.selectTaskId = task.id
      this.renderKey = new Date().getTime()
    },
    openLocation () {
      this.dialogVisible = true
    },
    closeLocation () {
      this.dialogVisible = false
      this.$store.getters.vueThis.searchForm = {}
      this.$store.getters.vueThisLocation.searchForm = {}
      // this.$refs.planGantt.relevancePlanVisible = false
      // this.$refs.planGantt.selectedId = this.$store.getters.vueThisLocation.selectTaskId
      // this.$refs.planGantt.initGantt(this.planInfoId, this.$refs.planGantt.viewType)
    },
    onChangeTask (row) {
      let myGantt = GanttObject.getGanttObject(this.ganttName)
      myGantt.unselectTask()
      myGantt.showTask(row.id)
      myGantt.selectTask(row.id)
    },
    selectTask (selectDatas, ganttName) {
      this.selectedTasks = selectDatas
      this.ganttName = ganttName
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    tabBarExtraContent () { },
    closeClick () {
      this.defaultPercent = 100
      this.$store.getters.vueThis.pageType = 'switch'
      this.firstEntry = true
      this.$refs.commandBottonBar.showArrow = false
      this.dateTime = new Date().getTime()
    },
    showDetail (selectTask, ganttName, viewType, switchType) {
      this.selectTaskId = selectTask.id
      let myGantt = GanttObject.getGanttObject(this.ganttName)
      if (myGantt.getGlobalTaskIndex(this.selectTaskId) === 0 && (this.createPage === 'planChange' || this.createPage === 'compile')) {
        this.defaultPercent = 100
        return
      }
      // defaultPercent指的是gannt的宽度
      // 首次进入，单机任务且未拖动详情时，不弹出
      if (switchType !== 'history') {
        this.pageType = 'switch'
      } else {
        this.pageType = 'history'
      }
      if (this.firstEntry && switchType == 'switch' && this.defaultPercent == 100) return
      this.renderKey = new Date().getTime()
      this.detailVisible = true
      this.ganttName = ganttName
      this.wholeDescribeId = selectTask.wholeId
      this.status = selectTask.status
      this.detailTitle = selectTask.name
      this.viewType = viewType
      if (switchType == 'switch' && this.defaultPercent == 100) {
        // 单机任务，且详情未打开情况下，展开到40%
        this.defaultPercent = 60
      }
      if (switchType != 'switch') {
        this.defaultPercent = this.defaultPercent > 70 ? 70 : this.defaultPercent
        this.firstEntry = false
      }
      this.$refs.commandBottonBar.showArrow = true
    },
    paneSizeChange (val) {
      this.defaultPercent = val
    },
    detailDrawerClosed (res) {
      this.detailVisible = false
      this.selectTaskId = ''
      this.detailTitle = ''
    },
    changeCommandButton (advance) {
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
