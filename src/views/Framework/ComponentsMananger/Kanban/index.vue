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
                        @re-set="reSet"></search-form-list>
    </template>
    <template #center>
      <common-table ref="table"
                    :flex="150"
                    :columns="columns"
                    :params="queryParam"
                    api="kanbanComponent.list"
                    :table-refresh="tableRefresh"
                    :pagination="true">
        <template #functionalCategory="{scope}">
          <span v-if="scope.row.functionalCategory == '1'">自定义</span>
          <span v-if="scope.row.functionalCategory == '2'">ECharts渲染器</span>
          <span v-if="scope.row.functionalCategory == '3'">表格渲染器</span>
          <span v-if="scope.row.functionalCategory == '4'">AntV_G2图表渲染器</span>
        </template>
        <template #operation="{scope}">
          <el-button type="text"
                     @click="modify(scope)">修改</el-button>
          <el-button type="text"
                     @click="remove(scope)">删除</el-button>
          <!-- <el-button type="text"
                     @click="enable(scope)">启用</el-button> -->
        </template>
      </common-table>
    </template>
    <template #drawer-panel>
      <common-drawer :title="drawerTitle"
                     :visible="visible"
                     size="60%"
                     @close="compEditClose">
        <template #drawer>
          <comp-list-edit :record="record"
                          @saveSuccess="saveCallback"></comp-list-edit>
        </template>
      </common-drawer>
    </template>
  </list-layout>
</template>

<script>
import { P8Button as CommonButton, P8ListLayout as ListLayout, P8Table as CommonTable, P8Drawer as CommonDrawer, P8Search as SearchFormList } from 'p8-components-ui'

import CompListEdit from './Components/edit'

export default {
  name: 'CompList',
  components: {
    ListLayout,
    CommonTable,
    CommonDrawer,
    CompListEdit,
    SearchFormList,
    CommonButton
  },
  data () {
    const columns = [
      {
        title: '序号',
        type: 'index',
        width: 60,
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '组件名称',
        dataIndex: 'name',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '功能类别',
        dataIndex: 'functionalCategory',
        align: 'left',
        headerAlign: 'left',
        scopedSlots: { customRender: 'custom' },
      },
      {
        title: '业务分类',
        dataIndex: 'classificationDisPlay',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '是否终端用户可用',
        dataIndex: 'availableEndUsersDisplay',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '排序号',
        dataIndex: 'indexNo',
        align: 'left',
        headerAlign: 'left'
      },
      // {
      //   title: '状态',
      //   dataIndex: 'state',
      //   align: 'left',
      //   headerAlign: 'left'
      // },
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
    const searchData = [
      {
        type: 'text', // 组件名称
        labelText: '组件名称', // 控件显示的文本
        fieldName: 'name',
        defaultValue: '',
        placeholder: '请输入组件名称'
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
      searchData: searchData,
      columns: columns,
      queryParam: {
        name: ''
      },
      visible: false,
      drawerTitle: '',
      record: {}
    }
  },
  methods: {
    search (param) {
      if (param) {
        this.queryParam = param
      }
    },
    reSet () {
      Object.keys(this.queryParam).forEach(key => { this.queryParam[key] = '' })
    },
    tableRefresh (param) {
      param.then(() => {
        console.log('异步成功后端做的操作')
      }).catch(() => {
        console.log('异步失败的操作')
      })
    },
    edit () {
      this.record = {}
      this.drawerTitle = '新建组件'
      this.visible = true
    },
    modify (scope) {
      this.record = { ...scope.row, ...{} }
      this.drawerTitle = '修改组件'
      this.visible = true
    },
    remove (scope) {
      this.$confirm(`是否确定要删除该组件？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$api['kanbanComponent.delete']({
          ids: [scope.row.id]
        }).then(res => {
          this.$refs.table.searchData()
        })
      }).catch((e) => { console.log(e) })
    },
    enable (scope) {

    },
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
