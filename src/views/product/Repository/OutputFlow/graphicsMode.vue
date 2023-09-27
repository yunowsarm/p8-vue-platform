<!--suppress ALL -->
<template>
  <div :style="{'overflow-y': 'overlay' }">
    <el-container id="components-layout-demo-fixed"
                  :style="{  height: flexHeight, background: '#fff' }">
      <el-header width="40px">
        <div style=" margin-left: -15px;margin-top: 3px">
          <el-button @click="zoomToFitClick">全局展示</el-button>
          <el-button @click="centerRootClick">居中展示</el-button>
          <el-select v-model="selectValue"
                     style="width: 100px ; margin-left: 10px"
                     @change="handleChange">
            <el-option value="WBS"
                       label="WBS图"></el-option>
            <el-option value="activity"
                       label="流程图"></el-option>
          </el-select>
          <el-checkbox style=" margin-left: 10px  "
                       v-model="showPredecessorsType"
                       @change="showPredecessorsTypeChange">是否显示前后置</el-checkbox>
          <el-checkbox v-model="showLineType"
                       @change="showLineTypeChange">是否显示子父关系</el-checkbox>
        </div>
      </el-header>
      <el-container :style="{ height: diagramHeight,'margin-top': ' -22px' }">
        <el-aside style="width: 150px;background: #fff; border-right: 1px solid #e8e8e8;">
          <div id="myPaletteDiv"
               style="width: 140px; margin-right: 1px; background-color: white;">
            <div id="commonPaletteDiv"
                 class="palette"> </div>
            <div id="designPaletteDiv"
                 class="palette"></div>
            <div id="productionPaletteDiv"
                 class="palette"></div>
            <div id="reviewPaletteDiv"
                 class="palette"></div>
            <div id="flyPaletteDiv"
                 class="palette"></div>
          </div>
        </el-aside>
        <el-main>
          <div id="myDiagramDiv"
               :style="{ height: diagramHeight }">
          </div>
        </el-main>
        <el-aside v-show="isShowActivity"
                  width="40%"
                  style=" overflow-y: auto">
          <div style=" margin-left: 10px  ">
            <el-collapse accordion>
              <el-collapse-item title="活动描述"
                                name="act1">
                <describe-edit @saveSuccess="saveCallback"
                               :activityInfoId="activityId"
                               :teamId="teamId"
                               :rootId="activityInfoId"
                               v-if="refreshVli"
                               :colLayoutClassify="colLayoutClassify"></describe-edit>
              </el-collapse-item>
              <el-collapse-item title="输入"
                                name="act2">
                <input-edit @saveSuccess="saveCallback"
                            :activityInfoId="activityId"></input-edit>
              </el-collapse-item>
              <el-collapse-item title="输出"
                                name="act3">
                <output-edit @saveSuccess="saveCallback"
                             :activityInfoId="activityId"></output-edit>
              </el-collapse-item>
              <el-collapse-item title="特别说明"
                                name="act4">
                <special-edit @saveSuccess="saveCallback"
                              :activityInfoId="activityId"></special-edit>
              </el-collapse-item>
            </el-collapse>
          </div>
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>
<style>
#myDiagramDiv {
  flex-grow: 1;
  border: 1px solid #b4bbb7;
  position: relative;
  -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
  cursor: auto;
  background-color: #ffffff;
}
#centerCanvas {
  position: absolute;
  top: 0px;
  left: 0px;
  z-index: 1;
  user-select: none;
  width: 100%;
  cursor: auto;
  text-align: center;
}
#canvasDiv {
  position: absolute;
  overflow: auto;
  width: 767px;
  z-index: 1;
  text-align: center;
}
.palette {
  width: 140px;
  height: 80px;
}
</style>
<script>
import go from 'p8-gojs'
import { Collapse, CollapseItem, Button, Container, Aside, Header, Main, Select, Option, Checkbox } from 'p8-components-ui'
import DescribeEdit from './Components/describeEdit'
import inputEdit from './Components/inputEdit'
import outputEdit from './Components/outputEdit'
import specialEdit from './Components/specialEdit'
import { gm, GraohicsMode } from '@/assets/commonJS/outputFlow/graphicsMode'

let myDiagram = null
let dataArray = null

export default {
  name: 'GraphicsMode',
  components: {
    'describe-edit': DescribeEdit,
    'input-edit': inputEdit,
    'output-edit': outputEdit,
    'special-edit': specialEdit,
    'el-collapse': Collapse,
    'el-collapse-item': CollapseItem,
    'el-container': Container,
    'el-aside': Aside,
    'el-header': Header,
    'el-main': Main,
    'el-select': Select,
    'el-option': Option,
    'el-checkbox': Checkbox,
    'el-button': Button
  },
  props: {
    activityInfoId: {
      type: String,
      default: ''
    },
    teamId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {

      activityId: '',
      flexHeight: '',
      diagramHeight: '',
      colLayoutClassify: 'singleCol',
      refreshVli: true,
      isShowActivity: false,
      showPredecessorsType: true,
      showLineType: true,
      showType: 90,
      nodeTemp: {},
      selectValue: 'WBS'
    }
  },
  created () {
    let mh = document.documentElement.clientHeight - 125
    this.flexHeight = mh + 'px'
    this.diagramHeight = (mh - 50) + 'px'
    myDiagram = null
    dataArray = null
  },
  mounted () {
    // 默认初始加载wbs结构图

    // setTimeout(() => {
    this.init(this.showType, false, false, true, true)
    // }, 5000)
  },
  methods: {
    init (direction, layout1, treeLink1, layout2, treeLink2) {
      let _this = this
      // 切换布局时清楚原有布局及数据
      if (myDiagram) {
        myDiagram.div = null
        myDiagram = null
        _this.commonPalette.div = null
        _this.predictPalette.div = null
        _this.designPalette.div = null
        _this.productionPalette.div = null
        _this.afterSalePalette.div = null
      }
      /** *************************中间区域 开始 ***************************/
      myDiagram = gm(go.Diagram, 'myDiagramDiv', {
        maxSelectionCount: 1, // 每次只能操作一个node
        validCycle: go.Diagram.CycleDestinationTree,
        isTreePathToChildren: true,
        layout: GraohicsMode.defaultLayout(direction),
        'ChangedSelection': _this.onSelectionChanged, // 选中事件
        'undoManager.isEnabled': false, // 撤销
        'commandHandler.canDeleteSelection': _this.beforeDelete
      })
      // 如果用户在绘制的时候，需要实现两个距离非常远的节点的链接，那么就需要用到无限拖动
      myDiagram.scrollMode = go.Diagram.InfiniteScroll
      // 是否自动布局
      myDiagram.layoutDiagram(true)

      // 不同层级边框颜色不同
      myDiagram.layout.commitNodes = function () {
        GraohicsMode.layoutNodeColor(myDiagram)
      }

      // 定义node模板属性
      myDiagram.nodeTemplate =
        gm(go.Node, 'Auto',
          {
            doubleClick: _this.nodeDoubleClick
          },
          {
            mouseDragEnter: function (e, node, prev) { // 拖入节点
              let diagram = node.diagram
              let selnode = diagram.selection.first()
              if (!GraohicsMode.mayWorkFor(selnode, node)) return
              let shape = node.findObject('SHAPE')
              if (shape) {
                shape._prevFill = shape.fill
                shape.fill = 'darkred'
              }
            },
            mouseDragLeave: function (e, node, next) { // 拖出节点
              let shape = node.findObject('SHAPE')
              if (shape && shape._prevFill) {
                shape.fill = shape._prevFill // 还原最初位置
              }
            },
            mouseDrop: function (e, node) { // 创建关系
              _this.dragNodeSave(e, node)
            }
          },
          new go.Binding('text', 'name'),

          // 定义node样式，RoundedRectangle：圆角，Rectangle：直角
          GraohicsMode.defaultNodeStyle('RoundedRectangle'),

          // 定义Horizontal定义
          GraohicsMode.defaultHorizontal(gm),

          // 展开/合并子节点
          gm('TreeExpanderButton', { row: 3, columnSpan: 99, alignment: new go.Spot(1, 1, 0, 0) })
        )

      // 线创建监听
      myDiagram.addDiagramListener('LinkDrawn', function (e, obj) {
        GraohicsMode.createPredecessorsLink(e, obj, 'create', _this, _this.activityInfoId, myDiagram)
      })

      // 线重新连接监听
      myDiagram.addDiagramListener('LinkRelinked', function (e, obj) {
        GraohicsMode.createPredecessorsLink(e, obj, 'update', _this, _this.activityInfoId, myDiagram)
      })

      // 定义链接模板---前后置连线
      myDiagram.linkTemplate = GraohicsMode.defaultLinkTemplate(layout1, treeLink1, go.Link.AvoidsNodes, _this.showPredecessorsType)

      // 重新定义树连线
      myDiagram.linkTemplateMap.add('Support',
        gm(go.Link, go.Link.Orthogonal,
          { isLayoutPositioned: layout2, isTreeLink: treeLink2 },
          { relinkableFrom: true, relinkableTo: false, selectable: false },
          gm(go.Shape, { strokeWidth: _this.showLineType ? 1 : 0, stroke: '#e2e2e2' })
        )
      )

      // （除backspace（键盘删除键）外）禁止所有键盘事件
      myDiagram.commandHandler.doKeyDown = GraohicsMode.closedKeyDown(myDiagram)

      /** *************************中间区域 结束 ***************************/

      /** *************************左侧区域 开始 ***************************/
      _this.commonPalette = GraohicsMode.createPallet(gm, 'commonPaletteDiv', '', '新活动', myDiagram.nodeTemplate)
      _this.predictPalette = GraohicsMode.createPallet(gm, 'designPaletteDiv', '3101', '设计/工艺', myDiagram.nodeTemplate)
      _this.designPalette = GraohicsMode.createPallet(gm, 'productionPaletteDiv', '3103', '生产/试制', myDiagram.nodeTemplate)
      _this.productionPalette = GraohicsMode.createPallet(gm, 'reviewPaletteDiv', '3105', '评审计划', myDiagram.nodeTemplate)
      _this.afterSalePalette = GraohicsMode.createPallet(gm, 'flyPaletteDiv', '3110', '飞行试验', myDiagram.nodeTemplate)

      /** *************************左侧区域 结束 ***************************/

      /** *************************从后台加载model数据***************************/
      // 共享数据，避免多次加载
      if (dataArray) {
        myDiagram.model = dataArray
      } else {
        _this.load()
        // myDiagram.delayInitialization(_this.load());
      }
    },
    handleChange (value) {
      dataArray = myDiagram.model
      if (value === 'WBS') {
        this.showType = 90
      } else {
        this.showType = 0
      }
      this.init(this.showType, false, false, true, true)
    },
    zoomToFitClick () {
      myDiagram.commandHandler.zoomToFit()
    },
    centerRootClick () {
      myDiagram.scale = 1
      myDiagram.commandHandler.scrollToPart(myDiagram.findNodeForKey(this.activityInfoId))
    },
    // 拖入创建
    dragNodeSave (e, node) {
      let diagram = node.diagram
      let selnode = diagram.selection.first()

      let oldParent = myDiagram.findNodeForKey(selnode.data.parent)
      if (GraohicsMode.mayWorkFor(selnode, node)) { // selnode:选中node,node:拖入node
        let flowId
        let dragCheck = false
        if (selnode.data.mark === '1') { // 左侧目录拖入时置空该属性
          flowId = null
          dragCheck = true
        } else {
          flowId = selnode.data.key
        }

        // 排除子拖动到父的（不包含孙子节点拖动）
        if (dragCheck || (!dragCheck && node.data.key !== selnode.data.parent)) {
          this.$api['OutputFlow.GMdragNodeSave']({ parent: node.data.key, id: flowId, name: selnode.data.name, type: selnode.data.type }).then(function (res) {
            if (res) {
              const response = res

              myDiagram.startTransaction('拖动添加活动开始')

              // 由于添加线功能，删除原有布局线重新添加
              let links = []
              selnode.findLinksConnected().each(
                function (link) {
                  if (link.category === '' && link.data.from === oldParent.data.key && link.data.to === selnode.data.key) {
                    links.push(link.data)
                  }
                }
              )
              myDiagram.model.removeLinkDataCollection(links)

              // 更新排序号
              let oldIndexNo = selnode.data.indexNo
              let newIndexNo = response.indexNo
              myDiagram.model.setDataProperty(selnode.data, 'indexNo', newIndexNo)
              myDiagram.model.setDataProperty(selnode.data, 'parent', response.parent)

              // 页面影响节点的排序号更新
              if (response.refreshNodes) {
                response.refreshNodes.forEach(function (item) {
                  let reNode = myDiagram.findNodeForKey(item.ID)
                  myDiagram.model.setDataProperty(reNode.data, 'indexNo', item.INDEXNO)
                })
              }

              // 拖动节点的子孙排序号更新
              selnode.findTreeParts().each(function (n) {
                if (n instanceof go.Node && n.data.key !== selnode.data.key) { // 删除节点
                  myDiagram.model.setDataProperty(n.data, 'indexNo', n.data.indexNo - (oldIndexNo - newIndexNo))
                }
              })

              // 从新布局链接
              let link = selnode.findTreeParentLink()
              if (link !== null) {
                link.fromNode = node
              } else {
                myDiagram.model.setDataProperty(selnode.data, 'key', response.id)
                myDiagram.model.setDataProperty(selnode.data, 'mark', null)// 判断用到

                if (dragCheck) {
                  myDiagram.model.addLinkData({ 'to': selnode.data.key, 'from': node.data.key, 'category': 'Support' })
                } else {
                  diagram.toolManager.linkingTool.insertLink(node, node.port, selnode, selnode.port)
                }
              }

              myDiagram.commitTransaction('拖动添加活动结束')
            }
          }).catch(function (error) {
            console.error(error)
          })
        }
      }
    },
    // 双击添加子
    nodeDoubleClick (e, obj) {
      let that = this
      let clicked = obj.part
      // 屏蔽左侧目录双击节点创建子事件
      if (clicked !== null && e.diagram.div.id === 'myDiagramDiv') {
        let thisemp = clicked.data
        that.$api['OutputFlow.saveNode']({ parent: thisemp.key, name: '新活动', insertNum: 1, insertType: 'Child' }).then(function (res) {
          if (res) {
            const response = res

            response.forEach(function (item) {
              myDiagram.startTransaction('添加活动开始')

              const newemp = {
                key: item.id,
                name: '新活动',
                type: item.type,
                indexNo: item.indexNo,
                parent: item.parent
              }
              const newLink = {
                to: item.id,
                from: item.parent,
                category: 'Support'
              }
              myDiagram.model.addNodeData(newemp)
              myDiagram.model.addLinkData(newLink)
              myDiagram.commitTransaction('添加活动结束')
            })
          }
        }).catch(function (error) {
          console.error(error)
        })
      }
    },
    onSelectionChanged (e) {
      let that = this
      this.activityId = null
      if (this.nodeTemp && this.nodeTemp.data) {
        this.nodeTemp.diagram.clearHighlighteds()
      }

      this.nodeTemp = e.diagram.selection.first()

      if (this.nodeTemp instanceof go.Node) {
        this.nodeTemp.linksConnected.each(function (l) {
          that.highlightLink(l, true)
        })
        if (this.nodeTemp.data.key === this.activityInfoId) {
          this.activityId = '1'
        } else {
          this.activityId = this.nodeTemp.data.key
        }
        let thisemp = this.nodeTemp.data
        if (thisemp.parent) {
          this.isShowActivity = true
        } else {
          this.isShowActivity = false
        }
      } else {
        this.isShowActivity = false
      }
      // 刷新页面
      this.refreshVli = false
      this.$nextTick(() => (this.refreshVli = true))
      if (this.nodeTemp instanceof go.Link) { // 前后置线
        var nodeOrLinkData = this.nodeTemp.data
        if (nodeOrLinkData.category === 'Support') {
          return false
        } else {
          this.highlightLink(this.nodeTemp, true)
        }
        this.isShowActivity = false
      }
    },
    highlightLink (link, show) {
      link.isHighlighted = show
    },
    showPredecessorsTypeChange (show) {
      this.showPredecessorsType = show
      this.init(this.showType, false, false, true, true)
    },
    showLineTypeChange (show) {
      this.showLineType = show
      this.init(this.showType, false, false, true, true)
    },

    // 删除前校验
    beforeDelete (e, obj) {
      let that = this
      let nodeOrLinkList = myDiagram.selection
      let links = []
      let nodes = []
      nodeOrLinkList.each(function (nodeOrLink) {
        let nodeOrLinkData = nodeOrLink.data
        if (nodeOrLink instanceof go.Node) { // 删除节点
          if ((nodeOrLinkData.mark && nodeOrLinkData.mark === '1') || nodeOrLinkData.key === that.activityInfoId) {
            return false
          } else {
            nodes.push(nodeOrLink)
          }
        } else if (nodeOrLink instanceof go.Link) { // 删除前后置线
          if (nodeOrLinkData.category === 'Support') {
            return false
          } else {
            links.push(nodeOrLinkData)
          }
        }
      })
      if (links && links.length > 0) {
        that.removeLink(links)
      }
      if (nodes && nodes.length > 0) {
        that.removeNodes(nodes)
      }
    },
    showMessage (obj, message, type) {
      obj.$message({
        message: message,
        type: type
      })
    },
    removeLink (links) {
      let that = this
      that.$confirm(`是否要删除该条数据？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        myDiagram.startTransaction('开始删除')
        let keys = []
        links.forEach(function (item) {
          keys.push(item.key)
        })
        myDiagram.model.removeLinkDataCollection(links)
        that.$api['OutputFlow.GMremovePredecessors']({ flPredecessorsesIds: keys }).then(res => {
          if (!res) {
            that.showMessage(that, '删除该前后置关系错误！', 'error')
            myDiagram.rollbackTransaction()
            return false
          }
          myDiagram.commitTransaction('删除该前后置关系完成！')
        })
      }).catch(() => console.error('Oops errors!'))
    },
    removeNodes (nodes) {
      let that = this
      that.$confirm(`是否要删除该条数据？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        myDiagram.startTransaction('开始删除')
        let removeNodes = []
        let removeLinks = []
        let removeKeys = []
        nodes.forEach(function (item) {
          removeKeys.push(item.data.key)
          item.findTreeParts().each(function (n) {
            if (n instanceof go.Node) { // 删除节点
              removeNodes.push(n.data)
              // 获取与当前节点连接的线
              let linksTo = myDiagram.findLinksByExample({ to: n.data.key })
              let linksFrom = myDiagram.findLinksByExample({ from: n.data.key })
              if (linksTo && linksTo.count > 0) {
                linksTo.each(function (link) {
                  removeLinks.push(link.data)
                })
              }
              if (linksFrom && linksFrom.count > 0) {
                linksFrom.each(function (link) {
                  removeLinks.push(link.data)
                })
              }
            } else if (n instanceof go.Link) { // 删除前后置线
              removeLinks.push(n.data)
            }
          })
        })
        this.$api['OutputFlow.removeNodes']({ keys: removeKeys }).then(function (res) {
          if (!res) {
            that.showMessage(that, '删除错误！', 'error')
            myDiagram.rollbackTransaction()
            return false
          }
          myDiagram.model.removeLinkDataCollection(removeLinks)
          myDiagram.model.removeNodeDataCollection(removeNodes)
          myDiagram.commitTransaction('删除完成')
        }).catch(function (error) {
          console.error(error)
          myDiagram.rollbackTransaction()
        })
      }).catch(() => console.error('Oops errors!'))
    },
    saveCallback (obj) { // 修改节点后更新node数据
      if (obj != null) {
        let node = myDiagram.findNodeForKey(this.activityId)
        myDiagram.startTransaction('开始更新')
        let model = myDiagram.model
        // 更新node数据
        model.setDataProperty(node.data, 'name', obj.name)
        model.setDataProperty(node.data, 'suggestionDuration', obj.duration)
        model.setDataProperty(node.data, 'roleName', obj.teamRoleName)
        model.setDataProperty(node.data, 'type', obj.type)

        // 更新前后置
        if (obj.delPredecessorsIds) { // 删除
          let jsonIds = obj.delPredecessorsIds
          let removeLinks = []
          for (let n in jsonIds) {
            let delLinks = myDiagram.findLinksByExample({ from: jsonIds[n], to: node.data.key })
            if (delLinks && delLinks.count > 0) {
              delLinks.each(function (link) {
                removeLinks.push(link.data)
              })
            }
          }
          myDiagram.model.removeLinkDataCollection(removeLinks)
        }
        if (obj.createLinks) { // 新增
          let jsonData = obj.createLinks
          for (let n in jsonData) {
            const newLink = {
              key: n,
              to: this.activityId,
              from: jsonData[n]
            }
            myDiagram.model.addLinkData(newLink)
          }
        }
        myDiagram.commitTransaction('更新完成')
      }
    },
    load () {
      let that = this
      that.$api['OutputFlow.GMloadModeData']({ activityInfoId: that.activityInfoId }).then(function (res) {
        let data = res
        // 元素赋值
        myDiagram.model = go.Model.fromJson(
          {
            'nodeDataArray': data.node,
            'class': 'go.GraphLinksModel',
            'linkDataArray': data.link
          }
        )
      }).catch(function (error) {
        that.showMessage(that, '服务器端加载错误！', 'error')
        console.error(error)
      })
    }
  }
}
</script>
