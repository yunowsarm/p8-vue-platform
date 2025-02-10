<!---->
<template>
  <div style="height: 100%; position: relative" class="Gantt">
    <div id="actionMenu" v-show="menuVisible && menuData.length" ref="actionMenu" :style="{ top: dropTop, left: dropLeft, maxHeight: maxHeight }">
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
                  <el-input-number size="mini" v-model="createNum" :max="50" :min="1" :step-strictly="true" :step="1"></el-input-number>
                  <el-button size="mini" @click="btn.clickFun(btn, ganttName, null)">确定</el-button>
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
    <div ref="myGantt" v-loading="loading" style="width: 100%; height: calc(100% - 40px) !important" @mousemove="mouseMove"></div>
    <div class="detail_div">
      <div style="width: 50%">
        <span style="margin-left: 16px">选中任务：</span>
        <span @click="showDetail" class="detail_span">{{ selectTaskName }}</span>
      </div>
      <div style="width: 50%">
        <span style="float: right; margin-right: 40px">合计 {{ taskCount || 0 }} 条</span>
        <span style="float: right; margin-right: 40px">已选中 {{ selectTaskCount || 0 }} 条</span>
      </div>
    </div>
    <grid-setting
      v-if="selectGridVisible"
      :visible="selectGridVisible"
      :columns="renderColumns"
      :gantt-name="ganttName"
      :create-page="createPage"
      @close="selectGridlosed"
      @save-setting="gridSaved"
    ></grid-setting>
    <common-dialog
      title="查询"
      width="90%"
      v-if="ganttSearchVisible"
      :visible="ganttSearchVisible"
      :show-handle-btn="false"
      @isfullscreen="isfullscreen"
      @close="closeSearch"
      :is-view-cs-footer="false"
      :dialog-height="360"
    >
      <template #dialog>
        <command-search :searchType="searchType" :gantt-name="ganttName" :plan-info-id="planInfoId" @close="closeSearch"></command-search>
      </template>
    </common-dialog>
    <common-dialog
      title="统计信息"
      width="60%"
      v-if="ganttStatisticVisible"
      :visible="ganttStatisticVisible"
      :show-handle-btn="false"
      @isfullscreen="isfullscreen"
      @close="closeStatistic"
      :is-view-cs-footer="false"
      :dialog-height="460"
    >
      <template #dialog>
        <command-statistic :gantt-name="ganttName" :project-id="projectId"></command-statistic>
      </template>
    </common-dialog>
    <common-drawer v-if="changeHistoryVisible" :visible="changeHistoryVisible" size="80%" placement="top" title="任务历史变更" @close="changeHistoryClose">
      <template #drawer>
        <ChangeHistory :plan-info-id="planInfoId" :task-id="selectTaskId" :create-page="createPage" />
      </template>
    </common-drawer>
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
import {
  Menu,
  Submenu,
  MenuItem,
  Drawer,
  InputNumber,
  Button,
  Dialog,
  Form,
  Input,
  Select,
  Option,
  FormItem,
  DatePicker,
  P8Table as CommonTable,
  P8Dialog as CommonDialog,
  P8Drawer as CommonDrawer,
  P8ListLayout as ListLayout
} from 'p8-components-ui'
import Edit from '@/views/product/MyExperienceBase/edit.vue'
import MyExperienceBase from '@/views/product/MyExperienceBase/myExperienceBase.vue'
import { CommandButtonData, deleteKeyRemove } from '@/assets/commonJS/ganttJS/commandButtonData'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import { taskStatisticsGantt } from './js/taskStatisticsGantt,js'
import { mapGetters } from 'vuex'
import GridSetting from '@/components/gantt/Components/CommandGridSetting/gridSetting'
import CommandSearch from '@/components/gantt/Components/CommandSearch'
import CommandStatistic from './components/CommandStatistic'
import { requestUrl } from '@/utils/common.js'
import CommonButtonBarSetting from '@/components/gantt/Components/CommonButtonBarSetting'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
import ChangeHistory from '@/views/product/PlanGantt/Components/changeHistory/index.vue'

const Mycolumns = [
  {
    title: '',
    dataIndex: 'checkbox',
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

let myGantt
export default {
  name: 'PlanGantt',
  props: {
    projectId: {
      type: String,
      default: null
    },
    planBeginDateArray: {
      type: Array,
      default: () => []
    },
    planEndDateArray: {
      type: Array,
      default: () => []
    },
    // planInfoId: {
    //   type: String,
    //   default: null
    // },
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
    Edit,
    'my-experience-base': MyExperienceBase,
    'el-menu': Menu,
    'el-submenu': Submenu,
    'el-drawer': Drawer,
    'el-menu-item': MenuItem,
    'el-input-number': InputNumber,
    'el-button': Button,
    CommonTable,
    GridSetting,
    CommonDialog,
    CommonDrawer,
    ListLayout,
    CommandSearch,
    CommandStatistic,
    CommonButtonBarSetting,
    VuePerfectScrollbar,
    ChangeHistory
  },
  data() {
    const mh = document.documentElement.clientHeight - 300
    return {
      taskList: [],
      planInfoId: '',
      loading: false,
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
      ganttName: 'taskStatisticsGantt',
      searchType: false,
      createNum: 1,
      noticeVisible: false,
      menuVisible: false,
      treeDataEditorConfig: {
        useTreeFormat: true,
        useTreePId: '',
        defaultValue: [],
        disabledValues: ['1'],
        defaultExpandAll: true,
        defaultExpandedKeys: ['1'],
        placeholder: '',
        clearable: true,
        multiple: true,
        checkStrictly: false,
        optionUrl: {
          api: 'ProjectApply.deptTree',
          params: {}
        }
      },
      webSocketDone: false,
      onlineData: [],
      treeDataEditorConfig1: {
        useTreeFormat: true,
        useTreePId: '',
        defaultValue: [],
        // disabledValues: ['1'],
        defaultExpandAll: true,
        defaultExpandedKeys: ['1'],
        placeholder: '',
        clearable: true,
        multiple: false,
        checkStrictly: false,
        optionUrl: {
          api: 'ProjectApply.deptTree',
          params: {}
        }
      },
      menuData: [],
      dropTop: '0px',
      dropLeft: '0px',
      maxHeight: (mh + 300) / 2 + 'px',
      scrollBarHeight: '0px', // 右键菜单的高度
      selectedTasks: [],
      buttonDatas: CommandButtonData,
      resourceConfig: {},
      resourceTemplates: {},
      SDMParam: {},
      selectTaskId: '',
      startDate: '',
      endDate: '',
      comp: this,
      Mycolumns: Mycolumns,
      selectTaskName: '',
      resourceSelectVisible: false, // 责任选择框校验
      resourceSelectModel: null,
      sysUserList: [],
      distribution: '',
      activityImportTitle: '活动导入',
      experienceImportTitle: '经验库导入',
      activityImportVisible: false,
      importExcelTitle: 'Excel文件导入',
      myExperienceVisible: false,
      myExperienceImportVisible: false,
      myExperienceClassifyVisible: false,
      // SDMlinkVisible: false,
      innerVisible: false,
      importExcel: false,
      resourceRelation: false,
      resourceTitle: '资源关联',
      importProjectTitle: 'Project文件导入',
      resourceGroup: '团队成员编辑',
      importProject: false,
      ganttGroupSetting: false,
      // SDMlink: '',
      group_type: '6',
      activityImportType: '',
      taskCount: '', // 任务总数
      selectTaskCount: '', // 选中任务数量
      deep: 0,
      mouseX: '',
      mouseY: '',
      copyTasks: {}, // 复制任务id载体
      taskClassifyDatas: [],
      monitorPointDatas: [],
      dependentDatas: [],
      searchForm: {},
      columnSettings: [],
      reminderList: [],
      monitorLockMap: {}, // 标识锁定状态
      limitColumns: [], // 标识加锁后不可编辑列定义
      lockLevel: 3, // 编辑锁定任务层级，指定后，gantt页面对应任务不可做任何操作
      autoParentDate: '1', // 是否自动计算父任务时间,1：自动，2：手动
      controlTimeVisible: false, // 标识时间编辑
      monitorId: '',
      monitorName: '',
      managerStatusMap: {}, // 管理状态全部数据
      taskStatusMap: {},
      ganttEditCheck: {}, // gantt任务编辑权限
      issueStatus: '', // 任务待下发状态
      selectedTaskIds: [],
      dialogMaxHeight: mh + 'px',
      defaultExpandAll: false,
      excelImportData: [
        {
          attId: '1',
          attFilePath: 'Excel导入模板.xls',
          attFileName: 'Excel导入模板',
          path: 'Accessory.xls',
          descriptionStr: '按照大纲级别，将文档中的任务导入为选中任务的下级任务。'
        }
      ],
      projectImportData: [
        {
          attId: '3',
          attFilePath: 'Project导入模板.mpp',
          attFileName: 'Project导入模板',
          path: 'ProjectAccessory.mpp',
          descriptionStr: '按照大纲级别，将文档中的任务导入为选中任务的下级任务。'
        }
      ],
      queryParam: {
        planId: this.planInfoId
      },
      tableConfig: {
        defaultExpandAll: true
      },
      tableApi: 'myExperience.myExperienceList',
      dialogTableVisible: false,
      dialogFormVisible: false,
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      },
      formLabelWidth: '120px',
      useTreeFormat: true,
      useTreePId: 'parentId',
      multipleSelection: [],
      selectedRowKeys: [],
      selectedRows: [],
      comResTypesOption: [],
      budgetList: [], // 任务挂接经费数据
      planTypeDatas: [],
      finishTypeOptions: [],
      unitOptions: [],
      outPutViewVisible: false, // 查看输出物
      selectTaskDate: {},
      startTaskId: '', // 责任人选择列表任务分布情况开始时间任务id
      endTaskId: '', // 责任人选择列表任务分布情况结束时间任务id
      selectTaskOwnerId: '', // 选中行责任人团队角色id
      normalLayout: {
        west: {
          xs: 24,
          sm: 24,
          md: 24,
          lg: 24,
          xl: 24
        },
        center: {
          xs: 0,
          sm: 0,
          md: 0,
          lg: 0,
          xl: 0
        }
      },
      ganttDetail: false,
      extendMap: {},
      rows: null,
      selectGridVisible: false,
      renderColumns: [],
      dynamicDisplayCritical: false, // 控制是否动态显示关键路径
      viewType: 'grid', // 视图类型，默认只显示列表
      ganttSearchVisible: false, // gantt查询弹出框
      ganttStatisticVisible: false,
      rightMenuConfigVisible: false, // 右键菜单配置弹出框
      getSelectTasks: [],
      // progressHistoryVisible: false,
      changeHistoryVisible: false,
      examineHistoryVisible: false,
      selectedId: '',
      pageType: 'switch',
      versionListVisible: false, //  版本列表显示隐藏
      extraMap: {}
    }
  },
  watch: {
    projectId: function (newVal, oldVal) {
      this.initGantt(this.projectId, this.viewType)
    },
    selectedTasks: function (newVal, oldVal) {
      // this.comResTypesListData()
      if (newVal && newVal.length === 1 && newVal[0].status) {
        this.selectTaskId = newVal[0].id
        this.selectTaskName = newVal[0].name
        // this.loadGantt()
      } else {
        this.selectTaskId = ''
        this.selectTaskName = ''
      }
      this.selectTaskCount = newVal.length
      this.callParentSelectTasks()
    },
    rows: function (newRow) {
      const checkRowLeng = newRow.length
      this.selectedRowKeys = []
      this.selectedRows = []

      if (checkRowLeng > 0) {
        newRow.forEach((col) => {
          this.selectedRowKeys.push(col.id)

          // that.selectedRowKeys.push()
          this.selectedRows.push(col)
        })
        this.selectedRowKeys = Array.from(new Set(this.selectedRowKeys))
      } else {
        this.selectedRowKeys = []
      }
    },
    ganttRightButtons: {
      handler(val) {
        this.menuData = val.length ? val : []
        this.scrollBarHeight = 40 * this.menuData.length + 1 + 'px'
      },
      immediate: true,
      deep: true
    }
  },
  created() {},
  mounted() {
    this.initGantt(this.projectId, this.viewType)
    const that = this
    this.scrollBarHeight = 40 * this.menuData.length + 1 + 'px'
    window.movement = this.movement
    window.isDisable = this.isDisable
    if (!window.myWebSocket.connected) {
      this.webSocketDone = true
    }
    let timer = null
    window.myWebSocket.on('planGantGroup', (data) => {
      if (timer) clearTimeout(timer) // 每次监听输入值，都会去判断是否还有timer，有就清除timer
      timer = setTimeout(() => {
        that.onlineData = data
        let html = '<div class="edit_gantt_user_list">'
        that.editUserList.forEach((item) => {
          html += `<span>${item.userName}`
          if (item.entityType === 'compile') {
            html += ' -计划编制'
          } else if (item.entityType === 'decompose') {
            html += ' -任务分解'
          }
          html += '</span>'
        })
        html += '</div>'
        if (that.editUserList.length > 1) {
          that.$notify({
            title: `${that.editUserList.length}人正在编制当前计划`,
            dangerouslyUseHTMLString: true,
            message: html
          })
        }
      }, 1)
    })
    // window.addEventListener('keyup', this.deleteTask)
    // this.$bus.$on('ganttDetail', (visible) => {
    //   this.ganttDetail = visible
    // })
  },
  computed: {
    editUserList() {
      return this.onlineData.filter((item) => {
        return item.entityId == this.planInfoId && item.entityType !== 'userChange'
      })
    },
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
    ganttRightButtons() {
      return [
        {
          title: '详细信息',
          buttonId: 'detail-info',
          icon: 'p8 icon-task-details'
        }
      ]
    },
    ...mapGetters(['taskStyles', 'userSettingAll', 'monitorBtnsByApi'])
  },
  methods: {
    fullscreen(btn) {
      myGantt.ext.fullscreen.getFullscreenElement = function () {
        return document.querySelector('#couerDiv')
      }
      let viewWidth = null
      if (btn.title === '全屏') {
        myGantt.ext.fullscreen.expand()
      } else {
        myGantt.ext.fullscreen.collapse()
      }
      myGantt.attachEvent("onCollapse", (event) => {
        btn.title = '全屏'
        btn.icon = 'p8 icon-full-screen'
        btn.help = '全屏'
        viewWidth = document.querySelector('#couerDiv').clientWidth;
        this.$emit('update-view-width',viewWidth)
      });
      myGantt.attachEvent("onExpand", () => {
        btn.title = '退出全屏'
        btn.icon = 'p8 icon-exit-fullscreen'
        btn.help = '退出全屏'
        viewWidth = window.innerWidth;
        this.$emit('update-view-width',viewWidth)
      });
    },
    refreshGanttData() {
      myGantt.refreshData()
      this.$store.dispatch('setVueThis', this)
    },
    relevanceOpen() {
      this.relevancePlanVisible = true
    },
    relevanceClick(id) {
      // this.selectedTasks = [id]
      this.selectedId = id
    },
    refreshData() {
      this.$emit('refreshData')
    },
    closeRelevance() {
      this.loadGanttData(this.planInfoId)
      this.relevancePlanVisible = false
    },
    copyExperienceBase(ids) {
      this.copyTasks = ids
      this.copyFlag = true
    },
    closExperienceBase(res) {
      this.isManage = false
      this.experienceBaseVisible = false

      if (res === 'true') {
        this.loadGanttData(this.planInfoId)
      }
    },
    closeCreate() {
      this.createVisible = false
    },
    movement() {
      this.loadGanttData(this.planInfoId)
    },
    /**
     * 处理数据，全选行，默认只选子不选父
     */
    selectAllRow(data, flag) {
      const _this = this
      data.map((row) => {
        if (row.children && row.children.length > 0) {
          _this.selectAllRow(row.children, flag)
        }
        if (row.parentId) {
          // 根节点不算
          this.selectedRowKeys.push(row.id)
          row.isCheck = flag
          _this.$refs.table.$refs.table.toggleRowSelection(row, flag)
        }
      })
    },
    isfullscreen(isfullscreen) {
      if (isfullscreen) {
        this.customHeight = document.documentElement.clientHeight - 120
      } else {
        this.customHeight = 300
      }
    },
    // 取消选中递归
    clearRow(data) {
      Array.from(data).forEach((row) => {
        row.isCheck = false // 给这行数据设置一个选中字段为false
        this.$refs.table.$refs.table.toggleRowSelection(row, false)
        if (row.children) this.clearRow(row.children) // 有子集就递归  没子集了就不循环了
      })
    },
    // 选中递归
    checkRow(data) {
      Array.from(data).forEach((row) => {
        row.isCheck = true // 选中是字段值为true
        this.$refs.table.$refs.table.toggleRowSelection(row, true)
        if (row.children) this.checkRow(row.children)
      })
    },
    saveCallback() {
      this.onEditModelClose()
    },
    onEditModelClose() {
      this.selectedRowKeys = []
      this.innerVisible = false
      this.myExperienceVisible = false
    },
    handleSelectionChange(val) {
      // this.selectedRowKeys = []
      // this.multipleSelection = val
      // val.map(item => {
      //   this.selectedRowKeys.push(item.id)
      // })
    },
    async initGantt(projectId, viewType) {
      this.loading = true
      // this.fullscreenLoading = this.$loading({
      //   lock: true,
      //   text: 'Loading',
      //   spinner: 'el-icon-loading'
      // })
      // 根据项目类型，获取gantt列设置
      this.columnSettings = await this.$api['planGanttManager.getGanttColumnSettingByWholeIds']({ wholeDescribeId: this.wholeDescribeId })
      await this.getExtraList(this.columnSettings)
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
      myGantt = GanttObject.getGanttObject(vueThis.ganttName)
      if (myGantt) {
        GanttObject.setGanttObject(vueThis.ganttName, {})
        myGantt.destructor()
      }

      // await vueThis.$api['planGanttManager.getProjectStatus']({ planInfoId: planInfoId })
      //   .then(function (res) {
      //     if (res && res === '2205') {
      //       myGantt.config.readonly = true
      //     }
      //   })
      //   .catch(function (error) {
      //     console.error('error' + error)
      //   })
      // vuex存放
      vueThis.$store.dispatch('setVueThis', vueThis)
      vueThis.$store.commit('SET_PREVIOUS_THIS', vueThis)
      // 初始化对象
      myGantt = taskStatisticsGantt(vueThis.ganttName, vueThis)
      myGantt.config.scale_height = 100
      const planGanttConfig =
        vueThis.userSettingAll.PlanStyleClass && vueThis.userSettingAll.PlanStyleClass.length
          ? vueThis.userSettingAll.PlanStyleClass.find((i) => {
              return i.key === 'grid-cell-border'
            })
          : null
      let rootClass = this.$refs.myGantt.getAttribute('class') || ''
      if (planGanttConfig) {
        rootClass += rootClass ? ' ' + planGanttConfig.value.value : planGanttConfig.value.value
      }
      this.$refs.myGantt.setAttribute('class', rootClass)
      myGantt.config.layout = GanttObject.layout2
      // 清空表头查询缓存
      vueThis.searchForm = {}
      // 渲染对象
      myGantt.init(this.$refs.myGantt)
      this.$bus.$emit('ganttInit')
      // 加载数据
      this.loadGanttData(this.projectId)
    },
    async selectMultipleTasks(tasks) {
      const multipleTasks = JSON.parse(JSON.stringify(tasks))
      await this.loadGanttData(this.projectId)
      setTimeout(() => {
        multipleTasks.forEach((item, index) => {
          myGantt.showTask(item.id)
          myGantt.selectTask(item.id)
        })
      }, 1000)
    },
    loadGanttData(projectId, open = false) {
      const monitorBtns = this.monitorBtnsByApi
      window.createPage = this.createPage
      const vueThis = this
      vueThis.$api['planGanttManager.loadPlanGanttDataByProjectType']({
        projectType: projectId,
        dicType: 'ACTIVITY_TYPE',
        createPage: this.createPage
      })
        .then(function (res) {
          if (res) {
            let taskList = []
            let links = []
            res.forEach((item) => {
              taskList = [...taskList, ...item.tasks]
              links = [...links, ...item.links]
            })
            vueThis.loading = false
            // 先给task赋值拓展字段
            let extraList = vueThis.columnSettings.filter((item) => item.attributeType === '1')
            let extraStr = extraList.map((extra) => extra.filedName)
            taskList.forEach((task) => {
              // 解决gantt图鼠标悬浮任务名
              task.open = open
              task.text = task.name
              extraStr.forEach((key) => {
                task[key] = ''
              })
              if (vueThis.$route.name == 'Planning' && !task.parent) {
                task.autoScheduling = '2'
              }
            })
            // 处理拓展字段已有的数据
            const project = res[0]
            console.log(project)
            vueThis.extendMap = project.extendMap || {}
            taskList.forEach((task) => {
              extraList.forEach((item) => {
                task['kz' + item.id] = ''
              })
              if (vueThis.extendMap && Object.keys(vueThis.extendMap).length > 0) {
                if (vueThis.extendMap[task.id]) {
                  let extendData = vueThis.extendMap[task.id]
                  extendData.forEach((item) => {
                    task['kz' + item.customItem1] = item.fieldValue ? item.fieldValue : ''
                  })
                }
              }
            })
            // 初始化数据
            const datas = {
              tasks: taskList,
              links: links
            }
            vueThis.taskList = taskList
            if (res[0].trainingModeList) {
              const trainingModeListArr = []
              res[0].trainingModeList.map((item) => {
                trainingModeListArr.push({
                  key: item.id,
                  label: item.title
                })
              })
              myGantt.serverList(myGantt.config.training_mode_list, trainingModeListArr)
            }
            myGantt.$resourcesStore.parse(project.resources)
            // myGantt.serverList('secretGrades', res.secretGradeList)
            myGantt.serverList('userList', project.userResourceList)
            myGantt.serverList(myGantt.config.monitor_point, project.monitorPointDatas)
            myGantt.serverList(myGantt.config.plan_type, project.taskClassifys)
            myGantt.serverList(myGantt.config.tasks_cooperate_dept, project.deptList)
            myGantt.config.open_tree_initially = false
            // myGantt.serverList(myGantt.config.task_status, vueThis.taskStatus)
            vueThis.budgetList = project.budgetList
            // if (createPage === 'decompose' && res.distribution) {
            //   vueThis.resourceSelectModel = ['user']
            // } else {
            //   vueThis.resourceSelectModel = [res.distribution]
            // }
            vueThis.resourceSelectModel = ['team']
            vueThis.taskClassifyDatas = project.taskClassifys
            vueThis.issueStatus = project.issueStatus
            vueThis.monitorPointDatas = project.monitorPointDatas
            vueThis.monitorLockMap = project.monitorLock
            vueThis.managerStatusMap = project.managerStatusMap
            vueThis.taskStatusMap = project.taskStatusMap
            vueThis.$store.dispatch('setTaskStyles', project.taskStyle)
            myGantt.clearAll()
            myGantt.parse(datas)
            vueThis.taskCount = myGantt.getTaskCount()

            myGantt.unselectTask()
            myGantt.ext.fullscreen.getFullscreenElement = function () {
              return document.querySelector('#couerDiv')
            }
            if (!vueThis.relevancePlanVisible && vueThis.selectedId) {
              setTimeout(() => {
                myGantt.showTask(vueThis.selectedId)
                myGantt.selectTask(vueThis.selectedId)
              }, 1000)
            }
            if (vueThis.isSueTaskIds && vueThis.isSueTaskIds.length) {
              vueThis.isSueTaskIds.forEach((el) => {
                myGantt.showTask(el)
                myGantt.selectTask(el)
              })
              vueThis.isSueTaskIds = null
            }
            // 检查gantt操作权限
            // myGantt.config.readonly = editLockUnLockCheck(vueThis.planInfoStatus, vueThis.monitorLockMap)
          } else {
            vueThis.loading = false
          }
          // vueThis.addEventClick()
        })
        .catch(function (error) {
          vueThis.loading = false
          console.error('error' + error)
        })
    },
    // 展开所有gantt
    expandAll() {
      this.loadGanttData(this.projectId, true)
    },
    // 收缩所有gantt
    collapseAll() {
      this.loadGanttData(this.projectId, false)
    },
    async gridSaved() {
      this.selectGridVisible = false
      // 清空选中
      myGantt.unselectTask()
      // 加解锁逻辑处理
      // myGantt.config.readonly = editLockUnLockCheck(this.planInfoStatus, this.monitorLockMap)
      // myGantt.groupBy(false)
      // myGantt.config.layout = GanttObject.layout1
      // myGantt.config.scale_height = 20 * 3
      myGantt.ext.fullscreen.collapse()
      await this.initGantt(this.projectId)
      myGantt.ext.fullscreen.getFullscreenElement = function () {
        return document.querySelector('#couerDiv')
      }
      // myGantt.resetLayout()
      this.callParentSelectTasks()
      // GanttObject.setOnBeforeEditStart(myGantt, this)
      // 设置保存时机
      // GanttObject.setCellSaveConfig(myGantt)
      // 编辑器保存前校验
      // GanttObject.checkoutBeforeCellSave(myGantt, this)
      // 编辑器保存后逻辑
      // GanttObject.onSaveCellEven(myGantt, this)
    },
    loadGantt() {
      let vueThis = this
      vueThis.dependentDatas = []
      vueThis.$api['planGanttManager.loadPlanGanttData']({
        planInfoId: this.planInfoId,
        dicType: 'ACTIVITY_TYPE',
        taskId: this.taskId,
        createPage: this.createPage,
        planBeginDateArray: vueThis.planBeginDateArray,
        planEndDateArray: vueThis.planEndDateArray
      }).then((res) => {
        if (res) {
          let taskList = res.tasks
          taskList.forEach((task) => {
            vueThis.dependentDatas.push({
              id: task.id,
              name: task.name,
              parent: task.parent,
              status: task.status,
              hasAtt: task.hasAtt && task.hasAtt > 0 ? 'true' : 'false' // 是否存在输出
            })
          })
        }
      })
    },
    btnClick(btn, isDisable) {
      if (!isDisable) {
        this.menuVisible = false
        btn.clickFun(null, this.ganttName, this.selectedTasks)
      }
    },
    callParentSelectTasks() {
      this.$nextTick(() => {
        const task = myGantt.getTask(this.selectTaskId)
        this.planInfoId = task.planInfoId
        this.$emit('switch-task', task)
        this.$emit('select-task', this.selectedTasks, this.ganttName)
        if (this.pageType !== 'history') {
          this.showDetail('switch')
        }
      })
    },
    mouseMove(e) {
      if (this.menuVisible) {
        if (this.mouseY - 30 > e.clientY || this.mouseY + 30 < e.clientY || this.mouseX - 30 > e.clientX || this.mouseX + 30 < e.clientX) {
          this.menuVisible = false
        }
      }
    },
    showDetail(type) {
      this.pageType = 'switch'
      // 如果是任务分解，非当前人员创建的，只能编辑责任人
      const userId = this.$store.getters.userInfo.id
      const task = myGantt.getTask(this.selectTaskId)
      if (task) {
        this.$emit('show-detail', task, this.ganttName, 'view', type)
      }
    },
    selectGridlosed() {
      this.selectGridVisible = false
    },
    closeSearch() {
      this.ganttSearchVisible = false
    },
    closeStatistic() {
      this.ganttStatisticVisible = false
    },
    noticeShow() {
      this.noticeVisible = true
    },
    //  创建版本
    createPlanVersion() {
      let version = ''
      this.$api['planGanttManager.getVersionNum']({
        planInfoId: this.planInfoId
      }).then((res) => {
        if (res) {
          version = res
        }
      })
      this.$prompt('请输入版本说明', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        this.$confirm(`是否创建计划版本${version}, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$api['planGanttManager.versionCreate']({
            planInfoId: this.planInfoId,
            versionNote: value
          }).then((res) => {
            if (res) {
              this.$message({
                message: '版本创建成功',
                type: 'success'
              })
            } else {
              this.$message({
                message: '版本创建失败',
                type: 'error'
              })
            }
          })
        })
      })
    },
    showTaskProgressDialog(taskId) {
      this.selectedId = taskId
      this.pageType = 'history'
      this.$emit('show-detail', myGantt.getTask(taskId), this.ganttName, '', 'history')
      // this.progressHistoryVisible = true
      this.reminderList.forEach((item) => {
        if (item.id == taskId) {
          item.reminder = 0
        }
      })
    },
    showChangeHistory() {
      this.changeHistoryVisible = true
    },
    changeHistoryClose() {
      this.changeHistoryVisible = false
      this.$store.dispatch('setVueThis', this)
    },
    examineHistoryClose() {
      this.examineHistoryVisible = false
      this.$store.dispatch('setVueThis', this)
    },
    async getExtraList(columnSettings) {
      let that = this
      let extraList = columnSettings.filter((item) => item.attributeType === '1' && item.selectCode)
      let obj = {}
      if (extraList && extraList.length) {
        let list = extraList.map(async (el) => {
          let list = await that.$api['formGenerator.getSelectionDataDic']({ selectCode: el.selectCode })
          obj[el.selectCode] = list
          return obj
        })
        that.extraMap = obj
        let listEnd = await Promise.all(list)
      }
    },
    // addEventClick () {
    //   let GanttEle = document.querySelector('.gantt_grid_data')
    //   if (GanttEle) {
    //     GanttEle.addEventListener('click', function (e) {
    //       let selectEles = document.querySelectorAll('.select-dropdown')
    //       let csInputIcons = document.querySelectorAll('.cs-input-icon')
    //       if (selectEles && selectEles.length) {
    //         selectEles.forEach(el => {
    //           el.style.opacity = '0'
    //           el.style.transform = 'scale(1,0)'
    //         })
    //       }
    //       if (csInputIcons && csInputIcons.length) {
    //         csInputIcons.forEach(el => {
    //           el.classList.remove('is-reverse');
    //         })
    //       }
    //     })
    //     this.clearClick = true
    //   }
    // },
    getSelectStatus() {
      let opacity = '0'
      let selectEles = document.querySelectorAll('.select-dropdown')
      if (selectEles && selectEles.length) {
        selectEles.forEach((el) => {
          if (el.style.opacity == '1') {
            opacity = el.style.opacity
          }
        })
      }
      if (opacity == '1') {
        return true
      } else {
        return false
      }
    }
  },
  destroyed() {
    window.myWebSocket.off('planGantGroup')
    // window.removeEventListener('keyup', this.deleteTask)
    this.$bus.$off('ganttDetail')
  }
}
</script>
