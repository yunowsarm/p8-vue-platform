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
  ]
}
