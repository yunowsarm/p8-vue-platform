<template>
  <el-container class="menuLayout" v-inherited-height>
    <el-main>
      <el-tabs
        v-model="activeMenu"
        @tab-click="tabClick"
        :type="tabsParmar.type"
        :tab-position="tabsParmar.tabPosition"
        :stretch="tabsParmar.stretch"
        v-if="thirdMenuData && thirdMenuData.length > 0"
        :router="true"
      >
        <el-tab-pane v-for="item in thirdMenuData" :key="item.name" :label="item.meta.title" :name="item.name">
          <template v-if="cache">
            <keep-alive>
              <router-view :third-menu-param="thirdMenuParam"></router-view>
            </keep-alive>
          </template>
          <template v-else>
            <router-view :third-menu-param="thirdMenuParam"></router-view>
          </template>
        </el-tab-pane>
      </el-tabs>
    </el-main>
  </el-container>
</template>
<style lang="scss" scoped></style>
<script>
import { Container, Main } from 'element-ui'
export default {
  name: 'P8MenuLayout',
  componentName: 'P8MenuLayout',
  components: {
    'el-container': Container,
    'el-main': Main
  },
  props: {
    cache: {
      // 是否启用缓存
      type: Boolean,
      default: true
    },
    thirdMenuParam: {
      // 给三级菜单所传的参数
      type: Object,
      default: () => {
        return {}
      }
    },
    defaultMenu: {
      type: Object,
      default: () => {
        return {}
      }
    },
    filterThirdMenu: {
      // 过滤三级菜单， 值为路由的name；  过滤多个时， 以逗号拼接。
      type: String,
      default: ''
    },
    tabsParmar: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      thirdMenuData: [],
      activeMenu: ''
    }
  },
  destroyed() {},
  created() {
    console.log(this.tabsParmar, '===tabsParmar')
    this.initData()
  },
  mounted() {},
  directives: {
    'inherited-height': {
      bind(el, binding) {},
      unbind(el, binding) {},
      inserted(el, binding) {
        const selfDom = el
        const selfDomParentDom = selfDom.parentNode || selfDom.parentElement
        // eslint-disable-next-line no-unused-vars
        let time = setTimeout(function () {
          // 兼容谷歌49
          if (selfDomParentDom.offsetHeight !== selfDom.offsetHeight) {
            selfDom.style.height = selfDomParentDom.offsetHeight + 'px'
          } else {
            selfDom.style.removeProperty('height')
          }
        }, 10)
      },
      undate(el, binding) {},
      componentUpdated(el, binding) {}
    }
  },
  watch: {
    $route: {
      handler(val, oldval) {
        if (this.thirdMenuData.length) {
          let index = this.thirdMenuData
            .map((i) => {
              return i.path
            })
            .indexOf(val.path)
          if (index === -1) {
            this.activeMenu = this.thirdMenuData[index]
          }
        }
      },
      // 深度观察监听
      deep: true
    }
  },
  methods: {
    tabClick(node) {
      let tabs = this.thirdMenuData.filter((el) => {
        return el.meta.title === node.label
      })
      this.$router.push(tabs[0].name)
    },
    initData() {
      const currentPath = this.$route.path
      const rootRouter = this.$store.state.routers.addRouters
      let thirdMenu = []
      if (rootRouter && rootRouter.length > 0) {
        const querySubRoute = (rootRouter) => {
          rootRouter.some(function (item, index) {
            if (item.path === currentPath) {
              thirdMenu = item
              return true
            } else {
              item.children && item.children.length > 0 && querySubRoute(item.children)
            }
          })
        }
        querySubRoute(rootRouter)
      }
      let children = thirdMenu.children
      let tempChildren = []
      if (this.filterThirdMenu) {
        children.map((item) => {
          if (this.filterThirdMenu.indexOf(item.name) === -1) {
            tempChildren.push(item)
          }
        })
      }
      this.thirdMenuData = this.filterThirdMenu ? tempChildren : thirdMenu.children
      if (this.thirdMenuData && this.thirdMenuData.length > 0) {
        if (Object.keys(this.defaultMenu).length) {
          this.activeMenu = this.defaultMenu.name
          this.$router.replace({ path: this.defaultMenu.path })
        } else {
          this.activeMenu = this.thirdMenuData[0].name
          this.$router.replace({ path: this.thirdMenuData[0].path })
        }
      }
    }
  }
}
</script>
