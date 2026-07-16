/**
 * 智慧物联平台仿真数据（按模块划分，集中存放）
 */

export const perimeter = {
  kpis: [
    { title: '设备总数', value: 48, unit: '台' },
    { title: '在线', value: 42, unit: '台' },
    { title: '离线/故障', value: 6, unit: '台' },
    { title: '今日告警', value: 9, unit: '条' },
    { title: '已布防防区', value: 11, unit: '个' }
  ],
  zones: [
    { id: 'Z01', name: '东侧围墙', type: '围墙', armed: true, x: 78, y: 35 },
    { id: 'Z02', name: '西侧围栏', type: '围栏', armed: true, x: 18, y: 40 },
    { id: 'Z03', name: '南门出入口', type: '出入口', armed: true, x: 50, y: 82 },
    { id: 'Z04', name: '北门出入口', type: '出入口', armed: false, x: 48, y: 12 },
    { id: 'Z05', name: '物流闸口', type: '出入口', armed: true, x: 85, y: 68 },
    { id: 'Z06', name: '宿舍区围墙', type: '围墙', armed: true, x: 25, y: 70 }
  ],
  devices: [
    { id: 'CAM-E01', name: '东墙枪机-1', type: '摄像机', zone: '东侧围墙', status: '在线', armed: '布防', updatedAt: '2026-07-14 09:12:01' },
    { id: 'CAM-E02', name: '东墙球机-2', type: '摄像机', zone: '东侧围墙', status: '在线', armed: '布防', updatedAt: '2026-07-14 09:12:01' },
    { id: 'RAD-W01', name: '西侧雷达', type: '雷达', zone: '西侧围栏', status: '在线', armed: '布防', updatedAt: '2026-07-14 09:10:22' },
    { id: 'IR-N01', name: '北门红外对射', type: '红外对射', zone: '北门出入口', status: '离线', armed: '撤防', updatedAt: '2026-07-14 08:41:09' },
    { id: 'CAM-S01', name: '南门枪机', type: '摄像机', zone: '南门出入口', status: '在线', armed: '布防', updatedAt: '2026-07-14 09:11:55' },
    { id: 'CAM-L01', name: '物流闸口球机', type: '摄像机', zone: '物流闸口', status: '故障', armed: '布防', updatedAt: '2026-07-14 07:55:33' },
    { id: 'RAD-D01', name: '宿舍区雷达', type: '雷达', zone: '宿舍区围墙', status: '在线', armed: '布防', updatedAt: '2026-07-14 09:09:18' },
    { id: 'IR-W01', name: '西侧红外', type: '红外对射', zone: '西侧围栏', status: '在线', armed: '布防', updatedAt: '2026-07-14 09:08:44' },
    { id: 'CAM-N01', name: '北门全景', type: '摄像机', zone: '北门出入口', status: '在线', armed: '撤防', updatedAt: '2026-07-14 09:05:12' },
    { id: 'CAM-D02', name: '宿舍枪机-2', type: '摄像机', zone: '宿舍区围墙', status: '在线', armed: '布防', updatedAt: '2026-07-14 09:11:01' }
  ],
  alarms: [
    { id: 'A1001', type: '越界', zone: '东侧围墙', device: 'CAM-E01', time: '2026-07-14 08:22:11', status: '待确认', snapshot: '抓拍已存', duration: '12s' },
    { id: 'A1002', type: '攀爬', zone: '西侧围栏', device: 'RAD-W01', time: '2026-07-14 07:58:40', status: '处置中', snapshot: '抓拍已存', duration: '8s' },
    { id: 'A1003', type: '翻越', zone: '宿舍区围墙', device: 'CAM-D02', time: '2026-07-14 06:41:05', status: '已关闭', snapshot: '抓拍已存', duration: '15s' },
    { id: 'A1004', type: '区域入侵', zone: '物流闸口', device: 'CAM-L01', time: '2026-07-14 05:19:33', status: '误报', snapshot: '抓拍已存', duration: '20s' },
    { id: 'A1005', type: '长时间徘徊', zone: '南门出入口', device: 'CAM-S01', time: '2026-07-14 04:02:18', status: '待确认', snapshot: '抓拍已存', duration: '180s' },
    { id: 'A1006', type: '越界', zone: '东侧围墙', device: 'CAM-E02', time: '2026-07-13 23:11:49', status: '已关闭', snapshot: '抓拍已存', duration: '9s' },
    { id: 'A1007', type: '设备离线', zone: '北门出入口', device: 'IR-N01', time: '2026-07-13 21:40:00', status: '派单中', snapshot: '-', duration: '-' },
    { id: 'A1008', type: '遮挡', zone: '物流闸口', device: 'CAM-L01', time: '2026-07-13 19:15:27', status: '处置中', snapshot: '抓拍已存', duration: '-' },
    { id: 'A1009', type: '区域入侵', zone: '西侧围栏', device: 'IR-W01', time: '2026-07-13 18:02:55', status: '已关闭', snapshot: '抓拍已存', duration: '6s' }
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
