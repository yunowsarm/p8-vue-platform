<template>
  <div class="shortcut-menu">
    <div class="shortcut-menu-item" v-for="(menu, index) in shortMenu" :key="index">
      <div class="item" v-if="!menu.children">
        <i class="el-icon-document"></i>
        <span class="title">{{ menu.meta.title }}</span>
      </div>
      <template v-else-if="menu.children && menu.children.length >= 1">
        <span class="title" v-if="menu.meta && menu.meta.title">{{ menu.meta.title }}</span>
        <ul v-for="(item, subIndex) in menu.children" :key="subIndex">
          <template v-if="item.children && item.children.length >= 1">
            <child-menu-item :menu-list="[item]"></child-menu-item>
          </template>
          <template v-else>
            <li class="menu-item">
              <el-checkbox v-model="item.meta.checked" @change="selectShortcut(item)">{{ item.meta.title }}</el-checkbox>
            </li>
          </template>
        </ul>
      </template>
    </div>
  </div>
</template>
<script>
import { Checkbox } from 'p8-components-ui'
import { mapGetters } from 'vuex'
import { getLocalStorage } from '@/service/expands/session'
import GLOBAL_CONST from '@/config/const'
import ChildMenuItem from './ChildMenuItem'
// Shortcut
const SHORTCUT_MENU_KEY = GLOBAL_CONST.shortcut.shortcutKey

export default {
  name: 'ShortcutMenu',
  props: {
    menuList: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    ...mapGetters(['token', 'homepage']),
    storedShurtcutMenu() {
      const getShortcutFromLocal = () => {
        const shortcutMenus = getLocalStorage(SHORTCUT_MENU_KEY)
        if (shortcutMenus) {
          if (this.token) {
            const storageShortcuts = getLocalStorage(SHORTCUT_MENU_KEY)[this.token]
            if (storageShortcuts && storageShortcuts.length) {
              return storageShortcuts
            }
          }
        }
        return []
      }
      return this.$store.getters.shortcutMenu || getShortcutFromLocal()
    },
    shortMenu() {
      const menuData = this.menuList.concat()
      return this.constructMenuData(menuData)
    }
  },
  methods: {
    selectShortcut(item) {
      const actionType = item.meta.checked ? 'addShortcutMenu' : 'removeShortcutMenu'
      this.$store.dispatch(actionType, item)
    },
    constructMenuData(menuData) {
      let constrctMenu = menuData
        .map((menu) => {
          if (menu.children && menu.children.length) {
            this.constructMenuData(menu.children)
          }
          if (menu.meta) {
            menu.meta.checked = this.storedShurtcutMenu.some((m) => m.name === menu.name)
          }
          return menu
        })
        .filter((menu) => !menu.hidden && !new RegExp(this.homepage.path + '$').test(menu.redirect))
      return constrctMenu
    }
  },
  components: { ChildMenuItem, 'el-checkbox': Checkbox }
}
</script>

<style lang="scss" scoped>
.shortcut-menu {
  width: 100%;
  display: flex;
  flex-wrap: wrap;

  .shortcut-menu-item {
    padding: 10px 45px 20px 0;
    cursor: pointer;

    .title {
      display: inline-block;
      margin: 0 0 8px 10px;
      font-size: 14px;
      font-style: italic;
      white-space: nowrap;
      color: darken($base-light-color, 45%);
    }

    ul {
      li {
        display: flex;
        padding: 10px;
        transition: all 0.3s ease 0s;
        font-size: 13px;
        border-radius: 8px;

        i {
          margin-right: 5px;
          color: darken($base-light-color, 25%);
        }

        .list-title {
          white-space: nowrap;
        }

        &:hover {
          background-color: $base-light-color;
        }
      }
    }
  }
}
</style>
