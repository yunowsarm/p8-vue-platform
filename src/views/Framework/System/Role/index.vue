<template>
  <list-layout>
    <template #north>
      <common-button :comp="comp"
                     button-type="primary"></common-button>
      <search-form-list ref="search"
                        :data-source="searchData"
                        @search="search"
                        @re-set="reSet"></search-form-list>
    </template>
    <template #center>
      <div id="table-contain">
        <common-table ref="table"
                      :comp="comp"
                      :columns="columns"
                      :params="queryParam"
                      :api="tableApi"
                      :table-refresh="tableRefresh"
                      :pagination="true"
                      @requested-table-data="getTotalNum"></common-table>
      </div>
    </template>
    <template #drawer-panel>
      <common-drawer v-if="visibleRoleEditDrawer"
                     :title="drawerTitle"
                     :visible="visibleRoleEditDrawer"
                     @close="onEditRoleClose"
                     size="70%">
        <template #drawer>
          <role-edit v-if="drawerTitle !== '查看角色'"
                     @saveSuccess="saveCallback"
                     @cancel="visibleRoleEditDrawer = false"
                     :role-id="currRoleId"
                     :date-number="dateNumber"></role-edit>
          <role-view v-else
                     @saveSuccess="saveCallback"
                     @cancel="visibleRoleEditDrawer = false"
                     :role-id="currRoleId"
                     :date-number="dateNumber"></role-view>
        </template>
      </common-drawer>
    </template>
  </list-layout>
</template>

<script>
import Vue from 'vue'
import { P8ListLayout as ListLayout, P8Button as CommonButton, P8Table as CommonTable, P8Drawer as CommonDrawer, P8Search as SearchFormList } from 'p8-components-ui'

import RoleEdit from './edit.vue'
import RoleView from './view.vue'
const columns = [
  {
    title: '序号',
    type: 'index',
    align: 'center',
    width: '50',
    headerAlign: 'center'
  },
  {
    title: '角色名称',
    dataIndex: 'name',
    align: 'center'
  },
  {
    title: '参与审批',
    dataIndex: 'isApprove',
    align: 'center',
    formatter: function (row) {
      if (row.isApprove === '1') {
        return '是'
      } else {
        return '否'
      }
    }
  },
  {
    title: '操作',
    fixed: 'right',
    key: 'action',
    width: 160,
    scopedSlots: {
      customRender: 'operation'
    },
    align: 'center'
  }
]
export default {
  name: 'RoleList',
  components: {
    ListLayout,
    CommonButton,
    CommonTable,
    CommonDrawer,
    SearchFormList,
    // 'common-table' : CommonTable,
    // 'common-buttons' : CommonButtons,
    // 'common-drawer' :EditDrawer,
    // 'search-form-list' : SearchFormList,
    'role-edit': RoleEdit,
    RoleView
  },
  data () {
    return {
      comp: this,
      drawerTitle: '',
      visibleRoleEditDrawer: false,
      queryParam: {},
      tableApi: 'role.list',
      currRoleId: '',
      dateNumber: 0,
      dataLength: 0,
      searchData: [
        {
          type: 'text', // 控件类型
          labelText: '角色名称', // 控件显示的文本
          fieldName: 'name',
          placeholder: '请输入角色名称', // 默认控件的空值文本
          fieldEvent: {
            click: 'clickEvent(this)'
          }
        },
        {
          type: 'radioButton', // 控件类型
          labelText: '参与审批', // 控件显示的文本
          fieldName: 'isApprove',
          options: [
            {
              label: '所有',
              value: 'all'
            },
            {
              label: '是',
              value: '1'
            },
            {
              label: '否',
              value: '0'
            }
          ]
        }
      ],
      columns: columns
    }
  },
  methods: {
    tableRefresh (param) {
      param
        .then(() => {

        })
        .catch(() => {

        })
    },
    createRole () {
      this.currRoleId = ''
      this.drawerTitle = '新建角色'
      this.dateNumber = this.dataLength + 1
      this.visibleRoleEditDrawer = true
    },
    updateRole (record) {
      this.currRoleId = record.id
      this.drawerTitle = '修改角色'
      this.visibleRoleEditDrawer = true
    },
    viewRole (record) {
      this.currRoleId = record.id
      this.drawerTitle = '查看角色'
      this.visibleRoleEditDrawer = true
    },
    onEditRoleClose () {
      this.visibleRoleEditDrawer = false
    },
    saveCallback () {
      this.$refs.table.searchData()
      this.onEditRoleClose() // 保存不关闭抽屉, 由操作人员手动关闭
    },
    removeRole (record) {
      const that = this
      this.$confirm('是否确定要删除该角色？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          that.$api['role.remove']({
            id: record.id
          }).then((res) => {

            that.$message({ type: 'success', message: '删除成功' })
            that.$refs.table.searchData()
          })
        })
        .catch((e) => {

        })
    },
    search (param) {
      const newParams = {
        ...param,
        ...(this.queryParam.roleName
          ? {
            roleName: this.queryParam.roleName
          }
          : {})
      }
      this.queryParam = newParams
      const that = this
      Vue.nextTick(function () {
        that.$refs.table.searchData()
      })
    },
    reSet () {
      const that = this
      Object.keys(that.queryParam).forEach((key) => {
        that.queryParam[key] = ''
      })
      Vue.nextTick(function () {
        that.$refs.table.searchData()
      })
    },
    getTotalNum (data) {
      const that = this
      that.dataLength = that.$refs.table.page.total
    }
  }
}
</script>
