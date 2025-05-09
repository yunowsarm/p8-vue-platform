<!--整体管理-团队管理-->
<template>
  <common-dialog title="选择人员"
                 style="background:unset !important;"
                 :visible="visible"
                 :dialogHeight="dialogHeight"
                 @handle-cancel="handleCancel"
                 @handle-ok="handleOk"
                 @close="handleCancel">
    <template #dialog>
      <div style="height: calc(100% - 50px);background-color: #f3f5f885">
        <div style="height: 100%"
             class="team-manager-wrap">
          <div class="custom_content_wrap">
            <div class="left_content">
              <div class="left_bottom_content">
                <div class="role-con">
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
                      <span>{{item.name}}</span>
                    </li>
                  </vue-perfect-scrollbar>
                </div>
                <div class="table-con">
                  <div class="add-member">
                    <div>
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
                                  :tableSetting="false"
                                  :isRadioSelect="!isMultiple"
                                  @selection-change="pendingSelectionChange"
                                  :noApiTableData="tableData">
                      <template #taskCount="{ scope }">
                        <span>{{ scope.row.taskCount }}</span>
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
                        </template>
                      </template>
                      <template #flagHeader="{scope}">
                        <span>{{ scope.column.label }}</span><i class="el-icon-edit"></i>
                      </template>
                    </common-table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </common-dialog>
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
  P8FileView as CommonFileView,
  P8Dialog as CommonDialog
} from 'p8-components-ui'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
import _ from 'lodash'
import moment from 'moment'

export default {
  name: 'teamManager',
  props: {
    selsctRow: {
      type: Array,
      default: () => {
        return []
      }
    },
    isMultiple: {
      type: Boolean,
      default: false
    },
  },
  data () {
    const columns = [
      {
        type: 'selection',
        width: 45,
        align: 'center'
      },
      {
        title: '角色',
        dataIndex: 'roleName',
        align: 'center'
      },
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
        align: 'center',
        width: 80,
      },
      {
        title: '状态',
        dataIndex: 'userState',
        scopedSlots: {
          customRender: 'custom'
        },
        align: 'center',
        width: 80,
      },
      {
        title: '进入时间',
        dataIndex: 'entryTime',
        align: 'center'
      },
      {
        title: '退出时间',
        dataIndex: 'departureTime',
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
    return {
      projectClassname: '',
      roleId: '',
      id: null,
      params: {},
      columns,
      dataSource,
      visible: true,
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
      groupTypeData: {},
      loadingUserDeptStrategy: '',
      options: [],
      memberFormComp: null,
      uploadView: false,
      dialogHeight: 600
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
    if (this.selsctRow && this.selsctRow.length) {
      this.$api['ProjectInitiationManagement.getWholeById']({ businessId: this.selsctRow[0].ID }).then(res => {
        this.id = res
        this.getTeamInfo()
      })
    }
  },
  methods: {
    search (params) {
      let realName = params.realName ? params.realName : null
      let deptName = params.deptName ? params.deptName : null
      let tableData = this.tableData.filter(item => {
        if ((item.realName.indexOf(realName) > -1) || (item.deptName.indexOf(deptName) > -1)) {
          return item
        }
      })
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
      this.tableData = tableData
    },
    pendingSelectionChange (selection) {
      this.selectRows = selection
    },
    handleCancel () {
      this.$emit('close')
      this.visible = false
    },
    handleOk () {
      let select = this.selectRows.map(el => {
        return { id: el.id, name: el.realName }
      })
      this.$emit('close', select)
      this.visible = false
    }
  },
  components: {
    VuePerfectScrollbar,
    CommonTable,
    SearchFormList,
    NlcrLayout,
    'el-button': Button,
    'el-popconfirm': Popconfirm,
    'el-link': Link,
    CommonFileView,
    CommonUpload,
    CommonDialog
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
    width: 99%;
    height: 100%;
    box-shadow: 4px 4px 8px #bfbdbd54;
    .left_bottom_content {
      height: 100%;
      display: flex;
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

// .menuLayout.el-container .el-main > div > div {
// height: 90%;
// }

/**调整 左中右布局样式 */
::v-deep .normal-nlcr-layout.custom-nlcr {
  height: calc(100% - 110px);
  .icon-zuozhedie {
    display: none;
  }
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
  width: 25%;
  overflow-y: hidden;
  padding: 0 2px 0 0;

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
  width: 75%;
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
      border: 1px solid $base-light-color;
      color: $base-light-color;
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
.tableMember ::v-deep .bottom-flex {
  display: none;
}
.files-view-wrap {
  position: relative;
  top: 5px;
  right: 15px;
  ::v-deep i {
    display: none;
  }
}
</style>
