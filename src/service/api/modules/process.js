/**
 * 流程审批相关接口
 */

export const processApi = {
  process: [
    {
      name: 'getByName',
      method: 'POST',
      path: '/jt/role/getByName',
      mockPath: '/jt/role/getByName',
      desc: '根据部门名称获取部门领导候选人'
    },
    {
      name: 'getByStoreName',
      method: 'POST',
      path: '/jt/role/getByStoreName',
      mockPath: '/jt/role/getByStoreName',
      desc: '根据仓库ID获取资产管理员候选人'
    }
  ]
}
