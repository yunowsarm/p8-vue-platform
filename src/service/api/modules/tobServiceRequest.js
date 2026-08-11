export const tobServiceRequestApi = {
  tobServiceRequest: [
    { name: 'list', method: 'GET', path: '/czwj/tob/serviceRequest/list', mockPath: '/czwj/tob/serviceRequest/list', desc: '服务需求分页查询' },
    { name: 'add', method: 'POST', path: '/czwj/tob/serviceRequest/add', mockPath: '/czwj/tob/serviceRequest/add', desc: '新增服务需求' },
    { name: 'edit', method: 'POST', path: '/czwj/tob/serviceRequest/edit', mockPath: '/czwj/tob/serviceRequest/edit', desc: '编辑服务需求' },
    { name: 'delete', method: 'POST', path: '/czwj/tob/serviceRequest/delete', mockPath: '/czwj/tob/serviceRequest/delete', desc: '删除服务需求' },
    { name: 'queryById', method: 'GET', path: '/czwj/tob/serviceRequest/queryById', mockPath: '/czwj/tob/serviceRequest/queryById', desc: '服务需求详情' }
  ]
}
