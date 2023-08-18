import go from 'p8-gojs'

/**
 * @Description 角标数据源
 * @author fukai
 * @date 2020/4/14 16:13
 */
import iconFlightTest from '@/assets/image/outputFlow/icon-flight-test.png'
import iconReviewPlan from '@/assets/image/outputFlow/icon-review-plan.png'
import iconTrialProduction from '@/assets/image/outputFlow/icon-trial-production.png'
import iconDesignProcess from '@/assets/image/outputFlow/icon-design-process.png'
import api from '@/plugins/api'
export const GraohicsMode = {}

export const gm = go.GraphObject.make // 初始化对象
export const highlightColor = 'red'
/**
 * @Description 各层级的边框颜色
 * @author fukai
 * @date 2020/4/14 16:13
 */
const levelColors = ['#AC193D', '#2672EC', '#8C0095', '#5133AB', '#008299', '#D24726', '#008A00', '#094AB2']
/**
 * @Description 部分文本通用样式
 * @author fukai
 * @date 2020/4/15 13:11
 */
const textStyle = { font: '8pt  Segoe UI,sans-serif', stroke: 'black', alignment: go.Spot.Center }

const pictures = {
  3110: iconFlightTest, // 飞行试验
  3101: iconDesignProcess, // 设计/工艺
  3103: iconTrialProduction, // 生产/试制
  3105: iconReviewPlan // 评审计划
}

/**
 * @Description node节点设置，不同层级边框颜色不同
 * @author fukai
 * @date 2020/4/15 11:40
 */
GraohicsMode.layoutNodeColor = function (myDiagram) {
  go.TreeLayout.prototype.commitNodes.call(myDiagram.layout)
  myDiagram.layout.network.vertexes.each(function (v) {
    if (v.node) {
      let level = v.level % levelColors.length
      let color = levelColors[level]
      let shape = v.node.findObject('SHAPE')
      if (shape) shape.stroke = gm(go.Brush, 'Linear', { 0: color, 1: go.Brush.lightenBy(color, 0.05), start: go.Spot.Left, end: go.Spot.Right })
    }
  })
}

/**
 * @Description 布局设置
 * @author fukai
 * @date 2020/4/14 16:14
 */
GraohicsMode.defaultLayout = function (direction) {
  return gm(go.TreeLayout, {
    treeStyle: go.TreeLayout.StyleLayered,
    arrangement: go.TreeLayout.AlignmentCenterChildren,
    angle: direction, // 角度 获取或设置树木生长的默认方向。 其中0沿正X轴，而90沿正Y轴
    nodeSpacing: 40, // 层内节点之间的距离——同级节点之间的距离。
    layerSpacing: 50, // 层之间的距离——父节点和子节点之间的距离。
    alternateAngle: 90, // 备用角度
    isOngoing: true,
    layerStyle: true,
    rowSpacing: 90,
    alternateLayerSpacing: 90,
    alternateAlignment: go.TreeLayout.AlignmentBus,
    alternateNodeSpacing: 90,
    sorting: go.TreeLayout.SortingAscending, // 排序
    comparer: function (va, vb) {
      // 自定义排序规则
      var da = va.node.data
      var db = vb.node.data
      if (da.indexNo < db.indexNo) return -1
      if (da.indexNo > db.indexNo) return 1
      return 0
    }
  })
}

/**
 * @Description 定义node样式，arg：go中定义的
 * @author fukai
 * @date 2020/4/15 11:48
 */
GraohicsMode.defaultNodeStyle = function (arg) {
  return gm(go.Shape, arg, {
    name: 'SHAPE',
    fill: '#f1f1f1',
    stroke: 'black',
    portId: '',
    cursor: 'pointer',
    strokeWidth: 1,
    fromLinkable: true,
    fromLinkableSelfNode: true,
    fromLinkableDuplicates: true,
    toLinkable: true,
    toLinkableSelfNode: true,
    toLinkableDuplicates: true
  })
}

/**
 * @Description 获取角标
 * @author fukai
 * @date 2020/4/15 13:12
 */
GraohicsMode.findPicture = function (type) {
  if (type) {
    return pictures[type]
  }
  return ''
}

/**
 * @Description Horizontal定义
 * @author fukai
 * @date 2020/4/15 13:48
 */
GraohicsMode.defaultHorizontal = function (gm) {
  return gm(
    go.Panel,
    'Horizontal',
    // 角标图片
    gm(
      go.Picture,
      {
        name: 'Picture',
        desiredSize: new go.Size(16, 16),
        alignment: new go.Spot(0, 0, 0, 0),
        opacity: 1.0
      },
      new go.Binding('source', 'type', GraohicsMode.findPicture)
    ),
    // node属性定义
    gm(
      go.Panel,
      'Table',
      {
        minSize: new go.Size(100, NaN),
        maxSize: new go.Size(100, NaN),
        margin: new go.Margin(5, 5, 0, 5),
        defaultAlignment: go.Spot.Left
      },
      gm(go.RowColumnDefinition, { column: 2, width: 4 }),
      gm(
        go.TextBlock,
        textStyle,
        {
          row: 0,
          column: 0,
          margin: 5,
          editable: false,
          font: '10pt Segoe UI,sans-serif',
          isMultiline: true,
          alignment: go.Spot.Center,
          minSize: new go.Size(10, 16)
        },
        new go.Binding('text', 'name').makeTwoWay()
      ),
      gm(
        go.TextBlock,
        textStyle,
        { row: 1, column: 0 },
        new go.Binding('text', 'suggestionDuration', function (v) {
          return v !== '' && v != null ? '时限：' + v : ''
        })
      ),
      gm(
        go.TextBlock,
        textStyle,
        { row: 2, column: 0 },
        new go.Binding('text', 'roleName', function (v) {
          return v !== '' && v != null ? '角色：' + v : ''
        })
      )
    )
  )
}

/**
 * @Description 定义链接模板
 *              linkType:连线类型
 * @author fukai
 * @date 2020/4/15 13:50
 */
GraohicsMode.defaultLinkTemplate = function (layout1, treeLink1, linkType, showPredecessorsType) {
  return gm(
    go.Link,
    linkType,
    { isLayoutPositioned: layout1, isTreeLink: treeLink1 },
    {
      relinkableFrom: true,
      relinkableTo: true,
      toShortLength: 5,
      routing: go.Link.AvoidsNodes, // AvoidsNodes Normal Orthogonal
      curve: go.Link.JumpOver, // None, Bezier, JumpGap, or JumpOver.
      selectionAdorned: false
    },
    gm(
      go.Shape,
      new go.Binding('stroke', 'isHighlighted', function (h, shape) {
        return h ? highlightColor : '#0b12e2'
      }).ofObject(),
      new go.Binding('strokeWidth', 'isHighlighted', function (h) {
        return h ? 4 : showPredecessorsType ? 2 : 0
      }).ofObject()
    ),

    gm(
      go.Shape,
      new go.Binding('scale', 'isHighlighted', function (h, shape) {
        return 1.2
      }).ofObject(),
      new go.Binding('toArrow', 'isHighlighted', function (h, shape) {
        return h ? 'Standard' : showPredecessorsType ? 'Standard' : ''
      }).ofObject(),
      new go.Binding('stroke', 'isHighlighted', function (h, shape) {
        return h ? highlightColor : '#0b12e2'
      }).ofObject(),
      new go.Binding('strokeWidth', 'isHighlighted', function (h) {
        return h ? 4 : showPredecessorsType ? 2 : 0
      }).ofObject()
    )
  )
}

/**
 * @Description 禁止键盘事件（除backspace（键盘删除键）外）
 * @author fukai
 * @date 2020/4/15 13:56
 */
GraohicsMode.closedKeyDown = function (myDiagram) {
  return function () {
    let e = myDiagram.lastInput
    let control = e.control || e.meta
    let key = e.key
    if (control && (key === 'Z' || key === 'Y' || key === 'C' || key === 'V' || key === 'X')) return
    // if (key === 'Del' || key === 'Backspace') return;
    go.CommandHandler.prototype.doKeyDown.call(this)
  }
}

/**
 * @Description 左侧目录菜单node创建
 * @author fukai
 * @date 2020/4/15 14:37
 */
GraohicsMode.createPallet = function (gm, divId, type, name, nodeTemplate) {
  return gm(go.Palette, divId, {
    maxSelectionCount: 1,
    nodeTemplate: nodeTemplate,
    autoScrollRegion: 0,
    hasVerticalScrollbar: false,
    hasHorizontalScrollbar: false,
    allowDelete: false,
    nodeSelectionAdornmentTemplate: gm(go.Adornment, 'Auto', gm(go.Shape, 'Rectangle', { fill: 'white', stroke: null })),
    model: new go.GraphLinksModel([{ name: name, type: type, mark: '1', roleName: '', suggestionDuration: '' }])
  })
}

/**
 * @Description 校验是否可拖入
 * @author fukai
 * @date 2020/4/15 14:13
 */
GraohicsMode.mayWorkFor = function (node1, node2) {
  if (!(node1 instanceof go.Node)) return false
  if (node1 === node2) return false
  if (node2.isInTreeOf(node1)) return false
  if (node2.isInTreeOf(node1)) return false
  return true
}

/**
 * @Description 创建、更新前后置线（关系）
 * @author fukai
 * @date 2020/4/15 14:19
 */
GraohicsMode.createPredecessorsLink = function (e, obj, type, _this, flowId, myDiagram) {
  let fromNodeKey = e.subject.fromNode.key
  let toNodeKey = e.subject.toNode.key

  // 若为更新，获取旧数据
  let oldLinkKey = null
  if (type === 'update') {
    oldLinkKey = e.subject.data.key
  }

  let result = GraohicsMode.checkPredecessorsCanCreate(e.subject.fromNode, e.subject.toNode, flowId, myDiagram)
  myDiagram.commandHandler.deleteSelection() // 删除
  if (result.check) {
    // 新建
    api['OutputFlow.GMpredecessorsCreateOrUpdate']({ flFromId: fromNodeKey, flToId: toNodeKey, id: oldLinkKey })
      .then(function (res) {
        if (res) {
          myDiagram.model.addLinkData(res)
        }
      })
      .catch(function (error) {
        console.log(error)
      })
  } else {
    if (type === 'update') {
      // 更新时，若校验不通过，需要还原线位置
      api['OutputFlow.GMPredecessors']({ flLinkId: oldLinkKey })
        .then(function (res) {
          if (res) {
            myDiagram.model.addLinkData(res)
          }
        })
        .catch(function (error) {
          console.log(error)
        })
    }
    // _this.$notification['error']({
    //   message: '前后置设置消息',
    //   description: result.msg
    // })
    _this.$message({
      message: result.msg,
      type: 'error'
    })
  }
}

/**
 * @Description 前后置关系创建校验   flowId:根几点id
 * @author fukai
 * @date 2020/4/15 14:21
 */
GraohicsMode.checkPredecessorsCanCreate = function (fromNode, toNode, flowId, myDiagram) {
  let check = true
  let msg = '设置成功！'
  // 不能自身连线
  if (fromNode.data.key === toNode.data.key) {
    check = false
    msg = '前后置关系不能设置活动自身！'
  } else if (flowId === fromNode.data.key || toNode.data.key === flowId) {
    // 连线节点不能包含根节点
    check = false
    msg = '前后置关系不能设置根活动！'
  } else if (toNode.isInTreeOf(fromNode)) {
    // 连线节点不能为其子节点
    check = false
    msg = '后置活动不能为选中活动的子活动！'
  } else if (GraohicsMode.checkCanLink(fromNode, toNode, myDiagram)) {
    // 后置活动不能作为前置活动的前置
    check = false
    msg = '后置活动不能作为前置活动的前置！'
  } else {
    fromNode.findTreeParentChain().each(function (nodeOrLink) {
      // 连线节点不能为父节点
      if (nodeOrLink instanceof go.Node && nodeOrLink.data.key === toNode.data.key) {
        check = false
        msg = '后置活动不能为选中活动的父活动！'
      }
    })
  }
  let result = {}
  result['check'] = check
  result['msg'] = msg
  return result
}

/**
 * @Description 后置活动不能作为前置活动的前置
 * @author fukai
 * @date 2020/4/16 13:01
 */
GraohicsMode.checkCanLink = function (fromNode, toNode, myDiagram) {
  let links = myDiagram.findLinksByExample({ from: toNode.data.key, to: fromNode.data.key })
  if (links && links.count > 0) {
    return true
  }
  return false
}
