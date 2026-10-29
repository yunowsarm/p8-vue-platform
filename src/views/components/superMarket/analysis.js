import { numeric } from './fields'

export function productRanking(rows) {
  const groups = new Map()
  rows.forEach((row) => {
    const key = row.o01292 || row.productName || 'unknown'
    if (!groups.has(key)) groups.set(key, { name: row.productName || (row.o01292 ? `标识 ${row.o01292}` : '未识别商品'), count: 0, amount: 0, validAmounts: 0 })
    const group = groups.get(key)
    group.count++
    const amount = numeric(row.b00517)
    if (amount !== null) {
      group.amount += amount
      group.validAmounts++
    }
  })
  return [...groups.values()].sort((a, b) => b.amount - a.amount).slice(0, 10)
}

export function amountTrend(rows) {
  const days = new Map()
  rows.forEach((row) => {
    // 与明细表统一使用交易时间；延迟上报不能改变交易归属日期。
    const day = String(row.o00781 || '')
      .trim()
      .slice(0, 10)
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day)
    if (!match) return
    const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
    if (date.getUTCFullYear() !== Number(match[1]) || date.getUTCMonth() !== Number(match[2]) - 1 || date.getUTCDate() !== Number(match[3])) return
    const amount = numeric(row.b00517)
    if (amount !== null) days.set(day, (days.get(day) || 0) + amount)
  })
  return [...days.entries()].sort(([a], [b]) => a.localeCompare(b))
}

export function dailyAmountRows(rows, range) {
  if (!range || range.length !== 2 || range[0] > range[1]) throw new Error('请先查询有效的时间范围')
  const parseDay = (value) => {
    const day = String(value).slice(0, 10)
    const date = new Date(`${day}T00:00:00Z`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== day) throw new Error('查询日期无效')
    return date
  }
  const start = parseDay(range[0])
  const end = parseDay(range[1])
  const amounts = new Map(amountTrend(rows))
  const result = []
  for (let time = start.getTime(); time <= end.getTime(); time += 86400000) {
    const date = new Date(time).toISOString().slice(0, 10)
    result.push([result.length + 1, date, amounts.get(date) || 0])
  }
  return result
}
