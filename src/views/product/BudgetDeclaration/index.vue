<script>
import { P8Dialog as CommonDialog, P8NormalLayoutV1 as NormalLayout, P8VxeTable } from 'p8-components-ui'
import { VxeColumn, VxeTable } from 'vxe-table'
import { VxeNumberInput } from 'vxe-pc-ui'

export default {
  name: 'BudgetDeclaration',
  components: {
    P8VxeTable,
    NormalLayout,
    CommonDialog,
    VxeTable,
    VxeColumn,
    VxeNumberInput
  },
  props: {
    row: {
      type: Array,
      default: () => {
        return []
      }
    },
    configParmars: {
      type: Object,
      default: () => {
        return {}
      }
    },
    isView:{
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      projectId: null,
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
          if(this.isView) return false
          if (column.field === 'amount') {
            return (row.ISLEAF === '是' || row.isleaf === '是'|| row.isLeaf === '是') && !row.formula
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
      submitLoading:false,
      viewVisible: false
    }
  },
  async created() {
    console.log(this.configParmars,'configParmars')
    if (this.row && this.row.length) {
      this.projectId = this.row[0].ID
    } else {
      this.projectId = this.configParmars.id
      if (!this.projectId) {
        this.viewVisible = true
        this.$message({
          message: '请先创建项目',
          type: 'warning'
        })
      }
    }
    if (this.projectId) {
      await this.getTemplateList()
      await this.getDefaultTemplate()
    }
    // this.getTemplateDetail()
  },
  methods: {
    // 获取模板列表
    getTemplateList() {
      const params = {
        sqlId: 'd3ee87ce9c54ea5269a240b42b6f1ceb',
        reportParam: {},
        sqlParam: {
          formType:{
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
    getDefaultTemplate() {
      this.$api['budgetDeclaration.queryDeclaration']({ wholeId: this.projectId }).then((res) => {
        if (res) {
          this.tableData = res.filter(item => item.subjectBasePid)
        }
      })
      // console.log(this.templateList)
      // const id = this.templateList.find((item) => item.IS_DEFAULT === '1').ID
      // this.tableData = await this.getTemplateDetail(id)
    },
    // 获取模板详情（科目）
    getTemplateDetail(id) {
      this.$api['budgetTemplateManagement.queryDetails']({ id: id }).then((res) => {
        if (res) {
          this.subjectList = res
          this.$nextTick(() => {
            this.$refs.subjectTable.$refs.table.setAllTreeExpand(true)
          })
        }
      })
    },
    async openTemplateList() {
      const node = this.templateList[0]
      this.getTemplateDetail(node.ID)
      this.visible = true
      this.$nextTick(() => {
        this.$refs.templateTable.$refs.table.setCurrentRow(node)
      })
    },
    handleCancel() {
      this.visible = false
    },
    handleOk() {
      this.tableData = this.subjectList.map((item) => {
        return {
          ...item,
          id: '',
          notes: '',
          amount: 0
        }
      }).filter(item => !!item.subjectBasePid)
      this.visible = false
      this.$nextTick(() => {
        this.$refs.table.setAllTreeExpand(true)
      })
    },
    rowClick(row) {
      this.getTemplateDetail(row.ID)
    },
    editClosed(){
      this.$api['budgetDeclaration.dataCalculation']({declarationRequests:this.tableData}).then(res => {
        res.forEach(item => {
          const node = this.tableData.find(n => n.subjectBaseid === item.subjectBaseid)
          node.amount = item.amount
        })
      })
    },
    close(){
      this.$emit('close')
    },
    save() {
      this.submitLoading = true
      const params = {
        wholeId:this.projectId,
        declarationRequests:this.tableData
      }
      this.$api['budgetDeclaration.saveDeclaration'](params).then(res => {
        if(res){
          this.$message.success('保存成功！')
        }else{
          this.$message.error('保存失败！')
        }
        this.submitLoading = false
        this.$nextTick(() => {
          this.$refs.table.setAllTreeExpand(true)
        })
      })
    }
  }
}
</script>

<template>
  <div style="height: 100%">
    <div style='height: calc(100% - 50px)'>
      <vxe-table class="main-table" height='100%' border keep-source ref="table" align="center" :data="tableData" :tableConfig="tableConfig" :tree-config="treeConfig" :edit-config="editConfig" @edit-closed='editClosed'>
        <vxe-column type="seq" title="序号" width="50"></vxe-column>
        <vxe-column field="name" title="科目名称" tree-node align="left" header-align="center"></vxe-column>
        <vxe-column field="code" title="科目编号"></vxe-column>
        <vxe-column
          field="amount"
          title="金额"
          :edit-render="{
          name: 'VxeNumberInput',
          immediate: true,
          showNegativeStatus: true
        }"
          class-name="amount-cell"
          style="padding: 0 6px"
        ></vxe-column>
        <vxe-column
          field="notes"
          title="备注"
          :edit-render="{
          name: 'VxeInput',
          immediate: true,
          showNegativeStatus: true
        }"
        ></vxe-column>
      </vxe-table>
    </div>

    <div v-if='!isView' class="button-area">

      <el-button v-if='!isView' @click="openTemplateList">载入模板</el-button>
      <el-button v-if='!isView' type="primary" :loading="submitLoading" @click="save">保存</el-button>
<!--      <el-button v-else @click='close'>关闭</el-button>-->
    </div>
    <common-dialog title="选择模板" :visible="visible" @handle-cancel="handleCancel" @handle-ok="handleOk" width="65%" @close="handleCancel" :dialogHeight="600">
      <template #dialog>
        <normal-layout layoutCode="selectBudgetTemplate" :split-default-left-width="30" :header-visible="false" :split-layout="true">
          <template #west>
            <p8-vxe-table
              ref="templateTable"
              :pagination="false"
              :columns="templateColumns"
              :noApiTableData="templateList"
              :tableConfig="tableConfig"
              :row-config="rowConfig"
              @row-click="rowClick"
            ></p8-vxe-table>
          </template>
          <template #center>
            <p8-vxe-table ref="subjectTable" :pagination="false" :columns="subjectColumns" :noApiTableData="subjectList" :tableConfig="tableConfig" :tree-config="treeConfig"></p8-vxe-table>
          </template>
        </normal-layout>
      </template>
    </common-dialog>
    <div v-if="viewVisible"
         class="viewVisible"></div>
  </div>
</template>

<style scoped lang="scss">
.button-area {
  border-top: 1px solid #e1e1e1;
  text-align: end;
  padding: 8px;
}

.main-table {
  margin-top: 6px;
  height: 100%;
}

.amount-cell {
  padding: 0 6px !important;
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
.viewVisible {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0.5);
}
::v-deep .panination {
  display: none !important;
}
</style>
