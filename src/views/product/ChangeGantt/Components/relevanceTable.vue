<template>
  <div style="height: 100%;">
    <div style="padding: 1%;">
      <el-button type="primary"
                 @click="relevanceClick">关联/取消</el-button>
    </div>
    <vxe-table ref="xTable"
               :comp="comp"
               v-if="columnsDemand.length"
               style="height: 92%;"
               :columns="columnsDemand"
               :params="tableParamDemand"
               :table-config="tableConfig"
               :checkboxConfig="checkboxConfig"
               :is-smart-form="true"
               :pagination="false"
               :refreshShow="false"
               :api="tableApi"
               :rowConfig="{
                'keyField': 'id'
               }"
               @requested-table-data="requestedTableData"
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
    taskId: {
      type: String
    },
    taskData: {
      type: Array
    }
  },
  data () {
    return {
      comp: this,
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
        },
        {
          title: '是否已关联项目',
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
      tableApi: 'demandManagement.getRequirementList',
      tableParamDemand: {},
      tableConfig: {
        'highlight-current-row': true
      },
      checkboxConfig: {
        showHeader: false
      },
      selectRows: [],
      selectRecords: []
    }
  },
  mounted () {

  },
  methods: {
    requestedTableData (data) {
      let that = this
      let selectData = data
      if (that.taskData.length > 0) {
        let selectRows = []
        let falg = false
        that.taskData.forEach(row => {
          console.log(row, '============', this.taskId);
          if (row.taskId === this.taskId) {
            this.selectRows = row.selectRows
            that.selectRecords = row.requirementIds
            falg = true
          }
        })
        if (!falg) {
          this.getTaskData(selectData)
        }
        if (this.selectRows) {
          this.selectRows.forEach(row => {
            selectData.forEach((item, index) => {
              if (row.id === item.id) {
                that.$refs.xTable.$refs.table.setCheckboxRow(row, true)
              }
            })
          })
        }
      } else {
        this.getTaskData(selectData)
      }
    },
    getTaskData (selectData) {
      let that = this
      this.selectRows = []
      that.$api['demandManagement.getRequirementByTaskChange']({
        taskId: that.taskId
      }).then(res => {
        if (res) {
          that.selectRecords = res
          res.forEach(row => {
            selectData.forEach((item, index) => {
              if (row === item.id) {
                this.selectRows.push(selectData[index])
                that.$refs.xTable.$refs.table.setCheckboxRow(selectData[index], true)
              }
            })
          })
        }
      })
    },
    handleSelectionChangeDemand (rows, row, checked) {
      this.selectRecords = []
      this.selectRows = rows
      let that = this
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
              that.$refs.xTable.$refs.table.toggleCheckboxRow(row)
            })
        }
      }
      if (rows.length > 0) {
        rows.forEach(item => {
          this.selectRecords.push(item.id)
        })
      }
    },
    relevanceClick () {
      this.$emit('closeRelevance', {
        taskId: this.taskId,
        requirementIds: this.selectRecords,
        selectRows: this.selectRows
      })
      this.$message.success('操作成功')
    }
  }
}
</script>

<style>
</style>