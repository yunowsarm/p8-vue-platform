<template>
  <el-container class="menuLayout">
    <el-header>
      <el-tabs v-model="activeMenu"
               @tab-click="handleClick"
               class="el-menu-demo">
        <el-tab-pane v-for="item in thirdMenuData"
                     :key="item.name"
                     :label="item.name"
                     :name="item.name">
        </el-tab-pane>
      </el-tabs>
    </el-header>
    <el-main>
      <P8TableRender :key="nowTime"
                     ref="tableRender"
                     :code="code"
                     @handle="handle"
                     :reportParam="reportParam"></P8TableRender>
    </el-main>
    <common-drawer v-if="visibleProcessDrawer"
                   :visible="visibleProcessDrawer"
                   title="处理"
                   @close="closeMyApproval"
                   direction="ttb"
                   size="100%">
      <template #drawer>
        <formView :formViewId="formViewId"
                  @saveSuccess="saveSuccess" />
      </template>
    </common-drawer>
  </el-container>
</template>
<script>
import { P8Drawer as CommonDrawer } from 'p8-components-ui'
import formView from './formView.vue'
export default {
  name: 'P8ButtonNavigationViews',
  props: {
  },
  data () {
    return {
      activeMenu: '待处理',
      thirdMenuData: [{ name: '待处理' }, { name: '抄送' }],
      reportParam: { showView: 'showView002' },
      nowTime: new Date().getTime(),
      visibleProcessDrawer: false,
      codeForm: 'myIssue',
      propParam: {},
      formViewId: '',
      code: 'problemManagement'
    }
  },
  components: {
    CommonDrawer,
    formView
  },
  mounted () { },
  methods: {
    select (item) {
    },
    handleClick (tab) {
      if (this.activeMenu == '待处理') {
        this.code = 'problemManagement'
        this.reportParam = { showView: 'showView002' }
      } else {
        this.code = 'problemManagementCopyTo'
        this.reportParam = { showView: 'showView003' }
      }
      this.nowTime = new Date().getTime()
    },
    handle (row) {
      this.formViewId = row[0].ID
      this.visibleProcessDrawer = true
    },
    closeMyApproval () {
      this.visibleProcessDrawer = false
    },
    saveSuccess () {
      this.closeMyApproval()
      this.$refs.tableRender.formCloseRefresh()
    }
  },
}
</script>
<style lang='scss' scoped>
.menuLayout.el-container {
  margin: 14px;
  height: calc(100% - 30px);
  padding: 0 20px;
  .el-header {
    height: 50px !important;
    padding: 0;
  }

  .el-main {
    padding: 0;
    overflow: hidden;
    background: #f7f8fc;
    height: 100%;
    position: relative;
    > div:only-child {
      height: inherit;
      width: 100%;
      position: absolute;
      > div:only-child {
        height: 100%;
      }
    }
  }
}
.el-menu-demo {
  height: 50px;
  ::v-deep .el-tabs__header {
    height: 50px;
    .el-tabs__nav-wrap,
    .el-tabs__nav-scroll,
    .el-tabs__nav {
      height: 50px;
    }
  }
  ::v-deep.el-tabs__nav-wrap::after {
    height: 1px !important;
  }
  ::v-deep .el-tabs__item {
    font-size: 14px;
    font-weight: bold;
    padding: 0 20px !important;
    line-height: 50px;
  }
}
.el-menu-demo.el-menu--horizontal {
  border-bottom: #e1e1e1;

  &::before {
    height: 1px;
    width: 100%;
    background: #e1e1e1;
    position: absolute;
    top: 49px;
    left: 0;
  }

  > .el-menu-item {
    line-height: 50px !important;
    height: 50px !important;
    color: #333333;
    font-weight: bold;

    &.is-active {
      color: #133b78;
    }

    &:hover {
      color: #133b78;
      border-bottom: 2px solid #133b78 !important;
    }
  }
}
</style>