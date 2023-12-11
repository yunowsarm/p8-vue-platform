<!---->
<template>
  <div style="height: 100%; position: relative">
    <div id="actionMenu"
         v-if="menuVisible"
         ref="actionMenu"
         :style="{ top: dropTop, left: dropLeft, maxHeight: maxHeight }">
      <VuePerfectScrollbar class="scroll-area"
                           :style="{ maxHeight: maxHeight, height: scrollBarHeight }">
        <el-menu mode="vertical"
                 :collapse="true">
          <template v-for="(menu, index) in menuData">
            <el-submenu v-if="buttonData(menu).children"
                        :disabled="isDisable(menu)"
                        :key="menu.id"
                        :index="index + 'm'">
              <span slot="title">
                <span @click="btnClick(buttonData(menu), isDisable(menu))">
                  <i :class="buttonData(menu).icon"></i>
                  <span>{{ menu.title }}</span>
                </span>
              </span>
              <template v-for="(btn, index) in buttonData(menu).children">
                <el-menu-item v-if="btn.id !== 'createByNum'"
                              :key="index"
                              @click="btnClick(btn, btn.isDisableFun(null, ganttName, selectedTasks))"
                              :index="btn.id">
                  <i :class="btn.icon"></i>
                  <span> {{ btn.title }}</span>
                </el-menu-item>
                <el-submenu v-if="btn.id === 'createByNum'"
                            :key="index + 'c'"
                            :index="index + 'b'">
                  <span slot="title">
                    <i :class="btn.icon"></i>
                    <span> {{ btn.title }}</span>
                  </span>
                  <el-input-number size="mini"
                                   v-model="createNum"
                                   :max="50"
                                   :min="1"
                                   :step-strictly="true"
                                   :step="1"></el-input-number>
                  <el-button size="mini"
                             @click="btn.clickFun(btn, ganttName, null)">确定</el-button>
                </el-submenu>
              </template>
            </el-submenu>
            <el-menu-item v-else
                          @click="btnClick(buttonData(menu), isDisable(menu))"
                          :disabled="isDisable(menu)"
                          :key="menu.id"
                          :index="menu.id + 'm'">
              <i :class="buttonData(menu).icon"></i>
              <span> {{ menu.title }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </VuePerfectScrollbar>
    </div>
    <div ref="myGantt"
         style="width: 100%; height: calc(100% - 40px) !important"
         @mousemove="mouseMove"></div>
    <div class="detail_div">
      <div style="width: 50%">
        <span style="margin-left: 16px">选中任务：</span>
        <span @click="showDetail"
              class="detail_span">{{ selectTaskName }}</span>
      </div>
      <div style="width: 50%">
        <span style="float: right; margin-right: 40px">合计 {{ taskCount }} 条</span>
        <span style="float: right; margin-right: 40px">已选中 {{ selectTaskCount }} 条</span>
      </div>
    </div>
    <grid-setting v-if="selectGridVisible"
                  :visible="selectGridVisible"
                  :columns="renderColumns"
                  :gantt-name="ganttName"
                  :create-page="createPage"
                  @close="selectGridlosed"
                  @save-setting="gridSaved"></grid-setting>
    <el-dialog title="共性资源"
               @close="closeDialog"
               :visible.sync="comResTaskSaveVisible"
               :com-res-form="comResForm"
               :modal-append-to-body="true"
               :append-to-body="true">
      <el-form :model="comResForm">
        <el-form-item label="资源类型"
                      label-width="120px"
                      prop="planBeginTime"
                      :rules="[{ required: true, message: '必填', trigger: 'blur' }]">
          <el-select v-model="comResForm.commonResourceTypesId"
                     placeholder="请选择">
            <el-option v-for="item in comResTypesOption"
                       :label="item.label"
                       :key="item.value"
                       :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="计划开始时间"
                      label-width="120px"
                      prop="planBeginTime"
                      :rules="[{ required: true, message: '必填', trigger: 'blur' }]">
          <el-date-picker v-model="comResForm.planBeginTime"
                          type="date"
                          value-format="yyyy-MM-dd"
                          placeholder="请选择"> </el-date-picker>
        </el-form-item>
        <el-form-item label="计划完成时间"
                      label-width="120px"
                      prop="planEndTime"
                      :rules="[{ required: true, message: '必填', trigger: 'blur' }]">
          <el-date-picker v-model="comResForm.planEndTime"
                          type="date"
                          value-format="yyyy-MM-dd"
                          placeholder="请选择"> </el-date-picker>
        </el-form-item>
        <el-form-item label="联系人"
                      label-width="120px"
                      :rules="[{ required: true, message: '必填', trigger: 'blur' }]">
          <el-input v-model="comResForm.contact"></el-input>
        </el-form-item>
        <el-form-item label="联系电话"
                      label-width="120px"
                      :rules="[{ required: true, message: '必填', trigger: 'blur' }]">
          <el-input v-model="comResForm.tel"
                    autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary"
                   @click="comResSubmit">确 定</el-button>
      </div>
    </el-dialog>

    <common-dialog title="请选择需要保存的任务"
                   :visible="myExperienceVisible"
                   :show-handle-btn="false"
                   @isfullscreen="isfullscreen"
                   @close="closeMyExperience"
                   :is-view-cs-footer="true">
      <template #dialog>
        <list-layout>
          <template #north>
            <span style="color: red; font-size: 14px; font-weight: bolder; float: right; line-height: 30px; display: inline-block; margin-right: 10px"
              >密级：{{ experienceLibrarySecretGradeDisplay }}</span
            >
          </template>
          <template #center>
            <common-table ref="table"
                          v-if="myExperienceVisible"
                          :comp="comp"
                          :style="{ height: customHeight + 'px' }"
                          :table-config="tableConfig"
                          :columns="Mycolumns"
                          :api="tableApi"
                          :params="queryParam"
                          :special-rote-name="roteName"
                          :use-tree-format="useTreeFormat"
                          :use-tree-p-id="useTreePId"
                          :pagination="false"
                          @select="onTableSelect"
                          @select-all="selectAll"
                          @selection-change="handleSelectionChange">
            </common-table>
          </template>
          <template #drawer-panel> </template>
        </list-layout>
      </template>
      <template #cs-footer>
        <span class="dialog-footer">
          <el-button @click="closeMyExperience">取 消</el-button>
          <el-button type="primary"
                     @click="saveMyExperience()">下一步</el-button>
        </span>
      </template>
    </common-dialog>
    <!-- 点击所查看院任务 -->
    <common-drawer size="100%"
                   v-if="detailVisible"
                   :title="detailTitle"
                   :visible="detailVisible"
                   @close="closeDetailDrawer">
      <template #drawer>
        <detail :av-task-id="avTaskId"></detail>
      </template>
    </common-drawer>
    <common-dialog title="查询"
                   width="90%"
                   :visible="ganttSearchVisible"
                   :show-handle-btn="false"
                   @isfullscreen="isfullscreen"
                   @close="closeSearch"
                   :is-view-cs-footer="false"
                   :dialog-height="360">
      <template #dialog>
        <command-search :gantt-name="ganttName"
                        :plan-info-id="planInfoId"></command-search>
      </template>
    </common-dialog>
    <common-dialog title="统计信息"
                   width="60%"
                   v-if="ganttStatisticVisible"
                   :visible="ganttStatisticVisible"
                   :show-handle-btn="false"
                   @isfullscreen="isfullscreen"
                   @close="closeStatistic"
                   :is-view-cs-footer="false"
                   :dialog-height="460">
      <template #dialog>
        <command-statistic :gantt-name="ganttName"
                           :plan-info-id="planInfoId"></command-statistic>
      </template>
    </common-dialog>
    <common-dialog title="通知下发"
                   width="70%"
                   v-if="noticeVisible"
                   :visible="noticeVisible"
                   :show-handle-btn="false"
                   @isfullscreen="isfullscreen"
                   @close="closeNotice"
                   :is-view-cs-footer="false"
                   :dialog-height="650">
      <template #dialog>
        <Notice :task-id="selectTaskId"
                :gantt-name="ganttName"
                :plan-info-id="planInfoId"
                @close="closeNotice" />
      </template>
    </common-dialog>
    <common-button-bar-setting v-if="rightMenuConfigVisible"
                               :visible="rightMenuConfigVisible"
                               title="菜单配置"
                               :panel-data="panelData"
                               @submit="submitButtonBarSetting"
                               @hidden="rightMenuConfigVisible = false">
    </common-button-bar-setting>
  </div>
</template>
<style lang="scss">
@import '~p8-dhtmlx-gantt/codebase/dhtmlxgantt.css';
@import '@/assets/commonJS/ganttJS/ganttObject.css';
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
import { CommandButtonData } from '@/assets/commonJS/ganttJS/commandButtonData'
import { PlanRightMenuData } from '@/assets/commonJS/ganttJS/planRightMenuData'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import { planGantt } from '@/assets/commonJS/ganttJS/planGanttObject'
import { mapGetters } from 'vuex'
import GridSetting from '@/components/gantt/Components/CommandGridSetting/gridSetting'
import Detail from './detail'
import CommandSearch from '@/components/gantt/Components/CommandSearch'
import { requestUrl } from '@/utils/common.js'
import CommonButtonBarSetting from '@/components/gantt/Components/CommonButtonBarSetting'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
import Notice from '../../../PlanGantt/Components/notice'
import CommandStatistic from '@/components/gantt/Components/CommandStatistic'
import { getMonitorLimitColumns } from '@/assets/commonJS/ganttJS/ganttLockUnLock'
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
    secretGrade: {
      type: String
    },
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
    Detail,
    Notice,
    'el-menu': Menu,
    'el-submenu': Submenu,
    'el-drawer': Drawer,
    'el-menu-item': MenuItem,
    'el-input-number': InputNumber,
    'el-button': Button,
    'el-dialog': Dialog,
    'el-form': Form,
    'el-input': Input,
    'el-select': Select,
    'el-option': Option,
    'el-form-item': FormItem,
    'el-date-picker': DatePicker,
    // 'myExperience-classify': MyExperienceClassify,
    CommonTable,
    GridSetting,
    // TeamManager,
    CommonDialog,
    CommonDrawer,
    ListLayout,
    // Flight,
    // Large,
    CommandSearch,
    CommandStatistic,
    CommonButtonBarSetting,
    VuePerfectScrollbar
  },
  data () {
    const mh = document.documentElement.clientHeight - 300
    return {
      columnSettings: [],
      noticeVisible: false,
      ganttStatisticVisible: false,
      activitySecretGradeDisplay: '', // 知识库导入 弹框需要展示的密级
      experienceSecretGradeDisplay: '', // 经验库导入 弹框需要展示的密级
      experienceLibrarySecretGradeDisplay: '', // 创建我的经验库导入 弹框需要展示的密级
      courtyardSecretGradeDisplay: '', // 院任务导入 弹框需要展示的密级
      excelSecretGradeDisplay: '', // Excel文件导入 弹框需要展示的密级
      excelSecretGrade: '', // Excel文件导入 弹框需要展示的密级
      projectSecretGradeDisplay: '', // project文件导入 弹框需要展示的密级
      projectSecretGrade: '', // project文件导入 弹框需要展示的密级
      isPlan: true,
      detailVisible: false,
      detailTitle: '查看院任务',
      fullscreenLoading: '',
      avTaskId: '',
      selectTaskwbsMainDataId: '',
      showProductionDialog: false,
      showSubjectNumberSelect: false,
      researchTaskRelevanceLookShow: false,
      researchTaskRelevanceShow: false,
      ClassificationSelectVisible: false,
      researchTaskRelevanceShowMore: false,
      customHeight: 300,
      ganttName: 'planGantt',
      createNum: 1,
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
      menuData: PlanRightMenuData,
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
      activityImportTitle: '活动导入',
      experienceImportTitle: '经验库导入',
      activityImportVisible: false,
      importExcelTitle: 'Excel文件导入',
      myExperienceVisible: false,
      myFlyExperienceVisible: false,
      myBigExperienceVisible: false,
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
      monitorLockMap: {}, // 标识锁定状态
      limitColumns: [], // 标识加锁后不可编辑列定义
      lockLevel: 3, // 编辑锁定任务层级，指定后，gantt页面对应任务不可做任何操作
      autoParentDate: '1', // 是否自动计算父任务时间,1：自动，2：手动
      controlTimeVisible: false, // 标识时间编辑
      monitorId: '',
      monitorName: '',
      managerStatusMap: {}, // 管理状态全部数据
      ganttEditCheck: {}, // gantt任务编辑权限
      issueStatus: '', // 任务待下发状态
      selectedTaskIds: [],
      thirdMenuParam: {},
      dialogMaxHeight: mh + 'px',
      defaultExpandAll: false,
      queryParam: {
        planId: this.planInfoId
      },
      tableConfig: {
        defaultExpandAll: true
      },
      drawerConfig: {
        destroyOnClose: true,
        modal: true,
        'modal-append-to-body': false
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
      comResTaskSaveVisible: false, // 共性资源编辑
      comResTypesOption: [],
      budgetList: [], // 任务挂接经费数据
      addRevenueVisible: false, // 选择经费挂接
      otherParam: {}, // 经费挂接参数
      addRevenueViewVisible: false, // 经费挂接信息查看
      revenueParam: {}, // 查看经费挂接信息参数
      planTypeDatas: [],
      finishTypeOptions: [],
      unitOptions: [],
      outPutViewVisible: false, // 查看输出物
      productTaskViewVisible: false, // 查看生产计划
      productTaskVisible: false,
      productTaskEditVisible: false, // 编辑生产计划信息
      planTypeViewVisible: false, // 点击行记录生产计划图标
      productTaskSaveVisible: false, // 填写生产计划
      selectTaskDate: {},
      planTypeParam: {},
      comResForm: {
        tel: '',
        contact: '',
        planBeginTime: null,
        planEndTime: null,
        comResName: '',
        projectTaskId: '',
        commonResourceTaskId: '',
        commonResourceTypesId: ''
      },
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
      rows: null,
      selectGridVisible: false,
      renderColumns: [],
      dynamicDisplayCritical: false, // 控制是否动态显示关键路径
      viewType: 'grid', // 视图类型，默认只显示列表
      ganttSearchVisible: false, // gantt查询弹出框
      rightMenuConfigVisible: false, // 右键菜单配置弹出框
      yTask: null,
      getSelectTasks: []
    }
  },
  watch: {
    selectedTasks: function (newVal, oldVal) {
      // this.comResTypesListData()
      if (newVal && newVal.length === 1 && newVal[0].status) {
        this.selectTaskId = newVal[0].id
        if (myGantt.getGlobalTaskIndex(newVal[0].id) !== 0) {
          this.selectTaskName = newVal[0].name
        }
      } else {
        this.selectTaskId = ''
        this.selectTaskName = ''
      }
      this.selectTaskCount = newVal.length
      if (newVal !== oldVal) {
        this.callParentSelectTasks()
      }
    },
    planInfoId: function (newVal, oldVal) {
      if (newVal) {
        this.initGantt(this.planInfoId, this.viewType)
        this.callParentSelectTasks()
        // cell编辑器打开前逻辑设置
        // GanttObject.setOnBeforeEditStart(myGantt, this)
        // 设置保存时机
        // GanttObject.setCellSaveConfig(myGantt)
        // 编辑器保存前校验
        // GanttObject.checkoutBeforeCellSave(myGantt, this)
        // 编辑器保存后逻辑
        // GanttObject.onSaveCellEven(myGantt, this)
      }
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
      handler (val) {
        this.menuData = val.length ? val : PlanRightMenuData
        this.scrollBarHeight = 40 * this.menuData.length + 1 + 'px'
      },
      immediate: true,
      deep: true
    }
  },
  created () { },
  mounted () {
    this.scrollBarHeight = 40 * this.menuData.length + 1 + 'px'
    window.movement = this.movement
    window.isDisable = this.isDisable
  },
  computed: {
    isDisable () {
      const that = this
      return function (btnConfig) {
        const btnData = that.buttonDatas.filter((btn) => btn.id === btnConfig.buttonId)
        return btnData[0].isDisableFun(null, this.ganttName, this.selectedTasks)
      }
    },
    buttonData () {
      const that = this
      return function (btnConfig) {
        const btnData = that.buttonDatas.filter((btn) => btn.id === btnConfig.buttonId)
        return btnData[0]
      }
    },
    ...mapGetters(['taskStyles', 'ganttRightButtons', 'userSettingAll'])
  },
  methods: {
    closeDetailDrawer () {
      this.detailVisible = false
    },
    movement () {
      this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
    },
    updateRootProgress (id, progress) {
      this.$api['planGanttManager.updateRootProgress']({ taskId: id, progress: progress }).then((res) => { })
    },
    selectAll (tableData) {
      this.selectAllChecked = !this.selectAllChecked
      this.selectAllRow(tableData, this.selectAllChecked)
      if (!this.selectAllChecked) {
        this.selectedRowKeys = []
      }
    },
    /**
     * 处理数据，全选行，默认只选子不选父
     */
    selectAllRow (data, flag) {
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
    isfullscreen (isfullscreen) {
      if (isfullscreen) {
        this.customHeight = document.documentElement.clientHeight - 120
      } else {
        this.customHeight = 300
      }
    },
    noticeShow () {
      this.noticeVisible = true
    },
    closeNotice () {
      this.noticeVisible = false
    },
    closeStatistic () {
      this.ganttStatisticVisible = false
    },
    onTableSelect (select, row) {
      // eslint-disable-next-line no-unused-vars
      const childrens = row.children

      // this.$refs.table.toggleRowSelection(row,true);//点击选中
      this.rows = this.$refs.table.$refs.table.selection // 获取表格中所有选中的数据
      const checkrow = []
      checkrow.push(row)
      // eslint-disable-next-line eqeqeq
      if (row.isCheck == true) {
        // eslint-disable-next-line eqeqeq
        if (select == 1) {
          this.$refs.table.$refs.table.toggleRowSelection(row, false)
        }
      } else {
        // eslint-disable-next-line eqeqeq
        if (select == 1) {
          this.$refs.table.$refs.table.toggleRowSelection(row, true)
        }
      }
    },
    saveMyExperience () {
      const that = this
      const selectNums = that.selectedRowKeys.length
      if (selectNums === 0) {
        this.$alert('请勾选要保存的任务', '提示', {
          confirmButtonText: '确定'
        })
      } else {
        this.innerVisible = true
      }
    },
    closeMyExperience () {
      this.selectedRowKeys = []
      this.myExperienceVisible = false
    },
    handleSelectionChange (val) {
      // this.selectedRowKeys = []
      // this.multipleSelection = val
      // val.map(item => {
      //   this.selectedRowKeys.push(item.id)
      // })
    },
    async initGantt (planInfoId, viewType) {
      this.fullscreenLoading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading'
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
      // 初始化对象
      myGantt = planGantt(vueThis.ganttName, vueThis)
      myGantt.config.scale_height = 100
      // 标识锁定后不可操作的列获取
      getMonitorLimitColumns(myGantt.config.columns, vueThis)
      // gantt视图切换
      if (viewType === 'resource') {
        myGantt.config.readonly = true
        myGantt.ext.zoom.init(GanttObject.zoomConfig(myGantt))
        // 资源负载图列头定义
        const resourceConfig = GanttObject.resourceConfig(myGantt, vueThis)
        // 定义资源模板
        const resourceTemplates = GanttObject.resourceTemplates(myGantt)
        // 重新布局
        myGantt.config.layout = GanttObject.layout3(resourceConfig, resourceTemplates)
        // 样式绑定
        myGantt.templates.grid_row_class = GanttObject.grid_row_class(myGantt)
        myGantt.templates.task_row_class = GanttObject.task_row_class(myGantt)
        myGantt.templates.timeline_cell_class = GanttObject.timeline_cell_class(myGantt)
        myGantt.templates.resource_cell_class = GanttObject.resource_cell_class()
        myGantt.templates.resource_cell_value = GanttObject.resource_cell_value()
      } else if (viewType === 'gantt') {
        myGantt.ext.zoom.init(GanttObject.zoomConfig(myGantt))
        myGantt.config.layout = GanttObject.layout1
      } else {
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
      }
      // 清空表头查询缓存
      vueThis.searchForm = {}
      // cell编辑器打开前逻辑设置
      GanttObject.setOnBeforeEditStart(myGantt, vueThis)
      // 设置保存时机
      GanttObject.setCellSaveConfig(myGantt)
      // 编辑器保存前校验
      GanttObject.checkoutBeforeCellSave(myGantt, vueThis)
      // 编辑器保存后逻辑
      GanttObject.onSaveCellEven(myGantt, vueThis)

      // 渲染对象
      myGantt.init(this.$refs.myGantt)
      // 加载数据
      this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
      // 配置团队成员编辑配置文件
      this.thirdMenuParam.planInfoId = this.planInfoId
      this.thirdMenuParam.secretGrade = this.secretGrade
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
    loadGanttData (planInfoId, taskId, createPage) {
      window.createPage = createPage
      const vueThis = this
      vueThis.$api['planGanttManager.loadPlanGanttData']({
        planInfoId: planInfoId,
        dicType: 'ACTIVITY_TYPE',
        taskId: taskId,
        createPage: 'compile',
        planBeginDateArray: vueThis.planBeginDateArray,
        planEndDateArray: vueThis.planEndDateArray
      })
        .then(function (res) {
          if (res) {
            vueThis.fullscreenLoading.close()
            // 初始化数据
            const datas = {
              tasks: res.tasks,
              links: res.links
            }
            if (res.projectStatus === '2205') {
              myGantt.config.readonly = true
            }
            if (res.trainingModeList) {
              const trainingModeListArr = []
              res.trainingModeList.map((item) => {
                trainingModeListArr.push({
                  key: item.id,
                  label: item.title
                })
              })
              myGantt.serverList(myGantt.config.training_mode_list, trainingModeListArr)
            }
            myGantt.$resourcesStore.parse(res.resources)
            myGantt.serverList('secretGrades', res.secretGradeList)
            myGantt.serverList('userList', res.userResourceList)
            myGantt.serverList(myGantt.config.monitor_point, res.monitorPointDatas)
            myGantt.serverList(myGantt.config.plan_type, res.taskClassifys)
            myGantt.serverList(myGantt.config.dept_list, res.deptList)
            myGantt.serverList(myGantt.config.tasks_cooperate_dept, res.deptList)

            // myGantt.serverList(myGantt.config.task_status, vueThis.taskStatus)
            vueThis.budgetList = res.budgetList
            vueThis.taskClassifyDatas = res.taskClassifys
            vueThis.issueStatus = res.issueStatus
            vueThis.monitorPointDatas = res.monitorPointDatas
            vueThis.monitorLockMap = res.monitorLock
            vueThis.managerStatusMap = res.managerStatusMap
            vueThis.$store.dispatch('setTaskStyles', res.taskStyle)
            myGantt.parse(datas)
            vueThis.taskCount = myGantt.getTaskCount()
            // 检查gantt操作权限
            // myGantt.config.readonly = editLockUnLockCheck(vueThis.planInfoStatus, vueThis.monitorLockMap)
          }
        })
        .catch(function (error) {
          vueThis.fullscreenLoading.close()
          console.error('error' + error)
        })
    },
    btnClick (btn, isDisable) {
      if (!isDisable) {
        this.menuVisible = false
        btn.clickFun(null, this.ganttName, this.selectedTasks)
      }
    },
    callParentSelectTasks () {
      this.$emit('select-task', this.selectedTasks, this.ganttName)
    },
    mouseMove (e) {
      if (this.menuVisible) {
        if (this.mouseY - 30 > e.clientY || this.mouseY + 30 < e.clientY || this.mouseX - 30 > e.clientX || this.mouseX + 30 < e.clientX) {
          this.menuVisible = false
        }
      }
    },
    showDetail () {
      if (myGantt.getGlobalTaskIndex(this.selectTaskId) !== 0) {
        this.$emit('show-detail', myGantt.getTask(this.selectTaskId), this.ganttName, 'view')
      }
    },
    comResTypesListData () {
      const _this = this
      _this.$api['baseData.getPublicResourceTypes']().then(function (res) {
        _this.comResTypesOption = res
      })
    },
    comResSubmit () {
      const _this = this
      if (this.comResForm.commonResourceTypesId && this.comResForm.planBeginTime && this.comResForm.planEndTime && this.comResForm.contact && this.comResForm.tel) {
        this.$api['planGanttManager.comResourceTaskSave']({
          ..._this.comResForm
        }).then((res) => {
          // 成功之后的回调
          this.$message({
            message: '保存成功',
            type: 'success'
          })
          const ganttObject = GanttObject.getGanttObject(this.ganttName)
          const task = ganttObject.getTask(this.comResForm.projectTaskId)
          task.comResName = this.comResForm.comResName
          task.commonResourceTypesId = this.comResForm.commonResourceTypesId
          task.comResPlanBeginTime = this.comResForm.planBeginTime
          task.comResPlanEndTime = this.comResForm.planEndTime
          task.comResContact = this.comResForm.contact
          task.comResTel = this.comResForm.tel
          this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
          this.closeDialog()
        })
      }
    },
    closeDialog () {
      this.comResForm.projectTaskId = ''
      this.comResForm.comResName = ''
      this.comResForm.commonResourceTypesId = ''
      this.comResForm.planBeginTime = null
      this.comResForm.planEndTime = null
      this.comResForm.contact = ''
      this.comResForm.tel = ''
      this.comResTaskSaveVisible = false
    },
    selectGridlosed () {
      this.selectGridVisible = false
    },
    gridSaved () {
      this.selectGridVisible = false
      // 清空选中
      myGantt.eachSelectedTask(function (id) {
        if (myGantt.isTaskExists(id)) {
          myGantt.unselectTask(id)
        }
      })
      // 加解锁逻辑处理
      // myGantt.config.readonly = editLockUnLockCheck(this.planInfoStatus, this.monitorLockMap)
      // myGantt.groupBy(false)
      // myGantt.config.layout = GanttObject.layout1
      // myGantt.config.scale_height = 20 * 3
      this.initGantt(this.planInfoId, this.viewType)
      // myGantt.resetLayout()
      this.callParentSelectTasks()
      // cell编辑器打开前逻辑设置
      GanttObject.setOnBeforeEditStart(myGantt, this)
      // 设置保存时机
      // GanttObject.setCellSaveConfig(myGantt)
      // 编辑器保存前校验
      GanttObject.checkoutBeforeCellSave(myGantt, this)
      // 编辑器保存后逻辑
      GanttObject.onSaveCellEven(myGantt, this)
    },
    closeSearch () {
      this.ganttSearchVisible = false
    },
    submitButtonBarSetting (updateValues, requestOtherParams) {
      const _this = this
      const params = [
        {
          id: requestOtherParams.id,
          key: requestOtherParams.key,
          description: requestOtherParams.description,
          type: requestOtherParams.type,
          value: JSON.stringify({
            type: updateValues.type,
            rightBtns: updateValues.rightBtns
          })
        }
      ]
      const url = requestUrl(requestOtherParams.saveApi)
      /** 使用$ajax请求: 是因为 this.$api请求会将请求参数处理成对象, 而保存设置接口请求参数为数组 */
      _this.$ajax
        .post(url, params, { headers: { Authorization: this.$store.getters.token } })
        .then((res) => {
          // 更新vuex
          this.$store.commit('SET_SETTING_ALL', res)
        })
        .catch((err) => {
          console.error('user.setting.save--err', err)
        })
      this.rightMenuConfigVisible = false
    }
  }
}
</script>
