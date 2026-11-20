# 政府端政策服务、匹配与项目申报

## 政策说明查询

在政府端「政策服务」进入政策说明，可切换「惠企政策」和「政策解读」，按标题关键词查询，查看摘要并点击记录打开原文。该入口复用企业端「惠企政策」查询页，仅提供内容检索，无在线申报动作。政策适用条件、申报期限和申报材料以所查询的政策原文为准。

依据 `src/views/ToG/policyServices/enterprisePolicy.vue`、`src/views/ToB/publicServices/benefitPolicy.vue`。

## 图文解读、政策订阅与推送

在「图文解读」可查询、登记、编辑和删除解读记录。新建须选择关联政策，填写解读标题、发布人 ID、发布时间和解读内容，记录显示「已发布」。此入口维护解读台账，未显示发布审批。

在「政策订阅」新建需填写用户 ID、用户类型、订阅政策类型和订阅时间。用户类型包括企业用户、园区工作人员和服务机构。订阅政策类型可多选，含科技创新、产业扶持、人才引进、绿色发展、融资服务。订阅默认「生效中」，在记录详情点「取消订阅」，状态更新为「已取消」。

在「政策推送」新建需选择推送政策、推送对象并填计划推送时间和推送人 ID。推送对象有全部园区企业、高新技术企业、科技型中小企业和指定企业。新建默认「待发送」，点「开始推送」变为「发送中」，再点「确认发送完成」变为「已完成」。这里的操作更新推送台账，未见实际消息投递、指定企业名单选择或送达回执操作。

当前图文解读、政策推送和智能匹配表单中的关联政策字段，选项由政策订阅记录接口提供；若选项与预期政策原文无法对应，应核实关联数据后再登记。

依据 `src/views/ToG/policyServices/policyInterpret.vue`、`src/views/ToG/policyServices/policySubscribe.vue`、`src/views/ToG/policyServices/policyPush.vue`、`src/views/ToG/policyServices/components/PolicyServiceBoard.vue`、`src/service/api/modules/togPolicyServices.js`。

## 智能匹配与转项目申报

在「智能匹配」可查询政策与企业的匹配记录，也可新建登记。新建须选择匹配政策及企业、填写 0 至 100 的匹配度与匹配时间，默认为「已匹配」。页面维护匹配度字段，未见自动计算匹配度或生成结果的操作。

打开待推进的匹配记录，点「推荐给企业」变为「已推荐」。进入详情点「转项目申报」，确认项目名称，补填联系人和联系电话，点「生成申报」。系统沿用匹配企业，写入当前申请时间，新建「待受理」的项目申报，随后把匹配记录更新为「已转申报」。若转换提示失败，先在「项目申报」查询是否已生成同一记录，再决定是否重试，因为新建申报和回写匹配状态依次提交。

依据 `src/views/ToG/policyServices/policyMatch.vue`、`src/views/ToG/policyServices/components/PolicyServiceBoard.vue`、`src/service/api/modules/togPolicyServices.js`。

## 项目申报受理与立项

从「项目申报」点新建，也可从「智能匹配」的已推荐记录转入。直接新建须选择申报企业，填写项目名称、申请时间、联系人和联系电话。记录默认「待受理」。在记录详情按顺序处理，由「受理申请」推进为「已受理」，由「提交审核」推进为「审核中」，由「确认立项」推进为「已立项」。该前端页面没有配置退回、驳回或申报附件操作。

依据 `src/views/ToG/policyServices/projectApplication.vue`、`src/views/ToG/policyServices/components/PolicyServiceBoard.vue`、`src/service/api/modules/togPolicyServices.js`。
