<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <normal-layout :split-layout="true"
                 class="layoutComponents"
                 :header-visible="false">
    <template #north> </template>
    <template #west>
      <common-tree ref="commonTree"
                   :node-slot="true"
                   :data="treeData"
                   :allow-drop="handlerAllowDrog"
                   :allow-drag="handlerAllowDrag"
                   @select="onSelect"
                   :draggable="treeSettingsParmars.dataType === '1'">
        <template #tree="{ node }">
          <div style="width: 100%">
            <div class="labelShow">
              <span>
                <i v-if="node.isLeaf"
                  :class="getIcon(node)"></i>
                <i v-else-if="!node.isLeaf && node.expanded"
                  :class="getIcon(node)"></i>
                <i v-else
                  :class="getIcon(node)"></i>
              </span>
              {{ node.label }}
            </div>
            <div class="iconOperation">
              <!-- dataType数据类型 0为动态数据  1为静态数据 -->
              <i class="el-icon-circle-plus"
                 v-if="treeSettingsParmars.dataType === '1'"
                 @click.stop="create(node.data)"></i>
              <i class="el-icon-edit"
                 v-if="treeSettingsParmars.dataType === '1' || node.data.id === '0'"
                 @click.stop="edit(node.data)"></i>
              <i class="el-icon-sort"
                 v-if="treeSettingsParmars.dataType === '1' || node.data.id === '0'"
                 @click.stop="paramsMapClick(node.data)"></i>
              <i class="el-icon-delete-solid"
                 v-if="node.data.id !== '0' && treeSettingsParmars.dataType === '1'"
                 @click.stop="deleteNode(node.data)"></i>
            </div>
          </div>
        </template>
      </common-tree>
    </template>
    <template #center>
      <div v-if="!asyncComponents"
           class="text">系统按钮区自动载入菜单权限设置</div>
      <el-button class="delectButton"
                 v-if="asyncComponents"
                 @click="settingsDelect"><i class="el-icon-delete"
           style="margin-right: 5px"></i>重置</el-button>
      <div v-if="!asyncComponents"
           id="table-contain"
           @click="centerClick">
        <div class="text centerText">点击设置默认组件</div>
      </div>
      <component v-else
                 :is="componentUrl"
                 :code="componentsConfig.code"
                 :data-view-id="componentsConfig.dataViewId"
                 :record="{ desformCode: componentsConfig.codeForm }"
                 :permission-vo="componentsConfig.permissionVo"
                 :layout-config="componentsConfig"
                 :kanban-config="componentsConfig"
                 :isLayoutButton="true"
                 ref="components"></component>
    </template>
    <template #drawer-panel>
      <select-components v-if="visibleEditDrawer"
                         :visible="visibleEditDrawer"
                         @close="visibleEditDrawer = false"
                         @handleOk="componentsHandleOk"></select-components>
      <tree-settings v-if="visibleTreeSettingsDrawer"
                     :visible="visibleTreeSettingsDrawer"
                     :tree-settings-parmars="treeSettingsParmars"
                     @close-modal="visibleTreeSettingsDrawer = false"
                     @handleOk="treeSettingsHandleOk"></tree-settings>
      <child-node-settings v-if="visibleChildNodeSettingsDrawer"
                           :visible="visibleChildNodeSettingsDrawer"
                           :child-node-parmars="ChildNodeParmars"
                           :tree-settings-parmars="treeSettingsParmars"
                           :child-node-settings-title="ChildNodeSettingsTitle"
                           @close-modal="visibleChildNodeSettingsDrawer = false"
                           @handleOk="ChildNodeSettingsHandleOk"></child-node-settings>
      <params-map v-if="visibleParamsDrawer"
                  :visible="visibleParamsDrawer"
                  :params-list="paramsList"
                  @close="visibleParamsDrawer = false"
                  @handleOk="ParamshandleOk"></params-map>
    </template>
  </normal-layout>
</template>
<style lang="scss" scoped>
::v-deep .normal-main .splitBtn {
  display: none;
}
#table-contain {
  position: relative;
}
.text {
  color: #e5e5e5;
  font-size: 22px;
  text-align: center;
  letter-spacing: 20px;
  font-weight: bold;
}
.centerText {
  width: 100%;
  height: 50px;
  position: absolute;
  left: 50%;
  top: 50%;
  font-size: 50px;
  transform: translate(-50%, -50%);
  letter-spacing: 30px;
}
.labelShow {
  display: inline-block;
  width: calc(100% - 91px);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.labelShow:hover {
  color: #0050b3;
  font-weight: bold;
}
.iconOperation {
  width: 90px;
  float: right;
}
.iconOperation i:hover {
  color: #0050b3;
}
::v-deep.commonTree .el-tree-node__content:hover {
  color: #000000;
  font-weight: unset;
}
::v-deep.commonTree.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
  color: #000000;
  .labelShow {
    color: #0050b3;
  }
}
.delectButton {
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 0px;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 200;
}
::v-deep .parser-container {
  height: 100%;
  .formContainer {
    height: 100% !important;
  }
}
.layoutComponents ::v-deep .el-tree-node__content .is-leaf{
  display: inline-block !important;
  width: 12px;
}
</style>
<script>
import { P8NormalLayoutV1 as NormalLayout, P8Button as CommonButton, P8Tree as CommonTree, P8Dialog as CommonDialog } from 'p8-components-ui'
import selectComponents from '@/views/Framework/ComponentsMananger/Components/selectComponents.vue'
import TreeSettings from './Components/TreeSettings'
import childNodeSettings from './Components/childNodeSettings'
import paramsMap from './Components/paramsMap'
import { selectGenerateTree } from './Components/general'
export default {
  name: 'ButtonNavigation',
  components: {
    NormalLayout,
    CommonButton,
    CommonTree,
    CommonDialog,
    selectComponents,
    TreeSettings,
    childNodeSettings,
    paramsMap
  },
  computed: {
    componentUrl () {
      if (this.asyncComponents) {
        return () => import(`@/views/${this.asyncComponents}.vue`)
      } else {
        return ''
      }
    }
  },
  props: {
    recordId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      // 设置组件动态路径
      asyncComponents: '',
      comp: this,
      drawerTitle: '',
      nodeId: '',
      visibleEditDrawer: false,
      visibleTreeSettingsDrawer: false,
      visibleChildNodeSettingsDrawer: false,
      visibleParamsDrawer: false,
      treeData: [
        {
          id: '0',
          label: '根节点名称',
          componentsUrl: '',
          componentsType: '',
          otherParmars: ''
          // parmarsMap: [{before: 'ID', after: ''},{before: 'NODE_NAME', after: ''}]
        }
      ],
      // 导航树设置参数
      treeSettingsParmars: {},
      // 子节点参数
      ChildNodeParmars: {},
      paramsList: [],
      componentsConfig: {},
      provideParams: {
        searchParams: {}
      }
    }
  },
  created () {
    if (this.recordId) {
      this.$api['desLayout.view']({ id: this.recordId }).then((res) => {
        const data = JSON.parse(res.layoutJson)
        this.treeSettingsParmars = data.treeSettingsParmars
        this.asyncComponents = data.defaultComponents.url
        this.dynamicParameter = data.dynamicParameter
        if (data.treeData) {
          this.treeData = data.treeData
        }
        this.componentsConfig = data.defaultComponents
        this.treeSettingsHandleOk(data.treeSettingsParmars)
      })
    }
  },
  methods: {
    centerClick () {
      this.drawerTitle = '组件选择'
      this.visibleEditDrawer = true
    },
    // 选择组件确定
    componentsHandleOk (selectLayout) {
      this.componentsConfig = selectLayout
      this.asyncComponents = selectLayout.url
      this.visibleEditDrawer = false
    },
    // 新建
    create (data) {
      this.visibleChildNodeSettingsDrawer = true
      this.ChildNodeParmars = data
      this.ChildNodeSettingsTitle = '新建子节点'
    },
    // 修改
    edit (nodeData) {
      // 是顶级节点
      if (nodeData.id === '0') {
        if (this.treeSettingsParmars) {
          this.treeSettingsParmars.compName = nodeData.label
        } else {
          this.treeSettingsParmars = { compName: nodeData.label }
        }
        this.visibleTreeSettingsDrawer = true
      } else {
        this.visibleChildNodeSettingsDrawer = true
        this.ChildNodeParmars = nodeData
        this.ChildNodeSettingsTitle = '修改当前节点'
      }
    },
    paramsMapClick (node) {
      const { treeSettingsParmars, dynamicParameter } = this
      let paramsList = this.paramsList
      // 是静态数据
      if (treeSettingsParmars && treeSettingsParmars.dataType === '1') {
        if (node.parmarsMap) {
          paramsList = node.parmarsMap
        } else {
          paramsList = [
            { before: 'id', after: '' },
            { before: 'label', after: '' }
          ]
        }
      } else {
        if (node.parmarsMap) {
          paramsList = node.parmarsMap
        } else {
          paramsList = dynamicParameter
        }
      }
      this.paramsList = paramsList
      this.nodeId = node.id
      this.visibleParamsDrawer = true
    },
    deleteNode (data) {
      this.$refs.commonTree.$refs.tree.remove(data.id)
    },
    treeSettingsHandleOk (data, isChange) {
      if (this.treeSettingsParmars) {
        if (data && data.dataType !== this.treeSettingsParmars.dataType && data.dataType === '1') {
          this.treeData = [
            {
              id: '0',
              label: this.treeSettingsParmars.compName,
              parentId: '',
              parentName: '',
              componentsUrl: '',
              componentsType: '',
              otherParmars: ''
            }
          ]
        }
        if (this.treeData && this.treeData.length > 0) {
          this.$set(this.treeData[0], 'label', data.compName)
        }
        this.visibleTreeSettingsDrawer = false
        this.treeSettingsParmars = data
        if (data && data.dataType === '0') {
          this.$api['desLayout.execute']({ id: data.reportSqlId }).then((res) => {
            const config = { labelCol: data.optionLabelCol, valueCol: data.optionValueCol, pidCol: data.optionPidCol }
            // 获取动态数据的参数映射所有列
            if (isChange) {
              this.getParmarsMap(res)
            }
            const treeArr = selectGenerateTree(res, JSON.stringify(config))
            this.treeData = [
              {
                id: '0',
                label: this.treeSettingsParmars.compName,
                parentId: '',
                parentName: '',
                componentsUrl: '',
                componentsType: '',
                otherParmars: '',
                children: treeArr
              }
            ]
          })
        }
      }
    },
    // 获取动态数据的参数映射所有列
    getParmarsMap (res) {
      const arr = Object.keys(res[0])
      const parmarsMap = []
      arr.forEach((el) => {
        parmarsMap.push({ before: el, after: '' })
      })
      this.dynamicParameter = parmarsMap
    },
    ChildNodeSettingsHandleOk (data) {
      const that = this
      function getNode (treeData) {
        treeData.forEach((el, index) => {
          if (el.id == data.id) {
            that.$set(treeData, index, data)
            el = data
            return
          }
          if (el.children && el.children.length > 0) {
            getNode(el.children)
          }
        })
      }
      this.visibleChildNodeSettingsDrawer = false
      // 新建子节点
      if (this.ChildNodeSettingsTitle === '新建子节点') {
        this.$refs.commonTree.$refs.tree.append(data, data.parentId)
        // 修改当前节点
      } else {
        const arr = [...this.treeData]
        getNode(arr)
        this.treeData = arr
      }
    },
    ParamshandleOk (parmas) {
      const that = this
      const arr = [...this.treeData]
      function getNode (treeData) {
        treeData.forEach((el) => {
          if (el.id == that.nodeId) {
            that.$set(el, 'parmarsMap', parmas)
            return
          }
          if (el.children && el.children.length > 0) {
            getNode(el.children)
          }
        })
      }
      getNode(arr)
      this.treeData = arr
      this.dynamicParameter = parmas
      this.visibleParamsDrawer = false
    },
    handlerAllowDrag (node) {
      return true
    },
    handlerAllowDrog (draggingNode, dropNode, type) {
      return draggingNode.level === dropNode.level && type !== 'inner'
    },
    getJSONdata () {
      let obj = {}
      // 静态数据
      if (this.treeSettingsParmars.dataType === '1') {
        // 静态数据处理参数传递
        // this.saveParmarsMap()
        obj = {
          previewUrl: 'Framework/ComponentsMananger/Layout/Components/ButtonNavigation/V1.0/edit/Components/preview',
          treeData: this.treeData,
          treeSettingsParmars: this.treeSettingsParmars,
          defaultComponents: this.componentsConfig
        }
      } else {
        obj = {
          previewUrl: 'Framework/ComponentsMananger/Layout/Components/ButtonNavigation/V1.0/edit/Components/preview',
          dynamicParameter: this.dynamicParameter,
          treeSettingsParmars: this.treeSettingsParmars,
          defaultComponents: this.componentsConfig
        }
      }
      return obj
    },
    settingsDelect () {
      this.asyncComponents = ''
    },
    getIcon (node) {
      let treeSettingsParmars = this.treeSettingsParmars
      let icon = ''
      if (!node.data.parentId) {
        icon = treeSettingsParmars.rootIcon ? treeSettingsParmars.rootIcon : 'p8 icon-zong'
      } else {
        if (!node.isLeaf) {
          icon = treeSettingsParmars.parentIcon ? treeSettingsParmars.parentIcon : 'p8 icon-zong'
        } else {
          icon = treeSettingsParmars.childIcon ? treeSettingsParmars.childIcon : 'el-icon-folder'
        }
      }
      return icon
    },
    onSelect (obj) {
      if (obj.id == '0') {
        return
      }
      let treeSettingsParmars = this.treeSettingsParmars
      let dynamicParameter = this.dynamicParameter
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
  }
}
</script>
