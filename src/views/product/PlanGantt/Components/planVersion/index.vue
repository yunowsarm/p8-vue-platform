<template>
  <div style="height: 100%" v-loading="dataLoading">
    <div style='height: 50%; position: relative;'
         class="myGantt">
      <div ref='myGantt1'
           style='width: 100%;height: calc(100% - 40px)!important;'></div>
      <div class='detail_div'>
        <div style="width: 50%">
          <span style="margin-left: 16px;">版本号：</span>
          <span class="detail_span version_num">{{planVersionNum1}}</span>
          <span style="margin-left: 16px">选中任务：</span>
          <span @click="showDetail"
                class="detail_span">{{selectTaskName1}}</span>
        </div>
        <div style="width: 50%;">
          <span style="float:right;margin-right: 20px;line-height:40px;">合计 {{taskCount1}} 条</span>
        </div>
      </div>
    </div>
    <div style='height: 50%; position: relative;border-top: 1px solid #e1e1e1;'
         class="myGantt">
      <div ref='myGantt2'
           style='width: 100%;height: calc(100% - 40px)!important;'></div>
      <div class='detail_div'>
        <div style="width: 50%">
          <span style="margin-left: 16px;">版本号：</span>
          <span class="detail_span version_num">{{planVersionNum2}}</span>
          <span style="margin-left: 16px">选中任务：</span>
          <span @click="showDetail"
                class="detail_span">{{selectTaskName2}}</span>
        </div>
        <div style="width: 50%;">
          <span style="float:right;margin-right: 20px;line-height:40px;">合计 {{taskCount2}} 条</span>
        </div>
      </div>
    </div>
    <el-drawer :title="detailTitle"
               :append-to-body="true"
               size="80%"
               :destroy-on-close="true"
               :wrapperClosable="false"
               @close="detailDrawerClosed"
               :visible="detailVisible">
      <template #drawer>
        <plan-attribute :isView="false"
                        @save-success='detailDrawerClosed'
                        :selectTaskId1='selectTaskId1'
                        :planVersionId1='planVersionId1'
                        :selectTaskId2='selectTaskId2'
                        :planVersionId2='planVersionId2'
                        :versionType="versionType"></plan-attribute>
      </template>
    </el-drawer>
  </div>
</template>
<script>
import { P8Drawer as CommonDrawer} from 'p8-components-ui'
import store from '@/plugins/store'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import { getPlanVersionGantt } from '@/assets/commonJS/ganttJS/planVersionGantt/planVersionGanttObject'
import PlanAttribute from './list'
let myGantt1, myGantt2
export default {
  name: 'PlanVersion',
  props: {
    planInfoId: {
      type: String,
      default: () => ''
    },
    planVersionId1: {
      type: String,
      default: null
    },
    planVersionId2: {
      type: String,
      default: null
    },
    planVersionNum1: {
      type: String,
      default: null
    },
    planVersionNum2: {
      type: String,
      default: null
    },
    versionType: {
      type: String,
      default: null
    },
    mainGanttName: {
      type: String,
      default: null
    }
  },
  components: {
    'el-drawer': CommonDrawer,
    PlanAttribute
  },
  data () {
    return {
      ganttName1: 'versionGantt1',
      ganttName2: 'versionGantt2',
      classifyType: 'YFL',
      loadGanttDataApi: 'planGanttManager.loadTaskVersionData', // gantt数据加载api
      resourceConfig: {},
      resourceTemplates: {},
      detailVisible: false,
      detailTitle: '',
      selectTaskId: '',
      selectTaskId1: '',
      selectTaskId2: '',
      selectTaskName1: '',
      selectTaskName2: '',
      taskCount1: '', // 任务总数
      taskCount2: '', // 任务总数
      taskClassifyDatas: [],
      monitorPointDatas: [],
      searchForm1: {},
      searchForm2: {},
      ganttThis: {},
      mainTask: [],
      dataLoading: false,
      taskStatusMap: {},
      managerStatusMap: {} // 管理状态全部数据
    }
  },
  watch: {
    selectTaskId: function (newVal, oldVal) {
      if (newVal) {
        this.relevanceTask(myGantt1, newVal, oldVal, 'one')
        this.relevanceTask(myGantt2, newVal, oldVal, 'two')
      }
    }
  },
  beforeDestroy () {
    myGantt1.clearAll()
    myGantt2.clearAll()
  },
  mounted () {
    if (this.planVersionId1 && this.planVersionId2) {
      this.initVersionGantt(this.planVersionId1, this.planVersionId2)
    }
    let myGantt3 = GanttObject.getGanttObject(this.mainGanttName)
    this.mainTask = myGantt3.serialize().data
    this.ganttThis = store.getters.vueThis
  },
  computed: {},
  methods: {
    relevanceTask (ganttObject, newVal, oldVal, type) {
      if (ganttObject.isTaskExists(newVal)) {
        if (ganttObject.isTaskExists(oldVal)) {
          ganttObject.unselectTask(oldVal)
        }
        let task = ganttObject.getTask(newVal)
        let rootTask = ganttObject.getTaskByWBSCode('1')
        let sizes = ganttObject.getTaskPosition(task, rootTask.start_date, rootTask.end_date)
        ganttObject.scrollTo(sizes.left, sizes.top)
        ganttObject.selectTask(newVal)
        if (type === 'one') {
          this.selectTaskId1 = task.id
          this.selectTaskName1 = task.name
        }
        if (type === 'two') {
          this.selectTaskId2 = task.id
          this.selectTaskName2 = task.name
        }
      } else {
        if (type === 'one') {
          this.selectTaskId1 = ''
          this.selectTaskName1 = ''
        }
        if (type === 'two') {
          this.selectTaskId2 = ''
          this.selectTaskName2 = ''
        }
      }
    },
    initVersionGantt (planVersionId1, planVersionId2) {
      let vueThis = this
      // 清空原有数据
      if (myGantt1) {
        myGantt1.eachSelectedTask(function (id) {
          if (myGantt1.isTaskExists(id)) {
            myGantt1.unselectTask(id)
          }
        })
        GanttObject.setGanttObject(vueThis.ganttName1, {})
        myGantt1.destructor()
      }
      if (myGantt2) {
        myGantt2.eachSelectedTask(function (id) {
          if (myGantt2.isTaskExists(id)) {
            myGantt2.unselectTask(id)
          }
        })
        GanttObject.setGanttObject(vueThis.ganttName2, {})
        myGantt2.destructor()
      }
      // 加载数据
      this.loadGanttData(planVersionId1, planVersionId2)
    },
    loadGanttData (planVersionId1, planVersionId2) {
      this.dataLoading = true
      let vueThis = this
      const params = {
        planInfoId: this.planInfoId,
        planVersionId1: planVersionId1,
        planVersionId2: planVersionId2,
        versionType: vueThis.versionType
      }
      vueThis.$api[vueThis.loadGanttDataApi](params).then(function (res) {
        if (res) {
          // 获取gantt对象
          myGantt1 = GanttObject.getGanttObject(vueThis.ganttName1)
          myGantt2 = GanttObject.getGanttObject(vueThis.ganttName2)
          // // 初始化数据
          let datas1 = {
            tasks: res.v1,
            links: []
          }
          let datas2 = {
            tasks: vueThis.versionType == 'task' ? vueThis.mainTask : res.v2,
            links: []
          }
          vueThis.saveGantColumnColor({
            gant1: myGantt1,
            gant2: myGantt2,
            result1: res.v1,
            result2: datas2.tasks
          })

          // myGantt1.serverList(myGantt1.config.complete_form, res.completeForms)
          // myGantt2.serverList(myGantt2.config.complete_form, res.completeForms)
          // myGantt1.serverList('measurementUnit', res.measurementUnit)
          // myGantt2.serverList('measurementUnit', res.measurementUnit)
          myGantt1.serverList(myGantt1.config.monitor_point, res.monitorPointDatas)
          myGantt2.serverList(myGantt2.config.monitor_point, res.monitorPointDatas)
          // vueThis.changeTaskInfo = res.changeTaskInfo
          vueThis.managerStatusMap = res.managerStatusMap
          vueThis.taskStatusMap = res.taskStatusMap
          vueThis.taskClassifyDatas = res.taskClassifys
          // vueThis.resourceDatas = res.resources
          myGantt1.serverList('resources', res.resources)
          myGantt2.serverList('resources', res.resources)

          //   // 初始化对象
          myGantt1 = getPlanVersionGantt(myGantt1, vueThis, vueThis.ganttName1)
          myGantt2 = getPlanVersionGantt(myGantt2, vueThis, vueThis.ganttName2)
          myGantt1.config.layout = GanttObject.layout2
          myGantt2.config.layout = GanttObject.layout2
          //   // 渲染对象
          myGantt1.init(vueThis.$refs.myGantt1)
          myGantt2.init(vueThis.$refs.myGantt2)
          myGantt1.parse(datas1)
          myGantt2.parse(datas2)
          vueThis.taskCount1 = myGantt1.getTaskCount()
          vueThis.taskCount2 = myGantt2.getTaskCount()
          vueThis.dataLoading = false
        }
      }).catch(function (error) {
        vueThis.dataLoading = false
        console.error('error' + error)
      })
    },
    showDetail () {
      this.detailVisible = true
    },
    detailDrawerClosed (res) {
      this.detailVisible = false
      this.detailTitle = ''
    },

    /**
     *  版本对比列表，新版本和旧版本不一致数据样式标记
     * @param obj: { gant1, gant2, v1, v2 }
     * @params gant1: 版本的甘特对象1
     * @params gant2: 版本的甘特对象2
     * @params v1: 版本数据 V1是比较旧的版本
     * @params v2: 版本数据 v2是比较新的版本
     */
    saveGantColumnColor ({ ...obj }) {
      // 删选被删除的任务
      let result1 = []
      let gant1 = null
      obj.result1.forEach(v1 => {
        if (!obj.result2.some(v2 => v1.id === v2.id)) {
          result1.push(v1.id)
        }
      })
      gant1 = obj.gant1
      if (gant1 !== null) {
        gant1.templates.grid_row_class = (start, end, task) => {
          if (result1.includes(task.id)) {
            return 'delColor'
          }
        }
      }
      // 筛选新增的任务
      let result2 = []
      let gant2 = null
      obj.result2.forEach(v2 => {
        if (!obj.result1.some(v1 => v1.id === v2.id)) {
          result2.push(v2.id)
        }
      })
      gant2 = obj.gant2
      if (gant2 !== null) {
        gant2.templates.grid_row_class = (start, end, task) => {
          if (result2.includes(task.id)) {
            return 'updColor'
          }
        }
      }
    }
  }
}
</script>
<style lang='scss' scoped>
@import '~p8-dhtmlx-gantt/codebase/dhtmlxgantt.css';
@import '@/assets/commonJS/ganttJS/ganttObject.css';

.myGantt ::v-deep {
  // 2个版本，无数据的颜色修改
  .gantt_row:not([aria-expanded]).updColor {
    background-color: #b2e0df !important;
  }
  .gantt_row:not([aria-expanded]).delColor {
    background-color: #FF4040 !important;
  }
}
.version_num {
  text-decoration: none;
}
</style>
