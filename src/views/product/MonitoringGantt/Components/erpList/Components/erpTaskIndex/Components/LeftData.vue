<template>
  <list-layout :header-visible="false">
    <template #center>
      <div id="table-contain">
        <common-table
          ref="table"
          :columns="columns"
          :table-refresh="tableRefresh"
          :params="queryParam"
          :api="tableApi"
          :comp="comp"
          :custom-height="flexHeight"
          @row-click="drillCol"
          :pagination="false"
        >
        </common-table>
      </div>
    </template>
    <template #drawer-panel>
      <common-drawer size="100%" :visible="showMES" direction="ttb" :drawer-config="drawerConfig" :is-need-custom-drawer-class="false" @close="closeDrawer">
        <template #drawer>
          <mes-list :task-id="zyjhno" :type="type"></mes-list>
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
    title: '质量跟踪卡号',
    width: 120,
    align: 'center',
    dataIndex: 'zlgzkno'
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
    dataIndex: 'amount'
  },
  {
    title: '责任人',
    width: 120,
    align: 'center',
    dataIndex: 'zrr'
  },
  {
    title: '部门',
    width: 120,
    align: 'center',
    dataIndex: 'dept'
  },
  {
    title: '计划开始时间',
    align: 'center',
    width: 120,
    dataIndex: 'planBeginDate'
  },
  {
    title: '计划结束时间',
    align: 'center',
    width: 120,
    dataIndex: 'planEndDate'
  },
  {
    title: '产品编号',
    align: 'center',
    width: 120,
    dataIndex: 'cpbh'
  },
  {
    title: '当前工序进度',
    align: 'center',
    width: 120,
    dataIndex: 'dqgxjd'
  },
  {
    title: '当前工序名称',
    align: 'center',
    width: 120,
    dataIndex: 'dqgxmc'
  },
  {
    title: '完成状态',
    align: 'center',
    width: 120,
    dataIndex: 'wczt'
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
    type: {
      type: String,
      default: ''
    },
    zyjhno: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      flexHeight: document.documentElement.clientHeight - 160,
      comp: this,
      visibleDetailDrawer: false,
      showMES: false,
      queryParam: { type: this.type, zyjhno: this.zyjhno },
      drawerConfig: {
        modal: false
      },
      tableApi: 'erpTask.vlpLeftListData',
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
      const zlgzkno = record.zlgzkno
      const type = record.type
      this.$emit('left', zlgzkno, type)
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
