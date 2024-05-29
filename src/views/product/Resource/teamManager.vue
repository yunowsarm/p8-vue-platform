<!--整体管理-团队管理-->
<template>
  <div style="height: calc(100% - 50px);background-color: #f3f5f885">
    <div style="height: 100%"
         class="team-manager-wrap">
      <div class="custom_content_wrap">
        <div class="left_content">
          <div class="teamFile">
            <span style="font-size:14px; padding:0 20px;font-weight:bold;">人员任命文件：</span>
            <common-upload ref="commonupload"
                           v-if="!uploadView"
                           :files="namedFiles"
                           :uploadConfig="{limit: 1,multiple:false}"
                           @upload="(file) => {uploadFile(file);}"
                           @remove="(file) => {removedFile(file);}">
            </common-upload>
            <common-file-view :uploadFiles="namedFiles"
                              filesLayout="row"></common-file-view>
            <i v-if="namedFiles.length"
               class="el-icon-close"
               style="cursor: pointer;"
               @click="namedFiles = []"></i>
          </div>
          <div class="left_bottom_content">
            <div class="role-con">
              <el-button type="plan"
                         style="margin: 5px;width:90%;"
                         @click="addRolesHandle"><i class="el-icon-plus"></i> 新建角色类别</el-button>
              <vue-perfect-scrollbar class="role-list">
                <li style="padding-left: 26px;color:#323232;font-size:12px;"
                    :class="[{ 'active': rolesSelectedIndex === -1 }]"
                    @click="refreshHandle">所有人员<span>({{getTotalCount}})</span></li>
                <li :class="[
                  { 'active': index === rolesSelectedIndex },
                  { 'fixed-role': item.roleType === 'fixed' },
                ]"
                    v-for="(item, index) in rolesData"
                    :key="item.id"
                    @click="rolesHandle(item, index)">
                  <el-tooltip v-if="item.roleType === 'fixed'"
                              :content="item.klTeamsRoleClassifyName"
                              placement="bottom">
                    <i class="el-icon-s-custom"
                       style="cursor:pointer;"></i>
                  </el-tooltip>
                  <i v-else
                     class="el-icon-s-custom"></i>
                  <edit-input :textValue="item.name || item.roleName"
                              :record="item"
                              :iconShow="item.roleType === 'general' && group_add_role"
                              @delete="deleteRolesHandle(index, item)"
                              @onChange="changeRolesHandle"></edit-input>
                  <!-- {{getProjectTeamRoleUsersNum(item)}}
                <span style="color: red"
                      v-if="isShowRole(item)">*</span> -->
                </li>
              </vue-perfect-scrollbar>
            </div>
            <div class="table-con">
              <div class="add-member">
                <div>
                  <el-button icon="el-icon-plus"
                             v-if="group_add_member"
                             type="plan"
                             @click="addMemberHandle">添加人员
                  </el-button>
                  <!-- <el-button type="plan"
                           @click="refreshHandle">查看全部成员
                </el-button> -->
                </div>
                <search-form-list style="top: 2px"
                                  ref="search"
                                  :resetAfterToSearch="false"
                                  :dataSource="dataSource"
                                  @search="search"
                                  @re-set="reset"></search-form-list>
              </div>
              <div class="common-table-member">
                <common-table ref="table"
                              class="tableMember"
                              style="height: 100%"
                              :columns="columns"
                              :params="params"
                              :pagination="false"
                              @cell-click='cellDblclick'
                              :tableSetting="false"
                              :noApiTableData="tableData">
                  <template #taskCount="{ scope }">
                    <!-- <div class="task-count">
                    <template v-if="scope.row.taskCount">
                      <el-link @click.stop="opentDialogUserTask(scope.row)">{{
                      scope.row.taskCount
                      }}<i class="el-icon-view el-icon--right"></i></el-link>
                      <el-link>{{
                      scope.row.taskCount
                      }}<i class="el-icon-view el-icon--right"></i></el-link>
                    </template>
                    <template v-else> -->
                    <span>{{ scope.row.taskCount }}</span>
                    <!-- </template>
                  </div> -->
                  </template>
                  <template #userState="{ scope }">
                    <div class="userState">
                      <span v-if="scope.row.entryTime && !scope.row.departureTime"
                            class="state-working">团队中</span>
                      <span v-if="scope.row.entryTime && scope.row.departureTime && scope.row.waitout"
                            class="state-waitout">待退出</span>
                      <span v-if="scope.row.entryTime && scope.row.departureTime && !scope.row.waitout"
                            class="state-out">已退出</span>
                    </div>
                  </template>
                  <template #operation="{ scope }">
                    <template v-if="!scope.row.departureTime">
                      <template v-if="scope.row.taskCount">
                        <el-popconfirm title="确认要将该人退出项目组吗?"
                                       confirmButtonText="确认"
                                       cancelButtonText="取消"
                                       @confirm="deleteUserHandle(scope, scope.$index)">
                          <el-button slot="reference"
                                     size="mini"
                                     type="text"
                                     v-if="group_add_member">删除
                          </el-button>
                        </el-popconfirm>
                      </template>
                      <template v-else>
                        <el-button v-if="group_add_member"
                                   size="mini"
                                   type="text"
                                   @click="deleteUserHandle(scope, scope.$index)">删除
                        </el-button>
                      </template>
                    </template>
                  </template>
                  <template #flagHeader="{scope}">
                    <span>{{ scope.column.label }}</span><i class="el-icon-edit"></i>
                  </template>
                  <template #flag="{scope}">
                    <el-select v-model="scope.row.flag"
                               size="mini"
                               :key="scope.row.id"
                               v-if="scope.row.editRow && group_add_member"
                               placeholder="请选择"
                               style="width: 90%;"
                               @blur="()=>{quoteUpdate(scope.row)}">
                      <el-option v-for="item in options"
                                 :key="item.value"
                                 @click.native="handleSetFlagName(scope.row,item)"
                                 :label="item.label"
                                 :value="item.value">
                      </el-option>
                    </el-select>
                    <span v-else>{{ scope.row.flagName }}</span>
                  </template>
                </common-table>
              </div>
            </div>
          </div>
        </div>
        <div class="right-con">
          <project-form-view :id="id"
                             ref="projectFormView"></project-form-view>
          <!-- <member-upload :files="namedFiles"
                           :view="!group_add_role"
                           @getFormComp="getMemberFormComp"></member-upload> -->
        </div>
      </div>
      <div class="bottom-con">
        <p class="operation"
           v-if="group_add_role">
          <el-button size="mini"
                     @click="loadStandardTeamHandle">载入标准团队
          </el-button>
        </p>
        <p class="submit"
           v-if="group_add_role || group_add_member">
          <el-button size="mini"
                     type="primary"
                     :loading="submitLoading"
                     @click="submit">保 存
          </el-button>
          <el-button size="mini"
                     v-if="$route.name == 'ProjectInitiation'"
                     type="primary"
                     @click="saveAndRelease">发 布
          </el-button>
        </p>
      </div>
      <dialog-tabs-roles :visibleDialogRoles="visibleDialogRoles"
                         :activeName="dialogRolesActiveName"
                         :id="id"
                         @exp-roles-close="expRolesCloseHandle"
                         @standard-roles-close="standardRolesCloseHandle"></dialog-tabs-roles>
      <dialog-select-member v-if="visibleDialogMember"
                            :visibleDislogMember="visibleDialogMember"
                            :loginFlag="loginFlag"
                            :selectRoleId="selectRoleId"
                            :loadingUserDeptStrategy="loadingUserDeptStrategy"
                            @member-close="memberCloseHandle"
                            :existsData="tableData"></dialog-select-member>
      <dialog-user-task :dialogVisible="visibleDialogUserTask"
                        :tableParams="userTaskTableParams"
                        :customSearch="true"
                        @close="closeDialogUserTask()"
                        @custom-search="userTaskCustomSearch"
                        @custom-reset="userTaskCustomReset">
      </dialog-user-task>
      <!-- 启动流程 -->
      <selectApproveUserBeforehand v-if="isSelectApproveUserBeforehandView"
                                   :is-select-approve-user-beforehand-view="isSelectApproveUserBeforehandView"
                                   :select-user-beforehand-data-source="selectUserBeforehandDataSource"
                                   :select-user-beforehand-form-data="selectUserBeforehandFormData"
                                   @close-modal="closeSelectApproveUserBeforehand"
                                   @commit="commitSelectApproveUserBeforehand"></selectApproveUserBeforehand>
    </div>
    <div v-if="viewVisible"
         class="viewVisible">
    </div>
  </div>
</template>
<script>
import {
  P8NlcrLayout as NlcrLayout,
  P8Table as CommonTable,
  P8Search as SearchFormList,
  Button,
  Popconfirm,
  Link,
  Notification,
  P8Upload as CommonUpload,
  P8FileView as CommonFileView
} from 'p8-components-ui'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
import EditInput from './Components/EditInput'
import ProjectFormView from './Components/ProjectFormView'
import DialogSelectMember from './Components/DialogSelectMember'
import DialogTabsRoles from './Components/DialogTabsRoles'
import DialogUserTask from './Components/DialogUserTask'
import _ from 'lodash'
import moment from 'moment'
import SelectApproveUserBeforehand from '@/views/Framework/BusinessActivity/ProcessApproval/selectApproveUserBeforehand'
import { nextApproveUserBeforehand } from '@/assets/commonJS/BusinessActivity/nextApproveUserBeforehand'
export default {
  name: 'teamManager',
  props: {
    row: {
      type: Array,
      default: () => {
        return []
      }
    },
    configParmars: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    const columns = [
      {
        title: '姓名',
        dataIndex: 'realName',
        align: 'center'
      },
      {
        title: '部门',
        dataIndex: 'deptName',
        align: 'center'
      },
      {
        title: '承担任务总数',
        dataIndex: 'taskCount',
        scopedSlots: {
          customRender: 'custom'
        },
        align: 'center'
      },
      // {
      //   title: '承担责任令数',
      //   dataIndex: 'dutyCount',
      //   scopedSlots: {
      //     customRender: 'custom'
      //   }
      // },
      // {
      //   title: '承担其他计划数',
      //   dataIndex: 'otherCount',
      //   scopedSlots: {
      //     customRender: 'custom'
      //   }
      // },
      {
        title: '状态',
        dataIndex: 'userState',
        scopedSlots: {
          customRender: 'custom'
        },
        align: 'center'
      },
      // {
      //   title: '标识',
      //   dataIndex: 'flag',
      //   width: '140',
      //   scopedSlots: {
      //     customRender: 'edit'
      //   }
      // },
      {
        title: '进入时间',
        dataIndex: 'entryTime',
        align: 'center'
      },
      {
        title: '退出时间',
        dataIndex: 'departureTime',
        align: 'center'
      },
      {
        title: '操作',
        fixed: 'right',
        dataIndex: 'operation',
        width: 80,
        scopedSlots: {
          customRender: 'custom'
        },
        align: 'center'
      }
    ]
    const dataSource = [
      {
        type: 'text', // 控件类型
        labelText: '姓名', // 控件显示的文本
        fieldName: 'realName',
        placeholder: '请输入人员姓名'
      },
      {
        type: 'text', // 控件类型
        labelText: '部门', // 控件显示的文本
        fieldName: 'deptName',
        placeholder: '请输入部门名称'
      }
    ]
    const groupType = [ // 0否 1 是
      {
        id: '3',
        name: '计划编制（部分可编辑）',
        group_add_role: false,
        group_add_member: true,
        is_fixed_user: false,
        is_general_user: true
      },
      {
        id: '4',
        name: '计划分解（部分可编辑）',
        group_add_role: true,
        group_add_member: true,
        is_fixed_user: false,
        is_general_user: true,
        is_loading_userDept: 'strategyA' // 登录在厂所的只能查询当前场所，院里面未所有
      },
      {
        id: '5',
        name: '立项管理-已发布，整体管理（查看页面）',
        group_add_role: false,
        group_add_member: false
      },
      {
        id: '6',
        name: '立项管理-未发布/资源管理（完全可以编辑）',
        group_add_role: true, // 是否显示添加角色按钮
        group_add_member: true, // 是否显示添加人员、删除按钮
        is_fixed_user: true, // 控制 固定角色【添加人员】按钮是否显示，在group_add_member=true的情况下生效，并动态修改group_add_member
        is_general_user: true // 控制 自定义角色【添加人员】按钮是否显示，在group_add_member=true的情况下生效，并动态修改group_add_member
      },
      {
        id: '7',
        name: '整体管理（修改页面）',
        group_add_role: true,
        group_add_member: true
      }
    ]
    return {
      projectClassname: '',
      roleId: '',
      id: null,
      params: {},
      columns,
      dataSource,
      visible: false,
      loginFlag: '1',
      rolesSelectedIndex: -1,
      tableData: [],
      fixedRoles: [],
      selectRoleId: '',
      generalRoles: [],
      viewVisible: false,
      submitLoading: false,
      saveLoading: false,
      visibleDialogMember: false,
      visibleDialogRoles: false,
      memberPopoverVisible: false,
      dialogRolesActiveName: 'experience',
      teamsId: '',
      isSave: false,
      visibleDialogUserTask: false,
      userTaskTableParams: {
        currentUserId: '',
        dutyMonitor: '',
        wholeDescribeId: this.id || '0'
      },
      isAddMember: false,
      isAddUser: false,
      isDelete: false,
      namedFiles: [], // 人员上传文件
      rolesData: [], // 固定角色和一般角色
      group_add_role: true, // 是否可以添加角色
      group_add_member: true, // 是否可以添加人员
      groupType,
      groupTypeData: {},
      loadingUserDeptStrategy: '',
      options: [],
      memberFormComp: null,
      uploadView: false,
      releaseMenuParams: {
        beforehandParams: {}
      },
      isSelectApproveUserBeforehandView: false,
      selectUserBeforehandFormData: {},
      selectUserBeforehandDataSource: [],
    }
  },
  computed: {
    getTotalCount () {
      let count = 0
      this.rolesData.forEach(el => {
        if (el.projectTeamRoleUsers && el.projectTeamRoleUsers.length) {
          count += el.projectTeamRoleUsers.length
        }
      })
      return count
    }
  },
  created () {
    if (this.row && this.row.length) {
      this.id = this.row[0].ID
    } else {
      this.id = this.configParmars.id
      if (!this.id) {
        this.viewVisible = true
        this.$message({
          message: '请先创建项目',
          type: 'warning'
        })
      }
    }
  },
  mounted () {
    if (this.id) {
      this.getTeamInfo()
    }
  },
  methods: {
    // getProjectTeamRoleUsersNum (rolesItem) {
    //   return '(' + rolesItem.projectTeamRoleUsers.length + ')'
    // },
    // 双击打开行内
    cellDblclick (row, column, cell, event) {
      if (column.property === 'flag') {
        let params = { dicType: '0' }
        if (row.userRoleId !== 'SYS_ROLE004' && row.userRoleId !== 'SYS_ROLE008') {
          return
        }
        for (let i = 0; i < this.tableData.length - 1; i++) {
          this.tableData[i].editRow && (this.tableData[i].editRow = false)
        }
        if (row.userRoleId === 'SYS_ROLE004') {
          params = { dicType: 'MACHINE_TYPE' }
        }
        if (row.userRoleId === 'SYS_ROLE008') {
          params = { dicType: 'COMBINATION' }
        }
        this.$api['thirdPartInterface.getDic'](params).then(res => {
          if (res) {
            this.options = res
            this.$set(row, 'flag', row.flag || '')
            this.$set(row, 'flagName', row.flagName || '')
            this.$set(row, 'editRow', true)
          }
        })
      }
    },
    // 行内修改
    quoteUpdate (row) {
      // this.$set(row, 'editRow', false)
    },
    handleSetFlagName (row, item) {
      this.$set(row, 'flagName', item.label)
      this.$set(row, 'editRow', false)
    },
    initButton () {
      let _this = this
      _this.groupType.forEach(function (data) {
        // if (data.id === _this.thirdMenuParam.group_type) {
        //   _this.groupTypeData = data
        // }
      })
      _this.group_add_role = _this.groupTypeData.group_add_role
      _this.group_add_member = _this.groupTypeData.group_add_member
      if (_this.groupTypeData.is_loading_userDept) {
        _this.loadingUserDeptStrategy = _this.groupTypeData.is_loading_userDept
      }
    },
    getMemberFormComp (formComp) {
      // 获取人员命名文件 form表单组件, 用于校验附件密级是否选择
      this.memberFormComp = formComp
    },
    search (params) {
      let realName = params.realName ? params.realName : null
      let deptName = params.deptName ? params.deptName : null
      if (realName || deptName) {
        let tableData = this.tableData.filter(item => {
          if ((item.realName.indexOf(realName) > -1) || (item.deptName.indexOf(deptName) > -1)) {
            return item
          }
        })
        this.tableData = tableData
      }
    },
    reset () {
      if (this.rolesSelectedIndex > -1) {
        this.tableData = this.rolesData[this.rolesSelectedIndex].projectTeamRoleUsers
      } else {
        let tableData = []
        this.rolesData.map(item => {
          tableData.push(...item.projectTeamRoleUsers)
        })
        this.tableData = tableData
      }
    },
    getTeamInfo () {
      this.$api['teamManager.get']({
        wholeDescribeId: this.id
      }).then(res => {
        if (res) {
          this.klTeamsId = res.klTeamsId
          this.namedFiles = res.uploadFiles ? res.uploadFiles : []
          res.fixedRoles && res.fixedRoles.forEach(item => {
            item.roleType = 'fixed'
            if (item.projectTeamRoleUsers && item.projectTeamRoleUsers.length) {
              item.projectTeamRoleUsers.forEach(citem => {
                citem.entryTime = citem.entryTime ? moment(citem.entryTime).format('YYYY-MM-DD HH:mm:ss') : ''
                citem.departureTime = citem.departureTime ? moment(citem.departureTime).format('YYYY-MM-DD HH:mm:ss') : ''
              })
            } else {
              item.projectTeamRoleUsers = []
            }
          })
          res.generalRoles && res.generalRoles.forEach(item => {
            item.roleType = 'general'
            if (item.projectTeamRoleUsers && item.projectTeamRoleUsers.length) {
              item.projectTeamRoleUsers.forEach(citem => {
                citem.entryTime = citem.entryTime ? moment(citem.entryTime).format('YYYY-MM-DD HH:mm:ss') : ''
                citem.departureTime = citem.departureTime ? moment(citem.departureTime).format('YYYY-MM-DD HH:mm:ss') : ''
              })
            } else {
              item.projectTeamRoleUsers = []
            }
          })
          this.fixedRoles = res.fixedRoles || []
          this.generalRoles = res.generalRoles || []
          this.rolesData = [...this.fixedRoles, ...this.generalRoles]
          if (this.rolesData.length) {
            if (this.rolesSelectedIndex > -1) {
              // > -1 说明左侧角色列表有被选中的
              this.tableData = this.rolesData[this.rolesSelectedIndex].projectTeamRoleUsers
              this.selectRoleId = this.rolesData[this.rolesSelectedIndex].roleType === 'fixed' ? this.rolesData[this.rolesSelectedIndex].roleId : ''
              if (this.groupTypeData.group_add_member) {
                if (this.rolesData[this.rolesSelectedIndex].roleType === 'general') {
                  this.group_add_member = this.groupTypeData.is_general_user
                } else {
                  this.group_add_member = this.groupTypeData.is_fixed_user
                }
              }
            } else {
              // 否则 列表未被选中, 展示全部角色
              this.selectRoleId = ''
              let tableData = []
              this.rolesData.map(item => {
                let projectTeamRoleUsers = item.projectTeamRoleUsers && item.projectTeamRoleUsers.map(pitem => {
                  pitem.roleName = item.name
                  pitem.userRoleId = item.roleId
                  pitem.roleType = item.roleType
                  return pitem
                })
                tableData.push(...projectTeamRoleUsers)
              })
              this.tableData = tableData
            }
          }
          this.teamsId = this.team && this.team.teamsId ? this.team.teamsId : ''
          res.uploadFiles && res.uploadFiles.length && res.uploadFiles.forEach(function (data) {
            let name = data.fileName
            data.name = name
          })
        }
      })
    },
    rolesHandle (item, index) { // 角色列表点击切换
      if (this.rolesSelectedIndex === index) {
        return
      }
      this.rolesSelectedIndex = index
      this.selectRoleId = item.roleType === 'fixed' ? item.roleId : ''
      this.tableData = item.projectTeamRoleUsers ? item.projectTeamRoleUsers : []
      if (this.columns.filter(item => item.dataIndex === 'roleName').length) {
        this.columns.shift()
      }

      // 自定义角色和固定角色 是否可以操作人员
      if (this.groupTypeData.group_add_member) {
        if (item.roleType === 'general') {
          this.group_add_member = this.groupTypeData.is_general_user
        } else {
          this.group_add_member = this.groupTypeData.is_fixed_user
        }
      }
      let params = { dicType: '0' }
      if (item.roleId === 'SYS_ROLE004') {
        params = { dicType: 'MACHINE_TYPE' }
      }
      if (item.roleId === 'SYS_ROLE008') {
        params = { dicType: 'COMBINATION' }
      }
      this.roleId = item.roleId
      this.$api['thirdPartInterface.getDic'](params).then(res => {
        if (res) {
          this.options = res
        }
      })
    },
    addRolesHandle () {
      // 添加角色
      let defaultObj = {
        // id: (-this.generalRoles.length + 1) + '',
        id: this.rolesData.length + '',
        indexNo: 0,
        name: '角色名称',
        klTeamRoleClassifyId: '',
        projectTeamRoleUsers: [],
        roleType: 'general'
      }
      this.rolesData.push(defaultObj)
      this.generalRoles.push(defaultObj)
      // 添加角色操作有修改
      this.isAddMember = true
      this.rolesHandle(this.rolesData[this.rolesData.length - 1], this.rolesData.length - 1)
    },
    refreshHandle () {
      /**
       * 刷新: 1. 清空角色选中; 2. 人员列表展示所有角色下的人员 3. 对应人员列表添加角色信息
       */
      if (this.rolesSelectedIndex < 0) {
        return
      }
      this.rolesSelectedIndex = -1
      let tableData = []
      this.rolesData.map(item => {
        let projectTeamRoleUsers = item.projectTeamRoleUsers.map(pitem => {
          pitem.roleName = item.name
          pitem.roleId = item.id
          pitem.userRoleId = item.roleId
          pitem.roleType = item.roleType
          return pitem
        })
        tableData.push(...projectTeamRoleUsers)
      })
      this.columns.unshift({
        title: '角色',
        dataIndex: 'roleName'
      })
      this.tableData = tableData
    },
    changeRolesHandle (text, record) {
      record.name = text
    },
    deleteRolesHandle (index) {
      // this.generalRoles.splice(index, 1)
      // this.tableData = []
      this.rolesSelectedIndex = index - 1
      this.generalRoles.splice(index - this.fixedRoles.length, 1)
      this.tableData = this.rolesData[index - 1].projectTeamRoleUsers ? this.rolesData[index - 1].projectTeamRoleUsers : []
      this.rolesData.splice(index, 1)
      this.isDelete = true
    },
    tableDeleteMemberHandle (row, index) {
      if ((row.entryTime && row.departureTime) || (!row.entryTime && !row.departureTime)) {
        this.tableData.splice(index, 1)
      }
    },
    deleteUserHandle (scope, index) {
      /**
       * 人员删除
       *    人员在该项目中的任务数为0时，直接删除
       *    人员在该项目中的任务数不为0时，状态为： 已退出
       *       前台手动处理: 获取当前时间作为已退出的时间(此时列-状态: 待退出), 当用户点击保存的时, 处理的退出时间一起提交保存, 成功之后为 已退出
       *
       *    处于刷新的情况下(即点击角色列表右下角的刷新按钮)
       *      此时的删除人员要考虑对应角色下的人员的删除(1. 当前列表页的一个删除, 2.点击切换到该人员对应的角色下时, 此时人员也应该被删除)
       */
      if (scope.row.taskCount) {
        scope.row.visible = false // 先隐藏弹窗
        scope.row.departureTime = moment().format('YYYY-MM-DD HH:mm:ss')
        scope.row.waitout = true
      } else {
        this.tableData.splice(index, 1)
        if (this.rolesSelectedIndex < 0) {
          let row = scope.row
          let roleInfo = row.roleType === 'fixed' ? this.fixedRoles.filter(item => item.roleId === row.userRoleId) : this.generalRoles.filter(item => item.roleId === row.userRoleId)
          let projectTeamRoleUsers = roleInfo[0].projectTeamRoleUsers
          let pIndex = projectTeamRoleUsers.findIndex(item => item.sysuserId === row.sysuserId)
          if (pIndex > -1) {
            projectTeamRoleUsers.splice(pIndex, 1)
          }
        }
      }
      this.isDelete = true
    },
    addMemberHandle () {
      // 添加人员
      if ((this.fixedRoles && this.fixedRoles.length > 0) || (this.generalRoles && this.generalRoles.length > 0)) {
        if (this.rolesSelectedIndex > -1) {
          this.visibleDialogMember = true
        } else {
          this.$message({
            type: 'error',
            message: '请先选择角色'
          })
        }
      } else {
        this.$message({
          type: 'error',
          message: '请先添加角色'
        })
      }
    },
    copyRoleHandle () {
      // 从历史项目复制
      this.visibleDialogRoles = true
    },
    expRolesCloseHandle (experienceTeamSelectValue) {
      // (我的经验团队)从历史项目复制-面板关闭
      this.visibleDialogRoles = false
      if (experienceTeamSelectValue.length > 0) {
        this.loadRolesCommonHandle(experienceTeamSelectValue)
      }
    },
    loadStandardTeamHandle () {
      // 载入标准团队
      this.visibleDialogRoles = true
    },
    standardRolesCloseHandle (info) {
      // (标准团队)载入标准团队-面板关闭
      this.visibleDialogRoles = false
      if (info && info.kTeamId) {
        this.teamsId = info.kTeamId
        this.loadRolesCommonHandle(info.data)
      }
    },
    loadRolesCommonHandle (data) {
      let tempArr = []
      data.forEach(item => {
        let flag = true
        this.rolesData.forEach(el => {
          if (el.name == item.name) {
            flag = false
          }
        })
        if (flag) {
          let tempObj = {
            id: item.id,
            indexNo: item.indexNo,
            name: item.name,
            klTeamRoleClassifyId: item.teamRoleClassifyId || item.klTeamRoleClassifyId,
            projectTeamRoleUsers: [],
            roleId: item.sysRole,
            roleType: item.isFixed == '1' ? 'fixed' : 'general',
            isFixed: item.isFixed,
            isRequired: item.isRequired
          }
          tempArr.push(tempObj)
        }
      })
      if (tempArr && tempArr.length) {
        tempArr.forEach(el => {
          if (el.roleType == 'fixed') {
            this.fixedRoles.push(el)
          } else {
            this.generalRoles.push(el)
          }
        })
      }
      this.rolesData.push(...tempArr)
      this.rolesData = _.uniqWith(this.rolesData, _.isEqual)
      this.rolesData.sort(function (a, b) {
        return b.isFixed - a.isFixed
      })
    },
    memberCloseHandle (tableSelectValue) {
      // 添加人员-面板关闭
      this.visibleDialogMember = false
      if (tableSelectValue.length > 0) {
        let tempSelectData = []
        let selectRoleId = this.selectRoleId
        let userRoleId = this.roleId
        tableSelectValue.forEach(item => {
          let filter = this.tableData.filter(titem => titem.sysuserId === item.id).length
          if (!filter) {
            item.sysuserId = item.id
            item.id = ''
            item.roleId = selectRoleId
            item.userRoleId = userRoleId
            tempSelectData.push(item)
          } else {
            let index = this.tableData.findIndex(titem => titem.sysuserId === item.id)
            this.tableData[index].departureTime = ''
            this.tableData[index].entryTime = ''
          }
        })
        this.tableData.push(...tempSelectData)
        // 有信息修改
        this.isAddUser = true
      }
    },
    opentDialogUserTask (row, moint) {
      this.userTaskTableParams.currentUserId = row.sysuserId
      this.userTaskTableParams.tameRoleId = row.tameRoleId
      this.userTaskTableParams.dutyMonitor = moint
      // this.userTaskTableParams.wholeDescribeId = this.thirdMenuParam.id || ''
      this.visibleDialogUserTask = true
    },
    closeDialogUserTask (row) {
      /**
       * 人员列表-承担任务总数-任务明细 弹窗关闭
       */
      Object.keys(this.userTaskTableParams).forEach(key => {
        this.userTaskTableParams[key] = ''
      })
      this.visibleDialogUserTask = false
    },
    userTaskCustomSearch (searchParam, _table) {
      /**
       * 人员列表-承担任务总数-任务明细列表搜索
       */
      if (searchParam.beginEndTime) {
        searchParam.planBeginDate = moment(searchParam.beginEndTime[0]).format('YYYY-MM-DD')
        searchParam.planEndDate = moment(searchParam.beginEndTime[1]).format('YYYY-MM-DD')
      }
      this.userTaskTableParams = { ...this.userTaskTableParams, ...searchParam }
    },
    userTaskCustomReset () {
      /**
       * 人员列表-承担任务总数-任务明细列表搜索重置
       */
      let currentUserId = ''
      if (this.userTaskTableParams.currentUserId) {
        currentUserId = this.userTaskTableParams.currentUserId
        this.wholeDescribeId = this.id
      }
      Object.keys(this.userTaskTableParams).forEach(key => {
        this.userTaskTableParams[key] = ''
      })
      this.userTaskTableParams.currentUserId = currentUserId
    },
    submitVerifyHandle () {
      let result = true
      let roleNotNullMsg = []
      this.fixedRoles.forEach(fixedItem => {
        // 改角色是必填且未选择人员时给出提示
        if (fixedItem.isRequired === '1' && fixedItem.projectTeamRoleUsers.length === 0) {
          roleNotNullMsg.push(fixedItem.name)
        }
      })
      if (roleNotNullMsg.length > 0) {
        Notification.error({
          title: '以下角色不能为空：',
          message: roleNotNullMsg.join('<br/>'),
          dangerouslyUseHTMLString: true
        })
      }
      if (roleNotNullMsg.length > 0) {
        result = false
      }
      return result
    },
    async saveAndRelease () {
      this.releaseFlag = false
      await this.submit()
      if (this.releaseFlag) {
        this.nextApproveUserBeforehand('projectReadyApproveRelease')
      }
      this.submitLoading = false
    },
    async submit () {
      let _this = this
      await this.submitParamsHandle().then(params => {
        let verifyResult = this.submitVerifyHandle()
        if (!verifyResult) {
          return false
        }
        // let secretLevel = true
        // params.uploadFiles.forEach(val => {
        //   // if (val.confidentialite > _this.thirdMenuParam.secretGrade) {
        //   //   secretLevel = false
        //   // }
        // }
        // )
        // if (!secretLevel) {
        //   _this.$message({
        //     type: 'warning',
        //     message: '文件密级不能大于项目密级！'
        //   })
        //   return
        // }
        _this.submitLoading = true
        _this.releaseFlag = true
        this.$api['teamManager.save'](params).then(res => {
          _this.submitLoading = false
          if (res !== undefined) {
            _this.$message({
              message: '信息已提交',
              type: 'success'
            })
            _this.getTeamInfo()
            _this.isAddUser = false
            _this.isAddMember = false
          } else {
            _this.$message({
              message: '保存失败',
              type: 'error'
            })
          }
        }).catch(function (err) {
          _this.submitLoading = false
          _this.$message({
            message: '保存失败',
            type: 'error'
          })
        })
      })
    },
    submitParamsHandle () {
      return new Promise((resolve, reject) => {
        // this.memberFormComp.validate().then(queryParams => {
        let params = {
          id: '',
          wholeDescribeId: this.id,
          klTeamsId: this.klTeamsId,
          uploadFiles: this.namedFiles,
          // team: {
          //   wholeDescribeId: this.planInfoId,
          //   teamsId: this.teamsId
          // },
          fixedRoles: [],
          generalRoles: []
        }
        let tableData = this.tableData
        this.fixedRoles.forEach(fixedItem => {
          let temp = {}
          let roleId = fixedItem.roleId
          let tempUserList = tableData.filter(i => {
            return i.userRoleId === roleId
          })
          let fixedRolesKeys = Object.keys(fixedItem)
          fixedRolesKeys.forEach(key => {
            if (key === 'projectTeamRoleUsers') {
              temp[key] = []
              fixedItem[key].forEach(projectItem => {
                let projectTemp = {}
                let projectUserByIdIndex = tempUserList.findIndex(i => {
                  return i.id === projectItem.id
                })
                let projectUserById = tempUserList[projectUserByIdIndex]
                tempUserList.splice(projectUserByIdIndex, 1)

                projectTemp.id = projectItem.id && projectItem.id.length === 32 ? projectItem.id : '' // projectItem.id ? projectItem.id :
                projectTemp.sysuserId = projectItem.sysuserId ? projectItem.sysuserId : ''
                projectTemp.entryTime = projectItem.entryTime ? projectItem.entryTime : ''
                projectTemp.flag = projectUserById && projectUserById.flag ? projectUserById.flag : projectItem.flag
                projectTemp.departureTime = projectItem.departureTime ? projectItem.departureTime : ''
                temp[key].push(projectTemp)
              })
              tempUserList.forEach(projectItem => {
                let projectTemp = {}
                projectTemp.id = projectItem.id && projectItem.id.length === 32 ? projectItem.id : '' // projectItem.id ? projectItem.id :
                projectTemp.sysuserId = projectItem.sysuserId ? projectItem.sysuserId : ''
                projectTemp.entryTime = projectItem.entryTime ? projectItem.entryTime : ''
                projectTemp.flag = projectItem.flag ? projectItem.flag : ''
                projectTemp.departureTime = projectItem.departureTime ? projectItem.departureTime : ''
                temp[key].push(projectTemp)
              })
            } else {
              temp[key] = fixedItem[key]
            }
            delete temp.roleType
          })
          temp.klTeamsRoleId = fixedItem.klTeamsRoleId
          params.fixedRoles.push(temp)
        })
        this.generalRoles.forEach(generalItem => {
          let temp = {}
          let generalRolesKeys = Object.keys(generalItem)
          generalRolesKeys.forEach(key => {
            if (key === 'projectTeamRoleUsers') {
              temp[key] = []
              generalItem[key].forEach(projectItem => {
                let projectTemp = {}
                projectTemp.id = projectItem.id && projectItem.id.length === 32 ? projectItem.id : '' // projectItem.id ? projectItem.id :
                projectTemp.sysuserId = projectItem.sysuserId ? projectItem.sysuserId : ''
                projectTemp.entryTime = projectItem.entryTime ? projectItem.entryTime : ''
                projectTemp.departureTime = projectItem.departureTime ? projectItem.departureTime : ''
                temp[key].push(projectTemp)
              })
            } else {
              temp[key] = generalItem[key]
              temp.id = !temp.id || temp.id.length !== 32 ? '' : temp.id // id长度为32
            }
            delete temp.roleType
          })
          temp.klTeamsRoleId = generalItem.klTeamsRoleId
          params.generalRoles.push(temp)
        })
        resolve(params)
        // })
      })
    },
    changeCheak () {
      let result = false
      if (this.isAddMember || this.isAddUser || this.isDelete) {
        result = true
      }
      return result
    },
    uploadFile (file, field) {
      this.namedFiles.push(file)
    },
    removedFile (file, field) {
      this.namedFiles = []
    },
    nextApproveUserBeforehand (processDefinationTwoKey) {
      const that = this
      nextApproveUserBeforehand.initDataSource(processDefinationTwoKey, this).then((res1) => {
        if (res1 === true) {
          that.isSelectApproveUserBeforehandView = true
        }
      })
    },
    // 提交审批
    commitSelectApproveUserBeforehand (fullParams) {
      let formData = this.$refs.projectFormView.formData
      const that = this
      if (this.row && this.row.length) {
        fullParams.projectInfo = {
          projectName: this.row[0].PROJECTNAME,
          projectType: this.row[0].PROJECTTYPE,
          modelCode: this.row[0].MODELCODE
        }
      } else {
        fullParams.projectInfo = formData.projectInfo
      }
      this.releaseMenuParams.beforehandParams = { ...fullParams }
      const rowIds = [this.id]
      this.releaseMenuParams.businessId = rowIds
      this.releaseMenuParams.processDefinitionKey = 'projectReadyApproveRelease'
      this.$api['baseData.commitApprove'](this.releaseMenuParams)
        .then(function (res) {
          if (res.result && res.result === 'false') {
            that.$message({
              type: 'error',
              message: res.message
            })
          } else {
            that.$message({
              message: '提交成功',
              type: 'success'
            })
            that.$emit('close')
          }
        })
        .catch(function (error) {
          console.error(error)
        })
      that.isSelectApproveUserBeforehandView = false
    },
    closeSelectApproveUserBeforehand () {
      this.isSelectApproveUserBeforehandView = false
    }
    // isShowRole (row) {
    //   return row.isRequired === '1'
    // }
  },
  components: {
    VuePerfectScrollbar,
    EditInput,
    CommonTable,
    ProjectFormView,
    DialogSelectMember,
    DialogTabsRoles,
    DialogUserTask,
    SearchFormList,
    NlcrLayout,
    'el-button': Button,
    // 'el-button-group': ButtonGroup,
    'el-popconfirm': Popconfirm,
    'el-link': Link,
    CommonFileView,
    CommonUpload,
    SelectApproveUserBeforehand
  }
}
</script>

<style lang="scss" scoped>
.custom_content_wrap {
  display: flex;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  .left_content {
    width: 70%;
    height: 100%;
    box-shadow: 4px 4px 8px #bfbdbd54;
    .left_bottom_content {
      display: flex;
      height: calc(100% - 50px);
    }
  }
}
.teamFile {
  height: 50px;
  display: flex;
  box-sizing: border-box;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  background: white;
  border-bottom: 2px solid #f2f2f2;
  ::v-deep .upload__secret-file-list {
    display: none;
  }
}
.viewVisible {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0.5);
}
.normal-nlcr-layout.custom-normal-layout {
  margin: 0;
  height: 90% !important;
}

.menuLayout.el-container .el-main > div > div {
  // height: 90%;
}

/**调整 左中右布局样式 */
::v-deep .normal-nlcr-layout.custom-nlcr {
  height: calc(100% - 110px);

  .normal-nlcr-main {
    .el-row,
    .el-col {
      .normal-nlcr-left {
        border-right: none;
      }

      .normal-nlcr-right {
        border-left: none;
      }
    }
  }
}

.role-con {
  position: relative;
  height: 100%;
  width: 30%;
  background-color: white;
  overflow-y: hidden;
  margin: 0 2px 0 0;
  button {
    border: 1px solid #1890ff;
    color: #1890ff;
  }

  .add-role {
    box-sizing: border-box;
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px dashed $base-light-color;

    &.not-edit {
      background: #ffffff;
      font-size: 14px;
      color: #323232;
    }

    button {
      width: 100%;
      height: 100%;
      border-radius: 0;
      border: none;
      color: $base-light-color;
    }
  }

  .refresh {
    position: absolute;
    bottom: 0;
    left: 0;
    width: calc(100% - 10px);
    height: 50px;
    box-sizing: border-box;
    padding-right: 10px;
    text-align: right;
    line-height: 50px;
    font-size: 24px;
    background-color: #ffffff;

    .el-icon-refresh {
      &:hover {
        cursor: pointer;
      }
    }
  }

  .role-list {
    height: 100%;
    padding: 5px 15px;
    // border-bottom: 1px dashed #cccccc;
    background-color: #ffffff;
    box-sizing: border-box;

    li {
      position: relative;
      display: flex;
      align-items: center;
      height: 40px;
      border-bottom: 1px solid #cccccc;
      color: #323232;
      box-sizing: border-box;
      padding: 0 6px;

      &.active {
        font-weight: bolder;
        color: #0e77d1 !important;
        ::v-deep span {
          font-weight: bolder;
          color: #0e77d1 !important;
        }
      }

      &.active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        border-left: 3px solid #46a6ff;
      }

      i {
        font-size: 18px;
      }
    }

    .fixed-role {
      i {
        color: #ec808d;
      }
    }
  }
}

.table-con {
  height: 100%;
  width: 70%;
  background: #fff;
  padding: 0 10px 8px;
  box-sizing: border-box;

  .add-member {
    height: 50px;
    line-height: 50px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;

    button {
      border: 1px solid #1890ff;
      color: #1890ff;
    }
  }

  .common-table-member {
    height: calc(100% - 50px);

    ::v-deep .el-table::before {
      top: 0;
      bottom: auto;
    }

    ::v-deep .el-table::after {
      background: transparent;
    }
  }

  .userState {
    .state-working,
    .state-waitout,
    .state-out {
      position: relative;
      padding-left: 10px;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }
    }

    .state-working::before {
      background-color: #0e77d1;
    }

    .state-waitout::before {
      background-color: #999999;
    }

    .state-out::before {
      background-color: #f04134;
    }
  }
}
.submit {
  margin-right: 20px;
}
.bottom-con {
  width: 100%;
  height: 50px !important;
  // margin-top: 8px;
  background-color: #ffffff !important;
  box-shadow: 4px -4px 8px #bfbdbd54;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  div.tip {
    font-size: 16px;
    color: #323232;

    span:nth-child(2) {
      color: #999;
      padding-left: 6px;
    }
  }

  .operation {
    // flex: 1;
    text-align: right;
    margin-right: 10px;
  }
}

.right-con {
  height: 100%;
  width: 30%;
  background-color: #fff;
  margin-left: 16px;
  box-shadow: 4px 4px 8px #bfbdbd54;
  ::v-deep .files-view-wrap {
    .files-item--row {
      padding: 0;
    }
    i {
      display: none;
    }
  }
}
.tableMember ::v-deep .bottom-flex {
  display: none;
}
.files-view-wrap {
  position: relative;
  top: 5px;
  ::v-deep i {
    display: none;
  }
}
</style>
