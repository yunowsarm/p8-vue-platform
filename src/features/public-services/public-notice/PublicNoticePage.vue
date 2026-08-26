<!-- 通知公告业务组件：根据入口配置加载指定范围公告，并维护展示、附件、发布表单和管理权限。 -->
<template>
  <main class="record-feature-page">
    <header class="record-feature-hero">
      <div class="record-feature-hero__title">
        <span class="record-feature-hero__icon"><i class="el-icon-bell"></i></span>
        <div>
          <h2>通知公告</h2>
          <p>{{ mode === 'admin' ? '发布和维护园区通知公告。' : '查看园区最新公告、活动通知和安全提醒。' }}</p>
        </div>
      </div>
      <el-button v-if="canCreate" type="primary" icon="el-icon-plus" @click="openCreate">发布公告</el-button>
    </header>
    <section v-loading="loading" class="record-feature-surface">
      <div class="record-feature-toolbar">
        <el-input v-model.trim="keyword" clearable prefix-icon="el-icon-search" placeholder="搜索公告标题或内容" @input="resetPage" @clear="resetPage" />
        <el-select v-model="typeFilter" clearable placeholder="全部公告场景" @change="resetPage" @clear="resetPage">
          <el-option v-for="option in primaryOptions" :key="optionValue(option)" :label="optionLabel(option)" :value="optionValue(option)" />
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
              <i class="el-icon-bell"></i>
              {{ record.id }}
            </span>
            <el-tag size="small" type="primary">{{ record.sceneType || '通知公告' }}</el-tag>
          </div>
          <h3>{{ record.title }}</h3>
          <p class="record-feature-card__description">{{ record.content || '-' }}</p>
          <dl>
            <dt>发布人</dt>
            <dd>{{ record.createByName || '-' }}</dd>
            <dt>发布时间</dt>
            <dd>{{ record.publishTime || '-' }}</dd>
          </dl>
          <div v-if="hasRecordActions(record)" class="record-feature-card__actions">
            <div class="record-feature-card__actions-right">
              <el-button v-if="canEditRecord(record)" type="text" size="mini" @click.stop="openEdit(record)">编辑</el-button>
              <el-button v-if="canDeleteRecord(record)" type="text" size="mini" class="danger-action" @click.stop="removeRecord(record)">删除</el-button>
            </div>
          </div>
        </article>
      </div>
      <el-empty v-else class="record-feature-empty" description="暂无通知公告" />
      <div v-if="paginationTotal" class="record-feature-pagination">
        <span>共 {{ paginationTotal }} 条</span>
        <el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="paginationTotal" layout="prev, pager, next" @current-change="loadRecords" />
      </div>
    </section>

    <el-dialog :title="formDialogTitle" :visible.sync="formVisible" top="4vh" append-to-body :close-on-click-modal="false" custom-class="record-feature-form" @closed="resetForm">
      <el-form ref="recordForm" :model="form" :rules="rules" label-width="90px" @submit.native.prevent>
        <div class="record-feature-form-grid">
          <business-record-field
            v-for="field in formFields"
            :key="field.key"
            v-model="form[field.key]"
            :field="field"
            :class="{ 'record-feature-field--wide': field.wide || field.type === 'textarea' }" />
          <business-attachment-field v-model="form.uploadFiles" class="record-feature-attachment" label="公告附件" :limit="9" tip="单个附件不超过 10MB，最多上传 9 个。" />
        </div>
      </el-form>
      <span slot="footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">发布公告</el-button>
      </span>
    </el-dialog>

    <el-drawer title="通知公告详情" :visible.sync="detailVisible" size="540px" append-to-body>
      <div v-if="selectedRecord" v-loading="detailLoading" class="record-feature-detail">
        <div class="record-feature-detail__hero">
          <i class="el-icon-bell"></i>
          <div>
            <small>{{ selectedRecord.sceneType || '通知公告' }}</small>
            <h3>{{ selectedRecord.title }}</h3>
          </div>
        </div>
        <div class="record-feature-detail__grid">
          <div class="record-feature-detail__item">
            <small>发布人</small>
            <b>{{ selectedRecord.createByName || '-' }}</b>
          </div>
          <div class="record-feature-detail__item">
            <small>发布时间</small>
            <b>{{ selectedRecord.publishTime || '-' }}</b>
          </div>
        </div>
        <section class="record-feature-detail__section">
          <h4>公告内容</h4>
          <p>{{ selectedRecord.content || '-' }}</p>
        </section>
        <section v-if="detailFiles.length" class="record-feature-detail__section">
          <h4>公告附件</h4>
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
        <div v-if="canEditRecord(selectedRecord)" class="record-feature-card__actions">
          <el-button v-if="canEditRecord(selectedRecord)" type="primary" @click="openEdit(selectedRecord)">编辑公告</el-button>
        </div>
      </div>
    </el-drawer>
  </main>
</template>

<script>
import BusinessAttachmentField from '@/components/business/record-fields/BusinessAttachmentField'
import BusinessRecordField from '@/components/business/record-fields/BusinessRecordField'
import recordManager from '@/features/_shared/record-management/recordManager'
import { getFileTypeIcon } from '@/utils/fileTypeIcon'
import { NOTICE_SCENE_TYPE_OPTIONS, NOTICE_VISIBILITY_OPTIONS } from './definition'

const normalizeNoticeFiles = (value) => {
  if (!Array.isArray(value)) return []
  return value.map((file, index) =>
    Object.assign({}, file, {
      name: file.name || file.fileName,
      uid: file.uid || file.attachmentId || file.id || `notice-file-${index}`,
      status: file.status || 'success'
    })
  )
}

const normalizeNoticeRecord = (record) => {
  const normalized = Object.assign({}, record)
  const status = Number(normalized.status)
  normalized.status = [0, 1].includes(status) ? status : 0
  normalized.uploadFiles = normalizeNoticeFiles(normalized.uploadFiles)
  return normalized
}

export default {
  name: 'PublicNoticePage',
  components: { BusinessAttachmentField, BusinessRecordField },
  mixins: [recordManager],
  props: {
    mode: { type: String, default: 'viewer' },
    apiNamespace: { type: String, required: true },
    noticeType: { type: Number, default: null }
  },
  computed: {
    resource() {
      return {
        title: '通知公告',
        itemName: '公告',
        icon: 'el-icon-bell',
        idPrefix: 'NO',
        apiNamespace: this.apiNamespace,
        listParams: this.noticeType === null ? {} : { type: this.noticeType },
        primaryKey: 'title',
        filterKey: 'sceneType',
        timeKey: 'publishTime',
        contentKey: 'content',
        hasStatus: false,
        uploadField: 'uploadFiles',
        uploadResponseField: 'uploadFiles',
        loadDetailBeforeEdit: true,
        normalizeRecord: normalizeNoticeRecord,
        autoFormFields: { createByName: 'currentUserName', publishTime: 'now' },
        primaryOptions: NOTICE_SCENE_TYPE_OPTIONS,
        fields: [
          { key: 'title', label: '公告标题', required: true, wide: true },
          { key: 'sceneType', label: '公告场景', required: true, options: NOTICE_SCENE_TYPE_OPTIONS },
          { key: 'status', label: '可见范围', required: true, defaultValue: 0, options: NOTICE_VISIBILITY_OPTIONS },
          { key: 'createByName', label: '发布人', hideInForm: true },
          { key: 'publishTime', label: '发布时间', type: 'datetime', hideInForm: true },
          { key: 'content', label: '公告内容', type: 'textarea', required: true, wide: true }
        ]
      }
    },
    permissions() {
      return this.mode === 'admin' ? { create: true, edit: true, delete: true, changeStatus: false } : { create: false, edit: false, delete: false, changeStatus: false }
    }
  },
  methods: {
    fileIcon(file) {
      return getFileTypeIcon(file)
    }
  }
}
</script>

<style lang="scss" src="../../_shared/record-management/record-feature-page.scss"></style>
