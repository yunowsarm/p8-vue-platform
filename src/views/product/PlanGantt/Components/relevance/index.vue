<template>
  <div style="height: 100%;">
    <vxe-table ref="xTable"
               style="height: 48%;"
               :comp="comp"
               :columns="columns"
               :has-w-b-s="true"
               :params="tableParam"
               :table-config="tableConfig"
               :tree-config="treeConfig"
               :is-smart-form="true"
               :pagination="false"
               api="demandManagement.getTaskList"
               @row-click="handleSelectionChange">
    </vxe-table>
    <div style="height: 4%;">
      <el-button style="margin-left: 20px;"
                 type="primary"
                 @click="relevanceClick">关联</el-button>
    </div>
    <vxe-table ref="xDemandTable"
               :comp="comp"
               style="height: 48%;"
               :columns="columnsDemand"
               :params="tableParamDemand"
               :table-config="tableConfig"
               :checkbox-config="checkboxConfig"
               :is-smart-form="true"
               :pagination="false"
               api="demandManagement.getRequirementList"
               @selection-change="handleSelectionChangeDemand">
      <template #relationProject="{scope}">
        <i v-if="scope.row.relationProject === 1"
           class='el-icon-connection'
           style="font-size: 30px; color: skyblue;"
           title="已关联项目"></i>
      </template>
    </vxe-table>
  </div>
</template>

<script>
import { P8VxeTable as VxeTable } from 'p8-components-ui'
export default {
  name: 'Index',
  components: {
    'vxe-table': VxeTable
  },
  props: {
    planInfoId: {
      type: String
    }
  },
  data () {
    return {
      comp: this,
      columns: [
        {
          title: '大纲号',
          type: '',
          dataIndex: 'WBS',
          width: '100px'
        },
        {
          title: '进度',
          dataIndex: 'progress',
          sortable: false,
          align: 'center',
          headeralign: 'center',
          width: '100px',
          formatter: (val) => {
            if (val.row.progress > 0) {
              return val.row.progress + '%'
            }
          }
        },
        {
          title: '状态',
          dataIndex: 'statusDisplay',
          sortable: false,
          align: 'center',
          headeralign: 'center',
          width: '100px'
        },
        {
          title: '标识',
          dataIndex: 'monitorPointArray',
          sortable: false,
          align: 'center',
          headeralign: 'center',
          width: '100px'
        },
        {
          title: '任务类型',
          dataIndex: 'taskTypeDisplay',
          sortable: false,
          align: 'center',
          headeralign: 'center',
          width: '100px'
        },
        {
          title: '任务名称',
          dataIndex: 'name',
          sortable: false,
          align: 'left',
          treeNode: true,
          headerAlign: 'center'
        },
        {
          title: '责任人',
          dataIndex: 'userName',
          sortable: false,
          align: 'center',
          headeralign: 'center',
          width: '100px'
        },
        {
          title: '部门',
          dataIndex: 'deptName',
          sortable: false,
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '计划开始时间',
          dataIndex: 'planBeginTime',
          sortable: false,
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '计划结束时间',
          dataIndex: 'planEndTime',
          sortable: false,
          align: 'center',
          headerAlign: 'center'
        }
      ],
      columnsDemand: [
        {
          title: '',
          width: 60,
          align: 'center',
          type: 'checkbox'
        },
        {
          title: '序号',
          type: 'index',
          width: '60px'
        }, {
          title: '是否关联项目',
          dataIndex: 'relationProject',
          sortable: false,
          align: 'center',
          headerAlign: 'center',
          scopedSlots: {
            customRender: 'custom'
          }
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
      tableParam: {
        planInfoId: this.planInfoId
      },
      tableParamDemand: {},
      tableConfig: {
        'highlight-current-row': true
      },
      treeConfig: {
        transform: true,
        expandAll: true,
        trigger: 'default',
        rowField: 'taskId',
        parentField: 'parentId',
        indent: 40,
        iconOpen: 'el-icon-arrow-down',
        iconClose: 'el-icon-arrow-right'
      },
      checkboxConfig: {
      },
      selectRecord: {},
      selectRecords: []
    }
  },
  methods: {
    handleSelectionChange (val) {
      this.selectRecords = []
      this.selectRecord = val
      this.$refs.xDemandTable.$refs.table.clearCheckboxRow()
      if (val.requirementIds) {
        let selectData = this.$refs.xDemandTable.$refs.table.data
        val.requirementIds.forEach(row => {
          selectData.forEach((item, index) => {
            if (row === item.id) {
              this.$refs.xDemandTable.$refs.table.setCheckboxRow(selectData[index], true)
            }
          })
        })
      }
    },
    handleSelectionChangeDemand (rows, row, checked) {
      this.selectRecords = []
      let that = this
      if (this.selectRecord.isLeaf === 1) {
        this.$message.warning('请选择子节点进行关联')
        that.$refs.xDemandTable.$refs.table.toggleCheckboxRow(row)
        return false
      }
      if (checked) {
        if (row.relationProject === 0) {
          that.$confirm('该条需求未被项目关联，继续操作将会追加与项目的关联，请确认！', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              rows.forEach(item => {
                this.selectRecords.push(item.id)
              })
            }).catch((e) => {
              that.$refs.xDemandTable.$refs.table.toggleCheckboxRow(row)
            })
        }
      }
    },
    relevanceClick () {
      this.$api['demandManagement.saveRequirementByTask']({
        wholeId: this.selectRecord.wholeId,
        taskId: this.selectRecord.taskId,
        requirementIds: this.selectRecords
      }).then(res => {
        if (res) {
          this.$message.success('操作成功')
        }
      })
    }
  }
}
</script>

<style>
</style>