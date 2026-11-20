# 政府端行政审批与数据上报统计

## 行政审批服务

进入政府端「政府服务 → 行政审批服务」，点击「新建行政审批服务」。填企业 ID、审批类型、申请时间、联系人和联系电话，再点「提交」。审批类型可选行政许可、备案登记、事项确认和其他审批。提交后为「待受理」。可按编号、企业 ID、审批类型或状态查找记录，点卡片看详情。

待受理记录可以编辑。处理人员在列表或详情点「推进至」并确认，按「待受理 → 已受理 → 审批中 → 已办结」推进。页面记录办理状态，未显示材料上传、审批意见、证照出件或驳回流程，也未开放删除按钮。具体行政审批的法定条件、材料和最终决定以实际主管部门为准。

依据 `src/views/ToG/governmentServices/govApproval.vue`、`src/views/ToG/governmentServices/components/GovernmentServiceBoard.vue`、`src/service/api/modules/togGovernmentServices.js`。

## 数据上报统计

政府端「政府服务 → 数据上报统计」可搜索上报编号、企业或内容，并按知识产权、财务数据或员工数据分类筛选。该页只列出「已通过」的企业上报，可查看详情及下载附件。新建和修改请走企业端「办事大厅 → 数据上报」，审核由运营管理端办理。政府端统计入口为只读，不提供填报、审核或推进状态的按钮。

依据 `src/views/ToG/governmentServices/govDataReport.vue`、`src/features/service-hall/data-report/DataReportPage.vue`、`src/views/ToB/serviceHall/dataReport.vue`。
