<template>
  <list-layout>
    <template #north>
      <search-form-list ref="search" :data-source="searchData" @search="search" @re-set="reSet"></search-form-list>
    </template>
    <template #center>
      <div id="table-contain">
        <common-table ref="table" :flex="214" :columns="columns" :table-refresh="tableRefresh" :params="queryParam" :api="tableApi" :comp="comp" :custom-height="flexHeight" :pagination="true">
        </common-table>
      </div>
    </template>
  </list-layout>
</template>

<style scoped>
.number-click {
  text-decoration: underline;
  cursor: pointer;
}
</style>
<script>
import Vue from 'vue'
import { P8ListLayout as ListLayout, P8Table as CommonTable, P8Search as SearchFormList } from 'p8-components-ui'

const columns = [
  {
    title: '序号',
    type: 'index',
    width: 55,
    align: 'center'
  },
  {
    title: '型号代号',
    dataIndex: 'prodmodel',
    align: 'center',
    width: 200
  },
  {
    title: '工作令',
    dataIndex: 'workorder',
    align: 'center',
    width: 200
  },
  {
    title: '物料编号',
    dataIndex: 'invcode',
    align: 'center',
    width: 200
  },
  {
    title: '物料名称',
    dataIndex: 'invname',
    align: 'center',
    width: 200
  },
  {
    title: '规格',
    dataIndex: 'invspec',
    align: 'center',
    width: 200
  },
  {
    title: '投产数量',
    dataIndex: 'requirenum',
    align: 'center',
    width: 200
  },
  {
    title: '合计入库数量',
    dataIndex: 'suminnum',
    align: 'center',
    width: 200
  },
  {
    title: '计量单位',
    dataIndex: 'measure',
    align: 'center',
    width: 200
  },
  {
    title: '型号',
    dataIndex: 'invtype',
    align: 'center',
    width: 200
  },
  {
    title: '批次号',
    dataIndex: 'vbatchcode',
    align: 'center',
    width: 200
  },
  {
    title: '质量等级',
    dataIndex: 'qualitygrade',
    align: 'center',
    width: 200
  },
  {
    title: '供应商',
    dataIndex: 'manufacture',
    align: 'center',
    width: 200
  },
  {
    title: '完成百分比',
    dataIndex: 'completepercent',
    align: 'center',
    width: 200
  },
  {
    title: '状态',
    dataIndex: 'status',
    align: 'center',
    width: 200
  }
]

export default {
  name: 'ErpList',
  components: {
    ListLayout,
    CommonTable,
    SearchFormList
  },
  data() {
    return {
      flexHeight: document.documentElement.clientHeight - 100,
      comp: this,
      visibleDetailDrawer: false,
      queryParam: {},
      tableApi: 'erpTask.erpTaskListData',
      columns: columns,
      searchData: [
        {
          type: 'text',
          labelText: '图号',
          fieldName: 'invcode',
          placeholder: '请输入图号'
        },
        {
          type: 'text',
          labelText: '物料名称',
          fieldName: 'invname',
          placeholder: '请输入物料名称'
        },
        {
          type: 'text',
          labelText: '状态',
          fieldName: 'status',
          placeholder: '请输入状态'
        },
        {
          type: 'text',
          labelText: '型号',
          fieldName: 'model',
          placeholder: '请输入型号'
        },
        {
          type: 'text',
          labelText: '规格',
          fieldName: 'invspec',
          placeholder: '请输入规格'
        }
      ]
    }
  },
  mounted() {},
  computed: {},
  methods: {
    tableRefresh(param) {
      param
        .then(() => {
          console.log('异步成功后端做的操作')
        })
        .catch(() => {
          console.error('异步失败的操作')
        })
    },
    search(param) {
      const newParams = { ...param }
      this.queryParam = newParams
      const that = this
      Vue.nextTick(function () {
        that.$refs.table.searchData()
      })
    },
    reSet() {
      const that = this
      Object.keys(that.queryParam).forEach((key) => {
        that.queryParam[key] = ''
      })
      Vue.nextTick(function () {
        that.$refs.table.searchData()
      })
    }
  }
}
</script>
