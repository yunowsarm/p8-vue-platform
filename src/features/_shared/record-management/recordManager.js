// 独立业务组件的共享状态逻辑：提供 CRUD、分页、详情、附件和状态流转，不负责渲染页面。
const pad = (value) => String(value).padStart(2, '0')

const now = () => {
  const date = new Date()
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object || {}, key)

export default {
  data() {
    return {
      keyword: '',
      typeFilter: '',
      statusFilter: '',
      currentPage: 1,
      pageSize: 6,
      total: 0,
      records: [],
      usingMock: false,
      loading: false,
      submitting: false,
      detailLoading: false,
      statusSubmitting: false,
      statusLoading: false,
      formVisible: false,
      detailVisible: false,
      statusVisible: false,
      editingId: '',
      form: {},
      selectedRecord: null,
      statusTarget: null,
      statusForm: { status: '', remark: '' },
      enterpriseOptions: [],
      enterpriseLoading: false
    }
  },
  computed: {
    fields() {
      return (this.resource && this.resource.fields) || []
    },
    formFields() {
      return this.fields.filter((field) => this.isFormFieldVisible(field))
    },
    detailFields() {
      if (this.resource && typeof this.resource.detailFieldsResolver === 'function' && this.selectedRecord) {
        return this.resource.detailFieldsResolver(this.selectedRecord, this.fields)
      }
      const contentKey = this.resource && this.resource.contentKey
      return this.fields.filter((field) => !field.hideInDetail && field.key !== contentKey)
    },
    cardFields() {
      if (this.resource && Array.isArray(this.resource.cardFields)) return this.resource.cardFields
      const primaryKey = this.resource && this.resource.primaryKey
      const contentKey = this.resource && this.resource.contentKey
      return this.fields.filter((field) => field.key !== primaryKey && field.key !== contentKey && field.type !== 'textarea').slice(0, 3)
    },
    primaryOptions() {
      if (this.resource && this.resource.primaryOptions) return this.resource.primaryOptions
      const primaryKey = this.resource && this.resource.primaryKey
      const field = this.fields.find((item) => item.key === primaryKey)
      return (field && field.options) || []
    },
    statusOptions() {
      return (this.resource && this.resource.statusOptions) || ['待受理', '处理中', '已完成', '已关闭']
    },
    filteredRecords() {
      const keyword = this.keyword.toLowerCase()
      const filterKey = (this.resource && (this.resource.filterKey || this.resource.primaryKey)) || ''
      return this.records.filter((record) => {
        const matchesKeyword =
          !keyword ||
          Object.keys(record || {}).some((key) =>
            String(record[key] || '')
              .toLowerCase()
              .includes(keyword)
          )
        const matchesType = !this.typeFilter || String(record[filterKey]) === String(this.typeFilter)
        const matchesStatus = !this.statusFilter || this.statusText(record.status) === this.statusFilter
        return matchesKeyword && matchesType && matchesStatus
      })
    },
    pagedRecords() {
      if (!this.usingMock) return this.filteredRecords
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredRecords.slice(start, start + this.pageSize)
    },
    paginationTotal() {
      return this.usingMock ? this.filteredRecords.length : this.total
    },
    rules() {
      const rules = {}
      this.formFields
        .filter((field) => field.required)
        .forEach((field) => {
          const select = field.options || field.key === 'companyId' || field.type === 'date' || field.type === 'datetime'
          rules[field.key] = [{ required: true, message: `请${select ? '选择' : '填写'}${field.label}`, trigger: select ? 'change' : 'blur' }]
        })
      return rules
    },
    canCreate() {
      return this.canPerform('create')
    },
    hasStatus() {
      return !this.resource || this.resource.hasStatus !== false
    },
    detailFiles() {
      if (!this.selectedRecord || !this.resource || !this.resource.uploadField) return []
      const responseField = this.resource.uploadResponseField || this.resource.uploadField
      return this.normalizeUploadFiles(this.selectedRecord[responseField])
    },
    auditFiles() {
      if (!this.statusTarget || !this.resource || !this.resource.uploadField) return []
      const responseField = this.resource.uploadResponseField || this.resource.uploadField
      return this.normalizeUploadFiles(this.statusTarget[responseField])
    },
    formDialogTitle() {
      if (!this.editingId) return `新增${this.resource.itemName || this.resource.title}`
      return `${this.resource.editActionLabel || '编辑'}${this.resource.itemName || this.resource.title}`
    },
    availableStatusOptions() {
      return this.nextStatusOptions(this.statusTarget)
    },
    isResubmitting() {
      return Boolean(this.editingId && this.isResubmitRecord(this.selectedRecord))
    }
  },
  created() {
    this.pageSize = Number((this.resource && this.resource.pageSize) || 6)
    this.form = this.emptyForm()
    this.loadRecords()
    this.loadEnterprises()
  },
  methods: {
    actionRules() {
      return (this.permissions && this.permissions.actions) || this.permissions || {}
    },
    canPerform(action, record) {
      const rules = this.actionRules()
      const fallback = action === 'changeStatus' ? Boolean(this.resource && this.resource.allowStatusChange) : !(this.resource && this.resource.readOnly)
      if (!hasOwn(rules, action)) return fallback
      const rule = rules[action]
      if (typeof rule === 'function') return Boolean(rule({ record, mode: this.mode, user: this.currentUser(), resource: this.resource }))
      return rule === true
    },
    canEditRecord(record) {
      if (!this.canPerform('edit', record)) return false
      if (Array.isArray(this.resource.editableStatuses)) return this.resource.editableStatuses.includes(this.statusText(record && record.status))
      if (this.resource.replyMode) return this.statusText(record && record.status) !== (this.resource.replyStatus || '已回复')
      return true
    },
    canDeleteRecord(record) {
      return this.canPerform('delete', record)
    },
    canChangeRecordStatus(record) {
      return this.hasStatus && this.canPerform('changeStatus', record) && this.nextStatusOptions(record).length > 0
    },
    hasRecordActions(record) {
      return this.canChangeRecordStatus(record) || this.canEditRecord(record) || this.canDeleteRecord(record)
    },
    matchesCondition(condition, values) {
      if (!condition) return true
      if (typeof condition === 'function') return Boolean(condition(values || {}))
      return Object.keys(condition).every((key) => {
        const expected = condition[key]
        const actual = values && values[key]
        return Array.isArray(expected) ? expected.includes(actual) : actual === expected
      })
    },
    isFormFieldVisible(field) {
      if (field.hideInForm || !this.matchesCondition(field.showWhen, this.form)) return false
      if (this.resource.replyMode) return !field.hideInReplyForm
      if (this.editingId) return !field.hideInEditForm
      return !field.hideInCreateForm
    },
    currentUser() {
      const storeUser = this.$store && this.$store.getters && this.$store.getters.userInfo
      if (storeUser) return storeUser
      try {
        return JSON.parse(window.sessionStorage.getItem('userInfo') || '{}')
      } catch (error) {
        return {}
      }
    },
    currentUserId() {
      const user = this.currentUser()
      return user.id || user.userId || user.userCode || ''
    },
    currentUserName() {
      const user = this.currentUser()
      return user.createByName || user.realName || user.userName || user.username || user.name || user.nickName || this.currentUserId() || ''
    },
    apiKey(action) {
      return `${this.resource.apiNamespace}.${action}`
    },
    api(action) {
      return this.$api && this.$api[this.apiKey(action)]
    },
    unwrap(response) {
      if (response && response.data && response.data.head && response.data.data !== undefined) return response.data.data
      if (response && response.result !== undefined) return response.result
      if (response && response.data && response.data.result !== undefined) return response.data.result
      return response && response.data !== undefined ? response.data : response
    },
    recordsFrom(result) {
      if (Array.isArray(result)) return result
      if (Array.isArray(result && result.records)) return result.records
      if (Array.isArray(result && result.list)) return result.list
      if (Array.isArray(result && result.rows)) return result.rows
      return []
    },
    normalizeRecord(record) {
      const normalized = Object.assign({}, record || {})
      return typeof this.resource.normalizeRecord === 'function' ? this.resource.normalizeRecord(normalized) : normalized
    },
    useMockRecords() {
      this.records = ((this.resource && this.resource.records) || []).map((record) => this.normalizeRecord(record))
      this.total = this.records.length
      this.usingMock = true
    },
    async loadRecords() {
      const listApi = this.api('list')
      if (!listApi) {
        this.useMockRecords()
        return
      }
      this.loading = true
      try {
        const params = Object.assign({}, this.resource.listParams || {}, { pageNo: this.currentPage, pageSize: this.pageSize })
        if (this.keyword) params.keyword = this.keyword
        if (this.typeFilter) params[this.resource.filterKey || this.resource.primaryKey] = this.typeFilter
        if (this.hasStatus && this.statusFilter) params[this.statusField()] = this.statusValue(this.statusFilter, true)
        const result = this.unwrap(await listApi(params)) || {}
        this.records = this.recordsFrom(result).map((record) => this.normalizeRecord(record))
        this.total = Number(result.total || result.count || result.totalCount || this.records.length)
        this.usingMock = false
      } catch (error) {
        this.useMockRecords()
      } finally {
        this.loading = false
      }
    },
    resetPage() {
      this.currentPage = 1
      this.loadRecords()
    },
    async loadEnterprises() {
      if (!this.fields.some((field) => field.key === 'companyId')) return
      const enterpriseApi = this.$api && this.$api['enterprise.getEnterprise']
      if (!enterpriseApi) return
      this.enterpriseLoading = true
      try {
        const result = this.unwrap(await enterpriseApi())
        const list = Array.isArray(result) ? result : Array.isArray(result && result.data) ? result.data : []
        this.enterpriseOptions = list.map((item) => ({ id: item.id, label: item.enterpriseName || item.enterpriseFullname || item.enterpriseNo || item.id }))
      } catch (error) {
        this.enterpriseOptions = []
      } finally {
        this.enterpriseLoading = false
      }
    },
    applyAutomaticValues(form, automaticFields) {
      const result = Object.assign({}, form)
      Object.keys(automaticFields || {}).forEach((key) => {
        if (automaticFields[key] === 'currentUserName') result[key] = this.currentUserName()
        if (automaticFields[key] === 'now') result[key] = now()
      })
      return result
    },
    emptyForm() {
      const form = {}
      this.fields.forEach((field) => {
        form[field.key] = field.defaultValue !== undefined ? field.defaultValue : field.key === this.resource.timeKey ? now() : ''
      })
      if (this.resource.uploadField) form[this.resource.uploadField] = []
      return this.applyAutomaticValues(Object.assign(form, this.resource.defaultForm || {}), this.resource.autoFormFields)
    },
    openCreate() {
      if (!this.canCreate) return
      this.editingId = ''
      this.form = this.emptyForm()
      this.formVisible = true
      this.$nextTick(() => this.$refs.recordForm && this.$refs.recordForm.clearValidate())
    },
    resetForm() {
      this.editingId = ''
      this.form = this.emptyForm()
      this.submitting = false
    },
    submitForm() {
      this.$refs.recordForm.validate((valid) => {
        if (valid) this.saveRecord()
      })
    },
    normalizeUploadFiles(files) {
      let list = files
      if (typeof list === 'string') {
        try {
          list = JSON.parse(list)
        } catch (error) {
          list = [list]
        }
      }
      if (!Array.isArray(list)) list = list ? [list] : []
      return list.filter(Boolean).map((item, index) => {
        const file = typeof item === 'string' ? { filePath: item } : Object.assign({}, item)
        const filePath = file.filePath || file.fileUrl || file.url || ''
        const name = file.name || file.fileName || file.originalFileName || file.originalName || file.attachmentName || file.attFileName || filePath.split(/[\\/]/).pop() || `附件${index + 1}`
        return Object.assign({}, file, {
          name,
          fileName: file.fileName || name,
          uid: file.uid || file.attachmentId || file.id || file.fileId || `record-file-${index}`,
          status: file.status || 'success',
          url: file.url || file.fileUrl || file.filePath || ''
        })
      })
    },
    cleanUploadFile(file) {
      const attachmentId = this.attachmentId(file)
      const fileName = file.fileName || file.name
      const filePath = file.filePath || file.fileUrl || file.url
      const result = {
        name: file.name || fileName,
        fileName,
        filePath,
        fileType: file.fileType,
        url: file.url || file.fileUrl || file.filePath
      }
      if (attachmentId) result.id = attachmentId
      return result
    },
    async saveRecord() {
      const editing = Boolean(this.editingId)
      const action = editing ? 'edit' : 'create'
      if (!this.canPerform(action, Object.assign({}, this.selectedRecord || {}, this.form))) return
      this.submitting = true
      const resubmitting = this.isResubmitting
      let payload = Object.assign({}, this.form)
      this.fields.filter((field) => field.showWhen && !this.matchesCondition(field.showWhen, this.form)).forEach((field) => delete payload[field.key])
      if (this.resource.uploadField) payload[this.resource.uploadField] = this.normalizeUploadFiles(payload[this.resource.uploadField]).map(this.cleanUploadFile)
      if (this.resource.replyMode) payload.status = this.resource.replyStatus || '已回复'
      const statusField = this.statusField()
      if (this.hasStatus && (payload[statusField] === undefined || payload[statusField] === null || payload[statusField] === '')) {
        let nextStatus = this.resource.defaultStatus || '待受理'
        if (this.editingId && this.selectedRecord) {
          const currentStatus = this.statusText(this.recordStatus(this.selectedRecord))
          const resubmitStatuses = this.resource.resubmitStatuses || []
          nextStatus = resubmitStatuses.includes(currentStatus) ? this.resource.resubmitStatus || this.resource.defaultStatus || '待审核' : this.recordStatus(this.selectedRecord) || nextStatus
        }
        payload[statusField] = this.statusValue(nextStatus)
      }
      if (statusField !== 'status') delete payload.status
      if (editing) payload.id = this.editingId
      Object.assign(payload, editing ? { updateBy: this.currentUserId(), itemUpdateTime: now() } : { createBy: this.currentUserId(), itemCreateTime: now() })
      if (typeof this.resource.payloadTransform === 'function') payload = this.resource.payloadTransform(payload, { editing, form: this.form })
      if (!editing) {
        if (!payload.createBy) payload.createBy = this.currentUserId()
        if (!payload.itemCreateTime) payload.itemCreateTime = now()
      }
      if (editing && this.resource.uploadField && hasOwn(payload, this.resource.uploadField)) {
        payload[this.resource.uploadField] = this.normalizeUploadFiles(payload[this.resource.uploadField]).map((file) => this.cleanStatusUploadFile(file))
      }
      if (resubmitting) {
        payload[statusField] = this.statusValue(this.resource.resubmitStatus || this.resource.defaultStatus || '待审核')
        if (statusField !== 'status') delete payload.status
      }
      const saveApi = this.api(editing ? 'edit' : 'add')
      try {
        if (this.usingMock || !saveApi) this.saveMockRecord(payload)
        else await saveApi(payload)
        const successMessage = resubmitting
          ? '重新提交成功'
          : this.editingId
          ? this.resource.replyMode
            ? '回复成功'
            : '修改成功'
          : this.resource.createSuccessMessage || `${this.resource.itemName || this.resource.title}已提交`
        this.$message.success(successMessage)
        this.formVisible = false
        this.currentPage = 1
        if (!this.usingMock) await this.loadRecords()
      } catch (error) {
        this.$message.error('提交失败，请稍后重试')
      } finally {
        this.submitting = false
      }
    },
    saveMockRecord(payload) {
      if (this.editingId) {
        const index = this.records.findIndex((record) => String(record.id) === String(this.editingId))
        if (index > -1) this.$set(this.records, index, Object.assign({}, this.records[index], payload))
      } else {
        this.records.unshift(Object.assign({}, payload, { id: `${this.resource.idPrefix || 'RE'}${Date.now().toString().slice(-8)}` }))
      }
      this.total = this.records.length
    },
    async openDetail(record) {
      this.selectedRecord = this.normalizeRecord(record)
      this.detailVisible = true
      const detailApi = this.api('queryById')
      if (!detailApi) return
      this.detailLoading = true
      try {
        const result = this.unwrap(await detailApi({ id: record.id }))
        if (result) this.selectedRecord = this.normalizeRecord(Object.assign({}, record, result))
      } catch (error) {
        // 保留列表中的基础数据，详情抽屉仍然可以打开。
      } finally {
        this.detailLoading = false
      }
      try {
        await this.markReviewingOnDetail()
      } catch (error) {
        this.$message.warning('详情已打开，但状态更新为审核中失败，请稍后重试')
      }
    },
    async openEdit(record) {
      if (!this.canEditRecord(record)) return
      let target = record || this.selectedRecord
      if (!target) return
      const detailApi = this.api('queryById')
      const needsDetail = this.resource.loadDetailBeforeEdit || Boolean(this.resource.uploadField)
      if (needsDetail && !detailApi && !this.usingMock) {
        this.$message.error('未找到详情接口，无法安全加载编辑数据')
        return
      }
      if (needsDetail && detailApi) {
        try {
          const result = this.unwrap(await detailApi({ id: target.id }))
          if (!result && this.resource.uploadField) throw new Error('missing detail data')
          if (result) target = Object.assign({}, target, result)
        } catch (error) {
          if (this.resource.uploadField) {
            this.$message.error('详情加载失败，无法安全加载附件，请重试')
            return
          }
          this.$message.warning('详情加载失败，已展示基础信息')
        }
      }
      target = this.normalizeRecord(target)
      if (!this.canEditRecord(target)) {
        this.$message.warning('当前状态不允许编辑')
        return
      }
      this.selectedRecord = target
      this.editingId = target.id
      const formRecord = typeof this.resource.formFromRecord === 'function' ? this.resource.formFromRecord(target) : target
      this.form = this.applyAutomaticValues(Object.assign(this.emptyForm(), formRecord), this.resource.replyAutoFormFields)
      if (this.resource.uploadField) {
        const responseField = this.resource.uploadResponseField || this.resource.uploadField
        let uploadFiles = this.normalizeUploadFiles(target[responseField])
        if (typeof this.resource.editUploadFilesTransform === 'function') uploadFiles = this.resource.editUploadFilesTransform(uploadFiles)
        this.$set(this.form, this.resource.uploadField, uploadFiles)
      }
      this.detailVisible = false
      this.formVisible = true
      this.$nextTick(() => this.$refs.recordForm && this.$refs.recordForm.clearValidate())
    },
    async removeRecord(record) {
      const target = record || this.selectedRecord
      if (!target || !this.canDeleteRecord(target)) return
      try {
        await this.$confirm('删除后不可恢复，是否继续？', '确认删除', { type: 'warning' })
        const deleteApi = this.api('delete')
        if (this.usingMock || !deleteApi) {
          this.records = this.records.filter((item) => String(item.id) !== String(target.id))
          this.total = this.records.length
        } else {
          await deleteApi({ id: target.id })
          await this.loadRecords()
        }
        this.detailVisible = false
        this.$message.success('删除成功')
      } catch (error) {
        if (error !== 'cancel' && error !== 'close') this.$message.error('删除失败，请稍后重试')
      }
    },
    nextStatusOptions(record) {
      if (!record) return []
      const currentStatus = this.statusText(this.recordStatus(record))
      const transitions = this.resource.statusTransitions || {}
      if (Object.keys(transitions).length) return Array.isArray(transitions[currentStatus]) ? transitions[currentStatus] : []
      return this.statusOptions.filter((status) => status !== currentStatus)
    },
    async openStatusDialog(record) {
      if (!this.canChangeRecordStatus(record)) return
      this.statusVisible = true
      this.statusLoading = true
      let target = this.normalizeRecord(record)
      try {
        if (this.resource.loadDetailBeforeStatus) {
          const detailApi = this.api('queryById')
          if (detailApi) {
            const result = this.unwrap(await detailApi({ id: record.id }))
            if (result) target = this.normalizeRecord(Object.assign({}, record, result))
          }
        }
      } catch (error) {
        this.$message.warning('详情加载失败，已展示列表中的基础信息')
      }
      try {
        if (this.resource.markReviewingOnStatusOpen) target = await this.markRecordReviewing(target)
      } catch (error) {
        this.statusVisible = false
        this.$message.error('状态更新为审核中失败，请稍后重试')
        return
      } finally {
        this.statusLoading = false
      }
      this.statusTarget = target
      const options = this.nextStatusOptions(target)
      this.statusForm = { status: options[0] || '', remark: target.remark || '' }
    },
    async saveStatus() {
      if (!this.statusTarget || !this.statusForm.status) return
      this.statusSubmitting = true
      const payload = this.prepareStatusPayload(this.statusTarget, this.statusForm.status, {
        remark: this.statusForm.remark,
        updateBy: this.currentUserId(),
        itemUpdateTime: now()
      })
      try {
        const editApi = this.api('edit')
        if (this.usingMock || !editApi) {
          const index = this.records.findIndex((record) => String(record.id) === String(this.statusTarget.id))
          if (index > -1) this.$set(this.records, index, Object.assign({}, this.records[index], payload))
        } else {
          await editApi(payload)
          await this.loadRecords()
        }
        this.statusVisible = false
        this.$message.success('状态已更新')
      } catch (error) {
        this.$message.error('状态更新失败，请稍后重试')
      } finally {
        this.statusSubmitting = false
      }
    },
    statusText(status) {
      const map = this.resource.statusMap || {}
      if (hasOwn(map, status)) return map[status]
      if (status === undefined || status === null || status === '' || status === 0 || status === '0') return this.resource.defaultStatus || '待处理'
      return status
    },
    statusValue(status, forList = false) {
      const map = forList ? this.resource.listStatusValueMap || this.resource.statusValueMap || {} : this.resource.statusValueMap || {}
      return hasOwn(map, status) ? map[status] : status
    },
    statusField() {
      return this.resource.statusField || 'status'
    },
    recordStatus(record) {
      return record && record[this.statusField()]
    },
    isResubmitRecord(record) {
      if (!record) return false
      return (this.resource.resubmitStatuses || []).includes(this.statusText(this.recordStatus(record)))
    },
    cleanStatusUploadFile(file) {
      const cleaned = this.cleanUploadFile(file)
      delete cleaned.id
      const stripPrefix = (value) => (value ? String(value).replace(/^.*[\\/]/, '') : value)
      cleaned.filePath = stripPrefix(cleaned.filePath)
      cleaned.url = stripPrefix(cleaned.url)
      return cleaned
    },
    prepareStatusPayload(record, status, extra = {}) {
      const statusField = this.statusField()
      const payload = Object.assign({}, record, extra)
      payload[statusField] = this.statusValue(status)
      if (statusField !== 'status') delete payload.status
      if (this.resource.uploadField) {
        const responseField = this.resource.uploadResponseField || this.resource.uploadField
        if (hasOwn(payload, responseField)) payload[this.resource.uploadField] = this.normalizeUploadFiles(payload[responseField]).map((file) => this.cleanStatusUploadFile(file))
      }
      return payload
    },
    async markRecordReviewing(record) {
      if (!record || !this.canPerform('changeStatus', record)) return record
      const pendingStatus = this.resource.reviewPendingStatus || '待审核'
      const reviewingStatus = this.resource.reviewingStatus || '审核中'
      if (this.statusText(this.recordStatus(record)) !== pendingStatus) return record
      const editApi = this.api('edit')
      const statusField = this.statusField()
      const payload = this.prepareStatusPayload(record, reviewingStatus, { updateBy: this.currentUserId(), itemUpdateTime: now() })
      if (!this.usingMock && editApi) await editApi(payload)
      const updated = this.normalizeRecord(Object.assign({}, record, { [statusField]: payload[statusField], status: payload[statusField] }))
      const index = this.records.findIndex((item) => String(item.id) === String(updated.id))
      if (index > -1) this.$set(this.records, index, Object.assign({}, this.records[index], { [statusField]: payload[statusField], status: payload[statusField] }))
      return updated
    },
    async markReviewingOnDetail() {
      if (!this.selectedRecord || !this.resource.markReviewingOnDetail || !this.canPerform('changeStatus', this.selectedRecord)) return
      this.selectedRecord = await this.markRecordReviewing(this.selectedRecord)
    },
    statusType(status) {
      return (
        {
          待受理: 'warning',
          待审核: 'warning',
          审核中: 'primary',
          待确认: 'warning',
          确认中: 'primary',
          待回复: 'warning',
          待处理: 'warning',
          处理中: '',
          已完成: 'success',
          已通过: 'success',
          已预定: 'success',
          已回复: 'success',
          已发布: 'success',
          正常: 'success',
          招聘中: 'success',
          在售: 'success',
          已拒绝: 'danger',
          已驳回: 'danger',
          已关闭: 'info',
          已下线: 'info',
          已暂停: 'info',
          已过期: 'info',
          已截止: 'info',
          售罄: 'info'
        }[status] || 'info'
      )
    },
    formatValue(value, key) {
      const valueMap = (this.resource.valueLabelMaps || {})[key] || {}
      if (hasOwn(valueMap, value)) return valueMap[value]
      if (key === 'companyId') {
        const enterprise = this.enterpriseOptions.find((item) => String(item.id) === String(value))
        if (enterprise) return enterprise.label
      }
      return value === undefined || value === null || value === '' ? '-' : value
    },
    optionLabel(option) {
      return option && typeof option === 'object' ? option.label : option
    },
    optionValue(option) {
      return option && typeof option === 'object' ? option.value : option
    },
    recordTitle(record) {
      if (this.resource.cardTitleText) return this.resource.cardTitleText
      const key = this.resource.cardTitleKey || this.resource.primaryKey
      return this.formatValue(record && record[key], key)
    },
    recordDescription(record) {
      return this.formatValue(record && record[this.resource.contentKey], this.resource.contentKey)
    },
    attachmentId(file) {
      return file && (file.attachmentId || file.id || file.fileId)
    },
    async downloadAttachment(file) {
      const attachmentId = this.attachmentId(file)
      if (!attachmentId) {
        this.$message.warning('该附件缺少 attachmentId，无法下载')
        return
      }
      const downloadApi = this.$api && this.$api['attachment.download']
      if (!downloadApi) {
        this.$message.error('未找到附件下载接口')
        return
      }
      try {
        const response = await downloadApi({ attachmentId }, { responseType: 'blob' })
        const responseData = response && response.data !== undefined ? response.data : response
        const blob = responseData instanceof Blob ? responseData : new Blob([responseData], { type: file.fileType || 'application/octet-stream' })
        const objectUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = objectUrl
        link.download = file.fileName || file.name || '附件'
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(objectUrl)
      } catch (error) {
        this.$message.error('附件下载失败，请稍后重试')
      }
    },
    statusActionText(record) {
      const status = this.statusText(this.recordStatus(record))
      return typeof this.resource.statusActionLabelResolver === 'function' ? this.resource.statusActionLabelResolver(record, status) : this.resource.statusActionLabel || '更新进度'
    }
  }
}
