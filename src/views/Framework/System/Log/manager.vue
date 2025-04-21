<template>
  <list-layout>
    <template #north>
      <!-- <common-button :comp="comp"></common-button> -->
      <export-execl :table-columns="columns"
                    :other-params="queryParams"
                    :api="exportApi"
                    style="float: left"></export-execl>

      <search-form-list ref="search"
                        :data-source="dataSource"
                        search-width="500px"
                        search-contain-width="500px"
                        @search="search"
                        @re-set="reset"></search-form-list>
    </template>
    <template #center>
      <common-table ref="table"
                    :comp="comp"
                    :flex="200"
                    :columns="columns"
                    :params="queryParams"
                    :api="tableApi"></common-table>
    </template>
  </list-layout>
</template>
<script>
import Vue from 'vue'
import { P8ListLayout as ListLayout, P8Search as SearchFormList, P8Table as CommonTable } from 'p8-components-ui'
import exportExecl from './Components/exportExecl'
export default {
  name: 'LogAuditManagement',
  data () {
    const dataSource = [
      // {
      //   type: 'datetimeRange',
      //   labelText: '计划时间',
      //   fieldName: 'datetimeRange',
      //   defaultValue: [],
      //   placeholder: ['开始日期', '结束日期']
      // },
      {
        type: 'text',
        labelText: '操作人员',
        fieldName: 'sysuserRealname',
        placeholder: '请输入操作人员',
        colLayout: 'doubleCol'
      },
      {
        type: 'text',
        labelText: 'IP地址',
        fieldName: 'iPAddress',
        placeholder: '请输入IP地址',
        colLayout: 'doubleCol'
      },
      {
        type: 'text',
        labelText: '操作',
        fieldName: 'operation',
        placeholder: '请输入'
      },
      {
        type: 'select',
        labelText: '模块',
        fieldName: 'module',
        options: [],
        optionUrl: { api: 'systemLog.logModule', params: {} }
      }
    ]
    const columns = [
      {
        title: '序号',
        type: 'index',
        width: '50',
        align: 'center',
        headerAlign: 'center'
      },
      {
        title: '模块',
        dataIndex: 'module',
        width: '180',
        align: 'left',
        export: true // 当前列是否需要导出
      },
      {
        title: '操作事件',
        dataIndex: 'operation',
        width: '200',
        align: 'left',
        export: true // 当前列是否需要导出
      },
      {
        title: '用户名',
        dataIndex: 'sysuserAccount',
        width: '150',
        align: 'center',
        export: true // 当前列是否需要导出
      },
      {
        title: '部门',
        dataIndex: 'departmentName',
        width: '120',
        align: 'center',
        isshow: false,
        export: false
      },
      {
        title: '姓名',
        dataIndex: 'sysuserRealname',
        width: '120',
        align: 'center',
        export: true // 当前列是否需要导出
      },
      {
        title: 'IP地址',
        dataIndex: 'ipAddress',
        align: 'center',
        export: true // 当前列是否需要导出
      },
      {
        title: '时间',
        dataIndex: 'recordingTime',
        align: 'center',
        export: true // 当前列是否需要导出
      },
      {
        title: '执行结果',
        dataIndex: 'result',
        align: 'center',
        export: true // 当前列是否需要导出
      }
    ]
    return {
      comp: this,
      tableApi: 'systemLog.list',
      exportApi: 'systemLog.list',
      dataSource: dataSource,
      queryParams: {},
      columns: columns,
      exportData: []
    }
  },
  mounted () {
    if (this.$route.meta && this.$route.meta.type) {
      if (this.$route.meta.type === 'safe') {
        this.columns.map((c) => {
          if (c.dataIndex === 'departmentName') {
            c.isshow = true
            c.export = true
          }
        })
      }
    }
  },
  methods: {
    search (params) {
      this.queryParams = params
      let that = this
      this.getExportData()
      Vue.nextTick(function () {
        that.$refs.table.searchData()
      })
    },
    reset () {
      let that = this
      Object.keys(that.queryParams).forEach((key) => {
        return (that.queryParams[key] = null)
      })
      this.getExportData()
      Vue.nextTick(function () {
        that.$refs.table.searchData()
      })
    },
    startDownload () {

    },
    finishDownload () {

    }
  },
  components: {
    ListLayout,
    // CommonButton,
    CommonTable,
    SearchFormList,
    exportExecl
  }
}
</script>
