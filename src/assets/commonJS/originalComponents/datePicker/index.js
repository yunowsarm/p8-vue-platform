import DOMJS from '@/assets/commonJS/originalComponents/utils/dom'
import DatePanel from './panel'
import moment from 'moment'
export default class DatePicker {
  constructor (parentEle, options) {
    this._init(parentEle, options)
  }

  _init (parentEle, {
    value = '',
    customClassName = '',
    placeholder = '选择日期',
    onChange
  }) {
    this.parentEle = document.querySelector(parentEle) || document.body
    this.value = value
    this.customClassName = customClassName
    this.placeholder = placeholder
    this.onChange = onChange
    this.ele = {}
    this.dpPanelShow = false
    this._createElement()
  }

  _createElement () {
    const _this = this
    let fragment = document.createDocumentFragment()
    // 1. 创建datePicker根节点
    let dpRoot = DOMJS.createElement('div', `cs-date-picker ${this.customClassName}`)
    // 2. 创建Input整体节点
    let { inputWrap, input, spanIconWrap, icon } = DOMJS.createInput(this.value ? moment(this.value).format('YYYY-MM-DD') : '', this.placeholder)
    this.ele.inputWrap = inputWrap
    this.ele.input = input
    this.ele.spanIconWrap = spanIconWrap
    this.ele.inputIcon = icon
    // 3. 创建datePicker弹窗面板
    this.ele.dpPanel = new DatePanel({
      value: _this.value,
      date: (_this.value && new Date(_this.value)) || new Date(),
      dateCellClick (v) {
        let { date, year, month } = v
        _this.value = date
        _this.ele.input.value = moment(date).format('YYYY-MM-DD')
        _this._selectDropup()
        _this.onChange && _this.onChange({ date, year, month })
      }
    })
    DOMJS.appendChild(dpRoot, inputWrap)
    DOMJS.appendChild(dpRoot, this.ele.dpPanel.root)
    DOMJS.appendChild(fragment, dpRoot)
    DOMJS.appendChild(this.parentEle, fragment)

    this._bind()
  }

  // 收起下拉选项
  _selectDropup () {
    this.dpPanelShow = false
    DOMJS.setStyle(this.ele.dpPanel.root, 'transform', 'scale(1,0)')
    DOMJS.setStyle(this.ele.dpPanel.root, 'opacity', '0')
  }

  // 展示下拉选项
  _selectDropdown () {
    this.dpPanelShow = true
    DOMJS.setStyle(this.ele.dpPanel.root, 'transform', 'scale(1,1)')
    DOMJS.setStyle(this.ele.dpPanel.root, 'opacity', '1')
    this.ele.dpPanel.show()
  }

  // 更新input icon 类名(箭头 or 清空)
  _updataSelectIconClass (type) {
    if (type === 'enter') {
        this.ele.inputIcon.className = 'cs-input-icon cs-input-icon__clear el-icon-circle-close'
    } else {
        this.ele.inputIcon.className = 'cs-input-icon el-icon-arrow-down'
    }
  }

  _clear () {
    this.vlaue = ''
    this.ele.input.value = ''
    this.ele.dpPanel.date = new Date()
    this.ele.dpPanel.value = ''
    this.ele.dpPanel.updateDate()
    this._updataSelectIconClass('leave')
    this.onChange && this.onChange({})
  }

  _bind () {
    const _this = this
    this.ele.inputWrap.addEventListener('click', (e) => {
      const target = e.target
      if (target.className.indexOf('cs-input-icon__clear') > -1) {
        _this._clear()
      } else {
        this.dpPanelShow ? this._selectDropup() : this._selectDropdown()
      }
    })

    this.ele.inputWrap.addEventListener('mouseenter', function (e) {
      _this.value && _this._updataSelectIconClass('enter')
    })
    this.ele.inputWrap.addEventListener('mouseleave', function (e) {
      _this.value && _this._updataSelectIconClass('leave')
    })
  }
}
