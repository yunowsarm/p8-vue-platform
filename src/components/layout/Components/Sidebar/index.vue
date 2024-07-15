<template>
  <!-- <transition name="bounce"> -->
  <div class="sidebar"
       :style="{ width: sidebarState.width, 'background-image': 'url(' + imageUrl + ')', 'background-size': '200px 100%' }"
       v-show="!sidebarState.isHidden">
    <VuePerfectScrollbar :settings="scrollOptions"
                         :style="{ 'background-color': objColor.themeColor }">
      <div class="border-name">
        <div class="sysName">
          <div class="login-logo"
               ref="loginLogo"></div>
        </div>
        <div class="sysName">
          <span v-if="sidebarState.width == '180px'">{{ systemName }}</span>
        </div>
      </div>
      <el-menu mode="vertical"
               class="vertical-menu"
               :default-active="$route.path"
               :router="true"
               unique-opened
               text-color="#fff"
               :collapse="!sidebarState.isOpen"
               :collapse-transition="false">
        <template v-for="item in asyncRouter">
          <template v-if="!item.hidden && item.children">
            <!-- no children -->
            <template v-if="item.children[0].path === 'dash' || item.children[0].path === 'Dashboard'">
              <el-menu-item :index="item.path + '/' + item.children[0].path"
                            :key="item.name">
                <i v-if="!sidebarState.isOpen"
                   class="p8"
                   :class="item.children[0].meta.icon"></i>
                <i v-else
                   class="p8"
                   :class="item.children[0].meta.icon"></i>
                <span slot="title">{{ item.children[0].meta.title }}</span>
              </el-menu-item>
            </template>
            <!-- 一级菜单 -->
            <template v-else-if="!item.path && item.redirect && item.children[0].path == item.redirect">
              <el-menu-item :index="item.children[0].path"
                            :key="item.name">
                <i v-if="!sidebarState.isOpen"
                   class="p8"
                   :class="item.children[0].meta.icon"></i>
                <i v-else
                   class="p8"
                   :class="item.children[0].meta.icon"></i>
                <span slot="title">{{ item.children[0].meta.title }}</span>
              </el-menu-item>
            </template>
            <!-- have children -->
            <el-submenu v-else
                        :index="item.meta.title || item.path"
                        :key="item.name"
                        class="custom-submenu">
              <template slot="title">
                <i v-if="item.meta && item.meta.icon"
                   class="p8"
                   :class="item.meta.icon"></i>
                <span v-if="item.meta && item.meta.title">{{ item.meta.title }}</span>
              </template>
              <div class="cumtom-submenu-menu">
                <template v-for="child in item.children">
                  <template v-if="!child.hidden">
                    <!-- <sidebar-menu-item  v-if="child.children && child.children.length > 0"
                            :is-nest="true" class="nest-menu" :routes="[child]" :key="child.name">
                        </sidebar-menu-item>
                        <template v-else> -->
                    <el-menu-item :index="child.path"
                                  :disabled="!!child.isDisabled"
                                  :key="child.name">
                      <el-tooltip placement="right"
                                  :disabled="child.meta.title.length < 8"
                                  :content="child.meta.title">
                        <div>
                          <i v-if="child.meta && child.meta.icon"
                             class="p8"
                             :class="child.meta.icon"></i>
                          <span v-if="child.meta && child.meta.title">{{ child.meta.title }}</span>
                        </div>
                      </el-tooltip>
                    </el-menu-item>
                    <!-- </template> -->
                  </template>
                </template>
              </div>
            </el-submenu>
          </template>
        </template>
      </el-menu>
    </VuePerfectScrollbar>
    <span class="sidebar-version">
      <el-popover placement="top-start"
                  width="180"
                  trigger="hover">
        <p>
          西安融智软件有限公司<br />
          www.xardmu.com<br />
          029-87607380<br />
          <span v-if="isShow">
            授权方：{{ regardsObj.authorizedName }}<br />
            <!-- &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;授权类型：{{ regardsObj.authorizationType }}<br /> -->
            <!-- &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;安装截止日期：{{ regardsObj.bindExpires }}<br /> -->
            授权终止日期：{{ regardsObj.authorizedExpires }}<br />
            授权用户数：{{ regardsObj.userLimit }}<br />
            授权登录人数：{{ regardsObj.loginLimit }}<br />
            <!-- &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;预期控制策略：{{ regardsObj.authExpiredControl }}<br /> -->
            <!-- &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;硬件绑定类型：{{ regardsObj.hwBindType }}<br /> -->
          </span>
          <span v-else>
            授权终止日期：{{ regardsObj.authorizedExpires }}<br />
          </span>
        </p>
        <span slot="reference">{{ regardsObj.systemVersion }}</span>
      </el-popover>
    </span>
  </div>
  <!-- </transition> -->
</template>

<script>
import { Menu, Submenu, MenuItem, Tooltip } from 'p8-components-ui'
import { mapGetters } from 'vuex'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
// import SidebarMenuItem from './SidebarMenuItem'

export default {
  name: 'Sidebar',
  data () {
    return {
      scrollOptions: {
        suppressScrollX: true
      },
      objColor: {
        themeColor: ''
      },
      regardsObj: {},
      isShow: false
    }
  },
  computed: {
    ...mapGetters(['asyncRouter', 'sidebarState', 'systemTheme', 'theme', 'imageUrl', 'systemName']),
    // 这里必须根据条件结合ElementUI的sidebar来调整颜色,保证自定义主题和sidebar的内置颜色一致.
    systemThemeColor: function () {
      switch (this.systemTheme) {
        case 'batman':
        case 'belles':
          return '#37474F'
        default:
          return '#ffffff'
      }
    }
  },
  watch: {
    theme (val, oldVal) {
      this.getColor()
    },
    imageUrl (val, oldVal) {
      this.getColor()
    }
  },
  mounted () {
    if (this.$store.state.user.userId === 'SYS_USER000') {
      this.isShow = true
    }
    this.getColor()
    this.getIcon()
    this.$api['projectTeamSetting.getSystemAbout']().then(res => {
      if (res) {
        this.regardsObj = res
      }
    })
  },
  methods: {
    // 获取系统logo
    async getIcon () {
      let res = await this.$api['SystemSettings.getLoginSetting']()
      if (res) {
        let uploadFileJson = res.uploadFileJson
        if (uploadFileJson && uploadFileJson[0]) {
          const that = this
          uploadFileJson.map((item) => {
            if (item.id) {
              this.$api['SystemSettings.downloadLoginLogo']({ attachmentId: item.id }, { responseType: 'blob' }).then(function (res) {
                item.filePath = window.URL.createObjectURL(new Blob([res.data]))
                that.$nextTick(() => {
                  that.$refs.loginLogo.style.backgroundImage = `url(${item.filePath})`
                  that.$refs.loginLogo.style.backgroundRepeat = `no-repeat`
                })
              })
            }
          })
        }
      }
    },
    getColor () {
      if (this.imageUrl) {
        let color = this.fromHex(this.theme)
        this.$set(this.objColor, 'themeColor', 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + 0.6 + ')')
      } else {
        this.$set(this.objColor, 'themeColor', this.theme)
      }
    },
    fromHex (color) {
      var t = {},
        bits = color.length == 4 ? 4 : 8, //假设是shorthand。 #fff, 那么bits为4位, 每一位代表的个属性, 其他的为8位 每两位代表一个属性 #ffffff00
        mask = (1 << bits) - 1 //表示字节占位符。 向左移4位或8位，var a = (1 << 4 ) - 1 -> 10000 - 1,  a.toString(2); // 1111。或者 8位的 1111 1111
      color = Number('0x' + color.substr(1)) //#ff0000 转变为16进制0xff0000;
      if (isNaN(color)) {
        return null // Color
      }
      ;['b', 'g', 'r'].forEach(function (x) {
        var c = color & mask
        color >>= bits
        t[x] = bits == 4 ? 17 * c : c // 0xfff ， 一个f应该代表 255, 应该当[0-255]，按15等份划分，每一等份间隔 17。
      })
      t.a = 1
      return t // Color
    }
  },
  components: {
    VuePerfectScrollbar,
    // SidebarMenuItem,
    'el-menu': Menu,
    'el-submenu': Submenu,
    'el-menu-item': MenuItem,
    'el-tooltip': Tooltip
  }
}
</script>

<style lang="scss">
$menu-hover-color: #032353;
$menu-active-color: #04224e;
$menu-collapse-text-color: #303133;

.sidebar {
  display: flex;
  flex-direction: column;
  flex: none;
  overflow: hidden;
  background: #04224e;

  .vertical-menu {
    border-right: none;
    background: transparent;

    .el-submenu__title:hover {
      background: $menu-hover-color;
    }

    li {
      i {
        font-size: $font-size-medium;
        color: $base-white-color;

        &.el-icon-arrow-down,
        &.el-icon-arrow-up {
          font-size: $font-size-small;
        }
      }
      span {
        width: calc(100% - 15px);
        display: inline-block;
        margin-left: 5px;
        line-height: 30px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }

  // sidebar menu css override
  .vertical-menu:not(.el-menu--collapse) {
    width: $base-sidebar-width;
  }

  .el-menu--collapse {
    li {
      i {
        font-size: $font-size-large;
      }
    }
  }

  .el-menu-item {
    height: 36px;

    &.is-active {
      background: $menu-active-color;
      color: $base-white-color;
    }

    &:hover {
      background: $menu-hover-color !important;
    }

    .el-submenu__title {
      height: 36px !important;
      font-size: 14px !important;
      line-height: 36px !important;

      span {
        line-height: 36px !important;
      }
    }
  }

  .el-submenu {
    .el-menu-item {
      line-height: 36px !important;
      min-width: $base-sidebar-width;
      padding-right: 10px;
    }
    .el-menu {
      background: transparent;
    }
  }
}

.el-menu--vertical {
  .el-menu--popup {
    .cumtom-submenu-menu {
      li {
        i {
          margin-right: 5px;
        }
        span {
          color: $menu-collapse-text-color;
        }

        &.is-active {
          span {
            color: $base-light-color;
          }
        }
      }
    }
  }
}
.border-name {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.sysName {
  line-height: pxTorem(50px);
  font-size: $font-size-medium;
  font-family: 'Source Han Sans CN', 'Noto Sans SC', sans-serif;
  font-weight: 500;
  color: $base-white-color;
  white-space: nowrap; /* 不换行 */
  overflow: hidden; /* 超出部分隐藏 */
  text-overflow: ellipsis; /* 超出部分以省略号显示 */
  // line-height: 50px;
  // letter-spacing: 1px;
}
.login-logo {
  width: 20px;
  height: 20px;
  background-size: contain;
}
.sidebar-version {
  position: absolute;
  bottom: 5px;
  left: 5px;
  color: #797676;
  font-size: 10px;
}
</style>
