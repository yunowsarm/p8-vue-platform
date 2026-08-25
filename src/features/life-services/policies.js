// 生活服务操作策略：定义用户端、管理端和只读端可以执行的操作。
const createPolicy = (actions) => Object.freeze({ actions: Object.freeze(actions) })

export const LIFE_SERVICE_POLICIES = Object.freeze({
  user: createPolicy({ create: true, edit: true, delete: true }),
  admin: createPolicy({ create: true, edit: true, delete: true }),
  readonly: createPolicy({ create: false, edit: false, delete: false })
})
