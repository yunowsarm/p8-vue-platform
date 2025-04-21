import DOMJS from '@/assets/commonJS/originalComponents/utils/dom'
export default class TreeSelect {
  constructor (parentEle, options) {
    this._init(parentEle, options)
  }

  _init (parentEle, {
    value,
    options = [],
    props = {
      value: 'value',
      label: 'label',
      children: 'children',
      parentId: 'pId'
    },
    placeholder = '请选择',
    onSelect
  }) {
    this.parentEle = document.querySelector(parentEle) || document.body
    this.value = value
    this.options = options
    this.props = props
    this.placeholder = placeholder
    this.onSelect = onSelect

    this.dropdownShow = false
    this.defaultPaddingLeft = 10
    this.display = {
      '1': 'none',
      '0': 'block'
    }
    this.defaultValue = value
    this._optionsHandle()
    this._createElement()
  }

  _optionsHandle () {
    let options = this.options
    if (options.length) {
      if (options[0].children && Array.isArray(options[0].children)) {

      } else {
        this.options = this.toTree(options, this.props)
      }
    }
  }

  // 平行数组转换为树形数组
  toTree (data, config) {
    let map = []
    data.forEach(item => {
      let parent = data.filter(d => d[config.value] === item[config.parentId])
      let children = data.filter(d => d[config.parentId] === item[config.value])
      if (children.length && !item.children) {
        item.children = children
      }
      if (!(parent.length && !children.length)) {
        map.push(item)
      }
    })
    if (data.length === map.length) {
      return map
    } else {
      return this.toTree(map, config)
    }
  }

  _createElement () {
    this.ele = {}

    let fragment = document.createDocumentFragment()
    // 1.创建tree-select根节点
    let root = DOMJS.createElement('div', 'cs-tree-select')

    // 2. 创建Input整体节点
    let { inputWrap, input, icon } = DOMJS.createInput(this.value, this.placeholder)

    // 3.1 创建tree-select下拉框包裹节点
    let dropdownWrap = DOMJS.createElement('div', 'cs-dropdown')
    let dropdownListWrap = DOMJS.createElement('div', 'cs-tree')

    // 将需要操作的dom挂载到实例上, 方便调用 这步操作放在3.2之前, 是因为创建列表时,匹配到this.value相等时, 对input进行赋值
    this.ele = {
      treeSelect: inputWrap,
      dropdown: dropdownWrap,
      selectIcon: icon,
      input: input
    }

    // 3.2 处理展示节点
    this._createDropdownItemElement(dropdownListWrap, this.options, 0)

    DOMJS.appendChild(dropdownWrap, dropdownListWrap)
    DOMJS.appendChild(root, [inputWrap, dropdownWrap])
    DOMJS.appendChild(fragment, root)
    DOMJS.appendChild(this.parentEle, fragment)

    this._bind(this.parentEle)
  }

  _createDropdownItemElement (parentEle, options, level) {
    options.forEach(option => {
      // 1.创建当前层级的包裹节点
      let treeItem = DOMJS.createElement('div', 'cs-tree-node')

      // 2.创建内容节点
      let treeContent = DOMJS.createElement('div', 'cs-tree-node__content')
      DOMJS.setStyle(treeContent, 'paddingLeft', `${level * this.defaultPaddingLeft}px`)

      // 2.1 创建箭头节点
      let treeContentIcon = DOMJS.createElement('span', 'cs-tree-node__icon')
      // 2.2 创建label节点
      let treeContentLabel = DOMJS.createElement('span', 'cs-tree-node__label')
      DOMJS.setInnerText(treeContentLabel, option[this.props.label])
      treeContentLabel.setAttribute('data-value', option[this.props.value])
      if (this.defaultValue === option[this.props.value]) {
        this.ele.input.value = option[this.props.label]
      }
      DOMJS.appendChild(treeContent, treeContentIcon)
      DOMJS.appendChild(treeContent, treeContentLabel)

      // 3.创建chlidren节点
      let treeChildren = DOMJS.createElement('span', 'cs-tree-node__children')
      treeChildren.setAttribute('data-display', '0')

      DOMJS.appendChild(treeItem, [treeContent, treeChildren])
      DOMJS.appendChild(parentEle, treeItem)

      if (option.children && option.children.length) {
        this._createDropdownItemElement(treeChildren, option.children, level + 1)
      } else {
        DOMJS.setClassName(treeContentIcon, 'cs-tree-node__icon not-children')
      }
    })
  }

  // 默认选中时, 打开选中值所在折叠面板
  _openPanel (data) {
    const _this = this
    for (let i = 0; i < data.length; i++) {
      let item = data[i]
      if (item[this.props.value] === this.defaultValue) {
        let labelAll = DOMJS.querySelectorAll('.cs-tree-node__label')
        labelAll.forEach(label => {
          let v = label.getAttribute('data-value')
          /* eslint-disable */
          if (v == item[this.props.value]) {
            DOMJS.setClassName(label, 'cs-tree-node__label is-selected')
            if (item[this.props.parentId]) {
              openNode(_this.options, item[this.props.parentId])
            }
          }
        })
        break
      } else {
        item.children && this._openPanel(item.children)
      }
    }

    // 当前选中的值向上一层一层使其展开
    function openNode (data, pId) {
      for (let i = 0; i < data.length; i++) {
        let item = data[i]
        if (item[_this.props.value] === pId) {
          let labelAll = DOMJS.querySelectorAll('.cs-tree-node__label')
          labelAll.forEach(label => {
            let v = label.getAttribute('data-value')
            if (v == item[_this.props.value]) {
              let labelPreEle = label.previousSibling
              let childrenEle = label.parentNode.nextSibling
              DOMJS.setClassName(labelPreEle, 'cs-tree-node__icon is-open')
              DOMJS.setStyle(childrenEle, { display: 'block', opacity: '1' })
              childrenEle.setAttribute('data-display', '1')
              if (item[_this.props.parentId]) {
                openNode(_this.options, item[_this.props.parentId])
              }
            }
          })
        } else {
          item.children && openNode(item.children, pId)
        }
      }
    }
  }

  // 点击三角图标, 对应的children收缩
  _treeNodeChildrenDisplay (ele) {
    if (ele.className.indexOf('not-children') > -1) {
      return
    }
    let treeNodeChild = ele.parentNode.nextSibling
    let display = treeNodeChild.getAttribute('data-display')
    DOMJS.setStyle(treeNodeChild, 'display', this.display[display])
    treeNodeChild.setAttribute('data-display', display === '0' ? '1' : '0')
    setTimeout(() => {
      if (display === '0') {
        DOMJS.setStyle(treeNodeChild, 'opacity', '1')
        DOMJS.setClassName(ele, 'cs-tree-node__icon is-open')
      } else {
        DOMJS.setStyle(treeNodeChild, 'opacity', '0')
        DOMJS.setClassName(ele, 'cs-tree-node__icon')
      }
    }, 14)
  }

  // 收起下拉选项
  _selectDropup () {
      DOMJS.setStyle(this.ele.dropdown, { transform: 'scale(1,0)', opacity: '0' })
      DOMJS.setClassName(this.ele.treeSelect, 'cs-input')
      DOMJS.setClassName(this.ele.selectIcon, 'cs-input-icon el-icon-arrow-down')
      this.dropdownShow = false
  }

  // 展示下拉选项
  _selectDropdown () {
    DOMJS.setStyle(this.ele.dropdown, { transform: 'scale(1,1)', opacity: '1' })
    DOMJS.setClassName(this.ele.treeSelect, 'cs-input cs-input-focus')
    DOMJS.setClassName(this.ele.selectIcon, 'cs-input-icon el-icon-arrow-down is-reverse')
    this.dropdownShow = true

    if (this.defaultValue) {
      this._openPanel(this.options)
    }
  }

  // 下拉列表点击
  _dropItemClick (ele) {
    let value = ele.getAttribute('data-value')
    this.defaultValue = value
    this.ele.input.value = ele.innerText
    DOMJS.setClassName(ele, 'cs-tree-node__label is-selected')

    this._updateLabelSelectedByValue()
    this._selectDropup()
    this._emit('onSelect')
  }

  // node遍历是否是子元素包裹元素
  _getTargetNode (ele, target) {
    // ele是内部元素，target是你想找到的包裹元素
    if (!ele || ele === document) return false
    return ele === target ? true : this._getTargetNode(ele.parentNode, target)
  }

  // 更新select icon 类名(箭头 or 清空)
  _updataSelectIconClass (type) {
    if (type === 'enter') {
      DOMJS.setClassName(this.ele.selectIcon, 'cs-input-icon cs-input-icon__clear el-icon-circle-close')
    } else {
      DOMJS.setClassName(this.ele.selectIcon, 'cs-input-icon el-icon-arrow-down')
    }
  }

  _updateLabelSelectedByValue () {
    // 清除其他节点选中状态
    let labelSelectedAll = DOMJS.querySelectorAll('.cs-tree-node__label.is-selected')
    labelSelectedAll.forEach(label => {
      let value = label.getAttribute('data-value')
      if (value !== this.defaultValue) {
        DOMJS.setClassName(label, 'cs-tree-node__label')
      }
    })
  }

  _clear () {
    this.defaultValue = ''
    this.ele.input.value = ''
    this._updateLabelSelectedByValue()
    this._updataSelectIconClass('leave')
    this._emit('onSelect')
  }

  _emit (type) {
    this[type] && this[type](this.defaultValue)
  }

  _bind (parentEle) {
    const _this = this
    parentEle.addEventListener('click', (e) => {
      const ele = e.target
      // 遍历当前点击的元素，如果是选中框内的元素执行
      if (_this._getTargetNode(ele, _this.ele.treeSelect)) {
        if (ele.className.indexOf('cs-input-icon__clear') > -1) { // 如果是点击的clear图标执行
          _this._clear()
        } else {
          if (_this.dropdownShow) {
            _this._selectDropup()
          } else {
            _this._selectDropdown()
          }
        }
      } else {
        // _this._selectDropup()
        if (ele.className.indexOf('cs-tree-node__icon') > -1) { // 列表三角图标
          _this._treeNodeChildrenDisplay(ele)
        } else if (ele.className.indexOf('cs-tree-node__label') > -1) { // 列表内容
          _this._dropItemClick(ele)
        } else {
          _this._selectDropup()
        }
      }
    })

    this.ele.treeSelect.addEventListener('mouseenter', function (e) {
      _this.defaultValue && _this._updataSelectIconClass('enter')
    })
    this.ele.treeSelect.addEventListener('mouseleave', function (e) {
      _this.defaultValue && _this._updataSelectIconClass('leave')
    })
  }
}
