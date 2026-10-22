import { summarize, numberText, numeric, typeInfo, deviceName } from './fields'
import { productRanking, amountTrend } from './analysis'

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]))
}

function table(headers, rows) {
  return `<table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${
    rows.length ? rows.map((row) => `<tr>${row.map((value) => `<td>${escapeHtml(value)}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${headers.length}">暂无数据</td></tr>`
  }</tbody></table>`
}

export function buildReportHtml({ rows, range, filters, charts = [], autoPrint = false }) {
  const report = summarize(rows)
  const products = productRanking(rows)
  const types = ['A', 'B', 'unknown'].map((key) => {
    const values = rows.filter((row) => (key === 'unknown' ? !['A', 'B'].includes(row.b01058) : row.b01058 === key))
    const amounts = values.map((row) => numeric(row.b00517)).filter((amount) => amount !== null)
    return [key === 'unknown' ? '未识别' : typeInfo(key).label, values.length, amounts.length ? numberText(amounts.reduce((sum, amount) => sum + amount, 0)) : '—']
  })
  const knownType = report.unknown < rows.length
  const metrics = [
    ['明细金额合计（元）', report.invalidAmount < rows.length ? numberText(report.amount) : '—'],
    ['交易单数', report.orders.size],
    ['销售金额（元）', knownType ? numberText(report.sales) : '—'],
    ['退货金额（元）', knownType ? numberText(report.returns) : '—']
  ]
  const scope = `查询时间：${range.join(' 至 ')}；关键词：${filters.keyword || '全部'}；设备：${filters.device ? deviceName(filters.device) : '全部'}；业务类型：${
    filters.type === 'unknown' ? '未识别' : filters.type ? typeInfo(filters.type).label : '全部'
  }`
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>园区超市分析报告</title><style>
body{margin:0;background:#f5f7fa;color:#27364a;font:14px/1.8 "Microsoft YaHei",sans-serif}.report{max-width:1080px;margin:28px auto;background:white;padding:32px;border-radius:10px}h1{font-size:24px;margin:0 0 12px}h2{font-size:17px;margin-top:28px}.muted{color:#7b889a;font-size:12px}.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.metric{padding:16px;background:#f3f6fc;border-radius:8px}.metric strong{display:block;font-size:23px;color:#365c9f;overflow-wrap:anywhere}table{border-collapse:collapse;width:100%;font-size:13px}th,td{padding:10px;border:1px solid #e4eaf2;text-align:center}th{background:#f5f8fc}.findings{padding:12px 18px;background:#eef4ff;border-radius:8px}.chart img{width:100%;height:auto}.chart{break-inside:avoid}button{float:right;cursor:pointer;padding:8px 14px;border:1px solid #dce3ed;background:white;border-radius:5px}@media(max-width:650px){.report{padding:16px}.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}@media print{body{background:white}.report{margin:0;padding:0;max-width:none}button{display:none}thead{display:table-header-group}tr{break-inside:avoid}}
</style></head><body><main class="report"><button onclick="window.print()">打印 / 保存 PDF</button><h1>园区超市分析报告</h1><p class="muted">${escapeHtml(scope)}</p>
<div class="metrics">${metrics.map(([label, value]) => `<div class="metric">${escapeHtml(label)}<strong>${escapeHtml(value)}</strong></div>`).join('')}</div>
<h2>分析概览</h2><div class="findings"><p>本次筛选包含 ${rows.length} 条明细、${report.orders.size} 个交易单。</p>${
    products.length ? `<p>商品金额排行第一：${escapeHtml(products[0].name)}，已知金额合计 ${products[0].validAmounts ? numberText(products[0].amount) : '—'} 元。</p>` : ''
  }<p>${report.unknown} 条业务类型未识别；${report.invalidAmount} 条缺少有效金额，未计入金额汇总。</p></div>
${charts
  .filter((chart) => /^data:image\/png;base64,/.test(chart.image || ''))
  .map((chart) => `<section class="chart"><h2>${escapeHtml(chart.title)}</h2><img src="${escapeHtml(chart.image)}" alt="${escapeHtml(chart.title)}"></section>`)
  .join('')}
<h2>商品金额排行 · 前 10 名</h2>${table(
    ['排名', '商品', '明细数', '金额合计（元）'],
    products.map((item, index) => [index + 1, item.name, item.count, item.validAmounts ? numberText(item.amount) : '—'])
  )}
<h2>业务类型统计</h2>${table(['业务类型', '明细数', '金额合计（元）'], types)}
<h2>每日金额统计</h2>${table(
    ['接收日期', '金额合计（元）'],
    amountTrend(rows).map(([day, amount]) => [day, numberText(amount)])
  )}
<p class="muted">统计口径：金额按接口原值汇总，销售与退货分别统计，不推算净销售额或毛利。交易单按设备与单号去重。趋势按接收日期汇总，接收时间可能晚于交易时间；无有效接收日期或金额的记录不计入趋势。缺失金额不按零处理。设备名称使用当前前端映射。</p></main>${
    autoPrint
      ? '<script>window.addEventListener("load",function(){var ready=document.fonts?document.fonts.ready:Promise.resolve();ready.catch(function(){}).then(function(){setTimeout(function(){window.focus();window.print()},150)})},{once:true})</script>'
      : ''
  }</body></html>`
}
