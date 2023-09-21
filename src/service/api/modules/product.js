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
  PlatGantt: [
    {
      name: 'getPlanGanttData',
      method: 'POST',
      path: '/product/pm/plan/loadPlanGanttData',
      mockPath: '/product/pm/plan/loadPlanGanttData',
      desc: '计划编制数据查询'
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
    },
  ],
  // 我的任务
  TaskManager: [
    {
      name: 'projectTree',
      method: 'POST',
      path: '/product/my/work/task/projectClassifyTree',
      mockPath: '/product/my/work/task/projectClassifyTree',
      desc: '我的任务-项目类型树'
    },
    {
      name: 'normalTaskList',
      method: 'POST',
      path: '/product/my/work/task/normalTaskList',
      mockPath: '/product/my/work/task/normalTaskList',
      desc: '我的任务-已发布列表'
    },
    {
      name: 'overallTaskList',
      method: 'POST',
      path: '/product/my/work/task/overallTaskList',
      mockPath: '/product/my/work/task/overallTaskList',
      desc: '我的任务-统筹列表'
    },
    {
      name: 'taskDecomposition',
      method: 'POST',
      path: '/product/my/work/task/taskDecomposition',
      mockPath: '/product/my/work/task/taskDecomposition',
      desc: '我的任务-任务层级钻取'
    },
    {
      name: 'preAndPostTaskViewing',
      method: 'POST',
      path: '/product/my/work/task/preAndPostTaskViewing',
      mockPath: '/product/my/work/task/preAndPostTaskViewing',
      desc: '我的任务-前后置任务查看'
    }
  ]
}
