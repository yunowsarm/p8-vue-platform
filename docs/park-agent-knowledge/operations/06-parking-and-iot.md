# 园区运营端 · 道闸、车辆登记及智慧物联

## 道闸管理：查询车辆进出和导出分析报告

道闸管理的「数据展示」「数据分析」可以按日期、车牌号、企业和登记状态查询。设置筛选后点「查询」；分析可查看进出次数、去重车辆、平均停留、实收金额、时长分布、通道排行及企业汇总。「数据分析」支持下载 HTML 或打开打印窗口保存为 PDF，导出基于已应用筛选。进出次数按各自发生日期计，企业归属取当前档案；平均停留仅使用进出时间完整且顺序有效的记录。缺少离开时间仅说明记录不完整，实际在场需另行核实；实收金额按筛选记录汇总，对账需按财务流水核对。

依据：`src/views/components/barrierGate/barrierGate.vue`、`src/views/components/barrierGate/data.js`、`src/views/components/barrierGate/README.md`。

## 道闸管理：导入车辆出入记录

在道闸管理点击「导入」，选择原始 Excel 导出文件。格式为 .xls 或 .xlsx，非空且不超过 20 MB。首张工作表首行须包含「车牌号」「进入时间」「离开时间」，预览去掉无车牌和汇总行，最多展示前五条明细。有有效明细才可点击「开始导入」。页面上传原文件，收到成功返回后重新加载服务端数据。预览只用于核对文件，重复导入处理、服务端行级反馈及正式入库结果以接口返回和刷新后的列表为准。

依据：`src/views/components/barrierGate/barrierGate.vue`、`src/service/api/modules/barrierGate.js`、`src/views/components/barrierGate/README.md`。

## 车辆登记：登记车牌和关联企业

进入独立「车辆登记」页面，可按车牌号、企业查询，点击「登记车辆」新增。车牌号必填，保存时去空格并转大写；可填写关联企业、车主姓名和电话、车牌颜色、车辆类型、车位号。企业可从企业目录选择，也可输入企业全称；目录加载失败时仍可手输。已有相同车牌时页面提示编辑现有记录。删除前须确认，删除登记会影响按当前档案统计的企业关联情况。现场闸机放行和停车缴费由相应通行、缴费业务确认。

依据：`src/views/components/barrierGate/carOwnershipManage.vue`、`src/views/components/barrierGate/data.js`、`src/service/api/modules/barrierGate.js`。

## 智慧物联通行页面：停车、门禁、访客和梯控演示

智慧物联下的停车、门禁、访客和梯控页面，在当前源码中由前端模拟数据驱动。可识别的界面包括车位与出入口、车辆权限、门区事件、预约审批、在园管理、权限联动、梯控总览等。设备状态、访客凭证和通行处理提示属于演示数据；实际放行、退款、审批、发证及权限下发应以部署后的系统和正式记录为准。梯控页查询的平台按钮权限，仅用于控制新增按钮显示。查阅停车出入历史使用独立道闸管理，维护车辆企业归属使用独立车辆登记。

依据：`src/views/smartIOT/passage/parking.vue`、`src/views/smartIOT/passage/accessControl.vue`、`src/views/smartIOT/passage/visitor.vue`、`src/views/smartIOT/passage/elevatorControl.vue`。

## 智慧物联安防页面：视频、周界、巡更和对讲演示

智慧物联下的视频 AI、周界、巡更和对讲页面在当前源码中读取前端模拟数据。界面可演示视频告警汇总、周界防区与设备、巡更路线与计划、对讲呼叫等，页面消息用于说明界面交互。回答实时事件、派单、调度和设备状态时，需要已接通的业务数据源或现场系统确认。消防设备维保走独立的设备台账、维保计划、记录和提醒，组件连接维保业务接口。

依据：`src/views/smartIOT/security/videoAI.vue`、`src/views/smartIOT/security/perimeter.vue`、`src/views/smartIOT/security/patrol.vue`、`src/views/smartIOT/security/intercom.vue`、`src/views/smartIOT/security/fireAlarm.vue`。

## 智慧物联能耗页面：用水、用电、照明演示

智慧物联下的用水、用电和照明页面从前端模拟模块取数。按页面可了解能耗总览、表计或回路、异常、照明策略等界面结构。示例趋势、异常工单、开关和节能策略操作仅反映演示行为。园区实际表计、用量、设备开关、节能结果和计费金额应以部署环境的相应业务接口与记录为准。

依据：`src/views/smartIOT/energy/waterEnergy.vue`、`src/views/smartIOT/energy/powerEnergy.vue`、`src/views/smartIOT/energy/lightingEnergy.vue`、`src/views/smartIOT/mock/energyMockData.js`。
