<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <list-layout>
    <template #north>
      <common-button :comp="comp"
                     :button-type="'round'"
                     :custom-button-data="customButtonData"></common-button>
    </template>
    <template #center>
      <common-table ref="table"
                    :flex="200"
                    :columns="columns"
                    api="formGenerator.compList"
                    :table-refresh="tableRefresh"
                    :pagination="false">
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
                     size="50%"
                     @close="compEditClose">
        <template #drawer>
          <comp-list-edit :record="record"
                          @cancel="visible = false"
                          @saveSuccess="saveCallback"></comp-list-edit>
        </template>
      </common-drawer>
    </template>
  </list-layout>
</template>

<script>
import { P8Button as CommonButton, P8ListLayout as ListLayout, P8Table as CommonTable, P8Drawer as CommonDrawer } from 'p8-components-ui'

import CompListEdit from './Components/edit'
export default {
  name: 'CompList',
  components: {
    ListLayout,
    CommonTable,
    CommonDrawer,
    CompListEdit,
    CommonButton
  },
  data () {
    const columns = [
      {
        title: '组件名称',
        dataIndex: 'compName',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '组件标识',
        dataIndex: 'compCode',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '启用状态',
        dataIndex: 'compStatusDisplay',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '组件类型',
        dataIndex: 'compType',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: 'ICON',
        dataIndex: 'compIcon',
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
      customButtonData: [
        {
          'id': 'btn-001',
          'enable': '1',
          'indexNumber': 1,
          'eventHandle': 'edit',
          'image': 'fdddfont icon-add-new',
          'title': '新建',
          'location': 'head'
        }
      ],
      columns: columns,
      visible: false,
      drawerTitle: '',
      record: {}
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
    edit () {
      this.record.id = ''
      this.drawerTitle = '新建组件'
      this.visible = true
    },
    modify (scope) {
      this.record = Object.assign({}, scope.row)
      this.drawerTitle = '修改组件'
      this.visible = true
    },
    remove (scope) {
      let that = this
      this.$confirm('是否确定要删除该组件？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          that.$api['formGenerator.compRemove']({
            ids: [scope.row.id]
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
    compEditClose () {
      this.visible = false
    },
    saveCallback () {
      this.$refs.table.searchData()
      this.compEditClose()
    }
  }
}
</script>
