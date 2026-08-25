// 租赁申请操作策略：根据终端模式和记录状态控制新增、编辑、删除及处理操作。
const statusText = (status) => {
  const map = { 0: '待处理', 1: '已完成', 2: '已驳回', 3: '处理中' }
  return map[status] || map[String(status)] || status || '待处理'
}

const editable = ({ record }) => ['待处理', '处理中'].includes(statusText(record && record.status))

export const LEASE_APPLICATION_POLICIES = Object.freeze({
  user: Object.freeze({
    actions: Object.freeze({ create: true, edit: editable, delete: false, changeStatus: false })
  }),
  admin: Object.freeze({
    actions: Object.freeze({ create: false, edit: editable, delete: true, changeStatus: true })
  }),
  readonly: Object.freeze({
    actions: Object.freeze({ create: false, edit: false, delete: false, changeStatus: false })
  })
})

export function getLeaseApplicationPolicy(mode = 'user') {
  return LEASE_APPLICATION_POLICIES[mode] || LEASE_APPLICATION_POLICIES.readonly
}
