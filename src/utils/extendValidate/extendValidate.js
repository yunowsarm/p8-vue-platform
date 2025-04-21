import regPattern from './pattern'
/**
 * 针对ELEMENT UI 基础的验证规则 扩展项目常用验证内容
 * Author: Vicco Wang
 * Date: 2018/05/16
 */

/**
 * Validate normal string number
 * @param {*} rule
 * @param {*} value
 * @param {*} callback
 */
const strNumber = (rule, value, callback) => {
  if (value) {
    const errors = []
    if (!regPattern.stringNumber.test(Number(value))) {
      errors.push(new Error('只能输入数字'))
      callback(errors)
    } else {
      callback()
    }
  } else {
    callback()
  }
}

/**
 * Validate normal account
 * @param {*} rule
 * @param {*} value
 * @param {*} callback
 */
const account = (rule, value, callback) => {
  if (value) {
    const errors = []
    if (!regPattern.account.test(value)) {
      errors.push(new Error('大于4位的字母数字或下划线'))
      callback(errors)
    } else {
      callback()
    }
  } else {
    callback()
  }
}

/**
 * Validate cellPhone
 * @param {*} rule
 * @param {*} value
 * @param {*} callback
 */
const cellPhone = (rule, value, callback) => {
  if (value) {
    const errors = []
    if (!regPattern.cellPhone.test(value)) {
      errors.push(new Error('手机号填写有误'))
      callback(errors)
    } else {
      callback()
    }
  } else {
    callback()
  }
}

/**
 * Validate complex password
 * @param {*} rule
 * @param {*} value
 * @param {*} callback
 */
const complexPassword = (rule, value, callback) => {
  if (value) {
    const errors = []
    if (!regPattern.complexPassword.test(value)) {
      errors.push(new Error('%s至少6位且包含大写,小写数字和特殊字符'))
      callback(errors)
    } else {
      callback()
    }
  } else {
    callback()
  }
}

/**
 * Validate QQ
 * @param {*} rule
 * @param {*} value
 * @param {*} callback
 */
const tencentQQ = (rule, value, callback) => {
  if (value) {
    const errors = []
    if (!regPattern.qq.test(value)) {
      errors.push(new Error('必须符合字母数字下划线规则'))
      callback(errors)
    } else {
      callback()
    }
  } else {
    callback()
  }
}

/**
 * Validate dictTypeCode
 * @param {*} rule
 * @param {*} value
 * @param {*} callback
 */
const dictTypeCode = (rule, value, callback) => {
  if (value) {
    const errors = []
    if (!regPattern.dictTypeCode.test(value)) {
      errors.push(new Error('必须符合字母数字下划线规则'))
      callback(errors)
    } else {
      callback()
    }
  } else {
    callback()
  }
}

/**
 * Validate dictTypeCode
 * @param {*} rule
 * @param {*} value
 * @param {*} callback
 */
const dictOther = (rule, value, callback) => {
  if (value) {
    const errors = []
    if (!regPattern.dictOther.test(value)) {
      errors.push(new Error('必须符合字母数字下划线规则'))
      callback(errors)
    } else {
      callback()
    }
  } else {
    callback()
  }
}

/**
 * Validate dictTypeCode
 * @param {*} rule
 * @param {*} value
 * @param {*} callback
 */
const dictNum = (rule, value, callback) => {
  if (value) {
    const errors = []
    if (!regPattern.dictNum.test(value)) {
      errors.push(new Error('必须符合仅能输入3位以内数字规则'))
      callback(errors)
    } else {
      callback()
    }
  } else {
    callback()
  }
}

/**
 * Validate dictTypeCode
 * @param {*} rule
 * @param {*} value
 * @param {*} callback
 */
const paramsOther = (rule, value, callback) => {
  if (value) {
    const errors = []
    if (!regPattern.paramsOther.test(value)) {
      errors.push(new Error('必须符合字母数字下划线规则'))
      callback(errors)
    } else {
      callback()
    }
  } else {
    callback()
  }
}

/**
 * Validate dictTypeCode
 * @param {*} rule
 * @param {*} value
 * @param {*} callback
 */
const isVehicleNumber = (rule, value, callback) => {
  if (value) {
    const errors = []
    if (!regPattern.vehicleNumber.test(value)) {
      errors.push(new Error('车牌号码有误'))
      callback(errors)
    } else {
      callback()
    }
  } else {
    callback()
  }
}

/**
 * Validate 身份证号验证
 * @param {*} rule
 * @param {*} value
 * @param {*} callback
 */
const passcard = (rule, value, callback) => {
  if (value) {
    const errors = []
    if (!regPattern.passcard.test(value)) {
      errors.push(new Error('身份证号不合法'))
      callback(errors)
    } else {
      callback()
    }
  } else {
    callback()
  }
}
/**
 * Validate 手机号验证
 * @param {*} rule
 * @param {*} value
 * @param {*} callback
 */
const phoneNumber = (rule, value, callback) => {
  if (value) {
    const errors = []
    if (!regPattern.phoneNumber.test(value)) {
      errors.push(new Error('请输入正确的11位手机号码'))
      callback(errors)
    } else {
      callback()
    }
  } else {
    callback()
  }
}

export default {
  install(Vue) {
    /**
     * 参数 item
     * required true  必填项
     * lem  长度必须为len
     * maxLength  字符串的最大长度
     * min 和 max 必须同时给 min < max  type=number
     * type 手机号 phoneNumber
     *      邮箱   email
     *      各种自定义类型   定义在 src/utils/extendValidate 中    持续添加中.......
     * */

    Vue.prototype.validator = function (validateArr) {
      let rules = []
      if (validateArr && validateArr.length) {
        validateArr.map((item) => {
          if (typeof item.validator === 'function' || item.pattern) {
            rules.push(item)
          }
          if (item.required) {
            rules.push({ required: true, message: '该项为必填项', trigger: 'blur' })
          }
          if (item.maxLength) {
            rules.push({ min: 1, max: item.maxLength, message: '最多输入' + item.maxLength + '个字符', trigger: 'blur' })
          }
          if (item.min && item.max) {
            rules.push({ min: item.min, max: item.max, message: '字符长度在' + item.min + '至' + item.max + '之间', trigger: 'blur' })
          }
          if (item.len) {
            rules.push({ len: item.len, message: '请输入' + item.len + '个字符', trigger: 'blur' })
          }
          if (item.type) {
            let type = item.type
            switch (type) {
              case 'string':
                rules.push({ type: 'string', message: '请输入正确的字符串', trigger: 'blur' })
                break
              case 'number':
                rules.push({ type: 'number', message: '请输入正确的数值', trigger: 'blur' })
                break
              case 'boolean':
                rules.push({ type: 'boolean', message: '请输入正确的布尔值', trigger: 'blur' })
                break
              case 'method':
                rules.push({ type: 'method', message: '请输入正确的方法', trigger: 'blur' })
                break
              case 'regexp':
                rules.push({ type: 'regexp', message: '请输入正确的正则表达式', trigger: 'blur' })
                break
              case 'integer':
                rules.push({ type: 'integer', message: '请输入正确的整型', trigger: 'blur' })
                break
              case 'float':
                rules.push({ type: 'float', message: '请输入正确的浮点型', trigger: 'blur' })
                break
              case 'array':
                rules.push({ type: 'array', message: '请输入正确的数组', trigger: 'blur' })
                break
              case 'object':
                rules.push({ type: 'object', message: '请输入正确的对象', trigger: 'blur' })
                break
              case 'enum':
                rules.push({ type: 'enum', message: '请输入正确的枚举类型', trigger: 'blur' })
                break
              case 'date':
                rules.push({ type: 'date', message: '请输入正确的日期', trigger: 'blur' })
                break
              case 'url':
                rules.push({ type: 'url', message: '请输入正确的url', trigger: 'blur' })
                break
              case 'hex':
                rules.push({ type: 'hex', message: '请输入正确的十六进制', trigger: 'blur' })
                break
              case 'email':
                rules.push({ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' })
                break
              case 'strNumber':
                rules.push({ validator: strNumber, trigger: 'blur' })
                break
              case 'account':
                rules.push({ validator: account, trigger: 'blur' })
                break
              case 'cellPhone':
                rules.push({ validator: cellPhone, trigger: 'blur' })
                break
              case 'complexPassword':
                rules.push({ validator: complexPassword, trigger: 'blur' })
                break
              case 'tencentQQ':
                rules.push({ validator: tencentQQ, trigger: 'blur' })
                break
              case 'dictTypeCode':
                rules.push({ validator: dictTypeCode, trigger: 'blur' })
                break
              case 'dictOther':
                rules.push({ validator: dictOther, trigger: 'blur' })
                break
              case 'dictNum':
                rules.push({ validator: dictNum, trigger: 'blur' })
                break
              case 'paramsOther':
                rules.push({ validator: paramsOther, trigger: 'blur' })
                break
              case 'isVehicleNumber':
                rules.push({ validator: isVehicleNumber, trigger: 'blur' })
                break
              case 'passcard':
                rules.push({ validator: passcard, trigger: 'blur' })
                break
              case 'phoneNumber':
                rules.push({ validator: phoneNumber, trigger: 'blur' })
                break

              default:
                rules.push({})
                break
            }
          }
        })
      }

      return rules
    }
  }
}
