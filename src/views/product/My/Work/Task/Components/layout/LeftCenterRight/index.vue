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
                :default-percent="layoutSetting.leftPercent"
                @resize="outResize">
      <template #paneL>
        <div class="splitter-line-arrow left"
             v-if="!leftVisible"
             @click="resetList">
          <i class="p8 icon-youshoujin"
             style="color: #79bcfa"></i>
        </div>
        <div id="lcr-left-con"
             :style="{ opacity: leftVisible }">
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
                 style="color: #79bcfa"></i>
            </div>
            <div id="lcr-right-con">
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
import _debounce from 'lodash/debounce'

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
    },
    type: {
      type: Boolean,
      default: false
    },
    layoutCode: {
      type: String,
      default: null
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
    const { API_DEFAULT_CONFIG } = this.$sysConfig
    return {
      api_default_config: API_DEFAULT_CONFIG,
      constSettingParams: {
        type: 'layout',
        description: 'default-percent'
      },
      leftVisible: 1,
      rightVisible: 1,
      hideRight: false,
      layoutSetting: {}
    }
  },
  created () {
    this.saveDefaultPercent = _debounce(this.saveDefaultPercent, 500)
  },
  async mounted () {
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
    if (this.type) {
      const outChildInRight = _this.$children[0].$children[2].$children[0]
      outChildInRight.percent = 100
      _this.rightVisible = 0
    }
    this.layoutSetting = await this.getDefaultPercent()
  },
  methods: {
    getDefaultPercent () {
      return new Promise((resolve) => {
        const _this = this
        let leftPercent = _this.percentLeft
        let rightPercent = _this.percentRight
        let layoutSettingAll = _this.$store.state.user.userSettingAll?.layout ? this.$store.state.user.userSettingAll.layout : null
        console.log(layoutSettingAll, 'layoutSettingAll')
        if (layoutSettingAll) {
          console.log(_this.layoutCode, 'layoutCode1111')
          let key = ''
          if (_this.layoutCode) {
            key = _this.layoutCode
          } else {
            key = _this.$route.path
          }
          let currLayoutSetting = layoutSettingAll.find((item) => item.key === key)
          if (currLayoutSetting) {
            console.log(currLayoutSetting, 'currLayoutSetting')
            leftPercent = currLayoutSetting.value.leftPercent
            rightPercent = currLayoutSetting.value.rightPercent
          }
        }
        resolve({
          leftPercent, rightPercent
        })
      })
    },
    outResize (e) {
      console.log(e)
      let leftPercent = e
      if (this.$children[0].percent > 30) {
        this.$children[0].percent = 30
        leftPercent = 30
      }
      this.leftVisible = e < 1 ? 0 : 1
      this.layoutSetting.leftPercent = leftPercent
      this.saveDefaultPercent()
    },
    innerResize (e) {
      console.log(e)
      let rightPercent = e
      const outChildInRight = this.$children[0].$children[2].$children[0]
      if (outChildInRight.percent < 50) {
        outChildInRight.percent = 50
        rightPercent = 50
      }
      this.rightVisible = e < 97 ? 1 : 0
      this.layoutSetting.rightPercent = rightPercent
      this.saveDefaultPercent()
    },
    resetList () {
      this.$children[0].percent = this.layoutSetting.leftPercent
      this.leftVisible = 1
    },
    resetRight () {
      const outChildInRight = this.$children[0].$children[2].$children[0]
      outChildInRight.percent = this.layoutSetting.rightPercent
      this.rightVisible = 1
    },
    saveDefaultPercent () {
      const _this = this
      const url = '/framework/user/setting/save'
      let obj = _this.saveSettingOtherHandle(url)
      let params = [
        {
          id: obj.id,
          key: obj.key,
          description: obj.description,
          type: obj.type,
          value: JSON.stringify(this.layoutSetting)
        }
      ]
      /** 使用$ajax请求: 是因为 this.$api请求会将请求参数处理成对象, 而保存设置接口请求参数为数组 */
      _this.$ajax
        .post(obj.postUrl, params, { headers: { Authorization: this.$store.getters.token } })
        .then((res) => {
          // 更新vuex || this.$store.dispatch('getSettingAll')[dispatch会触发请求获取设置信息]
          this.$store.commit('SET_SETTING_ALL', res)
        })
        .catch((err) => {
          // console.error("user.setting.save--err", err);
        })
    },
    saveSettingOtherHandle (url) {
      // console.log(url)
      const { devBaseUrl, prodBaseUrl, isDevMode } = this.api_default_config
      const urlPrefix = isDevMode ? `${devBaseUrl}` : `${prodBaseUrl}`
      const p = this.constSettingParams
      let key = ''
      if (this.layoutCode) {
        key = this.layoutCode
      } else {
        key = this.$route.path
      }
      // console.log(key)
      let layoutSettingAll = this.$store.state.user.userSettingAll?.layout ? this.$store.state.user.userSettingAll.layout : null
      let id = null
      if (layoutSettingAll) {
        let layoutSetting = layoutSettingAll.filter((item) => item.key === key)
        if (layoutSetting && layoutSetting.length) {
          id = layoutSetting[0].id
        }
      }
      return {
        postUrl: urlPrefix + url,
        id: id,
        key: key,
        description: p.description,
        type: p.type
      }
    }
  }
}
</script>
<style lang="scss" scoped>
#lcr-layout,
#lcr-left-con,
#lcr-center-con,
#lcr-right-con {
  box-sizing: border-box;
  height: 100% !important;
}

// #lcr-layout {
//   overflow-x: hidden;
// }
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
  z-index: 20;
  transform: translate(-50%, -50%);
  top: 20px;
  font-weight: 600;

  &.left {
    left: 10px;
  }

  &.right {
    right: 0;
  }

  i {
    font-size: 16px;
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
