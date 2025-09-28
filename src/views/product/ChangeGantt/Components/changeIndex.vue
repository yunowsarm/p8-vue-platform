<template>
  <div style="height: 100%">
    <P8SplitPane :class="splitPaneDisable ? 'disable_split_pane' : ''"
                 className="split_pane"
                 split="vertical"
                 @resize="paneSizeChange"
                 :defaultPercent="defaultPercent"
                 :minPercent="0">
      <template #paneL>
        <div class="couerDivClass"
             id="couerDiv">
          <div class="top"
               :style="{ height: commandButtonBarHeight }">
            <command-button-bar :panel-data="btnData"
                                :selected-tasks="selectedTasks"
                                :gantt-name="ganttName"
                                :hasSettings="false"
                                :plan-info-id="planInfoId"
                                @change-command-button="changeCommandButton"></command-button-bar>
          </div>
          <div class="bottom"
               :style="{height: expandBottom}">
            <change-gantt ref="planGantt"
                          :plan-info-id="planInfoId"
                          :plan-info-status="planInfoStatus"
                          :task-id="taskId"
                          v-bind="$attrs"
                          :secret-grade="secretGrade"
                          :selectRow="selectRow"
                          :plan-attribute-drawer="detailVisible"
                          :create-page="createPage"
                          :change-id="changeId"
                          :read-only="readOnly"
                          :panelData="btnData"
                          @hide-drawer="detailDrawerClosed"
                          @closed="closed"
                          @open="openLocation"
                          @select-task="selectTask"
                          @switch-task="switchTask"
                          @show-detail="showDetail"
                          @save-success="detailDrawerClosed"
                          :task-status="taskStatus"></change-gantt>
          </div>
        </div>
      </template>
      <template #paneR>
        <div v-if="defaultPercent !== 100"
             class="x-style"><i class="el-dialog__close el-icon el-icon-close"
             @click="closeClick"></i></div>
        <ProgressHistory v-if="defaultPercent <99 && pageType === 'history'"
                         :key="renderKey"
                         :task-id="selectTaskId" />
        <plan-attribute v-if="defaultPercent <99 && pageType !== 'history'"
                        @save-success="detailDrawerClosed"
                        :task-id="selectTaskId"
                        :key="renderKey"
                        v-bind="$attrs"
                        :create-page="createPage"
                        :secret-grade="secretGrade"
                        :att-read-only="readOnly"
                        :change-id="changeId"
                        :gantt-name="ganttName"
                        :status="status"
                        :defaultPercent="defaultPercent"
                        class="plan_attribute"
                        :plan-info-id="planInfoId"></plan-attribute>
      </template>
    </P8SplitPane>
    <command-location v-if="dialogVisible"
                      :visible="dialogVisible"
                      @close="closeLocation">
      <template>
        <location-view ref="planGanttView"
                       :plan-info-id="planInfoId"
                       :plan-info-status="planInfoStatus"
                       :task-id="taskId"
                       v-bind="$attrs"
                       :secret-grade="secretGrade"
                       :plan-attribute-drawer="detailVisible"
                       :create-page="createPage"
                       :change-id="changeId"
                       :read-only="readOnly"
                       @onChangeTask="onChangeTask"></location-view>
      </template>
    </command-location>
    <!-- <el-drawer style="width: 60%; left: auto"
               :title="detailTitle"
               :append-to-body="true"
               size="100%"
               :destroy-on-close="true"
               :wrapper-closable="false"
               :modal="false"
               @closed="detailDrawerClosed"
               :visible.sync="detailVisible">
      <plan-attribute @save-success="detailDrawerClosed"
                      :task-id="selectTaskId"
                      v-bind="$attrs"
                      :create-page="createPage"
                      :secret-grade="secretGrade"
                      :att-read-only="readOnly"
                      :gantt-name="ganttName"
                      :status="status"
                      :plan-info-id="planInfoId"></plan-attribute>
    </el-drawer> -->
  </div>
</template>

<style lang="scss" scoped>
.couerDivClass {
  height: calc(100% - 2px) !important;
  // padding-top:1px;
  box-sizing: border-box;
  overflow: scroll;
  overflow-x: hidden;
  overflow-y: hidden;
  z-index: 2000 !important;
}

.top {
  position: relative;
  background: $base-white-color;
  // border:1px solid $base-line-color;
  border-left: 1px solid $base-line-color;
  border-right: 1px solid $base-line-color;
  overflow: hidden;
}

.bottom {
  position: relative;
  border: 1px solid $base-line-color;
  border-left: 1px solid $base-line-color;
  border-right: 1px solid $base-line-color;
  // border-radius: 6px;
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

.el-drawer__wrapper {
  border-left: 1px solid $base-line-color;
  box-shadow: -2px 0 5px $base-line-color;
}

.x-style {
  float: right;
  font-size: 20px;
  margin-right: 15px;
  margin-top: 10px;
}

.plan_attribute {
  height: calc(100% - 42px) !important;
}
.disable_split_pane ::v-deep .splitter-pane-resizer {
  display: none;
}
</style>

<script>
import ChangeGantt from './changeGantt'
import { Drawer, P8SplitPane } from 'p8-components-ui'
import { CommandButtonBarDataDoubleRow } from '@/assets/commonJS/ganttJS/changeGantt/commandButtonBarDataDoubleRow'
import { CommandButtonBarDataSingleRow } from '@/assets/commonJS/ganttJS/changeGantt/commandButtonBarDataSingleRow'
import { CommandButtonBarData } from '@/assets/commonJS/ganttJS/changeGantt/commandButtonBarData'
import CommandButtonBar from '@/components/gantt/Components/CommandButtonBar'
import PlanAttribute from '../../PlanGantt/Components/planAttribute'
import { mapGetters } from 'vuex'
import { deepClone } from '@/utils/common'
import CommandLocation from '@/components/gantt/Components/CommandLocation'
import locationView from '@/views/product/PlanGantt/Components/planGantt/locationView'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import ProgressHistory from '@/views/product/PlanGantt/Components/progressHistory/index.vue'
import PlanGantt from '@/views/product/PlanGantt/Components/planGantt/index.vue'

export default {
  name: 'ChangeIndex',
  data () {
    return {
      pageType: '',
      dialogVisible: false, // gantt定位弹出框
      firstEntry: true,
      renderKey: new Date().getTime(),
      defaultPercent: 100,
      defaultKey: '1',
      advanced: false,
      selectedTasks: [],
      selectTaskId: '',
      detailVisible: false,
      detailTitle: '任务属性',
      drawerConfig: {
        modal: false
      },
      ganttName: 'changeGantt',
      taskStatus: {},
      status: '',
      advance: true,
      commandButtonBarHeight: this.ganttButtonMode === 'tabs' ? '145px' : this.ganttButtonMode === 'double' ? '72px' : '58px'
    }
  },
  props: {
    planInfoId: {
      type: String,
      default: null
    },
    secretGrade: {
      type: String
    },
    planInfoStatus: {
      type: String,
      default: null
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    createPage: {
      type: String,
      default: null
    },
    taskId: {
      type: String,
      default: null
    },
    changeId: {
      type: String,
      default: null
    },
    selectRow: {
      type: Object,
      default: null
    }
  },
  components: {
    PlanGantt,
    ProgressHistory,
    'el-drawer': Drawer,
    ChangeGantt,
    PlanAttribute,
    CommandButtonBar,
    P8SplitPane,
    CommandLocation,
    locationView
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
    splitPaneDisable () {
      const myGantt = GanttObject.getGanttObject(this.ganttName)
      if (!this.selectTaskId) {
        return true
      } else return myGantt.getGlobalTaskIndex(this.selectTaskId) === 0 && (this.createPage === 'planChange' || this.createPage === 'compile');
    },
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
  created () {
    this.firstEntry = true
  },
  mounted () { },
  methods: {
    switchTask (task) {
      if (!task.id) return
      // let myGantt = GanttObject.getGanttObject(this.ganttName)
      // myGantt.updateTask(task.id)
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
      // this.$refs.planGantt.relevanceVisible = false
      // this.$refs.planGantt.selectedTasks = []
      // this.$refs.planGantt.selectedId = this.$store.getters.vueThisLocation.selectTaskId
      // this.$refs.planGantt.initGantt(this.planInfoId, this.$store.getters.vueThis.changeRecordId, this.$store.getters.vueThis.viewType)
    },
    onChangeTask (row) {
      let myGantt = GanttObject.getGanttObject('changeGantt')
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
    },
    showDetail (selectTask, ganttName, createPage, switchType) {
      this.selectTaskId = selectTask.id
      let myGantt = GanttObject.getGanttObject(this.ganttName)
      if (myGantt.getGlobalTaskIndex(this.selectTaskId) === 0 && (this.createPage === 'planChange' || this.createPage === 'compile')) {
        this.defaultPercent = 100
        return
      }
      if (switchType !== 'history') {
        this.pageType = 'switch'
      } else {
        this.pageType = 'history'
      }
      if (this.firstEntry && switchType == 'switch' && this.defaultPercent == 100) return
      this.renderKey = new Date().getTime()
      this.createPage = createPage
      this.detailVisible = true
      this.ganttName = ganttName
      this.selectTaskId = selectTask.id
      this.status = selectTask.status
      if (switchType == 'switch' && this.defaultPercent == 100) {
        // 单机任务，且详情未打开情况下，展开到40%
        this.defaultPercent = 60
      }
      if (switchType != 'switch') {
        this.defaultPercent = this.defaultPercent > 70 ? 70 : this.defaultPercent
        this.firstEntry = false
      }
      // this.detailTitle = selectTask.name
    },
    paneSizeChange (val) {
      this.defaultPercent = val
    },
    detailDrawerClosed (res) {
      this.detailVisible = false
      this.selectTaskId = ''
      this.detailTitle = ''
    },
    closed (obj) {
      this.$emit('closed', obj)
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
