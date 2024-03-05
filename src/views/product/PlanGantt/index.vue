<template>
  <div style="height: 100%">
    <div class="couerDivClass"
         id="couerDiv">
      <div class="top"
           :style="{ height: commandButtonBarHeight }">
        <command-button-bar :panel-data="btnData"
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
                    :secret-grade="secretGrade"
                    :create-page="createPage"
                    :flag="thirdMenuParam.specialPlan"
                    :project-category="thirdMenuParam.projectCategory"
                    :select-record="thirdMenuParam.selectRecord"
                    :panel-data="btnData"
                    @select-task="selectTask"
                    @show-detail="showDetail"
                    @save-success="detailDrawerClosed"
                    :task-status="taskStatus"></plan-gantt>
      </div>
    </div>
    <el-drawer :title="detailTitle"
               v-drawerDrag
               :append-to-body="true"
               size="50%"
               :destroy-on-close="true"
               :wrapper-closable="false"
               @closed="detailDrawerClosed"
               :visible.sync="detailVisible">
      <plan-attribute @save-success="detailDrawerClosed"
                      :create-page="createPage"
                      :task-id="selectTaskId"
                      :secret-grade="secretGrade"
                      :att-read-only="readOnly"
                      :view-type="viewType"
                      :gantt-name="ganttName"
                      :status="status"
                      :plan-info-id="planInfoId"></plan-attribute>
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
  z-index: 9999 !important;
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
      viewType: '',
      planInfoId: '',
      secretGrade: '',
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
    PlanAttribute,
    CommandButtonBar
  },
  beforeMount () { },
  created () { },
  mounted () {
    if (this.thirdMenuParam.createPage === 'decompose' || this.thirdMenuParam.route === '/MyTask/MyTask/latest') {
      this.planInfoId = this.thirdMenuParam.PLANINFOID
      this.secretGrade = this.thirdMenuParam.SECRETGRADE || ''
      this.planInfoStatus = this.thirdMenuParam.EXECUTESTATE
      this.taskId = this.thirdMenuParam.TASKID || ''
      this.createPage = this.thirdMenuParam.createPage || 'decompose'
      this.wholeDescribeId = this.thirdMenuParam.WHOLEDESCRIBEID
      this.planBeginDateArray = this.thirdMenuParam.planBeginDateArray || []
      this.planEndDateArray = this.thirdMenuParam.planEndDateArray || []
    } else {
      this.planInfoId = this.thirdMenuParam.ID || ''
      this.secretGrade = this.thirdMenuParam.SECRETLEVEL || ''
      this.planInfoStatus = this.thirdMenuParam.EXECUTESTATE
      this.taskId = this.thirdMenuParam.TASKID || ''
      this.createPage = this.thirdMenuParam.createPage || 'compile'
      this.wholeDescribeId = this.thirdMenuParam.WHOLEDESCRIBEID
      this.planBeginDateArray = this.thirdMenuParam.planBeginDateArray || []
      this.planEndDateArray = this.thirdMenuParam.planEndDateArray || []
    }
  },
  methods: {
    selectTask (selectDatas, ganttName) {
      this.selectedTasks = selectDatas
      this.ganttName = ganttName
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    tabBarExtraContent () { },
    showDetail (selectTask, ganttName, viewType) {
      this.detailVisible = true
      this.ganttName = ganttName
      this.selectTaskId = selectTask.id
      this.status = selectTask.status
      this.detailTitle = selectTask.name
      this.viewType = viewType
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
