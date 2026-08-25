/**
 * 生成平台统一的 CRUD 接口描述。
 *
 * 这里只负责减少接口描述的重复代码；业务命名空间和接口根路径仍由
 * src/service/api/modules 下的各业务模块声明。
 */
export default function createCrudModule(namespace, path, description) {
  return {
    [namespace]: [
      { name: 'list', method: 'GET', path: `${path}/list`, mockPath: `${path}/list`, desc: `${description}分页查询` },
      { name: 'add', method: 'POST', path: `${path}/add`, mockPath: `${path}/add`, desc: `新增${description}` },
      { name: 'edit', method: 'POST', path: `${path}/edit`, mockPath: `${path}/edit`, desc: `编辑${description}` },
      { name: 'delete', method: 'POST', path: `${path}/delete`, mockPath: `${path}/delete`, desc: `删除${description}` },
      { name: 'queryById', method: 'GET', path: `${path}/queryById`, mockPath: `${path}/queryById`, desc: `${description}详情` }
    ]
  }
}
