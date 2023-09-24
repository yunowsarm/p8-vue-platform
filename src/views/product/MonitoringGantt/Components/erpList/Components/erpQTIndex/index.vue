<template>
  <el-container>
    <el-header>
      <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" text-color="#333333" active-text-color="#1890ff" @select="menuSelect">
        <el-menu-item index="1">齐套明细表</el-menu-item>
        <el-menu-item index="2">齐套明细结构树</el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <template v-if="activeIndex == 1">
        <erp-list :plan-type-param="planTypeParam" :attention-erp-tasks="attentionErpTasks" @save-success="onPlanTypeViewClose"> </erp-list>
      </template>
      <template v-if="activeIndex == 2">
        <erp-tree :plan-type-param="planTypeParam"> </erp-tree>
      </template>
    </el-main>
  </el-container>
</template>
<script>
import { Container, Header, Main, Menu, MenuItem } from 'p8-components-ui'
import ErpList from './erpList'
import ErpTree from './erpTree'
export default {
  components: {
    ErpList,
    ErpTree,
    'el-container': Container,
    'el-header': Header,
    'el-main': Main,
    'el-menu': Menu,
    'el-menu-item': MenuItem
  },
  props: {
    planTypeParam: {
      type: Object,
      default: function () {
        return {}
      }
    },
    attentionErpTasks: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data() {
    return {
      activeIndex: '1',
      chatDrawer: false,
      thirdMenuParam: {},
      drawerConfig: {
        modal: false,
        'modal-append-to-body': false,
        'custom-class': 'custom-chat-drawer-class'
      }
    }
  },
  methods: {
    menuSelect(index, indexPath) {
      this.activeIndex = index
    },
    onPlanTypeViewClose(tableSelectValue) {
      this.$emit('close-modal', tableSelectValue)
    }
  }
}
</script>
<style lang="scss" scoped>
.el-main {
  padding: 0;
}
.el-header {
  padding: 0;
  height: 50px !important;
}
</style>
