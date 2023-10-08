import DOMJS from '@/assets/commonJS/originalComponents/utils/dom'
export default class Inputor {
  constructor (parentEle, options) {
    this._init(parentEle, options)
  }

  _init (parentEle, {
    value = '',
    placeholder = '请输入',
    onChange,
    onChangeValue
  }) {
    this.parentEle = document.querySelector(parentEle) || document.body
    this.value = value
    this.placeholder = placeholder
    this.onChange = onChange
    this.onChangeValue = onChangeValue

    this.ele = {}
    this._createElement()
  }

  _createElement () {
    let { inputWrap, input, spanIconWrap, icon } = DOMJS.createInput(this.value, this.placeholder)
    input.readOnly = false
    input.oninput = (e) => {
      let value = e.target.value
      this.value = value
      this.onChangeValue && this.onChangeValue(value)
    }
    input.addEventListener('keydown', (e) => {
      if (e.keyCode === 13) {
        this.onChange && this.onChange(this.value)
      }
    })
    DOMJS.setStyle(icon, 'display', 'none')
    DOMJS.setClassName(icon, 'cs-input-icon el-icon-circle-close')

    DOMJS.appendChild(this.parentEle, inputWrap)
    this.ele = {
      inputWrap,
      input,
      spanIconWrap,
      icon
    }

    this._bind()
  }

  _clear () {
    this.value = ''
    this.ele.input.value = ''
    this.onChangeValue && this.onChangeValue('')
    this.onChange && this.onChange('')
  }

  _bind () {
    const _this = this
    this.ele.inputWrap.addEventListener('click', function (e) {
      let target = e.target
      if (target.className.indexOf('el-icon-circle-close') > -1) {
        _this._clear()
      }
    })
    this.ele.inputWrap.addEventListener('mouseenter', function (e) {
      if (_this.value) {
        DOMJS.setStyle(_this.ele.icon, 'display', 'initial')
      }
    })
    this.ele.inputWrap.addEventListener('mouseleave', function (e) {
      DOMJS.setStyle(_this.ele.icon, 'display', 'none')
    })
  }
}
