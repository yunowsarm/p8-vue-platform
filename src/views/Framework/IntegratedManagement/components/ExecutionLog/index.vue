<template>
  <list-layout>
    <template #north>
      <search-form-list :comp="comp"
                        ref="search"
                        :data-source="searchData"
                        :addFuzzySearch="true"
                        @search="search"
                        @re-set="reSet"></search-form-list>
    </template>
    <template #center>
      <div id="table-contain">
        <common-table ref="table"
                      :columns="columns"
                      :params="queryParam"
                      :api="tableApi">
          <template #operation="{ scope }">
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
  </list-layout>
</template>
<style lang="scss" scoped>
.el_tabs{
  height: calc(100% - 32px);
}
::v-deep .is-fullscreen .el-dialog__body{
  height: calc(100% - 110px) !important;
}
</style>
<script>
import moment from 'moment'
import Vue from 'vue'
import {
  P8Table as CommonTable,
  P8ListLayout as ListLayout,
  P8Search as SearchFormList,
  P8Dialog as CommonDialog,
  P8Tabs as CommonTabs
} from 'p8-components-ui'
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
    title: '状态',
    dataIndex: 'responseStatus',
    align: 'center',
  },
  // {
  //   title: '请求参数',
  //   dataIndex: 'requestContent',
  //   width: 310,
  //   align: 'center'
  // },
  // {
  //   title: '返回参数',
  //   dataIndex: 'responseContent',
  //   width: 310,
  //   align: 'center'
  // },
  {
    title: '执行时长(ms)',
    dataIndex: 'responseInterval',
    align: 'center'
  },
  {
    title: '操作',
    fixed: 'right',
    width: 100,
    dataIndex: 'operation',
    scopedSlots: { customRender: 'custom' }
  }
]

export default {
  name: 'LogList',
  components: {
    aceEdit,
    CommonTable,
    ListLayout,
    SearchFormList,
    CommonDialog,
    CommonTabs

  },
  inject:['type'],
  data () {
    return {
      tabsKey:Date.now(),
      codeVisible: false,
      activeTabs:'requestContent',
      comp: this,
      queryParam: { logType: this.type },
      tableApi: 'thirdPartInterface.logListData',
      columns: columns,
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
      searchData: [
        {
          type: 'text',
          labelText: '对方系统名称',
          fieldName: 'systemName',
          placeholder: '请输入对方系统名称',
          fieldEvent: {
            click: 'clickEvent(this)'
          }
        },
        {
          type: 'text',
          labelText: '接口类型',
          fieldName: 'serviceType',
          placeholder: '请输入接口类型',
          fieldEvent: {
            click: 'clickEvent(this)'
          }
        },
        {
          type: 'datetimeRange',
          labelText: '调用时间',
          fieldName: 'recordingTime',
          placeholder: ['开始日期', '结束日期'],
          // fieldConfig: {
          //   format: 'yyyy-MM-DD',
          //   style: 'width: 100%'
          // }
        }
      ]
    }
  },
  mounted () {
  },
  computed: {},
  methods: {
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
    search (param) {
      let systemName = null
      let serviceType = null
      if (param.systemName !== '') {
        systemName = param.systemName
      }
      if (param.serviceType !== '') {
        serviceType = param.serviceType
      }
      let beginTime = null
      let endTime = null
      if (param) {
        if (param['recordingTime']) {
          param['recordingTime'] = param['recordingTime'].map((item) => moment(item).format('YYYY-MM-DD HH:mm:ss'))
          if (param['recordingTime'].length > 1) {
            beginTime = param['recordingTime'][0]
            endTime = param['recordingTime'][1]
          } else if (param['recordingTime'][0]) {
            beginTime = param['recordingTime'][0]
          } else if (param['recordingTime'][1]) {
            endTime = param['recordingTime'][0]
          }
        }
      }
      if (beginTime && endTime) {
        let newParams = {
          ...this.queryParam,
          startTime: beginTime,
          endTime: endTime,
          systemName: systemName,
          serviceType: serviceType
        }
        this.queryParam = newParams
        let that = this
        Vue.nextTick(function() {
          that.$refs.table.searchData()
        })
      } else {
        if (beginTime) {
          let newParams = {
            ...this.queryParam,
            startTime: beginTime,
            systemName: systemName,
            serviceType: serviceType
          }
          this.queryParam = newParams
          let that = this
          Vue.nextTick(function() {
            that.$refs.table.searchData()
          })
        } else if (endTime) {
          let newParams = {
            ...this.queryParam,
            endTime: endTime,
            systemName: systemName,
            serviceType: serviceType
          }
          this.queryParam = newParams
          let that = this
          Vue.nextTick(function() {
            that.$refs.table.searchData()
          })
        } else {
          let newParams = {
            ...this.queryParam,
            startTime: beginTime,
            endTime: endTime,
            systemName: systemName,
            serviceType: serviceType
          }
          this.queryParam = newParams
          let that = this
          Vue.nextTick(function() {
            that.$refs.table.searchData()
          })
        }
      }
    },
    reSet () {
      let that = this
      Object.keys(that.queryParam).forEach((key) => {
        if (key !== 'logType') {
          that.queryParam[key] = ''
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
    }
  }
}
</script>
