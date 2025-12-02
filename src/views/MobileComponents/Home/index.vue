<script>
import { mapGetters } from 'vuex'
import kanbanView from '@/views/Framework/System/KanbanDesign/kanbanView.vue'

export default {
  name: 'index',
  components: {
    kanbanView
  },
  data() {
    return {
      menu: [],
      kanbanConfig: {
        id: '31136a0a4ea74d13abc9e56f5f97e42b',
        code: 'builtHomepage'
      }
    }
  },
  computed: {
    ...mapGetters(['addRouters'])
  },
  created() {
    console.log(this.$store.state.user.userSettingAll)
    this.getMenu()
  },
  methods: {
    getMenu() {
      let userSettingAll = this.$store.state.user.userSettingAll
      if (userSettingAll.Menu) {
        this.menu = userSettingAll.Menu[0].value.menu
      } else {
        let menu = []
        this.addRouters.forEach((item) => {
          if (item.children) {
            menu = menu.concat(item.children)
          }
        })
        this.menu = menu.slice(0, 9)
      }
    },
    go(menu) {
      this.$router.push({ name: menu.name })
    },
    goMoreMenu() {
      this.$router.push({ name: 'more' })
    }
  }
}
</script>

<template>
  <div class="home">
    <div class="menu">
      <div class="menu-item" v-for="menu in menu" :key="menu.path" @click="go(menu)">
        <i class="p8 menu-icon" :class="menu.meta.icon"></i>
        <span class="menu-title">{{ menu.meta.title }}</span>
      </div>
      <div class="menu-item" @click="goMoreMenu">
        <i class="menu-icon el-icon-menu" style="color: #a0bcee"></i>
        <span class="menu-title">更多</span>
      </div>
    </div>
    <kanban-view :kanbanConfig="kanbanConfig" style='flex: 1;margin-top: 10px;'></kanban-view>
  </div>
</template>

<style scoped lang="scss">
.home {
  box-sizing: border-box;
  padding-top: 10px;
  height: 100%;
  background: #eff3f7;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.menu {
  width: calc(100% - 28px);
  overflow: hidden;
  margin: 0 8px;
  padding: 0 6px;
  display: flex;
  flex-wrap: wrap;
  border-radius: 4px;
  background: #ffffff;

  .menu-item {
    margin: 6px 0;
    width: 25%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .menu-icon {
      color: #409eff;
      margin: 10px 0;
      font-size: 30px;
    }

    .menu-title {
      text-align: center;
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
::v-deep .vue-grid-layout {
  background: #eff3f7;
}
@media screen and (max-width: 1100px) {
  ::v-deep .normal-layout .normal-main .normalCenterFullHeight {
    height: 100% !important;
  }
}
</style>
