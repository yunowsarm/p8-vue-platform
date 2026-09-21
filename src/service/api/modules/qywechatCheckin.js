/**
 * 企业微信考勤相关接口
 */

export const qywechatCheckinApi = {
  qywechatCheckin: [
    {
      name: 'monthData',
      method: 'POST',
      path: '/api/qywechat/checkin/monthdata',
      mockPath: '/api/qywechat/checkin/monthdata',
      desc: '查询企业微信月度考勤打卡数据'
    }
  ]
}
