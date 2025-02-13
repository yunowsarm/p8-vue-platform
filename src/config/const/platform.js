import { PLATFORM_PREFIX_NAME } from '../settings'

/**
 * 平台通用常量配置
 * =========================================
 * 这里的配置在每次项目创建后基本不会做任何修改。
 * =========================================
 * Author: Vicco Wang
 * Date: 2018.06.22
 */
export default {
  // 侧边栏
  sidebar: {
    isHiddenSideBarKey: `${PLATFORM_PREFIX_NAME}_SIDEBAR_HIDDEN_STATE`,
    isCollpasedSideBarKey: `${PLATFORM_PREFIX_NAME}_SIDEBAR_COLLAPSED_STATE`
  },
  // 快捷菜单
  shortcut: {
    shortcutKey: `${PLATFORM_PREFIX_NAME}_SHORTCUT_MENU`
  },
  // ai助手
  difyChatbot:false,
  // TOKEN NAME
  token: {
    tokenKey: `${PLATFORM_PREFIX_NAME}_PLATFORM`
  },
  // VIEWS
  views: {
    storageOpenedViewsKey: `${PLATFORM_PREFIX_NAME}_STORAGE_OPENED_VIEWS`,
    cachedViewsKey: `${PLATFORM_PREFIX_NAME}_USER_CACHED_VIEWS`
  },
  // SYSTEM THEME, 下面的色值对应的是ElementUI自定义主题色预设,可以是任意色
  systemTheme: {
    /**
     *
     */
    originalColor: '#409EFF',
    /**
     *
     */
    theme: {
      cyan: '#318B93',
      gray: '#8C9976',
      pink: '#F78298',
      red: '#F54961',
      blue: '#2095CD',
      purple: '#686789',
      green: '#2C5838',
      brownneslv: '#A7343B',
      blackish: '#1E524D',
      dark: '#212121'
    },
    systemThemeKey: `${PLATFORM_PREFIX_NAME}_SYSTEM_THEME`,
    systemImageKey: `${PLATFORM_PREFIX_NAME}_SYSTEM_IMAGE`,
    systemName: `${PLATFORM_PREFIX_NAME}_SYSTEM_NAME`,
  }
}
