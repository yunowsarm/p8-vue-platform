/**
 * 智慧物联平台仿真数据（按模块划分，集中存放）
 */

export const perimeter = {
  kpis: [
    { title: '周界设备', value: 48, unit: '台', sub: '44 台在线', type: 'primary', icon: 'el-icon-cpu' },
    { title: '布防防区', value: 11, unit: '个', sub: '共 12 个防区', type: 'success', icon: 'el-icon-lock' },
    { title: '未处置告警', value: 4, unit: '条', sub: '1 条超时', type: 'danger', icon: 'el-icon-warning-outline' },
    { title: '今日告警', value: 9, unit: '条', sub: '较昨日 -18%', type: 'warning', icon: 'el-icon-bell' },
    { title: '设备异常', value: 4, unit: '台', sub: '离线 2 / 故障 2', type: 'info', icon: 'el-icon-connection' },
    { title: '今日误报率', value: 6.7, unit: '%', sub: '目标 ≤ 8%', type: 'cyan', icon: 'el-icon-data-analysis' }
  ],
  buildings: [
    { id: 'B1', name: 'A 栋研发楼', x: 25, y: 25, w: 21, h: 22 },
    { id: 'B2', name: 'B 栋生产楼', x: 54, y: 24, w: 24, h: 24 },
    { id: 'B3', name: '综合服务中心', x: 32, y: 60, w: 20, h: 17 },
    { id: 'B4', name: '物流仓储', x: 66, y: 62, w: 19, h: 17 }
  ],
  zones: [
    { id: 'Z01', code: 'E-01', name: '东侧围墙', type: '围墙', armed: true, status: '正常', deviceCount: 10, onlineCount: 10, x: 91, y: 38, mapStyle: { right: '4.5%', top: '12%', width: '5px', height: '70%' } },
    { id: 'Z02', code: 'W-01', name: '西侧围栏', type: '围栏', armed: true, status: '正常', deviceCount: 8, onlineCount: 8, x: 8, y: 42, mapStyle: { left: '5%', top: '15%', width: '5px', height: '66%' } },
    { id: 'Z03', code: 'S-01', name: '南门出入口', type: '出入口', armed: true, status: '正常', deviceCount: 7, onlineCount: 7, x: 48, y: 89, mapStyle: { left: '10%', bottom: '7%', width: '34%', height: '5px' } },
    { id: 'Z04', code: 'N-01', name: '北门出入口', type: '出入口', armed: false, status: '临时撤防', deviceCount: 6, onlineCount: 5, x: 48, y: 8, mapStyle: { left: '11%', top: '7%', width: '35%', height: '5px' } },
    { id: 'Z05', code: 'L-01', name: '物流闸口', type: '出入口', armed: true, status: '设备故障', deviceCount: 9, onlineCount: 7, x: 80, y: 88, mapStyle: { right: '9%', bottom: '7%', width: '31%', height: '5px' } },
    { id: 'Z06', code: 'D-01', name: '宿舍区围墙', type: '围栏', armed: true, status: '正常', deviceCount: 8, onlineCount: 7, x: 22, y: 85, mapStyle: { left: '5%', bottom: '7%', width: '5px', height: '18%' } }
  ],
  devices: [
    { id: 'CAM-E01', name: '东墙智能枪机-01', type: '摄像机', zoneId: 'Z01', zone: '东侧围墙', status: '在线', armed: '布防', health: '正常', signal: 98, x: 88, y: 30, updatedAt: '2026-07-20 10:28:32' },
    { id: 'CAM-E02', name: '东墙智能球机-02', type: '摄像机', zoneId: 'Z01', zone: '东侧围墙', status: '在线', armed: '布防', health: '正常', signal: 96, x: 88, y: 60, updatedAt: '2026-07-20 10:28:30' },
    { id: 'RAD-E01', name: '东墙毫米波雷达', type: '雷达', zoneId: 'Z01', zone: '东侧围墙', status: '在线', armed: '布防', health: '正常', signal: 91, x: 84, y: 46, updatedAt: '2026-07-20 10:28:26' },
    { id: 'RAD-W01', name: '西侧周界雷达', type: '雷达', zoneId: 'Z02', zone: '西侧围栏', status: '在线', armed: '布防', health: '正常', signal: 93, x: 11, y: 42, updatedAt: '2026-07-20 10:28:18' },
    { id: 'IR-W01', name: '西侧三光束对射', type: '红外对射', zoneId: 'Z02', zone: '西侧围栏', status: '在线', armed: '布防', health: '轻微遮挡', signal: 86, x: 11, y: 65, updatedAt: '2026-07-20 10:27:59' },
    { id: 'CAM-S01', name: '南门全景摄像机', type: '摄像机', zoneId: 'Z03', zone: '南门出入口', status: '在线', armed: '布防', health: '正常', signal: 99, x: 47, y: 84, updatedAt: '2026-07-20 10:28:35' },
    { id: 'IR-N01', name: '北门红外对射', type: '红外对射', zoneId: 'Z04', zone: '北门出入口', status: '离线', armed: '撤防', health: '通信中断', signal: 0, x: 43, y: 12, updatedAt: '2026-07-20 10:11:09' },
    { id: 'CAM-N01', name: '北门高点全景', type: '摄像机', zoneId: 'Z04', zone: '北门出入口', status: '在线', armed: '撤防', health: '正常', signal: 95, x: 55, y: 13, updatedAt: '2026-07-20 10:28:12' },
    { id: 'CAM-L01', name: '物流闸口球机', type: '摄像机', zoneId: 'Z05', zone: '物流闸口', status: '故障', armed: '布防', health: '镜头遮挡', signal: 82, x: 78, y: 83, updatedAt: '2026-07-20 10:16:33' },
    { id: 'RAD-L01', name: '物流闸口雷达', type: '雷达', zoneId: 'Z05', zone: '物流闸口', status: '在线', armed: '布防', health: '正常', signal: 89, x: 70, y: 83, updatedAt: '2026-07-20 10:28:02' },
    { id: 'RAD-D01', name: '宿舍区周界雷达', type: '雷达', zoneId: 'Z06', zone: '宿舍区围墙', status: '在线', armed: '布防', health: '正常', signal: 90, x: 17, y: 78, updatedAt: '2026-07-20 10:27:48' },
    { id: 'SL-D01', name: '宿舍东南角声光终端', type: '声光报警器', zoneId: 'Z06', zone: '宿舍区围墙', status: '故障', armed: '布防', health: '继电器故障', signal: 76, x: 25, y: 82, updatedAt: '2026-07-20 09:52:41' }
  ],
  rules: [
    { id: 'R-001', name: '东侧围墙人员越界', zones: ['东侧围墙'], events: ['越界', '攀爬', '翻越'], targets: ['人'], period: '全天', duration: '2 秒', sensitivity: 85, source: '视频+雷达', status: '启用', updatedAt: '2026-07-18 14:20' },
    { id: 'R-002', name: '西侧围栏复合入侵', zones: ['西侧围栏'], events: ['区域入侵', '攀爬'], targets: ['人', '车辆'], period: '20:00 - 07:00', duration: '3 秒', sensitivity: 78, source: '雷达+红外', status: '启用', updatedAt: '2026-07-19 09:15' },
    { id: 'R-003', name: '南门非工作时段徘徊', zones: ['南门出入口'], events: ['长时间徘徊'], targets: ['人'], period: '23:00 - 05:30', duration: '120 秒', sensitivity: 72, source: '视频', status: '启用', updatedAt: '2026-07-16 18:40' },
    { id: 'R-004', name: '物流闸口车辆闯入', zones: ['物流闸口'], events: ['越界', '区域入侵'], targets: ['车辆'], period: '22:00 - 06:00', duration: '5 秒', sensitivity: 80, source: '视频+雷达', status: '启用', updatedAt: '2026-07-17 11:28' },
    { id: 'R-005', name: '北门临时施工规则', zones: ['北门出入口'], events: ['区域入侵'], targets: ['人', '车辆'], period: '18:00 - 07:00', duration: '8 秒', sensitivity: 60, source: '视频', status: '暂停', updatedAt: '2026-07-20 08:00' }
  ],
  strategies: [
    { scene: '绿植摇摆', icon: 'el-icon-grape', enabled: true, summary: '排除树冠区域，开启轨迹连续性判断', sensitivity: 68 },
    { scene: '小动物', icon: 'el-icon-guide', enabled: true, summary: '目标尺寸过滤 < 0.6m，人车分类二次确认', sensitivity: 72 },
    { scene: '雨雪雾', icon: 'el-icon-heavy-rain', enabled: true, summary: '恶劣天气模型，需视频与雷达双鉴', sensitivity: 62 },
    { scene: '强光逆光', icon: 'el-icon-sunny', enabled: false, summary: '开启宽动态补偿，日落时段降低灵敏度', sensitivity: 65 },
    { scene: '临时施工', icon: 'el-icon-office-building', enabled: true, summary: '限时撤防，设置施工排除区与到期自动复布', sensitivity: 55 }
  ],
  alarms: [
    { id: 'A20260720001', level: '紧急', type: '翻越', target: '人', zone: '东侧围墙', zoneId: 'Z01', device: 'CAM-E01 / RAD-E01', time: '2026-07-20 10:26:42', status: '待确认', snapshot: '已保存 3 张', video: '10:26:27 - 10:27:12', duration: '7 秒', assignee: '未派单', response: '已等待 02:18', x: 88, y: 33, linked: ['球机预置位 3', '东区声光', '安保移动端'], traces: [{ time: '10:26:42', action: '告警上报', user: '系统', remark: '视频与雷达双鉴通过' }, { time: '10:26:44', action: '联动执行', user: '系统', remark: '附近球机转向预置位 3，移动端已推送' }] },
    { id: 'A20260720002', level: '重要', type: '长时间徘徊', target: '人', zone: '南门出入口', zoneId: 'Z03', device: 'CAM-S01', time: '2026-07-20 10:18:05', status: '处置中', snapshot: '已保存 5 张', video: '10:15:50 - 10:19:05', duration: '126 秒', assignee: '张伟', response: '处置剩余 07:35', x: 48, y: 84, linked: ['南门球机跟踪', '语音提示', '安保移动端'], traces: [{ time: '10:18:05', action: '告警上报', user: '系统', remark: '目标停留 126 秒' }, { time: '10:18:31', action: '告警确认', user: '李丽', remark: '需现场核查' }, { time: '10:19:02', action: '任务派发', user: '李丽', remark: '派给南门安保张伟' }] },
    { id: 'A20260720003', level: '重要', type: '攀爬', target: '人', zone: '西侧围栏', zoneId: 'Z02', device: 'RAD-W01 / IR-W01', time: '2026-07-20 09:56:18', status: '待复核', snapshot: '已保存 2 张', video: '09:56:03 - 09:56:48', duration: '5 秒', assignee: '王强', response: '已完成现场处置', x: 11, y: 44, linked: ['西区声光', '安保移动端'], traces: [{ time: '09:56:18', action: '告警上报', user: '系统', remark: '雷达轨迹与红外对射同时触发' }, { time: '09:56:40', action: '告警确认', user: '李丽', remark: '确认有人员靠近' }, { time: '10:03:12', action: '现场处置', user: '王强', remark: '巡查人员误入，已核验身份并劝离' }] },
    { id: 'A20260720004', level: '故障', type: '设备遮挡', target: '设备', zone: '物流闸口', zoneId: 'Z05', device: 'CAM-L01', time: '2026-07-20 09:42:33', status: '派单中', snapshot: '质量快照 1 张', video: '-', duration: '-', assignee: '赵峰（弱电维保）', response: '到场剩余 18:20', x: 78, y: 83, linked: ['运维工单 WO-8824'], traces: [{ time: '09:42:33', action: '设备异常', user: '系统', remark: '画面遮挡比例 82%' }, { time: '09:44:10', action: '任务派发', user: '周班长', remark: '派给弱电维保赵峰' }] },
    { id: 'A20260719012', level: '一般', type: '区域入侵', target: '小动物', zone: '宿舍区围墙', zoneId: 'Z06', device: 'RAD-D01', time: '2026-07-19 23:21:09', status: '误报', snapshot: '已保存 2 张', video: '23:20:54 - 23:21:39', duration: '4 秒', assignee: '-', response: '已标记小动物误报', x: 17, y: 78, linked: ['安保移动端'], traces: [{ time: '23:21:09', action: '告警上报', user: '系统', remark: '雷达检测到移动目标' }, { time: '23:23:46', action: '误报标记', user: '周杰', remark: '野猫进入，已回灌误报样本' }] },
    { id: 'A20260719008', level: '一般', type: '越界', target: '车辆', zone: '物流闸口', zoneId: 'Z05', device: 'RAD-L01', time: '2026-07-19 18:32:10', status: '已关闭', snapshot: '已保存 3 张', video: '18:31:55 - 18:32:40', duration: '6 秒', assignee: '刘安', response: '已复核关闭', x: 70, y: 83, linked: ['物流闸口球机', '安保移动端'], traces: [{ time: '18:32:10', action: '告警上报', user: '系统', remark: '货车进入限制区' }, { time: '18:34:28', action: '现场处置', user: '刘安', remark: '核验为授权临时车辆' }, { time: '18:41:02', action: '复核关闭', user: '周班长', remark: '处置记录完整，同意关闭' }] }
  ]
}

export const fireAlarm = {
  kpis: [
    { title: '火警', value: 1, unit: '条', color: '#F56C6C' },
    { title: '预警', value: 3, unit: '条', color: '#E6A23C' },
    { title: '故障', value: 4, unit: '条', color: '#909399' },
    { title: '屏蔽', value: 2, unit: '条', color: '#409EFF' },
    { title: '离线', value: 2, unit: '台', color: '#909399' }
  ],
  devices: [
    { id: 'FD-A101', name: '烟感-A栋1F', type: '烟感', building: 'A栋', floor: '1F', zone: '防火分区A1', status: '正常' },
    { id: 'FD-A205', name: '烟感-A栋2F', type: '烟感', building: 'A栋', floor: '2F', zone: '防火分区A2', status: '火警' },
    { id: 'FD-B103', name: '温感-B栋1F', type: '温感', building: 'B栋', floor: '1F', zone: '防火分区B1', status: '预警' },
    { id: 'FD-C301', name: '电气火灾-C栋3F', type: '电气火灾', building: 'C栋', floor: '3F', zone: '防火分区C3', status: '故障' },
    { id: 'FD-WP01', name: '消防水压-泵房', type: '水压液位', building: '消防泵房', floor: 'B1', zone: '泵房', status: '正常' },
    { id: 'FD-HOST', name: '消防报警主机', type: '报警主机', building: '消控室', floor: '1F', zone: '消控', status: '正常' },
    { id: 'FD-B210', name: '烟感-B栋2F', type: '烟感', building: 'B栋', floor: '2F', zone: '防火分区B2', status: '屏蔽' },
    { id: 'FD-D101', name: '烟感-D栋1F', type: '烟感', building: 'D栋', floor: '1F', zone: '防火分区D1', status: '离线' }
  ],
  events: [
    {
      id: 'FE001',
      level: '火警',
      type: '烟感报警',
      building: 'A栋',
      floor: '2F',
      zone: '防火分区A2',
      device: 'FD-A205',
      time: '2026-07-14 09:05:22',
      status: '核查中',
      traces: [
        { time: '2026-07-14 09:05:22', action: '报警接入', user: '系统', remark: '主机点位号 2-05' },
        { time: '2026-07-14 09:05:25', action: '等级通知', user: '系统', remark: '已推送值班员张三' },
        { time: '2026-07-14 09:05:40', action: '视频联动', user: '系统', remark: '附近摄像机 CAM-A2-03' },
        { time: '2026-07-14 09:06:10', action: '确认接收', user: '张三', remark: '前往现场核查' }
      ]
    },
    {
      id: 'FE002',
      level: '预警',
      type: '温感升温',
      building: 'B栋',
      floor: '1F',
      zone: '防火分区B1',
      device: 'FD-B103',
      time: '2026-07-14 08:41:08',
      status: '已确认',
      traces: [
        { time: '2026-07-14 08:41:08', action: '预警接入', user: '系统', remark: '温度趋势异常' },
        { time: '2026-07-14 08:42:01', action: '确认', user: '李四', remark: '厨房烹饪，持续观察' }
      ]
    },
    {
      id: 'FE003',
      level: '故障',
      type: '回路故障',
      building: 'C栋',
      floor: '3F',
      zone: '防火分区C3',
      device: 'FD-C301',
      time: '2026-07-14 07:20:45',
      status: '维修屏蔽',
      traces: [
        { time: '2026-07-14 07:20:45', action: '故障上报', user: '系统', remark: '电气火灾探测器通信异常' },
        { time: '2026-07-14 07:35:00', action: '维修屏蔽', user: '王工', remark: '预计 2 小时，已审批' },
        { time: '2026-07-14 07:35:05', action: '超时提醒配置', user: '系统', remark: '屏蔽截止 09:35' }
      ]
    },
    {
      id: 'FE004',
      level: '预警',
      type: '水压偏低',
      building: '消防泵房',
      floor: 'B1',
      zone: '泵房',
      device: 'FD-WP01',
      time: '2026-07-13 22:15:11',
      status: '已关闭',
      traces: [
        { time: '2026-07-13 22:15:11', action: '预警接入', user: '系统', remark: '管网压力低于阈值' },
        { time: '2026-07-13 22:40:00', action: '复位关闭', user: '值班长', remark: '补压完成，原始主机已复位' }
      ]
    },
    {
      id: 'FE005',
      level: '故障',
      type: '设备离线',
      building: 'D栋',
      floor: '1F',
      zone: '防火分区D1',
      device: 'FD-D101',
      time: '2026-07-13 16:08:33',
      status: '派单中',
      traces: [
        { time: '2026-07-13 16:08:33', action: '离线检测', user: '系统', remark: '心跳超时' },
        { time: '2026-07-13 16:20:00', action: '派单', user: '赵五', remark: '转设备维保工单 WM-8821' }
      ]
    },
    {
      id: 'FE006',
      level: '预警',
      type: '烟感预警',
      building: 'A栋',
      floor: '1F',
      zone: '防火分区A1',
      device: 'FD-A101',
      time: '2026-07-13 11:02:19',
      status: '误报',
      traces: [
        { time: '2026-07-13 11:02:19', action: '预警接入', user: '系统', remark: '' },
        { time: '2026-07-13 11:18:00', action: '核查关闭', user: '张三', remark: '装修粉尘，标记误报' }
      ]
    },
    {
      id: 'FE007',
      level: '火警',
      type: '演练火警',
      building: 'B栋',
      floor: '2F',
      zone: '防火分区B2',
      device: 'FD-B210',
      time: '2026-07-12 15:00:00',
      status: '演练结束',
      traces: [
        { time: '2026-07-12 15:00:00', action: '演练标记', user: '消控室', remark: '定期演练，不对外联动控制' },
        { time: '2026-07-12 15:30:00', action: '演练结束', user: '消控室', remark: '全流程留痕完成' }
      ]
    },
    {
      id: 'FE008',
      level: '故障',
      type: '主机通信',
      building: '消控室',
      floor: '1F',
      zone: '消控',
      device: 'FD-HOST',
      time: '2026-07-12 09:11:44',
      status: '已关闭',
      traces: [
        { time: '2026-07-12 09:11:44', action: '短暂中断', user: '系统', remark: '主备切换' },
        { time: '2026-07-12 09:12:10', action: '恢复', user: '系统', remark: '通信恢复正常' }
      ]
    }
  ]
}

export const parking = {
  kpis: [
    { title: '车位总数', value: 860, unit: '个' },
    { title: '空余车位', value: 214, unit: '个' },
    { title: '占用率', value: 75.1, unit: '%' },
    { title: '今日违停', value: 6, unit: '次' },
    { title: '设备异常', value: 2, unit: '台' }
  ],
  spaces: [
    { area: '地下一层 A区', total: 220, free: 42, occupied: 178 },
    { area: '地下一层 B区', total: 180, free: 55, occupied: 125 },
    { area: '地下二层', total: 300, free: 88, occupied: 212 },
    { area: '地面访客区', total: 80, free: 21, occupied: 59 },
    { area: '充电车位', total: 40, free: 6, occupied: 34 },
    { area: '残障车位', total: 20, free: 12, occupied: 8 },
    { area: '装卸区', total: 20, free: 10, occupied: 10 }
  ],
  violations: [
    { id: 'PV001', plate: '沪A12B34', type: '占用消防通道', area: '地下一层A区入口', startTime: '2026-07-14 08:10:00', duration: '55分钟', status: '语音提醒', image: '已抓拍' },
    { id: 'PV002', plate: '沪B88C01', type: '超时停车', area: '地面访客区 V12', startTime: '2026-07-14 06:00:00', duration: '3小时', status: '转工单', image: '已抓拍' },
    { id: 'PV003', plate: '沪C03D56', type: '跨车位', area: '地下二层 C28-29', startTime: '2026-07-14 07:42:11', duration: '28分钟', status: '巡查中', image: '已抓拍' },
    { id: 'PV004', plate: '沪D11E22', type: '禁停区域', area: 'B栋装卸通道', startTime: '2026-07-14 09:01:30', duration: '12分钟', status: '待处理', image: '已抓拍' },
    { id: 'PV005', plate: '沪E66F77', type: '占用残障车位', area: '地面访客区 D03', startTime: '2026-07-13 18:20:00', duration: '2小时', status: '已驶离', image: '已抓拍' },
    { id: 'PV006', plate: '沪F99G00', type: '堵塞出入口', area: '北门道闸内侧', startTime: '2026-07-13 17:05:44', duration: '8分钟', status: '已关闭', image: '已抓拍' },
    { id: 'PV007', plate: '沪G21H33', type: '逆行', area: '地下一层单行道', startTime: '2026-07-13 12:33:09', duration: '瞬时', status: '已关闭', image: '已抓拍' },
    { id: 'PV008', plate: '沪H44J55', type: '占用充电车位', area: '充电区 CH-07', startTime: '2026-07-13 10:11:00', duration: '1.5小时', status: '通知车主', image: '已抓拍' }
  ],
  vehicles: [
    { plate: '沪A10001', type: '固定车', owner: '张伟', validTo: '2026-12-31', areas: '全园区', list: '白名单', status: '有效' },
    { plate: '沪A10002', type: '固定车', owner: '李娜', validTo: '2026-09-30', areas: 'A/B地库', list: '白名单', status: '有效' },
    { plate: '沪B20001', type: '访客车', owner: '王访', validTo: '2026-07-14', areas: '地面访客区', list: '临时', status: '在园' },
    { plate: '沪C30001', type: '预约车', owner: '赵约', validTo: '2026-07-14', areas: '地面访客区', list: '临时', status: '未到访' },
    { plate: '沪D40001', type: '施工车', owner: '某装修队', validTo: '2026-07-20', areas: '物流闸口+装卸区', list: '白名单', status: '有效' },
    { plate: '沪E50001', type: '应急车', owner: '园区应急', validTo: '2099-12-31', areas: '全园区', list: '白名单', status: '有效' },
    { plate: '沪F60001', type: '临时车', owner: '-', validTo: '当日离场', areas: '临停区', list: '无', status: '计费中' },
    { plate: '沪X99999', type: '黑名单', owner: '未知', validTo: '-', areas: '禁止入园', list: '黑名单', status: '拦截' },
    { plate: '沪G70001', type: '固定车', owner: '周敏', validTo: '2026-06-30', areas: 'A地库', list: '白名单', status: '已过期' }
  ],
  devices: [
    { id: 'GT-S01', name: '南门道闸', type: '道闸', status: '正常' },
    { id: 'GT-N01', name: '北门道闸', type: '道闸', status: '正常' },
    { id: 'CAM-P01', name: '南门车牌识别', type: '相机', status: '正常' },
    { id: 'CAM-P02', name: '北门车牌识别', type: '相机', status: '故障' },
    { id: 'SCR-01', name: '地库诱导屏-1', type: '诱导屏', status: '正常' },
    { id: 'SCR-02', name: '地面诱导屏', type: '诱导屏', status: '离线' }
  ]
}

export const accessControl = {
  kpis: [
    { title: '今日通行', value: 3260, unit: '次' },
    { title: '异常事件', value: 12, unit: '条' },
    { title: '在线门禁', value: 96, unit: '台' },
    { title: '离线/防拆', value: 4, unit: '台' },
    { title: '待同步权限', value: 7, unit: '条' }
  ],
  devices: [
    { id: 'AC-A1', name: 'A栋大厅东门', status: '在线', mode: '正常' },
    { id: 'AC-A2', name: 'A栋大厅西门', status: '在线', mode: '正常' },
    { id: 'AC-B1', name: 'B栋侧门', status: '离线', mode: '本地缓存' },
    { id: 'AC-C3', name: 'C栋机房门', status: '在线', mode: '常闭' },
    { id: 'AC-D1', name: '宿舍门禁', status: '在线', mode: '正常' },
    { id: 'AC-L1', name: '物流通道门', status: '防拆告警', mode: '锁定' }
  ],
  events: [
    { id: 'AE001', person: '张伟', org: '行政部', door: 'A栋大厅东门', auth: '卡片', result: '成功', time: '2026-07-14 09:12:01', abnormal: false },
    { id: 'AE002', person: '未知', org: '-', door: 'C栋机房门', auth: '卡片', result: '非法认证', time: '2026-07-14 09:08:44', abnormal: true },
    { id: 'AE003', person: '李娜', org: '研发部', door: 'A栋大厅西门', auth: '二维码', result: '成功', time: '2026-07-14 09:01:22', abnormal: false },
    { id: 'AE004', person: '王强', org: '外包', door: 'B栋侧门', auth: '卡片', result: '权限过期', time: '2026-07-14 08:55:10', abnormal: true },
    { id: 'AE005', person: '-', org: '-', door: '物流通道门', auth: '-', result: '强行开门', time: '2026-07-14 08:40:05', abnormal: true },
    { id: 'AE006', person: '赵敏', org: '财务部', door: 'A栋大厅东门', auth: '手机', result: '连续失败', time: '2026-07-14 08:22:18', abnormal: true },
    { id: 'AE007', person: '周杰', org: '安保', door: '宿舍门禁', auth: '卡片', result: '成功', time: '2026-07-14 08:10:33', abnormal: false },
    { id: 'AE008', person: '-', org: '-', door: 'C栋机房门', auth: '-', result: '门长时间未关', time: '2026-07-14 07:50:00', abnormal: true },
    { id: 'AE009', person: '陈静', org: '市场部', door: 'A栋大厅西门', auth: '卡片', result: '成功', time: '2026-07-14 07:35:41', abnormal: false },
    { id: 'AE010', person: '系统', org: '-', door: 'B栋侧门', auth: '-', result: '设备离线', time: '2026-07-14 07:01:00', abnormal: true }
  ],
  permissions: [
    { id: 'P001', person: '张伟', org: '行政部', doors: 'A栋大厅', week: '周一至周五', period: '08:00-20:00', validTo: '2026-12-31', sync: '成功' },
    { id: 'P002', person: '李娜', org: '研发部', doors: 'A栋/B栋公共区', week: '全周', period: '全天', validTo: '2026-12-31', sync: '成功' },
    { id: 'P003', person: '王强', org: '外包', doors: 'B栋侧门', week: '工作日', period: '09:00-18:00', validTo: '2026-06-30', sync: '失败' },
    { id: 'P004', person: '访客-刘某', org: '访客', doors: 'A栋大厅', week: '当日', period: '09:00-17:00', validTo: '2026-07-14', sync: '成功' },
    { id: 'P005', person: '周杰', org: '安保', doors: '全部门禁', week: '全周', period: '全天', validTo: '2026-12-31', sync: '成功' },
    { id: 'P006', person: '陈静', org: '市场部', doors: 'A栋大厅', week: '周一至周五', period: '08:30-18:30', validTo: '2026-12-31', sync: '离线待同步' },
    { id: 'P007', person: '黑名单-某', org: '-', doors: '全部禁止', week: '-', period: '-', validTo: '-', sync: '已回收' },
    { id: 'P008', person: '机房值班', org: '运维', doors: 'C栋机房门', week: '全周', period: '全天', validTo: '2026-12-31', sync: '成功' }
  ],
  openLogs: []
}

export const powerEnergy = {
  kpis: [
    { title: '今日用电', value: 18642, unit: 'kWh' },
    { title: '实时功率', value: 2180, unit: 'kW' },
    { title: '最大需量', value: 2450, unit: 'kW' },
    { title: '变压器负载率', value: 68.2, unit: '%' },
    { title: '异常表计', value: 3, unit: '台' }
  ],
  loadCurve: {
    hours: ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'],
    power: [980, 860, 820, 1100, 1680, 2050, 1980, 2180, 2100, 1920, 1600, 1250],
    peak: [320, 280, 260, 360, 580, 720, 690, 760, 730, 650, 520, 400],
    flat: [380, 340, 320, 420, 650, 780, 760, 820, 800, 740, 620, 480],
    valley: [280, 240, 240, 320, 450, 550, 530, 600, 570, 530, 460, 370]
  },
  meters: [
    { id: 'M-T1', name: '1#变压器进线', level: '变压器', building: '园区总变', floor: '-', tenant: '-', kwh: 9200, power: 1100, pf: 0.95, status: '正常' },
    { id: 'M-T2', name: '2#变压器进线', level: '变压器', building: '园区总变', floor: '-', tenant: '-', kwh: 8442, power: 1080, pf: 0.93, status: '正常' },
    { id: 'M-A', name: 'A栋总表', level: '楼栋', building: 'A栋', floor: '-', tenant: '-', kwh: 4200, power: 520, pf: 0.94, status: '正常' },
    { id: 'M-A1', name: 'A栋1F公共', level: '楼层', building: 'A栋', floor: '1F', tenant: '公共区域', kwh: 680, power: 85, pf: 0.91, status: '正常' },
    { id: 'M-A2', name: 'A栋2F租户甲', level: '租户', building: 'A栋', floor: '2F', tenant: '租户甲', kwh: 1520, power: 190, pf: 0.92, status: '正常' },
    { id: 'M-B', name: 'B栋总表', level: '楼栋', building: 'B栋', floor: '-', tenant: '-', kwh: 3100, power: 390, pf: 0.88, status: '功率因数偏低' },
    { id: 'M-B3', name: 'B栋3F回路', level: '馈线', building: 'B栋', floor: '3F', tenant: '公共', kwh: 420, power: 55, pf: 0.90, status: '正常' },
    { id: 'M-C', name: 'C栋总表', level: '楼栋', building: 'C栋', floor: '-', tenant: '-', kwh: 2800, power: 360, pf: 0.96, status: '正常' },
    { id: 'M-C2', name: 'C栋2F租户乙', level: '租户', building: 'C栋', floor: '2F', tenant: '租户乙', kwh: 0, power: 0, pf: 0, status: '长期零值' },
    { id: 'M-OL', name: '室外照明总表', level: '功能区域', building: '室外', floor: '-', tenant: '-', kwh: 520, power: 40, pf: 0.97, status: '离线' }
  ],
  anomalies: [
    { id: 'EN001', meter: 'M-B', type: '功率因数偏低', level: '一般', time: '2026-07-14 08:00:00', detail: '功率因数 0.88，低于 0.9', status: '待分析' },
    { id: 'EN002', meter: 'M-C2', type: '长期零值', level: '关注', time: '2026-07-14 00:00:00', detail: '连续 7 日示数为 0', status: '待核查' },
    { id: 'EN003', meter: 'M-OL', type: '表计离线', level: '紧急', time: '2026-07-13 23:40:12', detail: '通信中断超过 2 小时', status: '已派单' },
    { id: 'EN004', meter: 'M-A2', type: '负荷突增', level: '一般', time: '2026-07-13 15:20:00', detail: '15 分钟功率升幅 42%', status: '已关闭' },
    { id: 'EN005', meter: 'M-T1', type: '三相不平衡', level: '关注', time: '2026-07-13 11:05:33', detail: 'A/C 相电流差 > 15%', status: '观察中' },
    { id: 'EN006', meter: 'M-B3', type: '计量倒退疑似', level: '紧急', time: '2026-07-12 09:18:00', detail: '示数较前日回退', status: '待核查' }
  ]
}

/** 3.2 智能巡更 */
export const patrol = {
  kpis: [
    { title: '今日计划', value: 12, unit: '个', sub: '已执行 9 个', type: 'primary', icon: 'el-icon-date' },
    { title: '执行中', value: 3, unit: '个', sub: '18 人在岗', type: 'success', icon: 'el-icon-position' },
    { title: '今日完成率', value: 75, unit: '%', sub: '目标 ≥ 95%', type: 'cyan', icon: 'el-icon-data-line' },
    { title: '异常告警', value: 5, unit: '条', sub: '1 条已升级', type: 'danger', icon: 'el-icon-warning-outline' },
    { title: '待处置问题', value: 3, unit: '项', sub: '2 张工单进行中', type: 'warning', icon: 'el-icon-document-checked' },
    { title: '在线巡更终端', value: 18, unit: '/20', sub: '离线待补传 2 条', type: 'info', icon: 'el-icon-mobile-phone' }
  ],
  routes: [
    {
      id: 'RT01',
      name: '东区外围线',
      area: '东区周界',
      distance: '2.4 km',
      expected: '52 分钟',
      points: [
        { id: 'P01', name: '东区门岗', method: '二维码', x: 17, y: 76, status: '已完成', time: '22:03' },
        { id: 'P02', name: 'A栋东北角', method: 'NFC', x: 18, y: 28, status: '已完成', time: '22:12' },
        { id: 'P03', name: '东墙点位3', method: '蓝牙', x: 47, y: 18, status: '已完成', time: '22:21' },
        { id: 'P04', name: '危化品外围', method: '定位', x: 78, y: 22, status: '当前点位', time: '计划22:30' },
        { id: 'P05', name: '物流闸口', method: '二维码', x: 84, y: 57, status: '待巡', time: '计划22:39' },
        { id: 'P06', name: '卸货通道', method: 'NFC', x: 65, y: 78, status: '待巡', time: '计划22:46' },
        { id: 'P07', name: '南门岗亭', method: '蓝牙', x: 38, y: 82, status: '待巡', time: '计划22:54' },
        { id: 'P08', name: '东区消防箱', method: '二维码', x: 27, y: 55, status: '待巡', time: '计划23:01' }
      ]
    },
    {
      id: 'RT02',
      name: '地库环线',
      area: '地下一层',
      distance: '1.8 km',
      expected: '45 分钟',
      points: [
        { id: 'B01', name: 'B1北口', method: '定位', x: 16, y: 68, status: '已完成', time: '19:03' },
        { id: 'B02', name: '消防通道', method: 'NFC', x: 20, y: 28, status: '已完成', time: '19:10' },
        { id: 'B03', name: '充电区CH-07', method: '蓝牙', x: 48, y: 20, status: '越序', time: '19:22' },
        { id: 'B04', name: '水泵房', method: '二维码', x: 78, y: 26, status: '当前点位', time: '计划19:30' },
        { id: 'B05', name: '卸货通道', method: '定位', x: 82, y: 65, status: '待巡', time: '计划19:38' },
        { id: 'B06', name: 'B1南口', method: 'NFC', x: 45, y: 79, status: '待巡', time: '计划19:46' }
      ]
    },
    {
      id: 'RT03',
      name: '宿舍楼层线',
      area: '宿舍区',
      distance: '1.2 km',
      expected: '38 分钟',
      points: [
        { id: 'D01', name: '1号楼门禁', method: '二维码', x: 18, y: 70, status: '已完成', time: '09:18' },
        { id: 'D02', name: '1号楼2F', method: 'NFC', x: 20, y: 30, status: '已完成', time: '09:25' },
        { id: 'D03', name: '2号楼门禁', method: '蓝牙', x: 48, y: 22, status: '当前点位', time: '计划09:35' },
        { id: 'D04', name: '宿舍监控室', method: '二维码', x: 78, y: 31, status: '待巡', time: '计划09:43' },
        { id: 'D05', name: '后场围墙', method: '定位', x: 76, y: 72, status: '待巡', time: '计划09:51' },
        { id: 'D06', name: '值班室', method: 'NFC', x: 42, y: 78, status: '待巡', time: '计划10:00' }
      ]
    }
  ],
  tasks: [
    { id: 'PT2026072001', plan: '东区夜间巡更', routeId: 'RT01', person: '周杰', avatar: '周', shift: '夜班', window: '22:00-23:10', progress: 38, completed: 3, total: 8, status: '执行中', currentPoint: '危化品外围', nextPoint: '物流闸口', startTime: '22:03', terminal: 'PAD-08', remaining: '34 分钟', signal: '在线' },
    { id: 'PT2026072002', plan: '地下车库巡更', routeId: 'RT02', person: '张伟', avatar: '张', shift: '晚班', window: '19:00-20:00', progress: 50, completed: 3, total: 6, status: '有异常', currentPoint: '水泵房', nextPoint: '卸货通道', startTime: '19:03', terminal: 'PAD-03', remaining: '21 分钟', signal: '在线' },
    { id: 'PT2026072003', plan: '宿舍区日巡', routeId: 'RT03', person: '李娜', avatar: '李', shift: '白班', window: '09:00-10:20', progress: 33, completed: 2, total: 6, status: '执行中', currentPoint: '2号楼门禁', nextPoint: '宿舍监控室', startTime: '09:18', terminal: 'PAD-11', remaining: '42 分钟', signal: '在线' },
    { id: 'PT2026072004', plan: '消控室巡检', routeId: 'RT01', person: '陈峰', avatar: '陈', shift: '全天', window: '10:00-10:30', progress: 100, completed: 4, total: 4, status: '已完成', currentPoint: '联动盘', nextPoint: '-', startTime: '10:01', terminal: 'PAD-01', remaining: '已完成', signal: '在线' }
  ],
  plans: [
    { id: 'PL01', name: '东区夜间巡更', routeId: 'RT01', route: '东区外围线', points: 8, shift: '夜班', persons: ['周杰', '刘安'], window: '22:00-23:10', frequency: '每日', checkItems: ['门窗状态', '消防箱', '周界照明'], requiredMedia: ['必拍照片'], signMethods: ['二维码', 'NFC', '蓝牙', '定位'], status: '启用', updatedAt: '2026-07-18 14:20' },
    { id: 'PL02', name: '地下车库巡更', routeId: 'RT02', route: '地库环线', points: 6, shift: '晚班', persons: ['张伟'], window: '19:00-20:00', frequency: '每日', checkItems: ['消防通道', '充电桩', '排水设施'], requiredMedia: ['必拍照片'], signMethods: ['NFC', '蓝牙', '定位'], status: '启用', updatedAt: '2026-07-19 09:15' },
    { id: 'PL03', name: '宿舍区日巡', routeId: 'RT03', route: '宿舍楼层线', points: 6, shift: '白班', persons: ['李娜', '陈静'], window: '09:00-10:20', frequency: '工作日', checkItems: ['出入口', '监控室', '楼层通道'], requiredMedia: ['异常必拍'], signMethods: ['二维码', 'NFC', '定位'], status: '启用', updatedAt: '2026-07-17 11:28' },
    { id: 'PL04', name: '物流闸口专项', routeId: 'RT01', route: '东区外围线', points: 5, shift: '白班', persons: ['王强'], window: '14:00-15:00', frequency: '每周一/三/五', checkItems: ['闸机', '危化品区'], requiredMedia: ['必拍照片', '异常视频'], signMethods: ['二维码', '定位'], status: '停用', updatedAt: '2026-07-16 08:40' },
    { id: 'PL05', name: '消控室巡检', routeId: 'RT01', route: '消控专项线', points: 4, shift: '全天', persons: ['陈峰'], window: '每2小时', frequency: '每日', checkItems: ['消防主机', '联动盘', '对讲设备'], requiredMedia: ['必拍照片'], signMethods: ['NFC'], status: '启用', updatedAt: '2026-07-20 08:00' },
    { id: 'PL06', name: '节假日全园巡查', routeId: 'RT01', route: '东区外围线', points: 8, shift: '日班', persons: ['刘安', '赵磊'], window: '10:00-12:00', frequency: '法定节假日', checkItems: ['重点区域', '门禁', '消防设施'], requiredMedia: ['必拍照片'], signMethods: ['二维码', '定位'], status: '启用', updatedAt: '2026-07-15 16:35' }
  ],
  records: [
    { id: 'PR20260720031', taskId: 'PT2026072001', plan: '东区夜间巡更', person: '周杰', point: '东墙点位3', method: '蓝牙', location: '东侧围墙 3#', distance: '4.2m', device: 'PAD-08', deviceBound: '通过', timeValid: '通过', antiProxy: '通过', result: '正常', offline: false, collectTime: '2026-07-20 22:21:18', uploadTime: '2026-07-20 22:21:19', media: '照片2张' },
    { id: 'PR20260720030', taskId: 'PT2026072001', plan: '东区夜间巡更', person: '周杰', point: 'A栋东北角', method: 'NFC', location: 'A栋东北角', distance: '1.1m', device: 'PAD-08', deviceBound: '通过', timeValid: '通过', antiProxy: '通过', result: '正常', offline: false, collectTime: '2026-07-20 22:12:06', uploadTime: '2026-07-20 22:12:06', media: '照片1张' },
    { id: 'PR20260720029', taskId: 'PT2026072001', plan: '东区夜间巡更', person: '周杰', point: '东区门岗', method: '二维码', location: '东区入口', distance: '2.8m', device: 'PAD-08', deviceBound: '通过', timeValid: '通过', antiProxy: '动态码通过', result: '正常', offline: false, collectTime: '2026-07-20 22:03:12', uploadTime: '2026-07-20 22:03:13', media: '照片1张' },
    { id: 'PR20260720028', taskId: 'PT2026072002', plan: '地下车库巡更', person: '张伟', point: '充电区CH-07', method: '蓝牙', location: '充电车位区', distance: '3.5m', device: 'PAD-03', deviceBound: '通过', timeValid: '通过', antiProxy: '设备指纹通过', result: '越序签到', offline: false, collectTime: '2026-07-20 19:22:11', uploadTime: '2026-07-20 19:22:12', media: '照片2张' },
    { id: 'PR20260720027', taskId: 'PT2026072002', plan: '地下车库巡更', person: '张伟', point: 'B1-消防通道', method: 'NFC', location: '地下一层A区', distance: '0.8m', device: 'PAD-03', deviceBound: '通过', timeValid: '通过', antiProxy: '通过', result: '发现问题', offline: true, collectTime: '2026-07-20 19:10:22', uploadTime: '2026-07-20 19:16:05', media: '图片+语音' },
    { id: 'PR20260720026', taskId: 'PT2026072003', plan: '宿舍区日巡', person: '李娜', point: '1号楼门禁', method: '定位', location: '宿舍1号楼', distance: '8.6m', device: 'PAD-11', deviceBound: '通过', timeValid: '迟到18分', antiProxy: '轨迹连续', result: '迟巡', offline: false, collectTime: '2026-07-20 09:18:40', uploadTime: '2026-07-20 09:18:40', media: '-' },
    { id: 'PR20260720025', taskId: 'PT2026072004', plan: '消控室巡检', person: '陈峰', point: '消防主机', method: 'NFC', location: '消控室', distance: '0.5m', device: 'PAD-01', deviceBound: '通过', timeValid: '通过', antiProxy: '通过', result: '正常', offline: false, collectTime: '2026-07-20 10:01:15', uploadTime: '2026-07-20 10:01:15', media: '照片1张' },
    { id: 'PR20260719018', taskId: 'PT2026071902', plan: '地下车库巡更', person: '张伟', point: '卸货通道', method: '定位', location: 'B栋装卸区', distance: '6.3m', device: 'PAD-03', deviceBound: '通过', timeValid: '通过', antiProxy: '轨迹连续', result: '发现问题', offline: false, collectTime: '2026-07-19 20:11:09', uploadTime: '2026-07-19 20:11:09', media: '图片+语音' }
  ],
  alarms: [
    { id: 'PA2026072005', level: '紧急', type: '漏巡', plan: '东区夜间巡更', taskId: 'PT2026072001', person: '周杰', point: '物流闸口', time: '2026-07-20 23:02:00', detail: '计划时间窗结束后 5 分钟仍未签到', escalate: '值班负责人', status: '已升级', assignee: '周班长', response: '已超时 03:15', traces: [{ time: '23:02:00', action: '漏巡告警', user: '系统', remark: '物流闸口点位未在窗口内签到' }, { time: '23:04:00', action: '自动升级', user: '系统', remark: '班组长2分钟未确认，已升级值班负责人' }] },
    { id: 'PA2026072004', level: '重要', type: '越序巡', plan: '地下车库巡更', taskId: 'PT2026072002', person: '张伟', point: '充电区CH-07', time: '2026-07-20 19:22:11', detail: '未完成消防通道检查即签到充电区', escalate: '班组长', status: '处置中', assignee: '刘安', response: '处置剩余 08:40', traces: [{ time: '19:22:11', action: '越序告警', user: '系统', remark: '点位顺序 B02 → B03 校验失败' }, { time: '19:23:05', action: '告警确认', user: '刘安', remark: '已联系巡更人员返回补查' }] },
    { id: 'PA2026072003', level: '重要', type: '迟巡', plan: '宿舍区日巡', taskId: 'PT2026072003', person: '李娜', point: '1号楼门禁', time: '2026-07-20 09:18:40', detail: '晚于点位签到窗口 18 分钟', escalate: '班组长', status: '待确认', assignee: '未分配', response: '等待确认 01:26', traces: [{ time: '09:18:40', action: '迟巡告警', user: '系统', remark: '计划窗口 09:00 前，实际签到 09:18' }] },
    { id: 'PA2026071908', level: '一般', type: '提前巡', plan: '消控室巡检', taskId: 'PT2026071904', person: '陈峰', point: '联动盘', time: '2026-07-19 07:40:00', detail: '早于窗口开始 20 分钟', escalate: '-', status: '已关闭', assignee: '周班长', response: '已复核关闭', traces: [{ time: '07:40:00', action: '提前巡告警', user: '系统', remark: '签到时间偏差 -20 分钟' }, { time: '08:05:12', action: '复核关闭', user: '周班长', remark: '临时消防检查，已核实' }] },
    { id: 'PA2026071906', level: '重要', type: '异常停留', plan: '东区夜间巡更', taskId: 'PT2026071901', person: '周杰', point: '东墙点位3', time: '2026-07-19 01:35:00', detail: '同点位停留超过 30 分钟', escalate: '值班负责人', status: '已关闭', assignee: '王队长', response: '已处置', traces: [{ time: '01:35:00', action: '停留告警', user: '系统', remark: '轨迹在同点位停留 32 分钟' }, { time: '01:42:20', action: '现场确认', user: '王队长', remark: '发现围墙绿植遮挡，已上报维修' }] },
    { id: 'PA2026071803', level: '一般', type: '漏巡', plan: '物流闸口专项', taskId: 'PT2026071805', person: '王强', point: '危化品区', time: '2026-07-18 17:05:00', detail: '计划停用期间误触发', escalate: '-', status: '误报', assignee: '-', response: '规则已修正', traces: [{ time: '17:05:00', action: '漏巡告警', user: '系统', remark: '危化品区未签到' }, { time: '17:08:22', action: '误报标记', user: '李丽', remark: '计划已停用，规则缓存未同步' }] }
  ],
  issues: [
    { id: 'PI2026072005', record: 'PR20260720027', person: '张伟', location: 'B1消防通道', time: '2026-07-20 19:11:06', category: '安全隐患', level: '重要', content: '消防通道堆放纸箱，影响人员疏散', media: ['图片2张', '语音1条'], workOrder: '安保-WO8821', team: '园区安保组', assignee: '刘安', status: '处理中', progress: 55, traces: [{ time: '19:11', action: '问题上报', user: '张伟', remark: '已上传现场图片和语音' }, { time: '19:13', action: '生成工单', user: '系统', remark: '安保-WO8821 已派给刘安' }] },
    { id: 'PI2026072004', record: 'PR20260719018', person: '张伟', location: 'B栋卸货区', time: '2026-07-19 20:11:30', category: '设施故障', level: '一般', content: '卸货区 3 号照明灯损坏', media: ['图片1张', '语音1条'], workOrder: '维修-WO3310', team: '弱电维保组', assignee: '赵峰', status: '已闭环', progress: 100, traces: [{ time: '20:11', action: '问题上报', user: '张伟', remark: '照明灯无法点亮' }, { time: '20:20', action: '工单派发', user: '系统', remark: '派给赵峰' }, { time: '09:35', action: '处置闭环', user: '赵峰', remark: '已更换LED驱动电源' }] },
    { id: 'PI2026071903', record: 'PR20260719011', person: '周杰', location: '东墙点位3', time: '2026-07-19 01:38:20', category: '设施故障', level: '重要', content: '围墙绿植遮挡红外对射', media: ['视频1段'], workOrder: '维修-WO3312', team: '绿化维保组', assignee: '未分配', status: '待派单', progress: 15, traces: [{ time: '01:38', action: '问题上报', user: '周杰', remark: '已上传现场视频' }, { time: '01:40', action: '生成工单', user: '系统', remark: '维修-WO3312 待派发' }] },
    { id: 'PI2026071808', record: 'PR20260718015', person: '李娜', location: '宿舍2号楼', time: '2026-07-18 09:42:05', category: '安全隐患', level: '一般', content: '楼梯间安全出口标识松动', media: ['图片2张'], workOrder: '-', team: '-', assignee: '-', status: '待转工单', progress: 0, traces: [{ time: '09:42', action: '问题上报', user: '李娜', remark: '等待管理员分类处理' }] },
    { id: 'PI2026071706', record: 'PR20260717021', person: '陈峰', location: '消控室', time: '2026-07-17 16:01:10', category: '设施故障', level: '重要', content: '消防主机备电电压偏低', media: ['图片1张', '视频1段'], workOrder: '维修-WO3308', team: '消防维保', assignee: '孙师傅', status: '处理中', progress: 70, traces: [{ time: '16:01', action: '问题上报', user: '陈峰', remark: '主机显示备电欠压' }, { time: '16:08', action: '工单派发', user: '周班长', remark: '消防维保已接单' }] }
  ],
  escalationRules: [
    { type: '漏巡', threshold: '窗口结束+5分钟', firstTarget: '班组长', firstDelay: 0, secondTarget: '值班负责人', secondDelay: 2, enabled: true },
    { type: '迟巡', threshold: '晚于窗口10分钟', firstTarget: '班组长', firstDelay: 0, secondTarget: '值班负责人', secondDelay: 5, enabled: true },
    { type: '提前巡', threshold: '早于窗口10分钟', firstTarget: '班组长', firstDelay: 0, secondTarget: '值班负责人', secondDelay: 10, enabled: true },
    { type: '越序巡', threshold: '跳过必检点位', firstTarget: '班组长', firstDelay: 0, secondTarget: '值班负责人', secondDelay: 3, enabled: true },
    { type: '异常停留', threshold: '同区域>30分钟', firstTarget: '值班负责人', firstDelay: 0, secondTarget: '安保负责人', secondDelay: 2, enabled: true }
  ],
  signConfig: {
    methods: ['二维码', 'NFC', '蓝牙', '定位'],
    dynamicQr: true,
    bindDevice: true,
    requireTrack: true,
    locationRadius: 30,
    earlyMinutes: 10,
    lateMinutes: 10,
    offlineEnabled: true,
    offlineUploadMinutes: 30,
    forbidManualSupplement: true
  }
}

/** 3.4 视频智能分析 */
export const videoAI = {
  kpis: [
    { title: '接入摄像机', value: 126, unit: '路' },
    { title: '算法启用点位', value: 68, unit: '个' },
    { title: '今日事件', value: 23, unit: '条' },
    { title: '视频质量异常', value: 4, unit: '路' },
    { title: '待处置告警', value: 7, unit: '条' }
  ],
  quality: [
    { id: 'CAM-A101', name: 'A栋大厅枪机', issue: '正常', area: 'A栋1F', updatedAt: '2026-07-17 09:10:00' },
    { id: 'CAM-B205', name: 'B栋2F走廊', issue: '画面遮挡', area: 'B栋2F', updatedAt: '2026-07-17 08:55:12' },
    { id: 'CAM-P01', name: '南门车牌球机', issue: '正常', area: '南门', updatedAt: '2026-07-17 09:12:01' },
    { id: 'CAM-UG12', name: '地库A区全景', issue: '画面冻结', area: '地下一层', updatedAt: '2026-07-17 07:40:33' },
    { id: 'CAM-C301', name: 'C栋机房门口', issue: '角度偏移', area: 'C栋3F', updatedAt: '2026-07-17 06:18:09' },
    { id: 'CAM-OUT03', name: '东墙枪机-1', issue: '正常', area: '东侧围墙', updatedAt: '2026-07-17 09:11:55' },
    { id: 'CAM-FIRE01', name: '消控室枪机', issue: '存储异常', area: '消控室', updatedAt: '2026-07-17 05:02:44' },
    { id: 'CAM-D101', name: '宿舍门禁球机', issue: '视频中断', area: '宿舍1号楼', updatedAt: '2026-07-17 08:01:20' },
    { id: 'CAM-L01', name: '物流闸口球机', issue: '离线', area: '物流闸口', updatedAt: '2026-07-17 07:55:33' }
  ],
  configs: [
    { id: 'VC01', camera: 'CAM-OUT03', point: '东墙枪机-1', algorithm: '人员入侵', region: '围墙内侧检测区', exclude: '绿化带排除区', period: '全天', duration: '3s', sensitivity: '中', suppress: '5分钟', status: '启用' },
    { id: 'VC02', camera: 'CAM-A101', point: 'A栋大厅枪机', algorithm: '徘徊', region: '大厅中央', exclude: '前台区域', period: '22:00-06:00', duration: '60s', sensitivity: '高', suppress: '10分钟', status: '启用' },
    { id: 'VC03', camera: 'CAM-UG12', point: '地库A区全景', algorithm: '占用消防通道', region: '消防通道框', exclude: '-', period: '全天', duration: '10s', sensitivity: '高', suppress: '15分钟', status: '启用' },
    { id: 'VC04', camera: 'CAM-B205', point: 'B栋2F走廊', algorithm: '人员跌倒', region: '走廊全景', exclude: '电梯厅', period: '全天', duration: '2s', sensitivity: '中', suppress: '3分钟', status: '启用' },
    { id: 'VC05', camera: 'CAM-L01', point: '物流闸口球机', algorithm: '未佩戴防护用品', region: '卸货作业区', exclude: '办公通道', period: '工作日08:00-18:00', duration: '5s', sensitivity: '中', suppress: '10分钟', status: '停用' },
    { id: 'VC06', camera: 'CAM-C301', point: 'C栋机房门口', algorithm: '遗留物', region: '机房门口', exclude: '-', period: '全天', duration: '30s', sensitivity: '低', suppress: '20分钟', status: '启用' },
    { id: 'VC07', camera: 'CAM-P01', point: '南门车牌球机', algorithm: '聚集', region: '门岗外侧', exclude: '排队候车区', period: '07:00-09:00,17:00-19:00', duration: '20s', sensitivity: '中', suppress: '10分钟', status: '启用' },
    { id: 'VC08', camera: 'CAM-FIRE01', point: '消控室枪机', algorithm: '烟火', region: '消控室全景', exclude: '-', period: '全天', duration: '1s', sensitivity: '高', suppress: '1分钟', status: '启用' }
  ],
  events: [
    { id: 'VE001', algorithm: '人员入侵', camera: 'CAM-OUT03', point: '东墙枪机-1', time: '2026-07-17 02:18:44', snapshot: '已存', video: '事件录像', status: '待确认' },
    { id: 'VE002', algorithm: '占用消防通道', camera: 'CAM-UG12', point: '地库A区全景', time: '2026-07-17 08:42:10', snapshot: '已存', video: '事件录像', status: '处置中' },
    { id: 'VE003', algorithm: '徘徊', camera: 'CAM-A101', point: 'A栋大厅枪机', time: '2026-07-17 01:05:33', snapshot: '已存', video: '事件录像', status: '误报' },
    { id: 'VE004', algorithm: '人员跌倒', camera: 'CAM-B205', point: 'B栋2F走廊', time: '2026-07-16 22:11:09', snapshot: '已存', video: '事件录像', status: '已关闭' },
    { id: 'VE005', algorithm: '遗留物', camera: 'CAM-C301', point: 'C栋机房门口', time: '2026-07-16 16:40:22', snapshot: '已存', video: '事件录像', status: '派单中' },
    { id: 'VE006', algorithm: '烟火', camera: 'CAM-FIRE01', point: '消控室枪机', time: '2026-07-16 15:02:01', snapshot: '已存', video: '事件录像', status: '已关闭' },
    { id: 'VE007', algorithm: '聚集', camera: 'CAM-P01', point: '南门车牌球机', time: '2026-07-16 08:15:50', snapshot: '已存', video: '事件录像', status: '已关闭' },
    { id: 'VE008', algorithm: '画面遮挡', camera: 'CAM-B205', point: 'B栋2F走廊', time: '2026-07-17 08:55:12', snapshot: '-', video: '-', status: '待确认' }
  ]
}

/** 3.5 无线对讲 */
export const intercom = {
  kpis: [
    { title: '终端总数', value: 56, unit: '台' },
    { title: '在线', value: 41, unit: '台' },
    { title: '低电量', value: 5, unit: '台' },
    { title: '今日呼叫', value: 128, unit: '次' },
    { title: '紧急求助', value: 1, unit: '条' }
  ],
  terminals: [
    { id: 'WT-01', name: '对讲机-安保1', person: '周杰', group: '安保一组', channel: 'CH-安保', status: '在线', battery: 86, fault: '无' },
    { id: 'WT-02', name: '对讲机-安保2', person: '张伟', group: '安保一组', channel: 'CH-安保', status: '在线', battery: 42, fault: '无' },
    { id: 'WT-03', name: '对讲机-消控', person: '值班长', group: '消控室', channel: 'CH-消控', status: '在线', battery: 91, fault: '无' },
    { id: 'WT-04', name: '对讲机-物业', person: '李娜', group: '物业巡查', channel: 'CH-物业', status: '离线', battery: 18, fault: '无' },
    { id: 'WT-05', name: '对讲机-物流', person: '王强', group: '物流门岗', channel: 'CH-门岗', status: '在线', battery: 55, fault: '无' },
    { id: 'WT-06', name: '对讲机-机房', person: '运维甲', group: '运维', channel: 'CH-运维', status: '故障', battery: 70, fault: '射频异常' },
    { id: 'WT-07', name: '对讲机-宿舍', person: '陈静', group: '宿舍管理', channel: 'CH-宿舍', status: '在线', battery: 12, fault: '无' },
    { id: 'WT-08', name: '调度台-01', person: '调度员', group: '调度中心', channel: '全频道', status: '在线', battery: 100, fault: '无' }
  ],
  groups: [
    { id: 'G1', name: '安保一组', members: 12, channel: 'CH-安保', remark: '周界/门岗' },
    { id: 'G2', name: '消控室', members: 4, channel: 'CH-消控', remark: '消防值班' },
    { id: 'G3', name: '物业巡查', members: 8, channel: 'CH-物业', remark: '日常巡查' },
    { id: 'G4', name: '物流门岗', members: 6, channel: 'CH-门岗', remark: '装卸/闸口' },
    { id: 'G5', name: '运维', members: 5, channel: 'CH-运维', remark: '机房/弱电' },
    { id: 'G6', name: '调度中心', members: 3, channel: '全频道', remark: '调度台优先' }
  ],
  calls: [
    { id: 'CL001', type: '单呼', from: '周杰(WT-01)', to: '调度员(WT-08)', start: '2026-07-17 09:05:11', end: '2026-07-17 09:05:48', result: '正常结束', record: '已授权录音' },
    { id: 'CL002', type: '组呼', from: '调度员(WT-08)', to: '安保一组', start: '2026-07-17 08:40:02', end: '2026-07-17 08:41:10', result: '正常结束', record: '已授权录音' },
    { id: 'CL003', type: '紧急呼叫', from: '张伟(WT-02)', to: '调度中心', start: '2026-07-17 07:22:15', end: '2026-07-17 07:24:01', result: '优先抢占成功', record: '已授权录音' },
    { id: 'CL004', type: '全呼', from: '调度员(WT-08)', to: '全部终端', start: '2026-07-16 18:00:00', end: '2026-07-16 18:00:45', result: '正常结束', record: '已授权录音' },
    { id: 'CL005', type: '调度台呼叫', from: '调度员(WT-08)', to: '王强(WT-05)', start: '2026-07-16 15:12:33', end: '2026-07-16 15:13:20', result: '正常结束', record: '未录音' },
    { id: 'CL006', type: '单呼', from: '李娜(WT-04)', to: '周杰(WT-01)', start: '2026-07-16 11:08:09', end: '2026-07-16 11:08:09', result: '未接通', record: '-' },
    { id: 'CL007', type: '组呼', from: '值班长(WT-03)', to: '消控室', start: '2026-07-16 09:30:00', end: '2026-07-16 09:30:55', result: '正常结束', record: '已授权录音' },
    { id: 'CL008', type: '单呼', from: '运维甲(WT-06)', to: '调度员(WT-08)', start: '2026-07-15 16:44:18', end: '2026-07-15 16:45:02', result: '正常结束', record: '已授权录音' }
  ],
  sos: [
    { id: 'SOS01', person: '张伟', terminal: 'WT-02', area: '地下一层A区', time: '2026-07-17 07:22:15', cameras: 'CAM-UG12,CAM-UG13', status: '处置中', remark: '紧急呼叫联动视频' },
    { id: 'SOS02', person: '王强', terminal: 'WT-05', area: '物流闸口', time: '2026-07-12 14:08:40', cameras: 'CAM-L01', status: '已关闭', remark: '误触，已复核' }
  ],
  coverage: [
    { area: '地下室B1', testResult: '弱覆盖', offlinePlan: '终端本地缓存+升顶天线', interference: '偶发', lowBattery: '强制换电点' },
    { area: '电梯厅-A栋', testResult: '合格', offlinePlan: '基站冗余', interference: '无', lowBattery: '告警提醒' },
    { area: '设备间-C栋', testResult: '合格', offlinePlan: '直放站', interference: '轻微', lowBattery: '告警提醒' },
    { area: '东侧围墙室外', testResult: '合格', offlinePlan: '室外基站', interference: '无', lowBattery: '告警提醒' },
    { area: '物流卸货区', testResult: '干扰偏高', offlinePlan: '频道隔离', interference: '叉车射频', lowBattery: '备用机柜' }
  ]
}
