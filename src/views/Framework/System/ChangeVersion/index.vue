<template>
  <div style="height: 100%;">
    <common-table ref="table"
                  class="table"
                  :comp="comp"
                  :columns="columns"
                  :params="queryParam"
                  :api="tableApi"
                  :table-config="tableConfig"
                  :pagination="true">
      <template #operation="{ scope }">
        <el-button type="text"
                   @click="deletePrivew(scope.row)">删除</el-button>
        <el-button type="text"
                   @click="openView(scope.row)">查看</el-button>
      </template>
    </common-table>

    <common-drawer v-if="isVisibleHistoryDrawer"
                   title="查看"
                   :visible="isVisibleHistoryDrawer"
                   placement="top"
                   size="100%"
                   @close="isVisibleHistoryDrawer = false">
      <template #drawer>
        <P8FormDataEdit :desformCode="desformCode"
                        page-type="view"
                        :dataViewId="dataViewId"
                        :formParams="formParams"
                        formApi='projectTeamSetting.getHistoryFormData'
                        :formDataJson="formDataJson" />
      </template>
    </common-drawer>
  </div>
</template>
  
  <script>
import {
  P8ListLayout as ListLayout,
  P8Table as CommonTable,
  P8Drawer as CommonDrawer,
} from 'p8-components-ui'
export default {
  name: 'myNetworkDisk',
  components: {
    ListLayout,
    CommonTable,
    CommonDrawer,
  },
  props: {
  },
  data: function () {
    return {
      comp: this,
      tableConfig: {
        'default-expand-all': true
      },
      queryParam: {},
      tableApi: 'projectTeamSetting.getBusinessDesVersionPage',
      isVisibleHistoryDrawer: false,
      columns: [
        {
          title: '序号',
          type: 'index',
          width: 55,
        },
        {
          title: '所属功能',
          dataIndex: 'businessFun',
          align: 'left',
          minWidth: 260
        },
        {
          title: '对应表单code',
          dataIndex: 'desformCode',
          align: 'center',
          width: 120
        },
        {
          title: '对应表单名称',
          dataIndex: 'videoTutorials',
          align: 'center',
          minWidth: 260
        },
        {
          title: '对应表单版本号',
          dataIndex: 'desformVersion',
          align: 'center',
          width: 140
        },
        {
          title: '实体对象名',
          dataIndex: 'businessObjname',
          align: 'center',
          minWidth: 260
        },
        {
          title: '版本号',
          dataIndex: 'businessVersion',
          align: 'center',
          width: 100
        },
        {
          title: '创建人',
          dataIndex: 'createBy',
          align: 'center',
          width: 100
        },
        {
          title: '操作时间',
          dataIndex: 'itemCreateTime',
          align: 'center',
          width: 100
        },
        {
          title: '操作',
          fixed: 'right',
          dataIndex: 'operation',
          scopedSlots: { customRender: 'custom' },
          width: 140,
          align: 'center'
        }
      ],
      formDataJson: {},
      selectRow: {},
      dataViewId: '',
      desformCode: '',
    }
  },
  computed: {
  },
  mounted () {
  },
  methods: {
    deletePrivew (row) {
      this.$confirm('是否确定要删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$api['projectTeamSetting.removeBusinessFormById']({ id: row.id })
            .then((res) => {
              if (res) {
                this.$message.success('删除成功')
                this.$refs.table.searchData()
              }
            })
        })
        .catch((e) => {
        })
    },
    openView (row) {
      this.selectRow = row
      this.desformCode = row.desformCode
      this.dataViewId = row.id
      this.formParams = {
        desformCode: row.desformCode,
        desformVersion: row.desformVersion,
        dataId: row.id,
        businessVersion: row.businessVersion
      }
      this.isVisibleHistoryDrawer = true
    }
  }
}
  </script>
  <style lang="scss" scoped>
</style>
  