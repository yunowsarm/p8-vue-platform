// 附件文件类型图标映射：根据 MIME、扩展名和常见文件名字段返回对应 SVG 图标。
const imageIcon = require('@/assets/image/fileType/file-image.svg')
const documentIcon = require('@/assets/image/fileType/file-document.svg')
const otherIcon = require('@/assets/image/fileType/file-other.svg')
const excelIcon = require('@/assets/image/fileType/file-excel.svg')

const imagePattern = /image\/|^(?:jpg|jpeg|png|gif|bmp|webp|svg)$|\.(?:jpg|jpeg|png|gif|bmp|webp|svg)(?:$|[?#])/i
const excelPattern = /(?:spreadsheet|excel|sheet)|^(?:xls|xlsx|csv)$|\.(?:xls|xlsx|csv)(?:$|[?#])/i
const documentPattern = /(?:word|document|pdf|text)|^(?:doc|docx|pdf|txt|rtf|md)$|\.(?:doc|docx|pdf|txt|rtf|md)(?:$|[?#])/i

export const getFileTypeIcon = (file) => {
  const sources = [
    file && file.fileType,
    file && file.type,
    file && file.name,
    file && file.fileName,
    file && file.originalName,
    file && file.originalFileName,
    file && file.attachmentName,
    file && file.attFileName,
    file && file.filePath,
    file && file.url,
    file && file.extension,
    file && file.suffix
  ]
    .filter(Boolean)
    .map(String)
  if (sources.some((source) => imagePattern.test(source))) return imageIcon
  if (sources.some((source) => excelPattern.test(source))) return excelIcon
  if (sources.some((source) => documentPattern.test(source))) return documentIcon
  return otherIcon
}
