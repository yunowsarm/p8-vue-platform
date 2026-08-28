<!-- 资质认定业务组件：独立维护资质申请、材料信息、审核状态和各终端操作权限。 -->
<template>
  <main class="record-feature-page">
    <header class="record-feature-hero">
      <div class="record-feature-hero__title">
        <span class="record-feature-hero__icon"><i :class="resource.icon"></i></span>
        <div>
          <h2>资质认定</h2>
          <p>{{ resource.description }}</p>
        </div>
      </div>
      <el-button v-if="canCreate" type="primary" icon="el-icon-plus" @click="openCreate">新增认定申请</el-button>
    </header>
    <section v-loading="loading" class="record-feature-surface">
      <div class="record-feature-toolbar">
        <el-input v-model.trim="keyword" clearable prefix-icon="el-icon-search" placeholder="搜索申请编号、企业或申请原因" @input="resetPage" @clear="resetPage" />
        <el-select v-model="typeFilter" clearable placeholder="全部资质类型" @change="resetPage" @clear="resetPage">
          <el-option v-for="option in primaryOptions" :key="optionValue(option)" :label="optionLabel(option)" :value="optionValue(option)" />
        </el-select>
        <el-select v-model="statusFilter" clearable placeholder="全部状态" @change="resetPage" @clear="resetPage">
          <el-option v-for="status in statusOptions" :key="status" :label="status" :value="status" />
        </el-select>
      </div>
      <div v-if="pagedRecords.length" class="record-feature-grid">
        <article
          v-for="record in pagedRecords"
          :key="record.id"
          class="record-feature-card"
          role="button"
          tabindex="0"
          :aria-label="`查看${recordTitle(record)}详情`"
          @click="openDetail(record)"
          @keydown.enter.self="openDetail(record)"
          @keydown.space.self.prevent="openDetail(record)">
          <div class="record-feature-card__head">
            <span class="record-feature-card__id">
              <i class="el-icon-medal"></i>
              {{ record.id }}
            </span>
            <el-tag :type="statusType(statusText(record.status))" size="small">{{ statusText(record.status) }}</el-tag>
          </div>
          <h3>{{ recordTitle(record) }}</h3>
          <p class="record-feature-card__description">{{ recordDescription(record) }}</p>
          <dl>
            <template v-for="field in cardFields">
              <dt :key="field.key + '-label'">{{ field.label }}</dt>
              <dd :key="field.key + '-value'">{{ formatValue(record[field.key], field.key) }}</dd>
            </template>
          </dl>
          <div v-if="hasRecordActions(record)" class="record-feature-card__actions">
            <div class="record-feature-card__actions-right">
              <el-button v-if="canChangeRecordStatus(record)" type="text" size="mini" @click.stop="openStatusDialog(record)">审核</el-button>
              <el-button v-if="canEditRecord(record)" type="text" size="mini" @click.stop="openEdit(record)">编辑</el-button>
              <el-button v-if="canDeleteRecord(record)" type="text" size="mini" class="danger-action" @click.stop="removeRecord(record)">删除</el-button>
            </div>
          </div>
        </article>
      </div>
      <el-empty v-else class="record-feature-empty" description="暂无资质认定申请" />
      <div v-if="paginationTotal" class="record-feature-pagination">
        <span>共 {{ paginationTotal }} 条</span>
        <el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="paginationTotal" layout="prev, pager, next" @current-change="loadRecords" />
      </div>
    </section>

    <el-dialog :title="formDialogTitle" :visible.sync="formVisible" top="5vh" append-to-body :close-on-click-modal="false" custom-class="record-feature-form" @closed="resetForm">
      <el-form ref="recordForm" :model="form" :rules="rules" label-width="96px" @submit.native.prevent>
        <div class="record-feature-form-grid">
          <business-record-field
            v-for="field in formFields"
            :key="field.key"
            v-model="form[field.key]"
            :field="field"
            :enterprise-options="enterpriseOptions"
            :enterprise-loading="enterpriseLoading"
            :class="{ 'record-feature-field--wide': field.wide || field.type === 'textarea' }" />
          <business-attachment-field v-model="form.uploadFiles" class="record-feature-attachment" label="申请附件" :limit="9" tip="单个附件不超过 10MB，最多上传 9 个。" />
        </div>
      </el-form>
      <span slot="footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">{{ isResubmitting ? '重新提交' : '提交申请' }}</el-button>
      </span>
    </el-dialog>

    <el-drawer title="资质认定申请详情" :visible.sync="detailVisible" size="520px" append-to-body>
      <div v-if="selectedRecord" v-loading="detailLoading" class="record-feature-detail">
        <div class="record-feature-detail__hero">
          <i :class="resource.icon"></i>
          <div>
            <small>{{ selectedRecord.id }}</small>
            <h3>{{ recordTitle(selectedRecord) }}</h3>
          </div>
          <el-tag :type="statusType(statusText(selectedRecord.status))">{{ statusText(selectedRecord.status) }}</el-tag>
        </div>
        <div class="record-feature-detail__grid">
          <div v-for="field in detailFields" :key="field.key" class="record-feature-detail__item">
            <small>{{ field.label }}</small>
            <b>{{ formatValue(selectedRecord[field.key], field.key) }}</b>
          </div>
        </div>
        <section class="record-feature-detail__section">
          <h4>申请原因</h4>
          <p>{{ selectedRecord.applyReason || '-' }}</p>
        </section>
        <section v-if="detailFiles.length" class="record-feature-detail__section">
          <h4>申请附件</h4>
          <div class="record-feature-files">
            <button
              v-for="file in detailFiles"
              :key="file.id || file.attachmentId || file.uid || file.url || file.name"
              type="button"
              class="record-feature-file-link"
              :disabled="!attachmentId(file)"
              :title="file.fileName || file.name || '附件'"
              :aria-label="`下载附件：${file.fileName || file.name || '附件'}`"
              @click="downloadAttachment(file)">
              <img class="record-feature-file-icon" :src="fileIcon(file)" alt="" aria-hidden="true" />
              <span class="record-feature-file-name">{{ file.fileName || file.name || '附件' }}</span>
            </button>
          </div>
        </section>
      </div>
    </el-drawer>

    <record-audit-dialog
      v-model="statusVisible"
      title="审核资质认定申请"
      :loading="statusLoading"
      :submitting="statusSubmitting"
      :record="statusTarget"
      :fields="resource.fields"
      :files="auditFiles"
      :content-key="resource.contentKey"
      :status-options="availableStatusOptions"
      :status-labels="resource.statusOptionLabels"
      :status.sync="statusForm.status"
      :formatter="formatValue"
      @download="downloadAttachment"
      @confirm="saveStatus" />
  </main>
</template>

<script>
import BusinessAttachmentField from '@/components/business/record-fields/BusinessAttachmentField'
import BusinessRecordField from '@/components/business/record-fields/BusinessRecordField'
import RecordAuditDialog from '@/features/_shared/record-management/RecordAuditDialog'
import recordManager from '@/features/_shared/record-management/recordManager'
import { getFileTypeIcon } from '@/utils/fileTypeIcon'

const normalizeQualificationFiles = (value) => {
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
    const fallbackName = `附件${index + 1}`
    const name = file.name || file.fileName || file.originalFileName || file.originalName || filePath.split(/[\\/]/).pop() || fallbackName
    return Object.assign({}, file, {
      name,
      fileName: file.fileName || name,
      uid: file.uid || file.attachmentId || file.id || file.fileId || `qualification-file-${index}`,
      status: file.status || 'success',
      url: file.url || file.fileUrl || file.filePath || ''
    })
  })
}

const normalizeQualificationRecord = (record) => {
  const normalized = Object.assign({}, record)
  normalized.status = normalized.approveStatus === undefined || normalized.approveStatus === null ? normalized.status : normalized.approveStatus
  normalized.uploadFiles = normalizeQualificationFiles(normalized.uploadFiles)
  return normalized
}

const cleanQualificationUploadPath = (value) => (value ? value.replace(/^.*[\\/]/, '') : value)

const cleanQualificationUploadFile = (file) => {
  const normalized = Object.assign({}, file)
  delete normalized.id
  normalized.filePath = cleanQualificationUploadPath(normalized.filePath)
  normalized.url = cleanQualificationUploadPath(normalized.url)
  return normalized
}

const transformQualificationPayload = (payload, { editing }) => {
  if (editing && Array.isArray(payload.uploadFiles)) payload.uploadFiles = payload.uploadFiles.map(cleanQualificationUploadFile)
  return payload
}

export default {
  name: 'QualificationRecognitionPage',
  components: { BusinessAttachmentField, BusinessRecordField, RecordAuditDialog },
  mixins: [recordManager],
  props: { mode: { type: String, default: 'user' } },
  computed: {
    resource() {
      return {
        title: '资质认定',
        itemName: '资质认定',
        description: this.mode === 'admin' ? '审核企业资质认定申请并记录办理结论。' : '提交企业资质认定需求并查看审核进度。',
        icon: 'el-icon-medal',
        idPrefix: 'QR',
        apiNamespace: 'tobQualificationCert',
        primaryKey: 'qualificationType',
        timeKey: 'applyTime',
        contentKey: 'applyReason',
        uploadField: 'uploadFiles',
        uploadResponseField: 'uploadFiles',
        loadDetailBeforeEdit: true,
        normalizeRecord: normalizeQualificationRecord,
        editUploadFilesTransform: (files) => files.map(cleanQualificationUploadFile),
        payloadTransform: transformQualificationPayload,
        autoFormFields: { companyId: 'currentUserName', applyTime: 'now' },
        statusField: 'approveStatus',
        defaultStatus: '待审核',
        statusMap: { 0: '待审核', 1: '审核中', 2: '已通过', 3: '已驳回' },
        statusValueMap: { 待审核: 0, 审核中: 1, 已通过: 2, 已驳回: 3 },
        listStatusValueMap: { 待审核: 0, 审核中: 1, 已通过: 2, 已驳回: 3 },
        statusOptions: ['待审核', '审核中', '已通过', '已驳回'],
        statusTransitions: { 待审核: ['已通过', '已驳回'], 审核中: ['已通过', '已驳回'] },
        statusOptionLabels: { 已通过: '通过', 已驳回: '驳回' },
        editableStatuses: this.mode === 'user' ? ['待审核', '已驳回'] : undefined,
        resubmitStatuses: ['已驳回'],
        resubmitStatus: '待审核',
        markReviewingOnDetail: true,
        markReviewingOnStatusOpen: true,
        loadDetailBeforeStatus: true,
        statusActionLabel: '审核',
        fields: [
          { key: 'companyId', label: '企业', hideInForm: true },
          { key: 'qualificationType', label: '资质类型', required: true, options: ['高新技术企业', '专精特新企业', '科技型中小企业', '创新型中小企业'] },
          { key: 'applyTime', label: '申请时间', type: 'datetime', hideInForm: true },
          { key: 'contactName', label: '联系人', required: true },
          { key: 'contactPhone', label: '联系电话', required: true },
          { key: 'applyReason', label: '申请原因', type: 'textarea', required: true, wide: true, maxlength: 1000 }
        ]
      }
    },
    permissions() {
      if (this.mode === 'admin') return { create: false, edit: false, delete: true, changeStatus: true }
      if (this.mode === 'readonly') return { create: false, edit: false, delete: false, changeStatus: false }
      return { create: true, edit: true, delete: true, changeStatus: false }
    }
  },
  methods: {
    cleanUploadFile(file) {
      const normalized = recordManager.methods.cleanUploadFile.call(this, file)
      return this.editingId ? cleanQualificationUploadFile(normalized) : normalized
    },
    fileIcon(file) {
      return getFileTypeIcon(file)
    }
  }
}
</script>

<style lang="scss" src="../../_shared/record-management/record-feature-page.scss"></style>
