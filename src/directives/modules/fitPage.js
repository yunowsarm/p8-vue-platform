// Size business pages to the available viewport, including embedded tab layouts.
import './fitPage.scss'
const states = new WeakMap()
export default {
  inserted(el) {
    el.classList.add('viewport-business-page')
    const viewport = window.visualViewport
    let frame
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (!el.getClientRects().length) return
        const contentMain = el.closest('#contentMain')
        let top = el.getBoundingClientRect().top
        let bottomInset = 0
        // Keep the page height stable when an enclosing tab panel scrolls.
        for (let parent = el.parentElement; parent; parent = parent.parentElement) {
          top += parent.scrollTop || 0
          bottomInset += parseFloat(getComputedStyle(parent).paddingBottom) || 0
          if (parent === contentMain) break
        }
        const viewportBottom = viewport ? viewport.height + viewport.offsetTop : window.innerHeight
        const bottom = contentMain ? Math.min(viewportBottom, contentMain.getBoundingClientRect().bottom) : viewportBottom
        const height = `${Math.max(0, bottom - top - bottomInset)}px`
        // Some legacy boards specify a percentage height with !important.
        if (el.style.height !== height) el.style.setProperty('height', height, 'important')
      })
    }
    const observer = new ResizeObserver(update)
    for (let parent = el.parentElement; parent; parent = parent.parentElement) observer.observe(parent)
    const visibility = new IntersectionObserver(update)
    visibility.observe(el)
    window.addEventListener('transitionend', update)
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    if (viewport) {
      viewport.addEventListener('resize', update)
      viewport.addEventListener('scroll', update)
    }
    states.set(el, { observer, visibility, update, cancel: () => cancelAnimationFrame(frame) })
    update()
  },
  componentUpdated(el) {
    const state = states.get(el)
    if (state) state.update()
  },
  unbind(el) {
    const state = states.get(el)
    if (!state) return
    state.observer.disconnect()
    state.visibility.disconnect()
    window.removeEventListener('transitionend', state.update)
    window.removeEventListener('scroll', state.update, true)
    window.removeEventListener('resize', state.update)
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', state.update)
      window.visualViewport.removeEventListener('scroll', state.update)
    }
    state.cancel()
    states.delete(el)
  }
}
