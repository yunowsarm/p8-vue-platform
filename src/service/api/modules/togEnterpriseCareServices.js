// ToG 企业关怀 API 模块：声明工会和党群服务接口路径。
import createModule from './_shared/createCrudModule'

export const togEnterpriseCareServicesApi = Object.assign(
  {},
  createModule('togUnionService', '/czwj/tog/unionService', '工会服务'),
  createModule('togPartyService', '/czwj/tog/partyService', '党群服务')
)
