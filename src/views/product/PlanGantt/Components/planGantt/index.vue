<!---->
<template>
  <div style="height: 100%; position: relative"
       class="Gantt">
    <div id="actionMenu"
         v-show="menuVisible && menuData.length"
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
                             @click="btn.clickFun(btn, ganttName, null)">确定 </el-button>
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
    <out-put-view v-if="outPutViewVisible"
                  :visible="outPutViewVisible"
                  :plan-info-id="planInfoId"
                  :task-id="taskId"
                  :create-page="createPage"
                  :gantt-name="ganttName"
                  :plan-type-datas="planTypeDatas"
                  @close-dialog="outPutViewClose">
    </out-put-view>
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
        <el-popover placement="top"
                    trigger="click">
          <div class="edit_gantt_user_list">
            <span v-if="webSocketDone">当前连接异常，无法查看正在编辑人员，请尝试刷新页面或联系运维人员</span>
            <span v-else
                  v-for="(user, ind) in editUserList"
                  :key="ind">{{ user.userName }}
              <span v-if="user.entityType === 'compile'">-计划编制</span>
              <span v-if="user.entityType === 'decompose'">-任务分解</span>
            </span>
          </div>
          <span slot="reference"
                style="float: right; margin-right: 40px; cursor: pointer">正在编辑 {{ webSocketDone ? '*' : editUserList.length == 0 ? 1 : editUserList.length }} 人</span>
        </el-popover>
      </div>
    </div>
    <el-drawer :title="activityImportTitle"
               :append-to-body="true"
               size="50%"
               :destroy-on-close="true"
               :wrapper-closable="false"
               @closed="activityImportClosed"
               :visible.sync="activityImportVisible">
      <activity-import @save-success="activityImportClosed"
                       :task-id="selectTaskId"
                       :activity-secret-grade-display="activitySecretGradeDisplay"
                       :create-page="createPage"
                       :activity-import-type="activityImportType"
                       :auto-scheduling="autoParentDate"></activity-import>
    </el-drawer>
    <common-dialog title="通知下发"
                   width="70%"
                   :visible="noticeVisible"
                   :show-handle-btn="false"
                   @isfullscreen="isfullscreen"
                   @close="closeNotice"
                   :is-view-cs-footer="false"
                   :dialog-height="650">
      <template #dialog>
        <Notice v-if="noticeVisible"
                :selected-tasks='selectedTasks'
                :task-id="selectTaskId"
                :gantt-name="ganttName"
                :plan-info-id="planInfoId"
                @close="closeNotice" />
      </template>
    </common-dialog>
    <monitor-time-manger v-if="controlTimeVisible"
                         :visible="controlTimeVisible"
                         :monitor-id="monitorId"
                         :task-id="selectTaskId"
                         :monitor-name="monitorName"
                         :task-name="selectTaskName"
                         @save-success="monitorManagerSave">
    </monitor-time-manger>
    <resource-select v-if="resourceSelectVisible"
                     :visible="resourceSelectVisible"
                     :start-task-id="startTaskId"
                     :end-task-id="endTaskId"
                     :plan-info-id="planInfoId"
                     :select-task-owner-id="selectTaskOwnerId"
                     :select-model="resourceSelectModel"
                     @closed="resourceSelectclosed"
                     @resource-selected="resourceSelected">
    </resource-select>
    <grid-setting v-if="selectGridVisible"
                  :visible="selectGridVisible"
                  :columns="renderColumns"
                  :gantt-name="ganttName"
                  :create-page="createPage"
                  @close="selectGridlosed"
                  @save-setting="gridSaved"></grid-setting>
    <common-dialog title="请选择需要保存的任务"
                   :visible="myExperienceVisible"
                   :show-handle-btn="false"
                   @isfullscreen="isfullscreen"
                   @close="closeMyExperience"
                   :is-view-cs-footer="true">
      <template #dialog>
        <list-layout>
          <template #north>
            <!-- <span style="color: red; font-size: 14px; font-weight: bolder; float: right; line-height: 30px; display: inline-block; margin-right: 10px">密级：{{ experienceLibrarySecretGradeDisplay }}</span> -->
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
          <template #drawer-panel></template>
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
    <el-drawer :title="importExcelTitle"
               :append-to-body="true"
               size="50%"
               :wrapper-closable="false"
               :destroy-on-close="true"
               @closed="importExcelClosed"
               :visible.sync="importExcel">
      <import-excel @save-success="importExcelSave"
                    @excel-export="excelExport"
                    :excel-secret-grade-display="excelSecretGradeDisplay"
                    :excel-secret-grade="excelSecretGrade"
                    :task-id="selectTaskId"
                    :planInfoId="planInfoId"
                    :columnConfigs="columnConfigs"
                    :output-request="excelImportData"></import-excel>
    </el-drawer>
    <el-drawer :title="importProjectTitle"
               :append-to-body="true"
               size="50%"
               :wrapper-closable="false"
               :destroy-on-close="true"
               @closed="resourceSettingClosed"
               :visible.sync="importProject">
      <import-project @save-success="importProjectClosed"
                      :project-secret-grade-display="projectSecretGradeDisplay"
                      :project-secret-grade="projectSecretGrade"
                      :task-id="selectTaskId"
                      :output-request="projectImportData"></import-project>
    </el-drawer>
    <!--    团队成员编辑-->
    <el-drawer class="resource-group-drawer"
               :title="resourceGroup"
               :append-to-body="true"
               :before-close="isSaveCheckHandle"
               size="100%"
               :destroy-on-close="true"
               @closed="importProjectClosed"
               :visible.sync="ganttGroupSetting">
      <keep-alive>
        <!-- <team-manager ref="team" :third-menu-param="thirdMenuParam" :group_type="group_type"></team-manager> -->
      </keep-alive>
    </el-drawer>
    <!-- 点击所查看院任务 -->
    <common-drawer size="100%">
      <template #drawer>
        <detail :av-task-id="avTaskId"></detail>
      </template>
    </common-drawer>
    <common-dialog title="查询"
                   width="90%"
                   v-if="ganttSearchVisible"
                   :visible="ganttSearchVisible"
                   :show-handle-btn="false"
                   @isfullscreen="isfullscreen"
                   @close="closeSearch"
                   :is-view-cs-footer="false"
                   :dialog-height="360">
      <template #dialog>
        <command-search :searchType="searchType"
                        :gantt-name="ganttName"
                        :plan-info-id="planInfoId"
                        @close="closeSearch"></command-search>
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
    <common-button-bar-setting v-if="rightMenuConfigVisible"
                               :visible="rightMenuConfigVisible"
                               title="菜单配置"
                               :panel-data="panelData"
                               @submit="submitButtonBarSetting"
                               @hidden="rightMenuConfigVisible = false">
    </common-button-bar-setting>
    <!-- 批量设置任务密级 -->
    <!-- <ClassificationSelection
      v-if="ClassificationSelectVisible"
      :visible="ClassificationSelectVisible"
      @closed="ClassificationSelectclosed"
      @ClassificationSelect="ClassificationSelect"
    ></ClassificationSelection> -->
    <Edit :visible="createVisible"
          :selected-task="selectedTasks"
          title="我的经验库"
          :gantt-name="ganttName"
          @handleCancel="closeCreate" />
    <my-experience-base :visible="experienceBaseVisible"
                        v-if="experienceBaseVisible"
                        :is-manage="isManage"
                        :gantt-name="ganttName"
                        :create-page="createPage"
                        :plan-info-id="planInfoId"
                        :selected-task="selectedTasks"
                        :export-experience-type="exportExperienceType"
                        @copy="copyExperienceBase"
                        @handleCancel="closExperienceBase"></my-experience-base>
    <common-drawer v-if="versionListVisible"
                   :visible="versionListVisible"
                   size="70%"
                   placement="top"
                   title="版本列表"
                   @close="versionListVisible = false">
      <template #drawer>
        <version-list :plan-info-id="planInfoId"
                      :main-gantt-name="ganttName"></version-list>
      </template>
    </common-drawer>
    <!-- <common-drawer v-if="progressHistoryVisible"
                   :visible="progressHistoryVisible"
                   size="50%"
                   placement="top"
                   title="任务进度反馈"
                   @close="progressHistoryVisible = false">
      <template #drawer>
        <ProgressHistory :task-id="selectedId" />
      </template>
    </common-drawer> -->
    <common-drawer v-if="changeHistoryVisible"
                   :visible="changeHistoryVisible"
                   size="80%"
                   placement="top"
                   title="任务历史变更"
                   @close="changeHistoryClose">
      <template #drawer>
        <ChangeHistory :plan-info-id="planInfoId"
                       :task-id="selectTaskId"
                       :create-page="createPage" />
      </template>
    </common-drawer>
    <common-drawer v-if="examineHistoryVisible"
                   :visible="examineHistoryVisible"
                   size="80%"
                   placement="top"
                   title="审批历史"
                   @close="examineHistoryClose">
      <template #drawer>
        <ExamineHistory :plan-info-id="planInfoId"
                        :task-id="selectTaskId"
                        :create-page="createPage" />
      </template>
    </common-drawer>
    <common-drawer v-if="relevancePlanVisible"
                   :visible="relevancePlanVisible"
                   size="100%"
                   placement="top"
                   title="关联"
                   @close="closeRelevance">
      <template #drawer>
        <relevance :plan-info-id="planInfoId"
                   ref="relevanceRefs"
                   @relevanceClick="relevanceClick"
                   :selectTaskId="selectTaskId"
                   :main-gantt-name="ganttName"></relevance>
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
import { PlanRightMenuData } from '@/assets/commonJS/ganttJS/planRightMenuData'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import { planGantt } from '@/assets/commonJS/ganttJS/planGanttObject'
import ActivityImport from '../activityImport'
import ImportExcel from '../importExcel'
import ImportProject from '../importProject'
import { mapGetters } from 'vuex'
import MonitorTimeManger from '../monitorTimeManager'
import ResourceSelect from '../resourceSelect'
// import ClassificationSelection from '../ClassificationSelection'
import OutPutView from '../outPutView'
import Notice from '../notice'
import GridSetting from '@/components/gantt/Components/CommandGridSetting/gridSetting'
import CommandSearch from '@/components/gantt/Components/CommandSearch'
import CommandStatistic from '@/components/gantt/Components/CommandStatistic'
import { requestUrl } from '@/utils/common.js'
import CommonButtonBarSetting from '@/components/gantt/Components/CommonButtonBarSetting'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
import { getMonitorLimitColumns } from '@/assets/commonJS/ganttJS/ganttLockUnLock'
import VersionList from '../versionList'
// import ProgressHistory from '../progressHistory'
import ChangeHistory from '../changeHistory'
import ExamineHistory from '../examineHistory'
import relevance from '../relevance'
import { version } from 'vue'
import store from '@/plugins/store'
import api from '@/plugins/api'

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
    planManagementStatus: {
      type: String,
      default: ''
    },
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
    Edit,
    'my-experience-base': MyExperienceBase,
    // ClassificationSelection,
    'el-menu': Menu,
    'el-submenu': Submenu,
    'el-drawer': Drawer,
    'el-menu-item': MenuItem,
    'el-input-number': InputNumber,
    'el-button': Button,
    // 'myExperience-classify': MyExperienceClassify,
    CommonTable,
    GridSetting,
    // ExperienceImport,
    ActivityImport,
    MonitorTimeManger,
    ResourceSelect,
    OutPutView,
    ImportExcel,
    ImportProject,
    // TeamManager,
    CommonDialog,
    CommonDrawer,
    ListLayout,
    Notice,
    // Flight,
    // Large,
    // ProgressHistory,
    ChangeHistory,
    ExamineHistory,
    CommandSearch,
    CommandStatistic,
    CommonButtonBarSetting,
    VersionList,
    VuePerfectScrollbar,
    relevance
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
      activitySecretGradeDisplay: '', // 知识库导入 弹框需要展示的密级
      experienceSecretGradeDisplay: '', // 经验库导入 弹框需要展示的密级
      experienceLibrarySecretGradeDisplay: '', // 创建我的经验库导入 弹框需要展示的密级
      excelSecretGradeDisplay: '', // Excel文件导入 弹框需要展示的密级
      excelSecretGrade: '', // Excel文件导入 弹框需要展示的密级
      projectSecretGradeDisplay: '', // project文件导入 弹框需要展示的密级
      projectSecretGrade: '', // project文件导入 弹框需要展示的密级
      isPlan: true,
      planEditLock: false,
      fullscreenLoading: '',
      avTaskId: '',
      // ClassificationSelectVisible: false,
      customHeight: 300,
      ganttName: 'planGantt',
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
      thirdMenuParam: {},
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
    $route () {
      this.initGantt(this.planInfoId, this.viewType)
    },
    selectedTasks: function (newVal, oldVal) {
      // this.comResTypesListData()
      if (newVal && newVal.length === 1 && newVal[0].status) {
        this.selectTaskId = newVal[0].id
        this.selectTaskName = newVal[0].name
      } else {
        this.selectTaskId = ''
        this.selectTaskName = ''
      }
      this.selectTaskCount = newVal.length
      this.callParentSelectTasks()
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
        this.menuData = val.length ? val : []
        this.scrollBarHeight = 40 * this.menuData.length + 1 + 'px'
      },
      immediate: true,
      deep: true
    }
  },
  created () { },
  mounted () {
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
    window.addEventListener('keyup', this.deleteTask)
    this.$bus.$on('ganttDetail', (visible) => {
      this.ganttDetail = visible
    })
  },
  computed: {
    editUserList () {
      return this.onlineData.filter((item) => {
        return item.entityId == this.planInfoId && item.entityType !== 'userChange'
      })
    },
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
    noOperate () {
      return !(
        this.ganttDetail ||
        this.menuVisible ||
        this.outPutViewVisible ||
        this.activityImportVisible ||
        this.noticeVisible ||
        this.controlTimeVisible ||
        this.resourceSelectVisible ||
        this.selectGridVisible ||
        this.myExperienceVisible ||
        this.importExcel ||
        this.importProject ||
        this.ganttSearchVisible ||
        this.ganttStatisticVisible ||
        this.rightMenuConfigVisible ||
        this.createVisible ||
        this.experienceBaseVisible ||
        this.versionListVisible ||
        this.progressHistoryVisible ||
        this.changeHistoryVisible
      )
    },
    ...mapGetters(['taskStyles', 'ganttRightButtons', 'userSettingAll', 'monitorBtnsByApi'])
  },
  methods: {
    excelExport(){
      const thisGantt = GanttObject.getGanttObject(this.ganttName)
      const vueThis = this
      const planInfoId = vueThis.planInfoId
      const colums = thisGantt.getGridColumns()
      let columnConfigs = colums.map(item => {
        let columObj = {}
        if (item.editor) {
          // 创建一个虚拟的DOM元素
          let tempElement = document.createElement('div');
          tempElement.innerHTML = item.label;

          // 获取包含计划开始时间的元素
          let startTimeElement = tempElement.querySelector('.gantt_search');

          // 提取计划开始时间文本内容
          let startTime = startTimeElement.textContent.trim();

          // 输出提取的计划开始时间
          columObj.title = startTime
          columObj.dataIndex = item.name
        }
        return columObj
      })
      //所有列的列名
      let columnList = colums.map(item => {
        let columObj = {}
        // 创建一个虚拟的DOM元素
        let tempElement = document.createElement('div');
        tempElement.innerHTML = item.label;

        // 获取包含计划开始时间的元素
        let startTimeElement = tempElement.querySelector('.gantt_search');

        // 提取计划开始时间文本内容
        let startTime = startTimeElement.textContent.trim();

        // 输出提取的计划开始时间
        columObj.title = startTime
        columObj.dataIndex = item.name
        return columObj
      })
      let columnFilter = []
      columnConfigs.forEach(function (element) {
        if (element.title && element.dataIndex) {
          columnFilter.push(element)
        }
      });
      let exportConfig = {
        columnConfigs: columnFilter,
        columnList: columnList,
        fileName: "计划管理",
        planInfoId: planInfoId,
        createPage: vueThis.createPage,
        taskId: vueThis.taskId
      }
      vueThis.$api['planGanttManager.excelExport'](exportConfig, { responseType: 'blob' })
        .then((data) => {
          const date = new Date()
          // eslint-disable-next-line camelcase
          const file_name = `【计划编制数据导出】${date.getFullYear()}-${(date.getMonth() + 1)}-${date.getDate()}_${String(date.getHours()).padStart(2, '0')}h${String(date.getMinutes()).padStart(2, '0')}m${String(date.getSeconds()).padStart(2, '0')}s`;
          // eslint-disable-next-line camelcase
          const file_type = 'xls'
          const blob = new Blob([data.data], { type: 'application/vnd.ms-excel' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          // eslint-disable-next-line camelcase
          link.download = `${file_name}.${file_type}`
          document.body.appendChild(link)
          link.click()
        })
        .catch((erro) => {
          vueThis.$message({
            message: 'excel导出失败！',
            type: 'error'
          })
        })
    },
    relevanceOpen () {
      this.relevancePlanVisible = true
    },
    relevanceClick (id) {
      // this.selectedTasks = [id]
      this.selectedId = id
    },
    refreshData () {
      this.$emit('refreshData')
    },
    closeRelevance () {
      this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
      this.relevancePlanVisible = false
    },
    copyExperienceBase (ids) {
      this.copyTasks = ids
      this.copyFlag = true
    },
    closExperienceBase (res) {
      this.isManage = false
      this.experienceBaseVisible = false

      if (res === 'true') {
        this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
      }
    },
    closeCreate () {
      this.createVisible = false
    },
    movement () {
      this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
    },
    updateRootProgress (id, progress) {
      this.$api['planGanttManager.updateRootProgress']({ taskId: id, progress: progress }).then((res) => { })
    },
    // 取消院任务关联
    researchTaskRelevanceCancel (tasks) {
      if (tasks && tasks[0]) {
        this.$api['myExperience.cancelConnectTask']({
          taskId: tasks[0].id,
          avTaskId: tasks[0].avTaskId
        }).then((res) => {
          if (res) {
            myGantt.eachSelectedTask(function (id) {
              if (myGantt.isTaskExists(id)) {
                myGantt.unselectTask(id)
              }
            })
            this.callParentSelectTasks()
            this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
            this.$message.success('取消成功')
            // this.$notify({
            //   title: '提示',
            //   message: res.message,
            //   type: 'success'
            // })
          } else {
            this.$message.warning('取消失败')
            // this.$notify.info({
            //   title: '提示',
            //   message: res.message
            // })
          }
        })
      } else {
        this.$notify.info({
          title: '提示',
          message: '数据错误'
        })
      }
    },
    isSaveCheckHandle (done) {
      const that = this
      if (!that.$refs.team.changeCheak()) {
        done()
      } else {
        this.$confirm('有修改项未保存，是否保存？', '提示', {
          confirmButtonText: '是',
          cancelButtonText: '否',
          type: 'warning',
          closeOnClickModal: false,
          closeOnPressEscape: false,
          closeOnHashChange: false,
          distinguishCancelAndClose: true
        })
          .then(() => {
            if (that.$refs.team.submit()) {
              done()
            }
            // this.$refs.teamManager.submit()
          })
          .catch((e) => {
            // if (e === 'cancel') {
            //     this.teamManagerDrawer = false
            // }
            done()
          })
      }
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
    closePop () {
      this.myExperienceImportVisible = false
    },
    successPop () {
      // this.myExperienceImportVisible = false
      this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
      this.myExperienceImportVisible = false
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
        this.clearRow(checkrow)
      } else {
        // eslint-disable-next-line eqeqeq
        if (select == 1) {
          this.$refs.table.$refs.table.toggleRowSelection(row, true)
        }
        this.checkRow(checkrow)
      }
    },
    // 取消选中递归
    clearRow (data) {
      Array.from(data).forEach((row) => {
        row.isCheck = false // 给这行数据设置一个选中字段为false
        this.$refs.table.$refs.table.toggleRowSelection(row, false)
        if (row.children) this.clearRow(row.children) // 有子集就递归  没子集了就不循环了
      })
    },
    // 选中递归
    checkRow (data) {
      Array.from(data).forEach((row) => {
        row.isCheck = true // 选中是字段值为true
        this.$refs.table.$refs.table.toggleRowSelection(row, true)
        if (row.children) this.checkRow(row.children)
      })
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
    saveCallback () {
      this.onEditModelClose()
    },
    onEditModelClose () {
      this.selectedRowKeys = []
      this.innerVisible = false
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
      // 根据项目类型，获取gantt列设置
      this.columnSettings = await this.$api['planGanttManager.getGanttColumnSettingByWholeId']({ wholeDescribeId: this.wholeDescribeId })
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
      this.$bus.$emit('ganttInit')
      // 加载数据
      this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
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
      if (this.planManagementStatus === '6620') {
        myGantt.config.readonly = true
        myGantt.config.readonlyReason = '计划发布审批，不可编辑'
      }
    },
    async selectMultipleTasks (tasks) {
      const multipleTasks = JSON.parse(JSON.stringify(tasks));
      await this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
      setTimeout(() => {
        multipleTasks.forEach((item, index) => {
          myGantt.showTask(item.id);
          myGantt.selectTask(item.id);
        });
      }, 1000);
    },
    loadGanttData (planInfoId, taskId, createPage) {
      const monitorBtns = this.monitorBtnsByApi
      window.createPage = createPage
      const vueThis = this
      vueThis.$api['planGanttManager.loadPlanGanttData']({
        planInfoId: planInfoId,
        dicType: 'ACTIVITY_TYPE',
        taskId: taskId,
        createPage: createPage,
        planBeginDateArray: vueThis.planBeginDateArray,
        planEndDateArray: vueThis.planEndDateArray
      })
        .then(function (res) {
          if (res) {
            let taskList = res.tasks
            vueThis.fullscreenLoading.close()
            // 先给task赋值拓展字段
            let extraList = vueThis.columnSettings.filter((item) => item.attributeType === '1')
            let extraStr = extraList.map((extra) => extra.filedName)
            taskList.forEach((task) => {
              // 解决gantt图鼠标悬浮任务名
              task.text = task.name
              extraStr.forEach((key) => {
                task[key] = ''
              })
              if (vueThis.$route.name == 'Planning' && !task.parent) {
                task.autoScheduling = '2'
              }
            })
            // 处理拓展字段已有的数据
            vueThis.extendMap = res.extendMap || {}
            taskList.forEach(task => {
              extraList.forEach(item => {
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
              links: res.links
            }
            if (res.projectStatus === '2205') {
              myGantt.config.readonly = true
            }
            if (
              (res.monitorLock && res.monitorLock['1010'] && res.monitorLock['1010'] === '1') ||
              (res.monitorLock && res.monitorLock['1018'] && res.monitorLock['1018'] === '1') ||
              (res.monitorLock && res.monitorLock['1020'] && res.monitorLock['1020'] === '1')
            ) {
              if (createPage === 'compile') {
                vueThis.planEditLock = true
                myGantt.config.readonly = true
                myGantt.config.readonlyReason = '计划编辑锁定时不允许此操作'
              }
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
            // myGantt.serverList('secretGrades', res.secretGradeList)
            myGantt.serverList('userList', res.userResourceList)
            myGantt.serverList(myGantt.config.monitor_point, res.monitorPointDatas)
            myGantt.serverList(myGantt.config.plan_type, res.taskClassifys)
            myGantt.serverList(myGantt.config.tasks_cooperate_dept, res.deptList)

            // myGantt.serverList(myGantt.config.task_status, vueThis.taskStatus)
            vueThis.budgetList = res.budgetList
            // if (createPage === 'decompose' && res.distribution) {
            //   vueThis.resourceSelectModel = ['user']
            // } else {
            //   vueThis.resourceSelectModel = [res.distribution]
            // }
            vueThis.resourceSelectModel = ['team']
            vueThis.taskClassifyDatas = res.taskClassifys
            vueThis.issueStatus = res.issueStatus
            vueThis.monitorPointDatas = res.monitorPointDatas
            vueThis.monitorLockMap = res.monitorLock
            vueThis.managerStatusMap = res.managerStatusMap
            vueThis.taskStatusMap = res.taskStatusMap
            vueThis.$store.dispatch('setTaskStyles', res.taskStyle)
            myGantt.parse(datas)
            vueThis.taskCount = myGantt.getTaskCount()

            myGantt.unselectTask()

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
            vueThis.fullscreenLoading.close()
          }
          vueThis.addEventClick()
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
      this.$nextTick(() => {
        this.$emit('select-task', this.selectedTasks, this.ganttName)
        if (this.pageType !== 'history') {
          this.showDetail('switch')
        } else {
          // if (myGantt.getGlobalTaskIndex(this.selectTaskId) === -1) return
          // // 如果是任务分解，非当前人员创建的，只能编辑责任人
          // const task = myGantt.getTask(this.selectTaskId)
          // this.$emit('switch-task', task)
          // this.reminderList.forEach((item) => {
          //   if (item.id == task.id) {
          //     item.reminder = 0
          //   }
          // })
        }
      })
    },
    mouseMove (e) {
      if (this.menuVisible) {
        if (this.mouseY - 30 > e.clientY || this.mouseY + 30 < e.clientY || this.mouseX - 30 > e.clientX || this.mouseX + 30 < e.clientX) {
          this.menuVisible = false
        }
      }
    },
    showDetail (type) {
      this.pageType = 'switch'
      // 如果是任务分解，非当前人员创建的，只能编辑责任人
      const userId = this.$store.getters.userInfo.id
      const task = myGantt.getTask(this.selectTaskId)
      if (this.createPage === 'decompose' && task.createUserId && task.createUserId != userId) {
        this.$emit('show-detail', myGantt.getTask(this.selectTaskId), this.ganttName, 'view', type)
      } else {
        this.$emit('show-detail', myGantt.getTask(this.selectTaskId), this.ganttName, '', type)
      }
    },
    activityImportClosed () {
      this.activityImportVisible = false
      myGantt.eachSelectedTask(function (id) {
        if (myGantt.isTaskExists(id)) {
          myGantt.unselectTask(id)
        }
      })
      this.callParentSelectTasks()
      this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
    },
    experienceImportClosed () {
      this.myExperienceImportVisible = false
      myGantt.eachSelectedTask(function (id) {
        if (myGantt.isTaskExists(id)) {
          myGantt.unselectTask(id)
        }
      })
      this.initGantt(this.planInfoId, this.viewType)
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
    monitorManagerSave (obj) {
      this.controlTimeVisible = false
    },
    importExcelClosed(){
      this.importExcel = false
    },
    importExcelSave () {
      this.importExcel = false
      myGantt.eachSelectedTask(function (id) {
        if (myGantt.isTaskExists(id)) {
          myGantt.unselectTask(id)
        }
      })
      this.callParentSelectTasks()
      // this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
      this.initGantt(this.planInfoId, this.viewType)
    },
    resourceRelationClosed () {
      this.resourceRelation = false
      this.callParentSelectTasks()
      this.loadGanttData(this.planInfoId, this.taskId)
    },
    importProjectClosed () {
      this.importProject = false
      myGantt.eachSelectedTask(function (id) {
        if (myGantt.isTaskExists(id)) {
          myGantt.unselectTask(id)
        }
      })
      this.callParentSelectTasks()
      this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
    },
    resourceSettingClosed () {
      this.importProject = false
    },
    comResTypesListData () {
      const _this = this
      _this.$api['baseData.getPublicResourceTypes']().then(function (res) {
        _this.comResTypesOption = res
      })
    },
    importTaskExFresh () {
      myGantt.eachSelectedTask(function (id) {
        if (myGantt.isTaskExists(id)) {
          myGantt.unselectTask(id)
        }
      })
      this.callParentSelectTasks()
      this.loadGanttData(this.planInfoId, this.taskId)
    },
    batchSyncTaskCallBack () {
      this.loadGanttData(this.planInfoId, '', this.createPage)
    },
    outPutViewClose () {
      this.outPutViewVisible = false
    },
    resourceSelected (ownerId, row, type) {
      const that = this
      if (that.selectedTasks && that.selectedTasks.length > 0) {
        if (!row.departureTime) {
          myGantt.batchUpdate(function () {
            that.selectedTasks.forEach((task) => {
              if (type === 'dept') {
                myGantt.getTask(task.id).owner_id = ownerId
                myGantt.getTask(task.id).realName = ''
                myGantt.getTask(task.id).dutyDeptId = row.id
                myGantt.getTask(task.id).dutyDeptName = row.label
              } else if (type === 'team') {
                myGantt.getTask(task.id).owner_id = ownerId
                myGantt.getTask(task.id).realName = row.name
                myGantt.getTask(task.id).dutyDeptName = row.deptName
              } else {
                myGantt.getTask(task.id).owner_id = ownerId
                myGantt.getTask(task.id).realName = row.realName
                myGantt.getTask(task.id).dutyDeptName = row.deptName
              }
              myGantt.getTask(task.id).owner_type = type
              myGantt.getTask(task.id).updateType = ''
              myGantt.updateTask(task.id)
            })
          })
        }
      }
      this.resourceSelectVisible = false
    },
    // ClassificationSelect(ownerId, row) {
    //   const that = this
    //   myGantt.batchUpdate(function () {
    //     that.selectedTasks.forEach((task) => {
    //       myGantt.getTask(task.id).secretGrade = ownerId.secretGrade
    //       myGantt.updateTask(task.id)
    //     })
    //   })
    //   this.ClassificationSelectVisible = false
    // },
    resourceSelectclosed () {
      this.resourceSelectVisible = false
    },
    // ClassificationSelectclosed() {
    //   this.ClassificationSelectVisible = false
    // },
    saveExperience () {
      this.$refs.experience.confirmExperiece()
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
    closeStatistic () {
      this.ganttStatisticVisible = false
    },
    closeMenuConfig () {
      this.rightMenuConfigVisible = false
    },
    noticeShow () {
      this.noticeVisible = true
    },
    closeNotice () {
      this.noticeVisible = false
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
            autoScheduling: updateValues.autoScheduling,
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
      this.initGantt(this.planInfoId, this.viewType)
      this.rightMenuConfigVisible = false
    },
    //  创建版本
    createPlanVersion () {
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
    showTaskProgressDialog (taskId) {
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
    showChangeHistory () {
      this.changeHistoryVisible = true
    },
    changeHistoryClose () {
      this.changeHistoryVisible = false
      this.$store.dispatch('setVueThis', this)
    },
    examineHistoryClose () {
      this.examineHistoryVisible = false
      this.$store.dispatch('setVueThis', this)
    },
    deleteTask () {
      let that = this
      if (event.keyCode === 46) {
        let taskIds = myGantt.getSelectedTasks()
        if (that.ganttName == 'planGantt' && taskIds.length > 0 && that.noOperate) {
          let tasks = []
          let falg = false
          taskIds.forEach((id) => {
            let task = myGantt.getTask(id)
            if (task.managerStatus === '6403' || task.managerStatus === '6401') {
              falg = true
            }
            tasks.push(task)
          })
          if (falg) {
            deleteKeyRemove(that.ganttName, tasks)
          }
        }
      }
    },
    async getExtraList (columnSettings) {
      let that = this
      let extraList = columnSettings.filter((item) => item.attributeType === '1' && item.selectCode)
      let obj = {}
      if (extraList && extraList.length) {
        let list = extraList.map(async el => {
          let list = await that.$api['formGenerator.getSelectionDataDic']({ selectCode: el.selectCode })
          obj[el.selectCode] = list
          return obj
        })
        that.extraMap = obj
        let listEnd = await Promise.all(list)
      }
    },
    addEventClick () {
      let GanttEle = document.querySelector('.gantt_grid_data')
      if (GanttEle) {
        GanttEle.addEventListener('click', function (e) {
          let selectEles = document.querySelectorAll('.select-dropdown')
          let csInputIcons = document.querySelectorAll('.cs-input-icon')
          if (selectEles && selectEles.length) {
            selectEles.forEach(el => {
              el.style.opacity = '0'
              el.style.transform = 'scale(1,0)'
            })
          }
          if (csInputIcons && csInputIcons.length) {
            csInputIcons.forEach(el => {
              el.classList.remove('is-reverse');
            })
          }
        })
        this.clearClick = true
      }
    },
    getSelectStatus () {
      let opacity = '0'
      let selectEles = document.querySelectorAll('.select-dropdown')
      if (selectEles && selectEles.length) {
        selectEles.forEach(el => {
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
  destroyed () {
    window.myWebSocket.off('planGantGroup')
    window.removeEventListener('keyup', this.deleteTask)
    this.$bus.$off('ganttDetail')
  }
}
</script>
