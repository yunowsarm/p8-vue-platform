<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->

<template>
  <div class="parser-container">
    <parser
      ref="parser"
      v-if="newOrModify && newOrModify === 'new' && Object.keys(formConf).length"
      :form-conf="formConf"
      :sys-params="sysParams"
      :type="type"
      :init-config="initConfig"
      @setPageData="setPageData"
      @submit="save"
      @save="saveChange"
      @resetForm="resetForm"
      :custom-fn="customFn"
      :container-layout="containerLayout"
      is-save="new"
    />
    <parser
      ref="parser"
      v-else-if="newOrModify && newOrModify === 'modify' && pageType !== 'view' && Object.keys(formConf).length"
      :form-conf="formConf"
      :sys-params="sysParams"
      :type="type"
      :init-config="initConfig"
      :modify-res="modifyRes"
      :container-layout="modifyRes.containerLayout"
      @setPageData="setPageData"
      @submit="save"
      @save="saveChange"
      @resetForm="resetForm"
      :custom-fn="customFn"
      is-save="modify"
    />
    <parser-view
      ref="parser"
      v-else-if="newOrModify === 'modify' && pageType === 'view' && Object.keys(formConf).length"
      :form-conf="formConf"
      :sys-params="sysParams"
      :modify-res="modifyRes"
    ></parser-view>
  </div>
</template>

<script>
import _cloneDeep from 'lodash/cloneDeep'
import { P8FormParser as Parser, P8FormParserView as ParserView } from 'p8-components-ui'
import { selectTransform, selectGenerateTree } from '@/utils/common'
import { generateTreeTwo } from '@/utils/generateTree'
const DEFAULT_FIELDS = ['ID', 'CREATE_BY', 'UPDATE_BY', 'CREATE_TIME', 'UPDATE_TIME', 'SECRET_LEVEL']
const multiSelectedLayout = ['masterSlaveTable', 'multiSelected']
export default {
  name: 'FormDataEdit',
  components: {
    Parser,
    ParserView
  },
  props: {
    record: {
      // 表单obj, 在表单设计器/数据查看等中使用id
      type: Object,
      default: () => {
        return {}
      }
    },
    dataViewId: {
      // 数据查看列表行记录的id
      type: String,
      default: ''
    },
    propParam: {
      type: Object,
      default: () => {
        return {}
      }
    },
    pageType: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    },
    desformCode: {
      type: String,
      default: ''
    },
    permissionVo: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      saveApi: 'formGenerator.formListSave',
      formConf: {},
      initConfig: {},
      drawingList: {},
      renderKey: new Date().getTime(),
      newOrModify: '', // 判断是新建页面还是修改页面
      modifyRes: {}, // 修改页面获取的数据
      sysParams: Object.assign(this.getPropParam(), { $SYSTEM_PARAMS_SELECT: _cloneDeep(this.$store.state.user.userInfo) }), // 系统级参数
      dynamicDataObj: {}, // 前置数据作为后置数据检索条件--动态数据集合
      dynamicParamObj: {}, // 动态参数集合
      customFn: '',
      pageData: Object.assign({}, this.sysParams),
      containerLayout: '' //  组件的layout
    }
  },
  async mounted() {
    this.init()
    console.log(this.propParam, 'propParampropParampropParam')
  },
  computed: {
    dataId() {
      return this.dataViewId
    }
  },
  watch: {
    $route(to, from) {
      if (to !== from) {
        this.sysParams = Object.assign({}, to.meta)
      }
    },
    // formConf: {
    //   handler (val) {
    //     console.log(val, 'edit---formConf--watch')
    //   },
    //   deep: true
    // },
    propParam: {
      handler(val) {
        this.sysParams = Object.assign(this.sysParams, this.getPropParam())
        this.pageData = Object.assign(this.pageData, this.sysParams)
      },
      deep: true
    },
    pageData: {
      handler(val, oldVal) {
        const _this = this
        // 下拉级联时，前置改变后将后置清空
        if (val && oldVal && Object.keys(val).length && Object.keys(oldVal).length) {
          Object.keys(val).forEach((valItem) => {
            if (val[valItem] !== oldVal[valItem]) {
              _this.formConf.fields.forEach((item) => {
                if (item.__config__.selectParam && item.__config__.selectParam.sqlParam && Object.keys(item.__config__.selectParam.sqlParam).length) {
                  Object.keys(item.__config__.selectParam.sqlParam).forEach((sqlItem) => {
                    if (valItem === item.__config__.selectParam.sqlParam[sqlItem].slice(1)) {
                      item.__config__.defaultValue = ''
                    }
                  })
                }
              })
            }
          })
        }

        const needComputedTags = ['el-input']
        if (Object.keys(this.dynamicParamObj).length) {
          Object.keys(this.dynamicParamObj).forEach((item) => {
            _this.dynamicParamObj[item].forEach((i) => {
              const dynamicParamObjPath = i.path.split('.')
              _this.dynamicDataObj[i.dynamicCompId][dynamicParamObjPath[0]][dynamicParamObjPath[1]] = val[item]
            })
          })
          // 前置数据作为后置数据的检索条件--监听前置数据的变化
          this.formConf.fields.map(async (item) => {
            _this.watchChangeSelectOption(item)
            if (item.__config__.children && item.__config__.children.length) {
              item.__config__.children.map(async (childItem) => {
                _this.watchChangeSelectOption(childItem)
              })
            }
          })
        } else {
          Array.isArray(this.formConf.fields) &&
            this.formConf.fields.map(async (item) => {
              // 单行文本--计算器
              // _this.setComputedItem(item, needComputedTags)
              _this.watchLinkData(item)
              if (item.__config__.children && item.__config__.children.length) {
                item.__config__.children.map(async (childItem) => {
                  // if (item.__config__.layout === 'rowFormItem') {
                  //   _this.setComputedItem(childItem, needComputedTags)
                  // }
                  _this.watchLinkData(childItem)
                })
              }
            })
        }
      },
      immediate: true,
      deep: true
    },
    record: {
      async handler(val) {
        await this.init()
      },
      deep: true
      // immediate: true
    }
    // dataId: {
    //   async handler(val) {
    //     if (val) {
    //       await this.init()
    //     }
    //   },
    //   deep: true,
    //   immediate: true
    // }
  },
  methods: {
    async getDrawingList(params) {
      let res = {}
      params.permissionVo = this.permissionVo
      res = await this.$api['formGenerator.designerDetails'](params)
      return res
    },
    async init(type) {
      const drawingListData = await this.getDrawingList({ desformCode: this.record.desformCode ? this.record.desformCode : this.desformCode })
      this.formConf = JSON.parse(drawingListData.designJson)
      this.handlerEvents(this.formConf.fields)
      await this.handlerCustomFn(this.formConf)
      this.initConfig = _cloneDeep(this.formConf)
      this.containerLayout = drawingListData.containerLayout
      const _this = this
      if (this.dataId) {
        const params = {
          desformCode: this.record.desformCode ? this.record.desformCode : this.desformCode,
          dataId: this.dataId,
          permissionVo: this.permissionVo
        }
        const res = await this.$api['formGenerator.formCallDataDetails'](params)
        this.modifyRes = res
        const uploadFiles = res.primary.uploadFiles
        this.formConf.fields.forEach((item) => {
          if (multiSelectedLayout.includes(item.__config__.layout)) {
            if (res.children.length) {
              item.__config__.defaultValue = this.extractDefaultValue(item.__config__.layout, item.__config__.children, res.children)
            }
          } else if (item.__config__.layout === 'rowFormItem') {
            item.__config__.children.forEach((rowItem) => {
              // 特殊数据回填
              if (rowItem.__config__.tag === 'el-date-picker' && rowItem.type === 'daterange') {
                const strs = rowItem.__config__.formFields
                rowItem.__config__.defaultValue = res.primary.table ? [res.primary.table[strs[0]], res.primary.table[strs[1]]] : []
              } else if (rowItem.__config__.tag === 'el-time-picker' && rowItem.__config__.tagIcon === 'time-range') {
                const strs = rowItem.__config__.formFields
                rowItem.__config__.defaultValue = res.primary.table ? [res.primary.table[strs[0]], res.primary.table[strs[1]]] : ''
              } else if (rowItem.__config__.tag === 'p8-upload') {
                const fieldType = rowItem.__config__.fieldType
                const filterFiles = uploadFiles.filter((ele) => ele.type === fieldType)
                rowItem.__config__.defaultValue = filterFiles
              } else if (
                (rowItem.__config__.tag === 'el-checkbox-group' || (rowItem.__config__.tag === 'el-select' && rowItem.multiple)) &&
                typeof res.primary.table[rowItem.__vModel__] === 'string'
              ) {
                rowItem.__config__.defaultValue = res.primary.table[rowItem.__vModel__] ? res.primary.table[rowItem.__vModel__].split(',') : []
              } else {
                rowItem.__config__.defaultValue = res.primary.table[rowItem.__vModel__] || ''
              }
            })
          } else if (item.__config__.layout === 'tabsLayout') {
            item.__tabs__.forEach((tab) => {
              tab.children.forEach((eleItem) => {
                // 特殊数据回填
                if (eleItem.__config__.tag === 'el-date-picker' && eleItem.type === 'daterange') {
                  const strs = eleItem.__config__.formFields
                  eleItem.__config__.defaultValue = res.primary.table ? [res.primary.table[strs[0]], res.primary.table[strs[1]]] : []
                } else if (eleItem.__config__.tag === 'el-time-picker' && eleItem.__config__.tagIcon === 'time-range') {
                  const strs = eleItem.__config__.formFields
                  eleItem.__config__.defaultValue = res.primary.table ? [res.primary.table[strs[0]], res.primary.table[strs[1]]] : ''
                } else if (eleItem.__config__.tag === 'p8-upload') {
                  const fieldType = eleItem.__config__.fieldType
                  const filterFiles = uploadFiles.filter((ele) => ele.type === fieldType)
                  eleItem.__config__.defaultValue = filterFiles
                } else if (
                  (eleItem.__config__.tag === 'el-checkbox-group' || (eleItem.__config__.tag === 'el-select' && eleItem.multiple)) &&
                  typeof res.primary.table[eleItem.__vModel__] === 'string'
                ) {
                  eleItem.__config__.defaultValue = res.primary.table[eleItem.__vModel__] ? res.primary.table[eleItem.__vModel__].split(',') : []
                } else {
                  eleItem.__config__.defaultValue = res.primary.table[eleItem.__vModel__] || ''
                }
              })
            })
          } else {
            // 特殊数据回填
            if (item.__config__.tag === 'el-date-picker' && item.type === 'daterange') {
              const strs = item.__config__.formFields
              item.__config__.defaultValue = res.primary.table ? [res.primary.table[strs[0]], res.primary.table[strs[1]]] : []
            } else if (item.__config__.tag === 'el-time-picker' && item.__config__.tagIcon === 'time-range') {
              const strs = item.__config__.formFields
              item.__config__.defaultValue = res.primary.table ? [res.primary.table[strs[0]], res.primary.table[strs[1]]] : ''
            } else if (item.__config__.tag === 'p8-upload') {
              const fieldType = item.__config__.fieldType
              const filterFiles = uploadFiles.filter((item) => item.type === fieldType)
              item.__config__.defaultValue = filterFiles
            } else if ((item.__config__.tag === 'el-checkbox-group' || (item.__config__.tag === 'el-select' && item.multiple)) && typeof res.primary.table[item.__vModel__] === 'string') {
              item.__config__.defaultValue = res.primary.table[item.__vModel__] ? res.primary.table[item.__vModel__].split(',') : []
            } else {
              item.__config__.defaultValue = res.primary.table ? (res.primary.table[item.__vModel__] ? res.primary.table[item.__vModel__] : '') : ''
            }
          }
        })
        this.newOrModify = 'modify'
      } else {
        this.newOrModify = 'new'
      }
      // 待表单数据，回显数据加载完后再初始化下拉等数据
      if (this.formConf.fields.length) {
        const needHandleTags = ['tree-select', 'el-select', 'el-radio-group', 'el-checkbox-group']
        // const needComputedTags = ['el-input']
        // 异步获取下拉\单选\多选等数据
        this.formConf.fields.map(async (item) => {
          _this.buildWatchCascadeParams(item)
          // 主表
          _this.changeSelectOption(item, needHandleTags)
          // 主表中设置系统默认值
          _this.setSysDefaultValue(item)
          // 单行文本--计算器
          // _this.setComputedItem(item, needComputedTags)
          if (item.__config__.layout === 'tabsLayout') {
            item.__tabs__.forEach((tab) => {
              tab.children.forEach((ele) => {
                _this.buildWatchCascadeParams(ele)
                _this.changeSelectOption(ele, needHandleTags)
                // 子表中设置系统默认值
                _this.setSysDefaultValue(ele)
              })
            })
          }
          if (item.__config__.children && item.__config__.children.length) {
            // 子表
            item.__config__.children.map(async (childItem) => {
              _this.buildWatchCascadeParams(childItem)
              _this.changeSelectOption(childItem, needHandleTags)
              // 子表中设置系统默认值
              _this.setSysDefaultValue(childItem)
              if (childItem.__config__.layout === 'tabsLayout') {
                childItem.__tabs__.forEach((tab) => {
                  tab.children.forEach((ele) => {
                    _this.buildWatchCascadeParams(ele)
                    _this.changeSelectOption(ele, needHandleTags)
                    // 子表中设置系统默认值
                    _this.setSysDefaultValue(ele)
                  })
                })
              }
            })
          }
        })
      }

      // 待表单数据，回显数据加载完后再初始化下拉等数据
      if (this.initConfig.fields.length) {
        const needHandleTags = ['tree-select', 'el-select', 'el-radio-group', 'el-checkbox-group']
        // const needComputedTags = ['el-input']
        // 异步获取下拉\单选\多选等数据
        this.initConfig.fields.map(async (item) => {
          _this.buildWatchCascadeParams(item)
          // 主表
          _this.changeSelectOption(item, needHandleTags)
          // 主表中设置系统默认值
          _this.setSysDefaultValue(item)
          // 单行文本--计算器
          // _this.setComputedItem(item, needComputedTags)
          if (item.__config__.layout === 'tabsLayout') {
            item.__tabs__.forEach((tab) => {
              tab.children.forEach((ele) => {
                _this.buildWatchCascadeParams(ele)
                _this.changeSelectOption(ele, needHandleTags)
                // 子表中设置系统默认值
                _this.setSysDefaultValue(ele)
              })
            })
          }
          if (item.__config__.children && item.__config__.children.length) {
            // 子表
            item.__config__.children.map(async (childItem) => {
              _this.buildWatchCascadeParams(childItem)
              _this.changeSelectOption(childItem, needHandleTags)
              // 子表中设置系统默认值
              _this.setSysDefaultValue(childItem)
              if (childItem.__config__.layout === 'tabsLayout') {
                childItem.__tabs__.forEach((tab) => {
                  tab.children.forEach((ele) => {
                    _this.buildWatchCascadeParams(ele)
                    _this.changeSelectOption(ele, needHandleTags)
                    // 子表中设置系统默认值
                    _this.setSysDefaultValue(ele)
                  })
                })
              }
            })
          }
        })
      }
    },
    handlerEvents(list) {
      list.forEach((ele) => {
        if (ele.event && Object.keys(ele.event).length > 0) {
          ele.on = _cloneDeep(ele.event)
        }
        if (ele.__config__.children && ele.__config__.children.length > 0) {
          this.handlerEvents(ele.__config__.children)
        }
      })
    },
    async handlerCustomFn(conf) {
      this.customFn = {}
      if (conf.loadCustomFn) {
        await import('./Function').then((res) => {
          this.customFn = { ...res }
        })
      }
    },
    //  数据回填
    extractDefaultValue(layout, fields, result) {
      let data = []
      if (Array.isArray(fields) && layout === 'masterSlaveTable') {
        data = this.fieldsRecursive(fields, result)
      }
      if (Array.isArray(fields) && layout === 'multiSelected') {
        for (let i = 0; i < fields.length; i++) {
          data = this.fieldsRecursiveV2(fields[i], result)
        }
      }
      return data
    },
    fieldsRecursive(fields, result) {
      if (Array.isArray(result)) {
        const index = result.findIndex((v) => fields[0].__config__.childrenTable === v.tableId)
        const newData = result[index].data
        let val = []
        const data = []
        newData.forEach((item) => {
          let modifyData = { ...item.table }
          fields.forEach((field) => {
            if (field.__config__.tag === 'el-date-picker' && field.type === 'daterange') {
              const strs = field.__config__.formFields
              val = item.table ? [item.table[strs[0]], item.table[strs[1]]] : []
            } else if (field.__config__.tag === 'el-time-picker' && field.__config__.tagIcon === 'time-range') {
              const strs = field.__config__.formFields
              val = item.table ? [item.table[strs[0]], item.table[strs[1]]] : ''
            } else if (field.__config__.tag === 'el-select') {
              val = field.multiple ? item.table[field.__vModel__].split(',') : item.table[field.__vModel__]
              field.__config__.defaultValue = val
            } else if (field.__config__.tag === 'el-checkbox-group') {
              item.table[field.__vModel__] = item.table[field.__vModel__] ? item.table[field.__vModel__].split(',') : ''
              val = item.table[field.__vModel__]
              field.__config__.defaultValue = val
            } else if (field.__config__.tag === 'el-input') {
              val = item.table[field.__vModel__]
              field.__config__.defaultValue = val
            } else if (field.__config__.tag === 'secret-component') {
              val = item.table[field.__vModel__]
            } else if (field.__config__.tag === 'p8-autocomplete') {
              val = item.table[field.__vModel__]
              field.__config__.defaultValue = val
            } else if (field.__config__.tag === 'p8-upload') {
              val = item.uploadFiles.map((temp) => temp.type)
              item.table[field.__vModel__] = val
            } else if (field.__config__.tag === 'el-tabs') {
              field.__tabs__.forEach((tab) => {
                tab.children.forEach((ele) => {
                  if (ele.__config__.tag === 'el-date-picker' && ele.type === 'daterange') {
                    const strs = ele.__config__.formFields
                    val = item.table ? [item.table[strs[0]], item.table[strs[1]]] : []
                  } else if (ele.__config__.tag === 'el-time-picker' && ele.__config__.tagIcon === 'time-range') {
                    const strs = ele.__config__.formFields
                    val = item.table ? [item.table[strs[0]], item.table[strs[1]]] : ''
                  } else if (ele.__config__.tag === 'el-select') {
                    val = ele.multiple ? item.table[ele.__vModel__].split(',') : item.table[ele.__vModel__]
                    ele.__config__.defaultValue = val
                  } else if (ele.__config__.tag === 'el-checkbox-group') {
                    item.table[ele.__vModel__] = item.table[ele.__vModel__] ? item.table[ele.__vModel__].split(',') : []
                    val = item.table[ele.__vModel__]
                    ele.__config__.defaultValue = val
                  } else if (ele.__config__.tag === 'el-input') {
                    val = item.table[ele.__vModel__]
                    ele.__config__.defaultValue = val
                  } else if (ele.__config__.tag === 'secret-component') {
                    val = item.table[ele.__vModel__]
                  } else if (ele.__config__.tag === 'p8-autocomplete') {
                    val = item.table[ele.__vModel__]
                    ele.__config__.defaultValue = val
                  } else if (ele.__config__.tag === 'p8-upload') {
                    val = item.uploadFiles.map((temp) => temp.type)
                    item.table[ele.__vModel__] = val
                  } else {
                    val = item.table[ele.__vModel__]
                  }
                  if (DEFAULT_FIELDS.indexOf(item) === -1) {
                    modifyData = {
                      ...modifyData,
                      uploadFiles: item.uploadFiles || [],
                      [ele.__vModel__]: val
                    }
                  }
                })
              })
            } else {
              val = item.table[field.__vModel__]
            }
            if (DEFAULT_FIELDS.indexOf(item) === -1) {
              modifyData = {
                ...modifyData,
                uploadFiles: item.uploadFiles || [],
                [field.__vModel__]: val
              }
            }
          })
          data.push(modifyData)
        })
        return data
      }
    },
    fieldsRecursiveV2(field, result) {
      if (Array.isArray(result)) {
        const index = result.findIndex((v) => field.__config__.childrenTable === v.tableId)
        const newData = result[index].data
        let modifyData = {}
        let val = []
        let data = []
        newData.forEach((item) => {
          if (field.__config__.tag === 'el-select') {
            if (field.multiple) {
              val.push(item.table[field.__vModel__])
            } else {
              val = item.table[field.__vModel__]
            }
            field.__config__.defaultValue = val
          } else if (field.__config__.tag === 'el-checkbox-group') {
            val.push(item.table[field.__vModel__])
            field.__config__.defaultValue = val
          } else if (field.__config__.tag === 'el-input') {
            val = item.table[field.__vModel__]
            field.__config__.defaultValue = val
          }
          if (DEFAULT_FIELDS.indexOf(item) === -1) {
            modifyData = {
              uploadFiles: item.uploadFiles || [],
              ...item.table,
              [field.__vModel__]: val
            }
            data = [modifyData]
          }
        })
        return data
      }
    },

    getPropParam() {
      const newBuildPropParam = {}
      newBuildPropParam.$PROPPARAM = this.propParam
      return newBuildPropParam
    },
    setPageData(pageData) {
      this.pageData = pageData
    },
    // 重构下拉级联参数对象
    buildDynamicParamObj(item, label, value, path) {
      // console.log('重构下拉级联参数对象', value)
      // 存在一对多的前后置关系
      const selectComp = item.__config__.selectComp
      if (this.dynamicParamObj[value.slice(1)]) {
        const hasSelectComp = this.dynamicParamObj[value.slice(1)].findIndex((i) => {
          return i.dynamicCompId === selectComp
        })
        if (hasSelectComp !== -1) {
          this.dynamicParamObj[value.slice(1)].splice(hasSelectComp, 1, {
            dynamicCompId: item.__config__.selectComp,
            path: path + '.' + label
          })
        } else {
          this.dynamicParamObj[value.slice(1)].push({
            dynamicCompId: item.__config__.selectComp,
            path: path + '.' + label
          })
        }
      } else {
        this.dynamicParamObj[value.slice(1)] = [
          {
            dynamicCompId: item.__config__.selectComp,
            path: path + '.' + label
          }
        ]
      }
    },
    // 构建 监听动态参数
    buildWatchCascadeParams(item) {
      const _this = this
      const customParam = {}
      const sqlParam = {}
      const reportParam = {}
      if (item.__config__.selectParam) {
        if (Object.keys(item.__config__.selectParam).length && item.__config__.selectParam.param.length) {
          item.__config__.selectParam.param.forEach((i) => {
            if (typeof i.value === 'string' && i.value.startsWith('$')) {
              _this.buildDynamicParamObj(item, i.label, i.value, 'param')
              customParam[i.label] = ''
            } else {
              customParam[i.label] = i.value
            }
          })
        }
        if (Object.keys(item.__config__.selectParam.sqlParam).length) {
          Object.keys(item.__config__.selectParam.sqlParam).forEach((i) => {
            if (typeof item.__config__.selectParam.sqlParam[i] === 'string' && item.__config__.selectParam.sqlParam[i].startsWith('$')) {
              _this.buildDynamicParamObj(item, i, item.__config__.selectParam.sqlParam[i], 'sqlParam')
              sqlParam[i] = ''
            } else {
              sqlParam[i] = item.__config__.selectParam.sqlParam[i]
            }
          })
        }
        if (Object.keys(item.__config__.selectParam.reportParam).length) {
          Object.keys(item.__config__.selectParam.reportParam).forEach((i) => {
            if (typeof item.__config__.selectParam.reportParam[i] === 'string' && item.__config__.selectParam.reportParam[i].startsWith('$')) {
              _this.buildDynamicParamObj(item, i, item.__config__.selectParam.reportParam[i], 'reportParam')
              reportParam[i] = ''
            } else {
              reportParam[i] = item.__config__.selectParam.reportParam[i]
            }
          })
        }
      }
      this.dynamicDataObj[item.__config__.selectComp] = {
        param: customParam,
        sqlParam: sqlParam,
        reportParam: reportParam
      }
    },
    async changeSelectOption(item, needHandleTags) {
      const needHandleIndex = needHandleTags.indexOf(item.__config__.tag)
      if (needHandleIndex > -1) {
        if (item.__config__.dataType === 'dynamic') {
          const param = {
            id: item.__config__.selectComp,
            param: this.dynamicDataObj[item.__config__.selectComp].param,
            sqlParam: this.dynamicDataObj[item.__config__.selectComp].sqlParam,
            reportParam: this.dynamicDataObj[item.__config__.selectComp].reportParam,
            permissionVo: this.permissionVo
          }
          const res = await this.$api['formGenerator.getSelectionData'](param)
          let options = []
          if (res) {
            if (res.config) {
              options = needHandleIndex === 0 ? selectGenerateTree(res.data, res.config) : selectTransform(res.data, res.config)
            } else {
              // 解析数据字典数据
              options = res.data.map((item) => {
                item.label = item.cmeaning
                item.value = item.id
                return item
              })
              options = generateTreeTwo(options, 'cparentid')
            }
          }
          item.__slot__.options = options
        }
      }
    },
    async watchChangeSelectOption(item) {
      if (item.__config__.dataType === 'dynamic' && Object.keys(item.__config__.selectParam.sqlParam).length) {
        const param = {
          id: item.__config__.selectComp,
          param: this.dynamicDataObj[item.__config__.selectComp].param,
          sqlParam: this.dynamicDataObj[item.__config__.selectComp].sqlParam,
          reportParam: this.dynamicDataObj[item.__config__.selectComp].reportParam
        }
        const res = await this.$api['formGenerator.getSelectionData'](param)
        let options = []
        if (res.config) {
          options = selectTransform(res.data, res.config)
        } else {
          options = res.data
        }
        item.__slot__.options = options
      }
      if (item.__config__.tag === 'eject-select') {
        item.__config__.selectParam.reportParam = this.dynamicDataObj[item.__config__.selectComp].reportParam
      }
    },
    watchLinkData(item) {
      if (item.__config__.tag === 'el-progress') {
        item.percentage = this.pageData[item.__vModel__]
      }
    },
    // 计算器功能，目前只支持加法运算
    // setComputedItem(item, needComputedTags) {
    //   const _this = this
    //   const needComputedIndex = needComputedTags.indexOf(item.__config__.tag)
    //   if (needComputedIndex > -1) {
    //     const variable = item.__config__.variable
    //     if (variable && variable.indexOf('+') !== -1) {
    //       if (variable.indexOf('$COMPUTED') !== -1) {
    //         const fieldsArr = variable.split('+')
    //         let computedResult = 0
    //         fieldsArr.forEach((fieldsItem) => {
    //           const paramArr = fieldsItem.trim().split('.')
    //           if (_this.pageData[paramArr[1]]) {
    //             computedResult += _this.pageData[paramArr[1]]
    //           }
    //         })
    //         item.__config__.defaultValue = computedResult
    //         this.$nextTick(() => {
    //           this.$refs.parser.updateCountModel(item.__vModel__, computedResult)
    //         })
    //       } else if (variable.indexOf('$LABEL') !== -1) {
    //         // 计算器支持资金label合计显示，803独有功能
    //         const fieldsArr = variable.split('+')
    //         const labelFieldsArr = []
    //         fieldsArr.forEach((fieldsItem) => {
    //           const paramArr = fieldsItem.trim().split('.')
    //           labelFieldsArr.push(paramArr[1])
    //         })
    //         item.__config__.defaultValue = ''
    //         this.formConf.fields.forEach((formItem) => {
    //           if (labelFieldsArr.indexOf(formItem.__config__.formFields) !== -1 && _this.pageData[formItem.__config__.formFields] > 0) {
    //             item.__config__.defaultValue += formItem.__config__.label + '+'
    //           }
    //         })
    //         item.__config__.defaultValue = item.__config__.defaultValue.slice(0, item.__config__.defaultValue.length - 1)
    //       }
    //     }
    //   }
    // },
    async resetForm() {
      if (this.type && this.type === '001') {
        this.$emit('save-reset')
      } else {
        this.init('reset')
      }
    },
    save(data, childData, arr, logdata) {
      const params = {
        desformCode: this.record.desformCode,
        dataId: this.dataId,
        primary: { table: data.data, uploadFiles: data.uploadFiles },
        children: childData,
        logDetail: logdata,
        router: this.$route.name,
        permissionVo: this.permissionVo
      }
      // console.log(params, '---params---')
      if (this.type && this.type === '001') {
        this.$emit('save-echarts')
      } else {
        const that = this
        this.$api['formGenerator.formCallSave'](params)
          .then(function (res) {
            if (res) {
              that.$message({
                type: 'success',
                message: '保存成功!'
              })
              that.$emit('save-success', res)
            } else {
              that.$message({
                type: 'error',
                message: '保存失败!'
              })
            }
          })
          .catch(function (error) {
            console.log(error)
          })
      }
    },
    setSysDefaultValue(confClone) {
      if (confClone.__config__.variable && confClone.__config__.variable.startsWith('$')) {
        // 处理系统参数变量
        const paramArr = confClone.__config__.variable.trim().split('.')
        if (this.sysParams[paramArr[0]]) {
          const defaultValue = this.sysParams[paramArr[0]][paramArr[1]]
          confClone.__config__.defaultValue = defaultValue
        }
      } else if (confClone.__config__.variable && confClone.__config__.variable.startsWith('#')) {
        // 处理系统方法变量
        const variableFunName = confClone.__config__.variable.trim().slice(1)
        const defaultValue = this.$store.state.user.sysVars.methods[variableFunName]()
        confClone.__config__.defaultValue = defaultValue
      }
    },

    /**
     * 日期区间组件，回填数据
     * @param result: 接口返回回填数据
     * @param record: 日期区间组件的jsx属性
     */
    setDateData(result, record) {
      record.__config__.defaultValue = []
      let arr = []
      for (const i in result) {
        if (record.__config__.formFields.includes(i)) {
          arr = [result[record.__config__.formFields[0]], result[record.__config__.formFields[1]]]
        }
      }
      Object.assign({}, record.__config__.defaultValue, arr)
      // record.__config__.defaultValue = arr
    },
    saveChange(result) {
      this.$emit('save-form', result)
    }
  }
}
</script>
<style lang="scss" scoped>
.parser-container {
  height: 100%;
}
</style>
