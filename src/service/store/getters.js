const getters = {
  // 平台
  systemTheme: (state) => state.platform.systemTheme,
  theme: (state) => state.platform.theme,
  imageUrl: (state) => state.platform.imageUrl,
  shortcutMenu: (state) => state.platform.shortcutMenu,
  systemName: (state) => state.platform.systemName,
  sidebarState: (state) => state.platform.sidebarState,
  headerHeight: (state) => state.platform.headerHeight,
  tagTabHeight: (state) => state.platform.tagTabHeight,
  formTitlePosition: (state) => state.platform.formTitlePosition,
  // 用户
  userInfo: (state) => state.user.userInfo,
  userAccount: (state) => state.user.userAccount,
  userName: (state) => state.user.userName,
  loginStatus: (state) => state.user.loginStatus,
  userId: (state) => state.user.userId,
  avatar: (state) => state.user.avatar,
  token: (state) => state.user.token,
  roles: (state) => state.user.roles,
  messageInfo: (state) => state.user.messageInfo,
  messageNum: (state) => state.user.messageNum,
  messageCount: (state) => state.user.messageCount,
  approvalTotalMsg: (state) => state.user.approvalTotalMsg,
  userSettingAll: (state) => state.user.userSettingAll,
  ganttButtonMode: (state) => state.user.ganttButtonMode, // gantt操作按钮单行双行模式配置
  ganttRightButtons: (state) => state.user.ganttRightButtons, // gantt右键菜单配置
  // 路由
  addRouters: (state) => state.routers.addRouters,
  asyncRouter: (state) => state.routers.router,
  homepage: (state) => state.routers.homepage,
  staticRoutesMap: (state) => state.routers.staticRoutesMap,
  // 页面
  cachedViews: (state) => state.views.cachedViews,
  visitedViews: (state) => state.views.visitedViews,
  // planGantt页面任务样式
  taskStyles: (state) => state.planGanttState.taskStyles,
  vueThis: (state) => state.planGanttState.vueThis,
  classifyBtnsByApi: (state) => state.planGanttState.classifyBtnsByApi,
  monitorBtnsByApi: (state) => state.planGanttState.monitorBtnsByApi,
  // 计划状态、任务状态限制gantt页面操作策略
  planStatusLockMap: (state) => state.planGanttState.planStatusLockMap,
  taskStatusLockMap: (state) => state.planGanttState.taskStatusLockMap,
  versionTask: (state) => state.planGanttState.versionTask,
  // table行上权限按钮
  buttonLimit: (state) => state.project.buttonLimit,
  // 配置项信息：项目状态/计划状态/任务状态
  dicConfig: (state) => state.project.dicConfig,
  // 基础配置项: 例如系统名称\logo等
  baseConfig: (state) => state.project.baseConfig,
  // 基础项: 系统密级
  systemSecretConfig: (state) => state.project.systemSecretConfig
}

export default getters
