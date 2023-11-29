// 基本设置
export const configSetting = (Shape) => {
  return {
    grid: true,
    autoResize: true,
    translating: { restrict: true },
    mousewheel: {
      enabled: true,
      zoomAtMousePosition: true,
      modifiers: 'ctrl',
      minScale: 0.5,
      maxScale: 3,
    },
    connecting: {
      router: {
        name: 'manhattan',
        args: {
          padding: 1,
        },
      },
      connector: {
        name: 'rounded',
        args: {
          radius: 8,
        },
      },
      allowBlank: true,
      anchor: 'center',
      connectionPoint: 'anchor',
      snap: {
        radius: 20,
      },
      createEdge () {
        return new Shape.Edge({
          attrs: {
            line: {
              stroke: '#333333',
              strokeWidth: 1,
              targetMarker: null,
              sourceMarker: null, // 实心箭头
            }
          },
          zIndex: 0,
        })
      },
      validateConnection ({ targetMagnet }) {
        return !!targetMagnet
      },
    },
    onToolItemCreated ({ tool }) {
      const handle = tool
      const options = handle.options
      if (options && options.index % 2 === 1) {
        tool.setAttrs({ fill: 'red' })
      }
    },
    highlighting: {
      magnetAdsorbed: {
        name: 'stroke',
        args: {
          attrs: {
            fill: '#5F95FF',
            stroke: '#5F95FF',
          },
        },
      },
    },
    resizing: true,
    rotating: true,
    selecting: {
      enabled: true,
      rubberband: true,
      showNodeSelectionBox: true,
    },
    snapline: true,
    keyboard: true,
    clipboard: true
  }
}

// 节点连接装设置
export const configNodePorts = () => {
  return {
    groups: {
      top: {
        position: 'top',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: '#fff',
            style: {
              visibility: 'hidden',
            },
          },
        },
      },
      right: {
        position: 'right',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: '#fff',
            style: {
              visibility: 'hidden',
            },
          },
        },
      },
      bottom: {
        position: 'bottom',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: '#fff',
            style: {
              visibility: 'hidden',
            },
          },
        },
      },
      left: {
        position: 'left',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: '#fff',
            style: {
              visibility: 'hidden',
            },
          },
        },
      },
    },
    items: [
      {
        group: 'top',
      },
      {
        group: 'right',
      },
      {
        group: 'bottom',
      },
      {
        group: 'left',
      },
    ]
  }
}

// // 连线 label 设置
export const configEdgeLabel = (labelText, fontColor, fill, stroke) => {
  if (!labelText) return { attrs: { labelText: { text: '' }, labelBody: { fill: '', stroke: '' } } }
  return {
    markup: [
      {
        tagName: 'rect',
        selector: 'labelBody',
      },
      {
        tagName: 'text',
        selector: 'labelText',
      },
    ],
    attrs: {
      labelText: {
        text: labelText || '',
        fill: fontColor || '#333',
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
      },
      labelBody: {
        ref: 'labelText',
        refX: -8,
        refY: -5,
        refWidth: '100%',
        refHeight: '100%',
        refWidth2: 16,
        refHeight2: 10,
        stroke: stroke || '#555',
        fill: fill || '#fff',
        strokeWidth: 2,
        rx: 5,
        ry: 5,
      },
    }
  }
}

// // 键盘事件
export const graphBindKey = (graph) => {
  graph.bindKey(['meta+c', 'ctrl+c'], () => {
    const cells = graph.getSelectedCells()
    if (cells.length) {
      graph.copy(cells)
    }
    return false
  })
  graph.bindKey(['meta+x', 'ctrl+x'], () => {
    const cells = graph.getSelectedCells()
    if (cells.length) {
      graph.cut(cells)
    }
    return false
  })
  graph.bindKey(['meta+v', 'ctrl+v'], () => {
    if (!graph.isClipboardEmpty()) {
      const cells = graph.paste({ offset: 32 })
      graph.cleanSelection()
      graph.select(cells)
    }
    return false
  })
  //undo redo
  graph.bindKey(['meta+z', 'ctrl+z'], () => {
    if (graph.history.canUndo()) {
      graph.history.undo()
    }
    return false
  })
  // graph.bindKey(['meta+shift+z', 'ctrl+shift+z'], () => {
  //   if (graph.history.canRedo()) {
  //     graph.history.redo()
  //   }
  //   return false
  // })
  // select all
  // graph.bindKey(['meta+a', 'ctrl+a'], () => {
  //   const nodes = graph.getNodes()
  //   if (nodes) {
  //     graph.select(nodes)
  //   }
  // })
  //delete
  /*
  // graph.bindKey('delete', () => {
  //   const cells = graph.getSelectedCells()
  //   if (cells.length) {
  //     graph.removeCells(cells)
  //   }
  // })
  */
  // zoom
  // graph.bindKey(['ctrl+1', 'meta+1'], () => {
  //   const zoom = graph.zoom()
  //   if (zoom < 1.5) {
  //     graph.zoom(0.1)
  //   }
  // })
  // graph.bindKey(['ctrl+2', 'meta+2'], () => {
  //   const zoom = graph.zoom()
  //   if (zoom > 0.5) {
  //     graph.zoom(-0.1)
  //   }
  // })
  return graph
}

// 按钮设置
export const buttonConfig = [
  {
    title: '新建活动',
    icon: 'icon-xinjianhuodong',
    fun: 'addActivity'
  },
  {
    title: '分解连接线',
    icon: 'icon-fenjielianjiexian',
    fun: 'changePortsShow'
  },
  {
    title: '前后置连接线',
    icon: 'icon-qianhouzhilianjiexian',
    fun: 'aroundPorts'
  },
  {
    title: '删除活动',
    icon: 'icon-delete',
    fun: 'handlerDel'
  },
  {
    title: '活动信息设置',
    icon: 'icon-huodongxinxishezhi',
    fun: 'activityInformation'
  },
  {
    title: '居中显示',
    icon: 'icon-juzhongxianshi',
    fun: 'centerDisplay'
  },
  {
    title: '适应屏幕',
    icon: 'icon-shiyingpingmu',
    fun: 'adaptiveWindow'
  },
  {
    title: '放大',
    icon: 'icon-fangda1',
    fun: 'enlargeCanvas'
  },
  {
    title: '缩小',
    icon: 'icon-suoxiao',
    fun: 'shrinkCanvas'
  },
  {
    title: 'WBS图',
    icon: 'icon-WBStu',
    fun: ''
  },
  {
    title: 'PERT图',
    icon: 'icon-PERTtu',
    fun: ''
  },
]