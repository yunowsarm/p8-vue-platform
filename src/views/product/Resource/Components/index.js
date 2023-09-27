import api from '@/plugins/api'
/**
 *
 * @param {*} params
 * desc: 9.7-获取任务相关状态
 */
export const getTaskStatusInfo = (params) => {
  const url = 'taskManager.getStatusByCurrent'
  let allStatus = []
  return api[url](params).then(res => {
    // 
    let progressRange = res.allProgressRange
    res.allStatus.forEach(item => {
      item.progressRange = progressRange.filter(p => p[item.value])[0][item.value]
      allStatus.push(item)
    })
    
    return allStatus
  })
}
