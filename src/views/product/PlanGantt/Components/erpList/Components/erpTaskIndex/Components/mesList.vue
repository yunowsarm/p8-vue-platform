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
          <template #amount="{ scope }">
            <span class="number-click" @click="drillCol(scope.row)">{{ scope.row.amount }}</span>
          </template>
        </common-table>
      </div>
    </template>
    <template #drawer-panel>
      <common-drawer size="100%" :visible="showMES" title="作业计划明细" direction="ttb" :drawer-config="drawerConfig" :is-need-custom-drawer-class="false" @close="closeDrawer">
        <template #drawer>
          <mes-list :zyjhno="zyjhno" :type="type"></mes-list>
        </template>
      </common-drawer>
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
import { P8ListLayout as ListLayout, P8Table as CommonTable, P8Drawer as CommonDrawer } from 'p8-components-ui'
import MesList from './zyjhMessage'
const columns = [
  {
    title: '序号',
    type: 'index',
    width: 55,
    align: 'center'
  },
  {
    title: '作业计划号',
    width: 120,
    align: 'center',
    dataIndex: 'zyjhno'
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
    title: '数量',
    width: 120,
    align: 'center',
    scopedSlots: { customRender: 'custom' },
    dataIndex: 'amount'
  },
  {
    title: '责任人',
    align: 'center',
    dataIndex: 'zrr'
  },
  {
    title: '部门',
    align: 'center',
    dataIndex: 'dept'
  },
  {
    title: '制单人',
    width: 120,
    align: 'center',
    dataIndex: 'zdr'
  },
  {
    title: '计划开始时间  ',
    align: 'center',
    width: 120,
    dataIndex: 'planBeginDate'
  },
  {
    title: '计划结束时间  ',
    align: 'center',
    width: 120,
    dataIndex: 'planEndDate'
  },
  {
    title: '完工数量  ',
    align: 'center',
    width: 120,
    dataIndex: 'finishAmount'
  },
  {
    title: '入库仓库  ',
    align: 'center',
    width: 120,
    dataIndex: 'store'
  },
  {
    title: '入库数量  ',
    align: 'center',
    width: 120,
    dataIndex: 'storeAmount'
  }
]

export default {
  name: 'ErpList',
  components: {
    ListLayout,
    CommonTable,
    CommonDrawer,
    MesList
    // SearchFormList
  },
  props: {
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
      type: '',
      showMES: false,
      queryParam: { taskId: this.taskId },
      drawerConfig: {
        modal: false
      },
      tableApi: 'erpTask.mesTaskListData',
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
    drillCol(record) {
      this.zyjhno = record.zyjhno
      const dept = record.dept
      if (dept && (dept === '飞控部' || dept === '光电部')) {
        this.type = 'mes'
      }
      this.showMES = true
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
