<template>
  <div style="height: 100%">
    <div style="height: 100%; position: relative">
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
import PlanAttribute from '../../PlanGantt/Components/planAttribute'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import { Drawer } from 'p8-components-ui'
import { getAnalysisGantt } from '@/assets/commonJS/ganttJS/analysisGanttObject'
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
    PlanAttribute
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
      changeRecordId: ''
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
    }
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
    }
  }
}
</script>
