<template>
  <el-tabs class="progressTaskTabs"
           v-if="taskTabs.length"
           v-model="tabsActiveName"
           @tab-click="tabsClick">
    <el-tab-pane v-for="item in taskTabs"
                 :key="item.name"
                 :label="item.label"
                 :name="item.name">
      <!-- 进度反馈 -->
      <template v-if="item.name === 'progess' && tabsActiveName == item.name">
        <progess v-if="progessType !== 'progessTable'"
                 ref="progess"
                 :taskFinish="taskFinish"
                 :tabsName="tabsName"
                 :durationDay="durationDay"
                 :approve="approve"
                 :exceedType="exceedType"
                 :checkBusinessForm="checkBusinessForm"
                 @dialogOk="dialogOk"
                 @dialogClose="dialogClose"></progess>
        <progess-table v-else
                       ref="progessTable"></progess-table>
      </template>
      <!-- 工作统筹 -->
      <template v-if="item.name === 'workCoordination' && tabsActiveName == item.name">
        <span slot="label">{{item.label}}</span>
        <work-coordination ref="workCoordination"></work-coordination>
      </template>
      <!-- 未完成原因 -->
      <template v-if="item.name === 'unfinishedCause' && tabsActiveName == item.name">
        <span slot="label">{{item.label}}</span>
        <deviate ref="deviate"
                 :taskFinish="taskFinish"
                 :tabsName="tabsName"></deviate>
      </template>
      <!-- 业务表单 -->
      <template>
        <FormRender v-if="item.editMode === '单数据'"
                    :ref="item.name"
                    :item="item"
                    :approveType="progessType !==  'progessTable'"
                    :key="item.name"></FormRender>
        <multiple-form-table v-else-if="item.editMode === '多数据'"
                             :ref="item.name"
                             :key="item.name"
                             :approveType="progessType !== 'progessTable'"
                             :item="item"></multiple-form-table>
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
import multipleFormTable from './components/multipleFormTable'
import FormRender from './components/formRender.vue'
export default {
  name: 'TaskTabsView',
  inject: ['getPlanInfo'],
  components: {
    Progess,
    Deviate,
    ProgessTable,
    WorkCoordination,
    'el-tabs': Tabs,
    'el-tab-pane': TabPane,
    multipleFormTable,
    FormRender
  },
  props: {
    // 是否审批页面
    approveType: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      progessType: '',
      formViewId: '',
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
      exceedType: false,
      approve: false,
      tabsName: 'progess',
      taskFinish: false,
      taskbusinessForm: []
    }
  },
  async created () {
    this.taskbusinessForm = await this.getTaskForm()
    this.taskbusinessForm = this.taskbusinessForm.map(el => {
      return { label: el.formName, name: el.id, formCode: el.formCode, editMode: el.editMode, isRequired: el.isRequired, formId: el.formId }
    })
    // 判断任务是否超期
    if (!this.durationDay) {
      // 超期
      if (moment(moment().format('YYYY-MM-DD')).isAfter(moment(this.getPlanInfo().PLANENDDATE))) {
        this.durationDay = false
        if (this.approveType) {
          this.approve = true
        }
        // 未超期
      } else {
        this.durationDay = true
        if (this.approveType) {
          this.approve = false
        }
      }
    }
    let taskTabs = []
    let tabsActiveName = ''
    // 已下发
    if (this.getPlanInfo().MANAGERSTATUS === '6404') {
      tabsActiveName = 'progess'
      taskTabs = this.taskTabsProgess
    }
    // 未开始
    if (this.getPlanInfo().STATUS === '6020') {
      tabsActiveName = 'progess'
      taskTabs = [...this.taskTabsProgess, ...this.taskTabsUnfinished]
    }
    // 进行中
    if (this.getPlanInfo().STATUS === '6050') {
      tabsActiveName = 'progess'
      taskTabs = [...this.taskTabsProgess, ...this.taskTabsUnfinished]
    }
    // 已完成
    if (this.getPlanInfo().STATUS === '6070' || this.getPlanInfo().MANAGERSTATUS === '6406') {
      tabsActiveName = 'progess'
      this.progessType = 'progessTable'
      taskTabs = [...this.taskTabsProgess, ...this.taskTabsUnfinished]
    }
    // 统筹中
    if (this.getPlanInfo().MANAGERSTATUS === '6402') {
      tabsActiveName = 'workCoordination'
      taskTabs = this.taskTabsWork
    }
    this.tabsActiveName = tabsActiveName
    let index = taskTabs.findIndex(item => item.name === 'progess')
    if (index !== -1) {
      taskTabs.splice(index + 1, 0, ...this.taskbusinessForm)
    }
    this.$nextTick(() => {
      this.taskTabs = taskTabs
    })
    await this.getTaskFinish()
  },
  methods: {
    async getTaskForm () {
      let api = 'planGanttManager.taskFormInfo'
      let params = { taskId: this.getPlanInfo().TASKID }
      let result = this.$api[api](params)
      return result
    },

    getTaskFinish () {
      this.$api['PlanGanttSetting.getSchedulingBasicConfig']().then((res) => {
        let taskFinish = res.taskFinish && res.taskFinish.content ? res.taskFinish.content : ''
        if (taskFinish === '手动') {
          this.taskFinish = true
        }
      })
    },
    tabsClick (val) {
      this.tabsName = val.name
    },
    // 切换页面不继续弹出超期提示框
    dialogOk (val) {
      this.durationDay = val
      this.exceedType = val
    },
    dialogClose () {
      if (this.getPlanInfo().MANAGERSTATUS === '6406') {
        this.progessType = 'progessTable'
      }
    },
    checkBusinessForm () {
      let that = this
      let flag = true
      let formName = []
      this.taskbusinessForm.forEach(el => {
        if (el.isRequired == '是' && that.$refs[el.name]) {
          if (!that.$refs[el.name][0].checkBusinessForm()) {
            formName.push(el.label)
            flag = false
          }
        }
      })
      return { flag: flag, message: formName.join('、') }
    }
  }
}
</script>
<style lang="scss" scoped>
.progressTaskTabs.el-tabs {
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
  // padding: 0 10px;
  height: calc(100% - 40px);
  overflow: auto;
}
.progressTaskTabs ::v-deep .el-tab-pane {
  height: 100%;
}
.el-tabs--border-card {
  border: 0;
}
</style>
