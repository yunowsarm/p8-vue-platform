# 园区运营端 · 招商线索、园区和房源

## 招商线索管理：新建、修改及分配线索

进入招商线索管理「线索管理」视图，点击「新建线索」，填写企业名称、联系人、联系电话、所属行业、团队规模、意向空间、需求面积、计划入住时间和渠道来源。渠道选其他时补填具体来源。创建后可从列表「修改」信息。待分配线索用「分配」选择人员；已分配线索用「重新分配」选择其他负责人，并必填重新分配理由。确认后查看分配状态和「分配历史」。分配动作与状态保存分别请求，若提示失败，先查看当前负责人、状态和分配历史再决定是否重试。

依据：`src/views/components/intentionInquiry/admin.vue`、`src/views/components/intentionInquiry/components/LeadManagementPage.vue`。

## 招商线索普通端：记录跟进和申请无效

从招商线索普通端打开当前账号负责的线索。已分配且未判定无效的线索可点「跟进」。填写跟进方式、本次跟进时间、沟通对象、意向度、线索状态和沟通纪要；选「暂缓跟进」时还要填写下次跟进时间。可补充意向面积、区域、预算、附件等。状态包括初步接触、意向确认、考察/洽谈中、谈判阶段、签约落地、暂缓跟进。需判为无效时在「更多 → 无效线索申请」填写理由并提交，通过「无效审批申请进度」查看流程。审批中或已通过的申请不可重复发起；已判无效的线索关闭跟进入口。

依据：`src/views/components/intentionInquiry/user.vue`、`src/views/components/intentionInquiry/components/LeadManagementPage.vue`、`src/views/components/processDialog/InvalidLeadApplication.vue`。

## 招商线索数据分析：理解分配、签约和逾期

从招商线索管理顶部切换「数据分析」，可联合筛选创建日期、渠道和当前负责人，并查看逾期、待分配、未跟进、高意向或无效线索明细。当前签约占比以筛选后所有线索为分母，分子排除无效线索。逾期依据最新跟进中的下次跟进时间，缺少该时间的线索没有逾期判定。最新记录优先按记录创建时间，缺失时用跟进时间。阶段分布表示当前阶段，历史阶段转化需另有逐阶段统计。页面读取全分页再统计，返回缺页或重复分页时报错。

依据：`src/views/components/intentionInquiry/analysis.vue`、`src/views/components/intentionInquiry/analysisData.js`、`src/views/components/intentionInquiry/ANALYSIS.md`。

## 园区管理：新增园区档案和维护基本资料

进入「园区管理」可查询园区并切换网格或列表视图。点「新建园区」，必填园区名称，按需要补录城市、详细地址、总建筑面积、可租面积、租金标准、园区定位、配套设施、交付标准或政策支持。园区状态可选运营中、招商中、已停用。保存后可从列表查看、修改或删除档案。配套设施可从字典选择，新增字典项时需填设施名称。租金标准是档案字段，实际费用以适用合同或计费依据为准。

依据：`src/views/houseProduct/parkManage.vue`、`src/service/api/modules/yqCustomPageApi.js`。

## 房源管理：查看销控图及修改房源状态

在房源管理页选「所属园区」后点「搜索」，通过销控图的楼栋、分区、楼层找到房源，可按全部、待招商、签约筛选。点房源打开详情，查看面积、层高、承重、货梯、租金标准、入驻企业、关联合同编号及附件图片（按记录提供）。「修改状态」将签约切回待招商，或将待招商切为签约；成功后刷新数据。这项操作写房源状态字段，企业档案、租赁合同签署及交接需在各自系统或单据中办理。楼栋标题栏的详情按钮当前只显示提示。

依据：`src/views/houseProduct/houseResourceManage.vue`、`src/service/api/modules/yqCustomPageApi.js`。
