<template>
  <div style="height: 100%">
    <div v-if="!isMobile"
         class="couerDivClass"
         id="couerDiv">
      <P8SplitPane :class="splitPaneDisable ? 'disable_split_pane' : ''"
                   className="split_pane"
                   split="vertical"
                   @resize="paneSizeChange"
                   :defaultPercent="defaultPercent"
                   :minPercent="0">
        <template #paneL>
          <div class="top"
               :style="{ height: commandButtonBarHeight }">
            <command-button-bar ref="commandBottonBar"
                                :key="dateTime"
                                :panel-data="btnData"
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
                        :isView='isView'
                        :plan-info-id="planInfoId"
                        :whole-describe-id="wholeDescribeId"
                        :plan-info-status="planInfoStatus"
                        :task-id="taskId"
                        :plan-end-date-array="planEndDateArray"
                        :plan-begin-date-array="planBeginDateArray"
                        :create-page="createPage"
                        :flag="thirdMenuParam.specialPlan"
                        :thirdMenuParam="thirdMenuParam"
                        :project-category="thirdMenuParam.projectCategory"
                        :select-record="thirdMenuParam.selectRecord"
                        :panel-data="btnData"
                        :defaultPercent="defaultPercent"
                        @select-task="selectTask"
                        @open="openLocation"
                        @show-detail="showDetail"
                        @switch-task="switchTask"
                        @refreshData="refreshData"
                        @save-success="detailDrawerClosed"
                        @delete-task-callback="deleteTaskCallback"
                        :task-status="taskStatus"></plan-gantt>
          </div>
        </template>
        <template #paneR>
          <div v-if="defaultPercent < 99"
               class="x-style"><i v-if="isDisplay"
               class="el-dialog__close el-icon el-icon-close"
               @click="closeClick"></i></div>
          <ProgressHistory v-if="defaultPercent < 99 && pageType === 'history'"
                           :task-id="selectTaskId"
                           @templateMounted="templateMounted" />

          <plan-attribute v-if="defaultPercent < 99 && pageType !== 'history'"
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
                          @refreshData="refreshData"
                          :plan-info-id="planInfoId"></plan-attribute>
        </template>
      </P8SplitPane>
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
  </div>
</template>

<style lang="scss" scoped>
::v-deep .splitter-paneR {
  background: white !important;
}
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
  // z-index: 2050 !important;
  .top {
    .card-container {
      ::v-deep .taskGroupContain {
        min-width: 800px;
      }
      ::v-deep .el-tabs__nav-wrap {
        width: calc(100% - 80px);
      }
      position: relative;
    }
  }
}

// #couerDiv {
//   background: $base-bg-color;
// }

.top {
  position: relative;
  margin-bottom: 0px;
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

.disable_split_pane ::v-deep .splitter-pane-resizer {
  display: none;
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
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import ProgressHistory from './Components/progressHistory'
import CommandLocation from '@/components/gantt/Components/CommandLocation'
import locationView from './Components/planGantt/locationView'
import { debounce } from 'lodash';
import { getSession, setSession } from '@/service/expands/session'
export default {
  name: 'PlanGanttManage',
  data () {
    return {
      dialogVisible: false, // gantt定位弹出框
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
      pageType: '',
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
      ganttName: 'planGantt',
      taskStatus: {},
      status: '',
      advance: true,
      commandButtonBarHeight: this.ganttButtonMode === 'tabs' ? (this.advance ? '145px' : '40px') : this.ganttButtonMode === 'double' ? '72px' : '58px',
      expandBottom: 'calc(100% - 138px)',
      isDisplay: true,
      dateTime: ''
    }
  },
  props: {
    thirdMenuParam: {
      type: Object,
      default: function () {
        return {}
      }
    },
    isView: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    ganttButtonMode: {
      handler (val) {
        if (val == 'tabs') {
          this.commandButtonBarHeight = this.advance ? '145px' : '40px'
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
            this.commandButtonBarHeight = this.advance ? '145px' : '40px'
            this.expandBottom = 'calc(100% - 148px)'
          } else {
            this.commandButtonBarHeight = '130px'
            this.expandBottom = 'calc(100% - 130px)'
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
  computed: {
    isMobile () {
      return this.$store.getters.isMobile
    },
    splitPaneDisable () {
      const myGantt = GanttObject.getGanttObject(this.ganttName)
      if (!this.selectTaskId) {
        return true
      } else return myGantt.getGlobalTaskIndex(this.selectTaskId) === 0 && (this.createPage === 'planChange' || this.createPage === 'compile')
    },
    btnData () {
      if (this.$route.path === '/TaskDecomposition') {
        const NewCommandButtonBarDataTabsRow = deepClone(CommandButtonBarData)
        const tabsRow = NewCommandButtonBarDataTabsRow.filter((item) => {
          return item.panelName !== '统计信息' && item.panelName !== '版本'
        })
        const NewCommandButtonBarDataDoubleRow = deepClone(CommandButtonBarDataDoubleRow)
        const doubleRow = NewCommandButtonBarDataDoubleRow.map((item) => {
          item.groups = item.groups.filter((ele) => {
            return ele.groupName !== '统计信息' && ele.groupName !== '版本编辑' && ele.groupName !== '版本管理'
          })
          return item
        })
        const NewCommandButtonBarDataSingleRow = deepClone(CommandButtonBarDataSingleRow)
        const singleRow = NewCommandButtonBarDataSingleRow.map((item) => {
          item.groups = item.groups.filter((ele) => {
            return ele.groupName !== '统计信息' && ele.groupName !== '版本编辑' && ele.groupName !== '版本管理'
          })
          return item
        })
        return this.ganttButtonMode === 'tabs' ? tabsRow : this.ganttButtonMode === 'double' ? doubleRow : singleRow
      } else {
        // 克隆原始数据
        const NewCommandButtonBarDataTabsRow = deepClone(CommandButtonBarData);
        const NewCommandButtonBarDataDoubleRow = deepClone(CommandButtonBarDataDoubleRow);
        const NewCommandButtonBarDataSingleRow = deepClone(CommandButtonBarDataSingleRow);
        if (aiAssistant) {
          const buttonIdToCheck = 'auto-generated'
          // 检查 CommandButtonBarData[0].groups[0].buttonConfigs 是否已经存在该 buttonId
          if (!NewCommandButtonBarDataTabsRow[0].groups[0].buttonConfigs.some((button) => button.buttonId === buttonIdToCheck)) {
            NewCommandButtonBarDataTabsRow[0].groups[0].buttonConfigs.unshift({
              buttonId: buttonIdToCheck,
              size: 'large',
              position: ['top', 'right']
            })
          }

          // 检查 CommandButtonBarDataDoubleRow[0].groups[0].buttonConfigs 是否已经存在该 buttonId
          if (!NewCommandButtonBarDataDoubleRow[0].groups[0].buttonConfigs.some((button) => button.buttonId === buttonIdToCheck)) {
            NewCommandButtonBarDataDoubleRow[0].groups[0].buttonConfigs.unshift({
              buttonId: buttonIdToCheck,
              size: 'large',
              position: ['top', 'right']
            })
          }

          // 检查 CommandButtonBarDataSingleRow[0].groups[0].buttonConfigs 是否已经存在该 buttonId
          if (!NewCommandButtonBarDataSingleRow[0].groups[0].buttonConfigs.some((button) => button.buttonId === buttonIdToCheck)) {
            NewCommandButtonBarDataSingleRow[0].groups[0].buttonConfigs.unshift({
              buttonId: buttonIdToCheck,
              size: 'small',
              position: ['top', 'right']
            })
          }
        }
        return this.ganttButtonMode === 'tabs' ? NewCommandButtonBarDataTabsRow : this.ganttButtonMode === 'double' ? NewCommandButtonBarDataDoubleRow : NewCommandButtonBarDataSingleRow
      }
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
  components: {
    'el-drawer': Drawer,
    PlanGantt,
    P8SplitPane,
    PlanAttribute,
    CommonDrawer,
    CommandButtonBar,
    ProgressHistory,
    CommandLocation,
    locationView
  },
  beforeMount () { },
  created () {
    this.firstEntry = true
    this.debouncedSetRenderKey = debounce(this.setRenderKey, 300);
  },
  mounted () {
    if (this.isMobile) {
      return this.$message.warning('暂不支持，请前往PC端查看')
    }
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
    let stateInfo = getSession('stateInfo')
    if (stateInfo && stateInfo.taskInfo.thirdMenuParam.planInfoId) {
      this.planInfoId = stateInfo.taskInfo.thirdMenuParam.planInfoId
      this.thirdMenuParam.planInfoId = stateInfo.taskInfo.thirdMenuParam.planInfoId
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
    deleteTaskCallback () {
      this.selectTaskId = ''
      this.closeClick()
    },
    switchTask (task) {
      if (!task.id) return
      // let myGantt = GanttObject.getGanttObject(this.ganttName)
      // myGantt.updateTask(task.id);
      this.selectTaskId = task.id
      this.debouncedSetRenderKey(); // 使用防抖函数
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
      // this.$refs.planGantt.initGantt(this.planInfoId, 'grid')
    },
    onChangeTask (row) {
      // if (!this.$store.getters.ganttDatas.loactionTaskId) {
      let myGantt = GanttObject.getGanttObject(this.ganttName)
      myGantt.unselectTask()
      myGantt.showTask(row.id)
      myGantt.selectTask(row.id)
      // }
    },
    refreshData (res) {
      // // this.$refs.commandBottonBar.$refs.components.getDataMonitor()
      this.$refs.commandBottonBar.$refs.components11[1].getDataMonitor()
      this.$refs.commandBottonBar.$refs.components11[1].getDataTaskType()
      if (res) {
        this.$refs.planGantt.loadGanttData(this.planInfoId, this.taskId, this.createPage)
        let myGantt = GanttObject.getGanttObject(this.ganttName)
        setTimeout(() => {
          myGantt.unselectTask()
          myGantt.showTask(res)
          myGantt.selectTask(res)
        }, 1000)
      }
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
    showDetail (selectTask, ganttName, viewType, switchType,) {
      this.selectTaskId = selectTask.id
      let myGantt = GanttObject.getGanttObject(this.ganttName)
      let that = this
      myGantt.attachEvent("onCollapse", (event) => {
        that.isDisplay = true
      })
      myGantt.attachEvent("onExpand", () => {
        that.isDisplay = false
      });
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
      // this.debouncedSetRenderKey(); // 使用防抖函数
      this.detailVisible = true
      this.$bus.$emit('ganttDetail', true)
      this.ganttName = ganttName
      this.wholeDescribeId = selectTask.wholeId
      this.status = selectTask.status
      this.detailTitle = selectTask.name
      this.viewType = viewType
      if (this.defaultPercent == 100) {
        // 单机任务，且详情未打开情况下，展开到40%
        this.defaultPercent = 60
      } else if (switchType == 'switch' && this.defaultPercent != 100) {
      }
      if (switchType != 'switch') {
        this.defaultPercent = this.defaultPercent > 70 ? 70 : this.defaultPercent
        this.firstEntry = false
      }
      this.$refs.commandBottonBar.showArrow = true
    },
    templateMounted () {
      this.loading.close()
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
        this.expandBottom = 'calc(100% - 148px)'
        this.commandButtonBarHeight = '152px'
      } else {
        this.commandButtonBarHeight = '40px'
        this.expandBottom = 'calc(100% - 38px)'
      }
    },
    setRenderKey () {
      this.renderKey = new Date().getTime();
    },
  },
  beforeDestroy () {
    window.myWebSocket.emit('quitPlanGantGroup', this.msg)
    this.debouncedSetRenderKey.cancel();
  }
}
</script>
