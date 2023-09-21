<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <normal-layout class="grid-table-render"
                 :header-visible="headerVisible"
                 :normal-layout="normalLayout">
    <template #north>
      <common-button v-if="tableInfo.useSystemConfigButton == 1 || (tableInfo.useSystemConfigButton == 0 && buttonData.length > 0)"
                     :comp="renderComp"
                     :button-type="'round'"
                     :permission-vo="permissionVo"
                     :select-records="selectRecords"
                     :use-system-config-button="tableInfo.useSystemConfigButton"
                     :is-layout-button="isLayoutButton"
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
      <template v-if="columns.length">
        <template v-if="enableEdit == 1">
          <vxetable-table v-if="tableType == 0"
                          ref="vxeTable"
                          :comp="comp"
                          :custom-c-s-s="customCSS"
                          :columns="columns"
                          api="formGenerator.tableApply"
                          :params="tableParam"
                          :custom-button-data="buttonData"
                          :custom-button-config="buttonConfig"
                          :is-edit-table="true"
                          :checkbox-config="{}"
                          :row-config="rowConfig"
                          :radio-config="{}"
                          :seach-type="seachType"
                          :show-search-row="showSearchRow"
                          :is-smart-form="true"
                          :pagination="false"
                          :edit-parmars="editParmars"
                          :use-system-config-button="tableInfo.useSystemConfigButton"
                          :is-layout-button="isLayoutButton"
                          @row-click="rowVxeClick"
                          @open-third-menu="thirdMenuClick"
                          @selection-change="handleSelectionChange"></vxetable-table>
          <vxetable-table v-else
                          ref="vxeTable"
                          class="vxeTreeTable"
                          :comp="renderComp"
                          :intelligence-comp="renderComp"
                          :custom-c-s-s="customCSS"
                          :columns="columns"
                          api="formGenerator.tableApply"
                          :params="tableParam"
                          :custom-button-data="buttonData"
                          :custom-button-config="buttonConfig"
                          :is-edit-table="true"
                          :tree-config="treeConfig"
                          :checkbox-config="{}"
                          :row-config="rowConfig"
                          :radio-config="{}"
                          :seach-type="seachType"
                          :show-search-row="showSearchRow"
                          :is-smart-form="true"
                          :pagination="false"
                          :edit-parmars="editParmars"
                          :use-system-config-button="tableInfo.useSystemConfigButton"
                          :is-layout-button="isLayoutButton"
                          @row-click="rowVxeClick"
                          @open-third-menu="thirdMenuClick"
                          @selection-change="handleSelectionChange">
          </vxetable-table>
        </template>
        <template v-else>
          <common-table ref="table"
                        :comp="comp"
                        :custom-c-s-s="customCSS"
                        :intelligence-comp="intelligenceComp"
                        v-if="columns.length && tableType == 0"
                        :columns="columns"
                        :params="tableParam"
                        :flex="flex"
                        row-key="ID"
                        :seach-type="seachType"
                        :show-search-row="showSearchRow"
                        :is-smart-form="true"
                        :table-config="tableConfig"
                        :custom-height="customHeight"
                        api="formGenerator.tableApply"
                        :table-refresh="tableRefresh"
                        :custom-button-data="buttonData"
                        :custom-button-config="buttonConfig"
                        :is-layout-button="isLayoutButton"
                        @selection-change="handleSelectionChange"
                        @row-click="rowClick"
                        @open-third-menu="thirdMenuClick"
                        @column-fiter="columnFiter"
                        :show-summary="showSummary"
                        :summary-method="summaryMethod"
                        :permission-vo="permissionVo"
                        :use-system-config-button="tableInfo.useSystemConfigButton"
                        :is-radio-select="isRadioSelect">
            <template :slot="item"
                      v-for="item in customColumn"
                      slot-scope="{ scope }">
              <template v-if="item === 'taskTypeIcon'">
                <span :key="item"
                      :class="scope.row.ICON"></span>
              </template>
              <slot v-else
                    :name="item"
                    :scope="scope"></slot>
            </template>
          </common-table>
          <!-- <vxe-table ref="xTable"
                 :comp="comp"
                 :intelligence-comp="intelligenceComp"
                 v-if="columns.length && tableType === 0"
                 :flex="flex"
                 row-key="ID"
                 :columns='columns'
                 :custom-height="customHeight"
                 :params='tableParam'
                 :table-config="tableConfig"
                 :checkbox-config="checkboxConfig"
                 :page-size="15"
                 seach-type='1'
                 :no-api-table-data="noApiTableData"
                 @row-click="rowVxeClick"
                 @selection-change="handleSelectionChange">
        <template :slot="item"
                  v-for="item in customColumn"
                  slot-scope="{ scope }">
          <slot :name="item"
                :scope="scope"></slot>
        </template>
      </vxe-table> -->
          <vxetable-table ref="xTable"
                          :custom-c-s-s="customCSS"
                          v-if="columns.length && tableType == 1"
                          :comp="comp"
                          :columns="columns"
                          :params="tableParam"
                          :row-config="rowConfig"
                          :tree-config="treeConfig"
                          :checkbox-config="checkboxConfig"
                          :radio-config="radioConfig"
                          :custom-button-data="buttonData"
                          :custom-button-config="buttonConfig"
                          :seach-type="seachType"
                          :show-search-row="showSearchRow"
                          :is-smart-form="true"
                          :pagination="false"
                          api="formGenerator.tableApply"
                          :use-system-config-button="tableInfo.useSystemConfigButton"
                          :is-layout-button="isLayoutButton"
                          @row-click="rowVxeClick"
                          @open-third-menu="thirdMenuClick"
                          @selection-change="handleSelectionChange">
            <template :slot="item"
                      v-for="item in customColumn"
                      slot-scope="{ scope }">
              <template v-if="item === 'taskTypeIcon'">
                <span :key="item"
                      :class="scope.row.ICON"></span>
              </template>
              <slot v-else
                    :name="item"
                    :scope="scope"></slot>
            </template>
          </vxetable-table>
        </template>
      </template>
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
                       :view-relation="viewRelation"
                       :record="{ desformCode: codeForm }"></form-render>
        </template>
      </common-drawer>
      <common-drawer title="查看页面"
                     :visible="rowViewVisible"
                     size="50%"
                     :drawer-config="drawerConfig"
                     @close="viewClose">
        <template #drawer>
          <view-render :code="code"
                       :record="viewRecord"></view-render>
        </template>
      </common-drawer>
      <common-drawer :title="customComponentParams.title"
                     v-if="customComponentParams.type === 'drawer'"
                     :visible="customVisible"
                     :size="customComponentParams.width"
                     :drawer-config="drawerConfig"
                     @close="customClose">
        <template #drawer>
          <component :is="componentLoader"
                     v-bind="customProps"
                     :permission-vo="permissionVo"
                     :row="scopeRow"
                     @close="customClose"></component>
        </template>
      </common-drawer>
      <common-dialog v-if="customComponentParams.type === 'dialog'"
                     :title="customComponentParams.title"
                     :visible="customVisible"
                     destroy-on-close
                     :width="customComponentParams.width"
                     @close="customClose"
                     :show-handle-btn="false"
                     :dialog-config="{
          modal: true,
          appendToBody: true,
          modalAppendToBody: true
        }"
                     :close-on-click-modal="false"
                     :close-on-press-escape="false">
        <template #dialog>
          <component :is="componentLoader"
                     v-bind="customProps"
                     :permission-vo="permissionVo"
                     :row="scopeRow"
                     @close="customClose"></component>
        </template>
      </common-dialog>
      <common-drawer title="查看流程图"
                     :visible="visibleModelPicture"
                     size="50%"
                     :drawer-config="drawerConfig"
                     @close="onModelPictureClose">
        <template #drawer>
          <!-- <model-view :process-definition-id="modelId"></model-view> -->
          <process-approval-view v-inherited-father-height
                                 :business-obj="{
              businessId: modelId,
              processDefinitionKey: processDefinationTwoKey
            }">
          </process-approval-view>
        </template>
      </common-drawer>
      <common-drawer title="下钻详情"
                     :visible="runInHoleVisible"
                     size="100%"
                     :drawer-config="drawerConfig"
                     @close="runInHoleClose">
        <template #drawer>
          <!-- <table-render :code="runInHoleCode"
                        :report-param="runInHoleParam"></table-render> -->
          <component :is="componentUrl"
                     :code="componentsConfig.code"
                     :data-view-id="componentsConfig.dataViewId"
                     :record="{ desformCode: componentsConfig.codeForm }"
                     :permission-vo="componentsConfig.permissionVo"
                     :layout-config="componentsConfig"
                     :kanban-config="componentsConfig"
                     :report-param="runInHoleParam"
                     ref="components"></component>
        </template>
      </common-drawer>
      <!-- 启动流程 -->
      <selectApproveUserBeforehand v-if="isSelectApproveUserBeforehandView"
                                   :is-select-approve-user-beforehand-view="isSelectApproveUserBeforehandView"
                                   :select-user-beforehand-data-source="selectUserBeforehandDataSource"
                                   :select-user-beforehand-form-data="selectUserBeforehandFormData"
                                   @close-modal="closeSelectApproveUserBeforehand"
                                   @commit="commitSelectApproveUserBeforehand"></selectApproveUserBeforehand>
      <!-- 弹出编辑 -->
      <common-drawer title="弹出编辑"
                     :visible="editVisible"
                     size="100%"
                     :drawer-config="drawerConfig"
                     @close="editVisible = false">
        <template #drawer>
          <component :is="editComponentUrl"
                     :code="editConfig.code"
                     :record="editConfig.record"
                     :is-edit-child="editConfig.isEditChild"
                     :permission-vo="permissionVo"
                     ref="components"></component>
        </template>
      </common-drawer>
      <common-drawer v-if="visibleThirdDrawer"
                     :visible="visibleThirdDrawer"
                     direction="ttb"
                     :title="thirdMenuTitle"
                     @close='onThirdMenuClose'
                     size="100%">
        <template #drawer>
          <menu-layout :third-menu-param='thirdMenuParam'
                       :default-menu="defaultMenu"
                       :cache="false"
                       exclude="PlanChange"></menu-layout>
        </template>
      </common-drawer>
    </template>
  </normal-layout>
</template>

<script>
import {
  P8ProcessApproval as ProcessApprovalView,
  P8ProcessDefinition as ModelView,
  P8NormalLayoutV1 as NormalLayout,
  P8Table as CommonTable,
  P8Button as CommonButton,
  P8Drawer as CommonDrawer,
  P8Dialog as CommonDialog,
  Notification,
  P8VxeTable as VxetableTable,
  P8MenuLayout as MenuLayout
} from 'p8-components-ui'
import SearchFormList from './intellSearchFormList'
import FormRender from '@/views/Framework/ComponentsMananger/Form/Components/Components/edit.vue'
import ViewRender from './viewRender.vue'
import SelectApproveUserBeforehand from '@/views/Framework/BusinessActivity/ProcessApproval/selectApproveUserBeforehand'
import { nextApproveUserBeforehand } from '@/assets/commonJS/BusinessActivity/nextApproveUserBeforehand'
import _cloneDeep from 'lodash/cloneDeep'
/* eslint-disable vue/require-default-prop */
export default {
  name: 'TableRender',
  components: {
    NormalLayout,
    CommonTable,
    SearchFormList,
    CommonButton,
    CommonDrawer,
    CommonDialog,
    FormRender,
    ViewRender,
    VxetableTable,
    SelectApproveUserBeforehand,
    ModelView,
    ProcessApprovalView,
    MenuLayout
  },
  props: {
    code: {
      // 报表code
      type: String,
      default: ''
    },
    record: {
      // 行数据
      type: Object,
      default: () => {
        return {}
      }
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
      defalut: 150
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
    // tableType: {
    //   // 是否树形表格
    //   type: Number,
    //   default: 0
    // },
    tableApi: {
      type: String,
      default: ''
    },
    isEditChild: {
      type: Boolean,
      default: false
    },
    // 当在布局设计界面时 不展示权限按钮 默认为false
    isLayoutButton: {
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
      defaultMenu: {},
      thirdMenuParam: {},
      thirdMenuTitle: '',
      visibleThirdDrawer: false,
      runInHoleCode: '',
      comp: this,
      selectRecords: [],
      searchData: [],
      searchList: [],
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
      customComponentParams: {},
      componentPath: '', // 操作按钮弹出框 component 路径
      scopeRow: '', // 表格行记录
      customProps: {},
      propParam: Object.assign({}, this.westTreeParam), // 将树参数传至表单
      showSearchRow: false,
      permissionVo: {
        router: this.$route.name,
        resourceId: ''
      },
      treeConfig: {
        transform: true,
        expandAll: true,
        trigger: 'default',
        rowField: 'ID',
        parentField: 'PARENT_ID',
        indent: 40
      },
      rowConfig: {
        isHover: true,
        isCurrent: true
      },
      checkboxConfig: {
        checkMethod: this.checCheckboxkMethod,
        visibleMethod: this.checkboxkvisibleMethod
      },
      radioConfig: {
        visibleMethod: this.checkboxkvisibleMethod
      },
      noApiTableData: [],
      runInHoleVisible: false,
      runInHoleParam: {},
      enableEdit: null,
      editParmars: {},
      reportItems: [],
      isSelectApproveUserBeforehandView: false,
      selectUserBeforehandDataSource: [],
      selectUserBeforehandFormData: {},
      modelId: '',
      visibleModelPicture: false,
      tableType: null,
      selectionRange: null,
      processDefinationTwoKey: null,
      selsctRow: {},
      releaseMenuParams: {
        beforehandParams: {}
      },
      remark: '', // 动态api
      seachType: '',
      componentsConfig: {},
      // 设置组件动态路径
      asyncComponents: '',
      rowViewVisible: false,
      viewKeys: {},
      viewRelation: [],
      editComponents: '',
      editVisible: false,
      editConfig: {},
      customCSS: {},
      sysParams: Object.assign({ $SYSTEM_PARAMS_SELECT: _cloneDeep(this.$store.state.user.userInfo) }), // 系统级参数
      currentRouterPath: ''
    }
  },
  created () {
    this.currentRouterPath = this.$route.path
    this.$watch(
      'provideParams.searchParams',
      (newValue, oldValue) => {
        this.fiflterParams(newValue)
      },
      {
        deep: true
      }
    )
  },
  mounted () {
    if (this.code && this.code !== '') {
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
    this.$nextTick(() => {
      this.$refs.table && this.$refs.table.doLayout()
    })
  },
  computed: {
    componentLoader () {
      if (this.componentPath) {
        if (this.componentPath.indexOf('?') !== -1) {
          const list = this.componentPath.split('?')
          console.log(list)
          const url = list[0]
          const parmars = list[1].split('&')
          const obj = {}
          parmars.forEach((item) => {
            const str = item.split('=')
            if (str[0] === 'code') {
              obj.layoutCode = str[1]
            }
            if (str[0] === 'version') {
              obj.layoutVersion = str[1]
            }
          })
          this.customProps.layoutConfig = obj
          return () => import('@/views/' + url + '.vue')
        } else {
          return () => import(`@/views/${this.componentPath}.vue`)
        }
      } else {
        return ''
      }
    },
    renderComp () {
      return Object.keys(this.intelligenceComp).length ? this.intelligenceComp : this.comp
    },
    isRadioSelect () {
      return this.selectType === 'single'
    },
    componentUrl () {
      if (this.asyncComponents) {
        return () => import(`@/views/${this.asyncComponents}.vue`)
      } else {
        return ''
      }
    },
    editComponentUrl () {
      if (this.editComponents) {
        return () => import(`@/views/${this.editComponents}.vue`)
      } else {
        return ''
      }
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
      const obj = {}
      Object.keys(val).forEach((item) => {
        obj[item] = {
          value: val[item],
          mode: '=',
          relation: 'and'
        }
      })
      this.tableParam.param = { ...obj }
      this.propParam = Object.assign(this.propParam, val)
    }
    // watch: {
    //   $route: {
    //     handler (val) {
    //       this.getTableInfo()
    //     }
    //   }
    // }
  },
  methods: {
    fiflterParams (newValue) {
      const obj = {}
      const searchKeys = this.searchList.map((el) => {
        return el.replaceSearch ? el.replaceSearch : el.fieldName
      })
      Object.keys({ ...newValue }).forEach((item) => {
        if (searchKeys.includes(item)) {
          if (typeof newValue[item] === 'string') {
            obj[item] = {
              value: newValue[item],
              mode: '=',
              relation: 'and'
            }
          } else if (typeof newValue[item] === 'object') {
            obj[item] = newValue[item]
          }
        }
      })
      this.tableParam.param = { ...obj }
      this.tableParam.permissionVo = { router: this.$route.name, resourceId: '' }
      this.propParam = Object.assign(this.propParam, newValue)
    },
    getTableInfo (code) {
      const that = this
      this.searchData = []
      this.buttonData = []
      this.columns = []
      this.viewKeys = {}
      this.permissionVo = { router: this.$route.name, resourceId: '' }
      this.$api['formGenerator.tableGetInfo']({ reportCode: this.code, permissionVo: this.permissionVo }).then((res) => {
        that.tableInfo = res
        if (res.styleRendering) {
          that.customCSS = eval('(' + res.styleRendering + ')')
        }
        that.tableType = res.tableType
        that.selectionRange = res.selectionRange
        const columnData = []
        // 报表列信息
        if (res.reportItems && res.reportItems.length) {
          this.searchList = []
          res.reportItems.forEach((item, index) => {
            if (item.isViewShow) {
              that.$set(that.viewKeys, item.fieldName, item.fieldTxt)
            }
            if (item.isParent && item.isParent == 1) {
              that.treeConfig.parentField = item.fieldName
            }
            that.selectionRange = res.selectionRange
            that.reportItems = res.reportItems
            if (item.isListShow) {
              if (item.isSearch) {
                if (this.tableInfo.searchPos == 1) {
                  this.showSearchRow = false
                  const filter = this.getHeadSelectByType(item.searchMode, item)
                  // 查询放置表头
                  columnData.push({
                    title: item.fieldTxt,
                    headerAlign: res.title,
                    align: res.alignmentStyle,
                    dataIndex: item.fieldName,
                    minWidth: item.fieldWidth,
                    sortable: item.isOrder ? item.isOrder : false,
                    filterable: true,
                    iconDisplay: true,
                    filter: filter
                  })
                } else if (this.tableInfo.searchPos == 2) {
                  this.showSearchRow = true
                  const filter = this.getHeadSelectByType(item.searchMode, item)
                  // 查询放置表头
                  columnData.push({
                    title: item.fieldTxt,
                    headerAlign: res.title,
                    align: res.alignmentStyle,
                    dataIndex: item.fieldName,
                    minWidth: item.fieldWidth,
                    sortable: item.isOrder ? item.isOrder : false,
                    filterable: true,
                    iconDisplay: false,
                    filter: filter
                  })
                } else {
                  this.showSearchRow = false
                  // 查询放置按钮区域
                  columnData.push({
                    title: item.fieldTxt,
                    headerAlign: res.title,
                    align: res.alignmentStyle,
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
                    headerAlign: res.title,
                    align: res.alignmentStyle,
                    dataIndex: item.fieldName,
                    minWidth: item.fieldWidth,
                    type: 'index'
                  })
                } else {
                  columnData.push({
                    title: item.fieldTxt,
                    headerAlign: res.title,
                    align: res.alignmentStyle,
                    dataIndex: item.fieldName,
                    minWidth: item.fieldWidth,
                    sortable: item.isOrder ? item.isOrder : false,
                    scopedSlots: { customRender: 'custom' }
                  })
                }
              } else {
                columnData.push({
                  title: item.fieldTxt,
                  headerAlign: res.title,
                  align: res.alignmentStyle,
                  dataIndex: item.fieldName,
                  minWidth: item.fieldWidth,
                  sortable: item.isOrder ? item.isOrder : false
                })
              }
            }
            if (item.isSearch) {
              this.searchList.push({
                type: item.searchMode, // 控件类型
                labelText: item.fieldTxt, // 控件显示的文本
                fieldName: item.fieldName,
                mode: '=',
                selectCode: item.dictCode,
                replaceSearch: item.replaceVal
              })
            }
          })
          this.$emit('searchData', this.searchList)
          // 报表按钮参数
          if (this.tableInfo.useSystemConfigButton == 1) {
            columnData.push({
              title: '操作',
              headerAlign: res.title,
              align: res.alignmentStyle,
              dataIndex: 'operation',
              width: 140,
              scopedSlots: { customRender: 'operation' }
            })
          } else if (res.reportResources.length && this.tableInfo.useSystemConfigButton == 0) {
            this.buttonData = res.reportResources
            this.buttonData.forEach((btn) => {
              if (btn.permission) {
                const permission = JSON.parse(btn.permission)
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
              headerAlign: res.title,
              align: res.alignmentStyle,
              dataIndex: 'operation',
              width: 140,
              scopedSlots: { customRender: 'operation' }
            })
          }
          if (this.tableInfo.selectType) {
            if (res.tableType == 0 && res.enableEdit == 0) {
              columnData.unshift({
                type: 'selection',
                width: 40
              })
            } else {
              if (res.selectType == 1) {
                columnData.unshift({
                  type: 'radio',
                  width: 50
                })
              } else {
                columnData.unshift({
                  type: 'checkbox',
                  width: 50
                })
              }
            }
            if (this.tableInfo.selectType == 1) {
              this.selectType = 'single'
            } else {
              this.selectType = 'multip'
            }
          }
          this.seachType = that.tableInfo.searchPos + ''
          res.reportConfig.forEach((item) => {
            item.columnConfig = JSON.parse(item.columnConfig)
            if (item.isCustomColumn == '1' && item.customColumnType === 'slot' && item.columnConfig.slotName) {
              this.customColumn.push(item.columnConfig.slotName)
            }
            columnData.forEach((el, index) => {
              if (item.fieldName === el.dataIndex) {
                columnData[index] = { ...el, ...item }
              }
            })
          })
          // 树形表格设置展开列
          res.reportItems.forEach((item, index) => {
            if (item.treeNode === '1') {
              columnData.forEach((el) => {
                if (el.dataIndex === item.fieldName) {
                  el.treeNode = true
                  el.align = 'left'
                }
              })
            }
            if (item.isParent === 1) {
              this.treeConfig.parentField = item.fieldName
            }
          })
          this.columns = columnData
          // 是编辑表格
          if (res.enableEdit == 1) {
            this.initClomuns()
          }
        }
        // 报表参数
        if (res.reportParams && res.reportParams.length) {
          res.reportParams.forEach((item) => {
            this.defaultReportParam[item.paramName] = this.getDefaultValue(item.paramValue)
          })
        }

        // SQL参数
        if (res.reportSqlParams && res.reportSqlParams.length) {
          res.reportSqlParams.forEach((item) => {
            this.sqlParam[item.paramName] = item.paramValue
          })
        }
        that.enableEdit = res.enableEdit
        this.rebuildParam(this.reportParam)
        if (this.provideParams.searchParams && Object.keys(this.provideParams.searchParams).length > 0) {
          this.fiflterParams(this.provideParams.searchParams)
        }
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
      const reportParam = {}
      const defaultReportParamArr = Object.keys(this.defaultReportParam)
      const sqlParamArr = Object.keys(this.sqlParam)
      const valArr = Object.keys(val)
      if (valArr.length) {
        valArr.forEach((item) => {
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
    rowClick (row, column) {
      if (this.tableInfo.enableClick === 1) {
        this.$emit('row-click', row)
        if (this.tableInfo.enableClick === 1) {
          this.runInHoleParam = row
          this.reportItems.forEach((item) => {
            if (column.property === item.fieldName) {
              if (item.fieldHref && item.fieldHref !== '') {
                this.componentsConfig = JSON.parse(item.fieldHref)
                this.runInHoleVisible = true
                this.asyncComponents = this.componentsConfig.url
              }
            }
          })
        }
      }
    },
    // 单元格点击事件
    rowVxeClick (row, column, $event) {
      if (this.tableInfo.enableClick === 1) {
        this.runInHoleParam = row
        this.reportItems.forEach((item) => {
          if (column.field === item.fieldName) {
            // this.runInHoleCode = item.fieldHref
            if (item.fieldHref && item.fieldHref !== '') {
              this.componentsConfig = JSON.parse(item.fieldHref)
              this.runInHoleVisible = true
              this.asyncComponents = this.componentsConfig.url
            }
          }
        })
      }
    },
    runInHoleClose () {
      this.runInHoleVisible = false
    },
    columnFiter (val) {
      // this.tableParam.param = { ...val }
    },
    // 新建表单
    async createForm (btn) {
      let createFormParams = {}
      if (btn && btn.eventParams) {
        this.permissionVo.resourceId = btn.id
        createFormParams.permissionVo = { router: this.$route.name, resourceId: btn.id }
        createFormParams = eval('(' + btn.eventParams + ')')
        if (createFormParams.code) {
          createFormParams = { desformCode: createFormParams.code, permissionVo: { router: this.$route.name } }
        }
      } else {
        console.log('该请求缺失参数{desformCode:""}')
      }
      const drawingListData = await this.getDrawingList(createFormParams)
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
      if (this.tableType === 0) {
        this.$refs.table.searchData()
      } else {
        this.$refs.xTable.searchData()
      }
      this.$emit('refresh')
    },
    // 修改表单
    async modifyForm (row, btn) {
      const rowBtnData = this.getRowBtnData(row, btn, true)
      row = rowBtnData.row
      btn = rowBtnData.btn
      if (!row) {
        return
      }
      let createFormParams = {}
      if (btn && btn.eventParams) {
        createFormParams = eval('(' + btn.eventParams + ')')
        this.permissionVo.resourceId = btn.id
        createFormParams.permissionVo = { router: this.$route.name, resourceId: btn.id }
        if (createFormParams.code) {
          createFormParams = { desformCode: createFormParams.code, permissionVo: { router: this.$route.name } }
        }
      } else {
        console.log('该请求缺失参数{desformCode:""}')
      }

      const drawingListData = await this.getDrawingList(createFormParams)
      if (drawingListData.desformStatus === '1') {
        // this.codeForm = btn.belongTo
        this.codeForm = createFormParams.desformCode
        this.dataViewId = row.ID
        const oldPropParam = {}
        if (Object.keys(this.propParam).length) {
          Object.keys(this.propParam).forEach((item) => {
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
      const rowBtnData = this.getRowBtnData(row, btn)
      row = rowBtnData.row
      btn = rowBtnData.btn
      if (!row) {
        return
      }
      const rowIds = row.map((el) => {
        return el.ID
      })
      const that = this
      let createFormParams = {}
      if (btn && btn.eventParams) {
        createFormParams = eval('(' + btn.eventParams + ')')
        this.permissionVo.resourceId = btn.id
        createFormParams.permissionVo = { router: this.$route.name, resourceId: btn.id }
        if (createFormParams.code) {
          createFormParams = { desformCode: createFormParams.code }
        }
      } else {
        console.log('该请求缺失参数{desformCode:""}')
      }
      const params = {
        ...createFormParams.customJson,
        desformCode: createFormParams.desformCode,
        dataIds: rowIds,
        router: that.$route.name,
        permissionVo: { router: this.$route.name, resourceId: btn.id }
      }
      this.$confirm('是否要删除该记录？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$api['formGenerator.formCallDataRemove'](params).then((res) => {
          if (res) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            if (this.tableType === 0) {
              this.$refs.table.searchData()
              this.$refs.table.clearSelection()
            } else {
              this.$refs.xTable.searchData()
            }
            this.$emit('refresh')
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
      const rowBtnData = this.getRowBtnData(row, btn, true)
      row = rowBtnData.row
      btn = rowBtnData.btn
      if (!row) {
        return
      }
      let createFormParams = {}
      if (btn && btn.eventParams) {
        createFormParams = eval('(' + btn.eventParams + ')')
        if (createFormParams.code) {
          this.codeForm = createFormParams.code
        }
      } else {
        console.log('该请求缺失参数{desformCode:""}')
      }
      // this.viewRecord = row
      // this.viewVisible = true
      // this.codeForm = btn.belongTo
      this.dataViewId = row.ID
      const oldPropParam = {}
      if (Object.keys(this.propParam).length) {
        Object.keys(this.propParam).forEach((item) => {
          oldPropParam[item] = row[item]
        })
      }
      this.propParam = oldPropParam
      this.viewVisible = true
    },
    viewTableRow (row, btn) {
      this.viewRelation = []
      for (const key in this.viewKeys) {
        this.viewRelation.push({
          label: this.viewKeys[key],
          value: row[key]
        })
      }
      this.viewRecord = row
      this.rowViewVisible = true
    },
    // 查看抽屉关闭
    viewClose () {
      this.viewVisible = false
      this.rowViewVisible = false
    },
    // 自定义抽屉
    openComponent (row, btn) {
      const rowBtnData = this.getOpenComponentData(row, btn)
      row = rowBtnData.row
      btn = rowBtnData.btn
      let createFormParams = {}
      if (btn && btn.eventParams) {
        createFormParams = eval('(' + btn.eventParams + ')')
        if (createFormParams.code) {
          this.componentPath = createFormParams.code
        }
      } else {
        console.log('该请求缺失参数{desformCode:""}')
      }
      this.customComponentParams = {
        type: createFormParams.type ? createFormParams.type : 'drawer',
        title: createFormParams.title ? createFormParams.title : '',
        width: createFormParams.width ? createFormParams.width : '50%'
      }
      this.scopeRow = row
      this.customVisible = true
    },
    getOpenComponentData (row, btn) {
      if (!btn) {
        return { row: this.selectRecords, btn: row }
      } else {
        return { row: [row], btn: btn }
      }
    },
    customerFun (row, btn) {
      const rowBtnData = this.getRowBtnData(row, btn)
      row = rowBtnData.row
      btn = rowBtnData.btn
      const funCode = JSON.parse(btn.eventParams).code
      const func = new Function(`return function (row){${funCode}}`)()
      func.call(this, row, btn)
    },
    // 打开子表编辑表格
    openEditTable (row, btn) {
      const rowBtnData = this.getRowBtnData(row, btn, true)
      row = rowBtnData.row
      btn = rowBtnData.btn
      if (btn && btn.eventParams) {
        this.editConfig.code = JSON.parse(btn.eventParams).code
      } else {
        console.log('该请求缺失参数{code:""}')
      }
      this.editConfig.record = row
      this.editConfig.isEditChild = true
      this.editComponents = 'Framework/ComponentsMananger/Grid/Components/tableRender'
      this.editVisible = true
    },
    // 关闭自定义抽屉
    customClose () {
      this.customComponentParams = {}
      this.customVisible = false
      if (this.tableType == 0) {
        this.$refs.table.searchData()
      } else {
        this.$refs.xTable.searchData()
      }
    },
    // 查看流程图
    viewProcess (row, btn) {
      const rowBtnData = this.getRowBtnData(row, btn, true)
      row = rowBtnData.row
      btn = rowBtnData.btn
      if (!row) {
        return
      }
      if (btn && btn.eventParams) {
        let createFormParams = eval('(' + btn.eventParams + ')')
        this.processDefinationTwoKey = createFormParams.code
      }
      this.modelId = row.ID
      this.visibleModelPicture = true
    },
    // 关闭流程图
    onModelPictureClose () {
      this.visibleModelPicture = false
    },
    // 撤销流程图
    cancelProcess (row, btn) {
      const rowBtnData = this.getRowBtnData(row, btn)
      row = rowBtnData.row
      if (!row) {
        return
      }
      const withdrawList = []
      if (btn && btn.eventParams) {
        let createFormParams = eval('(' + btn.eventParams + ')')
        withdrawList.push({ businessKey: row[0].ID, processDefinitionKey: createFormParams.code })
      }
      // row.forEach((el) => {
      //   withdrawList.push({ businessKey: el.ID, )
      // })
      const params = {
        withdrawList: withdrawList
      }
      this.$confirm('是否要撤销该流程？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const that = this
        this.$api['baseData.withdraw'](params)
          .then(function (res) {
            if (res.result) {
              that.$message({
                message: '撤销成功',
                type: 'success'
              })
              if (that.tableType === 0) {
                that.$refs.table.searchData()
              } else {
                that.$refs.xTable.searchData()
              }
            } else {
              if (res.errorMsg) {
                that.$message({
                  type: 'error',
                  message: res.errorMsg
                })
              } else if (res.message) {
                that.$message({
                  type: 'error',
                  message: res.message
                })
              } else {
                that.$message({
                  type: 'error',
                  message: '撤回失败'
                })
              }
            }
          })
          .catch(function (error) {
            console.error(error)
          })
      })
    },
    // 启动流程
    startProcess (row, btn) {
      const rowBtnData = this.getRowBtnData(row, btn)
      row = rowBtnData.row
      btn = rowBtnData.btn
      if (!row) {
        return
      }
      // this.remark = btn.remark
      const obj = JSON.parse(btn.eventParams)
      this.selsctRow = row
      this.processDefinationTwoKey = obj.code
      this.nextApproveUserBeforehand(obj.code)
    },
    nextApproveUserBeforehand (processDefinationTwoKey) {
      const that = this
      nextApproveUserBeforehand.initDataSource(processDefinationTwoKey, that).then((res1) => {
        if (res1 === true) {
          that.isSelectApproveUserBeforehandView = true
        }
      })
    },
    // 关闭流程
    closeSelectApproveUserBeforehand () {
      this.isSelectApproveUserBeforehandView = false
    },
    // 提交审批
    commitSelectApproveUserBeforehand (fullParams) {
      const that = this
      this.releaseMenuParams.beforehandParams = { ...fullParams }
      const rowIds = this.selsctRow.map((el) => {
        return el.ID
      })
      this.releaseMenuParams.businessId = rowIds
      this.releaseMenuParams.processDefinitionKey = this.processDefinationTwoKey
      this.$api['baseData.commitApprove'](this.releaseMenuParams)
        .then(function (res) {
          if (res.result && res.result === 'false') {
            that.$message({
              type: 'error',
              message: res.message
            })
          } else {
            that.$message({
              message: '提交成功',
              type: 'success'
            })
            if (that.tableType === 0) {
              that.$refs.table.searchData()
            } else {
              that.$refs.xTable.searchData()
            }
          }
        })
        .catch(function (error) {
          console.error(error)
        })

      that.isSelectApproveUserBeforehandView = false
    },
    // 动态api
    dynamicAPI (row, btn) {
      const rowBtnData = this.getRowBtnData(row, btn)
      row = rowBtnData.row
      btn = rowBtnData.btn
      const obj = JSON.parse(btn.eventParams)
      if (obj.openDia) {
        this.$confirm(obj.warningMsg, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.getDyApi(obj, row, btn)
        })
      } else {
        this.getDyApi(obj, row, btn)
      }
    },
    getDyApi (obj, row, btn) {
      if (!row) {
        return
      }
      const rowIds = row.map((el) => {
        return el.ID
      })
      this.$api[obj.code]({ ids: rowIds })
        .then((res) => {
          if (res) {
            this.$message({
              type: 'success',
              message: obj.successMsg
            })
            if (that.tableType === 0) {
              that.$refs.table.searchData()
            } else {
              that.$refs.xTable.searchData()
            }
          } else {
            this.$message({
              type: 'error',
              message: obj.errorMsg
            })
          }
        })
        .catch(() => { })
    },
    async getDrawingList (params) {
      let res = {}
      res = await this.$api['formGenerator.designerDetails'](params)
      return res
    },
    getHeadSelectByType (type = 'text', field) {
      if (type === 'number') {
        return {
          val: '',
          type: 'number',
          visible: false,
          alias: field.replaceVal ? field.replaceVal : ''
        }
      }
      if (type === 'text') {
        return {
          val: '',
          type: 'text',
          visible: false,
          alias: field.replaceVal ? field.replaceVal : ''
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
          },
          alias: field.replaceVal ? field.replaceVal : ''
        }
      }
      if (type === 'radioButton') {
        return {
          val: '',
          type: 'radioButton',
          visible: false,
          optionUrl: {
            api: 'formGenerator.getSelectionDataDic',
            params: { selectCode: field.dictCode, type: field.dictCode }
          },
          alias: field.replaceVal ? field.replaceVal : ''
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
          },
          alias: field.replaceVal ? field.replaceVal : ''
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
    },
    checCheckboxkMethod ({ row }) {
      return true
    },
    // 复选框是否展示
    checkboxkvisibleMethod ({ row }) {
      let selectionRange = false
      // let selections = ['1', '2']
      if (this.selectionRange) {
        if (this.selectionRange.indexOf('0') !== -1) {
          if (!row[this.treeConfig.parentField]) {
            selectionRange = true
          }
        }
        if (this.selectionRange.indexOf('1') !== -1) {
          if (row[this.treeConfig.parentField] && row.children.length > 0) {
            selectionRange = true
          }
        }
        if (this.selectionRange.indexOf('2') !== -1) {
          if (row[this.treeConfig.parentField] && row.children.length === 0) {
            selectionRange = true
          }
        }
        return selectionRange
      }
    },
    // 新增首行
    addFirstRow () {
      const newRecord = {}
      if (this.isEditChild && this.columns && this.columns.length) {
        this.columns.forEach((el) => {
          if (el.defaultValue) {
            newRecord[el.dataIndex] = this.getDefaultValue(el.defaultValue)
          }
        })
      }
      this.$refs.vxeTable.addFirstRow(newRecord)
    },
    // 新增尾行
    addLastRow () {
      const newRecord = {}
      if (this.isEditChild && this.columns && this.columns.length) {
        this.columns.forEach((el) => {
          if (el.defaultValue) {
            newRecord[el.dataIndex] = this.getDefaultValue(el.defaultValue)
          }
        })
      }
      this.$refs.vxeTable.addLastRow(newRecord)
    },
    // 插入
    insertRow (row, btn) {
      this.$refs.vxeTable.insertRow(row, btn)
    },
    getDefaultValue (defaultVal) {
      if (defaultVal && defaultVal.startsWith('$')) {
        // 处理系统参数变量
        const paramArr = defaultVal.trim().split('.')
        if (this.sysParams[paramArr[0]]) {
          const defaultValue = this.sysParams[paramArr[0]][paramArr[1]]
          return defaultValue
        }
      } else if (defaultVal && defaultVal.startsWith('#')) {
        // 处理系统方法变量
        const variableFunName = defaultVal.trim().slice(1)
        const defaultValue = this.$store.state.user.sysVars.methods[variableFunName]()
        return defaultValue
      } else if (defaultVal && defaultVal.startsWith('__')) {
        // 处理系统方法变量
        const paramArr = defaultVal.trim().split('.')
        if (this.record[paramArr[1]]) {
          const defaultValue = this.record[paramArr[1]]
          return defaultValue
        }
      } else {
        return defaultVal
      }
    },
    // 保存
    saveEditData () {
      this.$refs.vxeTable.saveEditData()
    },
    // 修改
    editRowEvent (row, btn) {
      this.$refs.vxeTable.editRowEvent(row, btn)
    },
    // 删除
    deleteRowEvent (row, btn) {
      this.$refs.vxeTable.deleteRowEvent(row, btn)
    },
    // 导出
    exportExcel (row, btn) {
      const exportObj = {
        fileName: this.$route.meta.title, // 导出的名称
        columnConfigs: this.columns // 导出的列
      }
      if (this.tableType == 0) {
        this.$refs.table.exportTable(exportObj)
      } else {
        this.$refs.xTable.exportTable(exportObj)
      }
    },
    initClomuns () {
      const that = this
      this.columns.forEach((item) => {
        // 自定义列设置
        if (that.tableInfo.reportConfig && that.tableInfo.reportConfig.length > 0) {
          that.tableInfo.reportConfig.forEach((el) => {
            if (item.dataIndex === el.fieldName) {
              // 是否自定义列
              item.isCustomColumn = el.isCustomColumn
              // // 是否父节点合计
              // item.isFatherTotal = el.isFatherTotal
              // 是否表尾合计
              item.isTableTotal = el.isTableTotal
              // 自定义列类型
              item.customColumnType = el.customColumnType
              // 自定义列配置
              item.columnConfig = typeof el.columnConfig === 'string' ? JSON.parse(el.columnConfig) : el.columnConfig
            }
          })
        }
      })
      this.columns.forEach((item) => {
        // 编辑配置
        if (that.tableInfo.reportEditDisposes && that.tableInfo.reportEditDisposes.length > 0) {
          that.tableInfo.reportEditDisposes.forEach((el) => {
            item.storageList = this.tableInfo.tableId
            if (item.title === el.fieldTxt && (item.isCustomColumn == '0' || !item.isCustomColumn)) {
              // item.isEdit = true
              // 是否必填
              item.isRequired = el.isRequired
              // 编辑组件类型
              item.editType = el.editComponentType
              item.defaultValue = el.defaultValue
              item.isshow = el.editDisplay !== '1'
              // 存储表
              // item.storageList = this.tableInfo.tableId ? this.tableInfo.tableId : el.sourceTableFiled
              // 存储字段
              item.tableFieldName = el.tableFieldName
            }
          })
        }
      })
      this.editParmars = {
        editMode: this.tableInfo.editMode,
        saveMode: this.tableInfo.saveMode
      }
    },
    getRowBtnData (row, btn, selectOne) {
      let record
      let button = null
      if (!btn) {
        button = row
        if (this.selectRecords.length) {
          if (selectOne) {
            if (this.selectRecords.length > 1) {
              this.$message({ type: 'warning', message: '只可选择一条数据' + button.title })
              return
            } else {
              record = this.selectRecords[0]
            }
          } else {
            record = this.selectRecords
          }
        } else {
          this.$message({ type: 'warning', message: '请选择一条数据' })
          return
        }
        return { row: record, btn: button }
      }
      if (selectOne) {
        return { row, btn }
      } else {
        return { row: [row], btn }
      }
    },
    // 修改合同信息发布状态表单 CONTRACT_STATUS
    async modifyContractStatusForm (row, btn) {
      const rowBtnData = this.getRowBtnData(row, btn)
      row = rowBtnData.row
      btn = rowBtnData.btn
      if (!row) {
        return
      }
      const rowIds = row.map((el) => {
        return el.ID
      })
      const that = this
      let createFormParams = {}
      if (btn && btn.eventParams) {
        createFormParams = eval('(' + btn.eventParams + ')')
        this.permissionVo.resourceId = btn.id
        createFormParams.permissionVo = { router: this.$route.name, resourceId: btn.id }
        if (createFormParams.code) {
          createFormParams = { desformCode: createFormParams.code }
        }
      } else {
        console.log('该请求缺失参数{desformCode:""}')
      }
      const params = {
        ...createFormParams.customJson,
        desformCode: createFormParams.desformCode,
        dataIds: rowIds,
        router: that.$route.name,
        permissionVo: { router: this.$route.name, resourceId: btn.id }
      }
      this.$api['formGenerator.modifyContractStatus'](params).then((res) => {
        if (res) {
          this.$message({
            type: 'success',
            message: '操作成功!'
          })
          if (this.tableType == 0) {
            this.$refs.table.searchData()
            this.$refs.table.clearSelection()
          } else {
            this.$refs.xTable.searchData()
          }
        } else {
          this.$message({
            type: 'error',
            message: '操作失败!'
          })
        }
      })
    },
    // 加锁解锁
    editPlanExecuteStatus (row, btn) {
      const rowBtnData = this.getRowBtnData(row, btn)
      row = rowBtnData.row
      btn = rowBtnData.btn
      if (!row) {
        return
      }
      const rowIds = row.map((el) => {
        return el.ID
      })
      const that = this
      let createFormParams = {}
      if (btn && btn.eventParams) {
        createFormParams = eval('(' + btn.eventParams + ')')
        this.permissionVo.resourceId = btn.id
        createFormParams.permissionVo = { router: this.$route.name, resourceId: btn.id }
        if (createFormParams.code) {
          createFormParams = { desformCode: createFormParams.code }
        }
      } else {
        console.log('该请求缺失参数{desformCode:""}')
      }
      const params = {
        ...createFormParams.customJson,
        desformCode: createFormParams.desformCode,
        dataIds: rowIds,
        router: that.$route.name,
        permissionVo: { router: this.$route.name, resourceId: btn.id }
      }
      this.$api['formGenerator.editPlanExecuteStatus'](params).then((res) => {
        if (res) {
          this.$message({
            type: 'success',
            message: '操作成功!'
          })
          if (this.tableType == 0) {
            this.$refs.table.searchData()
            this.$refs.table.clearSelection()
          } else {
            this.$refs.xTable.searchData()
          }
        } else {
          this.$message({
            type: 'error',
            message: '操作失败!'
          })
        }
      })
    },
    // 导出word
    exportWord (row, btn) {
      // console.log(row, btn)
      this.$api['formGenerator.exportWord'](row)
        .then((res) => {
          const link = document.createElement('a')
          link.href = window.URL.createObjectURL(new Blob([res.data], { type: 'application/word' }))
          link.download = '周例会.doc'
          document.body.appendChild(link)
          link.click()
          window.URL.revokeObjectURL(link.href)
          document.body.removeChild(link)
        })
        .catch((err) => {
          console.log(err)
        })
    },
    thirdMenuClick (record, item) {
      this.defaultMenu = item
      this.thirdMenuTitle = '计划详情'
      this.thirdMenuParam = { ...record }
      this.visibleThirdDrawer = true
    },
    onThirdMenuClose () {
      this.$router.push({ path: this.currentRouterPath })
      this.visibleThirdDrawer = false
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
