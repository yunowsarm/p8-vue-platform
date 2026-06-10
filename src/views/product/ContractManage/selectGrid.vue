<template>
  <list-layout :header-visible="false">
    <template #center>
      <div class="canvas-container">
        <div style="display: flex;justify-content: space-around;">
           <canvas 
            ref="canvas" 
            :width="width" 
            :height="height"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
            @mouseleave="handleMouseLeave"
            @dblclick="handleDoubleClick"
          ></canvas>
      
          <div class="control-panel">
            <div class="mode-selector">
              <h3>框选模式：</h3>
              <div class="mode-buttons">
                <button 
                  @click="setMode('rectangle')" 
                  :class="{ active: currentMode === 'rectangle' }"
                >
                  矩形框选
                </button>
                <button 
                  @click="setMode('polygon')" 
                  :class="{ active: currentMode === 'polygon' }"
                >
                  多边形框选
                </button>

                <button 
                  @click="setMode('circle')" 
                  :class="{ active: currentMode === 'circle' }"
                >
                  圆形框选
                </button>
              </div>
            </div>
            
            <div class="controls">           
              <div class="action-buttons">
                <button @click="saveCanvas">保存为图片</button>
                <button @click="saveRegionData">保存柱网数据</button>
                <!-- <button @click="clearBackground">清除背景</button> -->
                <!-- <button @click="clearAllSelections">清除所有框选</button> -->
                <!-- <button @click="cancelCurrentDrawing">取消当前绘制</button> -->
                <!-- <button @click="copyCoordinates">复制坐标</button> -->
              </div>
              
              <div class="polygon-controls" v-if="currentMode === 'polygon'">
                <button @click="undoLastPoint">撤销上一点</button>
                <button @click="completePolygon">完成多边形</button>
                <button @click="resetPolygon">重置多边形</button>
              </div>
              <div class="instructions" v-if="currentInstructions">
                <p>{{ currentInstructions }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="coordinates-info" v-if="selections.length > 0">
          <div class="info-header">
            <h3>框选柱网信息（共{{ selections.length }}个柱网）</h3>
            <div class="info-actions">
              <span class="region-count">总点数: {{ totalPoints }}</span>
              <!-- <button @click="toggleAllPoints" class="toggle-all-btn">
                {{ showAllPoints ? '隐藏' : '显示' }}所有详情
              </button> -->
            </div>
          </div>
          
          <div v-for="(selection, index) in selections" :key="selection.id || index" class="coordinate-item">
            <div class="selection-header">
              <div class="selection-title">
                <span class="selection-type" :class="getTypeClass(selection.type)">{{ getTypeName(selection.type) }}</span>
                <span class="selection-index">柱网 {{ index + 1 }}</span>
              </div>
              <div class="selection-actions">
                <!-- <button @click="zoomToSelection(selection)" class="action-btn" title="放大查看">
                  <span>🔍</span>
                </button> -->
                <!-- <button @click="highlightSelection(index)" class="action-btn" title="高亮显示">
                  <span>🌟</span>
                </button> -->
                <button @click="removeSelection(index)" class="remove-btn">删除</button>
              </div>
            </div>
            
            <div class="coordinate-details">
              <!-- 矩形区域详情 -->
              <div v-if="selection.type === 'rectangle'" class="region-detail">
                <!-- <div class="detail-row">
                  <span class="detail-label">起点:</span>
                  <span class="detail-value">({{ Math.round(selection.startX) }}, {{ Math.round(selection.startY) }})</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">终点:</span>
                  <span class="detail-value">({{ Math.round(selection.endX) }}, {{ Math.round(selection.endY) }})</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">尺寸:</span>
                  <span class="detail-value">{{ Math.round(selection.width) }} × {{ Math.round(selection.height) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">面积:</span>
                  <span class="detail-value">{{ Math.round(selection.width * selection.height) }} 像素</span>
                </div> -->
              </div>
              
              <!-- 圆形区域详情 -->
              <div v-if="selection.type === 'circle'" class="region-detail">
                <!-- <div class="detail-row">
                  <span class="detail-label">圆心:</span>
                  <span class="detail-value">({{ Math.round(selection.centerX) }}, {{ Math.round(selection.centerY) }})</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">半径:</span>
                  <span class="detail-value">{{ Math.round(selection.radius) }} 像素</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">直径:</span>
                  <span class="detail-value">{{ Math.round(selection.radius * 2) }} 像素</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">面积:</span>
                  <span class="detail-value">{{ Math.round(Math.PI * selection.radius * selection.radius) }} 像素</span>
                </div> -->
              </div>
              
              <!-- 多边形区域详情 -->
              <div v-if="selection.type === 'polygon'" class="region-detail">
                <!-- <div class="detail-row">
                  <span class="detail-label">顶点数:</span>
                  <span class="detail-value">{{ selection.points.length }}</span>
                  <button @click="togglePoints(index)" class="toggle-btn">
                    {{ showPoints[index] ? '隐藏' : '显示' }}顶点
                  </button>
                </div>
                <div class="detail-row">
                  <span class="detail-label">边界框:</span>
                  <span class="detail-value">{{ Math.round(selection.bounds.minX) }}, {{ Math.round(selection.bounds.minY) }} 
                  → {{ Math.round(selection.bounds.maxX) }}, {{ Math.round(selection.bounds.maxY) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">尺寸:</span>
                  <span class="detail-value">{{ Math.round(selection.bounds.width) }} × {{ Math.round(selection.bounds.height) }}</span>
                </div>
                <div v-if="showPoints[index] || showAllPoints" class="polygon-points">
                  <div class="points-grid">
                    <div v-for="(point, pointIndex) in selection.points" :key="pointIndex" class="point-item">
                      <span class="point-index">顶点{{ pointIndex + 1 }}:</span>
                      <span class="point-coords">({{ Math.round(point.x) }}, {{ Math.round(point.y) }})</span>
                    </div>
                  </div>
                </div> -->
              </div>
              
              <!-- 区域元数据 -->
              <div class="region-meta">
                <span class="meta-label">创建时间:</span>
                <span class="meta-value">{{ formatTime(selection.createdAt) }}</span>
                <span v-if="selection.color" class="color-indicator" :style="{ backgroundColor: selection.color }"></span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 预览模态框 -->
        <div v-if="showPreview" class="preview-modal" @click.self="closePreview">
          <div class="preview-content">
            <div class="preview-header">
              <h3>柱网数据预览</h3>
              <button @click="closePreview" class="close-btn">×</button>
            </div>
            <div class="preview-body">
              <pre>{{ previewData }}</pre>
            </div>
            <div class="preview-footer">
              <button @click="copyPreviewData" class="copy-btn">复制JSON</button>
              <button @click="downloadPreviewData" class="download-btn">下载JSON文件</button>
            </div>
          </div>
        </div>
        
        <!-- 缩放视图 -->
        <div v-if="zoomedSelection" class="zoom-view" @click="closeZoom">
          <div class="zoom-content">
            <!-- <div class="zoom-header">
              <h3>区域放大视图</h3>
              <button @click="closeZoom" class="close-btn">×</button>
            </div> -->
            <canvas ref="zoomCanvas" :width="zoomWidth" :height="zoomHeight" class="zoom-canvas"></canvas>
            <div class="zoom-info">
              <p>{{ zoomedSelection.type }} 柱网 (缩放: {{ zoomScale }}x)</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </list-layout>
</template>

<script>
import { P8ListLayout as ListLayout } from 'p8-components-ui'
export default {
  name: 'CanvasBackground',
   components: {
    ListLayout,
  },
  props: {
    row: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      rowData: this.row,
      width: 800,
      height: 600,
      canvas: null,
      ctx: null,
      backgroundImage: null,
      isImageLoaded: false,
      backgroundDataURL: null,
      
      // 当前绘制模式
      currentMode: 'rectangle',
      
      // 绘制状态
      isDrawing: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      
      // 多边形相关
      polygonPoints: [],
      isDrawingPolygon: false,
      
      // 圆形相关
      circleCenterX: 0,
      circleCenterY: 0,
      circleRadius: 0,
      isDrawingCircle: false,
      
      // 所有框选区域
      selections: [],
      
      // 显示控制
      showPoints: {},
      showAllPoints: false,
      
      // 当前模式说明
      currentInstructions: '',
      
      // 预览相关
      showPreview: false,
      previewData: '',
      
      // 缩放相关
      zoomedSelection: null,
      zoomCanvas: null,
      zoomCtx: null,
      zoomScale: 2,
      zoomWidth: 400,
      zoomHeight: 300,
      
      // 区域颜色映射 - 使用半透明颜色
      regionColors: {
        rectangle: 'rgba(59, 130, 246, 0.3)', // 蓝色，30%透明度
        polygon: 'rgba(239, 68, 68, 0.3)',    // 红色，30%透明度
        circle: 'rgba(139, 92, 246, 0.3)'     // 紫色，30%透明度
      }
    }
  },
  computed: {
    totalPoints() {
      return this.selections.reduce((total, selection) => {
        if (selection.points) {
          return total + selection.points.length
        }
        return total + 4
      }, 0)
    }
  },
  mounted() {
    this.initCanvas()
    this.loadDefaultBackground()
    this.updateInstructions()
    
  },
  watch: {
    currentMode() {
      this.updateInstructions()
    }
  },
  methods: {
    initCanvas() {
      this.canvas = this.$refs.canvas
      this.ctx = this.canvas.getContext('2d')
      this.canvas.style.cursor = 'crosshair'
    },
    
    setMode(mode) {
      this.currentMode = mode
      this.cancelCurrentDrawing()
    },
    
    updateInstructions() {
      const instructions = {
        rectangle: '矩形模式: 按住鼠标左键拖拽绘制矩形',
        polygon: '多边形模式: 点击添加顶点，双击或点击"完成多边形"结束绘制',
        circle: '圆形模式: 按住鼠标左键拖拽绘制圆形'
      }
      this.currentInstructions = instructions[this.currentMode]
    },
    
    getTypeClass(type) {
      return `type-${type}`
    },
    
    getTypeName(type) {
      const names = {
        rectangle: '矩形',
        polygon: '多边形',
        circle: '圆形'
      }
      return names[type] || type
    },
    
    formatTime(timestamp) {
      if (!timestamp) return '未知'
      const date = new Date(timestamp)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    
    loadDefaultBackground() {
      console.log(this.rowData)
      // 从后端接口获取表单数据，其中包含 uploadFiles 列表
      this.$api['baseData.getFormData']({ 
        dataId: this.rowData[0].FLOOR,
        desformCode: "floor",
      }).then((res) => {
        // 期望 res.primary.uploadFiles 为数组，优先使用第一个图片文件
        this.selections = JSON.parse(res.primary.table.PARAMS) || []
        const files = (res && res.primary.uploadFiles) ? res.primary.uploadFiles : []
        if (files.length > 0) {
          const file = files[0]
          // 如果有文件 id，则使用 SystemSettings.getFileUrl 获取二进制流
          if (file.id) {
            this.$api['SystemSettings.getFileUrl']({ attachmentId: file.id }, { responseType: 'blob' })
              .then((resp) => {
                try {
                  const blobUrl = window.URL.createObjectURL(new Blob([resp.data]))
                  const img = new Image()
                  img.onload = () => {
                    this.backgroundImage = img
                    this.backgroundDataURL = blobUrl
                    this.isImageLoaded = true
                    this.drawCanvas()
                  }
                  img.onerror = () => {
                    console.warn('图片加载失败，使用默认背景')
                    this.createFallbackBackground()
                  }
                  img.src = blobUrl
                } catch (e) {
                  console.error('处理图片流失败', e)
                  this.createFallbackBackground()
                }
              })
              .catch((err) => {
                console.error('获取图片流失败', err)
                this.createFallbackBackground()
              })
          } else if (file.filePath) {
            // 有时后端会直接返回可访问的 filePath（相对或绝对），直接使用
            const url = file.filePath
            const img = new Image()
            img.onload = () => {
              this.backgroundImage = img
              this.backgroundDataURL = url
              this.isImageLoaded = true
              this.drawCanvas()
            }
            img.onerror = () => {
              console.warn('filePath 图片加载失败，使用默认背景')
              this.createFallbackBackground()
            }
            img.src = url
          } else {
            // 无有效文件信息，回退默认背景
            this.createDefaultBackgroundImage().then(dataURL => {
              const img = new Image()
              img.src = dataURL
              img.onload = () => {
                this.backgroundImage = img
                this.backgroundDataURL = dataURL
                this.isImageLoaded = true
                this.drawCanvas()
              }
            }).catch(() => this.createFallbackBackground())
          }
        } else {
          // 没有 uploadFiles，使用默认背景
          this.createDefaultBackgroundImage().then(dataURL => {
            const img = new Image()
            img.src = dataURL
            img.onload = () => {
              this.backgroundImage = img
              this.backgroundDataURL = dataURL
              this.isImageLoaded = true
              this.drawCanvas()
            }
          }).catch(() => this.createFallbackBackground())
        }
      }).catch((error) => {
        console.error('请求 baseData.getFormData 失败', error)
        this.createFallbackBackground()
      })
    },
    
    createDefaultBackgroundImage() {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas')
        canvas.width = this.width
        canvas.height = this.height
        const ctx = canvas.getContext('2d')
        
        const gradient = ctx.createLinearGradient(0, 0, this.width, this.height)
        gradient.addColorStop(0, '#667eea')
        gradient.addColorStop(1, '#764ba2')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, this.width, this.height)
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.font = '24px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Canvas 柱网标注工具', this.width / 2, this.height / 2)
        
        ctx.font = '16px Arial'
        ctx.fillText('上传图片或绘制柱网', this.width / 2, this.height / 2 + 40)
        
        const dataURL = canvas.toDataURL('image/png')
        resolve(dataURL)
      })
    },
    
    createFallbackBackground() {
      this.ctx.fillStyle = '#f0f0f0'
      this.ctx.fillRect(0, 0, this.width, this.height)
      this.drawGrid(20, '#e0e0e0')
    },
    
    drawGrid(gridSize, color) {
      this.ctx.strokeStyle = color
      this.ctx.lineWidth = 0.5
      
      for (let x = 0; x <= this.width; x += gridSize) {
        this.ctx.beginPath()
        this.ctx.moveTo(x, 0)
        this.ctx.lineTo(x, this.height)
        this.ctx.stroke()
      }
      
      for (let y = 0; y <= this.height; y += gridSize) {
        this.ctx.beginPath()
        this.ctx.moveTo(0, y)
        this.ctx.lineTo(this.width, y)
        this.ctx.stroke()
      }
    },
    
    loadBackground(event) {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          this.backgroundImage = img
          this.backgroundDataURL = e.target.result
          this.isImageLoaded = true
          this.drawCanvas()
        }
        img.onerror = () => {
          alert('图片加载失败，请检查文件格式')
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    },
    
    drawCanvas() {
      this.ctx.clearRect(0, 0, this.width, this.height)
      
      if (this.backgroundImage && this.isImageLoaded) {
        this.ctx.drawImage(this.backgroundImage, 0, 0, this.width, this.height)
      } else {
        this.createFallbackBackground()
      }
      
      this.drawAllSelections()
      this.drawCurrentShape()
    },
    
    drawCurrentShape() {
      if (this.currentMode === 'rectangle' && this.isDrawing) {
        this.drawShape(this.startX, this.startY, this.currentX, this.currentY, 'rectangle', true)
      } else if (this.currentMode === 'polygon' && this.polygonPoints.length > 0) {
        this.drawPolygon(this.polygonPoints, true)
      } else if (this.currentMode === 'circle' && this.isDrawingCircle) {
        this.drawCircle(this.circleCenterX, this.circleCenterY, this.circleRadius, true)
      }
    },
    
    drawAllSelections() {
      if(this.selections.length > 0) {
        this.selections.forEach((selection, index) => {
        const isHighlighted = this.highlightedIndex === index
        const color = isHighlighted ? 'rgba(255, 215, 0, 0.5)' : selection.color || this.regionColors[selection.type]
        
        switch (selection.type) {
          case 'rectangle':
            this.drawShape(
              selection.startX,
              selection.startY,
              selection.endX,
              selection.endY,
              'rectangle',
              false,
              color,
              isHighlighted
            )
            break
          case 'polygon':
            this.drawPolygon(selection.points, false, color, isHighlighted)
            break
          case 'circle':
            this.drawCircle(
              selection.centerX,
              selection.centerY,
              selection.radius,
              false,
              color,
              isHighlighted
            )
            break
        }
      })
      }
      
    },
    
    drawShape(x1, y1, x2, y2, type = 'rectangle', isPreview = false, color = null, highlight = false) {
      const width = x2 - x1
      const height = y2 - y1
      
      this.ctx.save()
      
      if (isPreview) {
        // 预览时使用不透明颜色
        this.ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'
        this.ctx.strokeStyle = '#3B82F6'
      } else {
        // 完成绘制后使用半透明颜色
        this.ctx.fillStyle = color || this.regionColors[type]
        this.ctx.strokeStyle = this.getStrokeColor(color || this.regionColors[type])
      }
      
      this.ctx.lineWidth = highlight ? 3 : (isPreview ? 1 : 2)
      this.ctx.setLineDash(isPreview ? [5, 5] : [])
      
      // 绘制填充
      this.ctx.fillRect(x1, y1, width, height)
      
      // 绘制边框
      this.ctx.strokeRect(x1, y1, width, height)
      
      // 绘制角点
      if (!isPreview) {
        const cornerSize = 6
        this.ctx.fillStyle = this.ctx.strokeStyle
        this.ctx.fillRect(x1 - cornerSize/2, y1 - cornerSize/2, cornerSize, cornerSize)
        this.ctx.fillRect(x1 + width - cornerSize/2, y1 - cornerSize/2, cornerSize, cornerSize)
        this.ctx.fillRect(x1 - cornerSize/2, y1 + height - cornerSize/2, cornerSize, cornerSize)
        this.ctx.fillRect(x1 + width - cornerSize/2, y1 + height - cornerSize/2, cornerSize, cornerSize)
      }
      
      this.ctx.restore()
    },
    
    drawPolygon(points, isPreview = false, color = null, highlight = false) {
      if (points.length < 2) return
      
      this.ctx.save()
      
      if (isPreview) {
        // 预览时使用不透明颜色
        this.ctx.fillStyle = 'rgba(239, 68, 68, 0.2)'
        this.ctx.strokeStyle = '#EF4444'
      } else {
        // 完成绘制后使用半透明颜色
        this.ctx.fillStyle = color || this.regionColors.polygon
        this.ctx.strokeStyle = this.getStrokeColor(color || this.regionColors.polygon)
      }
      
      this.ctx.lineWidth = highlight ? 3 : (isPreview ? 1 : 2)
      this.ctx.setLineDash(isPreview ? [5, 5] : [])
      
      // 绘制填充
      this.ctx.beginPath()
      this.ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        this.ctx.lineTo(points[i].x, points[i].y)
      }
      
      if (!isPreview) {
        this.ctx.closePath()
      }
      
      this.ctx.fill()
      
      // 绘制边框
      this.ctx.beginPath()
      this.ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        this.ctx.lineTo(points[i].x, points[i].y)
      }
      
      if (isPreview && points.length > 1) {
        this.ctx.lineTo(this.currentX, this.currentY)
      }
      
      this.ctx.stroke()
      
      // 绘制顶点
      this.ctx.fillStyle = this.ctx.strokeStyle
      const pointSize = isPreview ? 4 : 6
      points.forEach(point => {
        this.ctx.beginPath()
        this.ctx.arc(point.x, point.y, pointSize, 0, Math.PI * 2)
        this.ctx.fill()
      })
      
      this.ctx.restore()
    },

    drawCircle(centerX, centerY, radius, isPreview = false, color = null, highlight = false) {
      this.ctx.save()
      
      if (isPreview) {
        // 预览时使用不透明颜色
        this.ctx.fillStyle = 'rgba(139, 92, 246, 0.2)'
        this.ctx.strokeStyle = '#8B5CF6'
      } else {
        // 完成绘制后使用半透明颜色
        this.ctx.fillStyle = color || this.regionColors.circle
        this.ctx.strokeStyle = this.getStrokeColor(color || this.regionColors.circle)
      }
      
      this.ctx.lineWidth = highlight ? 3 : (isPreview ? 1 : 2)
      this.ctx.setLineDash(isPreview ? [5, 5] : [])
      
      // 绘制圆形填充
      this.ctx.beginPath()
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      this.ctx.fill()
      
      // 绘制圆形边框
      this.ctx.beginPath()
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      this.ctx.stroke()
      
      // 绘制圆心
      if (!isPreview) {
        this.ctx.fillStyle = this.ctx.strokeStyle
        this.ctx.beginPath()
        this.ctx.arc(centerX, centerY, 4, 0, Math.PI * 2)
        this.ctx.fill()
      }
      
      this.ctx.restore()
    },
    
    // 从半透明颜色中提取不透明边框颜色
    getStrokeColor(rgbaColor) {
      // 如果是rgba格式，提取前三个颜色分量，设置alpha为1
      if (rgbaColor.startsWith('rgba')) {
        const match = rgbaColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d\.]+\)/)
        if (match) {
          return `rgb(${match[1]}, ${match[2]}, ${match[3]})`
        }
      }
      return rgbaColor
    },
    
    // 事件处理
    handleMouseDown(event) {
      if (!this.isImageLoaded) {
        alert('请先上传背景图片')
        return
      }
      
      const rect = this.canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      switch (this.currentMode) {
        case 'rectangle':
          this.startRectangle(x, y)
          break
        case 'polygon':
          this.addPolygonPoint(x, y)
          break
        case 'circle':
          this.startCircle(x, y)
          break
      }
    },
    
    handleMouseMove(event) {
      if (!this.isImageLoaded) return
      
      const rect = this.canvas.getBoundingClientRect()
      this.currentX = Math.max(0, Math.min(event.clientX - rect.left, this.width))
      this.currentY = Math.max(0, Math.min(event.clientY - rect.top, this.height))
      
      switch (this.currentMode) {
        case 'rectangle':
          this.updateRectangle()
          break
        case 'polygon':
          this.updatePolygonPreview()
          break
        case 'circle':
          this.updateCircle()
          break
      }
      
      this.drawCanvas()
    },
    
    handleMouseUp() {
      switch (this.currentMode) {
        case 'rectangle':
          this.endRectangle()
          break
        case 'circle':
          this.endCircle()
          break
      }
    },
    
    handleMouseLeave() {
     if (this.currentMode === 'rectangle' && this.isDrawing) {
        this.endRectangle()
      } else if (this.currentMode === 'circle' && this.isDrawingCircle) {
        this.endCircle()
      }
    },
    
    handleDoubleClick() {
      if (this.currentMode === 'polygon' && this.polygonPoints.length >= 3) {
        this.completePolygon()
      }
    },
    
    // 矩形模式方法
    startRectangle(x, y) {
      this.startX = x
      this.startY = y
      this.currentX = x
      this.currentY = y
      this.isDrawing = true
    },
    
    updateRectangle() {},
    
    endRectangle() {
      if (!this.isDrawing) return
      
      this.isDrawing = false
      
      if (Math.abs(this.currentX - this.startX) > 5 && Math.abs(this.currentY - this.startY) > 5) {
        const selection = {
          id: this.generateId(),
          type: 'rectangle',
          startX: Math.min(this.startX, this.currentX),
          startY: Math.min(this.startY, this.currentY),
          endX: Math.max(this.startX, this.currentX),
          endY: Math.max(this.startY, this.currentY),
          width: Math.abs(this.currentX - this.startX),
          height: Math.abs(this.currentY - this.startY),
          color: this.regionColors.rectangle,
          createdAt: Date.now(),
          contractId: this.rowData[0].ID
        }
        this.selections.push(selection)
      }
      
      this.drawCanvas()
    },
    
    // 多边形模式方法
    addPolygonPoint(x, y) {
      if (!this.isDrawingPolygon) {
        this.isDrawingPolygon = true
        this.polygonPoints = []
      }
      
      this.polygonPoints.push({ x, y })
      this.drawCanvas()
    },
    
    updatePolygonPreview() {},
    
    completePolygon() {
      if (this.polygonPoints.length >= 3) {
        const bounds = this.calculateBounds(this.polygonPoints)
        
        const selection = {
          id: this.generateId(),
          type: 'polygon',
          points: [...this.polygonPoints],
          bounds: bounds,
          color: this.regionColors.polygon,
          createdAt: Date.now(),
          contractId: this.rowData[0].ID
        }
        
        this.selections.push(selection)
        this.resetPolygon()
      }
    },
    
    undoLastPoint() {
      if (this.polygonPoints.length > 0) {
        this.polygonPoints.pop()
        this.drawCanvas()
      }
    },
    
    resetPolygon() {
      this.polygonPoints = []
      this.isDrawingPolygon = false
      this.drawCanvas()
    },
    
    // 圆形模式方法
    startCircle(x, y) {
      this.circleCenterX = x
      this.circleCenterY = y
      this.circleRadius = 0
      this.isDrawingCircle = true
    },
    
    updateCircle() {
      if (this.isDrawingCircle) {
        const dx = this.currentX - this.circleCenterX
        const dy = this.currentY - this.circleCenterY
        this.circleRadius = Math.sqrt(dx * dx + dy * dy)
      }
    },
    
    endCircle() {
      if (!this.isDrawingCircle) return
      
      this.isDrawingCircle = false
      
      if (this.circleRadius > 5) {
        const selection = {
          id: this.generateId(),
          type: 'circle',
          centerX: this.circleCenterX,
          centerY: this.circleCenterY,
          radius: this.circleRadius,
          diameter: this.circleRadius * 2,
          color: this.regionColors.circle,
          createdAt: Date.now(),
          contractId: this.rowData[0].ID
        }
        
        this.selections.push(selection)
      }
      
      this.drawCanvas()
    },
    
    // 工具方法
    calculateBounds(points) {
      if (points.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 }
      
      let minX = points[0].x
      let minY = points[0].y
      let maxX = points[0].x
      let maxY = points[0].y
      
      points.forEach(point => {
        minX = Math.min(minX, point.x)
        minY = Math.min(minY, point.y)
        maxX = Math.max(maxX, point.x)
        maxY = Math.max(maxY, point.y)
      })
      
      return {
        minX, minY, maxX, maxY,
        width: maxX - minX,
        height: maxY - minY
      }
    },
    
    generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2)
    },
    
    cancelCurrentDrawing() {
      this.isDrawing = false
      this.isDrawingPolygon = false
      this.isDrawingCircle = false
      this.polygonPoints = []
      this.drawCanvas()
    },
    
    removeSelection(index) {
      this.selections.splice(index, 1)
      this.drawCanvas()
    },
    
    togglePoints(index) {
      this.$set(this.showPoints, index, !this.showPoints[index])
    },
    
    toggleAllPoints() {
      this.showAllPoints = !this.showAllPoints
    },
    
    highlightSelection(index) {
      this.highlightedIndex = this.highlightedIndex === index ? null : index
      this.drawCanvas()
    },
    
    clearAllSelections() {
      this.selections = []
      this.showPoints = {}
      this.highlightedIndex = null
      this.drawCanvas()
    },
    
    saveRegionData() {
      const newJsonString = JSON.stringify(this.selections)
      this.$api['baseData.saveFloorData']({
        id: this.rowData[0].FLOOR,
        params: newJsonString,
      }).then((res) => {
        alert('柱网数据保存成功')
      }).catch((error) => {
        console.error('保存柱网数据失败', error)
        alert('保存柱网数据失败: ' + error.message)
      })
      // if (this.selections.length === 0) {
      //   alert('没有可保存的区域数据')
      //   return
      // }
      // const regionData = {
      //   version: '1.0',
      //   createdAt: new Date().toISOString(),
      //   canvasSize: {
      //     width: this.width,
      //     height: this.height
      //   },
      //   backgroundInfo: {
      //     hasBackground: this.isImageLoaded,
      //     backgroundType: this.backgroundDataURL ? 'image' : 'default'
      //   },
      //   selections: this.selections,
      //   totalRegions: this.selections.length
      // }
      
      // this.previewData = JSON.stringify(regionData, null, 2)
      // this.showPreview = true
    },
    
    copyCoordinates() {
      if (this.selections.length === 0) {
        alert('暂无框选柱网')
        return
      }
      
      const coordText = this.selections.map((sel, index) => {
        let text = `柱网 ${index + 1} [${this.getTypeName(sel.type)}]: `
        
        switch (sel.type) {
          case 'rectangle':
            text += `起点(${Math.round(sel.startX)}, ${Math.round(sel.startY)}) - 终点(${Math.round(sel.endX)}, ${Math.round(sel.endY)}) 宽:${Math.round(sel.width)} 高:${Math.round(sel.height)}`
            break
          case 'polygon':
            text += `顶点数:${sel.points.length} 边界框:(${Math.round(sel.bounds.minX)}, ${Math.round(sel.bounds.minY)})-(${Math.round(sel.bounds.maxX)}, ${Math.round(sel.bounds.maxY)})`
            break
          case 'circle':
            text += `圆心(${Math.round(sel.centerX)}, ${Math.round(sel.centerY)}) 半径:${Math.round(sel.radius)} 直径:${Math.round(sel.diameter)}`
            break
        }
        
        return text
      }).join('\n')
      
      navigator.clipboard.writeText(coordText).then(() => {
        alert('坐标已复制到剪贴板')
      }).catch(err => {
        console.error('复制失败:', err)
        const textArea = document.createElement('textarea')
        textArea.value = coordText
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert('坐标已复制到剪贴板')
      })
    },
    
    clearBackground() {
      if (confirm('确定要清除背景图吗？这不会清除已绘制的柱网。')) {
        this.backgroundImage = null
        this.backgroundDataURL = null
        this.isImageLoaded = false
        this.drawCanvas()
      }
    },
    
    saveCanvas() {
      const dataURL = this.canvas.toDataURL('image/png')
      const link = document.createElement('a')
      const timestamp = new Date().getTime()
      link.download = `canvas-regions-${timestamp}.png`
      link.href = dataURL
      link.click()
    },
    
    copyPreviewData() {
      navigator.clipboard.writeText(this.previewData).then(() => {
        alert('JSON数据已复制到剪贴板')
      })
    },
    
    downloadPreviewData() {
      const blob = new Blob([this.previewData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const timestamp = new Date().getTime()
      link.download = `region-data-${timestamp}.json`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
      this.closePreview()
    },
    
    closePreview() {
      this.showPreview = false
    },
    
    zoomToSelection(selection) {
      this.zoomedSelection = selection
      this.$nextTick(() => {
        this.initZoomCanvas()
      })
    },
    
    initZoomCanvas() {
      if (!this.zoomedSelection) return
      
      const canvas = this.$refs.zoomCanvas
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      
      ctx.clearRect(0, 0, this.zoomWidth, this.zoomHeight)
      
      let bounds
      switch (this.zoomedSelection.type) {
        case 'rectangle':
          bounds = {
            x: this.zoomedSelection.startX,
            y: this.zoomedSelection.startY,
            width: this.zoomedSelection.width,
            height: this.zoomedSelection.height
          }
          break
        case 'polygon':
          bounds = this.zoomedSelection.bounds
          break
        case 'circle':
          bounds = {
            x: this.zoomedSelection.centerX - this.zoomedSelection.radius,
            y: this.zoomedSelection.centerY - this.zoomedSelection.radius,
            width: this.zoomedSelection.radius * 2,
            height: this.zoomedSelection.radius * 2
          }
          break
      }
      
      const padding = 20
      const drawX = bounds.x - padding
      const drawY = bounds.y - padding
      const drawWidth = bounds.width + padding * 2
      const drawHeight = bounds.height + padding * 2
      
      if (this.backgroundImage) {
        ctx.drawImage(
          this.backgroundImage,
          drawX, drawY, drawWidth, drawHeight,
          0, 0, this.zoomWidth, this.zoomHeight
        )
      } else {
        ctx.fillStyle = '#f0f0f0'
        ctx.fillRect(0, 0, this.zoomWidth, this.zoomHeight)
      }
      
      const scaleX = this.zoomWidth / drawWidth
      const scaleY = this.zoomHeight / drawHeight
      const scale = Math.min(scaleX, scaleY)
      
      ctx.save()
      ctx.scale(scale, scale)
      ctx.translate(-drawX, -drawY)
      
      const color = this.zoomedSelection.color || this.regionColors[this.zoomedSelection.type]
      
      switch (this.zoomedSelection.type) {
        case 'rectangle':
          this.drawShape(
            this.zoomedSelection.startX,
            this.zoomedSelection.startY,
            this.zoomedSelection.endX,
            this.zoomedSelection.endY,
            'rectangle',
            false,
            color,
            true
          )
          break
        case 'polygon':
          this.drawPolygon(this.zoomedSelection.points, false, color, true)
          break
        case 'circle':
          this.drawCircle(
            this.zoomedSelection.centerX,
            this.zoomedSelection.centerY,
            this.zoomedSelection.radius,
            false,
            color,
            true
          )
          break
      }
      
      ctx.restore()
    },
    
    closeZoom() {
      this.zoomedSelection = null
    }
  }
}
</script>

<style scoped>
.canvas-container {
  /* padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  max-width: 1000px;
  margin: 20px auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); */

}

canvas {
  display: block;
  border: 3px solid white;
  border-radius: 8px;
  margin-bottom: 25px;
  background: #f8f9fa;
  cursor: crosshair;
  user-select: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.control-panel {
  background: white;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 25px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.mode-selector {
  margin-bottom: 25px;
}

.mode-selector h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #2d3748;
  font-size: 18px;
  font-weight: 600;
}

.mode-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.mode-buttons button {
  padding: 12px 24px;
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  min-width: 120px;
}

.mode-buttons button:hover {
  background: #edf2f7;
  transform: translateY(-2px);
}

.mode-buttons button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.file-controls {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.file-group {
  flex: 1;
  min-width: 200px;
}

.file-label {
  display: block;
  padding: 15px;
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(66, 153, 225, 0.3);
}

.file-label:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(66, 153, 225, 0.4);
}

.file-label input[type="file"] {
  display: none;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-buttons button {
  padding: 12px 20px;
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 160px;
}

.action-buttons button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
}

.action-buttons button:nth-child(2) {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
}

.action-buttons button:nth-child(3) {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
}

.action-buttons button:nth-child(4) {
  background: linear-gradient(135deg, #805ad5 0%, #6b46c1 100%);
}

.polygon-controls {
  display: flex;
  gap: 12px;
  background: #f7fafc;
  padding: 15px;
  border-radius: 8px;
  margin-top: 10px;
}

.polygon-controls button {
  padding: 10px 16px;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  flex: 1;
}

.polygon-controls button:hover {
  background: #3182ce;
}

.instructions {
  background: linear-gradient(135deg, #d6bcfa 0%, #b794f4 100%);
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(183, 148, 244, 0.3);
}

.instructions p {
  margin: 0;
}

.coordinates-info {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e2e8f0;
}

.info-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 20px;
}

.info-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.region-count {
  background: #edf2f7;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
}

.toggle-all-btn {
  padding: 8px 16px;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.toggle-all-btn:hover {
  background: #3182ce;
}

.coordinate-item {
  background: #f8fafc;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 15px;
  border-left: 5px solid #4299e1;
  transition: all 0.3s ease;
}

.coordinate-item:hover {
  transform: translateX(5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.selection-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selection-type {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  color: white;
}

.type-rectangle {
  background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
}

.type-polygon {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
}
.type-circle {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
}

.selection-index {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.selection-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  background: #e2e8f0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #cbd5e0;
  transform: scale(1.1);
}

.remove-btn {
  padding: 6px 16px;
  background: #fc8181;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.remove-btn:hover {
  background: #f56565;
}

.coordinate-details {
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.detail-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f7fafc;
}

.detail-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.detail-label {
  min-width: 80px;
  font-weight: 600;
  color: #4a5568;
  font-size: 14px;
}

.detail-value {
  margin-left: 10px;
  color: #2d3748;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.toggle-btn {
  margin-left: auto;
  padding: 4px 12px;
  background: #a0aec0;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.toggle-btn:hover {
  background: #718096;
}

.polygon-points {
  margin-top: 15px;
  padding: 15px;
  background: #f7fafc;
  border-radius: 6px;
}

.points-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.point-item {
  padding: 8px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.point-index {
  font-weight: 600;
  color: #4a5568;
  font-size: 12px;
}

.point-coords {
  margin-left: 8px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #2d3748;
}

.region-meta {
  display: flex;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #e2e8f0;
}

.meta-label {
  font-size: 12px;
  color: #a0aec0;
  margin-right: 8px;
}

.meta-value {
  font-size: 12px;
  color: #718096;
  margin-right: 15px;
}

.color-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 模态框样式 */
.preview-modal, .zoom-view {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.preview-content, .zoom-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.preview-header, .zoom-header {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-header h3, .zoom-header h3 {
  margin: 0;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 28px;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.preview-body {
  padding: 20px;
  overflow: auto;
  max-height: 60vh;
  background: #1a202c;
}

.preview-body pre {
  margin: 0;
  color: #cbd5e0;
  font-size: 13px;
  line-height: 1.5;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
}

.preview-footer {
  padding: 20px;
  display: flex;
  gap: 12px;
  background: #f7fafc;
  border-top: 1px solid #e2e8f0;
}

.copy-btn, .download-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.copy-btn {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  color: white;
}

.download-btn {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
}

.copy-btn:hover, .download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.zoom-content {
  max-width: 600px;
}

.zoom-canvas {
  display: block;
  width: 100%;
  height: 400px;
  background: #f8f9fa;
  border-bottom: 1px solid #e2e8f0;
}

.zoom-info {
  padding: 15px;
  text-align: center;
  font-weight: 600;
  color: #4a5568;
}
::v-deep .list-main {
  overflow: scroll !important;
}
</style>