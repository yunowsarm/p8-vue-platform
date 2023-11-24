<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <common-dialog title="预览"
                 :visible="visible"
                 :show-handle-btn="false"
                 :dialog-height="dialogHeight"
                 @handle-cancel="handleCancel"
                 @close="handleCancel">
    <template #dialog>
      <normal-layout :header-visible="false"
                     class="layoutComponents"
                     :split-layout="true">
        <template #west>
          <common-tree ref="commonTree"
                       :default-expanded-keys="defaultExpandedKeys"
                       :default-expand-all="false"
                       :data="treeData"
                       @select="onSelect"></common-tree>
        </template>
        <template #center>
          <!-- <component :is="componentUrl" :code="code"></component> -->
          <component :is="componentUrl"
                     :code="componentsConfig.code"
                     :data-view-id="componentsConfig.dataViewId"
                     :record="{ desformCode: componentsConfig.codeForm }"
                     :permission-vo="componentsConfig.permissionVo"
                     :layout-config="componentsConfig"
                     :kanban-config="componentsConfig"
                     :isLayoutButton="true"
                     ref="components"></component>
        </template>
      </normal-layout>
    </template>
  </common-dialog>
</template>
<style lang="scss" scoped>
.layoutComponents ::v-deep .el-tree-node__content .is-leaf{
  display: inline-block !important;
  width: 25px;
}
</style>
<script>
import { Input, Button } from 'element-ui'
import { P8NormalLayoutV1 as NormalLayout, P8Tree as CommonTree, P8Dialog as CommonDialog, P8Table as CommonTable } from 'p8-components-ui'
import { selectGenerateTree } from './general'
export default {
  name: 'ButtonNavigationPreview',
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false
    },
    previewParmars: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  provide () {
    return {
      provideParams: this.provideParams
    }
  },
  computed: {
    componentUrl () {
      console.log(this.asyncComponents, '===this.asyncComponents')
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
  data () {
    return {
      dialogHeight: document.documentElement.clientHeight * 0.6,
      queryParam: {},
      treeData: [],
      asyncComponents: '',
      code: '',
      defaultExpandedKeys: [],
      provideParams: {
        searchParams: {}
      },
      componentsConfig: {}
    }
  },
  components: {
    'el-input': Input,
    'el-button': Button,
    NormalLayout,
    CommonTree,
    CommonDialog,
    CommonTable
  },
  created () {
    this.init()
  },
  methods: {
    async init () {
      const { treeSettingsParmars, treeData, defaultComponents } = this.previewParmars
      this.componentsConfig = defaultComponents
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
        let that = this
        let resault = this.getFirstChild(this.treeData)
        console.log(resault, '---resault')
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
        let paramsObj = {}
        let paramsFilterList = this.getParams(obj)
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
        let otherParmarsMap = {}
        if (obj.otherParmarsMap) {
          otherParmarsMap = JSON.parse(obj.otherParmarsMap)
        }
        this.provideParams.searchParams = { ...paramsObj, ...otherParmarsMap }
      } else {
        // 动态数据
        let paramsObj = {}
        let prmarsList = dynamicParameter.filter((el) => {
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
          this.asyncComponents = obj[key]
        } else {
          this.asyncComponents = this.previewParmars.defaultComponents.url
        }
      }
    },
    getParamsList (obj,fileName) {
      let list = []
      function getEndList (item){
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
      let res = await this.$api['desLayout.execute']({ id: treeSettingsParmars.reportSqlId })
      let config = { labelCol: treeSettingsParmars.optionLabelCol, valueCol: treeSettingsParmars.optionValueCol, pidCol: treeSettingsParmars.optionPidCol }
      // 获取动态数据的参数映射所有列
      let treeArr = selectGenerateTree(res, JSON.stringify(config))
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
      let arr = []
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
    }
  }
}
</script>
