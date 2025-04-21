<!---->
<template>
  <div style="height: calc(100% - 60px);  position: relative; margin-left: 10px; margin-top: 10px;">
    <div ref="myGanttLocation"
         style="width: 100%; height: 100% !important"></div>
  </div>
</template>
<style lang="scss">
@import '~p8-dhtmlx-gantt/codebase/dhtmlxgantt.css';
@import '@/assets/commonJS/ganttJS/ganttObject.css';

.edit_gantt_user_list {
  max-height: 500px;
  overflow: auto;
  display: flex;
  flex-direction: column;

  span {
    padding: 5px;
    border-bottom: #cccccc;

    &:last-child {
      border-bottom: none;
    }
  }
}
</style>
<style lang="scss" scoped>
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

  ::v-deep .el-menu--collapse > .el-submenu > .el-submenu__title .el-submenu__icon-arrow {
    display: inline-block;
  }

  ::v-deep .el-submenu.is-opened > .el-submenu__title .el-submenu__icon-arrow {
    transform: rotate(180deg);
  }
}

::v-deep .list-layout {
  overflow: hidden;
}

.el-drawer__wrapper.resource-group-drawer {
  & ::v-deep .el-drawer__body {
    padding: 10px;
    background: #f7f8fc;
  }
}
</style>
<script>
import { GanttObjectLocation } from '@/assets/commonJS/ganttJS/ganttObjectLocation'
import { planGanttLocation } from '@/assets/commonJS/ganttJS/planGanttObjectLocation'
import { mapGetters } from 'vuex'
const Mycolumns = [
  {
    title: '',
    dataIndex: 'checkbox',
    width: 45,
    align: 'center',
    headerAlign: 'center',
    type: 'selection'
  },
  {
    title: '任务名称',
    dataIndex: 'taskName'
  },
  {
    title: '责任人',
    dataIndex: 'dutyUserName',
    width: 150
  },
  {
    title: '工期',
    dataIndex: 'durations',
    width: 100
  }
]

let myGanttLocation
export default {
  name: 'PlanGanttView',
  props: {
    planBeginDateArray: {
      type: Array,
      default: () => []
    },
    planEndDateArray: {
      type: Array,
      default: () => []
    },
    planInfoId: {
      type: String,
      default: null
    },
    // secretGrade: {
    //   type: String
    // },
    wholeDescribeId: {
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
    createPage: {
      type: String,
      default: null
    },
    planStatusMap: {
      type: Object,
      default: null
    },
    planInfoStatus: {
      type: String,
      default: null
    },
    roteName: {
      // 三级菜单路由
      type: String,
      default: ''
    },
    dialogHeight: {
      type: Number,
      default: 200
    },
    panelData: {
      type: Array,
      default: () => []
    },
    selectRecord: {
      type: Array,
      default: () => []
    },
    // 项目类型
    projectCategory: {
      type: String,
      default: ''
    },
    flag: {
      type: String,
      default: ''
    }
  },
  components: {

  },
  data () {
    const mh = document.documentElement.clientHeight - 300
    return {
      ganttBtnType: null,
      relevancePlanVisible: false,
      columnConfigs: [],
      createVisible: false,
      exportExperienceType: '',
      experienceBaseVisible: false,
      isManage: false,
      isPlan: true,
      planEditLock: false,
      fullscreenLoading: '',
      avTaskId: '',
      // ClassificationSelectVisible: false,
      customHeight: 300,
      ganttName: 'planGanttLocation',
      createNum: 1,
      noticeVisible: false,
      menuVisible: false,
      menuData: [],
      dropTop: '0px',
      dropLeft: '0px',
      maxHeight: (mh + 300) / 2 + 'px',
      selectedTasks: [],
      resourceConfig: {},
      resourceTemplates: {},
      SDMParam: {},
      selectTaskId: '',
      startDate: '',
      endDate: '',
      comp: this,
      Mycolumns: Mycolumns,
      deep: 0,
      taskClassifyDatas: [],
      monitorPointDatas: [],
      searchForm: {},
      reminderList: [],
      autoParentDate: '1', // 是否自动计算父任务时间,1：自动，2：手动
      managerStatusMap: {}, // 管理状态全部数据
      taskStatusMap: {},
      issueStatus: '', // 任务待下发状态
      thirdMenuParam: {},
      budgetList: [], // 任务挂接经费数据
      viewType: 'grid',
      columnSettings: []
    }
  },
  watch: {
    selectedTasks: function (newVal, oldVal) {
      this.onChangeTask(newVal[0])
    },
    ganttDatas: {
      handler (newVal, oldVal) {
        console.log("🚀 ~ handler ~ newVal:", newVal)
        myGanttLocation.clearAll()
        this.loadGanttData(this.planInfoId, this.taskId, this.createPage, newVal)
      },
      deep: true
    }
  },
  created () {
    this.initGantt(this.planInfoId, this.viewType)
  },
  mounted () {

  },
  computed: {
    ...mapGetters(['ganttDatas', 'taskStyles', 'ganttRightButtons', 'userSettingAll', 'monitorBtnsByApi'])
  },
  methods: {
    onChangeTask (row) {
      this.selectTaskId = row.id
      this.$emit('onChangeTask', row)
    },
    async initGantt (planInfoId, viewType) {
      // this.fullscreenLoading = this.$loading({
      //   lock: true,
      //   text: 'Loading',
      //   spinner: 'el-icon-loading'
      // })
      // // 根据项目类型，获取gantt列设置
      this.reminderList = await this.$api['planGanttManager.loadReminder']({
        planInfoId: this.planInfoId,
        dicType: 'ACTIVITY_TYPE',
        taskId: this.taskId,
        createPage: this.createPage,
        planBeginDateArray: this.planBeginDateArray,
        planEndDateArray: this.planEndDateArray
      })
      const vueThis = this
      // 清空原有数据
      this.selectedTasks = []
      myGanttLocation = GanttObjectLocation.getGanttObject(vueThis.ganttName)
      if (myGanttLocation) {
        GanttObjectLocation.setGanttObject(vueThis.ganttName, {})
        myGanttLocation.destructor()
      }
      // vuex存放
      vueThis.$store.dispatch('setVueThisLocation', vueThis)
      // 初始化对象
      myGanttLocation = planGanttLocation(vueThis.ganttName, vueThis)
      myGanttLocation.config.scale_height = 100
      // gantt视图切换
      if (this.viewType === 'resource') {
        myGanttLocation.config.readonly = true
        myGanttLocation.ext.zoom.init(GanttObjectLocation.zoomConfig(myGanttLocation))
        // 资源负载图列头定义
        const resourceConfig = GanttObjectLocation.resourceConfig(myGanttLocation, vueThis)
        // 定义资源模板
        const resourceTemplates = GanttObjectLocation.resourceTemplates(myGanttLocation)
        // 重新布局
        myGanttLocation.config.layout = GanttObjectLocation.layout3(resourceConfig, resourceTemplates)
        // 样式绑定
        myGanttLocation.templates.grid_row_class = GanttObjectLocation.grid_row_class(myGanttLocation)
        myGanttLocation.templates.task_row_class = GanttObjectLocation.task_row_class(myGanttLocation)
        myGanttLocation.templates.timeline_cell_class = GanttObjectLocation.timeline_cell_class(myGanttLocation)
        myGanttLocation.templates.resource_cell_class = GanttObjectLocation.resource_cell_class()
        myGanttLocation.templates.resource_cell_value = GanttObjectLocation.resource_cell_value()
      } else if (this.viewType === 'gantt') {
        myGanttLocation.ext.zoom.init(GanttObjectLocation.zoomConfig(myGanttLocation))
        myGanttLocation.config.layout = GanttObjectLocation.layout1
      } else {
        const planGanttConfig =
          vueThis.userSettingAll.PlanStyleClass && vueThis.userSettingAll.PlanStyleClass.length
            ? vueThis.userSettingAll.PlanStyleClass.find((i) => {
              return i.key === 'grid-cell-border'
            })
            : null
        let rootClass = this.$refs.myGanttLocation.getAttribute('class') || ''
        if (planGanttConfig) {
          rootClass += rootClass ? ' ' + planGanttConfig.value.value : planGanttConfig.value.value
        }
        this.$refs.myGanttLocation.setAttribute('class', rootClass)
        myGanttLocation.config.layout = GanttObjectLocation.layout2
      }
      // 清空表头查询缓存
      vueThis.searchForm = {}
      // cell编辑器打开前逻辑设置
      GanttObjectLocation.setOnBeforeEditStart(myGanttLocation, vueThis)
      // 设置保存时机
      GanttObjectLocation.setCellSaveConfig(myGanttLocation)
      // 编辑器保存前校验
      GanttObjectLocation.checkoutBeforeCellSave(myGanttLocation, vueThis)
      // 编辑器保存后逻辑
      GanttObjectLocation.onSaveCellEven(myGanttLocation, vueThis)

      // 渲染对象
      myGanttLocation.init(this.$refs.myGanttLocation)
      this.$bus.$emit('ganttInit')
      // 加载数据
      this.loadGanttData(this.planInfoId, this.taskId, this.createPage, this.ganttDatas)
      // 配置团队成员编辑配置文件
      this.thirdMenuParam.planInfoId = this.planInfoId
      // this.thirdMenuParam.secretGrade = this.secretGrade
      this.thirdMenuParam.status = '2210'
      this.thirdMenuParam.id = this.wholeDescribeId
      this.thirdMenuParam.projectCategory = this.projectCategory
      // 配置团队成员禁用模式
      // if (this.createPage === 'compile') {
      //   this.group_type = '6'
      // } else if (this.createPage === 'decompose') {
      //   this.group_type = '4'
      // }
    },
    loadGanttData (planInfoId, taskId, createPage, ganttDatas) {
      // const monitorBtns = this.monitorBtnsByApi
      window.createPage = createPage
      const vueThis = this
      // vueThis.$api['planGanttManager.loadPlanGanttData']({
      //   planInfoId: planInfoId,
      //   dicType: 'ACTIVITY_TYPE',
      //   taskId: taskId,
      //   createPage: createPage,
      //   planBeginDateArray: vueThis.planBeginDateArray,
      //   planEndDateArray: vueThis.planEndDateArray
      // })
      //   .then(function (res) {
      let res = ganttDatas
      if (res) {
        let taskList = res.tasks
        // 初始化数据
        const datas = {
          tasks: taskList,
          links: res.links
        }
        vueThis.planEditLock = true
        myGanttLocation.config.readonly = true
        myGanttLocation.$resourcesStore.parse(res.resources)
        // myGanttLocation.serverList('secretGrades', res.secretGradeList)
        myGanttLocation.serverList('userList', res.userResourceList)
        myGanttLocation.serverList(myGanttLocation.config.monitor_point, res.monitorPointDatas)
        myGanttLocation.serverList(myGanttLocation.config.plan_type, res.taskClassifys)
        myGanttLocation.serverList(myGanttLocation.config.tasks_cooperate_dept, res.deptList)

        vueThis.budgetList = res.budgetList
        vueThis.resourceSelectModel = ['team']
        vueThis.taskClassifyDatas = res.taskClassifys
        vueThis.issueStatus = res.issueStatus
        vueThis.monitorPointDatas = res.monitorPointDatas
        vueThis.monitorLockMap = res.monitorLock
        vueThis.managerStatusMap = res.managerStatusMap
        vueThis.taskStatusMap = res.taskStatusMap
        myGanttLocation.parse(datas)
        // if (ganttDatas.loactionTaskId) {
        //   myGanttLocation.unselectTask()
        //   setTimeout(() => {
        //     myGanttLocation.showTask(ganttDatas.loactionTaskId)
        //     myGanttLocation.selectTask(ganttDatas.loactionTaskId)
        //   }, 1000)
        // }
      } else {
        vueThis.fullscreenLoading.close()
      }
      // })
      // .catch(function (error) {
      //   vueThis.fullscreenLoading.close()
      //   console.error('error' + error)
      // })
    }
  }
}
</script>
