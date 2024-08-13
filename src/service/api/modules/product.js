/**
 * USER API
 * Namespace: User
 */

export const repositoryApi = {
  baseData: [
    {
      name: 'modifyApproveUser',
      method: 'POST',
      path: '/bpm/personal/ProcessApproval/modifyApproveUser',
      mockPath: '/bpm/personal/ProcessApproval/modifyApproveUser',
      desc: '知识库管理->基础数据管理->获取分类树'
    },
    {
      name: 'allPendingList',
      method: 'POST',
      path: '/bpm/personal/ProcessApproval/allPendingList',
      mockPath: '/bpm/personal/ProcessApproval/allPendingList',
      desc: '知识库管理->基础数据管理->获取分类树'
    },
    {
      name: 'stopApprove',
      method: 'POST',
      path: '/bpm/personal/ProcessApproval/stopApprove',
      mockPath: '/bpm/personal/ProcessApproval/stopApprove',
      desc: '知识库管理->基础数据管理->获取分类树'
    },
    {
      name: 'commitApprove',
      method: 'POST',
      path: '/bpm/personal/ProcessApproval/commitApprove',
      mockPath: '/bpm/personal/ProcessApproval/commitApprove',
      desc: '发起流程'
    },
    {
      name: 'withdraw',
      method: 'POST',
      path: '/bpm/personal/ProcessApproval/withdraw',
      mockPath: '/bpm/personal/ProcessApproval/withdraw',
      desc: '发起流程'
    }
  ],
  ProjectApply: [
    {
      name: 'projectClassifyTree',
      method: 'POST',
      path: '/product/repository/kprojectClassify/projectClassifyTree',
      mockPath: '/product/repository/kprojectClassify/projectClassifyTree',
      desc: '项目类型树'
    },
    {
      name: 'userList',
      method: 'POST',
      path: '/framework/system/User/userList',
      mockPath: '/framework/system/User/userList',
      desc: '查询人员'
    },

    {
      name: 'userTree',
      method: 'POST',
      path: '/framework/common/UserSelect/getUserByDeptId',
      mockPath: '/framework/common/UserSelect/getUserByDeptId',
      desc: '根据角色获取指定人员'
    },
    {
      name: 'deptTree',
      method: 'POST',
      path: '/framework/system/Department/deptTree',
      mockPath: '/framework/system/Department/deptTree',
      params: { id: '1' },
      desc: '部门树'
    },
    {
      name: 'checkNo',
      method: 'POST',
      path: '/framework/system/Department/checkNo',
      mockPath: '/framework/system/Department/checkNo',
      params: {},
      desc: '部门编号重复检查'
    },
    {
      name: 'deptTreeByCurrent',
      method: 'POST',
      path: '/framework/system/Department/deptTreeByCurrent',
      mockPath: '/framework/system/Department/deptTreeByCurrent',
      params: { id: '1' },
      desc: '厂所团队管理部门数'
    },
    {
      name: 'getProcessDefinitionByBusinessId',
      method: 'GET',
      path: '/bpm/manage/ProcessDefinition/getProcessDefinitionByBusinessId',
      mockPath: '/bpm/manage/ProcessDefinition/getProcessDefinitionByBusinessId',
      desc: '根据业务Id获取流程定义xml'
    }
  ],
  commonP8Task: [
    {
      name: 'loadMonitorData',
      method: 'POST',
      path: '/product/my/work/task/loadMonitorData',
      mockPath: '/product/my/work/task/loadMonitorData',
      desc: '我的任务->获取计划标识明细数据'
    }
  ],
  taskManager: [
    {
      name: 'updateTaskDistribution',
      method: 'POST',
      path: '/product/pm/plan/updateTaskDistribution',
      mockPath: '/product/pm/plan/updateTaskDistribution',
      desc: '部门任务派发-任务派发'
    },
    {
      name: 'projectTree',
      method: 'POST',
      path: '/product/my/work/task/projectClassifyTree',
      mockPath: '/product/my/work/task/projectClassifyTree',
      desc: '我的任务-项目类型树'
    },
    {
      name: 'preAndPostTaskViewing',
      method: 'POST',
      path: '/product/my/work/task/preAndPostTaskViewing',
      mockPath: '/product/my/work/task/preAndPostTaskViewing',
      desc: '我的任务-前后置任务查看'
    },
    {
      name: 'rejectInfo',
      method: 'GET',
      path: '/product/taskplanCommonResources/getRejectInfosByBusinessId',
      mockPath: '/product/taskplanCommonResources/getRejectInfosByBusinessId',
      desc: '我的任务->列表->获取驳回信息'
    },
    {
      name: 'loadCheckTaskData',
      method: 'POST',
      path: '/product/pm/plan/loadCheckTaskData',
      mockPath: '/product/pm/plan/loadCheckTaskData',
      desc: '我的任务->列表->获取gantt列表'
    },
    {
      name: 'normalTaskList',
      method: 'POST',
      path: '/product/my/work/task/normalTaskList',
      mockPath: '/product/my/work/task/normalTaskList',
      desc: '我的任务->列表->获取正常任务'
    },
    {
      name: 'overallTaskList',
      method: 'POST',
      path: '/product/my/work/task/overallTaskList',
      mockPath: '/product/my/work/task/overallTaskList',
      desc: '我的任务->列表->获取统筹任务'
    },
    {
      name: 'getAllNum',
      method: 'POST',
      path: '/product/my/work/task/getAllNum',
      mockPath: '/product/my/work/task/getAllNum',
      desc: '我的任务->列表->任务数量'
    },
    {
      name: 'withdrawTaskApprove',
      method: 'POST',
      path: '/product/my/work/task/withdraw',
      mockPath: '/product/my/work/task/withdraw',
      desc: '我的任务->列表->审批撤回'
    },
    {
      name: 'isChildrenFinished',
      method: 'GET',
      path: '/product/my/work/task/isChildrenFinished',
      mockPath: '/product/my/work/task/isChildrenFinished',
      desc: '我的任务->列表->子任务是否都完成'
    },
    {
      name: 'isHaveParentTaskUser',
      method: 'GET',
      path: '/product/my/work/task/isHaveParentTaskUser',
      mockPath: '/product/my/work/task/isHaveParentTaskUser',
      desc: '我的任务->列表->父任务是否有责任人'
    },
    {
      name: 'isHaveParentTaskParentId',
      method: 'GET',
      path: '/product/my/work/task/isHaveParentTaskParentId',
      mockPath: '/product/my/work/task/isHaveParentTaskParentId',
      desc: '我的任务->列表->父任务是否有父id(如果有则该任务非二级任务)'
    },
    {
      name: 'progressFeedback',
      method: 'POST',
      path: '/product/my/work/task/progressFeedback',
      mockPath: '/product/my/work/task/progressFeedback',
      desc: '我的任务->列表->计划执行->进度反馈-提交'
    },
    {
      name: 'progressFeedbackCheck',
      method: 'POST',
      path: '/product/my/work/task/progressFeedbackCheck',
      mockPath: '/product/my/work/task/progressFeedbackCheck',
      desc: '我的任务->列表->计划执行->进度反馈-提交'
    },
    {
      name: 'progressFeedbackHistory',
      method: 'GET',
      path: '/product/my/work/task/progressFeedbackHistory',
      mockPath: '/product/my/work/task/progressFeedbackHistory',
      desc: '我的任务->列表->计划执行->进度反馈-获取历史反馈'
    },
    {
      name: 'deviationReasons',
      method: 'POST',
      path: '/product/my/work/task/deviationReasons',
      mockPath: '/product/my/work/task/deviationReasons',
      desc: '我的任务->列表->计划执行->偏离原因-提交'
    },
    {
      name: 'deviationReasonsHistory',
      method: 'GET',
      path: '/product/my/work/task/deviationReasonsHistory',
      mockPath: '/product/my/work/task/deviationReasonsHistory',
      desc: '我的任务->列表->计划执行->偏离原因-获取历史反馈'
    },
    {
      name: 'changeRequest',
      method: 'POST',
      path: '/product/my/work/task/changeRequest',
      mockPath: '/product/my/work/task/changeRequest',
      desc: '我的任务->列表->计划执行->变更申请-提交'
    },
    {
      name: 'changeRequestHistory',
      method: 'GET',
      path: '/product/my/work/task/changeRequestHistory',
      mockPath: '/product/my/work/task/changeRequestHistory',
      desc: '我的任务->列表->计划执行->变更申请-获取历史反馈'
    },
    {
      name: 'getStatusByCurrent',
      method: 'GET',
      path: '/product/my/work/task/getStatusByCurrent',
      mockPath: '/product/my/work/task/getStatusByCurrent',
      desc: '我的任务->列表->计划执行->获取任务的下一个状态'
    },
    {
      name: 'taskInfo',
      method: 'GET',
      path: '/product/my/work/task/getTaskById',
      mockPath: '/product/my/work/task/getTaskById',
      desc: '我的任务->列表->计划执行->获取任务信息'
    },
    {
      name: 'getTaskByIdByCapitalization',
      method: 'GET',
      path: '/product/my/work/task/getTaskByIdByCapitalization',
      mockPath: '/product/my/work/task/getTaskByIdByCapitalization',
      desc: '我的任务->列表->计划执行->获取任务信息'
    },
    {
      name: 'getOutputRequire',
      method: 'GET',
      path: '/product/my/work/task/getOutputRequire',
      mockPath: '/product/my/work/task/getOutputRequire',
      desc: '我的任务->列表->计划执行->管理要素->获取输出要求'
    },
    {
      name: 'getOutputIo',
      method: 'GET',
      path: '/product/my/work/task/getOutputIo',
      mockPath: '/product/my/work/task/getOutputIo',
      desc: '我的任务->列表->计划执行->管理要素->获取输出物'
    },
    {
      name: 'saveOutputIo',
      method: 'POST',
      path: '/product/my/work/task/saveOutputIo',
      mockPath: '/product/my/work/task/saveOutputIo',
      desc: '我的任务->列表->计划执行->管理要素->保存输出物'
    },
    {
      name: 'getActivityDescription',
      method: 'GET',
      path: '/product/my/work/task/getActivityDescription',
      mockPath: '/product/my/work/task/getActivityDescription',
      desc: '我的任务->列表->计划执行->管理要素->获取活动描述'
    },
    {
      name: 'saveActivityDescription',
      method: 'POST',
      path: '/product/my/work/task/saveActivityDescription',
      mockPath: '/product/my/work/task/saveActivityDescription',
      desc: '我的任务->列表->计划执行->管理要素->保存活动描述-描述'
    },
    {
      name: 'getSpecialVersion',
      method: 'GET',
      path: '/product/my/work/task/getSpecialVersion',
      mockPath: '/product/my/work/task/getSpecialVersion',
      desc: '我的任务->列表->计划执行->管理要素->获取特别说明'
    },
    {
      name: 'getInputRequire',
      method: 'GET',
      path: '/product/my/work/task/getInputRequire',
      mockPath: '/product/my/work/task/getInputRequire',
      desc: '我的任务->列表->计划执行->关联任务->获取输入要求'
    },
    {
      name: 'getInputIo',
      method: 'GET',
      path: '/product/my/work/task/getInputIo',
      mockPath: '/product/my/work/task/getInputIo',
      desc: '我的任务->列表->计划执行->关联任务->获取关联任务数据(wbs和前后置)'
    },
    {
      name: 'getGojsData',
      method: 'GET',
      path: '/product/my/work/task/getGojsData',
      mockPath: '/product/my/work/task/getGojsData',
      desc: '我的任务->列表->计划执行->管理要素->获取输入物'
    },
    {
      name: 'taskTabSize',
      method: 'POST',
      path: '/product/my/work/task/getTaskTabSize',
      mockPath: '/product/my/work/task/getTaskTabSize',
      desc: '我的任务->选项页->正常、统筹数量'
    },
    {
      name: 'taskTotal',
      method: 'POST',
      path: '/product/my/work/task/taskTotal',
      mockPath: '/product/my/work/task/taskTotal',
      desc: '我的任务->选项页->正常、统筹数量'
    },
    {
      name: 'responsibilityRelease',
      method: 'POST',
      path: '/product/my/work/task/responsibilityRelease',
      mockPath: '/product/my/work/task/responsibilityRelease',
      desc: '我的任务->列表->获取责任令发布任务'
    },
    {
      name: 'taskDecomposition',
      method: 'POST',
      path: '/product/my/work/task/taskDecomposition',
      mockPath: '/product/my/work/task/taskDecomposition',
      desc: '我的任务->列表->获取任务分解详情'
    },
    {
      name: 'getTaskDependence',
      method: 'POST',
      path: '/product/my/work/task/getTaskDependence',
      mockPath: '/product/my/work/task/getTaskDependence',
      desc: '我的任务->列表->获取前后置任务'
    },
    {
      name: 'getTaskHierarchy',
      method: 'POST',
      path: '/product/my/work/task/getTaskHierarchy',
      mockPath: '/product/my/work/task/getTaskHierarchy',
      desc: '我的任务->列表->获取层级'
    },
    {
      name: 'preAndPostTaskAnnex',
      method: 'POST',
      path: '/product/my/work/task/preAndPostTaskAnnex',
      mockPath: '/product/my/work/task/preAndPostTaskAnnex',
      desc: '我的任务->前后置->获取附件'
    }
  ],
  ProjectInitiationManagement: [
    {
      name: 'commitApprove',
      method: 'POST',
      path: '/product/projectPlanning/commitApprove',
      mockPath: '/product/projectPlanning/commitApprove',
      desc: '立项管理->项目策划-表单调用-策划变更审批'
    },
    {
      name: 'permissionSettingSave',
      method: 'POST',
      path: '/framework/project/permissionSettingSave',
      mockPath: '/framework/project/permissionSettingSave',
      desc: '立项管理->项目立项->权限设置保存'
    },
    {
      name: 'updateStatusRestart',
      method: 'POST',
      path: '/framework/project/updateStatusRestart',
      mockPath: '/framework/project/updateStatusRestart',
      desc: '立项管理->项目立项->重启'
    },
    {
      name: 'updateStatusComplete',
      method: 'POST',
      path: '/framework/project/updateStatusComplete',
      mockPath: '/framework/project/updateStatusComplete',
      desc: '立项管理->项目立项->完成'
    },
    {
      name: 'updateStatusSuspend',
      method: 'POST',
      path: '/framework/project/updateStatusSuspend',
      mockPath: '/framework/project/updateStatusSuspend',
      desc: '立项管理->项目立项->暂停'
    },
    {
      name: 'getPermissionSetting',
      method: 'GET',
      path: '/framework/project/getPermissionSetting',
      mockPath: '/framework/project/getPermissionSetting',
      desc: '立项管理->项目立项->获取权限设置'
    },
    {
      name: 'getWholeById',
      method: 'POST',
      path: '/framework/project/getWholeById',
      mockPath: '/framework/project/getWholeById',
      desc: '发起审批->根据业务id获取项目id'
    }
  ],
  planInfoManager: [
    {
      name: 'getPlanInfo',
      method: 'POST',
      path: '/product/pm/planManager/getPlanInfo',
      mockPath: '/product/pm/planManager/getPlanInfo',
      desc: '项目管理->计划管理->获取计划详情'
    }
  ],
  planGanttManager: [
    {
      name: 'reminder',
      method: 'POST',
      path: '/reminder/save',
      mockPath: '/reminder/save',
      desc: '项目管理->计划管理->计划编辑 -> 计划反馈消息已读'
    },
    {
      name: 'loadReminder',
      method: 'POST',
      path: '/product/pm/plan/loadPlanGanttReminder',
      mockPath: '/product/pm/plan/loadPlanGanttReminder',
      desc: '项目管理->计划管理->计划编辑 -> 获取计划反馈消息'
    },
    {
      name: 'getChangeList',
      method: 'POST',
      path: '/product/pm/planChange/taskChangeList',
      mockPath: '/product/pm/planChange/taskChangeList',
      desc: '项目管理->计划管理->计划编辑 -> 获取计划变更历史'
    },
    {
      name: 'async',
      method: 'POST',
      path: '/product/ProductionPlan/async',
      mockPath: '/product/ProductionPlan/async',
      desc: '项目管理->计划管理->计划编辑 -> ERP接口推送'
    },
    {
      name: 'sdmPlanDelete',
      method: 'POST',
      path: '/product/ProductionPlan/sdmPlanDelete',
      mockPath: '/product/ProductionPlan/sdmPlanDelete',
      desc: '项目管理->计划管理->计划编辑 -> ERP接口推送'
    },
    {
      name: 'updateRootProgress',
      method: 'POST',
      path: '/product/pm/plan/updateRootProgress',
      mockPath: '/product/pm/plan/updateRootProgress',
      desc: '项目管理->计划管理->计划编辑 -> gantt数据加载'
    },
    {
      name: 'loadPlanGanttData',
      method: 'POST',
      path: '/product/pm/plan/loadPlanGanttData',
      mockPath: '/product/pm/plan/loadPlanGanttData',
      desc: '项目管理->计划管理->计划编辑 -> gantt数据加载'
    },
    {
      name: 'pushPlanMssage',
      method: 'POST',
      path: '/product/pm/plan/planIssuanceMessage',
      mockPath: '/product/pm/plan/planIssuanceMessage',
      desc: '项目管理->计划管理->计划编辑 -> 通知下发'
    },
    {
      name: 'loadPlanStatusLimitStrategy',
      method: 'POST',
      path: '/product/pm/planManager/loadPlanStatusLimitStrategy',
      mockPath: '/product/pm/planManager/loadPlanStatusLimitStrategy',
      desc: '项目管理->计划管理->获取计划状态对应gantt操作权限'
    },
    {
      name: 'getProjectStatus',
      method: 'POST',
      path: '/product/pm/plan/getProjectStatus',
      mockPath: '/product/pm/plan/getProjectStatus',
      desc: '项目管理->计划管理->计划编辑 -> getProjectStatus'
    },
    {
      name: 'loadPlanGanttResourceData',
      method: 'POST',
      path: '/product/pm/plan/loadPlanGanttResourceData',
      mockPath: '/product/pm/plan/loadPlanGanttResourceData',
      desc: '项目管理->计划管理->计划编辑 -> gantt资源数据加载'
    },
    {
      name: 'projectPlanTree',
      method: 'POST',
      path: '/product/pm/plan/projectPlanTree',
      mockPath: '/product/pm/plan/projectPlanTree',
      desc: '项目计划树'
    },
    {
      name: 'createPlanGanttData',
      method: 'POST',
      path: '/product/pm/plan/createPlanGanttData',
      mockPath: '/product/pm/plan/createPlanGanttData',
      desc: '项目管理->计划管理->计划编辑 -> 新建任务'
    },
    {
      name: 'removePlanGanttData',
      method: 'POST',
      path: '/product/pm/plan/removePlanGanttData',
      mockPath: '/product/pm/plan/removePlanGanttData',
      desc: '项目管理->计划管理->计划编辑 -> 删除任务'
    },
    {
      name: 'updatePlanGanttData',
      method: 'POST',
      path: '/product/pm/plan/updatePlanGanttData',
      mockPath: '/product/pm/plan/updatePlanGanttData',
      desc: '项目管理->计划管理->计划编辑 -> 任务更新'
    },
    {
      name: 'createPlanGanttLink',
      method: 'POST',
      path: '/product/pm/plan/createPlanGanttLink',
      mockPath: '/product/pm/plan/createPlanGanttLink',
      desc: '项目管理->计划管理->计划编辑 -> 新建前后置关系'
    },
    {
      name: 'planResourceLoad',
      method: 'POST',
      path: '/product/pm/plan/planResourceLoad',
      mockPath: '/product/pm/plan/planResourceLoad',
      desc: '项目管理->计划管理->计划编辑 -> 团队资源数据加载'
    },
    {
      name: 'wbsDataSource',
      method: 'POST',
      path: '/product/pm/plan/wbsDataSource',
      mockPath: '/product/pm/plan/wbsDataSource',
      desc: '项目管理->计划管理->计划编辑 -> 课题号数据源'
    },
    {
      name: 'pageReceiveErpList',
      method: 'POST',
      path: '/product/pm/plan/pageReceiveErpList',
      mockPath: '/product/pm/plan/pageReceiveErpList',
      desc: '项目管理->计划管理->计划编辑 -> 课题号数据源'
    },
    {
      name: 'exportReceiveErpList',
      method: 'POST',
      path: '/product/pm/plan/exportReceiveErpList',
      mockPath: '/product/pm/plan/exportReceiveErpList',
      desc: '项目管理->计划管理->计划编辑 -> 生产导出'
    },
    {
      name: 'pushErpData',
      method: 'POST',
      path: '/product/pm/plan/pushErpData',
      mockPath: '/product/pm/plan/pushErpData',
      desc: '项目管理->计划管理->计划编辑 -> ERP推送'
    },
    {
      name: 'resourceTaskLoad',
      method: 'POST',
      path: '/product/pm/plan/resourceTaskLoad',
      mockPath: '/product/pm/plan/resourceTaskLoad',
      desc: '项目管理->计划管理->计划编辑 -> 团队资源对应任务数据加载'
    },
    {
      name: 'removePlanGanttLink',
      method: 'POST',
      path: '/product/pm/plan/removePlanGanttLink',
      mockPath: '/product/pm/plan/removePlanGanttLink',
      desc: '项目管理->计划管理->计划编辑 -> 删除前后置关系'
    },
    {
      name: 'calculateParentForecastDate',
      method: 'POST',
      path: '/product/pm/plan/calculateParentForecastDate',
      mockPath: '/product/pm/plan/calculateParentForecastDate',
      desc: '项目管理->计划管理->计划编辑 -> 更新预计时间'
    },
    {
      name: 'loadMonitorPointData',
      method: 'POST',
      path: '/product/pm/plan/loadMonitorPointData',
      mockPath: '/product/pm/plan/loadMonitorPointData',
      desc: '项目管理->计划管理->计划编辑 -> 计划标识数据加载'
    },
    {
      name: 'loadMonitorPointDataInfo',
      method: 'POST',
      path: '/product/pm/plan/zrlLockingSituation',
      mockPath: '/product/pm/plan/zrlLockingSituation',
      desc: '项目管理->计划管理->计划编辑 -> 计划标识锁定详情'
    },
    {
      name: 'zrlOrMonthlyPlanLockingSituation',
      method: 'POST',
      path: '/product/pm/plan/zrlOrMonthlyPlanLockingSituation',
      mockPath: '/product/pm/plan/zrlOrMonthlyPlanLockingSituation',
      desc: '项目管理->计划管理->计划编辑 -> 计划标识锁定状态详情'
    },
    {
      name: 'updateTaskStyle',
      method: 'POST',
      path: '/product/pm/plan/updateTaskStyle',
      mockPath: '/product/pm/plan/updateTaskStyle',
      desc: '项目管理->计划管理->计划编辑 -> 任务样式更新'
    },
    {
      name: 'copyTasks',
      method: 'POST',
      path: '/product/pm/plan/copyTasks',
      mockPath: '/product/pm/plan/copyTasks',
      desc: '项目管理->计划管理->计划编辑 -> 任务复制'
    },
    {
      name: 'pasteTasks',
      method: 'POST',
      path: '/product/pm/plan/pasteTasks',
      mockPath: '/product/pm/plan/pasteTasks',
      desc: '项目管理->计划管理->计划编辑 -> 任务粘贴'
    },
    {
      name: 'loadTaskClassifyData',
      method: 'POST',
      path: '/product/pm/plan/loadTaskClassifyData',
      mockPath: '/product/pm/plan/loadTaskClassifyData',
      desc: '项目管理->计划管理->计划编辑 -> 加载任务类型'
    },
    {
      name: 'loadSelectOptionData',
      method: 'POST',
      path: '/product/pm/plan/loadSelectOptionData',
      mockPath: '/product/pm/plan/loadSelectOptionData',
      desc: '项目管理->计划管理->计划编辑 -> 查询下拉选数据查询'
    },
    {
      name: 'getActivityInfoByTaskId',
      method: 'POST',
      path: '/product/pm/plan/getActivityInfoByTaskId',
      mockPath: '/product/pm/plan/getActivityInfoByTaskId',
      desc: '项目管理->计划管理->计划编辑 -> 任务详情查询'
    },
    {
      name: 'describeSave',
      method: 'POST',
      path: '/product/pm/plan/describeSave',
      mockPath: '/product/pm/plan/describeSave',
      desc: '项目管理->计划管理->计划编辑 -> 任务描述保存'
    },
    {
      name: 'customInputInfo',
      method: 'POST',
      path: '/product/pm/plan/customInputInfo',
      mockPath: '/product/pm/plan/customInputInfo',
      desc: '项目管理->计划管理->计划编辑 -> 获取自定义任务输入物'
    },
    {
      name: 'inputSave',
      method: 'POST',
      path: '/product/pm/plan/inputSave',
      mockPath: '/product/pm/plan/inputSave',
      desc: '项目管理->计划管理->计划编辑 -> 输入物保存'
    },
    {
      name: 'inputInfo',
      method: 'POST',
      path: '/product/pm/plan/inputInfo',
      mockPath: '/product/pm/plan/inputInfo',
      desc: '项目管理->计划管理->计划编辑->输入数据获取'
    },
    {
      name: 'outputInfo',
      method: 'POST',
      path: '/product/pm/plan/outputInfo',
      mockPath: '/product/pm/plan/outputInfo',
      desc: '项目管理->计划管理->计划编辑 -> 任务输出详情查询'
    },
    {
      name: 'outputSave',
      method: 'POST',
      path: '/product/pm/plan/outputSave',
      mockPath: '/product/pm/plan/outputSave',
      desc: '项目管理->计划管理->计划编辑 -> 任务输出保存'
    },
    {
      name: 'specialInfo',
      method: 'POST',
      path: '/product/pm/plan/specialInfo',
      mockPath: '/product/pm/plan/specialInfo',
      desc: '项目管理->计划管理->计划编辑 -> 任务特别说明详情'
    },
    {
      name: 'specialSave',
      method: 'POST',
      path: '/product/pm/plan/specialSave',
      mockPath: '/product/pm/plan/specialSave',
      desc: '项目管理->计划管理->计划编辑 -> 任务特别说明保存'
    },
    {
      name: 'importActivityInfoClassifyTree',
      method: 'POST',
      path: '/product/pm/plan/importActivityInfoClassifyTree',
      mockPath: '/product/pm/plan/importActivityInfoClassifyTree',
      desc: '项目管理->计划管理->活动导入->活动导入左侧树数据源'
    },
    {
      name: 'importActivityInfoTree',
      method: 'POST',
      path: '/product/pm/plan/importActivityInfoTree',
      mockPath: '/product/pm/plan/importActivityInfoTree',
      desc: '项目管理->计划管理->活动导入->活动导入右侧树数据源'
    },
    {
      name: 'importActivityInfo',
      method: 'POST',
      path: '/product/pm/plan/importActivityInfo',
      mockPath: '/product/pm/plan/importActivityInfo',
      desc: '项目管理->计划管理->计划删除->活动导入'
    },
    {
      name: 'excelExport',
      method: 'POST',
      path: '/product/pm/plan/excelExport',
      mockPath: '/product/pm/plan/excelExport',
      desc: '项目管理->计划管理->计划编制->数据->Excel导出'
    },
    {
      name: 'exportVerification',
      method: 'POST',
      path: '/product/pm/plan/exportVerification',
      mockPath: '/product/pm/plan/exportVerification',
      desc: '项目管理->计划管理->计划编制->数据->Excel导出校验'
    },
    {
      name: 'excelExportNew',
      method: 'POST',
      path: '/product/pm/plan/excelExportNew',
      mockPath: '/product/pm/plan/excelExportNew',
      desc: '项目管理->计划管理->计划编制->数据->Excel导出'
    },
    {
      name: 'getApprovalUsers',
      method: 'POST',
      path: '/product/pm/plan/getApprovalUsers',
      mockPath: '/product/pm/plan/getApprovalUsers',
      desc: '项目管理->计划管理->责任令发布->选择审批人'
    },
    {
      name: 'excelProject',
      method: 'POST',
      path: '/product/pm/plan/excelProject',
      mockPath: '/product/pm/plan/excelProject',
      desc: '项目管理->计划管理->计划编制->数据->project导出'
    },
    {
      name: 'importExcel',
      method: 'POST',
      path: '/product/pm/plan/importExcel',
      mockPath: '/product/pm/plan/importExcel',
      desc: '项目管理->计划管理->计划编制->数据->导入excel'
    },
    {
      name: 'importExcelCheckOut',
      method: 'POST',
      path: '/product/pm/plan/importExcelCheckOut',
      mockPath: '/product/pm/plan/importExcelCheckOut',
      desc: '知识库管理->产出流程管理->excel导入检查'
    },
    {
      name: 'importProject',
      method: 'POST',
      path: '/product/pm/plan/importProject',
      mockPath: '/product/pm/plan/importProject',
      desc: '项目管理->计划管理->计划编制->数据->导入excel'
    },
    {
      name: 'importProjectCheckout',
      method: 'POST',
      path: '/product/pm/plan/importProjectCheckout',
      mockPath: '/product/pm/plan/importProjectCheckout',
      desc: '知识库管理->产出流程管理->excel导入检查'
    },
    {
      name: 'monitorTimeSave',
      method: 'POST',
      path: '/product/pm/plan/monitorTimeSave',
      mockPath: '/product/pm/plan/monitorTimeSave',
      desc: '项目管理->计划管理->计划编辑->标识管理时间保存'
    },
    {
      name: 'monitorTimeRemove',
      method: 'POST',
      path: '/product/pm/plan/monitorTimeRemove',
      mockPath: '/product/pm/plan/monitorTimeRemove',
      desc: '项目管理->计划管理->计划属性->标识删除'
    },
    {
      name: 'monitorTimeInfo',
      method: 'POST',
      path: '/product/pm/plan/monitorTimeInfo',
      mockPath: '/product/pm/plan/monitorTimeInfo',
      desc: '项目管理->计划管理->计划编辑->标识管理时间详情'
    },
    {
      name: 'getTaskMonitorByTaskId',
      method: 'POST',
      path: '/product/pm/plan/getTaskMonitorByTaskId',
      mockPath: '/product/pm/plan/getTaskMonitorByTaskId',
      desc: '项目管理->计划管理->计划编辑->计划属性->获取任务标识信息---弃用'
    },
    {
      name: 'saveTaskMonitorInfo',
      method: 'POST',
      path: '/product/pm/plan/saveTaskMonitorInfo',
      mockPath: '/product/pm/plan/saveTaskMonitorInfo',
      desc: '项目管理->计划管理->计划编辑->计划属性->任务标识信息保存'
    },
    {
      name: 'getDependenceByTaskId',
      method: 'POST',
      path: '/product/pm/plan/getDependenceByTaskId',
      mockPath: '/product/pm/plan/getDependenceByTaskId',
      desc: '项目管理->计划管理->计划编辑->计划属性->获取任务依赖关系详情'
    },
    {
      name: 'saveDependence',
      method: 'POST',
      path: '/product/pm/plan/saveDependence',
      mockPath: '/product/pm/plan/saveDependence',
      desc: '项目管理->计划管理->计划编辑->计划属性->任务依赖详情保存'
    },
    {
      name: 'comResourceTaskSave',
      method: 'POST',
      path: '/product/pm/comResourceTask/comResourceTaskSave',
      mockPath: '/product/pm/comResourceTask/comResourceTaskSave',
      desc: '项目管理->计划管理->计划编辑->共性资源->共性资源详情保存'
    },
    {
      name: 'unComResourceTaskSave',
      method: 'GET',
      path: '/product/pm/comResourceTask/unComResourceTaskSave',
      mockPath: '/product/pm/comResourceTask/unComResourceTaskSave',
      desc: '项目管理->计划管理->计划编辑->共性资源->取消共性资源'
    },
    {
      name: 'issuePlanTasks',
      method: 'POST',
      path: '/product/pm/plan/issuePlanTasks',
      mockPath: '/product/pm/plan/issuePlanTasks',
      desc: '项目管理->计划管理->计划编辑->计划下发'
    },
    {
      name: 'changePlanScheduling',
      method: 'POST',
      path: '/product/pm/plan/changePlanScheduling',
      mockPath: '/product/pm/plan/changePlanScheduling',
      desc: '项目管理->计划管理->计划编辑->计划排程模式自动切换为手动'
    },
    {
      name: 'batchSyncTask',
      method: 'POST',
      path: '/product/pm/plan/batchSyncTask',
      mockPath: '/product/pm/plan/batchSyncTask',
      desc: '项目管理->计划管理->计划编辑->同步'
    },
    {
      name: 'outPutViewData',
      method: 'POST',
      path: '/product/pm/plan/outPutViewData',
      mockPath: '/product/pm/plan/outPutViewData',
      desc: '项目管理->计划管理->计划编辑->查看输出物'
    },
    {
      name: 'classifiedFiltering',
      method: 'POST',
      path: '/product/pm/plan/classifiedFiltering',
      mockPath: '/product/pm/plan/classifiedFiltering',
      desc: '项目管理->计划管理->计划编辑->保存'
    },
    {
      name: 'changeSwitchType',
      method: 'POST',
      path: '/product/pm/planManager/changeSwitchType',
      mockPath: '/product/pm/planManager/changeSwitchType',
      desc: '项目管理->计划管理->修改项目状态'
    },
    {
      name: 'submitReleaseCheck',
      method: 'POST',
      path: '/product/pm/planManager/submitReleaseCheck',
      mockPath: '/product/pm/planManager/submitReleaseCheck',
      desc: '项目管理->计划管理->校验计划责任人'
    },
    {
      name: 'getPlanStatisticData',
      method: 'POST',
      path: '/product/pm/plan/loadMonitorTask',
      mockPath: '/product/pm/plan/loadMonitorTask',
      desc: '项目管理->计划管理->gantt->获取计划统计信息'
    },
    {
      name: 'getPlanStatusData',
      method: 'POST',
      path: '/product/pm/plan/loadStatusTask',
      mockPath: '/product/pm/plan/loadStatusTask',
      desc: '项目管理->计划管理->gantt->状态饼图'
    },
    {
      name: 'getPlanTaskTypeData',
      method: 'POST',
      path: '/product/pm/plan/loadTaskTypeTask',
      mockPath: '/product/pm/plan/loadTaskTypeTask',
      desc: '项目管理->计划管理->gantt->任务类型饼状图'
    },
    {
      name: 'versionList',
      method: 'POST',
      path: '/product/pm/plan/loadPlanVersionData',
      mockPath: '/product/pm/plan/loadPlanVersionData',
      desc: '项目管理->计划管理->计划编制->版本列表'
    },
    {
      name: 'getVersionNum',
      method: 'POST',
      path: '/product/pm/plan/getPlanVersion',
      mockPath: '/product/pm/plan/getPlanVersion',
      desc: '项目管理->计划管理->计划编制->获取版本号'
    },
    {
      name: 'versionCreate',
      method: 'POST',
      path: '/product/pm/plan/createPlanVersion',
      mockPath: '/product/pm/plan/createPlanVersion',
      desc: '项目管理->计划管理->计划编制->创建版本'
    },
    {
      name: 'loadTaskVersionData',
      method: 'POST',
      path: '/product/pm/plan/loadTaskVersionData',
      mockPath: '/product/pm/plan/loadTaskVersionData',
      desc: '项目管理->计划管理->计划编制->版本对比列表'
    },
    {
      name: 'getDescribesVersionData',
      method: 'POST',
      path: '/product/pm/plan/getDescribesVersionData',
      mockPath: '/product/pm/plan/getDescribesVersionData',
      desc: '项目管理->计划管理->计划编辑->版本管理->版本任务列表->任务描述',
      cancelLoading: true
    },
    {
      name: 'getInputVersionData',
      method: 'POST',
      path: '/product/pm/plan/getInputVersionData',
      mockPath: '/product/pm/plan/getInputVersionData',
      desc: '项目管理->计划管理->计划编辑->版本管理->版本任务列表->输入',
      cancelLoading: true
    },
    {
      name: 'getOutputVersionData',
      method: 'POST',
      path: '/product/pm/plan/getOutputVersionData',
      mockPath: '/product/pm/plan/getOutputVersionData',
      desc: '项目管理->计划管理->计划编辑->版本管理->版本任务列表->输出',
      cancelLoading: true
    },
    {
      name: 'getSpecialVersionData',
      method: 'POST',
      path: '/product/pm/plan/getSpecialVersionData',
      mockPath: '/product/pm/plan/getSpecialVersionData',
      desc: '项目管理->计划管理->计划编辑->版本管理->版本任务列表->特别说明',
      cancelLoading: true
    },
    {
      name: 'getGanttColumnSettingByWholeId',
      method: 'POST',
      path: '/taskType/loadTaskDetailByWholeId',
      mockPath: '/taskType/loadTaskDetailByWholeId',
      desc: '项目管理->计划管理->计划编辑->gantt列配置信息',
      cancelLoading: true
    },
    {
      name: 'getGanttExtendAttr',
      method: 'POST',
      path: '/product/pm/plan/getTaskInfo',
      mockPath: '/product/pm/plan/getTaskInfo',
      desc: '项目管理->计划管理->计划编辑->gantt拓展属性查询'
    },
    {
      name: 'saveGanttExtendAttr',
      method: 'POST',
      path: '/product/pm/plan/extendSave',
      mockPath: '/product/pm/plan/extendSave',
      desc: '项目管理->计划管理->计划编辑->gantt拓展属性保存'
    }
  ],
  planChange: [
    {
      name: 'changeRecordClassification',
      method: 'POST',
      path: '/product/pm/planChange/changeRecordClassification',
      mockPath: '/product/pm/planChange/changeRecordClassification',
      desc: '计划管理->计划变更->列表获取变更数据集合的最大密级'
    },
    {
      name: 'planChangeList',
      method: 'POST',
      path: '/product/pm/planChange/planChangeList',
      mockPath: '/product/pm/planChange/planChangeList',
      desc: '计划管理->计划变更->变更记录列表加载'
    },
    {
      name: 'planTaskJsonSave',
      method: 'POST',
      path: '/product/pm/planChange/planTaskJsonSave',
      mockPath: '/product/pm/planChange/planTaskJsonSave',
      desc: '计划管理->计划变更->变更gantt数据保存'
    },
    {
      name: 'removePlanChange',
      method: 'POST',
      path: '/product/pm/planChange/removePlanChange',
      mockPath: '/product/pm/planChange/removePlanChange',
      desc: '计划管理->计划变更->变更记录删除'
    },
    {
      name: 'calculateChangeInfoAndSave',
      method: 'POST',
      path: '/product/pm/planChange/calculateChangeInfoAndSave',
      mockPath: '/product/pm/planChange/calculateChangeInfoAndSave',
      desc: '计划管理->计划变更->修改数据变更校验'
    },
    {
      name: 'changeRecordInfoSave',
      method: 'POST',
      path: '/product/pm/planChange/changeRecordInfoSave',
      mockPath: '/product/pm/planChange/changeRecordInfoSave',
      desc: '计划管理->计划变更->变更数据提交审批'
    },
    {
      name: 'queryCurrentDept',
      method: 'GET',
      path: '/product/pm/planChange/queryCurrentDept',
      mockPath: '/product/pm/planChange/queryCurrentDept',
      desc: '计划管理->计划变更->变更数据提交审批查询当前发起人部门领导'
    },
    {
      name: 'changeRecordInfoUpdateType',
      method: 'POST',
      path: '/product/pm/planChange/changeRecordInfoUpdateType',
      mockPath: '/product/pm/planChange/changeRecordInfoUpdateType',
      desc: '计划管理->计划变更->更新变更类型'
    },
    {
      name: 'changeRecordInfo',
      method: 'POST',
      path: '/product/pm/planChange/changeRecordInfo',
      mockPath: '/product/pm/planChange/changeRecordInfo',
      desc: '计划管理->计划变更->变更详情'
    },
    {
      name: 'teamRoleValidator',
      method: 'POST',
      path: '/product/pm/planChange/teamRoleValidator',
      mockPath: '/product/pm/planChange/teamRoleValidator',
      desc: '计划管理->计划变更->流程启动前检查'
    },
    {
      name: 'getTaskDefinition',
      method: 'POST',
      path: '/product/pm/planChange/getTaskDefinition',
      mockPath: '/product/pm/planChange/getTaskDefinition',
      desc: '计划管理->计划变更->获取审批人'
    },
    {
      name: 'planOverviewBulletinBoard',
      method: 'POST',
      path: '/product/pm/planOverview/planOverviewBulletinBoard',
      mockPath: '/product/pm/planOverview/planOverviewBulletinBoard',
      desc: '计划管理->计划概况'
    }
  ],
  taskAttribute: [
    {
      name: 'listData',
      method: 'POST',
      path: '/taskType/listData',
      mockPath: '/taskType/listData',
      desc: '任务属性设置-列表接口'
    },
    {
      name: 'getInfo',
      method: 'POST',
      path: '/taskType/getInfo',
      mockPath: '/taskType/getInfo',
      desc: '任务属性设置-修改接口'
    },
    {
      name: 'saveData',
      method: 'POST',
      path: '/taskType/saveData',
      mockPath: '/taskType/saveData',
      desc: '任务属性设置-修改接口'
    },
    {
      name: 'delete',
      method: 'POST',
      path: '/taskType/delete',
      mockPath: '/taskType/delete',
      desc: '任务属性设置-删除接口'
    }
  ],
  // 知识库管理
  knowledgeManagement: [
    {
      name: 'save',
      method: 'POST',
      path: '/product/klTeams/save',
      mockPath: '/product/klTeams/save',
      desc: '标准团队库-保存'
    },
    {
      name: 'remove',
      method: 'POST',
      path: '/product/klTeams/remove',
      mockPath: '/product/klTeams/remove',
      desc: '标准团队库-删除'
    },
    {
      name: 'get',
      method: 'POST',
      path: '/product/klTeams/get',
      mockPath: '/product/klTeams/get',
      desc: '标准团队库-回显'
    },
    {
      name: 'saveCheck',
      method: 'POST',
      path: '/product/klTeams/saveCheck',
      mockPath: '/product/klTeams/saveCheck',
      desc: '标准团队库-校验'
    },
    {
      name: 'roleClassifyList',
      method: 'POST',
      path: '/product/klTeams/roleClassifyList',
      mockPath: '/product/klTeams/roleClassifyList',
      desc: '标准团队库-类别角色列表'
    },
    {
      name: 'saveRoleClassify',
      method: 'POST',
      path: '/product/klTeams/saveRoleClassify',
      mockPath: '/product/klTeams/saveRoleClassify',
      desc: '标准团队库-类别保存/修改'
    },
    {
      name: 'removeRoleClassify',
      method: 'POST',
      path: '/product/klTeams/removeRoleClassify',
      mockPath: '/product/klTeams/removeRoleClassify',
      desc: '标准团队库-类别删除'
    }
  ],
  MyExperience: [
    {
      name: 'experienceClassifyTreeList',
      method: 'POST',
      path: '/product/repository/MyExperienceBase/experienceClassifyTreeList',
      mockPath: '/product/repository/MyExperienceBase/experienceClassifyTreeList ',
      desc: '我的经验库-左侧树'
    },
    {
      name: 'experienceClassifyCreate',
      method: 'POST',
      path: '/product/repository/MyExperienceBase/experienceClassifyCreate',
      mockPath: '/product/repository/MyExperienceBase/experienceClassifyCreate',
      desc: '我的经验库-左侧树-新建子级'
    },
    {
      name: 'saveExperienceInfo',
      method: 'POST',
      path: '/product/repository/MyExperienceBase/saveExperienceInfo',
      mockPath: '/product/repository/MyExperienceBase/saveExperienceInfo',
      desc: '我的经验库-创建模板'
    },
    {
      name: 'removeExperienceClassify',
      method: 'POST',
      path: '/product/repository/MyExperienceBase/removeExperienceClassify',
      mockPath: '/product/repository/MyExperienceBase/removeExperienceClassify',
      desc: '我的经验库-左侧树-删除'
    },
    {
      name: 'myBaseExperienceList',
      method: 'POST',
      path: '/product/repository/MyExperienceBase/myBaseExperienceList',
      mockPath: '/product/repository/MyExperienceBase/myBaseExperienceList',
      desc: '我的经验库-右侧列表'
    },
    {
      name: 'importTaskEx',
      method: 'POST',
      path: '/product/repository/MyExperienceBase/importTaskEx',
      mockPath: '/product/repository/MyExperienceBase/importTaskEx',
      desc: '我的经验库-右侧列表'
    }
  ],
  // 团队管理
  teamManager: [
    {
      name: 'get',
      method: 'POST',
      path: '/product/projectTeam/get',
      mockPath: '/product/projectTeam/get',
      desc: '团队管理-获取团队数据'
    },
    {
      name: 'save',
      method: 'POST',
      path: '/product/projectTeam/save',
      mockPath: '/product/projectTeam/save',
      desc: '团队管理-获取团队数据'
    },
    {
      name: 'roleUserList',
      method: 'POST',
      path: '/product/projectTeam/roleUserList',
      mockPath: '/product/projectTeam/roleUserList',
      desc: '团队管理-选择人员列表'
    },
    {
      name: 'myWholeDescribeList',
      method: 'POST',
      path: '/product/projectTeam/myWholeDescribeList',
      mockPath: '/product/projectTeam/myWholeDescribeList',
      desc: '团队管理-我的经验团队-项目列表'
    },
    {
      name: 'myRoleList',
      method: 'POST',
      path: '/product/projectTeam/myRoleList',
      mockPath: '/product/projectTeam/myRoleList',
      desc: '团队管理-我的经验团队-项目团队角色列表'
    },
    {
      name: 'list',
      method: 'POST',
      path: '/product/klTeams/list',
      mockPath: '/product/klTeams/list',
      desc: '标准团队列表'
    },
    {
      name: 'lgetResponsibleist',
      method: 'POST',
      path: '/product/projectTeam/getResponsible',
      mockPath: '/product/projectTeam/getResponsible',
      desc: '替换责任人-查询责任人'
    },
    {
      name: 'getProjectTeamUser',
      method: 'POST',
      path: '/product/projectTeam/getProjectTeamUser',
      mockPath: '/product/projectTeam/getProjectTeamUser',
      desc: '替换责任人-获取项目团队人员'
    },
    {
      name: 'replaceResponsible',
      method: 'POST',
      path: '/product/projectTeam/replaceResponsible',
      mockPath: '/product/projectTeam/replaceResponsible',
      desc: '替换责任人-保存'
    },
    {
      name: 'wholeDescribeInfo',
      method: 'POST',
      path: '/product/projectTeam/wholeDescribeInfo',
      mockPath: '/product/projectTeam/wholeDescribeInfo',
      desc: '团队管理-项目信息'
    }
  ],
  OutputFlow: [
    {
      name: 'indexList',
      method: 'POST',
      path: '/product/klActivity/listData',
      mockPath: '/product/klActivity/listData',
      desc: '知识库管理->产出流程管理->列表数据'
    },
    {
      name: 'getByActivityClassifyId',
      method: 'POST',
      path: '/product/klActivity/getByActivityClassifyId',
      mockPath: '/product/klActivity/getByActivityClassifyId',
      desc: '知识库管理->产出流程管理->根据项目类别获取'
    },
    {
      name: 'editGetInfo',
      method: 'POST',
      path: '/product/klActivity/activityInfo',
      mockPath: '/product/klActivity/activityInfo',
      desc: '知识库管理->产出流程管理->流程详情数据查询'
    },
    {
      name: 'editGetKTeamData',
      method: 'POST',
      path: '/product/klActivity/getKTeamData',
      mockPath: '/product/klActivity/getKTeamData',
      desc: '知识库管理->产出流程管理->获取企业标准团队'
    },
    {
      name: 'editRepeatedNameCheck',
      method: 'POST',
      path: '/product/klActivity/repeatedNameCheck',
      mockPath: '/product/klActivity/repeatedNameCheck',
      desc: '知识库管理->产出流程管理-> 流程名称重复校验'
    },
    {
      name: 'indexRemove',
      method: 'POST',
      path: '/product/klActivity/removeActivityInfo',
      mockPath: '/product/klActivity/removeActivityInfo',
      desc: '知识库管理->产出流程管理-> 流程删除'
    },
    {
      name: 'saveActivityInfo',
      method: 'POST',
      path: '/product/klActivity/saveActivityInfo',
      mockPath: '/product/klActivity/saveActivityInfo',
      desc: '知识库管理->产出流程管理-> 流程保存'
    },
    {
      name: 'copyKActivityInfo',
      method: 'POST',
      path: '/product/klActivity/copyActivityInfo',
      mockPath: '/product/klActivity/copyActivityInfo',
      desc: '知识库管理->产出流程管理-> 流程复制'
    },
    {
      name: 'loadAcivityData',
      method: 'POST',
      path: '/product/klActivity/activityInfoTreeData',
      mockPath: '/product/klActivity/activityInfoTreeData',
      desc: '知识库管理->产出流程管理-> 活动树加载'
    },
    {
      name: 'updateActivityInfos',
      method: 'POST',
      path: '/product/klActivity/updateActivityInfos',
      mockPath: '/product/klActivity/updateActivityInfos',
      desc: '知识库管理->产出流程管理-> 活动拖动、升降级更新'
    },
    {
      name: 'saveNode',
      method: 'POST',
      path: '/product/klActivity/saveNode',
      mockPath: '/product/klActivity/saveNode',
      desc: '知识库管理->产出流程管理-> 新建活动保存'
    },
    {
      name: 'GMloadModeData',
      method: 'POST',
      path: '/product/klActivity/loadModeData',
      mockPath: '/product/klActivity/loadModeData',
      desc: '知识库管理->产出流程管理-> [图形]数据加载'
    },
    {
      name: 'GMdragNodeSave',
      method: 'POST',
      path: '/product/klActivity/dragNodeSave',
      mockPath: '/product/klActivity/dragNodeSave',
      desc: '知识库管理->产出流程管理-> [图形]拖动保存节点'
    },
    {
      name: 'GMpredecessorsCreateOrUpdate',
      method: 'POST',
      path: '/product/klActivity/predecessorsCreateOrUpdate',
      mockPath: '/product/klActivity/predecessorsCreateOrUpdate',
      desc: '知识库管理->产出流程管理-> [图形]前后置连线创建和更新'
    },
    {
      name: 'GMremovePredecessors',
      method: 'POST',
      path: '/product/klActivity/removePredecessors',
      mockPath: '/product/klActivity/removePredecessors',
      desc: '知识库管理->产出流程管理-> [图形] 删除前后置连线'
    },
    {
      name: 'GMPredecessors',
      method: 'POST',
      path: '/product/klActivity/gmPredecessors',
      mockPath: '/product/klActivity/gmPredecessors',
      desc: '知识库管理->产出流程管理-> [图形]  获取前后置信息'
    },
    {
      name: 'removeNodes',
      method: 'POST',
      path: '/product/klActivity/removeNodes',
      mockPath: '/product/klActivity/removeNodes',
      desc: '知识库管理->产出流程管理->删除活动，连同子删除'
    },
    {
      name: 'activityInfo',
      method: 'POST',
      path: '/product/klActivity/activityInfo',
      mockPath: '/product/klActivity/activityInfo',
      desc: '知识库管理->产出流程管理->流程详情/活动描述详情数据查询'
    },
    {
      name: 'describeSave',
      method: 'POST',
      path: '/product/klActivity/describeSave',
      mockPath: '/product/klActivity/describeSave',
      desc: '知识库管理->产出流程管理->活动描述保存'
    },
    {
      name: 'OFrepeatedCodeCheck',
      method: 'POST',
      path: '/product/klActivity/repeatedCodeCheck',
      mockPath: '/product/klActivity/repeatedCodeCheck',
      desc: '知识库管理->产出流程管理->活动编号重复校验'
    },
    {
      name: 'roleClassifyTree',
      method: 'POST',
      path: '/product/klActivity/roleClassifyTree',
      mockPath: '/product/klActivity/roleClassifyTree',
      desc: '知识库管理->产出流程管理->根据流程团队id获取团队角色信息'
    },
    {
      name: 'inputInfo',
      method: 'POST',
      path: '/product/klActivity/inputInfo',
      mockPath: '/product/klActivity/inputInfo',
      desc: '知识库管理->产出流程管理->输入详情'
    },
    {
      name: 'customInputInfo',
      method: 'POST',
      path: '/product/klActivity/customInputInfo',
      mockPath: '/product/klActivity/customInputInfo',
      desc: '知识库管理->产出流程管理->自定义的输入详情'
    },
    {
      name: 'inputSave',
      method: 'POST',
      path: '/product/klActivity/inputSave',
      mockPath: '/product/klActivity/inputSave',
      desc: '知识库管理->产出流程管理->输入保存'
    },
    {
      name: 'outputSave',
      method: 'POST',
      path: '/product/klActivity/outputSave',
      mockPath: '/product/klActivity/outputSave',
      desc: '知识库管理->产出流程管理->输出保存'
    },
    {
      name: 'outputInfo',
      method: 'POST',
      path: '/product/klActivity/outputInfo',
      mockPath: '/product/klActivity/outputInfo',
      desc: '知识库管理->产出流程管理->输出详情'
    },
    {
      name: 'specialSave',
      method: 'POST',
      path: '/product/klActivity/specialSave',
      mockPath: '/product/klActivity/specialSave',
      desc: '知识库管理->产出流程管理->活动特别说明保存'
    },
    {
      name: 'specialInfo',
      method: 'POST',
      path: '/product/klActivity/specialInfo',
      mockPath: '/product/klActivity/specialInfo',
      desc: '知识库管理->产出流程管理->特别说明详情'
    },
    {
      name: 'predecessorsTree',
      method: 'POST',
      path: '/product/klActivity/predecessorsTree',
      mockPath: '/product/klActivity/predecessorsTree',
      desc: '知识库管理->产出流程管理->前后置关系树数据源'
    },
    {
      name: 'importExcel',
      method: 'POST',
      path: '/product/klActivity/importExcel',
      mockPath: '/product/klActivity/importExcel',
      desc: '知识库管理->产出流程管理->excel导入'
    },
    {
      name: 'exportExcel',
      method: 'POST',
      path: '/product/klActivity/exportExcel',
      mockPath: '/product/klActivity/exportExcel',
      desc: '知识库管理->产出流程管理->excel导入'
    },
    {
      name: 'pasteNode',
      method: 'POST',
      path: '/product/klActivity/pasteNode',
      mockPath: '/product/klActivity/pasteNode',
      desc: '知识库管理->产出流程管理->excel导入'
    },
    {
      name: 'loadModeData',
      method: 'POST',
      path: '/product/klActivity/loadModeData',
      mockPath: '/product/klActivity/loadModeData',
      desc: '知识库管理->产出流程管理->图形模式查询接口'
    },
    {
      name: 'loadModeDataSave',
      method: 'POST',
      path: '/product/klActivity/loadModeDataSave',
      mockPath: '/product/klActivity/loadModeDataSave',
      desc: '知识库管理->产出流程管理->存储位置信息'
    }
  ],
  TodoList: [
    {
      name: 'list',
      method: 'POST',
      path: '/product/backlog/list',
      mockPath: '/product/backlog/list',
      desc: '我的待办-我接收的-执行详情'
    },
    {
      name: 'save',
      method: 'POST',
      path: '/product/backlog/save',
      mockPath: '/product/backlog/save',
      desc: '我的待办-我接收的-执行保存'
    },
    {
      name: 'submit',
      method: 'POST',
      path: '/product/backlog/submit',
      mockPath: '/product/backlog/submit',
      desc: '我的待办-我接收的-执行保存并提交'
    }
  ],
  planExamine: [
    {
      name: 'saveData',
      method: 'POST',
      path: '/assessment/assessment/saveData',
      mockPath: '/assessment/assessment/saveData',
      desc: '计划考核-保存'
    },
    {
      name: 'delete',
      method: 'POST',
      path: '/assessment/assessment/delete',
      mockPath: '/assessment/assessment/delete',
      desc: '计划考核-删除'
    },
    {
      name: 'startAssessment',
      method: 'POST',
      path: '/assessment/assessment/startAssessment',
      mockPath: '/assessment/assessment/startAssessment',
      desc: '计划考核-开始考核'
    },
    {
      name: 'getMonth',
      method: 'POST',
      path: '/assessment/assessment/getMonth',
      mockPath: '/assessment/assessment/getMonth',
      desc: '计划考核-获取月份'
    },
    {
      name: 'saveAssessmentByData',
      method: 'POST',
      path: '/assessment/assessment/saveAssessmentByData',
      mockPath: '/assessment/assessment/saveAssessmentByData',
      desc: '计划考核-下钻保存'
    },
    {
      name: 'export',
      method: 'POST',
      path: '/assessment/assessment/export',
      mockPath: '/assessment/assessment/export',
      desc: '计划考核-导出'
    },
    {
      name: 'getResult',
      method: 'POST',
      path: '/assessment/assessment/getResult',
      mockPath: '/assessment/assessment/getResult',
      desc: '计划考核-查询月状态'
    }
  ],
  demandManagement: [
    {
      name: 'saveRequirement',
      method: 'POST',
      path: '/requirement/saveRequirement',
      mockPath: '/requirement/saveRequirement',
      desc: '需求管理-保存'
    },
    {
      name: 'viewRequirement',
      method: 'POST',
      path: '/requirement/viewRequirement',
      mockPath: '/requirement/viewRequirement',
      desc: '需求管理-查看'
    },
    {
      name: 'getTaskList',
      method: 'POST',
      path: '/requirement/getTaskList',
      mockPath: '/requirement/getTaskList',
      desc: '计划列表'
    },
    {
      name: 'getRequirementList',
      method: 'POST',
      path: '/requirement/getRequirementList',
      mockPath: '/requirement/getRequirementList',
      desc: '需求管理列表'
    },
    {
      name: 'saveRequirementByTask',
      method: 'POST',
      path: '/requirement/saveRequirementByTask',
      mockPath: '/requirement/saveRequirementByTask',
      desc: '计划关联'
    },
    {
      name: 'getRequirementByProject',
      method: 'POST',
      path: '/requirement/getRequirementByProject',
      mockPath: '/requirement/getRequirementByProject',
      desc: '立项关联查看'
    },
    {
      name: 'saveRequirementByProject',
      method: 'POST',
      path: '/requirement/saveRequirementByProject',
      mockPath: '/requirement/saveRequirementByProject',
      desc: '立项关联'
    },
    {
      name: 'getRequirementByTaskChange',
      method: 'POST',
      path: '/requirement/getRequirementByTaskChange',
      mockPath: '/requirement/getRequirementByTaskChange',
      desc: '计划变更关联列表回显'
    },
    {
      name: 'saveRequirementByTaskChange',
      method: 'POST',
      path: '/requirement/saveRequirementByTaskChange',
      mockPath: '/requirement/saveRequirementByTaskChange',
      desc: '计划变更关联保存'
    }
  ]
}
