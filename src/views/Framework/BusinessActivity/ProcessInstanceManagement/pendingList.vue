<template>
  <list-layout :header-visible="false">
    <template #center>
      <common-table ref="table"
                    :columns="columns"
                    :flex="110"
                    :parmas="queryParam"
                    :table-setting="false"
                    :show-search-row="true"
                    :table-config="tableConfig"
                    @requested-table-data="handleRequested"
                    :api="tableApi"
                    @row-click="rowClick">
        <template #operation="{ scope }">
          <el-button type="text"
                     @click="modify(scope.row)">修改</el-button>
          <el-button type="text"
                     @click="stop(scope.row)">终止</el-button>
        </template>
      </common-table>
    </template>
    <template #drawer-panel>
      <select-user v-if="visible1"
                   :visible="visible1"
                   :selected-row="[]"
                   select-type="1"
                   @close-dialog="closeModal2"></select-user>
    </template>
  </list-layout>
</template>

<script>
import { P8Table as CommonTable, P8ListLayout as ListLayout } from 'p8-components-ui'
import selectUser from './selectUser'
export default {
  name: 'PendingList',
  components: {
    CommonTable,
    selectUser,
    ListLayout
  },
  data () {
    const columns = [
      {
        title: '序号',
        type: 'index',
        width: '50px'
      },
      {
        title: '流程名称',
        dataIndex: 'processName',
        sortable: false,
        align: 'left',
        headerAlign: 'left',
        width: 180,
        filterable: true, // 列上增加输入框搜索
        filter: {
          alias: '',
          val: '',
          type: 'text'
        }
      },
      {
        title: '提交人',
        dataIndex: 'startUser',
        sortable: false,
        align: 'left',
        headerAlign: 'left',
        width: 120,
        filterable: true, // 列上增加输入框搜索
        filter: {
          alias: '',
          val: '',
          type: 'text'
        }
      },
      {
        title: '当前审批人',
        dataIndex: 'approveUser',
        sortable: false,
        align: 'left',
        headerAlign: 'left',
        width: 120,
        filterable: true, // 列上增加输入框搜索
        filter: {
          alias: '',
          val: '',
          type: 'text'
        }
      },
      {
        title: '提交时间',
        dataIndex: 'startTime',
        sortable: false,
        align: 'left',
        headerAlign: 'left',
        width: 190,
        filterable: true, // 列上增加输入框搜索
        filter: {
          alias: 'startEndTime',
          val: '',
          type: 'datetimeRange',
          fieldConfig: {
            valueFormat: 'yyyy-MM-dd'
          }
        }
      },
      {
        title: '操作',
        dataIndex: 'operation',
        scopedSlots: { customRender: 'custom' },
        align: 'left',
        headerAlign: 'left',
        width: 90
      }
    ]
    return {
      visible1: false,
      queryParam: {},
      tableApi: 'baseData.allPendingList',
      columns,
      tableConfig: {
        'highlight-current-row': true
      }
    }
  },
  mounted () {
    this.$refs.table.page.orders = [{ column: 't.create_time_', asc: false }]
    this.$refs.table.searchData()
  },
  methods: {
    rowClick (row) {
      this.$emit('itemClick', row)
    },
    modify (row) {
      this.visible1 = true
      this.processTaskId = row.processTaskId
    },
    stop (row) {
      let that = this
      this.$confirm('确定要终止吗？', '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      }).then(() => {
        let params = {
          approvalComment: ' ',
          approvalParams: '',
          approvalResult: '0',
          approveData: {},
          businessKey: row.businessKey,
          logDetail: {},
          officeResult: '',
          officeResultText: '',
          processInstance: row.processInstId,
          processKey: row.processKey,
          taskId: row.processTaskId,
          uploadFiles: []
        }
        that.$api['baseData.stopApprove'](params).then((res) => {
          that.$message({ type: 'success', message: '操作成功' })
          that.$refs.table.searchData()
        })
      })
    },
    closeModal2 (selectedRows) {
      if (selectedRows) {
        let that = this
        this.visible1 = false
        let parmas = {
          taskId: this.processTaskId,
          approvalResult: selectedRows[0].id
        }
        this.$api['baseData.modifyApproveUser'](parmas).then((res) => {
          if (res && res.result) {
            that.$message({ type: 'success', message: '修改成功' })
            this.rowClick()
            that.$refs.table.searchData()
          }
        })
      }
    },
    handleRequested (data) {
      this.rowClick(data[0])
    }
  }
}
</script>
