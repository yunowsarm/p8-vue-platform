<template>
  <common-table :columns="columns" :params="params" :api="api" :pagination="true" :table-setting="false"> </common-table>
</template>

<script>
import { P8Table as CommonTable } from 'p8-components-ui'
export default {
  components: {
    CommonTable
  },
  props: {
    processKeyId: {
      type: String
    }
  },
  data() {
    return {
      api: 'planInfoManager.getTaskListByProcessKey',
      columns: [
        {
          title: '序号',
          type: 'index',
          width: 60
        },
        {
          title: '项目名称',
          dataIndex: 'wholeDescribeName',
          align: 'center',
          minWidth: 150
        },
        {
          title: '计划名称',
          dataIndex: 'planName',
          align: 'center',
          minWidth: 150
        },
        {
          title: '任务名称',
          dataIndex: 'taskName',
          align: 'center',
          minWidth: 150
        },
        {
          title: '工期',
          dataIndex: 'duration',
          align: 'center',
          minWidth: 80
        },
        {
          title: '责任人',
          dataIndex: 'realName',
          align: 'center',
          minWidth: 80
        },
        {
          title: '部门',
          dataIndex: 'departmentName',
          align: 'center',
          minWidth: 100
        },
        {
          title: '计划开始时间',
          dataIndex: 'planBeginDate',
          align: 'center',
          minWidth: 110
        },
        {
          title: '计划完成时间',
          dataIndex: 'planEndDate',
          align: 'center',
          minWidth: 110
        },
        {
          title: '预测开始时间',
          dataIndex: 'forecastBeginDate',
          align: 'center',
          minWidth: 110
        },
        {
          title: '预测完成时间',
          dataIndex: 'forecastEndDate',
          align: 'center',
          minWidth: 110
        }
      ],
      params: { processKeyId: this.processKeyId }
    }
  }
}
</script>

<style></style>
