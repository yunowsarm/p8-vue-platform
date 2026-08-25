// 资料下载业务定义：集中声明资料分类、附件字段和页面展示配置。
const DOCUMENT_CATEGORY_OPTIONS = Object.freeze(['办事指南', '表单模板', '园区手册', '宣传资料', '其他'])

const createFields = () => [
  { key: 'title', label: '资料标题', required: true, wide: true },
  { key: 'type', label: '资料分类', required: true, options: DOCUMENT_CATEGORY_OPTIONS },
  { key: 'itemCreateTime', label: '创建时间', type: 'datetime', required: true, hideInCreateForm: true },
  { key: 'description', label: '资料描述', type: 'textarea', required: true }
]

export const createDocumentDownloadConfig = ({ readOnly = true } = {}) => ({
  title: '资料下载',
  itemName: '资料',
  icon: 'el-icon-folder-opened',
  description: '提供办事指南、表单模板和园区资料，方便企业查阅和下载。',
  idPrefix: 'DD',
  apiNamespace: 'tobResourceDownload',
  primaryKey: 'type',
  primaryLabel: '资料分类',
  timeKey: 'itemCreateTime',
  contentKey: 'description',
  contentLabel: '资料描述',
  isDownload: true,
  actionLabel: '查看并下载',
  uploadField: 'uploadFiles',
  uploadResponseField: 'uploadFiles',
  uploadLabel: '附件',
  uploadLimit: 9,
  uploadTip: '单个附件不超过 10MB，最多上传 9 个。',
  cardMetaFields: [],
  hideCompany: true,
  hideProgress: true,
  loadDetailBeforeEdit: true,
  hasStatus: false,
  readOnly,
  fields: createFields()
})
