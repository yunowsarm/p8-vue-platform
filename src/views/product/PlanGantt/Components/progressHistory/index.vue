<template>
  <div style="height: 100%">
    <common-tabs class="custom-common-tabs"
      :active-tabs="activeTabs"
      type="border-card"
      :tabs-data="tabs"
      height="100%">
      <template #history>
        <common-table ref="table"
          :columns="columns"
          :table-setting="false"
          :params="queryParam"
          :api="tableApi"
          :pagination="false"></common-table>
      </template>
      <template #undone>
        <common-table ref="table"
          :api="tableApi2"
          :params="tableParams2"
          :columns="columns2"
          :pagination="false"
          :tableSetting="false">
        </common-table>
        </form-table>
      </template>
    </common-tabs>
  </div>
</template>

<script>
import { P8Table as CommonTable, P8Tabs as CommonTabs } from 'p8-components-ui'
export default {
  components: { CommonTable, CommonTabs },
  props: {
    taskId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      activeTabs: 'history',
      tabs: [
        {
          label: '进度反馈',
          name: 'history'
        },
        {
          label: '未完成反馈',
          name: 'undone'
        }
      ],
      tableApi: 'taskManager.progressFeedbackHistory',
      queryParam: { taskId: this.taskId },
      allStatus: [],
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
            return row.progress * 100 + '%'
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
          dataIndex: 'createTime',
          align: 'center',
          width: 160
        }
      ],
      tableApi2: 'taskManager.deviationReasonsHistory',
      tableParams2: { taskId: this.taskId },
      columns2: [
        {
          title: '序号',
          type: 'index',
          width: '55px',
          align: 'center'
        },
        {
          title: '偏离类型',
          dataIndex: 'deviationTypeDisplay',
          width: '100px',
          align: 'center'
        },
        {
          title: '偏离原因',
          dataIndex: 'deviationCauses',
          columnConfig: { // 表格列内容过长隐藏并显示Tooltip
            'show-overflow-tooltip': true
          },
          align: 'left'
        },
        {
          title: '偏离影响',
          dataIndex: 'deviationImpact',
          columnConfig: { // 表格列内容过长隐藏并显示Tooltip
            'show-overflow-tooltip': true
          },
          align: 'left'
        },
        {
          title: '进展情况',
          dataIndex: 'deviationProgress',
          columnConfig: { // 表格列内容过长隐藏并显示Tooltip
            'show-overflow-tooltip': true
          },
          align: 'left'
        },
        {
          title: '解决方案',
          dataIndex: 'solutions',
          columnConfig: { // 表格列内容过长隐藏并显示Tooltip
            'show-overflow-tooltip': true
          },
          align: 'left'
        },
        {
          title: '反馈时间',
          dataIndex: 'createTime',
          align: 'left'
        }
      ]
    }
  },
  created() {
  },
}
</script>

<style lang="scss" scoped>
.custom-common-tabs {
  height: calc(100% - 50px);
}
</style>