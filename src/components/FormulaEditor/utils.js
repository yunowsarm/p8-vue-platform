/**
 * 检验公式是否合法
 * @param {string} formula 公式文本
 * @returns {Object} 验证结果对象
 */
export function validateFormula(formula) {
  if (!formula) {
    return {
      isValid: true,
      // message: '公式不能为空'
    }
  }

  // 分割公式元素
  const elements = formula.trim().split(' ').filter(Boolean)

  // 基本规则检查
  const basicChecks = {
    // 检查括号是否匹配
    checkBrackets() {
      let stack = []
      for (let char of formula) {
        if (char === '(') {
          stack.push(char)
        } else if (char === ')') {
          if (stack.length === 0) return false
          stack.pop()
        }
      }
      return stack.length === 0
    },

    // 检查运算符使用是否正确
    checkOperators() {
      const operators = ['+', '-', '*', '/']
      for (let i = 0; i < elements.length; i++) {
        const current = elements[i]
        if (operators.includes(current)) {
          // 运算符不能在开头或结尾
          if (i === 0 || i === elements.length - 1) {
            return false
          }
          // 运算符不能连续
          if (operators.includes(elements[i - 1]) || operators.includes(elements[i + 1])) {
            return false
          }
        }
      }
      return true
    },

    // 检查公式完整性
    checkCompleteness() {
      if (elements.length < 3) {
        return false
      }
      return true
    }
  }

  // 执行所有检查
  try {
    if (!basicChecks.checkBrackets()) {
      return {
        isValid: false,
        message: '括号不匹配'
      }
    }

    if (!basicChecks.checkOperators()) {
      return {
        isValid: false,
        message: '运算符使用不正确'
      }
    }

    if (!basicChecks.checkCompleteness()) {
      return {
        isValid: false,
        message: '公式不完整'
      }
    }

    // 尝试计算公式
    // 注意：在实际生产环境中，应该根据具体业务需求来决定是否需要进行计算验证
    const sanitizedFormula = elements.join(' ')
    const isCalculatable = testCalculation(sanitizedFormula)

    if (!isCalculatable) {
      return {
        isValid: false,
        message: '公式结构有误'
      }
    }

    return {
      isValid: true,
      message: '公式验证通过'
    }
  } catch (error) {
    return {
      isValid: false,
      message: '公式格式错误'
    }
  }
}

/**
 * 测试公式是否可以计算
 * @param {string} formula
 * @returns {boolean}
 */
function testCalculation(formula) {
  try {
    // 将属性替换为数字进行测试
    const testFormula = formula.replace(/[a-zA-Z_]\w*/g, '1')
    // eslint-disable-next-line no-new-func
    new Function(`return ${testFormula}`)()
    return true
  } catch {
    return false
  }
}
