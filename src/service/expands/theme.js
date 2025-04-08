/**
 * Load custom theme
 */
import Cookie from 'vue-cookie'
import GLOBAL_CONST from '@/config/const'

const SYSTEM_THEME_KEY = GLOBAL_CONST.systemTheme.systemThemeKey

/**
 * 根据主题名称动态配置当前系统主题包
 * @param {string} theme
 */
export default {
  install(Vue, { store }) {
    const theme = Cookie.get(SYSTEM_THEME_KEY)
    store.dispatch('setTheme', { theme })
    const systemColor = Cookie.get('systemColor')
    if (systemColor) {
      store.dispatch('setSystemColor', JSON.parse(systemColor))
    } else {
      const colors = {
        tableBgColor: '#ffffff',
        tableHeaderBgColor: '#f9f9f9',
        tableStripeColor: '#f9f9f9',
        tableRowHoverBgColor: '#f0f8ff',
        tableBorderColor: '#ebeef5',
        tableTextColor: '#292b2e',
        tableHeaderTextColor: '#292b2e'
      }
      store.dispatch('setSystemColor', colors)
    }
    // 加载覆盖样式表
    let baseLink = document.createElement('link')
    baseLink.href = './static/elementUI/chalk/base.css'
    baseLink.rel = 'stylesheet'
    baseLink.type = 'text/css'
    document.head.appendChild(baseLink)
  }
}
