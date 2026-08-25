// 服务大厅业务定义：集中维护六类申请的字段、状态流转和 API 命名空间。
const serviceStatusTransitions = Object.freeze({
  待受理: ['处理中', '已关闭'],
  处理中: ['已完成', '已关闭']
})

const reviewStatusTransitions = Object.freeze({
  待审核: ['处理中', '已拒绝', '已关闭'],
  处理中: ['已通过', '已拒绝', '已关闭']
})

const attachmentConfig = Object.freeze({
  uploadField: 'uploadFiles',
  uploadResponseField: 'uploadFiles',
  uploadLabel: '上传文件',
  uploadLimit: 9,
  uploadTip: '单个文件不超过 10MB，最多上传 9 个。'
})

export const SERVICE_HALL_DEFINITIONS = Object.freeze({
  complaintSuggestion: {
    title: '建议投诉',
    itemName: '建议投诉',
    icon: 'el-icon-chat-dot-round',
    idPrefix: 'SC',
    apiNamespace: 'feedbackComplaint',
    primaryKey: 'type',
    primaryLabel: '类型',
    timeKey: 'submitTime',
    contentKey: 'content',
    contentLabel: '内容',
    defaultStatus: '待回复',
    statusOptions: ['待回复', '已回复'],
    pendingStatuses: ['待回复', '待受理'],
    fields: [
      { key: 'companyId', label: '企业', required: true, hideInReplyForm: true },
      { key: 'contactName', label: '联系人', required: true, hideInReplyForm: true },
      { key: 'contactPhone', label: '联系电话', required: true, hideInReplyForm: true },
      { key: 'type', label: '类型', type: 'select', required: true, options: ['建议', '投诉'], hideInReplyForm: true },
      { key: 'submitTime', label: '提交时间', type: 'datetime', required: true, hideInReplyForm: true },
      { key: 'content', label: '内容', type: 'textarea', required: true, hideInReplyForm: true },
      { key: 'reply', label: '回复内容', type: 'textarea', required: true, hideInCreateForm: true }
    ],
    admin: {
      replyMode: true,
      replyStatus: '已回复',
      editActionLabel: '回复',
      showSummary: false
    }
  },
  serviceRequest: {
    title: '服务需求',
    itemName: '服务需求',
    icon: 'el-icon-service',
    idPrefix: 'SR',
    apiNamespace: 'tobServiceRequest',
    primaryKey: 'requestType',
    primaryLabel: '需求类型',
    timeKey: 'requestTime',
    contentKey: 'requestContent',
    contentLabel: '需求内容',
    defaultStatus: '待受理',
    statusOptions: ['待受理', '处理中', '已完成', '已关闭'],
    statusTransitions: serviceStatusTransitions,
    fields: [
      { key: 'companyId', label: '企业 ID', required: true },
      { key: 'requestType', label: '需求类型', required: true, options: ['政务服务咨询', '企业运营服务', '人才与招聘服务', '政策申报服务', '场地与设施服务', '其他服务'] },
      { key: 'requestTime', label: '提交时间', type: 'datetime', required: true },
      { key: 'contactName', label: '联系人', required: true },
      { key: 'contactPhone', label: '联系电话', required: true },
      { key: 'requestContent', label: '需求内容', type: 'textarea', required: true },
      { key: 'remark', label: '备注', type: 'textarea' }
    ],
    admin: { showSummary: false }
  },
  dataReport: Object.assign({}, attachmentConfig, {
    title: '数据上报',
    itemName: '数据上报',
    icon: 'el-icon-upload2',
    idPrefix: 'DR',
    apiNamespace: 'tobDataReport',
    listParams: { type: 0 },
    primaryKey: 'reportType',
    primaryLabel: '上传分类',
    timeKey: 'reportTime',
    contentKey: 'reportContent',
    contentLabel: '上报内容',
    defaultStatus: '待受理',
    statusOptions: ['待受理', '处理中', '已完成', '已关闭'],
    statusTransitions: serviceStatusTransitions,
    summaryDefinitions: [
      { title: '全部数据上报', all: true, note: '企业数据统一归集', icon: 'el-icon-document', color: 'blue' },
      { title: '知识产权', category: '知识产权', note: '知识产权相关材料', icon: 'el-icon-collection', color: 'orange' },
      { title: '财务数据', category: '财务数据', note: '企业财务相关材料', icon: 'el-icon-money', color: 'cyan' },
      { title: '员工数据', category: '员工数据', note: '企业员工相关材料', icon: 'el-icon-user', color: 'green' }
    ],
    fields: [
      { key: 'companyId', label: '企业 ID', required: true },
      { key: 'reportType', label: '上传分类', required: true, options: ['知识产权', '财务数据', '员工数据'] },
      { key: 'reportTime', label: '上报时间', type: 'datetime', required: true },
      { key: 'reportContent', label: '上报内容', type: 'textarea', required: true }
    ],
    admin: { showSummary: false }
  }),
  mediaPromotion: {
    title: '媒体宣传',
    itemName: '媒体宣传',
    icon: 'el-icon-picture-outline',
    idPrefix: 'MP',
    apiNamespace: 'tobMediaPromotion',
    primaryKey: 'promotionChannel',
    primaryLabel: '宣传渠道',
    timeKey: 'applyTime',
    contentKey: 'promotionContent',
    contentLabel: '宣传内容',
    defaultStatus: '待审核',
    statusOptions: ['待审核', '处理中', '已通过', '已拒绝', '已关闭'],
    statusTransitions: reviewStatusTransitions,
    fields: [
      { key: 'companyId', label: '企业 ID', required: true },
      { key: 'promotionChannel', label: '宣传渠道', required: true, options: ['园区公众号', '园区官网', '媒体专栏', '线下活动'] },
      { key: 'applyTime', label: '申请时间', type: 'datetime', required: true },
      { key: 'contactName', label: '联系人', required: true },
      { key: 'contactPhone', label: '联系电话', required: true },
      { key: 'promotionContent', label: '宣传内容', type: 'textarea', required: true }
    ],
    admin: { showSummary: false }
  },
  qualificationRecognition: {
    title: '资质认定',
    itemName: '资质认定',
    icon: 'el-icon-medal',
    idPrefix: 'QR',
    apiNamespace: 'tobQualificationCert',
    primaryKey: 'qualificationType',
    primaryLabel: '资质类型',
    timeKey: 'applyTime',
    contentKey: 'applyReason',
    contentLabel: '申请原因',
    defaultStatus: '待审核',
    statusOptions: ['待审核', '处理中', '已通过', '已拒绝', '已关闭'],
    statusTransitions: reviewStatusTransitions,
    fields: [
      { key: 'companyId', label: '企业 ID', required: true },
      { key: 'qualificationType', label: '资质类型', required: true, options: ['高新技术企业', '专精特新企业', '科技型中小企业', '创新型中小企业'] },
      { key: 'applyTime', label: '申请时间', type: 'datetime', required: true },
      { key: 'contactName', label: '联系人', required: true },
      { key: 'contactPhone', label: '联系电话', required: true },
      { key: 'applyReason', label: '申请原因', type: 'textarea', required: true }
    ],
    admin: { showSummary: false }
  },
  resourceConnection: {
    title: '资源对接',
    itemName: '资源对接',
    icon: 'el-icon-connection',
    idPrefix: 'RC',
    apiNamespace: 'tobResourceConnection',
    primaryKey: 'resourceType',
    primaryLabel: '资源类型',
    timeKey: 'applyTime',
    contentKey: 'connectContent',
    contentLabel: '对接内容',
    defaultStatus: '待受理',
    statusOptions: ['待受理', '处理中', '已完成', '已关闭'],
    statusTransitions: serviceStatusTransitions,
    fields: [
      { key: 'companyId', label: '企业 ID', required: true },
      { key: 'resourceType', label: '资源类型', required: true, options: ['技术资源', '人才资源', '金融资源', '市场资源', '场地资源'] },
      { key: 'resourceDesc', label: '资源描述', type: 'textarea', required: true },
      { key: 'connectTarget', label: '对接目标', required: true },
      { key: 'connectContent', label: '对接内容', type: 'textarea', required: true },
      { key: 'applyTime', label: '申请时间', type: 'datetime', required: true },
      { key: 'contactName', label: '联系人', required: true },
      { key: 'contactPhone', label: '联系电话', required: true },
      { key: 'remark', label: '备注', type: 'textarea' }
    ],
    admin: { showSummary: false }
  }
})

export const SERVICE_HALL_TABS = Object.freeze([
  { feature: 'complaintSuggestion', name: 'complaint-suggestion', label: '建议投诉' },
  { feature: 'serviceRequest', name: 'service-request', label: '服务需求' },
  { feature: 'dataReport', name: 'data-report', label: '数据上报' },
  { feature: 'mediaPromotion', name: 'media-promotion', label: '媒体宣传' },
  { feature: 'qualificationRecognition', name: 'qualification-recognition', label: '资质认定' },
  { feature: 'resourceConnection', name: 'resource-connection', label: '资源对接' }
])

const cloneDefinition = (definition) =>
  Object.assign({}, definition, {
    fields: (definition.fields || []).map((field) => Object.assign({}, field)),
    listParams: Object.assign({}, definition.listParams || {}),
    records: []
  })

export function getServiceHallConfig(feature, mode = 'user', overrides = {}) {
  const definition = SERVICE_HALL_DEFINITIONS[feature]
  if (!definition) throw new Error(`未知服务大厅功能：${feature}`)
  const config = cloneDefinition(definition)
  delete config.admin
  return Object.assign(config, mode === 'admin' ? definition.admin || {} : {}, overrides)
}
