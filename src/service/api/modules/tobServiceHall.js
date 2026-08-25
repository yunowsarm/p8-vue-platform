const createModule = (namespace, path, desc) => ({
  [namespace]: [
    { name: 'list', method: 'GET', path: `${path}/list`, mockPath: `${path}/list`, desc: `${desc}分页查询` },
    { name: 'add', method: 'POST', path: `${path}/add`, mockPath: `${path}/add`, desc: `新增${desc}` },
    { name: 'edit', method: 'POST', path: `${path}/edit`, mockPath: `${path}/edit`, desc: `编辑${desc}` },
    { name: 'delete', method: 'POST', path: `${path}/delete`, mockPath: `${path}/delete`, desc: `删除${desc}` },
    { name: 'queryById', method: 'GET', path: `${path}/queryById`, mockPath: `${path}/queryById`, desc: `${desc}详情` }
  ]
})

const createLeaseApplicationModule = () => ({
  tobLeaseApplication: [
    { name: 'list', method: 'GET', path: '/czwj/tob/leaseApplication/list', mockPath: '/czwj/tob/leaseApplication/list', desc: '租赁申请分页查询' },
    { name: 'pendingList', method: 'GET', path: '/czwj/tob/leaseApplication/pendingList', mockPath: '/czwj/tob/leaseApplication/pendingList', desc: '首页待处理租赁申请' },
    { name: 'add', method: 'POST', path: '/czwj/tob/leaseApplication/add', mockPath: '/czwj/tob/leaseApplication/add', desc: '新增租赁申请' },
    { name: 'edit', method: 'POST', path: '/czwj/tob/leaseApplication/edit', mockPath: '/czwj/tob/leaseApplication/edit', desc: '编辑租赁申请及处理状态' },
    { name: 'queryById', method: 'GET', path: '/czwj/tob/leaseApplication/queryById', mockPath: '/czwj/tob/leaseApplication/queryById', desc: '租赁申请详情' },
    { name: 'delete', method: 'POST', path: '/czwj/tob/leaseApplication/delete', mockPath: '/czwj/tob/leaseApplication/delete', desc: '撤销租赁申请' }
  ]
})

export const tobServiceHallApi = Object.assign(
  {},
  createModule('feedbackComplaint', '/czwj/tob/feedbackComplaint', '建议投诉'),
  createModule('tobDataReport', '/czwj/tob/dataReport', '数据上报'),
  createModule('tobMediaPromotion', '/czwj/tob/mediaPromotion', '媒体宣传'),
  createModule('tobQualificationCert', '/czwj/tob/qualificationCert', '资质认定'),
  createModule('tobResourceConnection', '/czwj/tob/resourceConnection', '资源对接'),
  createModule('tobServiceRequest', '/czwj/tob/serviceRequest', '服务需求'),
  createLeaseApplicationModule()
)
