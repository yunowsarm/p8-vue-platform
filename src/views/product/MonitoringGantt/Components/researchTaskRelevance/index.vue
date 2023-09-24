<template>
  <list-layout>
    <template #north>
      <el-button type="primary" @click="save">保存</el-button>
    </template>
    <template #center>
      <common-table ref="table" :columns="columns" :api="tableApi" :show-search-row="true" style="height: 100%" :params="tableParam" :pagination="true" @selection-change="handleSelectionChange">
        <template #monitorPointArray="{ scope }">
          <span v-if="scope.row.monitorPointArray && scope.row.monitorPointArray.length > 0">
            <i v-for="item in scope.row.monitorPointArray" :key="item.id" :class="`${item.icon}`" :title="item.pointName"></i>
          </span>
        </template>
      </common-table>
    </template>
  </list-layout>
</template>

<script>
import { P8ListLayout as ListLayout, P8Table as CommonTable } from 'p8-components-ui'
export default {
  name: 'Index',
  components: {
    CommonTable,
    ListLayout
  },
  props: {
    tasks: {
      type: Array
    }
  },
  created() {},
  data() {
    return {
      tableApi: 'myExperience.getCourtPlanTasksList',
      tableParam: {
        taskId: this.tasks && this.tasks[0] ? this.tasks[0].id : ''
      },
      columns: [
        {
          title: '',
          width: 45,
          type: 'selection'
        },
        {
          title: '序号',
          type: 'index',
          width: 55,
          align: 'center'
        },
        {
          title: '标识',
          dataIndex: 'monitorPointArray',
          minWidth: 100,
          scopedSlots: { customRender: 'custom' },
          align: 'center'
        },
        {
          title: '任务名称',
          dataIndex: 'taskName',
          minWidth: 240,
          align: 'left'
        },
        {
          title: '责任单位（人）',
          dataIndex: 'dutyUser',
          minWidth: 130,
          align: 'center',
          filterable: true,
          iconDisplay: false,
          filter: {
            val: '',
            type: 'text',
            alias: 'dutyKeyWords'
          }
        },
        {
          title: '角色',
          dataIndex: 'teamRoleName',
          minWidth: 100,
          align: 'center'
        },
        {
          title: '部门',
          dataIndex: 'dutyUserDept',
          minWidth: 130,
          align: 'center'
        },
        {
          title: '工期',
          dataIndex: 'duration',
          minWidth: 100,
          align: 'center',
          formatter(row) {
            if (row.duration) {
              return row.duration + '天'
            } else {
              return '-'
            }
          }
        },
        {
          title: '计划开始时间',
          minWidth: 130,
          dataIndex: 'planBeginDate',
          align: 'center',
          filterable: true,
          iconDisplay: false,
          filter: {
            val: '',
            type: 'datetime',
            fieldConfig: {
              valueFormat: 'yyyy-MM-dd'
            },
            alias: 'planBeginDateArr'
          }
        },
        {
          title: '计划完成时间',
          minWidth: 130,
          dataIndex: 'planEndDate',
          align: 'center',
          filterable: true,
          iconDisplay: false,
          filter: {
            val: '',
            type: 'datetime',
            fieldConfig: {
              valueFormat: 'yyyy-MM-dd'
            },
            alias: 'planEndDateArr'
          }
        },
        {
          title: '进度',
          minWidth: 100,
          dataIndex: 'progress',
          align: 'center',
          formatter(row) {
            if (row.progress) {
              return (row.progress * 100).toFixed(2) + '%'
            } else {
              return '-'
            }
          }
        }
      ],
      selectedRows: []
    }
  },
  methods: {
    save() {
      if (this.lockVerify()) return
      this.$api['myExperience.connectTask']({
        taskId: this.tasks[0].id,
        avTaskId: this.selectedRows[0].taskId
      }).then((res) => {
        if (res) {
          this.$emit('close')
          this.$message.success('关联成功')
          // this.$notify({
          //   title: '提示',
          //   message: '关联成功',
          //   type: 'success'
          // })
        } else {
          this.$message.warning('关联失败')
          // this.$notify.info({
          //   title: '提示',
          //   message: '关联失败'
          // })
        }
      })
    },
    handleSelectionChange(rows) {
      if (rows.length >= 2) {
        const arrays = rows.splice(0, rows.length - 1)
        arrays.forEach((row) => {
          this.$refs.table.$refs.table.toggleRowSelection(row)
        })
      }
      this.selectedRows = rows
    },
    lockVerify() {
      if (!this.tasks || !this.tasks[0]) {
        this.$notify.info({
          title: '提示',
          message: '数据错误'
        })
        return true
      }
      if (this.selectedRows.length === 0) {
        this.$notify.info({
          title: '提示',
          message: '请选择至少一条数据'
        })
        return true
      }
      return false
    }
  }
}
</script>

<style scoped></style>
