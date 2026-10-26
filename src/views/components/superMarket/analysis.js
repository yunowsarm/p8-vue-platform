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
