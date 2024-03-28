<template>
  <normal-layout :normal-layout="normalLayout">
    <template #north>
      <el-button type="primary"
                 @click="importSelect">导入</el-button>
      <!-- <span style="color: red; font-size: 14px; font-weight: bolder; float: right; line-height: 30px; display: inline-block; margin-right: 10px">密级：{{ activitySecretGradeDisplay }}</span> -->
    </template>
    <template #west>
      <common-tree :tree-api="treeApi"
                   @select="onSelect"
                   :tree-config="treeConfig"
                   :tree-param="treeParam"></common-tree>
    </template>
    <template #center>
      <div id="table-contain">
        <common-table ref="table"
                      :comp="comp"
                      :columns="columns"
                      :params="queryParam"
                      :use-tree-format="useTreeFormat"
                      :use-tree-p-id="useTreePId"
                      :pagination="pagination"
                      :api="tableApi"
                      :table-refresh="tableRefresh"
                      :table-config="tableConfig"
                      @select-all="selectAll"
                      @select="onActivitiTableSelect"
                      @selection-change="handleSelectionChange">
        </common-table>
      </div>
    </template>
  </normal-layout>
</template>

<style>
.ant-drawer-body {
  height: calc(100% - 55px);
}
.table-page-search-wrapper .ant-form-inline .ant-form-item {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  margin-bottom: 24px;
  margin-right: 0;
}
.table-page-search-wrapper .ant-form-inline .ant-form-item .ant-form-item-control-wrapper {
  -webkit-box-flex: 1;
  -ms-flex: 1 1;
  flex: 1 1;
  display: inline-block;
  vertical-align: middle;
}
</style>
<script>
import { P8Table as CommonTable, Button, P8Tree as CommonTree, P8NormalLayout as NormalLayout } from 'p8-components-ui'

import { mapGetters } from 'vuex'

export default {
  name: 'ActivityImport',
  components: {
    NormalLayout,
    CommonTable,
    'el-button': Button,
    CommonTree
  },
  props: {
    activitySecretGradeDisplay: {
      type: String,
      default: ''
    },
    taskId: {
      type: String,
      default: null
    },
    activityImportType: {
      type: String,
      default: null
    },
    autoScheduling: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      comp: this,
      queryParam: {},
      useTreeFormat: true,
      useTreePId: 'parentId',
      pagination: false,
      selectAllChecked: false, // 全选flag
      treeApi: 'planGanttManager.importActivityInfoClassifyTree',
      tableApi: 'planGanttManager.importActivityInfoTree',
      columns: [
        {
          title: '',
          type: 'selection',
          selectable: (row, index) => {
            if (row.parentId) {
              return true
            }
          }
        },
        {
          title: '活动名称',
          minWidth: 200,
          dataIndex: 'name'
        },
        {
          title: '活动编号',
          minWidth: 120,
          dataIndex: 'code'
        }
      ],
      treeConfig: {
        // showLine: true,
        // checkable: true
      },
      treeParam: {
        dataRange: 'select-all'
      },

      tableConfig: {
        selectOnIndeterminate: true,
        'default-expand-all': true,
        scroll: { x: 1300 },
        expandIconColumnIndex: 3,
        'highlight-current-row': true,
        rowSelection: {
          type: 'checkbox',
          onChange: (selectedRowKeys, selectedCopyRows) => {
            this.selectedRowKeys = selectedRowKeys
            this.selectedCopyRows = selectedCopyRows
          },
          getCheckboxProps: (record) => ({
            props: {
              // 这里只禁用，应该不展示，待处理
              disabled: record.parentId == null,
              name: record.parentId
            }
          })
        }
      },
      selectedCopyRows: [],
      selectedRowKeys: [],
      multipleSelection: [],
      rows: null,
      normalLayout: {
        west: {
          xs: 9,
          sm: 9,
          md: 9,
          lg: 9,
          xl: 8
        },
        center: {
          xs: 15,
          sm: 15,
          md: 15,
          lg: 15,
          xl: 16
        }
      }
    }
  },
  watch: {
    rows: function (newRow) {
      const checkRowLeng = newRow.length
      this.selectedRowKeys = []

      if (checkRowLeng > 0) {
        newRow.forEach((col) => {
          this.selectedRowKeys.push(col.id)

          // that.selectedRowKeys.push()
        })
        this.selectedRowKeys = Array.from(new Set(this.selectedRowKeys))
      } else {
        this.selectedRowKeys = []
      }
    }
  },
  computed: {
    ...mapGetters(['vueThis'])
  },
  methods: {
    selectAll (tableData) {
      tableData = this.$refs.table.tableData
      this.selectAllChecked = !this.selectAllChecked
      this.selectAllRow(tableData, this.selectAllChecked)
      if (!this.selectAllChecked) {
        this.selectedRowKeys = []
      }
    },
    /**
     * 处理数据，全选行，默认只选子不选父
     */
    selectAllRow (data, flag) {
      const _this = this
      data.map((row) => {
        if (row.children && row.children.length > 0) {
          _this.selectAllRow(row.children, flag)
        }
        if (row.parentId) {
          this.selectedRowKeys.push(row.id)
          row.isCheck = flag
          _this.$refs.table.$refs.table.toggleRowSelection(row, flag)
        }
      })
    },
    onActivitiTableSelect (select, row) {
      // eslint-disable-next-line no-unused-vars
      const childrens = row.children

      // this.$refs.table.toggleRowSelection(row,true);//点击选中
      this.rows = this.$refs.table.$refs.table.selection // 获取表格中所有选中的数据
      const checkrow = []
      checkrow.push(row)
      // eslint-disable-next-line eqeqeq
      if (row.isCheck == true) {
        // eslint-disable-next-line eqeqeq
        if (select == 1) {
          this.$refs.table.$refs.table.toggleRowSelection(row, false)
        }
        this.clearRow(checkrow)
      } else {
        // eslint-disable-next-line eqeqeq
        if (select == 1) {
          this.$refs.table.$refs.table.toggleRowSelection(row, true)
        }
        this.checkRow(checkrow)
      }
    },
    // 取消选中递归
    clearRow (data) {
      Array.from(data).forEach((row) => {
        row.isCheck = false // 给这行数据设置一个选中字段为false
        this.$refs.table.$refs.table.toggleRowSelection(row, false)
        if (row.children) this.clearRow(row.children) // 有子集就递归  没子集了就不循环了
      })
    },
    // 选中递归
    checkRow (data) {
      Array.from(data).forEach((row) => {
        row.isCheck = true // 选中是字段值为true
        this.$refs.table.$refs.table.toggleRowSelection(row, true)
        if (row.children) this.checkRow(row.children)
      })
    },
    onSelect (obj) {
      // this.queryParam.activityInfoId = obj.id
      this.$set(this.queryParam, 'activityInfoId', obj.id)
      // this.$refs.table.searchData()
    },
    handleSelectionChange (val) {
      // this.selectedRowKeys = []
      // this.multipleSelection = val
      // val.map(item => {
      //   // 过滤根节点
      //   // if (item.parentId) {
      //   this.selectedRowKeys.push(item.id)
      //   // }
      // })
    },
    importSelect () {
      const that = this
      if (this.selectedRowKeys.length > 0) {
        that.$api['planGanttManager.importActivityInfo']({
          selectTaskId: this.taskId,
          selectedActivityIds: this.selectedRowKeys,
          activityImportType: this.activityImportType,
          autoScheduling: this.autoScheduling,
          createPage: this.vueThis.createPage
        })
          .then(function (res) {
            if (res === 'true') {
              that.showMessage('活动导入成功！', 'success')
              that.$emit('save-success', res)
            } else {
              that.showMessage('活动导入失败！', 'error')
            }
          })
          .catch(function (error) {
            that.showMessage('活动导入失败！', 'error')
            console.error(error)
          })
      } else {
        that.showMessage('请选择需要导入的活动！', 'warning')
      }
    },
    tableRefresh (param) {
      param
        .then(() => {
          console.log('异步成功后端做的操作')
        })
        .catch(() => {
          console.error('异步失败的操作')
        })
    },
    showMessage (message, type) {
      this.$message({
        message: message,
        type: type
      })
    }
  }
}
</script>
