<!-- 首页租赁申请查阅组件：展示管理端待查阅和已查阅申请，点击记录后在独立侧边栏查看详情。 -->
<template>
  <section class="pending-lease-application" aria-label="租赁申请待办">
    <header>
      <div>
        <i class="el-icon-office-building" />
        <span>租赁申请待办</span>
        <el-badge :value="pendingRecords.length" :hidden="!pendingRecords.length" type="danger" />
      </div>
    </header>
    <div class="status-columns">
      <section v-for="column in statusColumns" :key="column.key" class="status-column">
        <div class="column-title">
          <span>{{ column.label }}</span>
          <el-badge :value="column.records.length" :hidden="!column.records.length" :type="column.badgeType" />
        </div>
        <div v-if="column.records.length" class="lease-list">
          <article
            v-for="item in column.records"
            :key="item.id"
            :class="['lease-item', { 'is-read': !isPending(item), 'is-updating': isUpdating(item) }]"
            tabindex="0"
            role="button"
            :aria-label="`查看${applyTypeText(item.applyType)}详情`"
            @click="openDetail(item)"
            @keydown.enter.self.prevent="openDetail(item)"
            @keydown.space.self.prevent="openDetail(item)">
            <span :class="['lease-icon', item.applyType]"><i :class="typeIcon(item.applyType)" /></span>
            <div class="lease-content">
              <b>{{ applyTypeText(item.applyType) }} · {{ item.companyName }}</b>
              <small>{{ item.currentLocation }} · {{ item.applyDate }}</small>
            </div>
            <el-tag :type="column.tagType" size="mini">{{ column.label }}</el-tag>
          </article>
        </div>
        <p v-else class="column-empty">暂无{{ column.label }}申请</p>
      </section>
    </div>

    <el-drawer title="租赁申请详情" :visible.sync="detailVisible" size="560px" append-to-body custom-class="home-lease-detail">
      <article v-if="selectedRecord" v-loading="detailLoading" class="lease-detail">
        <div class="lease-detail__hero">
          <span :class="['lease-icon', 'lease-detail__icon', selectedRecord.applyType]"><i :class="typeIcon(selectedRecord.applyType)" /></span>
          <div>
            <small>{{ selectedRecord.id }}</small>
            <h3>{{ applyTypeText(selectedRecord.applyType) }}</h3>
          </div>
          <el-tag :type="statusTagType(selectedRecord)" size="small">{{ statusLabel(selectedRecord) }}</el-tag>
        </div>
        <div class="lease-detail__grid">
          <div v-for="field in detailFields" :key="field.key" class="lease-detail__item">
            <small>{{ field.label }}</small>
            <b>{{ detailValue(selectedRecord[field.key]) }}</b>
          </div>
        </div>
        <section class="lease-detail__section">
          <h4>申请原因</h4>
          <p>{{ selectedRecord.applyReason || selectedRecord.vacateReason || selectedRecord.expansionPurposeReason || '-' }}</p>
        </section>
        <section v-if="selectedRecord.remark" class="lease-detail__section">
          <h4>补充说明</h4>
          <p>{{ selectedRecord.remark }}</p>
        </section>
        <section v-if="detailFiles.length" class="lease-detail__section">
          <h4>申请附件</h4>
          <div class="lease-detail__files">
            <button
              v-for="file in detailFiles"
              :key="file.attachmentId || file.id || file.fileId || file.uid || file.name"
              type="button"
              class="lease-detail__file-link"
              :disabled="!attachmentId(file)"
              :title="file.fileName || file.name || '附件'"
              @click="downloadAttachment(file)">
              <img :src="fileIcon(file)" alt="" aria-hidden="true" />
              <span>{{ file.fileName || file.name || '附件' }}</span>
            </button>
          </div>
        </section>
      </article>
    </el-drawer>
  </section>
</template>

<script>
import { getFileTypeIcon } from '@/utils/fileTypeIcon'

export default {
  name: 'PendingLeaseApplication',
  data() {
    return {
      pendingRecords: [],
      readRecords: [],
      updatingIds: [],
      detailVisible: false,
      detailLoading: false,
      selectedRecord: null
    }
  },
  computed: {
    statusColumns() {
      return [
        { key: 'pending', label: '待查阅', records: this.pendingRecords, tagType: 'info', badgeType: 'info' },
        { key: 'read', label: '已查阅', records: this.readRecords, tagType: 'success', badgeType: 'success' }
      ]
    },
    detailFields() {
      const commonFields = [
        { key: 'companyName', label: '企业名称' },
        { key: 'contractNo', label: '租赁合同编号' },
        { key: 'currentLocation', label: '现租赁位置' },
        { key: 'contactPerson', label: '联系人' },
        { key: 'contactPhone', label: '联系电话' },
        { key: 'applyDate', label: '申请日期' }
      ]
      const typeFields = {
        renew: [
          { key: 'currentExpireDate', label: '当前到期日' },
          { key: 'renewalPeriodMonths', label: '续租期限（月）' },
          { key: 'renewalStartDate', label: '续租起始日' }
        ],
        vacate: [
          { key: 'plannedVacateDate', label: '计划退租日' },
          { key: 'handoverPerson', label: '交接负责人' }
        ],
        expand: [
          { key: 'currentArea', label: '现租赁面积' },
          { key: 'expansionArea', label: '拟扩租面积' },
          { key: 'expectedStartDate', label: '期望启用日期' },
          { key: 'intendedLocation', label: '意向位置' }
        ]
      }
      return commonFields.concat(typeFields[this.selectedRecord && this.selectedRecord.applyType] || [])
    },
    detailFiles() {
      return this.selectedRecord ? this.normalizeUploadFiles(this.selectedRecord.uploadFiles) : []
    }
  },
  created() {
    this.loadRecords()
  },
  methods: {
    async loadRecords() {
      try {
        if (!this.$api || !this.$api['tobLeaseApplication.list']) throw new Error('API unavailable')
        const [pending, read] = await Promise.all([this.queryByStatus(0), this.queryByStatus(1)])
        this.pendingRecords = pending
        this.readRecords = read
      } catch (error) {
        const records = this.mockRecords()
        this.pendingRecords = records.filter((item) => this.statusMatches(item.status, 0))
        this.readRecords = records.filter((item) => this.statusMatches(item.status, 1))
      }
    },
    async queryByStatus(status) {
      const result = this.unwrapResponse(await this.$api['tobLeaseApplication.list']({ pageNo: 1, pageSize: 3, type: 1, status }))
      const list = (result && (result.records || result.list || result.rows)) || result || []
      return (Array.isArray(list) ? list : []).filter((item) => this.statusMatches(item.status, status)).slice(0, 3)
    },
    mockRecords() {
      return [
        { id: 'LA20260824001', applyType: 'renew', companyName: '淳通智惠科技有限公司', currentLocation: 'A 座 501 室', applyDate: '08-22 10:30', status: 0 },
        { id: 'LA20260818002', applyType: 'expand', companyName: '星河数据服务有限公司', currentLocation: 'B 座 803 室', applyDate: '08-18 15:20', status: 0 },
        { id: 'LA20260821003', applyType: 'vacate', companyName: '新域创意设计工作室', currentLocation: 'C 座 306 室', applyDate: '08-21 09:40', status: 1 }
      ]
    },
    isPending(item) {
      return item && this.statusMatches(item.status, 0)
    },
    statusMatches(value, status) {
      return Number(value) === Number(status)
    },
    isUpdating(item) {
      return Boolean(item && this.updatingIds.includes(item.id))
    },
    async openDetail(item) {
      if (!item || this.isUpdating(item)) return
      this.selectedRecord = Object.assign({}, item)
      this.detailVisible = true
      this.detailLoading = true
      try {
        const detailApi = this.$api && this.$api['tobLeaseApplication.queryById']
        if (detailApi) {
          const detail = this.unwrapResponse(await detailApi({ id: item.id }))
          if (detail) this.selectedRecord = Object.assign({}, item, detail)
        }
      } catch (error) {
        // 详情接口异常时保留列表中的基础信息，侧边栏仍可正常展示。
      } finally {
        this.detailLoading = false
      }
      if (this.isPending(item)) await this.markAsRead(this.selectedRecord)
    },
    async markAsRead(item) {
      if (!this.isPending(item) || this.isUpdating(item)) return
      const editApi = this.$api && this.$api['tobLeaseApplication.edit']
      if (!editApi) {
        this.$message.error('未找到租赁申请状态更新接口')
        return
      }
      this.updatingIds.push(item.id)
      try {
        await editApi(this.readPayload(item))
        const readRecord = Object.assign({}, item, { status: 1 })
        this.pendingRecords = this.pendingRecords.filter((record) => String(record.id) !== String(item.id))
        this.readRecords = [readRecord].concat(this.readRecords.filter((record) => String(record.id) !== String(item.id))).slice(0, 3)
        if (this.selectedRecord && String(this.selectedRecord.id) === String(item.id)) this.selectedRecord = Object.assign({}, this.selectedRecord, { status: 1 })
      } catch (error) {
        this.$message.error('查阅状态更新失败，请稍后重试')
      } finally {
        this.updatingIds = this.updatingIds.filter((id) => id !== item.id)
      }
    },
    currentUserId() {
      try {
        return JSON.parse(window.sessionStorage.getItem('userInfo') || '{}').id || ''
      } catch (error) {
        return ''
      }
    },
    normalizeUploadFiles(value) {
      let files = value
      if (typeof files === 'string') {
        try {
          files = JSON.parse(files)
        } catch (error) {
          files = [files]
        }
      }
      if (!Array.isArray(files)) files = files ? [files] : []
      return files.filter(Boolean).map((item, index) => {
        const file = typeof item === 'string' ? { filePath: item } : Object.assign({}, item)
        const filePath = file.filePath || file.fileUrl || file.url || ''
        const name = file.name || file.fileName || file.originalFileName || file.originalName || filePath.split(/[\\/]/).pop() || `附件${index + 1}`
        return Object.assign({}, file, {
          name,
          fileName: file.fileName || name,
          uid: file.uid || file.attachmentId || file.id || file.fileId || `home-lease-file-${index}`,
          status: file.status || 'success',
          url: file.url || file.fileUrl || file.filePath || ''
        })
      })
    },
    cleanUploadFile(file) {
      const stripPrefix = (value) => (value ? String(value).replace(/^.*[\\/]/, '') : value)
      const fileName = file.fileName || file.name
      const filePath = stripPrefix(file.filePath || file.fileUrl || file.url)
      return {
        name: file.name || fileName,
        fileName,
        filePath,
        fileType: file.fileType,
        url: stripPrefix(file.url || file.fileUrl || file.filePath)
      }
    },
    readPayload(item) {
      const payload = Object.assign({}, item, { status: 1, updateBy: this.currentUserId(), itemUpdateTime: this.now() })
      if (Object.prototype.hasOwnProperty.call(payload, 'uploadFiles')) payload.uploadFiles = this.normalizeUploadFiles(payload.uploadFiles).map((file) => this.cleanUploadFile(file))
      return payload
    },
    now() {
      const date = new Date()
      const pad = (value) => String(value).padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    },
    typeIcon(type) {
      return { renew: 'el-icon-refresh-right', vacate: 'el-icon-switch-button', expand: 'el-icon-full-screen' }[type] || 'el-icon-office-building'
    },
    applyTypeText(type) {
      return { renew: '续租申请', vacate: '退租申请', expand: '扩租申请' }[type] || type || '-'
    },
    statusLabel(item) {
      return this.isPending(item) ? '待查阅' : '已查阅'
    },
    statusTagType(item) {
      return this.isPending(item) ? 'info' : 'success'
    },
    detailValue(value) {
      return value === undefined || value === null || value === '' ? '-' : value
    },
    fileIcon(file) {
      return getFileTypeIcon(file)
    },
    attachmentId(file) {
      return file && (file.attachmentId || file.id || file.fileId)
    },
    async downloadAttachment(file) {
      const attachmentId = this.attachmentId(file)
      const downloadApi = this.$api && this.$api['attachment.download']
      if (!attachmentId || !downloadApi) return
      try {
        const response = await downloadApi({ attachmentId }, { responseType: 'blob' })
        const data = response && response.data !== undefined ? response.data : response
        const objectUrl = window.URL.createObjectURL(data instanceof Blob ? data : new Blob([data], { type: file.fileType || 'application/octet-stream' }))
        const link = document.createElement('a')
        link.href = objectUrl
        link.download = file.fileName || file.name || '附件'
        link.click()
        window.URL.revokeObjectURL(objectUrl)
      } catch (error) {
        this.$message.error('附件下载失败，请稍后重试')
      }
    },
    unwrapResponse(response) {
      if (response && response.data && response.data.head && response.data.data !== undefined) return response.data.data
      if (response && response.result !== undefined) return response.result
      if (response && response.data && response.data.result !== undefined) return response.data.result
      return response && response.data !== undefined ? response.data : response
    }
  }
}
</script>

<style lang="scss" scoped>
.pending-lease-application {
  min-height: 0;
  padding: 16px;
  box-sizing: border-box;
  align-self: start;
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #334b69;
  font-size: 14px;
  font-weight: 600;
}
header i {
  margin-right: 6px;
  color: #2e7cdf;
}
::v-deep .el-badge {
  margin-left: 8px;
}
::v-deep .el-badge__content {
  top: 1px;
}
.lease-list {
  margin-top: 4px;
}
.status-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}
.status-column {
  min-width: 0;
  padding: 10px 12px 12px;
  border-radius: 8px;
  background: #fff;
}
.column-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #52667e;
  font-size: 12px;
  font-weight: 600;
}
.column-title::before {
  width: 3px;
  height: 13px;
  border-radius: 2px;
  background: #f5ad42;
  content: '';
}
.status-column:nth-child(2) .column-title::before {
  background: #398bf3;
}
.column-empty {
  margin: 8px 0 0;
  padding: 8px 0 2px;
  color: #a3afbd;
  font-size: 12px;
  line-height: 28px;
}
.lease-item {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  margin-top: 7px;
  padding: 9px 10px;
  border: 1px solid #edf1f5;
  border-radius: 6px;
  background: #fafafa;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.lease-item:hover {
  border-color: #cfe2fb;
  background: #f7faff;
}
.lease-item.is-read {
  cursor: pointer;
}
.lease-item.is-updating {
  cursor: wait;
  opacity: 0.6;
}
.lease-item:focus:not(:focus-visible) {
  outline: none;
}
.lease-item:focus-visible {
  outline: 2px solid #8bbbf6;
  outline-offset: 2px;
}
.lease-icon {
  display: inline-flex;
  width: 25px;
  height: 25px;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  background: #eaf3ff;
  color: #2f7cdf;
  font-size: 13px;
  flex: 0 0 auto;
}
.lease-icon.expand {
  background: #e9f8f0;
  color: #28a36b;
}
.lease-icon.vacate {
  background: #fff1e8;
  color: #dd8a32;
}
.lease-content {
  min-width: 0;
  flex: 1;
}
.lease-content b,
.lease-content small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lease-content b {
  color: #52667e;
  font-size: 12px;
}
.lease-content small {
  margin-top: 3px;
  color: #9aa6b5;
  font-size: 11px;
}
.lease-detail {
  padding: 0 22px 28px;
}
.lease-detail__hero {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
  padding: 18px;
  border-radius: 10px;
  background: #f5f8fc;
}
.lease-detail__hero > div {
  min-width: 0;
  flex: 1;
}
.lease-detail__hero small {
  color: #8492a6;
}
.lease-detail__hero h3 {
  margin: 3px 0 0;
  color: #24344c;
  font-size: 18px;
}
.lease-detail__icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  font-size: 20px;
}
.lease-detail__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.lease-detail__item {
  min-width: 0;
  padding: 12px 14px;
  border: 1px solid #edf1f5;
  border-radius: 8px;
}
.lease-detail__item small {
  display: block;
  margin-bottom: 5px;
  color: #8a98aa;
}
.lease-detail__item b {
  color: #35445b;
  font-weight: 500;
  word-break: break-word;
}
.lease-detail__section {
  margin-top: 18px;
  padding: 16px;
  border-radius: 8px;
  background: #f8fafc;
}
.lease-detail__section h4 {
  margin: 0 0 9px;
  color: #35445b;
}
.lease-detail__section p {
  margin: 0;
  color: #5e6d82;
  line-height: 1.8;
  white-space: pre-wrap;
}
.lease-detail__files {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 10px;
}
.lease-detail__file-link {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  gap: 8px;
  padding: 0;
  overflow: hidden;
  border: 0;
  background: transparent;
  color: #3387ee;
  cursor: pointer;
  font: inherit;
}
.lease-detail__file-link img {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
}
.lease-detail__file-link span {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.lease-detail__file-link:hover {
  color: #66a4f2;
}
.lease-detail__file-link:disabled {
  color: #b8c4d1;
  cursor: not-allowed;
}
@media (max-width: 760px) {
  .status-columns {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .lease-detail__grid {
    grid-template-columns: 1fr;
  }
}
</style>
