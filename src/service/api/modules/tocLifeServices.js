const createModule = (namespace, path, desc) => ({
  [namespace]: [
    { name: 'list', method: 'GET', path: `${path}/list`, mockPath: `${path}/list`, desc: `${desc}分页查询` },
    { name: 'add', method: 'POST', path: `${path}/add`, mockPath: `${path}/add`, desc: `新增${desc}` },
    { name: 'edit', method: 'POST', path: `${path}/edit`, mockPath: `${path}/edit`, desc: `编辑${desc}` },
    { name: 'delete', method: 'POST', path: `${path}/delete`, mockPath: `${path}/delete`, desc: `删除${desc}` },
    { name: 'queryById', method: 'GET', path: `${path}/queryById`, mockPath: `${path}/queryById`, desc: `${desc}详情` }
  ]
})

export const tocLifeServicesApi = Object.assign(
  {},
  createModule('tocPublicNotice', '/czwj/tob/publicNotice', '通知公告'),
  createModule('tocUserSurvey', '/czwj/toc/userSurvey', '调查问卷'),
  createModule('tocParkNews', '/czwj/tob/parkNews', '园区动态'),
  createModule('tocEventActivity', '/czwj/tob/eventActivity', '园区活动'),
  createModule('tocShuttleBus', '/czwj/toc/shuttleBus', '园区班车'),
  createModule('tocTravelTicket', '/czwj/toc/travelTicket', '旅行门票'),
  createModule('tocCarRental', '/czwj/toc/carRental', '租车服务'),
  createModule('tocCarRentalInfo', '/czwj/toc/carRentalInfo', '租车申请'),
  createModule('tocCarInsurance', '/czwj/toc/carInsurance', '汽车保险'),
  createModule('tocCarInsuranceInfo', '/czwj/toc/carInsuranceInfo', '保险投保记录'),
  createModule('tocTalentService', '/czwj/toc/talentService', '人才服务')
)
