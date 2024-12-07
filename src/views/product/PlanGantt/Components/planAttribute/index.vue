<template>
  <div style="height: 100%">
    <anchor placement="left"
            :menu="anchorMenu"
            style-sheet="tabs"
            style="margin-left: 10px;">
      <template #describeKey>
        <describe-edit v-if="isChangeGantt"
                       @saveSuccess="saveCallback"
                       :task-id="taskId"
                       :create-page="createPage"
                       :current-route="currentRoute"
                       :gantt-name="ganttName"
                       @refreshData="refreshData"
                       :plan-info-id="planInfoId"
                       :formWidth="formWidth"></describe-edit>
        <describe-view v-if="!isChangeGantt"
                       :task-id="taskId"
                       :gantt-name="ganttName"
                       :plan-info-id="planInfoId"
                       :formWidth="formWidth"></describe-view>
      </template>
      <template #monitorKey>
        <monitor-edit v-if="isView"
                      @saveSuccess="saveCallback"
                      @refreshData="refreshData"
                      :task-id="taskId"
                      :gantt-name="ganttName"
                      :formWidth="formWidth"></monitor-edit>
        <monitor-view v-if="!isView"
                      :task-id="taskId"
                      :gantt-name="ganttName"
                      :formWidth="formWidth"></monitor-view>
      </template>
      <template #dependenceKey>
        <dependence-edit v-if="isView"
                         @saveSuccess="saveCallback"
                         :task-id="taskId"
                         :gantt-name="ganttName"
                         :formWidth="formWidth"></dependence-edit>
        <dependence-view v-if="!isView"
                         :task-id="taskId"
                         :gantt-name="ganttName"
                         :formWidth="formWidth"></dependence-view>
      </template>
      <template #inputKey>
        <input-edit v-if="isView"
                    @saveSuccess="saveCallback"
                    :task-id="taskId"
                    :gantt-name="ganttName"
                    :formWidth="formWidth"></input-edit>
        <input-view v-if="!isView"
                    :task-id="taskId"
                    :gantt-name="ganttName"
                    :formWidth="formWidth"></input-view>
      </template>
      <template #outputKey>
        <el-tabs v-model="activeOutput"
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
                           :formWidth="formWidth"></getOutPutView>
          </el-tab-pane>
        </el-tabs>
      </template>
      <template #getOutputKey>
        <!-- <output-view v-if="!isView" :task-id="taskId" :gantt-name="ganttName"></output-view> -->
      </template>
      <template #specialKey>
        <special-edit v-if="isView"
                      @saveSuccess="saveCallback"
                      :task-id="taskId"
                      :gantt-name="ganttName"
                      :formWidth="formWidth"></special-edit>
        <special-view v-if="!isView"
                      :task-id="taskId"
                      :gantt-name="ganttName"
                      :formWidth="formWidth"></special-view>
      </template>
      <template #demandKey>
        <relevance-edit v-if="isView"
                        :task-id="taskId"
                        :wholeDescribeId="wholeDescribeId"
                        :gantt-name="ganttName"
                        @refreshData="refreshData"
                        :formWidth="formWidth"></relevance-edit>
        <relevance-list v-if="!isView"
                        :task-id="taskId"
                        :gantt-name="ganttName"
                        :formWidth="formWidth"></relevance-list>
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
import relevanceEdit from './relevanceEdit'
import getOutPutView from '../getOutputKeyView/outputViews'
// import getOutPutEdit from '../outputEdit'
import SpecialEdit from '../specialEdit'
import SpecialView from '../specialEdit/specialView'
import { P8Anchor as Anchor } from 'p8-components-ui'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
export default {
  name: 'PlanAttribute',
  props: ['taskId', 'wholeDescribeId', 'ganttName', 'status', 'planInfoId', 'attReadOnly', 'createPage', 'currentRoute', 'viewType', 'defaultPercent'],
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
    relevanceEdit
  },
  computed: {
    formWidth () {
      return (100 - this.defaultPercent - (150 / this.windowWidth * 100)).toFixed(2);
    }
  },
  created () {
    window.addEventListener('resize', this.updateWindowWidth);
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.updateWindowWidth);
  },
  watch: {},
  mounted: function () {
    // isView为true时是修改页面，为false时是查看页面
    if (this.taskId && this.ganttName) {
      const ganttObject = GanttObject.getGanttObject(this.ganttName)
      // 计划编制不可编辑状态字段
      const task = ganttObject.getTask(this.taskId)
      if (this.ganttName == 'planGantt' && (task.managerStatus == '6409' || task.managerStatus == '6404' || task.managerStatus == '6406')) {
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
      }
      if (this.viewType === 'view') {
        this.isView = false
        this.isChangeGantt = false
      } else if (this.attReadOnly || ganttObject.config.readonly) {
        this.isView = false
      } else {
        // 获取gannt操作限制策略
        const taskStatusLockMap = this.$store.getters.taskStatusLockMap
        const vueThis = this.$store.getters.vueThis
        const task = ganttObject.getTask(this.taskId)
        const editManagerStatus = taskStatusLockMap[task.status]
        if (editManagerStatus && editManagerStatus.indexOf(task.managerStatus) === -1) {
          this.isView = false
        }
        // 发布后可控任务不可修改
        if (task.readonly) {
          this.isView = false
        }
        // if (this.$route.path === '/TaskChange') {
        //   this.isView = true
        // }
        if (task.managerStatus === '6404' && this.ganttName === 'changeGantt') {
          // 已下发
          this.isView = true
        }
        if (task.managerStatus === '6404' && this.ganttName != 'changeGantt') {
          // 已下发
          this.isView = false
        }
        if (task.managerStatus === '6403' && this.createPage === 'decompose') {
          this.isView = true
        }

        if (task.createSource === '0' && this.createPage === 'decompose') {
          this.isView = false
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
          this.isView = false
        }
        if (task.infoType === 'delete') {
          this.isView = false
        }
        // 责任人变更页面，责任人只能操作当前任务及其子
        // let parent = ganttObject.getTask(task.parent)
        // if (this.ganttName === 'changeGantt' && vueThis.createPage === 'userChange' && !ganttObject.isChildOf(this.taskId, vueThis.taskId) && this.taskId !== vueThis.taskId) {
        //   this.isView = false
        // }
      }
      if (task.managerStatus === '6407') {
        this.isChangeGantt = false
        this.isView = false
      }
    }
    console.log(this.isChangeGantt, 'this.isChangeGanttthis.isChangeGanttthis.isChangeGantt');

  },
  data () {
    return {
      headerVisible: false,
      isView: true,
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
        { label: '关联需求', value: 'demandKey', icon: 'p8 icon-a-xuqiu1' }
      ],
      windowWidth: window.innerWidth
    }
  },
  methods: {
    onSelect (tab, event) {
      this.activeKey = tab.name
    },
    saveCallback (res) { },
    refreshData (res) {
      this.$emit('refreshData', res)
    },
    updateWindowWidth () {
      this.windowWidth = window.innerWidth;
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
</style>
