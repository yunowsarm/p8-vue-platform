const imageIcon = require('@/assets/image/fileType/file-image.svg')
const documentIcon = require('@/assets/image/fileType/file-document.svg')
const otherIcon = require('@/assets/image/fileType/file-other.svg')
const excelIcon = require('@/assets/image/fileType/file-excel.svg')

const imagePattern = /image\/|\.(?:jpg|jpeg|png|gif|bmp|webp|svg)$/i
const excelPattern = /(?:spreadsheet|excel|sheet)|\.(?:xls|xlsx|csv)$/i
const documentPattern = /(?:word|document|pdf|text)|\.(?:doc|docx|pdf|txt|rtf|md)$/i

export const getFileTypeIcon = (file) => {
  const source = [file && file.fileType, file && file.type, file && file.name, file && file.fileName, file && file.filePath].filter(Boolean).join(' ')
  if (imagePattern.test(source)) return imageIcon
  if (excelPattern.test(source)) return excelIcon
  if (documentPattern.test(source)) return documentIcon
  return otherIcon
}
