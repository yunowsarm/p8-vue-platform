<script>
import { P8NormalLayoutV1 as NormalLayout, P8Table as CommonTable } from 'p8-components-ui'
import { VxeColumn, VxeTable } from 'vxe-table'
import { generateTree } from '@/utils/generateTree'

export default {
  name: 'index',
  components: {
    CommonTable,
    NormalLayout,
    VxeTable,
    VxeColumn
  },
  props: {
    currentRoute: {
      type: String,
      default: ''
    },
    thirdMenuParam: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      projectId: '',
      taskColumns: [
        {
          title: '任务名称',
          dataIndex: 'name',
          align: 'left',
          headerAlign: 'center'
        },
        {
          title: '预算合计',
          dataIndex: 'budgetInfo',
          align: 'center',
          headerAlign: 'center'
        }
      ],
      taskList: [],
      subjectList: [],
      tableConfig: {
        showOverflowTooltip: true
      },
      taskTableConfig: {
        'highlight-current-row': true,
        'default-expand-all': true,
        'row-class-name': this.tableRowClassName
      },
      treeConfig: {
        transform: true,
        rowField: 'subjectBaseid',
        parentField: 'subjectBasePid',
        expandAll: true
      },
      editConfig: {
        trigger: 'click',
        enabled: true,
        mode: 'cell',
        showStatus: true,
        beforeEditMethod: ({ row, column }) => {
          if (!this.isEdit) return false
          if (column.field === 'amount') {
            return (row.ISLEAF === '是' || row.isleaf === '是' || row.isLeaf === '是') && !row.formula && !['6630'].includes(this.planManageStatus)
          } else {
            return !!row.subjectBasePid
          }
        }
      },
      currentTask: null,
      planManageStatus: null,
      submitLoading: false
    }
  },
  computed: {
    parentRoute() {
      if (this.currentRoute === 'myProject') {
        return 'BudgetManagement'
      } else if (this.currentRoute === 'projectMonitor') {
        return 'BudgetAnalysis'
      }
      const matched = this.$route.matched
      if (matched.length > 1) {
        return matched[matched.length - 2].name
      }
      return null
    },
    isEdit () {
      const editStatus = ['编制中', '发布驳回']
      return editStatus.includes(this.thirdMenuParam?.BUDGETSTATUSNAME) && this.parentRoute !== 'BudgetAnalysis'
    }
  },
  created() {
    if (this.parentRoute !== 'BudgetManagement') {
      this.taskColumns.push({
        title: '实际执行合计',
        dataIndex: 'actualBudgetInfo',
        align: 'center',
        headerAlign: 'center'
      })
    }
    console.log(this.thirdMenuParam, '三级菜单参数')
    if (this.thirdMenuParam) {
      this.projectId = this.thirdMenuParam.ID
      this.getTasksInfoByWholeId()
    }
  },
  methods: {
    // 获取wbs预算
    getTasksInfoByWholeId(id) {
      this.$api['budgetManagement.getTasksInfoByWholeId']({ wholeId: this.projectId }).then((res) => {
        this.taskList = generateTree(res, 'parentId')
        this.$nextTick(() => {
          if (id) {
            const node = res.find((item) => item.id === id)
            this.$refs.taskTable.$refs.table.setCurrentRow(node)
            this.queryDeclaration(id)
          } else {
            this.currentTask = this.taskList[0]
            this.$refs.taskTable.$refs.table.setCurrentRow(this.taskList[0])
            this.queryDeclaration(this.taskList[0].id)
          }
        })
      })
    },
    tableRowClassName({ row }) {
      if (!this.currentTask) return ''
      if (this.currentTask.id === row.id) return 'current-row'
      return ''
    },
    queryDeclaration(id) {
      this.$api['planGanttManager.queryDeclaration']({ taskId: id, type: 'budget' }).then((res) => {
        this.subjectList = res.filter((item) => item.subjectBasePid)
        this.planManageStatus = this.subjectList[0].planManageStatus
        this.$nextTick(() => {
          this.$refs.table.setAllTreeExpand(true)
        })
      })
    },
    getActualColor(row) {
      const actualAmount = row.actualAmount ?? 0
      const amount = row.amount ?? 0
      if (actualAmount > amount) {
        return '#F56C6C'
      } else {
        return '#67C23A'
      }
    },
    rowClick(row) {
      this.currentTask = row
      this.queryDeclaration(row.id)
    },
    editActivated({ row }) {
      this.oldAmount = row.amount
    },
    editClosed({ row }) {
      if (row.amount === this.oldAmount) return
      this.$api['budgetDeclaration.dataCalculation']({ declarationRequests: this.subjectList }).then((res) => {
        res.forEach((item) => {
          const node = this.subjectList.find((n) => n.subjectBaseid === item.subjectBaseid)
          node.amount = item.amount
        })
      })
    },
    save() {
      this.submitLoading = true
      const params = {
        taskId: this.currentTask.id,
        declarationRequests: this.subjectList,
        isBudgetManage: true
      }
      this.$api['planGanttManager.saveDeclaration'](params).then((res) => {
        console.log(res)
        if (res.result) {
          this.$message.success('保存成功')
          this.getTasksInfoByWholeId(this.currentTask?.id ?? '')
        } else {
          this.$message.error(res.resultMsg)
        }
        this.submitLoading = false
      })
    },
    cellClassName({ row, column }) {
      if(!this.isEdit) return
      const classes = []
      if (column.property === 'amount') {
        if(!((row.ISLEAF === '是' || row.isleaf === '是' || row.isLeaf === '是') && !row.formula && !['6630'].includes(this.planManageStatus))){
          classes.push('disabled-cell')
        }
      }
      return classes.join(' ')
    }
  }
}
</script>

<template>
  <div style="height: 100%">
    <normal-layout layoutCode="wbsBudget" :split-default-left-width="30" :header-visible="false" :split-layout="true">
      <template #west>
        <common-table ref="taskTable" :pagination="false" :noApiTableData="taskList" :tableConfig="taskTableConfig" :columns="taskColumns" @row-click="rowClick"></common-table>
      </template>
      <template #center>
        <div class="main-table">
          <vxe-table
            border
            keep-source
            height="100%"
            ref="table"
            align="center"
            :data="subjectList"
            :tableConfig="tableConfig"
            :tree-config="treeConfig"
            :edit-config="editConfig"
            :cell-class-name="cellClassName"
            @edit-activated="editActivated"
            @edit-closed="editClosed"
          >
            <vxe-column type="seq" title="序号" width="50"></vxe-column>
            <vxe-column field="name" title="科目名称" tree-node align="left" header-align="center"></vxe-column>
            <vxe-column
              field="amount"
              title="预算金额"
              :edit-render="{
                name: 'VxeNumberInput',
                immediate: true,
                showNegativeStatus: true,
                props: {
                  min: 0,
                  type: 'amount',
                  digits: 6
                }
              }"
              class-name="amount-cell"
              style="padding: 0 6px"
            ></vxe-column>
            <vxe-column v-if="parentRoute !== 'BudgetManagement'" field="actualAmount" title="实际金额">
              <template #default="{ row }">
                <span :style="{ color: getActualColor(row) }">{{ row.actualAmount }}</span>
              </template>
            </vxe-column>
          </vxe-table>
        </div>
        <div v-if="parentRoute === 'BudgetManagement'" class="button-area">
          <el-button type="primary" :loading="submitLoading" @click="save">保存</el-button>
        </div>
      </template>
    </normal-layout>
  </div>
</template>

<style scoped lang="scss">
::v-deep .panination {
  display: none !important;
}

.normal-layout {
  height: calc(100% - 50px);
  margin: 0;
  padding: 0;

  ::v-deep .normal-main .normal-center {
    padding: 0;
  }
}

.main-table {
  height: calc(100% - 50px);
}

.button-area {
  text-align: end;
  padding: 8px;
}
::v-deep .disabled-cell{
  background: #f5f5f5;
}
</style>
