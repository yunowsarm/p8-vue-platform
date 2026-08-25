// 操作策略工具：统一解析布尔规则和基于当前记录动态计算的操作规则。
const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object || {}, key)

/**
 * 判断策略中是否声明了某个操作。
 * 函数型规则表示需要结合具体记录判断，因此在列表级别视为可用。
 */
export function hasAction(policy, action, fallback = false) {
  const actions = (policy && policy.actions) || {}
  if (!hasOwn(actions, action)) return fallback
  return typeof actions[action] === 'function' || actions[action] === true
}

/**
 * 执行页面操作策略。策略只控制前端展示与交互，最终权限仍由后端校验。
 */
export function canPerformAction(policy, action, context = {}, fallback = false) {
  const actions = (policy && policy.actions) || {}
  if (!hasOwn(actions, action)) return fallback
  const rule = actions[action]
  return typeof rule === 'function' ? Boolean(rule(context)) : rule === true
}
