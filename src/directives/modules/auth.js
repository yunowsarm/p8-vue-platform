import store from '@/plugins/store'

function normalizeOptions(binding, vnode) {
  const value = binding.value
  const options = value && typeof value === 'object' && !Array.isArray(value) ? value : { auth: value }
  const auth = options.auth || options.name || options.code || options.id

  return {
    auth: Array.isArray(auth) ? auth : [auth],
    mode: options.mode || (binding.modifiers.all ? 'all' : 'any'),
    resourceName: options.resourceName || (vnode.context && vnode.context.$route && vnode.context.$route.name),
    parentUuid: options.parentUuid || '',
    permissionVo: options.permissionVo || {}
  }
}

function hasAuth(buttons, auth, mode) {
  const authorizedNames = buttons
    .filter((button) => button && button.enable !== '0' && button.isAccredit !== 0 && button.isAccredit !== '0')
    .reduce((names, button) => names.concat([button.name, button.id]), [])
  const requiredAuth = auth.filter(Boolean)

  if (!requiredAuth.length) return false
  return mode === 'all'
    ? requiredAuth.every((item) => authorizedNames.indexOf(item) !== -1)
    : requiredAuth.some((item) => authorizedNames.indexOf(item) !== -1)
}

function setVisible(el, visible) {
  if (!Object.prototype.hasOwnProperty.call(el, '__vAuthDisplay')) el.__vAuthDisplay = el.style.display
  el.style.display = visible ? el.__vAuthDisplay : 'none'
}

function checkAuth(el, binding, vnode) {
  const options = normalizeOptions(binding, vnode)
  setVisible(el, false)

  if (!options.resourceName || !options.auth.filter(Boolean).length) return

  store.dispatch('getButtonAuth', options).then((buttons) => {
    if (!el.__vAuthDestroyed) setVisible(el, hasAuth(buttons, options.auth, options.mode))
  }).catch(() => {
    // Keep the element hidden if the permission request fails.
  })
}

export default {
  bind(el, binding, vnode) {
    checkAuth(el, binding, vnode)
  },
  update(el, binding, vnode) {
    if (binding.value !== binding.oldValue) checkAuth(el, binding, vnode)
  },
  unbind(el) {
    el.__vAuthDestroyed = true
  }
}
