// 消防养护接口：路径及参数沿用后端《接口文档-养护管理》。
import createCrudModule from './_shared/createCrudModule'

export const maintenanceApi = Object.assign(
  {},
  createCrudModule('maintenanceDeviceType', '/jt/maintenance/deviceType', '养护设备类型'),
  createCrudModule('maintenanceDevice', '/jt/maintenance/device', '养护设备'),
  createCrudModule('maintenancePlan', '/jt/maintenance/plan', '养护计划'),
  createCrudModule('maintenanceRecord', '/jt/maintenance/record', '养护记录')
)
