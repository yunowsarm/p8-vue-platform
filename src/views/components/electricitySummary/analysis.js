export const periods = [
  { name: '尖', field: 'readingSharp3', color: '#e56863' },
  { name: '峰', field: 'readingPeak3', color: '#f2a23a' },
  { name: '平', field: 'readingFlat3', color: '#4c9dde' },
  { name: '谷', field: 'readingValley3', color: '#62b99c' }
]

export function numeric(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null
  const result = Number(value)
  return Number.isFinite(result) ? result : null
}

export function roomKey(row) {
  return String(row.roomId || row.roomName || '未标注配电房')
}

export function meterKey(row) {
  return String(row.meterId || `${roomKey(row)}:${row.meterCode || ''}`)
}

export function roomAnalysisRows(rows) {
  const months = new Map()
  rows.forEach((row) => {
    const month = String(row.month || '').slice(0, 7)
    if (!months.has(month)) months.set(month, [])
    months.get(month).push(row)
  })
  const result = []
  months.forEach((monthRows) => {
    const exact = monthRows.filter((row) => String(row.meterLocation || '').trim() === '总表')
    const named = monthRows.filter((row) => String(row.meterLocation || '').includes('总表'))
    result.push(...(exact.length ? exact : named.length ? named : new Set(monthRows.map(meterKey)).size === 1 ? monthRows : []))
  })
  return result
}

export function monthRange(start, end) {
  if (!/^\d{4}-\d{2}$/.test(start || '') || !/^\d{4}-\d{2}$/.test(end || '')) return []
  const [year, month] = start.split('-').map(Number)
  const [endYear, endMonth] = end.split('-').map(Number)
  const count = Math.min((endYear - year) * 12 + endMonth - month + 1, 120)
  return Array.from({ length: Math.max(0, count) }, (_, index) => {
    const date = new Date(year, month - 1 + index, 1)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  })
}

function differs(a, b) {
  return Math.abs(a - b) > Math.max(0.1, Math.abs(b) * 0.001)
}

export function analyze(rows, query, selectedRooms) {
  const months = monthRange(query.dateStart, query.dateEnd)
  const selected = new Set(selectedRooms)
  const scope = rows.filter((row) => selected.has(roomKey(row)) && months.includes(String(row.month || '').slice(0, 7)))
  const groups = new Map()
  scope.forEach((row) => {
    const key = roomKey(row)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(row)
  })
  const anomalies = []
  const affected = new Set()
  const add = (row, type, description) => {
    affected.add(meterKey(row))
    anomalies.push({ month: String(row.month || '').slice(0, 7), roomName: row.roomName, meterCode: row.meterCode, type, description })
  }
  const seen = new Set()
  const duplicates = new Set()
  const recordKey = (row) => `${meterKey(row)}:${String(row.month || '').slice(0, 7)}`
  scope.forEach((row) => {
    const id = recordKey(row)
    if (seen.has(id)) {
      duplicates.add(id)
      add(row, '重复记录', '同一电表同一月份有多条记录，该电表月份暂不纳入统计')
    }
    seen.add(id)
    const current = numeric(row.readingTotal)
    const previous = numeric(row.readingTotal1)
    const usage = numeric(row.readingTotal2)
    const actual = numeric(row.readingTotal3)
    const multiplier = numeric(row.magnification)
    if (actual === null) add(row, '实用度数缺失', '总实用度数为空，未纳入电量统计')
    else if (actual < 0) add(row, '负用电量', '总实用度数为负，请核对冲抵、换表或填报情况')
    if (current !== null && previous !== null) {
      if (current < previous) add(row, '示数倒退', '本月示数小于上月示数，请核对换表或回零情况')
      if (usage !== null && differs(current - previous, usage)) add(row, '表用量不一致', `示数差 ${current - previous}，表用量 ${usage}`)
    }
    if (usage !== null && multiplier !== null && actual !== null && differs(usage * multiplier, actual)) {
      add(row, '倍率计算不一致', `表用量×倍率 ${usage * multiplier}，实用度数 ${actual}`)
    }
    const tou = periods.map((period) => numeric(row[period.field]))
    if (
      actual !== null &&
      tou.every((value) => value !== null) &&
      differs(
        tou.reduce((sum, value) => sum + value, 0),
        actual
      )
    ) {
      add(row, '分时合计不一致', '尖峰平谷实用度数合计与总实用度数不一致')
    }
  })
  const roomStats = []
  const statisticalRows = []
  groups.forEach((roomRows, key) => {
    const totals = query.code ? roomRows : roomAnalysisRows(roomRows)
    statisticalRows.push(...totals)
    const byMonth = new Map()
    months.forEach((month) => {
      const monthRows = totals.filter((row) => String(row.month || '').slice(0, 7) === month)
      // Incomplete total meters make the room total unknown rather than a partial sum.
      const values = monthRows.map((row) => (duplicates.has(recordKey(row)) ? null : numeric(row.readingTotal3)))
      byMonth.set(month, values.length && values.every((value) => value !== null) ? values.reduce((sum, value) => sum + value, 0) : null)
    })
    const available = [...byMonth.values()].filter((value) => value !== null)
    roomStats.push({ key, name: roomRows[0].roomName || '未标注配电房', value: available.length ? available.reduce((a, b) => a + b, 0) : null, validMonths: available.length, byMonth })
  })
  const monthly = months.map((month, index) => {
    const available = roomStats.filter((room) => room.byMonth.get(month) !== null)
    const value = available.length ? available.reduce((sum, room) => sum + room.byMonth.get(month), 0) : null
    const comparable = index ? roomStats.filter((room) => room.byMonth.get(month) !== null && room.byMonth.get(months[index - 1]) !== null) : []
    const previous = comparable.reduce((sum, room) => sum + room.byMonth.get(months[index - 1]), 0)
    const current = comparable.reduce((sum, room) => sum + room.byMonth.get(month), 0)
    return {
      month,
      value,
      coverage: available.length,
      expected: roomStats.length,
      comparable: comparable.length,
      change: comparable.length && previous !== 0 ? ((current - previous) / Math.abs(previous)) * 100 : null
    }
  })
  const total = monthly.reduce((sum, item) => sum + (item.value === null ? 0 : item.value), 0)
  const validMonths = monthly.filter((item) => item.value !== null)
  const roomRanking = roomStats.filter((item) => item.value !== null).sort((a, b) => b.value - a.value)
  const meterGroups = new Map()
  scope.forEach((row) => {
    const key = meterKey(row)
    const value = duplicates.has(recordKey(row)) ? null : numeric(row.readingTotal3)
    if (!meterGroups.has(key)) meterGroups.set(key, { name: `${row.roomName || ''} / ${row.meterCode || '未编号'} / ${row.meterLocation || '未标注位置'}`, value: null })
    if (value !== null) meterGroups.get(key).value = (meterGroups.get(key).value || 0) + value
  })
  // Only complete nonnegative time-of-use rows can form a meaningful percentage.
  const completeTou = statisticalRows.filter((row) => !duplicates.has(recordKey(row)) && periods.every((period) => numeric(row[period.field]) !== null && numeric(row[period.field]) >= 0))
  const tou = periods.map((period) => ({ ...period, value: completeTou.reduce((sum, row) => sum + numeric(row[period.field]), 0) }))
  const touTotal = tou.reduce((sum, item) => sum + item.value, 0)
  const filled = scope.filter((row) => numeric(row.readingTotal3) !== null).length
  const covered = monthly.reduce((sum, item) => sum + item.coverage, 0)
  return {
    total: validMonths.length ? total : null,
    average: validMonths.length ? total / validMonths.length : null,
    peak: validMonths.slice().sort((a, b) => b.value - a.value)[0],
    latest: validMonths[validMonths.length - 1],
    monthly,
    roomRanking,
    meterRanking: [...meterGroups.values()].filter((item) => item.value !== null).sort((a, b) => b.value - a.value),
    roomCount: groups.size,
    meterCount: meterGroups.size,
    recordCount: scope.length,
    completeness: scope.length ? (filled / scope.length) * 100 : null,
    coverage: groups.size && months.length ? (covered / (groups.size * months.length)) * 100 : null,
    anomalies,
    affectedMeters: affected.size,
    tou,
    touTotal,
    touRecords: completeTou.length,
    statisticalRecords: statisticalRows.length,
    unresolvedRooms: roomStats.filter((item) => item.value === null).map((item) => item.name)
  }
}
