<template>
  <list-layout>
    <template #north>
      <common-button :comp="comp"
                     :custom-button-data="customButtonData"
                     :button-type="'round'"></common-button>
      <search-form-list ref="search"
                        :data-source="searchData"
                        @search="search"
                        @re-set="reSet"></search-form-list>
    </template>
    <template #center>
      <!-- kanbanView.list -->
      <common-table ref="table"
                    :flex="200"
                    :columns="columns"
                    :params="queryParam"
                    api="kanbanView.list"
                    :table-refresh="tableRefresh"
                    :pagination="true"
                    @row-dblclick="handleDblClick">
        <template #operation="{ scope }">
          <el-button type="text"
                     @click="modify(scope)">修改</el-button>
          <el-button type="text"
                     @click="remove(scope)">删除</el-button>
          <el-button type="text"
                     @click="kanbanAddress(scope.row)">看板配置地址</el-button>
          <!-- <el-button type="text" @click="enable(scope)">启用</el-button> -->
        </template>
      </common-table>
    </template>
    <template #drawer-panel>
      <common-drawer :title="drawerTitle"
                     v-if="visible"
                     :visible="visible"
                     size="100%"
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
    const kanbanUrl = 'Framework/System/KanbanDesign/kanbanView'
    const columns = [
      {
        title: '序号',
        type: 'index',
        width: '55px',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '看板编码',
        dataIndex: 'code',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '看板名称',
        dataIndex: 'name',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '描述',
        dataIndex: 'describe',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '排序号',
        dataIndex: 'indexNo',
        align: 'left',
        headerAlign: 'left',
        width: '80px'
      },
      // {
      //   title: '看板调用链接',
      //   dataIndex: 'compType',
      //   width: '180px',
      //   formatter: (row, column, cellValue, index) => {
      //     return kanbanUrl + '?id=' + row.id + '&code=' + row.code
      //   },
      //   align: 'left',
      //   headerAlign: 'left'
      // },
      {
        title: '操作',
        fixed: 'right',
        dataIndex: 'operation',
        width: '180px',
        align: 'left',
        headerAlign: 'left',
        scopedSlots: { customRender: 'custom' }
      }
    ]
    const searchData = [
      {
        type: 'text', // 组件名称
        labelText: '看板名称', // 控件显示的文本
        fieldName: 'name',
        defaultValue: '',
        placeholder: '请输入看板名称'
      },
      {
        type: 'text', // 组件名称
        labelText: '看板编码', // 控件显示的文本
        fieldName: 'code',
        defaultValue: '',
        placeholder: '请输入看板编码'
      }
    ]
    return {
      comp: this,
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
    handleDblClick (row, column, event) {
      // console.log('row, column, event>>>>>>>>', row, column, event)
      // if (column.property === 'compType') {
      //   console.log('column.formatter>>>>>>>>', column.formatter())
      // }
    },
    search (param) {
      if (param) {
        this.queryParam = param
      }
      // this.$refs.table.searchData()
    },
    reSet () {
      this.queryParam = this.$data.queryParam
      Object.keys(this.queryParam).forEach((key) => {
        this.queryParam[key] = ''
      })
      this.$refs.table.searchData()
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
      this.drawerTitle = '新建看板'
      this.visible = true
    },
    modify (scope) {
      this.record = Object.assign({}, scope.row)
      this.drawerTitle = '修改看板'
      this.visible = true
    },
    remove (scope) {
      this.$confirm(`是否确定要删除该看板？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$api['kanbanView.delete']({ id: scope.row.id }).then((res) => {
            console.log(res, '删除')
            this.$refs.table.searchData()
          })
        })
        .catch((e) => {
          console.log(e)
        })
    },
    enable (scope) { },
    compEditClose () {
      this.visible = false
      this.$refs.table.searchData()
    },
    saveCallback () {
      this.$refs.table.searchData()
      this.compEditClose()
    },
    kanbanAddress (row) {
      let url = 'Framework/System/KanbanDesign/kanbanView' + '?id=' + row.id + '&code=' + row.code
      this.$confirm(url, '看板配置地址', {
        confirmButtonText: '复制',
        showCancelButton: false,
        type: 'info'
      }).then(() => {
        (function () {
          document.oncopy = function (e) {
            e.clipboardData.setData('text', url);
            e.preventDefault();
            document.oncopy = null;
          }
        })(url);
        document.execCommand('Copy');
        this.$message({
          type: 'success',
          message: '已复制到粘贴板'
        });
      })
    }
  }
}
</script>
