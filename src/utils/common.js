import store from '@/plugins/store'
import moment from 'moment'
import { API_DEFAULT_CONFIG } from '@/config/settings'
import { Message } from 'element-ui'
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
 * 计算超期/剩余天数公共方法
 * @returns {{value: number, text: string}}  value - 天数  text - 展示的剩余天数文本
 * @param task
 */
export function calculateRemainingDays(task) {
  // 颜色常量
  const COLOR_OVERDUE = '#F80012'; // 超期
  const COLOR_COMPLETED_TODAY = '#1892FF'; // 当天完成
  const COLOR_ADVANCED = '#1892FF'; // 提前完成
  const COLOR_TODAY_REMAINING = '#1BBF9E'; // 今天
  const COLOR_REMAINING = '#0296ff'; // 剩余天数
  // 获取任务的管理状态
  const managerStatus = task.managerStatus || task.MANAGERSTATUS
  // 获取任务的状态
  const status = task.status || task.currStatus || task.CURRSTATUS
  // 获取任务的计划结束日期
  const end_date = task.end_date || task.planEndDate || task.PLANENDDATE
  // 获取任务的实际结束日期
  const realEndDate = task.realEndDate || task.REALENDDATE
  // 剩余天数
  let value
  // 超期/剩余天数文本
  let text

  // doneSign - 完成标记 值： completeApproval - 完成审批通过  submitApproval - 提交完成审批
  // displayType - 显示类型 值： intact - 完整显示（提前/超期xx天完成） concise - 精简显示（-/+xx天完成）
  const { doneSign, displayType } = store.getters
  // 获取任务的结束日期（计划结束和实际结束）
  const real_EndDate = realEndDate ? moment(realEndDate) : null // 将实际结束日期转换为moment对象
  // 将计划结束日期减去一天（一般情况下，字段为end_date时减去一天）
  const endDate = task.end_date ? moment(end_date).subtract(1, 'days') : moment(end_date)

  // 确保任务的结束日期有效
  if (!endDate.isValid()) {
    return { value: 0, text: '' }
  }

  // 计算日期差（以天为单位）
  const calculateDateDifference = (start, end) => Math.floor(Math.abs(start.diff(end, 'days')))

  // 判断任务是否已完成或处于提交审批、审批完成状态
  if (status === '6070' || managerStatus === '6409' || (doneSign === 'submitApproval' && managerStatus === '6406')) {
    // 确保任务的结束日期有效
    if (real_EndDate && real_EndDate.isValid()) {
      const days = calculateDateDifference(real_EndDate, endDate)
      if (real_EndDate.startOf('day').isAfter(endDate.startOf('day'))) {
        // 超期完成
        value = -days
        text = `<span style='color:  ${COLOR_OVERDUE}'>${displayType !== 'concise' ? `超期${days}天完成` : `-${days}天完成`}</span>`
      } else if (days === 0) {
        // 当天完成
        value = 0
        text = `<span style='color:  ${COLOR_COMPLETED_TODAY}'>当天完成</span>`
      } else {
        // 提前完成
        value = days
        text = `<span style='color:  ${COLOR_ADVANCED}'>${displayType !== 'concise' ? `提前${days}天完成` : `+${days}天完成`}</span>`
      }

      // 提交审批状态时加上待审批标记
      if (doneSign === 'submitApproval' && managerStatus === '6406') {
        text += '（待审批）'
      }
    } else {
      return { value: 0, text: '' }
    }
  } else {
    // 任务未完成，计算剩余天数
    const nowDate = moment()
    const days = calculateDateDifference(nowDate, endDate)
    if (nowDate.startOf('day').isAfter(endDate.startOf('day'))) {
      // 超期
      value = -days
      text = `<span style='color:  ${COLOR_OVERDUE}'>${displayType !== 'concise' ? `超期${days}天` : `-${days}天`}</span>`
    } else if (days === 0) {
      // 今天
      value = 0
      text = `<span style='color:  ${COLOR_TODAY_REMAINING}'>今天</span>`
    } else {
      // 剩余天数
      value = days
      text = `<span style='color:  ${COLOR_REMAINING}'>${displayType !== 'concise' ? `剩余${days}天` : `+${days}天`}</span>`
    }
  }

  return { value, text }
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

export function copyText(value, msg = "复制成功") {
  // 动态创建 textarea 标签
  const textarea = document.createElement('textarea')
  // 将该 textarea 设为 readonly 防止 iOS 下自动唤起键盘，同时将 textarea 移出可视区域
  textarea.readOnly = 'readonly'
  textarea.style.position = 'fixed'
  textarea.style.top = '0px'
  textarea.style.left = '-9999px'
  textarea.style.zIndex = '-9999'
  // 将要 copy 的值赋给 textarea 标签的 value 属性
  textarea.value = value
  // 将 textarea 插入到 el 中
  document.body.appendChild(textarea)
  // 兼容IOS 没有 select() 方法
  if (textarea.createTextRange) {
    textarea.select() // 选中值并复制
  } else {
    textarea.setSelectionRange(0, value.length)
    textarea.focus()
  }
  const result = document.execCommand('Copy')
  if (result) Message.success(msg)
}
