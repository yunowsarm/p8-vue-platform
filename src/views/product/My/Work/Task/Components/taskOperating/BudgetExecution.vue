<script>
import { VxeColumn } from 'vxe-table'
import { P8Upload as CommonUpload } from 'p8-components-ui'

export default {
  name: 'BudgetExecution',
  components: { VxeColumn, CommonUpload },
  props: {
    taskId: {
      type: String,
      default: ''
    },
    isLeaf: {
      type: Boolean,
      default: false
    },
    approveType: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tableData: [],
      tableConfig: {
        showOverflowTooltip: true
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
          if (!this.approveType) return false
          return (row.ISLEAF === '是' || row.isleaf === '是' || row.isLeaf === '是') && !row.formula && this.isLeaf
        }
      }
    }
  },
  computed: {
    carryOutBudgetControl() {
      return this.$store.getters.carryOutBudgetControl
    }
  },
  created() {
    console.log(this.carryOutBudgetControl, 'carryOutBudgetControl')
    this.queryDeclaration()
  },
  methods: {
    queryDeclaration() {
      this.$api['planGanttManager.queryDeclaration']({ taskId: this.taskId, type: 'task' }).then((res) => {
        this.tableData = res.filter((item) => item.subjectBasePid)
      })
    },
    editActivated({row}){
      this.oldAmount = row.actualAmount
    },
    editClosed({row}){
      if(row.actualAmount === this.oldAmount) return
      if (this.carryOutBudgetControl === '1' && Number(row.actualAmount > row.amount)) {
        this.$set(row, 'actualAmount', row.amount)
        this.$message.error('实际金额不可超出预算金额')
      }
      this.$api['budgetDeclaration.dataCalculation']({ declarationRequests: this.tableData, propertyName: 'actualAmount' }).then((res) => {
        res.forEach((item) => {
          const node = this.tableData.find((n) => n.subjectBaseid === item.subjectBaseid)
          node.actualAmount = item.actualAmount
        })
      })
    },
    cellClassName({ row, column }) {
      if (column.property === 'actualAmount') {
        const amount = row.amount ?? 0
        const actualAmount = row.actualAmount ?? 0
        console.log(actualAmount > amount)
        return actualAmount > amount ? 'cell-red' : 'cell-green'
      } else {
        return ''
      }
      // console.log(row.)
    },
    uploadFile(file, row) {
      row.attachments = [file]
      this.$nextTick(() => {
        this.$refs.table.setAllTreeExpand(true)
      })
    },
    deleteFile(row) {
      row.attachments = []
      this.$nextTick(() => {
        this.$refs.table.setAllTreeExpand(true)
      })
    },
    downloadFile(row){
      const item = row.attachments[0]
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
    save() {
      const params = {
        taskId: this.taskId,
        declarationRequests: this.tableData,
        type: 'task'
      }
      this.$api['planGanttManager.saveDeclaration'](params).then((res) => {
        console.log(res)
        if (res.result) {
          this.$message.success('保存成功')
          this.$emit('save-success')
        } else {
          this.$message.error(res.resultMsg)
        }
      })
    }
  }
}
</script>

<template>
  <div class="main-area">
<!--    <div v-if="approveType" class="button-area" style="text-align: start">-->
<!--      <el-button type="primary">导入</el-button>-->
<!--    </div>-->
    <div :class="$route.name ==='TaskExecution'? 'main-table': 'main-table-approve'">
      <vxe-table
        ref="table"
        height="100%"
        border
        keep-source
        align="center"
        :data="tableData"
        :tableConfig="tableConfig"
        :tree-config="treeConfig"
        :edit-config="editConfig"
        :cell-class-name="cellClassName"
        @edit-activated='editActivated'
        @edit-closed="editClosed"
      >
        <vxe-column type="seq" title="序号" width="50"></vxe-column>
        <vxe-column field="name" title="科目名称" tree-node align="left" header-align="center"></vxe-column>
        <vxe-column field="amount" title="预算金额"></vxe-column>
        <vxe-column
          field="actualAmount"
          title="实际金额"
          :edit-render="{
            name: 'VxeNumberInput',
            immediate: true,
            showNegativeStatus: true,
            props: {
              min: 0
            }
          }"
          class-name="amount-cell"
          style="padding: 0 6px"
        ></vxe-column>
        <vxe-column field="attachments" title="证明材料">
          <template #default="{ row }">
            <common-upload v-if="!row?.attachments?.length && approveType" uploadSlot :uploadConfig="{ limit: 1, multiple: false }" @upload="(file) => uploadFile(file, row)">
              <div slot="upload">
                <el-button size="mini">上传</el-button>
              </div>
            </common-upload>
            <div v-else class="row-file">
              <span :class="!approveType ? 'file-name' : ''" @click='downloadFile(row)'>{{ row?.attachments ? row?.attachments[0]?.fileName : '' }}</span>
              <i v-if="approveType" class="el-icon-close" @click="deleteFile(row)"></i>
            </div>
          </template>
        </vxe-column>
      </vxe-table>
    </div>
    <div v-if="approveType" class="button-area">
      <el-button type="primary" @click="save">保存</el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.main-area {
  height: 100%;
}

.button-area {
  border-top: 1px solid #e1e1e1;
  text-align: end;
  padding: 8px;
}

.main-table {
  height: calc(100% - 106px);
}
.main-table-approve{
  height: 100%;
}

.common-upload {
  height: 28px;
}

.row-file {
  padding: 0 10px;
  display: flex;
  justify-content: center;
  align-items: center;

  .el-icon-close {
    margin-left: 10px;
    opacity: 0;
  }
}

.row-file:hover {
  color: #3491fa;
  cursor: pointer;

  .el-icon-close {
    color: #333;
    opacity: 1;
  }
}
.file-name{
  cursor: pointer;
  color: #409eff;
  text-decoration: none;
  transition: all 0.2s;
}
.file-name:hover{
  color: #66b1ff;
  text-decoration: underline;
}
::v-deep .cell-red {
  color: #f56c6c;
}

::v-deep .cell-green {
  color: #67c23a;
}
</style>
