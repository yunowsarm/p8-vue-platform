<template>
  <div style="height: 100%">
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
      <div ref="myGantt" style="width: 100%; height: calc(100% - 40px) !important"></div>
      <div class="detail_div">
        <div style="width: 50%">
          <span style="margin-left: 16px">选中任务：</span>
          <span @click="showDetail" class="detail_span">{{ selectTaskName }}</span>
        </div>
        <div style="width: 50%">
          <span style="float: right; margin-right: 20px; line-height: 40px">已选中 {{ selectTaskCount }} 条</span>
          <span style="float: right; margin-right: 20px; line-height: 40px">合计 {{ taskCount }} 条</span>
        </div>
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
      <plan-attribute @save-success="detailDrawerClosed" :task-id="selectTaskId" :att-read-only="readOnly" :gantt-name="ganttName" :plan-info-id="planInfoId"></plan-attribute>
    </el-drawer>
  </div>
</template>
<style lang="scss">
@import '~p8-dhtmlx-gantt/codebase/dhtmlxgantt.css';
@import '@/assets/commonJS/ganttJS/ganttObject.css';

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
<style type="text/css" media="screen">
html,
body {
  margin: 0px;
  padding: 0px;
  height: 100%;
  overflow: hidden;
}
</style>
<script>
import CommandButtonBar from '@/components/gantt/Components/CommandButtonBar'
import { CommandButtonBarDataDoubleRow } from '@/assets/commonJS/ganttJS/changeGantt/commandButtonBarDataDoubleRow'
import { CommandButtonBarDataSingleRow } from '@/assets/commonJS/ganttJS/changeGantt/commandButtonBarDataSingleRow'
import { CommandButtonBarData } from '@/assets/commonJS/ganttJS/changeGantt/commandButtonBarData'
import PlanAttribute from '../../PlanGantt/Components/planAttribute'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import { Drawer } from 'p8-components-ui'
import { mapGetters } from 'vuex'
import { getAnalysisGantt } from '@/assets/commonJS/ganttJS/analysisGanttObject'
import { deepClone } from '@/utils/common'
let myGantt
export default {
  name: 'AnalysisGantt',
  props: {
    planInfoId: {
      type: String,
      default: null
    },
    taskId: {
      type: String,
      default: null
    },
    createPage: {
      type: String,
      default: null
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    planAttributeDrawer: {
      // 接收--父级[changeIndex.vue]中抽屉隐藏显示的字段-detailVisible. 列表选择时-该值为true,更新抽屉中的内容
      type: Boolean,
      default: false
    },
    changeId: {
      type: String,
      default: null
    },
    taskStatus: {
      type: Object,
      default: null
    }
  },
  components: {
    'el-drawer': Drawer,
    PlanAttribute,
    CommandButtonBar
  },
  data() {
    return {
      ganttName: 'analysisGantt',
      selectedTasks: [],
      resourceConfig: {},
      resourceTemplates: {},
      selectTaskId: '',
      selectTaskName: '',
      detailVisible: false,
      detailTitle: '任务属性',
      taskCount: '', // 任务总数
      selectTaskCount: '', // 选中任务数量
      taskClassifyDatas: [],
      monitorPointDatas: [],
      searchForm: {},
      monitorLockMap: {}, // 标识锁定状态
      newTaskMap: {}, // 任务变更后新数据Map对象
      oldTaskMap: {}, // 任务变更原始数据Map对象
      addCount: 0,
      deleteCount: 0,
      modifyCount: 0,
      dependentDatas: [],
      managerStatusMap: {}, // 管理状态全部数据
      createTaskStatus: '', // 新建任务状态
      changeTaskInfo: {},
      changeRecordId: '',
      advance: true,
      commandButtonBarHeight: this.ganttButtonMode === 'tabs' ? '145px' : this.ganttButtonMode === 'double' ? '72px' : '58px'
    }
  },
  watch: {
    selectedTasks: function (newVal, oldVal) {
      if (newVal && newVal.length === 1 && myGantt.getGlobalTaskIndex(newVal[0].id) !== 0) {
        this.selectTaskId = newVal[0].id
        this.selectTaskName = newVal[0].name
        if (this.planAttributeDrawer) {
          this.showDetail()
        }
      } else {
        this.selectTaskId = ''
        this.selectTaskName = ''
        if (this.planAttributeDrawer) {
          this.$emit('hide-drawer')
        }
      }
      this.selectTaskCount = newVal.length
      if (newVal !== oldVal) {
        this.callParentSelectTasks()
      }
    },
    planInfoId: function (newVal, oldVal) {
      if (newVal) {
        this.changeRecordId = this.changeId
        this.initGantt(this.planInfoId, this.changeRecordId)
        this.callParentSelectTasks()
      }
    },
    changeId: function (newVal, oldVal) {
      if (newVal) {
        this.changeRecordId = newVal
      }
    },
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
  mounted() {
    this.changeRecordId = this.changeId
    this.initGantt(this.planInfoId, this.changeRecordId)
  },
  computed: {
    isDisable() {
      const that = this
      return function (btnConfig) {
        const btnData = that.buttonDatas.filter((btn) => btn.id === btnConfig.buttonId)
        return btnData[0].isDisableFun(null, this.ganttName, this.selectedTasks)
      }
    },
    buttonData() {
      const that = this
      return function (btnConfig) {
        const btnData = that.buttonDatas.filter((btn) => btn.id === btnConfig.buttonId)
        return btnData[0]
      }
    },
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
        const NewCommandButtonBarDataTabsRow = deepClone(CommandButtonBarData)
        const tabsRow = NewCommandButtonBarDataTabsRow.filter((item) => {
          return item.panelName !== '查询'
        })
        return this.ganttButtonMode === 'tabs' ? tabsRow : this.ganttButtonMode === 'double' ? CommandButtonBarDataDoubleRow : CommandButtonBarDataSingleRow
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
  methods: {
    initGantt(planInfoId, changeRecordId) {
      const vueThis = this
      // 清空原有数据
      if (myGantt) {
        GanttObject.setGanttObject(vueThis.ganttName, {})
      }
      // vuex存放
      vueThis.$store.dispatch('setVueThis', vueThis)
      // 初始化对象
      myGantt = getAnalysisGantt(vueThis.ganttName, vueThis)
      myGantt.config.scale_height = 50
      myGantt.ext.zoom.init(GanttObject.zoomConfig(myGantt))
      myGantt.config.layout = GanttObject.layout1
      // 渲染对象
      myGantt.init(this.$refs.myGantt)
      // 加载数据
      this.loadGanttData(this.planInfoId, this.taskId, this.createPage, changeRecordId)
    },
    loadGanttData(planInfoId, taskId, createPage, changeRecordId) {
      const vueThis = this
      vueThis.$api['planGanttManager.loadPlanGanttData']({ planInfoId: planInfoId, dicType: 'ACTIVITY_TYPE', taskId: taskId, createPage: createPage, changeRecordId: changeRecordId, type: '3' })
        .then(function (res) {
          if (res) {
            // 初始化数据
            let initData
            initData = res.tasks.map(item => {
              let obj = {}
              if (res.changeTaskInfo && res.changeTaskInfo[item.id] && res.changeTaskInfo[item.id].id) {
                obj = {
                  ...item,
                  // ...res.changeTaskInfo[item.id],
                  oldName: res.changeTaskInfo[item.id].oldName
                }
              } else {
                obj = {
                  ...item
                }
              }
              return obj
            })
            let datas = {
              tasks: initData,
              links: res.links
            }
            myGantt.$resourcesStore.parse(res.resources)
            myGantt.serverList(myGantt.config.monitor_point, res.allMonitors)
            myGantt.serverList(myGantt.config.plan_type, res.taskClassifys)
            vueThis.changeTaskInfo = res.changeTaskInfo
            vueThis.managerStatusMap = res.managerStatusMap
            myGantt.parse(datas)
            vueThis.taskCount = myGantt.getTaskCount()
          }
        })
        .catch(function (error) {
          console.error('error' + error)
        })
    },
    showDetail() {
      if (myGantt.getGlobalTaskIndex(this.selectTaskId) !== 0) {
        this.detailVisible = true
      }
    },
    detailDrawerClosed(res) {
      this.detailVisible = false
      this.selectTaskId = ''
    },
    sendTaskJson() {
      const that = this
      if (that.changeRecordId) {
        const affectTasks = []
        const formatFunc = myGantt.date.date_to_str('%Y-%m-%d')
        myGantt.eachTask(function (task) {
          if (myGantt.getGlobalTaskIndex(task.id) !== 0 && Object.keys(that.newTaskMap).length && !that.newTaskMap[task.id]) {
            affectTasks.push({
              id: task.id,
              planBeginDate: formatFunc(new Date(task.start_date)),
              planEndDate: formatFunc(new Date(task.end_date)),
              progress: task.progress,
              weatherControl: task.weatherControl
            })
          }
        })
        if (affectTasks && affectTasks.length > 0) {
          that.$api['planChange.planTaskJsonSave']({ affectTasksInfo: affectTasks, id: that.changeRecordId })
            .then(function (res) {})
            .catch(function (error) {
              console.error('error' + error)
            })
        }
      }
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
