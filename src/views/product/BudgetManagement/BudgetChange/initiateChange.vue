<script>
import { VxeColumn } from 'vxe-table'

export default {
  name: 'initiateChange',
  components: { VxeColumn },
  props: {
    projectInfo: {
      type: Object,
      default: () => { }
    },
    row: {
      type: Array,
      default: () => []
    },
    customParams: {
      type: Object,
      default: () => { }
    },
    currEntityId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      projectInfo: null,
      changeId: '',
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
          return (row.ISLEAF === '是' || row.isleaf === '是' || row.isLeaf === '是') && !row.formula && !this.currEntityId
        }
      },
      formConf: { closeForm: false },
      formData: {
        changeReason: ''
      },
      rules: {
        changeReason: [
          {
            required: true,
            message: '请输入变更原因',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created () {
    this.queryDetails()
  },
  methods: {
    // 查询详情
    queryDetails () {
      let params = {
        wholeId: (this.projectInfo?.ID || this.projectInfo?.WHOLEID) ?? ''
      }
      if (this.row?.length > 0 && this.customParams.title === '修改') {
        params.id = this.row[0].ID
      } else if (this.currEntityId) {
        params.id = this.currEntityId
      }
      this.$api['budgetManagement.queryDetails'](params).then((res) => {
        if (res) {
          this.changeId = res.id || null
          if (params.id) {
            this.tableData = res.changeDtls
          } else {
            this.tableData = res.changeDtls.map((item) => {
              return {
                ...item,
                amount: item.amountOld
              }
            })
          }
          this.formData.changeReason = res.describes || ''
        }
      })
    },
    editActivated ({ row }) {
      this.oldAmount = row.amount
    },
    editClosed ({ row }) {
      if (row.amount === this.oldAmount) return
      this.$api['budgetDeclaration.dataCalculation']({ declarationRequests: this.tableData }).then((res) => {
        res.forEach((item) => {
          const node = this.tableData.find((n) => n.subjectBaseid === item.subjectBaseid)
          node.amount = item.amount
          if (node.amountOld < node.amount) {
            node.type = '调增'
          } else if (node.amountOld > node.amount) {
            node.type = '调减'
          } else {
            node.type = ''
          }
        })
      })
    },
    save () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const params = {
            wholeId: this.projectInfo?.ID ?? null,
            changeDetailRequests: this.tableData,
            describes: this.formData.changeReason
          }
          if (this.changeId) {
            params.id = this.changeId
          }
          this.$api['budgetManagement.saveDetails'](params).then((res) => {
            if (res) {
              this.$message.success('保存成功')
              this.$emit('save-success')
              this.$emit('close')
            } else {
              this.$message.error('保存失败')
            }
          })
        } else {
          return false
        }
      })
    },
    cellClassName ({ row, column }) {
      if (this.currEntityId) return
      const classes = []
      if (column.property === 'amount') {
        if (!((row.ISLEAF === '是' || row.isleaf === '是' || row.isLeaf === '是') && !row.formula && !this.currEntityId)) {
          classes.push('disabled-cell')
        }
      }
      return classes.join(' ')
    }
  }
}
</script>

<template>
  <div class="main-area">
    <div class='content'>
      <div class="main-table">
        <vxe-table border
                   height="100%"
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
                      min-width="150px"
                      tree-node
                      align="left"
                      header-align="center"></vxe-column>
          <vxe-column field="amountOld"
                      min-width="150px"
                      title="原预算金额"></vxe-column>
          <vxe-column field="amount"
                      title="变更预算金额"
                      min-width="150px"
                      :edit-render="{
            name: 'VxeNumberInput',
            immediate: true,
            showNegativeStatus: true,
            props: {
              min: 0,
              type: 'amount',
              digits: 6
            }
          }"></vxe-column>
          <vxe-column field="type"
                      min-width="150px"
                      title="变更类型">
            <template #default="{ row }">
              <span>{{ row.type }}</span>
            </template>
          </vxe-column>
        </vxe-table>
      </div>
      <el-form ref="form"
               class="form-area"
               :model="formData"
               :rules="rules"
               label-width="100px">
        <el-form-item label="变更原因："
                      prop="changeReason">
          <el-input v-model="formData.changeReason"
                    type="textarea"
                    :autosize='{minRows:4,maxRows:6}'
                    resize="none"
                    :readonly="!!currEntityId"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div v-if="!currEntityId"
         class="button-area">
      <el-button type="primary"
                 @click="save">保存</el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.main-area {
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.content {
  height: calc(100% - 50px);
  display: flex;
  flex-direction: column;
  overflow: auto;
}
.main-table {
  height: 75%;
  margin: 12px;
}

.form-area {
  flex: 1;
  margin: 12px;
}

.button-area {
  border-top: 1px solid #e1e1e1;
  text-align: end;
  padding: 8px;
}
::v-deep .disabled-cell {
  background: #f5f5f5;
}
</style>
