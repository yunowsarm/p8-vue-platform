<script>
import { VxeColumn } from 'vxe-table'

export default {
  name: 'initiateChange',
  components: { VxeColumn },
  props: {
    row: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      projectInfo: null,
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
          return (row.ISLEAF === '是' || row.isleaf === '是' || row.isLeaf === '是') && !row.formula
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
  created() {
    // 获取三级菜单参数
    let parent = this.$parent
    while (parent) {
      if (parent.thirdMenuParam && Object.keys(parent.thirdMenuParam).length > 0) {
        this.projectInfo = parent.thirdMenuParam
        break
      }
      parent = parent.$parent
    }
    this.queryDetails()
  },
  methods: {
    // 查询详情
    queryDetails() {
      let params = {
        wholeId: this.projectInfo.ID
      }
      if(this.row?.length > 1){
        params.id = row[0].id
      }
      this.$api['budgetManagement.queryDetails'](params).then((res) => {
        if (res) {
          this.tableData = res.map((item) => {
            return {
              ...item,
              amount: item.amountOld
            }
          })
        }
      })
    },
    editClosed() {
      this.$api['budgetDeclaration.dataCalculation']({ declarationRequests: this.tableData }).then((res) => {
        res.forEach((item) => {
          const node = this.tableData.find((n) => n.subjectBaseid === item.subjectBaseid)
          node.amount = item.amount
        })
      })
    },
    save() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const params = {
            wholeId: this.projectInfo.ID,
            changeDetailRequests: this.tableData,
            describes: this.formData.changeReason
          }
          this.$api['budgetManagement.saveDetails'](params).then((res) => {
            console.log(res)
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
    }
  }
}
</script>

<template>
  <div class="main-area">
    <div class="main-table">
      <vxe-table border height="100%" keep-source ref="table" align="center" :data="tableData" :tableConfig="tableConfig" :tree-config="treeConfig" :edit-config="editConfig" @edit-closed="editClosed">
        <vxe-column type="seq" title="序号" width="50"></vxe-column>
        <vxe-column field="name" title="科目名称" tree-node align="left" header-align="center"></vxe-column>
        <vxe-column field="amountOld" title="原预算金额"></vxe-column>
        <vxe-column
          field="amount"
          title="变更预算金额"
          :edit-render="{
            name: 'VxeInput',
            immediate: true,
            showNegativeStatus: true
          }"
        ></vxe-column>
        <vxe-column field="code" title="变更类型"></vxe-column>
      </vxe-table>
    </div>
    <el-form ref="form" class="form-area" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="变更原因：" prop="changeReason">
        <el-input v-model="formData.changeReason" type="textarea" :rows="4" resize="none"></el-input>
      </el-form-item>
    </el-form>
    <div class="button-area">
      <el-button type="primary" @click="save">保存</el-button>
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

.main-table {
  margin: 12px;
  flex: 1;
}

.form-area {
  margin: 12px;
}

.button-area {
  border-top: 1px solid #e1e1e1;
  text-align: end;
  padding: 8px;
}
</style>
