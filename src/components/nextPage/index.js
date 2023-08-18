/* eslint-disable indent */
import Vue from 'vue'
import Main from './nextPage.vue'
import { addClass, removeClass } from '@/utils/dom'
/**
 * NextPage Plugin
 * Author: Vicco Wang
 * Date: 2018.03.07
 *
 * usage:
 *
 */

let NEXTPAGE_CONSTRUCTOR = Vue.extend(Main)
let NEXTPAGES = [] // 所有添加到页面的Nextpage组件数组
//
const NEXTPAGE_STYLE_PREFIX = `nextPage_${new Date().getTime()}`

/**
 * 创建NEXTPAGE组件,一个路由节点下只有一个NEXTPAGE组件
 * @param {*} options component options
 * @return Vue Component
 */
const __createNextPage = (options) => {
  let NextpageInstance = new NEXTPAGE_CONSTRUCTOR({
    data: options,
    component: {
      [options.component.name]: options.component
    }
  })
  return NextpageInstance
}

/**
 * 获取一份基础配置数据对象
 */
const __getBaseOptions = () => {
  return {
    cacheList: [],
    currentRoute: null,
    currentCrumb: null
  }
}

/**
 * 判断当前路由下是否已经创建过NEXTPAGE组件
 * @param {*} name
 */
const __hasCreated = (name) => {
  return NEXTPAGES.some((np) => np.currentRoute.name === name)
}

/**
 * 根据路由名称获取对应的NEXTPAGE组件
 * @param {*} name
 */
const __getCurrentNextPage = (name) => {
  for (let i = 0, l = NEXTPAGES.length; i < l; i++) {
    const np = NEXTPAGES[i]
    if (np.currentRoute.name === name) return np
  }
}

/**
 * 根据路由名称移除特定的NEXTPAGE组件
 * @param {*} npInstance
 */
const __removeNextPage = (npInstance) => {
  NEXTPAGES = NEXTPAGES.filter((np) => np.currentRoute.name !== npInstance.currentRoute.name)
}

/**
 * 关闭前回调方法
 * @param {*} npInstance
 */
const __beforeCloseHandel = (npInstance, params) => {
  // @ beforeClose hook
  if (npInstance._userOptions.beforeClose && typeof npInstance._userOptions.beforeClose === 'function') {
    npInstance._userOptions.beforeClose(npInstance, params)
  }
}

/**
 * 移除某个NEXTPAGE组件中定义的自定义Component
 * @param {*} name
 * @param {*} nextPages
 */
const __removeNextPageComponentByName = (name, nextPages, params) => {
  for (let i = 0, l = nextPages.length; i < l; i++) {
    const np = nextPages[i]
    if (np.name === name) {
      __beforeCloseHandel(np, params)
      nextPages.splice(i, 1)
      break
    }
  }
}

const __closeNextPageComponentsByCrumb = (npInstance, name) => {
  let sliceNextPages = []
  // 如果关闭的是顶级结点(面包屑的首个),则会关闭所有NEXTPAGE下的component
  if (name === npInstance.currentRoute.name) {
    sliceNextPages = npInstance.nextPages.concat()
  } else {
    // 遍历出哪些自定义组件需要移除
    for (let i = 0, l = npInstance.nextPages.length; i < l; i++) {
      let np = npInstance.nextPages[i]
      if (np.name === name) {
        sliceNextPages = npInstance.nextPages.slice(i + 1)
      }
    }
  }
  // 移除所有待移除自定义组件
  for (let i = 0, l = sliceNextPages.length; i < l; i++) {
    let np = sliceNextPages[i]
    __beforeCloseHandel(np)
    __closeNextPage(npInstance, np.name)
  }
}

/**
 *
 * @param {*} npInstance
 * @param {*} name
 */
const __closeNextPage = (npInstance, name, params) => {
  //
  __removeNextPageComponentByName(name, npInstance.nextPages, params)
  // removeCache
  npInstance.cacheList = npInstance.cacheList.filter((cacheName) => cacheName !== name)

  if (npInstance.nextPages.length) {
    // 最后一个组件
    const lastNpInstance = npInstance.nextPages[npInstance.nextPages.length - 1]
    npInstance.props = lastNpInstance._userOptions.props
    npInstance.component = lastNpInstance
  } else {
    // 如果移除当前组件后数组中没有组件了,则移除NextPage
    try {
      // npInstance.destroyNextPage()
      //
      npInstance.$destroy()
      //
      npInstance.$el.parentNode.removeChild(npInstance.$el)
      // 如果该NEXTPAGE下没有打开的组件了,则移除该NEXTPAGE组件
      __removeNextPage(npInstance)
      //
      const domTarget = document.getElementById('mainWrapper').childNodes[0].childNodes[0]
      // 移除包裹nextPage的父元素的className
      removeClass(domTarget, `${NEXTPAGE_STYLE_PREFIX}_parent_node`)
    } catch (e) {
      throw new Error(e)
    }
  }
}

/**
 * 异步加载NextPage需要加载的Component
 * @param {*} userOptions
 */
const getUserComponentAsync = (userOptions) => {
  return new Promise((resolve) => {
    if (typeof userOptions.component === 'function') {
      try {
        userOptions.component().then((res) => {
          resolve(res.default)
        })
      } catch (e) {
        console.error(e)
      }
    } else {
      resolve(userOptions.component)
    }
  })
}

/**
 *
 */
const createNextpageStyle = () => {
  // const nextPageParentNode = document.getElementById('mainWrapper').childNodes[0]
  const style = document.createElement('style')
  style.type = 'text/css'
  const styleStr = `
    @charset "utf-8";
    /**
      * nextPage style
      *
      **/ 
    .${NEXTPAGE_STYLE_PREFIX}_parent_node {
      height: 100%
    }
  `
  style.innerHTML = styleStr
  document.getElementsByTagName('head')[0].appendChild(style)
}

// init nextPage style
createNextpageStyle()

/**
 * Vue Component register
 *
 * @param {*} Vue
 * @param {*} globalOptions
 */
const install = (Vue, globalOptions) => {
  /**
   * 直接在圆形上绑定一个 $nextPage 全局函数
   *
   * @param {*} customOpts
   */
  //
  Vue.prototype.$nextPage = async (customOpts) => {
    // nextPage 实例
    let npInstance

    let userOptions = Object.assign({}, globalOptions, customOpts)

    if (!userOptions.router) {
      throw new Error('NextPage需要绑定router实例,Vue.use()时传入router实例.')
    }
    if (!userOptions.store) {
      throw new Error('NextPage需要绑定Store实例,Vue.use()时传入Store实例.')
    }
    // 获取当前用户需要加载的自定义页面组件
    // 因为用户定义的组件可以是同步组件（Object），也可能是异步组件(Function)。
    // 这里都会返回Vue Component Object
    const userComponent = await getUserComponentAsync(userOptions)
    // 将当期用户传递进来的参数保存至当前需要打开的组件中
    userComponent._userOptions = userOptions
    // 设置标题
    userComponent.title = userOptions.title || 'Nextpage'
    // 为自定义组件添加一个关闭当前自定义组件的方法
    if (userComponent.methods) {
      Object.assign(userComponent.methods, {
        closeNextPage(component, params) {
          __closeNextPage(npInstance, component.$options.name, params)
        }
      })
    }
    // 每一个路由节点只能创建一个Nextpage组件;
    const routerName = userOptions.router.currentRoute.name
    if (!__hasCreated(routerName)) {
      //
      npInstance = __createNextPage(Object.assign(__getBaseOptions(), userOptions))
      // 给实例绑定store
      npInstance.$store = userOptions.store
      // 如果配置了需要缓存,则打开的该组件将会被缓存起来.
      if (userOptions.cache && npInstance.cacheList.indexOf(userComponent.name) === -1) npInstance.cacheList.push(userComponent.name)
      //
      npInstance.nextPages = []
      npInstance.nextPages.push(userComponent)
      //
      NEXTPAGES.push(npInstance)
      // 根据目前项目的路径挂载DOM
      const domTarget = document.getElementById('mainWrapper').childNodes[0].childNodes[0]
      // 为nextPage的父元素添加className
      // 这里主要是为了修正父元素不满屏的问题，保证父元素高度100%
      addClass(domTarget, `${NEXTPAGE_STYLE_PREFIX}_parent_node`)
      // mount npInstance
      domTarget.appendChild(npInstance.$mount().$el)
    } else {
      //
      npInstance = __getCurrentNextPage(routerName)
      npInstance.nextPages.push(userComponent)
      // 如果配置了需要缓存,则打开的该组件将会被缓存起来.
      if (userOptions.cache && npInstance.cacheList.indexOf(userComponent.name) === -1) npInstance.cacheList.push(userComponent.name)
      npInstance.props = userComponent._userOptions.props
      npInstance.component = userComponent
    }

    // 给nextpage实例绑定一个内部通过面包蟹关闭页面的方法
    npInstance.__closeNextPageComponentsByCrumb = (name) => {
      __closeNextPageComponentsByCrumb(npInstance, name)
    }
    // @ show hook
    if (userComponent._userOptions.show && typeof userComponent._userOptions.show === 'function') {
      userComponent._userOptions.show()
    }
  }
}

export default { install }
