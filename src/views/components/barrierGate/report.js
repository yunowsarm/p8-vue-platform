function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]))
}

function table(headers, rows) {
  return `<table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${
    rows.length ? rows.map((row) => `<tr>${row.map((value) => `<td>${escapeHtml(value)}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${headers.length}">暂无数据</td></tr>`
  }</tbody></table>`
}

export function buildBarrierReport({ stats, query, recordCount, metrics, findings, scopeText, charts = [], autoPrint = false }) {
  const registration = { registered: '已登记车辆', unregistered: '未登记 / 登记冲突' }
  const scope = [
    ['查询日期', query.dateRange && query.dateRange.length === 2 ? query.dateRange.join(' 至 ') : '全部已加载日期'],
    ['车牌关键词', query.plateNumber || '全部'],
    ['企业', query.companyName || '全部企业'],
    ['车辆登记状态', registration[query.registration] || '全部车辆']
  ]
  const generatedAt = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', dateStyle: 'medium', timeStyle: 'medium', hour12: false }).format(new Date())
  const percent = (count) => (recordCount ? ((count / recordCount) * 100).toFixed(2) : '0.00') + '%'
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>道闸出入数据分析报告</title><style>
body{margin:0;background:#f5f7fa;color:#27364a;font:14px/1.8 "Microsoft YaHei",sans-serif}main{max-width:1120px;margin:28px auto;background:#fff;padding:32px;border-radius:10px}h1{font-size:24px;margin:0 0 12px}h2{font-size:17px;margin-top:26px}.muted{font-size:12px;color:#718096}.scope{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:14px 0}.scope div{overflow-wrap:anywhere}.metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.metric{background:#f3f6fc;padding:16px;border-radius:8px}.metric strong{display:block;color:#365c9f;font-size:24px;overflow-wrap:anywhere}.metric small{font-size:12px;margin-left:6px;font-weight:normal}.findings{padding:12px 18px;background:#eef4ff;border-radius:8px}.charts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.chart{break-inside:avoid;min-width:0}.chart img{width:100%;height:auto}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #e4eaf2;padding:8px;text-align:center;overflow-wrap:anywhere}th{background:#f5f8fc}button{float:right;cursor:pointer;border:1px solid #dce3ed;border-radius:5px;background:#fff;padding:8px 14px}@page{size:A4 landscape;margin:12mm}@media print{body{background:#fff}main{max-width:none;margin:0;padding:0}button{display:none}.metrics{break-inside:avoid}thead{display:table-header-group}tr{break-inside:avoid}h2{break-after:avoid}}@media(max-width:650px){main{padding:16px;margin:0}.metrics,.charts,.scope{grid-template-columns:1fr}}
</style></head><body><main><button id="print-report">打印 / 保存 PDF</button><h1>道闸出入数据分析报告</h1><p class="muted">生成时间：${escapeHtml(generatedAt)}（北京时间）</p>
<div class="scope">${scope.map(([label, value]) => `<div><strong>${escapeHtml(label)}：</strong>${escapeHtml(value)}</div>`).join('')}</div>
<div class="metrics">${metrics
    .map((metric) => `<div class="metric">${escapeHtml(metric.label)}<strong>${escapeHtml(metric.value)}<small>${escapeHtml(metric.unit)}</small></strong></div>`)
    .join('')}</div>
<h2>分析结论</h2><div class="findings">${findings.map((text) => `<p>${escapeHtml(text)}</p>`).join('')}</div>
<p class="muted">${escapeHtml(scopeText)}；一条记录为一次停车。企业按当前登记车牌关联，未关联及登记冲突单独统计。平均停留仅统计进出时间有效且非逆序的完整记录；缺失或异常时间记录 ${escapeHtml(
    stats.missingTimes
  )} 条，不计入平均停留。缺少离开时间不推断为当前在场。实收金额按所选停车记录统计，不等同期间收款流水；缺失金额不按零处理。</p>
<div class="charts">${charts
    .filter((chart) => /^data:image\/png;base64,/.test(chart.image || ''))
    .map((chart) => `<section class="chart"><h2>${escapeHtml(chart.title)}</h2><img src="${escapeHtml(chart.image)}" alt="${escapeHtml(chart.title)}"></section>`)
    .join('')}</div>
<h2>企业车辆出入汇总 · 完整名单</h2>${table(
    ['企业', '去重车辆数', '停车记录数', '进场次数', '出场次数', '记录占比'],
    stats.companies.map((company) => [company.name, company.vehicles, company.count, company.entry, company.exit, percent(company.count)])
  )}
<h2>每日进出统计</h2>${table(
    ['日期', '进场次数', '出场次数'],
    stats.days.map((day) => [day.name, day.entry, day.exit])
  )}
<h2>24 小时进出统计</h2>${table(
    ['时段', '进场次数', '出场次数'],
    stats.hours.map((hour) => [hour.name, hour.entry, hour.exit])
  )}
<h2>停留时长分布</h2>${table(
    ['停留时长', '完整停车记录数'],
    stats.duration.map((item) => [item.name, item.value])
  )}
<h2>通道通行量 · 全部通道</h2>${table(
    ['通道', '通行次数'],
    stats.channels.map((channel) => [channel.name, channel.value])
  )}
<p class="muted">${escapeHtml(recordCount)} 条停车记录；图表展示当前窗口，每日、小时及完整通道数据以上述表格为准。进出次数分别按筛选期内实际发生日期统计，企业归属反映当前车辆登记信息。</p>
</main><script>document.getElementById('print-report').addEventListener('click',function(){window.print()});${
    autoPrint
      ? 'window.addEventListener("load",function(){var ready=document.fonts?document.fonts.ready:Promise.resolve();ready.catch(function(){}).then(function(){window.focus();window.print()})},{once:true})'
      : ''
  }</script></body></html>`
}
