const createModule = (namespace, path, desc) => ({
  [namespace]: [
    { name: 'list', method: 'GET', path: `${path}/list`, mockPath: `${path}/list`, desc: `${desc}分页查询` },
    { name: 'add', method: 'POST', path: `${path}/add`, mockPath: `${path}/add`, desc: `新增${desc}` },
    { name: 'edit', method: 'POST', path: `${path}/edit`, mockPath: `${path}/edit`, desc: `编辑${desc}` },
    { name: 'delete', method: 'POST', path: `${path}/delete`, mockPath: `${path}/delete`, desc: `删除${desc}` },
    { name: 'queryById', method: 'GET', path: `${path}/queryById`, mockPath: `${path}/queryById`, desc: `${desc}详情` }
  ]
})

export const tobPublicServicesApi = Object.assign(
  {},
  createModule('tobEventActivity', '/czwj/tob/eventActivity', '园区活动'),
  createModule('tobPublicNotice', '/czwj/tob/publicNotice', '通知公告'),
  createModule('tobOnlineConsult', '/czwj/tob/onlineConsult', '在线咨询'),
  createModule('tobEnterprisePolicy', '/czwj/tob/enterprisePolicy', '惠企政策'),
  createModule('tobResourceDownload', '/czwj/tob/resourceDownload', '资料下载'),
  createModule('tobSafetyArticle', '/czwj/tob/safetyArticle', '安全专栏'),
  createModule('tobParkNews', '/czwj/tob/parkNews', '园区动态'),
  createModule('tobCompanyNews', '/czwj/tob/companyNews', '企业动态')
)
