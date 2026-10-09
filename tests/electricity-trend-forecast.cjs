const fs = require('fs')
const path = require('path')
const assert = require('assert')
const compiler = require('vue-template-compiler')
const dir = path.join(__dirname, '../src/views/components/electricitySummary')
function load(file, names) {
  const src = fs.readFileSync(path.join(dir, file), 'utf8').replace(/export /g, '')
  return new Function(src + ';return {' + names.join(',') + '}')()
}
const { roomAnalysisRows } = load('analysis.js', ['roomAnalysisRows'])
const { forecastRoom, monthDays, shiftMonth } = load('forecast.js', ['forecastRoom', 'monthDays', 'shiftMonth'])
const view = compiler.parseComponent(fs.readFileSync(path.join(dir, 'ElectricityDataView.vue'), 'utf8'))
assert.deepEqual(compiler.compile(view.template.content).errors, [])
const component = new Function('roomAnalysisRows', 'forecastRoom', view.script.content.replace(/^import .*$/gm, '').replace('export default', 'return'))(roomAnalysisRows, forecastRoom)
function context(rows, dimension, keys) {
  const instance = { ...component.data(), rows, appliedQuery: { dateStart: '2026-01', dateEnd: '2026-10' }, currentMonth: '2026-10', dimension, selectedEntityKeys: keys }
  Object.entries(component.methods).forEach(([key, method]) => { instance[key] = method.bind(instance) })
  Object.entries(component.computed).forEach(([key, getter]) => { Object.defineProperty(instance, key, { get: getter.bind(instance) }) })
  return instance
}
const rows = Array.from({ length: 9 }, (_, i) => {
  const month = shiftMonth('2026-01', i)
  return { month, roomId: 'room-A', roomName: '企业A', meterId: 'meter-A', meterCode: '10101', meterLocation: '总表', readingTotal3: monthDays(month) * 100 }
})
const meter = context(rows, 'meter', ['meter-A'])
assert.equal(meter.entityForecasts[0].future[0].value, 3100)
assert.equal(meter.trendMonths.at(-1), '2026-12')
assert.equal(meter.trendSeries.length, 2)
assert(meter.trendSeries[1].name.includes('预测'))
assert.equal(meter.trendSeries[1].lineStyle.type, 'dashed')
assert.equal(meter.trendSeries[0].data[meter.trendMonths.indexOf('2026-10')], null)
assert.equal(meter.trendSeries[1].data[meter.trendMonths.indexOf('2026-10')], 3100)
meter.forecastHorizon = 6
assert.equal(meter.trendMonths.at(-1), '2027-03')
meter.showForecast = false
assert.equal(meter.trendSeries.length, 1)
assert.equal(meter.trendMonths.at(-1), '2026-10')
const second = rows.map((row) => ({ ...row, meterId: 'meter-B', meterCode: '10201', meterLocation: '照明', readingTotal3: row.readingTotal3 * 2 }))
const selected = context([...rows, ...second], 'meter', ['meter-A', 'meter-B'])
assert.equal(selected.trendSeries.length, 4)
assert.equal(selected.entityForecasts[1].future[0].value, 6200)
const actions = []
selected.charts.trend = { dispatchAction(action, options) { actions.push({ action, options }) } }
const actualName = selected.entityLabel('meter-A')
const predictionName = actualName + '（预测）'
const otherName = selected.entityLabel('meter-B')
selected.syncTrendLegend({ name: actualName, selected: { [actualName]: false, [predictionName]: true, [otherName]: true } })
assert.equal(selected.trendLegendSelection[predictionName], false)
assert.equal(selected.trendLegendSelection[otherName], true)
assert.equal(actions.at(-1).action.type, 'legendUnSelect')
assert.equal(actions.at(-1).action.name, predictionName)
assert.equal(actions.at(-1).options.silent, true)
selected.syncTrendLegend({ name: actualName, selected: { [actualName]: true, [predictionName]: false } })
assert.equal(selected.trendLegendSelection[predictionName], true)
assert.equal(actions.at(-1).action.type, 'legendSelect')
selected.syncTrendLegend({ name: predictionName, selected: { [actualName]: true, [predictionName]: false } })
assert.equal(selected.trendLegendSelection[actualName], false)
assert.equal(actions.at(-1).action.name, actualName)
const optionsSeen = []
const handlers = new Map()
selected.getChart = (name) => name === 'trend' ? { setOption(option) { optionsSeen.push(option) }, off(event) { handlers.delete(event) }, on(event, handler) { handlers.set(event, handler) } } : null
selected.$refs = { trendChart: {} }
selected.resizeCharts = () => {}
selected.drawCharts()
selected.drawCharts()
assert.equal(optionsSeen.at(-1).legend.selected[predictionName], false)
assert.equal(handlers.size, 1)
const room = context([...rows, ...second], 'room', ['room-A'])
assert.equal(room.entityForecasts[0].future[0].value, 3100)
const sparse = context(rows.slice(-2), 'meter', ['meter-A'])
assert(!sparse.entityForecasts[0].ready)
assert.equal(sparse.trendSeries.length, 1)
assert(sparse.forecastNote.includes('至少需要'))
const partial = context([...rows.slice(0, -1), { ...rows.at(-1), readingTotal3: ' ' }], 'meter', ['meter-A'])
assert(partial.forecastNote.includes('滞后'))
const duplicate = context([...rows, rows.at(-1)], 'meter', ['meter-A'])
assert(!duplicate.entityForecasts[0].ready)
console.log('Trend forecast checks passed: meter/room selection, independent series, dashed future, timeline extension, six-month horizon, toggle, missing and duplicate data, template compilation.')
