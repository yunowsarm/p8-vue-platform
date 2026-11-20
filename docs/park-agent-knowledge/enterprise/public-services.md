# P8 企业端公共服务办事流程

## 在线咨询

企业在「公共服务 → 在线咨询」点「发起咨询」，填写联系电话、咨询时间和咨询内容，点「提交咨询」。咨询人随登录信息填充，新咨询为「待回复」。回到列表，可按咨询编号、咨询人、内容或状态查找，点开详情查看回复人及回复内容。

运营人员对待回复记录点「回复」，填写回复人联系方式和回复内容，点「提交回复」，状态变为「已回复」。列表还显示「处理中」「已关闭」等状态选项。当前页面实现的处理动作是回复。

依据：`src/views/ToB/publicServices/onlineConsultation.vue`、`src/features/public-services/online-consultation/OnlineConsultationPage.vue`、`src/views/ToOManage/onlineConsultation.vue`。

## 惠企政策与政策解读

进入「公共服务 → 惠企政策」，切换「惠企政策」或「政策解读」，按政策标题搜索。列表展示标题、摘要、发布单位及时间等信息。点开含链接的条目，在新窗口打开对应政策或解读。该入口提供政策资料查询，具体申报条件、材料和受理安排以相应政策原文为准。政务端「惠企政策」复用该查询页面。

依据：`src/views/ToB/publicServices/benefitPolicy.vue`、`src/views/ToG/policyServices/enterprisePolicy.vue`、`src/service/api/modules/tobPublicServices.js`。

## 通知公告

企业在「公共服务 → 通知公告」按标题、内容或公告场景查找，点开查看发布人、发布时间、正文及可用附件。企业端为只读阅览。

运营人员可在公告管理中点「发布公告」，填写公告标题、公告内容，选择公告场景（园区动态、企业动态、安全提醒、活动通知）和可见范围（对内或对外），可添加附件，发布后可在管理列表编辑和删除。

依据：`src/views/ToB/publicServices/publicNotice.vue`、`src/features/public-services/public-notice/PublicNoticePage.vue`、`src/features/public-services/public-notice/definition.js`、`src/views/ToOManage/publicNotice.vue`。

## 资料下载

企业进入「公共服务 → 资料下载」，按资料标题、描述或分类查找。分类包含办事指南、表单模板、园区手册、宣传资料和其他。点「查看并下载」，打开详情并点击可用附件。企业端为只读下载。

运营人员在资料管理中点「新增资料」，填写资料标题、分类和描述，可添加附件，单个不超过 10 MB，最多 9 个，完成后点「保存资料」。

依据：`src/views/ToB/publicServices/documentDownload.vue`、`src/features/public-services/document-download/DocumentDownloadPage.vue`、`src/features/public-services/document-download/definition.js`。

## 园区活动

在「公共服务 → 园区活动」可按关键词、活动场景和状态查找，点开活动查看时间、地点和内容。页面提供活动资讯浏览和发布维护，参加活动的安排以活动详情为准。

使用「新增园区活动」时须填写活动标题、活动场景（企业服务、文体活动、培训沙龙或招商活动）、开始时间、结束时间、活动地点、发布人、发布时间和活动内容，点「保存活动」。新记录默认「已发布」，可编辑或删除。

依据：`src/views/ToB/publicServices/parkActivity.vue`、`src/features/public-services/park-activity/ParkActivityPage.vue`。

## 安全专栏

在「公共服务 → 安全专栏」按标题、关键词、安全类型或状态查找，点开查看文章。新增安全文章须填写标题、发布人、发布时间、文章内容，选择消防安全、生产安全、治安安全或应急演练，点「保存文章」。新记录默认「已发布」，可编辑或删除。安全专栏用于查看和维护文章资讯。

依据：`src/views/ToB/publicServices/safetyColumn.vue`、`src/features/public-services/safety-column/SafetyColumnPage.vue`。

## 园区动态

在「公共服务 → 园区动态」可查阅动态。使用「新增园区动态」须填写标题、动态类型、场景类型、发布人、发布时间和动态内容，点「保存动态」。动态类型包括园区运营、园区建设、企业服务和招商动态，场景包括园区内、园区外、线上活动。新记录默认「已发布」，可编辑或删除。

依据：`src/views/ToB/publicServices/parkNews.vue`、`src/features/public-services/park-news/ParkNewsPage.vue`。

## 企业动态

在「公共服务 → 企业动态」可按企业、标题或内容查询。使用「新增企业动态」须选择企业、填写标题、发布时间和动态内容，选择企业新闻、产品发布、荣誉成果或合作动态，点「保存动态」。新记录默认「已发布」，可编辑或删除。

依据：`src/views/ToB/publicServices/enterpriseNews.vue`、`src/features/public-services/enterprise-news/EnterpriseNewsPage.vue`。
