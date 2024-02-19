<template>
  <list-layout>
    <template #north>
      <!-- <el-button type="primary"
                 round
                 @click="edit">新建</el-button> -->
      <common-button :comp="comp"
                     :button-type="'round'"
                     :custom-button-data="customButtonData"></common-button>
      <search-form-list ref="search"
                        :dataSource="searchData"
                        @search="search"
                        @re-set="reSet"></search-form-list>
    </template>
    <template #center>
      <common-table ref="table"
                    :columns="columns"
                    :params="queryParam"
                    api="formGenerator.dataSourceList"
                    :table-refresh="tableRefresh">
        <template #operation="{ scope }">
          <el-button type="text"
                     @click="modify(scope)">修改</el-button>
          <el-button type="text"
                     @click="remove(scope)">删除</el-button>
          <el-button type="text"
                     @click="sync(scope)">同步</el-button>
        </template>
      </common-table>
    </template>
    <template #drawer-panel>
      <common-drawer :title="drawerTitle"
                     :visible="visible"
                     size="100%"
                     @close="compEditClose">
        <template #drawer>
          <comp-list-edit :record="record"
                          @cancel="compEditClose"
                          @saveSuccess="saveCallback"></comp-list-edit>
        </template>
      </common-drawer>
    </template>
  </list-layout>
</template>

<script>
import Vue from 'vue'
import { P8Search as SearchFormList, Button, P8ListLayout as ListLayout, P8Table as CommonTable, P8Drawer as CommonDrawer, P8Button as CommonButton } from 'p8-components-ui'
import CompListEdit from './Components/edit'
export default {
  name: 'DataSourceList',
  components: {
    ListLayout,
    CommonTable,
    SearchFormList,
    CommonDrawer,
    CompListEdit,
    'el-button': Button,
    CommonButton
  },
  data () {
    const columns = [
      {
        title: '类型',
        dataIndex: 'tableType',
        formatter: function (row, column, cellValue, index) {
          let date = ''
          if (cellValue === '0') {
            date = '子表'
          } else if (cellValue === '1') {
            date = '主表'
          }
          return date
        },
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '数据源名称',
        dataIndex: 'tableName'
      },
      {
        title: '描述',
        dataIndex: 'tableDesc',
        align: 'left'
      },
      {
        title: '状态',
        dataIndex: 'isDbSynch', // 是否同步
        formatter: function (row, column, cellValue, index) {
          let date = ''
          if (cellValue === '0') {
            date = '未同步'
          } else if (cellValue === '1') {
            date = '已同步'
          }
          return date
        },
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '创建时间',
        dataIndex: 'itemCreateTime',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '操作',
        fixed: 'right',
        dataIndex: 'operation',
        width: 120,
        scopedSlots: { customRender: 'custom' },
        align: 'left',
        headerAlign: 'left'
      }
    ]
    return {
      comp: this,
      columns: columns,
      searchData: [
        {
          type: 'text',
          labelText: '数据源名称',
          fieldName: 'tableName',
          placeholder: '请输入数据源名称'
        },
        {
          type: 'text',
          labelText: '描述',
          fieldName: 'tableDesc',
          placeholder: '请输入描述'
        },
        {
          type: 'select',
          labelText: '表单类型',
          fieldName: 'tableType',
          placeholder: '下拉选择你要的',
          options: [
            {
              label: '单表',
              value: '0'
            },
            {
              label: '主表',
              value: '1'
            },
            {
              label: '子表',
              value: '2'
            }
          ]
        },
        {
          type: 'select',
          labelText: '状态',
          fieldName: 'isDbSynch',
          placeholder: '下拉选择你要的',
          options: [
            {
              label: '未同步',
              value: '0'
            },
            {
              label: '已同步',
              value: '1'
            }
          ]
        }
      ],
      queryParam: {},
      visible: false,
      drawerTitle: '',
      record: {},
      customButtonData: [
        {
          id: 'btn-001',
          enable: '1',
          indexNumber: 1,
          eventHandle: 'edit',
          image: 'fdddfont icon-add-new',
          title: '新建',
          location: 'head'
        }
      ]
    }
  },
  methods: {
    tableRefresh (param) {
      param
        .then(() => {
          console.log('异步成功后端做的操作')
        })
        .catch(() => {
          console.log('异步失败的操作')
        })
    },
    search (param) {
      let that = this
      if (param) {
        that.queryParam = param
      }
    },
    reSet () {
      let that = this
      Object.keys(that.queryParam).forEach(key => { that.queryParam[key] = null })
    },
    edit () {
      this.record.id = ''
      this.drawerTitle = '新建数据源'
      this.visible = true
    },
    modify (scope) {
      this.record = Object.assign({}, scope.row)
      this.drawerTitle = '修改数据源'
      this.visible = true
    },
    remove (scope) {
      const that = this
      if (scope.row.isDbSynch === '1') {
        return this.$message.warning('已同步的数据源不能删除')
      }
      this.$confirm('是否确定要删除该数据源？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          that.$api['formGenerator.dataSourceRemove']({
            ids: [scope.row.id]
          }).then((res) => {
            console.log(res, '删除')
            that.$refs.table.searchData()
            that.$message({
              message: '删除成功！',
              type: 'success'
            })
          })
        })
        .catch((e) => {
          console.log(e)
        })
    },
    sync (scope) {
      const that = this
      this.$confirm('是否确定要同步该数据源？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          that.$api['formGenerator.dataSourceSync']({
            ids: [scope.row.id]
          }).then((res) => {
            console.log(res, '同步')
            if (res) {
              that.$refs.table.searchData()
              that.$message({
                message: '同步成功！',
                type: 'success'
              })
            } else {
              that.$message({
                message: '同步失败，请检查表或字段！',
                type: 'warning'
              })
            }
          })
        })
        .catch((e) => {
          console.log(e)
        })
    },
    compEditClose () {
      this.visible = false
      this.record = {
        id: ''
      }
    },
    saveCallback () {
      this.$refs.table.searchData()
      this.compEditClose()
    }
  }
}
</script>
