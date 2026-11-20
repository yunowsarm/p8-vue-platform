# 园区运营端 · 物业报修与消防维保

## 物业报修处理：查询、指派并开始处理

进入物业报修处理页面，可按单号、地点、联系人和状态定位工单。打开详情核对报修类型、地点、联系人、故障说明及处理前附件。待处理工单点「指派并开始处理」，必选处理人员后提交，状态变为「处理中」。人员下拉读取人员目录，加载失败时按提示重试。工单办理中可用详情核对当前处理人及记录。发起报修使用企业端「物业报修」，运营处理走独立的报修处理页面。

依据：`src/views/ToB/propertyRepair/propertyRepairHandle.vue`、`src/service/api/modules/reportRepair.js`。

## 物业报修处理：办结、修改处理结果及附件

状态是「处理中」时点「完成处理」，填写必填处理结果，可上传处理后附件，单个不超过 10 MB、最多 9 个。提交成功后状态为「已完成」，详情提供处理前及处理后附件。已完成记录可点「修改」或详情中的「修改处理结果」，保存后仍为已完成，页面会写入本次保存的完成时间。列表有删除操作，需要确认。保存失败可根据工单最新状态再处理。

依据：`src/views/ToB/propertyRepair/propertyRepairHandle.vue`、`src/service/api/modules/reportRepair.js`。

## 消防设备维保：建立设备台账和类型

进入「消防设备维保 → 设备台账」，先检查设备类型字典。新增类型需填名称，同名会被页面拦截。新增或编辑设备时必填设备编号、名称、类型，按已有资料补录安装位置等。设备档案可查看关联计划和历史维保记录；关联了计划或历史记录的设备需保留档案，类型下有设备时无法删除类型。数据读取失败时写操作会停用，可从页面重新加载数据。

依据：`src/views/smartIOT/security/fireAlarm.vue`、`src/views/smartIOT/security/fireAlarm/DeviceLedger.vue`、`src/service/api/modules/maintenance.js`。

## 消防设备维保：安排计划及到期提醒

在「消防设备维保 → 维保计划」新增计划，也可从设备台账打开安排维保计划。必填计划名称、台账设备、第一次维保时间和养护频率，频率可选每月、每季度、每半年、每年。可设置提醒提前量，对应记录在「到期提醒」展示。每台设备若已有计划，可定位并编辑原计划；有历史维保记录的计划不能改动已确定的设备、首次时间和周期，也不能删除。页面按首次日期、频率和已登记次数计算本期时间，提前 7 天开放登记，到期和逾期亦可登记。

依据：`src/views/smartIOT/security/fireAlarm.vue`、`src/views/smartIOT/security/fireAlarm/PlanList.vue`、`src/service/maintenance.js`。

## 消防设备维保：登记本期结果和查看记录

从可以执行的维保计划进入本期登记，核对设备和计划时间。填写记录名称与实际养护日期，日期不得晚于当天。结果必选「合格」或「不合格」；不合格时必填问题及处理说明。可附图片、视频、PDF 或办公文档，最多 20 个且单个不超过 10 MB。保存后在「维保记录」查看，并按已登记周期更新下一期待办。若本期已登记或计划有变更，重新打开登记核对。收到保存成功但列表刷新失败的提示时，重新加载即可查询保存结果。

依据：`src/views/smartIOT/security/fireAlarm.vue`、`src/views/smartIOT/security/fireAlarm/RecordList.vue`、`src/service/maintenance.js`。
