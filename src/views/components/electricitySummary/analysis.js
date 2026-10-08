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

export function analysisRoomOptions(rows, roomList, query) {
  const rooms = new Map()
  const ids = new Set((query.roomIds || []).map(String))
  roomList.forEach((room) => {
    const key = String(room.ID ?? room.id)
    if (!query.code && (!ids.size || ids.has(key))) rooms.set(key, { key, name: room.NAME || room.name || room.roomName || key })
  })
  rows.forEach((row) => {
    const match = [...rooms.values()].find((room) => room.key === roomKey(row) || room.name === row.roomName)
    if (!match) rooms.set(roomKey(row), { key: roomKey(row), name: row.roomName || '未标注配电房' })
  })
  return [...rooms.values()]
}

export function analyze(rows, query, selectedRooms, roomOptions = []) {
  const months = monthRange(query.dateStart, query.dateEnd)
  const selected = new Set(selectedRooms)
  const keyFor = (row) => {
    const match = roomOptions.find((room) => room.key === roomKey(row)) || roomOptions.find((room) => room.name === row.roomName)
    return match ? match.key : roomKey(row)
  }
  const scope = rows.filter((row) => selected.has(keyFor(row)) && months.includes(String(row.month || '').slice(0, 7)))
  const groups = new Map(selectedRooms.map((key) => [key, []]))
  scope.forEach((row) => {
    const key = keyFor(row)
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
      if (usage !== null && differs(current - previous, usage)) add(row, '表用量不一致', `示数差 ${(current - previous).toFixed(2)}，表用量 ${usage.toFixed(2)}`)
    }
    if (usage !== null && multiplier !== null && actual !== null && differs(usage * multiplier, actual)) {
      add(row, '倍率计算不一致', `表用量×倍率 ${(usage * multiplier).toFixed(2)}，实用度数 ${actual.toFixed(2)}`)
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
  groups.forEach((roomRows, key) => {
    const totals = query.code ? roomRows : roomAnalysisRows(roomRows)
    const byMonth = new Map()
    const completeMonths = new Set()
    months.forEach((month) => {
      const monthRows = totals.filter((row) => String(row.month || '').slice(0, 7) === month)
      const values = monthRows.map((row) => (duplicates.has(recordKey(row)) ? null : numeric(row.readingTotal3)))
      // Match the data view: sum available selected meters, retaining missing-data status.
      const knownValues = values.filter((value) => value !== null)
      byMonth.set(month, knownValues.length ? knownValues.reduce((sum, value) => sum + value, 0) : null)
      if (values.length && values.every((value) => value !== null)) completeMonths.add(month)
    })
    const available = [...byMonth.values()].filter((value) => value !== null)
    const known = totals
      .filter((row) => !duplicates.has(recordKey(row)))
      .map((row) => numeric(row.readingTotal3))
      .filter((value) => value !== null)
    const room = roomOptions.find((item) => item.key === key)
    const status = !roomRows.length
      ? '查询范围无记录'
      : !totals.length
      ? '无总表且有多块电表，无法确定总量'
      : !available.length
      ? '统计电表数据缺失或重复'
      : completeMonths.size < months.length
      ? '部分月份或电表数据不完整'
      : '数据完整'
    roomStats.push({
      key,
      name: room ? room.name : roomRows[0]?.roomName || key,
      value: available.length ? available.reduce((a, b) => a + b, 0) : null,
      knownValue: known.length ? known.reduce((a, b) => a + b, 0) : null,
      statisticMeters: [...new Set(totals.map((row) => `${row.meterCode || '未编号'} / ${row.meterLocation || '未标注位置'}`))].join('；'),
      status,
      validMonths: available.length,
      completeMonths,
      byMonth
    })
  })
  const monthly = months.map((month, index) => {
    const available = roomStats.filter((room) => room.byMonth.get(month) !== null)
    const value = available.length ? available.reduce((sum, room) => sum + room.byMonth.get(month), 0) : null
    const comparable = index ? roomStats.filter((room) => room.completeMonths.has(month) && room.completeMonths.has(months[index - 1])) : []
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
  const roomRanking = roomStats.sort((a, b) => (a.value === null ? (b.value === null ? 0 : 1) : b.value === null ? -1 : b.value - a.value))
  const meterGroups = new Map()
  scope.forEach((row) => {
    const key = meterKey(row)
    const value = duplicates.has(recordKey(row)) ? null : numeric(row.readingTotal3)
    if (!meterGroups.has(key)) meterGroups.set(key, { name: `${row.roomName || ''} / ${row.meterCode || '未编号'} / ${row.meterLocation || '未标注位置'}`, value: null, validMonths: 0 })
    if (value !== null) {
      meterGroups.get(key).value = (meterGroups.get(key).value || 0) + value
      meterGroups.get(key).validMonths++
    }
  })
  const hasTou = (row) => !duplicates.has(recordKey(row)) && periods.some((period) => numeric(row[period.field]) !== null && numeric(row[period.field]) >= 0)
  const touRows = []
  let touFallbackGroups = 0
  groups.forEach((roomRows) => {
    months.forEach((month) => {
      const monthRows = roomRows.filter((row) => String(row.month || '').slice(0, 7) === month)
      const totals = (query.code ? monthRows : roomAnalysisRows(monthRows)).filter(hasTou)
      if (totals.length) touRows.push(...totals)
      else {
        const fallback = monthRows.filter(hasTou)
        if (fallback.length) {
          touFallbackGroups++
          touRows.push(...fallback)
        }
      }
    })
  })
  // Missing periods remain unknown; shares describe only the available readings.
  const tou = periods.map((period) => {
    const values = touRows.map((row) => numeric(row[period.field])).filter((value) => value !== null && value >= 0)
    return { ...period, value: values.reduce((sum, value) => sum + value, 0), records: values.length }
  })
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
    touRecords: touRows.length,
    touCompleteRecords: touRows.filter((row) => periods.every((period) => numeric(row[period.field]) !== null && numeric(row[period.field]) >= 0)).length,
    touFallbackGroups,
    unresolvedRooms: roomStats.filter((item) => item.value === null).map((item) => item.name)
  }
}
