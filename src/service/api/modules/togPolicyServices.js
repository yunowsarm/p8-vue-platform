/**
 * 政策服务接口。
 *
 * 统一保持与政务服务模块一致的 CRUD 约定，页面通过命名空间调用，
 * 便于后台菜单按组件路径配置时独立维护各项业务。
 */
const createCrudApi = (namespace, baseUrl, desc) => ({
  [namespace]: [
    { name: 'list', path: `${baseUrl}/list`, method: 'GET', mockPath: `${baseUrl}/list`, desc: `${desc}分页查询` },
    { name: 'add', path: `${baseUrl}/add`, method: 'POST', mockPath: `${baseUrl}/add`, desc: `新增${desc}` },
    { name: 'edit', path: `${baseUrl}/edit`, method: 'POST', mockPath: `${baseUrl}/edit`, desc: `编辑${desc}` },
    { name: 'delete', path: `${baseUrl}/delete`, method: 'POST', mockPath: `${baseUrl}/delete`, desc: `删除${desc}` },
    { name: 'queryById', path: `${baseUrl}/queryById`, method: 'GET', mockPath: `${baseUrl}/queryById`, desc: `${desc}详情` }
  ]
})

export const togPolicyServicesApi = Object.assign(
  {},
  createCrudApi('togProjectApplication', '/czwj/tog/projectApplication', '项目申报'),
  createCrudApi('togEnterprisePolicy', '/czwj/tog/enterprisePolicy', '政策说明'),
  createCrudApi('togPolicyInterpret', '/czwj/tog/policyInterpret', '图文解读'),
  createCrudApi('togPolicyPush', '/czwj/tog/policyPush', '政策推送'),
  createCrudApi('togPolicySubscribe', '/czwj/tog/policySubscribe', '政策订阅'),
  createCrudApi('togPolicyMatch', '/czwj/tog/policyMatch', '智能匹配')
)
