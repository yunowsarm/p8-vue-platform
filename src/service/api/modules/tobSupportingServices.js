const createModule = (namespace, path, desc) => ({
  [namespace]: [
    { name: 'list', method: 'GET', path: `${path}/list`, mockPath: `${path}/list`, desc: `${desc}分页查询` },
    { name: 'add', method: 'POST', path: `${path}/add`, mockPath: `${path}/add`, desc: `新增${desc}` },
    { name: 'edit', method: 'POST', path: `${path}/edit`, mockPath: `${path}/edit`, desc: `编辑${desc}` },
    { name: 'delete', method: 'POST', path: `${path}/delete`, mockPath: `${path}/delete`, desc: `删除${desc}` },
    { name: 'queryById', method: 'GET', path: `${path}/queryById`, mockPath: `${path}/queryById`, desc: `${desc}详情` }
  ]
})

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
