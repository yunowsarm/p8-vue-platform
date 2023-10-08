<template>
  <list-layout>
    <template #north>
      <search-form-list ref="search" :data-source="searchData" @search="search" @re-set="reSet"></search-form-list>
    </template>
    <template #center>
      <div id="table-contain">
        <common-table
          ref="table"
          :flex="214"
          :columns="columns"
          :table-refresh="tableRefresh"
          :params="queryParam"
          :api="tableApi"
          :comp="comp"
          :use-tree-format="true"
          :use-tree-p-id="useTreePId"
          :custom-height="flexHeight"
          :pagination="false"
        >
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
    title: '图号',
    dataIndex: 'invcode',
    width: 200,
    align: 'center'
  },
  {
    title: '型号代号',
    dataIndex: 'prodmodel',
    width: 200,
    align: 'center'
  },
  {
    title: '工作令',
    dataIndex: 'workorder',
    width: 200,
    align: 'center'
  },
  {
    title: '物料名称',
    dataIndex: 'invname',
    align: 'left',
    minWidth: 200
  },
  {
    title: '规格',
    dataIndex: 'invspec',
    width: 200,
    align: 'center'
  },
  {
    title: '需要数量',
    dataIndex: 'requirenum',
    align: 'left',
    minWidth: 200
  },
  {
    title: '合计出库数量',
    dataIndex: 'sumoutnum',
    width: 200,
    align: 'center'
  },
  {
    title: '计量单位',
    dataIndex: 'measure',
    width: 150,
    align: 'center'
  }
]

export default {
  name: 'ErpTree',
  components: {
    ListLayout,
    CommonTable,
    SearchFormList
  },
  props: {
    planTypeParam: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data() {
    return {
      flexHeight: document.documentElement.clientHeight - 160,
      comp: this,
      visibleDetailDrawer: false,
      queryParam: {},
      tableApi: 'erpTask.erpTaskTreeData',
      columns: columns,
      useTreePId: 'parentId',
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
  created() {
    this.queryParam = Object.assign({}, this.planTypeParam)
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
