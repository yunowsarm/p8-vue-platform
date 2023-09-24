<template>
  <common-dialog
    title="清空非生产任务数量"
    :visible="visible"
    width="90%"
    :dialog-height="570"
    :show-handle-btn="false"
    :dialog-config="dialogConfig"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleCancel"
  >
    <template #dialog>
      <list-layout>
        <template #north>
          <el-button type="primary" round @click="updateProject()">清空</el-button>
        </template>
        <template #center>
          <div class="tableDiv">
            <el-table
              ref="treeData"
              :data="tableData"
              height="100%"
              highlight-current-row
              row-key="id"
              border
              v-loading="isListLoading"
              :default-expand-all="true"
              element-loading-text="加载中"
              element-loading-spinner="el-icon-loading"
              :cell-style="columnStyle"
              v-bind="tableConfig"
              @selection-change="changeFun"
            >
              <el-table-column type="selection" width="55"> </el-table-column>
              <el-table-column v-for="(item, index) in columns" :key="index" :prop="item.prop" :align="item.align" :type="item.type" :label="item.label" :min-width="item.minWidth" :width="item.width">
                <template slot-scope="scope">
                  <el-input v-if="item.prop == 'name'" size="small" :precision="4" :step="1" :min="0" v-model="scope.row[item.prop]"> </el-input>
                  <el-input v-if="item.prop == 'realName'" size="small" readonly autosize v-model="scope.row[item.prop]"> </el-input>
                  <el-input-number v-if="item.prop == 'num'" size="small" :precision="0" :step="1" :min="0" v-model="scope.row[item.prop]"> </el-input-number>
                  <template v-else>
                    <span>{{ scope.row[item.prop] }}</span>
                  </template>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </list-layout>
    </template>
  </common-dialog>
</template>
<style scoped>
.tableDiv {
  height: 100%;
}
.tableDiv .el-input-number {
  display: none;
}
.current-cell .el-input-number {
  display: block;
}
.current-cell .el-input-number + span {
  display: none;
}
.tableDiv .el-input {
  display: none;
}
.current-cell .el-input {
  display: block;
}
.current-cell .el-input + span {
  display: none;
}
.tableDiv .el-select {
  display: none;
}
.current-cell .el-select {
  display: block;
}
.current-cell .el-select + span {
  display: none;
}
</style>

<script>
import Vue from 'vue'
import { generateTree } from '@/utils/generateTree'
import { P8ListLayout as ListLayout, Table, P8Dialog as CommonDialog } from 'p8-components-ui'

// import { GanttResolveObject } from '@/assets/commonJS/ganttJS/resolve/resolveGanttObject'
const mh = document.documentElement.clientHeight - 185
export default {
  name: 'ProjectTask',
  components: {
    ListLayout,
    CommonDialog,
    'el-table': Table
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
    planTypeDatas: {
      type: Array,
      default: () => []
    },
    ganttName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      tableApi: 'productTask.loadPlanTask',
      tableAp1: 'productTask.updatePlanTask',
      tableAp2: 'productTask.updatePlanType',
      flexHeight: mh,
      queryParam: {},
      columns: [],
      columnsId: [],
      tableData: [],
      dialogConfig: {
        'append-to-body': true
      },
      finishTypeOptions: [],
      unitOptions: [],
      isListLoading: false, // 列表加载
      selectRowData: {},
      searchData: [
        {
          type: 'text', // 控件类型
          labelText: '任务名称', // 控件显示的文本
          fieldName: 'taskName',
          placeholder: '请输入任务名称'
        },
        {
          type: 'text', // 控件类型
          labelText: '批次号', // 控件显示的文本
          fieldName: 'batchNumber',
          placeholder: '请输入批次号' // 默认控件的空值文本
        }
      ],
      tableConfig: {
        expandIconColumnIndex: 2
      },
      rowTemp: {},
      selectedProductInfoId: '',
      productVisible: false,
      messageSave: true,
      params: [],
      saveType: true
    }
  },

  created() {
    this.initColumns()
  },
  mounted() {
    this.queryList()
  },
  computed: {},
  methods: {
    changeFun(val) {
      this.columnsId = []
      for (let i = 0; i < val.length; i++) {
        this.columnsId.push(val[i].id)
      }
      for (let i = 0; i < this.columnsId.length; i++) {}
    },
    // updateProject () {
    //   let that = this
    //   that.$api[that.tableAp]({ ...that.queryParam, planInfoId: that.planInfoId, taskId: that.taskId }).then(function (res) {
    //     this.queryList()
    //   }).catch(function (error) {
    //     that.queryList()
    //     console.error(error)
    //   })
    // },
    updateProject() {
      const that = this
      that.$api[that.tableAp2]({ columnsId: that.columnsId })
        .then(function (res) {
          that.$message({
            message: '清空成功',
            type: 'success'
          })
          that.queryList()
        })
        .catch(function (error) {
          that.queryList()
          console.error(error)
        })
    },
    monitorpointIconHandle(row) {
      const tempIcon = []
      if (row.planType && this.planTypeDatas) {
        this.planTypeDatas.some((point, index) => {
          if (point.id === row.planType) {
            tempIcon.push({ id: row.planType, icon: point.icon, title: point.title, color: '#0070C5' })
          }
        })
      }
      return tempIcon
    },
    iconClick(row) {},
    handleCancel() {
      this.$emit('close-dialog')
    },
    columnStyle({ row, column, rowIndex, columnIndex }) {
      if (row.children && row.children.length > 0) {
        return 'font-weight: 900;'
      }
    },
    initColumns() {
      const that = this
      that.columns = [
        {
          label: '任务名称',
          prop: 'name',
          minWidth: '300',
          align: 'left',
          nameEdit: true
        },
        {
          label: '责任人',
          prop: 'realName',
          minWidth: '150',
          align: 'center'
        },
        {
          label: '数量',
          prop: 'productQuantity',
          minWidth: '150',
          align: 'center'
        }
      ]
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
          if (that.tableApi) {
            that.$api[that.tableApi]({ ...that.queryParam, planInfoId: that.planInfoId, taskId: that.taskId })
              .then(function (res) {
                that.isListLoading = false
                const data = generateTree(res, 'parentId', '')
                if (data && data.length > 0) {
                  data.forEach(function (item, idx) {
                    that.setItemKey(item)
                  })
                }
                that.tableData = data
                that.rowTemp = data[0]
                resolve() // 调用列表接口成功后的回调方法
              })
              .catch(function (error) {
                console.error(error)
                reject(error) // 调用列表接口失败后的回调方法
              })
          }
        })
      )
    },
    showModal(row) {
      this.selectRowData = row
      this.selectedProductInfoId = row.productInfoId
      this.productVisible = true
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

    submit() {
      const that = this
      that.$api['thirdPath.callErpPlan']({ planInfoId: this.planInfoId }).then((res) => {
        if (res) {
          const flag = res.flag
          if (flag) {
            that.$message({
              type: 'success',
              message: '推送成功！'
            })
          } else if (!flag) {
            that.$message({
              type: 'error',
              message: res.resultMessage
            })
          }
        }
        that.queryList()
      })
    },
    search(param) {
      if (param) {
        this.queryParam = param
      }
      const that = this
      Vue.nextTick(function () {
        that.queryList()
      })
    },
    reSet() {
      const that = this
      Object.keys(that.queryParam).forEach((key) => {
        that.queryParam[key] = null
      })
      Vue.nextTick(function () {
        that.queryList()
      })
    }
  }
}
</script>
