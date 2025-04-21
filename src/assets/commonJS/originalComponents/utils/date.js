export default {
  /**
   * @function 获取某一月中第一天是星期几
   * @param {*} date 日期
   */
  getFirstDayOfMonth: (date) => {
    const temp = new Date(date.getTime())
    temp.setDate(1) // 根据本地时间来指定一个日期对象的天数
    return temp.getDay() // 返回一个具体日期中一周的第几天 0-代表星期天
  },

  getDayCountOfMonth: (year, month) => {
    if (month === 3 || month === 5 || month === 8 || month === 10) {
      return 30
    }

    if (month === 1) {
      if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
        return 29
      } else {
        return 28
      }
    }

    return 31
  },

  /**
   * @function 获取开始填充日期
   */
  getStartDateOfMonth (year, month) {
    const result = new Date(year, month, 1)
    const day = result.getDay()

    if (day === 0) {
      return this.prevDate(result, 7)
    } else {
      return this.prevDate(result, day)
    }
  },

  prevDate (date, amount = 1) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - amount)
  },

  nextDate (date, amount = 1) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount)
  },

  getDateTimestamp (time) {
    if (typeof time === 'number' || typeof time === 'string') {
      return this.clearTime(new Date(time)).getTime()
    } else if (time instanceof Date) {
      return this.clearTime(time).getTime()
    } else {
      return NaN
    }
  },

  clearTime (date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
  },

  nextMonth (date) {
    const year = date.getFullYear()
    const month = date.getMonth()
    return month === 11
      ? this.changeYearMonthAndClampDate(date, year + 1, 0)
      : this.changeYearMonthAndClampDate(date, year, month + 1)
  },

  prevMonth (date) {
    const year = date.getFullYear()
    const month = date.getMonth()
    return month === 0
      ? this.changeYearMonthAndClampDate(date, year - 1, 11)
      : this.changeYearMonthAndClampDate(date, year, month - 1)
  },

  prevYear (date, amount = 1) {
    const year = date.getFullYear()
    const month = date.getMonth()
    return this.changeYearMonthAndClampDate(date, year - amount, month)
  },

  nextYear (date, amount = 1) {
    const year = date.getFullYear()
    const month = date.getMonth()
    return this.changeYearMonthAndClampDate(date, year + amount, month)
  },

  changeYearMonthAndClampDate (date, year, month) {
    const monthDate = Math.min(date.getDate(), this.getDayCountOfMonth(year, month))
    return this.modifyDate(date, year, month, monthDate)
  },

  modifyDate (date, y, m, d) {
    return new Date(y, m, d, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
  }

}
