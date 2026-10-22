import { decimalText } from '@/utils/numberFormat'

// 字段含义以已确认的表结构为准；未知编码不推测业务含义。
export const BUSINESS_TYPES = {
  A: { label: '销售', tag: 'success' },
  B: { label: '退货', tag: 'danger' }
}

export const TABLE_FIELDS = {
  AAA057: { label: '商品分类', fields: {} },
  aaa050: { label: '商品档案', fields: { o80044: '商品条码', a00827: '商品名称', o00447: '商品分类编码' } },
  bbb070: { label: '前台销售明细', fields: { o01329: '单号', b00741: '数量', b00517: '金额', b01058: '业务类型' } },
  bbb077: { label: '支付明细', fields: { b01253: '支付方式编码（关联 aaa025）' } },
  aaa025: { label: '支付方式', fields: {} },
  ccc029: { label: '库存', fields: { o00716: '库存数', b00495: '成本' } }
}

export const RESPONSE_FIELDS = {
  ...TABLE_FIELDS.aaa050.fields,
  ...TABLE_FIELDS.bbb070.fields,
  ...TABLE_FIELDS.bbb077.fields,
  ...TABLE_FIELDS.ccc029.fields,
  id: '记录 ID',
  deviceId: '设备编号',
  o01329: '单号',
  b00741: '数量',
  b00517: '金额',
  b01058: '业务类型',
  productName: '商品名称',
  productSpec: '商品规格',
  productUnit: '商品单位',
  o01292: '商品标识',
  b00495: '成本',
  receivedAt: '接收时间',
  o00781: '时间字段',
  o01330: '待确认字段 o01330',
  o00935: '待确认字段 o00935',
  b00193: '待确认字段 b00193',
  o00557: '待确认字段 o00557',
  b00583: '待确认字段 b00583',
  b01264: '待确认字段 b01264',
  upIndex: '待确认字段 upIndex'
}

export function typeInfo(code) {
  return isKnownType(code) ? BUSINESS_TYPES[code] : { label: code ? `未识别（${code}）` : '未识别', tag: 'info' }
}

export function isKnownType(code) {
  return Object.prototype.hasOwnProperty.call(BUSINESS_TYPES, code)
}

export function numeric(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null
  const result = Number(value)
  return Number.isFinite(result) ? result : null
}

export function numberText(value) {
  return decimalText(value)
}

export function saleDetails(row) {
  if (!row) return { fields: [], unknown: [] }
  const primaryKeys = ['o01329', 'b01058', 'productName', 'productSpec', 'productUnit', 'o01292', 'b00741', 'b00517', 'deviceId', 'receivedAt']
  const keys = [...new Set([...primaryKeys, ...Object.keys(row)])]
  const fields = []
  const unknown = []
  keys.forEach((key) => {
    const raw = row[key]
    const empty = raw === null || raw === undefined || raw === ''
    let value = empty ? '未提供' : typeof raw === 'object' ? JSON.stringify(raw) : String(raw)
    if (!empty && key === 'b01058') value = typeInfo(raw).label
    if (!empty && key === 'b00517' && numeric(raw) !== null) value = `${numberText(raw)} 元`
    if (!empty && ['b00741', 'o00716', 'b00495'].includes(key) && numeric(raw) !== null) value = numberText(raw)
    if (!empty && key === 'b01253') value = `${raw}（支付方式名称待补充）`
    const label = Object.prototype.hasOwnProperty.call(RESPONSE_FIELDS, key) ? RESPONSE_FIELDS[key] : ''
    const item = { key, label, value }
    if (!label || label.startsWith('待确认字段')) unknown.push({ ...item, label: '业务含义待确认' })
    else fields.push(item)
  })
  return { fields, unknown }
}

export function summarize(rows) {
  const report = { amount: 0, sales: 0, returns: 0, unknown: 0, invalidAmount: 0, orders: new Set(), devices: new Set() }
  rows.forEach((row) => {
    const amount = numeric(row.b00517)
    if (amount === null) report.invalidAmount++
    else {
      report.amount += amount
      if (row.b01058 === 'A') report.sales += amount
      if (row.b01058 === 'B') report.returns += amount
    }
    if (!isKnownType(row.b01058)) report.unknown++
    // 单号可能在不同 POS 设备重复，以设备 + 单号识别。
    if (row.o01329) report.orders.add(JSON.stringify([row.deviceId || '', row.o01329]))
    if (row.deviceId) report.devices.add(row.deviceId)
  })
  return report
}
