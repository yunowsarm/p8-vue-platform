// 服务大厅操作策略：集中定义用户端、管理端和只读端的操作权限。
const USER_POLICY = Object.freeze({
  actions: Object.freeze({ create: true, edit: true, delete: true, changeStatus: false })
})

const ADMIN_POLICY = Object.freeze({
  actions: Object.freeze({ create: false, edit: false, delete: true, changeStatus: true })
})

const READONLY_POLICY = Object.freeze({
  actions: Object.freeze({ create: false, edit: false, delete: false, changeStatus: false })
})

const ADMIN_OVERRIDES = Object.freeze({
  complaintSuggestion: Object.freeze({ actions: Object.freeze({ edit: true, changeStatus: false }) })
})

const mergePolicy = (base, override) =>
  Object.assign({}, base, override || {}, {
    actions: Object.assign({}, base.actions, (override && override.actions) || {})
  })

export function getServiceHallPolicy(feature, mode = 'user') {
  if (mode === 'readonly') return READONLY_POLICY
  if (mode === 'admin') return mergePolicy(ADMIN_POLICY, ADMIN_OVERRIDES[feature])
  return USER_POLICY
}

export function mergeActionPolicy(policy, override) {
  return mergePolicy(policy || READONLY_POLICY, override)
}
