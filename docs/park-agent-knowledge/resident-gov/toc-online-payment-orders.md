# 个人端在线支付和消费预订记录

## 新建订单与查看状态

进入个人端「在线支付」，选择在线充值、停车缴费、商超消费、运动健身、洗车服务、生活服务、餐饮消费或场地预定。点「新建」填写对应字段，再点「创建订单」，新订单为「待支付」。列表可按关键词和状态查找，打开订单可查看编号、金额、业务字段和时间。按业务配置可筛选部分类型。各入口共用订单台账，状态有「待支付」「支付成功」「支付失败」「已取消」「已退款」。

待支付的订单可用「去支付」或「取消订单」，均需二次确认。确认支付后页面调用编辑接口，将记录更新为「支付成功」并写入支付时间。确认取消则改为「已取消」。非待支付记录可编辑，列表也有删除操作。页面没有调用支付渠道收银台、钱包充值到账、扣款、退款或支付回调接口，支付结果和余额以实际支付渠道或财务记录为准。

依据 `src/views/ToC/onlinePayment/components/PaymentOrderBoard.vue`、`src/service/api/modules/tocOnlinePayment.js`。

## 在线充值、停车缴费和商超消费

- 在线充值必填用户编号、充值金额、充值时间和支付方式，订单号选填。支付方式可选微信支付、支付宝、银行卡或余额支付，字段用于记录所选方式。
- 停车缴费必填用户编号、车牌号码、入场时间和应付金额，支付时间和订单号选填。页面填写应付金额，未见停车计费或车辆放行联动。
- 商超消费必填用户编号、商户编号和消费金额，支付时间和订单号选填。此入口处理商超消费订单记录。

依据 `src/views/ToC/onlinePayment/accountRecharge.vue`、`src/views/ToC/onlinePayment/parkingPayment.vue`、`src/views/ToC/onlinePayment/mallConsumption.vue`。

## 运动健身、洗车和便民生活服务

- 运动健身必填用户编号、运动类型、场馆编号和消费金额。运动类型含健身、游泳、羽毛球、篮球和乒乓球。
- 洗车服务必填用户编号、车牌号码和服务费用。
- 在线支付下的「生活服务」订单必填用户编号、服务类型和服务费用。类型含家政服务、快递代收、维修服务和便民代办。

上述三类均可选填支付时间和订单号。页面保存订单及其状态，未显示排班、上门派单或服务验收功能。

依据 `src/views/ToC/onlinePayment/sportsPayment.vue`、`src/views/ToC/onlinePayment/carWashOrder.vue`、`src/views/ToC/onlinePayment/lifeServiceOrder.vue`。

## 餐饮消费和场地预定

- 餐饮消费必填用户编号、餐饮商户和消费金额，支付时间和订单号选填。
- 场地预定必填用户编号、场地编号、预定日期、起止时间和预定费用，支付时间和订单号选填。页面可创建预定订单记录，可用时段、冲突检查及现场使用安排未在此入口实现。

依据 `src/views/ToC/onlinePayment/diningPayment.vue`、`src/views/ToC/onlinePayment/venueBooking.vue`。
