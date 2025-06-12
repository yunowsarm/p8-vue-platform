import api from '@/plugins/api'
import store from '@/plugins/store'
/**
 * User STORE
 */

const project = {
  state: {
    buttonLimit: [], // table行上按钮权限，置灰/隐藏/悬浮提示
    dicConfig: {}, // 系统项目状态、计划状态、任务状态集合
    baseConfig: {}, // 系统基础配置项，例如系统名称\logo等
    // systemSecretConfig: [] // 系统密级
  },

  mutations: {
    SET_BUTTONLIMIT(state, data) {
      state.buttonLimit = data
    },
    SET_DICCONFIG(state, data) {
      state.dicConfig = data
    },
    SET_BASECONFIG(state, data) {
      state.baseConfig = data
    },
    // SET_SECRET(state, data) {
    //   state.systemSecretConfig = data
    // }
  },

  actions: {
    /**
     * 获取用户信息
     * 返回当前用户的基础信息
     *
     * @param {any} {commit}
     * @param {any} params
     * @returns
     */
    getButtonLimit({ commit, state }, params) {
      return new Promise((resolve, reject) => {
        api['button.tableButtonLimit']()
          .then((res) => {
            if (res) {
              commit('SET_BUTTONLIMIT', res)
              resolve(res)
            }
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    /**
     * 获取用户信息
     * 返回当前用户的基础信息
     *
     * @param {any} {commit}
     * @param {any} params
     * @returns
     */
    // getSystemSecret({ commit, state }, params) {
    //   return new Promise((resolve, reject) => {
    //     api['thirdPartInterface.getDic']({ dicType: 'SECRET_LEVEL' })
    //       .then((res) => {
    //         if (res) {
    //           commit('SET_SECRET', res)
    //           resolve(res)
    //         }
    //       })
    //       .catch((err) => {
    //         reject(err)
    //       })
    //   })
    // },
    /**
     * 获取系统配置信息
     * 返回当前用户的系统配置信息
     *
     * @param {any} {commit}
     * @param {any} params
     * @returns
     */
    getDicAndBaseConfig({ commit, state }, params) {
      return new Promise((resolve, reject) => {
        api['SystemSettings.getVuePlatfromInitConfig']()
          .then((res) => {
            let reBuildDicStatus = {} // dicConfig
            let reBuildBaseConfig = {} // baseConfig
            if (Object.keys(res).length) {
              let dicStatusIconColorObj = {}
              let statusArr = []
              if (res.dicConfig.length) {
                res.dicConfig.map((item) => {
                  statusArr.push(item.key.split('-')[0])
                })
                statusArr = [...new Set(statusArr)]

                statusArr.forEach((i) => {
                  dicStatusIconColorObj[i] = {}
                  res.dicConfig.forEach((item) => {
                    if (i === item.key.split('-')[0]) {
                      dicStatusIconColorObj[i][item.key.split('-')[1]] = item.status.map((statusItem) => {
                        return {
                          id: statusItem.id,
                          [item.key.split('-')[1]]: statusItem.value,
                          title: statusItem.title
                        }
                      })
                    }
                  })
                })
                Object.keys(dicStatusIconColorObj).forEach((item) => {
                  let idObj = {}
                  Object.keys(dicStatusIconColorObj[item]).forEach((configItem) => {
                    dicStatusIconColorObj[item][configItem].forEach((i) => {
                      idObj[i.id] = { ...i, ...idObj[i.id] }
                    })
                  })
                  reBuildDicStatus[item] = Object.assign({}, idObj)
                })
              }
              if (res.baseConfig.length) {
                res.baseConfig.map((item) => {
                  reBuildBaseConfig[item.key] = item.value
                })
              }
              if (store.state.user.userSettingAll.theme ?.length) {
                let themeObj = store.state.user.userSettingAll.theme[0].value
                store.dispatch('setImage', themeObj.imageUrl)
                let theme = themeObj.theme
                store.dispatch('setTheme', { theme, handler: true })
                store.dispatch('setSystemColor', themeObj)
              } else {
                if (reBuildBaseConfig.systemThemeType && reBuildBaseConfig.systemThemeArray) {
                let systemThemeArray = JSON.parse(reBuildBaseConfig.systemThemeArray)
                let themeArray = []
                if (reBuildBaseConfig.systemThemeType === 'systemThemeType1') {
                  themeArray = systemThemeArray[0]
                }
                if (reBuildBaseConfig.systemThemeType === 'systemThemeType2') {
                  themeArray = systemThemeArray[1]
                }
                if (reBuildBaseConfig.systemThemeType === 'systemThemeType3') {
                  themeArray = systemThemeArray[2]
                }
                themeArray.forEach(item => {

                  switch (item.key) {
                    case 'imageUrl':
                      store.dispatch('setImage', item.url)
                      break;
                    case 'bgTheme':
                      let theme = item.value
                      store.dispatch('setTheme', { theme, handler: true })
                      break;
                    default:
                      store.dispatch('setSystemColor', { [item.key]: item.value })
                      break;
                  }
                })
              }
              }
              commit('SET_DICCONFIG', reBuildDicStatus)
              commit('SET_BASECONFIG', reBuildBaseConfig)
              resolve(res)
            }
          })
          .catch((err) => {
            reject(err)
          })
      })
    }
  }
}

export default project
