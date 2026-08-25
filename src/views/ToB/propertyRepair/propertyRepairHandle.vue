<template>
  <main class="repair-handle-page">
    <section class="handle-summary">
      <article v-for="card in summaryCards" :key="card.status" class="summary-card">
        <span :class="['summary-icon', card.tone]"><i :class="card.icon"></i></span>
        <div>
          <small>{{ card.title }}</small>
          <b>
            {{ card.value }}
            <em>条</em>
          </b>
          <p>{{ card.note }}</p>
        </div>
      </article>
    </section>

    <section v-loading="loading" class="handle-surface">
      <div class="handle-toolbar">
        <el-input v-model.trim="keyword" clearable size="small" prefix-icon="el-icon-search" placeholder="搜索单号、地点、联系人" @input="reload" @clear="reload" />
        <el-select v-model="statusFilter" clearable size="small" placeholder="全部状态" @change="reload">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select v-model="typeFilter" clearable size="small" placeholder="全部报修类型" @change="reload">
          <el-option v-for="item in repairTypes" :key="item" :label="item" :value="item" />
        </el-select>
        <el-button size="small" icon="el-icon-refresh" @click="loadRecords">刷新</el-button>
      </div>

      <el-table v-if="records.length" :data="records" height="100%" class="handle-table">
        <el-table-column label="工单编号" min-width="170">
          <template slot-scope="{ row }">
            <span class="order-code">{{ repairCode(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="报修类型" min-width="140">
          <template slot-scope="{ row }">
            <span class="repair-type-cell">
              <img :src="repairTypeIcon(row.type)" alt="" />
              {{ row.type || '物业报修' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="报修地点" min-width="160" show-overflow-tooltip />
        <el-table-column label="联系人" min-width="150">
          <template slot-scope="{ row }">
            {{ row.contactName || '-' }}
            <small class="cell-sub">{{ row.contactPhone || '' }}</small>
          </template>
        </el-table-column>
        <el-table-column label="处理人" min-width="120">
          <template slot-scope="{ row }">{{ handlerName(row) || '未指派' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="105">
          <template slot-scope="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" min-width="160">
          <template slot-scope="{ row }">{{ row.itemCreateTime || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" @click.stop="openDetail(row)">详情</el-button>
            <el-button v-if="statusValue(row.status) === 0" type="text" size="mini" @click.stop="openAssign(row)">指派并开始处理</el-button>
            <el-button v-if="statusValue(row.status) === 1" type="text" size="mini" class="complete-action" @click.stop="openComplete(row)">完成处理</el-button>
            <el-button v-if="statusValue(row.status) === 2" type="text" size="mini" @click.stop="openComplete(row, true)">修改</el-button>
            <el-button type="text" size="mini" class="delete-action" @click.stop="removeRecord(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="暂无符合条件的报修工单" />
      <div v-if="total" class="pagination-row">
        <span>共 {{ total }} 条</span>
        <el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="total" layout="prev, pager, next" @current-change="loadRecords" />
      </div>
    </section>

    <el-drawer title="报修工单处理" :visible.sync="detailVisible" size="560px" append-to-body custom-class="repair-handle-drawer">
      <div v-if="selectedRecord" class="drawer-layout">
        <div class="drawer-scroll">
          <div class="detail-hero">
            <span class="detail-type-icon"><img :src="repairTypeIcon(selectedRecord.type)" alt="" /></span>
            <div class="detail-hero-content">
              <small class="detail-code">
                <i class="el-icon-document"></i>
                工单编号 {{ repairCode(selectedRecord) }}
              </small>
              <h3>{{ selectedRecord.type || '物业报修' }}</h3>
              <p>
                <i class="el-icon-time"></i>
                {{ selectedRecord.itemCreateTime || '-' }}
              </p>
            </div>
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
            <div v-if="componentFiles.length" class="file-list">
              <button v-for="file in componentFiles" :key="file.id || file.filePath" type="button" class="file-link" :disabled="!file.id" @click="downloadFile(file)">
                <i class="el-icon-paperclip"></i>
                {{ file.fileName || file.name || '附件' }}
              </button>
            </div>
            <p v-else>暂无附件</p>
          </section>
          <section class="detail-section">
            <h4>处理后附件</h4>
            <div v-if="resultFiles.length" class="file-list">
              <button v-for="file in resultFiles" :key="file.id || file.filePath" type="button" class="file-link" :disabled="!file.id" @click="downloadFile(file)">
                <i class="el-icon-paperclip"></i>
                {{ file.fileName || file.name || '附件' }}
              </button>
            </div>
            <p v-else>暂无附件</p>
          </section>
          <section class="detail-section">
            <h4>处理信息</h4>
            <div class="process-info">
              <span>
                <small>处理人</small>
                <b>{{ handlerName(selectedRecord) || '未指派' }}</b>
              </span>
              <span>
                <small>处理结果</small>
                <b>{{ selectedRecord.RESULT || selectedRecord.handleResult || selectedRecord.result || '-' }}</b>
              </span>
              <span>
                <small>完成时间</small>
                <b>{{ selectedRecord.completeTime || '-' }}</b>
              </span>
            </div>
          </section>
          <section class="detail-section">
            <h4>处理进度</h4>
            <div class="process-timeline">
              <div v-for="(step, index) in timelineSteps" :key="step.title" :class="['timeline-item', { done: timelineIndex >= index }]">
                <i></i>
                <div>
                  <b>{{ step.title }}</b>
                  <small>{{ step.note }}</small>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div class="drawer-actions">
          <el-button @click="detailVisible = false">关闭</el-button>
          <el-button v-if="statusValue(selectedRecord.status) === 0" type="primary" @click="openAssign(selectedRecord)">指派并开始处理</el-button>
          <el-button v-if="statusValue(selectedRecord.status) === 1" type="primary" @click="openComplete(selectedRecord)">完成处理</el-button>
          <el-button v-if="statusValue(selectedRecord.status) === 2" type="primary" @click="openComplete(selectedRecord, true)">修改处理结果</el-button>
        </div>
      </div>
    </el-drawer>

    <el-dialog title="指派并开始处理" :visible.sync="assignVisible" width="460px" append-to-body :close-on-click-modal="false" @closed="resetAssign">
      <el-form ref="assignForm" :model="assignForm" :rules="assignRules" label-width="92px">
        <el-form-item label="处理人员" prop="handlerId">
          <el-select v-model="assignForm.handlerId" class="personnel-select" filterable clearable :loading="personnelLoading" placeholder="请选择处理人员" @change="selectPersonnel">
            <el-option v-for="person in personnelOptions" :key="person.id" :label="person.name" :value="person.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="assignVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveAssignment">确认并开始处理</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="completeDialogTitle" :visible.sync="completeVisible" width="520px" append-to-body :close-on-click-modal="false" @closed="resetComplete">
      <el-form ref="completeForm" :model="completeForm" :rules="completeRules" label-width="82px">
        <el-form-item label="处理结果" prop="handleResult">
          <el-input v-model.trim="completeForm.handleResult" type="textarea" :rows="5" maxlength="500" show-word-limit placeholder="请填写故障处理结果" />
        </el-form-item>
        <el-form-item label="处理附件">
          <el-upload
            ref="completeUpload"
            action="#"
            name="thefile"
            :auto-upload="false"
            :file-list="completeForm.uploadFiles"
            :limit="9"
            :on-change="handleCompleteFileChange"
            :on-remove="handleCompleteFileRemove">
            <el-button size="small" type="primary">选择文件</el-button>
            <div slot="file" slot-scope="{ file }" class="complete-file-item">
              <span>
                <i class="el-icon-paperclip"></i>
                {{ file.name || file.fileName }}
              </span>
              <el-button type="text" icon="el-icon-delete" title="删除文件" @click="removeCompleteFile(file)"></el-button>
            </div>
          </el-upload>
          <p class="upload-tip">单个文件不超过 10MB，最多上传 9 个。</p>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="completeVisible = false">取消</el-button>
        <el-button :type="success" :loading="saving" @click="completeRepair">{{ completeSubmitText }}</el-button>
      </span>
    </el-dialog>
  </main>
</template>

<script>
import repairTypeIcon from './repairTypeIcons'

export default {
  name: 'PropertyRepairHandle',
  data() {
    return {
      loading: false,
      saving: false,
      records: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      keyword: '',
      typeFilter: '',
      statusFilter: '',
      selectedRecord: null,
      detailVisible: false,
      assignVisible: false,
      completeVisible: false,
      personnelLoading: false,
      personnelOptions: [],
      assignForm: { id: '', handlerId: '', handlerName: '' },
      completeForm: { id: '', handleResult: '', uploadFiles: [], editing: false },
      repairTypes: ['水电维修', '门窗维修', '空调维修', '网络维修', '设备维修', '公共设施', '其他'],
      statusOptions: [
        { label: '待处理', value: 0 },
        { label: '处理中', value: 1 },
        { label: '已完成', value: 2 }
      ],
      assignRules: { handlerId: [{ required: true, message: '请选择处理人员', trigger: 'change' }] },
      completeRules: { handleResult: [{ required: true, message: '请填写处理结果', trigger: 'blur' }] }
    }
  },
  computed: {
    summaryCards() {
      const count = (status) => this.records.filter((item) => this.statusValue(item.status) === status).length
      return [
        { title: '全部工单', value: this.total, note: '当前查询条件下的工单', status: '', tone: 'blue', icon: 'el-icon-document' },
        { title: '待处理', value: count(0), note: '需要及时安排处理', status: 0, tone: 'orange', icon: 'el-icon-time' },
        { title: '处理中', value: count(1), note: '正在跟进的工单', status: 1, tone: 'teal', icon: 'el-icon-s-tools' },
        { title: '已完成', value: count(2), note: '已完成处理闭环', status: 2, tone: 'green', icon: 'el-icon-circle-check' }
      ]
    },
    detailFields() {
      return [
        { label: '工单编号', key: 'code' },
        { label: '报修类型', key: 'type' },
        { label: '报修地点', key: 'location' },
        { label: '联系人', key: 'contactName' },
        { label: '联系电话', key: 'contactPhone' },
        { label: '当前状态', key: 'status' }
      ]
    },
    componentFiles() {
      return this.filesForRecord(this.selectedRecord)
    },
    resultFiles() {
      return this.filesForRecord(this.selectedRecord, 'file2')
    },
    completeDialogTitle() {
      return this.completeForm.editing ? '修改处理结果' : '完成处理'
    },
    completeSubmitText() {
      return this.completeForm.editing ? '保存修改' : '确认完成'
    },
    timelineIndex() {
      const status = this.statusValue(this.selectedRecord && this.selectedRecord.status)
      return status === 2 ? 2 : status === 1 ? 1 : 0
    },
    timelineSteps() {
      return [
        { title: '待处理', note: '工单已提交，等待安排' },
        { title: '处理中', note: this.handlerName(this.selectedRecord || {}) ? `处理人：${this.handlerName(this.selectedRecord)}` : '等待处理人开始处理' },
        { title: '已完成', note: (this.selectedRecord && this.selectedRecord.completeTime) || '待填写完成信息' }
      ]
    }
  },
  created() {
    this.loadRecords()
  },
  methods: {
    repairTypeIcon,
    unwrap(response) {
      // 工单实体本身有 result（处理结果）字段；带 id 时必须保留整个实体。
      if (response && !response.id && response.result !== undefined && response.result !== null) return response.result
      if (response && response.data && !response.data.id && response.data.result !== undefined && response.data.result !== null) return response.data.result
      return response && response.data !== undefined ? response.data : response
    },
    async loadRecords() {
      if (!this.$api || !this.$api['reportRepair.list']) return
      this.loading = true
      try {
        const result =
          this.unwrap(
            await this.$api['reportRepair.list']({
              pageNo: this.currentPage,
              pageSize: this.pageSize,
              keyword: this.keyword || undefined,
              type: this.typeFilter || undefined,
              status: this.statusFilter === '' ? undefined : this.statusFilter,
              type: 1 //查看全部
            })
          ) || {}
        this.records = Array.isArray(result.records) ? result.records : Array.isArray(result.list) ? result.list : Array.isArray(result) ? result : []
        this.total = Number(result.total || this.records.length)
      } catch (error) {
        this.records = []
        this.total = 0
        this.$message.error('工单加载失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },
    reload() {
      this.currentPage = 1
      this.loadRecords()
    },
    repairCode(item) {
      return (item && (item.code || item.id)) || '-'
    },
    statusValue(status) {
      if (status === undefined || status === null || status === '' || status === 0 || status === '0' || status === '待处理') return 0
      if (status === 1 || status === '1' || status === '处理中') return 1
      return 2
    },
    statusLabel(status) {
      return ['待处理', '处理中', '已完成'][this.statusValue(status)]
    },
    statusTagType(status) {
      return ['warning', '', 'success'][this.statusValue(status)]
    },
    handlerName(item) {
      return item && (item.handlerName || item.handleName || item.assigneeName || item.assignName)
    },
    detailValue(key) {
      if (key === 'code') return this.repairCode(this.selectedRecord)
      if (key === 'status') return this.statusLabel(this.selectedRecord.status)
      return this.selectedRecord[key] || '-'
    },
    async openDetail(record) {
      this.selectedRecord = record
      this.detailVisible = true
      if (!this.$api || !this.$api['reportRepair.queryById']) return
      try {
        const detail = this.unwrap(await this.$api['reportRepair.queryById']({ id: record.id }))
        if (detail) this.selectedRecord = detail
      } catch (error) {
        this.$message.error('工单详情加载失败')
      }
    },
    async removeRecord(record) {
      if (!this.$api || !this.$api['reportRepair.delete']) return
      try {
        await this.$confirm(`确定删除工单“${this.repairCode(record)}”吗？删除后不可恢复。`, '确认删除', { type: 'warning' })
        await this.$api['reportRepair.delete']({ id: record.id })
        this.$message.success('工单已删除')
        if (this.records.length === 1 && this.currentPage > 1) this.currentPage -= 1
        this.loadRecords()
      } catch (error) {
        if (error !== 'cancel') this.$message.error('工单删除失败，请稍后重试')
      }
    },
    async openAssign(record) {
      this.assignForm = { id: record.id, handlerId: record.handlerId || record.handleId || '', handlerName: this.handlerName(record) || '' }
      this.assignVisible = true
      await this.loadPersonnelOptions()
      this.$nextTick(() => this.$refs.assignForm && this.$refs.assignForm.clearValidate())
    },
    resetAssign() {
      this.assignForm = { id: '', handlerId: '', handlerName: '' }
    },
    async loadPersonnelOptions() {
      if (!this.$api || !this.$api['personnel.select']) return
      this.personnelLoading = true
      try {
        const result = this.unwrap(await this.$api['personnel.select']())
        const list = Array.isArray(result) ? result : (result && (result.records || result.list || result.data)) || []
        this.personnelOptions = (Array.isArray(list) ? list : [])
          .map((item) => ({
            id: item.id || item.userId || item.personnelId || item.value,
            name: item.realName || item.name || item.userName || item.label || item.text
          }))
          .filter((item) => item.id && item.name)
      } catch (error) {
        this.personnelOptions = []
        this.$message.error('处理人员加载失败，请稍后重试')
      } finally {
        this.personnelLoading = false
      }
    },
    selectPersonnel(handlerId) {
      const person = this.personnelOptions.find((item) => item.id === handlerId)
      this.assignForm.handlerName = person ? person.name : ''
    },
    saveAssignment() {
      this.$refs.assignForm.validate((valid) => {
        if (valid)
          this.updateRepair(this.assignForm.id, { status: 1, handlerId: this.assignForm.handlerId, handlerName: this.assignForm.handlerName }, '处理人已指派，工单开始处理', () => {
            this.assignVisible = false
          })
      })
    },
    async openComplete(record, editing = false) {
      let detail = record
      if (editing && this.$api && this.$api['reportRepair.queryById']) {
        try {
          detail = this.unwrap(await this.$api['reportRepair.queryById']({ id: record.id })) || record
        } catch (error) {
          this.$message.error('工单详情加载失败')
        }
      }
      this.completeForm = {
        id: detail.id,
        handleResult: detail.RESULT || detail.handleResult || detail.result || '',
        uploadFiles: editing ? this.normalizeUploadFiles(this.filesForRecord(detail, 'file2')) : [],
        editing
      }
      this.completeVisible = true
      this.$nextTick(() => this.$refs.completeForm && this.$refs.completeForm.clearValidate())
    },
    resetComplete() {
      this.completeForm = { id: '', handleResult: '', uploadFiles: [], editing: false }
    },
    completeRepair() {
      this.$refs.completeForm.validate((valid) => {
        if (valid) {
          const uploadFiles = this.completeForm.uploadFiles.filter((file) => file.filePath).map((file) => this.cleanUploadFile(file))
          this.updateRepair(
            this.completeForm.id,
            { status: 2, result: this.completeForm.handleResult, completeTime: this.formatDateTime(new Date()), file2: uploadFiles.map((file) => file.filePath).join(','), uploadFiles },
            this.completeForm.editing ? '处理结果已修改' : '工单已办结',
            () => {
              this.completeVisible = false
            }
          )
        }
      })
    },
    async updateRepair(id, changes, successMessage, done) {
      if (!this.$api || !this.$api['reportRepair.edit']) return
      this.saving = true
      try {
        const payload = Object.assign({ id, uploadFiles: [], updateBy: this.currentUserId(), itemUpdateTime: this.formatDateTime(new Date()) }, changes)
        await this.$api['reportRepair.edit'](payload)
        this.$message.success(successMessage)
        if (done) done()
        this.detailVisible = false
        this.loadRecords()
      } catch (error) {
        this.$message.error('操作失败，请稍后重试')
      } finally {
        this.saving = false
      }
    },
    currentUserInfo() {
      try {
        return JSON.parse(window.sessionStorage.getItem('userInfo') || '{}')
      } catch (error) {
        return {}
      }
    },
    currentUserId() {
      return this.currentUserInfo().id || ''
    },
    currentUserName() {
      const user = this.currentUserInfo()
      return user.realName || user.name || user.userName || ''
    },
    formatDateTime(date) {
      const pad = (value) => String(value).padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    },
    normalizeUploadFiles(files) {
      return (Array.isArray(files) ? files : []).map((item, index) =>
        Object.assign({}, item, {
          name: item.name || item.fileName || `附件${index + 1}`,
          status: item.status || (item.filePath ? 'success' : 'ready')
        })
      )
    },
    async handleCompleteFileChange(file, fileList) {
      const raw = file.raw
      if (raw && raw.size > 10 * 1024 * 1024) {
        this.$message.error('单个文件不能超过 10MB')
        this.$refs.completeUpload && this.$refs.completeUpload.handleRemove(file)
        return
      }
      if (file.filePath || !raw) {
        this.completeForm.uploadFiles = this.normalizeUploadFiles(fileList)
        return
      }
      if (!this.$api || !this.$api['attachment.upload']) {
        this.$message.error('未找到附件上传接口')
        this.$refs.completeUpload && this.$refs.completeUpload.handleRemove(file)
        return
      }
      file.status = 'uploading'
      try {
        const formData = new FormData()
        formData.append('thefile', raw)
        const response = await this.$api['attachment.upload'](formData)
        const data = this.getUploadResult(response)
        if (!data.filePath) throw new Error('附件上传未返回 filePath')
        Object.assign(file, { fileName: data.fileName || file.name, filePath: data.filePath, fileType: data.fileType || raw.type || '', name: data.fileName || file.name, status: 'success' })
        this.completeForm.uploadFiles = this.normalizeUploadFiles(fileList)
      } catch (error) {
        this.$message.error('处理附件上传失败，请重试')
        this.$refs.completeUpload && this.$refs.completeUpload.handleRemove(file)
      }
    },
    handleCompleteFileRemove(file, fileList) {
      this.completeForm.uploadFiles = this.normalizeUploadFiles(fileList)
    },
    removeCompleteFile(file) {
      if (this.$refs.completeUpload) this.$refs.completeUpload.handleRemove(file)
    },
    cleanUploadFile(file) {
      return { fileName: file.fileName || file.name, filePath: file.filePath, name: file.name || file.fileName, status: 'success', uid: file.uid || Date.now() }
    },
    getUploadResult(response) {
      const files = Array.isArray(response) ? response : response && response.data
      return Array.isArray(files) ? files[0] || {} : {}
    },
    filesForRecord(record, pathField = 'file1') {
      const paths = String((record && record[pathField]) || '')
        .split(/[,，]/)
        .map((item) => item.trim())
        .filter(Boolean)
      let files = record && record.uploadFiles
      if (typeof files === 'string') {
        try {
          files = JSON.parse(files)
        } catch (error) {
          files = []
        }
      }
      if (!Array.isArray(files)) return []
      return paths.length ? this.normalizeUploadFiles(files).filter((file) => paths.includes(file.filePath)) : []
    },
    async downloadFile(file) {
      if (!file.id || !this.$api || !this.$api['attachment.download']) return
      try {
        const response = await this.$api['attachment.download']({ attachmentId: file.id }, { responseType: 'blob' })
        const url = URL.createObjectURL(new Blob([response.data], { type: file.fileType || 'application/octet-stream' }))
        const link = document.createElement('a')
        link.href = url
        link.download = file.fileName || file.name || '附件'
        link.click()
        URL.revokeObjectURL(url)
      } catch (error) {
        this.$message.error('文件下载失败，请稍后重试')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.repair-handle-page {
  display: flex;
  height: 100%;
  min-height: 0;
  padding: 20px 18px 34px;
  overflow: hidden;
  box-sizing: border-box;
  background: #f7f9fa;
  color: #173b3a;
  flex-direction: column;
}
.handle-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}
.summary-card {
  display: flex;
  align-items: center;
  min-height: 72px;
  padding: 10px 16px;
  gap: 11px;
  border: 1px solid #dbe6e5;
  border-radius: 8px;
  background: #fff;
}
.summary-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  font-size: 16px;
}
.blue {
  color: #2372b7;
  background: #e8f3fe;
}
.orange {
  color: #b56808;
  background: #fff2df;
}
.teal {
  color: #0f766e;
  background: #e3f7f4;
}
.green {
  color: #218255;
  background: #e6f7ee;
}
.summary-card small {
  color: #6f8584;
  font-size: 12px;
}
.summary-card b {
  display: block;
  margin-top: 1px;
  color: #173b3a;
  font-size: 21px;
  line-height: 1.1;
}
.summary-card em {
  margin-left: 3px;
  color: #829594;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
}
.summary-card p {
  margin: 3px 0 0;
  color: #889a99;
  font-size: 12px;
}
.handle-surface {
  display: flex;
  min-height: 0;
  overflow: hidden;
  border: 1px solid #dbe6e5;
  border-radius: 8px;
  background: #fff;
  flex: 1;
  flex-direction: column;
}
.handle-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: #fcfdfd;
  border-bottom: 1px solid #e7efee;
  flex: 0 0 auto;
}
.handle-toolbar .el-input {
  width: 300px;
}
.handle-toolbar .el-select {
  width: 155px;
}
.handle-table {
  width: 100%;
  min-height: 0;
  flex: 1;
}
.order-code {
  color: #137b74;
  font-family: monospace;
}
.cell-sub {
  display: block;
  margin-top: 3px;
  color: #849594;
  font-size: 12px;
}
.complete-action {
  color: #178657;
}
.delete-action {
  color: #d95050;
}
.delete-action:hover {
  color: #b83b3b;
}
.pagination-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 52px;
  gap: 12px;
  padding: 0 20px;
  border-top: 1px solid #e7efee;
  color: #778988;
  font-size: 12px;
  flex: 0 0 auto;
}
.handle-table ::v-deep .el-table__header-wrapper th {
  height: 50px;
  background: #f3f7f7;
  color: #385553;
  font-weight: 600;
}
.handle-table ::v-deep .el-table__body td {
  padding: 13px 0;
  color: #435e5c;
}
.handle-table ::v-deep .el-table__body tr:hover > td {
  background: #f6fbfa !important;
}
.handle-table ::v-deep .el-table__body tr {
  transition: background-color 0.2s ease;
}
.handle-table ::v-deep .el-table__fixed-right::before {
  display: none;
}
.handle-surface > .el-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  flex: 1;
}
.detail-hero {
  display: flex;
  align-items: center;
  min-height: 86px;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid #c9e4e1;
  border-radius: 8px;
  background: linear-gradient(100deg, #edf9f7 0%, #f8fcfb 72%);
  box-sizing: border-box;
}
.detail-hero > span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 11px;
  background: #fff;
}
.detail-type-icon img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}
.repair-type-cell {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 6px;
}
.repair-type-cell img {
  width: 18px;
  height: 18px;
  object-fit: contain;
  flex: 0 0 auto;
}
.detail-hero-content {
  min-width: 0;
  flex: 1;
}
.detail-hero small,
.detail-hero p {
  color: #6f8c89;
  font-size: 12px;
}
.detail-code {
  display: block;
  overflow: hidden;
  font-family: monospace;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.detail-code i,
.detail-hero p i {
  margin-right: 5px;
  color: #2b9189;
}
.detail-hero h3 {
  margin: 4px 0;
  color: #173b3a;
  font-size: 17px;
  line-height: 1.25;
}
.detail-hero p {
  margin: 0;
}
.detail-status {
  margin-left: auto;
  white-space: nowrap;
  flex: 0 0 auto;
}
.detail-grid,
.process-info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 14px;
  border-top: 1px solid #dce9e8;
  border-left: 1px solid #dce9e8;
}
.detail-grid span,
.process-info span {
  min-height: 67px;
  padding: 12px;
  border-right: 1px solid #dce9e8;
  border-bottom: 1px solid #dce9e8;
  box-sizing: border-box;
}
.detail-grid small,
.detail-grid b,
.process-info small,
.process-info b {
  display: block;
}
.detail-grid small,
.process-info small {
  color: #718786;
  font-size: 12px;
}
.detail-grid b,
.process-info b {
  margin-top: 5px;
  color: #294b49;
  font-size: 13px;
  word-break: break-word;
}
.detail-section {
  margin-top: 20px;
}
.detail-section h4 {
  margin: 0 0 10px;
  color: #234947;
  font-size: 14px;
}
.detail-section > p {
  margin: 0;
  padding: 13px;
  border-radius: 6px;
  background: #f5f9f8;
  color: #526d6b;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-line;
}
.complete-file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.complete-file-item span {
  overflow: hidden;
  color: #496562;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.complete-file-item i {
  margin-right: 6px;
  color: #16857c;
}
.personnel-select {
  width: 100%;
}
.upload-tip {
  margin: 8px 0 0;
  color: #8a9b9a;
  font-size: 12px;
}
.file-list {
  border: 1px solid #dce9e8;
  border-radius: 7px;
}
.file-link {
  display: block;
  width: 100%;
  min-height: 40px;
  padding: 0 12px;
  border: 0;
  border-bottom: 1px solid #edf3f2;
  background: #fff;
  color: #177b73;
  text-align: left;
  cursor: pointer;
}
.file-link:last-child {
  border-bottom: 0;
}
.file-link:disabled {
  color: #7b8d8b;
  cursor: default;
}
.file-link:not(:disabled):hover {
  background: #f1faf8;
  text-decoration: underline;
}
.file-link i {
  margin-right: 6px;
}
.process-timeline {
  padding: 7px 0 0;
}
.timeline-item {
  position: relative;
  display: flex;
  gap: 11px;
  padding-bottom: 18px;
}
.timeline-item > i {
  position: relative;
  z-index: 1;
  width: 11px;
  height: 11px;
  margin-top: 3px;
  border: 2px solid #bed2d0;
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
  background: #d8e5e3;
  content: '';
}
.timeline-item.done > i {
  border-color: #0f766e;
  background: #0f766e;
}
.timeline-item b,
.timeline-item small {
  display: block;
}
.timeline-item b {
  color: #315654;
  font-size: 13px;
}
.timeline-item small {
  margin-top: 4px;
  color: #7d918f;
  font-size: 12px;
}
@media (max-width: 1000px) {
  .handle-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .handle-toolbar {
    flex-wrap: wrap;
  }
  .handle-toolbar .el-input {
    width: 100%;
  }
}
@media (max-width: 600px) {
  .repair-handle-page {
    height: 100%;
    padding: 14px 12px 24px;
  }
  .handle-summary {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .handle-toolbar {
    padding: 12px;
  }
  .handle-toolbar .el-select,
  .handle-toolbar .el-button {
    width: 100%;
  }
  .pagination-row {
    justify-content: center;
  }
  .detail-grid,
  .process-info {
    grid-template-columns: 1fr;
  }
}
</style>

<style lang="scss">
.repair-handle-drawer .el-drawer__header {
  margin-bottom: 0;
  padding: 18px 20px;
  border-bottom: 1px solid #dce9e8;
  color: #173b3a;
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
.drawer-actions {
  padding: 13px 20px;
  border-top: 1px solid #dce9e8;
  text-align: right;
}
@media (max-width: 600px) {
  .repair-handle-drawer {
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
