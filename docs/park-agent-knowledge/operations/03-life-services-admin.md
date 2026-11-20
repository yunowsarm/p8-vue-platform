# 园区运营端 · 生活服务信息维护

## 园区服务管理：维护园区班车线路

运营人员进入「园区服务管理 → 园区班车」，或打开独立管理入口「园区班车」。可用线路、起点或终点检索。点击「新增班车」，填写线路名称、起点、终点、首班时间、末班时间及正整数发车间隔（分钟），备注选填。提交后可在列表查看、编辑或删除线路，删除前需要确认。统计卡片帮助了解线路资料；车辆实时位置和乘车预约需有相应服务页面支持。

依据：`src/views/ToOManage/shuttleBus.vue`、`src/features/life-services/LifeServicesManagePage.vue`、`src/features/life-services/shuttle-bus/ShuttleBusBoard.vue`。

## 园区服务管理：维护租车、问卷及旅行门票信息

运营人员在「园区服务管理」按业务切换标签。租车服务新增车辆信息时必填车型、车牌号和日租金；列表状态可筛选可租、已租出、维修中、已下架。问卷调查新增问卷必填标题、起止时间和问卷说明，可上传附件。旅行门票新增记录必填景点名称、门票类型、价格、折扣和门票说明，列表可筛选在售、售罄、已下架。三个标签支持详情、编辑和删除；这里的保存操作维护服务资料。

依据：`src/features/life-services/LifeServicesManagePage.vue`、`src/features/life-services/car-rental/CarRentalPage.vue`、`src/features/life-services/user-survey/UserSurveyPage.vue`、`src/features/life-services/travel-ticket/TravelTicketPage.vue`。

## 人才服务：发布招聘职位

运营人员通过管理端「人才服务」点击「发布职位」，填写职位名称、公司名称、薪资、联系方式、发布时间及职位描述，均为必填。点击「保存职位」，可按职位、公司或职位描述检索，也可按招聘中、已暂停、已截止筛选。已保存职位支持详情、编辑和删除。职位列表和表单用于信息维护；应聘投递和录用流程需以对应招聘渠道为准。

依据：`src/views/ToOManage/talentService.vue`、`src/features/life-services/talent-service/TalentServicePage.vue`。
