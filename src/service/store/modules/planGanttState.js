import api from '@/plugins/api'

const planGanttState = {
  state: {
    buttonMsg: {},
    taskStyles: {}, // planGantt页面任务样式
    vueThis: {}, // planGantt页面this对象
    previousThis:{},
    vueThisLocation: {}, // planGantt页面this对象
    planStatusLockMap: {}, // 计划状态影响gantt页面操作策略
    taskStatusLockMap: {}, // 任务状态影响gantt页面操作策略
    classifyBtnsByApi: [],
    versionTask: {
      versionGantt1: {},
      versionGantt2: {}
    },
    monitorBtnsByApi: []
  },
  mutations: {
    SET_BUTTONMSG (state, data) {
      state.buttonMsg[data.id] = data.msg
    },
    SET_TASK_STYLES(state, taskStyles) {
      state.taskStyles = taskStyles
    },
    SET_VERSION_TASK (state, { key, value }) {
      state.versionTask[key] = value
    },
    SET_VUE_THIS(state, vueThis) {
      state.vueThis = vueThis
    },
    SET_PREVIOUS_THIS(state, vueThis) {
      state.previousThis = vueThis
    },
    SET_VUE_THIS_LOCATION(state, vueThis) {
      state.vueThisLocation = vueThis
    },
    SET_PLAN_STATUS_LOCK_MAP(state, planStatusLockMap) {
      state.planStatusLockMap = planStatusLockMap
    },
    SET_TASK_STATUS_LOCK_MAP(state, taskStatusLockMap) {
      state.taskStatusLockMap = taskStatusLockMap
    },
    SET_BUTTONS(state, datas) {
      if (datas.type === 'monitor') {
        state.monitorBtnsByApi = datas.btns
      }
      // if (datas.type === 'classify') {
      //   state.classifyBtnsByApi = datas.btns
      // }
    }
  },
  actions: {
    setButtonMsg({ commit }, data) {
      commit('SET_BUTTONMSG', data)
    },
    setTaskStyles({ commit }, taskStyles) {
      commit('SET_TASK_STYLES', taskStyles)
    },
    setVersionTask ({ commit }, data) {
      commit('SET_VERSION_TASK', data)
    },
    setVueThis({ commit }, vueThis) {
      commit('SET_VUE_THIS', vueThis)
    },
    setVueThisLocation({ commit }, vueThis) {
      commit('SET_VUE_THIS_LOCATION', vueThis)
    },
    setPlanStatusLockMap({ commit }, planStatusLockMap) {
      commit('SET_PLAN_STATUS_LOCK_MAP', planStatusLockMap)
    },
    setTaskStatusLockMap({ commit }, taskStatusLockMap) {
      commit('SET_TASK_STATUS_LOCK_MAP', taskStatusLockMap)
    },
    setButtons({ commit }, datas) {
      commit('SET_BUTTONS', datas)
    },
    getPlanStatusLimitStrategy({ commit }) {
      return new Promise((resolve, reject) => {
        api['planGanttManager.loadPlanStatusLimitStrategy']()
          .then((res) => {
            if (res) {
              commit('SET_PLAN_STATUS_LOCK_MAP', res.plan)
              commit('SET_TASK_STATUS_LOCK_MAP', res.task)
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

export default planGanttState
