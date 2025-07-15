<template>
  <div style="height: 100%">
    <div class="couerDivClass"
         id="couerDiv">
      <P8SplitPane :class="splitPaneDisable ? 'disable_split_pane' : ''"
                   className="split_pane"
                   split="vertical"
                   @resize="paneSizeChange"
                   :defaultPercent="defaultPercent"
                   :minPercent="0">
        <template #paneL>
          <div class="bottom">
            <task-statistics-gantt ref="planGantt"
                                   :project-id="projectId"
                                   :plan-info-id="planInfoId"
                                   :whole-describe-id="wholeDescribeId"
                                   :plan-info-status="planInfoStatus"
                                   :task-id="taskId"
                                   :plan-end-date-array="planEndDateArray"
                                   :plan-begin-date-array="planBeginDateArray"
                                   :create-page="createPage"
                                   @select-task="selectTask"
                                   @open="openLocation"
                                   @show-detail="showDetail"
                                   @switch-task="switchTask"
                                   @refreshData="refreshData"
                                   @save-success="detailDrawerClosed"
                                   @update-view-width="updateViewWidth"
                                   :task-status="taskStatus"></task-statistics-gantt>
          </div>
        </template>
        <template #paneR>
          <div v-if="defaultPercent < 99"
               class="x-style"><i class="el-dialog__close el-icon el-icon-close"
               @click="closeClick"></i></div>
          <ProgressHistory v-if="defaultPercent <99 && pageType === 'history'"
                           :key="renderKey"
                           :task-id="selectTaskId" />

          <plan-attribute v-else-if="defaultPercent <99 && !splitPaneDisable"
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
                          :view-width="viewWidth"
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
                         :task-status="taskStatus"
                         @onChangeTask="onChangeTask"></location-view>
        </template>
      </command-location>
    </div>
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
  height: 100%;
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
::v-deep .splitter-pane-resizer .resize-icon {
  display: block !important;
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
import taskStatisticsGantt from './taskStatisticsGantt.vue'
import { Drawer, P8Drawer as CommonDrawer, P8SplitPane } from 'p8-components-ui'
import PlanAttribute from '@/views/product/PlanGantt/Components/planAttribute/index.vue'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import ProgressHistory from '@/views/product/PlanGantt/Components/progressHistory'
import CommandLocation from '@/components/gantt/Components/CommandLocation'
import locationView from '@/views/product/PlanGantt/Components/planGantt/locationView.vue'

export default {
  name: 'taskStatisticsList',
  props: {
    projectId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      ganttButtonMode: 'single',
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
      createPage: 'taskStatistics',
      ganttName: 'taskStatisticsGantt',
      taskStatus: {},
      status: '',
      advance: true,
      viewWidth: null
    }
  },
  computed: {
    splitPaneDisable () {
      const myGantt = GanttObject.getGanttObject(this.ganttName)
      const task = myGantt.getTask(this.selectTaskId)
      if (!this.selectTaskId) {
        return true
      } else return !task.parent
    },
    ...mapGetters(['ganttRightButtons'])
  },
  components: {
    'el-drawer': Drawer,
    taskStatisticsGantt,
    P8SplitPane,
    PlanAttribute,
    CommonDrawer,
    ProgressHistory,
    CommandLocation,
    locationView
  },
  beforeMount () { },
  created () {
    this.firstEntry = true
  },
  mounted () {
    this.viewWidth = document.querySelector('#couerDiv').clientWidth
  },
  methods: {
    updateViewWidth (viewWidth) {
      this.viewWidth = viewWidth
    },
    switchTask (task) {
      if (!task.id) return
      let myGantt = GanttObject.getGanttObject(this.ganttName)
      myGantt.updateTask(task.id)
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
      // this.$refs.planGantt.initGantt(this.planInfoId, 'grid')
    },
    onChangeTask (row) {
      let myGantt = GanttObject.getGanttObject(this.ganttName)
      myGantt.unselectTask()
      myGantt.showTask(row.id)
      myGantt.selectTask(row.id)
    },
    refreshData (res) {
      // // this.$refs.commandBottonBar.$refs.components.getDataMonitor()
      this.$refs.commandBottonBar.$refs.components11[1].getDataMonitor()
      this.$refs.commandBottonBar.$refs.components11[1].getDataTaskType()
      if (res) {
        this.$refs.planGantt.loadGanttData(this.planInfoId, this.taskId, this.createPage)
        let myGantt = GanttObject.getGanttObject(this.ganttName)
        setTimeout(() => {
          myGantt.showTask(res)
          myGantt.selectTask(res)
        }, 1000)
      }
    },
    selectTask (selectDatas, ganttName) {
      this.selectedTasks = selectDatas
      this.ganttName = ganttName
    },
    closeClick () {
      this.defaultPercent = 100
      this.$store.getters.vueThis.pageType = 'switch'
      this.firstEntry = true
    },
    showDetail (selectTask, ganttName, viewType, switchType) {
      this.selectTaskId = selectTask.id
      let myGantt = GanttObject.getGanttObject(this.ganttName)
      if (!selectTask.parent) {
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
    },
    paneSizeChange (val) {
      this.defaultPercent = val
    },
    detailDrawerClosed (res) {
      this.detailVisible = false
      this.$bus.$emit('ganttDetail', false)
      this.selectTaskId = ''
      this.detailTitle = ''
    }
  },
  beforeDestroy () {
    window.myWebSocket.emit('quitPlanGantGroup', this.msg)
  }
}
</script>
