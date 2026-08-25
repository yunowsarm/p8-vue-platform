// ToC 在线支付 API 模块：声明充值、缴费、消费和预订接口路径。
import createModule from './_shared/createCrudModule'

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
