import Layout from '@/components/layout'

const _import_ = (file) => () => import('@/views/' + file + '.vue')
/*
 * 公共路由表, 一般情况这里无需任何修改.
 * 除非你需要配置更多任何角色或权限下都可以访问的路由
 */
export const constantRouterMap = [
  {
    path: '/login',
    component: _import_('Login/index'),
    hidden: true
  },
  {
    path: '/Maintain',
    component: _import_('maintain/maintain'),
    hidden: true
  },
  // {
  //   path: '',
  //   component: Layout,
  //   meta: { title: '我的主页', icon: 'nocturne icon-map1' },
  //   redirect: '/dash',
  //   children: [
  //     {
  //       path: 'dash',
  //       name: 'Dashboard',
  //       component: _import_('Dashboard/index'),
  //       meta: { title: '主页', icon: 'icon-base-data-manage', noCache: false }
  //     }
  //   ]
  // },
  {
    path: '',
    component: Layout,
    meta: { title: '我的主页', icon: 'nocturne icon-map1', name: 'DashboardHome' },
    redirect: '/dash',
    children: [
      {
        path: 'dash',
        name: 'Dashboard',
        component: _import_('Dashboard/index'),
        meta: { title: '主页', icon: 'icon-base-data-manage', noCache: false }
      },
      {
        path: '/home',
        name:'home',
        component: _import_('MobileComponents/Home/index'),
        meta:{title:'主页'}
      },
      {
        path: '/more',
        name:'more',
        component: _import_('MobileComponents/Home/moreMenu'),
        meta:{title:'更多服务'}
      },
      {
        path: '/message',
        name:'message',
        component: _import_('Framework/Message/index'),
        meta:{title:'我的消息'}
      },
      {
        path: '/approval',
        name:'approval',
        component: _import_('Communication/MyApprove/list'),
        meta:{title:'我的审批'}
      },
      {
        path: '/mine',
        name:'mine',
        component: _import_('MobileComponents/Mine/index'),
        meta:{title:'个人中心'}
      },
      {
        path: '/about',
        name:'about',
        component: _import_('MobileComponents/Mine/about'),
        meta:{title:'关于'}
      }
    ]
  },
  {
    path: '/homeDash',
    redirect: '/LoginHome',
    hidden: true,
    component: _import_('LoginHome/index'),
    meta: { title: '登录主页', icon: 'icon-base-data-manage', noCache: false },
    children: [
      {
        path: '/LoginHome',
        name: 'LoginHome',
        component: _import_('LoginHome/index'),
        meta: { title: '登录主页', icon: 'icon-base-data-manage', noCache: false }
      }
    ]
  },
  {
    path: '/signIn',
    name: 'signIn',
    component: _import_('Dashboard/signIn'),
    meta: { title: '主页', icon: 'icon-base-data-manage', noCache: false }
  },
  {
    path: '',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'personal-settings',
        name: 'PersonalSettings',
        component: () => import('@/components/layout/Components/Settings/index'),
        meta: { title: '个性化配置', icon: '', noCache: true }
      }
    ]
  },
  {
    path: '/modify-password',
    component: () => import('@/components/layout/Components/ModifyPassword/index'),
    hidden: true,
    meta: { title: '修改密码', icon: '', noCache: true }
  },
  { path: '/401', component: _import_('others/401'), hidden: true },
  { path: '*', component: _import_('others/404'), hidden: true },
  {
    path: '',
    component: Layout,
    hidden: true,
    meta: { title: '样例', icon: 'icon-task-statistics-query', role: ['user'] },
    children: [
      {
        path: '/test',
        name: 'test',
        component: _import_('Mock/Test/index'),
        meta: { title: '模拟人员管理', icon: 'icon-output-process-manage' }
      },
      {
        path: '/test2',
        name: 'test2',
        component: _import_('Mock/Test/index2'),
        meta: { title: 'TEST2', icon: 'icon-output-process-manage' }
      },
      {
        path: '/import',
        name: 'import',
        component: _import_('Mock/Import/index'),
        meta: { title: '导入&Tabs&InfiniteScroll', icon: 'icon-multi-project-manage' }
      },
      {
        path: '/icon-selector',
        name: 'icon-selector',
        component: _import_('Mock/IconSelector/index'),
        meta: { title: 'Icon组件', icon: 'icon-plan-examine' }
      }
    ]
  },
  {
    path: '',
    component: Layout,
    hidden: true,
    meta: { title: '组件管理', icon: 'icon-task-statistics-query', role: ['user'] },
    children: [
      {
        path: '/base-form-comp-list',
        name: 'base-form-comp-list',
        component: _import_('Framework/ComponentsMananger/Base/index'),
        meta: { title: '基础表单组件', icon: 'icon-model-related-information' }
      }
    ]
  },
  {
    path: '',
    component: Layout,
    hidden: true,
    meta: { title: '智能表单', icon: 'icon-process-template', role: ['user'] },
    children: [
      {
        path: '/form-list',
        name: 'form-list',
        component: _import_('Framework/ComponentsMananger/Form/index'),
        meta: { title: '表单管理', icon: 'icon-model-related-information' }
      },
      {
        path: '/table-list',
        name: 'table-list',
        component: _import_('Framework/ComponentsMananger/Grid/index'),
        meta: { title: '表格管理', icon: 'icon-model-related-information' }
      },
      {
        path: '/table-list-demo',
        name: 'table-list-demo',
        component: _import_('Mock/FormGenerator/tableListDemo/index'),
        meta: { title: '子父表联动DEMO', icon: 'icon-model-related-information' }
      },
      {
        path: '/select',
        name: 'select',
        component: _import_('Framework/ComponentsMananger/Select/index'),
        meta: { title: 'select组件', icon: 'icon-model-related-information' }
      }
    ]
  },
  {
    path: '',
    component: Layout,
    hidden: true,
    meta: { title: '数据源管理', icon: 'icon-multi-project-manage' },
    children: [
      {
        path: '/storage',
        name: 'Storage',
        component: _import_('Framework/Datasource/storage/index'),
        meta: { title: '存储', icon: 'icon-model-related-information' }
      },
      {
        path: '/data-view',
        name: 'data-view',
        component: _import_('Framework/Datasource/dataView/index'),
        meta: { title: '数据视图', icon: 'icon-model-related-information' }
      }
    ]
  },
  {
    path: '',
    component: Layout,
    hidden: true,
    meta: { title: '智能报表案例', icon: 'icon-process-template', role: ['user'] },
    children: [
      {
        path: '/Framework/ComponentsMananger/Grid/Components/tableRender',
        name: 'list-render',
        props: { code: 'userList' },
        component: _import_('Framework/ComponentsMananger/Grid/Components/tableRender'),
        meta: { title: '列表渲染器', icon: 'icon-model-related-information' }
      },
      {
        path: 'Framework/ComponentsMananger/Grid/Components/viewRender',
        name: 'view-render',
        props: { code: 'userList', record: { USER_NAME: 'zhangsan', REAL_NAME: '张三', OTEL: '13256562356' } },
        component: _import_('Framework/ComponentsMananger/Grid/Components/viewRender'),
        meta: { title: '查看渲染器', icon: 'icon-model-related-information' }
      }
    ]
  },
  {
    path: '/haha',
    component: Layout,
    hidden: true,
    meta: { title: 'test', icon: 'icon-task-statistics-query', role: ['user'] },
    children: [
      {
        path: '/haha',
        name: 'haha',
        component: _import_('Test/index'),
        meta: { title: 'test', icon: 'icon-model-related-information' }
      },
      {
        path: '/haha1',
        name: 'haha1',
        component: _import_('Test/index1'),
        meta: { title: 'test1', icon: 'icon-model-related-information' }
      }
    ]
  },
  {
    path: '/myMessageView',
    name: 'myMessageView',
    component: _import_('Framework/Message/index'),
    hidden: true,
    meta: { title: 'test', icon: 'icon-task-statistics-query' },
  },
  {
    path: '/myApproveView',
    name: 'myApproveView',
    component: _import_('Communication/MyApprove/list'),
    hidden: true,
    meta: { title: 'test', icon: 'icon-task-statistics-query' },
  }
]
