<template>
  <list-layout>
    <template #north>
      <search-form-list ref="search" :data-source="searchData" @search="search" @re-set="reSet"></search-form-list>
    </template>
    <template #center>
      <div id="table-contain">
        <common-table ref="table" :flex="214" :columns="columns" :table-refresh="tableRefresh" :params="queryParam" :api="tableApi" :comp="comp" :custom-height="flexHeight" :pagination="true">
          <template #requirenum="{ scope }">
            <span class="number-click" @click="drillCol(scope.row)">{{ scope.row.requirenum }}</span>
          </template>
        </common-table>
      </div>
    </template>
    <template #drawer-panel>
      <common-drawer size="100%" :visible="showMES" direction="ttb" :drawer-config="drawerConfig" :is-need-custom-drawer-class="false" @close="closeDrawer">
        <template #drawer>
          <mes-list :task-id="taskId"></mes-list>
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
import { P8ListLayout as ListLayout, P8Table as CommonTable, P8Search as SearchFormList, P8Drawer as CommonDrawer } from 'p8-components-ui'

import MesList from './Components/mesList'
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
    title: '图号',
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
    title: '投产数量',
    dataIndex: 'requirenum',
    scopedSlots: { customRender: 'custom' },
    align: 'center',
    width: 100
  },
  {
    title: '合计入库数量',
    dataIndex: 'suminnum',
    align: 'center',
    width: 100
  },
  {
    title: '计量单位',
    dataIndex: 'measure',
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
    title: '主制单位',
    dataIndex: 'manufacture',
    align: 'center',
    width: 200
  },
  {
    title: '完成百分比',
    dataIndex: 'completepercent',
    align: 'center',
    width: 100
  },
  {
    title: '状态',
    dataIndex: 'status',
    align: 'center',
    width: 100
  }
]

export default {
  name: 'ErpList',
  components: {
    ListLayout,
    CommonTable,
    CommonDrawer,
    MesList,
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
      showMES: false,
      taskId: '',
      queryParam: {},
      drawerConfig: {
        modal: false
      },
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
    drillCol(record) {
      this.taskId = record.invcode
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
