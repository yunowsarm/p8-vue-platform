// 公共服务操作策略：定义查看者、编辑者和咨询处理人的页面能力。
const createPolicy = (actions) => Object.freeze({ actions: Object.freeze(actions) })

export const PUBLIC_SERVICE_POLICIES = Object.freeze({
  viewer: createPolicy({ create: false, edit: false, delete: false, changeStatus: false }),
  editor: createPolicy({ create: true, edit: true, delete: true, changeStatus: false }),
  consultationUser: createPolicy({ create: true, edit: true, delete: true, changeStatus: false }),
  consultationAdmin: createPolicy({ create: false, edit: true, delete: true, changeStatus: false })
})
