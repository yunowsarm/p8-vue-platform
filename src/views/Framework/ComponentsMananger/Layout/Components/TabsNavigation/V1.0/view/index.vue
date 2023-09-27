<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <list-layout :header-visible="false">
    <template #center>
      <menu-layout v-if="tabsParmar.navigation === '2'"
                   ref="menuLayout"
                   :third-menu-param="thirdMenuParam"
                   :cache="false"
                   :default-menu="defaultMenu"></menu-layout>
      <el-tabs v-else
               v-model="activeName"
               :type="tabsParmar.type"
               :tab-position="tabsParmar.tabPosition"
               :stretch="tabsParmar.stretch"
               @tab-click="tabClick">
        <el-tab-pane v-for="(item, index) in tabsData"
                     :key="index"
                     :label="item.name"
                     :name="item.name"
                     @tab-click="tabClick">
          <span slot="label"> <i v-if="item.icon"
               :class="['iconStyle', item.icon]"
               :style="{ color: item.color }"></i>{{ item.name }} </span>
          <!-- <component :is="componentUrl"
                     :code="code"
                     ref="components"></component> -->
          <component v-if="activeName == item.name"
                     :is="componentUrl"
                     :code="componentsConfig.code"
                     :record="{ desformCode: componentsConfig.codeForm }"
                     :permission-vo="componentsConfig.permissionVo"
                     :layout-config="componentsConfig"
                     :kanban-config="componentsConfig"
                     :west-tree-param="provideParams.searchParams"
                     :configParmars="configParmars"
                     v-bind="$attrs"
                     v-on="$listeners"
                     @save-success="saveSuccess"
                     ref="components"></component>
        </el-tab-pane>
      </el-tabs>
    </template>
  </list-layout>
</template>
<style lang="scss" scoped>
.el-tabs.el-tabs--top,
.el-tabs.el-tabs--bottom {
  height: 100% !important;
  ::v-deep .el-tabs__content {
    height: calc(100% - 51px) !important;
    > div {
      height: 100%;
    }
    .normal-layout {
      margin: 0;
      height: 100%;
      .common-table {
        height: 100% !important;
      }
    }
  }
}
.el-tabs.el-tabs--left,
.el-tabs.el-tabs--right {
  height: 100% !important;
  ::v-deep .el-tabs__content {
    height: calc(100% - 10px) !important;
    > div {
      height: 100%;
    }
    .normal-layout {
      margin: 0;
      height: 100%;
      .common-table {
        height: 100% !important;
      }
      .normal-main {
        height: 100%;
      }
      .normal-center {
        height: calc(100% - 50px);
      }
    }
  }
}
// ::v-deep .el-tabs__header .el-tabs__item {
//   border-bottom: 1px solid #e4e7ed;
// }
::v-deep.el-tabs--card > .el-tabs__header .el-tabs__item.is-active {
  color: #2196f3;
}
.iconStyle {
  font-size: 16px;
  margin: 0 5px;
}
::v-deep .normal-layout {
  margin: 0;
}
::v-deep.el-tabs.el-tabs--left .el-tabs__item {
  padding: 10px 0;
  padding: 10px 20px !important;
  border-right: 1px solid #e4e7ed;
}
::v-deep .el-tabs.el-tabs--right .el-tabs__item {
  padding: 10px 20px !important;
  margin: 0;
  border-left: 1px solid #e4e7ed;
}
::v-deep .el-tabs--left .el-tabs__item.is-left,
::v-deep .el-tabs--right .el-tabs__item.is-right {
  text-align: unset;
}
::v-deep .el-tabs--left .el-tabs__nav-wrap.is-left::after,
::v-deep .el-tabs--right .el-tabs__nav-wrap.is-right::after {
  width: 1px;
}
::v-deep .el-tabs__nav-wrap::after {
  height: 0;
}
// 默认四个方向
::v-deep .el-tabs.el-tabs--top > .el-tabs__header {
  border-bottom: 1px solid #e4e7ed;
  .el-tabs__item.is-active {
    border-bottom: 2px solid #1890ff;
  }
}
::v-deep .el-tabs.el-tabs--left > .el-tabs__header {
  border-right: 1px solid #e4e7ed;
  .el-tabs__item.is-active {
    border-right: 2px solid #1890ff;
  }
}
::v-deep .el-tabs.el-tabs--bottom > .el-tabs__header {
  border-top: 1px solid #e4e7ed;
  .el-tabs__item.is-active {
    border-top: 2px solid #1890ff;
  }
}
::v-deep .el-tabs.el-tabs--right > .el-tabs__header {
  border-left: 1px solid #e4e7ed;
  .el-tabs__item.is-active {
    border-left: 2px solid #1890ff;
  }
}

// 选项卡 四个方向
::v-deep .el-tabs--card > .el-tabs__header {
  border-top: none;
  border-bottom: none;
}
// 上
::v-deep .el-tabs--card.el-tabs--top > .el-tabs__header {
  border-bottom: 1px solid #e4e7ed;
  .el-tabs__item.is-active {
    border-bottom: 1px solid;
    border-bottom-color: #ffffff;
  }
  .el-tabs__nav {
    border: none;
  }
  .el-tabs__item {
    border-right: 1px solid #e4e7ed;
    border-left: 0px;
  }
  .el-tabs__item:last-child {
    border-right: 0px;
    border-left: 0px;
  }
}
// 左
::v-deep .el-tabs--card.el-tabs--left > .el-tabs__header {
  border-right: 1px solid #e4e7ed;
  .el-tabs__item.is-active {
    border-right: 2px solid #ffffff !important;
  }
  .el-tabs__nav {
    border: none;
  }
  .el-tabs__item {
    border-right: 1px solid #e4e7ed;
    border-bottom: 1px solid #e4e7ed;
    border-top: 0px;
  }
  .el-tabs__item:last-child {
    border-bottom: 0px;
    border-top: 0px;
  }
}
// 下
::v-deep .el-tabs--card.el-tabs--bottom > .el-tabs__header {
  // margin-top: 0;
  border-top: 1px solid #e4e7ed;
  .el-tabs__item.is-active {
    border-top: 2px solid;
    border-top-color: #ffffff;
  }
  .el-tabs__nav {
    border: none;
    position: relative;
    bottom: 1px;
  }
  .el-tabs__nav-wrap.is-bottom {
    overflow: unset;
  }
  .el-tabs__nav-scroll {
    overflow: unset;
  }
  .el-tabs__item {
    border-right: 1px solid #e4e7ed;
    border-left: 0px;
    border-bottom: 0px;
  }
  .el-tabs__item:last-child {
    border-right: 0px;
    border-left: 0px;
  }
}
// 右
::v-deep .el-tabs--card.el-tabs--right > .el-tabs__header {
  border-left: 1px solid #e4e7ed;
  .el-tabs__item.is-active {
    border-left: 2px solid #ffffff !important;
  }
  .el-tabs__nav {
    border: none;
  }
  .el-tabs__item {
    border-left: 0px;
    border-bottom: 1px solid #e4e7ed;
    border-top: 0px;
  }
  .el-tabs__item:last-child {
    border-bottom: 0px;
    border-top: 0px;
  }
}

// 卡片四个方向
// 上
::v-deep .el-tabs--border-card.el-tabs--top > {
  .el-tabs__content {
    padding: 0;
  }
  .el-tabs__header {
    border-bottom: none;
    .el-tabs__item.is-active {
      border-color: #fff;
      border-bottom: 2px solid;
      border-bottom-color: #ffffff;
    }
  }
}
// 左
::v-deep .el-tabs--border-card.el-tabs--left > {
  .el-tabs__content {
    padding: 0;
  }
  .el-tabs__header .el-tabs__item.is-active {
    border-color: #fff;
    border-right: 2px solid;
    border-right-color: #ffffff;
  }
  .el-tabs__header .el-tabs__item {
    border-right: 2px solid #fff;
  }
}
// 下
::v-deep .el-tabs--border-card.el-tabs--bottom > {
  .el-tabs__content {
    padding: 0;
  }
  .el-tabs__header {
    border-top: none;
    .el-tabs__item.is-active {
      border-color: #fff;
      border-top: 2px solid;
      border-top-color: #ffffff;
    }
  }
}
// 右
::v-deep .el-tabs--border-card.el-tabs--right > {
  .el-tabs__content {
    padding: 0;
  }
  .el-tabs__header .el-tabs__item.is-active {
    border-color: #fff;
    border-left: 2px solid;
    border-left-color: #ffffff;
  }
  .el-tabs__header .el-tabs__item {
    border-left: 2px solid #fff;
  }
}
::v-deep .el-tabs__item {
  padding: 0 20px !important;
  height: unset;
  box-sizing: border-box;
}
</style>
<script>
import { Input, Button } from 'element-ui'
import { P8Dialog as CommonDialog, P8ListLayout as ListLayout, P8MenuLayout as MenuLayout } from 'p8-components-ui'
import tabsLayout from '../edit/Components/tabsLayout.vue'
export default {
  name: 'TabsNavigationPreview',
  computed: {
    componentUrl () {
      if (this.asyncComponents) {
         if (this.asyncComponents.indexOf('?') !== -1) {
          const list = this.asyncComponents.split('?')
          const url = list[0]
          const parmars = list[1].split('&')
          const obj = {}
          parmars.forEach((item) => {
            const str = item.split('=')
            if (str[0] === 'code') {
              obj.code = str[1]
            }
          })
          this.componentsConfig = obj
          return () => import('@/views/' + url + '.vue')
        } else {
          return () => import(`@/views/${this.asyncComponents}.vue`)
        }
      } else {
        return ''
      }
    }
  },
  provide () {
    return {
      provideParams: this.provideParams
    }
  },
  props: {
    layoutConfig: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      dialogHeight: document.documentElement.clientHeight * 0.6,
      tabsParmar: {},
      tabsData: [],
      asyncComponents: '',
      code: '',
      activeName: '',
      defaultMenu: {},
      thirdMenuParam: {},
      provideParams: {
        searchParams: {}
      },
      componentsConfig: {},
      configParmars: {}
    }
  },
  components: {
    'el-input': Input,
    'el-button': Button,
    ListLayout,
    CommonDialog,
    MenuLayout,
    tabsLayout
  },
  watch: {
    $route: {
      handler (val) {
        this.init()
      }
    }
  },
  created () {
    this.init()
  },
  methods: {
    async init () {
      const code = this.layoutConfig.layoutCode ? this.layoutConfig.layoutCode : this.$route.meta.code
      const version = this.layoutConfig.layoutVersion ? this.layoutConfig.layoutVersion : this.$route.meta.version
      const res = await this.$api['desLayout.getLayoutJson']({ layoutCode: code, version: version })
      this.previewParmars = JSON.parse(res)
      const { tabsParmar, tabsData, defaultComponents, parmarsMap } = this.previewParmars
      this.tabsParmar = tabsParmar
      this.tabsData = tabsData
      this.parmarsMap = parmarsMap
      if (this.tabsParmar.navigation === '2') {
        const currentPath = this.$route.path;
        const rootRouter = this.$store.state.routers.addRouters;
        let thirdMenu = [];
        if (rootRouter && rootRouter.length > 0) {
          const querySubRoute = (rootRouter) => {
            rootRouter.some(function (item, index) {
              if (item.path === currentPath) {
                thirdMenu = item;
                return true;
              } else {
                item.children &&
                  item.children.length > 0 &&
                  querySubRoute(item.children);
              }
            });
          };
          querySubRoute(rootRouter);
        }
        if (thirdMenu.children && thirdMenu.children.length) {
          this.defaultMenu = thirdMenu.children[0]
          if (!this.$refs.menuLayout.activeMenu) {
            this.$router.replace({ path: this.defaultMenu.path });
          }
        }
        return
      }
      // 默认组件存在则显示默认组件，不存在默认选中第一个选项页
      if (defaultComponents.url) {
        this.asyncComponents = defaultComponents.url ? defaultComponents.url : ''
        this.componentsConfig = defaultComponents
      } else {
        const tabObj = this.tabsData[0]
        const paramsObj = {}
        const parmarsList = this.parmarsMap.filter((el) => {
          return el.after !== ''
        })
        if (parmarsList && parmarsList.length > 0) {
          parmarsList.forEach((el) => {
            paramsObj[el.after] = tabObj[el.before]
          })
        }
        let otherParmarsMap = {}
        if (tabObj.otherParmarsMap) {
          otherParmarsMap = JSON.parse(tabObj.otherParmarsMap)
        }
        this.provideParams.searchParams = { ...paramsObj, ...otherParmarsMap }
        if (this.tabsParmar.navigation === '1') {
          if (tabObj.type == '0') {
            this.asyncComponents = tabObj.componentsConfig.url
            this.componentsConfig = tabObj.componentsConfig
          } else {
            this.asyncComponents = tabObj.targetUrl
          }
        }
      }
      this.activeName = this.tabsData[0].name
    },
    tabClick (target) {
      const tabs = this.tabsData.filter((el) => {
        return el.name === target.name
      })
      const paramsObj = {}
      const parmarsList = this.parmarsMap.filter((el) => {
        return el.after !== ''
      })
      if (parmarsList && parmarsList.length > 0) {
        parmarsList.forEach((el) => {
          paramsObj[el.after] = tabs[0][el.before]
        })
      }
      let otherParmarsMap = {}
      if (tabs[0].otherParmarsMap) {
        otherParmarsMap = JSON.parse(tabs[0].otherParmarsMap)
      }
      this.provideParams.searchParams = { ...paramsObj, ...otherParmarsMap }
      if (this.tabsParmar.navigation === '1') {
        if (tabs[0].type == '0') {
          this.asyncComponents = tabs[0].componentsConfig.url
          this.componentsConfig = tabs[0].componentsConfig
        } else {
          this.asyncComponents = tabs[0].targetUrl
        }
      }
      this.$emit('tabClick', target)
    },
    handleCancel () {
      this.$emit('close')
    },
    saveSuccess (res) {
      console.log(res,'---res布局');
      this.configParmars.id = res
    }
  }
}
</script>
