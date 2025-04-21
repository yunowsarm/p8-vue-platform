<template>
  <div class="shortcut-menu-list">
    <!-- <draggable v-model="menuModuleData"
               v-bind="sortOptions"> -->
    <!-- <transition-group
      name="shake"
      tag="ul"> -->
    <!-- <div v-for="item in subSystemMenu"
         :key="item.meta.id">
      <li v-if="!Array.isArray(item.children)"
          @click="goToMenu(item)"
          :class="{active: activeShortcutMenu && activeShortcutMenu.meta.id === item.meta.id}">
        <i class="p8 "
           :class="item.meta.icon"></i>
        <span class="sysItemName">{{ item.meta.title }}</span>
      </li>
      <el-dropdown v-else
                   :hide-on-click="false"
                   placement='bottom-start'>
        <li @click="goToMenu(item)"
            :class="{active: activeShortcutMenu && activeShortcutMenu.meta.id === item.meta.id}">
          <i class="p8 "
             :class="item.meta.icon"></i>
          <span class="sysItemName">{{ item.meta.title }}</span>
        </li>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="(subItem) in item.children"
                            :key="subItem.meta.id"
                            :class="{'activeSubMenu':activeSubMenu && activeSubMenu.meta.id === subItem.meta.id}"
                            @click.native="goToSubMenu(subItem)">
            <i class="p8 "
               :class="subItem.meta.icon"></i>
            <span>{{ subItem.meta.title }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div> -->
    <div class="header_top"
         v-if="!flag">
      <div v-for="item in menuList"
           :key="item.id"
           @click="lingSkip(item)"
           class="headerTop">
        <i class="iconStyle"
           :style="{ color: item.color }"
           :class="item.icon"></i>
        <div class="sysItemName"
             :style="{ color: item.color }">{{ item.title }}</div>
      </div>
    </div>
    <!-- </transition-group> -->
    <!-- </draggable> -->
  </div>
</template>
<script>
// import { Dropdown, DropdownMenu } from 'element-ui'
// import { mapGetters } from 'vuex'
// import { getLocalStorage } from '@/service/expands/session'
// import { deepClone } from '@/utils/common'
// import { generateNewRoutes } from '@/service/store/modules/routers'
// const SHORTCUT_MENU_KEY = GLOBAL_CONST.shortcut.shortcutKey

export default {
  name: 'HeaderShortcut',
  data () {
    return {
      menuList: [],
      menuModuleData: [],
      flag: false,
      sortOptions: {
        sort: true,
        animation: 120
      }
    }
  },
  // computed: {
  //   ...mapGetters(['token', 'shortcutMenu', 'theme', 'activeShortcutMenu', 'subSystemMenu', 'activeSubMenu']),
  //   shortcuts: {
  //     get () {
  //       return this.shortcutMenu
  //     },
  //     set (items) {
  //       this.$store.dispatch('dragedShortcuts', items)
  //     }
  //   }
  // },
  watch: {
    $route: {
      handler (to, from) {
        // this.activeMenu = to
      },
      immediate: true
    }
  },
  created () {

    let that = this
    this.$api['extLink.list']({}).then((res) => {
      that.menuList = res
    })
  },
  // mounted () {
  //   this.initShortcuts()
  // },
  methods: {
    lingSkip (val) {
      let that = this
      let url = val.url
      let params = val.params
      if (params && params.length > 0) {
        url += '?'
        params.forEach((el) => {
          // 表达式格式应为 #@{xxxx}
          if (el.value.includes('#@')) {
            let key = el.value.substring(3, el.value.length - 1)


            url += el.keys + '=' + that.$store.getters.userInfo[key] + '&'
          } else {
            url += el.keys + '=' + el.value + '&'
          }
        })
        url = url.substring(0, url.length - 1)
      }
      if (!url.includes('http')) {
        url = 'http://' + url
      }
      window.open(url, '_blank')
    }
    // initShortcuts () {
    //   const shortcutMenus = getLocalStorage(SHORTCUT_MENU_KEY)
    //   if (shortcutMenus) {
    //     if (this.token) {
    //       const storageShortcuts = getLocalStorage(SHORTCUT_MENU_KEY)[this.token]
    //       if (storageShortcuts && storageShortcuts.length) {
    //         this.$store.dispatch('initShortcutMenu', storageShortcuts)
    //       }
    //     }
    //   }
    // },
    // goToMenu (item) {
    //   // 重置浏览记录以及tab页面记录等
    //   // this.$storecommit('REMOVE_ALL_VISITED')
    //   // 重置权限路由表, 该mutation 访问 store/asyncRouter.js
    //   // this.$storecommit('RESET_ROUTERS')
    //   // 标识跳转院外系统
    //   // if (item) {
    //   //   return thirdpartCommon.openOuterLink2()
    //   // }
    //   const data = deepClone(item)
    //   this.$store.dispatch('setActiveShortcutMenu', data)
    //   // 移除除主页的其他所有路由页面
    //   this.$store.commit('REMOVE_HOMEOTHER_VIEW')
    //   this.$router.push({ name: this.$store.getters.homepage.name })
    //   if (item.children) {
    //     const addRoutes = generateNewRoutes(data.children[0].childMenus)
    //     this.$store.commit('SET_ACTIVESUBMENU', data.children[0])
    //     this.$store.commit('SET_ROUTERS', { addRoutes, routerRawData: null })
    //   } else {
    //     const addRoutes = generateNewRoutes(data.childMenus)
    //     this.$store.commit('SET_ACTIVESUBMENU', null)
    //     this.$store.commit('SET_ROUTERS', { addRoutes, routerRawData: null })
    //   }
    //   // this.$router.push({ name: 'DashboardHome' })
    // },
    // goToSubMenu (item) {
    //   const data = deepClone(item)
    //   const addRoutes = generateNewRoutes(data.childMenus)
    //   // 移除除主页的其他所有路由页面
    //   this.$store.commit('REMOVE_HOMEOTHER_VIEW')
    //   this.$router.push({ name: this.$store.getters.homepage.name })
    //   this.$store.commit('SET_ACTIVESUBMENU', data)
    //   this.$store.commit('SET_ROUTERS', { addRoutes, routerRawData: null })
    // },
    // removeShortcut (contextmenu, event, item) {
    //   this.$store.dispatch('removeShortcutMenu', item)
    // }
  },
  components: {
    // draggable,
    // 'el-dropdown': Dropdown,
    // 'el-dropdown-menu': DropdownMenu
    // 'el-tooltip': Tooltip
  }
}
</script>
<style lang="scss" scoped>
.shortcut-menu-list {
  width: 50%;
  // height: 100%;
  margin: 0;
  display: flex;
  align-items: center;
  box-sizing: border-box;

  // div {
  //   display: inherit;
  //   align-items: center;

  // ul {
  //   display: inherit;
  //   align-items: center;
  div {
    height: 100%;
    li {
      width: 95px;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      cursor: pointer;
      color: #ffffff;
      // background: lighten($base-light-color, 1%);
      // border-right: 1px solid darken($base-light-color, 8%);
      transition: all 0.1s ease-in-out 0s;
      // border-radius: 3px;
      animation: zoom-shortcut 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
      flex-direction: column;

      i {
        font-size: pxTorem(24px);
        margin-top: pxTorem(10px);
      }

      @keyframes zoom-shortcut {
        0% {
          transform: scale(0);
        }
        100% {
          transform: scale(1);
        }
      }

      span {
        display: inline-block;
        width: 100%;
        // height: 100%;
        margin: pxTorem(5px) pxTorem(10px) pxTorem(10px) pxTorem(10px);
        font-size: pxTorem(12px);
        text-align: center;
      }

      .active-dot {
        position: absolute;
        width: 5px;
        height: 5px;
        overflow: hidden;
        border-radius: 10px;
        left: 50%;
        margin-left: -2.5px;
        bottom: 2px;
        display: none;
      }

      &.active {
        background: #003a8c;
        .active-dot {
          display: block;
        }
      }
      &.active::after {
        position: absolute;
        bottom: 0;
        left: 0;
        content: '';
        width: 100%;
        height: 2px;
        background: #137df2;
      }

      &:hover {
        background: #003a8c;
        // box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
        //   0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
        // z-index: 500;
      }
      &:hover::after {
        position: absolute;
        bottom: 0;
        left: 0;
        content: '';
        width: 100%;
        height: 2px;
        background: #137df2;
      }

      // &.shortcuts-enter-active,
      // &.shortcuts-leave-active {
      //   transition: all .3s ease 0;
      // }

      // &.shortcut-enter {
      //   animation: 'scaleAnimate' .5s ease-in-out 0;
      // }

      // @keyframes scaleAnimate {
      //   0% { transform: scale(.6) }
      //   100% { transform: scale(1) }
      // }
      // }

      // }
    }
  }
}
::v-deep.activeSubMenu {
  background: #f5f8fc;
  color: #137df2;
}
.header.headerShrink {
  .shortcut-menu-list {
    div {
      li {
        i {
          margin-top: pxTorem(0px);
        }
      }
    }
  }
}
.iconStyle {
  font-size: 25px;
  padding-bottom: 5px;
}
.header_top {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}
.headerTop {
  width: 100px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  color: $base-light-color;
}
.sysItemName {
  text-align: center;
  width: 90px;
  white-space: nowrap; /* 不换行 */
  overflow: hidden; /* 隐藏超出的内容 */
  text-overflow: ellipsis; /* 用省略号表示被隐藏的部分 */
}
</style>
