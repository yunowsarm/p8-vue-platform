import Layout from '@/components/layout'

const _import_ = (file) => () => import('@/views/' + file + '.vue')

/**
 * 静态路由表配置
 *
 * 可根据{role}字段来模拟权限访问. 用户登录后必须含有{role}字段, 与之匹配的路由会被最终过滤出来供访问.
 * 不匹配的则不会包含在内.
 * 具体字段表说明可以访问平台文档查看详细资料.
 */
export const aysncRoutesMap = [
  {
    path: '/homepage',
    component: Layout,
    meta: { title: 'Homepage', icon: 'iconfont icon-yunzhuomian', role: ['admin', 'user'] },
    children: [
      {
        path: 'home',
        name: 'Homepage',
        component: _import_('Homepage/index'),
        meta: { title: 'Home', icon: 'nocturne icon-home', isHome: true }
      }
    ]
  },
  {
    path: '/dashboard',
    component: Layout,
    meta: { title: 'dashboard', role: ['admin', 'user'] },
    children: [
      {
        path: 'dash',
        name: 'Dashboard',
        component: _import_('Dashboard/index'),
        meta: { title: 'Dashboard', icon: 'nocturne icon-dash', isHome: false }
      }
    ]
  },
  {
    path: '/map',
    component: Layout,
    meta: { title: 'Maps', icon: 'nocturne icon-map1', role: ['user'] },
    children: [
      {
        path: 'bmap',
        name: 'BaiduMapCom',
        component: _import_('Map/BaiduMap/index'),
        meta: { title: 'Baidu Map', icon: 'nocturne icon-map2' }
      }
    ]
  },
  {
    path: '/utils',
    component: Layout,
    meta: { title: 'Utils', icon: 'nocturne icon-tools', role: ['user'] },
    children: [
      {
        path: 'nextpage',
        name: 'NextPage',
        component: _import_('Utils/NextPage/index'),
        meta: { title: 'NextPage', icon: 'nocturne icon-next-page' }
      },
      {
        path: 'beauti-context',
        name: 'BeautiContextComp',
        component: _import_('Utils/BeautiContext/index'),
        meta: { title: 'BeautiContext', icon: 'nocturne icon-menu' }
      }
    ]
  },
  {
    path: '/mock',
    component: Layout,
    meta: { title: '模拟菜单', icon: 'nocturne icon-map1', role: ['user'] },
    children: [
      {
        path: 'test',
        name: '组件',
        component: _import_('Mock/Test/index'),
        meta: { title: '模拟组件', icon: 'nocturne icon-map2' }
      }
    ]
  }
]
