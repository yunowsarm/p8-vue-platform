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

const normalizeLeaseRecord = (record) => {
  const normalized = Object.assign({}, record)
  normalized.applyType = typeValueMap[normalized.applyType] || normalized.applyType
  normalized.applyReason = normalized.applyReason || normalized.vacateReason || normalized.expansionPurposeReason || ''
  return normalized
}

const transformLeasePayload = (payload) => {
  const transformed = Object.assign({}, payload)
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
  contentKey: 'applyReason',
  contentLabel: '申请原因',
  uploadField: 'uploadFiles',
  uploadResponseField: 'uploadFiles',
  uploadLabel: '附件',
  uploadLimit: 9,
  uploadTip: '单个附件不超过 10MB，最多上传 9 个。',
  cardTitleKey: 'applyType',
  detailTitleKey: 'applyType',
  hideCompany: true,
  showSummary: false,
  loadDetailBeforeEdit: true,
  defaultStatus: '待处理',
  statusMap: { null: '待处理', 0: '待处理', 1: '已完成', 2: '已驳回', 3: '处理中' },
  statusValueMap: { 待处理: '0', 处理中: '3', 已完成: '1', 已驳回: '2' },
  listStatusValueMap: { 待处理: '0', 处理中: '3', 已完成: '1', 已驳回: '2' },
  pendingStatuses: ['待处理'],
  statusOptions: ['待处理', '处理中', '已完成', '已驳回'],
  statusTransitions: { 待处理: ['处理中'], 处理中: ['已完成', '已驳回'] },
  statusDialogTitle: '处理租赁申请',
  statusActionLabelResolver: (record, status) => (status === '处理中' ? '完成处理' : '开始处理'),
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
    { key: 'contractNo', label: '租赁合同编号', required: true },
    { key: 'currentLocation', label: '现租赁位置', required: true },
    { key: 'contactPerson', label: '联系人', required: true },
    { key: 'contactPhone', label: '联系电话', required: true },
    { key: 'applyDate', label: '申请日期', type: 'datetime', required: true },
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
