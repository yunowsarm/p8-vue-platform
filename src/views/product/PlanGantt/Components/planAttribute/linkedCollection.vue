<template>
  <div style="height: 100%; width: 100%">
    <el-button style="margin: 10px" v-if="isChangeView" type="primary" @click="relevanceClick">关联</el-button>
    <vxe-table
      ref="xTable"
      v-if="falg"
      :comp="comp"
      style="height: 300px"
      :columns="columnsDemand"
      :params="tableParamDemand"
      :table-config="tableConfig"
      :is-smart-form="true"
      :table-setting="false"
      :refresh-show="false"
      :pagination="false"
      :api="tableApi"
    >
      <template #operation="{ scope }">
        <el-button type="text" :disabled="!isChangeView" @click="closeClick(scope.row)">取消</el-button>
      </template>
    </vxe-table>
    <common-drawer v-if="visibleEditDrawer" :title="title" size="80%" :visible="visibleEditDrawer" @close="visibleEditDrawer = false">
      <template #drawer>
        <el-button style="margin: 10px" type="primary" @click="saveClick">保存</el-button>
        <vxe-table
          ref="table"
          :comp="comp"
          style="height: 92%"
          :columns="columns"
          :params="tableParam"
          :table-config="tableConfig"
          :tree-config="treeConfig"
          :checkbox-config="checkboxConfig"
          :is-smart-form="true"
          :table-setting="false"
          :refresh-show="false"
          :pagination="false"
          @selection-change="handleSelectionChangeDemand"
          :api="tableApiList"
        >
        </vxe-table>
      </template>
    </common-drawer>
  </div>
</template>

<script>
import { P8VxeTable as VxeTable, P8Drawer as CommonDrawer } from 'p8-components-ui'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import { mapGetters } from 'vuex'
import { monitorPointsEditCheck, setNewTaskMap } from '@/assets/commonJS/ganttJS/changeGantt'
export default {
  name: 'LinkedCollection',
  components: {
    'vxe-table': VxeTable,
    CommonDrawer
  },
  props: {
    taskId: {
      type: String
    },
    title: {
      type: String
    },
    ganttName: {
      type: String
    },
    wholeDescribeId: {
      type: String
    },
    formWidth: {
      type: Number,
      default: 0
    },
    isChangeView: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      comp: this,
      columnsDemand: [
        {
          title: '序号',
          type: 'index',
          align: 'center',
          width: '50px',
          headerAlign: 'center'
        },
        {
          title: '阶段名称',
          dataIndex: 'stageName',
          sortable: false,
          minWidth: '200px',
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '交付时间',
          dataIndex: 'deliveryDate',
          sortable: false,
          width: '100px',
          align: 'left',
          headerAlign: 'center'
        },
        {
          title: '付款比例',
          dataIndex: 'proportion',
          sortable: false,
          width: '80px',
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '付款金额',
          dataIndex: 'amount',
          sortable: false,
          width: '80px',
          align: 'center',
          treeNode: true,
          headerAlign: 'center'
        },
        {
          title: '合同编号',
          dataIndex: 'contractNo',
          sortable: false,
          width: '80px',
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '合同名称',
          dataIndex: 'contractName',
          sortable: false,
          width: '100px',
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '操作',
          fixed: 'right',
          dataIndex: 'operation',
          align: 'center',
          scopedSlots: { customRender: 'custom' },
          width: 80
        }
      ],
      tableParamDemand: {
        taskId: this.taskId
      },
      columns: [],
      columnsOne: [
        {
          title: '',
          width: 45,
          align: 'center',
          headerAlign: 'center',
          type: 'checkbox'
        },
        // {
        //   title: '大纲号',
        //   type: '',
        //   headerAlign: 'center',
        //   dataIndex: 'taskLevel',
        //   width: '100px'
        // },
        {
          title: '合同编号',
          dataIndex: 'contractNo',
          sortable: false,
          width: '140px',
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '合同/阶段名称',
          dataIndex: 'contractName',
          sortable: false,
          treeNode: true,
          minWidth: '200px',
          align: 'left',
          headerAlign: 'center'
        },
        {
          title: '金额',
          dataIndex: 'totalAmount',
          sortable: false,
          width: '100px',
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '已收',
          dataIndex: 'receivedAmount',
          sortable: false,
          align: 'center',
          width: '100px',
          headerAlign: 'center'
        },
        {
          title: '未收',
          dataIndex: 'unreciverdAmount',
          sortable: false,
          align: 'center',
          width: '100px',
          headerAlign: 'center'
        },
        {
          title: '比例',
          dataIndex: 'amountProgess',
          sortable: false,
          align: 'center',
          width: '100px',
          headerAlign: 'center'
        },
        {
          title: '交付日期',
          dataIndex: 'deliveryDate',
          sortable: false,
          width: '120px',
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '币种',
          dataIndex: 'cmeaning',
          sortable: false,
          width: '100px',
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '甲方',
          dataIndex: 'partyaName',
          sortable: false,
          width: '150px',
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '乙方',
          dataIndex: 'partybName',
          sortable: false,
          width: '150px',
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '签订日期',
          dataIndex: 'signDate',
          sortable: false,
          width: '120px',
          align: 'center',
          headerAlign: 'center'
        }
      ],
      columnsTwo: [
        {
          title: '',
          width: 45,
          align: 'center',
          headerAlign: 'center',
          type: 'checkbox'
        },
        // {
        //   title: '大纲号',
        //   type: '',
        //   headerAlign: 'center',
        //   dataIndex: 'taskLevel',
        //   width: '100px'
        // },
        {
          title: '合同编号',
          dataIndex: 'contractNo',
          sortable: false,
          width: '140px',
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '合同/阶段名称',
          dataIndex: 'contractName',
          sortable: false,
          treeNode: true,
          minWidth: '200px',
          align: 'left',
          headerAlign: 'center'
        },
        {
          title: '金额',
          dataIndex: 'totalAmount',
          sortable: false,
          width: '100px',
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '已付',
          dataIndex: 'paidAmount',
          sortable: false,
          align: 'center',
          width: '100px',
          headerAlign: 'center'
        },
        {
          title: '未付',
          dataIndex: 'unpaidAmount',
          sortable: false,
          align: 'center',
          width: '100px',
          headerAlign: 'center'
        },
        {
          title: '比例',
          dataIndex: 'amountProgess',
          sortable: false,
          align: 'center',
          width: '100px',
          headerAlign: 'center'
        },
        {
          title: '交付日期',
          dataIndex: 'deliveryDate',
          sortable: false,
          width: '120px',
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '币种',
          dataIndex: 'cmeaning',
          sortable: false,
          width: '100px',
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '甲方',
          dataIndex: 'partyaName',
          sortable: false,
          width: '150px',
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '乙方',
          dataIndex: 'partybName',
          sortable: false,
          width: '150px',
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '签订日期',
          dataIndex: 'signDate',
          sortable: false,
          width: '120px',
          align: 'center',
          headerAlign: 'center'
        }
      ],
      tableParam: {},
      tableConfig: {
        'highlight-current-row': true
      },
      treeConfig: {
        transform: true,
        expandAll: true,
        trigger: 'default',
        rowField: 'id',
        parentField: 'contractId',
        indent: 40,
        iconOpen: 'el-icon-arrow-down',
        iconClose: 'el-icon-arrow-right'
      },
      checkboxConfig: {
        // showHeader: false,
        visibleMethod: this.checkMethod
      },
      tableApi: '',
      tableApiList: 'relevanceContract.selectCgtableProjectByProjectId',
      falg: false,
      selectRecords: [],
      visibleEditDrawer: false
    }
  },
  computed: {
    ...mapGetters(['vueThis'])
  },
  mounted() {
    if (this.title === '关联收款合同') {
      this.columns = this.columnsOne
      this.tableParamDemand = {
        taskId: this.taskId,
        type: '收款合同'
      }
    } else {
      this.columns = this.columnsTwo
      this.tableParamDemand = {
        taskId: this.taskId,
        type: '付款合同'
      }
    }
    this.tableApi = 'relevanceContract.selectByCpntractNodeTasks'
    this.falg = true
  },
  methods: {
    handleSelectionChangeDemand(rows, row, checked) {
      this.selectRecords = []
      rows.forEach((item) => {
        if (item.contractId) {
          this.selectRecords.push(item.id)
        }
      })
    },
    checkMethod({ row }) {
      if (row.contractId) {
        return true
      }
      return false
    },
    relevanceClick({ row }) {
      this.visibleEditDrawer = true
      if (this.title === '关联收款合同') {
        this.tableParam = {
          projectId: this.wholeDescribeId,
          type: '收款合同'
        }
      } else {
        this.tableParam = {
          projectId: this.wholeDescribeId,
          type: '付款合同'
        }
      }
    },
    async closeClick(row) {
      const that = this
      if (this.ganttName === 'planGantt') {
        await this.$api['relevanceContract.delNodeRelatedTask']({
          taskId: this.taskId,
          contractNodeList: [row.nodeId]
        }).then((res) => {
          if (res) {
            this.$message.success('取消成功')
            this.$refs.xTable.queryList()
          }
        })
        await this.$api['relevanceContract.selectByCpntractNodeTasks']({
          taskId: this.taskId
        }).then((res) => {
          if (res.length === 0) {
            const ganttObject = GanttObject.getGanttObject(this.ganttName)
            const task = ganttObject.getTask(this.taskId)
            if (task.monitorPoints !== null && task.monitorPoints.includes('1018')) {
              task.monitorPoints = that.removePoint(task.monitorPoints, '1018')
            }
            ganttObject.updateTask(task.id)
          }
        })
      } else {
        await this.$api['relevanceContract.selectByCpntractNodeTasks']({
          taskId: this.taskId
        }).then((res) => {
          // if (res.length === 0) {
          const ganttObject = GanttObject.getGanttObject(this.ganttName)
          const task = ganttObject.getTask(this.taskId)
          if (task.monitorPoints !== null && task.monitorPoints.includes('1018')) {
            task.monitorPoints = that.removePoint(task.monitorPoints, '1018')
          }
          console.log('🚀 ~ saveClick ~ task:', task)
          let newObj = []
          if (task.monitorPoints.includes(',')) {
            const monitorPoints = task.monitorPoints.split(',')
            monitorPoints.forEach((item) => {
              newObj.push({
                issubmit: true,
                logBeginTime: '',
                logEndTime: '',
                monitorId: item,
                taskId: task.id
              })
            })
          } else {
            newObj = [
              {
                issubmit: true,
                logBeginTime: '',
                logEndTime: '',
                monitorId: task.monitorPoints,
                taskId: task.id
              }
            ]
          }
          monitorPointsEditCheck(task.monitorManagerRequests, newObj, this.vueThis, task, ganttObject, true)
          setNewTaskMap(this.vueThis, task, newObj, 'monitors')
          // }
        })
      }
    },
    removePoint(points, targetPoint) {
      if (!points) return ''
      const pointArray = points.split(',').filter((p) => p && p !== targetPoint)
      return pointArray.join(',')
    },
    saveClick() {
      const that = this
      if (!this.taskId) {
        return this.$message.warning('请先选择任务')
      }
      const ganttObject = GanttObject.getGanttObject(this.ganttName)
      // 计划编制不可编辑状态字段
      const task = ganttObject.getTask(this.taskId)
      this.$api['relevanceContract.checkNodeRelatedTask']({
        taskId: this.taskId,
        contractNodeList: this.selectRecords
      }).then((res) => {
        if (res) {
          if (this.ganttName === 'planGantt') {
            this.$api['relevanceContract.contractNodeRelatedTask']({
              taskId: this.taskId,
              contractNodeList: this.selectRecords
            }).then((res) => {
              if (res) {
                this.visibleEditDrawer = false
                this.$message.success('关联成功')
                this.$refs.xTable.queryList()
                if (that.selectRecords.length > 0) {
                  if (task.monitorPoints !== null) {
                    if (!task.monitorPoints.includes('1018')) {
                      if (task.monitorPoints.includes(',')) {
                        task.monitorPoints += ',1018'
                      } else {
                        task.monitorPoints += '1018'
                      }
                    }
                  } else {
                    task.monitorPoints = '1018'
                  }
                }
                ganttObject.updateTask(task.id)
              }
            })
          } else {
            this.visibleEditDrawer = false
            this.$message.success('关联成功')
            if (task.infoType && task.infoType === 'create') {
              task.infoType = 'create'
              task.changeStatusName = '调增'
            } else {
              task.infoType = 'update'
              task.changeStatusName = '调整'
            }
            this.$refs.xTable.queryList()
            if (that.selectRecords.length > 0) {
              if (task.monitorPoints !== null) {
                if (!task.monitorPoints.includes('1018')) {
                  task.monitorPoints += ',1018'
                }
              } else {
                task.monitorPoints = '1018'
              }
            }
            let newObj = []
            if (task.monitorPoints.includes(',')) {
              const monitorPoints = task.monitorPoints.split(',')
              monitorPoints.forEach((item) => {
                newObj.push({
                  issubmit: true,
                  logBeginTime: '',
                  logEndTime: '',
                  monitorId: item,
                  taskId: task.id
                })
              })
            } else {
              newObj = [
                {
                  issubmit: true,
                  logBeginTime: '',
                  logEndTime: '',
                  monitorId: '1018',
                  taskId: task.id
                }
              ]
            }
            monitorPointsEditCheck(task.monitorManagerRequests, newObj, this.vueThis, task, ganttObject, true)
            setNewTaskMap(this.vueThis, task, newObj, 'monitors')
          }
        } else {
          return this.$message.error('不能重复关联')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
