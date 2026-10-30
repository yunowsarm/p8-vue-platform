// Size business pages to the available viewport, including embedded tab layouts.
import './fitPage.scss'
const states = new WeakMap()
export default {
  inserted(el) {
    el.classList.add('viewport-business-page')
    let frame
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (!el.getClientRects().length) return
        let top = el.getBoundingClientRect().top
        let bottomInset = 0
        // Viewport coordinates move when an outer tab panel scrolls.
        for (let parent = el.parentElement; parent; parent = parent.parentElement) {
          top += parent.scrollTop || 0
          bottomInset += parseFloat(getComputedStyle(parent).paddingBottom) || 0
        }
        const viewport = window.visualViewport
        const viewportBottom = viewport ? viewport.height + viewport.offsetTop : window.innerHeight
        const height = Math.max(0, viewportBottom - top - bottomInset)
        if (el.style.height !== height + 'px') el.style.height = height + 'px'
      })
    }
    const observer = new ResizeObserver(update)
    for (let parent = el.parentElement; parent; parent = parent.parentElement) observer.observe(parent)
    const visibility = new IntersectionObserver(update)
    visibility.observe(el)
    window.addEventListener('transitionend', update)
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    if (window.visualViewport) window.visualViewport.addEventListener('resize', update)
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
    if (window.visualViewport) window.visualViewport.removeEventListener('resize', state.update)
    state.cancel()
    states.delete(el)
  }
}
