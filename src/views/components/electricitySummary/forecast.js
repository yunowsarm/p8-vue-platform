// Daily intensity removes month-length effects; zeros remain valid observations.
export function shiftMonth(month, offset) {
  const [year, value] = month.split('-').map(Number)
  const date = new Date(year, value - 1 + offset, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function monthDays(month) {
  const [year, value] = month.split('-').map(Number)
  return new Date(year, value, 0).getDate()
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

const models = [
  { key: 'last', name: '延续上月日均', predict: (values, horizon) => Array(horizon).fill(values[values.length - 1]) },
  { key: 'mean', name: '近期三月日均', predict: (values, horizon) => Array(horizon).fill(average(values.slice(-3))) },
  {
    key: 'holt',
    name: '阻尼趋势平滑',
    predict(values, horizon) {
      const alpha = 0.6
      const beta = 0.2
      const phi = 0.85
      let level = values[0]
      let trend = values[1] - values[0]
      values.slice(1).forEach((value) => {
        const previous = level
        level = alpha * value + (1 - alpha) * (level + phi * trend)
        trend = beta * (level - previous) + (1 - beta) * phi * trend
      })
      let damp = 0
      return Array.from({ length: horizon }, (_, index) => {
        damp += Math.pow(phi, index + 1)
        return Math.max(0, level + damp * trend)
      })
    }
  },
  { key: 'seasonal', name: '去年同月日均', predict: (values, horizon) => Array.from({ length: horizon }, (_, index) => values[values.length - 12 + index]) }
]

function backtest(model, history, horizon, seasonal) {
  const errors = []
  const actuals = []
  const oneStep = []
  const start = Math.max(seasonal ? 12 : 3, history.length - 6)
  for (let origin = start; origin < history.length; origin++) {
    const steps = Math.min(horizon, 3, history.length - origin)
    const predicted = model.predict(
      history.slice(0, origin).map((item) => item.daily),
      steps
    )
    predicted.forEach((value, index) => {
      const actual = history[origin + index]
      const error = Math.abs(value * monthDays(actual.month) - actual.value)
      errors.push(error)
      actuals.push(actual.value)
      if (!index) oneStep.push(error / monthDays(actual.month))
    })
  }
  const sum = actuals.reduce((a, b) => a + b, 0)
  return { model, mae: errors.length ? average(errors) : null, wape: sum > 0 ? (errors.reduce((a, b) => a + b, 0) / sum) * 100 : null, errors: oneStep, samples: errors.length }
}

// Intervals are empirical error ranges, not calibrated probability guarantees.
export function forecastRoom(room, { horizon = 3, currentMonth } = {}) {
  horizon = horizon === 6 ? 6 : 3
  currentMonth = currentMonth || new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit' }).format(new Date())
  const base = {
    key: room.key,
    name: room.name,
    ready: false,
    history: [],
    future: [],
    activity: '暂不能判断',
    reliability: '不足',
    change: null,
    index: null,
    wape: null,
    model: '—',
    reasons: [],
    horizon
  }
  const closed = (room.predictionHistory || []).filter((item) => item.month < currentMonth)
  const observed = closed.filter((item) => item.value !== null)
  if (!observed.length) return { ...base, reasons: ['无已结束月份的可用电量；请扩大查询范围或补齐统计电表。'] }
  const last = observed[observed.length - 1]
  if (!last.complete) return { ...base, reasons: [`${last.month}统计电表数据不完整或有负值，暂不据此预测。`] }
  const end = closed.findIndex((item) => item.month === last.month)
  const history = []
  for (let i = end; i >= 0 && history.length < 36; i--) {
    const item = closed[i]
    if (!item.complete || item.signature !== last.signature || (history.length && item.month !== shiftMonth(history[0].month, -1))) break
    history.unshift({ ...item, daily: item.value / monthDays(item.month) })
  }
  if (history.length < 3) return { ...base, history, reasons: ['至少需要连续 3 个完整月份且统计电表一致；建议查询 12～24 个月。'] }
  const seasonal = history.length >= 24
  const scores = models.filter((model) => model.key !== 'seasonal' || seasonal).map((model) => backtest(model, history, horizon, seasonal))
  const winner = history.length >= 6 ? scores.slice().sort((a, b) => a.mae - b.mae)[0] : scores.find((item) => item.model.key === 'mean')
  const predicted = winner.model.predict(
    history.map((item) => item.daily),
    horizon
  )
  const baseline = history.slice(-3).reduce((sum, item) => sum + item.value, 0) / history.slice(-3).reduce((sum, item) => sum + monthDays(item.month), 0)
  const errors = winner.errors.slice().sort((a, b) => a - b)
  const error = errors.length >= 3 ? errors[Math.ceil(errors.length * 0.8) - 1] : null
  const future = predicted.map((daily, index) => {
    const month = shiftMonth(last.month, index + 1)
    const days = monthDays(month)
    const spread = error === null ? null : error * Math.sqrt(index + 1) * days
    return { month, value: daily * days, lower: spread === null ? null : Math.max(0, daily * days - spread), upper: spread === null ? null : daily * days + spread }
  })
  const change = baseline > 0 ? (average(predicted) / baseline - 1) * 100 : null
  const recentChange = history.length >= 6 ? (average(history.slice(-3).map((item) => item.daily)) / average(history.slice(-6, -3).map((item) => item.daily)) - 1) * 100 : null
  const stale = last.month !== shiftMonth(currentMonth, -1)
  const reliability = history.length < 6 || stale || winner.wape === null || winner.wape > 25 ? '低' : history.length >= 24 && winner.wape <= 10 ? '较高' : '中'
  let activity = change === null ? '基准为零，待核对' : change <= -20 ? '用电活跃度明显走低' : change <= -10 ? '用电活跃度趋降' : change >= 10 ? '用电活跃度趋升' : '用电活跃度相对平稳'
  if (reliability === '低') activity = '证据不足，待核对'
  if (stale) activity = '数据滞后，待核对'
  const reasons = []
  if (history.length < 6) reasons.push('历史较短，采用近期三月日均；暂不能评估预测误差。')
  if (!seasonal) reasons.push('不足 24 个连续完整月份，未使用年度季节模型；天气、节假日可能影响趋势。')
  if (stale) reasons.push(`最近可用月份为 ${last.month}，结果是从该月起的历史区间预测，不能代表当前运营。`)
  if (winner.wape > 25) reasons.push('历史回测误差较大，暂不作明确活跃度判断。')
  if (recentChange !== null && Number.isFinite(recentChange) && recentChange <= -20) reasons.push('近三月日均较前三月下降超过 20%，建议核对订单、开工及抄表情况。')
  return {
    ...base,
    ready: true,
    history,
    future,
    activity,
    reliability,
    change,
    index: baseline > 0 ? (average(predicted) / baseline) * 100 : null,
    baseline,
    recentChange: Number.isFinite(recentChange) ? recentChange : null,
    model: winner.model.name,
    wape: winner.wape,
    backtestSamples: winner.samples,
    reasons,
    scores: scores.map((item) => ({ model: item.model.name, mae: item.mae, wape: item.wape })),
    asOf: last.month
  }
}
