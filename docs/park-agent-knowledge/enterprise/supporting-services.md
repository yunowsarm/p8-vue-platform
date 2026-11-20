# P8 企业端配套服务办事流程

## 商机资源共享

在「配套服务 → 商机资源共享」点「发布商机」，填写商机标题、类型、联系人、联系电话和商机内容，点「保存商机」。可选择供需合作、项目招商、技术合作、采购需求或其他，发布企业和发布时间由系统填入。提交后进入「待审核」，企业可勾选「我发布的」查看进度。

运营人员打开待审核商机详情或审核操作时，系统将状态改为「审核中」，之后可通过或驳回。企业端公共列表默认展示已通过的商机。勾选「我发布的」后可编辑自己的待审核记录，已驳回记录可修改并「重新提交」，返回待审核。

依据：`src/features/supporting-services/business-opportunity/BusinessOpportunityPage.vue`、`src/features/supporting-services/SupportingServicesManagePage.vue`、`src/features/_shared/record-management/recordManager.js`。

## 企业需求

在「配套服务 → 企业需求」点「发布企业需求」，选择企业并填写发布时间、联系人、联系电话和需求内容，点「保存需求」。新记录默认「已发布」。可以从列表打开需求详情，查看需求内容和联系信息，页面提供编辑和删除。企业需求页的流程为信息发布维护。

依据：`src/views/ToB/supportServices/companyDemand.vue`、`src/features/supporting-services/company-demand/CompanyDemandPage.vue`。

## 设施设备租赁

在「配套服务 → 设施设备租赁」点「新增租赁」，选择设备类型（会议设备、展示设备、办公设备、活动设施或其他），填写租赁开始日期、租赁结束日期、联系人、联系电话和租赁用途，点「提交租赁」。初始为「待审核」，企业可在列表查询自己的申请。待审核时可编辑，已驳回时可修改并「重新提交」，返回待审核。

运营人员打开待审核详情或审核操作时，状态转为「审核中」，随后选择通过或驳回，企业在申请列表查看结果。

依据：`src/features/supporting-services/facility-rental/FacilityRentalPage.vue`、`src/features/supporting-services/SupportingServicesManagePage.vue`。

## 行业协会

在「配套服务 → 行业协会」按协会名称、联系人或地址搜索，点开查看协会介绍与联系信息。企业端为名录查询。运营人员新增或编辑协会记录时须填写协会名称、联系人、联系电话、地址和协会介绍，点「保存协会」。

依据：`src/views/ToB/supportServices/industryAssociation.vue`、`src/features/supporting-services/industry-association/IndustryAssociationPage.vue`。

## 创业导师

在「配套服务 → 创业导师」按导师姓名、头衔或专长搜索，可按专长筛选，点开查看导师介绍及联系方式。企业端为名录查询。运营人员新增或编辑导师记录时须填写姓名、头衔、专长、联系方式和导师介绍，点「保存导师」。

依据：`src/views/ToB/supportServices/startupMentor.vue`、`src/features/supporting-services/startup-mentor/StartupMentorPage.vue`。

## 服务机构

在「配套服务 → 服务机构」按机构名称、类型或地址搜索，可筛选法律服务、财税服务、知识产权、人力资源、金融服务等机构类型。点开查看机构简介与联系信息。企业端为名录查询。运营人员新增或编辑机构时须填写机构名称、机构类型、联系人、联系电话、地址和机构简介，点「保存机构」。

依据：`src/views/ToB/supportServices/serviceOrganization.vue`、`src/features/supporting-services/service-organization/ServiceOrganizationPage.vue`。
