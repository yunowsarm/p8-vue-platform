// 意向咨询（接待登记）统一 CRUD 接口。
import createCrudModule from './_shared/createCrudModule'

const receptionApi = createCrudModule('reception', '/jt/reception', '意向咨询')

receptionApi.reception.push({
  name: 'addRecord',
  method: 'POST',
  path: '/jt/reception/addRecord',
  mockPath: '/jt/reception/addRecord',
  desc: '新增线索跟进记录'
})

receptionApi.reception.push({
  name: 'queryHistoryByParentId',
  method: 'GET',
  path: '/jt/reception/queryHistoryByParentId',
  mockPath: '/jt/reception/queryHistoryByParentId',
  desc: '查询线索分配记录'
})

receptionApi.reception.push({
  name: 'queryRecordById',
  method: 'GET',
  path: '/jt/reception/queryRecordById',
  mockPath: '/jt/reception/queryRecordById',
  desc: '查询线索跟进记录详情'
})

receptionApi.reception.push({
  name: 'getUserList',
  method: 'GET',
  path: '/jt/reception/getUserList',
  mockPath: '/jt/reception/getUserList',
  desc: '意向咨询可分配人员列表'
})

receptionApi.reception.push({
  name: 'getUsername',
  method: 'GET',
  path: '/jt/reception/getUsername',
  mockPath: '/jt/reception/getUsername',
  desc: '查询意向咨询推荐人姓名'
})

receptionApi.reception.push({
  name: 'allocation',
  method: 'POST',
  path: '/jt/reception/allocation',
  mockPath: '/jt/reception/allocation',
  desc: '意向咨询分配人员'
})

export const intentionInquiryApi = receptionApi
