<template>
  <list-layout>
    <template #north>
      <common-button :comp="comp"
                     button-type="primary"></common-button>
      <search-form-list ref="search"
                        label-width="100px"
                        :data-source="searchData"
                        :addFuzzySearch="true"
                        @search="search"
                        @re-set="reSet"></search-form-list>
    </template>
    <template #center>
      <!-- <common-table ref="table"
                    :comp="comp"
                    :table-border="false"
                    :columns="columns"
                    :table-config="tableConfig"
                    :table-refresh="tableRefresh"
                    :pagination="false"
                    :api="tableApi">
      </common-table> -->
      <vxe-table ref="table"
                 :comp="comp"
                 :columns="columns"
                 :customHeight="customHeight"
                 :table-config="tableConfig"
                 :row-config="{ isHover: true }"
                 :params="queryParam"
                 :pagination="false"
                 :api="tableApi"
                 :tree-config="treeConfig">
      </vxe-table>
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
import { P8Search as SearchFormList, P8ListLayout as ListLayout, P8Button as CommonButton, P8VxeTable as VxeTable, P8Drawer as CommonDrawer } from 'p8-components-ui'

import departmentEditView from './edit'
import departmentView from './view'
import departmentMoveUserView from './moveUser'

export default {
  name: 'DepartmentIndex',
  data () {
    return {
      customHeight: document.documentElement.clientHeight - 160,
      queryParam: {},
      treeConfig: {
        transform: true,
        expandAll: true,
        rowField: 'id',
        parentField: 'parentId'
      },
      searchData: [
        {
          type: 'text',
          labelText: '部门名称',
          fieldName: 'name',
          placeholder: '请输入部门名称',
          colLayout: 'singleCol'
        },
        {
          type: 'text',
          labelText: '部门简称',
          fieldName: 'deptAbbreviation',
          placeholder: '请输入部门简称',
          colLayout: 'singleCol'
        },
        {
          type: 'text',
          labelText: '部门编码',
          fieldName: 'no',
          placeholder: '请输入部门编码',
          colLayout: 'singleCol'
        }
      ],
      columns: [
        {
          title: '部门名称',
          minWidth: 300,
          dataIndex: 'name',
          headerAlign: 'left',
          treeNode: true,
        },
        {
          title: '部门简称',
          width: 300,
          dataIndex: 'deptAbbreviation',
          headerAlign: 'left'
        },
        {
          title: '部门编码',
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
          fixed: 'right',
          width: 160,
          dataIndex: 'operation',
          scopedSlots: { customRender: 'operation' },
          align: 'center',
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
    reSet () {
      const this_ = this
      Object.keys(this_.queryParam).forEach((key) => {
        this_.queryParam[key] = null
      })
      Vue.nextTick(function () {
        this_.$refs.table.searchData()
      })
    },
    search (searchData) {
      this.queryParam = searchData
    },
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
            that.$message({ type: 'success', message: '删除成功' })
            that.$refs.table.searchData()
          })
        })
        .catch(() => {
          that.$message({ message: '删除失败！', type: 'error' })
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

        })
        .catch(() => {

        })
    },
    onDrawerClose () {
      // 抽屉关闭
      this.drawerVisible = false
      this.drawerContentView = null
      this.drawerTitle = null
    },
    saveCallback (res) {
      //
      this.$refs.table.searchData()
      this.onDrawerClose()
    }
  },
  components: {
    ListLayout,
    CommonButton,
    VxeTable,
    CommonDrawer,
    departmentEditView,
    departmentMoveUserView,
    departmentView,
    SearchFormList
  }
}
</script>

<style scoped></style>
