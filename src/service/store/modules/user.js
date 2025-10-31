import { Notification } from 'p8-components-ui'
import { getToken, setToken, removeToken } from '@/service/expands/auth'
import api from '@/plugins/api'
import moment from 'moment'
/**
 * User STORE
 */

const user = {
  state: {
    userId: '',
    userAccount: '',
    userName: '',
    userStatus: '',
    loginStatus: false,
    // avatar: '../static/myAvatar200.png', // static
    token: getToken(),
    roles: null, // 权限应该是返回个数组对象
    // confidentialiteList: [], // 用户密级,
    userSettingAll: {}, // 用户配置信息
    doneSign: '', // 任务完成标志
    displayType: '', // gantt超期/剩余天数展示类型
    ganttButtonMode: '', // gantt操作按钮采用单行还是双行模式
    ganttRightButtons: [], // gantt右键菜单
    ganttIsGroup: [], // gantt右键菜单
    autoScheduling: '',
    taskFinish: '',
    carryOutBudgetControl: '', // 任务执行时是否预算控制 是：'1';  否：'0'
    demandOptions: '',
    userInfo: {}, // 用于JT智能表单的系统级参数
    sysVars: {
      // 用于智能表单的系统级参数
      props: {}, // 参数变量，以$开头，例如：$SYSTEM_PARAMS_SELECT.username
      methodsDic: [
        {
          name: '#getFormFillingTime',
          desc: '返回当前日期YYYY-MM-DD'
        }
      ],
      methods: {
        // 方法变量，以#开头，例如：#getFormFillingTime
        getFormFillingTime: function () {
          // 表单填报时间
          return moment(new Date()).format('YYYY-MM-DD')
        }
      }
    },
    messageInfo: [], // 用户消息信息
    messageNum: 0, // 用户消息已读未读条数
    messageCount: 0, // 沟通消息未读条数
    taskMessageCount: 0,
    approvalTotalMsg: 0 // 审批消息未读条数
  },

  mutations: {
    SET_TOKEN(state, token) {
      if (token) {
        state.token = token
        setToken(token)
      }
    },
    REMOVE_TOKEN(state, data) {
      state.token = null
      removeToken()
    },
    SET_USERINFO(state, data) {
      state.userInfo = data
      state.userId = data.id
      state.userAccount = data.userName
      state.userName = data.realName
      // state.userStatus = data.userStatus
      state.roles = data.userRoles // static roles
      // state.avatar = data.avatar
      // state.confidentialiteList =
      //   data.confidentialiteList && data.confidentialiteList.length
      //     ? data.confidentialiteList.map(({ name, id }) => {
      //         return {
      //           label: name,
      //           value: id
      //         }
      //       })
      //     : []
    },
    RESET_USERINFO(state, data) {
      // state.userId = ''
      state.userInfo = {}
      state.userAccount = ''
      state.userName = ''
      state.userStatus = ''
      // state.avatar = ''
      state.roles = null
      // state.confidentialiteList = []
    },
    SET_LOGIN_STATUS(state, data) {
      state.loginStatus = data
    },
    SET_GANTT_BUTTON(state, data) {
      state.ganttButtonMode = data
    },
    SET_SETTING_ALL(state, data) {
      state.userSettingAll = data
      if (data.PlanButton && data.PlanButton.length) {
        state.ganttButtonMode = data.PlanButton[0].value.type || ''
        state.ganttRightButtons = data.PlanButton[0].value.rightBtns || []
        state.ganttIsGroup = data.PlanButton[0].value.isGroup || '1'
        state.autoScheduling = data.PlanButton[0].value.autoScheduling
      }
      api['PlanGanttSetting.getSchedulingBasicConfig']({}).then((res) => {
        if (res) {
          state.doneSign = res.doneSign ? res.doneSign.content : ''
          state.displayType = res.displayType ? res.displayType.content : ''
          state.carryOutBudgetControl = res?.carryOutBudgetControl?.content ?? '0'
          state.demandOptions = res?.demandOptions?.content ?? '0'
          state.taskFinish = res?.taskFinish?.content ?? '自动'

          if (!state.ganttButtonMode) {
            state.ganttButtonMode = res.defaultMode.content
          }
          if (!state.autoScheduling) {
            state.autoScheduling = res.autoScheduling.content
          }
          if (state.ganttRightButtons && state.ganttRightButtons.length == 0) {
            if (res.planRightButton.content) {
              state.ganttRightButtons = JSON.parse(res.planRightButton.content) ? JSON.parse(res.planRightButton.content) : []
            }
          }
        }
      })
    },
    SET_MESSAGEINFO(state, data) {
      state.messageInfo = data
    },
    SET_MESSAGENUM(state, data) {
      state.messageNum = data
    },
    SET_MESSAGECOUNT(state, data) {
      state.messageCount = data
    },
    SET_APPROVAL_MESSAGECOUNT(state, data) {
      state.approvalTotalMsg = data
    },
    SET_TASK_MESSAGECOUNT(state, data) {
      state.taskMessageCount = data
    }
  },

  actions: {
    setMessageNum({ commit }, data) {
      commit('SET_MESSAGENUM', data)
    },
    setApprovalMessageCount({ commit }, data) {
      commit('SET_APPROVAL_MESSAGECOUNT', data)
    },
    setMessageCount({ commit }, data) {
      commit('SET_MESSAGECOUNT', data)
    },
    setTasketMessageCount({ commit }, data) {
      commit('SET_TASK_MESSAGECOUNT', data)
    },
    /**
     * 用户登录
     * 需要通过mutation在浏览器中创建Token cookie保证一定的登录实效性;
     *
     * @param {any} {commit}
     * @param {any} params
     * @returns
     */
    userLogin({ commit, state }, params) {
      return new Promise((resolve, reject) => {
        api['user.login'](params)
          .then((res) => {
            if (res.type === 'passwordError') {
              Notification.error({
                title: '提示',
                message: res.message,
                type: 'error',
                offset: 40
              })
              reject()
            } else if (res.type === 'updatePassword') {
              resolve(res)
            } else if (res.type === 'maintenance') {
              resolve(res)
            } else {
              commit('SET_TOKEN', res.token)
              resolve(res)
            }
          })
          .catch((err) => {
            if (err.toString().indexOf('Network Error') !== -1) {
              Notification.error({
                title: '提示',
                message: '接口异常',
                type: 'error',
                offset: 40
              })
            }
            reject(err)
          })
      })
    },
    /**
     * 用户注销
     * 需要通过mutations移除浏览器的Token cookie,并做一些相关注销处理
     *
     * @param {any} {commit}
     * @returns
     */
    userLogout({ commit }) {
      return new Promise((resolve, reject) => {
        api['user.logout']()
          .then(() => {
            // 重置用户相关信息
            commit('REMOVE_TOKEN')
            // 重置用户信息
            commit('RESET_USERINFO')
            // 重置浏览记录以及tab页面记录等,该mutation访问 store/views.js
            commit('REMOVE_ALL_VISITED')
            // 重置权限路由表, 该mutation 访问 store/asyncRouter.js
            commit('RESET_ROUTERS')
            //
            resolve()
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
    getUserInfo({ commit, state }, params) {
      return new Promise((resolve, reject) => {
        api['user.info']()
          .then((res) => {
            if (res) {
              commit('SET_USERINFO', res)
              resolve(res)
            }
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    /**
     * 获取用户登录状态（记住登录状态orNo）
     * 返回当前用户的登录状态
     *
     * @param {any} {commit}
     * @param {any} params
     * @returns
     */
    setLoginState({ commit }, data) {
      commit('SET_LOGIN_STATUS', data)
    },
    /**
     * 获取用户设置信息
     * 返回用户的设置信息
     *
     * @param {any} {commit}
     * @returns
     */
    getSettingAll({ commit }) {
      return new Promise((resolve, reject) => {
        api['user.setting.getAll']()
          .then((res) => {
            if (res) {
              commit('SET_SETTING_ALL', res)
              resolve(res)
            }
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    /**
     * 获取消息信息
     * 返回当前用户的消息信息
     *
     * @param {any} {commit}
     * @param {any} params
     * @returns
     */
    getMessageInfo({ commit, state }, params) {
      return new Promise((resolve, reject) => {
        api['userMessage.catalog']()
          .then((res) => {
            if (res) {
              commit('SET_MESSAGEINFO', res)
              resolve(res)
            }
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    /**
     * 获取消息信息已读未读条数
     * 返回当前用户的消息信息已读未读条数
     *
     * @param {any} {commit}
     * @param {any} params
     * @returns
     */
    getMessageNum({ commit, state }, params) {
      return new Promise((resolve, reject) => {
        api['userMessage.userCatalogCount']({ msgCatalog: '' })
          .then((res) => {
            if (res) {
              res.map((item) => {
                if (item.id === '18') {
                  commit('SET_MESSAGENUM', item.noread)
                }
              })
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

export default user
