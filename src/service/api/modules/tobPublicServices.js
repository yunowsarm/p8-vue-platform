// ToB 公共服务 API 模块：声明活动、公告、咨询、资料等接口路径。
import createModule from './_shared/createCrudModule'

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
