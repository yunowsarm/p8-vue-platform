<template>
  <list-layout>
    <!--        <template #north>-->
    <!--            <common-button :comp="comp" ></common-button>-->
    <!--            <search-form-list ref="search" :dataSource="searchData" @search="search" ></search-form-list>-->
    <!--        </template>-->
    <template #center>
      <div id="table-contain">
        <common-table ref="table"
                      :fiex="200"
                      :columns="columns"
                      :table-Refresh="tableRefresh"
                      :params="queryParam"
                      :api="tableApi"
                      :comp="comp"
                      :pagination=true>
          <template #overdue="{ scope }">
            <div v-html="overdueTextFun(scope.row)"></div>
          </template>
        </common-table>
      </div>
    </template>
    <!--        <template #drawer-panel>-->
    <!--            <common-drawer v-if="visibleModelEditDrawer"  size="50%" :title="drawerTitle" :visible="visibleModelEditDrawer" @close="onEditModelClose">-->
    <!--                <template #drawer>-->
    <!--                    <model-edit @saveSuccess="saveCallback" :id="id"></model-edit>-->
    <!--                </template>-->
    <!--            </common-drawer>-->
    <!--        </template>-->
  </list-layout>
</template>

<style scoped>
</style>
<script>
import Vue from 'vue'
import { P8ListLayout as ListLayout, P8Table as CommonTable, P8Button as CommonButton, P8Search as SearchFormList } from 'p8-components-ui'
import { overdueTextHandle } from '@/utils/common'
const columns = [
  {
    title: '序号',
    type: 'index'
  },
  {
    title: '任务名称',
    dataIndex: 'name',
    template: function (task) {
      if (task.style) {
        return '<div style="color:' + task.style + '">' + task.name + '</div>'
      } else {
        return task.name
      }
    }
  },
  {
    title: '责任人',
    dataIndex: 'realName'
  },
  {
    title: '责任部门',
    dataIndex: 'deptName'
  },
  {
    title: '状态',
    dataIndex: 'status'
  },
  {
    title: '超期/剩余天数',
    dataIndex: 'overdue',
    scopedSlots: {
      customRender: 'custom'
    }
  },
  {
    title: '工期',
    dataIndex: 'duration'
  },
  {
    title: '计划开始时间',
    dataIndex: 'start_date',
    formatter (row, column, cellValue, index) {
      if (cellValue) {
        return cellValue.slice(0, 10)
      }
    }
  },
  {
    title: '计划完成时间',
    dataIndex: 'end_date',
    formatter (row, column, cellValue, index) {
      if (cellValue) {
        return cellValue.slice(0, 10)
      }
    }
  },
  {
    title: '实际开始时间',
    dataIndex: 'realBeginDate',
    formatter (row, column, cellValue, index) {
      if (cellValue) {
        return cellValue.slice(0, 10)
      }
    }
  },
  {
    title: '实际完成时间',
    dataIndex: 'realEndDate',
    formatter (row, column, cellValue, index) {
      if (cellValue) {
        return cellValue.slice(0, 10)
      }
    }
  },

  {
    title: '预计开始时间',
    dataIndex: 'task_forecast_begin_dateduration',
    formatter (row, column, cellValue, index) {
      if (cellValue) {
        return cellValue.slice(0, 10)
      }
    }
  },
  {
    title: '预计完成时间',
    dataIndex: 'task_forecast_end_date',
    formatter (row, column, cellValue, index) {
      if (cellValue) {
        return cellValue.slice(0, 10)
      }
    }
  }
]

export default {
  name: 'ModelList',
  components: {
    ListLayout,
    CommonTable,
    CommonButton,
    SearchFormList
  },
  props: {
    taskId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      drawerTitle: '',
      comp: this,
      visibleModelEditDrawer: false,
      queryParam: {
        taskId: this.taskId
      },
      tableConfig: {
        queryParam: {},
        highlightCurrentRow: true
      },
      tableApi: 'PlanFinishRate.getFrontTask',
      columns: columns,
      tableHeight: 1,
      id: ''
    }
  },
  mounted () {
  },
  computed: {

  },
  methods: {
    overdueTextFun (row) {
      return overdueTextHandle(row)
    },
    tableRefresh (param) {
      param.then(() => {

      }).catch(() => {
        console.error('异步失败的操作')
      })
    },
    reSet () {
      let that = this
      Object.keys(that.queryParam).forEach(key => { that.queryParam[key] = '' })
      Vue.nextTick(function () {
        that.$refs.table.searchData()
      })
    }
  }
}

</script>
