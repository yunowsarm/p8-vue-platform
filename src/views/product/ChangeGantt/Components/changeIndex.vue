<template>
  <div style="height: 100%">
    <div class="couerDivClass" id="couerDiv">
      <div class="top" :style="{ height: commandButtonBarHeight }">
        <command-button-bar
          :panel-data="btnData"
          :selected-tasks="selectedTasks"
          :gantt-name="ganttName"
          :plan-info-id="planInfoId"
          @change-command-button="changeCommandButton"
        ></command-button-bar>
      </div>
      <div class="bottom" :class="expandBottom">
        <change-gantt
          :plan-info-id="planInfoId"
          :plan-info-status="planInfoStatus"
          :task-id="taskId"
          v-bind="$attrs"
          :secret-grade="secretGrade"
          :plan-attribute-drawer="detailVisible"
          :create-page="createPage"
          :change-id="changeId"
          :read-only="readOnly"
          @hide-drawer="detailDrawerClosed"
          @closed="closed"
          @select-task="selectTask"
          @show-detail="showDetail"
          @save-success="detailDrawerClosed"
          :task-status="taskStatus"
        ></change-gantt>
      </div>
    </div>
    <el-drawer
      style="width: 60%; left: auto"
      :title="detailTitle"
      :append-to-body="true"
      size="100%"
      :destroy-on-close="true"
      :wrapper-closable="false"
      :modal="false"
      @closed="detailDrawerClosed"
      :visible.sync="detailVisible"
    >
      <plan-attribute
        @save-success="detailDrawerClosed"
        :task-id="selectTaskId"
        v-bind="$attrs"
        :create-page="createPage"
        :secret-grade="secretGrade"
        :att-read-only="readOnly"
        :gantt-name="ganttName"
        :status="status"
        :plan-info-id="planInfoId"
      ></plan-attribute>
    </el-drawer>
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
</style>

<script>
import ChangeGantt from './changeGantt'
import { Drawer } from 'p8-components-ui'
import { CommandButtonBarDataDoubleRow } from '@/assets/commonJS/ganttJS/changeGantt/commandButtonBarDataDoubleRow'
import { CommandButtonBarDataSingleRow } from '@/assets/commonJS/ganttJS/changeGantt/commandButtonBarDataSingleRow'
import { CommandButtonBarData } from '@/assets/commonJS/ganttJS/changeGantt/commandButtonBarData'
import { ChangeGanttButtonBarData } from '@/assets/commonJS/ganttJS/changeGanttButtonBarData'
import CommandButtonBar from '@/components/gantt/Components/CommandButtonBar'
import PlanAttribute from '../../PlanGantt/Components/planAttribute'
import { mapGetters } from 'vuex'
import { deepClone } from '@/utils/common'
export default {
  name: 'ChangeIndex',
  data() {
    return {
      defaultKey: '1',
      advanced: false,
      selectedTasks: [],
      selectTaskId: '',
      detailVisible: false,
      detailTitle: '任务属性',
      drawerConfig: {
        modal: false
      },
      ganttName: '',
      barData: ChangeGanttButtonBarData,
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
    }
  },
  components: {
    'el-drawer': Drawer,
    ChangeGantt,
    PlanAttribute,
    CommandButtonBar
  },
  watch: {
    ganttButtonMode: {
      handler(val) {
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
    btnData() {
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
  mounted() {},
  methods: {
    selectTask(selectDatas, ganttName) {
      this.selectedTasks = selectDatas
      this.ganttName = ganttName
    },
    toggleAdvanced() {
      this.advanced = !this.advanced
    },
    tabBarExtraContent() {},
    showDetail(selectTask, ganttName, createPage) {
      this.createPage = createPage
      this.detailVisible = true
      this.ganttName = ganttName
      this.selectTaskId = selectTask.id
      this.status = selectTask.status
      this.detailTitle = selectTask.name
    },
    detailDrawerClosed(res) {
      this.detailVisible = false
      this.selectTaskId = ''
      this.detailTitle = ''
    },
    changeCommandButton(advance) {
      if (advance) {
        this.commandButtonBarHeight = '152px'
      } else {
        this.commandButtonBarHeight = '40px'
      }
    },
    closed(obj) {
      this.$emit('closed', obj)
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
