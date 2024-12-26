<template>
  <list-layout>
    <template #north>
      <common-button :comp="comp"
                     :button-type="'round'"
                     :button-config="buttonConfig"></common-button>
    </template>
    <template #center>
      <div id="table-contain">
        <common-table ref="table"
                      :comp="comp"
                      :table-config="tableConfig"
                      :columns="columns"
                      :params="queryParam"
                      :api="tableApi"
                      :table-refresh="tableRefresh"
                      :pagination="true"
                      @icon-click="iconClick"></common-table>
      </div>
    </template>
    <template #drawer-panel>
      <common-drawer v-if="visibleThirdPartInterfaceEditDrawer"
                     :title="drawerTitle"
                     :visible="visibleThirdPartInterfaceEditDrawer"
                     @close="onEditThirdPartInterfaceClose">
        <template #drawer>
          <third-part-interface-edit @saveSuccess="saveCallback"
                                     :id="id"
                                     @cancel="visibleThirdPartInterfaceEditDrawer = false"
                                     :record="record"></third-part-interface-edit>
        </template>
      </common-drawer>
    </template>
  </list-layout>
</template>
<style></style>
<script>
import { P8ListLayout as ListLayout, P8Table as CommonTable, P8Button as CommonButton, P8Drawer as CommonDrawer } from 'p8-components-ui'

import thirdPartInterfaceEdit from '@/views/Framework/System/ThirdPartInterface/edit'
// import indexCron from '/framework/system/ThirdPartInterface/indexCron'
// import create from '/framework/system/ThirdPartInterface/create'
const columns = [
  {
    title: '序号',
    type: 'index',
    align: 'center',
    width: '50'
  },
  {
    title: '接口ID',
    dataIndex: 'serviceKey',
    align: 'center'
  },
  {
    title: '接口名称',
    dataIndex: 'serviceName',
    width: 200,
    ellipsis: true,
    formatter (row, column, cellValue, index) {

      return '12340000'
    },
    align: 'center'
  },
  {
    title: '服务提供方',
    dataIndex: 'providerNameDisplay',
    width: 200,
    align: 'center'
  },
  {
    title: '对方系统',
    dataIndex: 'systemNameDisplay',
    width: 200,
    align: 'center'
  },
  {
    title: '接口业务描述',
    dataIndex: 'serviceDesc',
    width: 200,
    align: 'center'
  },
  {
    title: '接口状态',
    dataIndex: 'serviceState',
    width: 150,
    align: 'center'
  },
  {
    title: '状态更新时间',
    dataIndex: 'stateUpdateTime',
    width: 150,
    formatter: function (row) {
      if (row.stateUpdateTime !== '' && row.stateUpdateTime != null) {
        let reg = new RegExp('T')
        return row.stateUpdateTime.replace(reg, ' ')
      }
    },
    align: 'center'
  },
  {
    title: '上次执行时间',
    dataIndex: 'lastProcessTime',
    width: 150,
    formatter: function (row) {
      if (row.lastProcessTime !== '' && row.lastProcessTime != null) {
        let reg = new RegExp('T')
        return row.lastProcessTime.replace(reg, ' ')
      }
    },
    align: 'center'
  },
  {
    title: '自动执行周期',
    dataIndex: 'processCron',
    width: 200,
    align: 'center'
  },
  {
    title: '是否可用',
    dataIndex: 'isDisable',
    width: 100,
    formatter: function (row) {
      if (row.isDisable === '0') {
        return '是'
      } else if (row.isDisable === '1') {
        return '否'
      }
    },
    align: 'center'
  },
  {
    title: '操作',
    fixed: 'right',
    dataIndex: 'operation',
    width: 120,
    scopedSlots: { customRender: 'operation' },
    align: 'center'
  }
]

export default {
  name: 'RetryList',
  components: {
    ListLayout,
    CommonTable,
    CommonButton,
    CommonDrawer,
    thirdPartInterfaceEdit
    // indexCron,
    // create
  },
  data () {
    return {
      comp: this,
      drawerTitle: '',
      visibleThirdPartInterfaceEditDrawer: false,
      queryParam: {},
      tableApi: 'thirdPartInterface.serviceList',
      advanced: false,
      columns: columns,
      id: '',
      record: {},
      scroll: {},
      tableConfig: {
        defaultExpandAllRows: true
      },
      searchData: [],
      buttonConfig: {
        icon: 'edit'
      }
    }
  },
  mounted () { },
  computed: {},
  methods: {
    createThirdPartInterface (record) {
      this.id = ''
      this.record = {}
      this.drawerTitle = '新建第三方接口'
      this.visibleThirdPartInterfaceEditDrawer = true
    },

    updateThirdPartInterface (record) {
      this.id = record.id
      this.record = record
      this.drawerTitle = '修改第三方接口'
      this.visibleThirdPartInterfaceEditDrawer = true
    },
    removeThirdPartInterface (record) {
      let that = this
      this.$confirm('是否确定要删除该第三方接口？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          that.$api['thirdPartInterface.serviceRemove']({ ids: [record.id] })
            .then(function (res) {
              that.$refs.table.queryList()
              that.$message({
                message: '操作成功',
                type: 'success'
              })
            })
            .catch(function (error) {
              console.log(error)
            })
        })
        .catch(() => { })
    },
    saveCallback () {
      this.onEditThirdPartInterfaceClose()
    },
    onEditThirdPartInterfaceClose () {
      this.$refs.table.searchData()
      this.visibleThirdPartInterfaceEditDrawer = false
    },
    tableRefresh (param) {
      param
        .then(() => {

        })
        .catch(() => {

        })
    },

    iconClick (record) {

    }
  }
}
</script>
