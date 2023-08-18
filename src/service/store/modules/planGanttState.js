const planGanttState = {
  state: {
    taskStyles: {}, // planGantt页面任务样式
    vueThis: {}, // planGantt页面this对象
    planStatusLockMap: {}, // 计划状态影响gantt页面操作策略
    taskStatusLockMap: {}, // 任务状态影响gantt页面操作策略
    classifyBtnsByApi: [],
    monitorBtnsByApi: []
  },
  mutations: {
    SET_TASK_STYLES(state, taskStyles) {
      state.taskStyles = taskStyles
    },
    SET_VUE_THIS(state, vueThis) {
      state.vueThis = vueThis
    },
    SET_PLAN_STATUS_LOCK_MAP(state, planStatusLockMap) {
      state.planStatusLockMap = planStatusLockMap
    },
    SET_TASK_STATUS_LOCK_MAP(state, taskStatusLockMap) {
      state.taskStatusLockMap = taskStatusLockMap
    },
    SET_BUTTONS(state, datas) {
      // if (datas.type === 'monitor') {
      //   state.monitorBtnsByApi = datas.btns
      // }
      // if (datas.type === 'classify') {
      //   state.classifyBtnsByApi = datas.btns
      // }
    }
  },
  actions: {
    setTaskStyles({ commit }, taskStyles) {
      commit('SET_TASK_STYLES', taskStyles)
    },
    setVueThis({ commit }, vueThis) {
      commit('SET_VUE_THIS', vueThis)
    },
    setPlanStatusLockMap({ commit }, planStatusLockMap) {
      commit('SET_PLAN_STATUS_LOCK_MAP', planStatusLockMap)
    },
    setTaskStatusLockMap({ commit }, taskStatusLockMap) {
      commit('SET_TASK_STATUS_LOCK_MAP', taskStatusLockMap)
    },
    setButtons({ commit }, datas) {
      commit('SET_BUTTONS', datas)
    }
  }
}

export default planGanttState
