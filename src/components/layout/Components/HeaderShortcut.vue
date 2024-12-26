<template>
  <div class="shortcut-menu-list">
    <beauti-context ref="menu"
                    type="contextmenu">
      <beauti-contextmenu>
        <beauti-contextmenu-item @click="removeShortcut">移除快捷菜单</beauti-contextmenu-item>
      </beauti-contextmenu>
    </beauti-context>
    <draggable v-model="shortcuts"
               v-bind="sortOptions">
      <!-- <transition-group
      name="shake"
      tag="ul"> -->
      <li v-for="item in shortcuts"
          v-beautiContext:menu="item"
          :key="item.name"
          @click="goToMenu(item)"
          :class="{ active: activeMenu.name === item.name }">
        <el-tooltip :content="item.meta.title"
                    placement="bottom-start"
                    :enterable="false">
          <span v-if="item.meta.icon !== ''"
                :class="item.meta.icon"></span>
          <span v-else>{{ item.meta.title !== '' ? item.meta.title.substring(0, 2) : 'icon' }}</span>
        </el-tooltip>
        <i class="active-dot"
           :style="{ background: theme }"></i>
      </li>
      <!-- </transition-group> -->
    </draggable>
  </div>
</template>
<script>
import { Tooltip } from 'p8-components-ui'
import { mapGetters } from 'vuex'
import GLOBAL_CONST from '@/config/const'
import { getLocalStorage } from '@/service/expands/session'
import draggable from 'vuedraggable'
// Shortcut
const SHORTCUT_MENU_KEY = GLOBAL_CONST.shortcut.shortcutKey

export default {
  name: 'HeaderShortcut',
  data () {
    return {
      activeMenu: null,
      sortOptions: {
        sort: true,
        animation: 120
      }
    }
  },
  computed: {
    ...mapGetters(['token', 'shortcutMenu', 'theme']),
    shortcuts: {
      get () {
        return this.shortcutMenu
      },
      set (items) {
        this.$store.dispatch('dragedShortcuts', items)
      }
    }
  },
  watch: {
    $route: {
      handler (to, from) {
        this.activeMenu = to
      },
      immediate: true
    }
  },
  mounted () {
    this.initShortcuts()
  },
  methods: {
    initShortcuts () {
      const shortcutMenus = getLocalStorage(SHORTCUT_MENU_KEY)
      if (shortcutMenus) {
        if (this.token) {
          const storageShortcuts = getLocalStorage(SHORTCUT_MENU_KEY)[this.token]
          if (storageShortcuts && storageShortcuts.length) {
            this.$store.dispatch('initShortcutMenu', storageShortcuts)
          }
        }
      }
    },
    goToMenu (item) {
      this.$router.push({ name: item.name })
    },
    removeShortcut (contextmenu, event, item) {
      this.$store.dispatch('removeShortcutMenu', item)
    }
  },
  components: {
    draggable,
    'el-tooltip': Tooltip
  }
}
</script>
<style lang="scss" scoped>
.shortcut-menu-list {
  // width: 100%;
  // height: 100%;
  padding: 3px;
  margin: 0;
  display: flex;
  align-items: center;
  box-sizing: border-box;

  div {
    display: inherit;
    align-items: center;

    // ul {
    //   display: inherit;
    //   align-items: center;

    > li {
      display: inherit;
      justify-content: center;
      align-items: center;
      position: relative;
      cursor: pointer;
      background: lighten($base-light-color, 1%);
      border-right: 1px solid darken($base-light-color, 8%);
      transition: all 0.1s ease-in-out 0s;
      border-radius: 3px;
      animation: zoom-shortcut 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
      margin: 5px;

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
        height: 100%;
        padding: 8px 10px;
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
        .active-dot {
          display: block;
        }
      }

      &:hover {
        box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
        z-index: 500;
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
    }

    // }
  }
}
</style>
