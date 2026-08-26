<!-- 园区失物招领业务组件：负责信息发布、列表筛选、详情查看与附件下载。 -->
<template>
  <main class="communication-board">
    <section class="board-statistics board-statistics--compact" aria-label="信息统计">
      <article class="stat-card stat-card--primary">
        <span class="stat-icon"><i class="el-icon-document"></i></span>
        <div>
          <small>全部记录</small>
          <b>{{ allRecordsTotal }}</b>
          <em>所有发布记录</em>
        </div>
      </article>
      <article class="stat-card stat-card--info">
        <span class="stat-icon"><i class="el-icon-user-solid"></i></span>
        <div>
          <small>我发布的</small>
          <b>{{ myRecordsTotal }}</b>
          <em>当前账号发布</em>
        </div>
      </article>
    </section>
    <section v-loading="loading" class="communication-surface">
      <div class="list-toolbar">
        <el-input v-model.trim="keyword" clearable size="small" prefix-icon="el-icon-search" placeholder="搜索编号、标题、名称或内容" @input="resetPage" @clear="resetPage" />
        <el-select v-if="typeOptions.length" v-model="typeFilter" clearable size="small" :placeholder="'全部' + config.primaryLabel" @change="resetPage" @clear="resetPage">
          <el-option v-for="item in typeOptions" :key="item" :label="item" :value="item" />
        </el-select>
        <el-select v-if="config.hasStatus !== false" v-model="statusFilter" clearable size="small" placeholder="全部状态" @change="resetPage" @clear="resetPage">
          <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
        </el-select>
        <el-checkbox v-if="config.showMineFilter" v-model="onlyMine" class="mine-filter" @change="resetPage">只看我发布的</el-checkbox>
        <div class="toolbar-actions">
          <el-button type="primary" size="small" icon="el-icon-plus" @click="openCreate">新建{{ config.title }}</el-button>
        </div>
      </div>

      <div v-if="pagedRecords.length" class="communication-grid">
        <article v-for="item in pagedRecords" :key="item.id" class="communication-card" tabindex="0" role="button" @click="openDetail(item)" @keydown.enter="openDetail(item)">
          <div class="card-head">
            <span class="record-id">
              <i class="el-icon-document"></i>
              {{ item.id }}
            </span>
            <el-tag v-if="config.hasStatus !== false" :type="statusType(statusText(item.status, item))" size="small" effect="light">{{ statusText(item.status, item) }}</el-tag>
          </div>
          <div class="card-title">
            <img class="card-type-icon" :src="typeIcon(item.type)" :alt="typeIconAlt(item.type)" />
            <b>{{ item[config.primaryKey] || '-' }}</b>
            <time v-if="item[config.timeKey]">{{ item[config.timeKey] }}</time>
          </div>
          <p class="card-content">{{ item[config.contentKey] || '暂无描述' }}</p>
          <dl class="card-meta">
            <div v-for="field in cardFields" :key="field.key" class="card-meta-item">
              <dt>{{ field.label }}</dt>
              <dd>{{ formatValue(item[field.key]) }}</dd>
            </div>
          </dl>
          <div class="card-foot">
            <span v-if="config.counterFields" class="record-counts">
              <span v-for="field in config.counterFields" :key="field.key" class="record-count-item">
                <i :class="field.icon"></i>
                <b>{{ item[field.key] || 0 }}</b>
              </span>
            </span>
            <div class="card-actions">
              <el-button type="text" size="mini" @click.stop="openDetail(item)">查看详情</el-button>
              <el-button v-if="canAdvanceStatus(item)" type="text" size="mini" @click.stop="advanceStatus(item)">推进至{{ nextStatus(item) }}</el-button>
              <el-button v-if="canEditRecord(item)" type="text" size="mini" @click.stop="openEdit(item)">编辑</el-button>
              <el-button v-if="canManageRecord(item)" type="text" size="mini" class="danger-action" @click.stop="removeRecord(item)">删除</el-button>
            </div>
          </div>
        </article>
      </div>
      <el-empty v-else class="empty-state" description="暂无符合筛选条件的数据" />
      <div v-if="paginationTotal" class="pagination-row">
        <span>每页 {{ pageSize }} 条</span>
        <el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="paginationTotal" layout="prev, pager, next" @current-change="loadRecords" />
      </div>
    </section>

    <el-dialog
      :title="editingId ? '编辑' + config.title : '新建' + config.title"
      :visible.sync="formVisible"
      top="4vh"
      append-to-body
      :close-on-click-modal="false"
      custom-class="communication-form-dialog"
      @closed="resetForm">
      <el-form ref="communicationForm" :model="form" :rules="rules" label-width="92px" @submit.native.prevent>
        <el-row :gutter="28">
          <el-col v-for="field in normalFields" :key="field.key" :xs="24" :sm="12">
            <el-form-item :label="field.label" :prop="field.key">
              <el-select
                v-if="field.options"
                v-model="form[field.key]"
                clearable
                filterable
                :disabled="Boolean(editingId) && field.key === config.filterKey"
                :placeholder="'请选择' + field.label"
                class="field-full"
                @change="handleFormFieldChange(field.key)">
                <el-option v-for="option in field.options" :key="option" :label="option" :value="option" />
              </el-select>
              <el-date-picker
                v-else-if="field.type === 'datetime'"
                v-model="form[field.key]"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                format="yyyy-MM-dd HH:mm"
                :placeholder="'请选择' + field.label"
                class="field-full" />
              <el-date-picker
                v-else-if="field.type === 'date'"
                v-model="form[field.key]"
                type="date"
                value-format="yyyy-MM-dd"
                format="yyyy-MM-dd"
                :placeholder="'请选择' + field.label"
                class="field-full" />
              <el-input-number
                v-else-if="field.type === 'number' || field.type === 'amount'"
                v-model="form[field.key]"
                :min="0"
                :precision="field.type === 'amount' ? 2 : 0"
                controls-position="right"
                class="field-full" />
              <el-input v-else v-model.trim="form[field.key]" :placeholder="'请输入' + field.label" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col v-for="field in textFields" :key="field.key" :span="24">
            <el-form-item :label="field.label" :prop="field.key">
              <el-input v-model.trim="form[field.key]" type="textarea" :rows="field.key === config.contentKey ? 6 : 4" :maxlength="500" show-word-limit :placeholder="'请输入' + field.label" />
            </el-form-item>
          </el-col>
          <el-col v-if="config.uploadField" :span="24">
            <el-form-item :label="config.uploadLabel || '附件'" :prop="config.uploadField">
              <el-upload
                ref="lostFoundUpload"
                action="#"
                name="thefile"
                :auto-upload="false"
                :file-list="uploadFileList"
                :limit="config.uploadLimit || 9"
                :on-change="handleUploadChange"
                :on-remove="handleUploadRemove">
                <el-button size="small" type="primary" icon="el-icon-upload2">上传附件</el-button>
                <div slot="file" slot-scope="{ file }" class="upload-file-item">
                  <span class="upload-file-name">
                    <img class="file-type-icon" :src="fileIcon(file)" alt="" />
                    {{ file.name || file.fileName }}
                  </span>
                  <el-button class="remove-upload-file" type="text" icon="el-icon-delete" title="删除附件" @click="removeUploadFile(file)" />
                </div>
              </el-upload>
              <p v-if="config.uploadTip" class="upload-tip">{{ config.uploadTip }}</p>
            </el-form-item>
          </el-col>
          <el-col v-if="config.hasStatus !== false" :xs="24" :sm="12">
            <el-form-item label="状态">
              <div class="readonly-status">
                <i class="el-icon-time"></i>
                {{ statusText(form.status, form) }}
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">{{ editingId ? '保存' : '提交' }}</el-button>
      </span>
    </el-dialog>

    <el-drawer :title="config.title + '详情'" :visible.sync="detailVisible" size="500px" append-to-body :lock-scroll="true" custom-class="communication-detail-drawer">
      <div v-if="selectedRecord" class="drawer-layout">
        <div class="drawer-scroll">
          <div class="detail-hero">
            <span class="hero-icon"><img :src="typeIcon(selectedRecord.type)" :alt="typeIconAlt(selectedRecord.type)" /></span>
            <div>
              <small>{{ selectedRecord.id }}</small>
              <h3>{{ selectedRecord[config.primaryKey] || '-' }}</h3>
            </div>
            <el-tag v-if="config.hasStatus !== false" :type="statusType(statusText(selectedRecord.status, selectedRecord))">{{ statusText(selectedRecord.status, selectedRecord) }}</el-tag>
          </div>
          <div class="detail-grid">
            <span v-for="field in detailFields" :key="field.key">
              <small>{{ field.label }}</small>
              <b>{{ formatValue(selectedRecord[field.key]) }}</b>
            </span>
          </div>
          <section v-if="selectedRecord[config.contentKey]" class="detail-section">
            <h4>{{ config.contentLabel || '内容' }}</h4>
            <p>{{ selectedRecord[config.contentKey] }}</p>
          </section>
          <section v-if="detailUploadFiles.length" class="detail-section">
            <h4>{{ config.uploadLabel || '附件' }}</h4>
            <div class="detail-files">
              <div v-for="file in detailUploadFiles" :key="file.uid || file.id || file.filePath || file.fileName" class="detail-file-item">
                <button
                  type="button"
                  class="attachment-download-link"
                  :disabled="!file.id"
                  :title="file.name || file.fileName || '附件'"
                  :aria-label="`下载附件：${file.name || file.fileName || '附件'}`"
                  @click="downloadUploadFile(file)">
                  <img class="file-type-icon" :src="fileIcon(file)" alt="" aria-hidden="true" />
                  <span class="attachment-download-label">{{ file.name || file.fileName || '附件' }}</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </el-drawer>
  </main>
</template>

<script>
import { getFileTypeIcon } from '@/utils/fileTypeIcon'

const lostFoundIcon = require('@/assets/image/parkCommunication/lost-found.svg')
const lostNoticeIcon = require('@/assets/image/parkCommunication/lost-notice.svg')

export default {
  name: 'LostFoundBoard',
  props: { config: { type: Object, required: true } },
  data() {
    return {
      keyword: '',
      typeFilter: '',
      statusFilter: '',
      onlyMine: false,
      currentPage: 1,
      pageSize: 6,
      total: 0,
      allRecordsTotal: 0,
      myRecordsTotal: 0,
      records: [],
      loading: false,
      submitting: false,
      usingMock: false,
      formVisible: false,
      detailVisible: false,
      editingId: '',
      selectedRecord: null,
      form: {},
      lostFoundIcon,
      lostNoticeIcon
    }
  },
  computed: {
    fields() {
      return this.config.fields || []
    },
    normalFields() {
      return this.fields.filter((field) => !field.hidden && field.type !== 'textarea')
    },
    textFields() {
      return this.fields.filter((field) => !field.hidden && field.type === 'textarea')
    },
    typeOptions() {
      const field = this.fields.find((field) => field.key === this.config.filterKey)
      return field && field.options ? field.options : []
    },
    statusOptions() {
      if (this.config.typeStatusOptions) return this.statusOptionsForType(this.typeFilter)
      return this.config.statusOptions || ['正常', '待审核', '已发布', '已关闭', '已下线']
    },
    cardFields() {
      return this.fields.filter((field) => ![this.config.primaryKey, this.config.contentKey, this.config.timeKey, 'status', 'userId'].includes(field.key)).slice(0, 3)
    },
    detailFields() {
      return this.fields.filter((field) => ![this.config.contentKey, 'userId'].includes(field.key))
    },
    uploadFileList() {
      if (!this.config.uploadField) return []
      const files = this.form[this.config.uploadField]
      return Array.isArray(files) ? files : []
    },
    detailUploadFiles() {
      if (!this.config.uploadField || !this.selectedRecord) return []
      const responseField = this.config.uploadResponseField || this.config.uploadField
      return this.normalizeUploadFiles(this.selectedRecord[responseField])
    },
    rules() {
      const rules = {}
      this.fields
        .filter((field) => field.required)
        .forEach((field) => {
          rules[field.key] = [{ required: true, message: `请填写${field.label}`, trigger: field.options ? 'change' : 'blur' }]
        })
      return rules
    },
    filteredRecords() {
      const keyword = this.keyword.toLowerCase()
      return this.records.filter((item) => {
        const matchesKeyword =
          !keyword ||
          Object.keys(item).some((key) =>
            String(item[key] || '')
              .toLowerCase()
              .includes(keyword)
          )
        const matchesType = !this.typeFilter || item[this.config.filterKey] === this.typeFilter
        const matchesStatus = !this.statusFilter || this.statusText(item.status, item) === this.statusFilter
        const matchesMine = !this.onlyMine || this.canManageRecord(item)
        return matchesKeyword && matchesType && matchesStatus && matchesMine
      })
    },
    paginationTotal() {
      return this.total || this.filteredRecords.length
    },
    pagedRecords() {
      if (this.total && !this.usingMock) return this.filteredRecords
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredRecords.slice(start, start + this.pageSize)
    },
    pendingCount() {
      return this.pagedRecords.filter((item) => this.isPendingStatus(item.status, item)).length
    },
    handledCount() {
      return this.pagedRecords.filter((item) => !this.isPendingStatus(item.status, item)).length
    }
  },
  created() {
    this.loadRecords()
    this.loadStatistics()
  },
  methods: {
    currentUserId() {
      try {
        return JSON.parse(window.sessionStorage.getItem('userInfo') || '{}').id || ''
      } catch (error) {
        return ''
      }
    },
    typeIcon(type) {
      return type === '寻物启事' ? this.lostNoticeIcon : this.lostFoundIcon
    },
    typeIconAlt(type) {
      return type === '寻物启事' ? '寻物启事' : '失物招领'
    },
    fileIcon(file) {
      return getFileTypeIcon(file)
    },
    creatorId(item) {
      if (!item) return ''
      return item[this.config.creatorKey || 'createBy'] || item.createBy || item.userId || ''
    },
    canManageRecord(item) {
      const currentUserId = this.currentUserId()
      const creatorId = this.creatorId(item)
      return Boolean(currentUserId && creatorId && String(currentUserId) === String(creatorId))
    },
    canEditRecord(item) {
      return this.canManageRecord(item) && !['已认领', '已找到'].includes(this.statusText(item.status, item))
    },
    now() {
      const date = new Date()
      const pad = (value) => String(value).padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    },
    apiKey(action) {
      return `${this.config.apiNamespace}.${action}`
    },
    // 项目 Axios 拦截器已返回业务 data；只有未经过拦截器的响应才需要继续取 data。
    unwrap(response) {
      if (!response) return response
      if (response.data && response.data.head && response.data.data !== undefined) return response.data.data
      return response
    },
    normalizeRecord(record) {
      if (!record) return record
      return Object.assign({}, record, { userName: record.userName || record.createByName || '' })
    },
    recordsFrom(data) {
      const records = Array.isArray(data) ? data : Array.isArray(data && data.records) ? data.records : Array.isArray(data && data.list) ? data.list : []
      return records.map((record) => this.normalizeRecord(record))
    },
    totalFrom(data) {
      return Number(data && (data.total || data.count || data.totalCount)) || 0
    },
    statusOptionsForType(type) {
      const statusByType = this.config.typeStatusOptions
      if (!statusByType) return this.config.statusOptions || []
      if (type && statusByType[type]) return statusByType[type]
      return [...new Set(Object.keys(statusByType).reduce((options, key) => options.concat(statusByType[key]), []))]
    },
    defaultStatusFor(record) {
      const options = this.statusOptionsForType(record && record[this.config.filterKey])
      return options[0] || this.config.defaultStatus || '正常'
    },
    statusText(value, record) {
      if (value === undefined || value === null || value === '' || value === '0') return this.defaultStatusFor(record)
      const map = { 1: '待审核', 2: '已发布', 3: '已关闭', 4: '已下线' }
      return map[value] || value
    },
    isPendingStatus(value, record) {
      return ['待审核', '待认领', '寻找中', '待拼车'].includes(this.statusText(value, record))
    },
    nextStatus(item) {
      const options = this.statusOptionsForType(item && item[this.config.filterKey])
      const index = options.indexOf(this.statusText(item && item.status, item))
      return index >= 0 ? options[index + 1] || '' : ''
    },
    canAdvanceStatus(item) {
      return Boolean(this.config.canAdvanceStatus && this.canManageRecord(item) && this.nextStatus(item))
    },
    statusType(status) {
      if (['正常', '已发布', '已认领', '已找到'].includes(status)) return 'success'
      if (['待审核', '待认领', '寻找中', '待拼车'].includes(status)) return 'warning'
      if (['已关闭', '已下线'].includes(status)) return 'info'
      return 'danger'
    },
    formatValue(value) {
      return value === undefined || value === null || value === '' ? '-' : value
    },
    resetPage() {
      this.currentPage = 1
      if (this.statusFilter && !this.statusOptions.includes(this.statusFilter)) this.statusFilter = ''
      if (!this.usingMock) this.loadRecords()
    },
    async loadRecords() {
      this.loading = true
      try {
        const result = this.unwrap(
          await this.$api[this.apiKey('list')]({
            pageNo: this.currentPage,
            pageSize: this.pageSize,
            keyword: this.keyword || undefined,
            status: this.statusFilter || undefined,
            createBy: this.onlyMine ? this.currentUserId() : undefined
          })
        )
        this.records = this.recordsFrom(result)
        this.total = this.totalFrom(result)
        this.usingMock = false
      } catch (error) {
        this.records = this.config.records || []
        this.total = this.records.length
        this.usingMock = true
      } finally {
        this.loading = false
      }
    },
    async loadStatistics() {
      const query = { pageNo: 1, pageSize: 1 }
      try {
        const [allResult, mineResult] = await Promise.all([this.$api[this.apiKey('list')](query), this.$api[this.apiKey('list')](Object.assign({}, query, { createBy: this.currentUserId() }))])
        this.allRecordsTotal = this.totalFrom(this.unwrap(allResult))
        this.myRecordsTotal = this.totalFrom(this.unwrap(mineResult))
      } catch (error) {
        const records = this.config.records || []
        this.allRecordsTotal = records.length
        this.myRecordsTotal = records.filter((item) => this.canManageRecord(item)).length
      }
    },
    emptyForm() {
      const form = {}
      this.fields.forEach((field) => {
        form[field.key] = ''
      })
      this.fields
        .filter((field) => field.autoNow)
        .forEach((field) => {
          form[field.key] = this.now()
        })
      if (this.config.uploadField) form[this.config.uploadField] = []
      if (this.config.currentUserIdKey) form[this.config.currentUserIdKey] = this.currentUserId()
      if (this.config.hasStatus !== false) form.status = this.defaultStatusFor(form)
      return form
    },
    resetForm() {
      this.editingId = ''
      this.form = this.emptyForm()
      this.$nextTick(() => this.$refs.communicationForm && this.$refs.communicationForm.clearValidate())
    },
    openCreate() {
      this.editingId = ''
      this.form = this.emptyForm()
      this.formVisible = true
    },
    async openEdit(item) {
      if (!this.canManageRecord(item)) {
        this.$message.warning('仅创建人可以编辑该记录')
        return
      }
      if (!this.canEditRecord(item)) {
        this.$message.warning('已认领或已找到的记录不可编辑')
        return
      }
      let record = item
      const detailApi = this.$api && this.$api[this.apiKey('queryById')]
      if (detailApi) {
        try {
          const result = this.unwrap(await detailApi({ id: item.id }))
          if (result) record = this.normalizeRecord(Object.assign({}, item, result))
        } catch (error) {
          // 详情查询失败时，仍可用列表数据编辑基础字段。
        }
      }
      this.editingId = record.id
      this.form = Object.assign(this.emptyForm(), record, { status: this.statusText(record.status, record) })
      if (this.config.uploadField) {
        const responseField = this.config.uploadResponseField || this.config.uploadField
        this.form[this.config.uploadField] = this.normalizeUploadFiles(record[responseField])
      }
      this.formVisible = true
    },
    handleFormFieldChange(key) {
      if (key !== this.config.filterKey || this.config.hasStatus === false) return
      this.form.status = this.defaultStatusFor(this.form)
    },
    async submitForm() {
      const valid = await new Promise((resolve) => this.$refs.communicationForm.validate(resolve))
      if (!valid) return
      this.submitting = true
      const currentUser = {}
      if (this.config.currentUserIdKey) currentUser[this.config.currentUserIdKey] = this.currentUserId()
      const payload = Object.assign(
        {},
        this.form,
        currentUser,
        this.editingId ? { id: this.editingId, updateBy: this.currentUserId(), itemUpdateTime: this.now() } : { createBy: this.currentUserId(), itemCreateTime: this.now() }
      )
      if (!this.editingId) {
        this.fields
          .filter((field) => field.autoNow)
          .forEach((field) => {
            payload[field.key] = this.now()
          })
      }
      this.fields
        .filter((field) => field.responseOnly)
        .forEach((field) => {
          delete payload[field.key]
        })
      if (this.config.uploadField) {
        payload[this.config.uploadField] = this.normalizeUploadFiles(payload[this.config.uploadField]).map((file) => this.cleanUploadFile(file))
      }
      try {
        await this.$api[this.apiKey(this.editingId ? 'edit' : 'add')](payload)
        this.$message.success(this.editingId ? '已更新' : '已提交')
        this.formVisible = false
        this.loadRecords()
        this.loadStatistics()
      } catch (error) {
        this.$message.error(this.errorMessage(error))
      } finally {
        this.submitting = false
      }
    },
    async removeRecord(item) {
      if (!this.canManageRecord(item)) {
        this.$message.warning('仅创建人可以删除该记录')
        return
      }
      try {
        await this.$confirm('确认删除该条记录？', '删除确认', { type: 'warning' })
        await this.$api[this.apiKey('delete')]({ id: item.id })
        this.$message.success('已删除')
        this.loadRecords()
        this.loadStatistics()
      } catch (error) {
        if (error !== 'cancel') this.$message.error(this.errorMessage(error, '删除失败，请稍后重试'))
      }
    },
    async advanceStatus(item) {
      if (!this.canAdvanceStatus(item)) {
        this.$message.warning('仅创建人可以推进状态')
        return
      }
      const next = this.nextStatus(item)
      try {
        await this.$confirm(`确认将状态推进至“${next}”？`, '状态推进确认', { type: 'warning' })
        await this.$api[this.apiKey('edit')](Object.assign({}, item, { status: next, updateBy: this.currentUserId(), itemUpdateTime: this.now() }))
        this.$message.success(`状态已更新为“${next}”`)
        this.loadRecords()
      } catch (error) {
        if (error !== 'cancel') this.$message.error(this.errorMessage(error, '状态推进失败，请稍后重试'))
      }
    },
    errorMessage(error, fallback = '操作失败，请稍后重试') {
      const payload = error && ((error.response && error.response.data) || error.data || error)
      return (payload && payload.head && payload.head.message) || (payload && payload.message) || fallback
    },
    normalizeUploadFiles(value) {
      let files = value
      if (typeof files === 'string') {
        try {
          files = JSON.parse(files)
        } catch (error) {
          files = []
        }
      }
      if (!Array.isArray(files)) files = files ? [files] : []
      return files.filter(Boolean).map((item, index) => {
        const file = typeof item === 'string' ? { fileName: item, filePath: item } : item
        return Object.assign({}, file, {
          name: file.name || file.fileName || `附件${index + 1}`,
          status: file.status || (file.filePath || file.id ? 'success' : 'ready'),
          uid: file.uid || file.id || file.filePath || `lost-found-file-${index}`
        })
      })
    },
    async handleUploadChange(file, fileList) {
      const raw = file.raw
      if (!raw || file.filePath || file.id) return
      if (raw.size > 10 * 1024 * 1024) {
        this.$message.error('单个附件不能超过 10MB')
        this.$set(
          this.form,
          this.config.uploadField,
          fileList.filter((item) => item.uid !== file.uid)
        )
        this.$nextTick(() => this.$refs.lostFoundUpload && this.$refs.lostFoundUpload.handleRemove(file))
        return
      }
      if (!this.$api || !this.$api['attachment.upload']) {
        this.$message.error('未找到附件上传接口')
        this.$refs.lostFoundUpload && this.$refs.lostFoundUpload.handleRemove(file)
        this.$set(
          this.form,
          this.config.uploadField,
          fileList.filter((item) => item.uid !== file.uid)
        )
        return
      }
      file.status = 'uploading'
      try {
        const formData = new FormData()
        formData.append('thefile', raw)
        const uploadFile = this.getUploadResult(await this.$api['attachment.upload'](formData))
        if (!uploadFile.filePath && !uploadFile.id) throw new Error('附件上传未返回文件信息')
        Object.assign(file, {
          fileName: uploadFile.fileName || file.name,
          filePath: uploadFile.filePath,
          name: uploadFile.fileName || file.name,
          fileType: uploadFile.fileType || raw.type || '',
          status: 'success',
          url: uploadFile.url || uploadFile.fileUrl || ''
        })
        this.$set(this.form, this.config.uploadField, fileList)
      } catch (error) {
        this.$message.error('附件上传失败，请重试')
        this.$refs.lostFoundUpload && this.$refs.lostFoundUpload.handleRemove(file)
        this.$set(
          this.form,
          this.config.uploadField,
          fileList.filter((item) => item.uid !== file.uid)
        )
      }
    },
    handleUploadRemove(file, fileList) {
      this.$set(this.form, this.config.uploadField, fileList)
    },
    removeUploadFile(file) {
      if (this.$refs.lostFoundUpload) this.$refs.lostFoundUpload.handleRemove(file)
    },
    cleanUploadFile(file) {
      const uploadFile = Object.assign({}, file)
      delete uploadFile.id
      delete uploadFile.raw
      delete uploadFile.status
      delete uploadFile.uid
      delete uploadFile.percentage
      if (uploadFile.filePath) {
        const paths = String(uploadFile.filePath).split('/').filter(Boolean)
        uploadFile.filePath = paths.length ? paths[paths.length - 1] : uploadFile.filePath
      }
      return uploadFile
    },
    getUploadResult(response) {
      const data = Array.isArray(response) ? response : response && response.data
      return Array.isArray(data) ? data[0] || {} : data || {}
    },
    async downloadUploadFile(file) {
      if (!file.id || !this.$api || !this.$api['attachment.download']) return
      try {
        const response = await this.$api['attachment.download']({ attachmentId: file.id }, { responseType: 'blob' })
        const url = URL.createObjectURL(new Blob([response.data], { type: file.fileType || 'application/octet-stream' }))
        const link = document.createElement('a')
        link.href = url
        link.download = file.name || file.fileName || '附件'
        link.click()
        URL.revokeObjectURL(url)
      } catch (error) {
        this.$message.error('附件下载失败，请稍后重试')
      }
    },
    async openDetail(item) {
      this.selectedRecord = item
      this.detailVisible = true
      try {
        const result = this.unwrap(await this.$api[this.apiKey('queryById')]({ id: item.id }))
        if (result) this.selectedRecord = this.normalizeRecord(Object.assign({}, item, result))
      } catch (error) {}
    }
  }
}
</script>

<style scoped>
.communication-board {
  min-height: 100%;
  padding: 12px;
  box-sizing: border-box;
  background: #f6f8fb;
}
.board-statistics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}
.board-statistics--compact {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.stat-card {
  min-height: 94px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 13px;
  border: 1px solid #e7edf5;
  border-radius: 8px;
  background: #fff;
  box-sizing: border-box;
}
.stat-icon {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 18px;
}
.stat-icon img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}
.stat-card div {
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.stat-card small {
  color: #7f8da3;
  font-size: 13px;
  line-height: 18px;
}
.stat-card b {
  margin-top: 2px;
  color: #1f3858;
  font-size: 23px;
  line-height: 27px;
}
.stat-card em {
  overflow: hidden;
  color: #a2aec0;
  font-size: 12px;
  font-style: normal;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.stat-card--primary .stat-icon {
  color: #377ee8;
  background: #eaf2ff;
}
.stat-card--warning .stat-icon {
  color: #d99018;
  background: #fff4df;
}
.stat-card--success .stat-icon {
  color: #18a06d;
  background: #e7f8f0;
}
.stat-card--info .stat-icon {
  color: #2187b9;
  background: #e6f7fc;
}
.communication-surface {
  min-height: clamp(650px, calc(100vh - 256px), 780px);
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e7edf5;
  border-radius: 8px;
  overflow: hidden;
}
.list-toolbar {
  min-height: 64px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-sizing: border-box;
}
.list-toolbar .el-input {
  width: 270px;
}
.list-toolbar .el-select {
  width: 170px;
}
.toolbar-actions {
  margin-left: auto;
}
.communication-grid {
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(260px, 1fr));
  gap: 16px;
  align-content: start;
  padding: 18px 22px 28px;
}
.communication-card {
  min-height: 236px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  border: 1px solid #e4ebf4;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s ease;
  outline: none;
}
.communication-card:hover,
.communication-card:focus {
  border-color: #2f86ed;
}
.card-head,
.card-foot,
.card-actions {
  display: flex;
  align-items: center;
}
.card-head {
  justify-content: space-between;
  gap: 10px;
}
.record-id {
  color: #6d91c4;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.record-id i,
.card-title i {
  margin-right: 7px;
  color: #409eff;
}
.card-type-icon {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  margin-right: 7px;
  object-fit: contain;
}
.card-title {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 16px;
  color: #29486e;
}
.card-title b {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 16px;
}
.card-title time {
  margin-left: auto;
  color: #9aa8bb;
  font-size: 12px;
  white-space: nowrap;
}
.card-content {
  display: -webkit-box;
  min-height: 42px;
  margin: 13px 0;
  overflow: hidden;
  color: #50617a;
  font-size: 14px;
  line-height: 21px;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.card-meta {
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr);
  gap: 7px 12px;
  margin: 0;
  padding: 11px 0;
  border-top: 1px solid #edf1f6;
  border-bottom: 1px solid #edf1f6;
  font-size: 13px;
}
.card-meta-item {
  display: contents;
}
.card-meta dt {
  color: #9aa8bb;
}
.card-meta dd {
  margin: 0;
  overflow: hidden;
  color: #50617a;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-foot {
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 12px;
}
.record-counts {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #8b9ab0;
  font-size: 12px;
}
.record-counts i {
  margin-left: 6px;
}
.record-counts b {
  color: #627996;
  font-weight: 500;
}
.card-actions {
  margin-left: auto;
  gap: 4px;
  white-space: nowrap;
}
.card-actions .el-button {
  margin-left: 0;
}
.danger-action {
  color: #f56c6c;
}
.empty-state {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  padding-bottom: 48px;
}
.pagination-row {
  flex: 0 0 auto;
  min-height: 66px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  border-top: 1px solid #edf1f6;
  color: #8b98aa;
  font-size: 13px;
}
.field-full {
  width: 100%;
}
.upload-file-item,
.detail-file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #50617a;
}
.upload-file-name,
.detail-file-item span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-type-icon {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  margin-right: 6px;
  object-fit: contain;
}
.remove-upload-file {
  flex: 0 0 auto;
  color: #f56c6c;
}
.upload-tip {
  margin: 8px 0 0;
  color: #93a2b7;
  font-size: 12px;
  line-height: 18px;
}
.readonly-status {
  height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 13px;
  border: 1px solid #dfe6ef;
  border-radius: 4px;
  color: #4d8567;
  background: #f1fbf5;
  box-sizing: border-box;
}
.drawer-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.drawer-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
.detail-hero {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #eff6ff;
  border-radius: 8px;
}
.hero-icon {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #2f86ed;
  border-radius: 8px;
  color: #fff;
  font-size: 20px;
}
.hero-icon img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}
.detail-hero h3 {
  max-width: 290px;
  margin: 4px 0;
  overflow: hidden;
  color: #172d4d;
  font-size: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.detail-hero small {
  color: #7b8da7;
}
.detail-hero .el-tag {
  margin-left: auto;
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 16px;
  border: 1px solid #e7edf5;
  border-radius: 7px;
  overflow: hidden;
}
.detail-grid span {
  min-height: 66px;
  padding: 11px 13px;
  border-right: 1px solid #e7edf5;
  border-bottom: 1px solid #e7edf5;
  box-sizing: border-box;
}
.detail-grid span:nth-child(2n) {
  border-right: 0;
}
.detail-grid small,
.detail-grid b {
  display: block;
}
.detail-grid small {
  color: #93a2b7;
  font-size: 12px;
}
.detail-grid b {
  margin-top: 7px;
  color: #40536f;
  font-size: 14px;
  word-break: break-all;
}
.detail-section {
  margin-top: 20px;
}
.detail-section h4 {
  margin: 0 0 12px;
  color: #2e405d;
  font-size: 15px;
}
.detail-section p {
  margin: 0;
  padding: 14px;
  color: #536780;
  line-height: 22px;
  white-space: pre-wrap;
  background: #f8fafc;
  border-radius: 6px;
}
.detail-files {
  padding: 4px 14px;
  border-radius: 6px;
  background: #f8fafc;
}
.detail-file-item {
  min-height: 38px;
  border-bottom: 1px solid #e8eef6;
}
.detail-file-item:last-child {
  border-bottom: 0;
}
.attachment-download-link {
  appearance: none;
  display: inline-flex;
  min-width: 0;
  max-width: 100%;
  min-height: 24px;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 2px;
  background: transparent;
  box-shadow: none;
  color: #3387ee;
  cursor: pointer;
  font: inherit;
  line-height: 22px;
  text-align: left;
  transition: color 180ms ease;
}
.attachment-download-link:hover,
.attachment-download-link:focus {
  background: transparent;
  box-shadow: none;
  color: #2678dc;
  text-decoration: underline;
  text-underline-offset: 3px;
  transform: none;
}
.attachment-download-link:focus:not(:focus-visible) {
  outline: none;
}
.attachment-download-link:focus-visible {
  outline: 2px solid #3387ee;
  outline-offset: 3px;
}
.attachment-download-link:disabled,
.attachment-download-link:disabled:hover,
.attachment-download-link:disabled:focus {
  background: transparent;
  box-shadow: none;
  color: #9aa9bc;
  cursor: not-allowed;
  opacity: 0.55;
  text-decoration: none;
  transform: none;
}
.attachment-download-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
@media (max-width: 1100px) {
  .communication-grid {
    grid-template-columns: repeat(2, minmax(260px, 1fr));
  }
}
@media (max-width: 760px) {
  .attachment-download-link {
    min-height: 44px;
  }
  .communication-board {
    min-height: 100dvh;
    height: auto;
    padding: 8px 8px calc(84px + env(safe-area-inset-bottom));
    overflow: visible;
  }
  .board-statistics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-bottom: 8px;
  }
  .stat-card {
    min-height: 82px;
    padding: 12px;
    gap: 9px;
  }
  .stat-icon {
    width: 34px;
    height: 34px;
    flex-basis: 34px;
    font-size: 16px;
  }
  .stat-card b {
    font-size: 20px;
  }
  .communication-surface {
    min-height: calc(100dvh - 24px);
  }
  .list-toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    min-height: auto;
    padding: 12px;
    gap: 10px;
  }
  .list-toolbar .el-input {
    width: 100%;
    grid-column: 1 / -1;
  }
  .list-toolbar .el-select {
    width: 100%;
  }
  .toolbar-actions {
    grid-column: 1 / -1;
    width: 100%;
    margin-left: 0;
  }
  .toolbar-actions .el-button {
    width: 100%;
    min-height: 42px;
  }
  .communication-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
    padding: 12px;
  }
  .communication-card {
    min-height: 224px;
    padding: 16px;
  }
  .card-foot {
    display: block;
  }
  .card-actions {
    justify-content: flex-end;
    margin-top: 8px;
  }
  .pagination-row {
    min-height: 58px;
    padding: 0 12px;
    gap: 8px;
  }
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .detail-grid span,
  .detail-grid span:nth-child(2n) {
    border-right: 0;
  }
  .detail-grid span:last-child {
    border-bottom: 0;
  }
  ::v-deep .communication-detail-drawer {
    width: 100% !important;
    max-width: 100% !important;
  }
  ::v-deep .communication-detail-drawer .el-drawer__body {
    display: flex;
    min-height: 0;
    flex: 1 1 auto;
    overflow: hidden;
  }
  .drawer-layout {
    min-height: 0;
    height: 100%;
    width: 100%;
  }
  .drawer-scroll {
    min-height: 0;
    padding: 14px;
    -webkit-overflow-scrolling: touch;
  }
  ::v-deep .communication-form-dialog {
    width: 100% !important;
    min-width: 0;
    height: 100dvh;
    margin: 0 !important;
    display: flex;
    flex-direction: column;
    border-radius: 0;
  }
  ::v-deep .communication-form-dialog .el-dialog__body {
    min-height: 0;
    flex: 1 1 auto;
    overflow-y: auto;
    padding: 18px 16px;
    -webkit-overflow-scrolling: touch;
  }
  ::v-deep .communication-form-dialog .el-dialog__footer {
    flex: 0 0 auto;
    padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  }
  ::v-deep .communication-form-dialog .dialog-footer {
    display: flex;
    gap: 10px;
  }
  ::v-deep .communication-form-dialog .dialog-footer .el-button {
    flex: 1;
    margin: 0;
    min-height: 42px;
  }
}
@media (max-width: 420px) {
  .list-toolbar {
    grid-template-columns: minmax(0, 1fr);
  }
  .list-toolbar .el-select {
    grid-column: 1 / -1;
  }
}
/* 仅本看板在移动端承载页面滚动，避免改动后台配置页的全局路由高度。 */
@media (max-width: 760px) {
  .communication-board {
    height: 100% !important;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
    touch-action: pan-y;
  }
}
</style>
<style scoped>
/* 与办事大厅看板保持一致的列表基线 */
.communication-board {
  min-height: 100%;
  padding: 12px;
  box-sizing: border-box;
  background: #f6f8fb;
}
.communication-board .board-statistics {
  gap: 12px;
  margin-bottom: 12px;
}
.communication-board .stat-card {
  min-height: 94px;
  padding: 16px 18px;
  border-color: #e5ebf2;
  border-radius: 10px;
  box-shadow: none;
}
.communication-surface {
  min-height: clamp(660px, calc(100vh - 250px), 760px);
  border-color: #e5ebf2;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.035);
}
.communication-board .list-toolbar {
  min-height: 64px;
  padding: 14px 20px;
  gap: 10px;
}
.communication-board .list-toolbar .el-input {
  width: 300px;
}
.communication-board .list-toolbar .el-select {
  width: 160px;
}
.communication-grid {
  gap: 14px;
  padding: 2px 20px 18px;
}
.communication-card {
  min-height: 252px;
  padding: 16px;
  border-color: #e6ecf3;
  border-radius: 10px;
}
.communication-card:hover {
  border-color: #a9caf7;
}
.communication-board .empty-state {
  min-height: 260px;
  padding: 24px 20px 48px;
  box-sizing: border-box;
}
.communication-board .pagination-row {
  min-height: 0;
  margin-top: auto;
  padding: 12px 20px 16px;
}
@media (max-width: 760px) {
  .communication-board {
    height: 100% !important;
    min-height: 0;
    padding: 14px 12px calc(24px + env(safe-area-inset-bottom));
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
    touch-action: pan-y;
  }
  .communication-board .board-statistics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .communication-board .stat-card {
    min-height: 82px;
    padding: 12px;
  }
  .communication-surface {
    min-height: 440px;
  }
  .communication-board .list-toolbar {
    padding: 12px;
  }
  .communication-board .list-toolbar .el-input {
    width: 100%;
  }
  .communication-board .list-toolbar .el-select {
    width: calc(50% - 5px);
  }
  .communication-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
    padding: 2px 12px 14px;
  }
  .communication-card {
    min-height: 238px;
  }
  .communication-board .pagination-row {
    justify-content: center;
    padding: 12px;
  }
}
</style>
