// import _flattenDeep from 'lodash/flattenDeep'
import { constantRouterMap } from '@/router/staticRoutes'
import { aysncRoutesMap } from '@/router/aysncRoutes'
import api from '@/plugins/api'
import { ROUTER_DEFAULT_CONFIG } from '@/config/settings'
// layout component
import Layout from '@/components/layout'
// async load
const _import_ = (file) => () => import('@/views/' + (file.startsWith('/') ? file.slice(1) : file) + '.vue')

/**
 * 判断传入的权限是否能和路由匹配
 * @param {} roles
 * @param {*} route
 */
function hasPermission(roles, route) {
  // admin is the super user
  // if (roles.indexOf('admin') >= 0) return true
  // 跳转路由不包含meta.role,则表示不需要验证权限
  if (route.meta && route.meta.role) {
    return roles.some((role) => route.meta.role.indexOf(role) >= 0)
  } else {
    return true
  }
}

/**
 * 通过权限过滤出可供访问的路由表
 * @param {*} asyncRoutesMap
 * @param {*} roles
 */
function filterAsyncRoutes(asyncRoutesMap, roles) {
  const filterRoutes = asyncRoutesMap.filter((route) => {
    if (hasPermission(roles, route)) {
      if (route.children && route.children.length) {
        filterAsyncRoutes(route.children, roles)
      }
      return true
    }
    return false
  })
  return filterRoutes
}

/**
 * 过滤获取主页路由
 * @param {*} routes
 */
function getHomePage(routes) {
  //
  let homeRoutes = []
  //
  function getHomeRoutes(selectRoutes) {
    for (let i = 0; i < selectRoutes.length; i++) {
      const route = selectRoutes[i]
      if (route.children) {
        getHomeRoutes(route.children)
      }
      if (route.meta && route.meta.isHome) {
        homeRoutes.push(route)
        break
      }
    }
  }
  //
  getHomeRoutes(routes)
  //
  return homeRoutes
}

/**
 * 动态路由创建, 可以读取静态文件,也可以后端维护实现权限分级菜单;
 *
 * @param {Array} remoteRoutes 远程获取到的路由表数据
 * @returns {Array} 重构的vue路由表
 */
function generateNewRoutes(remoteRoutes) {
  let addRouters = []
  /**
   * 创建子路由
   * @param { Array } childRoute
   */
  const _createRoutes = (childRoute, parentPath) => {
    const newRoute = childRoute.map((route) => {
      // 路由传参处理，例如:path:PlanManagement/DutyOrder/index?type=1015，将type=1015通过$route的meta传到页面中
      let addChildRoute = {}
      let path = route.component
      let routePath= ''
      if (path && path.indexOf('?') !== -1) {
        let pathUrl = path.split('?')[1].split('&')
        let pathQuery = {}

        // eslint-disable-next-line no-return-assign
        pathUrl.map((v) => (pathQuery[v.split('=')[0]] = v.split('=')[1]))
        let paramStr = ''
        Object.keys(pathQuery).forEach((i) => {
         return paramStr += '/' + pathQuery[i]
        })
        let componentPath = path.split('?')[0]
        route.path = route.path + paramStr
        routePath = route.path ? (route.path.startsWith('/') ? route.path : '/' + route.path) : ''
        addChildRoute = {
          path: routePath,
          name: route.name,
          props: pathQuery,
          isDisabled: route.isDisabled,
          component: _import_(componentPath),
          meta: { ...route.meta, ...pathQuery, parentPath }
        }
      } else {
        routePath = route.path ? (route.path.startsWith('/') ? route.path : '/' + route.path) : ''
        addChildRoute = {
          path: routePath,
          name: route.name,
          isDisabled: route.isDisabled,
          component: _import_(route.component),
          meta: { ...route.meta, parentPath}
        }
      }
      // console.log(addChildRoute, 'addChildRoute')
      // // 如果有子路由,则递归创建
      if (route.children && route.children.length) {
        addChildRoute.children = _createRoutes(route.children, routePath)
      }
      return addChildRoute
    })
    return newRoute
  }

  /**
   * 创建父路由
   */
  remoteRoutes.forEach((route) => {
    let newRoute = {}
    /**
     * auther: wangzhifeng
     * desc: 判断一级菜单
     * date: 2023/11/24 16:20:27
     */
    let routePath = ''
    if (route.path && (!route.children || route.children.length == 0)) {
      newRoute = {
        path: '',
        component: Layout,
        meta: { ...route.meta },
        redirect: route.path ? (route.path.startsWith('/') ? route.path : '/' + route.path) : '',
        children:[]
      }
      let children = [route]
      newRoute.children = _createRoutes(children, '')
    } else {
      routePath = route.path ? (route.path.startsWith('/') ? route.path : '/' + route.path) : ''
      newRoute = {
        path: routePath,
        component: Layout,
        meta: { ...route.meta }
      }
      // 判断是否有子路由
      if (route.children && route.children.length) {
        newRoute.children = _createRoutes(route.children, routePath)
      }
    }
    addRouters.push(newRoute)
  })
  return addRouters
}

const routers = {
  //
  state: {
    homepage: null, // 系统进入首屏（首页）
    addRouters: null, // 动态添加的路由表(后期可过滤)
    router: constantRouterMap, // 静态路由表或和动态路由表合并后的总路由表
    staticRoutesMap: [] // 异步获取的路由表(不过滤)
  },

  mutations: {
    SET_ROUTERS: (state, { addRoutes, routerRawData }) => {
      state.addRouters = addRoutes
      state.router = constantRouterMap.concat(addRoutes)
      const homePageRoute = getHomePage(addRoutes)
      state.homepage = homePageRoute.length
        ? homePageRoute[0]
        : {
            name: 'Dashboard',
            path: 'dashboard'
          }
    },
    RESET_ROUTERS: (state, router) => {
      state.homepage = null
      state.addRouters = null
      state.router = constantRouterMap
    }
  },

  actions: {
    generateRouters: (context, roles) => {
      // 获取静态路由
      if (ROUTER_DEFAULT_CONFIG.isUseStaticRouter) {
        return new Promise((resolve, reject) => {
          // 这里通过权限来过滤出该权限所拥有的动态路由表,然后再SET_ROUTERS
          const addRoutes = filterAsyncRoutes(aysncRoutesMap, roles)
          context.commit('SET_ROUTERS', { addRoutes, routerRawData: null })
          resolve({
            addRoutes,
            homepage: context.state.homepage
          })
        })
        // 获取动态路由
      } else {
        return api['menu.list']({ userRoles: roles }).then((routerRawData) => {
          const addRoutes = generateNewRoutes(routerRawData)
          context.commit('SET_ROUTERS', { addRoutes, routerRawData })
          context.state.staticRoutesMap = addRoutes
          return {
            addRoutes,
            homepage: context.state.homepage
          }
        })
        // }
      }
    },
    generateFilterRouters: (context, { roles, childMenus }) => {
      return new Promise((resolve, reject) => {
        let addRoutes = []
        if (context.state.staticRoutesMap.length) {
          if (childMenus && childMenus.length) {
            context.state.staticRoutesMap.map((item) => {
              if (childMenus.indexOf(item.meta.id) !== -1) {
                addRoutes.push(item)
              }
            })
          } else {
            addRoutes = context.state.staticRoutesMap
          }
        }

        context.commit('SET_ROUTERS', { addRoutes, routerRawData: null })
        resolve({
          addRoutes,
          homepage: context.state.homepage
        })
      })
    }
  }
}

export default routers
