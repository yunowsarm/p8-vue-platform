<script>
import { VxeColumn, VxeColgroup, VxeTable } from 'vxe-table'

export default {
  name: 'changeComparison',
  components: {
    VxeTable,
    VxeColumn,
    VxeColgroup
  },
  props: {
    row: {
      type: Array,
      default: () => []
    }
  },
  created() {
    console.log(this.row)
    this.versionComparison()
  },
  data() {
    return {
      tableConfig: {
        showOverflowTooltip: true
      },
      treeConfig: {
        transform: true,
        rowField: 'subjectId',
        parentField: 'subjectPId',
        expandAll: true
      },
      formConf: { closeForm: false },
      tableData: []
    }
  },
  methods: {
    versionComparison() {
      const ids = this.row.map((item) => item.ID)
      this.$api['budgetManagement.versionComparison']({ ids: ids }).then((res) => {
        console.log(res)
        if (res) {
          this.tableData = res
        }
      })
    }
  }
}
</script>

<template>
  <div class="main-area">
    <vxe-table border :data="tableData" :tableConfig="tableConfig" :tree-config="treeConfig" align="center" height="100%">
      <vxe-column field="name" tree-node title="科目" align="left" header-align="center"></vxe-column>
      <vxe-colgroup :title="tableData[0].initiateTime + '预算变更记录'">
        <vxe-column field="amountOld" title="变更前（元）">
          <template #default='{row}'>
            <span :style="{color: row.amountOld !== row.amount ? '#F56C6C' : '#606266'}">{{row.amountOld}}</span>
          </template>
        </vxe-column>
        <vxe-column field="amount" title="变更后（元）">
          <template #default='{row}'>
            <span :style="{color: row.amountOld !== row.amount ? '#F56C6C' : '#606266'}">{{row.amount}}</span>
          </template>
        </vxe-column>
      </vxe-colgroup>
      <vxe-colgroup :title="tableData[0].initiateTime1 + '预算变更记录'">
        <vxe-column field="amountOld1" title="变更前（元）">
          <template #default='{row}'>
            <span :style="{color: row.amountOld1 !== row.amount1 ? '#F56C6C' : '#606266'}">{{row.amountOld1}}</span>
          </template>
        </vxe-column>
        <vxe-column field="amount1" title="变更后（元）">
          <template #default='{row}'>
            <span :style="{color: row.amountOld1 !== row.amount1 ? '#F56C6C' : '#606266'}">{{row.amount1}}</span>
          </template>
        </vxe-column>
      </vxe-colgroup>
      <vxe-colgroup title="当前">
        <vxe-column field="amountCurr" title="预算金额（元）"></vxe-column>
      </vxe-colgroup>
    </vxe-table>
  </div>
</template>

<style scoped lang="scss">
.main-area {
  height: 100%;
  padding: 12px;
  box-sizing: border-box;
}
</style>
