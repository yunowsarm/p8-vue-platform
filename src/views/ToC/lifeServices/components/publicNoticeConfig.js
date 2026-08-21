export const NOTICE_SCENE_TYPE_OPTIONS = Object.freeze(['园区动态', '企业动态', '安全提醒', '活动通知'])

const createFields = (editable) => [
  { key: 'title', label: '标题', required: editable },
  { key: 'sceneType', label: '场景类型', options: NOTICE_SCENE_TYPE_OPTIONS, required: editable },
  { key: 'content', label: '内容', type: 'textarea', required: editable },
  { key: 'createByName', label: '发布人', hideInForm: editable },
  { key: 'publishTime', label: '发布时间', type: 'datetime', hideInForm: editable }
]

export const createPublicNoticeConfig = ({ apiNamespace, readOnly = true } = {}) => {
  const editable = !readOnly

  return {
    title: '通知公告',
    apiNamespace,
    readOnly,
    autoPublisher: editable,
    publisherNameKey: 'createByName',
    hasStatus: false,
    icon: 'el-icon-bell',
    primaryLabel: '公告标题',
    primaryKey: 'title',
    contentKey: 'content',
    contentLabel: '公告内容',
    timeKey: 'publishTime',
    filterKey: 'sceneType',
    sceneTypeIconKey: 'sceneType',
    uploadField: 'uploadFiles',
    uploadResponseField: 'uploadFiles',
    uploadLabel: '附件',
    uploadLimit: 9,
    uploadTip: '单个附件不超过 10MB，最多上传 9 个。',
    fields: createFields(editable)
  }
}
