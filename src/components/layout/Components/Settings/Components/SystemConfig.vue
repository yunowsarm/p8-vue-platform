<template>
  <div class="system-config">
    <div class="tips">
      <div class="vertical_line"></div>
      系统配置
    </div>
    <el-form class="form_list" v-model="systemCfgForm" label-width="120px">
      <el-form-item :label="systemCfgForm.isShowSidebar ? '左边菜单栏隐藏' : '左边菜单栏显示'">
        <el-switch v-model="systemCfgForm.isShowSidebar"></el-switch>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { Form, FormItem, Switch } from 'p8-components-ui'
import { mapGetters } from 'vuex'
export default {
  name: 'SystemConfig',
  data() {
    return {
      systemCfgForm: {
        isShowSidebar: true
      }
    }
  },
  computed: {
    ...mapGetters(['sidebarState'])
  },
  watch: {
    'systemCfgForm.isShowSidebar': {
      handler: function (isHidden) {
        this.$store.dispatch('hideSidebar', !isHidden)
      }
    }
  },
  beforeMount() {
    this.systemCfgForm.isShowSidebar = !this.sidebarState.isHidden
  },
  components: {
    'el-form': Form,
    'el-form-item': FormItem,
    'el-switch': Switch
  }
}
</script>
<style lang="scss" scoped>
.tips {
  display: flex;
  align-items: center;
  font-size: 20px;
  margin: 8px 8px 8px 26px;
}
.vertical_line {
  margin-right: 8px;
  width: 3px;
  height: 16px;
  background: $theme-color;
}
.form_list {
  margin-left: 40px;
}
</style>
