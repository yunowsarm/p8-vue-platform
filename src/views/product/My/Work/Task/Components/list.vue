<template>
  <normal-layout :header-visible="false"
                 :split-layout="true">
    <template #west>
      <common-tree :default-expanded-keys="defaultExpandedKeys"
                   :default-expand-all="false"
                   :init-emit-select="false"
                   node-key="ID"
                   :data="treeData"
                   :tree-config='treeConfig'
                   ref="commonTree"
                   @select="onSelect"></common-tree>
    </template>
    <template #center>
      <div class="show-type"><span style="font-weight: bold;font-size: 15px;">展示方式
          <el-tooltip effect="dark"
                      popper-class="testtooltip"
                      placement="top">
            <div slot="content">
              <p>父子结构：与当前父子集展示逻辑一致</p>
              <p>计划分组：与当前默认展示逻辑一致</p>
              <p>列表：平铺计划，默认排除已完成的任务</p>
            </div>
            <i class="p8 icon-help-tips"></i>
          </el-tooltip>
          ：</span>
        <el-radio-group v-model="showView"
                        @input="showViewChange">
          <el-radio label="showView001">父子结构</el-radio>
          <el-radio label="showView002">计划分组</el-radio>
          <el-radio label="showView003">列表</el-radio>
        </el-radio-group>
        <span style="margin-left: 30px;font-weight: bold;font-size: 15px;">仅展示叶子节点：</span>
        <el-switch v-model="isChildren"
                   active-color="#13ce66"
                   inactive-color="#ff4949"
                   :disabled="btnDisable"
                   @change="childrenClick">
        </el-switch>
      </div>
      <P8TableRender ref="tableRender"
                     :key="dateTime"
                     :code="componentsConfig.code"
                     :permission-vo="componentsConfig.permissionVo"
                     :west-tree-param="provideParams.searchParams"
                     :reportParam="sqlParam"
                     @refresh="init()">
        <template #NAME="{ scope, thirdMenuData }">
          <span v-if="scope.row.USERID === userId"
                class="underline"
                @click="drillCol(scope, thirdMenuData)">{{ scope.row.NAME }} </span>
          <span v-else>{{ scope.row.NAME }}</span>
        </template>
        <template v-if='!isFromDashboard'
                  #MENU="{ scope }">
          <div v-if="scope.row.USERID === userId">
            <el-dropdown :hide-on-click="false">
              <span class="el-dropdown-link">
                <i class="el-icon-menu"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="(item, index) in thirdMenuData"
                                  :key="index">
                  <div @click="menuClickEvent(scope.row, item)">
                    <i :class="item.meta.icon ? item.meta.icon : 'el-icon-setting'"
                       style="font-size:12px;"></i> {{ item.meta.title }}
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </template>
        <template #PROGRESS="{scope}">
          <span v-if="scope.row.DATATYPE === 'task'">{{ getProgress(scope.row.PROGRESS) }}</span>
        </template>
        <template #INDEXNO="{scope}">
          <span v-if="scope.row.DATATYPE === 'task'">{{ scope.row.INDEXNO }}</span>
          <span v-else
                style="display: -webkit-inline-box;">{{ scope.row.INDEXNO }}</span>
        </template>
        <template #DAYSREMAINING="{scope}">
          <div v-html="overdueTextFun(scope.row)"></div>
        </template>
        <template #PREDECESSORSNUMBER="{scope}">
          <span class="underline"
                @click="frontToBackClick('前置任务查看', scope)">{{ scope.row.PREDECESSORSNUMBER }}</span>
        </template>
        <template #POSTTASKNUMBER="{scope}">
          <span class="underline"
                @click="frontToBackClick('后置任务查看', scope)">{{ scope.row.POSTTASKNUMBER }}</span>
        </template>
      </P8TableRender>
    </template>
    <template #drawer-panel>
      <common-drawer size="100%"
                     v-if="visible"
                     :visible="visible"
                     direction="ttb"
                     :projectLevel="projectLevel"
                     :drawerConfig="menuDrawerConfig">
        <template #drawer>
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
.show-type {
  position: absolute;
  top: 14px;
  z-index: 1;
  left: 20px;
}

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
import {
  P8MenuLayout as MenuLayout,
  P8ProcessApproval as ProcessApprovalView,
  P8Drawer as CommonDrawer,
  P8NormalLayoutV1 as NormalLayout,
  P8Tree as CommonTree,
  P8Dialog as CommonDialog,
  P8Table as CommonTable,
  P8Button as CommonButton
} from 'p8-components-ui'
import { calculateRemainingDays, selectGenerateTree } from '@/utils/common'
import frontToBack from './frontToBack'
import CommunicationMsg from '@/components/information/index.vue';
import { mapGetters } from 'vuex'

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
      provideParams: {},
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
      taskId: '',
      showView: 'showView003',
      isChildren: false,
      btnDisable: false,
      sqlParam: {},
      filterThirdMenu: "MyTask",
      treeConfig: {
        'current-node-key': ''
      },
      previousSelectedNode: null
    }
  },
  props: {
    isFromDashboard: {
      type: Boolean,
      default: false
    },
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
    },
    status: {
      type: Array,
      default: () => {
        return ['6050', '6020']
      }
    },
    tabsName: {
      type: String,
      default: ''
    },
    isThisMonthTask: {
      type: String,
      default: ''
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
    CommonDrawer,
    ProcessApprovalView,
    MenuLayout,
    frontToBack,
    CommunicationMsg
  },
  computed: {
    thirdMenuData () {
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
      let children = thirdMenu.children
      let tempChildren = []
      if (this.filterThirdMenu && children && children.length) {
        children.map(item => {
          if (this.filterThirdMenu.indexOf(item.name) === -1) {
            tempChildren.push(item)
          }
        })
      }
      return this.filterThirdMenu ? tempChildren : thirdMenu.children
    },
    ...mapGetters(['userId'])
  },
  created () {
    this.westTreeParam.showView = 'showView003'
    this.westTreeParam.isChildren = 'false'
    this.westTreeParam.status = this.status
    if (this.isFromDashboard) {
      this.westTreeParam.isThisMonthTask = '1'
    }
    if (this.isThisMonthTask) {
      this.westTreeParam.isThisMonthTask = this.isThisMonthTask
    }
    this.provideParams.searchParams = this.westTreeParam

    // 检查是否有stateInfo，优先处理stateInfo
    const stateInfo = sessionStorage.getItem('stateInfo')
    if (stateInfo) {
      const parsedInfo = JSON.parse(stateInfo)
      const isNewWindow = window.opener !== null // 判断是否是新窗口

      // 恢复布局配置
      if (parsedInfo.layoutConfig) {
        this.layoutConfig = parsedInfo.layoutConfig
      }

      // 恢复树状态
      if (parsedInfo.treeState) {
        this.showView = parsedInfo.treeState.showView
        this.isChildren = parsedInfo.treeState.isChildren
        this.westTreeParam = parsedInfo.treeState.westTreeParam
      }

      // 恢复任务信息并根据标记决定是否打开抽屉
      if (parsedInfo.taskInfo) {
        window.STATUS_KEY = parsedInfo.taskInfo.status
        this.thirdMenuParam = parsedInfo.taskInfo.thirdMenuParam
        this.projectLevel = parsedInfo.taskInfo.thirdMenuParam.getProjectLevel

        // 只有在新窗口时才打开抽屉
        if (isNewWindow) {
          this.$nextTick(() => {
            this.visible = true
          })
          // 使用完后清除，避免影响其他窗口
          sessionStorage.removeItem('stateInfo')
        }
      }
    }

    this.init()
    this.getIconData()
    this.currentRouterPath = this.$route.path
  },
  watch: {
    $route: {
      handler (val) {
        this.init()
      }
    }
  },
  mounted () {
    // this.$nextTick(() => {
    //     console.log(this.$refs.tableRender.$refs,'=====')
    // })
  },
  methods: {
    showViewChange (val) {
      let tableParam = this.$refs.tableRender.$refs.xTable.params.sqlParam
      let sqlParam = {
        isChildren: '',
        showView: '',
        tabsName: this.tabsName
      };
      for (let key in sqlParam) {
        if (tableParam[key] && tableParam[key].value !== undefined) {
          sqlParam[key] = tableParam[key].value;  // 将值赋给 sqlParam
        }
      }
      if (val !== 'showView001') {
        this.btnDisable = false
      } else {
        this.btnDisable = true
      }
      this.isChildren = false
      this.sqlParam.isChildren = 'false'
      this.sqlParam.showView = val
      this.sqlParam = { ...sqlParam, ...this.sqlParam }
      this.dateTime = new Date().getTime()
    },
    childrenClick (val) {
      let tableParam = this.$refs.tableRender.$refs.xTable.params.sqlParam
      let sqlParam = {
        isChildren: '',
        showView: '',
        tabsName: this.tabsName
      };
      for (let key in sqlParam) {
        if (tableParam[key] && tableParam[key].value !== undefined) {
          sqlParam[key] = tableParam[key].value;  // 将值赋给 sqlParam
        }
      }
      if (val) {
        this.sqlParam.isChildren = 'true'
      } else {
        this.sqlParam.isChildren = 'false'
      }
      this.sqlParam = { ...sqlParam, ...this.sqlParam }
      this.dateTime = new Date().getTime()
    },
    getProgress (val) {
      return Math.round(val * 100) + '%'
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
      // this.dateTime = new Date().getTime()
      this.$refs.tableRender.formCloseRefresh()
    },
    // 点击项目/计划列钻取进入三级菜单-计划编制页面
    drillCol (scope, thirdMenuData) {
      // 保存状态到 sessionStorage
      const stateInfo = {
        taskInfo: {
          taskId: scope.row.ID,
          planInfoId: scope.row.PLANINFOID,
          status: scope.row.MANAGERSTATUS,
          thirdMenuParam: {
            ...scope.row,
            progress: Number((scope.row.PROGRESS * 100).toFixed(0)),
            taskId: scope.row.TASKID,
            secretGrade: scope.row.SECRETGRADE,
            planInfoId: scope.row.PLANINFOID,
            wholeDescribeId: scope.row.WHOLEDESCRIBEID,
            planInfoStatus: scope.row.EXECUTESTATE,
            currentRoute: '/MyTask/MyTask/latest',
            createPage: 'decompose',
            currentPage: 'normal',
            getProjectLevel: scope.row.LEVEL
          }
        },
        layoutConfig: this.layoutConfig,
        routeMeta: this.$route.meta,
        treeState: {
          showView: this.showView,
          isChildren: this.isChildren,
          westTreeParam: this.westTreeParam
        }
      }

      if (this.$route.path !== '/MyTask/MyTask/latest') {
        // 如果是从其他页面打开新窗口，将状态存储到 sessionStorage
        sessionStorage.setItem('stateInfo', JSON.stringify(stateInfo))
        // 修改为哈希路由方式打开新窗口
        const baseUrl = window.location.origin + window.location.pathname
        const targetUrl = `${baseUrl}#/MyTask/MyTask/latest`
        window.open(targetUrl, '_blank')
      } else {
        // 如果已经在任务页面，直接更新状态并打开抽屉
        window.STATUS_KEY = stateInfo.taskInfo.status
        this.thirdMenuParam = stateInfo.taskInfo.thirdMenuParam
        this.projectLevel = stateInfo.taskInfo.thirdMenuParam.getProjectLevel
        this.visible = true
      }
    },

    created () {
      // 从 sessionStorage 恢复状态
      const stateInfo = sessionStorage.getItem('stateInfo')
      if (stateInfo) {
        const parsedInfo = JSON.parse(stateInfo)

        // 恢复布局配置
        if (parsedInfo.layoutConfig) {
          this.layoutConfig = parsedInfo.layoutConfig
        }

        // 恢复树状态
        if (parsedInfo.treeState) {
          this.showView = parsedInfo.treeState.showView
          this.isChildren = parsedInfo.treeState.isChildren
          this.westTreeParam = parsedInfo.treeState.westTreeParam
        }

        // 恢复任务信息
        if (parsedInfo.taskInfo) {
          window.STATUS_KEY = parsedInfo.taskInfo.status
          this.thirdMenuParam = parsedInfo.taskInfo.thirdMenuParam
          this.projectLevel = parsedInfo.taskInfo.thirdMenuParam.getProjectLevel
          this.visible = true
        }

        // 使用完后清除
        sessionStorage.removeItem('stateInfo')
      }

      // 原有的初始化逻辑
      this.westTreeParam.showView = 'showView003'
      this.westTreeParam.isChildren = 'false'
      this.westTreeParam.status = this.status
      this.provideParams.searchParams = this.westTreeParam
      this.init()
      this.getIconData()
      this.currentRouterPath = this.$route.path
    },
    // 超期/剩余天数调用公共方法
    overdueTextFun (row) {
      return calculateRemainingDays(row).text
    },
    async init () {
      const that = this
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
      // defaultCheckeNode 0 根节点       1 第一个子节点
      if (treeSettingsParmars.defaultCheckeNode && treeSettingsParmars.defaultCheckeNode === '0') {
        this.treeConfig['current-node-key'] = this.treeData[0].ID
        this.$nextTick(() => {
          this.$refs.commonTree.$refs.tree.setCurrentKey(this.treeData[0].ID, true)
          // this.onSelect(this.treeData[0])
        })
      } else {
        this.handleNodeClick(this.treeData);
      }
    },
     // 选中节点
    handleNodeClick (data) {
      if (data[0].children && data[0].children.length > 0) {
        this.handleNodeClick(data[0].children)
      } else {
        this.$nextTick(() => {
          this.$refs.commonTree.$refs.tree.setCurrentKey(data[0].ID)
          this.onSelect(data[0])

        })
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
      // 判断节点是否真的发生变化
      const currentNodeId = obj.id || obj.ID;
      const previousNodeId = this.previousSelectedNode?.id || this.previousSelectedNode?.ID;

      if (currentNodeId === previousNodeId) {
        return;
      }

      // 更新previousSelectedNode
      this.previousSelectedNode = obj;

      // 原有的onSelect逻辑
      if (obj.id ?? obj.ID == '0') {
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
        let sqlParam
        this.provideParams.searchParams = paramsObj
        if (this.$refs.tableRender.$refs.xTable && this.$refs.tableRender.$refs.xTable.params.sqlParam) {
          let tableParam = this.$refs.tableRender.$refs.xTable.params.sqlParam
          sqlParam = {
            isChildren: '',
            showView: '',
            tabsName: this.tabsName
          };
          for (let key in sqlParam) {
            if (tableParam[key] && tableParam[key].value !== undefined) {
              sqlParam[key] = tableParam[key].value;  // 将值赋给 sqlParam
            }
          }
        } else {
          sqlParam = {
            isChildren: false,
            showView: 'showView003',
            tabsName: this.tabsName
          };
        }
        this.sqlParam = { ...sqlParam, ...this.sqlParam }
        this.dateTime = new Date().getTime()
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
      this.provideParams.searchParams.status = this.status
      this.provideParams.searchParams.status = this.status
      if (this.isFromDashboard) {
        this.provideParams.searchParams.isThisMonthTask = '1'
      }
      if (this.isThisMonthTask) {
        this.provideParams.searchParams.isThisMonthTask = this.isThisMonthTask
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
      const config = {
        labelCol: treeSettingsParmars.optionLabelCol,
        valueCol: treeSettingsParmars.optionValueCol,
        pidCol: treeSettingsParmars.optionPidCol
      }
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
    menuClickEvent (record, item) {
      this.$refs.tableRender.thirdMenuClick(record, item)
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
