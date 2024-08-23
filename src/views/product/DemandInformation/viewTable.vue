<template>
  <vxe-table ref="xTable"
             :comp="comp"
             :columns="columnsDemand"
             :params="tableParamDemand"
             :table-config="tableConfig"
             :tree-config="treeConfig"
             :checkboxConfig="checkboxConfig"
             :is-smart-form="true"
             :pagination="false"
             :api="tableApi">
  </vxe-table>
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
      type: Array
    }
  },
  data () {
    return {
      comp: this,
      columnsDemand: [
        {
          title: '序号',
          type: 'index',
          width: '60px'
        },
        {
          title: '状态',
          dataIndex: 'statusDisplay',
          sortable: false,
          align: 'center',
          width: '100px',
          headerAlign: 'center'
        },
        {
          title: '项目/任务',
          dataIndex: 'name',
          sortable: false,
          align: 'left',
          treeNode: true,
          headerAlign: 'center'
        }
      ],
      tableApi: 'demandManagement.getRequirementByProjectTask',
      tableParamDemand: {
        id: this.row[0].ID
      },
      tableConfig: {
        'highlight-current-row': true
      },
      checkboxConfig: {
      },
      treeConfig: {
        transform: true,
        expandAll: true,
        rowField: 'id',
        parentField: 'parentId'
      }
    }
  },
  mounted () {

  },
  methods: {
  }
}
</script>

<style>
</style>