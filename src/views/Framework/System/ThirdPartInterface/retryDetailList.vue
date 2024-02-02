<template>
  <div>
    <form-list ref="form"
               @rendered="rendered"
               :data-source="dataSource"
               :form="record"
               :is-view="true"></form-list>
    <common-table ref="table"
                  v-on="{ doOneRetry: doOneRetry }"
                  :columns="columns"
                  :params="queryParam"
                  :api="retryDetailListApi"
                  :table-refresh="tableRefresh"
                  :pagination="true"
                  @click="iconClick"></common-table>
  </div>
</template>
<script>
import { P8Table as CommonTable, P8Form as FormList } from 'p8-components-ui'

const columns = [
  {
    title: '序号',
    type: 'index',
    width: 40,
    align: 'center'
  },
  {
    title: '异常发生时间',
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
    title: '推送报文',
    dataIndex: 'requestContent',
    align: 'center'
  },
  {
    title: '返回报文',
    dataIndex: 'responseContent',
    align: 'center'
  },
  {
    title: '错误类型',
    dataIndex: 'type',
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
  name: 'RetryDetailList',
  components: {
    CommonTable,
    FormList
  },
  props: {
    serviceBindId: {
      type: String,
      default: ''
    },
    record: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      loadPermissionBtn: true,
      advanced: false,
      columns: columns,
      queryParam: { serviceBindId: this.record.id },
      retryDetailListApi: 'thirdPartInterface.retryDetailList',
      dataSource: [
        {
          type: 'view',
          labelText: '接口名称',
          fieldName: 'serviceName',
          colLayout: 'doubleCol'
        },
        {
          type: 'hidden',
          fieldName: 'id',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '接口提供方',
          fieldName: 'providerName',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '对方系统',
          fieldName: 'systemName',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '业务描述',
          fieldName: 'serviceDesc',
          colLayout: 'doubleCol'
        }
      ],
      modifyData: {}
    }
  },
  mounted () { },
  methods: {
    rendered () { },
    tableRefresh (param) {
      param
        .then(() => {
          console.log('异步成功后端做的操作')
        })
        .catch(() => {
          console.log('异步失败的操作')
        })
    },
    iconClick (record) {
      console.log(record, 'record')
    },
    doOneRetry (record) {
      /// commonDrawer 中的commonTable row 上的按钮获取错误，可能没有按照parentId获取，待组件满足
      let that = this
      this.$confirm('是否确定要进行单条手动处理？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          that.$api['thirdPartInterface.doRetry']({ serviceBindId: record.id })
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
    }
  }
}
</script>
