export default {
  /**
   * @param {*} tag 创建元素的类型 div / p / ul ...
   * @param {*} className 元素绑定的类名
   */
  createElement (tag, className) {
    let dom = document.createElement(tag)
    dom.className = className
    return dom
  },

  /**
   * @param {*} parentEle 父节点
   * @param {*} childEle 子节点
   */
  appendChild (parentEle, childEle) {
    if (Array.isArray(childEle)) {
      childEle.forEach(child => {
        parentEle.appendChild(child)
      })
    } else {
      parentEle.appendChild(childEle)
    }
  },

  querySelectorAll (tag) {
    return document.querySelectorAll(tag)
  },

  getChildren (parent) {
    return parent.children
  },

  setClassName (ele, className) {
    ele.className = className
  },

  setInnerText (ele, text) {
    ele.innerText = text
  },

  setStyle (ele, attr, value) {
    if (typeof attr === 'string') {
      ele.style[attr] = value
    } else if (typeof attr === 'object' && Object.keys(attr).length) {
      for (let k in attr) {
        ele.style[k] = attr[k]
      }
    }
  },

  /**
   * @function 创建一个包含Input的整体节点
   */
  createInput (value, placeholder) {
    let inputWrap = this.createElement('div', 'cs-input')
    // 2.1 创建input节点
    let input = this.createElement('input', 'cs-input_inner')
    input.className = 'cs-input_inner'
    input.readOnly = 'readOnly'
    input.type = 'text'
    input.value = value
    input.placeholder = placeholder
    // 2.2 创建icon节点
    let spanIconWrap = this.createElement('span', 'cs-input__suffix')
    let icon = this.createElement('i', 'cs-input-icon el-icon-arrow-down')
    this.appendChild(spanIconWrap, icon)
    this.appendChild(inputWrap, input)
    this.appendChild(inputWrap, spanIconWrap)
    return {
      inputWrap,
      input,
      spanIconWrap,
      icon
    }
  }
}
