// 报修 API 模块：声明报修、附件和处理人员相关接口。
import createModule from './_shared/createCrudModule'

const reportRepairModule = createModule('reportRepair', '/czwj/jt/reportRepair', '报修申请')
reportRepairModule.reportRepair.push({
  name: 'searchStatus',
  method: 'GET',
  path: '/czwj/jt/reportRepair/searchStatus',
  mockPath: '/czwj/jt/reportRepair/searchStatus',
  desc: '待处理报修申请查询'
})

export const tobServiceHallApi = reportRepairModule

export const attachmentApi = {
  attachment: [
    { name: 'upload', method: 'POST', path: '/attachment/upload', mockPath: '/attachment/upload', desc: '附件上传' },
    { name: 'download', method: 'POST', path: '/attachment/download', mockPath: '/attachment/download', desc: '附件下载' }
  ]
}

export const personnelApi = {
  personnel: [{ name: 'select', method: 'GET', path: '/jt/personnel/select', mockPath: '/jt/personnel/select', desc: '处理人员下拉查询' }]
}
