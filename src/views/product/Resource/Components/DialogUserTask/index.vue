<template>
  <common-dialog :title="dialogTitle"
                 :visible="dialogVisible"
                 :width="dialogWidth"
                 :showHandleBtn="dialogShowBtn"
                 :dialogConfig="dialogConfig"
                 :dialogHeight="dialogHeight"
                 @close="dislogClose"
                 @handle-cancel="dislogClose"
                 @handle-ok="dislogCloseOK"
                 @isfullscreen="isfullscreen">
    <template #dialog>
      <list-layout>
        <template #north>
          <search-form ref="search"
                       :dataSource="searchDataSource"
                       @search="search"
                       @re-set="reset"></search-form>
        </template>
        <template #center>
          <common-table res="table"
                        :api="tableApi"
                        :columns="renderColumns"
                        :tableSetting="false"
                        :style="{height: cutomHeight + 'px'}"
                        :params="renderTableParams"
                        :customHeight="tableCustomHeight"
                        :merageKeys="['projectCode', 'projectName']">
            <template #monitorpoint="{scope}">
              <span v-for="item in monitorpointIconHandle(scope.row)"
                    :key="item"
                    style="padding: 0 2px">
                <i :class="item"></i>
              </span>
            </template>
            <template #overdue="{scope}">
              <div v-html="overdueTextFun(scope.row)"></div>
            </template>
          </common-table>
        </template>
      </list-layout>
    </template>
  </common-dialog>
</template>

<script>
import { P8Dialog as CommonDialog, P8ListLayout as ListLayout, P8Search as SearchForm, P8Table as CommonTable } from 'p8-components-ui'

import { getTaskStatusInfo } from '../index'
import { calculateRemainingDays } from '@/utils/common'
export default {
  name: 'DialogUserTask',
  components: {
    CommonDialog,
    ListLayout,
    SearchForm,
    CommonTable
  },
  props: {
    dialogTitle: {
      type: String,
      default: '任务明细'
    },
    dialogVisible: {
      type: Boolean,
      default: false
    },
    dialogWidth: {
      type: String,
      default: '50%'
    },
    dialogShowBtn: {
      type: Boolean,
      default: false
    },
    dialogConfig: {
      type: Object,
      default: () => {
        return {
          modal: true,
          'destroy-on-close': true,
          'append-to-body': true
        }
      }
    },
    searchDataSource: {
      type: Array,
      default: () => {
        return [
          {
            type: 'datetimeRange',
            labelText: '计划时间',
            fieldName: 'beginEndTime',
            defaultValue: '',
            placeholder: ''
          },
          {
            type: 'multiple',
            labelText: '任务状态',
            fieldName: 'status',
            defaultValue: '',
            placeholder: '',
            options: []
          },
          {
            type: 'text',
            labelText: '任务名称',
            fieldName: 'taskName',
            defaultValue: '',
            placeholder: '请输入任务名称'
          },
          {
            type: 'text',
            labelText: '项目编号',
            fieldName: 'projectCode',
            defaultValue: '',
            placeholder: '请输入项目编号'
          },
          {
            type: 'text',
            labelText: '项目名称',
            fieldName: 'projectName',
            defaultValue: '',
            placeholder: '请输入项目名称'
          }
        ]
      }
    },
    columns: {
      type: Array,
      default: () => {
        return []
      }
    },
    tableApi: {
      type: String,
      default: 'projectTeam.userTaskDetail'
    },
    tableParams: { // 自己手动拦截处理搜索条件, 并刷新table
      type: Object,
      default: () => { }
    },
    customSearch: {
      type: Boolean,
      default: false
    }
  },
  data () {
    const columns = [
      {
        title: '序号',
        type: 'index',
        width: 45,
        align: 'center'
      },
      {
        title: '任务标识',
        type: 'index',
        dataIndex: 'monitorpoint',
        width: '160px',
        scopedSlots: {
          customRender: 'custom'
        },
        align: 'center'
      },
      // {
      //   title: '项目编号',
      //   dataIndex: 'projectCode',
      //   width: '120px',
      //   align: 'center',
      //   columnConfig: {
      //     'show-overflow-tooltip': true
      //   }
      // },
      // {
      //   title: '项目名称',
      //   dataIndex: 'projectName',
      //   width: '120px',
      //   align: 'center',
      //   columnConfig: {
      //     'show-overflow-tooltip': true
      //   }
      // },
      {
        title: '任务名称',
        dataIndex: 'name',
        minWidth: '120px',
        columnConfig: {
          'header-align': 'center',
          'show-overflow-tooltip': true
        },
        align: 'left'
      },
      {
        title: '完成情况',
        dataIndex: 'status',
        width: '120px',
        align: 'center',
        columnConfig: {
          'show-overflow-tooltip': true
        },
        formatter: (row) => {
          const _this = this
          let currStatus = _this.taskStatus.filter(item => item.value === row.status)
          if (currStatus.length) {
            return `${row.managerstatusdisplay},${currStatus[0].label}`
          }
        }
      },
      {
        title: '超期剩余天数',
        type: 'index',
        dataIndex: 'overdue',
        width: '130px',
        columnConfig: {
          'header-align': 'center'
        },
        scopedSlots: {
          customRender: 'custom'
        },
        align: 'center'
      },
      {
        title: '计划开始时间',
        dataIndex: 'planBeginDate',
        width: '120px',
        align: 'center'
      },
      {
        title: '计划完成时间',
        dataIndex: 'planEndDate',
        width: '120px',
        align: 'center'
      },
      {
        title: '实际开始时间',
        dataIndex: 'realBeginDate',
        width: '120px',
        align: 'center'
      },
      {
        title: '实际完成时间',
        dataIndex: 'realEndDate',
        width: '120px',
        align: 'center'
      }
    ]
    return {
      dialogHeight: 200,
      tableCustomHeight: 300,
      renderColumns: columns,
      renderTableParams: {},
      taskStatus: [],
      listData: [],
      spanArr: [],
      position: 0,
      cutomHeight: 500
    }
  },
  watch: {
    tableParams: {
      handler (val) {
        this.renderTableParams = val
      },
      deep: true,
      immediate: true
    },
    columns: {
      handler (val) {
        this.renderColumns = val && val.length ? val : this.renderColumns
      },
      deep: true,
      immediate: true
    }
  },
  mounted () {
    const dh = document.documentElement.clientHeight
    this.dialogHeight = dh * 0.6
    this.tableCustomHeight = dh * 0.6 - 70

    // getTaskStatusInfo({ currentStatus: 'all' }).then(res => {
    //   this.taskStatus = res
    // })
  },
  methods: {
    search (param) {
      if (this.customSearch) {
        /**
         * 'custom-search': 事件名称(手动处理搜索)
         * param: 处理后的搜索对象
         * this.$refs.table: table组件对象, 可调用刷新table方法
         */
        this.$emit('custom-search', param, this.$refs.table)
      } else {
        this.renderTableParams = { ...param, ...this.tableParams }
      }
    },
    reset () {
      if (this.customSearch) {
        /**
         * 'custom-reset': 事件名称(手动处理清空)
         * param: 处理后的搜索对象
         */
        this.$emit('custom-reset')
      } else {
        this.renderTableParams = {}
      }
    },
    dislogClose () {
      this.$emit('close')
    },
    dislogCloseOK () {
      this.$emit('close-btn-ok')
    },
    isfullscreen (isfullscreen) {
      if (isfullscreen) {
        this.cutomHeight = document.documentElement.clientHeight - 115
      } else {
        this.cutomHeight = 500
      }
    },
    // 超期/剩余天数调用公共方法
    overdueTextFun (row) {
      return calculateRemainingDays(row).text
    },
    monitorpointIconHandle (row) {
      if (row.monitorpointArray && row.monitorpointIconArray) {
        let monitorpointArray = row.monitorpointArray.split(',')
        let monitorpointIconArray = row.monitorpointIconArray.split(',')
        let tempIcon = []
        monitorpointArray.forEach((item, index) => {
          tempIcon.push(monitorpointIconArray[index])
        })
        return tempIcon
      }
    },
    customMargeHandle ({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'projectCode') {
        const _row = this.spanArr[rowIndex]
        const _col = _row > 0 ? 1 : 0
        return {
          rowspan: _row,
          colspan: _col
        }
      }
      if (column.property === 'projectName') {
        const _row = this.spanArr[rowIndex]
        const _col = _row > 0 ? 1 : 0
        return {
          rowspan: _row,
          colspan: _col
        }
      }
    }
  }
}
</script>

<style>
</style>
