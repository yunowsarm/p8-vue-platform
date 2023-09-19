<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <list-layout :header-visible="headerVisible">
    <template #north>
      <common-button :comp="comp"
                     :select-records="selectRecords"
                     :custom-button-data="buttonData"></common-button>
      <search-form-list ref="search"
                        v-if="searchData.length"
                        :data-source="searchData"
                        @search="search"
                        @re-set="reSet"></search-form-list>
    </template>
    <template #center>
      <common-table ref="table"
                    :comp="comp"
                    v-if="columns.length"
                    :columns="columns"
                    :params="tableParam"
                    :flex="160"
                    :custom-height="customHeight"
                    api="formGenerator.tableApply"
                    :table-refresh="tableRefresh"
                    :custom-button-data="buttonData"
                    @selection-change="handleSelectionChange"
                    @row-click="rowClick"
                    @column-fiter="columnFiter"></common-table>
    </template>
  </list-layout>
</template>

<script>
import { P8ListLayout as ListLayout, P8Table as CommonTable, P8Search as SearchFormList, P8Button as CommonButton } from 'p8-components-ui'
/* eslint-disable vue/require-default-prop */
export default {
  name: 'FunctionTest',
  components: {
    ListLayout,
    CommonTable,
    SearchFormList,
    CommonButton
  },
  props: {
    code: {
      type: String,
      default: ''
    },
    reportParam: {
      type: Object,
      default: () => {
        return {}
      }
    },
    customHeight: {
      type: Number,
      defalut: 0
    },
    headerVisible: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      comp: this,
      selectRecords: [],
      searchData: [],
      columns: [],
      tableParam: {}, // 应用报表参数，包括三部分
      defaultReportParam: {}, // 增删行报表参数
      sqlParam: {}, // 报表sql参数
      buttonData: [],
      selectType: 0, // 是否展示复选框，0是不显示复选框，1是单选，2是复选
      record: {}
    }
  },
  mounted () {
    this.getTableInfo(this.code)
  },
  watch: {
    reportParam (val, oldVal) {
      this.rebuildParam(val)
    },
    code (val, oldVal) {
      this.getTableInfo(val)
    }
  },
  methods: {
    getTableInfo (code) {
      let _this = this
      this.$api['formGenerator.tableGetInfo']({ reportCode: this.code }).then((res) => {
        _this.record = res
        let columnData = []
        // 报表列信息
        if (res.reportItems.length) {
          res.reportItems.map((item) => {
            if (item.isListShow) {
              if (item.isSearch) {
                if (_this.record.searchPos === 1) {
                  columnData.push({
                    title: item.fieldTxt,
                    dataIndex: item.fieldName,
                    width: item.fieldWidth,
                    sortable: item.isOrder ? item.isOrder : false,
                    filterable: true,
                    filter: {
                      inputVal: '',
                      visible: false
                    }
                  })
                } else {
                  columnData.push({
                    title: item.fieldTxt,
                    dataIndex: item.fieldName,
                    width: item.fieldWidth,
                    sortable: item.isOrder ? item.isOrder : false
                  })
                  _this.searchData.push({
                    type: 'text', // 控件类型
                    labelText: item.fieldTxt, // 控件显示的文本
                    fieldName: item.fieldName
                  })
                }
              } else {
                columnData.push({
                  title: item.fieldTxt,
                  dataIndex: item.fieldName,
                  width: item.fieldWidth,
                  sortable: item.isOrder ? item.isOrder : false
                })
              }
            }
          })
          // 报表按钮参数
          if (res.reportResources.length) {
            _this.buttonData = res.reportResources
            // 当前页面的父页面调用行按钮与header按钮方法
            _this.buttonData.map((btn) => {
              if (!_this[btn.eventHandle]) {
                _this[btn.eventHandle] = function (row, button) {
                  _this.$emit(btn.eventHandle, row, button, _this.code)
                }
              }
            })
            columnData.push({
              title: '操作',
              dataIndex: 'operation',
              minWidth: 120,
              scopedSlots: { customRender: 'operation' }
            })
          }
          if (_this.record.selectType) {
            columnData.unshift({
              type: 'selection',
              width: 40,
              align: 'center'
            })
            if (_this.record.selectType === 1) {
              _this.selectType = 'single'
            } else {
              _this.selectType = 'multip'
            }
          }
          _this.columns = columnData
        }
        // 报表参数
        if (res.reportParams.length) {
          res.reportParams.map((item) => {
            _this.defaultReportParam[item.paramName] = item.paramValue
          })
        }

        // SQL参数
        if (res.reportSqlParams.length) {
          res.reportSqlParams.map((item) => {
            _this.sqlParam[item.paramName] = item.paramValue
          })
        }
        _this.rebuildParam(_this.reportParam)
      })
    },
    tableRefresh (param) {
      param
        .then(() => {
          console.log('异步成功后端做的操作')
        })
        .catch(() => {
          console.log('异步失败的操作')
        })
    },
    search (param) {
      this.tableParam.param = param
    },
    reSet () {
      // this.tableParam.param = {}
      // this.$refs.table.searchData()
    },
    rebuildParam (val) {
      let reportParam = {}
      let defaultReportParamArr = Object.keys(this.defaultReportParam)
      let sqlParamArr = Object.keys(this.sqlParam)
      let valArr = Object.keys(val)
      if (valArr.length) {
        valArr.map((item) => {
          if (defaultReportParamArr.indexOf(item) !== -1 || sqlParamArr.indexOf(item) !== -1) {
            reportParam[item] = val[item]
          }
        })
      }
      this.tableParam = {
        reportId: this.record.id,
        param: {},
        reportParam: { ...this.sqlParam, ...this.defaultReportParam, ...reportParam }
      }
    },
    handleSelectionChange (val) {
      if (this.selectType === 'single') {
        if (val.length >= 2) {
          // 删除索引为0的
          // console.log(val.splice(0,val.length-1),'被删除的')
          let arrays = val.splice(0, val.length - 1)
          arrays.forEach((row) => {
            this.$refs.table.$refs.table.toggleRowSelection(row) // 除了当前点击的，其他的全部取消选中
          })
        }
      }
      this.$emit('selection-change', val)
    },
    rowClick (val) {
      if (this.record.enableClick) {
        this.$emit('row-click', val)
      }
    },
    columnFiter (val) {
      this.tableParam.param = { ...val }
    }
  }
}
</script>
