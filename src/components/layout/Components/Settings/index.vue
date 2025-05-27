<template>
  <div class="personal-setting">
    <section style="overflow: auto"
             :style="{ height: maxHeight }">
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
          <el-alert :closable="false"
                    title="注意:主题色仅会在保证正常显示与配色的前提下调整部分色彩,而非全部色彩."
                    type="warning"
                    show-icon />
        </div>
      </div>
      <div class="setting-block">
        <div class="settings">
          <background-image @changeSystemImage="changeSystemImage" />
          <div style="margin-left: 20px;">
            背景图展示方式：<el-button-group v-model="imgType"
                             style="padding: 10px;">
              <el-button v-for="(btn, index) in buttonConfigs"
                         :key="index"
                         :type="imgType === btn.value ? 'primary' : ''"
                         @click="settingStyle(btn.value)">
                {{ btn.label }}
              </el-button>
            </el-button-group>
            背景图透明度：<el-input-number :precision="1"
                             v-model="imgNum"
                             :step="0.1"
                             :min="0"
                             :max="1"
                             style="width: 10%;"
                             @change="getColor"></el-input-number>
          </div>
        </div>
        <div style="height: 35px;">
          <el-button style="position: absolute;right: 0;margin-top: 10px;margin-bottom: 10px;"
                     type="primary"
                     @click='saveTheme'>保存</el-button>
        </div>
      </div>
      <!-- <div class="setting-block">
        <div class="settings">
          <TableTheme />
          <el-alert :closable="false" title="注意:表格颜色仅会在保证正常显示与配色的前提下调整部分色彩,而非全部色彩." type="warning" show-icon />
        </div>
      </div> -->
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
import TableTheme from './Components/TableTheme.vue'

export default {
  name: 'PersonalSettings',
  data () {
    const { API_DEFAULT_CONFIG } = this.$sysConfig
    return {
      maxHeight: document.documentElement.clientHeight - 130 + 'px',
      buttonConfigs: [
        { label: '自适应', value: 1 },
        { label: '平铺', value: 2 },
        { label: '拉伸', value: 3 },
      ],
      imagePath: this.$store.getters.systemColor.imageUrl || '',
      imgType: this.$store.getters.systemColor.imgType || 1, // 默认选中第一个按钮
      imgNum: this.$store.getters.systemColor.imgNum || 0.7,
      api_default_config: API_DEFAULT_CONFIG,
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
  components: { UserInfo, theme, SystemConfig, BackgroundImage, TableTheme },
  mounted () {
    window.addEventListener('resize', this.resizeChart)
  },
  destroyed () {
    window.removeEventListener('resize', this.resizeChart)
  },
  methods: {
    settingStyle (value) {
      let that = this
      if (value) {
        this.imgType = value
      }
      let colors = {
        imgType: this.imgType
      }
      this.$store.dispatch('setSystemColor', colors)
    },
    changeSystemImage (imageUrl) {
      this.imagePath = imageUrl
    },
    getColor () {
      // let color = this.fromHex(this.theme)
      let colors = {
        imgNum: this.imgNum
      }
      this.$store.dispatch('setSystemColor', colors)
      // this.$set(this.objColor, 'themeColor', 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + this.imgNum + ')')
    },
    resizeChart () {
      this.maxHeight = document.documentElement.clientHeight - 130 + 'px'
    },
    saveTheme () {
      let themeObg = this.$store.getters.systemColor
      themeObg.imageUrl = this.$store.getters.imageId
      themeObg.theme = this.$store.getters.theme
      const url = '/framework/user/setting/save'
      const { devBaseUrl, prodBaseUrl, isDevMode } = this.api_default_config;
      const urlPrefix = isDevMode ? `${devBaseUrl}` : `${prodBaseUrl}`;
      let id = null
      if (this.$store.state.user.userSettingAll.theme?.length) {
        let tableSettingaAll = this.$store.state.user.userSettingAll.theme[0]
        id = tableSettingaAll.id
      }
      let params = [
        {
          id: id ? id : null,
          key: 'theme-setting',
          description: "theme-setting",
          type: "theme",
          value: JSON.stringify(themeObg)
        }
      ]
      this.$ajax
        .post(urlPrefix + url, params, {
          headers: { Authorization: this.$store.getters.token },
        })
        .then((res) => {
          this.$store.commit("SET_SETTING_ALL", res);
          this.$message.success("保存成功")
        })
        .catch((err) => {
          // console.log("user.setting.save--err", err);
        });
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
