<template>
  <div>
    <form-list ref="form"
               @rendered="rendered"
               @saved="saved"
               :data-source="dataSource"
               :api="saveApi"
               :form="formData">
      <template #titleMsg>
        <el-alert :title="alertTitle"
                  type="warning"
                  :closable="false">
          <span>
            {{ description }}
          </span>
        </el-alert>
      </template>
      <template #selectUser>
        <ul class="userList">
          <li>
            <el-button class="selectedBtn"
                       type="link"
                       size="small"
                       icon="user-add"
                       @click="showModal">选择人员</el-button>
          </li>
          <li :style="itemStyle(item)"
              v-for="item in userList"
              :key="item.userId">
            <span>{{ item.realName }} [ {{ item.departmentName }} ]</span>
            <span v-if="item.isTeamManager === 1">
              <i style="color: #ec808d"
                 class="el-icon-s-custom"></i>
            </span>
            <span v-else-if="item.isTeamMember === 1">
              <i class="el-icon-s-custom"
                 @click="deleteUser(item)"></i>
              <i class="el-icon-circle-close"
                 @click="deleteUser(item)"></i>
            </span>
            <span v-else>
              <i class="el-icon-circle-close"
                 @click="deleteUser(item)"></i>
            </span>
          </li>
        </ul>
      </template>
      <template #userList>
        <el-main>
          <ul class="userList"></ul>
        </el-main>
      </template>
    </form-list>
    <select-user v-if="visible"
                 :visible="visible"
                 @close-dialog="closeModal"
                 class="userSelect"
                 :disabled-row="formData.toUserIds"></select-user>
  </div>
</template>
<script>
import { Main, Button, Alert, P8Form as FormList, P8SelectUser as SelectUser } from 'p8-components-ui'

export default {
  name: 'PermissionSetting',
  components: {
    FormList,
    'el-alert': Alert,
    'el-main': Main,
    'el-button': Button,
    SelectUser
  },
  props: {
    row: {
      type: Array,
      default: () => []
    },
    isPermissionSettingView: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      alertTitle: '',
      description: '为人员设置该项目权限后，系统的部分功能中将对目标人员开放查看统计等权限。',
      dialogHeight: 400,
      dialogConfig: {
        beforeClose: this.handleCancel,
        destroyOnClose: 'true',
        modal: false
      },
      isView: false,
      saveApi: 'ProjectInitiationManagement.permissionSettingSave',
      visible: false,
      selectedRows: [],
      otherParam: {},
      userList: [],
      dataSource: [
        {
          type: 'blank',
          labelText: '',
          slotName: 'titleMsg',
          colLayout: 'singleCol'
        },
        {
          type: 'blank',
          labelText: '',
          slotName: 'selectUser',
          colLayout: 'singleCol'
        },
        {
          type: 'blank',
          labelText: '',
          slotName: 'userList',
          colLayout: 'singleCol'
        }
      ],
      formData: {
        dataId: null,
        toUserIds: []
      },
      activePane: 'setLimit'
    }
  },
  mounted () {
    this.isView = this.isPermissionSettingView
    this.formData.dataId = this.row[0].ID
    this.alertTitle = '正在为【' + (this.row.name != null ? this.row.name : '此项目') + '】设置人员权限'
    this.rendered()
  },
  methods: {
    itemStyle (item) {
      const style = {
        float: 'left',
        margin: '5px',
        borderRadius: '3px',
        border: '1px solid #E8E8E8',
        height: '29px'
      }
      return style
    },
    rendered () {
      if (this.row[0].ID && this.row[0].ID !== '') {
        this.getPermissionSetting(this.row[0].ID)
      }
    },
    clickEvent () { },
    getPermissionSetting (ID) {
      const that = this
      this.$api['ProjectInitiationManagement.getPermissionSetting']({ dataId: ID })
        .then(function (res) {
          that.userList = res
          const selectedUserIds = res.map((u) => u.userId)
          that.formData.toUserIds = selectedUserIds
        })
        .catch(function (error) {
          console.error(error)
        })
    },
    saved (res) {
      this.$emit('saveSuccess', res)
      this.$emit('close')
      this.handleCancel()
    },
    handleChange (info) { },
    showModal () {
      this.visible = true
    },
    closeModal (selectedRows) {
      selectedRows.forEach(el => {
        el.userId = el.id
      })
      this.visible = false
      this.userList.push(...selectedRows)
      const idArr = selectedRows.map((v) => {
        return v.id
      })
      this.formData.toUserIds.push(...idArr)
    },
    deleteUser (item) {
      if (item.isTeamMember === 1) {
        this.$confirm(`该人员为项目团队成员，确定删除？`, '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.deleteUserRe(item.userId)
          })
          .catch(() => { })
      } else {
        this.deleteUserRe(item.userId)
      }
    },
    deleteUserRe (userId) {
      this.formData.toUserIds.splice(
        this.formData.toUserIds.findIndex((v) => v === userId),
        1
      )
      this.userList.splice(
        this.userList.findIndex((v) => v.userId === userId),
        1
      )
    },
    handleOk (e) { },
    handleCancel (e) {
      this.isView = false
      this.$emit('close-permissionSetting')
    }
  }
}
</script>
<style lang="scss" scoped>
.userList {
  background: #ffffff;
  overflow: hidden;
}
.userList li:first-child {
  float: left;
  margin: 5px;
  border-radius: 3px;
  height: 29px;
  border: none;
  padding: 0px;
}
.userList li:first-child .selectedBtn {
  border: 1px dashed #1890ff;
  height: 29px;
}
.userSelect ::v-deep .el-dialog__body {
  padding: 0;
  margin: 0;
  .normal-layoutV1 {
    margin: 0;
    padding: 0;
    height: 100%;
  }
}
</style>
