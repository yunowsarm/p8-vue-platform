<template>
  <smart-widget ref="widget" v-bind="$attrs" v-on="$listeners" :loading="loading" refresh @on-fullscreen="onFullscreen" @on-refresh="handleRefresh">
    <template slot="toolbar"> </template>
    <a href="javascript:;" style="position: absolute; right: 5px; top: 5px" v-if="isDesign">
      <template>
        <el-dropdown trigger="click">
          <i class="el-icon-setting" style="line-height: 24px; font-size: 16px"></i>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="setWidget(widget)">设置</el-dropdown-item>
            <el-dropdown-item @click.native="deleteWidget($attrs)">删除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </a>
    <div :key="renderTime" :style="childrenStyle">
      <slot v-bind="$attrs" />
    </div>
  </smart-widget>
</template>

<script>
import { PopupManager } from 'p8-components-ui'
import { SmartWidget } from 'p8-vue-smart-widget'
import _debounce from 'lodash/debounce'

export default {
  name: 'Widgetitem',
  inject: ['deleteWidget', 'setWidget'],
  components: {
    SmartWidget
  },
  props: {
    record: {
      type: Object,
      default: () => {}
    },
    widget: {
      type: Object,
      default: () => {},
      require: true
    },
    isDesign: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      loading: false,
      childrenStyle: {
        width: '100%',
        height: '100%'
      },
      renderStatus: false,
      renderTime: new Date().getTime()
    }
  },
  mounted() {
    console.log('widget-item mounted')
    this.$watch(
      'widget.style',
      (newValue, oldValue) => {
        // console.log('widget.style watch', newValue)
        if (!newValue) return
        for (let key in newValue) {
          this.$refs.widget.$parent.$parent.$el.style[key.replace(/[A-Z]/g, '-$&').toLowerCase()] = newValue[key]
        }
      },
      {
        immediate: true,
        deep: true
      }
    )
    this.mountEvent()
  },
  beforDestroyed() {
    let dom = this.$el
    this.$erd.removeAllListeners(dom)
  },
  methods: {
    mountEvent() {
      // let delay = this.isDesign ? 50 : 50
      let delay = 0
      let dom = this.$el
      // console.log('dom', dom.style)
      this.$erd.listenTo(
        dom,
        _debounce((element) => {
          // console.log('element', element.style)
          this.$emit('widget-resize', this.widget)
          // console.log('resizeTime-update:', this.resizeTime)
        }, delay)
      )
    },
    onLayoutUpdated(newLayout) {
      console.log(JSON.stringify(newLayout))
    },
    onMove(params) {
      console.log(params)
    },
    onResize(i, newH, newW, newHPx, newWPx) {
      console.log('ddd', i, newH, newW, newHPx, newWPx)
    },
    handleRefresh() {
      // this.loading = false
      console.log('this.renderTime :')
      this.renderTime = new Date().getTime()
    },
    onFullscreen(booleanParams) {
      if (booleanParams) {
        this.$refs.widget.$el.style.zIndex = PopupManager.nextZIndex()
      } else {
        this.$refs.widget.$el.style.zIndex = null
      }
      // console.log('PopupManager.nextZIndex()>>>>>>>>', PopupManager.nextZIndex())
    }
  }
}
</script>
<style lang="scss" scoped>
// 解决smartwidget在添加元素宽度变化监听的时候 加了行内样式影响全屏功能
.smartwidget.smartwidget-fullscreen /deep/ {
  position: fixed !important;
}
// 解决容器内容高度超过夫容器高度问题
.smartwidget /deep/ .widget-body__content {
  height: 100%;
  box-sizing: border-box;
}
</style>
