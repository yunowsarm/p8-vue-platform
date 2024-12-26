<template>
  <normal-layout>
    <template #north>
      <common-button :comp="comp"
                     :button-type="'round'"></common-button>
      <search-form-list ref="search"
                        :data-source="searchData1"
                        @search="search"
                        @re-set="reSet"></search-form-list>
    </template>
    <template #west>
      <common-tree :tree-api="treeApi"
                   @select="onSelect"></common-tree>
    </template>
    <template #center>
      <div id="table-contain">
        <common-table ref="table"
                      :comp="comp"
                      :table-config="tableConfig"
                      :columns="columns"
                      :tree="treeParams"
                      :params="queryParam"
                      :api="tableApi"
                      :table-refresh="tableRefresh"
                      :pagination="true"
                      @icon-click="iconClick">
          <template #levelParent="{ scope }">
            <span @click="levelParentClick(scope)">123456</span>
          </template>
        </common-table>
      </div>
    </template>
    <template #drawer-panel>
      <common-drawer v-if="visibleUserEditDrawer"
                     :title="drawerTitle"
                     :visible="visibleUserEditDrawer"
                     @close="onEditUserClose"
                     :size="drawerSize">
        <template #drawer>
          <user-edit v-if="drawerTitle === '新建用户' || drawerTitle === '修改用户'"
                     @saveSuccess="saveCallback"
                     @cancel="visibleUserEditDrawer = false"
                     :user-id="currUserId"
                     :current-select-dept-id="currentSelectDeptId"></user-edit>
          <user-view v-else
                     @saveSuccess="saveCallback"
                     @cancel="visibleUserEditDrawer = false"
                     :user-id="currUserId"
                     :current-select-dept-id="currentSelectDeptId"></user-view>
        </template>
      </common-drawer>
      <common-drawer v-if="visibleUserSafesetDrawer"
                     :title="drawerTitle"
                     :visible="visibleUserSafesetDrawer"
                     @close="onUserSafesetClose"
                     :size="drawerSize">
        <template #drawer>
          <user-safeset @save-Success="onUserSafesetClose"
                        :user-id="currUserId"
                        @cancel="visibleUserSafesetDrawer = false"></user-safeset>
        </template>
      </common-drawer>
    </template>
  </normal-layout>
</template>

<style scoped></style>
<script>
import Vue from 'vue'
import { P8NormalLayoutV1 as NormalLayout, P8Tree as CommonTree, P8Button as CommonButton, P8Table as CommonTable, P8Drawer as CommonDrawer, P8Search as SearchFormList } from 'p8-components-ui'

import UserEdit from './edit.vue'
import UserView from './view.vue'
import SafeSet from './safeSet.vue'

const columns = [
  {
    title: '序号',
    type: 'index',
    width: '50',
    align: 'center'
  },
  {
    title: '用户名称',
    dataIndex: 'userName',
    align: 'center'
  },
  {
    title: '真实名字',
    dataIndex: 'realName',
    align: 'center'
  },
  {
    title: '是否在线',
    dataIndex: 'onlineStatusDisplay',
    align: 'center'
  },
  {
    title: '所属部门',
    dataIndex: 'departmentName',
    width: '300',
    align: 'center'
  },
  {
    title: '操作',
    fixed: 'right',
    dataIndex: 'operation',
    width: '150',
    scopedSlots: {
      customRender: 'operation'
    },
    align: 'center'
  }
]

export default {
  name: 'UserList',
  components: {
    NormalLayout,
    CommonTree,
    CommonButton,
    CommonTable,
    CommonDrawer,
    SearchFormList,
    UserEdit,
    'user-safeset': SafeSet,
    UserView
    // 'user-edit' : httpVueLoader(base+'/framework/system/User/create.vue'),
    // 'user-safeset' : httpVueLoader(base+'/framework/system/User/safeSet.vue')
  },
  data () {
    return {
      drawerSize: '70%',
      drawerTitle: '',
      visibleUserEditDrawer: false,
      visibleUserSafesetDrawer: false,
      treeApi: 'userManager.deptTree',
      queryParam: {},
      treeParams: {},
      tableApi: 'userManager.list',
      advanced: false,
      columns: columns,
      tableHeight: 0,
      currUserId: '',
      currentSelectDeptId: '', // 当前选中的标识
      searchData1: [
        {
          type: 'text', // 控件类型
          labelText: '用户名称', // 控件显示的文本
          fieldName: 'userName',
          placeholder: '请输入用户名或姓名', // 默认控件的空值文本
          fieldEvent: {
            click: 'clickEvent(this)'
          }
        },
        {
          type: 'select',
          labelText: '用户状态',
          fieldName: 'onlineStatus',
          placeholder: '请选择用户在线状态',
          options: [],
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'USER_ONLINE_STATUS' }
          }
        },
        {
          type: 'checkbox', // 控件类型
          labelText: '已锁定', // 控件显示的文本
          fieldName: 'lockStatus',
          defaultValue: false
        }
      ],
      tableConfig: {
        // bordered: true,
        // size:'middle'
      },
      buttonConfig: {
        icon: 'edit'
      },
      comp: this
    }
  },
  mounted () {
    // this.renderHeight();
    // window.addEventListener('resize', () => {
    //     this.renderHeight();
    // })
  },
  computed: {},
  methods: {
    onSelect (node) {
      //
      this.queryParam.departmentId = node.id
      //
      this.$refs.table.searchData()
    },
    levelParentClick (record) {

    },
    tableRefresh (param) {
      param
        .then(() => {

        })
        .catch(() => {

        })
    },
    createUser () {
      this.$api['userManager.checkLicUserLimit']({}).then(res => {
        if (res == true) {
          this.currUserId = ''
          this.currentSelectDeptId = this.queryParam.departmentId
          this.drawerTitle = '新建用户'
          this.visibleUserEditDrawer = true
        } else {
          this.$message({ type: "warning", message: res })
        }
      })
    },
    updateUser (record) {

      this.currUserId = record.id
      this.drawerTitle = '修改用户'

      this.visibleUserEditDrawer = true
    },
    viewUser (record) {
      this.currUserId = record.id
      this.drawerTitle = '查看用户'
      this.visibleUserEditDrawer = true
    },
    onEditUserClose () {
      this.visibleUserEditDrawer = false
    },
    saveCallback () {

      this.$refs.table.searchData()
      this.onEditUserClose()
    },
    safeSet (record) {
      this.currUserId = record.id
      this.drawerTitle = '用户安全设置'

      this.visibleUserSafesetDrawer = true
    },
    onUserSafesetClose () {
      this.visibleUserSafesetDrawer = false
    },
    removeUser (record) {
      const that = this
      this.$confirm('是否确定要删除该人员？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          that.$api['userManager.remove']({
            id: record.id
          }).then((res) => {

            that.$refs.table.searchData()
            // if (res.data && res.data.result === 'success') {
            // that.$refs.table.refresh()
            // } else {
            // }
          })
        })
        .catch((e) => {

        })
    },
    unlockUser (record) {
      const that = this
      this.$confirm('是否要解锁该人员？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          that.$api['userManager.unlock']({
            id: record.id
          }).then((res) => {

            that.$refs.table.searchData()
          })
        })
        .catch((e) => {

        })
    },
    search (param) {
      this.queryParam = {
        ...param,
        ...(this.queryParam.departmentId
          ? {
            departmentId: this.queryParam.departmentId
          }
          : {})
      }
      // this.queryParam = newParams
      // let that = this
      // Vue.nextTick(function () {
      //   that.$refs.table.searchData()
      // })
    },
    reSet () {
      let departmentId
      if (this.queryParam.departmentId) {
        departmentId = this.queryParam.departmentId
      }
      const that = this
      Object.keys(that.queryParam).forEach((key) => {
        that.queryParam[key] = ''
      })
      if (departmentId) {
        this.queryParam.departmentId = departmentId
      }
      Vue.nextTick(function () {
        that.$refs.table.searchData()
      })
    },
    iconClick (record) {

    }
  }
}
</script>
