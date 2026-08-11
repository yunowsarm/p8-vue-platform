export const tobDataReportApi = {
  tobDataReport: [
    { name: 'list', method: 'GET', path: '/czwj/tob/dataReport/list', mockPath: '/czwj/tob/dataReport/list', desc: '数据上报分页查询' },
    { name: 'add', method: 'POST', path: '/czwj/tob/dataReport/add', mockPath: '/czwj/tob/dataReport/add', desc: '新增数据上报' },
    { name: 'edit', method: 'POST', path: '/czwj/tob/dataReport/edit', mockPath: '/czwj/tob/dataReport/edit', desc: '编辑数据上报' },
    { name: 'delete', method: 'POST', path: '/czwj/tob/dataReport/delete', mockPath: '/czwj/tob/dataReport/delete', desc: '删除数据上报' },
    { name: 'queryById', method: 'GET', path: '/czwj/tob/dataReport/queryById', mockPath: '/czwj/tob/dataReport/queryById', desc: '数据上报详情' }
  ]
}
