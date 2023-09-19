<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <normal-layout class="grid-table-render"
                 :header-visible="headerVisible"
                 :normal-layout="normalLayout">
    <template #north>
      <common-button v-if="tableInfo.useSystemConfigButton === 1 || (tableInfo.useSystemConfigButton === 0 && buttonData.length > 0)"
                     :comp="renderComp"
                     :permission-vo="permissionVo"
                     :select-records="selectRecords"
                     :custom-button-data="buttonData"></common-button>
      <search-form-list ref="search"
                        v-if="searchData.length"
                        :data-source="searchData"
                        @search="search"
                        @re-set="reSet"
                        :search-width="searchWidth"
                        :permission-vo="permissionVo"
                        :search-contain-width="searchContainWidth"></search-form-list>
    </template>
    <template #west>
      <slot name="westSlot"></slot>
    </template>
    <template #center>
      <common-table ref="table"
                    :comp="comp"
                    :intelligence-comp="intelligenceComp"
                    v-if="columns.length"
                    :columns="columns"
                    :params="tableParam"
                    :flex="flex"
                    row-key="ID"
                    seach-type="1"
                    :table-config="tableConfig"
                    :custom-height="customHeight"
                    api="formGenerator.tableApply"
                    :table-refresh="tableRefresh"
                    :custom-button-data="buttonData"
                    :custom-button-config="buttonConfig"
                    @selection-change="handleSelectionChange"
                    @row-click="rowClick"
                    @column-fiter="columnFiter"
                    :show-summary="showSummary"
                    :summary-method="summaryMethod"
                    :permission-vo="permissionVo"
                    :is-radio-select="isRadioSelect">
        <template :slot="item"
                  v-for="item in customColumn"
                  slot-scope="{ scope }">
          <slot :name="item"
                :scope="scope"></slot>
        </template>
      </common-table>
    </template>
    <template #drawer-panel>
      <common-drawer title="表单页面"
                     :visible="formVisible"
                     size="50%"
                     :drawer-config="drawerConfig"
                     @close="formClose">
        <template #drawer>
          <form-render :data-view-id="dataViewId"
                       :record="{ desformCode: codeForm }"
                       :prop-param="propParam"
                       :permission-vo="permissionVo"
                       @save-success="formClose"></form-render>
        </template>
      </common-drawer>
      <common-drawer title="查看页面"
                     :visible="viewVisible"
                     size="50%"
                     :drawer-config="drawerConfig"
                     @close="viewClose">
        <template #drawer>
          <!-- <view-render :code="code"
                       :record="viewRecord"></view-render> -->
          <form-render page-type="view"
                       :data-view-id="dataViewId"
                       :permission-vo="permissionVo"
                       :record="{ desformCode: codeForm }"></form-render>
        </template>
      </common-drawer>
      <common-drawer title="查看流程图"
                     :visible="customVisible"
                     size="50%"
                     :drawer-config="drawerConfig"
                     @close="customClose">
        <template #drawer>
          <component :is="componentLoader"
                     :permission-vo="permissionVo"
                     :row="scopeRow"></component>
        </template>
      </common-drawer>
    </template>
  </normal-layout>
</template>

<script>
import { P8NormalLayoutV1 as NormalLayout, P8Table as CommonTable, P8Button as CommonButton, P8Drawer as CommonDrawer, Notification } from 'p8-components-ui'
import SearchFormList from './intellSearchFormList'
import FormRender from '@/views/Framework/ComponentsMananger/Form/Components/Components/edit.vue'
import ViewRender from './viewRender.vue'
/* eslint-disable vue/require-default-prop */
export default {
  name: 'TableRender',
  components: {
    NormalLayout,
    CommonTable,
    SearchFormList,
    CommonButton,
    CommonDrawer,
    FormRender,
    ViewRender
  },
  props: {
    code: {
      // 报表code
      type: String,
      default: ''
    },
    reportParam: {
      // 给报表所传参数
      type: Object,
      default: () => {
        return {}
      }
    },
    flex: {
      // 报表自定义高度
      type: Number,
      defalut: 0
    },
    customHeight: {
      // 报表自定义高度
      type: Number,
      defalut: 100
    },
    headerVisible: {
      // 是否隐藏头部
      type: Boolean,
      default: true
    },
    showSummary: {
      // 是否显示合计行
      type: Boolean,
      default: false
    },
    searchWidth: {
      type: String,
      default: '550px'
    },
    searchContainWidth: {
      type: String,
      default: '550px'
    },
    summaryMethod: {
      // 合计计算方法
      type: Function
    },
    showWestTree: {
      // 是否采用上左右结构
      type: Boolean,
      default: true
    },
    westTreeParam: {
      // 左边树所传参数
      type: Object,
      default: () => {
        return {}
      }
    },
    intelligenceComp: {
      // 智能报表中配置的按钮this
      type: Object,
      default: () => {
        return {}
      }
    },
    tableType: {
      // 是否树形表格
      type: Boolean,
      default: false
    },
    enableEdit: {
      // 是否可编辑表格
      type: Boolean,
      default: false
    }
  },
  inject: {
    provideParams: {
      from: 'provideParams',
      default: {}
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
      buttonData: [], // 报表按钮集合
      buttonConfig: [], // 重新构建的报表按钮禁用规则
      selectType: 0, // 是否展示复选框，0是不显示复选框，1是单选，2是复选
      tableInfo: {},
      tableConfig: {
        'highlight-current-row': true
      },
      formVisible: false, // 新建抽屉visible
      codeForm: '', // 新建/修改表单code
      dataViewId: '', // 修改页面id
      drawerConfig: {
        modal: false
      },
      viewVisible: false, // 查看抽屉visible
      viewRecord: {}, // 修改查看列表行记录
      customColumn: [], // 自定义列fieldName集合
      normalLayout: {
        west: {
          xs: 0,
          sm: 0,
          md: 0,
          lg: 0,
          xl: 0
        },
        center: {
          xs: 24,
          sm: 24,
          md: 24,
          lg: 24,
          xl: 24
        }
      },
      customVisible: false, // 自定义抽屉visible
      componentPath: '', // 操作按钮弹出框 component 路径
      scopeRow: '', // 表格行记录
      propParam: Object.assign({}, this.westTreeParam), // 将树参数传至表单
      showSearchRow: false,
      permissionVo: {
        router: this.$route.name,
        resourceId: ''
      }
    }
  },
  created () {
    this.$watch(
      'provideParams.searchParams',
      (newValue, oldValue) => {
        let obj = {}
        Object.keys({ ...newValue }).map((item) => {
          obj[item] = {
            value: newValue[item],
            mode: '=',
            relation: 'and'
          }
        })
        this.tableParam.param = { ...obj }
        this.tableParam.permissionVo = { router: this.$route.name, resourceId: '' }
        this.propParam = Object.assign(this.propParam, newValue)
      },
      {
        deep: true
      }
    )
  },
  mounted () {
    if (this.code && this.code != '') {
      this.getTableInfo(this.code)
    }
    if (!this.showWestTree) {
      this.normalLayout = {
        west: {
          xs: 0,
          sm: 0,
          md: 0,
          lg: 0,
          xl: 0
        },
        center: {
          xs: 24,
          sm: 24,
          md: 24,
          lg: 24,
          xl: 24
        }
      }
    }
  },
  computed: {
    componentLoader () {
      return () => import(`@/${this.componentPath}.vue`)
    },
    renderComp () {
      return Object.keys(this.intelligenceComp).length ? this.intelligenceComp : this.comp
    },
    isRadioSelect () {
      return this.selectType === 'single'
    }
  },
  watch: {
    reportParam (val, oldVal) {
      if (this.code && this.tableInfo) {
        this.rebuildParam(val)
      }
    },
    code (val, oldVal) {
      this.getTableInfo(val)
    },
    westTreeParam (val, oldVal) {
      let obj = {}
      Object.keys(val).map((item) => {
        obj[item] = {
          value: val[item],
          mode: '=',
          relation: 'and'
        }
      })
      this.tableParam.param = { ...obj }
      this.propParam = Object.assign(this.propParam, val)
    }
  },
  methods: {
    getTableInfo (code) {
      this.permissionVo = { router: this.$route.name, resourceId: '' }
      this.$api['formGenerator.tableGetInfo']({ reportCode: this.code, permissionVo: this.permissionVo }).then((res) => {
        this.tableInfo = res
        let columnData = []
        // 报表列信息
        if (res.reportItems && res.reportItems.length) {
          res.reportItems.map((item) => {
            if (item.isListShow) {
              if (item.isSearch) {
                if (this.tableInfo.searchPos === 1) {
                  this.showSearchRow = true
                  let filter = this.getHeadSelectByType(item.searchMode, item)
                  // 查询放置表头
                  columnData.push({
                    title: item.fieldTxt,
                    dataIndex: item.fieldName,
                    minWidth: item.fieldWidth,
                    sortable: item.isOrder ? item.isOrder : false,
                    filterable: true,
                    iconDisplay: true,
                    filter: filter
                  })
                } else {
                  this.showSearchRow = false
                  // 查询放置按钮区域
                  columnData.push({
                    title: item.fieldTxt,
                    dataIndex: item.fieldName,
                    minWidth: item.fieldWidth,
                    sortable: item.isOrder ? item.isOrder : false
                  })
                  this.searchData.push({
                    // type: 'text', // 控件类型
                    // labelText: item.fieldTxt, // 控件显示的文本
                    // fieldName: item.fieldName
                    type: item.searchMode, // 控件类型
                    labelText: item.fieldTxt, // 控件显示的文本
                    fieldName: item.fieldName,
                    mode: '=',
                    selectCode: item.dictCode,
                    replaceSearch: item.replaceVal
                  })
                }
              } else if (item.isCustomColumn) {
                if (item.fieldName === '_ROWNO') {
                  // 序号列为自定义列，默认的fieldName为"_ROWNO"
                  columnData.push({
                    title: item.fieldTxt,
                    dataIndex: item.fieldName,
                    minWidth: item.fieldWidth,
                    type: 'index'
                  })
                } else {
                  columnData.push({
                    title: item.fieldTxt,
                    dataIndex: item.fieldName,
                    minWidth: item.fieldWidth,
                    sortable: item.isOrder ? item.isOrder : false,
                    scopedSlots: { customRender: 'custom' }
                  })
                  this.customColumn.push(item.fieldName)
                }
              } else {
                columnData.push({
                  title: item.fieldTxt,
                  dataIndex: item.fieldName,
                  minWidth: item.fieldWidth,
                  sortable: item.isOrder ? item.isOrder : false
                })
              }
            }
          })
          // 报表按钮参数
          if (this.tableInfo.useSystemConfigButton === 1) {
            columnData.push({
              title: '操作',
              dataIndex: 'operation',
              minWidth: 120,
              scopedSlots: { customRender: 'operation' }
            })
          } else if (res.reportResources.length && this.tableInfo.useSystemConfigButton === 0) {
            this.buttonData = res.reportResources
            console.log(this.buttonData, '==========================按钮位置');
            this.buttonData.map((btn) => {
              if (btn.permission) {
                let permission = JSON.parse(btn.permission.replace(/\s*/g, ''))
                this.buttonConfig.push({
                  ...{ id: btn.id },
                  ...permission
                })
              }
              // 当前页面的父页面调用行按钮与header按钮方法
              if (!this[btn.eventHandle]) {
                this[btn.eventHandle] = function (row, button) {
                  this.$emit(btn.eventHandle, row, button, this.code)
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
          if (this.tableInfo.selectType) {
            columnData.unshift({
              type: 'selection',
              width: 40
            })
            if (this.tableInfo.selectType === 1) {
              this.selectType = 'single'
            } else {
              this.selectType = 'multip'
            }
          }
          this.columns = columnData
        }
        // 报表参数
        if (res.reportParams && res.reportParams.length) {
          res.reportParams.map((item) => {
            this.defaultReportParam[item.paramName] = item.paramValue
          })
        }

        // SQL参数
        if (res.reportSqlParams && res.reportSqlParams.length) {
          res.reportSqlParams.map((item) => {
            this.sqlParam[item.paramName] = item.paramValue
          })
        }
        this.rebuildParam(this.reportParam)
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
        reportId: this.tableInfo.id,
        param: {},
        reportParam: { ...this.sqlParam, ...this.defaultReportParam, ...reportParam },
        router: this.$route.name,
        code: this.code,
        permissionVo: { router: this.$route.name, resourceId: '' }
      }
    },
    handleSelectionChange (val) {
      // if (this.selectType === 'single') {
      //   if (val.length >= 2) {
      //     // 删除索引为0的
      //     // console.log(val.splice(0,val.length-1),'被删除的')
      //     let arrays = val.splice(0, val.length - 1)
      //     arrays.forEach((row) => {
      //       this.$refs.table.$refs.table.toggleRowSelection(row) // 除了当前点击的，其他的全部取消选中
      //     })
      //   }
      // }
      this.selectRecords = val
      this.$emit('selection-change', val)
    },
    rowClick (val) {
      if (this.tableInfo.enableClick) {
        this.$emit('row-click', val)
      }
    },
    columnFiter (val) {
      // this.tableParam.param = { ...val }
    },
    // 新建表单
    async createForm (btn) {
      console.log("🚀 ~22222222222222222222222222222222222222222", btn)
      let createFormParams
      if (btn && btn.eventParams) {
        createFormParams = eval('(' + btn.eventParams + ')')
        this.permissionVo.resourceId = btn.id
        createFormParams.permissionVo = { router: this.$route.name, resourceId: btn.id }
      } else if (btn.belongTo) {
        createFormParams = { desformCode: btn.belongTo, permissionVo: { router: this.$route.name } }
      } else {
        console.log('该请求缺失参数{desformCode:""}')
      }
      // console.log('createForm:', createFormParams)
      let drawingListData = await this.getDrawingList(createFormParams)
      if (drawingListData.desformStatus === '1') {
        // this.codeForm = btn.belongTo
        this.codeForm = createFormParams.desformCode
        this.dataViewId = ''
        this.propParam = Object.assign(this.propParam, this.westTreeParam)
        this.formVisible = true
      } else {
        Notification.error({
          title: '提示',
          message: '设计的表单未发布，无法调用！'
        })
      }
    },
    // 表单新建/修改关闭抽屉
    formClose () {
      this.formVisible = false
      this.$refs.table.searchData()
    },
    // 修改表单
    async modifyForm (row, btn) {
      let createFormParams
      if (btn && btn.eventParams) {
        createFormParams = eval('(' + btn.eventParams + ')')
        this.permissionVo.resourceId = btn.id
        createFormParams.permissionVo = { router: this.$route.name, resourceId: btn.id }
      } else if (btn.belongTo) {
        createFormParams = { desformCode: btn.belongTo, permissionVo: { router: this.$route.name } }
      } else {
        console.log('该请求缺失参数{desformCode:""}')
      }

      let drawingListData = await this.getDrawingList(createFormParams)
      if (drawingListData.desformStatus === '1') {
        // this.codeForm = btn.belongTo
        this.codeForm = createFormParams.desformCode
        this.dataViewId = row.ID
        let oldPropParam = {}
        if (Object.keys(this.propParam).length) {
          Object.keys(this.propParam).map((item) => {
            oldPropParam[item] = row[item]
          })
        }
        this.propParam = oldPropParam
        this.formVisible = true
      } else {
        Notification.error({
          title: '提示',
          message: '设计的表单未发布，无法调用！'
        })
      }
    },
    // 删除表单
    deleteForm (row, btn) {
      let that = this
      let createFormParams
      if (btn && btn.eventParams) {
        createFormParams = eval('(' + btn.eventParams + ')')
        this.permissionVo.resourceId = btn.id
        createFormParams.permissionVo = { router: this.$route.name, resourceId: btn.id }
      } else if (btn.belongTo) {
        createFormParams = { desformCode: btn.belongTo }
      } else {
        console.log('该请求缺失参数{desformCode:""}')
      }

      this.$confirm('是否要删除该记录？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log(btn, 'btn')
        this.$api['formGenerator.formCallDataRemove']({
          desformCode: createFormParams.desformCode,
          dataId: row.ID,
          router: that.$route.name,
          permissionVo: { router: this.$route.name, resourceId: createFormParams.permissionVo.resourceId }
        }).then((res) => {
          if (res) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.$refs.table.searchData()
          } else {
            this.$message({
              type: 'error',
              message: '删除失败!'
            })
          }
        })
      })
    },
    // 查看表单
    viewForm (row, btn) {
      let createFormParams
      if (btn && btn.eventParams) {
        createFormParams = eval('(' + btn.eventParams + ')')
      } else if (btn.belongTo) {
        createFormParams = { desformCode: btn.belongTo }
      } else {
        console.log('该请求缺失参数{desformCode:""}')
      }
      // this.viewRecord = row
      // this.viewVisible = true
      // this.codeForm = btn.belongTo
      this.codeForm = createFormParams.desformCode
      this.dataViewId = row.ID
      let oldPropParam = {}
      if (Object.keys(this.propParam).length) {
        Object.keys(this.propParam).map((item) => {
          oldPropParam[item] = row[item]
        })
      }
      this.propParam = oldPropParam
      this.viewVisible = true
    },
    // 查看抽屉关闭
    viewClose () {
      this.viewVisible = false
    },
    // 自定义抽屉
    openComponent (row, btn) {
      this.scopeRow = row
      this.componentPath = btn.component
      this.customVisible = true
    },
    // 关闭自定义抽屉
    customClose () {
      this.customVisible = false
    },
    // 动态api
    dynamicAPI (row, btn) {
      this.$api[btn.remark]({ ID: row.id })
        .then((res) => {
          if (res) {
            this.$message({
              type: 'success',
              message: '操作成功!'
            })
          } else {
            this.$message({
              type: 'error',
              message: '操作失败!'
            })
          }
        })
        .catch(() => { })
    },
    async getDrawingList (params) {
      console.log('getDrawingList:', params)
      let res = {}
      res = await this.$api['formGenerator.designerDetails'](params)
      return res
    },
    getHeadSelectByType (type = 'text', field) {
      if (type === 'text') {
        return {
          val: '',
          type: 'text',
          visible: false
        }
      }
      if (type === 'select') {
        return {
          val: '',
          type: 'select',
          visible: false,
          optionUrl: {
            api: 'formGenerator.getSelectionDataDic',
            params: { selectCode: field.dictCode, type: field.dictCode }
          }
        }
      }
      if (type === 'datetime') {
        return {
          val: '',
          type: 'datetime',
          visible: false,
          fieldConfig: {
            valueFormat: 'yyyy-MM-dd'
          }
        }
      }
      if (type === 'multiple') {
        return {
          val: '',
          type: 'multiple',
          visible: false,
          optionUrl: {
            api: 'formGenerator.getSelectionDataDic',
            params: { selectCode: field.dictCode, type: field.dictCode }
          }
        }
      }
      if (type === 'datetimeRange') {
        return {
          val: [],
          type: 'datetimeRange',
          visible: false,
          fieldConfig: {
            valueFormat: 'yyyy-MM-dd'
          }
        }
      }
      if (type === 'popUpSelect') {
        return {
          val: '',
          type: 'popUpSelect',
          visible: false,
          selectCode: field.dictCode
        }
      }
      if (type === 'treeSelect') {
        return {
          val: '',
          clearable: true,
          type: 'treeSelect',
          visible: false,
          optionUrl: {
            api: 'formGenerator.getSelectionDataDic',
            params: { selectCode: field.dictCode }
          },
          treeData: []
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.list-layout.grid-table-render {
  .list-main {
    padding: 10px;
    margin: 0;
  }
}
</style>
