<template>
  <list-layout>
    <template #north>
      <common-button :comp="comp"
                     :button-type="'round'"
                     :custom-button-data="customButtonData"></common-button>
    </template>
    <template #center>
      <common-table ref="table"
                    :columns="columns"
                    api="formGenerator.sqlList"
                    :table-refresh="tableRefresh">
        <template #operation="{ scope }">
          <el-button type="text"
                     @click="modify(scope)">修改</el-button>
          <el-button type="text"
                     @click="remove(scope)">删除</el-button>
          <!-- <el-button type="text" @click="enable(scope)">启用</el-button> -->
        </template>
      </common-table>
    </template>
    <template #drawer-panel>
      <common-drawer :title="drawerTitle"
                     :visible="visible"
                     size="100%"
                     @close="sqlEditClose">
        <template #drawer>
          <sql-list-edit :record="record"
                          @cancel="sqlEditClose"
                         @saveSuccess="saveCallback"
                         :table-list="tableList"></sql-list-edit>
        </template>
      </common-drawer>
    </template>
  </list-layout>
</template>

<script>
import { Button, P8ListLayout as ListLayout, P8Table as CommonTable, P8Drawer as CommonDrawer, P8Button as CommonButton } from 'p8-components-ui'

import SqlListEdit from './Components/edit'
export default {
  name: 'SqlList',
  components: {
    ListLayout,
    CommonTable,
    CommonDrawer,
    SqlListEdit,
    'el-button': Button,
    CommonButton
  },
  data () {
    const columns = [
      {
        title: 'SQL编码',
        dataIndex: 'code',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: 'SQL名字',
        dataIndex: 'name'
      },
      {
        title: 'SQL正文',
        dataIndex: 'sql',
        width: 360
      },
      {
        title: '动态数据源',
        dataIndex: 'dbSource',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '描述',
        dataIndex: 'content',
        align: 'left',
        headerAlign: 'left'
      },
      // {
      //   title: '修改人id',
      //   dataIndex: 'updateBy'
      // },
      // {
      //   title: '创建人id',
      //   dataIndex: 'createBy'
      // },
      {
        title: '创建时间',
        dataIndex: 'itemCreateTime',
        width: 150,
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '修改时间',
        dataIndex: 'itemModifyTime',
        width: 150,
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '操作',
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
      visible: false,
      drawerTitle: '',
      record: {},
      tableList: [],
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
        .then((res) => {
          this.tableList = res.records
          console.log('异步成功后端做的操作')
        })
        .catch(() => {
          console.log('异步失败的操作')
        })
    },
    edit () {
      this.record.id = ''
      this.drawerTitle = '新建SQL'
      this.visible = true
    },
    modify (scope) {
      this.record = Object.assign({}, scope.row)
      this.drawerTitle = '修改SQL'
      this.visible = true
    },
    remove (scope) {
      let that = this
      this.$confirm('是否确定要删除该sql？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          that.$api['formGenerator.sqlRemove']({
            sqlId: scope.row.id
          }).then((res) => {
            console.log(res, '删除')
            that.$refs.table.searchData()
          })
        })
        .catch((e) => {
          console.log(e)
        })
    },
    enable (scope) { },
    sqlEditClose () {
      this.visible = false
    },
    saveCallback () {
      this.$refs.table.searchData()
      this.sqlEditClose()
    }
  }
}
</script>
