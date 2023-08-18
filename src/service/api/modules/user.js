/**
 * USER API
 * Namespace: User
 */

export const UserApi = {
  user: [
    {
      name: 'login',
      method: 'POST',
      path: '/user/login',
      mockPath: '/user/login',
      params: {
        userAccount: '',
        userPassword: ''
      },
      desc: '用户登录'
    },
    {
      name: 'logout',
      method: 'POST',
      path: '/user/logout',
      mockPath: '/user/logout',
      params: {},
      desc: '用户注销'
    },
    {
      name: 'info',
      method: 'POST',
      path: '/user/info',
      mockPath: '/user/info',
      params: {},
      desc: '获取用户信息'
    },
    {
      name: 'password.edit',
      method: 'POST',
      path: '/user/password/edit',
      mockPath: '/user/password/edit',
      params: {
        oldPassword: '',
        newPassword: ''
      },
      desc: '修改登录用户密码'
    },
    {
      name: 'setting.save',
      method: 'POST',
      path: '/framework/user/setting/save',
      mockPath: '/framework/user/setting/save',
      desc: '1.13 保存用户配置'
    },
    {
      name: 'setting.getAll',
      method: 'GET',
      path: '/framework/user/setting/getAll',
      mockPath: '/framework/user/setting/getAll',
      desc: '1.14 获取用户配置信息'
    }
  ],
  menu: [
    {
      name: 'list',
      method: 'POST',
      path: '/menu/list',
      mockPath: '/menu/list',
      params: {
        role: []
      },
      desc: '获取菜单列表TEST'
    }
  ],
  button: [
    {
      name: 'info',
      method: 'POST',
      path: '/button/list',
      mockPath: '/button/list',
      params: {
        role: []
      },
      desc: '获取页面权限按钮'
    },
    {
      name: 'tableButtonLimit',
      method: 'POST',
      path: '/bpm/dmn/button/ButtonDecision/config',
      mockPath: '/bpm/dmn/button/ButtonDecision/config',
      params: {},
      desc: 'table行上权限按钮，置灰/隐藏/悬浮提示'
    }
  ]
}
