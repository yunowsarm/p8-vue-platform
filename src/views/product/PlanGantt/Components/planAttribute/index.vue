<template>
  <div style="height: 100%">
    <anchor placement="top"
            v-loading="loading"
            element-loading-text="加载中"
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.3)"
            :menu="anchorMenu"
            style-sheet="tabs"
            class="anchorCustom"
            style="margin-left: 10px">
      <template #describeKey>
        <!-- 任务描述组件 -->
        <describe-view-task v-if="type"
                            :key='taskId'
                            :task-id="taskId"></describe-view-task>
        <div v-else>
          <describe-edit v-if="isChangeGantt"
                         :key='taskId'
                         @closeLoading="closeLoading"
                         @saveSuccess="saveCallback"
                         :task-id="taskId"
                         :create-page="createPage"
                         :current-route="currentRoute"
                         :gantt-name="ganttName"
                         @refreshData="refreshData"
                         :plan-info-id="planInfoId"
                         :formWidth="formWidth"></describe-edit>
          <describe-view v-if="!isChangeGantt"
                         :key='taskId'
                         @closeLoading="closeLoading"
                         :task-id="taskId"
                         :gantt-name="ganttName"
                         :plan-info-id="planInfoId"
                         :formWidth="formWidth"></describe-view>
        </div>
      </template>
      <template #monitorKey>

        <!-- 任务标识组件 -->
        <monitor-view-task v-if="type"
                           :key='taskId'
                           :task-id="taskId"></monitor-view-task>
        <div v-else>
          <monitor-edit v-if="isView"
                        :key='taskId'
                        @saveSuccess="saveCallback"
                        @refreshData="refreshData"
                        :task-id="taskId"
                        :gantt-name="ganttName"
                        :formWidth="formWidth"></monitor-edit>
          <monitor-view v-if="!isView"
                        :key='taskId'
                        :task-id="taskId"
                        :gantt-name="ganttName"
                        :formWidth="formWidth"></monitor-view>
        </div>
      </template>
      <template #dependenceKey>

        <!-- 前置任务组件 -->
        <dependence-view-task v-if="type"
                              :key='taskId'
                              :task-id="taskId"></dependence-view-task>
        <div v-else>
          <dependence-edit v-if="isView"
                           :key='taskId'
                           @saveSuccess="saveCallback"
                           :task-id="taskId"
                           :gantt-name="ganttName"
                           :formWidth="formWidth"></dependence-edit>
          <dependence-view v-if="!isView"
                           :key='taskId'
                           :task-id="taskId"
                           :gantt-name="ganttName"
                           :formWidth="formWidth"></dependence-view>
        </div>
      </template>
      <template #inputKey>

        <!-- 输入要求组件 -->
        <input-view-task v-if="type"
                         :key='taskId'
                         :task-id="taskId"></input-view-task>
        <div v-else>
          <input-edit v-if="isView"
                      :key='taskId'
                      @saveSuccess="saveCallback"
                      :task-id="taskId"
                      :gantt-name="ganttName"
                      :formWidth="formWidth"></input-edit>
          <input-view v-if="!isView"
                      :key='taskId'
                      :task-id="taskId"
                      :gantt-name="ganttName"
                      :formWidth="formWidth"></input-view>
        </div>
      </template>
      <template #outputKey>
        <!-- 输出要求和已提交输出物的标签页 -->
        <el-tabs v-if="type"
                 :key='taskId'
                 v-model="activeOutput"
                 type="border-card">
          <el-tab-pane label="输出要求"
                       name="outputKey">
            <!-- 输出要求标签页内容 -->
            <span slot="label"><i class="p8 icon-shuchuyaoqiu"></i> 输出要求</span>
            <output-view-task :task-id="taskId"></output-view-task>
          </el-tab-pane>
          <el-tab-pane label="已提交输出物"
                       name="getOutputKey">
            <!-- 已提交输出物标签页内容 -->
            <span slot="label"><i class="p8 icon-yitijiaoshuchuwu"></i> 已提交输出物</span>
            <getOutPutViewTask :task-id="taskId"></getOutPutViewTask>
          </el-tab-pane>
        </el-tabs>
        <el-tabs v-else
                 :key='taskId'
                 v-model="activeOutput"
                 type="border-card">
          <el-tab-pane label="输出要求"
                       name="outputKey">
            <span slot="label"><i class="p8 icon-shuchuyaoqiu"></i> 输出要求</span>
            <output-edit v-if="isView"
                         @saveSuccess="saveCallback"
                         :task-id="taskId"
                         :gantt-name="ganttName"
                         :formWidth="formWidth"></output-edit>
            <output-view v-if="!isView"
                         :task-id="taskId"
                         :gantt-name="ganttName"
                         :formWidth="formWidth"></output-view>
          </el-tab-pane>
          <el-tab-pane label="已提交输出物"
                       name="getOutputKey">
            <span slot="label"><i class="p8 icon-yitijiaoshuchuwu"></i> 已提交输出物</span>
            <getOutPutView @saveSuccess="saveCallback"
                           :task-id="taskId"
                           :gantt-name="ganttName"
                           :formWidth="formWidth">
            </getOutPutView>
          </el-tab-pane>
        </el-tabs>

      </template>
      <template #getOutputKey>
        <!-- <output-view v-if="!isView" :task-id="taskId" :gantt-name="ganttName"></output-view> -->
      </template>
      <template #specialKey>

        <!-- 特别说明组件 -->
        <special-view-task v-if="type"
                           :key='taskId'
                           :task-id="taskId"></special-view-task>
        <div v-else>
          <special-edit v-if="isView"
                        :key='taskId'
                        @saveSuccess="saveCallback"
                        :task-id="taskId"
                        :gantt-name="ganttName"
                        :formWidth="formWidth"></special-edit>
          <special-view v-if="!isView"
                        :key='taskId'
                        :task-id="taskId"
                        :gantt-name="ganttName"
                        :formWidth="formWidth"></special-view>
        </div>
      </template>
      <template #businessForm>
        <businessForm v-if="isChangeView"
                      :task-id="taskId"
                      :key='taskId'
                      :wholeDescribeId="wholeDescribeId"
                      :gantt-name="ganttName"
                      @refreshData="refreshData"
                      :formWidth="formWidth"></businessForm>
        <businessFormView v-if="!isChangeView"
                          :task-id="taskId"
                          :key='taskId'
                          :gantt-name="ganttName"
                          :formWidth="formWidth"></businessFormView>
      </template>
      <template #demandKey>
        <relevance-edit v-if="isChangeView"
                        :task-id="taskId"
                        :key='taskId'
                        :wholeDescribeId="wholeDescribeId"
                        :gantt-name="ganttName"
                        @refreshData="refreshData"
                        :formWidth="formWidth"></relevance-edit>
        <relevance-list v-if="!isChangeView"
                        :task-id="taskId"
                        :key='taskId'
                        :gantt-name="ganttName"
                        :formWidth="formWidth"></relevance-list>
      </template>
      <template #linkedCollection>
        <linked-collection ref="linkedCollection"
                           :task-id="taskId"
                           :key='taskId'
                           :isChangeView="isChangeGantt"
                           :wholeDescribeId="wholeDescribeId"
                           title="关联收款合同"
                           :change-id="changeId"
                           :gantt-name="ganttName"
                           :formWidth="formWidth"></linked-collection>
      </template>
      <template #linkedPament>
        <linked-collection ref="linkedPament"
                           :task-id="taskId"
                           :key='taskId'
                           :change-id="changeId"
                           :isChangeView="isChangeGantt"
                           :wholeDescribeId="wholeDescribeId"
                           title="关联付款合同"
                           :gantt-name="ganttName"
                           :formWidth="formWidth"></linked-collection>
      </template>
      <!--   预算填报   -->
      <template #budget>
        <div>
          <budget :key='taskId' ref='budget' :task-id="taskId" :view='!isChangeView' @save-success='saveBudget'>
          </budget>
        </div>
      </template>
<!--   预算执行（实际收支）   -->
      <template #budgetExecution>
        <div style='height: 400px'>
          <budget-execution :key='taskId' ref='budgetExecution' :task-id="taskId">

          </budget-execution>
        </div>
      </template>
    </anchor>
  </div>
</template>

<script>
import DescribeEdit from '../describeEdit'
import DescribeView from '../describeEdit/describeView'
import MonitorEdit from '../monitorEdit'
import MonitorView from '../monitorEdit/monitorView'
import DependenceEdit from '../dependenceEdit'
import DependenceView from '../dependenceEdit/dependenceView'
import InputEdit from '../inputEdit'
import InputView from '../inputEdit/inputView'
import OutputView from '../outputEdit/outputView'
import OutputEdit from '../outputEdit'
import relevanceList from './relevanceList'
import linkedCollection from './linkedCollection'
import relevanceEdit from './relevanceEdit'
import getOutPutView from '../getOutputKeyView/outputViews'
// import getOutPutEdit from '../outputEdit'
import SpecialEdit from '../specialEdit'
import SpecialView from '../specialEdit/specialView'
import businessForm from '@/views/product/Repository/OutputFlow/Components/businessForm.vue'
import businessFormView from './businessFormView.vue'
import { P8Anchor as Anchor } from 'p8-components-ui'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import { mapGetters } from 'vuex'
// 导入任务描述组件
import describeViewTask from '@/views/Framework/Message/components/TaskDetail/DescribeView.vue' // 任务描述
// 导入任务标识组件
import MonitorViewTask from '@/views/Framework/Message/components/TaskDetail/MonitorView.vue' // 任务标识
// 导入前置任务组件
import DependenceViewTask from '@/views/Framework/Message/components/TaskDetail/DependenceView.vue' // 前置任务
// 导入输入要求组件
import inputViewTask from '@/views/Framework/Message/components/TaskDetail/InputView.vue' // 输入要求
// 导入输出要求组件
import OutputViewTask from '@/views/Framework/Message/components/TaskDetail/OutputView.vue' // 输出要求
// 导入已提交的输出物组件
import getOutPutViewTask from '@/views/Framework/Message/components/TaskDetail/GetOutputView.vue' // 已提交的输出物
// 导入特别说明组件
import SpecialViewTask from '@/views/Framework/Message/components/TaskDetail/SpecialView.vue' // 特别说明
// 导入预算填报
import Budget from '@/views/product/PlanGantt/Components/budget.vue'
// 导入预算执行
import BudgetExecution from '@/views/product/My/Work/Task/Components/taskOperating/BudgetExecution.vue'
export default {
  name: 'PlanAttribute',
  props: ['taskId', 'wholeDescribeId', 'ganttName', 'status', 'planInfoId', 'attReadOnly', 'createPage', 'currentRoute', 'viewType', 'defaultPercent', 'viewWidth', 'type', 'changeId'],
  components: {
    getOutPutView,
    DescribeEdit,
    MonitorEdit,
    DependenceEdit,
    InputEdit,
    InputView,
    OutputEdit,
    SpecialEdit,
    Anchor,
    DescribeView,
    MonitorView,
    OutputView,
    DependenceView,
    SpecialView,
    relevanceList,
    relevanceEdit,
    businessForm,
    businessFormView,
    linkedCollection,
    describeViewTask,
    MonitorViewTask,
    OutputViewTask,
    inputViewTask,
    DependenceViewTask,
    getOutPutViewTask,
    SpecialViewTask,
    Budget,
    BudgetExecution
  },
  computed: {
    formWidth () {
      const width = this.viewWidth ? this.viewWidth : this.windowWidth
      // 计算指定容器宽度相对于 100vw 的比例
      const vwRatio = width / window.innerWidth
      // 调整原来的计算公式
      return Number(((100 - this.defaultPercent - (110 / width) * 100) * vwRatio).toFixed(2))
    },
    ...mapGetters(['vueThis'])
  },
  // created () {
  //   console.log('2222')
  //
  // },
  beforeDestroy () {
    window.removeEventListener('resize', this.updateWindowWidth)
  },
  watch: {},
  created: function () {
    window.addEventListener('resize', this.updateWindowWidth)
    if (this.type) {
      this.isChangeGantt = false
      this.isView = false
      this.isChangeView = false
      this.loading = false
    } else {
      if (this.vueThis.planEditLock === '0') {
        this.isChangeGantt = true
        this.isView = true
        this.isChangeView = true
      } else if (this.vueThis.planEditLock === '1') {
        this.isChangeGantt = false
        this.isView = false
        this.isChangeView = false
      } else {
        // isView为true时是修改页面，为false时是查看页面
        if (this.taskId && this.ganttName) {
          const ganttObject = GanttObject.getGanttObject(this.ganttName)
          // 计划编制不可编辑状态字段
          const task = ganttObject.getTask(this.taskId)
          if (this.ganttName == 'planGantt' && ['6409', '6404', '6405', '6406'].includes(task.managerStatus)) {
            this.isChangeGantt = false
          }
          // 计划变更不可编辑状态字段
          if (this.ganttName == 'changeGantt' && (task.managerStatus == '6405' || task.managerStatus == '6409' || task.managerStatus == '6406')) {
            this.isChangeGantt = false
          }
          // 审批页面都不可编辑
          if (this.ganttName == 'analysisGantt') {
            this.isChangeGantt = false
            this.isView = false
            this.isChangeView = false
          }
          if (this.viewType === 'view') {
            this.isView = false
            this.isChangeView = false
            this.isChangeGantt = false
          } else if (this.attReadOnly || ganttObject.config.readonly) {
            this.isView = false
            this.isChangeView = false
          } else {
            // 获取gannt操作限制策略
            const taskStatusLockMap = this.$store.getters.taskStatusLockMap
            const vueThis = this.$store.getters.vueThis
            const task = ganttObject.getTask(this.taskId)
            const editManagerStatus = taskStatusLockMap[task.status]
            if (editManagerStatus && editManagerStatus.indexOf(task.managerStatus) === -1) {
              this.isView = false
              this.isChangeView = false
            }
            // 发布后可控任务不可修改
            if (task.readonly) {
              this.isView = false
              this.isChangeView = false
            }
            // if (this.$route.path === '/TaskChange') {
            //   this.isView = true
            // }
            if (task.managerStatus === '6404' && this.ganttName === 'changeGantt') {
              // 已下发
              this.isView = true
              this.isChangeView = true
            }
            if (task.managerStatus === '6404' && this.ganttName != 'changeGantt') {
              // 已下发
              this.isView = false
              this.isChangeView = false
            }
            if (task.managerStatus === '6403' && this.createPage === 'decompose') {
              this.isView = true
              this.isChangeView = true
            }

            if (task.createSource === '0' && this.createPage === 'decompose') {
              this.isView = false
              this.isChangeView = false
            }
            // if (this.ganttName === 'changeGantt' && vueThis.createPage === 'userChange') {
            //   // 计划变更
            //   const loginUserName = this.$store.state.user.userInfo.realName
            //   if (task.realName && task.realName !== loginUserName) {
            //     // 任务存在责任人且责任人非当前登录人则不可编辑
            //     this.isView = false
            //   }
            // }
            if (this.ganttName === 'changeGantt') {
              this.isChangeView = false
            }
            if (task.infoType === 'delete') {
              this.isView = false
              this.isChangeView = false
            }
            // 责任人变更页面，责任人只能操作当前任务及其子
            // let parent = ganttObject.getTask(task.parent)
            // if (this.ganttName === 'changeGantt' && vueThis.createPage === 'userChange' && !ganttObject.isChildOf(this.taskId, vueThis.taskId) && this.taskId !== vueThis.taskId) {
            //   this.isView = false
            // }
          }
          if (this.ganttName !== 'changeGantt' && task.managerStatus === '6407') {
            this.isChangeGantt = false
            this.isView = false
            this.isChangeView = false
          }
        }
      }
    }
    console.log(this.readOnly, '1111111111111111111111111readOnly');

  },
  data () {
    return {
      defaultActive:0,
      headerVisible: false,
      isView: true,
      loading: true,
      isChangeView: true,
      isEdit: true,
      isChangeGantt: true,
      activeOutput: 'outputKey',
      anchorMenu: [
        { label: '任务描述', value: 'describeKey', icon: 'p8 icon-jindu' },
        { label: '任务标识', value: 'monitorKey', icon: 'p8 icon-rizhiliebiao1' },
        { label: '前置任务', value: 'dependenceKey', icon: 'p8 icon-xuanxiang1' },
        { label: '输入要求', value: 'inputKey', icon: 'p8 icon-shuruyaoqiu', hideLabel: true },
        { label: '输出要求', value: 'outputKey', icon: 'p8 icon-shuchuyaoqiu', hideLabel: true },
        { label: '特别说明', value: 'specialKey', icon: 'p8 el-icon-warning-outline' },
        { label: '业务表单', value: 'businessForm', icon: 'el-icon-s-order' },
        { label: '关联需求', value: 'demandKey', icon: 'p8 icon-a-xuqiu1' },
        { label: '关联收款', value: 'linkedCollection', icon: 'p8 icon-output-process-manage' },
        { label: '关联付款', value: 'linkedPament', icon: 'p8 icon-output-process-manage' },
        { label: '预算', value: 'budget', icon: '' },
        { label: '实际收支', value: 'budgetExecution', icon: '' }
      ],
      windowWidth: window.innerWidth
    }
  },
  methods: {
    saveBudget(){
      this.$emit('saveBudget')
    },
    getDefaultActive(active){
      this.defaultActive = active
      console.log(this.defaultActive,'this.defaultActive')
    },
    closeLoading () {
      this.loading = false
    },
    onSelect (tab, event) {
      this.activeKey = tab.name
    },
    saveCallback (res) { },
    refreshData (res) {
      this.$emit('refreshData', res)
    },
    updateWindowWidth () {
      this.windowWidth = window.innerWidth
    }
  }
}
</script>
<style lang="scss" scoped>
.scroll-area {
  height: 100%;
  padding: 0 6px;
}

.formList.el-form > .el-row.formBtn {
  border-top: none;
}

::v-deep .el-tabs__content {
  padding: 0 !important;
}
.anchorCustom {
  ::v-deep .p8-anchor-slider--wrap__column {
    height: 40px !important;
  }
  ::v-deep .p8-anchor-slider--item__normal {
    width: 80px;
    height: 30px;
    line-height: 30px;
  }
}
::v-deep .main-table{
  height: 400px !important;
}
</style>
