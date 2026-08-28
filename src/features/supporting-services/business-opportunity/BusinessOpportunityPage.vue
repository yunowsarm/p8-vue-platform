<!-- 商机资源共享业务组件：独立维护商机发布、分类、联系人和内容。 -->
<template>
  <main class="record-feature-page">
    <header class="record-feature-hero">
      <div class="record-feature-hero__title">
        <span class="record-feature-hero__icon"><i class="el-icon-share"></i></span>
        <div>
          <h2>商机资源共享</h2>
          <p>{{ resource.description }}</p>
        </div>
      </div>
      <el-button v-if="canCreate" type="primary" icon="el-icon-plus" @click="openCreate">发布商机</el-button>
    </header>
    <section v-loading="loading" class="record-feature-surface">
      <div class="record-feature-toolbar">
        <el-input v-model.trim="keyword" clearable prefix-icon="el-icon-search" placeholder="搜索商机标题、企业或内容" @input="resetPage" @clear="resetPage" />
        <el-select v-model="typeFilter" clearable placeholder="全部商机类型" @change="resetPage" @clear="resetPage">
          <el-option v-for="option in primaryOptions" :key="optionValue(option)" :label="optionLabel(option)" :value="optionValue(option)" />
        </el-select>
        <el-select v-if="mode === 'admin' || mineOnly" v-model="statusFilter" clearable placeholder="全部状态" @change="resetPage" @clear="resetPage">
          <el-option v-for="status in statusOptions" :key="status" :label="status" :value="status" />
        </el-select>
        <el-checkbox v-if="mode === 'user'" v-model="mineOnly" class="record-feature-toolbar__checkbox" @change="handleMineFilterChange">我发布的</el-checkbox>
      </div>
      <el-table v-if="pagedRecords.length" :data="pagedRecords" stripe class="record-feature-table" @row-click="openDetail">
        <el-table-column prop="title" label="商机标题" min-width="220" show-overflow-tooltip />
        <el-table-column prop="type" label="商机类型" width="120" />
        <el-table-column label="发布企业" min-width="150" show-overflow-tooltip>
          <template slot-scope="scope">{{ formatValue(scope.row.companyId, 'companyId') }}</template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="170" />
        <el-table-column label="状态" width="90">
          <template slot-scope="scope">
            <el-tag :type="statusType(statusText(scope.row.status))" size="small">{{ statusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170" fixed="right">
          <template slot-scope="scope">
            <div class="record-feature-table__actions">
              <el-button type="text" size="mini" @click.stop="openDetail(scope.row)">详情</el-button>
              <el-button v-if="canChangeRecordStatus(scope.row)" type="text" size="mini" @click.stop="openStatusDialog(scope.row)">审核</el-button>
              <el-button v-if="canEditRecord(scope.row)" type="text" size="mini" @click.stop="openEdit(scope.row)">{{ isResubmitRecord(scope.row) ? '重新提交' : '编辑' }}</el-button>
              <el-button v-if="canDeleteRecord(scope.row)" type="text" size="mini" class="danger-action" @click.stop="removeRecord(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else class="record-feature-empty" description="暂无商机信息" />
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
            :enterprise-options="enterpriseOptions"
            :enterprise-loading="enterpriseLoading"
            :class="{ 'record-feature-field--wide': field.wide || field.type === 'textarea' }" />
        </div>
      </el-form>
      <span slot="footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">{{ isResubmitting ? '重新提交' : '保存商机' }}</el-button>
      </span>
    </el-dialog>
    <el-drawer title="商机详情" :visible.sync="detailVisible" size="540px" append-to-body>
      <div v-if="selectedRecord" v-loading="detailLoading" class="record-feature-detail">
        <div class="record-feature-detail__hero">
          <i class="el-icon-share"></i>
          <div>
            <small>{{ selectedRecord.type || '商机' }}</small>
            <h3>{{ selectedRecord.title || '商机资源' }}</h3>
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
          <h4>商机内容</h4>
          <p>{{ selectedRecord.content || '-' }}</p>
        </section>
      </div>
    </el-drawer>

    <record-audit-dialog
      v-model="statusVisible"
      title="审核商机资源"
      :loading="statusLoading"
      :submitting="statusSubmitting"
      :record="statusTarget"
      :fields="resource.fields"
      :content-key="resource.contentKey"
      :status-options="availableStatusOptions"
      :status-labels="resource.statusOptionLabels"
      :status.sync="statusForm.status"
      :formatter="formatValue"
      @confirm="saveStatus" />
  </main>
</template>

<script>
import BusinessRecordField from '@/components/business/record-fields/BusinessRecordField'
import RecordAuditDialog from '@/features/_shared/record-management/RecordAuditDialog'
import recordManager from '@/features/_shared/record-management/recordManager'
export default {
  name: 'BusinessOpportunityPage',
  components: { BusinessRecordField, RecordAuditDialog },
  mixins: [recordManager],
  props: { mode: { type: String, default: 'user' } },
  data() {
    return { mineOnly: false }
  },
  computed: {
    resource() {
      const adminMode = this.mode === 'admin'
      const listParams = adminMode ? {} : this.mineOnly ? { createBy: this.currentUserId() } : { status: 2 }
      return {
        title: '商机资源共享',
        itemName: '商机',
        createSuccessMessage: '发布成功，请等待审核',
        description: adminMode ? '审核企业发布的商机资源，维护公开展示状态。' : '发布供需合作、招商、技术合作和采购商机。',
        icon: 'el-icon-share',
        idPrefix: 'BO',
        apiNamespace: 'tobBusinessOpportunity',
        listParams,
        primaryKey: 'type',
        cardTitleKey: 'title',
        timeKey: 'publishTime',
        contentKey: 'content',
        autoFormFields: { companyId: 'currentUserName', publishTime: 'now' },
        defaultStatus: '待审核',
        statusMap: { 0: '待审核', 1: '审核中', 2: '已通过', 3: '已驳回' },
        statusValueMap: { 待审核: 0, 审核中: 1, 已通过: 2, 已驳回: 3 },
        listStatusValueMap: { 待审核: 0, 审核中: 1, 已通过: 2, 已驳回: 3 },
        statusOptions: ['待审核', '审核中', '已通过', '已驳回'],
        statusTransitions: { 待审核: ['已通过', '已驳回'], 审核中: ['已通过', '已驳回'] },
        statusOptionLabels: { 已通过: '通过', 已驳回: '驳回' },
        editableStatuses: ['待审核', '已驳回'],
        resubmitStatuses: ['已驳回'],
        resubmitStatus: '待审核',
        markReviewingOnDetail: adminMode,
        markReviewingOnStatusOpen: adminMode,
        loadDetailBeforeStatus: true,
        fields: [
          { key: 'companyId', label: '发布企业', hideInForm: true },
          { key: 'title', label: '商机标题', required: true, wide: true },
          { key: 'type', label: '商机类型', required: true, options: ['供需合作', '项目招商', '技术合作', '采购需求', '其他'] },
          { key: 'publishTime', label: '发布时间', type: 'datetime', hideInForm: true },
          { key: 'contactName', label: '联系人', required: true },
          { key: 'contactPhone', label: '联系电话', required: true },
          { key: 'content', label: '商机内容', type: 'textarea', required: true, wide: true }
        ]
      }
    },
    permissions() {
      if (this.mode === 'admin') return { create: false, edit: false, delete: true, changeStatus: true }
      return {
        create: true,
        edit: ({ record }) => this.mineOnly && this.isOwnRecord(record),
        delete: false,
        changeStatus: false
      }
    }
  },
  methods: {
    isOwnRecord(record) {
      return Boolean(record && String(record.createBy || '') === String(this.currentUserId()))
    },
    handleMineFilterChange() {
      this.statusFilter = ''
      this.resetPage()
    }
  }
}
</script>
<style lang="scss" src="../../_shared/record-management/record-feature-page.scss"></style>

<style lang="scss" scoped>
.record-feature-toolbar__checkbox {
  margin-left: auto;
  white-space: nowrap;
}

@media (max-width: 760px) {
  .record-feature-toolbar__checkbox {
    margin-left: 0;
  }
}
</style>
