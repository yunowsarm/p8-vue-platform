<template>
  <list-layout class="userSelect">
    <template #north>
      <div class="search-con">
        <div class="input-con" :style="{ width: 'calc(45% - 31px)' }">
          人员姓名:
          <el-input v-model="realName" :style="{ width: 'calc(100% - 70px)' }" class="input-name" placeholder="请输入人员姓名进行搜索" clearable size="mini" />
        </div>
        <div class="search-btn">
          <el-button icon="search" size="mini" type="primary" @click="search"> 搜索 </el-button>
        </div>
      </div>
    </template>
    <template #center>
      <common-table
        ref="table"
        :table-setting="false"
        :columns="columns"
        :params="queryParam"
        :api="tableApi"
        :disabled-check-all="true"
        is-radio-select
        @row-click="handleTableRowClick"
        @select="handleTableSelectionChange"
        @row-dblclick="rowDblclick"
      />
    </template>
  </list-layout>
</template>
<script>
import { P8ListLayout as ListLayout, P8Table as CommonTable, Input } from 'p8-components-ui'

export default {
  name: 'DialogSelectMember',
  components: {
    ListLayout,
    CommonTable,
    'el-input': Input
  },
  props: {},
  data() {
    const columns = [
      {
        title: '',
        type: 'selection'
      },
      {
        title: '姓名',
        dataIndex: 'realName',
        minWidth: 100,
        align: 'center'
      },
      {
        title: '部门',
        dataIndex: 'deptName',
        minWidth: 100,
        align: 'center'
      }
    ]
    return {
      columns,
      tableApi: 'teamManager.roleUserList',
      realName: '',
      queryParam: {
        deptId: '',
        realName: '',
        roleId: ''
      },
      currentRow: null,
      tableSelectValue: []
    }
  },
  watch: {},
  created() {},
  mounted() {},
  beforeDestroy() {},
  methods: {
    search() {
      this.queryParam.realName = this.realName
    },
    handleTableSelectionChange(selection, row) {
      this.currentRow = row
      this.$emit('sysUserSelect', row)
    },
    handleTableRowClick(row) {
      this.$refs.table.$refs.table.clearSelection()
      if (this.currentRow) {
        if (this.currentRow.id === row.id) {
          this.$refs.table.$refs.table.toggleRowSelection(row, false)
          this.currentRow = null
        } else {
          this.$refs.table.$refs.table.toggleRowSelection(row, true)
          this.currentRow = row
        }
      } else {
        this.$refs.table.$refs.table.toggleRowSelection(row, true)
        this.currentRow = row
      }
      this.$emit('sysUserSelect', this.currentRow)
    },
    rowDblclick(row, column, event) {
      this.currentRow = row
      this.$emit('dbClickUser', row)
    }
  }
}
</script>
<style lang="scss" scpoed>
.search-con {
  display: flex;
  justify-content: end;
  padding-left: 15px;
  .date-range-con,
  .input-con {
    float: left;
    height: 30px;
  }
  .input-con {
    margin-left: 10px;
  }
  .search-btn {
    // float: right;
    width: 60px;
    height: 30px;
  }
}
// .el-date-editor.el-range-editor {
//   width: 200px;
// }
// .el-input--mini {
//   width: 200px !important;
// }
.table-con .small-table {
  overflow-y: auto;
}
.userSelect {
  box-sizing: border-box;
  height: 100%;
  padding: 10px;
  margin: 0;
  .normal-header {
    border-bottom: 1px solid #e1e1e1;
  }
}
</style>
