<template>
  <list-layout>
    <template #north>
      <common-button></common-button>
      <search-form-list ref="search"
                        :comp="comp"
                        :data-source="dataSource"
                        @search="search"
                        @re-set="reSet"></search-form-list>
    </template>
    <template #center>
      <div id="table-contain">
        <common-table ref="table"
                      :comp="comp"
                      v-on="{ doRetry: doRetry, retryList: retryList }"
                      :table-config="tableConfig"
                      :columns="columns"
                      :params="queryParam"
                      :api="tableApi"
                      :table-refresh="tableRefresh"
                      :pagination="true"></common-table>
      </div>
    </template>
    <template #drawer-panel>
      <common-drawer v-if="detailListDrawer"
                     :title="drawerTitle"
                     :visible="detailListDrawer"
                     @close="onDetailListClose">
        <template #drawer>
          <retry-detail-list @save-Success="saveCallback"
                             :record="record"></retry-detail-list>
        </template>
      </common-drawer>
    </template>
  </list-layout>
</template>
<style></style>
<script>
import Vue from 'vue'
import { P8Table as CommonTable, P8Button as CommonButton, P8Drawer as CommonDrawer, P8ListLayout as ListLayout, P8Search as SearchFormList } from 'p8-components-ui'

import retryDetailList from '@/views/Framework/System/ThirdPartInterface/retryDetailList.vue'
const columns = [
  {
    title: '序号',
    type: 'index',
    width: 50,
    align: 'center'
  },
  {
    title: '接口名称',
    dataIndex: 'serviceName',
    width: 200,
    ellipsis: true,
    align: 'center'
  },
  {
    title: '服务提供方',
    dataIndex: 'providerName',
    align: 'center'
  },
  {
    title: '对方系统',
    dataIndex: 'systemName',
    align: 'center'
  },
  {
    title: '业务接口描述',
    dataIndex: 'serviceDesc',
    align: 'center'
  },
  {
    title: '异常总数',
    dataIndex: 'retryCount',
    align: 'center'
  },
  {
    title: '操作',
    fixed: 'right',
    dataIndex: 'operation',
    scopedSlots: { customRender: 'operation' },
    align: 'center'
  }
]

export default {
  name: 'RetryList',
  components: {
    CommonTable,
    CommonButton,
    CommonDrawer,
    ListLayout,
    SearchFormList,
    retryDetailList
  },
  data () {
    return {
      comp: this,
      drawerTitle: '',
      detailListDrawer: false,
      queryParam: {},
      tableApi: 'thirdPartInterface.retryListData',
      advanced: false,
      columns: columns,
      id: '',
      record: {},
      scroll: {},
      tableConfig: {
        defaultExpandAllRows: true
      },
      dataSource: [
        {
          labelText: '服务提供方',
          type: 'select',
          fieldName: 'providerName',
          placeholder: '请选择服务提供方',
          optionUrl: {
            api: 'thirdPartInterface.heartInterfaceList',
            params: { dicType: 'PROVIDER_NAME' },
            label: 'desc',
            value: 'name'
          },
          options: []
        }
      ],
      buttonConfig: {
        icon: 'edit'
      }
    }
  },
  mounted () { },
  computed: {},
  methods: {
    onDetailListClose () {
      this.detailListDrawer = false
    },
    doRetry (record) {
      let that = this
      console.log(record)

      this.$confirm('是否确定要进行手动处理？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          that.$api['thirdPartInterface.doServiceRetry']({ serviceBindId: record.id })
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
    doOneRetryList (record) { },
    retryList (record) {
      this.record = record
      this.drawerTitle = '详情列表'
      this.detailListDrawer = true
    },
    search (param) {
      let newParams = { ...param }
      this.queryParam = newParams
      let that = this
      Vue.nextTick(function () {
        that.$refs.table.searchData()
      })
    },
    reSet () {
      let that = this
      Object.keys(that.queryParam).forEach((key) => {
        that.queryParam[key] = ''
      })
      Vue.nextTick(function () {
        that.$refs.table.searchData()
      })
    },
    tableRefresh (param) {
      param
        .then(() => {
          console.log('异步成功后端做的操作')
        })
        .catch(() => {
          console.log('异步失败的操作')
        })
    },
    saveCallback () {
      console.log('修改页面关闭时的回调方法')
      this.$refs.table.searchData()
      this.onDetailListClose()
    }
  }
}
</script>
