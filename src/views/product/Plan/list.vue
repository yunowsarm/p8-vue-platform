<template>
  <normal-layout :header-visible="false"
                 :normal-layout="layout"
                 :split-layout="true">
    <template #west>
      <common-tree v-if="!isMobile"
                   :default-expanded-keys="defaultExpandedKeys"
                   :default-expand-all="false"
                   node-key="ID"
                   :data="treeData"
                   :tree-config="treeConfig"
                   ref="commonTree"
                   @select="onSelect"></common-tree>
    </template>
    <template #center>
      <div v-if="isMobile">
        <div style="padding: 10px; background: #ffffff">
          <span>筛选：</span>
          <tree-select :data="treeData"
                       v-model='treeValue'
                       @change="changeTree"></tree-select>
        </div>
      </div>
      <P8TableRender :key='tableKey'
                     ref="tableRender"
                     class="planLayout"
                     :tableRefresh="tableRefresh"
                     :code="componentsConfig.code"
                     :permission-vo="componentsConfig.permissionVo"
                     :west-tree-param="provideParams.searchParams"
                     @refresh="init()"
                     @refresh-data="refreshTable">
        <template #status="{ scope }">
          <el-tooltip effect="dark"
                      :content="getIconTitle(scope.row)"
                      :disabled="toolbarTextDisplay === '1'"
                      placement="top">
            <span v-html="getIcon(scope.row)"></span>
          </el-tooltip>
        </template>
        <template #planName="{ scope }">
          <div v-if="scope.row.WHOLEDESCRIBEID"
               class="underline"
               @click="thirdMenuClick(scope.row)">{{ scope.row.NAME }}</div>
          <div v-else>{{ scope.row.NAME }}</div>
        </template>
      </P8TableRender>
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

.planLayout {
  height: 100%;
  // ::v-deep .normal-main{
  //   height: calc(100% - 30px);
  // }
}

::v-deep .icon-zuozhedie {
  z-index: 1 !important;
}
@media screen and (max-width: 1440px) {
  .planLayout {
    height: calc(100% - 50px) !important;
    ::v-deep .normal-header{
      padding: 10px 8px 0 0;
    }
    ::v-deep .mobileButton {
      white-space: nowrap;
      overflow: auto;
      .el-button--small{
        padding: 5px 7px;
        margin-right: 3px;
      }
    }
  }
}
</style>
<script>
import { Input, Button } from 'element-ui'
import {
  P8NormalLayoutV1 as NormalLayout, P8Tree as CommonTree, P8Dialog as CommonDialog, P8Table as CommonTable, P8Button as CommonButton,
  P8TreeSelect as TreeSelect
} from 'p8-components-ui'
import { selectGenerateTree } from '@/utils/common.js'

export default {
  name: 'ProcessManagement',
  computed: {
    isMobile () {
      return this.$store.getters.isMobile
    },
    componentUrl () {
      if (this.asyncComponents) {
        if (this.asyncComponents.indexOf('?') !== -1) {
          const list = this.asyncComponents.split('?')
          const url = list[0]
          const parmars = list[1].split('&')
          const obj = {}
          parmars.forEach((item) => {
            const str = item.split('=')
            if (str[0] === 'code') {
              obj.code = str[1]
            }
          })
          this.componentsConfig = obj
          return () => import('@/views/' + url + '.vue')
        } else {
          return () => import(`@/views/${this.asyncComponents}.vue`)
        }
      } else {
        return ''
      }
    }
  },
  provide () {
    return {
      provideParams: this.provideParams
    }
  },
  data () {
    return {
      layout: {
        west: {
          xs: 11,
          sm: 10,
          md: 10,
          lg: 9,
          xl: 9
        },
        center: {
          xs: 13,
          sm: 14,
          md: 14,
          lg: 15,
          xl: 15
        }
      },
      treeValue:'',
      tableKey: Date.now(),
      dialogHeight: document.documentElement.clientHeight * 0.6,
      queryParam: {},
      treeData: [],
      asyncComponents: '',
      defaultExpandedKeys: [],
      paramsObj: {},
      provideParams: {
        searchParams: {}
      },
      componentsConfig: {},
      treeConfig: {
        'current-node-key': ''
      },
      toolbarTextDisplay: this.$store.getters.baseConfig.toolbarTextDisplay
    }
  },
  props: {
    layoutConfig: {
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
    TreeSelect
  },
  created () {
    if (this.isMobile) {
      this.layout = {
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
    this.init()
    this.getIconData()
  },
  // watch: {
  //   $route: {
  //     handler (val) {
  //       this.init()
  //     }
  //   }
  // },
  methods: {
    getTableSetting () {
      let tableSettingaAll = this.$store.state.user.userSettingAll.Table ? this.$store.state.user.userSettingAll.Table : null
      if (tableSettingaAll) {
        let keyNew = this.$route.path + '.' + 'formGenerator.tableApply' + '.' + this.componentsConfig.code
        let key = this.$route.path + '.' + 'formGenerator.tableApply'
        // 需要兼容旧数据
        let currTableSetting = tableSettingaAll.filter((item) => item.key === keyNew)
        if (!(currTableSetting && currTableSetting.length)) {
          currTableSetting = tableSettingaAll.filter((item) => item.key === key)
        }
        if (currTableSetting && currTableSetting.length) {
          let columnsSetting = currTableSetting[0].value.columns
          const toolbarTextDisplayIndex = columnsSetting.findIndex((item) => 'toolbarTextDisplay' in item)
          if (toolbarTextDisplayIndex > -1 && columnsSetting[toolbarTextDisplayIndex].toolbarTextDisplay) {
            this.toolbarTextDisplay = columnsSetting[toolbarTextDisplayIndex].toolbarTextDisplay
          } else {
            this.toolbarTextDisplay = this.$store.getters.baseConfig.toolbarTextDisplay
          }
        }
      } else {
        this.toolbarTextDisplay = this.$store.getters.baseConfig.toolbarTextDisplay
      }
    },
    // 表格刷新
    tableRefresh () {
      this.$refs.tableRender.selectRecords = []
    },
    refreshTable () {
      this.getTableSetting()
    },
    async init () {
      // 使用完后清除，避免影响其他窗口
      sessionStorage.removeItem('stateInfo')
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
      this.treeValue = this.treeData[0].ID
      // defaultCheckeNode 0 根节点       1 第一个子节点
      if (treeSettingsParmars.defaultCheckeNode && treeSettingsParmars.defaultCheckeNode === '0') {
        this.treeConfig['current-node-key'] = this.treeData[0].ID
        this.$nextTick(() => {
          this.$refs.commonTree.$refs.tree.setCurrentKey(this.treeData[0].ID, true)
          // this.onSelect(this.treeData[0])
        })
      } else {
        this.handleNodeClick(this.treeData)
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
    changeTree(id,data){
      this.onSelect(data)
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
          item.children.forEach((el) => {
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

    getIconTitle (row) {
      let str = ''
      let el = this.manageStatus[row.MANAGESTATUS]
      if (row.MANAGESTATUS && el && el.icon) {
        str = el.meaning
      } else {
        let item = this.executeState[row.EXECUTESTATE]
        if (item && item.icon) {
          str = item.meaning
        }
      }
      return str
    },
    getIcon (row) {
      let str = ''
      let el = this.manageStatus[row.MANAGESTATUS]
      let toolbarTextDisplay = this.toolbarTextDisplay
      if (toolbarTextDisplay === '0') {
        toolbarTextDisplay = false
      } else {
        toolbarTextDisplay = true
      }
      if (row.MANAGESTATUS && el && el.icon) {
        if (toolbarTextDisplay) {
          let color = JSON.parse(JSON.stringify(el.color))
          let arr = color.match(/[\d.]+/g).map(Number)
          let bgColor = arr.slice(0, -1).concat(0.2).toString()
          str = `<div style='display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 4px; background: rgba(${bgColor});width: -webkit-fill-available;justify-content: center;'>
            <span style='color: ${el.color}; font-weight: 500;'>${el.meaning}</span>
          </div>`
        } else {
          str = `<i class='${el.icon}' style='color: ${el.color};'></i>`
        }
      } else {
        let item = this.executeState[row.EXECUTESTATE]
        if (item && item.icon) {
          if (toolbarTextDisplay) {
            let color = JSON.parse(JSON.stringify(item.color))
            let arr = color.match(/[\d.]+/g).map(Number)
            let bgColor = arr.slice(0, -1).concat(0.2).toString()
            str = `<div style='display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 4px; background: rgba(${bgColor});width: -webkit-fill-available;justify-content: center;'>
            <span style='color: ${item.color}; font-weight: 500;'>${item.meaning}</span>
          </div>`
          } else {
            str = `<i class='${item.icon}' style='color: ${item.color};'></i>`
          }
        }
      }
      return str
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
        thirdMenu.children.forEach((el) => {
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
      manageStatus.forEach((el) => {
        this.manageStatus[el.id] = { icon: el.icon, color: el.color, meaning: el.meaning }
      })
      executeState.forEach((el) => {
        this.executeState[el.id] = { icon: el.icon, color: el.color, meaning: el.meaning }
      })
    }
  }
}
</script>
