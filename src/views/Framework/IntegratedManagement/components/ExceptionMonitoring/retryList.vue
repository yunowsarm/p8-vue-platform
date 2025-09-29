<template>
  <list-layout>
    <template #north>
      <search-form-list
        ref="search"
        :comp="comp"
        :data-source="dataSource"
        :add-fuzzy-search="true"
        @search="search"
        @re-set="reSet" />
    </template>
    <template #center>
      <div id="table-contain">
        <common-table
          ref="table"
          :comp="comp"
          v-on="{ doRetry: doRetry, retryList: retryList }"
          :table-config="tableConfig"
          :columns="columns"
          :params="queryParam"
          :api="tableApi"
          :table-refresh="tableRefresh"
          :pagination="true">
          <template #operation="{ scope }">
            <el-button type="text" @click="doRetry(scope.row)">重发</el-button>
            <el-button type="text" @click="openDialog(scope.row)">查看参数</el-button>
          </template>
        </common-table>
      </div>
      <common-dialog title="预览"
                     v-if="codeVisible"
                     :visible="codeVisible"
                     width="50%"
                     destroy-on-close
                     :show-handle-btn="false"
                     @isfullscreen="tabsKey = Date.now()"
                     @close="handleCancel()">
        <template #dialog>
          <CommonTabs :tabs-data="tabs"
                      v-if="codeVisible"
                      class="el_tabs"
                      type="border-card"
                      :active-tabs="activeTabs">
            <template #requestContent>
              <ace-edit :value="requestContent"
                        :key="tabsKey"
                        :readOnly="true"
                        width="100%"
                        height="100%"></ace-edit>
            </template>
            <template #responseContent>
              <ace-edit :value="responseContent"
                        :key="tabsKey"
                        :readOnly="true"
                        width="100%"
                        height="100%"></ace-edit>
            </template>
          </CommonTabs>
        </template>
      </common-dialog>
    </template>
    <template #drawer-panel>
      <common-drawer
        v-if="detailListDrawer"
        :title="drawerTitle"
        :visible="detailListDrawer"
        @close="onDetailListClose">
        <template #drawer>
          <retry-detail-list
            @save-Success="saveCallback"
            :record="record" />
        </template>
      </common-drawer>
    </template>
  </list-layout>
</template>
<style scoped lang="scss">
.el_tabs{
  height: calc(100% - 32px);
}
::v-deep .is-fullscreen .el-dialog__body{
  height: calc(100% - 110px) !important;
}
</style>
<script>
import Vue from 'vue'
import {
  P8Table as CommonTable,
  P8Button as CommonButton,
  P8Drawer as CommonDrawer,
  P8ListLayout as ListLayout,
  P8Search as SearchFormList,
  P8Dialog as CommonDialog,
  P8Tabs as CommonTabs
} from 'p8-components-ui'

import retryDetailList from './retryDetailList.vue'
import aceEdit from 'packages/Base/Components/ace.vue'

const columns = [
  {
    title: '序号',
    type: 'index',
    width: 50,
    align: 'center',
    headerAlign: 'center'
  },
  {
    title: '接口名称',
    dataIndex: 'serviceName',
    width: 200,
    ellipsis: true,
    align: 'center'
  },
  {
    title: '接口类型',
    dataIndex: 'serviceType',
    align: 'center'
  },
  {
    title: '对方系统',
    dataIndex: 'systemName',
    align: 'center'
  },
  {
    title: '调用时间',
    dataIndex: 'itemCreateTime',
    formatter: function(row) {
      if (row.itemCreateTime !== '' && row.itemCreateTime != null) {
        let reg = new RegExp('T')
        return row.itemCreateTime.replace(reg, ' ')
      }
    },
    align: 'center'
  },
  {
    title: '执行时长(ms)',
    dataIndex: 'responseInterval',
    align: 'center'
  },
  {
    title: '操作',
    fixed: 'right',
    width: 140,
    dataIndex: 'operation',
    scopedSlots: { customRender: 'custom' }
  }
]

export default {
  name: 'RetryList',
  components: {
    aceEdit,
    CommonTable,
    CommonButton,
    CommonDrawer,
    ListLayout,
    SearchFormList,
    retryDetailList,
    CommonDialog,
    CommonTabs
  },
  inject: ['type'],
  data () {
    return {
      comp: this,
      drawerTitle: '',
      detailListDrawer: false,
      queryParam: {
        logType: this.type,
        responseStatus: '失败'
      },
      tableApi: 'integratedManagement.serviceRetryList',
      advanced: false,
      columns: columns,
      id: '',
      record: {},
      scroll: {},
      tableConfig: {
        defaultExpandAllRows: true
      },
      tabs: [
        {
          label: '请求参数',
          name: 'requestContent'
        },
        {
          label: '返回参数',
          name: 'responseContent'
        }
      ],
      codeVisible: false,
      tabsKey:Date.now(),
      activeTabs: 'requestContent',
      requestContent: '',
      responseContent: '',
      dataSource: [
        {
          labelText: '对方系统',
          type: 'text',
          fieldName: 'systemName',
          placeholder: '请输入对方系统'
        }
      ],
      buttonConfig: {
        icon: 'edit'
      }
    }
  },
  mounted () {
  },
  computed: {},
  methods: {
    onDetailListClose () {
      this.detailListDrawer = false
    },
    openDialog (row) {
      this.requestContent = row.requestContent
      this.responseContent = row.responseContent
      this.codeVisible = true
    },
    handleCancel () {
      this.codeVisible = false
      this.requestContent = ''
      this.responseContent = ''
    },
    doRetry (record) {
      const that = this
      this.$confirm('是否确定要进行重发？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          that.$api['integratedManagement.doServiceRetry']({ id: record.id })
            .then(function(res) {
              that.$refs.table.queryList()
              that.$message({
                message: '操作成功',
                type: 'success'
              })
            })
            .catch(function(error) {
              // console.log(error)
            })
        })
        .catch(() => {
        })
    },
    doOneRetryList (record) {
    },
    retryList (record) {
      this.record = record
      this.drawerTitle = '详情列表'
      this.detailListDrawer = true
    },
    search (param) {
      this.queryParam = {...this.queryParam, ...param }
      // const that = this
      // Vue.nextTick(function() {
      //   that.$refs.table.searchData()
      // })
    },
    reSet () {
      const that = this
      Object.keys(that.queryParam).forEach((key) => {
        if (!['logType','responseStatus'].includes(key)) {
          delete that.queryParam[key]
        }
      })
      Vue.nextTick(function() {
        that.$refs.table.searchData()
      })
    },
    tableRefresh (param) {
      param
        .then(() => {
          // console.log('异步成功后端做的操作')
        })
        .catch(() => {
          // console.log('异步失败的操作')
        })
    },
    saveCallback () {
      this.$refs.table.searchData()
      this.onDetailListClose()
    }
  }
}
</script>
