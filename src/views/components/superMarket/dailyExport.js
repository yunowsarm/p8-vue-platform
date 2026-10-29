import { dailyAmountRows } from './analysis'

export function dailyAmountWorkbook(XLSX, rows, range) {
  const data = [['序号', '日期', '合计'], ...dailyAmountRows(rows, range)]
  const sheet = XLSX.utils.aoa_to_sheet(data)
  sheet['!cols'] = [{ wch: 10 }, { wch: 18 }, { wch: 20 }]
  sheet['!autofilter'] = { ref: sheet['!ref'] }
  for (let row = 1; row < data.length; row++) sheet[XLSX.utils.encode_cell({ r: row, c: 2 })].z = '#,##0.00'
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, '每日金额明细')
  return workbook
}
