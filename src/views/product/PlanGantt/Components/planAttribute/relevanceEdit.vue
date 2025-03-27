<template>
  <div style="height: 100%;width:100%;">
    <el-button style="margin: 10px;"
               type="primary"
               :disabled="disabled"
               @click="relevanceClick">关联/取消</el-button>
    <vxe-table ref="xDemandTable"
               :comp="comp"
               style="height: 92%;"
               :columns="columnsDemand"
               :params="tableParamDemand"
               :table-config="tableConfig"
               :checkboxConfig="checkboxConfig"
               :is-smart-form="true"
               :refreshShow="false"
               :tableSetting="false"
               :pagination="false"
               @selection-change="handleSelectionChangeDemand"
               :api="tableApi">
    </vxe-table>
  </div>
</template>

<script>
import { P8VxeTable as VxeTable } from 'p8-components-ui'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import { mapGetters } from 'vuex'
export default {
  name: 'Index',
  components: {
    'vxe-table': VxeTable
  },
  props: {
    taskId: {
      type: String
    },
    ganttName: {
      type: String
    },
    formWidth: {
      type: Number,
      default: 0
    },
    wholeDescribeId: {
      type: String,
      default: 0
    }
  },
  data () {
    return {
      comp: this,
      columnsDemand: [
        {
          title: '是否关联',
          width: 80,
          align: 'center',
          type: 'checkbox'
        },
        {
          title: '序号',
          type: 'index',
          align: 'center',
          width: '60px',
          headerAlign: 'center'
        },
        {
          title: '状态',
          dataIndex: 'demandStatusDisplay',
          sortable: false,
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '标题',
          dataIndex: 'title',
          sortable: false,
          align: 'left',
          headerAlign: 'center'
        },
        {
          title: '来源渠道',
          dataIndex: 'source',
          sortable: false,
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '录入时间',
          dataIndex: 'createTime',
          sortable: false,
          align: 'center',
          treeNode: true,
          headerAlign: 'center'
        },
        {
          title: '收集人',
          dataIndex: 'createBy',
          sortable: false,
          align: 'center',
          headerAlign: 'center'
        },
      ],
      tableParamDemand: {},
      tableConfig: {
        'highlight-current-row': true
      },
      checkboxConfig: {
        showHeader: false
      },
      tableApi: 'demandManagement.getRequirementList',
      selectRecords: [],
      disabled: true
    }
  },
  computed: {
    ...mapGetters(['vueThis'])
  },
  mounted () {
    if (this.taskId) {
      let that = this
      setTimeout(() => {
        if (that.$refs.xDemandTable) {
          let selectData = that.$refs.xDemandTable.$refs.table.data
          that.$api[that.tableApi]({ taskId: that.taskId }).then(res => {
            res.forEach(el => {
              selectData.forEach((item, index) => {
                if (el.id === item.id) {
                  that.$refs.xDemandTable.$refs.table.setCheckboxRow(selectData[index], true)
                }
              })
            })
          })
        }
      }, 1000)
    }
  },
  methods: {
    handleSelectionChangeDemand (rows, row, checked) {
      this.disabled = false
      this.selectRecords = []
      rows.forEach(item => {
        this.selectRecords.push(item.id)
      })
    },
    relevanceClick () {
      let that = this
      if (!this.taskId) {
        return this.$message.warning('请先选择任务')
      }
      const ganttObject = GanttObject.getGanttObject(this.ganttName)
      // 计划编制不可编辑状态字段
      let task = ganttObject.getTask(this.taskId)
      if (task.isLeaf > 0) {
        return this.$message.warning('请选择子任务进行关联')
      }
      this.$api['demandManagement.saveRequirementByTask']({
        wholeId: this.wholeDescribeId,
        taskId: this.taskId,
        requirementIds: this.selectRecords
      }).then(res => {
        if (res) {
          this.$message.success('操作成功')
          this.disabled = true
          if (that.selectRecords.length > 0) {
            if (task.monitorPoints !== null) {
              if (!task.monitorPoints.includes('1017')) {
                if (task.monitorPoints.includes(',')) {
                  task.monitorPoints += ',1017'
                } else {
                  task.monitorPoints += '1017'
                }
              }
            } else {
              task.monitorPoints = '1017'
            }
          } else {
            if (task.monitorPoints !== null && task.monitorPoints.includes('1017')) {
              task.monitorPoints = that.removePoint(task.monitorPoints, '1017')
            }
          }
          ganttObject.updateTask(task.id)
          that.$emit('refreshData')
        }
      })
    },
    removePoint (points, targetPoint) {
      if (!points) return '';
      const pointArray = points.split(',').filter(p => p && p !== targetPoint);
      return pointArray.join(',');
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
