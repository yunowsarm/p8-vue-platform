import DOMJS from '@/assets/commonJS/originalComponents/utils/dom'
import DATEJS from '@/assets/commonJS/originalComponents/utils/date'
export default class DatePanel {
  constructor (options) {
    this._init(options)
  }

  _init ({
    value,
    date = new Date(),
    firstDayOfWeek = 7,
    dateCellClick
  }) {
    this.value = value
    this.date = date
    this.firstDayOfWeek = firstDayOfWeek
    this.dateCellClick = dateCellClick

    this.WEEKS = ['日', '一', '二', '三', '四', '五', '六']
    this.ele = {} // 将需要操作的元素集中到ele对象下

    this._getYear(this.date)
    this._getMonth(this.date)
    this._getStartYear(this.date)

    this._createPanelElement()
    this._bind()
  }

  _getYear (date) {
    this.year = date.getFullYear()
  }

  _getMonth (date) {
    this.month = date.getMonth()
  }

  _getStartYear (date) {
    this.startYear = Math.floor(date.getFullYear() / 10) * 10
  }

  /**
   * @function 创建DatePicker的面板弹窗
   */
  _createPanelElement () {
    let root = DOMJS.createElement('div', 'cs-date-picker-panel')
    let header = this._createHeader()
    DOMJS.appendChild(root, header)
    let content = this._createContent()
    DOMJS.appendChild(root, content)
    this.ele.header = header
    this.root = root
  }

  /**
   * @function 创建面板的头部元素
   */
  _createHeader () {
    let header = DOMJS.createElement('div', 'cs-date-picker-panel__header')
    let btnPrevYear = DOMJS.createElement('span', 'cs-date-picker-panel__icon-btn cs-date-picker-panel__prev-btn el-icon-d-arrow-left')
    let btnPrevMonth = DOMJS.createElement('span', 'cs-date-picker-panel__icon-btn cs-date-picker-panel__prev-btn el-icon-arrow-left')
    let btnTextYear = DOMJS.createElement('span', 'cs-date-picker__header-label')
    let btnTextMonth = DOMJS.createElement('span', 'cs-date-picker__header-label')
    let btnNextYear = DOMJS.createElement('span', 'cs-date-picker-panel__icon-btn cs-date-picker-panel__next-btn el-icon-d-arrow-right')
    let btnNextMonth = DOMJS.createElement('span', 'cs-date-picker-panel__icon-btn cs-date-picker-panel__next-btn el-icon-arrow-right')

    btnPrevYear.setAttribute('data-type', 'prevYear')
    btnPrevMonth.setAttribute('data-type', 'prevMonth')
    btnTextYear.setAttribute('data-type', 'labelYear')
    btnTextMonth.setAttribute('data-type', 'labelMonth')
    btnNextYear.setAttribute('data-type', 'nextYear')
    btnNextMonth.setAttribute('data-type', 'nextMonth')

    DOMJS.setInnerText(btnTextYear, `${this.year} 年`)
    DOMJS.setInnerText(btnTextMonth, `${this.month + 1} 月`)

    DOMJS.appendChild(header, btnPrevYear)
    DOMJS.appendChild(header, btnPrevMonth)
    DOMJS.appendChild(header, btnTextYear)
    DOMJS.appendChild(header, btnTextMonth)
    DOMJS.appendChild(header, btnNextYear)
    DOMJS.appendChild(header, btnNextMonth)

    this.ele.prevYear = btnPrevYear
    this.ele.prevMonth = btnPrevMonth
    this.ele.labelYear = btnTextYear
    this.ele.labelMonth = btnTextMonth
    this.ele.nextYear = btnNextYear
    this.ele.nextMonth = btnNextMonth

    return header
  }

  /**
   * @function 创建面板的内容区域(日期天数-date,年份-year,月份-month)
   */
  _createContent () {
    let content = DOMJS.createElement('div', 'cs-date-picker-panel__content')
    let contentDate = this._createContentDate()
    let contentYear = this._createContentYear()
    let contentMonth = this._createContentMonth()

    DOMJS.appendChild(content, contentDate)
    DOMJS.appendChild(content, contentYear)
    DOMJS.appendChild(content, contentMonth)
    return content
  }

  /**
   * @function 创建日期天数面板
   */
  _createContentDate () {
    let contentDate = DOMJS.createElement('div', 'cs-date-picker-panel__content-date')
    // contentDate.style.display = 'none'
    this._createDateWeekHeader(contentDate)
    this._createDateRows(contentDate)

    this.ele.contentDate = contentDate
    return contentDate
  }

  /**
   * @function 创建日期天数-星期行
   */
  _createDateWeekHeader (contentDate) {
    let dateWeekHeaderWrap = DOMJS.createElement('div', 'cs-date-picker-panel__content-date-row-week')
    this.WEEKS.forEach(label => {
      let item = DOMJS.createElement('div', 'cs-date-picker-panel__content-date-cell-week')
      DOMJS.appendChild(dateWeekHeaderWrap, item)
      item.innerText = label
    })
    DOMJS.appendChild(contentDate, dateWeekHeaderWrap)
  }

  /**
   * @function 创建日期天数-行
   */
  _createDateRows (contentDate) {
    let rows = this._getDateRows()
    rows.forEach(row => {
      let dateItemWrap = DOMJS.createElement('div', 'cs-date-picker-panel__content-date-row')
      row.forEach(r => {
        let item = DOMJS.createElement('div', `cs-date-picker-panel__content-date-cell ${r.type}`)
        item.innerText = r.text
        item.setAttribute('data-row', r.row)
        item.setAttribute('data-column', r.column)
        DOMJS.appendChild(dateItemWrap, item)
      })
      DOMJS.appendChild(contentDate, dateItemWrap)
    })
  }

  /**
   * @function 获取日期天数-行数据
   */
  _getDateRows () {
    const date = new Date(this.year, this.month, 1)
    let day = DATEJS.getFirstDayOfMonth(date)
    const dateCountOfMonth = DATEJS.getDayCountOfMonth(date.getFullYear(), date.getMonth())
    const dateCountOfLastMonth = DATEJS.getDayCountOfMonth(date.getFullYear(), (date.getMonth() === 0 ? 11 : date.getMonth() - 1))

    day = (day === 0 ? 7 : day) // 0-代表周日

    const offset = this.firstDayOfWeek > 3 ? 7 - this.firstDayOfWeek : -this.firstDayOfWeek
    const rows = [ [], [], [], [], [], [] ] // date日期天数面板 默认展示6行7列 一共42个cell

    let count = 1

    const startDate = DATEJS.getStartDateOfMonth(this.year, this.month)
    const now = DATEJS.getDateTimestamp(new Date())
    const valueTime = (this.value && DATEJS.getDateTimestamp(new Date(this.value))) || false

    for (let i = 0; i < 6; i++) {
      const row = rows[i]

      for (let j = 0; j < 7; j++) {
        let cell = row[j]
        if (!cell) {
          cell = { row: i, column: j, type: 'normal' }
        }
        const index = i * 7 + j
        const time = DATEJS.nextDate(startDate, index - offset).getTime()

        const isToday = time === now
        if (isToday) {
          cell.type = 'today'
        }

        if (valueTime && valueTime === time) {
          cell.type = 'active'
        }

        if (i >= 0 && i <= 1) {
          const numberOfDaysFromPreviousMonth = day + offset < 0 ? 7 + day + offset : day + offset

          if (j + i * 7 >= numberOfDaysFromPreviousMonth) {
            cell.text = count++
          } else {
            cell.text = dateCountOfLastMonth - (numberOfDaysFromPreviousMonth - j % 7) + 1 + i * 7
            cell.type = 'prev-month'
          }
        } else {
          if (count <= dateCountOfMonth) {
            cell.text = count++
          } else {
            cell.text = count++ - dateCountOfMonth
            cell.type = 'next-month'
          }
        }
        row[j] = cell
      }
    }
    return rows
  }

  /**
   * @function 创建年份面板
   */
  _createContentYear () {
    let contentYear = DOMJS.createElement('div', 'cs-date-picker-panel__content-year')
    contentYear.style.display = 'none'
    this._createYearCell(contentYear)
    this.ele.contentYear = contentYear
    return contentYear
  }

  /**
   * @function 创建年份单元格
   */
  _createYearCell (contentYear) {
    for (let i = 0; i < 10; i++) {
      let yearCell = DOMJS.createElement('div', 'cs-date-picker-panel__content-year-cell')
      yearCell.setAttribute('data-year', this.startYear + i)
      DOMJS.setInnerText(yearCell, this.startYear + i)
      DOMJS.appendChild(contentYear, yearCell)
    }
  }

  /**
   * @function 创建月份面板
   */
  _createContentMonth () {
    let contentMonth = DOMJS.createElement('div', 'cs-date-picker-panel__content-month')
    contentMonth.style.display = 'none'
    this._createMonthCell(contentMonth)
    this.ele.contentMonth = contentMonth
    return contentMonth
  }

  /**
   * @function 创建月份单元格
   */
  _createMonthCell (contentMonth) {
    for (let i = 0; i < 12; i++) {
      let monthCell = DOMJS.createElement('div', 'cs-date-picker-panel__content-month-cell')
      monthCell.setAttribute('data-month', i)
      DOMJS.setInnerText(monthCell, `${i + 1} 月`)
      DOMJS.appendChild(contentMonth, monthCell)
    }
  }

  /**
   * @function 面板头部header部分点击事件处理
   * @param {*} eventType 类型 (prevYear / prevMonth / nextMonth / nextYear)
   */
  updateDate () {
    // 1. 更新时间
    this._getYear(this.date)
    this._getMonth(this.date)
    this._getStartYear(this.date)

    // 2. 更新header label
    DOMJS.setInnerText(this.ele.labelYear, `${this.year} 年`)
    DOMJS.setInnerText(this.ele.labelMonth, `${this.month + 1} 月`)

    // 3. 更新日期列表
    let rows = this._getDateRows()

    // let contentDateRowsEle = DOMJS.querySelectorAll('.cs-date-picker-panel__content-date-row')
    let contentDateRowsEle = this.ele.contentDate.querySelectorAll('.cs-date-picker-panel__content-date-row')
    rows.forEach((row, idx) => {
      let rowChildren = DOMJS.getChildren(contentDateRowsEle[idx])
      row.forEach((r, i) => {
        DOMJS.setClassName(rowChildren[i], `cs-date-picker-panel__content-date-cell ${r.type}`)
        DOMJS.setInnerText(rowChildren[i], r.text)
        rowChildren[i].setAttribute('date-row', r.row)
        rowChildren[i].setAttribute('date-column', r.column)
      })
    })
  }

  /**
   * @function 日期天数面板点击处理
   * @param {*} target 点击元素
   */
  _dateCellClick (target) {
    const rowIndex = Number(target.getAttribute('data-row'))
    const columnIndex = Number(target.getAttribute('data-column'))
    const offset = this.firstDayOfWeek > 3 ? 7 - this.firstDayOfWeek : -this.firstDayOfWeek
    const index = rowIndex * 7 + columnIndex
    const startDate = DATEJS.getStartDateOfMonth(this.year, this.month)
    // 1. 更新时间
    this.date = DATEJS.nextDate(startDate, index - offset)
    this.value = this.date
    this.updateDate()

    this.dateCellClick && this.dateCellClick({
      date: this.date,
      year: this.year,
      month: this.month
    })
  }

  /**
   *@function 更新年份label与面板
   */
  updateYear (eventType) {
    if (this.headerLabelType === 'year') {
      this.startYear = eventType === 'prevYear' ? this.startYear - 10 : eventType === 'nextYear' ? this.startYear + 10 : this.startYear
      DOMJS.setInnerText(this.ele.labelYear, `${this.startYear} 年 - ${this.startYear + 9} 年`)
      let yearCells = DOMJS.querySelectorAll('.cs-date-picker-panel__content-year-cell')
      yearCells.forEach((yearCell, i) => {
        yearCell.setAttribute('data-year', this.startYear + i)
        DOMJS.setInnerText(yearCell, `${this.startYear + i}`)
      })
    } else if (this.headerLabelType === 'month') {
      this.year = eventType === 'prevYear' ? this.year - 1 : eventType === 'nextYear' ? this.year + 1 : this.year
      DOMJS.setInnerText(this.ele.labelYear, `${this.year} 年`)
    }
  }

  /**
   * @function 年份面板cell点击
   */
  _yearCellClick (target) {
    let year = target.getAttribute('data-year')
    this.year = Number(year)
    this.headerLabelType = 'month'
    DOMJS.setStyle(this.ele.contentMonth, 'display', 'flex')
    DOMJS.setStyle(this.ele.contentYear, 'display', 'none')
    DOMJS.setInnerText(this.ele.labelYear, `${year} 年`)
  }

  /**
   * @function 月份面板cell点击
   */
  _monthCellClick (target) {
    let month = target.getAttribute('data-month')
    this.month = Number(month)
    this.headerLabelType = ''
    DOMJS.setStyle(this.ele.contentMonth, 'display', 'none')
    DOMJS.setStyle(this.ele.contentYear, 'display', 'none')
    DOMJS.setStyle(this.ele.contentDate, 'display', 'flex')
    DOMJS.setStyle(this.ele.prevMonth, 'display', 'initial')
    DOMJS.setStyle(this.ele.nextMonth, 'display', 'initial')
    DOMJS.setStyle(this.ele.labelMonth, 'display', 'initial')
    this.date = new Date(this.year, this.month, 1)
    this.updateDate()
  }

  /**
   * @function 面板header区域:年/月点击处理
   * @param {*} eventType
   */
  _headerLabelClick (eventType) {
    DOMJS.setStyle(this.ele.contentDate, 'display', 'none')
    DOMJS.setStyle(this.ele.prevMonth, 'display', 'none')
    DOMJS.setStyle(this.ele.nextMonth, 'display', 'none')
    if (eventType === 'labelYear') {
      this.headerLabelType = 'year'
      DOMJS.setStyle(this.ele.contentYear, 'display', 'flex')
      DOMJS.setStyle(this.ele.contentMonth, 'display', 'none')
      DOMJS.setStyle(this.ele.labelMonth, 'display', 'none')
      this.updateYear()
      // DOMJS.setInnerText(this.ele.labelYear, `${this.startYear} 年 - ${this.startYear + 9} 年`)
    }

    if (eventType === 'labelMonth') {
      this.headerLabelType = 'month'
      DOMJS.setStyle(this.ele.contentYear, 'display', 'none')
      DOMJS.setStyle(this.ele.contentMonth, 'display', 'flex')
    }
  }

  _headerEventHandle (target) {
    const eventType = target.getAttribute('data-type')
    if (!eventType) {
      return false
    }

    if (eventType.indexOf('label') > -1) { // 点击header部分的文本(年 / 月)
      this._headerLabelClick(eventType)
    } else {
      if (this.headerLabelType) {
        this.updateYear(eventType)
      } else {
        this.date = DATEJS[eventType](this.date)
        this.updateDate()
      }
    }
  }

  _bind () {
    this.ele.header.addEventListener('click', (e) => {
      this._headerEventHandle(e.target)
    })
    this.ele.contentDate.addEventListener('click', (e) => {
      this._dateCellClick(e.target)
    })
    this.ele.contentYear.addEventListener('click', (e) => {
      this._yearCellClick(e.target)
    })
    this.ele.contentMonth.addEventListener('click', (e) => {
      this._monthCellClick(e.target)
    })
  }

  /**
   * @function 面板显示
   */
  show () {
    DOMJS.setStyle(this.ele.contentDate, 'display', 'flex')
    DOMJS.setStyle(this.ele.contentYear, 'display', 'none')
    DOMJS.setStyle(this.ele.contentMonth, 'display', 'none')
    DOMJS.setStyle(this.ele.contentYear, 'display', 'none')
    DOMJS.setStyle(this.ele.prevMonth, 'display', 'initial')
    DOMJS.setStyle(this.ele.nextMonth, 'display', 'initial')
    DOMJS.setStyle(this.ele.labelMonth, 'display', 'initial')
    this.updateDate()
    DOMJS.setInnerText(this.ele.labelYear, `${this.year} 年`)
  }
}
