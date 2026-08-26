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
              <el-button v-if="canChangeRecordStatus(record)" type="text" size="mini" @click.stop="openStatusDialog(record)">更新进度</el-button>
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
        <el-button type="primary" :loading="submitting" @click="submitForm">提交上报</el-button>
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
        <div v-if="canChangeRecordStatus(selectedRecord) || canEditRecord(selectedRecord)" class="record-feature-card__actions">
          <div>
            <el-button v-if="canChangeRecordStatus(selectedRecord)" @click="openStatusDialog(selectedRecord)">更新进度</el-button>
            <el-button v-if="canEditRecord(selectedRecord)" type="primary" @click="openEdit(selectedRecord)">编辑</el-button>
          </div>
        </div>
      </div>
    </el-drawer>

    <el-dialog title="更新数据上报进度" :visible.sync="statusVisible" width="430px" append-to-body :close-on-click-modal="false">
      <el-form :model="statusForm" label-width="86px">
        <el-form-item label="下一状态">
          <el-select v-model="statusForm.status" class="record-feature-full"><el-option v-for="status in availableStatusOptions" :key="status" :label="status" :value="status" /></el-select>
        </el-form-item>
        <el-form-item label="处理备注"><el-input v-model.trim="statusForm.remark" type="textarea" :rows="3" maxlength="300" show-word-limit /></el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="statusVisible = false">取消</el-button>
        <el-button type="primary" :loading="statusSubmitting" @click="saveStatus">确认更新</el-button>
      </span>
    </el-dialog>
  </main>
</template>

<script>
import BusinessAttachmentField from '@/components/business/record-fields/BusinessAttachmentField'
import BusinessRecordField from '@/components/business/record-fields/BusinessRecordField'
import recordManager from '@/features/_shared/record-management/recordManager'
import { getFileTypeIcon } from '@/utils/fileTypeIcon'

export default {
  name: 'DataReportPage',
  components: { BusinessAttachmentField, BusinessRecordField },
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
        listParams: { type: this.listType },
        primaryKey: 'reportType',
        timeKey: 'reportTime',
        contentKey: 'reportContent',
        uploadField: 'uploadFiles',
        uploadResponseField: 'uploadFiles',
        defaultStatus: '待受理',
        statusOptions: ['待受理', '处理中', '已完成', '已关闭'],
        statusTransitions: { 待受理: ['处理中', '已关闭'], 处理中: ['已完成', '已关闭'] },
        fields: [
          { key: 'companyId', label: '企业', required: true },
          { key: 'reportType', label: '上报分类', required: true, options: ['知识产权', '财务数据', '员工数据'] },
          { key: 'reportTime', label: '上报时间', type: 'datetime', required: true },
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
