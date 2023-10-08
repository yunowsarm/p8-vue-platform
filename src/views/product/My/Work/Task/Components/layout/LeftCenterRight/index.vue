<template>
  <div id="lcr-layout">
    <el-row v-if="!isSplit"
            :gutter="10"
            style="height: 100%">
      <el-col :span="4"
              style="height: 100%">
        <div id="lcr-left-con">
          <slot name="left"></slot>
        </div>
      </el-col>
      <el-col :span="16"
              style="height: 100%">
        <div id="lcr-center-con">
          <slot name="center"></slot>
        </div>
      </el-col>
      <el-col :span="4"
              style="height: 100%">
        <div id="lcr-right-con">
          <slot name="right"></slot>
        </div>
      </el-col>
    </el-row>
    <split-pane v-else
                split="vertical"
                :min-percent="0"
                :max-percent="30"
                :default-percent="percentLeft"
                @resize="outResize">
      <template #paneL>
        <div class="splitter-line-arrow left"
             v-if="!leftVisible"
             @click="resetList">
          <i class="p8 icon-youshoujin"
             style="color: #79bcfa;"></i>
        </div>
        <div id="lcr-left-con"
             :style="{opacity: leftVisible}">
          <slot name="left"></slot>
        </div>
      </template>
      <template #paneR>
        <split-pane split="vertical"
                    :min-percent="0"
                    :max-percent="75"
                    :default-percent="percentRight"
                    @resize="innerResize">
          <template #paneL>
            <div id="lcr-center-con">
              <slot name="center"></slot>
            </div>
          </template>
          <template #paneR
                    v-if="!hideRight">
            <div class="splitter-line-arrow right"
                 v-if="!rightVisible"
                 @click="resetRight">
              <i class="p8 icon-zuoshoujin"
                 style="color: #79bcfa;"></i>
            </div>
            <div id="lcr-right-con"
                 :style="{opacity: rightVisible}">
              <slot name="right"></slot>
            </div>
          </template>
        </split-pane>
      </template>
    </split-pane>
  </div>
</template>
<script>
import { Row, Col } from 'p8-components-ui'
import SplitPane from 'vue-splitpane'
export default {
  name: 'LeftCenterRightLayout',
  props: {
    isSplit: {
      type: Boolean,
      default: true
    },
    percentLeft: {
      type: Number,
      default: 20
    },
    percentRight: {
      type: Number,
      default: 75
    }
  },
  components: {
    'el-row': Row,
    'el-col': Col,
    SplitPane
  },
  watch: {
    percentRight: {
      handler (val) {
        if (val >= 100) {
          this.hideRight = true
        }
      },
      immediate: true
    }
  },
  data () {
    return {
      leftVisible: 1,
      rightVisible: 1,
      hideRight: false
    }
  },
  mounted () {
    let _this = this
    this.$bus.$on('split-pane-left', function (e) {
      _this.$children[0].percent = 0
      _this.leftVisible = 0
    })
    this.$bus.$on('split-pane-right', function (e) {
      const outChildInRight = _this.$children[0].$children[2].$children[0]
      outChildInRight.percent = 100
      _this.rightVisible = 0
    })
  },
  methods: {
    outResize (e) {
      if (this.$children[0].percent > 30) { this.$children[0].percent = 30 }
      this.leftVisible = e < 1 ? 0 : 1
    },
    innerResize (e) {
      const outChildInRight = this.$children[0].$children[2].$children[0]
      if (outChildInRight.percent < 50) { outChildInRight.percent = 50 }
      this.rightVisible = e < 97 ? 1 : 0
    },
    resetList () {
      this.$children[0].percent = this.percentLeft
      this.leftVisible = 1
    },
    resetRight () {
      const outChildInRight = this.$children[0].$children[2].$children[0]
      outChildInRight.percent = this.percentRight
      this.rightVisible = 1
    }
  }
}
</script>
<style lang="scss">
#lcr-layout,
#lcr-left-con,
#lcr-center-con,
#lcr-right-con {
  box-sizing: border-box;
  height: 100%;
}
#lcr-layout {
  overflow-x: hidden;
  padding: 0 10px 10px;
}
#lcr-left-con {
  padding-right: 6px;
}
#lcr-center-con {
  padding: 0 6px;
}
#lcr-right-con {
  padding-left: 6px;
}
.splitter-line-arrow {
  position: absolute;
  top: 50%;
  z-index: 20;
  transform: translate(-50%, -50%);
  &.left {
    left: -2px;
  }
  &.right {
    right: -16px;
  }
  i {
    font-size: 14px;
  }
}
.splitter-pane-resizer {
  background: transparent !important;
  &.vertical {
    border: none !important;
  }
  &:hover {
    background: rgba(0, 0, 0, 0.8) !important;
  }
}
</style>
