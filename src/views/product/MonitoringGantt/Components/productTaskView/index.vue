<template>
  <common-dialog
    title="添加/查看生产计划"
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
          <!-- 添加一个Excel导入产品信息的BUTTON -->
          <!-- <el-button type="primary"
                      round
                      @click="importExcel=true">Excel导入</el-button>
               <el-drawer :title="importExcelTitle"
               :append-to-body="true"
               size="50%"
               :destroy-on-close="true"
               @closed="importExcelClosed"
               :visible.sync="importExcel">
                <import-excel @save-success="importExcelClosed"
                              :task-id="selectTaskId"
                              :output-request="excelImportData"></import-excel>
                </el-drawer> -->
          <!-- 添加一个Excel导入产品信息的BUTTON -->
          <!--            <el-button type="primary" round @click="submit()">同步生产计划</el-button>-->
          <el-button v-if="saveType" type="primary" round @click="save">保存</el-button>
          <!--            <search-form-list ref="search"-->
          <!--                              :dataSource="searchData"-->
          <!--                              @search="search"-->
          <!--                              @re-set="reSet"></search-form-list>-->
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
              :row-class-name="tableRowClassName"
              @cell-click="cellClick"
            >
              <el-table-column v-for="(item, index) in columns" :key="index" :prop="item.prop" :align="item.align" :type="item.type" :label="item.label" :min-width="item.minWidth" :width="item.width">
                <template slot-scope="scope">
                  <el-input
                    v-if="item.prop == 'batchNumber'"
                    size="small"
                    :precision="4"
                    :step="1"
                    :min="0"
                    v-model="scope.row[item.prop]"
                    @blur="removeClass"
                    @change="dataChange(item.prop, item.label, scope.row[item.prop], scope.row)"
                  >
                  </el-input>
                  <!--  备注输入框 -->
                  <!-- <el-input v-if="scope.row.planType == '310303'"
                              size="small"
                              placeholder="写明外包件配套数，如“1配2”"
                              :precision="4"
                              :step="1"
                              :min="0"
                              v-model="scope.row[item.prop]"
                              @blur="removeClass"
                              @change="dataChange(item.prop, item.label,scope.row[item.prop],scope.row)">
                    </el-input> -->
                  <el-input
                    v-if="item.prop == 'remark'"
                    size="small"
                    :placeholder="scope.row.planType == '310303' ? `写明外包件配套数，如“1配2”` : `请填写备注`"
                    :precision="4"
                    :step="1"
                    :min="0"
                    v-model="scope.row[item.prop]"
                    @blur="removeClass"
                    @change="dataChange(item.prop, item.label, scope.row[item.prop], scope.row)"
                  >
                  </el-input>
                  <el-input v-if="item.prop == 'mapCode'" size="small" readonly autosize v-model="scope.row[item.prop]" @blur="removeClass" @click.native="showModal(scope.row)">
                    <i class="el-icon-link" slot="suffix" type="link" :style="{ cursor: 'pointer', fontSize: '16px', color: '#08c' }"></i>
                  </el-input>
                  <el-input-number
                    v-if="item.prop == 'amount'"
                    size="small"
                    :precision="0"
                    :step="1"
                    :min="0"
                    :class="{ warning: scope.row.warning }"
                    v-model="scope.row[item.prop]"
                    @blur="removeClass"
                    @change="dataChange(item.prop, item.label, scope.row[item.prop], scope.row)"
                  >
                  </el-input-number>
                  <el-select
                    v-if="item.prop == 'finishTypeDisplay'"
                    v-model="scope.row['finishType']"
                    placeholder="请选择"
                    @change="dataChange(item.prop, item.label, scope.row[item.prop], scope.row)"
                  >
                    <el-option v-for="itemOption in finishTypeOptions" :key="itemOption.value" :label="itemOption.label" :value="itemOption.value"> </el-option>
                  </el-select>
                  <el-select
                    v-if="item.prop == 'unitDisplay'"
                    v-model="scope.row['unit']"
                    placeholder="请选择"
                    clearable
                    @clear="clearChange(scope.row, 'unitDisplay')"
                    @change="dataChange(item.prop, item.label, scope.row[item.prop], scope.row)"
                  >
                    <el-option
                      v-for="itemOption in unitOptions"
                      :key="itemOption.value"
                      @click.native="dataChangeTwo(itemOption.label, scope.row, 'unitDisplay')"
                      :label="itemOption.label"
                      :value="itemOption.value"
                    >
                    </el-option>
                  </el-select>
                  <el-input
                    v-if="item.prop == 'matchDept'"
                    size="small"
                    :precision="4"
                    :step="1"
                    :min="0"
                    v-model="scope.row[item.prop]"
                    @blur="removeClass"
                    @change="dataChange(item.prop, item.label, scope.row[item.prop], scope.row)"
                  >
                  </el-input>
                  <template v-if="item.prop == 'monitorpoint'">
                    <span v-for="itemType in monitorpointIconHandle(scope.row)" :key="itemType.id" style="padding: 0 2px">
                      <el-tooltip effect="light" placement="bottom-start">
                        <div slot="content">
                          <p v-html="itemType.title"></p>
                        </div>
                        <i :class="itemType.icon" :style="{ color: itemType.color }" @click="iconClick(scope.row)" style="cursor: pointer"></i>
                      </el-tooltip>
                    </span>
                  </template>
                  <template v-else>
                    <span :class="{ warning: item.prop == 'amount' && scope.row.warning }">{{ scope.row[item.prop] }}</span>
                  </template>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
        <template #drawer-panel>
          <select-product v-if="productVisible" :visible="productVisible" :selected-product-info-id="selectedProductInfoId" @close-modal="closeModal"></select-product>
        </template>
      </list-layout>
    </template>
  </common-dialog>
</template>
<style scoped lang="scss">
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
.tableDiv .warning {
  color: red;
  ::v-deep.el-input--small .el-input__inner {
    color: red;
  }
}
::v-deep.el-table .warning-row {
  background: #ececec;
}
</style>

<script>
import Vue from 'vue'
import { generateTree } from '@/utils/generateTree'
import { P8ListLayout as ListLayout, P8Dialog as CommonDialog } from 'p8-components-ui'
// import { P8Search as SearchFormList } from 'p8-components-ui'
import { Table, TableColumn, InputNumber, Input, Select, Option, Tooltip, Notification } from 'p8-components-ui'

import SelectProduct from './selectProduct'
// import { GanttResolveObject } from '@/assets/commonJS/ganttJS/resolve/resolveGanttObject'
const mh = document.documentElement.clientHeight - 185
export default {
  name: 'ProductTaskView',
  components: {
    ListLayout,
    // SearchFormList,
    // 'common-dialog': Dialog,
    CommonDialog,
    // 'el-button': Button,
    'el-tooltip': Tooltip,
    'el-table': Table,
    SelectProduct,
    'el-table-column': TableColumn,
    'el-input': Input,
    'el-select': Select,
    'el-option': Option,
    'el-input-number': InputNumber
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
      tableApi: 'productTask.productTaskViewData',
      flexHeight: mh,
      queryParam: {},
      columns: [],
      tableData: [],
      change: false,
      canClose: false,
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
          labelText: '批次号/阶段', // 控件显示的文本
          fieldName: 'batchNumber',
          placeholder: '请输入批次号/阶段' // 默认控件的空值文本
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
      canClickTaskIds: [],
      saveType: true
    }
  },

  created() {
    this.initDic()
    this.initColumns()
  },
  mounted() {
    this.queryList()
  },
  computed: {},
  methods: {
    initDic() {
      const that = this
      that.$api['thirdPartInterface.getDic']({ dicType: 'FINISH_TYPE' }).then(function (res) {
        that.finishTypeOptions = res
      })

      that.$api['thirdPartInterface.getDic']({ dicType: 'UNITS_TYPE' }).then(function (res) {
        that.unitOptions = res
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
      const _this = this
      if (!_this.change) {
        _this.$emit('close-dialog')
      } else {
        _this
          .$confirm(`有修改项未保存，是否保存`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            closeOnClickModal: false,
            type: 'warning'
          })
          .then(() => {
            if (_this.save()) {
              if (!_this.canClose) {
                _this.$emit('close-dialog')
              }
            }
          })
          .catch(() => {
            if (!_this.canClose) {
              _this.$emit('close-dialog')
            }
          })
      }
    },
    columnStyle({ row, column, rowIndex, columnIndex }) {
      if (row.children && row.children.length > 0) {
        return 'font-weight: 900;'
      }
    },
    initColumns() {
      const that = this
      const columns = [
        {
          label: '标记',
          prop: 'monitorpoint',
          type: 'index',
          width: '70',
          align: 'center'
        },
        {
          label: '任务名称',
          prop: 'taskName',
          minWidth: '300',
          align: 'left',
          nameEdit: true
        },
        {
          label: '批次号/阶段',
          prop: 'batchNumber',
          minWidth: '150',
          align: 'center'
        },
        {
          label: '产品图号',
          prop: 'mapCode',
          minWidth: '100',
          align: 'center'
        },
        {
          label: '产品代号',
          prop: 'productCode',
          minWidth: '100',
          align: 'center'
        },
        {
          label: '产品名称',
          prop: 'mapName',
          minWidth: '100',
          align: 'center'
        },
        // {
        //   label: '完成形式',
        //   prop: 'finishTypeDisplay',
        //   minWidth: '100',
        //   align: 'center'
        // },
        {
          label: '数量',
          prop: 'amount',
          minWidth: '150',
          align: 'center'
        },
        {
          label: '计量单位',
          prop: 'unitDisplay',
          minWidth: '100',
          align: 'center'
        },
        // {
        //   label: '配合部门',
        //   prop: 'matchDept',
        //   minWidth: '150',
        //   align: 'center'
        // },
        {
          label: '同步状态',
          prop: 'guid',
          minWidth: '100',
          align: 'center'
        },
        {
          label: '备注',
          prop: 'remark',
          minWidth: '250',
          align: 'center'
        }
      ]
      that.columns = columns
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
            that.$api[that.tableApi]({ ...that.queryParam, planInfoId: that.planInfoId, projectTasksId: that.taskId })
              .then(function (res) {
                that.isListLoading = false

                const data = generateTree(res, 'parentId', '')
                if (data && data.length > 0) {
                  data.forEach(function (item, idx) {
                    that.setItemKey(item)
                  })
                }
                that.tableData = data
                that.getCanClickTaskId(data)
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
    getCanClickTaskId(data) {
      const _this = this
      data.forEach(function (message) {
        if (message.children.length > 0) {
          if (message.dutyUserId === message.nowUserId) {
            _this.saveClickTaskId(message.children)
          } else {
            _this.getCanClickTaskId(message.children)
          }
        }
      })
    },
    saveClickTaskId(data) {
      const _this = this
      data.forEach(function (message) {
        _this.canClickTaskIds.push(message.id)
        if (message.children.length > 0) {
          _this.saveClickTaskId(message.children)
        }
      })
    },
    showModal(row) {
      this.selectRowData = row
      this.selectedProductInfoId = row.productInfoId
      this.productVisible = true
    },
    closeModal(row) {
      if (row && row.id) {
        this.selectRowData.productInfoId = row.id
        this.selectRowData.mapCode = row.mapCode
        this.selectRowData.mapName = row.mapName
        this.selectRowData.productCode = row.productCode
        this.selectRowData.children.forEach(function (message) {
          if (message.planType !== null && message.planType !== '310303' && message.planType !== '3103') {
            message.productInfoId = row.id
            message.mapCode = row.mapCode
            message.mapName = row.mapName
            message.productCode = row.productCode
          }
        })
        this.change = true
      }
      this.productVisible = false
    },
    dataChange(prop, label, value, row) {
      // let that = this
      // if (JSON.stringify(that.rowTemp) === '{}') {
      //   this.rowTemp = row
      // }
      const _this = this
      if (!row.amount) {
        row.amount = 0
      } else {
        const numMessage = []
        if (prop === 'amount') {
          row.children.forEach(function (message) {
            if (message.planType !== null && message.planType !== '310303' && message.planType !== '3103' && !numMessage.includes(message.planType)) {
              if (message.amount || message.amount === 0) {
                message.amount = row.amount
              }
            }
            numMessage.push(message.planType)
          })
        }
      }
      if (prop === 'batchNumber') {
        row.children.forEach(function (message) {
          if (message.planType !== null && message.planType !== '3103' && !message.batchNumber) {
            message.batchNumber = row.batchNumber
          }
        })
      }
      // if (prop === 'remark') {
      //   row.children.forEach(function (message) {
      //     if (message.planType !== null && message.planType !== '3103' && !message.batchNumber) {
      //       message.remark = row.remark
      //     }
      //   })
      // }
      _this.change = true
    },
    dataChangeTwo(label, row, labelCode) {
      this.$set(row, labelCode, label)
      // let that = this
      // if (JSON.stringify(that.rowTemp) === '{}') {
      //   this.rowTemp = row
      // }
      if (labelCode === 'unitDisplay') {
        row.children.forEach(function (message) {
          if (message.planType !== '3103' && !message.unitDisplay) {
            message.unitDisplay = row.unitDisplay
            message.unit = row.unit
          }
        })
      }
    },
    clearChange(row, labelCode) {
      this.$set(row, labelCode, '')
    },
    updateChangeData(data) {
      const that = this
      this.params = []
      that.getParams(data)
      that.$api['productTask.updateChangeData']({ params: this.params }).then((res) => {
        if (res) {
          Notification.success({
            title: '提示',
            message: '保存成功！'
          })
          that.saveType = true
        }
      })
    },
    getParams(data) {
      const _this = this
      data.forEach((messsage) => {
        if (messsage.planType && messsage.planType.indexOf('3103') !== -1) {
          _this.params.push(messsage)
        }
        if (messsage.children) {
          _this.getParams(messsage.children)
        }
      })
    },
    save() {
      let remarkShow = true
      this.tableData.forEach((item) => {
        item.children.forEach((item1) => {
          item1.children.forEach((item2) => {
            if (item2.planType === '310303' && !item2.remark) {
              remarkShow = false
            }
          })
        })
      })
      if (!remarkShow) {
        Notification.error({
          title: '提示',
          message: '保存失败！外包件齐套任务备注不能为空'
        })
        return remarkShow
      }
      this.messageSave = true
      this.saveType = false
      const that = this
      this.tableData.map((item) => {
        that.$set(item, 'warning', false)
        if (item.planType === '3103') {
          const parentAmount = item.amount
          if (item.children && item.children.length) {
            that.checkNum(item, parentAmount)
          }
        }
        if (item.children && item.children.length) {
          this.cascadeCheckPlanType(item.children)
        }
        if (this.messageSave) {
          this.updateChangeData(this.tableData)
        } else {
          this.saveType = true
        }
      })
      this.change = false
      return true
    },
    // 级联判断计划类型
    cascadeCheckPlanType(obj) {
      const that = this
      obj.map((item) => {
        if (item.planType === '3103') {
          const parentAmount = item.amount
          if (item.children && item.children.length) {
            that.checkNum(item, parentAmount)
          }
        }
        if (item.children && item.children.length) {
          this.cascadeCheckPlanType(item.children)
        }
      })
    },
    // 生产任务数量判断逻辑
    checkNum(item, parentAmount) {
      const that = this
      let checkFlag = true
      // 非“外包件齐套”类型的任务
      const result = item.children.reduce((pre, cur) => {
        that.$set(cur, 'warning', false)
        const planTypeArr = ['310301', '310302', '310304', '310305', '310306', '310307']
        if (planTypeArr.indexOf(cur.planType) !== -1) {
          pre[cur.planType] ? (pre[cur.planType] = pre[cur.planType] += cur.amount ? Number(cur.amount) : 0) : (pre[cur.planType] = cur.amount)
        }
        return pre
      }, {})
      for (const type in result) {
        if (result[type] !== parentAmount) {
          Notification.error({
            title: '提示',
            message: '生产数量不匹配，请重新计算！'
          })
          this.canClose = true
          item.children.map((item) => {
            if (item.planType === type) {
              that.$set(item, 'warning', true)
            }
          })
          checkFlag = false
          that.messageSave = false
          break
        } else {
          this.canClose = false
        }
      }
      if (checkFlag) {
        // 外包件齐套类型的任务
        const outsourcingResult = item.children.reduce((pre, cur) => {
          that.$set(cur, 'warning', false)
          if (cur.planType === '310303') {
            pre[cur.planType + cur.mapCode]
              ? (pre[cur.planType + cur.mapCode] = pre[cur.planType + cur.mapCode] += cur.amount ? Number(cur.amount) : 0)
              : (pre[cur.planType + cur.mapCode] = cur.amount)
          }
          return pre
        }, {})
        for (const type in outsourcingResult) {
          if (outsourcingResult[type] !== parentAmount) {
            Notification.error({
              title: '提示',
              message: '生产数量不匹配，请重新计算！'
            })
            this.canClose = true
            item.children.map((item) => {
              if (item.planType === type.slice(0, 6)) {
                that.$set(item, 'warning', true)
              }
            })
            that.messageSave = false
            break
          } else {
            this.canClose = false
          }
        }
      }
    },
    tableRowClassName({ row, rowIndex }) {
      const _this = this
      if (row.planType === null || row.planType.indexOf('3103') === -1) {
        return 'warning-row'
      }
      if (this.ganttName && this.ganttName === 'planResolveGantt') {
        let canClick = false
        _this.canClickTaskIds.forEach(function (data) {
          if (data === row.id) {
            canClick = true
          }
        })
        if (!canClick) {
          return 'warning-row'
        }
      }
      return ''
    },
    cellClick(row, column, cell, event) {
      const _this = this
      if (row.planType === undefined || row.planType.indexOf('3103') === -1) {
        // event.stop()
        return
      }
      if (column.property === 'mapCode') {
        if (row.planType === '310303' || row.planType === '3103') {
        } else {
          return
        }
      }
      if (this.ganttName && this.ganttName === 'planResolveGantt') {
        // let ganttObject = GanttResolveObject.getGanttObject(this.ganttName)
        // let parentGantt = ganttObject.getTask(row.parentId)
        // if (parentGantt.dutyUserId !== parentGantt.nowUserId) {
        //   // return
        // }
        let canClick = false
        _this.canClickTaskIds.forEach(function (data) {
          if (data === row.id) {
            canClick = true
          }
        })
        if (!canClick) {
          return
        }
      }
      for (let i = 0; i < document.getElementsByClassName('current-cell').length; i++) {
        document.getElementsByClassName('current-cell')[i].classList.remove('current-cell')
      }
      cell.classList.add('current-cell')
    },
    removeClass() {
      document.getElementsByClassName('current-cell')[0].classList.remove('current-cell')
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
