<template>
  <normal-layout :header-visible="false"
                 :split-layout="true">
    <template #west>
      <common-tree :default-expanded-keys="defaultExpandedKeys"
                   :default-expand-all="false"
                   :data="treeData"
                   ref="commonTree"
                   @select="onSelect"></common-tree>
    </template>
    <template #center>
      <table-render ref="tableRender"
                    :key="dateTime"
                    :code="componentsConfig.code"
                    :permission-vo="componentsConfig.permissionVo"
                    :west-tree-param="provideParams.searchParams"
                    @refresh="init()">
        <template #NAME="{ scope, thirdMenuData }">
          <span v-if="scope.row.DATATYPE === 'task'"
                class="underline"
                @click="drillCol(scope, thirdMenuData)">{{ scope.row.NAME }} </span>
          <span v-else>{{ scope.row.NAME }}</span>
        </template>
        <template #PROGRESS="{scope}">
          <span v-if="scope.row.DATATYPE === 'task'">{{scope.row.PROGRESS * 100}}%</span>
        </template>
        <template #INDEXNO="{scope}">
          <span v-if="scope.row.DATATYPE === 'task'">{{scope.row.INDEXNO}}</span>
          <span v-else
                style="display: -webkit-inline-box;">{{scope.row.INDEXNO}}</span>
        </template>
        <template #DAYSREMAINING="{scope}">
          <div v-html="overdueTextFun(scope.row)"></div>
        </template>
        <template #PREDECESSORSNUMBER="{scope}">
          <span class="underline"
                @click="frontToBackClick('前置任务查看', scope)">{{scope.row.PREDECESSORSNUMBER}}</span>
        </template>
        <template #POSTTASKNUMBER="{scope}">
          <span class="underline"
                @click="frontToBackClick('后置任务查看', scope)">{{scope.row.POSTTASKNUMBER}}</span>
        </template>
      </table-render>
    </template>
    <template #drawer-panel>
      <common-drawer size="100%"
                     v-if="visible"
                     :visible="visible"
                     direction="ttb"
                     :projectLevel="projectLevel"
                     :drawerConfig="menuDrawerConfig">
        <template #drawer>
          <i class="el-icon-chat-dot-square iconClass"
             @click="open"></i>
          <menu-layout :third-menu-param="thirdMenuParam"
                       :default-menu="defaultMenu"></menu-layout>
        </template>
      </common-drawer>
      <common-drawer title="查看流程图"
                     :visible="visibleModelPicture"
                     :show-handle-btn="false"
                     size="50%"
                     @close="onModelPictureClose">
        <template #drawer>
          <process-approval-view v-inherited-father-height
                                 :isSmartForm="true"
                                 :business-obj="{
              businessId: modelId,
              processDefinitionKey: processDefinationTwoKey
            }">
          </process-approval-view>
        </template>
      </common-drawer>
      <front-to-back v-if="visibleFrontToBack"
                     :title="title"
                     :columnType="columnType"
                     :taskId="taskId"
                     :visible="visibleFrontToBack"
                     @close='close'></front-to-back>
    </template>
  </normal-layout>
</template>
<style lang="scss" scoped>
.normal-layout {
  padding: 0;
}
.span-bg {
  width: 100%;
  height: 85%;
  display: block;
  margin: 0 auto;
  background-size: 300px;
  background-position: center;
  margin-top: 25px;
}
.base-custom-style-task {
  color: $base-white-color;
  font-size: 12px;
  border-radius: 10px;
  display: inline-block;
  width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  cursor: pointer;
  &.approve {
    background-color: $base-red-color;
    margin-left: 0px;
  }
  &.approves {
    background-color: $base-red-color;
  }
  &.leaf {
    background-color: $base-green-color;
  }
  &.canApprove {
    background-color: $base-green-color;
    margin-left: -15px;
  }
}
.icon-style {
  margin-left: -15px;
}
.iconClass {
  font-size: 20px;
  position: absolute;
  top: 15px;
  right: 50px;
  z-index: 9999;
}
</style>
<script>
import { Input, Button } from 'element-ui'
import { P8MenuLayout as MenuLayout, P8ProcessApproval as ProcessApprovalView, P8Drawer as CommonDrawer, P8NormalLayoutV1 as NormalLayout, P8Tree as CommonTree, P8Dialog as CommonDialog, P8Table as CommonTable, P8Button as CommonButton } from 'p8-components-ui'
import { selectGenerateTree } from '@/views/Framework/ComponentsMananger/Layout/Components/ButtonNavigation/V1.0/edit/Components/general.js'
import tableRender from '@/views/Framework/ComponentsMananger/Grid/Components/tableRender.vue'
import { overdueTextHandles } from '@/utils/common'
import frontToBack from './frontToBack'
export default {
  name: 'ButtonNavigationView',
  provide () {
    return {
      provideParams: this.provideParams
    }
  },
  data () {
    return {
      dateTime: null,
      dialogHeight: document.documentElement.clientHeight * 0.6,
      queryParam: {},
      treeData: [],
      asyncComponents: '',
      defaultExpandedKeys: [],
      paramsObj: {},
      provideParams: {
        searchParams: this.westTreeParam
      },
      componentsConfig: {},
      visible: false,
      thirdMenuParam: {},
      defaultMenu: {},
      menuDrawerConfig: {
        modal: false,
        withHeader: false,
        beforeClose: this.handleMenuBeforClose
      },
      currentRouterPath: {},
      projectLevel: null,
      visibleModelPicture: false,
      processDefinationTwoKey: 'taskFinishApprove',
      modelId: '',
      visibleFrontToBack: false,
      title: '',
      columnType: '',
      taskId: ''
    }
  },
  props: {
    layoutConfig: {
      type: Object,
      default: () => {
        return {}
      }
    },
    westTreeParam: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  components: {
    'el-input': Input,
    'el-button': Button,
    NormalLayout,
    CommonTree,
    CommonDialog,
    CommonTable,
    CommonButton,
    tableRender,
    CommonDrawer,
    ProcessApprovalView,
    MenuLayout,
    frontToBack
  },
  created () {
    this.init()
    this.getIconData()
    console.log(this.$route.path, '================this.$route.path');
    this.currentRouterPath = this.$route.path
  },
  watch: {
    $route: {
      handler (val) {
        this.init()
      }
    }
  },
  methods: {
    open () {
      this.$set(this.thirdMenuParam, 'isVisibleCommunicationDrawer', false)
      this.$set(this.thirdMenuParam, 'isVisibleCommunicationDrawer', true)
    },
    frontToBackClick (val, scope) {
      this.title = val
      this.columnType = scope.column.property
      this.taskId = scope.row.TASKID
      this.visibleFrontToBack = true
    },
    close () {
      this.visibleFrontToBack = false
    },
    viewTaskApprove (rowInfo) {
      this.modelId = rowInfo.ID
      this.visibleModelPicture = true
    },
    onModelPictureClose () {
      this.visibleModelPicture = false
    },
    withdrawTaskApprove (rowInfo) {
      let taskId = rowInfo.TASKID
      const url = 'taskManager.withdrawTaskApprove'
      const _this = this
      _this.$confirm('是否要撤回审批', '提示', {
        confirmButtonText: '撤回',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        _this.$api[url]({ businessId: taskId, businessKey: 'taskFinishApprove' }).then(res => {
          _this.$message({
            type: 'success',
            message: '审批已撤回'
          })
          // 注释之后页面撤回审批后才可刷新
          // Vue.nextTick(function () {
          _this.dateTime = new Date().getTime()
          // })
        })
      })
    },
    async handleMenuBeforClose (done) {
      this.$router.push({ path: this.currentRouterPath })
      this.visible = false
      this.dateTime = new Date().getTime()
      // this.$refs.tableRender.search()
    },
    // 点击项目/计划列钻取进入三级菜单-计划编制页面
    drillCol (scope, thirdMenuData) {
      this.getPlanDataTaskId = scope.row.ID
      this.getPlanDataPinfoId = scope.row.PLANINFOID
      // if (thirdMenuData.length) {
      //   let planManager = thirdMenuData.filter(o => o.name === 'TaskExecution')
      this.openThirdMenu(scope.row)
      // }
    },
    openThirdMenu (record, item) {
      window.STATUS_KEY = record.MANAGERSTATUS
      // this.defaultMenu = item
      this.thirdMenuParam = {
        ...record,
        progress: Math.round(record.PROGRESS * 100),
        taskId: record.TASKID,
        // secretGrade: record.SECRETGRADE,
        planInfoId: record.PLANINFOID,
        wholeDescribeId: record.WHOLEDESCRIBEID,
        planInfoStatus: record.EXECUTESTATE,
        currentRoute: this.$route.path,
        createPage: 'decompose',
        currentPage: 'normal',
        getProjectLevel: record.LEVEL
      }
      this.projectLevel = record.LEVEL
      this.visible = true
    },
    // 超期/剩余天数调用公共方法
    overdueTextFun (row) {
      return overdueTextHandles(row)
    },
    async init () {
      const code = this.layoutConfig.layoutCode ? this.layoutConfig.layoutCode : this.$route.meta.code
      const version = this.layoutConfig.layoutVersion ? this.layoutConfig.layoutVersion : this.$route.meta.version
      const res = await this.$api['desLayout.getLayoutJson']({ layoutCode: code, version: version })
      if (!res) {
        return
      }
      this.previewParmars = JSON.parse(res)
      const { treeSettingsParmars, treeData, defaultComponents } = this.previewParmars
      // 获取tree数据
      if (treeSettingsParmars && treeSettingsParmars.dataType === '1') {
        // 是否显示根节点
        this.treeData = treeSettingsParmars.isShow === '1' ? treeData : treeData[0].children
      } else {
        this.treeData = await this.getTreeData(treeSettingsParmars)
      }
      // 默认展开层级
      if (treeSettingsParmars.expendTier !== '0') {
        this.defaultExpandedKeys = this.getDefaultExpandedKeys(treeSettingsParmars.expendTier, this.treeData)
      } else {
        this.defaultExpandedKeys = this.getDefaultExpandedKeys(NaN, this.treeData)
      }
      this.asyncComponents = defaultComponents.url ? defaultComponents.url : ''
      if (!this.asyncComponents) {
        const that = this
        const resault = this.getFirstChild(this.treeData)
        this.$nextTick(() => {
          that.$refs.commonTree.$refs.tree.setCurrentKey(resault.id, true)
          if (resault.componentsConfig) {
            that.componentsConfig = resault.componentsConfig
            that.asyncComponents = resault.componentsConfig.url
          }
        })
      } else {
        this.asyncComponents = defaultComponents.url ? defaultComponents.url : ''
        this.componentsConfig = defaultComponents
      }
    },
    getFirstChild (data) {
      let result = ''
      function filterData (treeData) {
        if (treeData[0].children && treeData[0].children.length) {
          filterData(treeData[0].children)
        } else {
          result = treeData[0]
        }
      }
      filterData(data)
      return result
    },
    handleCancel () {
      this.$emit('close')
    },
    onSelect (obj) {
      if (obj.id == '0') {
        return
      }
      const { treeSettingsParmars, dynamicParameter } = this.previewParmars
      // 数据类型为静态数据
      if (treeSettingsParmars.dataType === '1') {
        // let paramsList = this.getParams(obj)
        const paramsObj = {}
        const paramsFilterList = this.getParams(obj)
        let paramsList = []
        if (paramsFilterList && paramsFilterList.length) {
          paramsList = paramsFilterList.filter((el) => {
            return el.after !== ''
          })
        }
        if (paramsList && paramsList.length > 0) {
          paramsList.forEach((el) => {
            paramsObj[el.after] = obj[el.before]
          })
        }
        const otherParmarsMap = obj.otherParmarsMap ? JSON.parse(obj.otherParmarsMap) : ''
        this.provideParams.searchParams = { ...paramsObj, ...otherParmarsMap }
      } else {
        // 动态数据
        const paramsObj = {}
        const prmarsList = dynamicParameter.filter((el) => {
          return el.after !== ''
        })
        if (prmarsList && prmarsList.length > 0) {
          prmarsList.forEach((el) => {
            paramsObj[el.after] = this.getParamsList(obj, el.before)
          })
        }
        this.provideParams.searchParams = paramsObj
      }
      // 组件切换
      if (treeSettingsParmars.navigationPattern === '0') {
        let key
        // 数据类型为静态数据时组件路径字段为componentsUrl
        if (treeSettingsParmars.dataType === '1') {
          if (obj.componentsType === '1') {
            obj.componentsUrl = obj.componentsConfig.url
            this.componentsConfig = obj.componentsConfig
          }
          key = 'componentsUrl'
        } else {
          // 数据类型为动态态数据
          key = treeSettingsParmars.optionUrl
        }
        if (obj[key]) {
          if (!obj[key]) {
            return
          }
          this.asyncComponents = obj[key]
        }
      }
    },
    getParamsList (obj, fileName) {
      let list = []
      function getEndList (item) {
        list.push(item[fileName])
        if (item.children && item.children.length) {
          item.children.forEach(el => {
            getEndList(el)
          })
        }
      }
      getEndList(obj)
      return list
    },
    getParams (node) {
      const { parentId, parmarsMap } = node
      let arr = []
      if (parmarsMap) return parmarsMap
      const filterData = (parId, data) => {
        data.map((val) => {
          if (val.id == parId) {
            if (val.parmarsMap) {
              arr = val.parmarsMap
            } else {
              filterData(val.parentId, this.treeData)
            }
          } else {
            if (val.children && val.children.length > 0) {
              filterData(parId, val.children)
            }
          }
        })
      }
      if (parentId) {
        filterData(parentId, this.treeData)
      } else {
        return []
      }
      return arr
    },
    async getTreeData (treeSettingsParmars) {
      let data
      const res = await this.$api['desLayout.execute']({ id: treeSettingsParmars.reportSqlId })
      const config = { labelCol: treeSettingsParmars.optionLabelCol, valueCol: treeSettingsParmars.optionValueCol, pidCol: treeSettingsParmars.optionPidCol }
      // 获取动态数据的参数映射所有列
      const treeArr = selectGenerateTree(res, JSON.stringify(config))
      // 是否显示根节点 1为是
      if (treeSettingsParmars.isShow === '1') {
        data = [
          {
            id: '0',
            value: '0',
            label: treeSettingsParmars.compName,
            parentId: '',
            parentName: '',
            componentsUrl: '',
            componentsType: '',
            otherParmars: '',
            parmarsMap: [
              { before: 'ID', after: '' },
              { before: 'NODE_NAME', after: '' }
            ],
            children: treeArr
          }
        ]
      } else {
        data = treeArr
      }

      return data
    },
    // 获取默认展开数据key
    getDefaultExpandedKeys (level, treeList) {
      const arr = []
      let count = 0
      function getData (data) {
        count++
        if (count > level) {
          return
        }
        data.forEach((el) => {
          arr.push(el.id)
          if (el.children && el.children.length > 0) {
            getData(el.children)
          }
        })
      }
      getData(treeList)
      return arr
    },
    thirdMenuClick (record) {
      let item = {}
      const currentPath = this.$route.path
      const rootRouter = this.$store.state.routers.addRouters
      let thirdMenu = []
      if (rootRouter && rootRouter.length > 0) {
        rootRouter.map(function (item, index) {
          if (item.children && item.children.length > 0) {
            item.children.map(function (subItem, idx) {
              if (subItem.path === currentPath) {
                thirdMenu = subItem
              }
            })
          }
        })
      }
      if (thirdMenu.children) {
        thirdMenu.children.forEach(el => {
          if (el.meta.title == '计划编制') {
            item = el
          }
        })
      }
      this.$refs.tableRender.thirdMenuClick(record, item)
    },
    async getIconData () {
      // 管理状态
      let manageStatus = await this.$api['dictionaryManagement.list']({ dicType: 'PLAN_MANAGE_STATUS' })
      // 执行状态
      let executeState = await this.$api['dictionaryManagement.list']({ dicType: 'EXECUTE_STATE' })
      this.manageStatus = {}
      this.executeState = {}
      manageStatus.forEach(el => {
        this.manageStatus[el.id] = { icon: el.icon, color: el.color, meaning: el.meaning }
      })
      executeState.forEach(el => {
        this.executeState[el.id] = { icon: el.icon, color: el.color, meaning: el.meaning }
      })
    },
  }
}
</script>
