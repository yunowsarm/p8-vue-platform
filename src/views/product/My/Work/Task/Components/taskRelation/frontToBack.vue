<template>
  <el-tabs class="taskTabs"
           style="height: 400px;"
           @tab-click="tabsClick">
    <el-tab-pane label="前后置">
      <common-table ref="table"
                    v-if="tabsActiveName == '前后置'"
                    :columns="columns"
                    :params="queryParam"
                    :table-setting="false"
                    :pagination="false"
                    :api="tableApi"
                    :tableRefresh="tableRefresh"
                    :table-config="tableConfig"
                    @row-click="rowClick">
      </common-table>
    </el-tab-pane>
    <el-tab-pane label="父/子任务">
      <common-table ref="tableHierarchy"
                    v-if="tabsActiveName == '父/子任务'"
                    :columns="columnsHierarchy"
                    :hasWBS="true"
                    :params="queryParam"
                    :table-setting="false"
                    :pagination="false"
                    :api="tableApiHierarchy"
                    :table-config="tableConfig"
                    @row-click="rowClick">
      </common-table>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import { P8Table as CommonTable, Tabs, TabPane } from 'p8-components-ui'
export default {
  name: 'FrontToBack',
  components: {
    CommonTable,
    'el-tabs': Tabs,
    'el-tab-pane': TabPane
  },
  inject: ['getPlanInfo'],
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
        title: '任务名称',
        dataIndex: 'name',
        sortable: false,
        align: 'left'
      },
      {
        title: '前后置关系',
        dataIndex: 'relation',
        sortable: false,
        align: 'center',
        width: 120,
      },
      {
        title: '计划完成时间',
        dataIndex: 'planEndDate',
        align: 'center',
        width: 120
      }
    ]
    const columnsHierarchy = [
      {
        title: '序号',
        type: '',
        dataIndex: 'WBS',
        width: 60,
        align: 'left'
      },
      {
        title: '任务名称',
        dataIndex: 'name',
        sortable: false,
        align: 'left'
      },
      {
        title: '状态',
        dataIndex: 'statusDisplay',
        sortable: false,
        align: 'left'
      },
      {
        title: '计划完成时间',
        dataIndex: 'planEndDate',
        sortable: false,
        align: 'center',
        width: 120,
      }
    ]
    return {
      tabsActiveName: '前后置',
      queryParam: {
        taskId: ''
      },
      tableApi: 'taskManager.getTaskDependence',
      tableApiHierarchy: 'taskManager.getTaskHierarchy',
      columns,
      columnsHierarchy,
      tableConfig: {
        'default-expand-all': true,
        'highlight-current-row': true
      }
    }
  },
  created () {
    this.queryParam.taskId = this.getPlanInfo().TASKID
  },
  methods: {
    tableRefresh (param) {
      let that = this
      param
        .then((res) => {
          if (res) {
            that.$emit('rowClick', res[0].id)
          }
        })
        .catch(() => {
        })
    },
    rowClick (row) {
      this.$emit('rowClick', row.id)
    },
    checkRow (data) {
      let that = this
      Array.from(data).forEach((row) => {
        if (row.id === that.getPlanInfo().TASKID) {
          that.$refs.tableHierarchy.$refs.table.setCurrentRow(row)
          that.$emit('rowClick', row.id)
        }
        if (row.children) this.checkRow(row.children)
      })
    },
    tabsClick (val) {
      this.tabsActiveName = val.label
      if (val.paneName === '1') {
        // 选中递归
        this.checkRow(this.$refs.tableHierarchy.$refs.table.tableData)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.taskTabs ::v-deep .el-tabs__nav-wrap {
  background-color: #f5f7fa;
  padding: 0 14px;
  &::after {
    height: 0px;
  }
}
</style>