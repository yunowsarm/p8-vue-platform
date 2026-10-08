export function escapeHtml(value) {
  return String(value === null || value === undefined ? '—' : value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
}

function number(value) {
  return value === null || value === undefined ? '—' : Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

function table(headers, rows) {
  return `<table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${
    rows.length ? rows.map((row) => `<tr>${row.map((value) => `<td>${escapeHtml(value)}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${headers.length}">暂无数据</td></tr>`
  }</tbody></table>`
}

export function buildReportHtml({ report, query, roomNames, findings, charts, scopeNote, autoPrint = false }) {
  const percent = (value) => (value === null || value === undefined ? '—' : `${number(value)}%`)
  const rankings = (items, rooms = false) =>
    items.map((item, index) => {
      const cells = [item.value === null ? '—' : index + 1, item.name, number(item.value), item.validMonths === undefined ? '—' : item.validMonths]
      return rooms ? [...cells, number(item.knownValue), item.status, item.statisticMeters] : cells
    })
  const title = `用电分析报告 ${query.dateStart} 至 ${query.dateEnd}`
  const sections = charts.map((chart) => `<section class="chart-section"><h2>${escapeHtml(chart.title)}</h2><img src="${chart.image}" alt="${escapeHtml(chart.title)}" /></section>`).join('')
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f4f7fb;color:#27364a;font:14px/1.6 Arial,"Microsoft YaHei",sans-serif}main{max-width:1100px;margin:24px auto;padding:28px;background:#fff}h1{font-size:24px;margin:0 0 8px}h2{font-size:17px;margin:22px 0 10px}p{margin:6px 0}.muted{color:#6b7b90;font-size:12px}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:18px 0}.metrics div{padding:14px;background:#edf4ff;border-radius:8px}.metrics strong{display:block;font-size:20px}.findings{padding:14px;background:#f5f8fc}.charts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.chart-section{min-width:0;break-inside:avoid}.chart-section img{width:100%;height:auto}table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:18px;table-layout:fixed}th,td{padding:7px;border:1px solid #dfe5ee;text-align:center;overflow-wrap:anywhere}th{background:#f3f6fb}thead{display:table-header-group}tr{break-inside:avoid}.actions{display:flex;justify-content:flex-end;gap:10px;margin-bottom:16px}button{padding:8px 16px;color:#fff;background:#409eff;border:0;border-radius:5px;cursor:pointer}
@page{size:A4 landscape;margin:12mm}@media print{body{background:#fff}main{max-width:none;margin:0;padding:0}.actions{display:none}.metrics{break-inside:avoid}h2{break-after:avoid}}@media(max-width:700px){.metrics,.charts{grid-template-columns:1fr}main{margin:0;padding:16px}}
</style></head><body><main><div class="actions"><button id="print-report">打印 / 保存为 PDF</button></div>
<h1>${escapeHtml(title)}</h1><p>分析对象：${escapeHtml(roomNames.join('、') || '未选择配电房')}</p><p class="muted">${escapeHtml(scopeNote)}</p>
<div class="metrics"><div>累计实用电量<strong>${number(report.total)} 度</strong></div><div>月均实用电量<strong>${number(report.average)} 度</strong></div><div>实用度数完整率<strong>${percent(
    report.completeness
  )}</strong></div><div>统计覆盖率<strong>${percent(report.coverage)}</strong></div></div>
<h2>分析结论</h2><div class="findings">${findings.map((text) => `<p>${escapeHtml(text)}</p>`).join('')}</div>
<div class="charts">${sections}</div>
<h2>尖峰平谷明细（已知时段数据）</h2><p class="muted">${report.touRecords} 条有分时数据记录，其中 ${report.touCompleteRecords} 条四时段完整；${
    report.touFallbackGroups
  } 个配电房月份采用有数据电表参考，可能存在总分表重叠。占比为已知分时合计占比，与配电房累计总量口径不同。</p>
${table(
  ['时段', '已知实用度数', '有效记录数', '已知分时占比'],
  report.tou.map((item) => [item.name, item.records ? number(item.value) : '缺失', item.records, item.records && report.touTotal > 0 ? percent((item.value / report.touTotal) * 100) : '—'])
)}
<h2>配电房用电排名（全部 ${report.roomRanking.length} 个）</h2>${table(
    ['排名', '配电房', '累计实用度数', '有统计数据月份', '已知统计电量（参考）', '数据状态', '参与统计的电表'],
    rankings(report.roomRanking, true)
  )}
<h2>电表用电排名（全部 ${report.meterRanking.length} 个）</h2>${table(['排名', '电表', '累计实用度数', '有统计数据月份'], rankings(report.meterRanking))}
<h2>月度统计明细</h2>${table(
    ['月份', '实用电量', '有统计数据配电房', '范围内配电房', '环比可比配电房', '环比'],
    report.monthly.map((item) => [item.month, number(item.value), item.coverage, item.expected, item.comparable, percent(item.change)])
  )}
<h2>数据质量 · 全部 ${report.anomalies.length} 条核对项目</h2>${table(
    ['月份', '配电房', '电表编号', '核对项目', '说明'],
    report.anomalies.map((item) => [item.month, item.roomName, item.meterCode, item.type, item.description])
  )}
<p class="muted">核对项目需结合换表、回零、冲抵等业务情况确认。导出时间：${escapeHtml(new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }))}</p>
</main><script>document.getElementById('print-report').addEventListener('click',function(){window.print()});${
    autoPrint ? 'window.addEventListener("load",function(){setTimeout(function(){window.print()},300)})' : ''
  }</script></body></html>`
}
