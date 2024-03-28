import router from '@/plugins/router'
import store from '@/plugins/store'
import { getToken } from '@/service/expands/auth'

const whiteList = ['/login', '/Maintain']
const adminUserIdArr = ['SYS_USER001', 'SYS_USER009', 'SYS_USER012', 'SYS_USER010', 'SYS_USER000'] // 五元id

export function routerBeforeEachFunc(to, from, next) {
  if (getToken()) {
    if (to.path === '/login') {
      next('/login')
    } else {
      /**
       * 首次进入系统，刷新页面会需要重新获取用户权限信息
       * 如果没有获取到当前用户的权限数据则需要远程获取用户权限
       */
      if (!store.getters.roles) {
        // TODO 还没有权限部分 获取权限列表
        store.dispatch('getUserInfo').then((res) => {
          // 根据获取到的用户权限来构建动态路由表,或者做其他事情;
          store.dispatch('generateRouters', res.roles).then((context) => {
            router.addRoutes(context.addRoutes)
            // 五元隐藏我的主页菜单
            router.options.routes.map((item) => {
              if (item.meta && item.meta.name && item.meta.name === 'DashboardHome') {
                if (adminUserIdArr.indexOf(res.id) !== -1) item.hidden = true
              }
            })
            // 每次刷新页面都回到dash页面
            const reg = new RegExp(context.homepage.path + '$')
            if (!reg.test(to.path) || to.path !== '/') {
              // 五元登录后默认选中第一个一级菜单的第一个二级菜单
              next({
                name:
                  adminUserIdArr.indexOf(res.id) === -1
                    ? context.homepage.name
                    : context.addRoutes.length
                    ? context.addRoutes[0].children && context.addRoutes[0].children.length
                      ? context.addRoutes[0].children[0].name
                      : 'DashboardHome'
                    : 'DashboardHome',
                replace: true
              })
            } else {
              next({ ...to, replace: true })
            }
          })
          store.dispatch('getButtonLimit') // 获取按钮禁用逻辑
          store.dispatch('getDicAndBaseConfig') // 获取系统配置信息-项目状态、计划状态、任务状态等dicConfig与系统名称等baseConfig
          store.dispatch('getSettingAll') // 获取列表配置信息
          store.dispatch('getMessageInfo') // 获取消息信息
          store.dispatch('getMessageNum') // 获取消息信息已读未读条数
          // store.dispatch('getSystemSecret') // 获取系统密级
          store.dispatch('getPlanStatusLimitStrategy') // 获取gantt操作权限
        })

        // 未刷新页面,在系统中跳转路由
      } else {
        if (to.name === null) {
          next({ path: '*', replace: true })
        } else {
          next()
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next('/login')
    }
  }
}
