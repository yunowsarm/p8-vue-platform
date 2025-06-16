<template>
  <list-layout class="listLayout"
               :headerVisible="false"
               style="height: 300px;">
    <template #north>
    </template>
    <template #center>
      <common-table ref="table"
                    :comp="comp"
                    class="customTable"
                    :columns="columns"
                    :pagination="false"
                    :no-api-table-data="editTableData"></common-table>
    </template>
  </list-layout>
</template>
<script>
import { P8ListLayout as ListLayout, P8Drawer as CommonDrawer, P8Table as CommonTable, } from 'p8-components-ui'
export default {
  name: 'businessFormView',
  props: {
    taskId: {
      type: String,
      default: ''
    },
  },
  data () {
    return {
      comp: this,
      columns: [
        {
          title: '序号',
          type: 'index',
          align: 'center',
          width: 70,
        },
        {
          title: '业务表单',
          dataIndex: 'formName',
          minWidth: 200,
          align: 'center',
        },
        {
          title: '编辑模式',
          dataIndex: 'editMode',
          width: 160,
          align: 'center',
        },
        {
          title: '是否必填',
          dataIndex: 'isRequired',
          width: 160,
          align: 'center',
        }
      ],
      editTableData: []
    }
  },
  components: {
    CommonTable,
    ListLayout,
    CommonDrawer
  },
  created () {
    this.$api['planGanttManager.taskFormInfo']({ taskId: this.taskId }).then(res => {
      this.editTableData = res
    })
  },
  methods: {
  }
}
</script>
<style lang="scss" scoped>
.listLayout {
  margin: 0;
  padding: 0;
  ::v-deep .list-header {
    padding: 10px 1px !important;
  }
  ::v-deep .list-main {
    padding: 0;
    margin: 0;
    height: 100%;
  }
  ::v-deep .list-layout {
    margin: 0;
    height: 100%;
  }
  .el-icon-delete,
  .el-icon-view {
    font-size: 16px;
    line-height: 24px;
    cursor: pointer;
    &:hover {
      color: $base-light-color;
    }
  }
}
.customTable ::v-deep .panination {
  display: none;
}
</style>
