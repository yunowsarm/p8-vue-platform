<template>
  <list-layout>
    <!--    <template #north>-->
    <!--      <search-form-list ref="search"-->
    <!--                        :dataSource="searchData"-->
    <!--                        @search="search"-->
    <!--                        @re-set="reSet"></search-form-list>-->
    <!--    </template>-->
    <template #center>
      <div id="table-contain">
        <common-table ref="table" :flex="100" :columns="columns" :table-refresh="tableRefresh" :params="queryParam" :api="tableApi" :comp="comp" :custom-height="flexHeight" :pagination="false">
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
import { P8ListLayout as ListLayout, P8Table as CommonTable } from 'p8-components-ui'

// import { P8Search as SearchFormList } from 'p8-components-ui'
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
    align: 'center',
    width: 200
  },
  {
    title: '名称',
    width: 120,
    align: 'center',
    dataIndex: 'invname'
  },
  {
    title: '产品编号',
    width: 120,
    align: 'center',
    dataIndex: 'cpbh'
  },
  {
    title: '工序号',
    width: 120,
    align: 'center',
    dataIndex: 'gxh'
  },
  {
    title: '工序名称',
    width: 120,
    align: 'center',
    dataIndex: 'gxmc'
  },
  {
    title: '提出人',
    width: 120,
    align: 'center',
    dataIndex: 'tcr'
  },
  {
    title: '问题内容',
    align: 'center',
    width: 120,
    dataIndex: 'wtnr'
  },
  {
    title: '发生日期',
    align: 'center',
    width: 120,
    dataIndex: 'fsrq'
  },
  {
    title: '状态',
    align: 'center',
    width: 120,
    dataIndex: 'zt'
  },
  {
    title: '处理意见',
    align: 'center',
    width: 220,
    dataIndex: 'clyj'
  },
  {
    title: '质量问题处理单号',
    align: 'center',
    width: 200,
    dataIndex: 'zlwtno'
  }
]

export default {
  name: 'ErpList',
  components: {
    ListLayout,
    CommonTable
    // SearchFormList
  },
  props: {
    taskId: {
      type: String,
      default: ''
    },
    params: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      flexHeight: document.documentElement.clientHeight - 160,
      comp: this,
      visibleDetailDrawer: false,
      zyjhno: '',
      type: '',
      showMES: false,
      queryParam: { gxh: this.params.gxh, zyjhno: this.params.zyjhno },
      drawerConfig: {
        modal: false
      },
      tableApi: 'erpTask.zlwtListData',
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
    closeDrawer() {
      this.showMES = false
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
