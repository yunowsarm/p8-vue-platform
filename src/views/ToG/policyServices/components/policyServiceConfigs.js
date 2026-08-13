const policyTypes = [
  { label: '科技创新', value: '科技创新' },
  { label: '产业扶持', value: '产业扶持' },
  { label: '人才引进', value: '人才引进' },
  { label: '绿色发展', value: '绿色发展' },
  { label: '融资服务', value: '融资服务' }
]

const userTypes = [
  { label: '企业用户', value: '企业用户' },
  { label: '园区工作人员', value: '园区工作人员' },
  { label: '服务机构', value: '服务机构' }
]

export const projectApplicationConfig = {
  title: '项目申报', namespace: 'togProjectApplication', icon: 'el-icon-s-claim',
  searchLabel: '项目名称、企业、联系人', titleKey: 'projectName', contentKey: 'projectName', timeKey: 'applyTime',
  statusKey: 'approveStatus', defaultStatus: '待受理', statusOptions: ['待受理', '已受理', '审核中', '已立项'], advanceLabels: ['受理申请', '提交审核', '确认立项'],
  metaFields: [{ key: 'companyId', label: '申报企业', source: 'enterprise', icon: 'el-icon-office-building' }, { key: 'contactName', label: '联系人', icon: 'el-icon-user' }, { key: 'contactPhone', label: '电话', icon: 'el-icon-phone-outline' }],
  fields: [
    { key: 'companyId', label: '申报企业', source: 'enterprise' },
    { key: 'projectName', label: '项目名称' },
    { key: 'applyTime', label: '申请时间', type: 'datetime' },
    { key: 'contactName', label: '联系人' },
    { key: 'contactPhone', label: '联系电话' }
  ]
}

export const enterprisePolicyConfig = {
  title: '政策说明', namespace: 'togEnterprisePolicy', icon: 'el-icon-reading',
  searchLabel: '标题、政策类型、发布人', titleKey: 'title', contentKey: 'content', timeKey: 'publishTime',
  typeKey: 'policyType', typeLabel: '政策类型', typeOptions: policyTypes,
  statusKey: 'status', defaultStatus: '草稿', statusOptions: ['草稿', '已发布', '已下架'], advanceLabels: ['发布政策', '下架政策'],
  metaFields: [{ key: 'policyType', label: '政策类型', icon: 'el-icon-collection-tag' }, { key: 'publisherId', label: '发布人', icon: 'el-icon-user' }],
  fields: [
    { key: 'title', label: '政策标题' },
    { key: 'policyType', label: '政策类型', type: 'select', options: policyTypes },
    { key: 'publisherId', label: '发布人ID' },
    { key: 'publishTime', label: '发布时间', type: 'datetime' },
    { key: 'content', label: '政策内容', type: 'textarea', wide: true, rows: 7 }
  ]
}

export const policyInterpretConfig = {
  title: '图文解读', namespace: 'togPolicyInterpret', icon: 'el-icon-picture-outline',
  searchLabel: '解读标题、关联政策、发布人', titleKey: 'title', contentKey: 'content', timeKey: 'publishTime', defaultStatus: '已发布',
  metaFields: [{ key: 'policyId', label: '关联政策', source: 'policy', icon: 'el-icon-reading' }, { key: 'publisherId', label: '发布人', icon: 'el-icon-user' }],
  fields: [
    { key: 'policyId', label: '关联政策', source: 'policy' },
    { key: 'title', label: '解读标题' },
    { key: 'publisherId', label: '发布人ID' },
    { key: 'publishTime', label: '发布时间', type: 'datetime' },
    { key: 'content', label: '解读内容', type: 'textarea', wide: true, rows: 7 }
  ]
}

export const policyPushConfig = {
  title: '政策推送', namespace: 'togPolicyPush', icon: 'el-icon-position',
  searchLabel: '关联政策、推送对象、推送人', titleKey: 'pushTarget', contentKey: 'pushTarget', timeKey: 'pushTime',
  statusKey: 'status', defaultStatus: '待发送', statusOptions: ['待发送', '发送中', '已完成'], advanceLabels: ['开始推送', '确认发送完成'],
  metaFields: [{ key: 'policyId', label: '关联政策', source: 'policy', icon: 'el-icon-reading' }, { key: 'pushUserId', label: '推送人', icon: 'el-icon-user' }],
  fields: [
    { key: 'policyId', label: '推送政策', source: 'policy' },
    { key: 'pushTarget', label: '推送对象', type: 'select', options: [{ label: '全部园区企业', value: '全部园区企业' }, { label: '高新技术企业', value: '高新技术企业' }, { label: '科技型中小企业', value: '科技型中小企业' }, { label: '指定企业', value: '指定企业' }] },
    { key: 'pushTime', label: '计划推送时间', type: 'datetime' },
    { key: 'pushUserId', label: '推送人ID' }
  ]
}

export const policySubscribeConfig = {
  title: '政策订阅', namespace: 'togPolicySubscribe', icon: 'el-icon-bell',
  searchLabel: '用户、用户类型、订阅政策', titleKey: 'userId', contentKey: 'policyTypes', timeKey: 'subscribeTime',
  typeKey: 'userType', typeLabel: '用户类型', typeOptions: userTypes,
  statusKey: 'status', defaultStatus: '生效中', statusOptions: ['生效中', '已取消'], advanceLabels: ['取消订阅'],
  metaFields: [{ key: 'userType', label: '用户类型', icon: 'el-icon-user' }, { key: 'policyTypes', label: '订阅范围', icon: 'el-icon-collection-tag' }],
  fields: [
    { key: 'userId', label: '用户ID' },
    { key: 'userType', label: '用户类型', type: 'select', options: userTypes },
    { key: 'policyTypes', label: '订阅政策类型', type: 'select', multiple: true, options: policyTypes, wide: true },
    { key: 'subscribeTime', label: '订阅时间', type: 'datetime' }
  ]
}

export const policyMatchConfig = {
  title: '智能匹配', namespace: 'togPolicyMatch', icon: 'el-icon-connection', projectTransfer: true,
  searchLabel: '政策、匹配企业、匹配度', titleKey: 'companyId', contentKey: 'policyId', timeKey: 'matchTime',
  statusKey: 'status', defaultStatus: '已匹配', statusOptions: ['已匹配', '已推荐', '已转申报'], advanceLabels: ['推荐给企业', '转项目申报'],
  metaFields: [{ key: 'policyId', label: '匹配政策', source: 'policy', icon: 'el-icon-reading' }, { key: 'matchDegree', label: '匹配度', type: 'number', suffix: '%', icon: 'el-icon-data-line' }],
  fields: [
    { key: 'policyId', label: '匹配政策', source: 'policy' },
    { key: 'companyId', label: '匹配企业', source: 'enterprise' },
    { key: 'matchDegree', label: '匹配度', type: 'number', min: 0, max: 100, suffix: '%' },
    { key: 'matchTime', label: '匹配时间', type: 'datetime' }
  ]
}
