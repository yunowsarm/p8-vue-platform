<!---->
<template>
  <div style="height: 100%; position: relative">
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
    <add-revenue v-if="addRevenueVisible" :visible="addRevenueVisible" :other-param="otherParam" @close-dialog="addRevenueClose"> </add-revenue>
    <add-revenue-view v-if="addRevenueViewVisible" :visible="addRevenueViewVisible" :other-param="revenueParam" @close-dialog="fundMouseout"> </add-revenue-view>
    <out-put-view
      v-if="outPutViewVisible"
      :visible="outPutViewVisible"
      :plan-info-id="planInfoId"
      :task-id="taskId"
      :create-page="createPage"
      :gantt-name="ganttName"
      :plan-type-datas="planTypeDatas"
      @close-dialog="outPutViewClose"
    >
    </out-put-view>
    <product-task-view
      v-if="productTaskViewVisible"
      :visible="productTaskViewVisible"
      :plan-info-id="planInfoId"
      :task-id="taskId"
      :gantt-name="ganttName"
      :plan-type-datas="planTypeDatas"
      @close-dialog="productTaskViewClose"
    >
    </product-task-view>
    <product-task
      v-if="productTaskVisible"
      :visible="productTaskVisible"
      :plan-info-id="planInfoId"
      :task-id="taskId"
      :gantt-name="ganttName"
      :plan-type-datas="planTypeDatas"
      @close-dialog="productTaskClose"
    >
    </product-task>
    <product-task-edit
      v-if="productTaskEditVisible"
      :visible="productTaskEditVisible"
      :plan-info-id="planInfoId"
      :task-id="selectTaskId"
      :task-name="selectTaskName"
      @close-dialog="productTaskEditClose"
    >
    </product-task-edit>
    <div ref="myGantt" style="width: 100%; height: calc(100% - 40px) !important" @mousemove="mouseMove"></div>
    <div class="detail_div">
      <div style="width: 50%">
        <span style="margin-left: 16px">选中任务：</span>
        <span @click="showDetail" class="detail_span">{{ selectTaskName }}</span>
      </div>
      <div style="width: 50%">
        <span style="float: right; margin-right: 40px">合计 {{ taskCount }} 条</span>
        <span style="float: right; margin-right: 40px">已选中 {{ selectTaskCount }} 条</span>
      </div>
    </div>
    <el-drawer :title="activityImportTitle" :append-to-body="true" size="50%" :destroy-on-close="true" :wrapper-closable="false" @closed="activityImportClosed" :visible.sync="activityImportVisible">
      <activity-import
        @save-success="activityImportClosed"
        :task-id="selectTaskId"
        :activity-secret-grade-display="activitySecretGradeDisplay"
        :create-page="createPage"
        :activity-import-type="activityImportType"
        :auto-scheduling="autoParentDate"
      ></activity-import>
    </el-drawer>
    <common-dialog title="通知下发" width="70%" :visible="noticeVisible" :show-handle-btn="false" @isfullscreen="isfullscreen" @close="closeNotice" :is-view-cs-footer="false" :dialog-height="650">
      <template #dialog>
        <Notice v-if="noticeVisible" :task-id="selectTaskId" :gantt-name="ganttName" :plan-info-id="planInfoId" @close="closeNotice" />
      </template>
    </common-dialog>
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
    <resource-select
      v-if="resourceSelectVisible"
      :visible="resourceSelectVisible"
      :start-task-id="startTaskId"
      :end-task-id="endTaskId"
      :plan-info-id="planInfoId"
      :select-task-owner-id="selectTaskOwnerId"
      @closed="resourceSelectclosed"
      @resource-selected="resourceSelected"
    >
    </resource-select>
    <grid-setting
      v-if="selectGridVisible"
      :visible="selectGridVisible"
      :columns="renderColumns"
      :gantt-name="ganttName"
      :create-page="createPage"
      @close="selectGridlosed"
      @save-setting="gridSaved"
    ></grid-setting>
    <el-dialog title="共性资源" @close="closeDialog" :visible.sync="comResTaskSaveVisible" :com-res-form="comResForm" :modal-append-to-body="true" :append-to-body="true">
      <el-form :model="comResForm">
        <el-form-item label="资源类型" label-width="120px" prop="planBeginTime" :rules="[{ required: true, message: '必填', trigger: 'blur' }]">
          <el-select v-model="comResForm.commonResourceTypesId" placeholder="请选择">
            <el-option v-for="item in comResTypesOption" :label="item.label" :key="item.value" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="计划开始时间" label-width="120px" prop="planBeginTime" :rules="[{ required: true, message: '必填', trigger: 'blur' }]">
          <el-date-picker v-model="comResForm.planBeginTime" type="date" value-format="yyyy-MM-dd" placeholder="请选择"> </el-date-picker>
        </el-form-item>
        <el-form-item label="计划完成时间" label-width="120px" prop="planEndTime" :rules="[{ required: true, message: '必填', trigger: 'blur' }]">
          <el-date-picker v-model="comResForm.planEndTime" type="date" value-format="yyyy-MM-dd" placeholder="请选择"> </el-date-picker>
        </el-form-item>
        <el-form-item label="联系人" label-width="120px" :rules="[{ required: true, message: '必填', trigger: 'blur' }]">
          <el-input v-model="comResForm.contact"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" label-width="120px" :rules="[{ required: true, message: '必填', trigger: 'blur' }]">
          <el-input v-model="comResForm.tel" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="comResSubmit">确 定</el-button>
      </div>
    </el-dialog>

    <common-dialog title="请选择需要保存的任务" :visible="myExperienceVisible" :show-handle-btn="false" @isfullscreen="isfullscreen" @close="closeMyExperience" :is-view-cs-footer="true">
      <template #dialog>
        <list-layout>
          <template #north>
            <span style="color: red; font-size: 14px; font-weight: bolder; float: right; line-height: 30px; display: inline-block; margin-right: 10px"
              >密级：{{ experienceLibrarySecretGradeDisplay }}</span
            >
          </template>
          <template #center>
            <common-table
              ref="table"
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
              @selection-change="handleSelectionChange"
            >
            </common-table>
          </template>
          <template #drawer-panel> </template>
        </list-layout>
      </template>
      <template #cs-footer>
        <span class="dialog-footer">
          <el-button @click="closeMyExperience">取 消</el-button>
          <el-button type="primary" @click="saveMyExperience()">下一步</el-button>
        </span>
      </template>
    </common-dialog>
    <!-- <common-dialog title="请选择分类" :visible="innerVisible" :show-handle-btn="false" @isfullscreen="isfullscreen" @close="innerVisible = false" :is-view-cs-footer="true">
      <template #dialog>
        <list-layout :header-visible="false">
          <template #center>
            <myExperience-classify
              ref="experience"
              :normal-layout="normalLayout"
              @saveSuccess="saveCallback"
              :select-experience-ids="selectedRowKeys"
              :selected-rows="selectedRows"
            ></myExperience-classify>
          </template>
          <template #drawer-panel> </template>
        </list-layout>
      </template>
      <template #cs-footer>
        <span class="dialog-footer">
          <el-button @click="innerVisible = false">返回上一步</el-button>
          <el-button type="primary" @click="saveExperience">保存到我的经验库</el-button>
        </span>
      </template>
    </common-dialog> -->
    <!-- <el-drawer :title="experienceImportTitle" :append-to-body="true" size="50%" :destroy-on-close="true" :wrapper-closable="false" @closed="closePop" :visible.sync="myExperienceImportVisible">
      <experience-import
        v-if="myExperienceImportVisible"
        :plan-info-id="planInfoId"
        :experience-secret-grade-display="experienceSecretGradeDisplay"
        :parent-task-id="selectTaskId"
        :create-page="createPage"
        @closePop="closePop"
        @save-success="experienceImportClosed"
      >
      </experience-import>
    </el-drawer> -->
    <!--    <common-drawer-->
    <!--      v-if="myExperienceClassifyVisible"-->
    <!--      :drawerConfig="drawerConfig"-->
    <!--      size="30%"-->
    <!--      :visible="myExperienceClassifyVisible"-->
    <!--      @close="onEditModelClose"-->
    <!--    >-->
    <!--      <template #drawer>-->
    <!--        <myExperience-classify-->
    <!--          :normalLayout="normalLayout"-->
    <!--          @saveSuccess="saveCallback"-->
    <!--          :selectExperienceIds="selectedRowKeys"-->
    <!--        ></myExperience-classify>-->
    <!--      </template>-->
    <!--    </common-drawer>-->
    <el-drawer
      title="院MPM任务关联"
      :append-to-body="true"
      size="100%"
      :wrapper-closable="false"
      :destroy-on-close="true"
      @closed="researchTaskRelevanceShow = false"
      :visible.sync="researchTaskRelevanceShow"
    >
      <researchTaskRelevance :tasks="selectedTasks" @close="researchTaskRelevanceClose" />
    </el-drawer>
    <el-drawer
      title="院任务导入"
      :append-to-body="true"
      size="100%"
      :wrapper-closable="false"
      :destroy-on-close="true"
      @closed="researchTaskRelevanceShowMore = false"
      :visible.sync="researchTaskRelevanceShowMore"
    >
      <researchTaskRelevanceMore :tasks="selectedTasks" :courtyard-secret-grade-display="courtyardSecretGradeDisplay" :create-page="createPage" @close="contryYardMoreClose" />
    </el-drawer>
    <el-drawer
      title="已关联院MPM任务查看"
      :append-to-body="true"
      size="100%"
      :wrapper-closable="false"
      :destroy-on-close="true"
      @closed="researchTaskRelevanceLookShow = false"
      :visible.sync="researchTaskRelevanceLookShow"
    >
      <researchTaskRelevanceLook :tasks="yTask" @close="researchTaskRelevanceLookShow = false" />
    </el-drawer>
    <el-drawer :title="importExcelTitle" :append-to-body="true" size="50%" :wrapper-closable="false" :destroy-on-close="true" @closed="importExcelClosed" :visible.sync="importExcel">
      <import-excel
        @save-success="importExcelClosed"
        :excel-secret-grade-display="excelSecretGradeDisplay"
        :excel-secret-grade="excelSecretGrade"
        :task-id="selectTaskId"
        :output-request="excelImportData"
      ></import-excel>
    </el-drawer>
    <el-drawer :title="importProjectTitle" :append-to-body="true" size="50%" :wrapper-closable="false" :destroy-on-close="true" @closed="resourceSettingClosed" :visible.sync="importProject">
      <import-project
        @save-success="importProjectClosed"
        :project-secret-grade-display="projectSecretGradeDisplay"
        :project-secret-grade="projectSecretGrade"
        :task-id="selectTaskId"
        :output-request="projectImportData"
      ></import-project>
    </el-drawer>
    <!--    团队成员编辑-->
    <el-drawer
      class="resource-group-drawer"
      :title="resourceGroup"
      :append-to-body="true"
      :before-close="isSaveCheckHandle"
      size="100%"
      :destroy-on-close="true"
      @closed="importProjectClosed"
      :visible.sync="ganttGroupSetting"
    >
      <keep-alive>
        <!-- <team-manager ref="team" :third-menu-param="thirdMenuParam" :group_type="group_type"></team-manager> -->
      </keep-alive>
    </el-drawer>
    <common-drawer
      v-if="planTypeViewVisible"
      :visible.sync="planTypeViewVisible"
      size="100%"
      placement="top"
      :drawer-config="drawerConfig"
      :title="planTypeParam.taskName + '(明细)'"
      @close="planTypeViewVisibleClosed"
    >
      <template #drawer>
        <erp-list :plan-type-param="planTypeParam" @save-success="onPlanTypeViewClose"> </erp-list>
      </template>
    </common-drawer>
    <!-- 点击所查看院任务 -->
    <common-drawer size="100%" v-if="detailVisible" :title="detailTitle" :visible="detailVisible" @close="closeDetailDrawer">
      <template #drawer>
        <detail :av-task-id="avTaskId"></detail>
      </template>
    </common-drawer>

    <!-- <common-dialog title="飞行试验" :visible="myFlyExperienceVisible" :show-handle-btn="false" @isfullscreen="isfullscreen" @close="closeMyFlyExperience" :is-view-cs-footer="false">
      <template #dialog>
        <flight ref="flight" :plan-type-param="planTypeParam" @saveSuccess="saveCallback" v-if="myFlyExperienceVisible"></flight>
      </template>
    </common-dialog> -->
    <!-- <common-dialog title="SDM链接"
                   style="top: 120px;"
                   :SDMParam="SDMParam"
                   :visible="SDMlinkVisible"
                   :dialogHeight="200"
                   @close="closeSDMlinkVisible"
                   @handle-cancel="closeSDMlinkVisible"
                   @handle-ok="SDMhandleOk"
                   :isViewCsFooter="false">
                   <template #dialog>
                    <div class="SDMlink">
                      SDM链接:<el-input v-model="SDMlink" style="width: 80%;margin-left: 5px;"></el-input>
                    </div>
                   </template>
    </common-dialog> -->
    <save-product :visible="productTaskSaveVisible" :record="selectTaskDate" @close-modal="closeProductTaskSave" @save-success="productTaskSaveCallback" v-if="productTaskSaveVisible"></save-product>

    <!-- <common-dialog
      title="大型试验填报"
      :visible="myBigExperienceVisible"
      :show-handle-btn="false"
      @isfullscreen="isfullscreen"
      @close="closeMyBigExperience"
      :is-view-cs-footer="false"
      :dialog-height="360"
    >
      <template #dialog>
        <large ref="large" :plan-type-param="planTypeParam" @saveSuccess="saveCallback" v-if="myBigExperienceVisible"></large>
      </template>
    </common-dialog> -->
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
        <command-search :gantt-name="ganttName" :plan-info-id="planInfoId"></command-search>
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
        <command-statistic :gantt-name="ganttName" :plan-info-id="planInfoId"></command-statistic>
      </template>
    </common-dialog>
    <common-button-bar-setting
      v-if="rightMenuConfigVisible"
      :visible="rightMenuConfigVisible"
      title="菜单配置"
      :panel-data="panelData"
      @submit="submitButtonBarSetting"
      @hidden="rightMenuConfigVisible = false"
    >
    </common-button-bar-setting>
    <SubjectNumberSelect
      v-if="showSubjectNumberSelect"
      :visible="showSubjectNumberSelect"
      :select-taskwbs-main-data-id="selectTaskwbsMainDataId"
      @closed="closeSubjectNumberSelect"
      @subjectNumberClose="subjectNumberClose"
    />
    <ProductionDialog v-if="showProductionDialog" :select-task-id="selectTaskId" :visible="showProductionDialog" @closed="closeProductionDialog" />
    <!-- 批量设置任务密级 -->
    <ClassificationSelection
      v-if="ClassificationSelectVisible"
      :visible="ClassificationSelectVisible"
      @closed="ClassificationSelectclosed"
      @ClassificationSelect="ClassificationSelect"
    ></ClassificationSelection>
    <Edit :visible="createVisible" :selected-task="selectedTasks" title="我的经验库" :gantt-name="ganttName" @handleCancel="closeCreate" />
    <my-experience-base
      :visible="experienceBaseVisible"
      :is-manage="isManage"
      :gantt-name="ganttName"
      :create-page="createPage"
      :plan-info-id="planInfoId"
      :selected-task="selectedTasks"
      :export-experience-type="exportExperienceType"
      @copy="copyExperienceBase"
      @handleCancel="closExperienceBase"
    ></my-experience-base>
    <common-drawer v-if="versionListVisible"
                   :visible="versionListVisible"
                   size="70%"
                   placement="top"
                   title="版本列表"
                   @close="versionListVisible = false">
      <template #drawer>
        <version-list :planInfoId="planInfoId"></version-list>
      </template>
    </common-drawer>
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
import Edit from '@/views/product/MyExperienceBase/edit.vue'
import MyExperienceBase from '@/views/product/MyExperienceBase/myExperienceBase.vue'
import { CommandButtonData } from '@/assets/commonJS/ganttJS/commandButtonData'
import { PlanRightMenuData } from '@/assets/commonJS/ganttJS/planRightMenuData'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import { planGantt } from '@/assets/commonJS/ganttJS/planGanttObject'
import ActivityImport from '../activityImport'
import ImportExcel from '../importExcel'
import ImportProject from '../importProject'
import researchTaskRelevanceLook from '../researchTaskRelevance/look'
import researchTaskRelevance from '../researchTaskRelevance'
import researchTaskRelevanceMore from '../researchTaskRelevance/indexMore.vue'
import { mapGetters } from 'vuex'
import MonitorTimeManger from '../monitorTimeManager'
import ResourceSelect from '../resourceSelect'
import ClassificationSelection from '../ClassificationSelection'
import AddRevenue from '../addRevenue'
import SubjectNumberSelect from '../subjectNumberSelect'
import ProductionDialog from '../ProductionDialog'
import AddRevenueView from '../addRevenueView'
import OutPutView from '../outPutView'
import ProductTaskView from '../productTaskView'
import ProductTask from '../productTaskView/ProjectTask'
import ErpList from '../erpList'
import Notice from '../notice'
import ProductTaskEdit from '../productTaskView/productTaskEdit'
// import MyExperienceClassify from '@/views/Product/Repository/MyExperienceBase/myExperienceClassify'

// import ExperienceImport from '@/views/Product/Repository/MyExperienceBase/experienceImport'
import GridSetting from '@/components/gantt/Components/CommandGridSetting/gridSetting'
// import TeamManager from '@/views/Product/Pm/Resource/teamManager'

// import Flight from '@/views/Product/Pm/Flight/Flight'
// import Large from '@/views/Product/Pm/Flight/Large'
import SaveProduct from '../saveProduct/saveProduct'
import Detail from './detail'
import CommandSearch from '@/components/gantt/Components/CommandSearch'
import CommandStatistic from '@/components/gantt/Components/CommandStatistic'
import { requestUrl } from '@/utils/common.js'
import CommonButtonBarSetting from '@/components/gantt/Components/CommonButtonBarSetting'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
import { getMonitorLimitColumns } from '@/assets/commonJS/ganttJS/ganttLockUnLock'
import VersionList from '../versionList'
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
    projectTypeId: {
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
    ClassificationSelection,
    SaveProduct,
    Detail,
    SubjectNumberSelect,
    ProductionDialog,
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
    // ExperienceImport,
    ActivityImport,
    MonitorTimeManger,
    ResourceSelect,
    AddRevenue,
    AddRevenueView,
    researchTaskRelevance,
    researchTaskRelevanceMore,
    researchTaskRelevanceLook,
    OutPutView,
    ProductTaskView,
    ProductTask,
    ProductTaskEdit,
    ImportExcel,
    ImportProject,
    // TeamManager,
    CommonDialog,
    CommonDrawer,
    ErpList,
    ListLayout,
    Notice,
    // Flight,
    // Large,
    CommandSearch,
    CommandStatistic,
    CommonButtonBarSetting,
    VersionList,
    VuePerfectScrollbar
  },
  data() {
    const mh = document.documentElement.clientHeight - 300
    return {
      createVisible: false,
      exportExperienceType: '',
      experienceBaseVisible: false,
      isManage: false,
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
      planEditLock: false,
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
      columnSettings: [],
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
      excelImportData: [
        {
          attId: '1',
          attFilePath: 'Excel导入模板.xlsx',
          attFileName: 'Excel导入模板',
          path: 'Accessory.xlsx',
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
      ganttStatisticVisible: false,
      rightMenuConfigVisible: false, // 右键菜单配置弹出框
      yTask: null,
      getSelectTasks: [],
      versionListVisible: false //  版本列表显示隐藏
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
      handler(val) {
        this.menuData = val.length ? val : PlanRightMenuData
        this.scrollBarHeight = 40 * this.menuData.length + 1 + 'px'
      },
      immediate: true,
      deep: true
    }
  },
  created() {},
  mounted() {
    this.scrollBarHeight = 40 * this.menuData.length + 1 + 'px'
    window.movement = this.movement
    window.isDisable = this.isDisable
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
    ...mapGetters(['taskStyles', 'ganttRightButtons', 'userSettingAll'])
  },
  methods: {
    copyExperienceBase (ids) {
      this.copyTasks = ids
      this.copyFlag = true
    },
    closExperienceBase(res) {
      this.isManage = false
      this.experienceBaseVisible = false
      console.log(res, 'res')
      if (res === 'true') {
        this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
      }
    },
    closeCreate() {
      this.createVisible = false
    },
    closeDetailDrawer() {
      this.detailVisible = false
    },
    subjectNumberClose(id, row) {
      const that = this
      if (that.selectedTasks && that.selectedTasks.length > 0) {
        myGantt.batchUpdate(function () {
          that.selectedTasks.forEach((task) => {
            myGantt.getTask(task.id).wbsMainDataId = id
            myGantt.getTask(task.id).posid = row.posid
            myGantt.updateTask(task.id)
          })
        })
      }
      this.showSubjectNumberSelect = false
    },
    closeSubjectNumberSelect() {
      this.showSubjectNumberSelect = false
    },
    closeProductionDialog() {
      this.showProductionDialog = false
    },
    movement() {
      this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
    },
    updateRootProgress(id, progress) {
      this.$api['planGanttManager.updateRootProgress']({ taskId: id, progress: progress }).then((res) => {})
    },
    researchTaskRelevanceClose() {
      this.researchTaskRelevanceShow = false
      myGantt.eachSelectedTask(function (id) {
        if (myGantt.isTaskExists(id)) {
          myGantt.unselectTask(id)
        }
      })
      this.callParentSelectTasks()
      this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
    },
    contryYardMoreClose() {
      this.researchTaskRelevanceShowMore = false
      myGantt.eachSelectedTask(function (id) {
        if (myGantt.isTaskExists(id)) {
          myGantt.unselectTask(id)
        }
      })
      this.callParentSelectTasks()
      this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
    },
    // 取消院任务关联
    researchTaskRelevanceCancel(tasks) {
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
    isSaveCheckHandle(done) {
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
    selectAll(tableData) {
      this.selectAllChecked = !this.selectAllChecked
      this.selectAllRow(tableData, this.selectAllChecked)
      if (!this.selectAllChecked) {
        this.selectedRowKeys = []
      }
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
    closePop() {
      this.myExperienceImportVisible = false
    },
    successPop() {
      // this.myExperienceImportVisible = false
      this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
      this.myExperienceImportVisible = false
    },
    onTableSelect(select, row) {
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
    saveMyExperience() {
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
    closeMyExperience() {
      this.selectedRowKeys = []
      this.myExperienceVisible = false
    },
    closeMyFlyExperience() {
      this.selectedRowKeys = []
      this.myFlyExperienceVisible = false
    },
    closeMyBigExperience() {
      this.selectedRowKeys = []
      this.myBigExperienceVisible = false
    },
    closeProductTaskSave() {
      this.selectTaskDate = null
      this.productTaskSaveVisible = false
    },
    productTaskSaveCallback() {
      this.productTaskSaveVisible = false
    },
    saveCallback() {
      this.onEditModelClose()
      this.onDrawerClose()
      this.myFlyExperienceVisibleClose()
    },
    onDrawerClose() {
      this.myBigExperienceVisible = false
      this.record = {}
    },
    myFlyExperienceVisibleClose() {
      this.myFlyExperienceVisible = false
      this.record = {}
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
    async initGantt(planInfoId, viewType) {
      this.fullscreenLoading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading'
      })
      // 根据项目类型，获取gantt列设置
      this.columnSettings = await this.$api['planGanttManager.getGanttColumnSettingByWholeId']({ wholeDescribeId: this.projectTypeId })

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
      myGantt.config.scale_height = 50
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
    loadGanttData(planInfoId, taskId, createPage) {
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
            vueThis.fullscreenLoading.close()
            // 初始化数据
            const datas = {
              tasks: res.tasks,
              links: res.links
            }
            if (res.projectStatus === '2205') {
              myGantt.config.readonly = true
            }
            if (res.monitorLock && res.monitorLock['1010'] && res.monitorLock['1010'] === '1') {
              if (createPage === 'compile') {
                vueThis.planEditLock = true
                myGantt.config.readonly = true
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
    btnClick(btn, isDisable) {
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
      if (myGantt.getGlobalTaskIndex(this.selectTaskId) === 0) return
      const roles = this.$store.getters.userInfo.userRoles.map((role) => {
        return role.roleId
      })
      if (this.createPage === 'decompose' && roles.includes('SYS_ROLE077')) {
        this.$emit('show-detail', myGantt.getTask(this.selectTaskId), this.ganttName, 'view')
      } else {
        this.$emit('show-detail', myGantt.getTask(this.selectTaskId), this.ganttName)
      }
    },
    activityImportClosed() {
      this.activityImportVisible = false
      myGantt.eachSelectedTask(function (id) {
        if (myGantt.isTaskExists(id)) {
          myGantt.unselectTask(id)
        }
      })
      this.callParentSelectTasks()
      this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
    },
    experienceImportClosed() {
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
    monitorManagerSave(obj) {
      this.controlTimeVisible = false
    },
    importExcelClosed() {
      this.importExcel = false
      myGantt.eachSelectedTask(function (id) {
        if (myGantt.isTaskExists(id)) {
          myGantt.unselectTask(id)
        }
      })
      this.callParentSelectTasks()
      this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
    },
    resourceRelationClosed() {
      this.resourceRelation = false
      this.callParentSelectTasks()
      this.loadGanttData(this.planInfoId, this.taskId)
    },
    importProjectClosed() {
      this.importProject = false
      myGantt.eachSelectedTask(function (id) {
        if (myGantt.isTaskExists(id)) {
          myGantt.unselectTask(id)
        }
      })
      this.callParentSelectTasks()
      this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
    },
    resourceSettingClosed() {
      this.importProject = false
    },
    planTypeViewVisibleClosed() {
      this.planTypeParam = Object.assign({}, {})
      this.planTypeViewVisible = false
    },
    onPlanTypeViewClose(res) {
      const taskId = this.planTypeParam.taskId
      const ganttObject = GanttObject.getGanttObject(this.ganttName)
      const task = ganttObject.getTask(taskId)
      task.attentionTaskNum = res
      this.loadGanttData(this.planInfoId, taskId, this.createPage)
      this.planTypeParam = Object.assign({}, {})
      this.planTypeViewVisible = false
    },
    comResTypesListData() {
      const _this = this
      _this.$api['baseData.getPublicResourceTypes']().then(function (res) {
        _this.comResTypesOption = res
      })
    },
    importTaskExFresh() {
      myGantt.eachSelectedTask(function (id) {
        if (myGantt.isTaskExists(id)) {
          myGantt.unselectTask(id)
        }
      })
      this.callParentSelectTasks()
      this.loadGanttData(this.planInfoId, this.taskId)
    },
    comResSubmit() {
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
    unComResSubmit(taskId) {
      const ganttObject = GanttObject.getGanttObject(this.ganttName)
      const task = ganttObject.getTask(this.comResForm.projectTaskId)
      this.$api['planGanttManager.unComResourceTaskSave']({ taskId: taskId }).then((res) => {
        // 成功之后的回调
        this.$message({
          message: '取消成功',
          type: 'success'
        })
        task.commonResourceTypesId = ''
        this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
      })
    },
    closeDialog() {
      this.comResForm.projectTaskId = ''
      this.comResForm.comResName = ''
      this.comResForm.commonResourceTypesId = ''
      this.comResForm.planBeginTime = null
      this.comResForm.planEndTime = null
      this.comResForm.contact = ''
      this.comResForm.tel = ''
      this.comResTaskSaveVisible = false
    },
    addRevenueClose(selectedRows, param) {
      this.addRevenueVisible = false
      this.loadGanttData(this.planInfoId, '', this.createPage)
    },
    batchSyncTaskCallBack() {
      this.loadGanttData(this.planInfoId, '', this.createPage)
    },
    fundMouseout() {
      this.addRevenueViewVisible = false
    },
    outPutViewClose() {
      this.outPutViewVisible = false
    },
    productTaskViewClose() {
      this.productTaskViewVisible = false
      // this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
      myGantt.eachSelectedTask(function (id) {
        if (myGantt.isTaskExists(id)) {
          myGantt.unselectTask(id)
        }
      })
      this.callParentSelectTasks()
      this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
    },
    productTaskClose() {
      this.productTaskVisible = false
      // this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
      myGantt.eachSelectedTask(function (id) {
        if (myGantt.isTaskExists(id)) {
          myGantt.unselectTask(id)
        }
      })
      // this.callParentSelectTasks()
      this.loadGanttData(this.planInfoId, this.taskId, this.createPage)
    },
    productTaskEditClose() {
      this.productTaskEditVisible = false
    },
    resourceSelected(ownerId, row) {
      const that = this
      if (that.selectedTasks && that.selectedTasks.length > 0) {
        myGantt.batchUpdate(function () {
          that.selectedTasks.forEach((task) => {
            myGantt.getTask(task.id).owner_id = ownerId
            myGantt.getTask(task.id).specialDutyUserId = ownerId
            myGantt.getTask(task.id).dutyDeptName = row.deptName
            myGantt.updateTask(task.id)
          })
        })
      }
      this.resourceSelectVisible = false
    },
    ClassificationSelect(ownerId, row) {
      const that = this
      myGantt.batchUpdate(function () {
        that.selectedTasks.forEach((task) => {
          myGantt.getTask(task.id).secretGrade = ownerId.secretGrade
          myGantt.updateTask(task.id)
        })
      })
      this.ClassificationSelectVisible = false
    },
    resourceSelectclosed() {
      this.resourceSelectVisible = false
    },
    ClassificationSelectclosed() {
      this.ClassificationSelectVisible = false
    },
    saveExperience() {
      this.$refs.experience.confirmExperiece()
    },
    selectGridlosed() {
      this.selectGridVisible = false
    },
    gridSaved() {
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
    closeSearch() {
      this.ganttSearchVisible = false
    },
    closeStatistic() {
      this.ganttStatisticVisible = false
    },
    closeMenuConfig() {
      this.rightMenuConfigVisible = false
    },
    noticeShow() {
      this.noticeVisible = true
    },
    closeNotice() {
      this.noticeVisible = false
    },
    submitButtonBarSetting(updateValues, requestOtherParams) {
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
    },
    //  创建版本
    createPlanVersion () {
      this.$api['planGanttManager.versionCreate']({
        planInfoId: this.planInfoId
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
    }
  }
}
</script>
