import api from '@/plugins/api'

/**
 * Dashbaord layout Data()
 */
export const layoutData = [
  { 'x': 0, 'y': 0, 'w': 12, 'h': 15, 'i': '0', 'component': 'components/workLayout/Components/projectProgress/Components/taskProgressInformation/index' }
  // { 'x': 0, 'y': 10, 'w': 4, 'h': 9, 'i': '2', 'component': 'DashChart2' },
  // { 'x': 4, 'y': 10, 'w': 8, 'h': 9, 'i': '1', 'component': 'DashChart1' },
  // { 'x': 0, 'y': 18, 'w': 12, 'h': 7, 'i': '4', 'component': 'DashList' }
]
/**
 *
 * @param {*} params
 *  获取计划标识明细数据
 */
export const getMonitorData = (params) => {
  const url = 'commonP8Task.loadMonitorData'
  return api[url](params).then(res => {
    return res
  })
}
/**
 *
 * @param {*} params
 * 获取经费节点明细
 */
export const getBudgetData = (params) => {
  const url = 'commonP8Task.loadBudgetData'
  return api[url](params).then(res => {
    return res
  })
}
