<template>
  <div class="tag-tabs"
       :style="{ height: tagTabHeight }">
    <beauti-context ref="menu"
                    type="contextmenu"
                    @show="showContextmenu">
      <beauti-contextmenu>
        <beauti-contextmenu-item :disabled="isDisableCloseItem"
                                 @click="closeTabByContextmenu">关闭标签页</beauti-contextmenu-item>
        <beauti-contextmenu-item divider />
        <beauti-contextmenu-item @click="closeOthersTabByContextmenu">关闭其他标签页</beauti-contextmenu-item>
        <beauti-contextmenu-item @click="closeRightTabByContextmenu">关闭右侧标签页</beauti-contextmenu-item>
        <beauti-contextmenu-item divider />
        <beauti-contextmenu-item :disabled="isDisableCloseItem"
                                 @click="addToShortcutMenu">添加为快捷菜单</beauti-contextmenu-item>
        <beauti-contextmenu-item :disabled="isDisableCloseItem"
                                 @click="removeShortcutMenu">移除快捷菜单</beauti-contextmenu-item>
      </beauti-contextmenu>
    </beauti-context>
    <scroll-pane>
      <draggable v-model="visitedViews"
                 v-bind="tabDragOptions">
        <router-link tag="div"
                     class="tab-item"
                     v-beautiContext:menu="tab"
                     v-for="tab in visitedViews"
                     :to="tab.path"
                     :key="tab.path"
                     :class="{ active: isActive(tab), isShowCloseBtn: !isShowCloseBtn(tab) }">
          <span>
            <i class="p8"
               :class="tab.meta.icon"></i>
            <span class="top-line"
                  :style="{ background: theme }"></span>
            {{ tab.meta.title }}
          </span>
          <span v-if="isShowCloseBtn(tab)"
                class="close el-icon-error"
                @click.prevent.stop="closeTab(tab)"></span>
        </router-link>
      </draggable>
    </scroll-pane>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import draggable from 'vuedraggable'
import scrollPane from '@/components/scrollPane'

export default {
  name: 'TagTabs',
  data () {
    return {
      isDisableCloseItem: false,
      tabDragOptions: {
        animation: 120,
        filter: '.no-drag'
      }
    }
  },
  computed: {
    ...mapGetters(['token', 'tagTabHeight', 'theme', 'shortcutMenu', 'homepage']),
    visitedViews: {
      get () {
        return this.$store.state.views.visitedViews
      },
      set (views) {
        this.$store.dispatch('dragedViews', views)
      }
    }
  },
  watch: {
    $route () {
      this.addViewToVisided()
    }
  },
  mounted () {
    this.addViewToVisided()
  },
  methods: {
    isActive (view) {
      return this.$route.path === view.path
    },
    isShowCloseBtn (view) {
      const reg = new RegExp(this.homepage.path)
      return !reg.test(view.path)
    },
    addViewToVisided () {
      var thisRoute = this.$route.name ? this.$route : null
      if (thisRoute) this.$store.dispatch('addVisitedViews', { route: thisRoute, token: this.token })
    },
    closeTab (view) {
      this.$store.dispatch('removeVisitedViews', view).then((res) => {
        this.$nextTick(() => {
          // 移除过后的visitedViews Array object
          const views = [...res.views]
          // 移除view的下一个view, 用于帮助自动Acitve下一个view
          const nextView = res.theNextView
          // 如果移除的是已Active的View才需要协助触发一些后续操作
          if (this.isActive(view)) {
            // 如果没有下一个view,可能当前移除的已经是最后一个,那么需要返回 visitedViews的最后一个
            const lastView = nextView === null && views.slice(-1)[0]
            // 如果有下一个则直接跳转路由
            if (nextView) {
              this.$router.push(nextView.path)
              // 如果当前移除的已经是最后一个,则应该跳转至visitedViews的最后一个路由
            } else {
              if (lastView) {
                this.$router.push(lastView.path)
              } else {
                // 保证最后不能出现空visitedList
                // TODO 应该做一个可以默认无法关闭的首页view
                this.$router.push({
                  path: '/',
                  query: {
                    t: new Date().getTime()
                  }
                })
              }
            }
          }
        })
        // 关闭标签时触发一个广播
        // TODO: 暂时不发送广播
        // eventBus.$emit('platform.navTab.removed', { removed: view })
      })
    },
    closeOtherTabs (view) {
      this.$store.dispatch('removeOtherViews', view).then(() => {
        this.$router.push(view.path)
      })
    },
    closeRightTabs (view) {
      this.$store.dispatch('removeRightViews', view).then(() => {
        this.$router.push(view.path)
      })
    },
    addToShortcutMenu (contextmenu, event, { path, name, meta }) {
      const menuItem = { path, name, meta }
      this.$store.dispatch('addShortcutMenu', menuItem)
    },
    removeShortcutMenu (contextmenu, event, { path, name, meta }) {
      const menuItem = { path, name, meta }
      this.$store.dispatch('removeShortcutMenu', menuItem)
    },
    showContextmenu (contextmenu, event, { path, name }) {
      this.isDisableCloseItem = name === this.homepage.name
    },
    closeTabByContextmenu (contextmenu, event, tabView) {
      this.closeTab(tabView)
    },
    closeOthersTabByContextmenu (contextmenu, event, tabView) {
      this.closeOtherTabs(tabView)
    },
    closeRightTabByContextmenu (contextmenu, event, tabView) {
      this.closeRightTabs(tabView)
    }
  },
  components: {
    scrollPane,
    draggable
  }
}
</script>

<style lang="scss" scoped>
.tag-tabs {
  // background-color: $base-white-color;
  background: #ffffff;
  box-sizing: border-box;

  div {
    display: flex;

    .tab-item {
      display: flex;
      height: 40px;
      line-height: 38px;
      font-weight: bold;
      align-items: center;
      padding: 0 2px 0 18px;
      // background-color: $base-white-color;
      box-sizing: border-box;
      cursor: pointer;
      overflow: hidden;
      user-select: none;
      transition: all 0.2s ease 0s;

      &.isShowCloseBtn > span {
        padding-right: 10px;
      }

      > span {
        display: inline-block;
        white-space: nowrap;
        vertical-align: middle;

        > i {
          color: #333333;
          position: relative;
          top: 1px;
          font-size: $font-size-medium;
        }

        &.close {
          font-size: 12px;
          margin: -16px 0 0 0;
          color: #e9ecef;

          &:before {
            position: relative;
            top: 1px;
          }

          // &:hover {
          //   color: darken($base-red-color, 30%);
          //   font-weight:600;
          //   background-color: lighten($base-red-color, 5%);
          // }
        }
      }

      &.active {
        position: relative;
        color: $base-light-color;
        // background-color: lighten($base-light-color, 100%);
        // box-shadow: 0 5px 5px -3px rgba(0,0,0,.2), 0 8px 10px 1px rgba(0,0,0,.14), 0 3px 14px 2px rgba(0,0,0,.12);

        span.top-line {
          height: 0;
        }

        span.close {
          color: #48bf9f;
        }

        > span > i {
          color: $base-light-color;
        }
      }

      &:last-child {
        border-right: none;
      }

      &:hover:not(.active) {
        color: $base-light-color;
        // box-shadow: 0 5px 10px -3px rgba(0,0,0,.2), 0 8px 15px 1px rgba(0,0,0,.14), 0 3px 14px 2px rgba(0,0,0,.12);

        span.close {
          color: #48bf9f;
        }

        > span > i {
          color: $base-light-color;
        }
      }
    }
  }
}
</style>
