<!-- 调查问卷业务组件：独立维护问卷标题、有效时间、说明和问卷附件。 -->
<template>
  <main class="record-feature-page">
    <header class="record-feature-hero">
      <div class="record-feature-hero__title">
        <span class="record-feature-hero__icon"><i class="el-icon-document-checked"></i></span>
        <div>
          <h2>调查问卷</h2>
          <p>{{ mode === 'admin' ? '创建和维护园区调查问卷及附件。' : '查看园区调查问卷及附件。' }}</p>
        </div>
      </div>
      <el-button v-if="canCreate" type="primary" icon="el-icon-plus" @click="openCreate">新增问卷</el-button>
    </header>
    <section v-loading="loading" class="record-feature-surface">
      <div class="record-feature-toolbar"><el-input v-model.trim="keyword" clearable prefix-icon="el-icon-search" placeholder="搜索问卷标题或说明" @input="resetPage" @clear="resetPage" /></div>
      <el-table v-if="pagedRecords.length" :data="pagedRecords" stripe class="record-feature-table" @row-click="openDetail">
        <el-table-column prop="title" label="问卷标题" min-width="250" show-overflow-tooltip />
        <el-table-column prop="startTime" label="开始时间" width="180" />
        <el-table-column prop="endTime" label="结束时间" width="180" />
        <el-table-column prop="description" label="问卷说明" min-width="220" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="scope">
            <div class="record-feature-table__actions">
              <el-button type="text" size="mini" @click.stop="openDetail(scope.row)">查看</el-button>
              <el-button v-if="canEditRecord(scope.row)" type="text" size="mini" @click.stop="openEdit(scope.row)">编辑</el-button>
              <el-button v-if="canDeleteRecord(scope.row)" type="text" size="mini" class="danger-action" @click.stop="removeRecord(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else class="record-feature-empty" description="暂无调查问卷" />
      <div v-if="paginationTotal" class="record-feature-pagination">
        <span>共 {{ paginationTotal }} 条</span>
        <el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="paginationTotal" layout="prev, pager, next" @current-change="loadRecords" />
      </div>
    </section>
    <el-dialog :title="formDialogTitle" :visible.sync="formVisible" append-to-body :close-on-click-modal="false" custom-class="record-feature-form" @closed="resetForm">
      <el-form ref="recordForm" :model="form" :rules="rules" label-width="90px">
        <div class="record-feature-form-grid">
          <business-record-field
            v-for="field in formFields"
            :key="field.key"
            v-model="form[field.key]"
            :field="field"
            :class="{ 'record-feature-field--wide': field.wide || field.type === 'textarea' }" />
          <business-attachment-field v-model="form.uploadFiles" class="record-feature-attachment" label="问卷附件" :limit="9" />
        </div>
      </el-form>
      <span slot="footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">保存问卷</el-button>
      </span>
    </el-dialog>
    <el-drawer title="调查问卷详情" :visible.sync="detailVisible" size="520px" append-to-body>
      <div v-if="selectedRecord" class="record-feature-detail">
        <div class="record-feature-detail__hero">
          <i class="el-icon-document-checked"></i>
          <div>
            <small>{{ selectedRecord.id }}</small>
            <h3>{{ selectedRecord.title }}</h3>
          </div>
        </div>
        <div class="record-feature-detail__grid">
          <div class="record-feature-detail__item">
            <small>开始时间</small>
            <b>{{ selectedRecord.startTime || '-' }}</b>
          </div>
          <div class="record-feature-detail__item">
            <small>结束时间</small>
            <b>{{ selectedRecord.endTime || '-' }}</b>
          </div>
        </div>
        <section class="record-feature-detail__section">
          <h4>问卷说明</h4>
          <p>{{ selectedRecord.description || '-' }}</p>
        </section>
        <section v-if="detailFiles.length" class="record-feature-detail__section">
          <h4>问卷附件</h4>
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
  </main>
</template>
<script>
import BusinessAttachmentField from '@/components/business/record-fields/BusinessAttachmentField'
import BusinessRecordField from '@/components/business/record-fields/BusinessRecordField'
import recordManager from '@/features/_shared/record-management/recordManager'
import { getFileTypeIcon } from '@/utils/fileTypeIcon'
export default {
  name: 'UserSurveyPage',
  components: { BusinessAttachmentField, BusinessRecordField },
  mixins: [recordManager],
  props: { mode: { type: String, default: 'user' } },
  computed: {
    resource() {
      return {
        title: '调查问卷',
        itemName: '问卷',
        icon: 'el-icon-document-checked',
        idPrefix: 'US',
        apiNamespace: 'tocUserSurvey',
        primaryKey: 'title',
        cardTitleKey: 'title',
        timeKey: 'startTime',
        contentKey: 'description',
        hasStatus: false,
        uploadField: 'uploadFiles',
        uploadResponseField: 'uploadFiles',
        fields: [
          { key: 'title', label: '问卷标题', required: true, wide: true },
          { key: 'startTime', label: '开始时间', type: 'datetime', required: true },
          { key: 'endTime', label: '结束时间', type: 'datetime', required: true },
          { key: 'description', label: '问卷说明', type: 'textarea', required: true, wide: true }
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
