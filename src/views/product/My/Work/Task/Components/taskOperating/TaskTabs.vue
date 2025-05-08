<template>
  <el-tabs class="progressTaskTabs scrollable-tabs"
           ref="tabsContainer"
           v-if="taskTabs.length"
           v-model="tabsActiveName"
           @tab-click="tabsClick">
    <el-tab-pane v-for="item in taskTabs"
                 :key="item.name"
                 :label="item.label"
                 :name="item.name">
      <div class="tab-content-wrapper"
           :class="{ 'is-maximized': maximizedTabs[item.name] }">
        <!-- 最大化/最小化按钮 -->
        <div class="tab-actions">
          <i :class="maximizedTabs[item.name] ? 'p8 icon-exit-fullscreen' : 'p8 icon-full-screen'"
             @click="toggleMaximize(item.name)"></i>
        </div>
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
      </div>
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
      maximizedTabs: {}, // 记录每个标签页的最大化状态
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
      taskbusinessForm: [],
      scrollContainer: null
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
    this.taskTabs = taskTabs
    await this.getTaskFinish()
    this.$nextTick(() => {
      this.initScrollHandler()
      this.hideScrollbar()
    })
  },
  beforeDestroy() {
    this.removeScrollHandler()
  },
  methods: {
    initScrollHandler() {
      const tabsEl = this.$refs.tabsContainer.$el
      this.scrollContainer = tabsEl.querySelector('.el-tabs__nav-scroll')
      if (this.scrollContainer) {
        this.scrollContainer.addEventListener(
          'wheel',
          this.handleWheel,
          { passive: false }
        )
        // 添加鼠标移入移出监听
        this.scrollContainer.addEventListener(
          'mouseenter',
          this.hideScrollbar
        )
        this.scrollContainer.addEventListener(
          'mouseleave',
          this.hideScrollbar
        )
      }
    },
    removeScrollHandler() {
      if (this.scrollContainer) {
        this.scrollContainer.removeEventListener(
          'wheel',
          this.handleWheel
      )
        this.scrollContainer.removeEventListener(
          'mouseenter',
          this.hideScrollbar
        )
        this.scrollContainer.removeEventListener(
          'mouseleave',
          this.hideScrollbar
        )
      }
    },
    handleWheel(event) {
      if (event.shiftKey) {
        event.preventDefault()
        const delta = Math.sign(event.deltaY)
        // 更平滑的滚动，调整乘数系数
        this.scrollContainer.scrollLeft += delta * 60
      }
    },
    hideScrollbar() {
      // 强制隐藏滚动条
      if (this.scrollContainer) {
        this.scrollContainer.style.overflow = 'hidden'
      }
    },
    toggleMaximize (tabName) {
      this.$set(this.maximizedTabs, tabName, !this.maximizedTabs[tabName])
    },
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
  position: relative;
}

.tab-content-wrapper {
  background: #fff;
  position: relative;
  height: calc(100% - 10px); // 修改：底部留出10px空间
  margin-bottom: 10px; // 添加：确保底部间距
  transition: all 0.3s;

  &.is-maximized {
    ::v-deep .parser-container{
      height: calc(100% - 20px);
    }
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: calc(100vh - 20px);
    background: #fff;
    z-index: 99999;
    padding-top: 20px;
    .tab-actions { // 添加：确保最大化时图标可见
      position: fixed;
      right: 20px;
      top: 20px;
    }
  }
}

.tab-actions {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 99999; // 修改：提高图标层级
  
  i {
    cursor: pointer;
    font-size: 18px;
    color: #606266;
    padding: 5px; // 添加：增加可点击区域
    
    &:hover {
      color: #409eff;
    }
  }
}
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
  height: calc(100% - 10px);
}
.el-tabs--border-card {
  border: 0;
}
</style>
