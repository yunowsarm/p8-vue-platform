<template>
  <div>
    <form-list
ref="form" @rendered="rendered" @saved="saved" :data-source="dataSource" :api="saveApi" :form="formData">
      <template slot="btn">
        <el-button @click="cancel">取 消</el-button>
      </template>
    </form-list>
    <template>
      <el-tabs
type="border-card" class="w_tabs" v-model="activePane">
        <el-tab-pane
label="设置权限" name="setLimit" key="1">
          <select-btn
ref="selectBtn" @btn-select-change="btnSelectChange" :button-selected="selectedData.resourceList"></select-btn>
        </el-tab-pane>
        <el-tab-pane
label="设置人员" name="setUser" key="2">
          <div :style="{ height: setUserHeight, overflowY: 'auto' }">
            <el-main>
              <ul class="userList">
                <li>
                  <el-button
class="selectedBtn" type="link" size="small" icon="user-add" @click="showModal">选择人员</el-button>
                </li>
                <li
v-for="item in selectedData.userList" :key="item.id">
                  <span>{{ item.realName }} [ {{ item.departmentName }} ]</span>
                  <i
class="el-icon-circle-close" @click="deleteUser(item.id)"></i>
                </li>
              </ul>
            </el-main>
            <select-user
v-if="visible" :visible="visible" @close-dialog="closeModal" :disabled-row="formData.sysuserIds"></select-user>
          </div>
        </el-tab-pane>
        <el-tab-pane
label="设置应用" name="setApp" key="3">
          <el-col
:style="{ height: flexHeight }" style="overflow: auto">
            <div
class="nav-display" :key="formData.appIds.length">
              <div
class="nav-ul" v-for="(item, index) in adhibitionList" :key="index" @click="handleAdhibitionClick(item)">
                <div
class="nav-span" :class="{ active: item.isActive }">
                  <span
class="nav-text" v-text="item.name"></span>
                </div>
              </div>
            </div>
          </el-col>
        </el-tab-pane>
        <el-tab-pane
label="设置项目" name="setProject" key="4">
          <el-col
:style="{ height: flexHeight }" style="overflow: auto">
            <form-list
ref="form1" :data-source="projectDataSource" :form="formData" :exist-default-btn="false"></form-list>
          </el-col>
        </el-tab-pane>
      </el-tabs>
    </template>
    <el-dropdown
v-if="activePane === 'setLimit'" size="mini" split-button type="primary" trigger="click" style="margin-top: 10px; margin-left: 10px">
      关联操作
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item @click.native="allSelect()">全部勾选</el-dropdown-item>
        <el-dropdown-item @click.native="unAllSelect()">取消全选</el-dropdown-item>
        <el-dropdown-item @click.native="relate()">父子关联</el-dropdown-item>
        <el-dropdown-item @click.native="unRelate()">取消关联</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>
<style lang="scss" scoped>
.userList {
  background: #ffffff;
  overflow: hidden;
}
.userList li {
  float: left;
  padding: 5px 10px;
  margin: 5px;
  border-radius: 3px;
  /*border:1px solid #1890FF;*/
  border: 1px solid #e8e8e8;
}
.userList li:first-child {
  border: none;
  padding: 0px;
}
.userList li:first-child .selectedBtn {
  border: 1px dashed #1890ff;
  height: 29px;
}
::v-deep .el-tabs__nav-wrap {
  margin-bottom: 0;
}
.nav-display {
  display: flex;
  flex-direction: row;
  flex-flow: wrap;
  margin-left: 10px;
  justify-content: flex-start;
}
.nav-ul {
  width: 18%;
  margin: 20px 7px;
}
.nav-span {
  width: 100%;
  border: 1px solid #ccc;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  cursor: pointer;
}
.active {
  border: 1px solid #1bbf9e;
  -webkit-box-shadow: #666 0px 0px 10px;
  -moz-box-shadow: #666 0px 0px 10px;
  box-shadow: #666 0px 0px 10px;
  position: relative;
}
.active:after {
  content: ' ';
  border-width: 15px;
  border-style: solid;
  border-top-color: #1bbf9e;
  border-right-color: #1bbf9e;
  border-left-color: transparent;
  border-bottom-color: transparent;
  position: absolute;
  top: 0px;
  right: 0px;
  border-top-right-radius: 8px;
}
.nav-text {
  font-size: pxTorem(16px);
  line-height: 50px;
}
.w_tabs {
  margin: 16px;
}
</style>
<script>
import { Tabs, TabPane, Main, Button, Dropdown, DropdownMenu, DropdownItem, P8Form as FormList, P8SelectUser as SelectUser } from 'p8-components-ui'

import SelectBtn from './SelectButtons.vue'

export default {
  name: 'RoleEdit',
  components: {
    FormList,
    'el-tabs': Tabs,
    'el-tab-pane': TabPane,
    'el-main': Main,
    'el-button': Button,
    // 'form-list' : FormList,
    // 'select-user' : httpVueLoader('components/CommonFunction/SelectUser.vue'),
    'select-btn': SelectBtn,
    SelectUser,
    'el-dropdown-menu': DropdownMenu,
    'el-dropdown-item': DropdownItem,
    'el-dropdown': Dropdown
  },
  props: {
    roleId: {
      type: String,
      default: ''
    },
    dateNumber: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      setUserHeight: document.documentElement.clientHeight - 318 + 'px',
      saveApi: 'role.save',
      visible: false,
      selectedRows: [],
      // selectedRowKeys:[],
      // disabledRow:[],
      // userIds:[],
      otherParam: {
        sysuserIds: [],
        buttonIds: []
      },
      selectedData: {
        resourceList: [],
        userList: [],
        appList: []
      },
      dataSource: [
        {
          type: 'text', // 控件类型
          labelText: '角色名称', // 控件显示的文本
          fieldName: 'name',
          placeholder: '请输入角色名称', // 默认控件的空值文本
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              maxLength: 15
            },
            {
              validator: (rule, value, callback) => {
                const that = this
                this.$api['role.repeatedCheck']({ id: that.formData.id, name: value }).then((response) => {
                  if (response.result) {
                    callback(new Error('角色名称已被使用！'))
                  } else {
                    callback()
                  }
                })
              },
              trigger: 'blur'
            }
          ]
        },
        {
          labelText: '参与审批',
          type: 'radioButton',
          fieldName: 'isApprove',
          colLayout: 'doubleCol',
          options: [
            {
              label: '是',
              value: '1'
            },
            {
              label: '否',
              value: '0'
            }
          ]
        },
        {
          labelText: '排序',
          type: 'number',
          fieldName: 'indexNo',
          placeholder: '请输入排序号',
          colLayout: 'doubleCol'
        }
      ],
      formData: {
        id: null,
        name: null,
        indexNo: null,
        isApprove: null,
        sysuserIds: [],
        appIds: [],
        resourceIds: [],
        authorityTypes: []
      },
      projectDataSource: [
        {
          type: 'checkboxGroup',
          labelText: '项目权限',
          fieldName: 'authorityTypes',
          options: [
            { label: '所有项目', value: '1' },
            { label: '部门项目', value: '2' },
            { label: '所属人项目', value: '3' }
          ],
          colLayout: 'singleCol'
        }
      ],
      activePane: 'setLimit',
      adhibitionList: [],
      flexHeight: document.documentElement.clientHeight - 318 + 'px'
    }
  },
  async created() {
    const that = this
    await this.$api['kanbanComponent.getNoPage']({ availableEndUsers: 1 }).then((res) => {
      if (res && res.length) {
        res.forEach((el) => {
          el.isActive = false
          that.adhibitionList = res
        })
      }
    })
    if (this.roleId && this.roleId !== '') {
      await this.getRoleData(this.roleId)
    } else {
      this.formData.indexNo = this.dateNumber
    }
  },
  mounted() {
    window.addEventListener('resize', () => {
      this.setUserHeight = document.documentElement.clientHeight - 267 + 'px'
    })
  },
  methods: {
    rendered() {},
    cancel() {
      this.$emit('cancel')
    },
    clickEvent() {
      console.log('click')
    },
    getRoleData(roleId) {
      const that = this
      this.$api['role.getAllRole']({ id: roleId })
        .then(function (res) {
          if (res.appList && res.appList.length)
            that.adhibitionList.forEach((el) => {
              res.appList.forEach((val) => {
                if (el.id == val) {
                  el.isActive = true
                  that.formData.appIds.push(el.id)
                }
              })
            })
          const { id, name, indexNo, isApprove, authorityTypes, userList = [], resourceList = [], appList = [] } = res
          that.formData = { ...that.formData, id, name, indexNo, isApprove }

          const selectedUserIds = userList.map((u) => u.id)
          that.formData.sysuserIds = selectedUserIds
          that.formData.resourceIds = resourceList
          that.formData.authorityTypes = authorityTypes
          that.selectedData = { ...that.selectedData, userList, resourceList, appList }
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    saved(res) {
      this.$emit('saveSuccess', res)
    },
    handleChange(info) {
      console.log(info, 'info')
    },
    showModal() {
      this.visible = true
    },
    closeModal(selectedRows) {
      this.visible = false
      this.selectedData.userList.push(...selectedRows)
      // this.selectedRows.push(...selectedRows)
      const idArr = selectedRows.map((v) => {
        return v.id
      })
      this.formData.sysuserIds.push(...idArr)
      // this.otherParam.sysuserIds.push(...idArr)
    },
    deleteUser(id) {
      this.formData.sysuserIds.splice(
        this.formData.sysuserIds.findIndex((v) => v === id),
        1
      )
      // this.otherParam.sysuserIds.splice(this.otherParam.sysuserIds.findIndex(v => v === id), 1)
      this.selectedData.userList.splice(
        this.selectedData.userList.findIndex((v) => v.id === id),
        1
      )
      // this.selectedRows.splice（(this.selectedRows.findIndex(v => v.id === id), 1)
    },
    btnSelectChange(selectedRes) {
      this.$set(this.formData, 'resourceIds', selectedRes)
      // this.formData.resourceIds = selectedRes
    },
    unAllSelect() {
      this.$refs.selectBtn.unCheckAll()
    },
    allSelect() {
      this.$refs.selectBtn.checkAll()
    },
    relate() {
      this.$refs.selectBtn.relate()
    },
    unRelate() {
      this.$refs.selectBtn.unRelate()
    },
    handleAdhibitionClick(row) {
      row.isActive = !row.isActive
      if (row.isActive) {
        this.formData.appIds.push(row.id)
      } else {
        this.formData.appIds = this.formData.appIds.filter((id) => id !== row.id)
      }
    }
  }
}
</script>
