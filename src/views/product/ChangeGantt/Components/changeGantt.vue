<template>
  <div style="height: 100%; position: relative" class="planGantt">
    <div id="actionMenu" v-if="menuVisible" ref="actionMenu" :style="{ top: dropTop, left: dropLeft, maxHeight: maxHeight }">
      <VuePerfectScrollbar class="scroll-area" :style="{ maxHeight: maxHeight, height: scrollBarHeight }">
        <el-menu mode="vertical" :collapse="true">
          <template v-for="(menu, index) in menuData">
            <el-submenu v-if="buttonData(menu).children" :disabled="isDisable(menu)" :key="menu.id" :index="index + 'm'">
              <span slot="title">
                <span @click="btnClick(buttonData(menu), isDisable(menu))">
                  <i :class="buttonData(menu).icon"></i>
                  <span>{{ menu.title }}</span>
                </span>
              </span>
              <template v-for="(btn, index) in buttonData(menu).children">
                <el-menu-item v-if="btn.id !== 'createByNum'" :key="index" @click="btnClick(btn, btn.isDisableFun(null, ganttName, selectedTasks))" :index="btn.id">
                  <i :class="btn.icon"></i>
                  <span> {{ btn.title }}</span>
                </el-menu-item>
                <el-submenu v-if="btn.id === 'createByNum'" :key="index + 'c'" :index="index + 'b'">
                  <span slot="title">
                    <i :class="btn.icon"></i>
                    <span> {{ btn.title }}</span>
                  </span>
                  <el-input-number size="mini" v-model="createNum" :max="1000" :min="1" :step-strictly="true" :step="1"></el-input-number>
                  <el-button size="mini" @click="btn.clickFun(btn, ganttName, null)">确定 </el-button>
                </el-submenu>
              </template>
            </el-submenu>
            <el-menu-item v-else @click="btnClick(buttonData(menu), isDisable(menu))" :disabled="isDisable(menu)" :key="menu.id" :index="menu.id + 'm'">
              <i :class="buttonData(menu).icon"></i>
              <span> {{ menu.title }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </VuePerfectScrollbar>
    </div>
    <div ref="myGantt" style="width: 100%; height: calc(100% - 40px) !important" @mousemove="mouseMove"></div>
    <div class="detail_div">
      <div style="width: 50%">
        <span style="margin-left: 16px">选中任务：</span>
        <span @click="showDetail" class="detail_span">{{ selectTaskName }}</span>
      </div>
      <div style="width: 50%">
        <el-button style="float: right; margin-right: 20px; margin-top: 6px" type="primary" size="mini" @click="saveChange" v-if="!readOnly && hasSave">保存</el-button>
        <el-button style="float: right; margin-right: 20px; margin-top: 6px" type="primary" :disabled="submitChangeDisabled" size="mini" @click="submitChange" v-if="!readOnly && !hasSave"
          >提交审批</el-button
        >
        <!--        <span style="float:right;margin-right: 20px;line-height:40px;"><i class="gantt-tip p8 icon-make-increase" style="color: #0d6bec;" task_status_disp = "调增"></i> {{addCount}}</span>-->
        <!--        <span style="float:right;margin-right: 20px;line-height:40px;"><i class="gantt-tip p8 icon-make-reductions" style="color: #0d6bec;" task_status_disp = "调减"></i> {{deleteCount}}</span>-->
        <!--        <span style="float:right;margin-right: 20px;line-height:40px;"><i class="gantt-tip p8 icon-content-adjustment" style="color: #0d6bec;" task_status_disp = "修改"></i> {{modifyCount}}</span>-->
        <span style="float: right; margin-right: 20px; line-height: 40px">已选中 {{ selectTaskCount }} 条</span>
        <span style="float: right; margin-right: 20px; line-height: 40px">合计 {{ taskCount }} 条</span>
      </div>
    </div>
    <el-drawer :title="activityImportTitle" :append-to-body="true" size="50%" :destroy-on-close="true" :wrapper-closable="false" @closed="activityImportClosed" :visible.sync="activityImportVisible">
      <activity-import @save-success="activityImportClosed" :task-id="selectTaskId" :activity-import-type="activityImportType" :auto-scheduling="autoParentDate"></activity-import>
    </el-drawer>
    <monitor-time-manger
      v-if="controlTimeVisible"
      :visible="controlTimeVisible"
      :monitor-id="monitorId"
      :task-id="selectTaskId"
      :monitor-name="monitorName"
      :task-name="selectTaskName"
      @save-success="monitorManagerSave"
    >
    </monitor-time-manger>
    <submit-change
      v-if="submitChangeValidate"
      :visible="submitChangeValidate"
      :change-id="changeRecordId"
      :send-data-list="sendDataList"
      :project-category="projectCategory"
      :monitor-points="monitorPoints"
      :project-classification="projectClassification"
      :project-task-id="projectTaskId"
      :create-page="createPage"
      @save-success="submitChangeSave"
    >
    </submit-change>
    <selectApproveUser
      v-if="isSelectApproveUserView"
      :is-select-approve-user-view="isSelectApproveUserView"
      :select-user-data-source="selectUserDataSource"
      :select-user-form-data="selectUserFormData"
      @close-modal="closeSelectApproveUser"
      @commit="commitSelectApproveUser"
    ></selectApproveUser>
    <common-dialog title="查询" width="90%" :visible="ganttSearchVisible" :show-handle-btn="false" @isfullscreen="isfullscreen" @close="closeSearch" :is-view-cs-footer="false" :dialog-height="360">
      <template #dialog>
        <command-search :gantt-name="ganttName" :is-input="false" :plan-info-id="planInfoId"></command-search>
      </template>
    </common-dialog>
    <common-dialog
      title="通知下发"
      width="70%"
      v-if="noticeVisible"
      :visible="noticeVisible"
      :show-handle-btn="false"
      @isfullscreen="isfullscreen"
      @close="closeNotice"
      :is-view-cs-footer="false"
      :dialog-height="650"
    >
      <template #dialog>
        <Notice :task-id="selectTaskId" :gantt-name="ganttName" :plan-info-id="planInfoId" @close="closeNotice" />
      </template>
    </common-dialog>
  </div>
</template>
<style lang="scss" scoped>
@import '~p8-dhtmlx-gantt/codebase/dhtmlxgantt.css';
@import '@/assets/commonJS/ganttJS/ganttObject.css';

#actionMenu {
  user-select: none;
  width: 165px;
  background-color: $base-white-color;

  .el-menu--collapse {
    width: 164px;
  }

  .el-menu--collapse > .el-menu-item .el-submenu__icon-arrow,
  .el-menu--collapse > .el-submenu > .el-submenu__title .el-submenu__icon-arrow {
    display: block;
    margin-top: -5px;
  }

  .el-menu--collapse > .el-menu-item span,
  .el-menu--collapse > .el-submenu > .el-submenu__title span {
    height: 100%;
    width: 100%;
    visibility: visible;
    line-height: 36px;
  }

  .el-menu-item.is-active {
    color: #303133;
  }

  .scroll-area {
    width: 100%;
    position: relative;
    box-sizing: border-box;
  }
}

.planGantt ::v-deep {
  .gantt_row:not([aria-expanded]).updColor {
    background-color: #9bffed;
  }
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
// import { Menu, Submenu, MenuItem, Drawer, InputNumber, Button } from 'p8-components-ui'
import { Drawer, Button, P8Dialog as CommonDialog } from 'p8-components-ui'
import { CommandButtonData } from '@/assets/commonJS/ganttJS/commandButtonData'
import { ChangeRightMenuData } from '@/assets/commonJS/ganttJS/changeRightMenuData'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import { getChangeGantt } from '@/assets/commonJS/ganttJS/changeGanttObject'
import ActivityImport from '../../PlanGantt/Components/activityImport'
import { getMonitorLimitColumns } from '@/assets/commonJS/ganttJS/ganttLockUnLock'
import { mapGetters } from 'vuex'
import MonitorTimeManger from '../../PlanGantt/Components/monitorTimeManager'
import { checkKeys } from '@/assets/commonJS/ganttJS/changeGantt'
import moment from 'moment'
import submitChange from './submitChange'
import SelectApproveUser from '@/views/Framework/BusinessActivity/ProcessApproval/selectApproveUser'
import CommandSearch from '@/components/gantt/Components/CommandSearch'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
import Notice from '../../PlanGantt/Components/notice'

const mh = document.documentElement.clientHeight - 300
let myGantt
export default {
  name: 'ChangeGantt',
  props: {
    planInfoId: {
      type: String,
      default: null
    },
    taskId: {
      type: String,
      default: null
    },
    taskStatus: {
      type: Object,
      default: null
    },
    projectTypeId: {
      type: String,
      default: null
    },
    createPage: {
      type: String,
      default: null
    },
    currentRoute: {
      type: String,
      default: null
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    planStatusMap: {
      type: Object,
      default: null
    },
    planInfoStatus: {
      type: String,
      default: null
    },
    planAttributeDrawer: {
      // 接收--父级[changeIndex.vue]中抽屉隐藏显示的字段-detailVisible. 列表选择时-该值为true,更新抽屉中的内容
      type: Boolean,
      default: false
    },
    changeId: {
      type: String,
      default: null
    }
  },
  components: {
    // 'el-menu': Menu,
    // 'el-submenu': Submenu,
    'el-drawer': Drawer,
    // 'el-menu-item': MenuItem,
    // 'el-input-number': InputNumber,
    'el-button': Button,
    ActivityImport,
    MonitorTimeManger,
    submitChange,
    SelectApproveUser,
    CommonDialog,
    VuePerfectScrollbar,
    Notice,
    CommandSearch
  },
  data() {
    return {
      sendDataList: '',
      projectCategory: '',
      monitorPoints: '',
      maxHeight: (mh + 300) / 2 + 'px',
      projectClassification: '',
      projectTaskId: '',
      ganttName: 'changeGantt',
      submitChangeDisabled: false,
      createNum: 1,
      menuVisible: false,
      menuData: ChangeRightMenuData,
      dropTop: '0px',
      dropLeft: '0px',
      selectedTasks: [],
      buttonDatas: CommandButtonData,
      resourceConfig: {},
      resourceTemplates: {},
      selectTaskId: '',
      hasSave: true,
      resourcesData: {},
      selectTaskName: '',
      activityImportTitle: '知识库导入',
      activityImportVisible: false,
      activityImportType: '',
      taskCount: '', // 任务总数
      selectTaskCount: '', // 选中任务数量
      deep: 0,
      mouseX: '',
      mouseY: '',
      columnSettings: [],
      copyTasks: [], // 复制任务载体
      taskClassifyDatas: [],
      monitorPointDatas: [],
      searchForm: {},
      monitorLockMap: {}, // 标识锁定状态
      limitColumns: [], // 标识加锁后不可编辑列定义
      lockLevel: 3, // 编辑锁定任务层级，指定后，gantt页面对应任务不可做任何操作
      autoParentDate: '1', // 是否自动计算父任务时间,1：自动，2：手动
      controlTimeVisible: false, // 标识时间编辑
      monitorId: '',
      monitorName: '',
      newTaskMap: {}, // 任务变更后新数据Map对象
      oldTaskMap: {}, // 任务变更原始数据Map对象
      addCount: 0,
      deleteCount: 0,
      modifyCount: 0,
      dependentDatas: [],
      createTaskStatus: '', // 新建任务状态
      managerStatus: '', // 新建任务管理状态
      weatherControl: '', // 新建任务是否受控状态
      createSource: '', // 新建任务任务创建页面
      taskMonitorMap: {}, // 变更前任务标识信息
      changeTaskInfo: {},
      changeRecordId: '',
      scrollBarHeight: '0px',
      submitChangeValidate: false,
      isSelectApproveUserView: false,
      managerStatusMap: {}, // 管理状态全部数据
      selectUserDataSource: [],
      selectUserFormData: {},
      ganttEditCheck: {}, // gantt任务编辑权限
      viewType: 'grid', // 视图类型，默认只显示列表
      ganttSearchVisible: false, // 计划变更查询弹出框
      delDataList: [],
      noticeVisible: false,
      newSendDatas: null
    }
  },
  watch: {
    selectedTasks: function (newVal, oldVal) {
      if (newVal && newVal.length === 1 && (myGantt.getGlobalTaskIndex(newVal[0].id) !== 0 || this.createPage === 'userChange') && newVal[0].status) {
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
        this.initGantt(this.planInfoId, this.changeRecordId, this.viewType)
        this.callParentSelectTasks()
      }
    },
    changeId: function (newVal, oldVal) {
      if (newVal) {
        this.changeRecordId = newVal
      }
    },
    newTaskMap: function (newVal, oldVal) {
      const that = this
      if (newVal && Object.keys(newVal).length > 0) {
        let ac = 0
        let dc = 0
        let mc = 0
        for (const key in newVal) {
          const task = newVal[key]
          if (task.infoType === 'update') {
            mc += 1
          } else if (task.infoType === 'create') {
            ac += 1
          } else if (task.infoType === 'delete') {
            if (myGantt.hasChild(task.id)) {
              myGantt.eachTask(function (task) {
                dc += 1
              }, task.id)
            }
            dc += 1
          }
        }
        that.addCount = ac
        that.deleteCount = dc
        that.modifyCount = mc
      } else {
        that.addCount = 0
        that.deleteCount = 0
        that.modifyCount = 0
      }
    }
  },
  mounted() {
    this.scrollBarHeight = 40 * this.menuData.length + 1 + 'px'
    this.changeRecordId = this.changeId
    this.initGantt(this.planInfoId, this.changeRecordId, this.viewType)
    this.callParentSelectTasks()
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
    ...mapGetters(['taskStyles'])
  },
  methods: {
    async initGantt(planInfoId, changeRecordId, viewType) {
      // 根据项目类型，获取gantt列设置
      this.columnSettings = await this.$api['planGanttManager.getGanttColumnSettingByWholeId']({ wholeDescribeId: this.projectTypeId })

      const vueThis = this
      myGantt = GanttObject.getGanttObject(vueThis.ganttName)
      // 清空原有数据
      if (myGantt) {
        GanttObject.setGanttObject(vueThis.ganttName, {})
        myGantt.destructor()
      }
      // vuex存放
      vueThis.$store.dispatch('setVueThis', vueThis)
      // 初始化对象
      myGantt = getChangeGantt(vueThis.ganttName, vueThis)
      myGantt.config.scale_height = 50
      // gantt视图切换
      if (viewType === 'resource') {
        myGantt.config.readonly = true
        // 样式绑定
        myGantt.templates.grid_row_class = GanttObject.grid_row_class(myGantt)
        myGantt.templates.task_row_class = GanttObject.task_row_class(myGantt)
        myGantt.templates.timeline_cell_class = GanttObject.timeline_cell_class(myGantt)
        myGantt.templates.resource_cell_class = GanttObject.resource_cell_class()
        myGantt.templates.resource_cell_value = GanttObject.resource_cell_value()
        // 资源负载图列头定义
        const resourceConfig = GanttObject.resourceConfig(myGantt, vueThis)
        // 定义资源模板
        const resourceTemplates = GanttObject.resourceTemplates(myGantt)
        // 重新布局
        myGantt.config.layout = GanttObject.layout3(resourceConfig, resourceTemplates)
        myGantt.config.scale_height = 20 * 3
        myGantt.ext.zoom.init(GanttObject.zoomConfig(myGantt))
      } else if (viewType === 'gantt') {
        myGantt.ext.zoom.init(GanttObject.zoomConfig(myGantt))
        myGantt.config.layout = GanttObject.layout1
      } else {
        myGantt.config.layout = GanttObject.layout2
      }
      // 标识锁定后不可操作的列获取
      getMonitorLimitColumns(myGantt.config.columns, vueThis)
      // 渲染对象
      myGantt.init(this.$refs.myGantt)
      // 加载数据
      this.loadGanttData(this.planInfoId, this.taskId, this.createPage, changeRecordId)
    },
    loadGanttData(planInfoId, taskId, createPage, changeRecordId) {
      const vueThis = this
      vueThis.$api['planGanttManager.loadPlanGanttData']({ planInfoId: planInfoId, dicType: 'ACTIVITY_TYPE', taskId: taskId, createPage: createPage, changeRecordId: changeRecordId })
        .then(function (res) {
          if (res) {
            vueThis.resourcesData = res.resources
            // 初始化数据
            let initData
            initData = res.tasks.map(item => {
              item.changeStatus = ''
              let obj = {}
              if (res.changeTaskInfo && res.changeTaskInfo[item.id] && res.changeTaskInfo[item.id].id) {
                obj = {
                  ...item,
                  ...res.changeTaskInfo[item.id]
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
            if (res.tasks && res.changeTaskInfo && Object.keys(res.changeTaskInfo).length > 0) {
              res.tasks.forEach((task) => {
                if (Object.keys(res.changeTaskInfo)[0] === task.id) {
                  vueThis.projectCategory = task.projectCategory
                  vueThis.monitorPoints = task.monitorPoints
                  vueThis.projectClassification = task.projectClassification
                  vueThis.projectTaskId = task.id
                }
              })
            }
            myGantt.$resourcesStore.parse(res.resources)
            myGantt.serverList(myGantt.config.monitor_point, res.monitorPointDatas)
            myGantt.serverList(myGantt.config.plan_type, res.taskClassifys)
            myGantt.serverList(myGantt.config.dept_list, res.deptList)
            vueThis.createTaskStatus = res.createTaskStatus
            vueThis.managerStatus = res.managerStatus
            vueThis.weatherControl = res.weatherControl
            vueThis.createSource = res.createSource
            vueThis.taskClassifyDatas = res.taskClassifys
            vueThis.monitorPointDatas = res.monitorPointDatas
            vueThis.monitorLockMap = res.monitorLock
            vueThis.managerStatusMap = res.managerStatusMap
            vueThis.taskMonitorMap = res.taskMonitorMap
            vueThis.changeTaskInfo = res.changeTaskInfo
            myGantt.parse(datas)
            vueThis.taskCount = myGantt.getTaskCount()
          }
        })
        .catch(function (error) {
          console.error('error' + error)
        })
    },
    btnClick (btn, isDisable) {
      if (!isDisable) {
        this.menuVisible = false
        btn.clickFun(null, this.ganttName, this.selectedTasks)
      }
    },
    callParentSelectTasks() {
      this.$emit('select-task', this.selectedTasks, this.ganttName)
    },
    mouseMove(e) {
      if (this.menuVisible) {
        if (this.mouseY - 30 > e.clientY || this.mouseY + 30 < e.clientY || this.mouseX - 30 > e.clientX || this.mouseX + 30 < e.clientX) {
          this.menuVisible = false
        }
      }
    },
    showDetail() {
      if (this.$route.path === '/TaskChange') {
        this.$emit('show-detail', myGantt.getTask(this.selectTaskId), this.ganttName, this.createPage)
      } else {
        if (myGantt.getGlobalTaskIndex(this.selectTaskId) !== 0) {
          this.$emit('show-detail', myGantt.getTask(this.selectTaskId), this.ganttName, this.createPage)
        }
      }
    },
    activityImportClosed() {
      this.activityImportVisible = false
      myGantt.eachSelectedTask(function (id) {
        if (myGantt.isTaskExists(id)) {
          myGantt.unselectTask(id)
        }
      })
      myGantt.destructor()
      this.initGantt(this.planInfoId, null, this.viewType)
      this.callParentSelectTasks()
    },
    monitorManagerSave(obj) {
      this.controlTimeVisible = false
    },
    delSaveChange (task) {
      if (task[0].infoType === 'create') {
        delete this.newTaskMap[task[0].id]
        return false
      }
      let that = this
      let obj = that.newTaskMap
      let oldObj = that.oldTaskMap
      let sendDatas = []
      for (let key in obj) {
        // 获取newTaskMap对象
        let task = obj[key]
        let oldTask = oldObj[key]
        let updateInfo = obj[key].updateInfo
        // 获取gantt中task对象
        let nowGanttTask = myGantt.getTask(task.id)
        let indexNo = myGantt.getGlobalTaskIndex(task.id)
        // newTaskMap中数据过滤
        // 当只修改任务且最终于原始数据一致时，删除newTaskMap中对应数据
        if (!nowGanttTask.infoType && updateInfo && updateInfo.length === 1 && updateInfo.indexOf('task') !== -1) {
          delete that.newTaskMap[key]
          break
        }
        if (oldTask && Object.keys(oldTask).length > 0) {
          let oldIndexNo = oldObj[key].indexNo
          // 任务属性未修改时，取消updateInfo中task
          if (updateInfo && updateInfo.indexOf('task') !== -1 && nowGanttTask.infoType === 'update' && oldIndexNo === indexNo && nowGanttTask.parent === oldTask.parent) {
            let check = true
            for (let okey in oldTask) {
              if (checkKeys.indexOf(okey) !== -1 && nowGanttTask[okey] !== oldTask[okey]) {
                check = false
                break
              }
            }
            if (check) {
              updateInfo.splice(updateInfo.indexOf('task'), 1)
            }
            that.newTaskMap[key].updateInfo = updateInfo
          }
        }
        that.newTaskMap[key].indexNo = indexNo
        // 日期转换
        nowGanttTask.start_date = moment(nowGanttTask.start_date).format('YYYY-MM-DD')
        nowGanttTask.end_date = moment(nowGanttTask.end_date).format('YYYY-MM-DD')
        nowGanttTask.indexNo = indexNo
        that.newTaskMap[key] = nowGanttTask
        sendDatas.push(that.newTaskMap[key])
      }
      let isObjectInArray1 = sendDatas.some(item1 => {
        return task.some(item2 => item1.id === item2.id)
      })
      if (isObjectInArray1) {
        this.$message.warning('不能删除已修改的数据，请重新选择')
        return false
      } else {
        let isObjectInArray2 = this.delDataList.some(item1 => {
          return task.some(item2 => item1.id === item2.id)
        })
        if (isObjectInArray2) {
          this.$message.warning('不能删除已删除的数据，请重新选择')
          return false
        } else {
          task[0].infoType = 'delete'
          task[0].style = '#FF0000'
          // task[0].end_date = moment(task[0].end_date).format('YYYY-MM-DD')
          myGantt.updateTask(task[0].id)
          this.delDataList.push(task[0])
          this.newSendDatas = sendDatas.concat(this.delDataList)
        }
      }
    },
    saveChange() {
      let that = this
      let obj = that.newTaskMap
      let oldObj = that.oldTaskMap
      console.log(obj, 'obj')
      console.log(oldObj, 'oldObjoldObj');
      let sendDatas = []
      for (let key in obj) {
        // 获取newTaskMap对象
        let task = obj[key]
        let oldTask = oldObj[key]
        let updateInfo = obj[key].updateInfo
        // 获取gantt中task对象
        let nowGanttTask = myGantt.getTask(task.id)
        let indexNo = myGantt.getGlobalTaskIndex(task.id)
        // newTaskMap中数据过滤
        // 当只修改任务且最终于原始数据一致时，删除newTaskMap中对应数据
        if (!nowGanttTask.infoType && updateInfo && updateInfo.length === 1 && updateInfo.indexOf('task') !== -1) {
          delete that.newTaskMap[key]
          break
        }
        if (oldTask && Object.keys(oldTask).length > 0) {
          let oldIndexNo = oldObj[key].indexNo
          // 任务属性未修改时，取消updateInfo中task
          if (updateInfo && updateInfo.indexOf('task') !== -1 && nowGanttTask.infoType === 'update' && oldIndexNo === indexNo && nowGanttTask.parent === oldTask.parent) {
            let check = true
            for (let okey in oldTask) {
              if (checkKeys.indexOf(okey) !== -1 && nowGanttTask[okey] !== oldTask[okey]) {
                check = false
                break
              }
            }
            if (check) {
              updateInfo.splice(updateInfo.indexOf('task'), 1)
            }
            that.newTaskMap[key].updateInfo = updateInfo
          }
        }
        that.newTaskMap[key].indexNo = indexNo
        // 日期转换
        nowGanttTask.start_date = moment(nowGanttTask.start_date).format('YYYY-MM-DD')
        nowGanttTask.end_date = moment(nowGanttTask.end_date).format('YYYY-MM-DD')
        nowGanttTask.indexNo = indexNo
        that.newTaskMap[key] = nowGanttTask
        sendDatas.push(that.newTaskMap[key])
      }
      console.log(sendDatas, 'sendDatas');
      const mergedArray = [];
      if (sendDatas && Array.isArray(sendDatas)) {
        mergedArray.push(...sendDatas);
      }
      if (this.newSendDatas && Array.isArray(this.newSendDatas)) {
        mergedArray.push(...this.newSendDatas);
      }
      const uniqueMergedArray = mergedArray.filter((item, index, self) =>
        index === self.findIndex((t) => t && item && t.id === item.id)
      )
      if (uniqueMergedArray && uniqueMergedArray.length > 0) {
        // 请求后台接口
        for (let i in uniqueMergedArray) {
          if (uniqueMergedArray[i].infoType === 'delete') {
            uniqueMergedArray[i].end_date = moment(uniqueMergedArray[i].end_date).format('YYYY-MM-DD')
            uniqueMergedArray[i].start_date = moment(uniqueMergedArray[i].start_date).format('YYYY-MM-DD')
          }
        }
        for (let i in uniqueMergedArray) {
          for (let j in this.resourcesData) {
            if (uniqueMergedArray[i].owner_id) {
              if (this.resourcesData[j].id === uniqueMergedArray[i].owner_id) {
                uniqueMergedArray[i].userId = this.resourcesData[j].userId
              }
            }
          }
        }
        that.$api['planChange.calculateChangeInfoAndSave']({ changeTasks: uniqueMergedArray, planInfoId: that.planInfoId, id: that.changeRecordId }).then(function (res) {
          if (res) {
            that.sendDataList = uniqueMergedArray
            that.changeRecordId = res
            // that.initGantt(that.planInfoId, that.changeRecordId, that.viewType)
            that.loadGanttData(that.planInfoId, that.taskId, that.createPage, that.changeRecordId)
            that.hasSave = false
          }
        }).catch(function (error) {
          console.error('error' + error)
        })
      } else {
        that.$message({
          message: '未产生变更数据，请修改后再保存！',
          type: 'warning'
        })
      }
    },
    submitChange() {
      const teamRoleValidatorParams = {
        planInfoId: this.planInfoId
      }
      if (this.createPage === 'planChange') {
        teamRoleValidatorParams.processDefinitionKey = 'planChangeApprove'
      } else if (this.createPage === 'userChange') {
        teamRoleValidatorParams.processDefinitionKey = 'planChangeApprove'
      } else {
        this.$message({
          message: '操作失败！参数异常',
          type: 'warning'
        })
      }
      const this_ = this
      this.$api['planChange.teamRoleValidator'](teamRoleValidatorParams).then((res) => {
        if (res && res.result === true) {
          this.submitChangeValidate = true
        } else {
          let msg = ''
          Object.keys(res).forEach((k) => {
            if (res[k]) {
              msg = msg + res[k]
            }
          })
          this_.$message({
            message: '操作失败！' + msg,
            type: 'warning'
          })
        }
      })
    },
    submitChangeSave(obj) {
      /* let this_ = this
      if (obj && obj.processInstanceIds && obj.processInstanceIds.length > 0) {
        nextApproveUser.initDataSource(obj.approveTime, obj.processInstanceIds, this_).then(res1 => {
          if (res1 === true) {
            this_.$confirm(`检测到后一个审批任务，是否手动指定（变更）节点的审批人？`, '操作成功！', {
              confirmButtonText: '手动指定',
              cancelButtonText: '不指定',
              type: 'warning'
            }).then(() => {
              this_.isSelectApproveUserView = true
            }).catch(() => {
            })
          }
        })
      } */
      this.submitChangeDisabled = true
      this.submitChangeValidate = false
    },
    closeSelectApproveUser() {
      this.isSelectApproveUserView = false
      this.$emit('approved', this.formData.taskId)
    },
    commitSelectApproveUser(fullParams) {
      this.$refs.form.submitForm(fullParams, this.saveApi)
      this.closeModal()
      this.$emit('closed', null)
    },
    isfullscreen(isfullscreen) {
      if (isfullscreen) {
        this.customHeight = document.documentElement.clientHeight - 120
      } else {
        this.customHeight = 330
      }
    },
    closeSearch() {
      this.ganttSearchVisible = false
    },
    noticeShow() {
      this.noticeVisible = true
    },
    closeNotice() {
      this.noticeVisible = false
    },
  }
}
</script>
