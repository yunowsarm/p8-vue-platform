<script>
import { P8Dialog as CommonDialog, P8NormalLayoutV1 as NormalLayout, P8VxeTable } from 'p8-components-ui'
import { VxeColumn, VxeTable } from 'vxe-table'

export default {
  name: 'BudgetDeclaration',
  components: {
    P8VxeTable,
    NormalLayout,
    CommonDialog,
    VxeTable,
    VxeColumn
  },
  props: {
    thirdMenuParam: {
      type: Object,
      default: () => {
        return {}
      }
    },
    currEntityId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      projectId: null,
      type: '',
      budgetState: '',
      tableData: [],
      tableConfig: {
        showOverflowTooltip: true
      },
      rowConfig: {
        isCurrent: true
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
          if (this.isView) return false
          if (column.field === 'amount') {
            // 预算未发布时，无计算公式的叶子节点可编辑
            return (row.ISLEAF === '是' || row.isleaf === '是' || row.isLeaf === '是') && !row.formula && this.isEdit
          } else {
            return !!row.subjectBasePid
          }
        }
      },
      templateColumns: [
        {
          title: '序号',
          type: 'index',
          align: 'center',
          width: '50',
          headerAlign: 'center'
        },
        {
          title: '模板名称',
          dataIndex: 'NAME',
          sortable: false,
          align: 'center',
          headerAlign: 'center',
          treeNode: true
        }
      ],
      templateList: [],
      subjectColumns: [
        {
          title: '序号',
          type: 'index',
          align: 'center',
          width: '50',
          headerAlign: 'center'
        },
        {
          title: '科目名称',
          dataIndex: 'name',
          sortable: false,
          align: 'center',
          headerAlign: 'center',
          treeNode: true
        },
        {
          title: '科目编号',
          dataIndex: 'code',
          sortable: false,
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '科目类型',
          dataIndex: 'typeName',
          sortable: false,
          align: 'center',
          headerAlign: 'center'
        }
      ],
      subjectList: [],
      visible: false,
      submitLoading: false
    }
  },
  computed: {
    parentRoute () {
      const matched = this.$route.matched
      if (matched.length > 1) {
        return matched[matched.length - 2].name
      }
      return null
    },
    isEdit () {
      const editStatus = ['编制中', '发布驳回']
      return editStatus.includes(this.thirdMenuParam.BUDGETSTATUSNAME) && this.parentRoute === 'BudgetManagement'
    }
  },
  created () {
    if (this.thirdMenuParam) {
      this.projectId = this.thirdMenuParam.ID
      this.budgetState = this.thirdMenuParam.BUDGETSTATUSNAME
    }
    if (this.projectId || this.currEntityId) {
      this.getWholeSumBudget()
    }
  },
  methods: {
    getWbsColor (row) {
      const wbsAmount = row.wbsAmount ?? 0
      const amount = row.amount ?? 0
      if (wbsAmount > amount) {
        return '#F56C6C'
      } else {
        return '#67C23A'
      }
    },
    getActualColor (row) {
      const actualColor = row.actualColor ?? 0
      const amount = row.amount ?? 0
      if (actualColor > amount) {
        return '#F56C6C'
      } else {
        return '#67C23A'
      }
    },
    // 获取模板列表
    getTemplateList () {
      const params = {
        sqlId: 'd3ee87ce9c54ea5269a240b42b6f1ceb',
        reportParam: {},
        sqlParam: {
          formType: {
            mode: '=',
            relation: 'and',
            value: 'whole'
          }
        },
        permissionVo: {
          router: this.$route.name,
          resourceId: ''
        }
      }
      return this.$api['kanbanComponent.getViewData'](params).then((res) => {
        if (res) {
          this.templateList = res
        }
      })
    },
    getWholeSumBudget () {
      this.$api['budgetManagement.getWholeSumBudget']({ wholeId: this.projectId || this.currEntityId }).then((res) => {
        if (res) {
          this.tableData = res.data.filter((item) => item.subjectBasePid)
          this.type = res.type
          if (this.type === 'template') {
            this.getTemplateList()
          }
        }
      })
    },
    // 获取模板详情（科目）
    getTemplateDetail (id) {
      this.$api['budgetTemplateManagement.queryDetails']({ id: id }).then((res) => {
        if (res) {
          this.subjectList = res
          this.$nextTick(() => {
            this.$refs.subjectTable.$refs.table.setAllTreeExpand(true)
          })
        }
      })
    },
    async openTemplateList () {
      const node = this.templateList[0]
      this.getTemplateDetail(node.ID)
      this.visible = true
      this.$nextTick(() => {
        this.$refs.templateTable.$refs.table.setCurrentRow(node)
      })
    },
    useWbsAmount () {
      this.tableData.forEach((item) => {
        item.amount = item.wbsAmount
      })
    },
    handleCancel () {
      this.visible = false
    },
    handleOk () {
      this.tableData = this.subjectList
        .map((item) => {
          return {
            ...item,
            id: '',
            wbsAmount: 0,
            amount: 0,
          }
        })
        .filter((item) => !!item.subjectBasePid)
      this.visible = false
      this.$nextTick(() => {
        this.$refs.table.setAllTreeExpand(true)
      })
    },
    rowClick (row) {
      this.getTemplateDetail(row.ID)
    },
    editActivated({row}){
      this.oldAmount = row.amount
    },
    editClosed ({row}) {
      if(row.amount === this.oldAmount) return
      this.$api['budgetDeclaration.dataCalculation']({ declarationRequests: this.tableData }).then((res) => {
        res.forEach((item) => {
          const node = this.tableData.find((n) => n.subjectBaseid === item.subjectBaseid)
          node.amount = item.amount
        })
      })
    },
    close () {
      this.$emit('close')
    },
    save () {
      this.submitLoading = true
      const params = {
        wholeId: this.projectId,
        declarationRequests: this.tableData
      }
      this.$api['budgetDeclaration.saveDeclaration'](params).then((res) => {
        if (res) {
          this.$message.success('保存成功！')
          this.type = 'whole'
        } else {
          this.$message.error('保存失败！')
        }
        this.submitLoading = false
        this.$nextTick(() => {
          this.$refs.table.setAllTreeExpand(true)
        })
      })
    },
    cellClassName({ row, column }) {
      if(!this.isEdit) return
      const classes = []
      if (column.property === 'amount') {
        if(!((row.ISLEAF === '是' || row.isleaf === '是' || row.isLeaf === '是') && !row.formula && this.isEdit)){
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
    <div :class="parentRoute === 'BudgetManagement' ? 'main-table' : 'main-table-analysis'">
      <vxe-table border
                 height='100%'
                 keep-source
                 ref="table"
                 align="center"
                 :data="tableData"
                 :tableConfig="tableConfig"
                 :tree-config="treeConfig"
                 :edit-config="editConfig"
                 :cell-class-name="cellClassName"
                 @edit-activated='editActivated'
                 @edit-closed="editClosed">
        <vxe-column type="seq"
                    title="序号"
                    width="50"></vxe-column>
        <vxe-column field="name"
                    title="科目名称"
                    tree-node
                    align="left"
                    header-align="center"></vxe-column>
        <vxe-column field="amount"
                    title="预算金额"
                    :edit-render="{
          name: 'VxeNumberInput',
          immediate: true,
          showNegativeStatus: true,
          props:{
            min: 0,
            type:'amount',
            digits: 6
          }
        }"
                    class-name="amount-cell"
                    style="padding: 0 6px"></vxe-column>
        <vxe-column v-if="parentRoute === 'BudgetAnalysis'"
                    field="actualAmount"
                    title="实际金额">
          <template #default='{row}'>
            <span :style='{color:getActualColor(row)}'>{{row.actualAmount}}</span>
          </template>
        </vxe-column>
        <vxe-column v-else
                    field="wbsAmount"
                    title="WBS预算汇总金额">
          <template #default='{row}'>
            <span :style='{color:getWbsColor(row)}'>{{row.wbsAmount}}</span>
          </template>
        </vxe-column>
        <vxe-column v-if="parentRoute === 'BudgetAnalysis'"
                    field="controlRate"
                    title="执行率">
          <template #default='{row}'>
            <span>{{`${row.controlRate ?? 0}%`}}</span>
          </template>
        </vxe-column>
      </vxe-table>
    </div>
    <div v-if="isEdit"
         class="button-area">
      <el-button v-if="type === 'template' && isEdit"
                 @click="openTemplateList">载入模板</el-button>
      <el-button v-if="isEdit "
                 @click="useWbsAmount">使用汇总金额</el-button>
      <el-button v-if="isEdit"
                 type="primary"
                 :loading="submitLoading"
                 @click="save">保存</el-button>
    </div>
    <common-dialog title="选择模板"
                   :visible="visible"
                   @handle-cancel="handleCancel"
                   @handle-ok="handleOk"
                   width="65%"
                   @close="handleCancel"
                   :dialogHeight="600">
      <template #dialog>
        <normal-layout layoutCode="selectBudgetTemplate"
                       :split-default-left-width="30"
                       :header-visible="false"
                       :split-layout="true">
          <template #west>
            <p8-vxe-table ref="templateTable"
                          :pagination="false"
                          :columns="templateColumns"
                          :noApiTableData="templateList"
                          :tableConfig="tableConfig"
                          :row-config="rowConfig"
                          @row-click="rowClick"></p8-vxe-table>
          </template>
          <template #center>
            <p8-vxe-table ref="subjectTable"
                          :pagination="false"
                          :columns="subjectColumns"
                          :noApiTableData="subjectList"
                          :tableConfig="tableConfig"
                          :tree-config="treeConfig"></p8-vxe-table>
          </template>
        </normal-layout>
      </template>
    </common-dialog>
  </div>
</template>

<style scoped lang="scss">
.button-area {
  border-top: 1px solid #e1e1e1;
  text-align: end;
  padding: 8px;
}

.main-table {
  //margin-top: 6px;
  height: calc(100% - 50px) !important;
}
.main-table-analysis {
  height: 100%;
}

.amount-cell {
  padding: 0 6px !important;
}

::v-deep .panination {
  display: none !important;
}

::v-deep .vxe-number-input {
  width: 95% !important;
}

::v-deep .vxe-input {
  width: 95% !important;
}

.normal-layout {
  height: calc(100% - 50px);
  margin: 0;
}
::v-deep .disabled-cell{
  background: #f5f5f5;
}
</style>
