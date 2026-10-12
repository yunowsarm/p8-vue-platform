const assert = require('assert')
const fs = require('fs')
const path = require('path')

function load(file, names) {
  const source = fs.readFileSync(path.join(__dirname, '../src/views/components/electricitySummary', file), 'utf8').replace(/export /g, '')
  return new Function(source + '; return {' + names.join(',') + '}')()
}
const { forecastRoom, monthDays, shiftMonth } = load('forecast.js', ['forecastRoom', 'monthDays', 'shiftMonth'])
const { analyze } = load('analysis.js', ['analyze'])
const { buildReportHtml } = load('exportReport.js', ['buildReportHtml'])
const options = { currentMonth: '2026-10', horizon: 3 }
function room(rates, start = '2026-01') {
  return { key: 'A', name: '企业 A', predictionHistory: rates.map((daily, index) => {
    const month = shiftMonth(start, index)
    return { month, value: daily === null ? null : daily * monthDays(month), complete: daily !== null && daily >= 0, signature: 'meter-A' }
  }) }
}

assert.equal(monthDays('2024-02'), 29)
assert.equal(shiftMonth('2026-12', 1), '2027-01')
const stable = forecastRoom(room(Array(9).fill(100)), options)
assert(stable.ready)
assert.equal(stable.wape, 0)
assert.equal(stable.index, 100)
assert.deepEqual(stable.future.map((item) => item.value), [3100, 3000, 3100])
assert.equal(stable.activity, '用电活跃度相对平稳')
assert.equal(forecastRoom(room(Array(9).fill(0)), options).wape, null)
assert.equal(forecastRoom(room(Array(9).fill(0)), options).index, null)
const short = forecastRoom(room([100, 120, 130], '2026-07'), options)
assert(short.ready)
assert.equal(short.reliability, '低')
assert.equal(short.future[0].lower, null)
assert(!forecastRoom(room([100, 100], '2026-08'), options).ready)
assert(!forecastRoom(room([100, 100, null, 100, 100], '2026-05'), options).ready)
const changed = room(Array(9).fill(100))
changed.predictionHistory[8].signature = 'meter-B'
assert(!forecastRoom(changed, options).ready)
const partial = room(Array(9).fill(100))
partial.predictionHistory[8].complete = false
assert(!forecastRoom(partial, options).ready)
const negative = room(Array(8).fill(100).concat(-5))
assert(!forecastRoom(negative, options).ready)
const withCurrent = room(Array(9).fill(100).concat(9999))
assert.equal(forecastRoom(withCurrent, options).future[0].value, 3100)
const stale = forecastRoom(room(Array(7).fill(100)), options)
assert.equal(stale.activity, '数据滞后，待核对')
assert.equal(stale.future[0].month, '2026-08')
const seasonalRates = Array.from({ length: 24 }, (_, i) => [50, 75, 130, 90, 200, 120, 80, 170, 60, 150, 105, 40][i % 12])
const seasonal = forecastRoom(room(seasonalRates, '2024-10'), options)
assert.equal(seasonal.model, '去年同月日均')
assert.equal(seasonal.wape, 0)
assert.equal(seasonal.future[0].value, 50 * 31)
assert.equal(forecastRoom(room(seasonalRates, '2024-10'), { ...options, horizon: 6 }).future.length, 6)
const falling = forecastRoom(room([200, 195, 185, 170, 160, 150, 135, 120, 110]), options)
assert(falling.future.every((item) => item.value >= 0 && (item.lower === null || item.lower <= item.value && item.upper >= item.value)))
assert(falling.change < 0)

// A manual rolling last-value baseline verifies that targets do not enter training.
const rates = [100, 140, 90, 80, 180, 200, 120, 160, 170]
const expectedErrors = []
for (let origin = 3; origin < rates.length; origin++) {
  for (let step = 0; step < Math.min(3, rates.length - origin); step++) {
    expectedErrors.push(Math.abs(rates[origin - 1] - rates[origin + step]) * monthDays(shiftMonth('2026-01', origin + step)))
  }
}
const varied = forecastRoom(room(rates), options)
assert.equal(varied.scores.find((score) => score.model === '延续上月日均').mae, expectedErrors.reduce((a, b) => a + b, 0) / expectedErrors.length)

const rows = Array.from({ length: 9 }, (_, i) => ({ month: shiftMonth('2026-01', i), roomName: 'A', meterCode: '2201', meterLocation: '1#进线总表1', readingTotal3: 100 * monthDays(shiftMonth('2026-01', i)) }))
const report = analyze(rows, { dateStart: '2026-01', dateEnd: '2026-09' }, ['A', 'B'])
const a = forecastRoom(report.roomRanking.find((item) => item.key === 'A'), options)
assert(a.ready)
assert(!forecastRoom(report.roomRanking.find((item) => item.key === 'B'), options).ready)
const duplicateReport = analyze([...rows, rows[8]], { dateStart: '2026-01', dateEnd: '2026-09' }, ['A'])
assert.equal(forecastRoom(duplicateReport.roomRanking[0], options).activity, '数据滞后，待核对')
const html = buildReportHtml({ report, query: { dateStart: '2026-01', dateEnd: '2026-09' }, roomNames: ['A', 'B'], findings: [], charts: [], scopeNote: '', forecasts: [{ ...a, name: '<script>alert(1)</script>' }] })
assert(html.includes('2026-10'))
assert(html.includes('3,100'))
assert(!html.includes('<script>alert(1)</script>'))
assert(html.includes('参与统计的电表'))
console.log('Forecast checks passed: month lengths, current month, zeros, missing/partial/duplicate data, fixed meters, stale data, seasonality, rolling backtest, independent rooms, HTML export.')
