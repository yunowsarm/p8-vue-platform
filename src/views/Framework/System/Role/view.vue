<template>
  <div>
    <form-list ref="form"
               @rendered="rendered"
               @saved="saved"
               :data-source="dataSource"
               :api="saveApi"
               :existDefaultBtn="false"
               :existCustomBtn="true"
               :form="formData">
      <template #customBtn>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </form-list>
    <template>
      <el-tabs type="border-card"
               class="w_tabs"
               v-model="activePane">
        <el-tab-pane label="权限详情"
                     :style="{height: tabPaneHeight}"
                     name="setLimit"
                     key="1">
          <select-btn ref="selectBtn"
                      :button-selected="selectedData.resourceList"></select-btn>
        </el-tab-pane>
        <el-tab-pane label="人员详情"
                     :style="{height: tabPaneHeight}"
                     name="setUser"
                     key="2">
          <div :style="{ height: setUserHeight, overflowY: 'auto' }">
            <el-main>
              <ul class="userList">
                <li v-for="item in selectedData.userList"
                    :key="item.id">
                  <span>{{ item.realName }} [ {{ item.departmentName }} ]</span>
                </li>
              </ul>
            </el-main>
          </div>
        </el-tab-pane>
        <el-tab-pane label="应用详情"
                     :style="{height: tabPaneHeight}"
                     name="setApp"
                     key="3">
          <el-tabs :key="dateTime"
                   :style="{ height: flexHeight }"
                   tab-position="left"
                   @tab-click="tabClick"
                   v-model="activeType">
            <template v-for="(item, index) in activeTabs">
              <el-tab-pane :key="index">
                <span slot="label"><i :class="item.icon"></i> {{ item.meaning }}</span>
                <el-col :style="{ height: tabPaneHeight }"
                        style="overflow: auto">
                  <div class="nav-display"
                       :key="formData.appIds.length">
                    <div class="nav-ul"
                         v-for="(item, index) in adhibitionList"
                         :key="index"
                         @click="handleAdhibitionClick(item)">
                      <div class="nav-span"
                           style="height: 100%;"
                           :class="{ active: item.isActive }">
                        <div style="height: 40%;">
                          <el-image style="width: 60px; height: 60px"
                                    :src="imgUrl"
                                    fit="cover"></el-image>
                        </div>
                        <span style="height: 60%;"
                              class="nav-text"
                              v-text="item.name"></span>
                      </div>
                    </div>
                  </div>
                </el-col>
              </el-tab-pane>
            </template>
          </el-tabs>
        </el-tab-pane>
        <el-tab-pane label="项目详情"
                     :style="{height: tabPaneHeight}"
                     name="setProject"
                     key="4">
          <el-col :style="{ height: flexHeight }"
                  style="overflow: auto">
            <form-list ref="form1"
                       :data-source="projectDataSource"
                       :form="formData"
                       :exist-default-btn="false"></form-list>
          </el-col>
        </el-tab-pane>
      </el-tabs>
    </template>
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
  justify-content: flex-start;
  align-items: center;
}
.nav-ul {
  width: 20%;
  margin: 15px 17px;
}
.nav-span {
  width: 100%;
  border: 1px solid #ccc;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 5px;
  cursor: pointer;
  padding: 10px;
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
  margin-left: 10px;
  // line-height: 50px;
}
.w_tabs {
  margin: 16px;
}
::v-deep .el-tabs--border-card > .el-tabs__content {
  padding: 0;
}
::v-deep .el-tabs--border-card .el-tabs__nav-scroll {
  background: #ffffff;
}
::v-deep .el-form-item__content > .view {
  background: #f5f8fb;
}
</style>
<script>
import { Tabs, TabPane, Main, Button, Dropdown, DropdownMenu, DropdownItem, P8Form as FormList, P8SelectUser as SelectUser } from 'p8-components-ui'

import SelectBtn from './SelectButtonsView.vue'

export default {
  name: 'RoleView',
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
  data () {
    return {
      imgUrl: require('@/assets/image/common/Group.png'),
      setUserHeight: document.documentElement.clientHeight - 318 + 'px',
      tabPaneHeight: document.documentElement.clientHeight - 290 + 'px',
      saveApi: 'role.save',
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
          type: 'view', // 控件类型
          labelText: '角色名称', // 控件显示的文本
          fieldName: 'name',
          placeholder: '', // 默认控件的空值文本
          colLayout: 'singleCol'
        },
        {
          labelText: '参与审批',
          type: 'view',
          fieldName: 'isApprove',
          colLayout: 'doubleCol'
        },
        {
          labelText: '排序',
          type: 'view',
          fieldName: 'indexNo',
          placeholder: '',
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
          colLayout: 'singleCol',
          fieldConfig: {
            disabled: true
          }
        }
      ],
      activePane: 'setLimit',
      activeType: '',
      adhibitionList: [],
      activeTabs: [],
      flexHeight: document.documentElement.clientHeight - 318 + 'px',
      dateTime: null
    }
  },
  async created () {
    const that = this
    await this.$api['dictionaryManagement.list']({ dicType: 'SELECT_TYPE' }).then((res) => {
      if (res && res.length) {
        that.activeTabs = res
        that.activeTabs.unshift(
          {
            meaning: '全部',
            value: null,
            icon: 'el-icon-house'
          }
        )
      }
    })
    await this.getType(null)
  },
  mounted () {
    window.addEventListener('resize', () => {
      this.setUserHeight = document.documentElement.clientHeight - 267 + 'px'
    })
  },
  methods: {
    tabClick () {
      if (this.activeType === '0') {
        this.activeType = null
        this.getType(this.activeType)
      } else {
        this.getType(this.activeTabs[this.activeType].id)
      }
    },
    async getType (val) {
      const that = this
      that.adhibitionList = []
      await this.$api['kanbanComponent.getNoPage']({ availableEndUsers: 1, classification: val }).then((res) => {
        if (res && res.length) {
          res.forEach((el) => {
            el.isActive = false
            that.adhibitionList = res
            that.dateTime = new Date().getTime()
          })
        }
      })
      if (this.roleId && this.roleId !== '') {
        await this.getRoleData(this.roleId)
      } else {
        this.formData.indexNo = this.dateNumber
      }
    },
    rendered () { },
    cancel () {
      this.$emit('cancel')
    },
    clickEvent () {
      console.log('click')
    },
    getRoleData (roleId) {
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
          if (that.formData.isApprove === '0') {
            that.formData.isApprove = '否'
          } else {
            that.formData.isApprove = '是'
          }

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
    saved (res) {
      this.$emit('saveSuccess', res)
    }
  }
}
</script>
