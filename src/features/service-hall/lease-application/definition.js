// 租赁申请业务定义：维护申请类型、条件字段、状态映射和接口数据转换。
export const LEASE_APPLICATION_TYPES = Object.freeze([
  { label: '续租申请', value: 'renew' },
  { label: '退租申请', value: 'vacate' },
  { label: '扩租申请', value: 'expand' }
])

const typeValueMap = Object.freeze({ 续租申请: 'renew', 退租申请: 'vacate', 扩租申请: 'expand' })

const typeFieldKeys = Object.freeze({
  renew: ['currentExpireDate', 'renewalPeriodMonths', 'renewalStartDate'],
  vacate: ['plannedVacateDate', 'handoverPerson'],
  expand: ['currentArea', 'expansionArea', 'expectedStartDate', 'intendedLocation']
})

const normalizeLeaseFiles = (value) => {
  let files = value
  if (typeof files === 'string') {
    try {
      files = JSON.parse(files)
    } catch (error) {
      files = [files]
    }
  }
  if (!Array.isArray(files)) files = files ? [files] : []
  return files.filter(Boolean).map((item, index) => {
    const file = typeof item === 'string' ? { filePath: item } : Object.assign({}, item)
    const filePath = file.filePath || file.fileUrl || file.url || ''
    const name = file.name || file.fileName || file.originalFileName || file.originalName || file.attachmentName || file.attFileName || filePath.split(/[\\/]/).pop() || `附件${index + 1}`
    return Object.assign({}, file, {
      name,
      fileName: file.fileName || name,
      uid: file.uid || file.attachmentId || file.id || file.fileId || `lease-file-${index}`,
      url: file.url || file.fileUrl || file.filePath || ''
    })
  })
}

const normalizeLeaseRecord = (record) => {
  const normalized = Object.assign({}, record)
  normalized.applyType = typeValueMap[normalized.applyType] || normalized.applyType
  normalized.applyReason = normalized.applyReason || normalized.vacateReason || normalized.expansionPurposeReason || ''
  normalized.uploadFiles = normalizeLeaseFiles(normalized.uploadFiles)
  return normalized
}

const cleanLeaseUploadPath = (value) => (value ? value.replace(/^.*[\\/]/, '') : value)

const cleanLeaseUploadFile = (file) => {
  const normalized = Object.assign({}, file)
  delete normalized.id
  normalized.filePath = cleanLeaseUploadPath(normalized.filePath)
  normalized.url = cleanLeaseUploadPath(normalized.url)
  return normalized
}

const transformLeasePayload = (payload, { editing } = {}) => {
  const transformed = Object.assign({}, payload)
  if (editing && Array.isArray(transformed.uploadFiles)) transformed.uploadFiles = transformed.uploadFiles.map(cleanLeaseUploadFile)
  if (transformed.applyType === 'vacate') transformed.vacateReason = transformed.applyReason
  if (transformed.applyType === 'expand') transformed.expansionPurposeReason = transformed.applyReason
  return transformed
}

const detailFieldsResolver = (record, fields) => {
  const commonKeys = ['applyType', 'companyName', 'contractNo', 'currentLocation', 'contactPerson', 'contactPhone', 'applyDate']
  const visibleKeys = commonKeys.concat(typeFieldKeys[record.applyType] || [])
  return fields.filter((field) => visibleKeys.includes(field.key))
}

const leaseDefinition = Object.freeze({
  title: '租赁申请',
  itemName: '租赁申请',
  icon: 'el-icon-office-building',
  idPrefix: 'LA',
  apiNamespace: 'tobLeaseApplication',
  primaryKey: 'applyType',
  primaryLabel: '申请类型',
  primaryOptions: LEASE_APPLICATION_TYPES,
  valueLabelMaps: { applyType: { renew: '续租申请', vacate: '退租申请', expand: '扩租申请' } },
  timeKey: 'applyDate',
  autoFormFields: { applyDate: 'now' },
  contentKey: 'applyReason',
  contentLabel: '申请原因',
  uploadField: 'uploadFiles',
  uploadResponseField: 'uploadFiles',
  editUploadFilesTransform: (files) => files.map(cleanLeaseUploadFile),
  uploadLabel: '附件',
  uploadLimit: 9,
  uploadTip: '单个附件不超过 10MB，最多上传 9 个。',
  cardTitleKey: 'applyType',
  detailTitleKey: 'applyType',
  hideCompany: true,
  showSummary: false,
  loadDetailBeforeEdit: true,
  defaultStatus: '待查阅',
  statusMap: { null: '待查阅', 0: '待查阅', 1: '已查阅' },
  statusValueMap: { 待查阅: 0, 已查阅: 1 },
  listStatusValueMap: { 待查阅: 0, 已查阅: 1 },
  pendingStatuses: ['待查阅'],
  statusOptions: ['待查阅', '已查阅'],
  statusTransitions: { 待查阅: ['已查阅'], 已查阅: [] },
  markReviewingOnDetail: true,
  reviewPendingStatus: '待查阅',
  reviewingStatus: '已查阅',
  processRemarkField: 'remark',
  processRemarkLabel: '处理意见',
  cardMetaFields: [
    { key: 'companyName', icon: 'el-icon-office-building' },
    { key: 'currentLocation', icon: 'el-icon-location-outline' },
    { key: 'contactPerson', icon: 'el-icon-user' }
  ],
  detailFieldsResolver,
  normalizeRecord: normalizeLeaseRecord,
  formFromRecord: normalizeLeaseRecord,
  payloadTransform: transformLeasePayload,
  fields: [
    { key: 'applyType', label: '申请类型', required: true, options: LEASE_APPLICATION_TYPES },
    { key: 'companyName', label: '企业名称', required: true },
    // { key: 'contractNo', label: '租赁合同编号', required: true },
    { key: 'currentLocation', label: '现租赁位置', required: true },
    { key: 'contactPerson', label: '联系人', required: true },
    { key: 'contactPhone', label: '联系电话', required: true },
    { key: 'applyDate', label: '申请日期', type: 'datetime', hideInForm: true },
    { key: 'currentExpireDate', label: '当前到期日', type: 'datetime', required: true, showWhen: { applyType: 'renew' } },
    { key: 'renewalPeriodMonths', label: '续租期限（月）', required: true, options: [12, 24, 36], showWhen: { applyType: 'renew' } },
    { key: 'renewalStartDate', label: '续租起始日', type: 'datetime', required: true, showWhen: { applyType: 'renew' } },
    { key: 'plannedVacateDate', label: '计划退租日', type: 'datetime', required: true, showWhen: { applyType: 'vacate' } },
    { key: 'handoverPerson', label: '交接负责人', required: true, showWhen: { applyType: 'vacate' } },
    { key: 'currentArea', label: '现租赁面积', type: 'number', min: 0, defaultValue: null, required: true, showWhen: { applyType: 'expand' } },
    { key: 'expansionArea', label: '拟扩租面积', type: 'number', min: 0, defaultValue: null, required: true, showWhen: { applyType: 'expand' } },
    { key: 'expectedStartDate', label: '期望启用日期', type: 'datetime', required: true, showWhen: { applyType: 'expand' } },
    { key: 'intendedLocation', label: '意向位置', showWhen: { applyType: 'expand' } },
    { key: 'applyReason', label: '申请原因', type: 'textarea', required: true },
    { key: 'remark', label: '补充说明', type: 'textarea' }
  ]
})

export function getLeaseApplicationConfig(mode = 'user') {
  return Object.assign({}, leaseDefinition, {
    listParams: { type: mode === 'admin' ? 1 : 0 },
    fields: leaseDefinition.fields.map((field) => Object.assign({}, field)),
    records: []
  })
}
