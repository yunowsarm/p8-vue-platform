<!-- 租赁申请业务组件：独立呈现续租、退租和扩租流程，并按终端模式控制处理操作。 -->
<template>
  <main class="record-feature-page">
    <header class="record-feature-hero">
      <div class="record-feature-hero__title">
        <span class="record-feature-hero__icon"><i :class="resource.icon"></i></span>
        <div>
          <h2>租赁申请</h2>
          <p>{{ mode === 'admin' ? '处理企业续租、退租和扩租申请。' : '发起续租、退租或扩租申请并查看进度。' }}</p>
        </div>
      </div>
      <el-button v-if="canCreate" type="primary" icon="el-icon-plus" @click="openCreate">新增租赁申请</el-button>
    </header>
    <section v-loading="loading" class="record-feature-surface">
      <div class="record-feature-toolbar">
        <el-input v-model.trim="keyword" clearable prefix-icon="el-icon-search" placeholder="搜索申请编号、企业或合同" @input="resetPage" @clear="resetPage" />
        <el-select v-model="typeFilter" clearable placeholder="全部申请类型" @change="resetPage" @clear="resetPage">
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
              <span :class="['lease-type-icon', `lease-type-icon--${leaseTypeKey(record.applyType)}`]" aria-hidden="true">
                {{ leaseTypeMark(record.applyType) }}
              </span>
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
              <el-button v-if="canEditRecord(record)" type="text" size="mini" @click.stop="openEdit(record)">编辑</el-button>
              <el-button v-if="canDeleteRecord(record)" type="text" size="mini" class="danger-action" @click.stop="removeRecord(record)">删除</el-button>
            </div>
          </div>
        </article>
      </div>
      <el-empty v-else class="record-feature-empty" description="暂无租赁申请" />
      <div v-if="paginationTotal" class="record-feature-pagination">
        <span>共 {{ paginationTotal }} 条</span>
        <el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="paginationTotal" layout="prev, pager, next" @current-change="loadRecords" />
      </div>
    </section>

    <el-dialog :title="formDialogTitle" :visible.sync="formVisible" top="3vh" append-to-body :close-on-click-modal="false" custom-class="record-feature-form" @closed="resetForm">
      <el-form ref="recordForm" :model="form" :rules="rules" :validate-on-rule-change="false" label-width="112px" @submit.native.prevent>
        <div class="record-feature-form-grid">
          <business-record-field
            v-for="field in formFields"
            :key="field.key"
            v-model="form[field.key]"
            :field="field"
            :enterprise-options="enterpriseOptions"
            :enterprise-loading="enterpriseLoading"
            :class="{ 'record-feature-field--wide': field.wide || field.type === 'textarea' }" />
          <business-attachment-field v-model="form.uploadFiles" class="record-feature-attachment" label="申请附件" :limit="resource.uploadLimit" :tip="resource.uploadTip" />
        </div>
      </el-form>
      <span slot="footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">提交申请</el-button>
      </span>
    </el-dialog>

    <el-drawer title="租赁申请详情" :visible.sync="detailVisible" size="560px" append-to-body>
      <div v-if="selectedRecord" v-loading="detailLoading" class="record-feature-detail">
        <div class="record-feature-detail__hero">
          <span :class="['lease-type-icon', 'lease-type-icon--detail', `lease-type-icon--${leaseTypeKey(selectedRecord.applyType)}`]" aria-hidden="true">
            {{ leaseTypeMark(selectedRecord.applyType) }}
          </span>
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
        <section v-if="selectedRecord.remark" class="record-feature-detail__section">
          <h4>补充说明</h4>
          <p>{{ selectedRecord.remark }}</p>
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
  </main>
</template>

<script>
import BusinessAttachmentField from '@/components/business/record-fields/BusinessAttachmentField'
import BusinessRecordField from '@/components/business/record-fields/BusinessRecordField'
import recordManager from '@/features/_shared/record-management/recordManager'
import { getFileTypeIcon } from '@/utils/fileTypeIcon'
import { getLeaseApplicationConfig } from './definition'
import { getLeaseApplicationPolicy } from './policies'

export default {
  name: 'LeaseApplicationPage',
  components: { BusinessAttachmentField, BusinessRecordField },
  mixins: [recordManager],
  props: { mode: { type: String, default: 'user' } },
  computed: {
    resource() {
      return getLeaseApplicationConfig(this.mode)
    },
    permissions() {
      return getLeaseApplicationPolicy(this.mode)
    }
  },
  methods: {
    leaseTypeKey(type) {
      return { renew: 'renew', vacate: 'vacate', expand: 'expand', 续租申请: 'renew', 退租申请: 'vacate', 扩租申请: 'expand' }[type] || 'default'
    },
    leaseTypeMark(type) {
      return { renew: '续', vacate: '退', expand: '扩', 续租申请: '续', 退租申请: '退', 扩租申请: '扩' }[type] || '租'
    },
    statusType(status) {
      return status === '已查阅' ? 'success' : 'info'
    },
    fileIcon(file) {
      return getFileTypeIcon(file)
    }
  }
}
</script>

<style lang="scss" src="../../_shared/record-management/record-feature-page.scss"></style>

<style lang="scss" scoped>
.lease-type-icon {
  display: inline-flex;
  width: 26px;
  height: 26px;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  flex: 0 0 26px;
  border: 1px solid currentColor;
  border-radius: 50%;
  background: #f4f7fb;
  color: #60758f;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
}

.lease-type-icon--renew {
  background: #eef6ff;
  color: #2878d0;
}

.lease-type-icon--vacate {
  background: #fff6eb;
  color: #c66a10;
}

.lease-type-icon--expand {
  background: #edf9f7;
  color: #198577;
}

.lease-type-icon--detail {
  width: 44px;
  height: 44px;
  flex-basis: 44px;
  border-width: 2px;
  font-size: 18px;
}
</style>
