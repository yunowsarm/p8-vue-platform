<template>
  <normal-layout :normal-layout="layoutConfig" :header-visible="false">
    <template #west>
      <left-data @left="left"> </left-data>
    </template>
    <template #center>
      <!-- <div id="table-contain">
        <common-table ref="table"
                      :flex="100"
                      :columns="columns"
                      :table-Refresh="tableRefresh"
                      :params="queryParam"
                      :api="tableApi"
                      :comp="comp"
                      :customHeight="flexHeight"
                      @row-click = "drillCol"
                      :pagination="false">
        </common-table>
      </div> -->
      <right-data :query-param="queryParam"></right-data>
    </template>
  </normal-layout>
</template>

<style scoped>
.number-click {
  text-decoration: underline;
  cursor: pointer;
}
</style>
<script>
import Vue from 'vue'
import { P8NormalLayout as NormalLayout } from 'p8-components-ui'
// import { P8Search as SearchFormList } from 'p8-components-ui'
import LeftData from './LeftData'
import RightData from './RightData'
const columns = [
  {
    title: '序号',
    type: 'index',
    width: 55,
    align: 'center'
  },
  {
    title: '作业计划号',
    align: 'center',
    dataIndex: 'zyjhno'
  },
  {
    title: '入库数量  ',
    align: 'center',
    dataIndex: 'storeAmount'
  }
]

export default {
  name: 'ErpList',
  components: {
    NormalLayout,
    LeftData,
    RightData
    // SearchFormList
  },
  props: {
    planTypeParam: {
      type: Object,
      default: function () {
        return {}
      }
    },
    taskId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      flexHeight: document.documentElement.clientHeight - 160,
      comp: this,
      visibleDetailDrawer: false,
      zyjhno: '',
      gxh: '',
      zlwt: false,
      queryParam: { zyjhno: '' },
      drawerConfig: {
        modal: false
      },
      layoutConfig: {
        west: {
          xs: 12,
          sm: 12,
          md: 12,
          lg: 12,
          xl: 12
        },
        center: {
          xs: 12,
          sm: 12,
          md: 12,
          lg: 12,
          xl: 12
        }
      },
      tableApi: 'erpTask.vlpRight',
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
    left(no, type) {
      this.queryParam.zyjhno = no
      this.queryParam.type = type
    },
    tableRefresh(param) {
      param
        .then(() => {
          console.log('异步成功后端做的操作')
        })
        .catch(() => {
          console.error('异步失败的操作')
        })
    },
    drillCol(record) {
      this.zyjhno = record.zyjhno
      this.gxh = record.gxh
      this.zlwt = true
    },
    closeDrawer() {
      this.zlwt = false
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
