<template>
  <list-layout class="antvLayout">
    <template #north>
      <div class="header">
        <div class="text"
             v-for="(el,index) in buttonList"
             :key="index"
             @click="clickFun(el.fun)">
          <el-tooltip effect="dark"
                      :content="el.title"
                      placement="top">
            <i class="p8"
               :class="el.icon"></i>
          </el-tooltip>
        </div>
      </div>
    </template>
    <template #center>
      <div class="antv-content">
        <div class="antv-wrapper">
          <div class="wrapper-canvas"
               id="wrapper"
               @dragover.prevent></div>
        </div>
      </div>
    </template>
  </list-layout>
</template>
<script>
import { Graph, Shape } from '@antv/x6'
import { configSetting, buttonConfig, configNodePorts, graphBindKey } from './antvSetting'
import { P8ListLayout as ListLayout } from 'p8-components-ui'
export default {
  name: "AntV6X",
  components: {
    ListLayout
  },
  props: {
    acivityData: {
      type: Array,
      default: () => {
        return []
      }
    },
    edgeList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  watch: {
    acivityData: {
      handler (val) {
        this.initGraph()
      },
      immediate: true
    }
  },
  data () {
    return {
      graph: null,
      isChange: false,
      isPortsShow: false,
      menuItem: '',
      selectCell: '',
      buttonList: buttonConfig
    }
  },
  created () {
    window.openActivityInfo = this.openActivityInfo.bind(this)
  },
  mounted () {
    this.initGraph()
  },
  beforeDestroy () {
    this.graph.dispose()
  },
  methods: {
    // 初始化渲染画布
    initGraph () {
      let that = this
      // 连接过程中产生的新边的样式
      Graph.registerEdge(
        "dag-edge",
        {
          inherit: "edge",
          router: { name: 'orth' },
          connector: { name: 'rounded' },
          attrs: {
            line: {
              stroke: "#9DADB6",
              strokeWidth: 2,
              sourceMarker: null,
              targetMarker: null,
            },
          },
        },
        true
      );
      Graph.registerEdge(
        "arrow-edge",
        {
          inherit: "edge",
          router: { name: 'orth' },
          connector: { name: 'rounded' },
          attrs: {
            line: {
              stroke: "#9DADB6",
              strokeWidth: 2
            },
          },
        },
        true
      );
      const graph = new Graph({
        container: document.getElementById('wrapper'),
        grid: true,
        selecting: true,
        connecting: {
          router: 'manhattan',
          connector: {
            name: 'rounded',
            args: {
              radius: 8,
            },
          },
          snap: false, // 是否自动吸附
          allowMulti: true, // 是否允许在相同的起始节点和终止之间创建多条边
          allowNode: false, // 是否允许边链接到节点（非节点上的链接桩）
          allowBlank: false, // 是否允许连接到空白点
          allowLoop: false, // 是否允许创建循环连线，即边的起始节点和终止节点为同一节点，
          allowEdge: false, // 是否允许边链接到另一个边
          highlight: true, // 拖动边时，是否高亮显示所有可用的连接桩或节点
          connectionPoint: "boundary", // 指定连接点
          createEdge () {
            if (that.portsType == 'parent') {
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
            } else {
              return new Shape.Edge({
                attrs: {
                  line: {
                    stroke: '#333333',
                    strokeWidth: 1
                  }
                },
                zIndex: 0,
              })
            }
          },
          validateConnection ({ targetMagnet }) {
            return !!targetMagnet
          },
        },
      })
      graphBindKey(graph)
      graph.enablePanning()
      //点击编辑
      graph.on('cell:click', ({ cell }) => {
        this.selectCell = cell
      })
      graph.on('edge:connected', ({ edge }) => {
        let source = this.acivityData.find(el => el.key == edge.source.cell)
        let target = this.acivityData.find(el => el.key == edge.target.cell)
        if (this.portsType == 'parent') {
          if (source && target && source.parent == target.parent) {
            that.$message({ type: 'warning', message: '当前节点不可设置为子节点' })
            graph.removeEdge(edge.id); // 取消连接边的操作
          } else {
            that.$api['OutputFlow.saveNode']({
              name: '新活动',
              parent: source.key,
              insertNum: 1,
              insertType: 'Child'
            }).then(res => {
              console.log(edge.target.cell, '---edge.target.cell');
            })
          }
        } else if (this.portsType == 'around') {
          that.$api['OutputFlow.GMpredecessorsCreateOrUpdate']({
            flFromId: source.key,
            flToId: target.key,
          }).then(res => {
            console.log(edge.target.cell, '---edge.target.cell');
          })
        }
      })
      this.graph = graph
      this.loadData()
      this.graph.zoom(1 - this.graph.zoom())
      this.graph.centerContent()
    },
    clickFun (funName) {
      this[funName]()
    },
    loadData () {
      if (this.acivityData && this.acivityData.length) {
        this.acivityData.forEach((el, index) => {
          let str = ''
          let ports = {}
          if (el.parent && el.parent) {
            ports = {
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
            str = `
              <div class="warp" style="height: 100%; width:100%;border:1px solid #eee;border-radios:50%;font-size:14px;background:#fff;">
                <div class="header" style="height:20px;border-bottom:1px solid #eee;position: relative;">
                  <div style="position:absolute;left:5px;top:0;">
                    <i class="${el.typeIcon ? el.typeIcon : ''}"></i>
                    <span>${el.code ? el.code : ''}</span>
                  </div>
                  <div style="position:absolute;right:5px;top:0;">
                    <i class="p8 icon-jindu" style="cursor:pointer" onclick="openActivityInfo('describeKey','${el.key}')"></i>
                    <i class="p8 icon-shuruyaoqiu" style="cursor:pointer" onclick="openActivityInfo('inputKey','${el.key}')"></i>
                    <i class="p8 icon-shuchuyaoqiu" style="cursor:pointer" onclick="openActivityInfo('outputKey','${el.key}')"></i>
                    <i class="p8 icon-tebieshuoming" style="cursor:pointer" onclick="openActivityInfo('specialKey','${el.key}')"></i>
                  </div>
                </div>
                <div style="text-align: center;height:50px;line-height:50px;">${el.name ? el.name : ''}</div>
                <div style="text-align:right;border-top:1px solid #eee;height:20px;line-height:20px;padding-right:5px;"><i class="el-icon-time"></i>${el.suggestionDuration ? el.suggestionDuration : ''}</div>
              </div>`
          } else {
            ports = {
              groups: {
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
                }
              },
              items: [
                {
                  group: 'bottom',
                }
              ]
            }
            str = `
              <div class="warp" style="height: 100%; width:100%;border:1px solid #eee;border-radios:50%;font-size:14px;background:#fff;">
                <div class="header" style="height:20px;border-bottom:1px solid #eee;position: relative;">
                </div>
                <div style="text-align: center;height:50px;line-height:50px;">${el.name ? el.name : ''}</div>
                <div style="text-align:right;border-top:1px solid #eee;height:20px;line-height:20px;padding-right:5px;"></i>${el.suggestionDuration ? el.suggestionDuration : ''}</div>
              </div>`
          }
          this.addActivity({
            id: el.key,
            width: 200,
            height: 95,
            shape: 'html',
            x: this.getX(el, index),
            y: this.getY(el, index),
            html: () => {
              const wrap = document.createElement('div')
              wrap.innerHTML = str
              return wrap
            },
            ports: ports,
          })
        })
      }
      if (this.edgeList && this.edgeList.length) {
        this.edgeList.forEach((el, index) => {
          let source = this.graph.getCellById(el.from)//通过id获取边/节点
          let target = this.graph.getCellById(el.to)
          if (el.category) {
            this.graph.addEdge({
              shape: 'dag-edge',
              source,
              target
            })
          } else {
            this.graph.addEdge({
              shape: 'arrow-edge',
              source,
              target
            })
          }
        })
      }
    },
    // 链接桩的显示与隐藏，主要是照顾菱形
    changePortsShow () {
      this.portsType = 'parent'
      this.isPortsShow = !this.isPortsShow
      const container = document.getElementById('wrapper')
      const ports = container.querySelectorAll('.x6-port-body')
      for (let i = 0, len = ports.length; i < len; i = i + 1) {
        ports[i].style.visibility = this.isPortsShow ? 'visible' : 'hidden'
      }
    },
    aroundPorts () {
      this.portsType = 'around'
      this.isPortsShow = !this.isPortsShow
      const container = document.getElementById('wrapper')
      const ports = container.querySelectorAll('.x6-port-body')
      for (let i = 0, len = ports.length; i < len; i = i + 1) {
        ports[i].style.visibility = this.isPortsShow ? 'visible' : 'hidden'
      }
    },
    addActivity (data) {
      if (data) {
        this.graph.addNode(data)
      } else {
        let str = `
          <div class="warp" style="height: 100%; width:100%;border:1px solid #eee;border-radios:50%;font-size:14px;background:#fff;">
            <div class="header" style="height:20px;border-bottom:1px solid #eee;position: relative;">
              <div style="position:absolute;left:5px;top:0;">
                <span></span>
              </div>
              <div style="position:absolute;right:5px;top:0;">
                <i class="p8 icon-jindu" @click="openActivityInfo('describeKey','${el.key}')"></i>
                <i class="p8 icon-shuruyaoqiu" @click="openActivityInfo('inputKey','${el.key}')"></i>
                <i class="p8 icon-shuchuyaoqiu" @click="openActivityInfo('outputKey','${el.key}')"></i>
                <i class="p8 icon-tebieshuoming" @click="openActivityInfo('specialKey','${el.key}')"></i>
              </div>
            </div>
            <div style="text-align: center;height:50px;line-height:50px;">新活动</div>
            <div style="text-align:right;border-top:1px solid #eee;height:20px;line-height:20px;padding-right:5px;"></div>
          </div>`
        this.addActivity({
          id: '',
          width: 180,
          height: 80,
          shape: 'html',
          x: 120,
          y: 50,
          html: () => {
            const wrap = document.createElement('div')
            wrap.innerHTML = str
            return wrap
          },
          ports: {
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
                      visibility: this.isPortsShow ? 'visible' : 'hidden',
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
                      visibility: this.isPortsShow ? 'visible' : 'hidden',
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
                      visibility: this.isPortsShow ? 'visible' : 'hidden',
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
                      visibility: this.isPortsShow ? 'visible' : 'hidden',
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
          },
        })
      }
    },
    // 删除节点
    handlerDel () {
      const cells = this.graph.getSelectedCells()
      if (cells.length) {
        this.$confirm('是否要删除该节点?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.graph.removeCells(cells)
          let ids = cells.map(el => el.id)
          this.$api['OutputFlow.removeNodes']({ keys: ids }).then(res => {
            this.$message({ type: 'success', message: '删除成功!' })
          })
        })
      } else {
        this.$message({ type: 'warning', message: '请先选择节点!' })
      }
    },
    // 居中显示
    centerDisplay () {
      this.graph.centerContent()
    },
    // 放大
    enlargeCanvas () {
      this.graph.zoom(0.05)
    },
    // 缩小
    shrinkCanvas () {
      this.graph.zoom(-0.05)
    },
    // 适应屏幕
    adaptiveWindow () {
      this.graph.zoom(1 - this.graph.zoom())
      this.graph.centerContent()
    },
    // 信息设置
    activityInformation () {
      if (this.selectCell && this.selectCell.id) {
        this.$emit('nodeClick', this.selectCell)
      }
    },
    openActivityInfo (type, id) {
      console.log("🚀 ~ file: antv.vue:551 ~ openActivityInfo ~ type, id:", type, id)
      this.$emit('openActivityInfo', type, id)
    },
    getX (el, index) {
      if (!el.parent) {
        return 0
      } else {
        return el.x * (200 + 50)
      }
    },
    getY (el, index) {
      if (!el.parent) {
        return 0
      } else {
        return Number(el.level - 1) * (95 + 60)
      }
    }
  }
}
</script>
<style lang="scss">
@keyframes ant-line {
  to {
    stroke-dashoffset: -1000;
  }
}
</style>
<style lang="scss" scoped="scoped">
.header {
  display: flex;
  border-bottom: 1px solid #e1e1e1;
  .text {
    margin: 10px;
    color: #1890ff;
    font-size: 14px;
    cursor: pointer;
    i {
      font-size: 22px;
    }
  }
}
.antv-content {
  height: 100%;
  background: #fff;
  display: flex;
  overflow: hidden;
  position: relative;
  .antv-wrapper {
    flex: 1;
    position: relative;
    .wrapper-canvas {
      width: 100% !important;
      position: relative;
      height: 100% !important;
    }
  }
}
.antvLayout ::v-deep .list-header {
  padding: 0;
  padding-bottom: 10px !important;
}
</style>
