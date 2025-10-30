const getters = {
  // 平台
  isMobile: (state) => state.platform.isMobile,
  systemTheme: (state) => state.platform.systemTheme,
  theme: (state) => state.platform.theme,
  systemColor: (state) => state.platform.systemColor,
  imageUrl: (state) => state.platform.imageUrl,
  imageId: (state) => state.platform.imageId,
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
  taskMessageCount: (state) => state.user.taskMessageCount,
  messageCount: (state) => state.user.messageCount,
  approvalTotalMsg: (state) => state.user.approvalTotalMsg,
  userSettingAll: (state) => state.user.userSettingAll,
  doneSign: (state) => state.user.doneSign, // 任务完成标志
  displayType: (state) => state.user.displayType, // 超期/剩余天数展示类型
  ganttButtonMode: (state) => state.user.ganttButtonMode, // gantt操作按钮单行双行模式配置
  ganttRightButtons: (state) => state.user.ganttRightButtons, // gantt右键菜单配置
  ganttIsGroup: (state) => state.user.ganttIsGroup, // gantt右键菜单配置
  autoScheduling: (state) => state.user.autoScheduling, // 排程类型
  carryOutBudgetControl: (state) => state.user.carryOutBudgetControl, // 任务执行时是否预算控制
  demandOptions: (state) => state.user.demandOptions, // 任务执行时是否预算控制
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
  ganttDatas: (state) => state.planGanttState.ganttDatas,
  previousThis: (state) => state.planGanttState.previousThis,
  vueThisLocation: (state) => state.planGanttState.vueThisLocation,
  classifyBtnsByApi: (state) => state.planGanttState.classifyBtnsByApi,
  monitorBtnsByApi: (state) => state.planGanttState.monitorBtnsByApi,
  buttonMsg: (state) => state.planGanttState.buttonMsg,
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
