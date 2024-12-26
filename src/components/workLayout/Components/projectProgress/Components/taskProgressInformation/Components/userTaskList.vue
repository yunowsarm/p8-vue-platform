<template>
  <div id="table-contain">
    <common-table res="table" :api="tableApi" :columns="columns" :table-setting="false" :params="tableParams" :custom-height="tableCustomHeight" :merage-keys="['pjCode', 'projectName']">
      <template #monitorpoint="{ scope }">
        <span v-for="item in monitorpointIconHandle(scope.row)" :key="item.id" style="padding: 0 2px">
          <el-tooltip effect="light" placement="right">
            <div slot="content">
              <p v-html="item.title"></p>
            </div>
            <i :class="item.icon" @click="iconClick(scope.row)" style="cursor: pointer"></i>
          </el-tooltip>
        </span>
      </template>
      <template #progress="{ scope }">
        <el-progress :text-inside="true" :stroke-width="16" :percentage="numFilter(scope.row.progress)"></el-progress>
      </template>
      <template #overdue="{ scope }">
        <div v-html="overdueTextFun(scope.row)"></div>
      </template>
    </common-table>
    <revenue-view v-if="revenueBudgetVisible" :visible="revenueBudgetVisible" :other-param="revenueBudgetParam" @close-dialog="revenueBudgetClose"> </revenue-view>
  </div>
</template>
<script>
import { P8Table as CommonTable, Tooltip, Progress } from 'p8-components-ui'
// import { getTaskStatusInfo } from '@/views/Product/My/Work/Task/commonBusinessJs'

import { getMonitorData, getBudgetData } from '@/components/workLayout/Components/projectProgress/Components/layoutData'
import RevenueView from '@/components/workLayout/Components/projectProgress/Components/taskProgressInformation/Components/revenueView'
import { calculateRemainingDays } from '@/utils/common'
import langCn from '@/config/const/lang_cn'
export default {
  name: 'UserTaskList',
  components: {
    'el-tooltip': Tooltip,
    'el-progress': Progress,
    RevenueView,
    CommonTable
  },
  props: {
    tableApi: {
      type: String,
      default: 'commonP8Task.loadPlanListData'
    },
    tableParams: {
      // 自己手动拦截处理搜索条件, 并刷新table
      type: Object,
      default: () => {}
    },
    customSearch: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tableCustomHeight: 480,
      taskStatus: [],
      monitorpointDataArray: [],
      revenueBudgetParam: {},
      revenueBudgetVisible: false,
      columns: [
        {
          title: langCn.indexNum,
          type: 'index',
          width: 55,
          align: 'center'
        },
        {
          title: langCn.identification,
          type: 'index',
          dataIndex: 'monitorpoint',
          width: '160px',
          scopedSlots: {
            customRender: 'custom'
          },
          align: 'center'
        },
        {
          title: langCn.pjcode,
          dataIndex: 'pjCode',
          width: '120px',
          align: 'center',
          columnConfig: {
            'show-overflow-tooltip': true
          }
        },
        {
          title: langCn.projectName,
          dataIndex: 'projectName',
          width: '120px',
          align: 'center',
          columnConfig: {
            'show-overflow-tooltip': true
          }
        },
        {
          title: langCn.taskName,
          dataIndex: 'taskName',
          minWidth: '120px',
          columnConfig: {
            'header-align': 'center',
            'show-overflow-tooltip': true
          },
          align: 'left'
        },
        {
          title: langCn.completionStatus,
          dataIndex: 'status',
          width: '120px',
          align: 'center',
          columnConfig: {
            'show-overflow-tooltip': true
          },
          formatter: (row) => {
            const _this = this
            const currStatus = _this.taskStatus.filter((item) => item.value === row.status)
            if (currStatus.length) {
              return `${row.managerstatusdisplay},${currStatus[0].label}`
            }
          }
        },
        {
          title: langCn.overdueRemainingDays,
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
          title: langCn.progress,
          dataIndex: 'progress',
          width: '120px',
          align: 'center',
          scopedSlots: {
            customRender: 'custom'
          }
        },
        {
          title: langCn.planStartDate,
          dataIndex: 'planBeginDate',
          width: '120px',
          align: 'center'
        },
        {
          title: langCn.planEndDate,
          dataIndex: 'planEndDate',
          width: '120px',
          align: 'center'
        },
        {
          title: langCn.actualStartDate,
          dataIndex: 'realBeginDate',
          width: '120px',
          align: 'center'
        },
        {
          title: langCn.actualEndDate,
          dataIndex: 'realEndDate',
          width: '120px',
          align: 'center'
        }
      ]
    }
  },
  watch: {
    tableParams: {
      handler(val) {},
      deep: true,
      immediate: true
    }
  },
  created() {
    const dh = document.documentElement.clientHeight

    this.tableCustomHeight = dh - 330
    const that = this
    // getTaskStatusInfo({ currentStatus: 'all' }).then((res) => {
    //   that.taskStatus = res
    // })
    getMonitorData({ monitorId: [] }).then((res) => {
      that.monitorpointDataArray = res
    })
  },
  methods: {
    numFilter(value) {
      const realVal = Number((parseFloat(value) * 100).toFixed(2))
      return realVal
    },
    // 超期/剩余天数调用公共方法
    overdueTextFun(row) {
      return calculateRemainingDays(row).text
    },
    monitorpointIconHandle(row) {
      const that = this
      const tempIcon = []
      if (row.monitorpointArray && that.monitorpointDataArray) {
        const monitorpointArray = row.monitorpointArray.split(',')
        monitorpointArray.forEach((item, index) => {
          tempIcon.push({ id: item, icon: that.monitorpointDataArray[item].icon, title: that.monitorpointDataArray[item].name })
        })
      }
      if (row.revenueBudgetId) {
        tempIcon.push({ id: row.revenueBudgetId, icon: 'p8 icon-cost', title: '经费标识' })
      }
      return tempIcon
    },
    iconClick(row) {
      const that = this
      if (row.revenueBudgetId) {
        getBudgetData({ revenueBudgetId: row.revenueBudgetId }).then((res) => {
          that.revenueBudgetParam = res
          that.revenueBudgetVisible = true
        })
      }
    },
    revenueBudgetClose() {
      this.revenueBudgetVisible = false
      this.revenueBudgetParam = Object.assign({})
    },
    customMargeHandle({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'pjCode') {
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

<style></style>
