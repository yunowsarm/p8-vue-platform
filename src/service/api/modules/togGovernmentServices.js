// ToG 政务服务 API 模块：声明行政审批和数据上报接口路径。
import createModule from './_shared/createCrudModule'

export const togGovernmentServicesApi = Object.assign(
  {},
  createModule('togGovApproval', '/czwj/tog/govApproval', '行政审批服务'),
  createModule('togGovDataReport', '/czwj/tog/govDataReport', '数据上报统计')
)
