<template>
  <el-tabs class="progressTaskTabs"
           v-model="tabsActiveName"
           type="border-card"
           @tab-click="tabsClick">
    <el-tab-pane v-for="item in taskTabs"
                 :key="item.name"
                 :label="item.label"
                 :name="item.name">
      <!-- 进度反馈 -->
      <template v-if="tabsActiveName === 'progess'">
        <!-- <progess ref="progess"></progess> -->
        <progess v-if="progessType !== 'progessTable'"
                 ref="progess"
                 :durationDay="durationDay"
                 :exceedType="exceedType"
                 @dialogOk="dialogOk"></progess>
        <progess-table v-else
                       ref="progessTable"></progess-table>
      </template>
      <!-- 工作统筹 -->
      <template v-if="tabsActiveName === 'workCoordination'">
        <span slot="label">{{item.label}}</span>
        <work-coordination ref="workCoordination"></work-coordination>
      </template>
      <!-- 未完成原因 -->
      <template v-if="tabsActiveName === 'unfinishedCause'">
        <span slot="label">{{item.label}}</span>
        <deviate ref="deviate"></deviate>
      </template>
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import moment from 'moment'
import { Tabs, TabPane } from 'p8-components-ui'
import Progess from './Progess'
import ProgessTable from './ProgessTable'
import Deviate from './Deviate'
import WorkCoordination from './WorkCoordination'
export default {
  name: 'TaskTabsView',
  inject: ['getPlanInfo'],
  components: {
    Progess,
    Deviate,
    ProgessTable,
    WorkCoordination,
    'el-tabs': Tabs,
    'el-tab-pane': TabPane
  },
  data () {
    return {
      progessType: '',
      taskTabs: [],
      taskTabsProgess: [
        { label: '进度反馈', name: 'progess' }
      ],
      taskTabsWork: [
        { label: '工作统筹', name: 'workCoordination' }
      ],
      taskTabsUnfinished: [
        { label: '未完成原因', name: 'unfinishedCause' }
      ],
      tabsActiveName: '',
      durationDay: false,
      exceedType: false
    }
  },
  mounted () {
    // 超期
    if (!this.durationDay) {
      if (moment(moment().format('YYYY-MM-DD')).isAfter(moment(this.getPlanInfo().planEndDate))) {
        this.durationDay = false
        // 未超期
      } else {
        this.durationDay = true
      }
    }
    let taskTabs = []
    // 已下发
    if (this.getPlanInfo().managerStatus === '6404') {
      this.tabsActiveName = 'progess'
      taskTabs = this.taskTabsProgess
    }
    // 统筹中
    if (this.getPlanInfo().managerStatus === '6402') {
      this.tabsActiveName = 'workCoordination'
      taskTabs = this.taskTabsWork
    }
    // 未开始
    if (this.getPlanInfo().status === '6020') {
      this.tabsActiveName = 'progess'
      taskTabs = [...this.taskTabsProgess, ...this.taskTabsUnfinished]
    }
    // 进行中
    if (this.getPlanInfo().status === '6050') {
      this.tabsActiveName = 'progess'
      taskTabs = [...this.taskTabsProgess, ...this.taskTabsUnfinished]
    }
    // 已完成
    if (this.getPlanInfo().status === '6070') {
      this.tabsActiveName = 'progess'
      this.progessType = 'progessTable'
      taskTabs = [...this.taskTabsProgess, ...this.taskTabsUnfinished]
    }
    this.$nextTick(() => {
      this.taskTabs = taskTabs
    })
  },
  methods: {
    tabsClick () {
    },
    // 切换页面不继续弹出超期提示框
    dialogOk (val) {
      this.durationDay = val
      this.exceedType = val
    }
  }
}
</script>
<style lang="scss" scoped>
.progressTaskTabs.el-tabs {
  background-color: #ffffff;
  height: 100%;
}
.progressTaskTabs ::v-deep .el-tabs__header {
  margin: 0;
}
.progressTaskTabs ::v-deep .el-tabs__nav-wrap {
  background-color: #f5f7fa;
  padding: 0 14px;
  &::after {
    height: 0px;
  }
}
.progressTaskTabs ::v-deep .el-tabs__content {
  padding: 0 10px;
  height: calc(100% - 40px);
}
.progressTaskTabs ::v-deep .el-tab-pane {
  height: 100%;
}
.el-tabs--border-card {
  border: 0;
}
</style>
