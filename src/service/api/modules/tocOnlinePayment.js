const createModule = (namespace, path, desc) => ({
  [namespace]: [
    { name: 'list', method: 'GET', path: `${path}/list`, mockPath: `${path}/list`, desc: `${desc}分页查询` },
    { name: 'add', method: 'POST', path: `${path}/add`, mockPath: `${path}/add`, desc: `新增${desc}` },
    { name: 'edit', method: 'POST', path: `${path}/edit`, mockPath: `${path}/edit`, desc: `编辑${desc}` },
    { name: 'delete', method: 'POST', path: `${path}/delete`, mockPath: `${path}/delete`, desc: `删除${desc}` },
    { name: 'queryById', method: 'GET', path: `${path}/queryById`, mockPath: `${path}/queryById`, desc: `${desc}详情` }
  ]
})

export const tocOnlinePaymentApi = Object.assign(
  {},
  createModule('tocAccountRecharge', '/czwj/tob/accountRecharge', '在线充值'),
  createModule('tocParkingPayment', '/czwj/tob/parkingPayment', '停车缴费'),
  createModule('tocMallConsumption', '/czwj/tob/mallConsumption', '商超消费'),
  createModule('tocSportsPayment', '/czwj/toc/sportsPayment', '运动健身'),
  createModule('tocCarWashOrder', '/czwj/toc/carWashOrder', '洗车服务'),
  createModule('tocLifeServiceOrder', '/czwj/toc/lifeServiceOrder', '生活服务'),
  createModule('tocDiningPayment', '/czwj/toc/diningPayment', '餐饮消费'),
  createModule('tocVenueBooking', '/czwj/toc/venueBooking', '场地预定')
)
