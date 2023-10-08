<template>
  <common-dialog
    title="查看输出物"
    width="90%"
    :dialog-height="dialogHeight"
    :show-handle-btn="false"
    :dialog-config="dialogConfig"
    :close-on-click-modal="false"
    :visible="visible"
    :close-on-press-escape="false"
    @isfullscreen="isfullscreen"
    @close="handleCancel"
  >
    <template #dialog>
      <common-table ref="table" :columns="columns" :table-setting="false" :pagination="false" :table-config="tableConfig" :no-api-table-data="tableData" :style="{ height: customTableHeight + 'px' }">
        <template #monitorpoint="{ scope }">
          <span v-for="item in monitorpointIconHandle(scope.row)" :key="item.id" style="padding: 0 2px">
            <el-tooltip effect="light" placement="bottom-start">
              <div slot="content">
                <p v-html="item.title"></p>
              </div>
              <i :class="item.icon" :style="{ color: item.color }" @click="iconClick(scope.row)" style="cursor: pointer"></i>
            </el-tooltip>
          </span>
        </template>
        <template #outPutName="{ scope }">
          <span v-if="scope.row.outPutName">
            {{ scope.row.outPutName }}
          </span>
          <span v-else-if="scope.row.parentId" style="cursor: pointer; color: red; text-decoration: underline" @click="showDetail(scope.row)"> 添加输出物 </span>
        </template>
      </common-table>
      <revenue-view v-if="revenueBudgetVisible" :visible="revenueBudgetVisible" :other-param="revenueBudgetParam" @close-dialog="revenueBudgetClose"> </revenue-view>
      <el-drawer :title="detailTitle" :append-to-body="true" size="50%" :destroy-on-close="true" :wrapper-closable="false" @closed="detailDrawerClosed" :visible.sync="detailVisible">
        <output-edit :task-id="selectTaskId" :gantt-name="ganttName"></output-edit>
      </el-drawer>
    </template>
  </common-dialog>
</template>
<script>
import { Drawer, Tooltip, P8Dialog as CommonDialog, P8Table as CommonTable } from 'p8-components-ui'
import { generateTree } from '@/utils/generateTree'
import { getMonitorData, getBudgetData } from '@/components/workLayout/Components/projectProgress/Components/layoutData'
import RevenueView from '@/components/workLayout/Components/projectProgress/Components/taskProgressInformation/Components/revenueView'
import OutputEdit from './components/outputEdit'

export default {
  name: 'OutPutView',
  components: {
    CommonDialog,
    RevenueView,
    OutputEdit,
    CommonTable,
    'el-drawer': Drawer,
    'el-tooltip': Tooltip
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    planInfoId: {
      type: String,
      default: ''
    },
    taskId: {
      type: String,
      default: ''
    },
    ganttName: {
      type: String,
      default: ''
    },
    createPage: {
      type: String,
      default: ''
    },
    planTypeDatas: {
      type: Array,
      default: () => []
    }
  },
  data() {
    const columns = [
      {
        title: '标记',
        type: 'index',
        width: 100,
        align: 'center',
        dataIndex: 'monitorpoint',
        scopedSlots: {
          customRender: 'custom'
        }
      },
      {
        title: '任务名称',
        dataIndex: 'name'
      },
      {
        title: '输出物名称',
        width: 350,
        align: 'center',
        dataIndex: 'outPutName',
        scopedSlots: {
          customRender: 'custom'
        }
      }
    ]
    return {
      selectTaskId: '',
      status: '',
      detailTitle: '',
      dialogConfig: {
        'append-to-body': true
      },
      tableData: [], // 列表数据
      isListLoading: false, // 列表加载
      monitorpointDataArray: [],
      revenueBudgetParam: {},
      detailVisible: false,
      readOnly: false,
      revenueBudgetVisible: false,

      dialogHeight: document.documentElement.clientHeight * 0.6,
      columns,
      customTableHeight: 0,
      tableConfig: {
        'default-expand-all': true,
        'highlight-current-row': true
      }
    }
  },
  created() {
    const that = this
    getMonitorData({ monitorId: [] }).then((res) => {
      that.monitorpointDataArray = res
    })
  },
  mounted() {
    this.customTableHeight = this.dialogHeight - 10
    this.queryList()
  },
  methods: {
    isfullscreen(isfullscreen) {
      if (isfullscreen) {
        this.customTableHeight = document.documentElement.clientHeight - 60
      } else {
        this.customTableHeight = this.dialogHeight - 10
      }
    },
    monitorpointIconHandle(row) {
      const that = this
      const tempIcon = []
      if (row.monitorpointArray) {
        const monitorpointArray = row.monitorpointArray.split(',')
        monitorpointArray.forEach((item, index) => {
          tempIcon.push({ id: item, icon: that.monitorpointDataArray[item].icon, title: that.monitorpointDataArray[item].name, color: '#0070C5' })
        })
      }
      if (row.revenueBudgetId) {
        tempIcon.push({ id: row.revenueBudgetId, icon: 'p8 icon-cost', title: '经费标识', color: '#1bbf9e' })
      }

      if (row.planType && this.planTypeDatas) {
        this.planTypeDatas.some((point, index) => {
          if (point.id === row.planType) {
            tempIcon.push({ id: row.planType, icon: point.icon, title: point.title, color: '#0070C5' })
          }
        })
      }
      return tempIcon
    },
    iconClick(row) {
      const that = this
      if (row.revenueBudgetId) {
        getBudgetData({ revenueBudgetId: row.revenueBudgetId }).then((res) => {
          that.revenueBudgetParam = res
          that.revenueBudgetVisible = true
        })
      }
    },
    revenueBudgetClose() {
      this.revenueBudgetVisible = false
      this.revenueBudgetParam = Object.assign({})
    },
    showDetail(row) {
      this.selectTaskId = row.id
      this.status = row.status
      this.detailVisible = true
      this.detailTitle = row.name
    },
    detailDrawerClosed(res) {
      this.detailVisible = false
      this.selectTaskId = ''
      this.detailTitle = ''
      this.queryList()
    },
    handleCancel() {
      this.$emit('close-dialog')
    },

    handleRowClick(row, c, e) {},
    searchData() {
      // 查询列表数据时调用列表数据接口
      this.queryList()
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
    setItemKey(item) {
      item.key = item.id
      const that = this
      if (item.children && item.children.length > 0) {
        item.children.map(function (subItem, idx) {
          that.setItemKey(subItem)
        })
      }
    },
    queryList() {
      const that = this
      this.isListLoading = true
      this.tableRefresh(
        new Promise((resolve, reject) => {
          that.$api['planGanttManager.outPutViewData']({ planInfoId: that.planInfoId, taskId: that.taskId })
            .then(function (res) {
              if (res && res.length > 0) {
                const data = generateTree(res, 'parentId')
                if (data && data.length > 0) {
                  data.forEach(function (item, idx) {
                    that.setItemKey(item)
                  })
                }
                that.tableData = data
              } else {
                that.tableData = []
              }
              that.isListLoading = false
              resolve() // 调用列表接口成功后的回调方法
            })
            .catch(function (error) {
              reject(error) // 调用列表接口失败后的回调方法
            })
        })
      )
    }
  }
}
</script>

<style lang="scss"></style>
