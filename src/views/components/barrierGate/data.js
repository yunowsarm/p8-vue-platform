// 出入记录字段集中适配；中文列名与道闸导出的 Excel 保持一致。
export const recordFields = {
  plateNumber: ['plateNumber', 'carNumber', 'plateNo', '车牌号'],
  entryTime: ['entryTime', 'enterTime', 'inTime', '进入时间'],
  exitTime: ['exitTime', 'leaveTime', 'outTime', '离开时间'],
  parkingDuration: ['parkingDuration', 'parkingTime', 'stayTime', '停车时间'],
  entryChannel: ['entryChannel', 'enterChannel', 'inChannel', '进入通道'],
  exitChannel: ['exitChannel', 'leaveChannel', 'outChannel', '离开通道'],
  cardCode: ['cardCode', 'cardInnerCode', '卡片内码'],
  serialNumber: ['serialNumber', '自编号'],
  receivableAmount: ['receivableAmount', 'payableAmount', '应收费(元)'],
  actualAmount: ['actualAmount', 'paidAmount', '实收费(元)'],
  discountAmount: ['discountAmount', '优惠(元)'],
  boothAmount: ['boothAmount', '岗亭实收费(元)'],
  onlineAmount: ['onlineAmount', '网络付费(元)'],
  centralAmount: ['centralAmount', '中央实收费(元)'],
  cardType: ['cardType', '卡片类别'],
  chargeType: ['chargeType', '收费类型'],
  operator: ['operator', '操作员'],
  entryRemark: ['entryRemark', 'enterRemark', '进入时备注'],
  exitRemark: ['exitRemark', 'leaveRemark', '离开时备注'],
  ownerName: ['ownerName', '车主姓名'],
  parkingSpaceNumber: ['parkingSpaceNumber', '车位号'],
  plateColor: ['plateColor', '车牌颜色']
}

export function clean(value) {
  const text = value === null || value === undefined ? '' : String(value).trim()
  return text === '--' || text === '-' ? '' : text
}

export function plateKey(value) {
  return clean(value).replace(/\s/g, '').toUpperCase()
}

export function timeValue(value) {
  if (!value) return null
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value.getTime() : null
  // 接口日期应为 ISO / yyyy-MM-dd HH:mm:ss，不猜测含歧义的美式日期。
  if (typeof value === 'number') return Number.isFinite(value) && value > 100000000000 ? value : null
  const text = clean(value)
  if (!/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(text)) return null
  const parsed = new Date(text.includes('T') ? text : text.replace(/-/g, '/')).getTime()
  return Number.isFinite(parsed) ? parsed : null
}

export function dateLabel(value) {
  const time = timeValue(value)
  if (time === null) return clean(value) || '—'
  const date = new Date(time)
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function normalizeRecord(source) {
  const row = { id: source.id, raw: source }
  Object.keys(recordFields).forEach((field) => {
    const key = recordFields[field].find((name) => source[name] !== null && source[name] !== undefined)
    row[field] = key ? source[key] : ''
  })
  row.plateNumber = plateKey(row.plateNumber)
  row.entryMs = timeValue(row.entryTime)
  row.exitMs = timeValue(row.exitTime)
  row.stayMinutes = row.entryMs !== null && row.exitMs !== null && row.exitMs >= row.entryMs ? (row.exitMs - row.entryMs) / 60000 : null
  return row
}

export function vehicleMap(vehicles) {
  const map = new Map()
  vehicles.forEach((vehicle) => {
    const plate = plateKey(vehicle.plateNumber)
    if (!plate) return
    // 同一车牌重复登记时不任意分配企业。
    map.set(plate, map.has(plate) ? null : vehicle)
  })
  return map
}

export function filterRecords(records, vehicles, query) {
  const map = vehicleMap(vehicles)
  const range = query.dateRange || []
  const start = range.length === 2 ? timeValue(`${range[0]} 00:00:00`) : null
  const end = range.length === 2 ? timeValue(`${range[1]} 23:59:59`) + 999 : null
  const plate = plateKey(query.plateNumber)
  return records
    .map((record) => {
      const vehicle = map.get(record.plateNumber)
      return { ...record, companyName: vehicle ? clean(vehicle.companyName) : '', registered: !!vehicle, conflicting: map.has(record.plateNumber) && !vehicle }
    })
    .filter((row) => {
      const inRange = (time) => time !== null && time >= start && time <= end
      if (start !== null && !inRange(row.entryMs) && !inRange(row.exitMs)) return false
      if (plate && !row.plateNumber.includes(plate)) return false
      if (query.companyName && row.companyName !== query.companyName) return false
      if (query.registration === 'registered' && !row.registered) return false
      if (query.registration === 'unregistered' && row.registered) return false
      return true
    })
}

export function summarizeRecords(rows, range = []) {
  const days = new Map()
  const hours = Array.from({ length: 24 }, (_, hour) => ({ name: `${String(hour).padStart(2, '0')}:00`, entry: 0, exit: 0 }))
  const companies = new Map()
  const channels = new Map()
  const duration = [0, 0, 0, 0, 0]
  const start = range.length === 2 ? timeValue(`${range[0]} 00:00:00`) : null
  const end = range.length === 2 ? timeValue(`${range[1]} 23:59:59`) + 999 : null
  let entries = 0
  let exits = 0
  let stayTotal = 0
  let completed = 0
  let amount = 0
  let amountCount = 0
  let missingTimes = 0
  rows.forEach((row) => {
    if (row.entryMs === null || (clean(row.exitTime) && row.exitMs === null) || (row.exitMs !== null && row.entryMs !== null && row.exitMs < row.entryMs)) missingTimes++
    const companyName = row.companyName || (row.conflicting ? '登记冲突' : '未关联企业')
    if (!companies.has(companyName)) companies.set(companyName, { name: companyName, count: 0, plates: new Set(), entry: 0, exit: 0 })
    const company = companies.get(companyName)
    company.count++
    if (row.plateNumber) company.plates.add(row.plateNumber)
    ;[
      ['entry', row.entryMs, row.entryChannel],
      ['exit', row.exitMs, row.exitChannel]
    ].forEach(([type, time, channel]) => {
      if (time === null || (start !== null && (time < start || time > end))) return
      if (type === 'entry') entries++
      else exits++
      company[type]++
      const day = dateLabel(time).slice(0, 10)
      if (!days.has(day)) days.set(day, { name: day, entry: 0, exit: 0 })
      days.get(day)[type]++
      hours[new Date(time).getHours()][type]++
      const channelName = clean(channel) || '未知通道'
      channels.set(channelName, (channels.get(channelName) || 0) + 1)
    })
    if (row.stayMinutes !== null) {
      completed++
      stayTotal += row.stayMinutes
      const index = row.stayMinutes < 30 ? 0 : row.stayMinutes < 120 ? 1 : row.stayMinutes < 480 ? 2 : row.stayMinutes < 1440 ? 3 : 4
      duration[index]++
    }
    const rawAmount = clean(row.actualAmount).replace(/,/g, '')
    if (rawAmount && Number.isFinite(Number(rawAmount))) {
      amount += Number(rawAmount)
      amountCount++
    }
  })
  return {
    entries,
    exits,
    completed,
    amount,
    amountCount,
    missingTimes,
    vehicles: new Set(rows.map((r) => r.plateNumber).filter(Boolean)).size,
    linked: rows.filter((r) => r.companyName).length,
    averageStay: completed ? stayTotal / completed : null,
    days: [...days.values()].sort((a, b) => a.name.localeCompare(b.name)),
    hours,
    companies: [...companies.values()].map((c) => ({ ...c, vehicles: c.plates.size })).sort((a, b) => b.count - a.count),
    channels: [...channels].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    duration: ['30分钟内', '30分钟～2小时', '2～8小时', '8～24小时', '24小时以上'].map((name, i) => ({ name, value: duration[i] }))
  }
}
