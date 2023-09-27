<template>
  <div style="height: 100%;">
    <common-dialog :title="title"
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
                      api="taskManager.preAndPostTaskViewing"
                      :params="{'taskId':taskId, type: frontToBackType }"
                      :tableConfig="tableConfig"
                      :flex="250">
          <template #uploadFiles="{ scope }">
            <el-popover placement="bottom-start"
                        trigger="hover">
              <div v-for="(item, index) in scope.row.uploadFiles"
                   :key="index">
                <span>{{ item.fileName }}</span>
                <span style="margin-left: 10px;color: #49a6ff"
                      @click="downloadFile(item)">下载</span>
              </div>
              <span slot="reference"
                    style="color: #49a6ff">{{ scope.row.uploadFiles.length }}</span>
            </el-popover>
          </template>
        </common-table>
      </template>
    </common-dialog>
  </div>
</template>
<script>
import { P8Dialog as CommonDialog, P8Table as CommonTable, P8ListLayout as ListLayout, } from 'p8-components-ui'


export default {
  name: 'frontToBack',
  props: {
    isView: {
      type: Boolean,
      default: false
    },
    taskId: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    frontToBackType: {
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
        }
      },
      {
        title: '完成度',
        dataIndex: 'progress',
        width: 100,
        align: 'center',
        formatter: function (row, column, cellValue, index) {
          return Math.round(cellValue * 100) + '%'
        }
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
      },
      {
        title: '输出',
        dataIndex: 'uploadFiles',
        width: 120,
        align: 'center',
        scopedSlots: {
          customRender: 'custom'
        }
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
    downloadFile (item) { // 输出要求-文件下载
      if (item.id) {
        this.$api['SystemSettings.getFileUrl']({ attachmentId: item.id }, { responseType: 'blob' }).then(backJson => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(new Blob([backJson.data]))
          link.download = item.fileName
          document.body.appendChild(link)
          link.click()
          window.URL.revokeObjectURL(link.href)
          document.body.removeChild(link)
        }).finally(() => {
        })
      }
    },
    handleCancel () {
      this.$emit('close')
    },
    handleOk () {
      this.handleCancel()
    }
  }
}
</script>
