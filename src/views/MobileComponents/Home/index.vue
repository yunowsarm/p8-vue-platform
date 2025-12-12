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
        id: 'e05c9f3a0cbd91407eb674e809a8e4b8',
        code: 'builtHomepageMobile'
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
      let menuList = []
      this.addRouters.forEach((item) => {
        if (item.children) {
          menuList = menuList.concat(item.children)
        }
      })
      if(menuList.some(item => item.name === menu.name)){
        this.$router.push({ name: menu.name })
      }else{
        this.$message.error('权限不足，请联系管理员')
        return false
      }
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
  padding-bottom: 10px;

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
  ::v-deep .kanban_normal {
    margin: 0 !important;
    padding: 0 !important;
  }
}
</style>
