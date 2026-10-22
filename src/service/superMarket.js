const MAX_RECORDS = 10000

export async function fetchSalesDetails(api, range, isCurrent = () => true) {
  const records = []
  const ids = new Set()
  let expectedTotal = null
  for (let pageNo = 1; pageNo <= MAX_RECORDS; pageNo++) {
    if (!isCurrent()) return null
    const data = await api['superMarket.salesDetails']({ pageNo, pageSize: 200, startTime: range[0], endTime: range[1] }, { timeout: 30000 })
    if (!isCurrent()) return null
    if (!data || !Array.isArray(data.records) || !Number.isInteger(data.total) || data.total < 0) throw new Error('销售明细接口返回格式异常')
    if (data.total > MAX_RECORDS) throw new Error('查询超过 10,000 条，请缩小时间范围后重试')
    if (expectedTotal === null) expectedTotal = data.total
    if (expectedTotal !== data.total) throw new Error('查询期间数据发生变化，请重新查询')
    data.records.forEach((row) => {
      if (row.id !== null && row.id !== undefined) {
        const key = String(row.id)
        if (ids.has(key)) throw new Error('接口分页出现重复记录，请重新查询')
        ids.add(key)
      }
    })
    records.push(...data.records)
    if (records.length === expectedTotal) return records
    if (!data.records.length || records.length > expectedTotal) throw new Error('接口分页数据不完整，请重新查询')
  }
  throw new Error('分页数量超限，请缩小时间范围')
}
