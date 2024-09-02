<template>
  <div style="height: 100%;">
    <vxe-table ref="xDemandTable"
               :comp="comp"
               style="height: 92%;"
               :columns="columnsDemand"
               :params="tableParamDemand"
               :table-config="tableConfig"
               :checkboxConfig="checkboxConfig"
               :is-smart-form="true"
               :refreshShow="false"
               :pagination="false"
               api="demandManagement.getRequirementList"
               @requested-table-data="requestedTableData">
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
    }
  },
  data () {
    return {
      comp: this,
      columnsDemand: [
        {
          title: '是否关联',
          width: 80,
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
        showHeader: false,
        checkMethod: this.checkMethod
      }
    }
  },
  methods: {
    checkMethod ({ row }) {
      return false
    },
    requestedTableData (data) {
      let that = this
      this.$api['demandManagement.getRequirementByTask']({
        taskId: that.taskId
      }).then(res => {
        if (res) {
          let selectData = that.$refs.xDemandTable.$refs.table.tableData
          res.forEach(row => {
            selectData.forEach((item, index) => {
              if (row === item.id) {
                // that.$refs.xDemandTable.$refs.table.tableData = [item]
                that.$refs.xDemandTable.$refs.table.setCheckboxRow(selectData[index], true)
              }
            })
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>