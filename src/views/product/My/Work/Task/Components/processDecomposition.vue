<template>
  <div style="height: 100%;">
    <common-dialog title="任务分解过程情况"
                   :visible="isView"
                   :showHandleBtn="false"
                   :dialogConfig="dialogConfig"
                   @handle-cancel="handleCancel"
                   @handle-ok="handleOk"
                   width="65%"
                   @close="handleCancel"
                   :dialogHeight="600">
      <template #dialog>
        <common-table ref="table"
                      :columns="columns"
                      :pagination="false"
                      api="TaskManager.taskDecomposition"
                      :useTreeFormat="true"
                      :useTreePId='useTreePId'
                      :params="{'taskId':taskId}"
                      :tableConfig="tableConfig"
                      :flex="250">
        </common-table>
      </template>
    </common-dialog>
  </div>
</template>
<script>
import { P8Dialog as CommonDialog, P8Table as CommonTable, P8ListLayout as ListLayout, } from 'p8-components-ui'


export default {
  name: 'processDecomposition',
  props: {
    isView: {
      type: Boolean,
      default: false
    }, taskId: {
      type: String,
      default: ''
    }
  },
  components: {
    CommonDialog
    , CommonTable,
    ListLayout
  },
  data () {
    const columns = [
      {
        title: '序号',
        type: 'index'
      },
      {
        title: '任务名称',
        dataIndex: 'name',
        width: '180px',
        template: function (task) {
          if (task.style) {
            return '<div style="color:' + task.style + '">' + task.name + '</div>'
          } else {
            return task.name
          }
        },
        align: 'center'
      },
      {
        title: '责任人',
        dataIndex: 'realName',
        align: 'center'
      },
      {
        title: '责任部门',
        dataIndex: 'deptName',
        align: 'center'
      },
      {
        title: '状态',
        dataIndex: 'status',
        align: 'center'
      },
      {
        title: '工期',
        dataIndex: 'duration',
        align: 'center'
      },
      {
        title: '计划开始时间',
        dataIndex: 'start_date',
        width: 120,
        formatter (row, column, cellValue, index) {
          if (cellValue) {
            return cellValue.slice(0, 10)
          }
        },
        align: 'center'
      },
      {
        title: '计划完成时间',
        dataIndex: 'end_date',
        width: 120,
        formatter (row, column, cellValue, index) {
          if (cellValue) {
            return cellValue.slice(0, 10)
          }
        },
        align: 'center'
      },
      {
        title: '实际开始时间',
        dataIndex: 'realBeginDate',
        width: 120,
        formatter (row, column, cellValue, index) {
          if (cellValue) {
            return cellValue.slice(0, 10)
          }
        },
        align: 'center'
      },
      {
        title: '实际完成时间',
        dataIndex: 'realEndDate',
        width: 120,
        formatter (row, column, cellValue, index) {
          if (cellValue) {
            return cellValue.slice(0, 10)
          }
        },
        align: 'center'
      },

      {
        title: '预计开始时间',
        dataIndex: 'task_forecast_begin_dateduration',
        width: 120,
        formatter (row, column, cellValue, index) {
          if (cellValue) {
            return cellValue.slice(0, 10)
          }
        },
        align: 'center'
      },
      {
        title: '预计完成时间',
        dataIndex: 'task_forecast_end_date',
        width: 120,
        formatter (row, column, cellValue, index) {
          if (cellValue) {
            return cellValue.slice(0, 10)
          }
        },
        align: 'center'
      }
    ]
    return {
      dialogConfig: {
        modal: false
      }, tableConfig: {
        'default-expand-all': true
      }, columns,
      useTreePId: "parentId"
    }
  },
  watch: {},
  mounted () {

  },
  methods: {
    handleCancel () {
      this.$emit('close')
    },
    handleOk () {
      this.handleCancel()
    }
  }
}
</script>
