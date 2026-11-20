# 个人端车辆租赁与汽车保险

从个人端「生活服务」查找租车服务、租车申请、汽车保险或保险投保记录。目录信息和业务登记分别由独立入口管理，实际可见菜单取决于账号授权。

## 租车服务和租车申请

在「租车服务」可按关键词、车型和车辆状态筛选，查看车牌号、日租金和详情。车辆可显示「可租」「已租出」「维修中」「已下架」。个人端车辆目录为只读，运营端「园区服务管理 → 租车服务」可新增、编辑和删除车辆，维护时必填车型、车牌号和日租金。

在「租车申请」点击「新增租车申请」，手工填写车辆编号、用户编号、开始日期、结束日期和总租金，再点「提交申请」。新建默认为「待确认」。申请可按车辆编号、用户编号或状态查询，详情状态还包括「已确认」「租用中」「已归还」「已取消」。页面提供编辑，列表的「取消」触发确认删除该申请记录。页面没有按租期自动计算总租金、受理推进、交车验车或支付操作，实际交付进度以办理方确认为准。

依据 `src/views/ToC/lifeServices/carRental.vue`、`src/views/ToC/lifeServices/carRentalInfo.vue`、`src/features/life-services/car-rental/CarRentalPage.vue`、`src/features/life-services/car-rental-info/CarRentalInfoPage.vue`、`src/features/life-services/LifeServicesManagePage.vue`、`src/features/_shared/record-management/recordManager.js`。

## 汽车保险和保险投保记录

在「汽车保险」按保险名称或说明、险种以及销售状态查询产品。交强险、商业险、车损险、第三者责任险为险种选项。入口提供产品记录的新建、编辑和删除。维护时填写保险名称、类型、价格和说明。产品默认「在售」，列表也可显示「暂停销售」「已下架」。

在「保险投保记录」创建记录时，填写保险编号、用户编号、车牌号、购买时间、购买数量和总价，保存后默认「待支付」。详情可查看登记资料，其他显示状态有「已支付」「已生效」「已取消」。列表支持编辑和查看，按钮「取消」触发确认删除该记录。页面提供产品和投保记录维护，未显示支付、保险公司核保或保单签发入口。是否实际承保以保单及承保机构确认为准。

依据 `src/views/ToC/lifeServices/carInsurance.vue`、`src/views/ToC/lifeServices/carInsuranceInfo.vue`、`src/features/life-services/car-insurance/CarInsurancePage.vue`、`src/features/life-services/car-insurance-info/CarInsuranceInfoPage.vue`、`src/features/_shared/record-management/recordManager.js`、`src/service/api/modules/tocLifeServices.js`。
