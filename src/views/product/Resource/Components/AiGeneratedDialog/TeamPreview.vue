<!--整体管理-团队管理-->
<template>
  <div class="team-preview">
    <div class="content-wrap">
      <div class="left-panel">
        <div class="role-list">
          <vue-perfect-scrollbar>
            <li class="role-item" :class="{ active: rolesSelectedIndex === -1 }" @click="refreshHandle">
              所有人员<span>({{ getTotalCount }})</span>
            </li>
            <li class="role-item" v-for="(item, index) in rolesData" :key="item.id" :class="[
                            { active: index === rolesSelectedIndex },
                            { 'fixed-role': item.roleType === 'fixed' }
                        ]" @click="rolesHandle(item, index)">
              <i :class="[
                                'el-icon-s-custom',
                                { 'is-fixed': item.roleType === 'fixed' }
                            ]"></i>
              {{ item.name }}<span>({{ item.projectTeamRoleUsers?.length || 0 }})</span>
            </li>
          </vue-perfect-scrollbar>
        </div>
      </div>

      <div class="right-panel">
        <common-table class="tableMember" ref="table" :columns="columns" :params="params" :pagination="false"
                      :tableSetting="false"
                      :noApiTableData="tableData">
        </common-table>
      </div>
    </div>
    <div class="apply-button">
      <el-button type="primary" @click="addCurrentTeam">添加到当前团队</el-button>
    </div>
  </div>
</template>

<script>
import {P8Table as CommonTable} from 'p8-components-ui'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'

export default {
  name: 'TeamPreview',

  components: {
    CommonTable,
    VuePerfectScrollbar
  },

  props: {
    teamData: {
      type: Object,
      default: () => ({}),
      immediate: true  // 添加这个选项
    }
  },
  watch: {
    teamData: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length) {
          this.handleTeamData(newVal)
        }
      },
      immediate: true  // 立即执行一次
    }
  },

  data() {
    return {
      columns: [
        {
          title: '角色',
          dataIndex: 'roleName',
          align: 'center'
        },
        {
          title: '姓名',
          dataIndex: 'realName',
          scopedSlots: {customRender: 'realName'},
          align: 'center'
        },
        {
          title: '部门',
          dataIndex: 'deptName',
          align: 'center',
          ellipsis: true
        }
      ],
      params: {},
      rolesSelectedIndex: -1,
      tableData: [],
      fixedRoles: [],
      generalRoles: [],
      rolesData: []
    }
  },

  computed: {
    getTotalCount() {
      return this.rolesData.reduce((count, {projectTeamRoleUsers = []}) =>
        count + projectTeamRoleUsers.length, 0)
    },

    currentRole() {
      return this.rolesSelectedIndex > -1 ? this.rolesData[this.rolesSelectedIndex] : null
    }
  },
  created() {
    this.handleTeamData(this.teamData)
  },

  methods: {
    handleTeamData() {
      const data = this.teamData
      const formatRoles = (roles = [], type) => {
        return roles.map(role => ({
          ...role,
          roleType: type,
          projectTeamRoleUsers: role.projectTeamRoleUsers?.map(user => ({
            ...user,
            roleName: role.name,
            roleId: role.id,
            roleType: type
          })) || []
        }))
      }
      this.generalRoles = formatRoles(data.generalRoles, 'general')
      this.rolesData = [...this.generalRoles]

      // 确保在下一个tick更新表格数据
      this.$nextTick(() => {
        this.updateTableData()
      })
    },

    updateTableData() {
      this.tableData = this.currentRole
        ? this.currentRole.projectTeamRoleUsers
        : this.rolesData.flatMap(role => role.projectTeamRoleUsers)
    },

    rolesHandle(item, index) {
      if (this.rolesSelectedIndex === index) return

      this.rolesSelectedIndex = index
      this.updateTableData()
    },

    refreshHandle() {
      if (this.rolesSelectedIndex < 0) return

      this.rolesSelectedIndex = -1
      this.updateTableData()
    },
    addCurrentTeam(){
      this.$emit('success')
    }
  }
}
</script>

<style lang="scss" scoped>
.team-preview {
  height: 100%;
  background-color: #f3f5f8;
  box-sizing: border-box;
  padding: 20px;
  .apply-button {
    height: 48px;
    //background-color: #ffffff;
    display: flex;
    justify-content: flex-end;
    align-items: end;
  }

  .content-wrap {
    height: calc(100% - 50px);
    display: flex;
    gap: 20px;
    box-sizing: border-box;
    background: #fff;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  .left-panel {
    width: 280px;
    border-right: 1px solid #eee;

    .role-list {
      height: 100%;
      padding: 16px;
      box-sizing: border-box;

      .role-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.3s;

        &:hover {
          background: #f5f7fa;
        }

        &.active {
          background: #ecf5ff;
          color: #409eff;
        }

        &.fixed-role {
          .is-fixed {
            color: #f56c6c;
          }
        }

        i {
          font-size: 16px;
        }

        span {
          color: #909399;
          font-size: 12px;
        }
      }
    }
  }

  .right-panel {
    flex: 1;
    padding: 16px;
  }
}

.tableMember ::v-deep .bottom-flex {
  display: none;
}
</style>
