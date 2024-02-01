<template>
  <list-layout>
    <template #north>
      <common-button :comp="comp"
                     :button-config="buttonConfig"
                     :special-rote-name="roteName"
                     :button-type="'round'"></common-button>
    </template>
    <template #center>
      <common-table ref="table"
                    :comp="comp"
                    :flex="200"
                    :columns="columns"
                    :params="queryParams"
                    :api="tableApi"
                    :special-rote-name="roteName"></common-table>
    </template>
    <template #drawer-panel>
      <common-drawer :title="drawerTitle"
                     :visible="visibleEdit"
                     size="50%"
                     @close="onEditClose">
        <template #drawer>
          <edit :record="record"
                @save-success="saveSuccess"></edit>
        </template>
      </common-drawer>
    </template>
  </list-layout>
</template>
<style lang="scss" scoped>
// ::v-deep.el-table__fixed-body-wrapper {
//   top: 41px !important;
// }
</style>
<script>
import { P8ListLayout as ListLayout, P8Table as CommonTable, P8Button as CommonButton, P8Drawer as CommonDrawer } from 'p8-components-ui'
import edit from './Components/edit.vue'
export default {
  name: 'LogConfig',
  data () {
    const columns = [
      {
        title: '序号',
        type: 'index',
        width: '50',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '接口类路径',
        dataIndex: 'classPath',
        minWidth: '130',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '接口类方法',
        dataIndex: 'method',
        minWidth: '120',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '动作ID',
        dataIndex: 'actionId',
        minWidth: '120',
        headerAlign: 'left',
        align: 'left'
      },
      {
        title: '动作描述',
        dataIndex: 'actionDisplay',
        minWidth: '120',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '业务对象名',
        dataIndex: 'entityName',
        minWidth: '120',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '功能模块',
        dataIndex: 'module',
        minWidth: '160',
        headerAlign: 'left',
        align: 'left'
      },
      {
        title: '日志生成器',
        dataIndex: 'logGenerator',
        minWidth: '120',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '日志类型',
        dataIndex: 'logType',
        minWidth: '180',
        align: 'left',
        headerAlign: 'left',
        formatter (row, column, cellValue) {
          let v = ''
          switch (cellValue) {
            case '1':
              v = '系统类型'
              break
            case '2':
              v = '业务类型'
              break
            case '3':
              v = '安全类型'
              break
          }
          return v
        }
      },
      {
        title: '业务表名',
        dataIndex: 'tableName',
        minWidth: '120',
        align: 'left',
        headerAlign: 'left'
      },
      // {
      //   title: '管理类型',
      //   dataIndex: 'adminType',
      //   minWidth: '120',
      //   align: 'left',
      // headerAlign: 'left'
      // },
      {
        title: '操作',
        fixed: 'right',
        width: 150,
        dataIndex: 'operation',
        align: 'left',
        headerAlign: 'left',
        scopedSlots: { customRender: 'operation' }
      }
    ]
    return {
      comp: this,
      visibleEdit: false,
      tableApi: 'logApiConfig.list',
      record: {},
      drawerTitle: '',
      queryParams: {},
      columns: columns,
      buttonConfig: {
        icon: 'edit'
      }
    }
  },
  props: {
    roteName: {
      type: String,
      default: ''
    }
  },
  methods: {
    // 新建
    create () {
      this.drawerTitle = '新建'
      this.record = {}
      this.visibleEdit = true
    },
    // 修改
    update (record) {
      this.drawerTitle = '修改'
      this.record = record
      this.visibleEdit = true
    },
    onEditClose () {
      this.visibleEdit = false
    },
    saveSuccess () {
      this.$refs.table.searchData()
      this.onEditClose()
    },
    delete (record) {
      console.log(record, 111)
      const that = this
      this.$confirm('是否确定要删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        that.$api['logApiConfig.delete']({ id: record.id }).then((res) => {
          that.$refs.table.searchData()
          that.$message({ message: '删除成功！', type: 'success' })
        })
      })
    }
  },
  components: {
    ListLayout,
    CommonTable,
    edit,
    CommonButton,
    CommonDrawer
  }
}
</script>
