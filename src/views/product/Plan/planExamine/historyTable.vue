<template>
  <common-table ref="table"
                :api="tableApi"
                :customHeight="customHeight"
                :params="tableParams"
                :columns="columns"
                :pagination="false"
                :tableSetting="false"></common-table>
</template>

<script>
import { P8Table as CommonTable } from 'p8-components-ui'
export default {
  components: {
    CommonTable
  },
  props: {
    row: {
      type: Array
    }
  },
  data () {
    return {
      tableApi: 'taskManager.progressFeedbackHistory',
      customHeight: document.documentElement.clientHeight - 43,
      columns: [
        {
          title: '序号',
          type: 'index',
          width: '55px',
          align: 'center'
        },
        {
          title: '状态',
          dataIndex: 'statusDisplay',
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
          minWidth: 200,
        }
      ],
      tableParams: { taskId: this.row && this.row.length > 0 ? this.row[0].ID : '' },
    }
  }
}
</script>

<style></style>
