<template>
  <normal-layout>
    <template #north>
      <!-- <span>项目数：</span><span style="font-size: larger; font-weight: bolder;">{{allNum.projectNum}} </span>
      <span>计划数：</span><span style="font-size: larger;font-weight: bolder;">{{allNum.planNum}} </span>
      <span>任务数：</span><span style="font-size: larger;font-weight: bolder;">{{allNum.taskNum}}</span> -->
      <search-form-list :dataSource="searchData"
                        :form="searchForm"
                        @search="search"
                        @re-set="reset"></search-form-list>
    </template>
    <template #west>
      <common-tree :data="treeData"
                   @select="onSelect"
                   :tree-Param="treeParam"></common-tree>
    </template>
    <template #center>
      <common-table ref="table"
                    :api="tableApi"
                    :columns="columns"
                    :params="tableOtherParams"
                    :tableConfig="tableConfig"
                    :pagination="true"
                    :hasWBS="true"
                    :style="{height: tableHeight}"
                    @open-third-menu="openThirdMenu"
                    @requested-table-data="requestedTableData">
        <template #name="{ scope, thirdMenuData }">
          <el-tag size="mini"
                  type="danger"
                  style="margin-right: 10px"
                  v-if="scope.row.allChildFinish === 'true'">未分解
          </el-tag>
          <el-tooltip v-if="(scope.row.dataType &&
                    scope.row.dataType === 'task') && scope.row.managerStatus !== '6406' && scope.row.managerStatus !== '6409' &&
                   ((scope.row.executeState !== '1090' &&   scope.row.isLeaf === 0) ||
                   (scope.row.executeState !== '1090' &&   scope.row.isLeaf === 1 && scope.row.allChildFinish === 'true'))
                  "
                      effect="dark"
                      :content="'该任务可提交完成'"
                      placement="top"
                      class="icon-style">
            <i class="p8 icon-can-commit"></i>
          </el-tooltip>
          <el-tooltip v-if="
              scope.row.managerStatus === '6406' &&
              scope.row.dataType &&
              scope.row.dataType === 'task'
            "
                      effect="dark"
                      :content="`${scope.row.managerStatusDisplay},点击可撤回`"
                      placement="right">
            <span class="base-custom-style-task approve"
                  @click.stop="withdrawTaskApprove(scope.row)">审</span>
          </el-tooltip>
          <el-tooltip v-if="
              scope.row.managerStatus === '6407' &&
              scope.row.dataType &&
              scope.row.dataType === 'task'
            "
                      effect="dark"
                      :content="`${scope.row.managerStatusDisplay}`"
                      placement="right">
            <span class="base-custom-style-task approves">驳</span>
          </el-tooltip>
          <span v-if="scope.row.dataType === 'task'"
                class="underline"
                @click="drillCol(scope, thirdMenuData, scope.row.id)">{{ scope.row.name }} </span>
          <span v-else>{{ scope.row.name }}</span>
        </template>
        <template #level="{ scope }">
          <span class="underline"
                @click="showDialog(scope.row.id)"
                v-if="scope.row.parentId">{{ scope.row.level }}级</span>
          <span v-else>{{ scope.row.indexNo }}</span>
        </template>
        <template #predecessorsNumber="{ scope }">
          <span class="underline"
                @click="showfrontToBack(scope.row.id, '前置任务查看', 'predecessors', scope.row.predecessorsNumber)">
            {{ scope.row.predecessorsNumber }}</span>
        </template>
        <template #postTaskNumber="{ scope }">
          <span class="underline"
                @click="showfrontToBack(scope.row.id, '后置任务查看', 'postTask', scope.row.postTaskNumber)">
            {{ scope.row.postTaskNumber }}</span>
        </template>
        <template #customIcon="{ scope }">
          <el-tooltip v-if="scope.row.dataType && scope.row.managerStatus === '6407'"
                      effect="dark"
                      :content="`${statusData[scope.row.managerStatus].title}:${rejectInfo}`"
                      placement="right">
            <i :class="statusData[scope.row.managerStatus].icon"
               @mouseenter="rejectInformation(scope.row)"
               :style="{color: statusData[scope.row.managerStatus].color, fontSize: '16px'}"></i>
          </el-tooltip>
          <common-status-icon v-if="scope.row.dataType && scope.row.managerStatus !== '6407'"
                              :status-name="statusName"
                              :status-key="scope.row.managerStatus"></common-status-icon>
        </template>
        <template #monitorpoint="{ scope }">
          <span v-for="item in monitorpointIconHandle(scope.row)"
                :key="item.id"
                style="padding: 0 2px">
            <el-tooltip effect="light"
                        placement="bottom-start">
              <div slot="content">
                <p v-html="item.title"></p>
              </div>
              <i :class="item.icon"
                 @click='iconClick(scope.row)'
                 style=" cursor:pointer;"></i>
            </el-tooltip>
          </span>
        </template>
        <template #overdue="{ scope }">
          <div v-html="overdueTextFun(scope.row)"></div>
        </template>
        <template #forecastBeginDate="{ scope }">
          <div v-html=" setForecastDateStyle( scope.row ,'forecastBeginDate')">
          </div>
        </template>
        <template #forecastEndDate="{ scope }">
          <div v-html=" setForecastDateStyle( scope.row ,'forecastEndDate')">
          </div>
        </template>
      </common-table>
      <revenue-view v-if="revenueBudgetVisible"
                    :visible="revenueBudgetVisible"
                    :otherParam="revenueBudgetParam"
                    @close-dialog="revenueBudgetClose">
      </revenue-view>
    </template>
    <template #drawer-panel>
      <process-decomposition v-if="decompositionVisible"
                             :isView="decompositionVisible"
                             :taskId="taskId"
                             @close="closeDrawer"></process-decomposition>
      <front-to-back v-if="frontToBackVisible"
                     :isView="frontToBackVisible"
                     :taskId="taskId"
                     :title="frontToBackTitle"
                     :frontToBackType="frontToBackType"
                     @close="closefrontToBackDrawer"></front-to-back>
      <common-drawer size="100%"
                     :visible="visible"
                     direction="ttb"
                     :projectLevel="projectLevel"
                     :drawerConfig="menuDrawerConfig">
        <template #drawer>
          <menu-layout :third-menu-param="thirdMenuParam"
                       :filterThirdMenu='filterThirdMenu'
                       :default-menu="defaultMenu"></menu-layout>
        </template>
      </common-drawer>
      <!-- <common-drawer size="100%"
                     :visible="testDetailsVisible"
                     direction="ttb"
                     :drawerConfig="drawerConfig"
                     @close="closeDrawer">
        <template #drawer>
          <test-details :taskId="taskId"></test-details>
        </template>
      </common-drawer> -->
    </template>
  </normal-layout>
</template>
<script>
import {
  P8NormalLayoutV1 as NormalLayout,
  P8Tree as CommonTree,
  P8Table as CommonTable,
  P8StatusIcon as CommonStatusIcon,
  P8Drawer as CommonDrawer,
  P8MenuLayout as MenuLayout,
  P8Search as SearchFormList,
  Tooltip
} from 'p8-components-ui'

import { getTaskStatusInfo } from '@/utils/commonBusiness'
import { overdueTextHandle } from '@/utils/common'
import processDecomposition from './processDecomposition'
import frontToBack from './frontToBack'
import { generateTree } from '@/utils/generateTree'
import moment from 'moment'
import Vue from 'vue'
import { getMonitorData, getBudgetData } from '@/components/workLayout/Components/projectProgress/Components/layoutData'

export default {
  name: 'Normal',
  components: {
    NormalLayout,
    CommonDrawer,
    processDecomposition,
    frontToBack,
    CommonStatusIcon,
    CommonTree,
    CommonTable,
    SearchFormList,
    MenuLayout,
    'el-tooltip': Tooltip
  },
  data () {
    const columns = [
      {
        title: '序号',
        type: '',
        dataIndex: 'WBS',
        minWidth: 80,
        align: 'left'
      },
      {
        title: '进度',
        type: 'index',
        dataIndex: 'customIcon',
        width: 60,
        align: 'center',
        scopedSlots: {
          customRender: 'custom'
        }
      },
      {
        title: '#',
        type: 'index',
        dataIndex: 'treeMenuIcon',
        scopedSlots: { customRender: 'thirdMenu' },
        width: 45,
        align: 'center',
        formatter: function (row) {
          // 控制三级菜单是否显示

          return true
        }
      },
      {
        title: '任务标识',
        type: 'index',
        dataIndex: 'monitorpoint',
        width: 90,
        align: 'center',
        scopedSlots: {
          customRender: 'custom'
        }
      },
      {
        title: '密级',
        type: '',
        dataIndex: 'secretGradeDisplay',
        width: 150,
        align: 'center'
      },
      {
        title: '项目名称',
        dataIndex: 'projectName',
        type: '',
        width: 200,
        align: 'center'
      },
      {
        title: '计划任务',
        dataIndex: 'name',
        drillable: true,
        minWidth: 300,
        align: 'left',
        scopedSlots: {
          customRender: 'custom'
        }
      },
      {
        title: '前置',
        dataIndex: 'predecessorsNumber',
        width: 70,
        align: 'center',
        scopedSlots: {
          customRender: 'custom'
        }
      },
      {
        title: '后置',
        dataIndex: 'postTaskNumber',
        width: 70,
        align: 'center',
        scopedSlots: {
          customRender: 'custom'
        }
      },
      {
        title: '项目类型/任务层级',
        dataIndex: 'level',
        width: 150,
        align: 'center',
        scopedSlots: {
          customRender: 'custom'
        }
      },
      {
        title: '完成度',
        dataIndex: 'progress',
        width: 120,
        align: 'center',
        formatter: function (row, column, cellValue, index) {
          return Math.round(cellValue * 100) + '%'
        }
      },
      {
        title: '超期/剩余天数',
        dataIndex: 'overdue',
        width: 120,
        align: 'center',
        scopedSlots: {
          customRender: 'custom'
        }
      },
      {
        title: '计划开始时间',
        dataIndex: 'planBeginDate',
        width: 120,
        align: 'center'
      },
      {
        title: '计划完成时间',
        dataIndex: 'planEndDate',
        width: 120,
        align: 'center'
      },
      {
        title: '预计开始时间',
        dataIndex: 'forecastBeginDate',
        width: 120,
        align: 'center',
        scopedSlots: {
          customRender: 'custom'
        }
      },
      {
        title: '预计完成时间',
        dataIndex: 'forecastEndDate',
        width: 120,
        align: 'center',
        scopedSlots: {
          customRender: 'custom'
        }
      },
      {
        title: '实际开始时间',
        dataIndex: 'actualStartDate',
        width: 120,
        align: 'center'
      },
      {
        title: '实际完成时间',
        dataIndex: 'actualEndDate',
        width: 120,
        align: 'center'
      }
    ]
    let searchData = [
      {
        type: 'datetimeRange',
        labelText: '计划开始时间',
        fieldName: 'planBeginDate',
        defaultValue: [],
        placeholder: []
      },
      {
        type: 'datetimeRange',
        labelText: '计划完成时间',
        fieldName: 'beginEndTime',
        defaultValue: [],
        placeholder: []
      },
      {
        type: 'multiple',
        defaultValue: [],
        optionUrl: {
          api: 'thirdPartInterface.getDic',
          params: { dicType: 'TASK_STATUS' }
        },
        options: [],
        labelText: '任务状态', // 控件显示的文本
        fieldName: 'status'
      },
      {
        type: 'text',
        labelText: '项目名称',
        fieldName: 'projectName',
        defaultValue: '',
        placeholder: '请输入项目名称'
      },
      {
        type: 'text',
        labelText: '任务名称',
        fieldName: 'taskName',
        defaultValue: '',
        placeholder: '请输入任务名称'
      }
    ]
    return {
      frontToBackTitle: '前置',
      frontToBackVisible: false,
      treeData: [],
      tableHeight: document.documentElement.clientHeight - 200 + 'px',
      projectLevel: null,
      visible: false,
      thirdMenuTitle: '',
      filterThirdMenu: '',
      rejectInfo: '',
      treeParam: {
        dataRange: 'select-all'
      },
      secretLevel: '机密',
      statusData: this.$store.state.project.dicConfig.managerStatus || {},
      treeApi: 'processApproval.getCatalog',
      tableApi: 'taskManager.normalTaskList',
      columns,
      statusName: 'managerStatus',
      searchData,
      decompositionVisible: false,
      tableOtherParams: {},
      allNum: {
        taskNum: '0',
        planNum: '0',
        projectNum: '0'
      },
      layersParams: {},
      monitorpointDataArray: [],
      revenueBudgetParam: {},
      revenueBudgetVisible: false,
      tableConfig: {
        'default-expand-all': true
      },
      planInfo: {},
      drawerConfig: {
        modal: false
      },
      menuDrawerConfig: {
        modal: false,
        withHeader: false,
        beforeClose: this.handleMenuBeforClose
      },
      allStatus: [],
      currentRouterPath: '',
      taskId: '',
      defaultMenu: {},
      thirdMenuParam: {},
      searchForm: {},
      frontToBackType: ''
    }
  },
  created () {
    let that = this
    getMonitorData({ monitorId: [] }).then(res => {
      that.monitorpointDataArray = res
      console.log(that.monitorpointDataArray, '22222222222222222222222');
    })
    this.$api[this.treeApi]({ dicType: 'PROJECTTYPE' }).then((res) => {
      res.forEach(item => {
        item.value = item.id
        item.label = item.cmeaning
      })
      this.treeData = generateTree(res, 'cparentid')
    })
  },
  mounted () {
    this.currentRouterPath = this.$route.path
    this.getAllStatusOptions()
    // this.getAllNum()
    let _this = this
    this.$bus.$on('refresh', function () {
      Vue.nextTick(function () {
        _this.$refs.table.searchData()
      })
    })
  },
  methods: {
    showfrontToBack (id, title, type, num) {
      if (num !== 0) {
        this.frontToBackVisible = true
        this.taskId = id
        this.frontToBackType = type
        this.frontToBackTitle = title
      }
    },
    closefrontToBackDrawer () {
      this.frontToBackVisible = false
    },
    showDialog (id) {
      this.taskId = id
      this.decompositionVisible = true
    },
    // 点击项目/计划列钻取进入三级菜单-计划编制页面
    drillCol (scope, thirdMenuData) {
      this.getPlanDataTaskId = scope.row.id
      this.getPlanDataPinfoId = scope.row.planInfoId
      if (this.tableOtherParams.specialPlan !== '') {
        this.filterThirdMenu = 'planResolve'
      }
      if (thirdMenuData.length) {
        let planManager = thirdMenuData.filter(o => o.name === 'ProblemListManagement')
        this.openThirdMenu(scope.row, planManager[0])
      }
    },
    rejectInformation (row) {
      let _this = this
      _this.rejectInfo = ''
      _this.$api['taskManager.rejectInfo']({ businessId: row.id }).then(function (res) {
        if (res) {
          _this.rejectInfo = res.info || ''
        }
      })
    },
    handleSelectionChange (val) {
      this.selectedRowKeys = []
      this.selectedRows = []
      this.multipleSelection = val
      val.map(item => {
        this.selectedRowKeys.push(item.id)
        this.selectedRows.push(item)
      })
    },
    tableRefresh (param) {
      param.then(() => {
      }).catch(() => {
        console.error('异步失败的操作')
      })
    },
    async handleMenuBeforClose (done) {
      this.$router.push({ path: this.currentRouterPath })
      this.visible = false
    },
    closeDrawer () {
      this.$refs.table.searchData()
      this.decompositionVisible = false
      this.testDetailsVisible = false
      this.$router.push({ path: this.currentRouterPath })
    },
    onSelect (node) {
      let me = node
      this.tableOtherParams.projectTypeId = me.id
      this.layersParams = me.id
      this.$refs.table.searchData()
    },
    search (param) {
      let newParams = { ...this.tableOtherParams, ...param }
      // 项目类别ID
      this.tableOtherParams = newParams
    },
    reset () {
      let that = this
      Object.keys(that.tableOtherParams).forEach(function (key) { return (that.tableOtherParams[key] = null) })
      this.tableOtherParams.activityClassifyId = this.layersParams
    },
    requestedTableData (tableData) {
      if (Object.keys(this.planInfo).length) {
        const _this = this
        let filterItem = null
        tableData.forEach(item => {
          filterItem = item.children.filter(citem => citem.id === _this.planInfo.id)
        })
        if (filterItem) {
          _this.planInfo = { allStatus: this.allStatus, ...filterItem[0], progress: filterItem[0].progress * 100 }
        }
      }
    },
    openThirdMenu (record, item) {
      this.defaultMenu = item
      this.thirdMenuParam = {
        ...record,
        allStatus: this.allStatus,
        progress: Number((record.progress * 100).toFixed(0)),
        taskId: record.taskId,
        secretGrade: record.secretGrade,
        planInfoId: record.planInfoId,
        wholeDescribeId: record.wholeDescribeId,
        planInfoStatus: record.executeState,
        currentRoute: this.$route.path,
        createPage: 'decompose',
        currentPage: 'normal',
        getProjectLevel: record.level
      }
      this.projectLevel = record.level
      this.visible = true
    },
    getAllStatusOptions () {
      let _this = this
      getTaskStatusInfo({ currentStatus: 'all' }).then(data => {
        _this.allStatus = data
      })
    },
    getAllNum () {
      let _this = this
      _this.$api['taskManager.getAllNum']({ taskTabType: 'normal', specialPlan: this.tableOtherParams.specialPlan }).then(function (res) {
        if (res) {
          _this.allNum.taskNum = res.taskNum
          _this.allNum.planNum = res.planNum
          _this.allNum.projectNum = res.projectNum
        }
      })
    },
    monitorpointIconHandle (row) {
      let that = this
      let tempIcon = []
      if (row.monitorPointArray && row.monitorpointIconArray) {
        let monitorpointArray = row.monitorPointArray.split(',')
        monitorpointArray.forEach((item, index) => {
          tempIcon.push({ 'id': item, 'icon': that.monitorpointDataArray[item].icon, 'title': that.monitorpointDataArray[item].name })
        })
      }
      return tempIcon
    },
    iconClick (row) {
      let that = this
      if (row.revenueBudgetId) {
        getBudgetData({ revenueBudgetId: row.revenueBudgetId }).then(res => {
          that.revenueBudgetParam = res
          that.revenueBudgetVisible = true
        })
      }
    },
    revenueBudgetClose () {
      this.revenueBudgetVisible = false
      this.revenueBudgetParam = Object.assign({})
    },
    setForecastDateStyle (row, type) {
      if (row.forecastBeginDate || row.forecastEndDate) {
        if (type === 'forecastBeginDate') {
          let forecastBeginDate = new Date(row.forecastBeginDate)
          let planBeginDate = new Date(row.planBeginDate)
          if (forecastBeginDate.getTime() === planBeginDate.getTime()) {
            return moment(row.forecastBeginDate).format('YYYY-MM-DD')
          } else {
            let currDate = moment(row.forecastBeginDate).format('YYYY-MM-DD')
            return `<span style="color: #F80012">${currDate}</span>`
          }
        }
        if (type === 'forecastEndDate') {
          let forecastEndDate = new Date(row.forecastEndDate)
          let planEndDate = new Date(row.planEndDate)
          if (forecastEndDate.getTime() === planEndDate.getTime()) {
            return moment(row.forecastEndDate).format('YYYY-MM-DD')
          } else {
            let currDate = moment(row.forecastEndDate).format('YYYY-MM-DD')
            return `<span style="color: #F80012">${currDate}</span>`
          }
        }
      }

      return ''
    },
    // 超期/剩余天数调用公共方法
    overdueTextFun (row) {
      return overdueTextHandle(row)
    },
    withdrawTaskApprove (rowInfo) {
      let taskId = rowInfo.taskId
      const url = 'taskManager.withdrawTaskApprove'
      const _this = this
      _this.$confirm('是否要撤回审批', '提示', {
        confirmButtonText: '撤回',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        _this.$api[url]({ taskId: taskId }).then(res => {
          _this.$message({
            type: 'success',
            message: '审批已撤回'
          })
          // 注释之后页面撤回审批后才可刷新
          // Vue.nextTick(function () {
          _this.$refs.table.searchData()
          // })
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.secret_level {
  position: absolute;
  font-weight: bolder;
  right: 470px;
  top: 15px;
  font-weight: bolder;
  color: red;
  font-size: larger;
}
::v-deep .normal-header {
  position: relative;
}
.icon-style {
  margin-left: -15px;
}
.base-custom-style-task {
  color: $base-white-color;
  font-size: 12px;
  border-radius: 10px;
  display: inline-block;
  width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  cursor: pointer;
  &.approve {
    background-color: $base-red-color;
    margin-left: 0px;
  }
  &.approves {
    background-color: $base-red-color;
  }
  &.leaf {
    background-color: $base-green-color;
  }
  &.canApprove {
    background-color: $base-green-color;
    margin-left: -15px;
  }
}
.underline {
  text-decoration: underline;
  cursor: pointer;
}
</style>
