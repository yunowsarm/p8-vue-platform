<template>
  <common-dialog :title="title"
                 @close="handleCancel"
                 :visible="visible"
                 :dialog-config="dialogConfig"
                 :show-handle-btn="true"
                 :dialog-height="dialogHeight"
                 :width="dialogWidth"
                 @handle-ok="handleOk"
                 @handle-cancel="handleCancel"
                 @isfullscreen="isfullscreen">
    <template #dialog>
      <list-layout>
        <template #north>
          <div class="input-con">
            <el-input class="input-name input-search-name"
                      :placeholder="DutyPersonsMessage === '' ? '支持人员名称、部门、角色模糊查询，例如：李四、lisi、部门1、计划经理' : DutyPersonsMessage"
                      v-model="searchName"
                      @change="inputChange"
                      size="small"></el-input>
            <el-button style="margin-left: 15px"
                       @click="search"
                       type="primary"
                       size="mini">搜索</el-button>
          </div>
          <i class="el-icon-d-arrow-right"
             v-if="tableV"
             @click="
              () => {
                tableV = !tableV
                resourceWidth = '100%'
              }
            "></i>
        </template>
        <template #center>
          <div id="table-contain">
            <div class="resourceList"
                 :style="{ width: resourceWidth }">
              <common-table ref="tableCom"
                            :columns="columns"
                            :params="queryParam"
                            :api="tableApi"
                            :table-refresh="tableRefresh"
                            :table-config="tableConfig"
                            :table-setting="false"
                            :disabled-check-all="true"
                            @row-click="rowClick"
                            @select="select"
                            @row-dblclick="rowDblclick"
                            @selection-change="handleTableSelectionChange"
                            @requested-table-data="requestedTableData">
                <template #taskCount="{ scope }">
                  <i v-if="scope.row.taskCount > 0"
                     class="p8 icon-conflict"
                     @click="showUserLoad(scope.row)"></i>
                </template>
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
  display: flex;
  justify-content: flex-end;
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
.resourceLoad {
  float: right;
  width: 50%;
  height: 100%;
}
</style>
<script>
import Vue from 'vue'
import { P8Table as CommonTable, P8Dialog as CommonDialog, P8ListLayout as ListLayout, Input } from 'p8-components-ui'
export default {
  name: 'ResourceSelect',
  components: {
    'el-input': Input,
    CommonTable,
    CommonDialog,
    ListLayout
  },
  inject: {
    DutyPersonsMessage: {
      default: '',
      from: 'DutyPersonsMessage'
    }
  },
  props: ['entityId', 'startTaskId', 'endTaskId', 'planInfoId', 'visible', 'selectTaskOwnerId', 'showType'],
  data () {
    return {
      tableSelectValue: [],
      comp: this,
      title: '选择人员',
      dialogWidth: '50%',
      dialogHeight: 500,
      tableV: false,
      dialogConfig: {
        modal: true
      },
      currentRow: null,
      tableApi: 'planGanttManager.planResourceLoad',
      searchName: '',
      queryParam: {
        planInfoId: this.planInfoId,
        entityId: this.entityId,
        startTaskId: this.startTaskId,
        endTaskId: this.endTaskId,
        searchName: ''
      },
      tableConfig: {
        'highlight-current-row': true
      },
      resourceWidth: '100%',
      columns: [
        {
          title: '',
          width: 45,
          align: 'center',
          headerAlign: 'center',
          type: 'selection'
        },
        {
          title: '序号',
          type: 'index',
          align: 'center',
          headerAlign: 'center',
          width: 60
        },
        {
          title: '人员',
          dataIndex: 'name',
          align: 'center',
          minWidth: 100
        },
        {
          title: '部门',
          dataIndex: 'deptName',
          align: 'center',
          minWidth: 100
        },
        {
          title: '角色',
          dataIndex: 'roleName',
          align: 'center',
          minWidth: 100
        }
      ],
      queryParamT: {
        planInfoId: this.planInfoId,
        startTaskId: this.startTaskId,
        endTaskId: this.endTaskId,
        userId: ''
      },
      tableApiT: 'planGanttManager.resourceTaskLoad',
      tableConfigT: {},
      selectRows: []
    }
  },
  mounted () {

  },
  methods: {
    inputChange (val) {
      this.queryParam.searchName = val
    },
    // 单击选中行
    rowClick (row, column, event) {
      if (row.weatherOut === '0') {
        let isSelect = this.tableSelectValue.filter(item => item.id === row.id).length
        this.$refs.tableCom.$refs.table.toggleRowSelection(row, !isSelect)
        this.selectRows = this.tableSelectValue
      }
    },
    // 勾选复选框选中行
    select (selection, row) {
      this.selectRows = []
      if (!row) {
        this.$refs.tableCom.$refs.table.clearSelection()
      }
      // this.$refs.tableCom.$refs.table.toggleRowSelection(row)
      this.currentRow = row
      this.selectRows = selection
    },
    // 双击行，直接关闭抽屉、回填值
    rowDblclick (row, column, event) {
      // if (row.weatherOut === '0') {
      //   this.$refs.tableCom.$refs.table.clearSelection()
      //   this.$refs.tableCom.$refs.table.toggleRowSelection(row)
      this.selectRows = []
      this.selectRows.push(row)
      this.submit()
      // }
    },
    showUserLoad (row) {
      if (row.weatherOut === '0') {
        this.getUserTaskInfo(row)
        this.tableV = true
        this.resourceWidth = 'calc( 50% - 5px )'
      }
    },
    isfullscreen (isfullscreen) {
      this.$nextTick(() => {
        this.tableSelectValue.forEach(row => {
          this.$refs.tableCom.$refs.table.toggleRowSelection(row)
        })
      })
    },
    handleTableSelectionChange (value) {
      this.tableSelectValue = value
    },
    // 默认选中页面已选的责任人
    requestedTableData (data) {
      const _this = this
      if (data.length) {
        this.$nextTick(() => {
          data.map((item) => {
            if (item.id === _this.selectTaskOwnerId) {
              _this.$refs.tableCom.$refs.table.setCurrentRow(item)
              _this.currentRow = item
              _this.$refs.tableCom.$refs.table.toggleRowSelection(item, true)
            }
          })
        })
      }
    },
    tableRefresh (param) {
      param
        .then(() => {

        })
        .catch(() => {
          console.error('异步失败的操作')
        })
    },
    submit () {
      this.$emit('resource-selected', this.selectRows)
    },
    search () {
      const that = this
      this.queryParam.searchName = this.searchName
      Vue.nextTick(function () {
        that.$refs.tableCom.searchData()
      })
    },
    handleCancel () {
      this.tableSelectValue = []
      this.$emit('closed')
    },
    getUserTaskInfo (row) {
      this.$set(this.queryParamT, 'resourceId', row.id)
    },
    tableRefreshT (param) {
      param
        .then(() => {

        })
        .catch(() => {
          console.error('异步失败的操作')
        })
    },
    handleOk () {
      this.tableSelectValue = []
      if (this.selectRows && Object.keys(this.selectRows).length > 0) {
        this.submit()
      } else {
        this.$message({
          message: '请选择责任人！',
          type: 'warning'
        })
      }
    }
  }
}
</script>
