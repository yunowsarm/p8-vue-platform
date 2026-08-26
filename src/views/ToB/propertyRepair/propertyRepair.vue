<!-- 物业报修业务页面：负责报修申请、进度查询、详情展示与附件下载。 -->
<template>
  <main class="property-repair-page">
    <section class="repair-summary">
      <article v-for="item in summaryCards" :key="item.title" class="summary-card">
        <span class="summary-icon" :class="item.color"><i :class="item.icon"></i></span>
        <div>
          <small>{{ item.title }}</small>
          <b>
            {{ item.value }}
            <em>条</em>
          </b>
          <p>{{ item.note }}</p>
        </div>
      </article>
    </section>

    <section v-loading="loading" class="repair-surface">
      <div class="repair-toolbar">
        <el-input v-model.trim="keyword" clearable size="small" prefix-icon="el-icon-search" placeholder="搜索单号、类型、地点或联系人" @input="reload" @clear="reload" />
        <el-select v-model="typeFilter" clearable size="small" placeholder="全部报修类型" @change="reload">
          <el-option v-for="item in repairTypes" :key="item" :label="item" :value="item" />
        </el-select>
        <el-select v-model="statusFilter" clearable size="small" placeholder="全部状态" @change="reload">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <div class="toolbar-actions">
          <el-button v-if="selectedIds.length" type="danger" plain size="small" @click="removeSelected">批量删除（{{ selectedIds.length }}）</el-button>
          <el-button type="primary" size="small" icon="el-icon-plus" @click="openCreate">新增物业报修</el-button>
        </div>
      </div>

      <div v-if="records.length" class="repair-grid">
        <article v-for="item in records" :key="item.id" class="repair-card" @click="openDetail(item)">
          <div class="card-head">
            <span class="repair-code">
              <i class="el-icon-document"></i>
              {{ repairCode(item) }}
            </span>
            <div class="card-status">
              <el-tag :type="statusType(statusText(item))" size="small">{{ statusText(item) }}</el-tag>
              <el-checkbox v-model="selectedIds" :label="item.id" aria-label="选择该报修记录" @click.stop @click.native.stop @mousedown.native.stop>
                <span class="selection-label">选择</span>
              </el-checkbox>
            </div>
          </div>
          <div class="card-title">
            <strong>
              <img class="repair-type-icon" :src="repairTypeIcon(item.type)" alt="" />
              {{ item.type || '物业报修' }}
            </strong>
            <time>{{ displayTime(item) }}</time>
          </div>
          <p class="repair-content">{{ item.description || '暂无描述' }}</p>
          <div class="repair-info">
            <span>
              <i class="el-icon-location-outline"></i>
              {{ item.location || '-' }}
            </span>
            <span>
              <i class="el-icon-user"></i>
              {{ item.contactName || '-' }}
            </span>
            <span>
              <i class="el-icon-phone-outline"></i>
              {{ item.contactPhone || '-' }}
            </span>
          </div>
          <div class="card-foot">
            <span>{{ statusHint(statusText(item)) }}</span>
            <div>
              <el-button type="text" size="mini" @click.stop="openDetail(item)">查看详情</el-button>
              <el-button type="text" size="mini" @click.stop="openEdit(item)">编辑</el-button>
              <el-button type="text" size="mini" class="danger-action" @click.stop="removeRecord(item)">删除</el-button>
            </div>
          </div>
        </article>
      </div>
      <el-empty v-else class="empty-state" description="暂无符合筛选条件的物业报修" />
      <div v-if="total" class="pagination-row">
        <span>共 {{ total }} 条</span>
        <el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="total" layout="prev, pager, next" @current-change="loadRecords" />
      </div>
    </section>

    <el-dialog :title="formTitle" :visible.sync="formVisible" top="4vh" append-to-body :close-on-click-modal="false" custom-class="property-repair-dialog" @closed="resetForm">
      <el-form ref="repairForm" :model="form" :rules="rules" label-width="96px">
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12">
            <el-form-item label="报修类型" prop="type">
              <el-select v-model="form.type" clearable placeholder="请选择报修类型" class="field-full">
                <el-option v-for="item in repairTypes" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="报修地点" prop="location"><el-input v-model.trim="form.location" placeholder="如 A 栋 3 楼 301 室" /></el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="联系人" prop="contactName"><el-input v-model.trim="form.contactName" placeholder="请输入联系人" /></el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="联系电话" prop="contactPhone"><el-input v-model.trim="form.contactPhone" placeholder="请输入联系电话" /></el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述" prop="description">
              <el-input v-model.trim="form.description" type="textarea" :rows="6" maxlength="500" show-word-limit placeholder="请详细描述故障现象、影响范围及相关情况" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="附件">
              <el-upload ref="imageUpload" action="#" name="thefile" :auto-upload="false" :file-list="form.uploadFiles" :limit="9" :on-change="handleImageChange" :on-remove="handleImageRemove">
                <el-button size="small" type="primary">选择文件</el-button>
                <div slot="file" slot-scope="{ file }" class="upload-file-item">
                  <button
                    v-if="file.id"
                    type="button"
                    class="attachment-download-link"
                    :title="file.name || file.fileName || '附件'"
                    :aria-label="`下载附件：${file.name || file.fileName || '附件'}`"
                    @click="handleImageDownload(file)">
                    <img class="attachment-file-icon" :src="fileIcon(file)" alt="" aria-hidden="true" />
                    <span class="attachment-download-label">{{ file.name || file.fileName || '附件' }}</span>
                  </button>
                  <span v-else class="upload-file-name">
                    <i class="el-icon-picture-outline"></i>
                    {{ file.name || file.fileName }}
                  </span>
                  <el-button class="remove-upload-file" type="text" icon="el-icon-delete" title="删除文件" @click="removeUploadFile(file)"></el-button>
                </div>
              </el-upload>
              <p class="upload-tip">单个文件不超过 10MB，最多上传 9 个。</p>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="状态"><el-input :value="statusText(form)" disabled /></el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">{{ editingId ? '保存修改' : '提交报修' }}</el-button>
      </span>
    </el-dialog>

    <el-drawer title="物业报修详情" :visible.sync="detailVisible" size="500px" append-to-body :lock-scroll="true" custom-class="property-repair-drawer">
      <div v-if="selectedRecord" class="drawer-layout">
        <div class="drawer-scroll">
          <div class="detail-hero">
            <span class="detail-type-icon"><img :src="repairTypeIcon(selectedRecord.type)" alt="" /></span>
            <div>
              <small>{{ repairCode(selectedRecord) }}</small>
              <h3>{{ selectedRecord.type || '物业报修' }}</h3>
              <p>{{ displayTime(selectedRecord) }}</p>
            </div>
            <el-tag :type="statusType(statusText(selectedRecord))">{{ statusText(selectedRecord) }}</el-tag>
          </div>
          <div class="detail-grid">
            <span v-for="field in detailFields" :key="field.key">
              <small>{{ field.label }}</small>
              <b>{{ detailValue(field.key) }}</b>
            </span>
          </div>
          <section class="detail-section">
            <h4>报修描述</h4>
            <p>{{ selectedRecord.description || '暂无描述' }}</p>
          </section>
          <section class="detail-section">
            <h4>处理前附件</h4>
            <div v-if="detailBeforeFiles.length" class="detail-files">
              <div v-for="file in detailBeforeFiles" :key="file.uid || file.id || file.filePath || file.fileName" class="detail-file-item">
                <button
                  type="button"
                  class="attachment-download-link"
                  :disabled="!file.id"
                  :title="file.name || file.fileName || '附件'"
                  :aria-label="`下载附件：${file.name || file.fileName || '附件'}`"
                  @click="handleImageDownload(file)">
                  <img class="attachment-file-icon" :src="fileIcon(file)" alt="" aria-hidden="true" />
                  <span class="attachment-download-label">{{ file.name || file.fileName || '附件' }}</span>
                </button>
              </div>
            </div>
            <p v-else>暂无附件</p>
          </section>
          <section class="detail-section">
            <h4>处理后附件</h4>
            <div v-if="detailAfterFiles.length" class="detail-files">
              <div v-for="file in detailAfterFiles" :key="file.uid || file.id || file.filePath || file.fileName" class="detail-file-item">
                <button
                  type="button"
                  class="attachment-download-link"
                  :disabled="!file.id"
                  :title="file.name || file.fileName || '附件'"
                  :aria-label="`下载附件：${file.name || file.fileName || '附件'}`"
                  @click="handleImageDownload(file)">
                  <img class="attachment-file-icon" :src="fileIcon(file)" alt="" aria-hidden="true" />
                  <span class="attachment-download-label">{{ file.name || file.fileName || '附件' }}</span>
                </button>
              </div>
            </div>
            <p v-else>暂无附件</p>
          </section>
          <section class="detail-section">
            <h4>处理进度</h4>
            <div class="repair-timeline">
              <div v-for="(step, index) in timelineSteps" :key="step.title" :class="['timeline-item', { done: progressIndex >= index }]">
                <span></span>
                <div>
                  <b>{{ step.title }}</b>
                  <small>{{ step.note }}</small>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div class="drawer-actions">
          <el-button type="primary" @click="openEdit(selectedRecord)">编辑</el-button>
        </div>
      </div>
    </el-drawer>
  </main>
</template>

<script>
import { getFileTypeIcon } from '@/utils/fileTypeIcon'
import repairTypeIcon from './repairTypeIcons'

export default {
  name: 'PropertyRepair',
  data() {
    return {
      loading: false,
      submitting: false,
      records: [],
      total: 0,
      currentPage: 1,
      pageSize: 6,
      keyword: '',
      typeFilter: '',
      statusFilter: '',
      selectedIds: [],
      formVisible: false,
      detailVisible: false,
      editingId: '',
      selectedRecord: null,
      form: {},
      repairTypes: ['水电维修', '门窗维修', '空调维修', '网络维修', '设备维修', '公共设施', '其他'],
      statusOptions: [
        { label: '待处理', value: 0 },
        { label: '处理中', value: 1 },
        { label: '已完成', value: 2 }
      ],
      rules: {
        type: [{ required: true, message: '请选择报修类型', trigger: 'change' }],
        location: [{ required: true, message: '请输入报修地点', trigger: 'blur' }],
        contactName: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
        contactPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
        description: [{ required: true, message: '请输入报修描述', trigger: 'blur' }]
      }
    }
  },
  computed: {
    summaryCards() {
      const list = this.records
      const waiting = list.filter((item) => this.statusValue(item.status) === 0).length
      const processing = list.filter((item) => this.statusValue(item.status) === 1).length
      const complete = list.filter((item) => this.statusValue(item.status) === 2).length
      return [
        { title: '报修申请', value: this.total, note: '当前查询条件下的记录', icon: 'el-icon-document', color: 'blue' },
        { title: '待处理', value: waiting, note: '等待物业人员处理', icon: 'el-icon-time', color: 'orange' },
        { title: '处理中', value: processing, note: '正在持续跟进', icon: 'el-icon-sort', color: 'cyan' },
        { title: '已办结', value: complete, note: '处理结果已留痕', icon: 'el-icon-circle-check', color: 'green' }
      ]
    },
    formTitle() {
      return this.editingId ? '编辑物业报修' : '新建物业报修'
    },
    detailFields() {
      return [
        { label: '报修单号', key: 'code' },
        { label: '报修类型', key: 'type' },
        { label: '报修地点', key: 'location' },
        { label: '联系人', key: 'contactName' },
        { label: '联系电话', key: 'contactPhone' },
        { label: '当前状态', key: 'status' }
      ]
    },
    timelineSteps() {
      return [
        { title: '待处理', note: '报修申请已登记' },
        { title: '处理中', note: '物业人员正在处理' },
        { title: '已完成', note: '报修处理完成' }
      ]
    },
    progressIndex() {
      return this.statusValue(this.selectedRecord && this.selectedRecord.status)
    },
    detailBeforeFiles() {
      return this.filesForRecord(this.selectedRecord, 'file1')
    },
    detailAfterFiles() {
      return this.filesForRecord(this.selectedRecord, 'file2')
    }
  },
  created() {
    this.form = this.emptyForm()
    this.loadRecords()
  },
  methods: {
    repairTypeIcon,
    fileIcon(file) {
      return getFileTypeIcon(file)
    },
    unwrap(response) {
      // 报修记录自身也有 result 字段（可能为 null），不能将其误识别为接口包装。
      if (response && !response.id && response.result !== undefined && response.result !== null) return response.result
      if (response && response.data && !response.data.id && response.data.result !== undefined && response.data.result !== null) return response.data.result
      return response && response.data !== undefined ? response.data : response
    },
    async loadRecords() {
      if (!this.$api || !this.$api['reportRepair.list']) return
      this.loading = true
      try {
        const params = {
          pageNo: this.currentPage,
          pageSize: this.pageSize,
          keyword: this.keyword || undefined,
          status: this.statusFilter === '' ? undefined : this.statusFilter,
          type: 0 // 查看自己
        }
        const result = this.unwrap(await this.$api['reportRepair.list'](params)) || {}
        this.records = Array.isArray(result.records) ? result.records : Array.isArray(result.list) ? result.list : Array.isArray(result) ? result : []
        this.total = Number(result.total || this.records.length)
      } catch (error) {
        this.records = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },
    reload() {
      this.currentPage = 1
      this.loadRecords()
    },
    emptyForm() {
      return { type: '', description: '', location: '', contactName: '', contactPhone: '', status: 0, uploadFiles: [], delFile: [] }
    },
    repairCode(item) {
      return (item && (item.code || item.id)) || '-'
    },
    statusValue(status) {
      if (status === undefined || status === null || status === '') return 0
      if (status === 0 || status === '0' || status === '待处理' || status === '等待处理') return 0
      if (status === 1 || status === '1' || status === '处理中' || status === '已受理') return 1
      return 2
    },
    statusText(item) {
      return ['待处理', '处理中', '已完成'][this.statusValue(item && item.status)]
    },
    displayTime(item) {
      return (item && (item.repairTime || item.createTime || item.itemCreateTime || item.updateTime || item.itemUpdateTime)) || '-'
    },
    statusType(status) {
      return { 待处理: 'warning', 处理中: '', 已完成: 'success' }[status] || 'info'
    },
    statusHint(status) {
      return { 待处理: '等待物业人员处理', 处理中: '正在持续跟进', 已完成: '处理结果已留痕' }[status] || '状态待更新'
    },
    currentUserId() {
      try {
        const userInfo = JSON.parse(window.sessionStorage.getItem('userInfo') || '{}')
        return userInfo.id || ''
      } catch (error) {
        return ''
      }
    },
    formatDateTime(date) {
      const pad = (value) => String(value).padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    },
    openCreate() {
      this.editingId = ''
      this.form = this.emptyForm()
      this.formVisible = true
      this.$nextTick(() => this.$refs.repairForm && this.$refs.repairForm.clearValidate())
    },
    async openEdit(record) {
      this.editingId = record.id
      let detail = record
      if (this.$api && this.$api['reportRepair.queryById']) {
        try {
          detail = this.unwrap(await this.$api['reportRepair.queryById']({ id: record.id })) || record
        } catch (error) {}
      }
      const uploadFiles = this.componentUploadFiles(detail)
      this.form = Object.assign(this.emptyForm(), detail, {
        status: this.statusValue(detail.status),
        uploadFiles,
        delFile: []
      })
      this.detailVisible = false
      this.formVisible = true
      this.$nextTick(() => this.$refs.repairForm && this.$refs.repairForm.clearValidate())
    },
    resetForm() {
      this.form = this.emptyForm()
      this.editingId = ''
      this.submitting = false
    },
    submitForm() {
      this.$refs.repairForm.validate((valid) => {
        if (valid) this.saveRecord()
      })
    },
    async saveRecord() {
      const action = this.editingId ? 'edit' : 'add'
      if (!this.$api || !this.$api[`reportRepair.${action}`]) return
      this.submitting = true
      try {
        const uploadFiles = this.normalizeUploadFiles(this.form.uploadFiles).map((file) => this.cleanUploadFile(file))
        const now = this.formatDateTime(new Date())
        const userId = this.currentUserId()
        const auditFields = this.editingId ? { updateBy: userId, itemUpdateTime: now } : { createBy: userId, itemCreateTime: now }
        const payload = Object.assign({}, this.form, { fileType: 0, uploadFiles }, auditFields, this.editingId ? { id: this.editingId } : {})
        await this.$api[`reportRepair.${action}`](payload)
        this.$message.success(this.editingId ? '修改成功' : '物业报修已提交')
        this.formVisible = false
        this.reload()
      } catch (error) {
        this.$message.error('提交失败，请稍后重试')
      } finally {
        this.submitting = false
      }
    },
    async openDetail(item) {
      this.selectedRecord = item
      this.detailVisible = true
      if (!this.$api || !this.$api['reportRepair.queryById']) return
      try {
        const result = this.unwrap(await this.$api['reportRepair.queryById']({ id: item.id }))
        if (result) this.selectedRecord = result
      } catch (error) {}
    },
    async removeRecord(item) {
      try {
        await this.$confirm('删除后不可恢复，是否继续？', '确认删除', { type: 'warning' })
        await this.$api['reportRepair.delete']({ id: item.id })
        this.selectedIds = this.selectedIds.filter((id) => id !== item.id)
        this.$message.success('删除成功')
        if (this.records.length === 1 && this.currentPage > 1) this.currentPage -= 1
        this.loadRecords()
      } catch (error) {
        if (error !== 'cancel') this.$message.error('删除失败，请稍后重试')
      }
    },
    async removeSelected() {
      const ids = this.selectedIds.slice()
      if (!ids.length) return
      try {
        await this.$confirm(`确定删除已选的 ${ids.length} 条报修吗？`, '确认批量删除', { type: 'warning' })
        await Promise.all(ids.map((id) => this.$api['reportRepair.delete']({ id })))
        this.selectedIds = []
        this.$message.success('批量删除成功')
        this.loadRecords()
      } catch (error) {
        if (error !== 'cancel') this.$message.error('批量删除失败，请稍后重试')
      }
    },
    detailValue(key) {
      if (key === 'code') return this.repairCode(this.selectedRecord)
      if (key === 'status') return this.statusText(this.selectedRecord)
      return this.selectedRecord[key] || '-'
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
      if (!Array.isArray(files)) return []
      return files.map((item, index) => {
        const file = typeof item === 'string' ? { fileName: item, filePath: item } : item || {}
        return Object.assign({}, file, {
          name: file.name || file.fileName || `图片附件${index + 1}`,
          url: file.url || '',
          status: file.status || (file.filePath ? 'success' : 'ready'),
          uid: file.uid || file.filePath || `repair-image-${index}`
        })
      })
    },
    componentUploadFiles(record) {
      return this.filesForRecord(record, 'file1')
    },
    filesForRecord(record, pathField) {
      const filePaths = this.filePathList(record && record[pathField])
      if (!filePaths.length) return []
      return this.normalizeUploadFiles(record && record.uploadFiles).filter((file) => filePaths.includes(file.filePath))
    },
    filePathList(value) {
      if (!value) return []
      return String(value)
        .split(/[,，]/)
        .map((filePath) => filePath.trim())
        .filter(Boolean)
    },
    async handleImageChange(file, fileList) {
      const raw = file.raw
      const isWithinSize = raw ? raw.size <= 10 * 1024 * 1024 : true
      if (!isWithinSize) {
        this.$message.error('单个文件不能超过 10MB')
        const validFiles = fileList.filter((item) => item.uid !== file.uid)
        this.form.uploadFiles = this.normalizeUploadFiles(validFiles)
        this.$nextTick(() => this.$refs.imageUpload && this.$refs.imageUpload.handleRemove(file))
        return
      }
      // 选择文件后立即上传；提交报修时仅提交已上传的附件信息。
      if (file.filePath || !raw) {
        this.form.uploadFiles = this.normalizeUploadFiles(fileList)
        return
      }
      if (!this.$api || !this.$api['attachment.upload']) {
        this.$message.error('未找到附件上传接口')
        this.$refs.imageUpload && this.$refs.imageUpload.handleRemove(file)
        return
      }
      file.status = 'uploading'
      try {
        const formData = new FormData()
        // Element Upload 的 raw 即浏览器 File 对象，直接以二进制文件加入表单。
        formData.append('thefile', raw)
        const response = await this.$api['attachment.upload'](formData)
        const data = this.getUploadResult(response)
        if (!data.filePath) throw new Error('附件上传未返回 filePath')
        Object.assign(file, {
          fileName: data.fileName || file.name,
          filePath: data.filePath,
          fileType: data.fileType || raw.type || '',
          name: data.fileName || file.name,
          status: 'success',
          url: data.url || data.fileUrl || ''
        })
        this.form.uploadFiles = this.normalizeUploadFiles(fileList)
      } catch (error) {
        this.$message.error('图片上传失败，请重试')
        this.$refs.imageUpload && this.$refs.imageUpload.handleRemove(file)
        this.form.uploadFiles = this.normalizeUploadFiles(fileList.filter((item) => item.uid !== file.uid))
      }
    },
    handleImageRemove(file, fileList) {
      if (file && file.id && !this.form.delFile.some((item) => item.id === file.id)) {
        this.form.delFile.push(file)
      }
      this.form.uploadFiles = this.normalizeUploadFiles(fileList)
    },
    removeUploadFile(file) {
      if (this.$refs.imageUpload) this.$refs.imageUpload.handleRemove(file)
    },
    async handleImageDownload(file) {
      if (file.id && this.$api && this.$api['attachment.download']) {
        try {
          const response = await this.$api['attachment.download']({ attachmentId: file.id }, { responseType: 'blob' })
          const url = URL.createObjectURL(new Blob([response.data], { type: file.fileType || 'image/*' }))
          const link = document.createElement('a')
          link.href = url
          link.download = file.name || file.fileName || '附件'
          link.click()
          URL.revokeObjectURL(url)
        } catch (error) {
          this.$message.error('文件下载失败，请稍后重试')
        }
      }
    },
    cleanUploadFile(file) {
      return {
        fileName: file.fileName || file.name,
        filePath: this.cleanFilePath(file.filePath),
        name: file.name || file.fileName,
        status: 'success',
        uid: file.uid || Date.now()
      }
    },
    cleanFilePath(filePath) {
      if (!filePath) return filePath
      const segments = String(filePath).split('/').filter(Boolean)
      return segments.length ? segments[segments.length - 1] : filePath
    },
    getUploadResult(response) {
      // /attachment/upload 固定返回 { head, data: [附件信息] }；
      // axios 拦截器会将该响应解包为 data 数组。
      const files = Array.isArray(response) ? response : response && response.data
      return Array.isArray(files) ? files[0] || {} : {}
    }
  }
}
</script>

<style lang="scss" scoped>
.property-repair-page {
  min-height: 100%;
  padding: 20px 18px 34px;
  box-sizing: border-box;
  background: #f6f8fb;
  color: #263a55;
}
.repair-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}
.summary-card {
  display: flex;
  align-items: center;
  min-height: 94px;
  padding: 16px 18px;
  gap: 12px;
  border: 1px solid #e5ebf2;
  border-radius: 10px;
  background: #fff;
  box-sizing: border-box;
}
.summary-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  border-radius: 12px;
  font-size: 18px;
}
.blue {
  background: #e8f0ff;
  color: #2d78df;
}
.orange {
  background: #fff1df;
  color: #e99524;
}
.cyan {
  background: #e5f8fb;
  color: #129fb6;
}
.green {
  background: #e6f8ef;
  color: #20a36b;
}
.summary-card small {
  display: block;
  color: #8190a3;
  font-size: 13px;
}
.summary-card b {
  display: block;
  margin-top: 3px;
  color: #24364d;
  font-size: 23px;
  line-height: 1.1;
}
.summary-card em {
  margin-left: 3px;
  color: #7b899c;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
}
.summary-card p {
  margin: 5px 0 0;
  color: #99a5b4;
  font-size: 12px;
}
.repair-surface {
  display: flex;
  min-height: clamp(600px, calc(100vh - 250px), 760px);
  border: 1px solid #e5ebf2;
  border-radius: 10px;
  background: #fff;
  flex-direction: column;
}
.repair-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-bottom: 1px solid #eef2f6;
}
.repair-toolbar .el-input {
  width: 300px;
}
.repair-toolbar .el-select {
  width: 160px;
}
.toolbar-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}
.repair-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  padding: 16px 20px 18px;
}
.repair-card {
  display: flex;
  min-width: 0;
  min-height: 250px;
  padding: 16px;
  border: 1px solid #e6ecf3;
  border-radius: 10px;
  background: #fff;
  box-sizing: border-box;
  cursor: pointer;
  flex-direction: column;
  transition: border-color 0.2s;
}
.repair-card:hover {
  border-color: #a9caf7;
}
.card-head,
.card-title,
.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.repair-code {
  overflow: hidden;
  color: #69809c;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.repair-code i {
  margin-right: 4px;
  color: #2e7cdf;
}
.card-title strong {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}
.repair-type-icon {
  width: 20px;
  height: 20px;
  margin-right: 6px;
  object-fit: contain;
  flex: 0 0 auto;
}
.card-status {
  display: flex;
  align-items: center;
  gap: 6px;
}
.card-status .el-checkbox {
  margin: 0;
}
.selection-label {
  display: none;
}
.card-title {
  align-items: flex-start;
  margin-top: 12px;
  color: #344f72;
  font-size: 15px;
}
.card-title time {
  color: #98a4b3;
  font-size: 12px;
  text-align: right;
}
.repair-content {
  display: -webkit-box;
  overflow: hidden;
  margin: 12px 0;
  color: #485d77;
  font-size: 14px;
  line-height: 1.65;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
.repair-info {
  display: flex;
  flex-wrap: wrap;
  gap: 7px 12px;
  margin-top: auto;
  padding-top: 11px;
  border-top: 1px solid #eef2f6;
  color: #7b8a9c;
  font-size: 12px;
}
.repair-info i {
  margin-right: 3px;
  color: #97a9bd;
}
.card-foot {
  margin-top: 11px;
  color: #9a7a43;
  font-size: 12px;
}
.card-foot div {
  margin-left: auto;
  white-space: nowrap;
}
.card-foot .el-button {
  margin-left: 2px;
  padding: 4px 3px;
}
.danger-action {
  color: #f56c6c;
}
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  padding: 24px;
  flex: 1;
}
.pagination-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: auto;
  padding: 12px 20px 16px;
  border-top: 1px solid #eef2f6;
  color: #8996a6;
  font-size: 12px;
}
.field-full {
  width: 100%;
}
.upload-tip {
  margin: 8px 0 0;
  color: #98a4b3;
  font-size: 12px;
  line-height: 1.5;
}
.upload-file-item,
.detail-file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.remove-upload-file {
  margin-left: auto;
  padding: 4px;
  color: #a1afbf;
}
.remove-upload-file:hover {
  color: #f56c6c;
}
.upload-file-name,
.detail-file-item span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.upload-file-name i,
.detail-file-item i {
  margin-right: 6px;
  color: #5d9cec;
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
.attachment-file-icon {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  object-fit: contain;
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
@media (max-width: 1200px) {
  .repair-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 760px) {
  .attachment-download-link {
    min-height: 44px;
  }
  .property-repair-page {
    height: 100%;
    min-height: 0;
    padding: 14px 12px 24px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  .repair-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 12px;
  }
  .summary-card {
    min-height: 88px;
    padding: 13px 12px;
  }
  .repair-surface {
    min-height: 440px;
  }
  .repair-toolbar {
    align-items: stretch;
    flex-wrap: wrap;
    padding: 12px;
  }
  .repair-toolbar .el-input {
    width: 100%;
  }
  .repair-toolbar .el-select {
    width: calc(50% - 5px);
  }
  .toolbar-actions {
    width: 100%;
  }
  .toolbar-actions .el-button {
    flex: 1;
    min-height: 38px;
  }
  .repair-grid {
    grid-template-columns: 1fr;
    padding: 12px;
  }
  .pagination-row {
    justify-content: center;
    padding: 12px;
  }
}
@media (max-width: 460px) {
  .repair-summary {
    grid-template-columns: 1fr;
  }
  .repair-toolbar .el-select {
    width: 100%;
  }
}
</style>

<style lang="scss">
.property-repair-dialog {
  min-width: 680px;
  margin-bottom: 0;
}
.property-repair-dialog .el-dialog__header {
  padding: 17px 20px;
  border-bottom: 1px solid #e5e9ef;
}
.property-repair-dialog .el-dialog__body {
  min-height: 42vh;
  padding: 26px 36px 32px;
}
.property-repair-dialog .el-dialog__footer {
  padding: 14px 20px;
  border-top: 1px solid #e5e9ef;
}
.property-repair-dialog .el-form-item {
  margin-bottom: 22px;
}
.property-repair-dialog .el-input__inner {
  height: 40px;
}
.property-repair-drawer .el-drawer__header {
  margin-bottom: 0;
  padding: 18px 20px;
  border-bottom: 1px solid #e8edf3;
  color: #273b56;
}
.drawer-layout {
  display: flex;
  height: calc(100vh - 62px);
  flex-direction: column;
}
.drawer-scroll {
  overflow-y: auto;
  flex: 1;
  padding: 18px;
}
.detail-hero {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 9px;
  background: #eff5ff;
}
.detail-hero > span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 9px;
  background: #fff;
}
.detail-type-icon img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
.detail-hero > div {
  min-width: 0;
  flex: 1;
}
.detail-hero small,
.detail-hero p {
  color: #7d91aa;
  font-size: 12px;
}
.detail-hero h3 {
  margin: 3px 0;
  color: #294260;
  font-size: 16px;
}
.detail-hero p {
  margin: 0;
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 14px;
  border-top: 1px solid #e4eaf1;
  border-left: 1px solid #e4eaf1;
}
.detail-grid span {
  min-height: 67px;
  padding: 12px;
  border-right: 1px solid #e4eaf1;
  border-bottom: 1px solid #e4eaf1;
  box-sizing: border-box;
}
.detail-grid small,
.detail-grid b {
  display: block;
}
.detail-grid small {
  color: #8795a7;
  font-size: 12px;
}
.detail-grid b {
  margin-top: 5px;
  color: #3a4f6a;
  font-size: 13px;
  word-break: break-word;
}
.detail-section {
  margin-top: 20px;
}
.detail-section h4 {
  margin: 0 0 10px;
  color: #304660;
  font-size: 14px;
}
.detail-section > p {
  margin: 0;
  padding: 13px;
  border-radius: 6px;
  background: #f7f9fc;
  color: #556a84;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-line;
}
.detail-files {
  border: 1px solid #e5ebf2;
  border-radius: 7px;
}
.detail-file-item {
  min-height: 40px;
  padding: 0 12px;
  border-bottom: 1px solid #edf1f5;
  color: #556a84;
  font-size: 13px;
}
.detail-file-item:last-child {
  border-bottom: 0;
}
.repair-timeline {
  padding: 8px 0 0;
}
.timeline-item {
  position: relative;
  display: flex;
  gap: 11px;
  padding-bottom: 18px;
}
.timeline-item > span {
  position: relative;
  z-index: 1;
  width: 11px;
  height: 11px;
  margin-top: 3px;
  border: 2px solid #c6d0dd;
  border-radius: 50%;
  background: #fff;
  box-sizing: border-box;
}
.timeline-item:not(:last-child)::after {
  position: absolute;
  top: 13px;
  left: 5px;
  width: 1px;
  height: calc(100% - 8px);
  background: #dbe3ec;
  content: '';
}
.timeline-item.done > span {
  border-color: #2f7cdf;
  background: #2f7cdf;
}
.timeline-item b,
.timeline-item small {
  display: block;
}
.timeline-item b {
  color: #435971;
  font-size: 13px;
}
.timeline-item small {
  margin-top: 4px;
  color: #8d9aaa;
  font-size: 12px;
}
.drawer-actions {
  padding: 13px 20px;
  border-top: 1px solid #e7edf3;
  text-align: right;
}
@media (max-width: 760px) {
  .property-repair-dialog {
    display: flex;
    width: 100% !important;
    min-width: 0;
    height: 100vh;
    height: 100dvh;
    margin: 0 !important;
    border-radius: 0;
    flex-direction: column;
  }
  .property-repair-dialog .el-dialog__header,
  .property-repair-dialog .el-dialog__footer {
    flex: 0 0 auto;
  }
  .property-repair-dialog .el-dialog__body {
    min-height: 0;
    padding: 20px 16px;
    overflow-y: auto;
    flex: 1;
  }
  .property-repair-dialog .el-form-item__label {
    float: none;
    display: block;
    width: auto !important;
    margin-bottom: 8px;
    line-height: 1.2;
    text-align: left;
  }
  .property-repair-dialog .el-form-item__content {
    margin-left: 0 !important;
  }
  .property-repair-dialog .el-row {
    margin: 0 !important;
  }
  .property-repair-dialog .el-col {
    padding: 0 !important;
  }
  .property-repair-dialog .el-dialog__footer {
    padding: 12px 16px;
  }
  .property-repair-dialog .el-dialog__footer .el-button {
    min-width: 96px;
  }
  .property-repair-drawer {
    width: 100% !important;
  }
  .drawer-layout {
    height: calc(100vh - 58px);
  }
  .drawer-scroll {
    padding: 14px;
  }
  .drawer-actions {
    display: flex;
    gap: 10px;
    padding: 12px 14px;
  }
  .drawer-actions .el-button {
    flex: 1;
    margin: 0;
  }
}
</style>
