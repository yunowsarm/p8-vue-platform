<template>
  <list-layout>
    <template #north>
      <search-form-list :comp="comp"
                        ref="search"
                        :data-source="searchData"
                        @search="search"
                        @re-set="reSet"></search-form-list>
    </template>
    <template #center>
      <div id="table-contain">
        <common-table ref="table"
                      :comp="comp"
                      :columns="columns"
                      :params="queryParam"
                      :api="tableApi"
                      :table-refresh="tableRefresh"
                      pagination="true"></common-table>
      </div>
    </template>
  </list-layout>
</template>
<style></style>
<script>
import moment from 'moment'
import Vue from 'vue'
import { P8Table as CommonTable, P8ListLayout as ListLayout, P8Search as SearchFormList } from 'p8-components-ui'

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
    align: 'center'
  },
  {
    title: '接口类型',
    dataIndex: 'serviceType',
    width: 150,
    align: 'center'
  },
  {
    title: '对方系统',
    dataIndex: 'systemName',
    width: 150,
    align: 'center'
  },
  {
    title: '调用时间',
    dataIndex: 'itemCreateTime',
    width: 150,
    formatter: function (row) {
      if (row.itemCreateTime !== '' && row.itemCreateTime != null) {
        let reg = new RegExp('T')
        return row.itemCreateTime.replace(reg, ' ')
      }
    },
    align: 'center'
  },
  {
    title: '自定义参数',
    dataIndex: 'customParam',
    width: 150,
    align: 'center'
  },
  {
    title: '请求参数',
    dataIndex: 'requestContent',
    width: 310,
    align: 'center'
  },
  {
    title: '返回参数',
    dataIndex: 'responseContent',
    width: 310,
    align: 'center'
  },
  {
    title: '执行时长(ms)',
    dataIndex: 'responseInterval',
    width: 150,
    align: 'center'
  }
]

export default {
  name: 'LogList',
  components: {
    CommonTable,
    ListLayout,
    SearchFormList
  },
  data () {
    return {
      comp: this,
      drawerTitle: '',
      queryParam: {},
      tableApi: 'thirdPartInterface.logListData',
      advanced: false,
      columns: columns,
      id: '',
      scroll: {},
      tableConfig: {
        defaultExpandAllRows: true
      },
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
          fieldConfig: {
            format: 'YYYY-MM-DD HH:mm:ss',
            style: 'width: 100%'
          }
        }
      ]
    }
  },
  mounted () { },
  computed: {},
  methods: {
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
        let newParams = { ...this.queryParam, startTime: beginTime, endTime: endTime, systemName: systemName, serviceType: serviceType }
        this.queryParam = newParams
        let that = this
        Vue.nextTick(function () {
          that.$refs.table.searchData()
        })
      } else {
        if (beginTime) {
          let newParams = { ...this.queryParam, startTime: beginTime, systemName: systemName, serviceType: serviceType }
          this.queryParam = newParams
          let that = this
          Vue.nextTick(function () {
            that.$refs.table.searchData()
          })
        } else if (endTime) {
          let newParams = { ...this.queryParam, endTime: endTime, systemName: systemName, serviceType: serviceType }
          this.queryParam = newParams
          let that = this
          Vue.nextTick(function () {
            that.$refs.table.searchData()
          })
        } else {
          let newParams = { ...this.queryParam, startTime: beginTime, endTime: endTime, systemName: systemName, serviceType: serviceType }
          this.queryParam = newParams
          let that = this
          Vue.nextTick(function () {
            that.$refs.table.searchData()
          })
        }
      }
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

        })
        .catch(() => {

        })
    }
  }
}
</script>
