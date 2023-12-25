<template>
  <div class="personal-setting">
    <section style="overflow: auto" :style="{ height: maxHeight }">
      <div class="setting-block">
        <div class="settings">
          <user-info />
        </div>
      </div>
      <div class="setting-block">
        <div class="settings">
          <system-config />
        </div>
      </div>
      <div class="setting-block">
        <div class="settings">
          <theme />
          <el-alert :closable="false" title="注意:主题色仅会在保证正常显示与配色的前提下调整部分色彩,而非全部色彩." type="warning" show-icon> </el-alert>
        </div>
      </div>
      <div class="setting-block">
        <div class="settings">
          <background-image />
        </div>
      </div>
      <!-- <div class="setting-block">
        <h4>快捷菜单</h4>
        <div class="settings">
          <shortcut-menu :menu-list="menuList" />
          <div class="info">
            最多只能添加
            <strong>15</strong>
            枚快捷菜单! 建议只选择最常用的功能.
          </div>
        </div>
      </div> -->
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import UserInfo from './Components/UserInfo'
import theme from './Components/Theme'
// import ShortcutMenu from './Components/ShortcutMenu'
import SystemConfig from './Components/SystemConfig'
import BackgroundImage from './Components/BackgroundImage'

export default {
  name: 'PersonalSettings',
  data () {
    return {
      maxHeight: document.documentElement.clientHeight - 130 + 'px'
    }
  },
  computed: {
    ...mapGetters(['systemTheme']),
    menuList () {
      return this.$store.getters.asyncRouter
    },
    headerColor: () => {
      const baseTheme = this.$config.THEME_DEFAULT_CONFIG.theme
      return baseTheme[this.systemTheme]
    }
  },
  components: { UserInfo, theme, SystemConfig, BackgroundImage },
  mounted () {
    window.addEventListener('resize', this.resizeChart)
  },
  destroyed () {
    window.removeEventListener('resize', this.resizeChart)
  },
  methods: {
    resizeChart () {
      this.maxHeight = document.documentElement.clientHeight - 130 + 'px'
    }
  }
}
</script>
<style lang="scss" scoped>
.personal-setting {
  position: relative;
  min-height: 300px;
  overflow: auto;
  background: mix($base-gray-color, #fff, 5%);

  header {
    color: #fff;
    padding: 10px;
    font-size: 1.3rem;
    opacity: 0.5;
  }

  section {
    display: -webkit-box;
    flex-direction: column;
    // justify-content: center;
    align-items: center;
    padding: 15px 0;
    background: mix($base-gray-color, #fff, 5%);

    .setting-block {
      width: calc(100% - 52px);
      position: relative;
      margin-bottom: 15px;
      z-index: 1;

      &:last-child {
        margin-bottom: 0;
      }

      h4 {
        font-size: 1.1rem;
        color: darken($base-gray-color, 10%);
      }

      .settings {
        padding: 10px;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 1px 10px rgba(0, 0, 0, 0.2);

        .info {
          clear: both;
          margin: 5px;
          padding: 5px 5px 0 5px;
          color: darken($base-gray-color, 5%);
          border-top: 1px solid darken($base-light-color, 5%);
        }
      }
    }
  }
}
</style>
