<template>
  <list-layout>
    <template #north>
      <common-button :comp="comp"
                     button-type="primary"></common-button>
    </template>
    <template #center>
      <common-table ref="table"
                    :comp="comp"
                    :table-border="false"
                    :columns="columns"
                    :table-config="tableConfig"
                    :table-refresh="tableRefresh"
                    :pagination="false"
                    :api="tableApi"></common-table>
    </template>
    <template #drawer-panel>
      <common-drawer :title="drawerTitle"
                     :visible="drawerVisible"
                     size="50%"
                     @close="onDrawerClose">
        <template #drawer>
          <template v-if="drawerContentView === 'edit'">
            <department-edit-view @saveSuccess="saveCallback"
                                  @cancel="drawerVisible = false"
                                  :record-id="recordId"
                                  :parent-id="parentId"
                                  :no="no"></department-edit-view>
          </template>
          <template v-if="drawerContentView === 'view'">
            <department-view @saveSuccess="saveCallback"
                             @cancel="drawerVisible = false"
                             :record-id="recordId"
                             :parent-id="parentId"
                             :no="no"></department-view>
          </template>
          <template v-if="drawerContentView === 'moveuser'">
            <department-move-user-view @saveSuccess="saveCallback"
                                       @cancel="drawerVisible = false"
                                       :record-id="recordId"></department-move-user-view>
          </template>
        </template>
      </common-drawer>
    </template>
  </list-layout>
</template>

<script>
import { P8ListLayout as ListLayout, P8Button as CommonButton, P8Table as CommonTable, P8Drawer as CommonDrawer } from 'p8-components-ui'

import departmentEditView from './edit'
import departmentView from './view'
import departmentMoveUserView from './moveUser'

export default {
  name: 'DepartmentIndex',
  data () {
    return {
      columns: [
        {
          title: '部门全称',
          minWidth: 300,
          dataIndex: 'name',
          headerAlign: 'left'
        },
        {
          title: '部门简称',
          width: 300,
          dataIndex: 'deptAbbreviation',
          headerAlign: 'left'
        },
        {
          title: '部门编号',
          width: 150,
          dataIndex: 'no',
          headerAlign: 'left'
        },
        {
          title: '部门类型',
          width: 150,
          dataIndex: 'deptTypeDisplay',
          headerAlign: 'left'
        },
        {
          title: '操作',
          width: 120,
          dataIndex: 'operation',
          scopedSlots: { customRender: 'operation' },
          headerAlign: 'left'
        }
      ],
      tableApi: 'departmentManger.list',
      comp: this,
      drawerTitle: null,
      drawerVisible: false,
      drawerContentView: null,
      recordId: null,
      no: null,
      tableConfig: {
        'default-expand-all': true
      },
      parentId: null
    }
  },
  methods: {
    createDepartment () {
      this.drawerTitle = '新建部门'
      this.drawerVisible = true
      this.drawerContentView = 'edit'
      this.recordId = null
      this.parentId = null
      this.no = null
    },
    updateDepartment (record) {
      // 修改
      this.drawerTitle = '修改部门'
      this.drawerVisible = true
      this.drawerContentView = 'edit'
      this.recordId = record.id
      this.parentId = record.parentId
      this.no = record.no
    },
    viewDepartment (record) {
      // 查看
      this.drawerTitle = '查看部门'
      this.drawerVisible = true
      this.drawerContentView = 'view'
      this.recordId = record.id
      this.parentId = record.parentId
      this.no = record.no
    },
    removeDepartment (record) {
      // 删除
      console.log('removeDepartment', record)
      const that = this
      const child = record.child
      // let allUser = record.allUser
      // let parentId = record.parentId
      // let isCanDel = true
      let checkMsg = ''

      // if (parentId) {
      //   if (allUser > 0) {
      //     checkMsg = '由于该部门下或者该部门子部门下存在人员，不可被删除。'
      //     isCanDel = false
      //   } else {
      //     isCanDel = true
      //   }
      // } else {
      //   checkMsg = '根部门不可删除'
      //   isCanDel = false
      // }
      if (child > 0) {
        checkMsg = '此操作会导致子部门也被删除，确认要删除该部门吗?'
      } else {
        checkMsg = '是否确定要删除该部门？'
      }

      this.$confirm(checkMsg, '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      })
        .then(() => {
          that.$api['departmentManger.remove']({ id: record.id }).then((res) => {
            console.log('---删除部门---', res)
            that.$refs.table.searchData()
          })
        })
        .catch(() => {
          console.log('取消')
        })
    },
    moveUser (record) {
      this.drawerTitle = '部门人员转移'
      this.drawerVisible = true
      this.drawerContentView = 'moveuser'
      this.recordId = record.id
    },
    tableRefresh (param) {
      param
        .then(() => {
          console.log('table--异步成功后端做的操作')
        })
        .catch(() => {
          console.log('table--异步失败的操作')
        })
    },
    onDrawerClose () {
      // 抽屉关闭
      this.drawerVisible = false
      this.drawerContentView = null
      this.drawerTitle = null
    },
    saveCallback (res) {
      // console.log('添加或修改的回调', res)
      this.$refs.table.searchData()
      this.onDrawerClose()
    }
  },
  components: {
    ListLayout,
    CommonButton,
    CommonTable,
    CommonDrawer,
    departmentEditView,
    departmentMoveUserView,
    departmentView
  }
}
</script>

<style scoped></style>
