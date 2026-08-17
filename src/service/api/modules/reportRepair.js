const createModule = (namespace, path, desc) => ({
  [namespace]: [
    { name: 'list', method: 'GET', path: `${path}/list`, mockPath: `${path}/list`, desc: `${desc}分页查询` },
    { name: 'add', method: 'POST', path: `${path}/add`, mockPath: `${path}/add`, desc: `新增${desc}` },
    { name: 'edit', method: 'POST', path: `${path}/edit`, mockPath: `${path}/edit`, desc: `编辑${desc}` },
    { name: 'delete', method: 'POST', path: `${path}/delete`, mockPath: `${path}/delete`, desc: `删除${desc}` },
    { name: 'queryById', method: 'GET', path: `${path}/queryById`, mockPath: `${path}/queryById`, desc: `${desc}详情` },
    { name: 'searchStatus', method: 'GET', path: `${path}/searchStatus`, mockPath: `${path}/searchStatus`, desc: `待处理${desc}查询` }
  ]
})

export const tobServiceHallApi = Object.assign({}, createModule('reportRepair', '/czwj/jt/reportRepair', '报修申请'))

export const attachmentApi = {
  attachment: [
    { name: 'upload', method: 'POST', path: '/attachment/upload', mockPath: '/attachment/upload', desc: '附件上传' },
    { name: 'download', method: 'POST', path: '/attachment/download', mockPath: '/attachment/download', desc: '附件下载' }
  ]
}

export const personnelApi = {
  personnel: [{ name: 'select', method: 'GET', path: '/jt/personnel/select', mockPath: '/jt/personnel/select', desc: '处理人员下拉查询' }]
}
