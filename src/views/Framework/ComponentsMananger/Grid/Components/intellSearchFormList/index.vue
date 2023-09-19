<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <div class="search-wrapper"
       :style="{ width: searchWidth }">
    <el-form ref="inputForm"
             size="medium"
             @submit.native.prevent>
      <el-form-item prop="formInput">
        <el-input placeholder="点击下拉搜索"
                  v-model="searchVal"
                  readonly
                  prefix-icon="el-icon-search"
                  :disabled="!defaultSearch"
                  @keyup.enter.native="enterSearch"
                  @click.native="toggleAdvanced">
          <template slot="suffix">
            <i v-if="searchVal"
               class="el-icon-close"
               @click.stop="removeSearchVal"></i>
            <i :class="advanced ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
    <transition name="bounce">
      <el-form v-show="advanced"
               ref="searchForm"
               :model="formData"
               :label-width="labelWidth"
               class="search-contain"
               :style="{ width: searchContainWidth }">
        <el-row>
          <template v-for="item in renderDataSource">
            <el-col :key="item.fieldName"
                    :span="item.colLayout === 'doubleCol' ? 12 : 24">
              <search-field-render :fields="item"
                                   :form-data="formField"
                                   :reset-flag="resetFlag"
                                   @setMode="setMode"
                                   @setParentFormData="setParentFormData"></search-field-render>
            </el-col>
          </template>
        </el-row>
        <el-row>
          <el-col :span="24"
                  class="flex-right">
            <el-button type="primary"
                       @click="search">查询</el-button>
            <el-button style="margin-left: 8px"
                       @click="reSet">重置</el-button>
          </el-col>
        </el-row>
      </el-form>
    </transition>
  </div>
</template>
<script>
import { Form, Row, Col, Button, FormItem, Input } from 'p8-components-ui'
import moment from 'moment'
import SearchFieldRender from './Components/SearchFieldRender'

export default {
  name: 'IntellSearchFormList',
  props: {
    form: {
      type: Object,
      default: function () {
        return {}
      }
    },
    labelWidth: {
      type: String,
      default: '100px'
    },
    dataSource: {
      type: Array,
      default: function () {
        return []
      }
    },
    searchWidth: {
      type: String,
      default: '550px'
    },
    searchContainWidth: {
      type: String,
      default: '550px'
    },
    resetAfterToSearch: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      searchVal: '',
      advanced: false,
      loadingVisible: false,
      separator: ';',
      formField: this.form,
      defaultSearch: '',
      setInputDefault: false, // 设置查询条件中的第一个输入框default: true
      dateDataIndex: [], // 日期fieldName集合
      modeData: {}, // 模糊查询模式
      resetFlag: false, // 是否点击重置按钮
      replaceData: {} // 下拉选择是否有代替的查询字段（智能报表下拉传入后台的值）
    }
  },
  computed: {
    renderDataSource () {
      // 重组传入的数据，合并全局配置，子项的配置优先全局
      const _this = this
      this.dataSource.map((item) => {
        if (item.default) {
          _this.setInputDefault = true
        }
        _this.replaceData[item.fieldName] = item.replaceSearch
      })
      return this.dataSource.map(function (item) {
        // 查询组件没有设置默认输入fieldName时，则选择第一个输入型组件作为默认输入组件
        if (!_this.setInputDefault) {
          if (item.type === 'text') {
            item.default = true
            _this.setInputDefault = true
          }
        }
        if (!item.fieldConfig) {
          item.fieldConfig = {}
        }
        if (item.type === 'treeSelect') {
          _this.$set(item, 'reset', false)
        }
        return item
      })
    },
    formData () {
      let formDataObj = {}
      let that = this
      this.renderDataSource.map((item) => {
        if (item.fieldName) {
          formDataObj[item.fieldName] = item.defaultValue
        }
        if (item.default) {
          that.defaultSearch = item.fieldName
        }
        if (item.type === 'checkboxGroup') {
          that.$set(that.formField, item.fieldName, that.formField[item.fieldName] || item.defaultValue || [])
        }
        if ((item.type === 'datetime' || item.type === 'datetimeRange') && that.dateDataIndex.indexOf(item.fieldName) === -1) {
          that.dateDataIndex.push(item.fieldName)
        }
      })
      return { ...formDataObj, ...this.formField }
    }
  },
  methods: {
    // 弹出选择回填值后手动给formField赋值
    setParentFormData (data) {
      this.formField = { ...this.formField, ...data }
    },
    setMode (obj) {
      this.modeData = { ...this.modeData, ...obj }
    },
    search () {
      let _this = this
      let searchParam = {}
      this.$refs.searchForm.validate((isValid) => {
        if (isValid) {
          const queryParams = this.handleParams(this.formData)
          this.changeInputVal(queryParams)
          Object.keys(queryParams).map((item) => {
            let filterValue = ''
            let type = 'and'
            //是时间范围时 relation传time
            this.renderDataSource.forEach((el) => {
              if (el.type === 'datetimeRange' && el.fieldName == item) {
                type = 'time'
              }
              if (el.type === 'multiple' && el.fieldName == item) {
                type = 'multiple'
              }
            })
            if (queryParams[item]) {
              switch (_this.modeData[item]) {
                case 'like':
                  // 是时间范围时传数组
                  if (type !== 'and') {
                    filterValue = queryParams[item]
                  } else {
                    filterValue = '%' + queryParams[item] + '%'
                  }
                  break
                case 'likeLeft':
                  filterValue = '%' + queryParams[item]
                  break
                case 'likeRight':
                  filterValue = queryParams[item] + '%'
                  break
                default:
                  filterValue = queryParams[item]
              }
            }
            if (filterValue) {
              searchParam[_this.replaceData[item] ? _this.replaceData[item] : item] = {
                value: filterValue,
                mode: type == 'multiple' ? 'in' : _this.modeData[item],
                relation: type
              }
            }
            if (type === 'multiple' && queryParams[item] && queryParams[item].length == 0) {
              const alias = _this.replaceData[item] ? _this.replaceData[item] : item
              delete searchParam[alias]
              return
            }
            // if (filterValue && filterValue.replace() && filterValue.replace(/%/g, '')) {
            //   searchParam[_this.replaceData[item] ? _this.replaceData[item] : item] = {
            //     value: filterValue,
            //     mode: _this.modeData[item],
            //     relation: 'and'
            //   }
            // }
          })
          this.resetFlag = false
          this.$emit('search', searchParam) // 搜集查询条件数据，触发父页面的查询条件
        }
      })
    },
    enterSearch () {
      const queryParams = {}
      queryParams[this.defaultSearch] = this.searchVal
      queryParams.current = 1
      this.$emit('search', queryParams)
    },
    toggleAdvanced () {
      // 切换查询条件展开与收缩按钮
      this.advanced = !this.advanced
    },
    reSet () {
      // 查询条件重置
      let _this = this
      this.customResetHandle()
      this.$emit('re-set')
      this.changeInputVal(this.formData, 're-set')
      if (this.resetAfterToSearch) {
        this.search()
      }
      this.advanced = true
      let searchParam = {}
      Object.keys(this.formData).map((item) => {
        let filterValue = ''
        if (_this.formData[item]) {
          switch (_this.modeData[item]) {
            case 'like':
              filterValue = '%' + _this.formData[item] + '%'
              break
            case 'likeLeft':
              filterValue = '%' + _this.formData[item]
              break
            case 'likeRight':
              filterValue = _this.formData[item] + '%'
              break
            default:
              filterValue = _this.formData[item]
          }
        } else {
          filterValue = _this.formData[item]
          _this.modeData[item] = '='
        }

        if (filterValue && filterValue.length && filterValue.toString().replace(/%/g, '')) {
          searchParam[_this.replaceData[item] ? _this.replaceData[item] : item] = {
            value: filterValue,
            mode: '=',
            relation: 'and'
          }
        }
      })
      this.resetFlag = true
      this.$emit('search', searchParam)
    },
    removeSearchVal () {
      this.reSet()
      this.advanced = false
    },
    customResetHandle () {
      this.$refs.searchForm.resetFields()
      const _this = this
      const typeArray = ['multiple', 'treeSelect', 'checkboxGroup', 'datetimeRange']
      const typeBoolean = ['switch']
      // treeSelect组件reset
      let treeSelect = this.renderDataSource.filter((item) => item.type === 'treeSelect')
      if (treeSelect && treeSelect.length) {
        treeSelect.map((treeItem) => {
          treeItem.reset = !treeItem.reset
        })
      }
      // treeSelect组件reset结束

      _this.renderDataSource.forEach((item) => {
        let type = item.type
        let fieldName = item.fieldName
        if (typeArray.indexOf(type) !== -1 || (type === 'select' && item.fieldConfig.multiple)) {
          _this.formData[fieldName] = []
        } else if (typeBoolean.indexOf(type) !== -1) {
          _this.formData[fieldName] = false
        } else {
          _this.formData[fieldName] = ''
        }
      })
      this.formField = this.formData
    },
    changeInputVal (queryParams, type) {
      let _this = this
      let inputVal = ''
      if (!type) {
        this.renderDataSource.map((item) => {
          if (queryParams[item.fieldName] && (typeof queryParams[item.fieldName] === 'boolean' || queryParams[item.fieldName].length)) {
            switch (item.type) {
              case 'select':
              case 'radio':
              case 'radioButton':
                inputVal += _this.setSelectVal(item, queryParams)
                break
              case 'multiple':
              case 'checkboxGroup':
                inputVal += _this.setMultipleVal(item, queryParams)
                break
              case 'treeSelect':
                inputVal += _this.setTreeSelectVal(item, queryParams)
                break
              case 'datetime':
              case 'datetimeRange':
                inputVal += _this.setDateVal(item, queryParams)
                break
              default:
                inputVal += item.labelText + ':' + (queryParams[item.fieldName] === true ? '是' : queryParams[item.fieldName] === false ? '否' : queryParams[item.fieldName]) + _this.separator
            }
          }
        })
      }
      this.searchVal = inputVal.slice(0, -1)
      this.advanced = false
    },
    // select单选 radioGroup单选框组
    setSelectVal (item, queryParams) {
      let _this = this
      let valStr = ''
      item.options.map((optionItem) => {
        if (item.optionUrl && (item.optionUrl.label || item.optionUrl.value)) {
          if (optionItem[item.optionUrl.value] === queryParams[item.fieldName]) {
            valStr = item.labelText + ':' + optionItem[item.optionUrl.label] + _this.separator
          }
        } else {
          if (optionItem.value === queryParams[item.fieldName]) {
            valStr = item.labelText + ':' + optionItem.label + _this.separator
          }
        }
      })

      return valStr
    },
    // select多选 checkboxGroup多选框组
    setMultipleVal (item, queryParams) {
      let _this = this
      let valStr = ''
      let multipleLabelArr = []
      item.options.map((optionItem) => {
        if (item.optionUrl && (item.optionUrl.label || item.optionUrl.value)) {
          queryParams[item.fieldName].map((valueItem) => {
            if (valueItem === optionItem[item.optionUrl.value]) {
              multipleLabelArr.push(optionItem[item.optionUrl.label])
            }
          })
        } else {
          queryParams[item.fieldName].map((valueItem) => {
            if (valueItem === optionItem.value) {
              multipleLabelArr.push(optionItem.label)
            }
          })
        }
      })
      valStr = item.labelText + ':' + multipleLabelArr + _this.separator

      return valStr
    },
    // treeSelect
    setTreeSelectVal (item, queryParams) {
      let _this = this
      let fieldLable = item.labelText
      let fieldValue = queryParams[item.fieldName]
      let valStr = ''
      if (item.multiple) {
        let multipleLabelArr = []
        fieldValue.map((valueItem) => {
          if (valueItem === item.options[0].value) {
            multipleLabelArr.push(item.options[0].label)
          } else if (item.options[0].children && item.options[0].children.length) {
            multipleLabelArr = this.treeMultipleDataHandle(item.options[0].children, valueItem, multipleLabelArr)
          }
        })
        valStr = item.labelText + ':' + multipleLabelArr + _this.separator
      } else {
        if (item.options[0].value === fieldValue) {
          valStr = fieldLable + ':' + item.options[0].label + _this.separator
        } else if (item.options[0].children && item.options[0].children.length) {
          valStr = this.treeSingleDataHandle(item.options[0].children, fieldLable, fieldValue, valStr)
        }
      }

      return valStr
    },
    // treeSelect单选递归
    treeSingleDataHandle (nodeData, fieldLable, fieldValue, inputVal) {
      let _this = this
      nodeData.map((item) => {
        if (item.value === fieldValue) {
          inputVal = fieldLable + ':' + item.label + this.separator
        } else if (item.children && item.children.length) {
          inputVal = _this.treeSingleDataHandle(item.children, fieldLable, fieldValue, inputVal)
        }
      })
      return inputVal
    },
    // treeSelect多选递归
    treeMultipleDataHandle (nodeData, fieldValue, multipleLabelArr) {
      let _this = this
      nodeData.map((item) => {
        if (item.value === fieldValue) {
          multipleLabelArr.push(item.label)
        }
        if (item.children && item.children.length) {
          _this.treeMultipleDataHandle(item.children, fieldValue, multipleLabelArr)
        }
      })
      return multipleLabelArr
    },
    // datetimeRange 选择日期
    setDateVal (item, queryParams) {
      let valStr = ''
      if (Array.isArray(queryParams[item.fieldName])) {
        valStr = queryParams[item.fieldName][0] + '~' + queryParams[item.fieldName][1]
      } else {
        valStr = queryParams[item.fieldName]
      }
      valStr = item.labelText + ':' + valStr + this.separator
      return valStr
    },
    handleParams (obj) {
      // 判断必须为obj
      if (!(Object.prototype.toString.call(obj) === '[object Object]')) {
        return {}
      }
      let tempObj = {}
      for (let [key, value] of Object.entries(obj)) {
        if (value && this.dateDataIndex.indexOf(key) !== -1) {
          if (Array.isArray(value)) {
            value = value.map((item) => moment(item).format('YYYY-MM-DD'))
          } else {
            // 判断moment，保存时将时间格式设置为'YYYY-MM-DD'
            value = moment(value).format('YYYY-MM-DD')
          }
        }
        // 若是为字符串则清除两边空格
        if (value && typeof value === 'string') {
          value = value.trim()
        }
        tempObj[key] = value
      }
      return tempObj
    }
  },
  components: {
    'el-form': Form,
    'el-row': Row,
    'el-col': Col,
    'el-button': Button,
    'el-form-item': FormItem,
    'el-input': Input,
    SearchFieldRender
  }
}
</script>

<style lang="scss">
.search-wrapper {
  height: 40px;
  float: right;
  position: relative;
  top: -3px;
  z-index: 2;

  .search-contain {
    position: absolute;
    top: 40px;
    left: 0;
    padding: 10px;
    box-sizing: border-box;
    background: $base-white-color;
    border: 1px solid rgba(238, 238, 240, 1);
    box-shadow: 0px 0px 10px 0px rgba(231, 237, 255, 0.5);
    border-radius: 4px;

    .el-input__inner {
      border-top: none;
      border-left: none;
      border-right: none;
      border-radius: 0;
    }

    .el-select {
      width: 100%;
    }

    .el-form-item__label {
      font-size: 12px;
    }

    .el-input--small .el-input__inner {
      font-size: 12px;
    }
  }

  .flex-right {
    display: flex;
    justify-content: flex-end;
  }

  .el-input__suffix {
    i {
      cursor: pointer;

      &.el-icon-close {
        margin-right: 5px;
        font-size: 16px;
        line-height: 36px;
      }
    }
  }
  .el-input.is-disabled .el-input__inner {
    background-color: #ffffff;
  }
  // .bounce-enter-active {
  //   animation: bounce-in .3s;
  // }
  // .bounce-leave-active {
  //   animation: bounce-in .3s reverse;
  // }
  // @keyframes bounce-in {
  //   0% {
  //     transform: scale(0.5);
  //   }
  //   50% {
  //     transform: scale(1.1);
  //   }
  //   100% {
  //     transform: scale(1);
  //   }
  // }
}
</style>
