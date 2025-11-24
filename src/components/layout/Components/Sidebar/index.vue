<template>
  <!-- <transition name="bounce"> -->
  <div class="sidebar"
       ref="themeImage"
       :style="{ width: sidebarState.width, 'background-image': 'url(' + imageUrl + ')', 'background-size': backgroundSize, 'background-repeat': backgroundRepeat, 'background-position': backgroundPosition }"
       v-show="!sidebarState.isHidden">
    <VuePerfectScrollbar :settings="scrollOptions"
                         :style="{ 'background-color': objColor.themeColor }">
      <div class="border-name">
        <div v-if="showLogo"
             class="sysName">
          <div class="login-logo"
               ref="loginLogo"></div>
        </div>
        <div class="sysName">
          <span v-if="sidebarState.width == '180px' || isMobile"
                v-html="systemName"></span>
        </div>
      </div>
      <el-menu mode="vertical"
               class="vertical-menu"
               :default-active="defaultActive"
               :router="true"
               unique-opened
               text-color="#fff"
               :collapse="!sidebarState.isOpen"
               :collapse-transition="false">
        <template v-for="item in asyncRouter">
          <template v-if="!item.hidden && item.children">
            <!-- no children -->
            <template v-if="(item.children[0].path === 'dash' || item.children[0].path === 'Dashboard')">
              <el-menu-item :index="item.path + '/' + item.children[0].path"
                            @click="clearSidebar"
                            :key="item.name">
                <template>
                  <i v-if="!sidebarState.isOpen"
                     class="p8 menuIcon"
                     :class="item.children[0].meta.icon"></i>
                  <i v-else
                     class="p8 menuIcon"
                     :class="item.children[0].meta.icon"></i>
                </template>
                <span slot="title">{{ item.children[0].meta.title }}</span>
              </el-menu-item>
            </template>
            <!-- 一级菜单 -->
            <template v-else-if="!item.path && item.redirect && item.children[0].path == item.redirect">
              <el-menu-item :index="item.children[0].path"
                            :key="item.name">
                <template>
                  <i v-if="!sidebarState.isOpen"
                     class="p8 menuIcon"
                     :class="item.children[0].meta.icon"></i>
                  <i v-else
                     class="p8 menuIcon"
                     :class="item.children[0].meta.icon"></i>
                </template>
                <span slot="title">{{ item.children[0].meta.title }}</span>
              </el-menu-item>
            </template>
            <!-- have children -->
            <el-submenu v-else
                        :index="item.meta.title || item.path"
                        :key="item.name"
                        @click="clearSidebar"
                        class="custom-submenu">
              <template slot="title">
                <div @mouseenter="handleMouseEnter(item)">
                  <template>
                    <i v-if="item.meta && item.meta.icon"
                       class="p8 menuIcon"
                       :class="item.meta.icon"></i>
                  </template>
                  <span v-if="item.meta && item.meta.title">{{ item.meta.title }}</span>
                </div>
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
                                  @click="clearSidebar"
                                  :key="child.name">
                      <el-tooltip placement="right"
                                  :disabled="child.meta.title.length < 8"
                                  :content="child.meta.title">
                        <!--                        <span v-if="isMobile">{{ child.meta.title }}</span>-->
                        <div id="item"
                             @mouseenter="handleMouseEnter(child)"
                             @mouseleave="onIconMouseLeave">
                          <template>
                            <i v-if="child.meta && child.meta.icon"
                               class="p8 menuIcon"
                               :class="child.meta.icon"></i>
                          </template>
                          <span v-if="child.meta && child.meta.title">
                            <span :style="{width: hoveredMenuItem == child.path ? 'calc(100% - 30px)' : '100%'}">{{ child.meta.title }}</span>
                            <i style="margin:0;width:16px;"
                               v-if="showIcon(child)"
                               class="el-icon-question"
                               @mouseenter="showOptions($event, child)">
                            </i>
                          </span>
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
    <span class="sidebar-version"
          :style="{ 'background-color': objColor.themeColor }">
      <el-popover placement="top-start"
                  width="220"
                  trigger="hover">
        <span v-if="isShow">
            <p>授权方：{{ regardsObj.authorizedName }}</p>
          <!-- &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;授权类型：{{ regardsObj.authorizationType }}<br /> -->
          <!-- &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;安装截止日期：{{ regardsObj.bindExpires }}<br /> -->
            <p>授权终止日期：{{ regardsObj.authorizedExpires }}</p>
            <p>授权用户数：{{ regardsObj.userLimit }}</p>
            <p>授权登录人数：{{ regardsObj.loginLimit }}</p>
            <el-popover placement="top-start"
                        width="230"
                        trigger="hover">
              <p>
                p8-framework-suit@{{ regardsObj.p8Version }}<br />
                p8-lowcode@^{{ packageJson.version }}<br />
                p8-components-ui@{{ packageJson.dependencies['p8-components-ui'] }}<br />
                p8-dhtmlx-gantt@{{ packageJson.dependencies['p8-dhtmlx-gantt'] }}<br />
                p8-vue-smart-widget@{{ packageJson.dependencies['p8-vue-smart-widget'] }}<br />
                p8-gojs@{{ packageJson.dependencies['p8-gojs'] }}<br />
              </p>
              <span slot="reference">系统版本：{{ regardsObj.systemVersion }}</span>
            </el-popover><br />
          </span>
          <span v-else>
            <p>授权终止日期：{{ regardsObj.authorizedExpires }}</p>
          </span>
          <span>
            <p>特征码：{{ regardsObj.cpuSerialCode }}</p>
          </span>
         <p v-for="(el,index) in authorizationInfo"
            :key="index">
          <span class="regards-font">{{el.name}}&nbsp;&nbsp;</span><span>{{el.message}}</span>
        </p>
        <span slot="reference">{{ regardsObj.systemVersion }}</span>
      </el-popover>
    </span>
    <common-drawer v-if="isVisibleHistoryDrawer"
                   title="视频教程"
                   :visible="isVisibleHistoryDrawer"
                   placement="top"
                   size="100%"
                   @close="isVisibleHistoryDrawer = false">
      <template #drawer>
        <videoViewing v-if="isVisibleHistoryDrawer"
                      :record="record"></videoViewing>
      </template>
    </common-drawer>
    <common-drawer v-if="isVisiblePDFdrawer"
                   title="操作手册"
                   :visible="isVisiblePDFdrawer"
                   placement="top"
                   size="100%"
                   @close="isVisiblePDFdrawer = false">
      <template #drawer>
        <PDFpreview v-if="isVisiblePDFdrawer"
                    :record="record"></PDFpreview>
      </template>
    </common-drawer>
  </div>
  <!-- </transition> -->
</template>

<script>
import { Menu, Submenu, MenuItem, Tooltip, P8Drawer as CommonDrawer, } from 'p8-components-ui'
import videoViewing from '@/views/Framework/System/guiDe/components/videoPlayer.vue'
import PDFpreview from '@/views/Framework/System/guiDe/components/PDFpreview.vue'
import { mapGetters } from 'vuex'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
// import SidebarMenuItem from './SidebarMenuItem'
import packageJson from '../../../../../package.json'
export default {
  name: 'Sidebar',
  data () {
    return {
      showLogo: false,
      scrollOptions: {
        suppressScrollX: true
      },
      objColor: {
        themeColor: ''
      },
      regardsObj: {},
      isShow: false,
      packageJson,
      hoveredMenuItem: '',
      popoverVisible: false,
      manualDialogVisible: false,
      linkDialogVisible: false,
      isVisiblePDFdrawer: false,
      isVisibleHistoryDrawer: false,
      record: {},
      dateTime: '',
      backgroundSize: '200px 100%',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: ''
    }
  },
  computed: {
    isMobile () {
      return this.$store.getters.isMobile
    },
    defaultActive () {
      if (this.$route.matched && this.$route.matched.length > 2) {
        return this.$route.meta.parentPath
      } else {
        return this.$route.path
      }
    },
    ...mapGetters(['asyncRouter', 'sidebarState', 'systemTheme', 'theme', 'imageUrl', 'systemName', 'systemColor','authorizationInfo']),
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
    imageUrl: {
      handler (val) {
        if (val && !val.includes('.png') && !val.includes('http')) {
          this.getImage(val)
        }
      },
      deep: true,
      immediate: true
    },
    systemColor: {
      handler (val) {
        this.getColor()
        switch (val.imgType) {
          case 1:
            this.backgroundSize = `200px 100%`
            this.backgroundRepeat = `no-repeat`
            break;
          case 2:
            this.backgroundSize = `contain`
            this.backgroundRepeat = `repeat`
            this.backgroundPosition = `center`
            break;
          case 3:
            this.backgroundSize = `cover`
            this.backgroundRepeat = `center`
            this.backgroundPosition = `center`
            break;
        }
      },
      deep: true,
      immediate: true
    },
  },
  mounted () {
    if (this.$store.state.user.userId === 'SYS_USER000') {
      this.isShow = true
    }
    this.$api['projectTeamSetting.getSystemAbout']().then(res => {
      if (res) {
        this.regardsObj = res
      }
    })
    this.getColor()
    this.getIcon()
  },
  methods: {
    getImage (id) {
      let imgType = this.$store.getters.systemColor.imgType || 1
      let that = this
      this.$api['SystemSettings.downloadLoginLogo']({ attachmentId: id }, { responseType: 'blob' }).then(function (res) {
        let filePath = window.URL.createObjectURL(new Blob([res.data]))
        that.$store.dispatch('setImage', filePath)
        that.$nextTick(() => {
          switch (imgType) {
            case 1:
              that.backgroundSize = `200px 100%`
              that.backgroundRepeat = `no-repeat`
              break;
            case 2:
              that.backgroundSize = `contain`
              that.backgroundRepeat = `repeat`
              that.backgroundPosition = `center`
              break;
            case 3:
              that.backgroundSize = `cover`
              that.backgroundRepeat = `center`
              that.backgroundPosition = `center`
              break;
          }
        })
      })
    },
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
                let iconLink = document.querySelector("link[rel='icon']")
                if (iconLink) {
                  iconLink.href = item.filePath
                }
                that.showLogo = true
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
      let imgNum = this.$store.getters.systemColor.imgNum || 0.7
      let color = this.fromHex(this.theme)
      this.$set(this.objColor, 'themeColor', 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + imgNum + ')')
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
    },
    handleMouseEnter (item) {
      this.hoveredMenuItem = item.path
    },
    handleMouseLeave () {
      this.hoveredMenuItem = ''
    },
    showPopover () {
      this.popoverVisible = true;
    },
    hidePopover () {
      this.popoverVisible = false;
    },
    openManualDialog () {
      this.manualDialogVisible = true;
    },
    openLinkDialog () {
      this.linkDialogVisible = true;
    },
    showOptions (event, item) {
      this.optionsDiv && this.hideOptions();
      const optionsDiv = document.createElement('div');
      optionsDiv.className = 'options-container';
      optionsDiv.style.cssText = `
        background-color: white;
        padding: 5px;
        box-shadow: 0 3px 4px rgba(0, 0, 0, 0.6);
      `;
      const createOption = (text, iconClass, optionType) => {
        const div = document.createElement('div');
        div.className = 'li';
        div.innerHTML = `<i class="${iconClass}"></i> ${text}`;
        div.addEventListener('click', () => this.handleOptionClick(optionType, item));
        return div;
      };
      optionsDiv.appendChild(createOption('操作手册', 'p8 icon-caozuoshouce', 'manual'));
      optionsDiv.appendChild(createOption('操作视频', 'p8 icon-shipin', 'video'));

      const parentDiv = document.createElement('div');
      parentDiv.addEventListener('mouseenter', () => this.onOptionsMouseEnter());
      parentDiv.addEventListener('mouseleave', () => this.onOptionsMouseLeave());
      parentDiv.style.cssText = `
        position: absolute;
        left: ${event.pageX - 10}px;
        top: ${event.pageY - 10}px;
        width: 100px;
        height: auto;
        padding: 10px;
        z-index: 9999;
        background-color:rgba(0,0,0,0)
      `;
      parentDiv.appendChild(optionsDiv)
      optionsDiv.className = 'options-container';
      document.body.appendChild(parentDiv);
      this.optionsDiv = parentDiv;
    },
    onIconMouseEnter () {
      this.isIconHovered = true;
    },
    onIconMouseLeave () {
      this.isIconHovered = false;
      if (!this.isOptionsHovered) {
        this.hideOptions();
      }
    },
    onOptionsMouseEnter () {
      this.isOptionsHovered = true;
    },
    onOptionsMouseLeave () {
      this.isOptionsHovered = false;
      if (!this.isIconHovered) {
        this.hideOptions();
        this.hoveredMenuItem = ''
      }
    },
    hideOptions () {
      if (this.optionsDiv) {
        document.body.removeChild(this.optionsDiv);
        this.optionsDiv = null;
      }
    },
    async handleOptionClick (option, item) {
      let that = this
      this.$api['SystemSettings.selectResourcesByMenuId']({ menuId: item.meta.id }).then(res => {
        this.record = res
        if (option === 'manual') {
          if ((res.mTitle && res.mTitle.length) || res.mURL) {
            that.isVisiblePDFdrawer = true
          } else {
            that.$message.warning('当前菜单暂无操作手册')
          }
        } else if (option === 'video') {
          if ((res.vTitle && res.vTitle.length) || res.vURL) {
            that.isVisibleHistoryDrawer = true
          } else {
            that.$message.warning('当前菜单暂无视频资源')
          }
        }
        this.hideOptions();
      })
    },
    clearSidebar () {
      if (this.isMobile) {
        this.$store.dispatch('hideSidebar', true)
        this.$store.dispatch('collapseSidebar', !this.sidebarState.isOpen)
      }
    },
    showIcon (child) {
      let flag = false
      if (this.$route.path == child.path) {
        flag = true
      }
      if (child.children && child.children.length) {
        child.children.forEach(el => {
          if (el.path == this.$route.path) {
            flag = true
          }
        })
      }
      return flag && this.hoveredMenuItem == child.path
    }
  },
  components: {
    VuePerfectScrollbar,
    // SidebarMenuItem,
    'el-menu': Menu,
    'el-submenu': Submenu,
    'el-menu-item': MenuItem,
    'el-tooltip': Tooltip,
    videoViewing,
    PDFpreview,
    CommonDrawer
  }
}
</script>

<style lang="scss">
.options-container {
  display: flex;
  flex-direction: column;
}

.li {
  cursor: pointer;
  padding: 5px;
}

.li:hover {
  background-color: #f0f0f0;
}
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
    height: 92%;
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
  height: pxTorem(50px);
  font-size: $font-size-medium;
  font-family: Source Han Sans CN;
  font-weight: 500;
  color: $base-white-color;
  white-space: nowrap; /* 不换行 */
  overflow: hidden; /* 超出部分隐藏 */
  text-overflow: ellipsis; /* 超出部分以省略号显示 */
  display: flex;
  align-items: center;
  // line-height: 50px;
  // letter-spacing: 1px;
}
.login-logo {
  width: 20px;
  height: 20px;
  background-size: contain;
}
.sidebar-version {
  text-align: center;
  color: #797676;
  font-size: 10px;
}
.elPopover {
  display: inline;
  width: unset;
  margin: 0;
}
.icon-shipin,
.icon-caozuoshouce {
  color: #2a78d8;
}
.menuIcon {
  font-size: 22px !important;
}
@media (max-width: 600px) {
  .menuIcon {
    font-size: 16px !important;
  }
  .sidebar {
    position: fixed;
    z-index: 200;
    top: 0;
    bottom: 0;
    .login-logo {
      display: none;
    }
    .sysName {
      font-size: 12px;
    }
    .el-menu-item {
      min-width: 130px !important;
      padding: 0 !important;
      padding-left: 5px !important;
      span,
      i {
        font-size: 12px;
      }
    }
    width: 130px !important;
    .el-submenu__title {
      padding: 0 !important;
      padding-left: 5px !important;
      span,
      i {
        font-size: 12px;
      }
      .el-submenu__icon-arrow {
        right: 5px;
        font-size: 12px !important;
      }
    }
    .cumtom-submenu-menu {
      .el-menu-item {
        min-width: 130px !important;
        padding: 0 !important;
        padding-left: 11px !important;
        span,
        i {
          font-size: 12px;
        }
      }
    }
    .vertical-menu:not(.el-menu--collapse) {
      width: 130px;
    }
    .ps__rail-y {
      width: 5px;
    }
  }
}
</style>
