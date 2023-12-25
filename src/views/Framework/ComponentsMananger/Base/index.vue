<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <list-layout>
    <template #north>
      <common-button :comp="comp"
                     :button-type="'round'"
                     :custom-button-data="customButtonData"></common-button>
      <search-form-list ref="search"
                        :data-source="searchData"
                        @search="search"
                        labelWidth="100px"
                        @re-set="reSet"></search-form-list>
    </template>
    <template #center>
      <common-table ref="table"
                    :flex="200"
                    :columns="columns"
                    :params="queryParam"
                    api="formGenerator.compList"
                    :table-refresh="tableRefresh"
                    :pagination="false">
        <template #compType="{ scope }">
          <span v-if="scope.row.compType === '8001'">输入型组件</span>
          <span v-if="scope.row.compType === '8002'">选择型组件</span>
          <span v-if="scope.row.compType === '8003'">布局型组件</span>
        </template>
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
import { P8Search as SearchFormList, P8Button as CommonButton, P8ListLayout as ListLayout, P8Table as CommonTable, P8Drawer as CommonDrawer } from 'p8-components-ui'

import CompListEdit from './Components/edit'
export default {
  name: 'CompList',
  components: {
    ListLayout,
    CommonTable,
    CommonDrawer,
    SearchFormList,
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
        scopedSlots: { customRender: 'custom' },
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
      queryParam: {
        compName: '',
        compCode: ''
      },
      searchData: [
        {
          type: 'text',
          labelText: '组件名称',
          fieldName: 'compName',
          placeholder: '请输入组件名称'
        },
        {
          type: 'text',
          labelText: '组件标识',
          fieldName: 'compCode',
          placeholder: '请输入组件标识'
        },
        {
          type: 'select',
          labelText: '组件类型',
          fieldName: 'compType',
          placeholder: '请选择组件类型',
          colLayout: 'singleCol',
          options: [
            {
              label: '输入型组件',
              value: '8001'
            },
            {
              label: '选择型组件',
              value: '8002'
            },
            {
              label: '布局型组件',
              value: '8003'
            }
          ]
        }
      ],
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
