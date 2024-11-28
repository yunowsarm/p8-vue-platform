<template>
  <div style="height: 100%">
    <P8SplitPane split='vertical'
                 @resize="paneSizeChange"
                 :defaultPercent="defaultPercent"
                 :minPercent='0'>
      <template #paneL>
        <div class="couerDivClass"
             id="couerDiv">
          <div class="top"
               :style="{ height: commandButtonBarHeight }">
            <command-button-bar ref="commandBottonBar"
                                :panel-data="btnData"
                                :selected-tasks="selectedTasks"
                                :gantt-name="ganttName"
                                :plan-info-id="planInfoId"
                                :special-plan="thirdMenuParam.specialPlan"
                                :task-id="taskId"
                                @change-command-button="changeCommandButton"></command-button-bar>
          </div>
          <div class="bottom"
               :class="expandBottom">
            <plan-gantt :plan-info-id="planInfoId"
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
                        @select-task="selectTask"
                        @show-detail="showDetail"
                        @refreshData="refreshData"
                        @save-success="detailDrawerClosed"
                        :task-status="taskStatus"></plan-gantt>
          </div>
        </div>
      </template>
      <template #paneR>
        <div v-if="defaultPercent !== 100"
             class="x-style"><i class="el-dialog__close el-icon el-icon-close"
             @click="closeClick"></i></div>
        <plan-attribute :key="renderKey"
                        @save-success="detailDrawerClosed"
                        :create-page="createPage"
                        :task-id="selectTaskId"
                        :att-read-only="readOnly"
                        :view-type="viewType"
                        :gantt-name="ganttName"
                        :status="status"
                        :defaultPercent="defaultPercent"
                        @refreshData="refreshData"
                        :plan-info-id="planInfoId"></plan-attribute>
      </template>
    </P8SplitPane>
    <!-- <CommonDrawer
      v-if="detailVisible"
      :visible="detailVisible"
      size="50%"
      placement="top"
      :title="detailTitle"
      @close="detailDrawerClosed">
      <template #drawer>
      </template>
    </CommonDrawer> -->
  </div>
</template>

<style lang="scss" scoped>
.x-style {
  float: right;
  font-size: 20px;
  margin-right: 10px;
}
.couerDivClass {
  height: 100% !important;
  box-sizing: border-box;
  overflow: scroll;
  overflow-x: hidden;
  overflow-y: hidden;
  // z-index: 2050 !important;
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
::v-deep .splitter-pane-resizer {
  height: 50px !important;
  margin-top: 25% !important;
}
</style>

<script>
import { mapGetters } from 'vuex'
import PlanGantt from './Components/planGantt'
import { Drawer, P8Drawer as CommonDrawer, P8SplitPane } from 'p8-components-ui'
// import { CommandButtonBarData } from '@/assets/commonJS/ganttJS/commandButtonBarData'
import { CommandButtonBarDataDoubleRow } from '@/assets/commonJS/ganttJS/commandButtonBarDataDoubleRow'
import { CommandButtonBarDataSingleRow } from '@/assets/commonJS/ganttJS/commandButtonBarDataSingleRow'
import { CommandButtonBarData } from '@/assets/commonJS/ganttJS/commandButtonBarData'
import CommandButtonBar from '@/components/gantt/Components/CommandButtonBar'
import PlanAttribute from './Components/planAttribute'
import { deepClone } from '@/utils/common'
export default {
  name: 'PlanGanttManage',
  data () {
    return {
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
      renderKey: new Date().getTime(),
      defaultPercent: 100,
      firstEntry: true,
      msg: {},
      viewType: '',
      planInfoId: '',
      planBeginDateArray: [],
      planEndDateArray: [],
      wholeDescribeId: '',
      planInfoStatus: '',
      taskId: null,
      createPage: '',
      ganttName: '',
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
      handler (val) {
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
  computed: {
    btnData () {
      if (this.$route.path === '/TaskDecomposition') {
        const NewCommandButtonBarDataTabsRow = deepClone(CommandButtonBarData)
        const tabsRow = NewCommandButtonBarDataTabsRow.filter((item) => {
          return item.panelName !== '统计信息' && item.panelName !== '版本'
        })
        const NewCommandButtonBarDataDoubleRow = deepClone(CommandButtonBarDataDoubleRow)
        const doubleRow = NewCommandButtonBarDataDoubleRow.map((item) => {
          const arr = item.groups.filter((ele) => {
            return ele.groupName !== '统计信息' && ele.groupName !== '版本编辑' && ele.groupName !== '版本管理'
          })
          item.groups = arr
          return item
        })
        const NewCommandButtonBarDataSingleRow = deepClone(CommandButtonBarDataSingleRow)
        const singleRow = NewCommandButtonBarDataSingleRow.map((item) => {
          const arr = item.groups.filter((ele) => {
            return ele.groupName !== '统计信息' && ele.groupName !== '版本编辑' && ele.groupName !== '版本管理'
          })
          item.groups = arr
          return item
        })
        return this.ganttButtonMode === 'tabs' ? tabsRow : this.ganttButtonMode === 'double' ? doubleRow : singleRow
      } else {
        return this.ganttButtonMode === 'tabs' ? CommandButtonBarData : this.ganttButtonMode === 'double' ? CommandButtonBarDataDoubleRow : CommandButtonBarDataSingleRow
      }
    },
    expandBottom () {
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
  components: {
    'el-drawer': Drawer,
    PlanGantt,
    P8SplitPane,
    PlanAttribute,
    CommonDrawer,
    CommandButtonBar
  },
  beforeMount () { },
  created () {
    this.firstEntry = true
  },
  mounted () {
    if (this.thirdMenuParam.createPage === 'decompose' || this.thirdMenuParam.route === '/MyTask/MyTask/latest') {
      this.planInfoId = this.thirdMenuParam.PLANINFOID
      // this.secretGrade = this.thirdMenuParam.SECRETGRADE || ''
      this.planInfoStatus = this.thirdMenuParam.EXECUTESTATE
      this.taskId = this.thirdMenuParam.TASKID || ''
      this.createPage = this.thirdMenuParam.createPage || 'decompose'
      this.wholeDescribeId = this.thirdMenuParam.WHOLEDESCRIBEID
      this.planBeginDateArray = this.thirdMenuParam.planBeginDateArray || []
      this.planEndDateArray = this.thirdMenuParam.planEndDateArray || []
    } else {
      this.planInfoId = this.thirdMenuParam.ID || ''
      // this.secretGrade = this.thirdMenuParam.SECRETLEVEL || ''
      this.planInfoStatus = this.thirdMenuParam.EXECUTESTATE
      this.taskId = this.thirdMenuParam.TASKID || ''
      this.createPage = this.thirdMenuParam.createPage || 'compile'
      this.wholeDescribeId = this.thirdMenuParam.WHOLEDESCRIBEID
      this.planBeginDateArray = this.thirdMenuParam.planBeginDateArray || []
      this.planEndDateArray = this.thirdMenuParam.planEndDateArray || []
    }
    this.msg = {
      entityId: this.planInfoId,
      entityType: this.createPage,
      sendUser: this.$store.state.user.userId,
      sendSessionId: this.$store.state.user.userId
    }
    window.myWebSocket.emit('enterPlanGantGroup', this.msg)
  },
  methods: {
    refreshData () {
      // // this.$refs.commandBottonBar.$refs.components.getDataMonitor()
      this.$refs.commandBottonBar.$refs.components11[1].getDataMonitor()
      this.$refs.commandBottonBar.$refs.components11[1].getDataTaskType()
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
      this.firstEntry = true
    },
    showDetail (selectTask, ganttName, viewType, switchType) {
      // defaultPercent指的是gannt的宽度
      // 首次进入，单机任务且未拖动详情时，不弹出
      if (this.firstEntry && switchType == 'switch' && this.defaultPercent == 100) return
      this.renderKey = new Date().getTime()
      this.detailVisible = true
      this.$bus.$emit('ganttDetail', true)
      this.ganttName = ganttName
      this.selectTaskId = selectTask.id
      this.status = selectTask.status
      this.detailTitle = selectTask.name
      this.viewType = viewType
      if (switchType == 'switch' && this.defaultPercent == 100) {
        // 单机任务，且详情未打开情况下，展开到40%
        this.defaultPercent = 60
      } else if (switchType == 'switch' && this.defaultPercent != 100) {

      }
      if (switchType != 'switch') {
        this.defaultPercent = this.defaultPercent > 70 ? 70 : this.defaultPercent
        this.firstEntry = false
      }
    },
    paneSizeChange (val) {
      this.defaultPercent = val
    },
    detailDrawerClosed (res) {
      this.detailVisible = false
      this.$bus.$emit('ganttDetail', false)
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
  },
  beforeDestroy () {
    window.myWebSocket.emit('quitPlanGantGroup', this.msg)
  }
}
</script>
