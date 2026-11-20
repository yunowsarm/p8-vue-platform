# 园区运营端 · 企业服务受理

## 服务大厅管理：回复企业诉求反馈

运营人员进入「服务大厅管理 → 诉求反馈」，办理企业的建议、投诉和服务需求。按关键词、类型或状态定位记录。打开「待查阅」诉求详情时，页面会尝试写入「已查阅」；详情加载异常时，侧栏可保留列表中的基础信息。点击「回复」，核对诉求信息，填写必填的回复内容并提交。成功后状态为「已回复」，该记录关闭回复入口。此流程的状态依次为待查阅、已查阅、已回复。管理列表支持删除，删除前会确认。

依据：`src/views/ToOManage/serviceHallManage.vue`、`src/features/service-hall/complaint-suggestion/ComplaintSuggestionPage.vue`。

## 服务大厅管理：审核数据上报、资质认定、资源对接

运营人员在「服务大厅管理」中切换「数据上报」「资质认定」「资源对接」，在对应列表定位企业申请。对待审核记录打开详情或点击「审核」时，页面会尝试把状态写成「审核中」。在审核窗口核对申请资料，选择「已通过」或「已驳回」，可填写备注，确认提交。待审核、审核中可办理，已通过、已驳回为页面所列结果。打开审核窗口时若状态更新失败，页面关闭窗口并提示重试。三个标签处理各自的申请，审核结果以对应记录为准。

依据：`src/features/service-hall/ServiceHallManagePage.vue`、`src/features/service-hall/data-report/DataReportPage.vue`、`src/features/service-hall/qualification-recognition/QualificationRecognitionPage.vue`、`src/features/service-hall/resource-connection/ResourceConnectionPage.vue`、`src/features/_shared/record-management/recordManager.js`。

## 租赁申请管理：查阅续租、退租、扩租

运营人员进入「租赁申请管理」，可按申请类型、查阅状态筛选，按申请编号或企业等信息定位。打开「待查阅」详情，页面尝试更新为「已查阅」。可核对联系方式、现租赁位置、申请原因及附件。续租另查到期日、续租期限和起始日；退租另查计划退租日、交接负责人；扩租另查现租赁面积、拟扩租面积和期望启用日期。页面业务状态为待查阅和已查阅，已查阅仅表示查看过申请。租赁合同的审批、生效和交接需以对应业务凭证为准。

依据：`src/views/ToOManage/leaseApplicationManage.vue`、`src/features/service-hall/lease-application/definition.js`、`src/features/service-hall/lease-application/policies.js`、`src/features/_shared/record-management/recordManager.js`。

## 配套服务管理：审核商机资源、会议室预定及设施设备租赁

运营人员在「配套服务管理」选择「商机资源」「会议室预定」或「设施设备租赁」。商机和设备租赁在待审核时打开详情或审核窗口，会尝试更新为「审核中」；选择「已通过」或「已驳回」并提交。会议室待确认时打开详情或确认窗口，会尝试进入「确认中」，可提交「已预定」或「已驳回」。会议室记录的结束时间早于当前时间时，列表显示「已过期」，审核入口不可用。可在结果弹窗填写备注。状态更新失败时查看页面提示并重新核对记录。

依据：`src/features/supporting-services/SupportingServicesManagePage.vue`、`src/features/supporting-services/business-opportunity/BusinessOpportunityPage.vue`、`src/features/supporting-services/meeting-room-booking/MeetingRoomBookingPage.vue`、`src/features/supporting-services/facility-rental/FacilityRentalPage.vue`。

## 配套服务管理：维护协会、导师、服务机构名录

运营人员在「配套服务管理」切换「行业协会」「创业导师」「服务机构」，选择新增、编辑或删除。行业协会必填协会名称、联系人、联系电话、地址和协会介绍。创业导师必填姓名、头衔、专长、联系方式和导师介绍。服务机构必填机构名称、机构类型、联系人、联系电话、地址和机构简介。完成表单后保存，删除前核对目标并确认。三个标签面向目录维护，名录记录以列表保存结果为准。

依据：`src/features/supporting-services/SupportingServicesManagePage.vue`、`src/features/supporting-services/industry-association/IndustryAssociationPage.vue`、`src/features/supporting-services/startup-mentor/StartupMentorPage.vue`、`src/features/supporting-services/service-organization/ServiceOrganizationPage.vue`。
