const POPUP_BODY_CLASS = 'el-popup-parent--hidden'
const MAIN_SCROLL_SELECTOR = '.scroll-area, .ps-container'
const OVERLAY_SELECTOR = '.el-dialog__wrapper, .el-drawer__container, .el-message-box__wrapper'
const ALLOWED_SCROLL_SELECTOR = [
  '.el-dialog__body',
  '.el-drawer__body',
  '.el-select-dropdown',
  '.el-cascader__dropdown',
  '.el-cascader-panel',
  '.el-picker-panel',
  '.el-dropdown-menu',
  '.el-message-box',
  '.el-popover',
  '.el-tooltip__popper'
].join(',')
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '])

let installed = false
let locked = false
let observer = null
let animationFrame = null
let lockedScrollers = []

function isElement(target) {
  return target && target.nodeType === 1
}

function isAllowedScrollTarget(target) {
  return isElement(target) && Boolean(target.closest(ALLOWED_SCROLL_SELECTOR))
}

function preventBackgroundScroll(event) {
  if (!locked || isAllowedScrollTarget(event.target)) return
  event.preventDefault()
}

function preventBackgroundKeyScroll(event) {
  if (!locked || !SCROLL_KEYS.has(event.key)) return
  const target = event.target
  if (isElement(target) && target.closest('input, textarea, select, [contenteditable="true"]')) return
  if (isAllowedScrollTarget(target)) return
  event.preventDefault()
}

function restoreScrollerPosition(event) {
  const entry = lockedScrollers.find((item) => item.element === event.currentTarget)
  if (!entry || entry.restoring) return
  if (entry.element.scrollTop === entry.scrollTop && entry.element.scrollLeft === entry.scrollLeft) return
  entry.restoring = true
  entry.element.scrollTop = entry.scrollTop
  entry.element.scrollLeft = entry.scrollLeft
  entry.restoring = false
}

function rememberStyle(element, property) {
  return {
    value: element.style.getPropertyValue(property),
    priority: element.style.getPropertyPriority(property)
  }
}

function restoreStyle(element, property, style) {
  if (style.value) element.style.setProperty(property, style.value, style.priority)
  else element.style.removeProperty(property)
}

function lockMainScroll() {
  if (locked) return
  locked = true
  const elements = Array.from(document.querySelectorAll(MAIN_SCROLL_SELECTOR)).filter((element) => !element.closest(OVERLAY_SELECTOR))
  lockedScrollers = elements.map((element) => {
    const entry = {
      element,
      scrollTop: element.scrollTop,
      scrollLeft: element.scrollLeft,
      overflow: rememberStyle(element, 'overflow'),
      overscrollBehavior: rememberStyle(element, 'overscroll-behavior'),
      restoring: false
    }
    element.style.setProperty('overflow', 'hidden', 'important')
    element.style.setProperty('overscroll-behavior', 'none')
    element.addEventListener('scroll', restoreScrollerPosition)
    return entry
  })
  document.addEventListener('wheel', preventBackgroundScroll, { capture: true, passive: false })
  document.addEventListener('touchmove', preventBackgroundScroll, { capture: true, passive: false })
  document.addEventListener('keydown', preventBackgroundKeyScroll, true)
}

function unlockMainScroll() {
  if (!locked) return
  document.removeEventListener('wheel', preventBackgroundScroll, true)
  document.removeEventListener('touchmove', preventBackgroundScroll, true)
  document.removeEventListener('keydown', preventBackgroundKeyScroll, true)
  lockedScrollers.forEach((entry) => {
    entry.element.removeEventListener('scroll', restoreScrollerPosition)
    restoreStyle(entry.element, 'overflow', entry.overflow)
    restoreStyle(entry.element, 'overscroll-behavior', entry.overscrollBehavior)
    entry.element.scrollTop = entry.scrollTop
    entry.element.scrollLeft = entry.scrollLeft
  })
  lockedScrollers = []
  locked = false
}

function isVisibleElement(element) {
  return element && window.getComputedStyle(element).display !== 'none' && window.getComputedStyle(element).visibility !== 'hidden'
}

function hasActiveOverlay() {
  if (document.querySelector('.el-drawer__container.el-drawer__open')) return true
  const modalSelectors = ['.el-dialog__wrapper', '.el-message-box__wrapper']
  return modalSelectors.some((selector) => Array.from(document.querySelectorAll(selector)).some(isVisibleElement))
}

function syncScrollLock() {
  animationFrame = null
  const shouldLock = document.body.classList.contains(POPUP_BODY_CLASS) || hasActiveOverlay()
  if (shouldLock) lockMainScroll()
  else unlockMainScroll()
}

function scheduleSync() {
  if (animationFrame !== null) return
  animationFrame = window.requestAnimationFrame(syncScrollLock)
}

function containsOverlayNode(nodes) {
  return Array.from(nodes || []).some((node) => {
    if (!isElement(node)) return false
    return node.matches(OVERLAY_SELECTOR) || Boolean(node.querySelector(OVERLAY_SELECTOR))
  })
}

function handleMutations(mutations) {
  const shouldSync = mutations.some((mutation) => {
    if (mutation.target === document.body) return true
    if (isElement(mutation.target) && mutation.target.matches(OVERLAY_SELECTOR)) return true
    return mutation.type === 'childList' && (containsOverlayNode(mutation.addedNodes) || containsOverlayNode(mutation.removedNodes))
  })
  if (shouldSync) scheduleSync()
}

/**
 * Element UI 默认只锁定 body；平台主内容使用 PerfectScrollbar，需同步锁定实际滚动容器。
 */
export function installOverlayScrollLock() {
  if (installed || typeof window === 'undefined' || typeof MutationObserver === 'undefined') return
  installed = true
  observer = new MutationObserver(handleMutations)
  observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'style'], childList: true, subtree: true })
  syncScrollLock()
}

export function destroyOverlayScrollLock() {
  if (!installed) return
  if (observer) observer.disconnect()
  if (animationFrame !== null) window.cancelAnimationFrame(animationFrame)
  observer = null
  animationFrame = null
  unlockMainScroll()
  installed = false
}
