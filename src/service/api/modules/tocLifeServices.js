// ToC 生活服务 API 模块：声明公告、问卷、班车、门票和车辆服务接口路径。
import createModule from './_shared/createCrudModule'

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
