<template>
  <list-layout :header-visible="false">
    <template #center>
      <el-button class="settingsButton" @click="settingsClick"><i class="el-icon-s-tools" style="margin-right: 5px"></i>设置</el-button>
      <!-- <el-button class="delectButton"
                 v-if="!!asyncComponents"
                 @click="settingsDelect"><i class="el-icon-delete"
           style="margin-right: 5px"></i>删除</el-button> -->
      <el-tabs v-model="activeName" :type="tabsParmar.type" :tab-position="tabsParmar.tabPosition" :stretch="tabsParmar.stretch" @tab-click="tabClick">
        <el-tab-pane v-for="(item, index) in tabsData" :key="index" :label="item.name" :name="item.name">
          <span slot="label"> <i v-if="item.icon" :class="['iconStyle', item.icon]" :style="{ color: item.color }"></i>{{ item.name }} </span>
          <div v-if="!asyncComponents" id="table-contain" @click="centerClick">
            <div class="text centerText">点击设置默认组件</div>
          </div>
          <component
            v-else
            :is="componentUrl"
            :code="componentsConfig.code"
            :data-view-id="componentsConfig.dataViewId"
            :record="{ desformCode: componentsConfig.codeForm }"
            :permission-vo="componentsConfig.permissionVo"
            :layout-config="componentsConfig"
            :kanban-config="componentsConfig"
            ref="components"
          ></component>
        </el-tab-pane>
      </el-tabs>
    </template>
    <template #drawer-panel>
      <settings
        v-if="settingVisible"
        :visible="settingVisible"
        :tabs-data="tabsData"
        :tabs-parmar="tabsParmar"
        :parmars-map="parmarsMap"
        @close="settingVisible = false"
        @handleOk="handleOk"
      ></settings>
      <select-components v-if="visibleEditDrawer" :visible="visibleEditDrawer" @close="visibleEditDrawer = false" @handleOk="componentsHandleOk"></select-components>
    </template>
  </list-layout>
</template>
<style lang="scss" scoped>
/deep/ .list-header {
  padding: 0;
}
.el-tabs.el-tabs--top,
.el-tabs.el-tabs--bottom {
  height: 100% !important;
  /deep/ .el-tabs__content {
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
  /deep/ .el-tabs__content {
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
.settingsButton {
  padding: 8px 6px;
  border-radius: 0px;
  position: absolute;
  right: 20px;
  top: 0;
  z-index: 200;
}
#table-contain {
  position: relative;
  overflow: hidden;
}
.centerText {
  width: 100%;
  height: 50px;
  position: absolute;
  left: 50%;
  top: 50%;
  font-size: 50px;
  transform: translate(-50%, -50%);
  letter-spacing: 30px;
}
.text {
  color: #e5e5e5;
  font-size: 40px;
  text-align: center;
  letter-spacing: 20px;
  font-weight: bold;
}
.delectButton {
  top: 40px;
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 0px;
  position: absolute;
  right: 0;
  z-index: 200;
}
.iconStyle {
  font-size: 16px;
  margin: 0 5px;
}
/deep/ .el-tabs__item.is-active {
  color: #1890ff;
}
/deep/ .list-layout .list-main {
  padding: 0;
}
/deep/.el-tabs.el-tabs--left .el-tabs__item {
  padding: 10px 0;
  padding: 10px 20px !important;
  border-right: 1px solid #e4e7ed;
}
/deep/ .el-tabs.el-tabs--right .el-tabs__item {
  padding: 10px 20px !important;
  border-left: 1px solid #e4e7ed;
}
/deep/ .el-tabs--left .el-tabs__item.is-left,
/deep/ .el-tabs--right .el-tabs__item.is-right {
  text-align: unset;
}
/deep/ .el-tabs--left .el-tabs__nav-wrap.is-left::after,
/deep/ .el-tabs--right .el-tabs__nav-wrap.is-right::after {
  width: 1px;
}
/deep/ .el-tabs__nav-wrap::after {
  height: 0;
}
// 默认四个方向
/deep/ .el-tabs.el-tabs--top > .el-tabs__header {
  border-bottom: 1px solid #e4e7ed;
  .el-tabs__item.is-active {
    border-bottom: 2px solid #1890ff;
  }
}
/deep/ .el-tabs.el-tabs--left > .el-tabs__header {
  border-right: 1px solid #e4e7ed;
  .el-tabs__item.is-active {
    border-right: 2px solid #1890ff;
  }
}
/deep/ .el-tabs.el-tabs--bottom > .el-tabs__header {
  border-top: 1px solid #e4e7ed;
  .el-tabs__item.is-active {
    border-top: 2px solid #1890ff;
  }
}
/deep/ .el-tabs.el-tabs--right > .el-tabs__header {
  border-left: 1px solid #e4e7ed;
  .el-tabs__item.is-active {
    border-left: 2px solid #1890ff;
  }
}

// 选项卡 四个方向
/deep/ .el-tabs--card > .el-tabs__header {
  border-top: none;
  border-bottom: none;
}
// 上
/deep/ .el-tabs--card.el-tabs--top > .el-tabs__header {
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
/deep/ .el-tabs--card.el-tabs--left > .el-tabs__header {
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
/deep/ .el-tabs--card.el-tabs--bottom > .el-tabs__header {
  margin-top: 0;
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
  }
  .el-tabs__item:last-child {
    border-right: 0px;
    border-left: 0px;
  }
}
// 右
/deep/ .el-tabs--card.el-tabs--right > .el-tabs__header {
  border-left: 1px solid #e4e7ed;
  .el-tabs__item.is-active {
    border-left: 2px solid #ffffff !important;
  }
  .el-tabs__nav {
    border: none;
  }
  .el-tabs__item {
    border-left: 1px solid #e4e7ed;
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
/deep/ .el-tabs--border-card.el-tabs--top > {
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
/deep/ .el-tabs--border-card.el-tabs--left > {
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
/deep/ .el-tabs--border-card.el-tabs--bottom > {
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
/deep/ .el-tabs--border-card.el-tabs--right > {
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
/deep/ .el-tabs__item {
  padding: 0 20px !important;
  height: unset;
  box-sizing: border-box;
}
</style>
<script>
import { P8ListLayout as ListLayout, P8Button as CommonButton, P8Tree as CommonTree, P8Dialog as CommonDialog } from 'p8-components-ui'
import settings from './Components/settings.vue'
import selectComponents from '@/views/Framework/ComponentsMananger/Components/selectComponents.vue'
export default {
  name: 'TabsNavigation',
  components: {
    ListLayout,
    CommonButton,
    CommonTree,
    CommonDialog,
    settings,
    selectComponents
  },
  props: {
    recordId: {
      type: String,
      default: ''
    }
  },
  computed: {
    componentUrl() {
      console.log(this.asyncComponents)
      if (this.asyncComponents) {
        return () => import(`@/views/${this.asyncComponents}.vue`)
      } else {
        return ''
      }
    }
  },
  data() {
    return {
      // 设置组件动态路径
      asyncComponents: '',
      code: '',
      activeName: '选项卡一',
      settingVisible: false,
      visibleEditDrawer: false,
      parmarsMap: [],
      tabsParmar: {
        type: '0',
        tabPosition: 'top',
        stretch: false,
        navigation: '0',
        dataType: '0'
      },
      tabsData: [
        {
          name: '选项卡一',
          id: '1',
          targetName: ''
        },
        {
          name: '选项卡二',
          id: '2',
          targetName: ''
        }
      ],
      componentsConfig: {},
      parmarsList: []
    }
  },
  created() {
    if (this.recordId) {
      this.$api['desLayout.view']({ id: this.recordId }).then((res) => {
        let data = JSON.parse(res.layoutJson)
        this.code = data.defaultComponents.code
        this.asyncComponents = data.defaultComponents.url
        this.componentsConfig = data.defaultComponents
        this.handleOk(data)
      })
    }
  },
  methods: {
    settingsClick() {
      this.settingVisible = true
    },
    async handleOk(saveParmars) {
      var dom = document.getElementById('table-contain')
      if (dom) {
        dom.style.height = '100%'
      }
      if (saveParmars.tabsParmar.navigation === '2') {
        saveParmars.tabsData = [
          {
            name: '三级菜单示意1',
            id: '1'
          },
          {
            name: '三级菜单示意2',
            id: '2'
          }
        ]
        dom.style.height = '0px'
      }
      this.tabsData = []
      this.tabsData = saveParmars.tabsData
      this.tabsParmar = saveParmars.tabsParmar
      this.parmarsMap = saveParmars.parmarsMap
      this.settingVisible = false
      if (this.tabsParmar.dataType == '1' && this.tabsParmar.reportSqlId) {
        let res = await this.$api['desLayout.execute']({ id: this.tabsParmar.reportSqlId })
        let data = []
        res.forEach((el) => {
          data.push({ name: el[this.tabsParmar.optionLabelCol], targetUrl: el[this.tabsParmar.optionUrl], id: el.ID, icon: el[this.tabsParmar.icon], color: el[this.tabsParmar.color], ...el })
        })
        this.tabsData = data
      }
      if (this.tabsData && this.tabsData.length > 0) {
        this.activeName = this.tabsData[0].name
      }
    },
    tabClick(target) {
      let tabs = this.tabsData.filter((el) => {
        return el.name === target.name
      })
      let paramsObj = {}
      let parmarsList = this.parmarsMap.filter((el) => {
        return el.after !== ''
      })
      if (parmarsList && parmarsList.length > 0) {
        parmarsList.forEach((el) => {
          paramsObj[el.after] = tabs[0][el.before]
        })
      }
      this.parmarsList = parmarsList
      // this.provideParams.searchParams = paramsObj
      if (this.tabsParmar.navigation === '1') {
        if (tabs[0].type == '0') {
          this.asyncComponents = tabs[0].componentsConfig.url
          this.componentsConfig = tabs[0].componentsConfig
        } else {
          this.asyncComponents = tabs[0].targetUrl
        }
      }
    },
    centerClick() {
      this.drawerTitle = '组件选择'
      this.visibleEditDrawer = true
    },
    // 选择组件确定
    componentsHandleOk(selectLayout) {
      this.componentsConfig = selectLayout
      this.asyncComponents = selectLayout.url
      this.visibleEditDrawer = false
    },
    getJSONdata() {
      let obj = {}
      obj = {
        previewUrl: 'Framework/ComponentsMananger/Layout/Components/TabsNavigation/V1.0/edit/Components/preview',
        tabsData: this.tabsData,
        tabsParmar: this.tabsParmar,
        parmarsMap: this.parmarsMap,
        defaultComponents: this.componentsConfig
      }
      return obj
    },
    settingsDelect() {
      this.asyncComponents = ''
    }
  }
}
</script>
