import Cookie from 'vue-cookie'
import { setLocalStorage, getLocalStorage } from '@/service/expands/session'
import { Message } from 'p8-components-ui'
import GLOBAL_CONST from '@/config/const'
//
import variables from '@/styles/element-variables.scss'
//
import plateformVariables from '@/styles/variables.scss'

// 侧边栏隐藏状态
const SIDEBAR_HIDDEN_STATE_KEY = GLOBAL_CONST.sidebar.isHiddenSideBarKey

const SIDEBAR_HIDDEN_STATE = Cookie.get(SIDEBAR_HIDDEN_STATE_KEY)
// 侧边栏折叠状态
const SIDEBAR_OPEN_KEY = GLOBAL_CONST.sidebar.isCollpasedSideBarKey
const SIDEBAR_OPEN_STATE = Cookie.get(SIDEBAR_OPEN_KEY) ? Cookie.get(SIDEBAR_OPEN_KEY) : 'true'
// THEME
const SYSTEM_THEME_KEY = GLOBAL_CONST.systemTheme.systemThemeKey
// IMAGE
const SYSTEM_IMAGE_KEY = GLOBAL_CONST.systemTheme.systemImageKey
// Shortcut
const SHORTCUT_MENU_KEY = GLOBAL_CONST.shortcut.shortcutKey
// ORIGINAL THEME COLOR
const ORIGINAL_THEME = GLOBAL_CONST.systemTheme.originalColor // default color
const SYSTEM_NAME = GLOBAL_CONST.systemTheme.systemName // default color
//
let chalkTheme = null
/**
 *
 * @param {*} token
 * @param {*} shortcuts
 */
const updateStorageShortcutMenu = (token, shortcuts) => {
  if (token) {
    const shortcutMenuArr = getLocalStorage(SHORTCUT_MENU_KEY) || {}
    shortcutMenuArr.token && delete shortcutMenuArr[token]
    setLocalStorage(SHORTCUT_MENU_KEY, {
      ...shortcutMenuArr,
      [token]: shortcuts
    })
  }
}

const getRGBcolor = (color, inGamut) => {
  let red = parseInt(color.slice(0, 2), 16)
  let green = parseInt(color.slice(2, 4), 16)
  let blue = parseInt(color.slice(4, 6), 16)

  if (inGamut === 0) {
    return [red, green, blue].join(',')
  } else {
    //
    red += Math.round(inGamut * (255 - red))
    green += Math.round(inGamut * (255 - green))
    blue += Math.round(inGamut * (255 - blue))
    //
    red = red.toString(16)
    green = green.toString(16)
    blue = blue.toString(16)

    return `#${red}${green}${blue}`
  }
}

const getShadeColor = (color, shade) => {
  //
  let red = parseInt(color.slice(0, 2), 16)
  let green = parseInt(color.slice(2, 4), 16)
  let blue = parseInt(color.slice(4, 6), 16)
  //
  red = Math.round((1 - shade) * red)
  green = Math.round((1 - shade) * green)
  blue = Math.round((1 - shade) * blue)
  //
  red = red.toString(16)
  green = green.toString(16)
  blue = blue.toString(16)
  //
  return `#${red}${green}${blue}`
}

const getClusterColor = (theme) => {
  const clusterColor = [theme]
  for (let i = 0; i <= 9; i++) {
    clusterColor.push(getRGBcolor(theme, Number(i / 10).toFixed(2)))
  }
  clusterColor.push(getShadeColor(theme, 0.1))
  return clusterColor
}

const getCSSString = (url) => {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        resolve(xhr.responseText.replace(/@font-face{[^}]+}/, ''))
      }
    }
    xhr.open('GET', url)
    xhr.send()
  })
}

const platform = {
  state: {
    sidebarState: {
      isHidden: SIDEBAR_HIDDEN_STATE === 'true',
      isOpen: SIDEBAR_OPEN_STATE === 'true', // 边栏折叠状态
      width: SIDEBAR_HIDDEN_STATE === 'true' ? '0px' : SIDEBAR_OPEN_STATE === 'true' ? plateformVariables.sidebarMaxWidth : plateformVariables.sidebarMinWidth // 边栏宽度,elementUI 折叠变量为64px
    },
    // systemTheme: Cookie.get(SYSTEM_THEME_KEY) || 'chalk',
    theme: Cookie.get(SYSTEM_THEME_KEY) || variables.theme,
    shortcutMenu: [], // 自定义菜单项,由用户自定义出的菜单项
    systemName: Cookie.get(SYSTEM_NAME) || '',
    headerHeight: plateformVariables.headerHeight, // 头部(header)高度
    tagTabHeight: plateformVariables.headerTagHeight, //  标签页(tagTabs)高度
    imageUrl: Cookie.get(SYSTEM_IMAGE_KEY) || ''
    // mainScrollHeight: 0, // main部分的实时滚动高度scrollTop
    // ctrlKeyState: false // 判断是否全局按了ctrl按键
  },

  mutations: {
    // 设置侧边栏折叠
    SET_COLLAPSE_SIDEBAR(state, sidebarStatus) {
      state.sidebarState.isOpen = sidebarStatus
      state.sidebarState.width = sidebarStatus ? plateformVariables.sidebarMaxWidth : plateformVariables.sidebarMinWidth
      Cookie.set(SIDEBAR_OPEN_KEY, sidebarStatus, 64)
    },
    SET_SYSTEM_NAME(state, data) {
      state.systemName = data
      document.title = data
      Cookie.set(SYSTEM_NAME, data, 1000)
    },
    // 设置侧边栏隐藏
    SET_HIDDEN_SIDEBAR(state, isHidden) {
      state.sidebarState.isHidden = isHidden
      // 为了保证隐藏动效,这里设置sidebar隐藏后的宽度
      // 这里因为计算的原因,必须保证为 {string} 0px, 请勿修改成 {number} 0
      // state.sidebarState.width = isHidden ? '0px' : SIDEBAR_OPEN_STATE === 'true' ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH
      Cookie.set(SIDEBAR_HIDDEN_STATE_KEY, isHidden, 1000)
    },
    INIT_SHORTCUTMENU(state, menuItems) {
      state.shortcutMenu = menuItems
      const token = this.state.user.token
      updateStorageShortcutMenu(token, state.shortcutMenu)
    },
    // 添加快捷菜单
    ADD_SHORTCUTMENU(state, menuItem) {
      if (!state.shortcutMenu || state.shortcutMenu.some((menu) => menu.name === menuItem.name)) return
      if (state.shortcutMenu.length > 15) {
        return Message({
          message: '已添加满了,请移除不必要的菜单后再尝试添加.',
          type: 'warning',
          duration: 5000
        })
      }
      state.shortcutMenu.push(menuItem)
      //
      const token = this.state.user.token
      updateStorageShortcutMenu(token, state.shortcutMenu)
    },
    // 移除快捷菜单
    REMOVE_SHORTCUTMENU(state, menuItem) {
      state.shortcutMenu = state.shortcutMenu.filter((menu) => menu.name !== menuItem.name)
      const token = this.state.user.token
      updateStorageShortcutMenu(token, state.shortcutMenu)
    },
    DRAGED_SHORTCUTS(state, items) {
      state.shortcutMenu = items
      const token = this.state.user.token
      updateStorageShortcutMenu(token, state.shortcutMenu)
    },
    // 设置主题
    SET_THEME(state, theme) {
      // state.systemTheme = theme
      state.theme = theme
      Cookie.set(SYSTEM_THEME_KEY, theme, 1000)
    },
    // 设置主题背景图
    SET_IMAGE(state, imageUrl) {
      state.imageUrl = imageUrl
      Cookie.set(SYSTEM_IMAGE_KEY, imageUrl, 1000)
    }
  },

  actions: {
    collapseSidebar({ commit }, sidebarStatus) {
      commit('SET_COLLAPSE_SIDEBAR', sidebarStatus)
    },
    setSystemName({ commit }, systemName) {
      commit('SET_SYSTEM_NAME', systemName)
    },
    hideSidebar({ commit }, isHidden) {
      commit('SET_HIDDEN_SIDEBAR', isHidden)
    },
    initShortcutMenu({ commit }, menuItems) {
      commit('INIT_SHORTCUTMENU', menuItems)
    },
    addShortcutMenu({ commit }, menuItem) {
      commit('ADD_SHORTCUTMENU', menuItem)
    },
    addShortcutMenuFromTab({ commit }, tabView) {
      commit('ADD_SHORTCUT_FROM_TAB', tabView)
    },
    removeShortcutMenu({ commit }, menuItem) {
      commit('REMOVE_SHORTCUTMENU', menuItem)
    },
    dragedShortcuts({ commit }, items) {
      commit('DRAGED_SHORTCUTS', items)
    },
    async setTheme({ commit, state }, { theme, handler = false }) {
      //  防止多次提交相同颜色
      if (!theme || (theme === state.theme && handler)) return
      //
      const themeCluster = getClusterColor(theme.replace('#', ''))

      const updateThemeStyleText = (styleText, originalCluster, themeCluster) => {
        let newStyleText = styleText
        originalCluster.forEach((color, index) => {
          newStyleText = newStyleText.replace(new RegExp(color, 'ig'), themeCluster[index])
        })
        return newStyleText
      }

      const getThemeHandler = (id) => {
        return () => {
          const originalThemeCluster = getClusterColor(ORIGINAL_THEME.replace('#', ''))
          const newStyle = updateThemeStyleText(chalkTheme, originalThemeCluster, themeCluster)

          let existStyle = document.getElementById(id)
          if (!existStyle) {
            existStyle = document.createElement('style')
            existStyle.setAttribute('id', id)
            document.head.appendChild(existStyle)
          }
          existStyle.innerText = newStyle
        }
      }

      if (!chalkTheme) {
        chalkTheme = await getCSSString('/static/elementUI/chalk/index.css')
      }

      getThemeHandler('chalk-custom-style')()
      commit('SET_THEME', theme)
    },
    maxWindow({ commit }, isMaxWindow) {
      commit('SET_WINDOW_MAXIMIZE', isMaxWindow)
    },
    setImage({ commit }, imageUrl) {
      commit('SET_IMAGE', imageUrl)
    }
    // setMainScrollHeight ({ commit }, scrollTop) {
    //   commit('SET_MAIN_SCROLL_TOP', scrollTop)
    // },
    // setCtrlKeyState ({ commit }, isPushed) {
    //   commit('SET_CTRL_KEY_STATE', isPushed)
    // }
  }
}

export default platform
