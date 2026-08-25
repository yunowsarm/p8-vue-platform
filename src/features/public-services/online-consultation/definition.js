// 在线咨询业务定义：集中声明咨询、回复字段及用户端和管理端共用配置。
const consultationFields = [
  { key: 'userName', label: '咨询人', hideInForm: true },
  { key: 'phone', label: '联系电话', required: true, hideInReplyForm: true },
  { key: 'consultTime', label: '咨询时间', type: 'datetime', required: true, hideInReplyForm: true },
  { key: 'content', label: '咨询内容', type: 'textarea', required: true, hideInReplyForm: true },
  { key: 'replyPhone', label: '回复人联系方式', required: true, wide: true, hideInCreateForm: true },
  { key: 'replyUserName', label: '回复人', hideInForm: true },
  { key: 'replyTime', label: '回复时间', type: 'datetime', hideInForm: true },
  { key: 'replyContent', label: '回复内容', type: 'textarea', required: true, hideInCreateForm: true }
]

export const createOnlineConsultationConfig = ({ replyMode = false } = {}) => ({
  title: '在线咨询',
  itemName: '咨询',
  icon: 'el-icon-service',
  detailHeroClass: 'online-consultation-detail-icon',
  description: '提交园区服务咨询，由专员受理、回复并形成可追踪的服务记录。',
  idPrefix: 'OC',
  apiNamespace: 'tobOnlineConsult',
  primaryKey: 'id',
  primaryLabel: '咨询编号',
  cardTitleText: '在线咨询',
  cardTitleKey: 'userName',
  timeKey: 'consultTime',
  contentKey: 'content',
  contentLabel: '咨询内容',
  contactNameKey: 'userName',
  contactPhoneKey: 'phone',
  cardMetaFields: [
    { key: 'userName', icon: 'el-icon-user' },
    { key: 'phone', icon: 'el-icon-phone-outline' }
  ],
  hideCompany: true,
  isConsultation: true,
  defaultStatus: '待回复',
  statusOptions: ['待回复', '处理中', '已回复', '已关闭'],
  pendingStatuses: ['待回复'],
  pendingStatusNote: '等待园区专员回复',
  summaryDefinitions: [
    { title: '全部咨询', all: true, icon: 'el-icon-document', color: 'blue' },
    { title: '待回复', statuses: ['待回复'], icon: 'el-icon-time', color: 'orange' },
    { title: '处理中', statuses: ['处理中'], icon: 'el-icon-s-operation', color: 'cyan' },
    { title: '已回复', statuses: ['已回复', '已关闭'], icon: 'el-icon-circle-check', color: 'green' }
  ],
  formLabelWidth: replyMode ? '124px' : undefined,
  detailFieldLimit: 7,
  autoFormFields: replyMode ? {} : { userName: 'currentUserName' },
  replyMode,
  allowCreate: !replyMode,
  allowDelete: !replyMode,
  editActionLabel: replyMode ? '回复' : '编辑',
  replyStatus: '已回复',
  replyAutoFormFields: replyMode ? { replyUserName: 'currentUserName', replyTime: 'now' } : {},
  fields: consultationFields
})
