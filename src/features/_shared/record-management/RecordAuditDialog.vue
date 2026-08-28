<!-- 通用审核弹窗：只读展示业务数据，仅允许管理员修改审核状态。 -->
<template>
  <el-dialog :title="title" :visible="visible" width="680px" append-to-body :close-on-click-modal="false" custom-class="record-audit-dialog" @update:visible="$emit('input', $event)">
    <div v-loading="loading">
      <div v-if="record" class="record-audit-summary">
        <div v-for="field in visibleFields" :key="field.key" class="record-audit-summary__item" :class="{ 'record-audit-summary__item--wide': field.wide || field.type === 'textarea' }">
          <span>{{ field.label }}</span>
          <strong>{{ formatter(record[field.key], field.key) }}</strong>
        </div>
      </div>
      <div v-if="record && contentKey" class="record-audit-content">
        <span>{{ contentLabel }}</span>
        <strong>{{ formatter(record[contentKey], contentKey) }}</strong>
      </div>
      <div v-if="files.length" class="record-audit-files">
        <span class="record-audit-files__label">申请附件</span>
        <button
          v-for="file in files"
          :key="file.id || file.attachmentId || file.uid || file.url || file.fileName"
          type="button"
          class="record-feature-file-link"
          :title="file.fileName || file.name || '附件'"
          @click="$emit('download', file)">
          <img class="record-feature-file-icon" :src="fileIcon(file)" alt="" aria-hidden="true" />
          <span class="record-feature-file-name">{{ file.fileName || file.name || '附件' }}</span>
        </button>
      </div>
      <el-form label-width="92px" class="record-audit-form">
        <el-form-item label="审核状态" required>
          <el-select :value="status" class="record-feature-full" placeholder="请选择审核状态" @input="$emit('update:status', $event)">
            <el-option v-for="option in statusOptions" :key="option" :label="statusLabels[option] || option" :value="option" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <span slot="footer">
      <el-button @click="$emit('input', false)">取消</el-button>
      <el-button type="primary" :loading="submitting" :disabled="loading || !status" @click="$emit('confirm')">确认审核</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getFileTypeIcon } from '@/utils/fileTypeIcon'

export default {
  name: 'RecordAuditDialog',
  props: {
    value: { type: Boolean, default: false },
    title: { type: String, default: '审核申请' },
    loading: { type: Boolean, default: false },
    submitting: { type: Boolean, default: false },
    record: { type: Object, default: null },
    fields: { type: Array, default: () => [] },
    files: { type: Array, default: () => [] },
    contentKey: { type: String, default: '' },
    statusOptions: { type: Array, default: () => [] },
    statusLabels: { type: Object, default: () => ({}) },
    status: { type: [String, Number], default: '' },
    formatter: { type: Function, default: (value) => (value === undefined || value === null || value === '' ? '-' : value) }
  },
  computed: {
    visible() {
      return this.value
    },
    visibleFields() {
      return this.fields.filter((field) => field.key !== this.contentKey)
    },
    contentLabel() {
      const field = this.fields.find((item) => item.key === this.contentKey)
      return (field && field.label) || '申请内容'
    }
  },
  methods: {
    fileIcon(file) {
      return getFileTypeIcon(file)
    }
  }
}
</script>
