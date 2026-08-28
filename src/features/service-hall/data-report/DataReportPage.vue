<!-- 数据上报业务组件：独立维护企业数据分类上报、附件上传、办理状态和终端权限。 -->
<template>
  <main class="record-feature-page">
    <header class="record-feature-hero">
      <div class="record-feature-hero__title">
        <span class="record-feature-hero__icon"><i :class="resource.icon"></i></span>
        <div>
          <h2>{{ resource.title }}</h2>
          <p>{{ resource.description }}</p>
        </div>
      </div>
      <el-button v-if="canCreate" type="primary" icon="el-icon-upload2" @click="openCreate">新增数据上报</el-button>
    </header>
    <section v-loading="loading" class="record-feature-surface">
      <div class="record-feature-toolbar">
        <el-input v-model.trim="keyword" clearable prefix-icon="el-icon-search" placeholder="搜索上报编号、企业或内容" @input="resetPage" @clear="resetPage" />
        <el-select v-model="typeFilter" clearable placeholder="全部上报分类" @change="resetPage" @clear="resetPage">
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
              <i class="el-icon-document"></i>
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
      <el-empty v-else class="record-feature-empty" description="暂无数据上报记录" />
      <div v-if="paginationTotal" class="record-feature-pagination">
        <span>共 {{ paginationTotal }} 条</span>
        <el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="paginationTotal" layout="prev, pager, next" @current-change="loadRecords" />
      </div>
    </section>

    <el-dialog :title="formDialogTitle" :visible.sync="formVisible" top="4vh" append-to-body :close-on-click-modal="false" custom-class="record-feature-form" @closed="resetForm">
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
          <business-attachment-field v-model="form.uploadFiles" class="record-feature-attachment" label="上报附件" :limit="9" tip="单个文件不超过 10MB，最多上传 9 个。" />
        </div>
      </el-form>
      <span slot="footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">{{ isResubmitting ? '重新提交' : '提交上报' }}</el-button>
      </span>
    </el-dialog>

    <el-drawer title="数据上报详情" :visible.sync="detailVisible" size="520px" append-to-body>
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
          <h4>上报内容</h4>
          <p>{{ selectedRecord.reportContent || '-' }}</p>
        </section>
        <section v-if="detailFiles.length" class="record-feature-detail__section">
          <h4>上报附件</h4>
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
      title="审核数据上报"
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

export default {
  name: 'DataReportPage',
  components: { BusinessAttachmentField, BusinessRecordField, RecordAuditDialog },
  mixins: [recordManager],
  props: {
    mode: { type: String, default: 'user' },
    title: { type: String, default: '数据上报' },
    listType: { type: Number, default: 0 }
  },
  computed: {
    resource() {
      return {
        title: this.title,
        itemName: '数据上报',
        description: this.mode === 'admin' ? '查收企业上报数据、核对附件并维护办理进度。' : '按知识产权、财务或员工分类上报企业资料。',
        icon: 'el-icon-upload2',
        idPrefix: 'DR',
        apiNamespace: 'tobDataReport',
        listParams: { type: this.mode === 'admin' ? 1 : this.listType },
        primaryKey: 'reportType',
        timeKey: 'reportTime',
        autoFormFields: { companyId: 'currentUserName', reportTime: 'now' },
        contentKey: 'reportContent',
        uploadField: 'uploadFiles',
        uploadResponseField: 'uploadFiles',
        loadDetailBeforeEdit: true,
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
          { key: 'reportType', label: '上报分类', required: true, options: ['知识产权', '财务数据', '员工数据'] },
          { key: 'reportTime', label: '上报时间', type: 'datetime', hideInForm: true },
          { key: 'reportContent', label: '上报内容', type: 'textarea', required: true, wide: true }
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
    fileIcon(file) {
      return getFileTypeIcon(file)
    }
  }
}
</script>

<style lang="scss" src="../../_shared/record-management/record-feature-page.scss"></style>
