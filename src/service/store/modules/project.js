import api from '@/plugins/api'
/**
 * User STORE
 */

const project = {
  state: {
    buttonLimit: [], // table行上按钮权限，置灰/隐藏/悬浮提示
    dicConfig: {}, // 系统项目状态、计划状态、任务状态集合
    baseConfig: {}, // 系统基础配置项，例如系统名称\logo等
    systemSecretConfig: [] // 系统密级
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
    SET_SECRET(state, data) {
      state.systemSecretConfig = data
    }
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
    getSystemSecret({ commit, state }, params) {
      return new Promise((resolve, reject) => {
        api['thirdPartInterface.getDic']({ dicType: 'SECRET_LEVEL' })
          .then((res) => {
            if (res) {
              commit('SET_SECRET', res)
              resolve(res)
            }
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
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

                statusArr.map((i) => {
                  dicStatusIconColorObj[i] = {}
                  res.dicConfig.map((item) => {
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
                Object.keys(dicStatusIconColorObj).map((item) => {
                  let idObj = {}
                  Object.keys(dicStatusIconColorObj[item]).map((configItem) => {
                    dicStatusIconColorObj[item][configItem].map((i) => {
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
