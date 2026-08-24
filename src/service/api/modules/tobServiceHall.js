const createModule = (namespace, path, desc) => ({
  [namespace]: [
    { name: 'list', method: 'GET', path: `${path}/list`, mockPath: `${path}/list`, desc: `${desc}分页查询` },
    { name: 'add', method: 'POST', path: `${path}/add`, mockPath: `${path}/add`, desc: `新增${desc}` },
    { name: 'edit', method: 'POST', path: `${path}/edit`, mockPath: `${path}/edit`, desc: `编辑${desc}` },
    { name: 'delete', method: 'POST', path: `${path}/delete`, mockPath: `${path}/delete`, desc: `删除${desc}` },
    { name: 'queryById', method: 'GET', path: `${path}/queryById`, mockPath: `${path}/queryById`, desc: `${desc}详情` }
  ]
})

export const tobServiceHallApi = Object.assign(
  {},
  createModule('feedbackComplaint', '/czwj/tob/feedbackComplaint', '建议投诉'),
  createModule('tobDataReport', '/czwj/tob/dataReport', '数据上报'),
  createModule('tobMediaPromotion', '/czwj/tob/mediaPromotion', '媒体宣传'),
  createModule('tobQualificationCert', '/czwj/tob/qualificationCert', '资质认定'),
  createModule('tobResourceConnection', '/czwj/tob/resourceConnection', '资源对接'),
  createModule('tobServiceRequest', '/czwj/tob/serviceRequest', '服务需求')
)
