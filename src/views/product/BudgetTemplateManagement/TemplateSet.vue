<script>
import { P8Dialog as CommonDialog, P8NormalLayoutV1 as NormalLayout, P8VxeTable as VxeTable } from 'p8-components-ui'
import FormulaEditor from '@/components/FormulaEditor/index.vue'

export default {
  name: 'FormEditor',
  components: {
    NormalLayout,
    FormulaEditor,
    CommonDialog,
    VxeTable
  },
  props: {
    row: {
      type: Array
    }
  },
  data() {
    return {
      visible: false,
      formula: '',
      formulaLabel: '',
      dialogConfig: {
        modal: true,
        'append-to-body': true
      },
      dataViewId: '', // 修改页面id
      tableConfig: {
        showOverflowTooltip: true
      },
      treeConfig: {
        transform: true,
        rowField: 'ID',
        parentField: 'PARENT_ID',
        expandAll: true
      },
      templateTreeConfig: {
        transform: true,
        rowField: 'subjectBaseid',
        parentField: 'subjectBasePid',
        expandAll: true
      },
      checkboxConfig: {
        checkFiled: 'ID',
        checkStrictly: true,
        showHeader: false
      },
      budgetSubjectColumns: [
        {
          type: 'checkbox',
          align: 'center',
          width: '50',
          headerAlign: 'center'
        },
        {
          title: '序号',
          type: 'index',
          align: 'center',
          width: '50',
          headerAlign: 'center'
        },
        {
          title: '科目名称',
          dataIndex: 'NAME',
          sortable: false,
          align: 'left',
          headerAlign: 'center',
          treeNode: true
        },
        {
          title: '科目编号',
          dataIndex: 'CODE',
          sortable: false,
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '科目类型',
          dataIndex: 'TYPENAME',
          sortable: false,
          align: 'center',
          headerAlign: 'center'
        }
      ],
      budgetSubjectData: [],
      budgetTemplateColumns: [
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
          align: 'left',
          headerAlign: 'center',
          treeNode: true,
          scopedSlots: { customRender: 'custom' }
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
        },
        {
          title: '操作',
          align: 'center',
          dataIndex: 'operation',
          scopedSlots: { customRender: 'custom' }
        }
      ],
      budgetTemplateData: [],
      deletedSubject: [],
      currentRow: {}
    }
  },
  created() {},
  async mounted() {
    await this.getFormulaParams()
    await this.getBudgetSubject()
    await this.getTemplateDetail()
    // console.log(this.row)
    // 修改回显
    // if (this.row && this.row.length > 0 && this.type === '修改') {
    //   this.dataViewId = this.row[0].ID
    // }
  },
  methods: {
    getTemplateDetail() {
      return this.$api['budgetTemplateManagement.queryDetails']({ id: this.row[0].ID }).then((res) => {
        if (res) {
          this.budgetTemplateData = res
          res.forEach((item) => {
            const node = this.budgetSubjectData.find((n) => n.ID === item.subjectBaseid)
            if (node) {
              this.$refs.subjectTable.$refs.table.setCheckboxRow(node, true)
            }
          })
        }
      })
    },
    isWarn(row) {
      if (!row.formula) return false
      const used = row.formula.match(/[a-zA-Z0-9_]\w*/g) || []
      const available = this.elementsFilter().map((item) => item.value)
      return used.filter((item) => isNaN(item)).some((item) => !available.includes(item))
    },
    getFormulaParams() {
      const params = {
        sqlId: '08c487eaa0af973f848ead80dc93c8c0',
        reportParam: {},
        sqlParam: {},
        permissionVo: {
          router: this.$route.name,
          resourceId: ''
        }
      }

      return this.$api['kanbanComponent.getViewData'](params).then((res) => {
        if (res) {
          this.elements = res.map((item) => {
            return {
              label: item.LABEL,
              value: item.VALUE
            }
          })
        }
      })
    },
    elementsFilter() {
      console.log(this.elements)
      console.log(this.budgetTemplateData)
      return this.elements.filter((el) => {
        return this.budgetTemplateData.find((item) => item.subjectBaseid === el.value)
      })
    },
    // 获取科目库
    getBudgetSubject() {
      const params = {
        sqlId: 'cc3a158823b4304ab01b24710733081b',
        reportParam: {},
        sqlParam: {
          formType: {
            mode: '=',
            relation: 'and',
            value: 'template'
          }
        },
        permissionVo: {
          router: this.$route.name,
          resourceId: ''
        }
      }
      return this.$api['kanbanComponent.getViewData'](params).then((res) => {
        if (res) {
          this.budgetSubjectData = res
        }
      })
    },
    // 勾选/取消勾选
    selectionChange(records, row, checked) {
      if (checked) {
        this.addSubject(row)
      } else {
        this.removeSubject(row, 'ID')
      }
    },

    // 左侧勾选科目
    addSubject(row) {
      debugger
      const mappingSubject = (s) => {
        return {
          id: '',
          budgetTemplateId: this.row[0].ID || '',
          subjectBaseid: s.ID,
          name: s.NAME,
          code: s.CODE,
          typeName: s.TYPENAME,
          subjectBasePid: s.PARENT_ID || null,
          formulaview: s.FORMULAVIEW || '',
          formula: s.FORMULA || '',
          isDeleted: ''
        }
      }
      this.budgetTemplateData.push(mappingSubject(row))
      const subjectTable = this.$refs.subjectTable.$refs.table
      const Descendants = this.getDescendants(row.ID)
      Descendants.forEach((item) => {
        if (!this.budgetTemplateData.find((i) => i.subjectBaseid === item.ID)) {
          this.budgetTemplateData.push(mappingSubject(item))
          subjectTable.setCheckboxRow(item, true)
        }
      })
      const ancestors = this.getAncestors(row.ID)
      ancestors.forEach((ancestor) => {
        if (!this.budgetTemplateData.find((i) => i.subjectBaseid === ancestor.ID)) {
          this.budgetTemplateData.push(mappingSubject(ancestor))
          subjectTable.setCheckboxRow(ancestor, true)
        }
      })
      this.$nextTick(() => {
        this.$refs.templateTable.$refs.table.setAllTreeExpand(true)
      })
    },
    // 左侧取消勾选
    removeSubject(row, idKey) {
      const idsToRemove = [row[idKey], ...this.getDescendants(row[idKey]).map((item) => item.ID)]
      idsToRemove.forEach((id) => {
        const node = this.budgetSubjectData.find((n) => n.ID === id)
        if (node) {
          this.$refs.subjectTable.$refs.table.setCheckboxRow(node, false)
        }
        const templateNode = this.budgetTemplateData.find((n) => n.subjectBaseid === id)
        if (templateNode && templateNode.id) {
          this.deletedSubject.push({ ...templateNode, isDeleted: '1' })
        }
      })
      this.budgetTemplateData = this.budgetTemplateData.filter((item) => !idsToRemove.includes(item.subjectBaseid))
      this.$nextTick(() => {
        this.$refs.templateTable.$refs.table.setAllTreeExpand(true)
      })
    },
    // 获取所有父节点
    getAncestors(id) {
      const ancestors = []
      let current = this.budgetSubjectData.find((i) => i.ID === id)
      while (current && current.PARENT_ID) {
        const parent = this.budgetSubjectData.find((i) => i.ID === current.PARENT_ID)
        if (parent) {
          ancestors.push(parent)
          current = parent
        } else {
          break
        }
      }
      return ancestors
    },
    // 获取所有子节点
    getDescendants(id) {
      const descendants = []
      const findChildren = (pid) => {
        const children = this.budgetSubjectData.filter((i) => i.PARENT_ID === pid)
        children.forEach((c) => {
          descendants.push(c)
          findChildren(c.ID)
        })
      }
      findChildren(id)
      return descendants
    },
    // 设置公式
    setFormula(row) {
      this.currentRow = row
      this.formula = row.formula
      this.visible = true
    },
    // 获取公式label
    getFormulaLabel(formulaLabel) {
      this.formulaLabel = formulaLabel
    },
    // 关闭对话框
    handleCancel() {
      this.currentRow = {}
      this.formula = ''
      this.visible = false
    },
    // 确定对话框
    handleOk() {
      this.currentRow.formula = this.formula
      this.currentRow.formulaview = this.formulaLabel
      this.handleCancel()
      // console.log(this.budgetTemplateData)
    },
    save() {
      const isSave = this.budgetTemplateData.some((item) => this.isWarn(item))
      if (isSave) {
        this.$message.error('科目公式缺少依赖项，请检查')
        return
      }

      const params = {
        id: this.row[0].ID,
        detailRequests: [...this.budgetTemplateData, ...this.deletedSubject]
      }

      this.$api['budgetTemplateManagement.saveDetails'](params).then((res) => {
        if (res) {
          this.$message.success('保存成功')
          this.$emit('close')
        } else {
          this.$message.error('保存失败')
        }
      })
    }
  }
}
</script>

<template>
  <div style="height: 100%">
    <normal-layout layoutCode="BudgetTemplateEditor" :split-default-left-width="50" :header-visible="false" :split-layout="true">
      <template #west>
        <div class="title">
          <i class="p8 icon-tuzhuang" style="margin-right: 6px"></i>
          预算科目库
        </div>
        <div class="table-area">
          <vxe-table
            class="table-area"
            ref="subjectTable"
            :pagination="false"
            :columns="budgetSubjectColumns"
            :noApiTableData="budgetSubjectData"
            :tableConfig="tableConfig"
            :treeConfig="treeConfig"
            :checkboxConfig="checkboxConfig"
            @selection-change="selectionChange"
          ></vxe-table>
        </div>
      </template>
      <template #center>
        <div class="title"><i class="p8 icon-zongzhuang" style="margin-right: 6px"></i>预算模板</div>
        <div class="table-area">
          <vxe-table
            ref="templateTable"
            :pagination="false"
            :columns="budgetTemplateColumns"
            :noApiTableData="budgetTemplateData.filter((item) => item.subjectBasePid)"
            :tableConfig="tableConfig"
            :treeConfig="templateTreeConfig"
          >
            <template #name="{ scope }">
              <el-tooltip placement="top" content="公式无法计算，请添加依赖项或修改公式">
                <i v-if="isWarn(scope.row)" class="warning-icon el-icon-warning"></i>
              </el-tooltip>
              <span>{{ scope.row.name }}</span>
            </template>
            <template #operation="{ scope }">
              <el-button type="text" @click="setFormula(scope.row)">
                <i class="p8 icon-jisuanqi"></i>
              </el-button>
              <el-button type="text" @click="removeSubject(scope.row, 'subjectBaseid')">
                <i class="p8 icon-shanchu"></i>
              </el-button>
            </template>
          </vxe-table>
        </div>
      </template>
    </normal-layout>
    <div class="button-area">
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" @click="save">保存</el-button>
    </div>
    <common-dialog title="设置计算公式" :visible="visible" @handle-cancel="handleCancel" @handle-ok="handleOk" width="65%" @close="handleCancel" :dialogHeight="600">
      <template #dialog>
        <formula-editor v-if="visible" ref="formula" v-model="formula" :elements="elementsFilter()" @getFormulaLabel="getFormulaLabel"></formula-editor>
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

.warning-icon {
  color: #f00;
  margin-right: 4px;
}

.normal-layout {
  height: calc(100% - 50px) !important;
  margin: 0;
  padding-left: 0;
}

.title {
  height: 40px;
  line-height: 40px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  padding: 0 8px;
  background-color: #f5f7fa;
  color: #333333;
  font-weight: 600;
}

.table-area {
  height: calc(100% - 40px);
}

::v-deep .normal-layout .normal-main .normal-center {
  padding-left: 0;
}

::v-deep .panination {
  display: none !important;
}
</style>
