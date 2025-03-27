<template>
  <common-table ref="table"
                :columns="columns"
                :table-setting="false"
                :params="queryParam"
                :api="tableApi"
                :pagination="false"></common-table>
</template>
<script>
import { P8Table as CommonTable } from 'p8-components-ui'
export default {
  name: 'ProgessTable',
  components: {
    CommonTable
  },
  inject: ['getPlanInfo'],
  computed: {
    planInfoParams () {
      return this.getPlanInfo()
    }
  },
  data () {
    const columns = [
      {
        title: '序号',
        type: 'index',
        width: '55px',
        align: 'center',
        headerAlign: 'center'
      },
      {
        title: '状态',
        dataIndex: 'status',
        formatter: (row) => {
          if (this.planInfoParams.allStatus && row.status) {
            return this.planInfoParams.allStatus.filter(item => item.value === row.status)[0].label
          }
        },
        align: 'center'
      },
      {
        title: '完成度',
        dataIndex: 'progress',
        formatter: (row) => {
          return Math.round(row.progress * 100) + '%'
        },
        align: 'center'
      },
      {
        title: '进度说明',
        minWidth: 200,
        dataIndex: 'content',
        align: 'center'

      },
      {
        title: '反馈时间',
        dataIndex: 'itemCreateTime',
        align: 'center',
        width: 160
      }
    ]
    return {
      tableApi: 'taskManager.progressFeedbackHistory',
      queryParam: { taskId: this.getPlanInfo().TASKID },
      columns
    }
  },
  mounted () {

  },
  methods: {

  }
}
</script>
<style lang="scss">
</style>
