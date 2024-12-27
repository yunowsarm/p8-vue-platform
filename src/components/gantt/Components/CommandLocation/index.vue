<template>
  <!-- 可拖动、可缩放的弹框 -->
  <div v-if="dialogVisible"
       class="resizable-dialog"
       :style="dialogStyle"
       ref="dialog"
       @mousedown="startDrag"
       :class="{ dragging: isDragging }">
    <div class="dialog-header">
      <span>定位</span>
      <i class="el-icon-close"
         style="font-size: 20px;cursor: pointer;"
         @click="closeDialog"></i>
    </div>
    <slot></slot>
    <div class="resize-handle bottom-right"
         @mousedown="startResize('bottom-right')"></div>
  </div>
</template>

<script>
export default {
  props: ['visible'],
  components: {
  },
  data () {
    return {
      dialogVisible: this.visible,  // 控制弹框的显示与隐藏
      dialogStyle: {
        left: '50%',
        top: '35%',
        width: '60%',
        height: '60%',
        transform: 'translate(-50%, -50%)'
      },  // 弹框的初始位置和大小
      isDragging: false,  // 是否正在拖动
      isResizing: false,  // 是否正在缩放
      resizeDirection: '',  // 当前缩放的方向
      dragStart: { x: 0, y: 0 },  // 记录拖动的起始位置
      resizeStart: { x: 0, y: 0, width: 0, height: 0 },  // 记录缩放的起始位置
    };
  },
  methods: {
    // 打开弹框时禁用默认关闭行为
    closeDialog () {
      this.dialogVisible = false;
      this.$emit('close')
    },

    // 开始拖动
    startDrag (event) {
      // if (event.target !== this.$refs.dialog.querySelector('.dialog-header')) return;  // 只在标题栏区域拖动
      this.isDragging = true;
      this.dragStart.x = event.clientX - this.$refs.dialog.offsetLeft;
      this.dragStart.y = event.clientY - this.$refs.dialog.offsetTop;
      document.addEventListener('mousemove', this.dragMove);
      document.addEventListener('mouseup', this.stopDrag);
    },

    // 拖动过程中
    dragMove (event) {
      if (!this.isDragging) return;
      const left = event.clientX - this.dragStart.x;
      const top = event.clientY - this.dragStart.y;
      this.dialogStyle.left = `${left}px`;
      this.dialogStyle.top = `${top}px`;
    },

    // 停止拖动
    stopDrag () {
      this.isDragging = false;
      document.removeEventListener('mousemove', this.dragMove);
      document.removeEventListener('mouseup', this.stopDrag);
    },

    // 开始缩放
    startResize (direction) {
      this.isResizing = true;
      this.resizeDirection = direction;
      const rect = this.$refs.dialog.getBoundingClientRect();
      this.resizeStart.x = rect.left;
      this.resizeStart.y = rect.top;
      // this.resizeStart.width = rect.width;
      // this.resizeStart.height = rect.height;

      document.addEventListener('mousemove', this.resizeMove);
      document.addEventListener('mouseup', this.stopResize);
    },

    // 缩放过程中
    resizeMove (event) {
      if (!this.isResizing) return;
      let newWidth = this.resizeStart.width;
      let newHeight = this.resizeStart.height;
      let newLeft = this.resizeStart.x;
      let newTop = this.resizeStart.y;

      if (this.resizeDirection.includes('right')) {
        newWidth = event.clientX - this.resizeStart.x;
      }
      if (this.resizeDirection.includes('bottom')) {
        newHeight = event.clientY - this.resizeStart.y;
      }
      // if (this.resizeDirection.includes('left')) {
      //   newLeft = 0;
      //   newWidth = 0;
      // }
      // if (this.resizeDirection.includes('top')) {
      //   newTop = 0;
      //   newHeight = 0;
      // }

      this.dialogStyle.width = `${newWidth}px`;
      this.dialogStyle.height = `${newHeight}px`;
      // this.dialogStyle.left = `${newLeft}px`;
      // this.dialogStyle.top = `${newTop}px`;
    },

    // 停止缩放
    stopResize () {
      this.isResizing = false;
      document.removeEventListener('mousemove', this.resizeMove);
      document.removeEventListener('mouseup', this.stopResize);
    },
  }
};
</script>

<style scoped>
/* 弹框样式 */
.resizable-dialog {
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  cursor: move;
  box-sizing: border-box;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: #ffffff;
  cursor: move;
}

.dialog-content {
  padding: 10px;
  text-align: center;
}

/* 弹框的四个角缩放按钮 */
.resize-handle {
  position: absolute;
  background-color: #ccc;
  width: 10px;
  height: 10px;
  cursor: pointer;
}

.bottom-right {
  bottom: 0;
  right: 0;
  cursor: nwse-resize;
}

.dragging {
  cursor: grabbing;
}
</style>
