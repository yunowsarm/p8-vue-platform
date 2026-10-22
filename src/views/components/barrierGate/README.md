# 道闸管理

道闸入口：`components/barrierGate/barrierGate.vue`；独立车辆登记入口：`components/barrierGate/carOwnershipManage.vue`。沿用现有 Vue 2、Element UI、ECharts 及平台 axios 登录态。

两个入口组件保留在模块外层；数据展示、数据分析子组件位于 `components/`，接口、统计方法、图表公共逻辑和图标仍由模块统一维护。

- 数据展示：参考 `electricitySummary/index.vue` 的查询栏、图标切换与 keep-alive 子视图。`BarrierDataView.vue` 使用四宫格展示趋势、出入明细、停车时长及通道排行。
- 数据分析：进出次数、去重车辆、平均停留、实收金额、企业关联率、每日趋势、小时分布、停车时长、通道排行及企业汇总。
- 报告导出：分析视图右上角支持下载独立 HTML 报告，或打开打印窗口保存为 PDF。使用已应用的日期、车牌、企业和登记状态筛选，包含指标、结论、四张图表、全部企业及通道汇总、每日和小时统计；不受页面虚拟表格可见行数或通道图前 10 名限制。加载中或无记录时禁用。`report.js` 负责报告生成，导出内容在本地生成。
- 车辆登记：在独立的 `carOwnershipManage.vue` 中新增、查询详情、编辑、删除；企业从现有企业目录选择，也可输入全称。按 `companyName` 保存关联，不发送截图中未定义的企业 ID。车牌会去空格并转大写，同一车牌重复登记不会任意关联企业。
- 导入：校验 `.xls/.xlsx`、文件大小和原始中文表头，预览前五条；通过 FormData 上传原文件，成功后重新加载服务端数据。

## 待后端联调确认的约定

用户提供了路径和车辆实体，未提供 HTTP 方法、出入记录实体和响应样例。请求定义统一位于 `src/service/api/modules/barrierGate.js`，使用 `parkingAccessRecord` 和 `parkingVehicleInfo` 命名空间，由平台自动注册到 `$api`。完整分页加载及业务响应检查位于 `src/service/barrierGate.js`；字段适配位于本模块 `data.js`。以下约定需按实际接口确认：

| 接口 | 当前方法及参数 |
| --- | --- |
| `/parking/access-record/list` | GET，`pageNo`、`pageSize` |
| `/parking/access-record/import` | POST，FormData 字段 `file` |
| `/parking/vehicleInfo/list` | GET，`pageNo`、`pageSize` |
| `/parking/vehicleInfo/add` | POST，车辆 JSON |
| `/parking/vehicleInfo/edit` | PUT，车辆 JSON，包含 `id` |
| `/parking/vehicleInfo/delete` | DELETE，查询参数 `id` |
| `/parking/vehicleInfo/queryById` | GET，查询参数 `id` |

基础地址使用平台 `API_DEFAULT_CONFIG`，响应兼容平台已解包数据、`result`、`data` 和 `records/total`。出入记录英文候选字段及中文 Excel 列名集中于 `recordFields`；日期支持 ISO、`yyyy-MM-dd HH:mm:ss` 及毫秒时间戳。

原始 Excel 最后一行包含汇总，预览只计入含车牌的明细。服务端收到原文件后也应跳过汇总行，完成类型校验、重复导入控制和行级错误反馈；前端不把本地预览当作已导入数据。

## 统计口径

出入明细、企业分析及车辆档案均使用固定高度的 VXE 虚拟表格，开启纵向虚拟滚动；多列明细同时开启横向虚拟滚动。完整列表不采用普通表格一次渲染所有行，也不以本地分页替代虚拟滚动。加载结果冻结以避免 Vue 2 对大量记录递归建立响应式属性；输入查询条件后点击查询统一应用，避免每次键入重新关联和统计全部数据。导入预览最多五行，保留轻量普通表格。

先完整读取记录及车辆档案，再在本地筛选、展示和分析；最多加载各 50,000 条，超过或遇到重复分页、总数变化、缺页时明确报错，不展示截断统计。更大数据量需后端提供带时间条件的查询或统计接口。

日期范围包含该期内进入或离开的记录，进出次数各按实际发生日期计入。跨日停车不会把期外事件计入期内次数。平均停留仅使用进出时间均有效且非逆序的完整停车记录，金额按所选记录计入，不作为期间收款流水。空金额不视为有效零金额；无有效金额或完整停留时间显示破折号。

企业关联使用当前车辆档案，不表示历史归属。缺少离开时间不直接推断为当前在场车辆。多个同车牌档案标为登记冲突；个人及未登记车辆没有企业时汇总到“未关联企业”。

## 验证

`node --test tests/barrierGate.test.cjs` 覆盖跨日统计、无效时间、空金额、时长边界、企业关联冲突、完整分页、业务失败和请求参数。

`node --test tests/barrierGate-report.test.cjs` 验证报告筛选口径、完整汇总、内容转义、HTML 下载、PDF 打印窗口及无数据禁用。
