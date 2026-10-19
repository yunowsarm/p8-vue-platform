// 分析口径与管理页一致：records 为跟进子表，最新状态按记录创建先后判定。
export const CHANNELS = {
  ONLINE_INQUIRY: '线上咨询',
  MARKETING_EVENT: '市场活动/展会',
  OUTBOUND_VISIT: '招商拜访',
  PARTNER_REFERRAL: '合作伙伴推荐',
  PARK_OPERATION: '园区运营转交',
  CUSTOMER_REFERRAL: '客户转介绍',
  OTHER: '其他渠道'
}
export const STAGES = {
  UNFOLLOWED: '尚未跟进',
  INITIAL_CONTACT: '初步接触',
  INTENT_CONFIRMED: '意向确认',
  VISIT_OR_PROPOSAL: '考察/洽谈中',
  NEGOTIATION: '谈判阶段',
  CONTRACT_SIGNED: '签约落地',
  ON_HOLD: '暂缓跟进',
  UNKNOWN: '未记录阶段'
}
export const INDUSTRIES = { 1: '智能制造', 2: '医疗科技', 3: '数字经济', 4: '互联网', 5: '新材料', 6: '其他' }
export const AREAS = { 1: '100㎡以内', 2: '100–200㎡', 3: '201–500㎡以内', 4: '500–1,000㎡', 5: '1,000㎡以上' }
export const SPACES = { 1: '独立办公室', 2: '研发办公', 3: '企业总部', 4: '轻型生产', 5: '配套商业' }

export function timestamp(value) {
  if (value === null || value === undefined || value === '') return null
  const result = value instanceof Date ? value.getTime() : typeof value === 'number' ? value : Date.parse(String(value).replace(' ', 'T'))
  return Number.isFinite(result) ? result : null
}

export function normalizeLead(row, now = Date.now()) {
  const records = Array.isArray(row.records) ? row.records.filter(Boolean) : []
  const latest = records.reduce((previous, current) => {
    if (!previous) return current
    return (timestamp(current.createdAt || current.followUpTime) || 0) >= (timestamp(previous.createdAt || previous.followUpTime) || 0) ? current : previous
  }, null)
  const rawLevel = String((latest && latest.intentLevel) || '')
    .charAt(0)
    .toUpperCase()
  const level = /^[A-F]$/.test(rawLevel) ? rawLevel : 'UNKNOWN'
  const stage = latest ? latest.leadStatus || 'UNKNOWN' : 'UNFOLLOWED'
  const invalid = String(row.approveStatus !== undefined ? row.approveStatus : row.approve_status) === '2'
  const signed = !invalid && stage === 'CONTRACT_SIGNED'
  const active = !invalid && !signed && level !== 'F'
  const due = timestamp(latest && latest.nextFollowUpTime)
  const ownerId = row.responsiblePerson || row.responsiblePersonId || row.responsibleUserId
  const allocated = Boolean(ownerId) || Number(row.status) === 1
  const source = row.sourceType || row.channelSource || row.source || row.channel
  return {
    ...row,
    latest,
    level,
    stage,
    invalid,
    signed,
    active,
    allocated,
    due,
    created: timestamp(row.createTime),
    followCount: records.length,
    channel: CHANNELS[source] || source || '未填写',
    ownerKey: ownerId ? `id:${ownerId}` : allocated ? `name:${row.responsiblePersonName || '负责人未记录'}` : 'unassigned',
    owner: row.responsiblePersonName || (ownerId ? `人员 ${ownerId}` : allocated ? '负责人未记录' : '待分配'),
    industryLabel: INDUSTRIES[row.industry] || row.industry || '未填写',
    areaLabel: AREAS[row.requiredArea] || row.requiredArea || '未填写',
    spaceLabel: SPACES[row.intendedSpace] || row.intendedSpace || '未填写',
    overdue: active && due !== null && due < now,
    highIntent: active && ['A', 'B'].includes(level)
  }
}

export function percentage(count, total) {
  return total ? `${((count / total) * 100).toFixed(1)}%` : '—'
}

export function distribution(rows, field) {
  const counts = new Map()
  rows.forEach((row) => counts.set(String(row[field]), (counts.get(String(row[field])) || 0) + 1))
  return Array.from(counts, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
}

export function ownerSummary(rows) {
  const owners = new Map()
  rows.forEach((row) => {
    if (!owners.has(row.ownerKey)) owners.set(row.ownerKey, { key: row.ownerKey, name: row.owner, total: 0, active: 0, signed: 0, overdue: 0, follows: 0, followed: 0 })
    const owner = owners.get(row.ownerKey)
    owner.total++
    owner.active += Number(row.active)
    owner.signed += Number(row.signed)
    owner.overdue += Number(row.overdue)
    owner.follows += row.followCount
    owner.followed += Number(row.followCount > 0)
  })
  return Array.from(owners.values()).sort((a, b) => b.total - a.total)
}

// 顺序读取所有分页。任何页异常均拒绝整次刷新，不展示不完整的总体指标。
export async function fetchAllLeads(listApi, onProgress = () => {}, isCancelled = () => false) {
  const rows = []
  const ids = new Set()
  const pageSize = 200
  let expected = null
  for (let pageNo = 1; pageNo <= 1000; pageNo++) {
    if (isCancelled()) throw new Error('已取消加载')
    let result = await listApi({ viewType: 0, pageNo, pageSize })
    if (isCancelled()) throw new Error('已取消加载')
    for (let depth = 0; depth < 5 && result && !Array.isArray(result); depth++) {
      if (result.head && ![true, 'true'].includes(result.head.success)) throw new Error(result.head.message || '接口查询失败')
      if (result.records || result.list || result.rows) break
      if (result.result !== undefined) result = result.result
      else if (result.data !== undefined) result = result.data
      else break
    }
    const batch = Array.isArray(result) ? result : result && (result.records || result.list || result.rows)
    if (!Array.isArray(batch)) throw new Error('接口未返回可识别的线索列表，请确认登录状态和接口权限')
    const totalValue = result && (result.total !== undefined ? result.total : result.count !== undefined ? result.count : result.totalCount)
    if (totalValue !== undefined && totalValue !== null && totalValue !== '' && Number.isInteger(Number(totalValue)) && Number(totalValue) >= 0) expected = Number(totalValue)
    let added = 0
    batch.forEach((row) => {
      if (!row || row.id === undefined || row.id === null || row.id === '') throw new Error('线索缺少唯一标识，无法安全汇总分页数据')
      const id = String(row.id)
      if (!ids.has(id)) {
        ids.add(id)
        rows.push(row)
        added++
      }
    })
    onProgress(rows.length, expected)
    if (expected !== null && rows.length >= expected) return rows
    if (!batch.length) {
      if (expected !== null && rows.length < expected) throw new Error('接口分页数据不完整，请刷新后重试')
      return rows
    }
    if (!added) throw new Error('接口返回重复分页，无法完成全量统计')
    // 没有总数时继续查询至空页，兼容服务端限制 pageSize 的情况。
  }
  throw new Error('数据量超过当前分析上限，请使用服务端统计接口')
}
