<template>
  <P8VxeTable ref="table"
              :special-rote-name="roteName"
              :comp="comp"
              :columns="columns"
              :customHeight="customHeight"
              :table-config="tableConfig"
              :row-config="{ isHover: true }"
              :params="queryParam"
              :pagination="false"
              @selection-change="radioChangeEvent"
              :api="tableApi"
              :tree-config="treeConfig">
  </P8VxeTable>
</template>
<script>
import { P8VxeTable } from 'p8-components-ui'
export default {
  name: 'DeptSelect',
  components: { P8VxeTable },
  data () {
    return {
      comp: this,
      tableApi: 'departmentManger.deptTree',
      treeConfig: {
        transform: true,
        expandAll: true,
        rowField: 'id',
        parentField: 'pId'
      },
      queryParam: { deptId: '' },
      tableConfig: {
        'default-expand-all': true
      },
      columns: [
        {
          type: 'radio',
          width: 45,
          align: 'center'
        },
        {
          title: '序号',
          type: 'index',
          width: '100',
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '部门名称',
          dataIndex: 'label',
          align: 'left',
          headerAlign: 'left',
          minWidth: '250',
          treeNode: true
        },
      ],
      selectDept: '',
      deptData: []
    }
  },
  created () {

  },
  methods: {
    radioChangeEvent (row) {
      this.$emit('deptChange', row[0])

    }
  }
}
</script>