<template>
  <div class="couerDivClass"
       id="couerDiv">
    <div class="bottom"
         style="height: 100%">
      <list-layout>
        <template #north>
          <common-button :select-records="selectRecord"
                         buttonType="primary"
                         :comp="comp"></common-button>
          <search-form-list ref="search"
                            :data-source="searchData"
                            @search="search"
                            @re-set="reSet"></search-form-list>
        </template>
        <template #center>
          <div id="table-contain">
            <common-table ref="table"
                          :columns="columns"
                          :table-refresh="tableRefresh"
                          :params="queryParam"
                          :api="tableApi"
                          :comp="comp"
                          :table-config="tableConfig"
                          :menu-state="menuStateObj"
                          :pagination="true">
            </common-table>
          </div>
        </template>
        <template #drawer-panel>
          <el-drawer :title="title"
                     :append-to-body="true"
                     size="100%"
                     :destroy-on-close="true"
                     :wrapper-closable="false"
                     @closed="onClose"
                     :visible.sync="drawerVisible">
            <change-index :plan-info-id="planInfoId"
                          :task-id="taskId"
                          :secret-grade="secretGrade"
                          :whole-describe-id="wholeDescribeId"
                          :plan-info-status="planInfoStatus"
                          @closed="onClose"
                          :create-page="createPage"
                          :current-route="currentRoute"
                          :read-only="readOnlyVisible"
                          :change-id="changeId"></change-index>
          </el-drawer>
          <el-drawer :title="title"
                     :append-to-body="true"
                     size="100%"
                     :destroy-on-close="true"
                     :wrapper-closable="false"
                     @closed="onClose"
                     :visible.sync="analysisVisible">
            <impact-analysis :plan-info-id="planInfoId"
                             @closed="onClose"
                             :create-page="createPage"
                             :read-only="readOnlyVisible"
                             :change-id="changeId"></impact-analysis>
          </el-drawer>
          <submit-change v-if="submitChangeValidate"
                         :visible="submitChangeValidate"
                         :change-id="changeId"
                         :create-page="createPage"
                         :project-classification="projectClassification"
                         :project-task-id="projectTasksId"
                         :id="id"
                         :project-category="projectCategory"
                         :plan-info-id="planId"
                         @save-success="submitChangeSave">
          </submit-change>
          <selectApproveUser v-if="isSelectApproveUserView"
                             :is-select-approve-user-view="isSelectApproveUserView"
                             :select-user-data-source="selectUserDataSource"
                             :select-user-form-data="selectUserFormData"
                             @close-modal="closeSelectApproveUser"
                             @commit="commitSelectApproveUser"></selectApproveUser>
          <common-drawer v-if="visibleBpmView"
                         :visible="visibleBpmView"
                         :drawer-config="drawerConfig"
                         :is-need-custom-drawer-class="false"
                         direction="ttb"
                         size="100%"
                         @close="onVisibleBpmViewClose">
            <template #drawer>
              <process-approval-view :isSmartForm="true"
                                     :business-obj="{
                  businessId: businessId,
                  processDefinitionKey: processDefinitionKey
                }">
              </process-approval-view>
            </template>
          </common-drawer>
        </template>
      </list-layout>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.secret_level {
  position: absolute;
  right: 490px;
  top: 15px;
  font-weight: bolder;
  // top: 50%;
  // transform: translateY(-50%);
  color: red;
  font-size: larger;
}
.couerDivClass {
  padding: 14px;
  height: 100% !important;
  box-sizing: border-box;
  overflow: scroll;
  overflow-x: hidden;
  overflow-y: hidden;
  z-index: 2000 !important;
}
.top {
  position: relative;
  margin-bottom: 8px;
  background: $base-white-color;
  border: 1px solid $base-line-color;
  border-radius: 6px;
  overflow: hidden;
}
.bottom {
  height: calc(100% - 192px);
  padding-left: 5px;
  position: relative;
  border-top: none;
  background: $base-white-color;
  overflow: hidden;
}
::v-deep .list-layout {
  margin-top: 0;
}
.el-row {
  &:last-child {
    margin-bottom: 0;
  }
}
.el-col {
  border-radius: 5px;
}
.top-content {
  border-radius: 5px;
  height: 300px;
  background: #f4d1d1;
}
.bottom-content {
  border-radius: 5px;
  height: 300px;
  background: #f3dada;
}
.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}
// ::v-deep .el-table__fixed-body-wrapper {
//   top: 41px !important;
// }
// /deep/ .el-table__fixed-right{
//   height: 100% !important;
// }
</style>
<script>
import Vue from 'vue'
// import { Row, Col, Drawer } from 'p8-components-ui'
import SubmitChange from './Components/submitChange'
import {
  Drawer,
  P8ListLayout as ListLayout,
  P8Table as CommonTable,
  P8Search as SearchFormList,
  P8Button as CommonButton,
  P8Drawer as CommonDrawer,
  P8ProcessApproval as ProcessApprovalView
} from 'p8-components-ui'

import ChangeIndex from './Components/changeIndex'
import ImpactAnalysis from './Components/impactAnalysis'

// import { nextApproveUser } from '@/assets/commonJS/BusinessActivity/nextApproveUser'
import SelectApproveUser from '@/views/Framework/BusinessActivity/ProcessApproval/selectApproveUser'
import moment from 'moment'
export default {
  name: 'PlanChange',
  components: {
    // 'el-row': Row,
    // 'el-col': Col,
    'el-drawer': Drawer,
    ListLayout,
    SearchFormList,
    CommonTable,
    ChangeIndex,
    CommonButton,
    ImpactAnalysis,
    SubmitChange,
    SelectApproveUser,
    CommonDrawer,
    ProcessApprovalView
  },
  props: {
    thirdMenuParam: {
      type: Object,
      default: function () {
        return {}
      }
    },
    processDefinitionKey: {
      type: String,
      default: 'planChangeApprove'
    }
  },
  data () {
    return {
      projectCategory: '',
      secretLevel: '',
      visibleBpmView: false,
      businessId: undefined,
      drawerConfig: {
        modal: false
      },
      comp: this,
      queryParam: {
        createPage: '',
        planInfoId: ''
      },
      title: '',
      planInfoId: '',
      changeId: '',
      projectTasksId: '',
      taskId: '',
      secretGrade: '',
      createPage: '',
      currentRoute: '',
      planInfoStatus: '',
      selectRecord: [],
      drawerVisible: false,
      analysisVisible: false,
      submitChangeValidate: false,
      projectClassification: '',
      readOnlyVisible: false, // 分析页面只读参数定义
      isSelectApproveUserView: false,
      selectUserDataSource: [],
      selectUserFormData: {},
      selectedRowKeys: [],
      id: '',
      planId: '',
      tableApi: 'planChange.planChangeList',
      searchData: [
        {
          type: 'select',
          labelText: '变更状态',
          fieldName: 'changeState',
          colLayout: 'singleCol',
          placeholder: '选择变更状态',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'CHANGE_STATUS' },
            label: 'label',
            value: 'value'
          },
          options: []
        },
        {
          type: 'text',
          labelText: '变更人',
          fieldName: 'createUserName',
          placeholder: '请输入变更人员',
          colLayout: 'singleCol'
        },
        {
          type: 'datetimeRange',
          labelText: '创建日期',
          defaultValue: [],
          fieldName: 'recordingTime',
          placeholder: ['开始日期', '结束日期']
        },
        {
          type: 'select',
          labelText: '变更原因分类',
          fieldName: 'changeType',
          colLayout: 'singleCol',
          placeholder: '选择变更原因分类',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'ADJUST_ClASSIFY' },
            label: 'label',
            value: 'value'
          },
          options: []
        }
      ],
      columns: [
        {
          title: '序号',
          type: 'index',
          width: 80
        },
        {
          title: '变更人',
          dataIndex: 'createUserName'
        },
        {
          title: '部门',
          dataIndex: 'deptName'
        },
        {
          title: '发起时间',
          dataIndex: 'triggerTime'
        },
        {
          title: '创建时间',
          dataIndex: 'createTime'
        },
        {
          title: '是否产生变更记录',
          dataIndex: 'weatherChange',
          width: 150,
          formatter: function (row) {
            if (row.weatherChange === '0') {
              return '是'
            } else if (row.weatherChange === '1') {
              return '否'
            }
          }
        },
        {
          title: '变更计划数',
          width: 120,
          dataIndex: 'changeCount'
        },
        {
          title: '变更原因分类',
          width: 120,
          dataIndex: 'changeTypeDisp'
        },
        {
          title: '变更原因',
          dataIndex: 'reason'
        },
        {
          title: '变更类型',
          dataIndex: 'reasonChangeDisp'
        },
        {
          title: '状态',
          dataIndex: 'changeStateDisp'
        },
        {
          title: '操作',
          fixed: 'right',
          dataIndex: 'operation',
          scopedSlots: { customRender: 'operation' },
          width: 120
        }
      ],
      tableConfig: {},
      wholeDescribeId: '',
      menuStateObj: []
    }
  },
  mounted () {
    if (this.thirdMenuParam.createPage === 'decompose' || this.thirdMenuParam.route === '/MyTask/MyTask/latest') {
      this.projectCategory = this.thirdMenuParam.projectCategory
      this.secretLevel = this.thirdMenuParam.SECRETGRADE
      this.planInfoId = this.thirdMenuParam.PLANINFOID
      this.planInfoStatus = this.thirdMenuParam.EXECUTESTATE
      this.taskId = this.thirdMenuParam.TASKID
      // this.secretGrade = this.thirdMenuParam.SECRETGRADE
      this.selectRecord = [{
        ...this.thirdMenuParam,
        EXECUTESTATE: this.thirdMenuParam.EXECUTESTATE
      }]
      this.currentRoute = this.thirdMenuParam.currentRoute
      this.createPage = 'userChange'
      this.wholeDescribeId = this.thirdMenuParam.wholeDescribeId
    } else {
      this.projectCategory = this.thirdMenuParam.projectCategory
      this.secretLevel = this.thirdMenuParam.SECRETLEVEL
      this.planInfoId = this.thirdMenuParam.ID
      this.planInfoStatus = this.thirdMenuParam.EXECUTESTATE
      this.taskId = this.thirdMenuParam.taskId
      // this.secretGrade = this.thirdMenuParam.secretGrade
      this.selectRecord = [this.thirdMenuParam]
      this.currentRoute = this.thirdMenuParam.currentRoute
      this.createPage = 'planChange'
      this.wholeDescribeId = this.thirdMenuParam.WHOLEDESCRIBEID
    }
    if (this.planInfoId && this.createPage) {
      this.queryParam.createPage = this.createPage
      this.queryParam.planInfoId = this.planInfoId
      // this.getChangeInfo(this.planInfoId)
    }
  },
  methods: {
    search (param) {
      if (param && param.recordingTime && param.recordingTime.length === 2) {
        param.beginTime = moment(param.recordingTime[0]).format('YYYY-MM-DD')
        param.endTime = moment(param.recordingTime[1]).format('YYYY-MM-DD')
      }
      if (param) {
        this.queryParam = param
      }
      this.queryParam.createPage = this.createPage
      this.queryParam.planInfoId = this.planInfoId
      const that = this
      Vue.nextTick(function () {
        that.$refs.table.searchData()
      })
    },
    reSet () {
      const that = this
      Object.keys(that.queryParam).forEach((key) => {
        that.queryParam[key] = null
      })
      if (this.planInfoId && this.createPage) {
        this.queryParam.createPage = this.createPage
        this.queryParam.planInfoId = this.planInfoId
      }
      Vue.nextTick(function () {
        that.$refs.table.searchData()
      })
    },
    handleSelectionChange (val) {
      this.selectedRowKeys = []
      val.map((item) => {
        this.selectedRowKeys.push(item.id)
      })
    },
    getChangeInfo (planInfoId) { },
    releaseChange () {
      this.changeId = ''
      this.drawerVisible = true
      this.readOnlyVisible = false
    },
    approveChange (record) {
      this.changeId = record.id
      this.submitChangeValidate = true
    },
    modifyChange (record) {
      this.changeId = record.id
      this.drawerVisible = true
      this.readOnlyVisible = false
    },
    changAnalyze (record) {
      this.changeId = record.id
      this.analysisVisible = true
      this.readOnlyVisible = true
    },
    removeChange (record) {
      const that = this
      that
        .$confirm(`是否要删除该变更记录？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(() => {
          let type = 'success'
          let msg = '删除成功！'
          that.$api['planChange.removePlanChange']({ id: record.id })
            .then((res) => {
              if (res && res === 'true') {
                that.$refs.table.searchData()
              } else {
                type = 'error'
                msg = '删除失败！'
              }
            })
            .catch(function (error) {
              type = 'error'
              msg = '删除失败！'
              console.error(error)
            })
          this.$message({
            message: msg,
            type: type
          })
        })
        .catch(() => { })
    },
    submitForRelease (record) {
      this.id = record.id
      this.planId = record.planInfoId
      this.projectTasksId = record.lastCreateTaskId
      const teamRoleValidatorParams = {
        planInfoId: this.planInfoId
      }
      this.projectClassification = record.projectClassification
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
          this.projectCategory = record.projectCategory
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
      // this.submitChangeValidate = true
    },
    tableRefresh (param) {
      param
        .then(() => {
          console.log('异步成功后端做的操作')
        })
        .catch(() => {
          console.error('异步失败的操作')
        })
    },
    onClose () {
      this.drawerVisible = false
      this.submitChangeValidate = false
      this.$refs.table.searchData()
      const _this = this
      setTimeout(() => {
        _this.$refs.table.$refs.table.doLayout()
      })
    },
    submitChangeSave (obj) {
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
      this.$refs.table.searchData()
      this.submitChangeValidate = false
    },
    closeSelectApproveUser () {
      this.isSelectApproveUserView = false
      this.$emit('approved', this.formData.taskId)
    },
    commitSelectApproveUser (fullParams) {
      this.$refs.form.submitForm(fullParams, this.saveApi)
      this.closeModal()
      this.$emit('closed', true)
    },
    processApprovalView (record) {
      this.visibleBpmView = true
      this.businessId = record.id
    },
    onVisibleBpmViewClose () {
      this.visibleBpmView = false
      this.businessId = undefined
    }
  }
}
</script>
