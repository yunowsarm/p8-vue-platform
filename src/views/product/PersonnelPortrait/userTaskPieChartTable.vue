<template>
  <common-table ref="table"
                :columns="columns"
                :params="queryParam"
                :showSearchRow="false"
                :api="flightTableApi"
                :pagination="true">
    <template #overdue="{ scope }">
      <div v-html="overdueTextFun(scope.row)"></div>
    </template>
    <template #monitorPointName="{ scope }">
      <span v-if="scope.row.monitorPoints">
        <i v-for="item in handleRowMointor(scope.row)"
           :key="item.id"
           :class="`${item.icon}`"
           :title="item.name"></i>
      </span>
    </template>
  </common-table>
</template>

<script>
import { P8Table as CommonTable } from 'p8-components-ui'
import { calculateRemainingDays } from '@/utils/common'
export default {
  name: 'userTaskPieChartTable',
  props: {
    status: {
      type: String
    },
    chartData: {
      type: Object
    }
  },
  inject: {
    searchFormDashboar: {
      default: () => { return { endDate: [] } }
    }
  },

  components: {
    CommonTable
  },

  data () {
    const columns = [
      {
        title: '序号',
        type: 'index',
        width: 55,
        align: 'center'
      },
      {
        title: '任务名称',
        dataIndex: 'name',
        minWidth: 200
      },
      {
        title: '任务标识',
        dataIndex: 'monitorPointName',
        width: 120,
        align: 'center',
        scopedSlots: {
          customRender: 'custom'
        }
      },
      {
        title: '责任人',
        dataIndex: 'userName',
        width: 120,
        align: 'center'
      },
      {
        title: '角色',
        dataIndex: 'roleName',
        width: 120,
        align: 'center'
      },
      {
        title: '部门',
        dataIndex: 'departmentName',
        width: 100,
        align: 'center'
      },
      {
        title: '状态',
        dataIndex: 'managerStatusDisplay',
        minWidth: 100,
        align: 'center'
      },
      {
        title: '进度（%）',
        dataIndex: 'progress',
        width: 100,
        align: 'center'
      },
      {
        title: '预计开始时间',
        dataIndex: 'forecastBeginDate',
        minWidth: 150,
        align: 'center'
      },
      {
        title: '预计完成时间',
        minWidth: 150,
        dataIndex: 'forecastEndDate',
        align: 'center'
      },
      {
        title: '计划开始时间',
        minWidth: 150,
        dataIndex: 'planBeginDate',
        align: 'center'
      },
      {
        title: '计划完成时间',
        minWidth: 150,
        dataIndex: 'planEndDate',
        align: 'center'
      },
      {
        title: '实际开始时间',
        dataIndex: 'realBeginDate',
        minWidth: 150,
        align: 'center'
      },
      {
        title: '实际完成时间',
        dataIndex: 'realEndDate',
        minWidth: 150,
        align: 'center'
      },
      {
        title: '超期/剩余天数',
        dataIndex: 'overdue',
        minWidth: 150,
        align: 'center',
        scopedSlots: {
          customRender: 'custom'
        }
      },
    ]
    return {
      columns: columns,
      flightTableApi: 'qualifications.historyAssumptionTaskDetailsList',
      queryParam: this.chartData
    }
  },
  computed: {

  },

  beforeMount () { },

  mounted () {

  },
  methods: {
    overdueTextFun (row) {
      return calculateRemainingDays(row).text
    },
    handleRowMointor (row) {
      if (row && row.monitorPoints) {
        const monitorPointArray = row.monitorPoints.split(',')
        const monitorPointIconArray = row.monitorPointIconArray.split(',')
        const monitorPointDisplayArray = row.monitorPointDisplayArray.split(',')
        const mointIcon = []
        const monitorLength = monitorPointArray.length
        for (let i = 0; i < monitorLength; i++) {
          mointIcon.push({
            id: monitorPointArray[i],
            icon: monitorPointIconArray[i],
            name: monitorPointDisplayArray[i]
          })
        }
        return mointIcon
      }
    }
  },

  watch: {
  }

}
</script>
<style lang='scss' scoped>
</style>
