<template>
  <div style="height: 100%">
    <!-- <center-right-layout>
          <template #left>
              <normal-layout >
                <template #north>
                  <div v-if="visibleAddUser" class="upload-con">
                    <div class="text">人员任命文件:</div>
                    <el-upload :action="uploadActionApi">
                      <el-button icon="el-icon-upload2"> 上传附件 </el-button>
                    </el-upload>
                  </div>
                </template>
                <template #west>
                  <div class="role-con">
                    <vue-perfect-scrollbar class="role-list">
                      <ul class="fixed-role">
                        <li :class="item.roleId===rolesSelectedId?'active':''" v-for="item in fixedRoles" :key="item.id" @click="rolesHandle(item,1)">
                          <i class="el-icon-s-custom"></i>
                          <edit-input :textValue="item.name" :record="item"></edit-input>
                        </li>
                      </ul>
                      <div class="general-role">
                        <li :class="item.id===rolesSelectedId?'active':''" v-for="(item,index) in generalRoles" :key="item.id" @click="rolesHandle(item,2)">
                          <i class="el-icon-s-custom"></i>
                          <edit-input :textValue="item.name || item.roleName" :record="item" :iconShow="false" @delete="deleteRolesHandle(index)" @onChange="changeRolesHandle"></edit-input>
                        </li>
                      </div>
                    </vue-perfect-scrollbar>
                  </div>
                </template>
                <template #center>
                  <div class="table-con">
                    <div class="add-member">
                      <el-button v-if="visibleAddUser" type="text" icon="el-icon-circle-plus" @click="addMemberHandle">添加人员</el-button>
                    </div>
                    <div class="common-table">
                        <el-table
                          ref="table"
                          height="100%"
                          stripe
                          :data="tableData"
                          row-key="id"
                          row-class-name="rowStyle"
                          header-row-class-name="headerRowStyle">
                          <el-table-column
                            prop="realName"
                            label="姓名"
                            align="center">
                          </el-table-column>
                          <el-table-column
                            prop="deptName"
                            label="部门"
                            align="center">
                          </el-table-column>
                          <el-table-column
                            prop="taskCount"
                            label="承担任务总数"
                            align="center">
                          </el-table-column>
                          <el-table-column
                            prop="userState"
                            label="状态"
                            align="center">
                            <template slot-scope="props">
                              <div class="userState">
                                <span v-if="props.row.entryTime && !props.row.departureTime" class="state-working">团队中</span>
                                <span v-if="props.row.entryTime && props.row.departureTime" class="state-out">已退出</span>
                              </div>
                            </template>
                          </el-table-column>
                          <el-table-column
                            prop="entryTime"
                            label="进入时间"
                            align="center">
                          </el-table-column>
                          <el-table-column
                            prop="departureTime"
                            label="退出时间"
                            align="center">
                          </el-table-column>
                          <el-table-column
                            label="操作"
                            align="center">
                            <template slot-scope="props">
                              <el-popover
                                placement="top"
                                width="100"
                                trigger="hover">
                                <p v-if="(props.row.entryTime && props.row.departureTime)||(!props.row.entryTime && !props.row.departureTime)">确定要删除吗?</p>
                                <p v-if="props.row.entryTime && !props.row.departureTime">该人员当前不可被删除</p>
                                <div style="text-align: right; margin: 0" v-if="!(props.row.entryTime && !props.row.departureTime)">
                                  <el-button type="primary" size="mini" @click="tableDeleteMemberHandle(props.row, props.$index)">好</el-button>
                                </div>
                                <el-button v-if="visibleAddUser" slot="reference" size="mini" type="text">删除</el-button>
                              </el-popover>
                            </template>
                          </el-table-column>
                        </el-table>
                    </div>
                  </div>
                </template>
              </normal-layout>
          </template>
          <template #bottom>
            <div class="bottom-con">
              <div class="submit">
                <el-button size="mini" type="primary" :loading="submitLoading" @click="submit">提交</el-button>
              </div>
            </div>
          </template>
          <template #right>
            <project-form-view :id="id"></project-form-view>
          </template>
        </center-right-layout> -->
    <nlcr-layout class="custom-nlcr"
                 :headerVisible="false"
                 :leftUsePerfectScrollbar="false">
      <template #left>
        <div class="role-con">
          <!-- <vue-perfect-scrollbar class="role-list">
                      <ul class="fixed-role">
                        <li
                          :class="item.roleId === rolesSelectedId ? 'active' : ''"
                          v-for="item in fixedRoles"
                          :key="item.id"
                          @click="rolesHandle(item, 1)"
                        >
                          <i class="el-icon-s-custom"></i>
                          <edit-input :textValue="item.name" :record="item"></edit-input>
                        </li>
                      </ul>
                      <div class="general-role">
                        <li
                          :class="item.id === rolesSelectedId ? 'active' : ''"
                          v-for="(item, index) in generalRoles"
                          :key="item.id"
                          @click="rolesHandle(item, 2)"
                        >
                          <i class="el-icon-s-custom"></i>
                          <edit-input
                            :textValue="item.name || item.roleName"
                            :record="item"
                            :iconShow="false"
                            @delete="deleteRolesHandle(index)"
                            @onChange="changeRolesHandle"
                          ></edit-input>
                        </li>
                      </div>
                    </vue-perfect-scrollbar> -->
          <vue-perfect-scrollbar class="role-list">
            <li :class="[
                  { 'active': index === rolesSelectedIndex },
                  { 'fixed-role': item.roleType === 'fixed' },
                ]"
                v-for="(item, index) in rolesData"
                :key="item.id"
                @click="rolesHandle(item, index)">
              <i class="el-icon-s-custom"></i>
              <edit-input :textValue="item.name || item.roleName"
                          :record="item"
                          :iconShow="false"
                          @delete="deleteRolesHandle(index, item)"></edit-input>
            </li>
          </vue-perfect-scrollbar>
          <div class="refresh">
            <el-tooltip content="点击查看全部成员"
                        placement="left">
              <i class="el-icon-refresh"
                 @click="refreshHandle"></i>
            </el-tooltip>
          </div>
        </div>
      </template>
      <template #center>
        <div class="table-con">
          <div class="add-member">
            <el-button v-if="visibleAddUser"
                       type="plan"
                       icon="el-icon-circle-plus"
                       @click="addMemberHandle">添加人员
            </el-button>
            <search-form-list style="margin-top: 6px"
                              ref="search"
                              :resetAfterToSearch="false"
                              :dataSource="dataSource"
                              @search="search"
                              @re-set="reset"></search-form-list>
          </div>
          <div class="common-table">
            <common-table ref="table"
                          style="height: 100%"
                          :columns="columns"
                          :pagination="false"
                          :tableSetting="false"
                          :noApiTableData="tableData">
              <template #taskCount="{ scope }">
                <div class="task-count">
                  <template v-if="scope.row.taskCount">
                    <el-link @click.stop="opentDialogUserTask(scope.row)">
                      {{ scope.row.taskCount}}<i class="el-icon-view el-icon--right"></i>
                    </el-link>
                  </template>
                  <template v-else>
                    <span>{{ scope.row.taskCount }}</span>
                  </template>
                </div>
              </template>
              <template #userState="{ scope }">
                <div class="userState">
                  <span v-if="scope.row.entryTime && !scope.row.departureTime"
                        class="state-working">团队中</span>
                  <span v-if="scope.row.entryTime && scope.row.departureTime && scope.row.waitout"
                        class="state-waitout">待退出</span>
                  <span v-if="scope.row.entryTime && scope.row.departureTime"
                        class="state-out">已退出</span>
                </div>
              </template>
              <template #operation="{ scope }">
                <template v-if="!scope.row.departureTime">
                  <template v-if="scope.row.taskCount">
                    <el-popconfirm title="确认要将该人退出项目组吗?"
                                   confirmButtonText="确认"
                                   cancelButtonText="取消"
                                   @onConfirm="deleteUserHandle(scope, scope.$index)">
                      <el-button slot="reference"
                                 size="mini"
                                 type="text">删除
                      </el-button>
                    </el-popconfirm>
                  </template>
                  <template v-else>
                    <el-button size="mini"
                               type="text"
                               @click="deleteUserHandle(scope, scope.$index)">删除
                    </el-button>
                  </template>
                </template>
              </template>
            </common-table>
          </div>
        </div>
      </template>
      <template #right>
        <div class="right-con">
          <project-form-view :id="id"></project-form-view>
          <member-upload :files="namedFiles"
                         :view="true"></member-upload>
        </div>
      </template>
    </nlcr-layout>
    <div class="bottom-con">
      <p class="submit">
        <el-button size="mini"
                   type="primary"
                   :loading="submitLoading"
                   @click="submit">保存
        </el-button>
      </p>
    </div>
    <dialog-tabs-roles :visibleDialogRoles="visibleDialogRoles"
                       :activeName="dialogRolesActiveName"
                       :id="id"
                       @exp-roles-close="expRolesCloseHandle"
                       @standard-roles-close="standardRolesCloseHandle"></dialog-tabs-roles>
    <factory-select-member :visibleDislogMember="visibleDialogMember"
                           @member-close="memberCloseHandle"
                           :loginFlag="loginFlag"
                           :existsData="tableData"></factory-select-member>
    <dialog-user-task :dialogVisible="visibleDialogUserTask"
                      :tableParams="userTaskTableParams"
                      :customSearch="true"
                      @close="closeDialogUserTask()"
                      @custom-search="userTaskCustomSearch"
                      @custom-reset="userTaskCustomReset"></dialog-user-task>
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
  Tooltip
} from 'p8-components-ui'

import MemberUpload from './Components/memberUpload'
// import { P8NormalLayout as NormalLayout } from 'p8-components-ui'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
import DialogUserTask from './Components/DialogUserTask'

import EditInput from './Components/EditInput'
import ProjectFormView from './Components/ProjectFormView'
import FactorySelectMember from './Components/FactorySelectMember'
import DialogTabsRoles from './Components/DialogTabsRoles'

import _ from 'lodash'
import moment from 'moment'

export default {
  name: 'teamManager',
  props: {
    // id: {
    //   type: String
    // },
    thirdMenuParam: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data () {
    const columns = [
      {
        title: '角色',
        dataIndex: 'roleName',
        align: 'center'
      },
      {
        title: '姓名',
        dataIndex: 'realName'
      },
      {
        title: '部门',
        dataIndex: 'deptName'
      },
      {
        title: '承担任务总数',
        dataIndex: 'taskCount',
        scopedSlots: {
          customRender: 'custom'
        }
      },
      {
        title: '状态',
        dataIndex: 'userState',
        scopedSlots: {
          customRender: 'custom'
        }
      },
      {
        title: '进入时间',
        dataIndex: 'entryTime'
      },
      {
        title: '退出时间',
        dataIndex: 'departureTime'
      },
      {
        title: '操作',
        fixed: 'right',
        dataIndex: 'operation',
        width: 80,
        scopedSlots: {
          customRender: 'custom'
        }
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
    return {
      id: null,
      columns,
      dataSource,
      uploadActionApi: '',
      rolesSelectedId: 0,
      rolesSelectedIndex: 0,
      tableData: [],
      fixedRoles: [],
      generalRoles: [],
      submitLoading: false,
      saveLoading: false,
      visibleDialogMember: false,
      visibleDialogRoles: false,
      memberPopoverVisible: false,
      dialogRolesActiveName: '',
      teamsId: '',
      loginFlag: '1',
      isSave: false,
      visibleAddUser: true,
      visibleDialogUserTask: false,
      userTaskTableParams: {
        currentUserId: '',
        wholeDescribeId: this.thirdMenuParam.id || ''
      },
      namedFiles: [],
      rolesData: []
    }
  },
  mounted () {
    this.id = this.thirdMenuParam.id
    this.getTeamInfo()
  },
  methods: {
    getTeamInfo () {
      this.$api['projectTeam.index']({ wholeDescribeId: this.id }).then(res => {
        if (res) {
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
            } else {
              // 否则 列表未被选中, 展示全部角色
              let tableData = []
              this.rolesData.map(item => {
                let projectTeamRoleUsers = item.projectTeamRoleUsers.map(pitem => {
                  pitem.roleName = item.name
                  pitem.roleId = item.id
                  pitem.roleType = item.roleType
                  return pitem
                })
                tableData.push(...projectTeamRoleUsers)
              })
              this.tableData = tableData
            }
          }
          if (this.fixedRoles.length) {
            this.visibleAddUser = false
          } else if (this.generalRoles.length) {
            this.visibleAddUser = true
          }
          this.teamsId = this.team && this.team.teamsId ? this.team.teamsId : ''
        }
      })
    },
    rolesHandle (item, index) { // 角色列表点击切换
      // if (this.rolesSelectedId === (item.roleId || item.id)) {
      //   return
      // }
      // this.rolesSelectedId = item.roleId || item.id
      // this.tableData = item.projectTeamRoleUsers ? item.projectTeamRoleUsers : []
      // if (index === 2) {
      //   this.visibleAddUser = true
      // }
      // if (index === 1) {
      //   this.visibleAddUser = false
      // }
      if (this.rolesSelectedIndex === index) {
        return
      }
      this.rolesSelectedIndex = index
      this.visibleAddUser = item.roleType !== 'fixed'
      this.tableData = item.projectTeamRoleUsers ? item.projectTeamRoleUsers : []
      if (this.columns.filter(item => item.dataIndex === 'roleName').length) {
        this.columns.shift()
      }
    },
    tableDeleteMemberHandle (row, index) {
      if ((row.entryTime && row.departureTime) || (!row.entryTime && !row.departureTime)) {
        this.tableData.splice(index, 1)
      }
    },
    deleteUserHandle (scope, index) {
      if (scope.row.taskCount) {
        scope.row.visible = false // 先隐藏弹窗
        scope.row.departureTime = moment().format('YYYY-MM-DD HH:mm:ss')
        scope.row.waitout = true
      } else {
        this.tableData.splice(index, 1)
        if (this.rolesSelectedIndex < 0) {
          let row = scope.row
          let roleInfo = row.roleType === 'fixed' ? this.fixedRoles.filter(item => item.id === row.roleId) : this.generalRoles.filter(item => item.id === row.roleId)
          let projectTeamRoleUsers = roleInfo[0].projectTeamRoleUsers
          let pIndex = projectTeamRoleUsers.findIndex(item => item.sysuserId === row.sysuserId)
          if (pIndex > -1) {
            projectTeamRoleUsers.splice(pIndex, 1)
          }
        }
      }
    },
    addMemberHandle () {
      // 添加人员
      if ((this.fixedRoles && this.fixedRoles.length > 0) || (this.generalRoles && this.generalRoles.length > 0)) {
        if (this.rolesSelectedIndex) {
          this.visibleDialogMember = true
        } else {
          this.$message({
            type: 'warning',
            message: '请先选择角色'
          })
        }
      } else {
        this.$message({
          type: 'warning',
          message: '请先添加角色'
        })
      }
    },
    search (params) {
      let realName = params.realName ? params.realName : ''
      let deptName = params.deptName ? params.deptName : ''
      let tableData = this.tableData.filter(item => (item.realName === realName || item.deptName === deptName))
      this.tableData = tableData
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
    expRolesCloseHandle (experienceTeamSelectValue) {
      // (我的经验团队)从历史项目复制-面板关闭
      this.visibleDialogRoles = false
      if (experienceTeamSelectValue.length > 0) {
        this.loadRolesCommonHandle(experienceTeamSelectValue)
      }
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
        let tempObj = {
          id: item.id,
          indexNo: item.indexNo,
          name: item.name,
          klTeamRoleClassifyId: item.teamRoleClassifyId || item.klTeamRoleClassifyId,
          projectTeamRoleUsers: []
        }
        tempArr.push(tempObj)
      })
      this.generalRoles.push(...tempArr)
      this.generalRoles = _.uniqWith(this.generalRoles, _.isEqual)
    },
    memberCloseHandle (tableSelectValue) {
      // 添加人员-面板关闭
      this.visibleDialogMember = false
      if (tableSelectValue.length > 0) {
        tableSelectValue.forEach(item => {
          item.sysuserId = item.id
          item.id = ''
        })
        this.tableData.push(...tableSelectValue)
      }
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
          pitem.roleType = item.roleType
          return pitem
        })
        tableData.push(...projectTeamRoleUsers)
      })
      this.columns.unshift({
        title: '角色',
        dataIndex: 'roleName',
        align: 'center'
      })
      this.tableData = tableData
    },
    opentDialogUserTask (row) {
      this.userTaskTableParams.currentUserId = row.sysuserId
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
      }
      Object.keys(this.userTaskTableParams).forEach(key => {
        this.userTaskTableParams[key] = ''
      })
      this.userTaskTableParams.currentUserId = currentUserId
    },
    submit () {
      let _this = this
      _this.submitLoading = true
      let params = this.submitParamsHandle()
      this.$api['projectTeam.save'](params).then(function (res) {
        _this.submitLoading = false
        // _this.isSave = true
        _this.$message({
          message: '信息已提交',
          type: 'success'
        })
        _this.getTeamInfo()
      }).catch(function (err) {
        _this.submitLoading = false
        // _this.isSave = false
        console.error('--save-err--', err)
      })
    },
    submitParamsHandle () {
      let params = {
        uploadFiles: [],
        team: {
          wholeDescribeId: this.id,
          teamsId: this.teamsId
        },
        fixedRoles: [],
        generalRoles: []
      }
      this.fixedRoles.forEach(fixedItem => {
        let temp = {}
        let fixedRolesKeys = Object.keys(fixedItem)
        fixedRolesKeys.forEach(key => {
          if (key === 'projectTeamRoleUsers') {
            temp[key] = []
            fixedItem[key].forEach(projectItem => {
              let projectTemp = {}
              projectTemp.id = projectItem.id && projectItem.id.length === 32 ? projectItem.id : '' // projectItem.id ? projectItem.id :
              projectTemp.sysuserId = projectItem.sysuserId ? projectItem.sysuserId : ''
              projectTemp.entryTime = projectItem.entryTime ? projectItem.entryTime : ''
              projectTemp.departureTime = projectItem.departureTime ? projectItem.departureTime : ''
              temp[key].push(projectTemp)
            })
          } else {
            temp[key] = fixedItem[key]
          }
        })
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
              projectTemp.departureTime = projectItem.departureTime ? projectItem.entryTime : ''
              temp[key].push(projectTemp)
            })
          } else {
            temp[key] = generalItem[key]
            temp.id = temp.id.length !== 32 ? '' : temp.id // id长度为32
          }
        })
        params.generalRoles.push(temp)
      })
      return params
    }
  },
  components: {
    NlcrLayout,
    CommonTable,
    VuePerfectScrollbar,
    EditInput,
    MemberUpload,
    ProjectFormView,
    FactorySelectMember,
    SearchFormList,
    DialogTabsRoles,
    DialogUserTask,
    'el-link': Link,
    'el-button': Button,
    'el-popconfirm': Popconfirm,
    'el-tooltip': Tooltip
  }
}
</script>
<style lang="scss" scoped>
/**调整 左中右布局样式 */
::v-deep .normal-layout.custom-nlcr {
  height: calc(100% - 60px);

  .normal-main {
    .el-row,
    .el-col {
      #normal-left {
        border-right: none;
      }

      #normal-right {
        border-left: none;
      }
    }
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

.role-con {
  height: 100%;
  overflow-y: auto;
  position: relative;
  padding: 0 10px 0 0;

  .role-list {
    height: calc(100% - 50px);
    border-bottom: 1px dashed #cccccc;
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
        ::v-deep span {
          font-weight: bolder;
          color: $theme-color !important;
        }
      }

      &.active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        border-left: 3px solid $theme-color;
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
  background: #fff;
  padding: 0 10px 8px;
  box-sizing: border-box;

  .add-member {
    height: 50px;
    line-height: 50px;
    box-sizing: border-box;

    button {
      border: 1px dashed $base-light-color;
      color: $base-light-color;
      padding: 9px 16px;
    }
  }

  .common-table {
    height: calc(100% - 50px);
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

.bottom-con {
  width: 100%;
  height: 50px !important;
  margin-top: 8px;
  background-color: #ffffff !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.right-con {
  height: 100%;
  background-color: #fff;
  margin-left: 8px;
}
</style>
