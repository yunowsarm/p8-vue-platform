# P8 企业端服务大厅办事流程

## 诉求反馈（投诉建议）

企业在「服务大厅 → 诉求反馈」点「新增诉求」，选择建议、投诉或服务需求，填写联系人、联系电话和内容，点「提交」。系统记录提交时间，新诉求为「待查阅」。

运营人员打开待查阅的诉求详情后，系统将状态更新为「已查阅」。运营人员点击「回复」，填写回复内容并「提交回复」，状态变为「已回复」。企业可在原列表按状态查找并点开诉求查看回复。待查阅、已查阅时可编辑，页面提供删除并要求确认。

诉求反馈中的「服务需求」是诉求类型。服务大厅的「服务需求」独立页面有自己的表单和处理状态。

依据：`src/views/ToB/serviceHall/complaintSuggestion.vue`、`src/features/service-hall/complaint-suggestion/ComplaintSuggestionPage.vue`、`src/features/service-hall/ServiceHallManagePage.vue`。

## 数据上报

企业在「服务大厅 → 数据上报」点「新增数据上报」，选择知识产权、财务数据或员工数据，填写上报内容，可上传附件（单个不超过 10 MB，最多 9 个），点「提交上报」。系统填入企业显示信息和上报时间。提交后可在列表和详情查看状态及附件。

数据上报初始为「待审核」。运营人员打开待审核详情或审核操作后，状态转为「审核中」，核对内容和附件后选择「通过」或「驳回」并确认。企业可修改待审核记录，已驳回时可修改并「重新提交」，重新进入待审核。政务端「数据上报统计」只读查看审核通过的记录及附件。

依据：`src/features/service-hall/data-report/DataReportPage.vue`、`src/views/ToG/governmentServices/govDataReport.vue`、`src/features/_shared/record-management/recordManager.js`。

## 资质认定

企业在「服务大厅 → 资质认定」点「新增认定申请」，选择高新技术企业、专精特新企业、科技型中小企业或创新型中小企业，填写联系人、联系电话和申请原因（最多 1000 字），可上传申请附件（单个不超过 10 MB，最多 9 个），点「提交申请」。

资质认定申请先进入「待审核」。运营人员打开待审核详情或审核操作后，状态转为「审核中」，可查看材料并选择通过或驳回。企业在列表或详情查看园区审核结论，待审核时可编辑，已驳回时可修改并「重新提交」，返回待审核。

依据：`src/features/service-hall/qualification-recognition/QualificationRecognitionPage.vue`、`src/features/_shared/record-management/RecordAuditDialog.vue`、`src/features/_shared/record-management/recordManager.js`。

## 资源对接

企业在「服务大厅 → 资源对接」点「新增对接申请」，选择技术、人才、金融、市场或场地资源，填写对接目标、联系人、联系电话、资源描述和对接内容，可填写备注，点「提交申请」。

资源对接申请先进入「待审核」。运营人员打开待审核详情或审核操作后，状态转为「审核中」，选择通过或驳回并确认。企业可按状态筛选和查看详情，待审核时可编辑，已驳回时可修改并「重新提交」，返回待审核。

依据：`src/features/service-hall/resource-connection/ResourceConnectionPage.vue`、`src/features/_shared/record-management/recordManager.js`。

## 媒体宣传

企业在「服务大厅 → 媒体宣传」点「新增宣传申请」，选择企业、宣传渠道（园区公众号、园区官网、媒体专栏或线下活动），填写申请时间、联系人、联系电话和宣传内容，点「提交申请」。初始状态为「待审核」，可在原列表和详情查看结果，列表提供编辑和删除。

媒体宣传页面的审核配置允许将「待审核」改为「处理中」「已拒绝」或「已关闭」，将「处理中」改为「已通过」「已拒绝」或「已关闭」，并可填写审核意见。当前服务大厅管理聚合页没有媒体宣传页签，生产受理入口待确认。

依据：`src/views/ToB/serviceHall/mediaPromotion.vue`、`src/features/service-hall/media-promotion/MediaPromotionPage.vue`、`src/features/service-hall/ServiceHallManagePage.vue`。

## 服务需求

企业在「服务大厅 → 服务需求」点「新增服务需求」，选择企业和需求类型，填写提交时间、联系人、联系电话和需求内容，可补充备注，点「提交」。类型包括政务服务咨询、企业运营服务、人才与招聘服务、政策申报服务、场地与设施服务和其他服务。初始为「待受理」，可查阅进度，列表提供编辑和删除。

服务需求页面的处理配置允许将「待受理」改为「处理中」或「已关闭」，将「处理中」改为「已完成」或「已关闭」，可附处理备注。当前服务大厅管理聚合页没有独立的服务需求页签，生产受理入口待确认。

依据：`src/views/ToB/serviceHall/serviceNeeds.vue`、`src/features/service-hall/service-request/ServiceRequestPage.vue`、`src/features/service-hall/ServiceHallManagePage.vue`。
