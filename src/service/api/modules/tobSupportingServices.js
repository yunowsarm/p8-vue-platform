// ToB 配套服务 API 模块：声明商机、机构、导师、预订和租赁接口路径。
import createModule from './_shared/createCrudModule'

export const tobSupportingServicesApi = Object.assign(
  {},
  createModule('tobBusinessOpportunity', '/czwj/tob/businessOpportunity', '商机资源共享'),
  createModule('tobCompanyDemand', '/czwj/tob/companyDemand', '企业需求'),
  createModule('tobIndustryAssociation', '/czwj/tob/industryAssociation', '行业协会'),
  createModule('tobStartupMentor', '/czwj/tob/startupMentor', '创业导师'),
  createModule('tobServiceOrg', '/czwj/tob/serviceOrg', '服务机构'),
  createModule('tobMeetingRoomBook', '/czwj/tob/meetingRoomBook', '会议室预定'),
  createModule('tobFacilityRental', '/czwj/tob/facilityRental', '设施设备租赁')
)
