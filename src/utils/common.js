import moment from 'moment'
import { API_DEFAULT_CONFIG } from '@/config/settings'
/**
 * COMMON UTILS
 * Author: Vicco Wang
 * Date: 2018.06.25
 */

/**
 *
 * assert(a === b, "yes , they are the same!")
 *
 * asser(turlyFunc(), "test a function")
 *
 */
export function assert(expression, message) {
  if (expression) {
    return message
  }
}

export function getGreetingTime() {
  const now = parseInt(moment().format('HH'))
  let dayTime = ''
  if (now < 12) dayTime = '上午'
  else if (now >= 12 && now < 18) dayTime = '下午'
  else if (now >= 18 && now <= 23) dayTime = '晚上'
  else dayTime = ''
  return dayTime
}

// 选项字段对应关系
const selectConfig = {
  labelCol: '',
  valueCol: '',
  pidCol: ''
}
export default selectConfig

// 下拉数据根据对应关系转换为label与value
export function selectTransform(data, config) {
  config = JSON.parse(config)
  if (Object.keys(config).length) {
    return data.map((item) => {
      return {
        label: item[config.labelCol],
        value: item[config.valueCol]
      }
    })
  }
}
// 树形下拉数据根据对应关系进行处理
export const selectGenerateTree = (data, config) => {
  const configParams = JSON.parse(config)
  const pidName = configParams.pidCol
  const labelName = configParams.labelCol
  const valueName = configParams.valueCol
  /**
   * 1. 平行数组
   * 2. 树形数组
   */
  const pidNameStr = pidName != null && pidName !== '' ? pidName : 'pId'
  // 把跟节点首先放进数组
  const tmpTree = data.filter((node) => !node[pidNameStr])
  if (!tmpTree.length) {
    console.log('tree-select:', 'not found 父节点')
  }
  // 递归生成节点及子节点数据
  const findChildren = (tree) => {
    tree.forEach((node) => {
      node.label = node[labelName]
      node.value = node[valueName]
      node.children = data.filter((cNode) => cNode[pidNameStr] === node[valueName])
      if (node.children.length) {
        findChildren(node.children)
      }
    })
  }

  findChildren(tmpTree)
  return tmpTree
}

/**
 * 设置dialog弹窗中表格的高度
 * @param {*} radio
 */
export const getTableHeightInDialog = (radio = 0.5) => {
  return document.documentElement.clientHeight * radio
}

/**
 * 列表中“超期/剩余天数”公共方法
 * @param {*} row:{ managerStatus,status,planEndDate,realEndDate }
 */
export const overdueTextHandle = ({ managerStatus, status: currStatus, planEndDate, realEndDate }) => {
  if (!currStatus) {
    return ''
  }
  let currDate = moment().format('YYYY-MM-DD')
  let diffDays = 0
  let text = ''
  // eslint-disable-next-line eqeqeq
  if (managerStatus === '6409') {
    // 管理状态为已完成
    diffDays = Math.abs(moment(planEndDate).diff(moment(realEndDate), 'days'))
    // 已完成
    if (moment(realEndDate).isAfter(moment(planEndDate))) {
      text = `<span style="color: #F80012">超期${diffDays}天完成</span>`
    } else if (diffDays === 0) {
      text = '<span style="color: #1BBF9E">当天完成</span>'
    } else {
      text = `<span style="color: #1BBF9E">提前${diffDays}天完成</span>`
    }
  } else {
    diffDays = Math.abs(moment(planEndDate).diff(moment(currDate), 'days'))
    // 已完成
    if (moment(currDate).isAfter(moment(planEndDate))) {
      text = `<span style="color: #F80012">超期${diffDays}天</span>`
    } else if (diffDays === 0) {
      text = '<span style="color: #48BF9F">今天</span>'
    } else {
      text = `<span style="color: #48BF9F">剩余${diffDays}天</span>`
    }
  }
  return text
}
export const overdueTextHandles = ({ MANAGERSTATUS, STATUS: CURRSTATUS, PLANENDDATE, REALENDDATE }) => {
  if (!CURRSTATUS) {
    return ''
  }
  let currDate = moment().format('YYYY-MM-DD')
  let diffDays = 0
  let text = ''
  // eslint-disable-next-line eqeqeq
  if (MANAGERSTATUS === '6409') {
    // 管理状态为已完成
    diffDays = Math.abs(moment(PLANENDDATE).diff(moment(REALENDDATE), 'days'))
    // 已完成
    if (moment(REALENDDATE).isAfter(moment(PLANENDDATE))) {
      text = `<span style="color: #F80012">超期${diffDays}天完成</span>`
    } else if (diffDays === 0) {
      text = '<span style="color: #1BBF9E">当天完成</span>'
    } else {
      text = `<span style="color: #1BBF9E">提前${diffDays}天完成</span>`
    }
  } else {
    diffDays = Math.abs(moment(PLANENDDATE).diff(moment(currDate), 'days'))
    // 已完成
    if (moment(currDate).isAfter(moment(PLANENDDATE))) {
      text = `<span style="color: #F80012">超期${diffDays}天</span>`
    } else if (diffDays === 0) {
      text = '<span style="color: #48BF9F">今天</span>'
    } else {
      text = `<span style="color: #48BF9F">剩余${diffDays}天</span>`
    }
  }
  return text
}

export const requestUrl = (url) => {
  if (!url) {
    console.error('requestUrl: 缺少请求路径')
    return
  }
  let { devBaseUrl, prodBaseUrl, isDevMode } = API_DEFAULT_CONFIG
  let urlPrefix = isDevMode ? `${devBaseUrl}` : `${prodBaseUrl}`
  return urlPrefix + url
}

// 深拷贝对象
export function deepClone(obj) {
  const _toString = Object.prototype.toString

  // null, undefined, non-object, function
  if (!obj || typeof obj !== 'object') {
    return obj
  }

  // DOM Node
  if (obj.nodeType && 'cloneNode' in obj) {
    return obj.cloneNode(true)
  }

  // Date
  if (_toString.call(obj) === '[object Date]') {
    return new Date(obj.getTime())
  }

  // RegExp
  if (_toString.call(obj) === '[object RegExp]') {
    const flags = []
    if (obj.global) {
      flags.push('g')
    }
    if (obj.multiline) {
      flags.push('m')
    }
    if (obj.ignoreCase) {
      flags.push('i')
    }

    return new RegExp(obj.source, flags.join(''))
  }

  const result = Array.isArray(obj) ? [] : obj.constructor ? new obj.constructor() : {}

  for (const key in obj) {
    result[key] = deepClone(obj[key])
  }

  return result
}
