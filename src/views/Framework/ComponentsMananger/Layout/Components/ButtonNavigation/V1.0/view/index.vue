<template>
  <normal-layout :header-visible="false" :split-layout="true">
    <template #west>
      <common-tree :default-expanded-keys="defaultExpandedKeys" :default-expand-all="false" :data="treeData" ref="commonTree" @select="onSelect"></common-tree>
    </template>
    <template #center>
      <component
        v-if="componentUrl"
        :is="componentUrl"
        :code="componentsConfig.code"
        :data-view-id="componentsConfig.dataViewId"
        :record="{ desformCode: componentsConfig.codeForm }"
        :permission-vo="componentsConfig.permissionVo"
        :layout-config="componentsConfig"
        :kanban-config="componentsConfig"
        :west-tree-param="provideParams.searchParams"
        :isLayoutButton="true"
        @refresh="init()"
        ref="components"
      ></component>
      <span v-else class="span-bg"></span>
    </template>
  </normal-layout>
</template>
<style lang="scss" scoped>
.span-bg {
  width: 100%;
  height: 85%;
  display: block;
  margin: 0 auto;
  background: url(../../../../../../../../assets/image/common/table_bg.png) no-repeat;
  background-size: 300px;
  background-position: center;
  margin-top: 25px;
}
</style>
<script>
import { Input, Button } from 'element-ui'
import { P8NormalLayoutV1 as NormalLayout, P8Tree as CommonTree, P8Dialog as CommonDialog, P8Table as CommonTable, P8Button as CommonButton } from 'p8-components-ui'
import { selectGenerateTree } from '@/views/Framework/ComponentsMananger/Layout/Components/ButtonNavigation/V1.0/edit/Components/general.js'
export default {
  name: 'ButtonNavigationView',
  computed: {
    componentUrl() {
      console.log(this.asyncComponents, '===this.asyncComponents')
      if (this.asyncComponents) {
        return () => import(`@/views/${this.asyncComponents}.vue`)
      } else {
        return ''
      }
    }
  },
  provide() {
    return {
      provideParams: this.provideParams
    }
  },
  data() {
    return {
      dialogHeight: document.documentElement.clientHeight * 0.6,
      queryParam: {},
      treeData: [],
      asyncComponents: '',
      defaultExpandedKeys: [],
      paramsObj: {},
      provideParams: {
        searchParams: {}
      },
      componentsConfig: {}
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
    CommonButton
  },
  created() {
    this.init()
  },
  watch: {
    $route: {
      handler(val) {
        this.init()
      }
    }
  },
  methods: {
    async init() {
      const code = this.layoutConfig.layoutCode ? this.layoutConfig.layoutCode : this.$route.meta.code
      const version = this.layoutConfig.layoutVersion ? this.layoutConfig.layoutVersion : this.$route.meta.version
      const res = await this.$api['desLayout.getLayoutJson']({ layoutCode: code, version: version })
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
    getFirstChild(data) {
      let result = ''
      function filterData(treeData) {
        if (treeData[0].children && treeData[0].children.length) {
          filterData(treeData[0].children)
        } else {
          result = treeData[0]
        }
      }
      filterData(data)
      return result
    },
    handleCancel() {
      this.$emit('close')
    },
    onSelect(obj) {
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
            paramsObj[el.after] = obj[el.before]
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
    getParams(node) {
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
    async getTreeData(treeSettingsParmars) {
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
    getDefaultExpandedKeys(level, treeList) {
      const arr = []
      let count = 0
      function getData(data) {
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
    }
  }
}
</script>
