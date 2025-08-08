import _cloneDeep from 'lodash/cloneDeep'
import { Message } from 'element-ui'

const inputEncapsulation = function (type, code, param, input) {
  let _input
  if (!input || !input[type]) {
    _input = {
      [type]: {
        [`${type}-${code}`]: param
      }
    }
    // console.log(_input, '+++++++++++++++++++')
    return _input
  } else {
  }
}
// 出参封装
const outputEncapsulation = function (type, code, param, input) {
  // console.log(input,'我是传进的input')
  // 取父组件的路径 例 layout-code_table-code
  let _output = {}
  Object.keys(input).forEach((key) => {
    _output[key] = {}
    Object.keys(input[key]).forEach((item) => {
      _output[key][`${item}_${type}-${code}`] = input[key][item]
    })
  })
  if (_output[type]) {
    _output[type][`${type}-${code}`] = param
  } else {
    _output[type] = {
      [`${type}-${code}`]: param
    }
  }
  // console.log(_output, '我是封装完成后的output')
  return _output
}

// 更新出参
const updateOutput = function (type, code, param, oldOutput) {
  const newOutput = _cloneDeep(oldOutput)
  newOutput[type][`${type}-${code}`] = param
  // console.log(newOutput, '我是更新后的output')
  return newOutput
}

// 解析参数  格式 P8Param[type][url]  例 P8Param.layout.form-code.name ? P8Param.layout.form-code.name : 123
const getParam = function (input_, value) {
  // console.log(value, '解析参数');

  // 分割键和默认值
  const [key, defaultVal] = value.split('?')
  const keyList = key.split('.')

  // 如果 keyList 的第一个元素是 'P8Param'，则去掉它
  if (keyList[0] === 'P8Param') {
    keyList.shift()
  }

  try {
    // 使用 reduce 遍历 keyList
    const result = keyList.reduce((obj, item) => {
      if (item === 'row[0]') {
        return obj['row'][0]
      } else {
        if (obj && obj.hasOwnProperty(item)) {
          return obj[item]
        } else {
          Message.error(`Key "${item}" 对象不存在.`)
          throw new Error(`Key "${item}" 对象不存在.`)
        }
      }
    }, input_)
    // 如果结果存在则返回，否则返回默认值
    return result !== undefined ? result : defaultVal || null
  } catch (error) {
    console.error(error.message)
    // 返回默认值
    return defaultVal || null
  }
}

const P8ParamFunc = {
  inputEncapsulation,
  outputEncapsulation,
  updateOutput,
  getParam
}

export default P8ParamFunc
