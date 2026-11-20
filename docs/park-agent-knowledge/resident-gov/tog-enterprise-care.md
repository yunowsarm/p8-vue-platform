# 政府端企业关怀的工会服务与党群服务

## 提交企业关怀服务申请

进入政府端「企业关怀 → 工会服务」或「企业关怀 → 党群服务」，点击对应的「新建…申请」。从企业列表选择申请企业，填写申请时间、联系人、联系电话和服务内容，五项必填。服务内容可说明希望协助的事项和时间要求，输入上限为 1000 字。提交后状态为「待受理」。

列表可按服务编号、企业、联系人、服务内容查找，或按办理状态筛选。详情显示申请资料、处理人、处理时间和进度。页面还提供编辑、删除和批量删除台账数据的操作入口。

## 受理派单与办结

工会服务和党群服务共用办理方式。待受理时点「受理并派单」，填写处理人 ID 和受理时间并确认，状态进入「办理中」。办理完成后点「确认办结」，选择办结时间并确认，状态变为「已办结」。处理时间表单默认当前时间，可按实际处理时间调整。当前前端配置没有退回状态的推进按钮，也未显示附件上传或向申请方发送办理结果的操作。

依据 `src/views/ToG/enterpriseCare/unionService.vue`、`src/views/ToG/enterpriseCare/partyService.vue`、`src/views/ToG/enterpriseCare/components/EnterpriseCareBoard.vue`、`src/service/api/modules/togEnterpriseCareServices.js`。
