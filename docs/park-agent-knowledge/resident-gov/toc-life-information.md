# 个人端生活服务的信息查询与维护

从个人端「生活服务」选择下列业务。平台按当前账号角色加载菜单，业务名称可用于在菜单中查找入口。

## 通知公告

进入「通知公告」，按标题或正文关键词搜索，也可按公告场景筛选。点击卡片查看公告正文、发布信息及附件。详情中有可下载附件时，点击附件名称下载。个人端查询对外公告，提供只读查看。公告由有权限的运营人员在管理端维护，录入标题、场景、可见范围和正文，发布人及发布时间自动填写。公开公告应选择「对外」。

依据 `src/views/ToC/lifeServices/publicNotice.vue`、`src/features/public-services/public-notice/PublicNoticePage.vue`、`src/views/ToOManage/publicNotice.vue`。

## 园区动态

进入「园区动态」，搜索关键词或按动态类型、状态筛选，打开记录查看标题、时间、内容等信息。类型包括园区新闻、运营动态、建设进展、服务动态。入口具备动态台账的新建、编辑和删除能力。新增时填写标题、类型、发布人编号、发布时间和动态内容，场景类型选填。默认状态为「已发布」，页面也识别「草稿」「已下线」，没有单独发布审批或状态推进按钮。

依据 `src/views/ToC/lifeServices/parkNews.vue`、`src/features/life-services/park-news/ParkNewsPage.vue`、`src/service/api/modules/tocLifeServices.js`。

## 园区活动

进入「园区活动」，按活动场景或报名状态筛选，打开详情确认活动内容、地点和起止时间。活动记录可新建、编辑、删除。新增时填写标题、场景、地点、开始和结束时间、发布人编号、发布时间及活动内容。场景包括企业活动、公益活动、文体活动、培训沙龙。默认「报名中」，其他显示状态包括「草稿」「报名截止」「活动结束」「已取消」。这个入口维护活动信息及报名状态字段，页面没有参加人报名、签到或名额处理操作。

依据 `src/views/ToC/lifeServices/eventActivity.vue`、`src/features/life-services/event-activity/EventActivityPage.vue`、`src/service/api/modules/tocLifeServices.js`。

## 人才服务

进入「人才服务」，可按关键词和招聘状态查找职位，打开详情查看职位描述、公司、薪资和联系方式。招聘需求登记时填写职位名称、公司名称、薪资、联系方式、发布时间及职位描述，保存后默认「招聘中」。页面还显示「已暂停」「已截止」。当前用户模式和运营管理模式均提供职位记录的新建、编辑和删除表单能力，实际操作取决于账号权限。求职沟通通过记录中的联系方式，页面没有简历投递或面试流程。

依据 `src/views/ToC/lifeServices/talentService.vue`、`src/features/life-services/talent-service/TalentServicePage.vue`、`src/views/ToOManage/talentService.vue`。

## 调查问卷

进入「调查问卷」，按问卷标题或说明搜索，查看问卷名称、说明和起止时间，如有附件可在详情下载。个人端提供只读查询和附件下载，页面没有在线答题、交卷或结果统计。状态由结束时间计算为「进行中」或「已结束」。运营端「园区服务管理 → 问卷调查」可新增、编辑和删除，表单必填问卷标题、起止时间和说明，可附问卷文件，页面配置最多 9 个。

依据 `src/views/ToC/lifeServices/userSurvey.vue`、`src/features/life-services/user-survey/UserSurveyPage.vue`、`src/features/life-services/LifeServicesManagePage.vue`。

## 园区班车

进入「园区班车」，按线路名称、起点、终点或记录编号查询。详情提供起终点、首末班时间、发车间隔和备注。「运营中」或「休息中」由当前时间和配置的时刻表计算，页面没有车辆定位、实时到站或乘车预约。运营端「园区服务管理 → 园区班车」可新增、编辑和删除线路。线路名、起终点、首末班车时间、正整数分钟的发车间隔必填，备注选填。

依据 `src/views/ToC/lifeServices/shuttleBus.vue`、`src/features/life-services/shuttle-bus/ShuttleBusBoard.vue`、`src/features/life-services/LifeServicesManagePage.vue`。

## 旅行门票

进入「旅行门票」，按关键词、票种或销售状态筛选，打开详情查看景点、价格、折扣和门票说明。票种包括成人票、儿童票、学生票和团体票，状态有「在售」「售罄」「已下架」。个人端只提供目录查询，没有购票、出票或退款入口。运营端「园区服务管理 → 旅行门票」可新增、编辑和删除，需录入景点名称、门票类型、价格、折扣、门票说明。

依据 `src/views/ToC/lifeServices/travelTicket.vue`、`src/features/life-services/travel-ticket/TravelTicketPage.vue`、`src/features/life-services/LifeServicesManagePage.vue`。
