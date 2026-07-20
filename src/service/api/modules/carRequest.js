/**
 * 用车申请相关接口
 */

export const carRequestApi = {
  carRequest: [
    {
      name: 'platformApi',
      method: 'POST',
      path: '/framework/report/apply',
      mockPath: '/framework/report/apply',
      desc: '平台接口'
    },
    {
      name: 'platSelectApi',
      method: 'POST',
      path: '/framework/selection/getSelectionData',
      mockPath: '/framework/selection/getSelectionData',
      desc: '平台selection接口'
    },
    {
      name: 'register',
      method: 'POST',
      path: '/jt/car/register',
      mockPath: '/jt/car/register',
      desc: '用车合并登记'
    },
    {
      name: 'dispatch',
      method: 'POST',
      path: '/jt/car/dispatch',
      mockPath: '/jt/car/dispatch',
      desc: '批量派车'
    }
  ]
}
