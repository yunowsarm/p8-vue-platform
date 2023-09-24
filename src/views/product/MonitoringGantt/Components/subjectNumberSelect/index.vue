<template>
  <common-dialog
    :title="title"
    @close="handleCancel"
    :visible="visible"
    :dialog-config="dialogConfig"
    :show-handle-btn="true"
    :dialog-height="dialogHeight"
    :width="dialogWidth"
    @handle-ok="handleOk"
    @handle-cancel="handleCancel"
    @isfullscreen="isfullscreen"
  >
    <template #dialog>
      <list-layout>
        <template #north>
          <search-form-list :data-source="searchData" :form="searchForm" @search="search" @re-set="reset"></search-form-list>
        </template>
        <template #center>
          <div id="table-contain">
            <div class="resourceList" :style="{ width: resourceWidth }">
              <common-table
                ref="tableCom"
                :columns="columns"
                :params="queryParam"
                :api="tableApi"
                :table-refresh="tableRefresh"
                :table-config="tableConfig"
                :table-setting="false"
                :disabled-check-all="true"
                is-radio-select
                @row-click="rowClick"
                @select="select"
                @row-dblclick="rowDblclick"
                @requested-table-data="requestedTableData"
              >
              </common-table>
            </div>
          </div>
        </template>
      </list-layout>
    </template>
  </common-dialog>
</template>
<style lang="scss" scoped>
.date-range-con,
.input-con {
  float: left;
  height: 30px;
  width: 50%;
}
.input-con {
  margin-left: 10px;
}
.search-btn {
  float: right;
  height: 30px;
}
.el-icon-d-arrow-right {
  float: right;
  font-size: 20px;
  margin-top: 6px;
  cursor: pointer;
}
.icon-conflict {
  cursor: pointer;
  font-size: 20px;
  color: #ff0000;
}
.input-search-name {
  width: 450px !important;
  display: inline-block !important;
}
.table-con .small-table {
  overflow-y: auto;
}
.resourceList {
  float: left;
  width: calc(50% - 5px);
  height: 100%;
}
</style>
<script>
import Vue from 'vue'
import { P8Table as CommonTable, P8Search as SearchFormList, P8Dialog as CommonDialog, P8ListLayout as ListLayout } from 'p8-components-ui'
export default {
  name: 'SubjectNumberSelect',
  components: {
    CommonTable,
    CommonDialog,
    ListLayout,
    SearchFormList
  },
  props: ['startTaskId', 'endTaskId', 'planInfoId', 'visible', 'selectTaskwbsMainDataId'],
  data() {
    const searchData = [
      {
        type: 'text',
        labelText: '课题编码',
        fieldName: 'posid',
        defaultValue: '',
        placeholder: '请输入课题编码'
      },
      {
        type: 'text',
        labelText: '课题名称',
        fieldName: 'post1',
        defaultValue: '',
        placeholder: '请输入课题名称'
      }
    ]
    return {
      searchData,
      comp: this,
      title: '课题号选择',
      dialogWidth: '40%',
      searchForm: {
        // isShowParent: true
      },
      dialogHeight: 400,
      dialogConfig: {
        modal: false
      },
      currentRow: null,
      tableApi: 'planGanttManager.wbsDataSource',
      queryParam: {
        posid: '',
        post1: ''
      },
      tableConfig: {
        'highlight-current-row': true
      },
      resourceWidth: '100%',
      customHeight: 462,
      columns: [
        {
          title: '',
          width: 35,
          type: 'selection'
        },
        {
          title: '序号',
          type: 'index',
          align: 'center',
          width: 60
        },
        {
          title: '课题编码',
          dataIndex: 'posid',
          align: 'center',
          min_width: 85
        },
        {
          title: '课题名称',
          dataIndex: 'post1',
          align: 'center',
          min_width: 85
        }
      ]
    }
  },
  mounted() {},
  methods: {
    reset() {
      const that = this
      Object.keys(that.queryParam).forEach(function (key) {
        return (that.queryParam[key] = null)
      })
      // let _this = this
      // _this.$refs.table.searchData()
    },
    // 单击选中行
    rowClick(row, column, event) {
      this.$refs.tableCom.clearSelection()
      this.$refs.tableCom.toggleRowSelection(row)
      // this.$refs.tableCom.$refs.table.clearSelection()
      // if (this.currentRow) {
      //   if (this.currentRow.id === row.id) {
      //     this.$refs.tableCom.$refs.table.toggleRowSelection(row, false)
      //     this.currentRow = null
      //   } else {
      //     this.$refs.tableCom.$refs.table.toggleRowSelection(row, true)
      //     this.currentRow = row
      //   }
      // } else {
      //   this.$refs.tableCom.$refs.table.toggleRowSelection(row, true)
      this.currentRow = row
      // }
    },
    // 勾选复选框选中行
    select(selection, row) {
      // this.$refs.tableCom.$refs.table.clearSelection()
      // this.$refs.tableCom.$refs.table.toggleRowSelection(row)
      this.currentRow = row
    },
    // 双击行，直接关闭抽屉、回填值
    rowDblclick(row, column, event) {
      this.$refs.tableCom.$refs.table.clearSelection()
      this.$refs.tableCom.$refs.table.toggleRowSelection(row)
      this.currentRow = row
      this.submit()
    },
    isfullscreen(isfullscreen) {
      if (isfullscreen) {
        this.customHeight = document.documentElement.clientHeight - 170
      } else {
        this.customHeight = 462
      }
    },
    // 默认选中页面已选的责任人
    requestedTableData(data) {
      const _this = this
      if (data.length) {
        this.$nextTick(() => {
          data.map((item) => {
            if (item.id === _this.selectTaskwbsMainDataId) {
              _this.$refs.tableCom.$refs.table.setCurrentRow(item)
              _this.$refs.tableCom.$refs.table.toggleRowSelection(item, true)
            }
          })
        })
      }
    },
    tableRefresh(param) {
      param
        .then(() => {
          console.log('异步成功后端做的操作')
        })
        .catch(() => {
          console.error('异步失败的操作')
        })
    },
    submit() {
      this.$emit('subjectNumberClose', this.currentRow.id, this.currentRow)
    },
    search(param) {
      this.queryParam = { ...param }
      // this.$refs.tableCom.searchData()
    },
    handleCancel() {
      this.$emit('closed')
    },
    handleOk() {
      if (this.currentRow && Object.keys(this.currentRow).length > 0) {
        this.submit()
      } else {
        this.$message({
          message: '请选择课题号！',
          type: 'warning'
        })
      }
    }
  }
}
</script>
