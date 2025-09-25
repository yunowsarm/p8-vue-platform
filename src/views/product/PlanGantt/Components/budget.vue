<script>
import { VxeColumn, VxeTable } from 'vxe-table'
import _cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'budget',
  components: {
    VxeColumn,
    VxeTable
  },
  props: {
    taskId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      mode:'',
      tableData: [],
      analysisData:[],
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
          return (row.ISLEAF === '是' || row.isleaf === '是' || row.isLeaf === '是') && !row.formula && this.mode === 'analysis';
        }
      },
    }
  },
  watch:{
    taskId:{
      handler(val){
        if(val){
          this.queryDeclaration(val)
        }
      },
      immediate:true
    },
    mode:{
      handler(val){
        if(val === 'pool'){
          this.getPoolInfo(val)
        }else{
          this.tableData = _cloneDeep(this.analysisData)
          this.$nextTick(() => {
            this.$refs.table.setAllTreeExpand(true)
          })
        }
      },
      immediate:true
    }
  },
  methods:{
    queryDeclaration(id){
      this.$api['planGanttManager.queryDeclaration']({taskId: id, type:'plan'}).then(res => {
        this.tableData = res.filter(item => item.subjectBasePid).map(item => {
          return {
            ...item,
            amount: item.amount ?? 0
          }
        })
        this.mode = this.tableData[0].type || 'pool'
        if(this.mode === 'analysis'){
          this.analysisData = _cloneDeep(this.tableData)
        }else{
          const arr = res.map(item => {
            return {
              ...item,
              amount: 0
            }
          })
          this.analysisData = _cloneDeep(arr)
        }
      })
    },
    getPoolInfo(){
      this.$api['planGanttManager.getPoolInfoByTaskId']({taskId: this.taskId}).then(res => {
        res.forEach(item => {
          const node = this.tableData.find(n => n.subjectBaseid === item.subjectBaseid)
          node.amount = item.amount ?? 0
        })
      })
    },
    save(){
      const params = {
        taskId: this.taskId,
        type: this.mode,
        declarationRequests:this.tableData
      }
      this.$api['planGanttManager.saveDeclaration'](params).then(res => {
        console.log(res)
        if(res.result){
          this.$message.success("保存成功")
          this.$emit("save-success")
        }else{
          this.$message.error(res.resultMsg)
        }
      })
    },
    editClosed(){
      this.$api['budgetDeclaration.dataCalculation']({declarationRequests:this.tableData}).then(res => {
        res.forEach(item => {
          const node = this.tableData.find(n => n.subjectBaseid === item.subjectBaseid)
          node.amount = item.amount
        })
      })
    },
  }
}
</script>

<template>
  <div style="height: 100%">
    <div class="mode-area">
      <label class="label">
        <span style='margin-right: 4px'>预算编制模式</span>
        <el-tooltip placement="top" content="汇总模式将通过子任务预算合计生成父任务预算；分解模式将先设置父任务预算，子任务预算基于父任务预算进行分解。">
          <i class="p8 icon-help-tips" />
        </el-tooltip>
      </label>
      <el-radio-group v-model="mode">
        <el-radio-button label="pool">汇总模式</el-radio-button>
        <el-radio-button label="analysis">分解模式</el-radio-button>
      </el-radio-group>
    </div>
    <div class="main-table">
      <vxe-table
        border
        height='100%'
        keep-source
        ref="table"
        align="center"
        :data="tableData"
        :tableConfig="tableConfig"
        :tree-config="treeConfig"
        :edit-config="editConfig"
        @edit-closed="editClosed"
      >
        <vxe-column type="seq" title="序号" width="50"></vxe-column>
        <vxe-column field="name" title="科目名称" tree-node align="left" header-align="center"></vxe-column>
        <vxe-column
          field="amount"
          title="金额"
          :edit-render="{
          name: 'VxeNumberInput',
          immediate: true,
          showNegativeStatus: true,
          props:{
            min: 0
          }
        }"
          class-name="amount-cell"
          style="padding: 0 6px"
        ></vxe-column>
      </vxe-table>
    </div>
    <div class="button-area">
      <el-button type="primary" @click="save">保存</el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mode-area {
  padding: 10px;
  .label {
    margin-right: 12px;
  }
}
.button-area {
  border-top: 1px solid #e1e1e1;
  text-align: end;
  padding: 8px;
}

.main-table {
  height: calc(100% - 102px) !important;
}

.amount-cell {
  padding: 0 6px !important;
}

::v-deep .vxe-number-input {
  width: 95% !important;
}
</style>
