<script>
import { mapGetters } from 'vuex'
import { API_DEFAULT_CONFIG } from '@/config/settings'
import draggable from 'vuedraggable'

export default {
  name: 'MoreMenu',
  components: {
    draggable
  },
  data() {
    return {
      api_default_config: API_DEFAULT_CONFIG,
      saveApi: '/framework/user/setting/save',
      menu: [],
      edit: false,
      isDragging: false
    }
  },
  computed: {
    ...mapGetters(['addRouters']),
    dragOptions() {
      return {
        animation: 150,
        group: 'menu',
        ghostClass: 'ghost',
        dragClass: 'drag',
        handle: '.icon-box',
        forceFallback: false,
        fallbackClass: 'fallback',
        touchStartThreshold: 5,
        delay: 100,
        delayOnTouchOnly: true,
        scroll: true,
        scrollSpeed: 3,
        scrollSensitivity: 30
      }
    }
  },
  created() {
    this.getMenu()
  },
  methods: {
    getMenu() {
      let userSettingAll = this.$store.state.user.userSettingAll
      if (userSettingAll.Menu) {
        const raw = userSettingAll.Menu[0].value
        try {
          const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
          this.menu = parsed && parsed.menu ? parsed.menu : []
        } catch (e) {
          console.warn('解析用户设置失败，使用默认菜单', e)
          this.menu = []
        }
      } else {
        let menu = []
        this.addRouters.forEach((item) => {
          if (item.children) {
            menu = menu.concat(item.children)
          }
        })
        this.menu = menu.slice(0, 9)
      }
      console.log(this.menu)
    },
    editOrOk() {
      if (this.edit) {
        this.saveMenuSetting()
      }
      this.edit = !this.edit
    },
    saveMenuSetting() {
      let id = null
      let userSettingAll = this.$store.state.user.userSettingAll
      if (userSettingAll.Menu) {
        id = userSettingAll.Menu[0].id
      }
      const params = [
        {
          id: id,
          key: 'homeMenu',
          description: 'menu-setting',
          type: 'Menu',
          value: JSON.stringify({ menu: this.menu })
        }
      ]
      const { devBaseUrl, prodBaseUrl, isDevMode } = this.api_default_config
      const urlPrefix = isDevMode ? `${devBaseUrl}` : `${prodBaseUrl}`
      this.$ajax
        .post(urlPrefix + this.saveApi, params, { headers: { Authorization: this.$store.getters.token } })
        .then((res) => {
          console.log(res)
          const payload = res && res.data ? res.data : res
          // 更新vuex || this.$store.dispatch('getSettingAll')[dispatch会触发请求获取设置信息]
          this.$store.commit('SET_SETTING_ALL', payload)
        })
        .catch((err) => {
          console.error('user.setting.save--err', err)
        })
    },
    isHaveMenu(menu) {
      return !!this.menu && this.menu.some((item) => item.name === menu.name)
    },
    handleMenuClick(menu) {
      // 拖动时不触发点击事件
      if (this.isDragging) {
        return
      }
      this.clickMenu(menu)
    },
    clickMenu(menu) {
      if (this.edit) {
        if (this.isHaveMenu(menu)) {
          const i = this.menu.findIndex((item) => item.name === menu.name)
          this.menu.splice(i, 1)
        } else {
          this.menu.push({ ...menu })
        }
      } else {
        this.go(menu)
      }
    },
    go(menu) {
      console.log(menu)
      this.$router.push({ name: menu.name })
    }
  }
}
</script>

<template>
  <div class="more-menu">
    <div class="menu">
      <div class="menu-top">
        <div class="menu-sort">首页服务</div>
        <el-button size="mini" :type="edit ? 'primary' : 'danger'" @click="editOrOk">{{ edit ? '保存' : '编辑' }}</el-button>
      </div>
      <draggable v-model="menu" :disabled="!edit" class="menu-list" :options="dragOptions" @start="isDragging = true" @end="isDragging = false">
        <div class="menu-item" v-for="menu in menu" :key="menu.path" @click="handleMenuClick(menu)">
          <el-badge :value="isHaveMenu(menu) ? '-' : '+'" :type="isHaveMenu(menu) ? 'danger' : 'primary'" :hidden="!edit">
            <div class="icon-box">
              <i class="p8 menu-icon" :class="[menu.meta?.icon, { 'drag-cursor': edit }]"></i>
            </div>
          </el-badge>
          <span class="menu-title">{{ menu.meta.title }}</span>
        </div>
      </draggable>
    </div>
    <div v-for="menu in addRouters" class="menu">
      <div class="menu-top">
        <div class="menu-sort">{{ menu.meta.title }}</div>
      </div>
      <div class="menu-item" v-for="childMenu in menu.children" :key="childMenu.path" @click="clickMenu(childMenu)">
        <el-badge :value="isHaveMenu(childMenu) ? '-' : '+'" :type="isHaveMenu(childMenu) ? 'danger' : 'primary'" :hidden="!edit">
          <div class="icon-box">
            <i class="p8 menu-icon" :class="childMenu.meta?.icon"></i>
          </div>
        </el-badge>
        <span class="menu-title">{{ childMenu.meta.title }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.more-menu {
  padding-top: 10px;
  height: 100%;
  background: #eff3f7;
  overflow: auto;
}

.menu {
  width: calc(100% - 28px);
  overflow: hidden;
  margin: 0 8px 8px;
  padding: 0 6px;
  display: flex;
  flex-wrap: wrap;
  border-radius: 4px;
  background: #ffffff;

  .menu-top {
    margin: 10px 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .menu-sort {
      font-size: 16px;
      font-weight: bold;
    }
  }

  .menu-list {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
  }

  .menu-item {
    margin: 6px 0;
    width: 25%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: opacity 0.3s ease;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    touch-action: manipulation;

    .icon-box {
      width: 50px;
      height: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }

    .menu-icon {
      color: #409eff;
      margin: 10px 0;
      font-size: 30px;
      -webkit-user-select: none;
      user-select: none;

      &.drag-cursor {
        cursor: move;
      }
    }

    .menu-title {
      text-align: center;
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  .ghost {
    opacity: 0.5;
  }

  .drag {
    opacity: 0.7;
  }

  .sortable-ghost {
    opacity: 0.4;
    background-color: #f5f7fa;
  }

  .fallback {
    opacity: 0.5;
  }
}
</style>
