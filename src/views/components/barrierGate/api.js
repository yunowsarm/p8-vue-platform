import axios from '@/plugins/axios'
import { API_DEFAULT_CONFIG } from '@/config/settings'

const { isDevMode, devBaseUrl, prodBaseUrl } = API_DEFAULT_CONFIG
const base = (isDevMode ? devBaseUrl : prodBaseUrl).replace(/\/$/, '')

// 当前接口约定集中于此：GET list/queryById，POST import/add，PUT edit，DELETE delete?id=。
export function unwrap(response) {
  if (response === undefined || response === null) throw new Error('接口未返回有效结果')
  if (response.success === false || (response.code !== undefined && ![0, 200, '0', '200'].includes(response.code))) {
    throw new Error(response.message || response.msg || '操作失败')
  }
  if (response.result !== undefined) return response.result
  if (response.data !== undefined) return response.data
  return response
}

export async function fetchAll(path, isCurrent = () => true) {
  const records = []
  const ids = new Set()
  let expectedTotal = null
  for (let pageNo = 1; pageNo <= 250; pageNo++) {
    if (!isCurrent()) return null
    const page = unwrap(await axios.get(`${base}${path}`, { params: { pageNo, pageSize: 200 }, timeout: 30000 }))
    if (!isCurrent()) return null
    const rows = Array.isArray(page) ? page : page && page.records
    if (!Array.isArray(rows)) throw new Error('列表接口返回格式异常，需返回 records 和 total')
    const total = Array.isArray(page) ? page.length : Number(page.total)
    if (!Number.isInteger(total) || total < 0 || total > 50000) throw new Error('记录总数异常或超过 50,000 条，请调整接口查询范围')
    if (expectedTotal === null) expectedTotal = total
    if (expectedTotal !== total) throw new Error('加载期间数据发生变化，请刷新重试')
    rows.forEach((row) => {
      if (row.id !== undefined && row.id !== null) {
        const key = String(row.id)
        if (ids.has(key)) throw new Error('接口分页重复，请检查分页参数')
        ids.add(key)
      }
    })
    records.push(...rows)
    if (records.length === total) return records
    if (!rows.length || records.length > total) throw new Error('分页记录不完整，请刷新重试')
  }
  throw new Error('记录数量超出加载范围')
}

export async function parkingRequest(resource, action, payload) {
  const url = `${base}/parking/${resource}/${action}`
  let response
  if (action === 'queryById') response = await axios.get(url, { params: payload })
  else if (action === 'delete') response = await axios.delete(url, { params: payload })
  else if (action === 'edit') response = await axios.put(url, payload)
  else response = await axios.post(url, payload)
  return unwrap(response)
}
