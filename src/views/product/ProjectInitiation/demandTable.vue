<template>
  <div style="height: 100%;">
    <div style="padding: 1%;">
      <el-button type="primary"
                 @click="relevanceClick">关联/取消</el-button>
    </div>
    <vxe-table ref="xDemandTable"
               :comp="comp"
               style="height: 92%;"
               :columns="columnsDemand"
               :params="tableParamDemand"
               :table-config="tableConfig"
               :checkbox-config="checkboxConfig"
               :is-smart-form="true"
               :refreshShow="false"
               :pagination="false"
               api="demandManagement.getRequirementList"
               @selection-change="handleSelectionChangeDemand">
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
    row: {
      type: Array,
      default: function () {
        return []
      }
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
      tableParamDemand: {},
      tableConfig: {
        'highlight-current-row': true
      },
      checkboxConfig: {
        showHeader: false
      },
      selectRecord: {},
      selectRecords: []
    }
  },
  mounted () {
    this.$api['demandManagement.getRequirementByProject']({
      wholeId: this.row[0].ID
    }).then(res => {
      if (res) {
        this.selectRecords = res
        let selectData = this.$refs.xDemandTable.$refs.table.data
        res.forEach(row => {
          selectData.forEach((item, index) => {
            if (row === item.id) {
              this.$refs.xDemandTable.$refs.table.setCheckboxRow(selectData[index], true)
            }
          })
        })
      }
    })
  },
  methods: {
    handleSelectionChangeDemand (rows, row, checked) {
      this.selectRecords = []
      rows.map(item => {
        this.selectRecords.push(item.id)
      })
    },
    relevanceClick () {
      this.$api['demandManagement.saveRequirementByProject']({
        wholeId: this.row[0].ID,
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