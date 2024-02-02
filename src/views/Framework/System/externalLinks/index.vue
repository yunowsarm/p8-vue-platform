<template>
  <list-layout>
    <template #north>
      <common-button :comp="comp"
                     :button-config="buttonConfig"
                     :button-type="'round'"
                     :special-rote-name="roteName"></common-button>
      <search-form-list ref="search"
                        :data-source="searchData"
                        @search="search"
                        @re-set="reSet"></search-form-list>
    </template>
    <template #center>
      <div id="table-contain">
        <common-table ref="table"
                      :comp="comp"
                      :table-config="tableConfig"
                      :columns="columns"
                      :params="queryParam"
                      :api="tableApi"
                      :table-refresh="tableRefresh"
                      :pagination="true"
                      :special-rote-name="roteName"></common-table>
      </div>
    </template>
    <template #drawer-panel>
      <common-drawer v-if="visibleEditDrawer"
                     :title="drawerTitle"
                     :visible="visibleEditDrawer"
                     @close="visibleEditClose">
        <template #drawer>
          <edit @save-success="saveCallback"
                :id="id"
                :name="name"></edit>
        </template>
      </common-drawer>
    </template>
  </list-layout>
</template>
<script>
import edit from '@/views/Framework/System/externalLinks/edit'
import { P8Table as CommonTable, P8Button as CommonButton, P8Drawer as CommonDrawer, P8ListLayout as ListLayout, P8Search as SearchFormList } from 'p8-components-ui'

const columns = [
  {
    title: '序号',
    type: 'index',
    align: 'left',
    headerAlign: 'left',
    width: '50'
  },
  {
    title: '名称',
    dataIndex: 'title',
    align: 'left',
    headerAlign: 'left'
  },
  {
    title: '图标',
    dataIndex: 'icon',
    align: 'left',
    headerAlign: 'left'
  },
  {
    title: '链接地址URL',
    dataIndex: 'url',
    align: 'left',
    headerAlign: 'left'
  },
  {
    title: '是否启用',
    dataIndex: 'isEnabledDisplay',
    align: 'left',
    headerAlign: 'left',
    minWidth: 80
  },
  {
    title: '排序号',
    dataIndex: 'indexNo',
    align: 'left',
    headerAlign: 'left',
    minWidth: 80
  },
  {
    title: '操作',
    fixed: 'right',
    dataIndex: 'operation',
    scopedSlots: { customRender: 'operation' },
    align: 'left',
    headerAlign: 'left'
  }
]
export default {
  name: 'ExternalLinksList',
  components: {
    edit,
    CommonTable,
    CommonDrawer,
    ListLayout,
    CommonButton,
    SearchFormList
  },
  props: {
    roteName: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      comp: this,
      drawerTitle: '',
      visibleEditDrawer: false,
      queryParam: {},
      tableApi: 'extLink.listData',
      columns: columns,
      id: '',
      name: '',
      tableConfig: {
        defaultExpandAllRows: true
      },
      buttonConfig: {
        icon: 'edit'
      },
      searchData: [
        {
          type: 'text', // 组件名称
          labelText: '名称', // 控件显示的文本
          fieldName: 'title',
          placeholder: '请输入名称'
        }
        // {
        //   type: 'select', // 组件名称
        //   labelText: '是否启用', // 控件显示的文本
        //   fieldName: 'isEnabled',
        //   options: [
        //     {
        //       label: '启用',
        //       value: '1'
        //     },
        //     {
        //       label: '禁用',
        //       value: '0'
        //     }
        //   ]
        // }
      ]
    }
  },
  methods: {
    createExtLink () {
      this.id = ''
      this.drawerTitle = '新建'
      this.visibleEditDrawer = true
    },
    updateExtLink (record) {
      this.id = record.id
      this.name = record.name
      this.drawerTitle = '修改'
      this.visibleEditDrawer = true
    },
    deleteExtLink (record) {
      let that = this
      this.$confirm('是否确定要删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          that.$api['extLink.delete']({ id: record.id }).then((res) => {
            that.$refs.table.searchData()
            that.$message({ message: '删除成功！', type: 'success' })
          })
        })
        .catch(() => {
          that.$message({ message: '删除失败！', type: 'error' })
        })
    },
    saveCallback () {
      this.$refs.table.searchData()
      this.visibleEditClose()
    },
    visibleEditClose () {
      this.visibleEditDrawer = false
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
    search (param) {
      if (param) {
        this.queryParam = param
      }
      // this.$refs.table.searchData()
    },
    reSet () {
      let this_ = this
      Object.keys(this_.queryParam).forEach((key) => {
        this_.queryParam[key] = null
      })
      // this.$refs.table.searchData()
    }
  }
}
</script>
<style scoped></style>
