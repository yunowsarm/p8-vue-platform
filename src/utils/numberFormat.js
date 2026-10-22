// 仅用于展示，保留原始数值参与统计及图表计算。
export function decimalText(value) {
  if (value === null || value === undefined || String(value).trim() === '') return '—'
  const number = Number(String(value).replace(/,/g, '').trim())
  if (!Number.isFinite(number)) return '—'
  return (Math.abs(number) < 0.005 ? 0 : number).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
