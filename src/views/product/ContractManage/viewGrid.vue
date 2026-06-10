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
      
      // 区域颜色映射 - 使用半透明颜色
      regionColors: {
        rectangle: 'rgba(59, 130, 246, 0.3)', // 蓝色，30%透明度
        polygon: 'rgba(239, 68, 68, 0.3)',    // 红色，30%透明度
        circle: 'rgba(139, 92, 246, 0.3)'     // 紫色，30%透明度
      }
    }
  },
  mounted() {
    this.initCanvas()
    this.loadDefaultBackground()
  },

  methods: {
    initCanvas() {
      this.canvas = this.$refs.canvas
      this.ctx = this.canvas.getContext('2d')
      this.canvas.style.cursor = 'crosshair'
    },
    
    loadDefaultBackground() {
      // 从后端接口获取表单数据，其中包含 uploadFiles 列表
      this.$api['baseData.getFormData']({ 
        dataId: this.rowData[0].ID,
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
        // ctx.fillText('Canvas 区域标注工具', this.width / 2, this.height / 2)
        
        // ctx.font = '16px Arial'
        ctx.fillText('请在表单中上传柱网图片附件', this.width / 2, this.height / 2)
        
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
          const color = selection.color || this.regionColors[selection.type]
          
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
                false
              )
              break
            case 'polygon':
              this.drawPolygon(selection.points, false, color, false)
              break
            case 'circle':
              this.drawCircle(
                selection.centerX,
                selection.centerY,
                selection.radius,
                false,
                color,
                false
              )
              break
          }
        })
      }
    },
    
    drawShape(startX, startY, endX, endY, type, isCurrent, color = null, isHighlighted = false) {
      this.ctx.save()
      
      const drawColor = color || this.regionColors[type]
      this.ctx.fillStyle = drawColor
      
      const width = endX - startX
      const height = endY - startY
      
      if (type === 'rectangle') {
        this.ctx.fillRect(startX, startY, width, height)
        
        if (isCurrent || isHighlighted) {
          this.ctx.strokeStyle = isHighlighted ? '#ffd700' : '#000'
          this.ctx.lineWidth = 2
          this.ctx.strokeRect(startX, startY, width, height)
        }
      }
      
      this.ctx.restore()
    },
    
    drawPolygon(points, isCurrent, color = null, isHighlighted = false) {
      if (points.length < 2) return
      
      this.ctx.save()
      
      const drawColor = color || this.regionColors.polygon
      this.ctx.fillStyle = drawColor
      
      this.ctx.beginPath()
      this.ctx.moveTo(points[0].x, points[0].y)
      
      for (let i = 1; i < points.length; i++) {
        this.ctx.lineTo(points[i].x, points[i].y)
      }
      
      if (points.length >= 3) {
        this.ctx.closePath()
        this.ctx.fill()
      } else {
        this.ctx.stroke()
      }
      
      if (isCurrent || isHighlighted) {
        this.ctx.strokeStyle = isHighlighted ? '#ffd700' : '#000'
        this.ctx.lineWidth = 2
        this.ctx.stroke()
      }
      
      this.ctx.restore()
    },
    
    drawCircle(centerX, centerY, radius, isCurrent, color = null, isHighlighted = false) {
      this.ctx.save()
      
      const drawColor = color || this.regionColors.circle
      this.ctx.fillStyle = drawColor
      
      this.ctx.beginPath()
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      this.ctx.fill()
      
      if (isCurrent || isHighlighted) {
        this.ctx.strokeStyle = isHighlighted ? '#ffd700' : '#000'
        this.ctx.lineWidth = 2
        this.ctx.stroke()
      }
      
      this.ctx.restore()
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
    }
  }
}
</script>

<style scoped>
.canvas-container {
  /* 保留原有样式 */
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

::v-deep .list-main {
  overflow: scroll !important;
}
</style>