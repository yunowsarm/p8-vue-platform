/**
 * framework API
 * Namespace: framework
 */

export const system = {
  // 系统备份管理
  systemBackup: [
    {
      name: 'executeBackup',
      method: 'POST',
      path: '/framework/backup/executeBackup',
      mockPath: '/framework/backup/executeBackup',
      desc: '平台数据库备份'
    },
    {
      name: 'executeRestore',
      method: 'POST',
      path: '/framework/backup/executeRestore',
      mockPath: '/framework/backup/executeRestore',
      desc: '平台数据库恢复'
    }
  ],
  // 第三方接口平台
  thirdPartInterface: [
    {
      name: 'serviceList',
      method: 'POST',
      path: '/framework/system/ThirdPartService/serviceList',
      mockPath: '/framework/system/ThirdPartService/serviceList',
      params: {},
      desc: '第三方接口管理-列表'
    },
    {
      name: 'bindService',
      method: 'POST',
      path: '/framework/system/ThirdPartService/bindService',
      mockPath: '/framework/system/ThirdPartService/bindService',
      params: {},
      desc: '第三方接口管理-修改保存'
    },
    {
      name: 'getDic',
      method: 'POST',
      path: '/framework/system/BpDictionary/getDic',
      mockPath: '/framework/system/BpDictionary/getDic',
      // params: {},
      desc: '数据字典'
    },
    {
      name: 'getDicTree',
      method: 'POST',
      path: '/framework/system/BpDictionary/getDicTree',
      mockPath: '/framework/system/BpDictionary/getDicTree',
      desc: '立项决策结构树'
    },
    {
      name: 'getFiledByConfigId',
      method: 'POST',
      path: '/framework/system/BpDictionary/getFiledByConfigId',
      mockPath: '/framework/system/BpDictionary/getFiledByConfigId',
      desc: '立项所属领域选择'
    },
    {
      name: 'getClassifyByFiledId',
      method: 'POST',
      path: '/framework/system/BpDictionary/getClassifyByFiledId',
      mockPath: '/framework/system/BpDictionary/getClassifyByFiledId',
      desc: '根据所属领域选择选择项目类型'
    },
    {
      name: 'getConfigId',
      method: 'POST',
      path: '/framework/system/BpDictionary/getConfigId',
      mockPath: '/framework/system/BpDictionary/getConfigId',
      desc: '立项决策结构树'
    },
    {
      name: 'genMinorCode',
      method: 'POST',
      path: '/framework/system/BpDictionary/genMinorCode',
      mockPath: '/framework/system/BpDictionary/genMinorCode',
      desc: '数据字典管理-获取新建选项页字典编码'
    },
    {
      name: 'unBindConfigList',
      method: 'POST',
      path: '/framework/system/ThirdPartService/unBindConfigList',
      mockPath: '/framework/system/ThirdPartService/unBindConfigList',
      params: {},
      desc: '第三方接口管理-查询所有未绑定的配置'
    },
    {
      name: 'unBindServiceList',
      method: 'POST',
      path: '/framework/system/ThirdPartService/unBindServiceList',
      mockPath: '/framework/system/ThirdPartService/unBindServiceList',
      params: {},
      desc: '第三方接口管理-获取所有未绑定的实现类'
    },
    {
      name: 'heartInterfaceList',
      method: 'POST',
      path: '/framework/system/ThirdPartService/heartServiceList',
      mockPath: '/framework/system/ThirdPartService/heartServiceList',
      params: {},
      desc: '第三方接口管理-获取所有心跳接口'
    },
    {
      name: 'serviceRemove',
      method: 'POST',
      path: '/framework/system/ThirdPartService/serviceRemove',
      mockPath: '/framework/system/ThirdPartService/serviceRemove',
      params: {},
      desc: '第三方接口管理-删除'
    },
    {
      name: 'logListData',
      method: 'POST',
      path: '/framework/system/ThirdPartService/serviceLogList',
      mockPath: '/framework/system/ThirdPartService/serviceLogList',
      params: {},
      desc: '第三方接口管理>执行记录列表'
    },
    {
      name: 'retryListData',
      method: 'POST',
      path: '/framework/system/ThirdPartService/serviceRetryList',
      mockPath: '/framework/system/ThirdPartService/serviceRetryList',
      params: {},
      desc: '第三方接口异常监控>列表'
    },
    {
      name: 'doServiceRetry',
      method: 'POST',
      path: '/framework/system/ThirdPartService/doServiceRetry',
      mockPath: '/framework/system/ThirdPartService/doServiceRetry',
      params: {},
      desc: '第三方接口管理>接口异常手动处理'
    },
    {
      name: 'retryDetailList',
      method: 'POST',
      path: '/framework/system/ThirdPartService/retryList',
      mockPath: '/framework/system/ThirdPartService/retryList',
      params: {},
      desc: '第三方接口异常监控>接口异常详情列表'
    },
    {
      name: 'doRetry',
      method: 'POST',
      path: '/framework/system/ThirdPartService/doRetry',
      mockPath: '/framework/system/ThirdPartService/doRetry',
      params: {},
      desc: '第三方接口管理>接口异常单条手动处理'
    },
    {
      name: 'getA5FileLink',
      method: 'POST',
      path: '/product/pm/activityInfo/A5Message',
      mockPath: '/product/pm/activityInfo/A5Message',
      params: {},
      desc: '获取A5输出文档'
    },
    {
      name: 'getYear',
      method: 'POST',
      path: '/framework/system/ThirdPartService/getYear',
      mockPath: '/framework/system/ThirdPartService/getYear',
      params: {},
      desc: '第三方接口管理>接口异常单条手动处理'
    },
    {
      name: 'distributionAsAWhole',
      method: 'POST',
      path: '/product/pm/planManager/distributionAsAWhole',
      mockPath: '/product/pm/planManager/distributionAsAWhole',
      params: {},
      desc: '计划列表>分发统筹'
    },
    {
      name: 'saveLockUnlockForm',
      method: 'POST',
      path: '/product/pm/planManager/saveLockUnlockForm',
      mockPath: '/product/pm/planManager/saveLockUnlockForm',
      params: {},
      desc: '计划列表>分发统筹'
    },
    {
      name: 'loadLockUnlockFormData',
      method: 'POST',
      path: '/product/pm/planManager/loadLockUnlockFormData',
      mockPath: '/product/pm/planManager/loadLockUnlockFormData',
      desc: '项目管理->计划管理->计划加解锁表单数据获取'
    },
    {
      name: 'synchronousWarning',
      method: 'POST',
      path: '/product/planWarning/synchronousWarning',
      mockPath: '/product/planWarning/synchronousWarning',
      params: {},
      desc: '计划预警 强制同步'
    }
  ],
  schedulerTask: [
    {
      name: 'list',
      method: 'POST',
      path: '/framework/scheduler/schedulerTask/list',
      mockPath: '/framework/scheduler/schedulerTask/list',
      params: {},
      desc: '定时任务管理-列表'
    },
    {
      name: 'save',
      method: 'POST',
      path: '/framework/scheduler/schedulerTask/save',
      mockPath: '/framework/scheduler/schedulerTask/save',
      params: {},
      desc: '定时任务管理-列表'
    },
    {
      name: 'forbiddenOrNormal',
      method: 'POST',
      path: '/framework/scheduler/schedulerTask/forbiddenOrNormal',
      mockPath: '/framework/scheduler/schedulerTask/forbiddenOrNormal',
      params: {},
      desc: '定时任务管理-启用或者禁用'
    },
    {
      name: 'delete',
      method: 'POST',
      path: '/framework/scheduler/schedulerTask/delete',
      mockPath: '/framework/scheduler/schedulerTask/delete',
      params: {},
      desc: '定时任务管理-删除'
    },
    {
      name: 'futureLaunch',
      method: 'POST',
      path: '/framework/scheduler/schedulerTask/futureLaunch',
      mockPath: '/framework/scheduler/schedulerTask/futureLaunch',
      params: {},
      desc: '定时任务管理-启动'
    },
    {
      name: 'futureShutdown',
      method: 'POST',
      path: '/framework/scheduler/schedulerTask/futureShutdown',
      mockPath: '/framework/scheduler/schedulerTask/futureShutdown',
      params: {},
      desc: '定时任务管理-关闭'
    },
    {
      name: 'futureLaunchOrStop',
      method: 'POST',
      path: '/framework/scheduler/schedulerTask/futureLaunchOrStop',
      mockPath: '/framework/scheduler/schedulerTask/futureLaunchOrStop',
      params: {},
      desc: '定时任务管理-启动或停止'
    }
  ],
  workHomePage: [
    {
      name: 'menuModuleList',
      method: 'GET',
      path: '/framework/system/menuModule/menuModuleList',
      mockPath: '/framework/system/menuModule/menuModuleList',
      desc: '工作首页>快捷入口>项目模块数据'
    }
  ],
  projectTeamSetting: [
    {
      name: 'saveLoginConfig',
      method: 'POST',
      path: '/framework/system/SystemSettings/saveLoginConfig',
      mockPath: '/framework/system/SystemSettings/saveLoginConfig',
      params: {},
      desc: '系统设置>功能设置>系统登录设置-保存'
    },
    {
      name: 'getLoginConfig',
      method: 'POST',
      path: '/framework/system/SystemSettings/getLoginConfig',
      mockPath: '/framework/system/SystemSettings/getLoginConfig',
      params: {},
      desc: '系统设置>功能设置>系统登录设置-查询'
    },
    {
      name: 'getSystemAbout',
      method: 'POST',
      path: '/framework/system/SystemSettings/getSystemAbout',
      mockPath: '/framework/system/SystemSettings/getSystemAbout',
      params: {},
      desc: '系统设置>功能设置>关于'
    },
    {
      name: 'listData',
      method: 'POST',
      path: '/framework/projectTeamSetting/teamPage/get',
      mockPath: '/framework/projectTeamSetting/teamPage/get',
      params: {},
      desc: '系统设置>功能设置>资源管理>项目团队设置>列表'
    },
    {
      name: 'create',
      method: 'POST',
      path: '/framework/projectTeamSetting/create',
      mockPath: '/framework/projectTeamSetting/create',
      params: {},
      desc: '系统设置>功能设置>资源管理>项目团队设置>修改保存'
    },
    {
      name: 'detail',
      method: 'POST',
      path: '/framework/projectTeamSetting/detail',
      mockPath: '/framework/projectTeamSetting/detail',
      params: {},
      desc: '系统设置>功能设置>资源管理>项目团队设置>获取修改数据'
    },
    {
      name: 'remove',
      method: 'POST',
      path: '/framework/projectTeamSetting/remove',
      mockPath: '/framework/projectTeamSetting/remove',
      params: {},
      desc: '系统设置>功能设置>资源管理>项目团队设置>删除'
    },
    {
      name: 'useState',
      method: 'POST',
      path: '/framework/projectTeamSetting/useState',
      mockPath: '/framework/projectTeamSetting/useState',
      params: {},
      desc: '系统设置>功能设置>资源管理>项目团队设置>启用停用'
    },
    {
      name: 'repeatedCheck',
      method: 'POST',
      path: '/framework/projectTeamSetting/repeatedCheck',
      mockPath: '/framework/projectTeamSetting/repeatedCheck',
      params: {},
      desc: '系统设置>功能设置>资源管理>项目团队设置>团队名称校验'
    },
    {
      name: 'getRole',
      method: 'POST',
      path: '/framework/projectTeamSetting/getRoleData',
      mockPath: '/framework/projectTeamSetting/getRoleData',
      params: {},
      desc: '系统设置>功能设置>资源管理>项目团队设置>团队名称校验'
    },
    {
      name: 'projectType',
      method: 'POST',
      path: '待提供',
      mockPath: '待提供',
      params: {},
      desc: '系统设置>功能设置>资源管理>项目团队设置>获取项目类型'
    },
    {
      name: 'repeatedCheckClassify',
      method: 'POST',
      path: '/framework/projectTeamSetting/repeatedCheckClassify',
      mockPath: '/framework/projectTeamSetting/repeatedCheckClassify',
      params: {},
      desc: '系统设置>功能设置>资源管理>项目团队设置>项目类型重复校验'
    },
    {
      name: 'removeBusinessFormById',
      method: 'POST',
      path: '/framework/desForm/removeBusinessFormById',
      mockPath: '/framework/desForm/removeBusinessFormById',
      params: {},
      desc: '系统设置>变更版本删除'
    },
    {
      name: 'getBusinessDesVersionPage',
      method: 'POST',
      path: '/framework/desForm/getBusinessDesVersionPage',
      mockPath: '/framework/desForm/getBusinessDesVersionPage',
      params: {},
      desc: '系统设置>变更版本列表'
    },
    {
      name: 'getBusinessDesVersionList',
      method: 'POST',
      path: '/framework/desForm/getBusinessDesVersionList',
      mockPath: '/framework/desForm/getBusinessDesVersionList',
      params: {},
      desc: '系统设置>变更版本历史'
    },
    {
      name: 'getHistoryFormData',
      method: 'POST',
      path: '/framework/cgForm/getHistoryFormData',
      mockPath: '/framework/cgForm/getHistoryFormData',
      params: {},
      desc: '系统设置>变更版本历史'
    }
  ],
  userManager: [
    {
      name: 'listData',
      method: 'POST',
      path: '/framework/system/User/listData',
      mockPath: '/framework/system/User/listData',
      desc: '获取人员列表数据，不涉及密级'
    },
    {
      name: 'dicData',
      method: 'POST',
      path: '/framework/system/BpDictionary/getDic',
      mockPath: '/framework/system/BpDictionary/getDic',
      desc: '人员管理-列表'
    },
    {
      name: 'list',
      method: 'POST',
      path: '/framework/system/User/list',
      mockPath: '/framework/system/User/list',
      desc: '人员管理-列表'
    },
    {
      name: 'userListByRoleId',
      method: 'POST',
      path: '/framework/system/User/userListByRoleId',
      mockPath: '/framework/system/User/userListByRoleId',
      desc: '根据角色id查询人员列表'
    },
    {
      name: 'save',
      method: 'POST',
      path: '/framework/system/User/save',
      mockPath: '/framework/system/User/save',
      desc: '人员管理-保存'
    },
    {
      name: 'userInfo',
      method: 'POST',
      path: '/framework/system/User/userInfo',
      mockPath: '/framework/system/User/userInfo',
      desc: '人员信息'
    },
    {
      name: 'repeatedCheck',
      method: 'POST',
      path: '/framework/system/User/repeatedCheck',
      mockPath: '/framework/system/User/repeatedCheck',
      desc: '人员信息唯一性校验'
    },
    {
      name: 'remove',
      method: 'POST',
      path: '/framework/system/User/remove',
      mockPath: '/framework/system/User/remove',
      desc: '人员信息逻辑删除'
    },
    {
      name: 'unlock',
      method: 'POST',
      path: '/framework/system/User/unlock',
      mockPath: '/framework/system/User/unlock',
      desc: '已锁定人员解锁'
    },
    {
      name: 'safeSave',
      method: 'POST',
      path: '/framework/system/User/safeSave',
      mockPath: '/framework/system/User/safeSave',
      desc: '安全设置保存'
    },
    {
      name: 'checkLicUserLimit',
      method: 'POST',
      path: '/framework/system/User/checkLicUserLimit',
      mockPath: '/framework/system/User/checkLicUserLimit',
      desc: '人员管理-新建时增加人员限制校验'
    },
    {
      name: 'deptTree',
      method: 'POST',
      path: '/framework/system/Department/deptTree',
      mockPath: '/framework/system/Department/deptTree',
      params: {},
      desc: '部门树导航'
    },
    {
      name: 'deptTreeByUserDepartment',
      method: 'POST',
      path: '/framework/system/Department/deptTreeByUserDepartment',
      mockPath: '/framework/system/Department/deptTreeByUserDepartment',
      params: {},
      desc: '登陆人的部门树'
    },
    {
      name: 'getThreeLvDept',
      method: 'POST',
      path: '/framework/system/Department/getThreeLvDept',
      mockPath: '/framework/system/Department/getThreeLvDept',
      params: {},
      desc: '三级单位名称'
    },
    {
      name: 'getRoles',
      method: 'POST',
      path: '/framework/system/Role/getRoles',
      mockPath: '/framework/system/Role/getRoles',
      params: {},
      desc: '普通角色选择'
    },
    {
      name: 'getAllRolesByUser',
      method: 'POST',
      path: '/framework/system/User/getAllRoles',
      mockPath: '/framework/system/User/getAllRoles',
      params: {},
      desc: '获取全部角色'
    },
    {
      name: 'getAllRoles',
      method: 'POST',
      path: '/framework/system/Role/getAllRoles',
      mockPath: '/framework/system/Role/getAllRoles',
      params: {},
      desc: '所有角色选择'
    }
  ],
  PlanMonitor: [
    {
      name: 'planLogoListData',
      method: 'POST',
      path: '/framework/system/PlanLogo/listData',
      mockPath: '/framework/system/PlanLogo/listData',
      params: {},
      desc: '计划标识管理 列表'
    },
    {
      name: 'startStatus',
      method: 'POST',
      path: '/framework/system/PlanLogo/startStatus',
      mockPath: '/framework/system/PlanLogo/startStatus',
      params: {},
      desc: '基础数据 启用'
    },
    {
      name: 'stopStatus',
      method: 'POST',
      path: '/framework/system/PlanLogo/stopStatus',
      mockPath: '/framework/system/PlanLogo/stopStatus',
      params: {},
      desc: '基础数据 停用'
    },
    {
      name: 'deleteDictionary',
      method: 'POST',
      path: '/framework/system/PlanLogo/deleteDictionary',
      mockPath: '/framework/system/PlanLogo/deleteDictionary',
      desc: '基础数据管理-删除'
    },
    {
      name: 'saveDictionary',
      method: 'POST',
      path: '/framework/system/PlanLogo/saveDictionary',
      mockPath: '/framework/system/PlanLogo/saveDictionary',
      desc: '基础数据管理-保存接口'
    },
    {
      name: 'updateDictionary',
      method: 'POST',
      path: '/framework/system/PlanLogo/updateDictionary',
      mockPath: '/framework/system/PlanLogo/updateDictionary',
      desc: '基础数据管理-修改接口'
    },
    {
      name: 'getMonitorPointDataInfo',
      method: 'POST',
      path: '/framework/system/PlanLogo/getMonitorPointDataInfo',
      mockPath: '/framework/system/PlanLogo/getMonitorPointDataInfo',
      params: {},
      desc: '计划标识管理   标识详情查询'
    },
    {
      name: 'savePlanLogo',
      method: 'POST',
      path: '/framework/system/PlanLogo/save',
      mockPath: '/framework/system/PlanLogo/save',
      params: {},
      desc: '计划标识管理 修改保存'
    },
    {
      name: 'removePlanLogo',
      method: 'POST',
      path: '/framework/system/PlanLogo/remove',
      mockPath: '/framework/system/PlanLogo/remove',
      params: {},
      desc: '计划标识管理 删除'
    },
    {
      name: 'planLogoUseState',
      method: 'POST',
      path: '/framework/system/PlanLogo/useState',
      mockPath: '/framework/system/PlanLogo/useState',
      params: {},
      desc: '计划标识管理 启用停用'
    },
    {
      name: 'checkName',
      method: 'POST',
      path: '/framework/system/PlanLogo/repeatedCheck',
      mockPath: '/framework/system/PlanLogo/repeatedCheck',
      params: {},
      desc: '计划标识管理 标识名称校验'
    },
    {
      name: 'getRoleData',
      method: 'POST',
      path: '/framework/system/PlanLogo/getRoleData',
      mockPath: '/framework/system/PlanLogo/getRoleData',
      params: {},
      desc: '计划标识管理  系统角色数据查询'
    },
    {
      name: 'getMonitorPointData',
      method: 'POST',
      path: '/framework/system/PlanLogo/getMonitorPointData',
      mockPath: '/framework/system/PlanLogo/getMonitorPointData',
      params: {},
      desc: '计划标识管理   依赖互斥标识查询'
    }
  ],
  PlanGanttSetting: [
    {
      name: 'getSchedulingBasicConfig',
      method: 'POST',
      path: '/framework/project/autoSchedulingBasicConfig',
      mockPath: '/framework/project/autoSchedulingBasicConfig',
      desc: '系统设置-功能设置-排程设置-查询排程'
    },
    {
      name: 'saveOtherGlobalSettingsConfig',
      method: 'POST',
      path: '/framework/project/saveOtherGlobalSettingsConfig',
      mockPath: '/framework/project/saveOtherGlobalSettingsConfig',
      desc: '系统设置-功能设置-计划管理-保存其他全局设置'
    },
    {
      name: 'getTaskDate',
      method: 'POST',
      path: '/product/my/work/task/getTaskDate',
      mockPath: '/product/my/work/task/getTaskDate',
      desc: '系统设置-功能设置-任务实际完成时间填写限制设置'
    }
  ],
  role: [
    {
      name: 'list',
      method: 'POST',
      path: '/framework/system/Role/list',
      mockPath: '/framework/system/Role/list',
      params: {},
      desc: '角色列表'
    },
    {
      name: 'getPermissions',
      method: 'POST',
      path: '/framework/system/Role/getPermissions',
      mockPath: '/framework/system/Role/getPermissions',
      params: {},
      desc: '获取所有权限资源'
    },
    {
      name: 'save',
      method: 'POST',
      path: '/framework/system/Role/save',
      mockPath: '/framework/system/Role/save',
      params: {},
      desc: '角色保存'
    },
    {
      name: 'getRole',
      method: 'POST',
      path: '/framework/system/Role/getRole',
      mockPath: '/framework/system/Role/getRole',
      params: {},
      desc: '获取指定角色信息'
    },
    {
      name: 'repeatedCheck',
      method: 'POST',
      path: '/framework/system/Role/repeatedCheck',
      mockPath: '/framework/system/Role/repeatedCheck',
      params: {},
      desc: '角色唯一性校验'
    },
    {
      name: 'remove',
      method: 'POST',
      path: '/framework/system/Role/remove',
      mockPath: '/framework/system/Role/remove',
      params: {},
      desc: '角色删除'
    },
    {
      name: 'batchRemove',
      method: 'POST',
      path: '/framework/system/Role/batchRemove',
      mockPath: '/framework/system/Role/batchRemove',
      params: {},
      desc: '批量删除选择'
    },
    {
      name: 'selectRoleIds',
      method: 'POST',
      path: '/framework/system/Role/selectRoleIds',
      mockPath: '/framework/system/Role/selectRoleIds',
      params: {},
      desc: '查询选中标识集'
    },
    {
      name: 'getAllRole',
      method: 'POST',
      path: '/framework/system/Role/getAllRole',
      mockPath: '/framework/system/Role/getAllRole',
      params: {},
      desc: '获取所有角色'
    },
    {
      name: 'getApproveRoles',
      method: 'POST',
      path: '/framework/system/Role/getApproveRoles',
      mockPath: '/framework/system/Role/getApproveRoles',
      params: {},
      desc: '获取处理用户'
    },
    {
      name: 'getCandidateUsers',
      method: 'POST',
      path: '/framework/system/Role/getCandidateUsers',
      mockPath: '/framework/system/Role/getCandidateUsers',
      params: {},
      desc: '获取候选用户'
    }
  ],
  resource: [
    {
      name: 'list',
      method: 'POST',
      path: '/framework/system/Resource/list',
      mockPath: '/framework/system/Resource/list',
      params: {},
      desc: '4.5.1 菜单权限列表'
    },
    {
      name: 'info',
      method: 'POST',
      path: '/framework/system/Resource/info',
      mockPath: '/framework/system/Resource/info',
      desc: '4.5.2 通过ID获取菜单权限信息'
    },
    {
      name: 'save',
      method: 'POST',
      path: '/framework/system/Resource/save',
      mockPath: '/framework/system/Resource/save',
      desc: '4.5.3 菜单权限保存'
    },
    {
      name: 'delete',
      method: 'POST',
      path: '/framework/system/Resource/delete',
      mockPath: '/framework/system/Resource/delete',
      desc: '4.5.4 通过ID删除菜单权限信息'
    },
    {
      name: 'switch',
      method: 'POST',
      path: '/framework/system/Resource/switch',
      mockPath: '/framework/system/Resource/switch',
      desc: '4.5.5 通过ID对菜单启用状态进行切换'
    },
    {
      name: 'exportSQL',
      method: 'POST',
      path: '/framework/system/Resource/exportSQL',
      mockPath: '/framework/system/Resource/exportSQL',
      desc: '4.5.6 导出SQL脚本'
    },
    {
      name: 'getDic',
      method: 'POST',
      path: '/framework/system/Resource/getDict',
      mockPath: '/framework/system/Resource/getDict',
      desc: '4.5.7 获取选择项数据'
    },
    {
      name: 'checkRepeated',
      method: 'POST',
      path: '/framework/system/Resource/checkRepeated',
      mockPath: '/framework/system/Resource/checkRepeated',
      desc: '4.5.8 资源英文名称唯一性校验'
    }
  ],
  departmentManger: [
    {
      name: 'list',
      method: 'POST',
      path: '/framework/system/Department/list',
      mockPath: '/framework/system/Department/list',
      desc: '部门管理-列表'
    },
    {
      name: 'save',
      method: 'POST',
      path: '/framework/system/Department/save',
      mockPath: '/framework/system/Department/save',
      desc: '部门-保存'
    },
    {
      name: 'remove',
      method: 'POST',
      path: '/framework/system/Department/remove',
      mockPath: '/framework/system/Department/remove',
      desc: '部门-删除'
    },
    {
      name: 'moveUser',
      method: 'POST',
      path: '/framework/system/Department/moveUser',
      mockPath: '/framework/system/Department/moveUser',
      desc: '部门-人员转移'
    },
    {
      name: 'deptTree',
      method: 'POST',
      path: '/framework/system/Department/deptTree',
      mockPath: '/framework/system/Department/deptTree',
      desc: '部门-选择树'
    },
    {
      name: 'repeatedCheck',
      method: 'POST',
      path: '/framework/system/Department/repeatedCheck',
      mockPath: '/framework/system/Department/repeatedCheck',
      desc: '部门-名称重复校验'
    },
    {
      name: 'deptInfo',
      method: 'POST',
      path: '/framework/system/Department/deptInfo',
      mockPath: '/framework/system/Department/deptInfo',
      desc: '部门详情查询'
    }
  ],
  secretLevel: [
    {
      name: 'list',
      method: 'POST',
      path: '/framework/system/SecretLevel/list',
      mockPath: '/framework/system/SecretLevel/list',
      params: {},
      desc: '密级列表'
    },
    {
      name: 'save',
      method: 'POST',
      path: '/framework/system/SecretLevel/save',
      mockPath: '/framework/system/SecretLevel/save',
      desc: '密级保存'
    },
    {
      name: 'remove',
      method: 'POST',
      path: '/framework/system/SecretLevel/remove',
      mockPath: '/framework/system/SecretLevel/remove',
      params: {},
      desc: '密级删除'
    },
    {
      name: 'getSecret',
      method: 'POST',
      path: '/framework/system/SecretLevel/getSecret',
      mockPath: '/framework/system/SecretLevel/getSecret',
      params: {},
      desc: '密级详情查询'
    },
    {
      name: 'repeatedCheck',
      method: 'POST',
      path: '/framework/system/SecretLevel/repeatedCheck',
      mockPath: '/framework/system/SecretLevel/repeatedCheck',
      params: {},
      desc: '密级唯一性检查'
    }
  ],
  systemLog: [
    {
      name: 'list',
      method: 'POST',
      path: '/framework/system/Log/list',
      mockPath: '/framework/system/Log/list',
      desc: '系统日志-日志列表'
    },
    {
      name: 'logModule',
      method: 'POST',
      path: '/framework/system/Log/logModule',
      mockPath: '/framework/system/Log/logModule',
      desc: '系统日志-下拉模块框'
    }
  ],
  SystemSettings: [
    {
      name: 'getBaseConfigSettings',
      method: 'POST',
      path: '/framework/system/SystemSettings/getBaseConfigSettings',
      mockPath: '/framework/system/SystemSettings/getBaseConfigSettings',
      desc: '获取配置项信息'
    },
    {
      name: 'saveBaseConfigSettings',
      method: 'POST',
      path: '/framework/system/SystemSettings/saveBaseConfigSettings',
      mockPath: '/framework/system/SystemSettings/saveBaseConfigSettings',
      desc: '保存配置项信息'
    },
    {
      name: 'getAppearanceSettings',
      method: 'POST',
      path: '/framework/system/SystemSettings/getAppearanceSettings',
      mockPath: '/framework/system/SystemSettings/getAppearanceSettings',
      desc: '外观设置-数据'
    },
    {
      name: 'saveAppearanceSettings',
      method: 'POST',
      path: '/framework/system/SystemSettings/saveAppearanceSettings',
      mockPath: '/framework/system/SystemSettings/saveAppearanceSettings',
      desc: '外观设置-保存'
    },
    {
      name: 'saveMenuBgImages',
      method: 'POST',
      path: '/framework/system/SystemSettings/saveMenuBgImages',
      mockPath: '/framework/system/SystemSettings/saveMenuBgImages',
      desc: '外观设置-保存图片'
    },
    {
      name: 'loadMenuBgImages',
      method: 'POST',
      path: '/framework/system/SystemSettings/loadMenuBgImages',
      mockPath: '/framework/system/SystemSettings/loadMenuBgImages',
      desc: '外观设置-查看图片'
    },
    {
      name: 'removeMenuBgImage',
      method: 'POST',
      path: '/framework/system/SystemSettings/removeMenuBgImage',
      mockPath: '/framework/system/SystemSettings/removeMenuBgImage',
      desc: '外观设置-删除图片'
    },
    {
      name: 'getBasicSetting',
      method: 'POST',
      path: '/framework/system/SystemSettings/getBasicSetting',
      mockPath: '/framework/system/SystemSettings/getBasicSetting',
      desc: '基本设置-数据'
    },
    {
      name: 'getLoginSetting',
      method: 'POST',
      path: '/framework/system/SystemSettings/getLoginSetting',
      mockPath: '/framework/system/SystemSettings/getLoginSetting',
      desc: '查询系统基本设置属性'
    },
    {
      name: 'checkBaseConfig',
      method: 'POST',
      path: '/framework/system/SystemSettings/checkBaseConfig',
      mockPath: '/framework/system/SystemSettings/checkBaseConfig',
      desc: '查询系统人员信息管理属性'
    },
    {
      name: 'saveBasicSetting',
      method: 'POST',
      path: '/framework/system/SystemSettings/saveBasicSetting',
      mockPath: '/framework/system/SystemSettings/saveBasicSetting',
      desc: '基本设置-保存'
    },
    {
      name: 'download',
      method: 'POST',
      path: '/attachment/download',
      mockPath: '/attachment/download',
      desc: '下载'
    },
    {
      name: 'getFileUrl',
      method: 'POST',
      path: '/attachment/download',
      mockPath: '/attachment/download',
      desc: '下载'
    },
    {
      name: 'downloadLoginLogo',
      method: 'POST',
      path: '/attachment/downloadLoginLogo',
      mockPath: '/attachment/downloadLoginLogo',
      desc: '下载系统logo'
    },
    {
      name: 'getTemplateFileUrl',
      method: 'POST',
      path: '/attachment/downloadTemplate',
      mockPath: '/attachment/downloadTemplate',
      desc: '下载附件'
    },
    // 获取项目标识、计划标识、任务标识等，后续增加logo等
    {
      name: 'getVuePlatfromInitConfig',
      method: 'POST',
      path: '/framework/system/SystemSettings/getVuePlatfromInitConfig',
      mockPath: '/framework/system/SystemSettings/getVuePlatfromInitConfig',
      desc: '获取页面初始化配置'
    },
    {
      name: 'getFileInputStream',
      method: 'POST',
      path: '/attachment/getFileInputStream',
      mockPath: '/attachment/getFileInputStream',
      desc: '获取临时文件流'
    },
    {
      name: 'loadBootstrapMenuList',
      method: 'POST',
      path: '/framework/system/operatingManual/loadBootstrapMenuList',
      mockPath: '/framework/system/operatingManual/loadBootstrapMenuList',
      desc: '系统引导-获取菜单列表'
    },
    {
      name: 'delete',
      method: 'POST',
      path: '/framework/system/operatingManual/delete',
      mockPath: '/framework/system/operatingManual/delete',
      desc: '系统引导-个人删除'
    },
    {
      name: 'restore',
      method: 'POST',
      path: '/framework/system/operatingManual/restore',
      mockPath: '/framework/system/operatingManual/restore',
      desc: '系统引导-恢复删除项'
    },
    {
      name: 'selectResourcesByMenuId',
      method: 'POST',
      path: '/framework/system/operatingManual/selectResourcesByMenuId',
      mockPath: '/framework/system/operatingManual/selectResourcesByMenuId',
      desc: '系统引导-根据menuId获取视频地址和文章地址'
    }
  ],
  processApproval: [
    {
      name: 'pendingList',
      method: 'POST',
      path: '/bpm/personal/ProcessApproval/pendingList',
      mockPath: '/bpm/personal/ProcessApproval/pendingList',
      desc: '当前用户待审批列表数据'
    },
    {
      name: 'getCatalog',
      method: 'POST',
      path: '/product/BpDictionaryNew/getDicList',
      mockPath: '/product/BpDictionaryNew/getDicList',
      desc: '当前用户待审批列表数据'
    },
    {
      name: 'userAssigneeCount',
      method: 'POST',
      path: '/bpm/personal/ProcessApproval/userAssigneeCount',
      mockPath: '/bpm/personal/ProcessApproval/userAssigneeCount',
      desc: '当前用户待审批数量'
    },
    {
      name: 'getModeSupportsServicesImpl',
      method: 'POST',
      path: '/bpm/personal/ProcessApproval/getModeSupportsServicesImpl',
      mockPath: '/bpm/personal/ProcessApproval/getModeSupportsServicesImpl',
      desc: '获取发起流程时的服务类(发提供流程中各节点的受托人)'
    },
    {
      name: 'listData',
      method: 'POST',
      path: '/tag/bp-tag/listData',
      mockPath: '/tag/bp-tag/listData',
      desc: '获取流程审批列表的标签'
    }
  ],
  commonInterface: [
    {
      name: 'configItem',
      method: 'POST',
      path: '/framework/system/SystemSettings/getBaseConfigSettings',
      mockPath: '/framework/system/SystemSettings/getBaseConfigSettings',
      params: {},
      desc: '配置项信息'
    },
    {
      name: 'signInConfig',
      method: 'POST',
      path: '/framework/signConfig/get',
      mockPath: '/framework/signConfig/get',
      params: {},
      desc: '获取外链跳转页面配置项信息'
    }
  ],
  documentManagement: [
    {
      name: 'viewExportWord',
      method: 'POST',
      path: '/exportWord/viewExportWord',
      mockPath: '/exportWord/viewExportWord',
      params: {},
      desc: '富文本编辑器导出'
    },
    {
      name: 'getWebsocketGroupAll',
      method: 'POST',
      path: '/framework/websocket/getWebsocketGroupAll',
      mockPath: '/framework/websocket/getWebsocketGroupAll',
      params: {},
      desc: '消息列表数据'
    },
    {
      name: 'getWebsocketById',
      method: 'POST',
      path: '/framework/websocket/getWebsocketById',
      mockPath: '/framework/websocket/getWebsocketById',
      params: {},
      desc: '列表聊天数据'
    },
    {
      name: 'getAllDicByCodeType',
      method: 'GET',
      path: '/framework/system/BpDictionary/getAllDicByCodeType',
      mockPath: '/framework/system/BpDictionary/getAllDicByCodeType',
      params: {},
      desc: '获取字典列表数据'
    },
    {
      name: 'getPAmodel',
      method: 'POST',
      path: '/framework/system/BpDictionary/getPAmodel',
      mockPath: '/framework/system/BpDictionary/getPAmodel',
      params: {},
      desc: '获得模块列表'
    },
    {
      name: 'list',
      method: 'POST',
      path: '/framework/system/document/list',
      mockPath: '/framework/system/document/list',
      params: {},
      desc: '文档列表'
    },
    {
      name: 'listPage',
      method: 'POST',
      path: '/framework/system/document/listPage',
      mockPath: '/framework/system/document/listPage',
      params: {},
      desc: '文档列表'
    },
    {
      name: 'save',
      method: 'POST',
      path: '/framework/system/document/save',
      mockPath: '/framework/system/document/save',
      params: {},
      desc: '文档和文档管理保存'
    },
    {
      name: 'saveDocumentManagement',
      method: 'POST',
      path: '/framework/system/document/saveDocumentManagement',
      mockPath: '/framework/system/document/saveDocumentManagement',
      params: {},
      desc: '文档管理更新保存'
    },
    {
      name: 'delete',
      method: 'POST',
      path: '/framework/system/document/delete',
      mockPath: '/framework/system/document/delete',
      params: {},
      desc: '文档删除'
    },
    {
      name: 'saveClassify',
      method: 'POST',
      path: '/framework/system/document/saveClassify',
      mockPath: '/framework/system/document/saveClassify',
      params: {}, // 传递字典实体属性
      desc: '保存分类'
    },
    {
      name: 'deleteClassify',
      method: 'POST',
      path: '/framework/system/document/deleteClassify',
      mockPath: '/framework/system/document/deleteClassify',
      params: {}, // 传递id
      desc: '删除分类及分类下文档'
    },
    {
      name: 'download',
      method: 'POST',
      path: '/attachment/download',
      mockPath: '/attachment/download',
      desc: '下载'
    },
    {
      name: 'listData',
      method: 'POST',
      path: '/attachmentBox/listData',
      mockPath: '/attachmentBox/listData',
      desc: '下载列表'
    },
    {
      name: 'listDataHistory',
      method: 'POST',
      path: '/attachmentHistory/listData',
      mockPath: '/attachmentHistory/listData',
      desc: '历史下载列表'
    },
    {
      name: 'deleteFile',
      method: 'POST',
      path: '/attachmentBox/delete',
      mockPath: '/attachmentBox/delete',
      desc: '下载列表删除'
    },
    {
      name: 'saveTaskType',
      method: 'POST',
      path: '/framework/system/PlanLogo/saveTaskType',
      mockPath: '/framework/system/PlanLogo/saveTaskType',
      desc: '任务类型操作设置'
    },
    {
      name: 'saveNotice',
      method: 'POST',
      path: '/NotificationAnnouncement/pm-notice/saveNotice',
      mockPath: '/NotificationAnnouncement/pm-notice/saveNotice',
      params: {},
      desc: '系统管理>通知公告管理>保存'
    },
    {
      name: 'selectNotice',
      method: 'POST',
      path: '/NotificationAnnouncement/pm-notice/selectNotice',
      mockPath: '/NotificationAnnouncement/pm-notice/selectNotice',
      params: {},
      desc: '系统管理>通知公告管理>查看'
    },
    {
      name: 'deleteNotice',
      method: 'POST',
      path: '/NotificationAnnouncement/pm-notice/deleteNotice',
      mockPath: '/NotificationAnnouncement/pm-notice/deleteNotice',
      params: {},
      desc: '系统管理>通知公告管理>删除'
    }
  ],
  extLink: [
    {
      name: 'listData',
      method: 'POST',
      path: '/framework/system/ext-link/listData',
      mockPath: '/framework/system/ext-link/listData',
      params: {},
      desc: '列表接口'
    },
    {
      name: 'save',
      method: 'POST',
      path: '/framework/system/ext-link/save',
      mockPath: '/framework/system/ext-link/save',
      params: {},
      desc: '保存接口'
    },
    {
      name: 'delete',
      method: 'POST',
      path: '/framework/system/ext-link/delete',
      mockPath: '/framework/system/ext-link/delete',
      params: {},
      desc: '删除接口'
    },
    {
      name: 'details',
      method: 'POST',
      path: '/framework/system/ext-link/details',
      mockPath: '/framework/system/ext-link/details',
      params: {},
      desc: '修改界面-详情接口'
    },
    {
      name: 'list',
      method: 'POST',
      path: '/framework/system/ext-link/list',
      mockPath: '/framework/system/ext-link/list',
      params: {},
      desc: '系统顶部外部链接'
    }
  ],
  dictionaryManagement: [
    {
      name: 'dictCategoryTree',
      method: 'POST',
      path: '/framework/system/BpDictionary/dictCategoryTree',
      mockPath: '/framework/system/BpDictionary/dictCategoryTree',
      params: {},
      desc: '数据字典管理-左侧分类树'
    },
    {
      name: 'saveCategory',
      method: 'POST',
      path: '/framework/system/BpDictionary/saveCategory',
      mockPath: '/framework/system/BpDictionary/saveCategory',
      params: {},
      desc: '数据字典管理-新建分类保存接口'
    },
    {
      name: 'repeatedCodeTypeCheck',
      method: 'POST',
      path: '/framework/system/BpDictionary/repeatedCodeTypeCheck',
      mockPath: '/framework/system/BpDictionary/repeatedCodeTypeCheck',
      params: {},
      desc: '数据字典管理-新建时校验英文代号是否存在'
    },
    {
      name: 'remove',
      method: 'POST',
      path: '/framework/system/BpDictionary/remove',
      mockPath: '/framework/system/BpDictionary/remove',
      params: {},
      desc: '数据字典管理-删除字典分类/选项'
    },
    {
      name: 'getDictInfo',
      method: 'POST',
      path: '/framework/system/BpDictionary/getDictInfo',
      mockPath: '/framework/system/BpDictionary/getDictInfo',
      params: {},
      desc: '数据字典管理-查看详情'
    },
    {
      name: 'saveDict',
      method: 'POST',
      path: '/framework/system/BpDictionary/saveDict',
      mockPath: '/framework/system/BpDictionary/saveDict',
      params: {},
      desc: '数据字典管理-查看详情'
    },
    {
      name: 'repeatedMinorCodeCheck',
      method: 'POST',
      path: '/framework/system/BpDictionary/repeatedMinorCodeCheck',
      mockPath: '/framework/system/BpDictionary/repeatedMinorCodeCheck',
      params: {},
      desc: '数据字典管理-字典编码重复性校验'
    },
    {
      name: 'list',
      method: 'POST',
      path: '/framework/system/BpDictionary/list',
      mockPath: '/framework/system/BpDictionary/list',
      params: {},
      desc: '数据字典管理-列表接口'
    },
    {
      name: 'exportSQL',
      method: 'POST',
      path: '/framework/system/BpDictionary/exportSQL',
      mockPath: '/framework/system/BpDictionary/exportSQL',
      params: {},
      desc: '数据字典管理-数据字典SQL导出'
    },
    {
      name: 'dictTree',
      method: 'POST',
      path: '/framework/system/BpDictionary/dictTree',
      mockPath: '/framework/system/BpDictionary/dictTree',
      params: {},
      desc: '数据字典管理-新建选项-查询所属父选项'
    },
    {
      name: 'deactivate',
      method: 'POST',
      path: '/framework/system/BpDictionary/deactivate',
      mockPath: '/framework/system/BpDictionary/deactivate',
      params: {},
      desc: '数据字典管理-停用'
    },
    {
      name: 'openingUp',
      method: 'POST',
      path: '/framework/system/BpDictionary/openingUp',
      mockPath: '/framework/system/BpDictionary/openingUp',
      params: {},
      desc: '数据字典管理-启用'
    }
  ],
  integratedManagement: [
    {
      name: 'thirdPartyExecuteByServer',
      method: 'POST',
      path: '/thirdparty/server/thirdPartyExecute',
      mockPath: '/thirdparty/server/thirdPartyExecute',
      desc: '内置服务端通用调用接口'
    },
    {
      name: 'thirdPartyExecuteByClient',
      method: 'POST',
      path: '/thirdparty/client/thirdPartyExecute',
      mockPath: '/thirdparty/client/thirdPartyExecute',
      desc: '内置客户端通用调用接口'
    },
    {
      name: 'serviceRetryList',
      method: 'POST',
      path: '/interface/serviceRetryList',
      mockPath: '/interface/serviceRetryList',
      desc: '查看第三方接口异常'
    },
    {
      name: 'doServiceRetry',
      method: 'POST',
      path: '/interface/doServiceRetry',
      mockPath: '/interface/doServiceRetry',
      desc: '异常监控-服务重试'
    },
    {
      name: 'describe',
      method: 'POST',
      path: '/interface/describe',
      mockPath: '/interface/describe',
      desc: '接口说明'
    },
    {
      name: 'getEnable',
      method: 'POST',
      path: '/interface/getEnable',
      mockPath: '/interface/getEnable',
      desc: '启用/禁用'
    },
    {
      name: 'getAuthType',
      method: 'POST',
      path: '/interface/getAuthType',
      mockPath: '/interface/getAuthType',
      desc: '获取认证类型'
    },
    {
      name: 'getThirdUser',
      method: 'POST',
      path: '/interface/getThirdUser',
      mockPath: '/interface/getThirdUser',
      desc: '授权用户列表'
    },
    {
      name: 'getTools',
      method: 'POST',
      path: '/interface/getTools',
      mockPath: '/interface/getTools',
      desc: '工具列表'
    },
    {
      name: 'getCustomises',
      method: 'POST',
      path: '/interface/getCustomises',
      mockPath: '/interface/getCustomises',
      desc: '获取自定义处理器'
    },
    {
      name: 'getCommandParam',
      method: 'POST',
      path: '/interface/getCommandParam',
      mockPath: '/interface/getCommandParam',
      desc: '查看执行链参数'
    },
    {
      name: 'serverSave',
      method: 'POST',
      path: '/thirdparty/server/save',
      mockPath: '/thirdparty/server/save',
      desc: '服务端保存'
    },
    {
      name: 'serverList',
      method: 'POST',
      path: '/thirdparty/server/dataList',
      mockPath: '/thirdparty/server/dataList',
      desc: '服务端列表'
    },
    {
      name: 'serverData',
      method: 'POST',
      path: '/thirdparty/server/data',
      mockPath: '/thirdparty/server/data',
      desc: '服务端详情'
    },
    {
      name: 'serverDelete',
      method: 'POST',
      path: '/thirdparty/server/delete',
      mockPath: '/thirdparty/server/delete',
      desc: '服务端删除'
    },

    {
      name: 'serverDebug',
      method: 'POST',
      path: '/thirdparty/server/debug',
      mockPath: '/thirdparty/server/debug',
      desc: '服务端调试'
    },
    {
      name: 'clientSave',
      method: 'POST',
      path: '/thirdparty/client/save',
      mockPath: '/thirdparty/client/save',
      desc: '客户端保存'
    },
    {
      name: 'clientList',
      method: 'POST',
      path: '/thirdparty/client/dataList',
      mockPath: '/thirdparty/client/dataList',
      desc: '客户端列表'
    },
    {
      name: 'clientData',
      method: 'POST',
      path: '/thirdparty/client/data',
      mockPath: '/thirdparty/client/data',
      desc: '客户端详情'
    },
    {
      name: 'clientDelete',
      method: 'POST',
      path: '/thirdparty/client/delete',
      mockPath: '/thirdparty/client/delete',
      desc: '客户端删除'
    },

    {
      name: 'clientDebug',
      method: 'POST',
      path: '/thirdparty/client/debug',
      mockPath: '/thirdparty/client/debug',
      desc: '客户端调试'
    }
  ]
}

export const messageApi = {
  userMessage: [
    {
      name: 'catalog',
      method: 'POST',
      path: '/framework/system/BpDictionary/getDicList',
      mockPath: '/framework/system/BpDictionary/getDicList',
      params: { dicType: 'MESSAGE_TYPE', containRoot: true },
      desc: '个人消息管理分类目录'
    },
    {
      name: 'list',
      method: 'POST',
      path: '/framework/message/Message/list',
      mockPath: '/framework/message/Message/list',
      desc: '消息列表'
    },
    {
      name: 'myMessageTotal',
      method: 'POST',
      path: '/framework/message/Message/myMessageTotal',
      mockPath: '/framework/message/Message/myMessageTotal',
      desc: '消息数量'
    },
    {
      name: 'myWorkData',
      method: 'POST',
      path: '/framework/message/Message/myWorkData',
      mockPath: '/framework/message/Message/myWorkData',
      desc: '门户界面我的任务以及我的审批消息数量'
    },
    {
      name: 'toggleStatus',
      method: 'POST',
      path: '/framework/message/Message/toggleStatus',
      mockPath: '/framework/message/Message/toggleStatus',
      desc: '消息标记已读/未读'
    },
    {
      name: 'delete',
      method: 'POST',
      path: '/framework/message/Message/delete',
      mockPath: '/framework/message/Message/delete',
      desc: '消息删除'
    },
    {
      name: 'userCatalogCount',
      method: 'POST',
      path: '/framework/message/Message/userCatalogCount',
      mockPath: '/framework/message/Message/userCatalogCount',
      desc: '分类消息数'
    },
    {
      name: 'userUnReadMessageCount',
      method: 'POST',
      path: '/framework/message/Message/userUnReadMessageCount',
      mockPath: '/framework/message/Message/userUnReadMessageCount',
      desc: '获取用户未读消息总数'
    }
  ]
}
export const formGeneratorApi = {
  formGenerator: [
    {
      name: 'generateFormFromDocument',
      method: 'POST',
      path: '/ai/intelligence/generateFormFromDocument',
      mockPath: '/ai/intelligence/generateFormFromDocument',
      desc: '表单设计器-AI帮填'
    },
    {
      name: 'stopParseDocFormResult',
      method: 'POST',
      path: '/ai/intelligence/stopParseDocFormResult',
      mockPath: '/ai/intelligence/stopParseDocFormResult',
      desc: '表单设计器-终止AI进程'
    },
    {
      name: 'exportWord',
      method: 'POST',
      path: '/thirdpart/exportWord',
      mockPath: '/thirdpart/exportWord',
      desc: '会议管理-实施部周例会导出word'
    },
    {
      name: 'editPlanExecuteStatus',
      method: 'POST',
      path: '/thirdpart/editPlanExecuteStatus',
      mockPath: '/thirdpart/editPlanExecuteStatus',
      desc: '计划管理-加锁解锁'
    },
    // 组件列表
    {
      name: 'compList',
      method: 'POST',
      path: '/framework/desComp/list',
      mockPath: '/framework/desComp/list',
      desc: '表单设计器-组件管理-组件列表'
    },
    {
      name: 'compSave',
      method: 'POST',
      path: '/framework/desComp/save',
      mockPath: '/framework/desComp/save',
      desc: '表单设计器-组件管理-组件保存'
    },
    {
      name: 'compRemove',
      method: 'POST',
      path: '/framework/desComp/remove',
      mockPath: '/framework/desComp/remove',
      desc: '表单设计器-组件管理-组件删除'
    },
    // 表单设计器
    {
      name: 'designerDetails',
      method: 'POST',
      path: '/framework/desForm/index',
      mockPath: '/framework/desForm/index',
      desc: '表单设计器-表单设计详情'
    },
    {
      name: 'designerSave',
      method: 'POST',
      path: '/framework/desForm/desSave',
      mockPath: '/framework/desForm/desSave',
      desc: '表单设计器-表单设计保存'
    },
    {
      name: 'getFormDataBase',
      method: 'POST',
      path: '/framework/cgForm/getAllForm',
      mockPath: '/framework/cgForm/getAllForm',
      desc: '表单设计器-加载数据源'
    },
    {
      name: 'getFormFields',
      method: 'POST',
      path: '/framework/cgForm/getFormFields',
      mockPath: '/framework/cgForm/getFormFields',
      desc: '表单设计器-加载数据源所有字段'
    },
    {
      name: 'getFormFieldsList',
      method: 'POST',
      path: '/framework/cgForm/getDesFormFields',
      mockPath: '/framework/cgForm/getDesFormFields',
      desc: '表单设计器-加载列表所有字段'
    },
    {
      name: 'desCopy',
      method: 'POST',
      path: '/framework/desForm/desCopy',
      mockPath: '/framework/desForm/desCopy',
      desc: '表单设计器-表单复制功能'
    },
    // 表单列表
    {
      name: 'formList',
      method: 'POST',
      path: '/framework/desForm/list',
      mockPath: '/framework/desForm/list',
      desc: '表单设计器-表单列表-表单列表'
    },
    {
      name: 'formListSave',
      method: 'POST',
      path: '/framework/desForm/save',
      mockPath: '/framework/desForm/save',
      desc: '表单设计器-表单列表-表单保存'
    },
    {
      name: 'formListRemove',
      method: 'POST',
      path: '/framework/desForm/remove',
      mockPath: '/framework/desForm/remove',
      desc: '表单设计器-表单列表-表单删除'
    },
    {
      name: 'formListRelease',
      method: 'POST',
      path: '/framework/desForm/desRelease',
      mockPath: '/framework/desForm/desRelease',
      desc: '表单设计器-表单列表-表单发布'
    },
    // 表单调用
    {
      name: 'formCallSave',
      method: 'POST',
      path: '/framework/cgForm/dataSave',
      mockPath: '/framework/cgForm/dataSave',
      desc: '表单设计器-表单调用-表单保存'
    },
    {
      name: 'formCallDataDetails',
      method: 'POST',
      path: '/framework/cgForm/getFormData',
      mockPath: '/framework/cgForm/getFormData',
      desc: '表单设计器-表单调用-表单数据详情'
    },
    {
      name: 'formCallDataList',
      method: 'POST',
      path: '/framework/cgForm/dataList',
      mockPath: '/framework/cgForm/dataList',
      desc: '表单设计器-表单调用-表单数据列表'
    },
    {
      name: 'formCallDataRemove',
      method: 'POST',
      path: '/framework/cgForm/removeFormData',
      mockPath: '/framework/cgForm/removeFormData',
      desc: '表单设计器-表单调用-表单数据删除'
    },
    {
      name: 'modifyContractStatus',
      method: 'POST',
      path: '/pmPlanTaskChange/modifyContractStatus',
      mockPath: '/pmPlanTaskChange/modifyContractStatus',
      desc: '修改合同信息发布状态表单'
    },
    // 主从表组件
    {
      name: 'getChildTable',
      method: 'POST',
      path: '/framework/cgForm/getChildTable',
      mockPath: '/framework/cgForm/getChildTable',
      desc: '表单设计器-主从表组件-通过主表获取所有子表表名'
    },
    // 获取主表
    {
      name: 'getCgTableData',
      method: 'POST',
      path: '/framework/cgForm/getCgTableData',
      mockPath: '/framework/cgForm/getCgTableData',
      desc: '表单设计器-主从表组件-获取主表'
    },
    // 表单校验唯一性
    {
      name: 'dataSaveCheck',
      method: 'POST',
      path: '/framework/cgForm/dataSaveCheck',
      mockPath: '/framework/cgForm/dataSaveCheck',
      desc: '表单渲染器-新建修改-校验唯一性'
    },
    {
      name: 'designFormListData',
      method: 'POST',
      path: '/attachmentBox/designFormListData',
      mockPath: '/attachmentBox/designFormListData',
      desc: '表单渲染器-上传附件文件中心列表'
    },
    // 选项组件管理
    {
      name: 'getSelectionDetail',
      method: 'POST',
      path: '/framework/selection/view',
      mockPath: '/framework/selection/view',
      desc: '智能表单-选项组件管理-选项详情'
    },
    {
      name: 'getSelectionOption',
      method: 'POST',
      path: '/framework/selection/getSelectionOption',
      mockPath: '/framework/selection/getSelectionOption',
      desc: '智能表单-选项组件管理-获取选型下拉框'
    },
    {
      name: 'getSelectionConfig',
      method: 'POST',
      path: '/framework/selection/getSelectionConfig',
      mockPath: '/framework/selection/getSelectionConfig',
      desc: '智能表单-选项组件管理-根据选项ID获取配置参数'
    },
    {
      name: 'getSqlViewAllColumnBySelectionId',
      method: 'POST',
      path: '/framework/selection/getSqlViewAllColumnBySelectionId',
      mockPath: '/framework/selection/getSqlViewAllColumnBySelectionId',
      desc: '智能表单-选项组件管理-根据选项ID获取数据视图所有的列'
    },
    {
      name: 'getSelectionData',
      method: 'POST',
      path: '/framework/selection/getSelectionData',
      mockPath: '/framework/selection/getSelectionData',
      desc: '智能表单-选项组件管理-获取选项数据接口'
    },
    {
      name: 'getSelectionDataDic',
      method: 'POST',
      path: '/framework/selection/getSelectionDataDic',
      mockPath: '/framework/selection/getSelectionDataDic',
      desc: '智能表单-选项组件管理-获取表头搜索下拉数据'
    },
    {
      name: 'getUniNum',
      method: 'POST',
      path: '/framework/cgForm/getCgTableDataByNumber',
      mockPath: '/framework/cgForm/getCgTableDataByNumber',
      desc: '智能表单-生成唯一编号'
    },
    {
      name: 'getGenerateType',
      method: 'POST',
      path: '/framework/cgForm/getCgTableByNumberRule',
      mockPath: '/framework/cgForm/getCgTableByNumberRule',
      desc: '智能表单-生成编号类型'
    },
    // 数据源管理
    {
      name: 'dataSourceList',
      method: 'POST',
      path: '/framework/cgForm/list',
      mockPath: '/framework/cgForm/list',
      desc: '数据源管理-数据源列表'
    },
    {
      name: 'dataSourceSave',
      method: 'POST',
      path: '/framework/cgForm/save',
      mockPath: '/framework/cgForm/save',
      desc: '数据源管理-数据源保存'
    },
    {
      name: 'dataSourceRemove',
      method: 'POST',
      path: '/framework/cgForm/remove',
      mockPath: '/framework/cgForm/remove',
      desc: '数据源管理-数据源删除'
    },
    {
      name: 'dataSourceFormView',
      method: 'POST',
      path: '/framework/cgForm/view',
      mockPath: '/framework/cgForm/view',
      desc: '数据源管理-获取数据源详细信息'
    },
    {
      name: 'dataSourceSync',
      method: 'POST',
      path: '/framework/cgForm/sync',
      mockPath: '/framework/cgForm/sync',
      desc: '数据源管理-数据源同步'
    },
    {
      name: 'lowCodeExportSql',
      method: 'POST',
      path: '/framework/desForm/lowCodeExportSql',
      mockPath: '/framework/desForm/lowCodeExportSql',
      desc: '全局导出'
    },
    {
      name: 'getFieldList',
      method: 'POST',
      path: '/framework/cgForm/fieldList',
      mockPath: '/framework/cgForm/fieldList',
      desc: '数据源管理-获取所有字段类型'
    },
    {
      name: 'getDefaultProp',
      method: 'POST',
      path: '/framework/cgForm/getDefaultProp',
      mockPath: '/framework/cgForm/getDefaultProp',
      desc: '数据源管理-获取数据源默认属性'
    },
    // 报表 SQL管理
    {
      name: 'sqlList',
      method: 'POST',
      path: '/framework/reportSQL/list',
      mockPath: '/framework/reportSQL/list',
      desc: 'SQL管理-SQL列表'
    },
    {
      name: 'sqlSave',
      method: 'POST',
      path: '/framework/reportSQL/save',
      mockPath: '/framework/reportSQL/save',
      desc: 'SQL管理-SQL保存'
    },
    {
      name: 'sqlRemove',
      method: 'POST',
      path: '/framework/reportSQL/delete',
      mockPath: '/framework/reportSQL/delete',
      desc: 'SQL管理-SQL删除'
    },
    {
      name: 'sqlParseCheck',
      method: 'POST',
      path: '/framework/reportSQL/parseCheck',
      mockPath: '/framework/reportSQL/parseCheck',
      desc: 'SQL管理-SQL解析检查'
    },
    {
      name: 'paramCheck',
      method: 'POST',
      path: '/framework/reportSQL/paramCheck',
      mockPath: '/framework/reportSQL/paramCheck',
      desc: 'SQL管理-SQL校验名称，编码'
    },
    {
      name: 'sqlParam',
      method: 'POST',
      path: '/framework/reportSQL/sqlParam',
      mockPath: '/framework/reportSQL/sqlParam',
      desc: 'SQL管理-SQL参数'
    },
    {
      name: 'getSqlParamData',
      method: 'POST',
      path: '/framework/reportSQL/getSqlParamData',
      mockPath: '/framework/reportSQL/getSqlParamData',
      desc: '数据视图-查看sql执行结果'
    },
    {
      name: 'sqlItem',
      method: 'POST',
      path: '/framework/reportSQL/sqlItem',
      mockPath: '/framework/reportSQL/sqlItem',
      desc: '数据视图-执行结果回显'
    },
    {
      name: 'getSqlexecute',
      method: 'POST',
      path: '/framework/reportSQL/getSqlexecute',
      mockPath: '/framework/reportSQL/getSqlexecute',
      desc: '数据视图-查询结果'
    },
    {
      name: 'copyReportSql',
      method: 'POST',
      path: '/framework/reportSQL/copyReportSql',
      mockPath: '/framework/reportSQL/copyReportSql',
      desc: '数据视图-复制'
    },
    {
      name: 'strategyList',
      method: 'POST',
      path: '/framework/system/BpFormScope/strategyList',
      mockPath: '/framework/system/BpFormScope/strategyList',
      desc: 'SQL管理-SQL参数'
    },
    {
      name: 'columnList',
      method: 'POST',
      path: '/framework/system/BpFormScope/columnList',
      mockPath: '/framework/system/BpFormScope/columnList',
      desc: 'SQL管理-SQL参数'
    },
    {
      name: 'expandService',
      method: 'POST',
      path: '/framework/reportSQL/getSqlExpandService',
      mockPath: '/framework/reportSQL/getSqlExpandService',
      desc: 'SQL管理-服务类'
    },
    {
      name: 'getSqlExpand',
      method: 'POST',
      path: '/framework/reportSQL/getSqlExpand',
      mockPath: '/framework/reportSQL/getSqlExpand',
      desc: 'SQL管理-查询SQL扩展服务'
    },
    // 报表管理
    {
      name: 'tableList',
      method: 'POST',
      path: '/framework/report/list',
      mockPath: '/framework/report/list',
      desc: '报表管理-报表列表'
    },
    {
      name: 'tableSave',
      method: 'POST',
      path: '/framework/report/save',
      mockPath: '/framework/report/save',
      desc: '报表管理-报表保存'
    },
    {
      name: 'tableRemove',
      method: 'POST',
      path: '/framework/report/delete',
      mockPath: '/framework/report/delete',
      desc: '报表管理-报表删除'
    },
    {
      name: 'reportCopy',
      method: 'POST',
      path: '/framework/report/reportCopy',
      mockPath: '/framework/report/reportCopy',
      desc: '报表管理-报表复制'
    },
    {
      name: 'tableSqlParse',
      method: 'POST',
      path: '/framework/report/parse',
      mockPath: '/framework/report/parse',
      desc: '报表管理-SQL解析'
    },
    {
      name: 'tableApply',
      method: 'POST',
      path: '/framework/report/apply',
      mockPath: '/framework/report/apply',
      desc: '报表管理-报表应用'
    },
    {
      name: 'tableColumnsInfo',
      method: 'POST',
      path: '/framework/report/reportItem',
      mockPath: '/framework/report/reportItem',
      desc: '报表管理-报表列表-列配置信息'
    },
    {
      name: 'tableParam',
      method: 'POST',
      path: '/framework/report/reportParam',
      mockPath: '/framework/report/reportParam',
      desc: '报表管理-报表列表-获取报表参数'
    },
    {
      name: 'tableButton',
      method: 'POST',
      path: '/framework/report/reportButton',
      mockPath: '/framework/report/reportButton',
      desc: '报表管理-报表列表-获取报表按钮'
    },
    {
      name: 'reportConfig',
      method: 'POST',
      path: '/framework/report/reportConfig',
      mockPath: '/framework/report/reportConfig',
      desc: '报表管理-报表列表-获取报表自定义列配置'
    },
    {
      name: 'reportEditDispose',
      method: 'POST',
      path: '/framework/report/reportEditDispose',
      mockPath: '/framework/report/reportEditDispose',
      desc: '报表管理-报表列表-获取报表编辑配置接口'
    },
    {
      name: 'tableGetInfo',
      method: 'POST',
      path: '/framework/report/get',
      mockPath: '/framework/report/get',
      desc: '报表管理-报表列表-根据报表编码获取报表数据'
    },
    {
      name: 'saveCheck',
      method: 'POST',
      path: '/framework/desForm/saveCheck',
      mockPath: '/framework/desForm/saveCheck',
      desc: '报表管理-报表列表-校验是否重复'
    },
    {
      name: 'getFormInfo',
      method: 'POST',
      path: '/framework/report/getFormInfo',
      mockPath: '/framework/report/getFormInfo',
      desc: '报表管理-报表列表-根据报表编码获取报表数据'
    },
    {
      name: 'updateFormInfo',
      method: 'POST',
      path: '/framework/report/updateFormInfo',
      mockPath: '/framework/report/updateFormInfo',
      desc: '报表管理-报表列表-更新排序'
    },
    {
      name: 'deleteFormInfo',
      method: 'POST',
      path: '/framework/report/deleteFormInfo',
      mockPath: '/framework/report/deleteFormInfo',
      desc: '报表管理-报表列表-删除数据'
    },
    {
      name: 'editList',
      method: 'POST',
      path: '/framework/report/editList',
      mockPath: '/framework/report/editList',
      desc: '表格组件-获取所有配置为编辑表格的数据'
    },
    {
      name: 'getUserFilterScheme',
      method: 'POST',
      path: '/framework/user/setting/getUserFilterScheme',
      mockPath: '/framework/user/setting/getUserFilterScheme',
      desc: '报表管理-报表列表-行单击事件'
    },
    {
      name: 'sharing',
      method: 'POST',
      path: '/framework/user/setting/sharing',
      mockPath: '/framework/user/setting/sharing',
      desc: '报表管理-报表列表-分享'
    },
    {
      name: 'getBpReportByCode',
      method: 'POST',
      path: '/framework/user/setting/getBpReportByCode',
      mockPath: '/framework/user/setting/getBpReportByCode',
      desc: '报表管理-报表列表-获取版本'
    },
    {
      name: 'settingDefault',
      method: 'POST',
      path: '/framework/user/setting/settingDefault',
      mockPath: '/framework/user/setting/settingDefault',
      desc: '报表管理-报表列表-获取版本'
    },
    {
      name: 'reportCodeUniqueCheck',
      method: 'POST',
      path: '/framework/report/reportCodeUniqueCheck',
      mockPath: '/framework/report/reportCodeUniqueCheck',
      desc: '报表管理-报表列表-code校验'
    },
    {
      name: 'selectionCodeUniqueCheck',
      method: 'POST',
      path: '/framework/selection/selectionCodeUniqueCheck',
      mockPath: '/framework/selection/selectionCodeUniqueCheck',
      desc: '选项code校验'
    },
    {
      name: 'getDesVersionList',
      method: 'POST',
      path: '/framework/desForm/getDesVersionList',
      mockPath: '/framework/desForm/getDesVersionList',
      desc: '表单版本列表'
    },
    {
      name: 'setDesFormByVersion',
      method: 'POST',
      path: '/framework/desForm/setDesFormByVersion',
      mockPath: '/framework/desForm/setDesFormByVersion',
      desc: '设置版本'
    },
    {
      name: 'removeDesFormById',
      method: 'POST',
      path: '/framework/desForm/removeDesFormById',
      mockPath: '/framework/desForm/removeDesFormById',
      desc: '删除版本'
    },
    {
      name: 'getFormVersionByCode',
      method: 'POST',
      path: '/framework/desForm/getFormVersionByCode',
      mockPath: '/framework/desForm/getFormVersionByCode',
      desc: '获取版本'
    }
  ]
}

export const ComponentManagerApi = {
  selection: [
    {
      name: 'list',
      method: 'POST',
      path: '/framework/selection/list',
      mockPath: '/framework/selection/list',
      desc: '组件管理-选项-1.6.1选项列表'
    },
    {
      name: 'save',
      method: 'POST',
      path: '/framework/selection/save',
      mockPath: '/framework/selection/save',
      desc: '组件管理-选项-1.6.0选项保存'
    },
    {
      name: 'getAllDictionaryType',
      method: 'POST',
      path: '/framework/selection/getAllDictionaryType',
      mockPath: '/framework/selection/getAllDictionaryType',
      desc: '组件管理-选项-1.6.5获取所有数据字典类型'
    },
    {
      name: 'getAllSqlview',
      method: 'POST',
      path: '/framework/selection/getAllSqlview',
      mockPath: '/framework/selection/getAllSqlview',
      desc: '组件管理-选项-1.6.6获取所有sql视图下拉框'
    },
    {
      name: 'getColumnsByReportId',
      method: 'POST',
      path: '/framework/selection/getColumnsByReportId',
      mockPath: '/framework/selection/getColumnsByReportId',
      desc: '组件管理-选项-1.6.13 根据表格ID获取表格SQL视图所有列'
    },
    {
      name: 'getSqlViewAllColumn',
      method: 'POST',
      path: '/framework/selection/getSqlViewAllColumn',
      mockPath: '/framework/selection/getSqlViewAllColumn',
      desc: '组件管理-选项-1.6.9根据选项ID获取数据视图所有的列'
    },
    {
      name: 'view',
      method: 'POST',
      path: '/framework/selection/view',
      mockPath: '/framework/selection/view',
      desc: '组件管理-选项-1.6.2选项详情'
    },
    {
      name: 'remove',
      method: 'POST',
      path: '/framework/selection/remove',
      mockPath: '/framework/selection/remove',
      desc: '组件管理-选项-1.6.3选项删除'
    },
    {
      name: 'getAllReport',
      method: 'POST',
      path: '/framework/selection/getAllReport',
      mockPath: '/framework/selection/getAllReport',
      desc: '组件管理-选项-1.6.11获取所有报表下拉框'
    },
    {
      name: 'preview',
      method: 'POST',
      path: '/framework/selection/preview',
      mockPath: '/framework/selection/preview',
      desc: '组件管理-选项-1.6.4选项预览'
    },
    {
      name: 'saveCopy',
      method: 'POST',
      path: '/framework/selection/saveCopy',
      mockPath: '/framework/selection/saveCopy',
      desc: '组件管理-选项-复制'
    }
  ],
  basicDataRelation: [
    {
      name: 'list',
      method: 'POST',
      path: '/framework/basicDataRelation/list',
      mockPath: '/framework/basicDataRelation/list',
      desc: '功能设置-新增数据设置-基础数据设置关联-获取列表'
    },
    {
      name: 'getFieldClassify',
      method: 'POST',
      path: '/framework/basicDataRelation/getFieldClassify',
      mockPath: '/framework/basicDataRelation/getFieldClassify',
      desc: '功能设置-新增数据设置-基础数据设置关联-领域列表'
    },
    {
      name: 'relatedFieldClassify',
      method: 'POST',
      path: '/framework/basicDataRelation/relatedFieldClassify',
      mockPath: '/framework/basicDataRelation/relatedFieldClassify',
      desc: '功能设置-新增数据设置-基础数据设置关联-关联领域'
    },
    {
      name: 'relatedProjectClassify',
      method: 'POST',
      path: '/framework/basicDataRelation/relatedProjectClassify',
      mockPath: '/framework/basicDataRelation/relatedProjectClassify',
      desc: '功能设置-新增数据设置-基础数据设置关联-关联项目类型'
    },
    {
      name: 'cancelRelation',
      method: 'POST',
      path: '/framework/basicDataRelation/cancelRelation',
      mockPath: '/framework/basicDataRelation/cancelRelation',
      desc: '功能设置-新增数据设置-基础数据设置关联-取消关联'
    }
  ]
}

export const kanbanApi = {
  kanbanComponent: [
    {
      name: 'list',
      method: 'POST',
      path: '/framework/bp-common-component-library/get',
      mockPath: '/framework/bp-common-component-library/get',
      desc: '看板组件管理-列表获取'
    },
    {
      name: 'delete',
      method: 'POST',
      path: '/framework/bp-common-component-library/deleteApp',
      mockPath: '/framework/bp-common-component-library/deleteApp',
      desc: '看板组件管理-删除'
    },
    {
      name: 'save',
      method: 'POST',
      path: '/framework/bp-common-component-library/saveOrUpdateApp',
      mockPath: '/framework/bp-common-component-library/saveOrUpdateApp',
      desc: '看板组件管理-保存组件'
    },
    {
      name: 'dataViewList',
      method: 'POST',
      path: '/framework/bp-common-component-library/getDataviewList',
      mockPath: '/framework/bp-common-component-library/getDataviewList',
      desc: '看板组件管理-获取数据视图列表'
    },
    // {
    //   name: 'getViewData',
    //   method: 'POST',
    //   path: '/product/pm/planOverview/applyDataview',
    //   mockPath: '/product/pm/planOverview/applyDataview',
    //   desc: '看板组件管理-获取数据视图数据'
    // },
    {
      name: 'getViewData',
      method: 'POST',
      path: '/framework/bp-common-component-library/applyDataview',
      mockPath: '/framework/bp-common-component-library/applyDataview',
      desc: '看板组件管理-获取数据视图数据'
    },
    {
      name: 'getSqlParams',
      method: 'POST',
      path: '/framework/bp-common-component-library/getSqlParams',
      mockPath: '/framework/bp-common-component-library/getSqlParams',
      desc: '看板组件管理-获取数据视图可使用的参数'
    },
    {
      name: 'getDic',
      method: 'POST',
      path: '/framework/bp-common-component-library/getDic',
      mockPath: '/framework/bp-common-component-library/getDic',
      desc: '看板组件管理-获取表单数据'
    },
    {
      name: 'getNoPage',
      method: 'POST',
      path: '/framework/bp-common-component-library/getNoPage',
      mockPath: '/framework/bp-common-component-library/getNoPage',
      desc: '角色管理-设置应用界面-获取启用的图标'
    },
    {
      name: 'getRoleAppInfo',
      method: 'POST',
      path: '/framework/bp-common-component-library/getRoleAppInfo',
      mockPath: '/framework/bp-common-component-library/getRoleAppInfo',
      desc: '主业看版-获取当前角色已授权的图标'
    },
    {
      name: 'saveAppByCopy',
      method: 'POST',
      path: '/framework/bp-common-component-library/saveAppByCopy',
      mockPath: '/framework/bp-common-component-library/saveAppByCopy',
      desc: '图表复制'
    }
  ],
  kanbanView: [
    {
      name: 'save',
      method: 'POST',
      path: '/framework/personal/homepage/saveHomePage',
      mockPath: '/framework/personal/homepage/saveHomePage',
      desc: '看板设计管理-保存看板'
    },
    {
      name: 'delete',
      method: 'POST',
      path: '/framework/personal/homepage/delete',
      mockPath: '/framework/personal/homepage/delete',
      desc: '看板设计管理-删除'
    },
    {
      name: 'list',
      method: 'POST',
      path: '/framework/personal/homepage/getAll',
      mockPath: '/framework/personal/homepage/getAll',
      desc: '看板设计管理-列表获取'
    },
    {
      name: 'info',
      method: 'GET',
      path: '/framework/personal/homepage/get',
      mockPath: '/framework/personal/homepage/get',
      desc: '看板设计管理-看板详情获取'
    },
    {
      name: 'checkCode',
      method: 'POST',
      path: '/framework/personal/homepage/checkCode',
      mockPath: '/framework/personal/homepage/checkCode',
      desc: '看板设计管理-看板code校验'
    },
    {
      name: 'getAllTwo',
      method: 'POST',
      path: '/product/system/homepage/getAll',
      mockPath: '/product/system/homepage/getAll',
      desc: '登陆首页看版获取'
    },
    {
      name: 'getParams',
      method: 'POST',
      path: '/product/system/homepage/getParams',
      mockPath: '/product/system/homepage/getParams',
      desc: '登陆首页看版获取-二级看板参数'
    },
    {
      name: 'saveHomeBoard',
      method: 'POST',
      path: '/framework/personal/homeboard/saveHomeBoard',
      mockPath: '/framework/personal/homeboard/saveHomeBoard',
      desc: '主业看版-锁定时的保存接口'
    },
    {
      name: 'getHomeBoard',
      method: 'GET',
      path: '/framework/personal/homeboard/get',
      mockPath: '/framework/personal/homeboard/get',
      desc: '主业看版-获取当前登录人设置的主页看版'
    },
    {
      name: 'saveCopy',
      method: 'POST',
      path: '/framework/personal/homepage/saveCopy',
      mockPath: '/framework/personal/homepage/saveCopy',
      desc: '看板复制'
    },
    {
      name: 'getAllNoPage',
      method: 'POST',
      path: '/framework/personal/homepage/getAllNoPage',
      mockPath: '/framework/personal/homepage/getAllNoPage',
      desc: '获取所有终端用户可用'
    },
    {
      name: 'getByHomePageId',
      method: 'POST',
      path: '/bp_role_board/getByHomePageId',
      mockPath: '/bp_role_board/getByHomePageId',
      desc: '主页获取角色默认看板'
    },
    {
      name: 'getDefaultBoard',
      method: 'POST',
      path: '/bp_role_board/getDefaultBoard',
      mockPath: '/bp_role_board/getDefaultBoard',
      desc: '主页获取角色默认看板'
    }
  ],
  desLayout: [
    {
      name: 'save',
      method: 'POST',
      path: '/framework/desLayout/save',
      mockPath: '/framework/desLayout/save',
      desc: '组建管理->布局->保存接口'
    },
    {
      name: 'list',
      method: 'POST',
      path: '/framework/desLayout/list',
      mockPath: '/framework/desLayout/list',
      desc: '组建管理->布局->列表接口'
    },
    {
      name: 'repeatLayoutCode',
      method: 'POST',
      path: '/framework/desLayout/repeatLayoutCode',
      mockPath: '/framework/desLayout/repeatLayoutCode',
      desc: '组建管理->布局->布局code校验'
    },
    {
      name: 'remove',
      method: 'POST',
      path: '/framework/desLayout/remove',
      mockPath: '/framework/desLayout/remove',
      desc: '组建管理->布局->=删除'
    },
    {
      name: 'view',
      method: 'POST',
      path: '/framework/desLayout/view',
      mockPath: '/framework/desLayout/view',
      desc: '组建管理->布局->详情'
    },
    {
      name: 'enabled',
      method: 'POST',
      path: '/framework/desLayout/enabled',
      mockPath: '/framework/desLayout/enabled',
      desc: '组建管理->布局->启用'
    },
    {
      name: 'disabled',
      method: 'POST',
      path: '/framework/desLayout/disabled',
      mockPath: '/framework/desLayout/disabled',
      desc: '组建管理->布局->禁用'
    },
    {
      name: 'rendererList',
      method: 'POST',
      path: '/framework/desLayout/rendererList',
      mockPath: '/framework/desLayout/rendererList',
      desc: '组建管理->布局->加载渲染器'
    },
    {
      name: 'execute',
      method: 'POST',
      path: '/framework/desLayout/execute',
      mockPath: '/framework/desLayout/execute',
      desc: '组建管理->布局->加载渲染器'
    },
    {
      name: 'getLayoutJson',
      method: 'POST',
      path: '/framework/desLayout/getLayoutJson',
      mockPath: '/framework/desLayout/getLayoutJson',
      desc: '组建管理->布局->渲染器获取json数据'
    },
    {
      name: 'saveCopy',
      method: 'POST',
      path: '/framework/desLayout/saveCopy',
      mockPath: '/framework/desLayout/saveCopy',
      desc: '组建管理->布局->复制'
    }
  ],
  logApiConfig: [
    {
      name: 'list',
      method: 'POST',
      path: '/framework/bp-log-api-config/list',
      mockPath: '/framework/bp-log-api-config/list',
      desc: '功能设置->日志配置->列表接口'
    },
    {
      name: 'save',
      method: 'POST',
      path: '/framework/bp-log-api-config/save',
      mockPath: '/framework/bp-log-api-config/save',
      desc: '功能设置->日志配置->保存'
    },
    {
      name: 'delete',
      method: 'POST',
      path: '/framework/bp-log-api-config/delete',
      mockPath: '/framework/bp-log-api-config/delete',
      desc: '功能设置->日志配置->删除'
    }
  ]
}
