import DOMJS from '@/assets/commonJS/originalComponents/utils/dom'
export default class Selector {
  constructor (parentEle, options) {
    this._init(parentEle, options)
  }

  _init (parentEle, {
    customClassName = '', // select最外层class类名 -- 提供自定义类名,供外部修改组件样式.
    options = [], // 传入的下拉框对象，name为选择的文字，value为值
    props = {
      value: 'value',
      label: 'label'
    },
    value = '',
    placeholder = '请选择',
    multiple = false, // 是否多选
    onSelect // 列表选中
  }) {
    // 将传入的数据绑定到this上
    this.parentEle = document.querySelector(parentEle) || document.body
    this.customClassName = customClassName
    this.options = options // 选择值数组对象
    this.props = props
    this.value = value
    this.placeholder = placeholder
    // this.defaultText = defaultText // 默认值
    this.multiple = multiple
    this.onSelect = onSelect

    this.ele = {}
    this.dropboxShow = false // 定义存储下拉框的显示隐藏状态
    this.defaultValue = multiple ? [] : '' // 定义村赤默认选中的值
    this.defaultText = this.placeholder
    this._creatElement() // 初始化后执行创建元素方法
  }

  _creatElement () {
    let wrapEle = DOMJS.createElement('div', `cs-select ${this.customClassName}`)

    // 根据传入的值获取选择框默认的值和内容
    this._renderDefaultValue()

    // 2. 创建Input整体节点
    let { inputWrap, input, spanIconWrap, icon } = DOMJS.createInput(this.defaultText, this.placeholder)

    // 下拉框
    let dropbox = DOMJS.createElement('div', `select-dropdown ${this.multiple ? 'is-multiple' : ''}`)
    let ulbox = DOMJS.createElement('ul', 'select-dropdown-list')

    // 遍历传入的选项数组对象，生成下拉菜单的li元素并赋值
    this.options.forEach((item) => {
      let className = ''
      if (this.multiple) {
        className = this.defaultValue.indexOf(item[this.props.value]) > -1 ? 'select-item select-item-selected' : 'select-item'
      } else {
        className = this.defaultValue === item[this.props.value] ? 'select-item select-item-selected' : 'select-item'
      }
      let itemLi = DOMJS.createElement('li', className)
      itemLi.setAttribute('data-value', item[this.props.value])
      DOMJS.setInnerText(itemLi, item[this.props.label])
      DOMJS.appendChild(ulbox, itemLi)
    })
    // 将下拉框ul推入到包裹元素
    DOMJS.appendChild(dropbox, ulbox)
    DOMJS.appendChild(wrapEle, [inputWrap, dropbox])
    DOMJS.appendChild(this.parentEle, wrapEle)
    // 把需要操作的dom挂载到当前实例
    this.ele = {
      wrap: wrapEle,
      inputWrap: inputWrap,
      input: input,
      drop: dropbox,
      selectSpan: spanIconWrap,
      selectIcon: icon
    }
    // 绑定事件处理函数
    this._bind(this.parentEle)
  }

  _renderDefaultValue () {
    if (this.multiple) {
      const valueType = typeof this.value
      let valueTemp = (valueType === 'string' && this.value) ? this.value.splice(',') : this.value.length ? this.value : []
      if (valueTemp.length) {
        this.defaultValue = valueTemp
        this._multipleDefaultText(this.defaultValue)
      }
    } else {
      if (this.value) {
        const optionByValue = this.options.filter(option => option[this.props.value] === this.value)
        if (optionByValue.length && optionByValue[0][this.props.label]) {
          this.defaultText = optionByValue[0][this.props.label]
          this.defaultValue = this.value
        }
      }
    }
  }

  // 收起下拉选项
  _selectDropup () {
    DOMJS.setStyle(this.ele.drop, { transform: 'scale(1,0)', opacity: '0' })
    DOMJS.setClassName(this.ele.inputWrap, 'cs-input')
    DOMJS.setClassName(this.ele.selectIcon, 'cs-input-icon el-icon-arrow-down')
    this.dropboxShow = false
  }

  // 展示下拉选项
  _selectDropdown () {
    DOMJS.setStyle(this.ele.drop, { transform: 'scale(1,1)', opacity: '1' })
    DOMJS.setClassName(this.ele.inputWrap, 'cs-input cs-input-focus')
    DOMJS.setClassName(this.ele.selectIcon, 'cs-input-icon el-icon-arrow-down is-reverse')
    this.dropboxShow = true
  }

  // 点击下拉选项进行赋值
  _dropItemClick (ele) {
    this.defaultValue = ele.getAttribute('data-value')
    this.ele.input.value = ele.innerText
    DOMJS.setClassName(ele, 'select-item select-item-selected')
    // 对点击选中的其他所有兄弟元素修改class去除选中样式
    let selectedAll = DOMJS.querySelectorAll('.select-item.select-item-selected')
    selectedAll.forEach(select => {
      if (select.getAttribute('data-value') !== this.defaultValue) {
        DOMJS.setClassName(select, 'select-item')
      }
    })
    this._selectDropup()
    this._emit('select')
  }

  // 多选-点击下拉选项进行赋值
  _dropItemClickMultiple (ele) {
    const value = ele.getAttribute('data-value')
    const isSelected = selectedCheck(ele)
    DOMJS.setClassName(ele, `${isSelected ? 'select-item' : 'select-item select-item-selected'}`)
    if (isSelected) {
      const index = this.defaultValue.findIndex(v => v === value)
      this.defaultValue.splice(index, 1)
    } else {
      this.defaultValue.push(value)
    }

    this._multipleDefaultText(this.defaultValue)
    this.ele.input.value = this.defaultText

    this._emit('select')

    function selectedCheck (ele) {
      const eleClassName = ele.className
      return eleClassName.indexOf('select-item-selected') > -1
    }
  }

  // 多选: 文本展示处理
  _multipleDefaultText (value) {
    if (value && value.length) {
      let innerText = []
      value.forEach(v => {
        let option = this.options.filter(option => option[this.props.value] === v)
        innerText.push(option[0][this.props.label])
      })
      const text = innerText.length >= 2 ? ` +${innerText.length - 1}` : ''
      this.defaultText = `${innerText[0]}${text}`
    } else {
      this.defaultText = this.placeholder
      this.defaultValue = []
    }
  }

  _clear () {
    this.defaultValue = this.multiple ? [] : ''
    this.defaultText = this.placeholder
    this.ele.input.value = ''
    let eleSelected = DOMJS.querySelectorAll('.select-item-selected')
    if (eleSelected.length) {
      eleSelected.forEach(ele => {
        DOMJS.setClassName(ele, 'select-item')
      })
    }
    this._updataSelectIconClass('leave')
    this._emit('select')
  }

  // 更新select icon 类名(箭头 or 清空)
  _updataSelectIconClass (type) {
    if (type === 'enter') {
      DOMJS.setClassName(this.ele.selectIcon, 'cs-input-icon cs-input-icon__clear el-icon-circle-close')
    } else {
      DOMJS.setClassName(this.ele.selectIcon, 'cs-input-icon el-icon-arrow-down')
    }
  }

  // node遍历是否是子元素包裹元素
  _getTargetNode (ele, target) {
    // ele是内部元素，target是你想找到的包裹元素
    if (!ele || ele === document) return false
    return ele === target ? true : this._getTargetNode(ele.parentNode, target)
  }

  _emit (type) {
    switch (type) {
      case 'select':
        this.onSelect && this.onSelect(this.defaultValue)
        break
    }
  }

  // 绑定下拉框事件处理函数
  _bind (parentEle) {
    let _this = this
    // 事件委托到最外层包裹元素进行绑定处理
    parentEle.addEventListener('click', function (e) {
      const ele = e.target
      // 遍历当前点击的元素，如果是选中框内的元素执行
      if (_this._getTargetNode(ele, _this.ele.inputWrap)) {
        if (ele.className.indexOf('cs-input-icon__clear') > -1) { // 如果是点击的clear图标执行
          _this._clear()
        } else {
          if (_this.dropboxShow) {
            _this._selectDropup()
          } else {
            _this._selectDropdown()
          }
        }
      } else if (ele.className.indexOf('select-item') > -1) { // 如果是点击的下拉框的选项执行
        _this.multiple ? _this._dropItemClickMultiple(ele) : _this._dropItemClick(ele)
      } else { // 点击其他地方隐藏下拉框
        _this._selectDropup()
      }
    })
    this.ele.inputWrap.addEventListener('mouseenter', function (e) {
      if (_this.multiple && _this.defaultValue.length) {
        _this._updataSelectIconClass('enter')
      } else if (!_this.multiple && _this.defaultValue) {
        _this._updataSelectIconClass('enter')
      }
    })
    this.ele.inputWrap.addEventListener('mouseleave', function (e) {
      if (_this.multiple && _this.defaultValue.length) {
        _this._updataSelectIconClass('leave')
      } else if (!_this.multiple && _this.defaultValue) {
        _this._updataSelectIconClass('leave')
      }
    })
  }
}
