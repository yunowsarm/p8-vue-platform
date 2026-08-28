<!-- 资料下载业务组件：独立维护资料分类、附件下载和管理端内容操作。 -->
<template>
  <main class="record-feature-page">
    <header class="record-feature-hero">
      <div class="record-feature-hero__title">
        <span class="record-feature-hero__icon"><i class="el-icon-folder-opened"></i></span>
        <div>
          <h2>资料下载</h2>
          <p>{{ mode === 'admin' ? '上传和维护企业办事指南、模板及园区资料。' : '查阅并下载办事指南、表单模板和园区资料。' }}</p>
        </div>
      </div>
      <el-button v-if="canCreate" type="primary" icon="el-icon-plus" @click="openCreate">新增资料</el-button>
    </header>
    <section v-loading="loading" class="record-feature-surface">
      <div class="record-feature-toolbar">
        <el-input v-model.trim="keyword" clearable prefix-icon="el-icon-search" placeholder="搜索资料标题或描述" @input="resetPage" @clear="resetPage" />
        <el-select v-model="typeFilter" clearable placeholder="全部资料分类" @change="resetPage" @clear="resetPage">
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
              <i class="el-icon-document"></i>
              {{ record.id }}
            </span>
            <el-tag size="small">{{ record.type || '园区资料' }}</el-tag>
          </div>
          <h3>{{ record.title }}</h3>
          <p class="record-feature-card__description">{{ record.description || '-' }}</p>
          <dl>
            <dt>资料分类</dt>
            <dd>{{ record.type || '-' }}</dd>
            <dt>创建时间</dt>
            <dd>{{ record.itemCreateTime || '-' }}</dd>
          </dl>
          <div v-if="hasRecordActions(record)" class="record-feature-card__actions">
            <div class="record-feature-card__actions-right">
              <el-button v-if="canEditRecord(record)" type="text" size="mini" @click.stop="openEdit(record)">编辑</el-button>
              <el-button v-if="canDeleteRecord(record)" type="text" size="mini" class="danger-action" @click.stop="removeRecord(record)">删除</el-button>
            </div>
          </div>
        </article>
      </div>
      <el-empty v-else class="record-feature-empty" description="暂无可下载资料" />
      <div v-if="paginationTotal" class="record-feature-pagination">
        <span>共 {{ paginationTotal }} 条</span>
        <el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="paginationTotal" layout="prev, pager, next" @current-change="loadRecords" />
      </div>
    </section>

    <el-dialog :title="formDialogTitle" :visible.sync="formVisible" top="4vh" append-to-body :close-on-click-modal="false" custom-class="record-feature-form" @closed="resetForm">
      <el-form ref="recordForm" :model="form" :rules="rules" label-width="90px" @submit.native.prevent>
        <div class="record-feature-form-grid document-download-form-grid">
          <business-record-field
            v-for="field in formFields"
            :key="field.key"
            v-model="form[field.key]"
            :field="field"
            :class="{ 'record-feature-field--wide': field.wide || field.type === 'textarea' }" />
          <business-attachment-field v-model="form.uploadFiles" class="record-feature-attachment" label="资料附件" :limit="9" tip="单个附件不超过 10MB，最多上传 9 个。" />
        </div>
      </el-form>
      <span slot="footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">保存资料</el-button>
      </span>
    </el-dialog>

    <el-drawer title="资料详情" :visible.sync="detailVisible" size="520px" append-to-body>
      <div v-if="selectedRecord" v-loading="detailLoading" class="record-feature-detail">
        <div class="record-feature-detail__hero">
          <i class="el-icon-folder-opened"></i>
          <div>
            <small>{{ selectedRecord.type || '园区资料' }}</small>
            <h3>{{ selectedRecord.title }}</h3>
          </div>
        </div>
        <div class="record-feature-detail__grid">
          <div class="record-feature-detail__item">
            <small>资料分类</small>
            <b>{{ selectedRecord.type || '-' }}</b>
          </div>
          <div class="record-feature-detail__item">
            <small>创建时间</small>
            <b>{{ selectedRecord.itemCreateTime || '-' }}</b>
          </div>
        </div>
        <section class="record-feature-detail__section">
          <h4>资料描述</h4>
          <p>{{ selectedRecord.description || '-' }}</p>
        </section>
        <section class="record-feature-detail__section">
          <h4>附件下载</h4>
          <div v-if="detailFiles.length" class="record-feature-files">
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
          <el-empty v-else :image-size="56" description="暂无附件" />
        </section>
        <div v-if="canEditRecord(selectedRecord)" class="record-feature-card__actions">
          <el-button v-if="canEditRecord(selectedRecord)" type="primary" @click="openEdit(selectedRecord)">编辑资料</el-button>
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
import { createDocumentDownloadConfig } from './definition'

export default {
  name: 'DocumentDownloadPage',
  components: { BusinessAttachmentField, BusinessRecordField },
  mixins: [recordManager],
  props: { mode: { type: String, default: 'viewer' } },
  computed: {
    resource() {
      return Object.assign(createDocumentDownloadConfig({ readOnly: this.mode !== 'admin' }), { autoFormFields: { itemCreateTime: 'now' } })
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

<style lang="scss" scoped>
.document-download-form-grid {
  grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
}

@media (max-width: 760px) {
  .document-download-form-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
