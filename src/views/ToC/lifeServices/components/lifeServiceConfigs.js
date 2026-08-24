const attachmentConfig = {
  uploadField: 'uploadFiles',
  uploadResponseField: 'uploadFiles',
  uploadLabel: '附件',
  uploadLimit: 9,
  uploadTip: '单个附件不超过 10MB，最多上传 9 个。'
}

export const createTalentServiceConfig = ({ readOnly = false } = {}) => ({
  title: '人才服务',
  apiNamespace: 'tocTalentService',
  readOnly,
  icon: 'el-icon-user',
  primaryLabel: '职位名称',
  primaryKey: 'jobTitle',
  contentKey: 'description',
  contentLabel: '职位描述',
  timeKey: 'publishTime',
  defaultStatus: '招聘中',
  statusOptions: ['招聘中', '已暂停', '已截止'],
  fields: [
    { key: 'jobTitle', label: '职位名称', required: true },
    { key: 'company', label: '公司名称', required: true },
    { key: 'salary', label: '薪资', required: true },
    { key: 'description', label: '职位描述', type: 'textarea', required: true },
    { key: 'contact', label: '联系方式', required: true },
    { key: 'publishTime', label: '发布时间', type: 'datetime', required: true }
  ]
})

export const createTravelTicketConfig = ({ readOnly = false } = {}) => ({
  title: '旅行门票',
  apiNamespace: 'tocTravelTicket',
  readOnly,
  icon: 'el-icon-picture-outline-round',
  primaryLabel: '景点名称',
  primaryKey: 'scenicName',
  contentKey: 'description',
  contentLabel: '门票说明',
  filterKey: 'ticketType',
  defaultStatus: '在售',
  statusOptions: ['在售', '售罄', '已下架'],
  fields: [
    { key: 'scenicName', label: '景点名称', required: true },
    { key: 'ticketType', label: '门票类型', options: ['成人票', '儿童票', '学生票', '团体票'], required: true },
    { key: 'price', label: '价格（元）', type: 'amount', required: true },
    { key: 'discount', label: '折扣', required: true },
    { key: 'description', label: '描述', type: 'textarea', required: true }
  ]
})

export const createUserSurveyConfig = ({ readOnly = false } = {}) => ({
  title: '调查问卷',
  totalLabel: '问卷总数',
  apiNamespace: 'tocUserSurvey',
  readOnly,
  icon: 'el-icon-document-checked',
  primaryLabel: '问卷标题',
  primaryKey: 'title',
  contentKey: 'description',
  contentLabel: '问卷说明',
  timeKey: 'startTime',
  showPrimaryTime: false,
  expiryTimeKey: 'endTime',
  hasStatus: false,
  ...attachmentConfig,
  fields: [
    { key: 'title', label: '标题', required: true },
    { key: 'description', label: '描述', type: 'textarea', required: true },
    { key: 'startTime', label: '开始时间', type: 'datetime', required: true },
    { key: 'endTime', label: '结束时间', type: 'datetime', required: true }
  ]
})
