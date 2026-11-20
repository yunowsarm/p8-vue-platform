# P8 企业端租赁申请

## 提交续租、退租或扩租申请

企业在「服务大厅 → 租赁申请」点「新增租赁申请」，选择续租、退租或扩租。三种类型均须填写企业名称、现租赁位置、联系人、联系电话和申请原因。申请日期由系统填写，可填补充说明，可上传申请附件（单个不超过 10 MB，最多 9 个）。

- 续租申请还需填写当前到期日、续租期限（12、24 或 36 个月）和续租起始日。
- 退租申请还需填写计划退租日和交接负责人。
- 扩租申请还需填写现租赁面积、拟扩租面积和期望启用日期，可填写意向位置。

填完后点「提交申请」，进入「待查阅」。

依据：`src/views/ToB/serviceHall/leaseApplication.vue`、`src/features/service-hall/lease-application/LeaseApplicationPage.vue`、`src/features/service-hall/lease-application/definition.js`。

## 查询租赁进度和修改申请

企业回到「服务大厅 → 租赁申请」，按申请类型或状态筛选，点开记录查看申请内容、状态和附件。待查阅和已查阅均可编辑，列表提供删除，确认后不可恢复。

运营人员在租赁申请管理页打开待查阅记录，系统将状态更新为「已查阅」。租赁申请页面记录「待查阅」「已查阅」两种状态。合同变更、现场交接、费用处理及最终办理结果需由租赁经办方确认。

依据：`src/features/service-hall/lease-application/LeaseApplicationPage.vue`、`src/features/service-hall/lease-application/definition.js`、`src/features/service-hall/lease-application/policies.js`、`src/views/ToOManage/leaseApplicationManage.vue`。
