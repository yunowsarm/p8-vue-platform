<!-- 建议投诉业务组件：独立维护投诉建议的页面结构、字段定义、回复规则和接口命名空间。 -->
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
      <el-button v-if="canCreate" type="primary" icon="el-icon-plus" @click="openCreate">新增建议投诉</el-button>
    </header>

    <section v-loading="loading" class="record-feature-surface">
      <div class="record-feature-toolbar">
        <el-input v-model.trim="keyword" clearable prefix-icon="el-icon-search" placeholder="搜索编号、联系人或内容" @input="resetPage" @clear="resetPage" />
        <el-select v-model="typeFilter" clearable placeholder="全部类型" @change="resetPage" @clear="resetPage">
          <el-option v-for="option in primaryOptions" :key="optionValue(option)" :label="optionLabel(option)" :value="optionValue(option)" />
        </el-select>
        <el-select v-if="hasStatus" v-model="statusFilter" clearable placeholder="全部状态" @change="resetPage" @clear="resetPage">
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
            <el-tag v-if="hasStatus" :type="statusType(statusText(record.status))" size="small">{{ statusText(record.status) }}</el-tag>
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
              <el-button v-if="canEditRecord(record)" type="text" size="mini" @click.stop="openEdit(record)">{{ resource.editActionLabel || '编辑' }}</el-button>
              <el-button v-if="canDeleteRecord(record)" type="text" size="mini" class="danger-action" @click.stop="removeRecord(record)">删除</el-button>
            </div>
          </div>
        </article>
      </div>
      <el-empty v-else class="record-feature-empty" description="暂无建议投诉记录" />
      <div v-if="paginationTotal" class="record-feature-pagination">
        <span>共 {{ paginationTotal }} 条</span>
        <el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="paginationTotal" layout="prev, pager, next" @current-change="loadRecords" />
      </div>
    </section>

    <el-dialog :title="formDialogTitle" :visible.sync="formVisible" top="5vh" append-to-body :close-on-click-modal="false" custom-class="record-feature-form" @closed="resetForm">
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
        <el-button type="primary" :loading="submitting" @click="submitForm">{{ resource.replyMode ? '提交回复' : '提交' }}</el-button>
      </span>
    </el-dialog>

    <el-drawer title="建议投诉详情" :visible.sync="detailVisible" size="520px" append-to-body>
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
          <h4>{{ resource.contentLabel }}</h4>
          <p>{{ selectedRecord[resource.contentKey] || '-' }}</p>
        </section>
        <section v-if="selectedRecord.reply" class="record-feature-detail__section">
          <h4>回复内容</h4>
          <p>{{ selectedRecord.reply }}</p>
        </section>
        <div v-if="canEditRecord(selectedRecord)" class="record-feature-card__actions">
          <el-button v-if="canEditRecord(selectedRecord)" type="primary" @click="openEdit(selectedRecord)">{{ resource.editActionLabel || '编辑' }}</el-button>
        </div>
      </div>
    </el-drawer>
  </main>
</template>

<script>
import BusinessRecordField from '@/components/business/record-fields/BusinessRecordField'
import recordManager from '@/features/_shared/record-management/recordManager'

export default {
  name: 'ComplaintSuggestionPage',
  components: { BusinessRecordField },
  mixins: [recordManager],
  props: { mode: { type: String, default: 'user' } },
  computed: {
    resource() {
      return {
        title: '建议投诉',
        itemName: '建议投诉',
        description: this.mode === 'admin' ? '受理并回复企业提交的建议和投诉。' : '提交园区服务建议或投诉，并查看回复进度。',
        icon: 'el-icon-chat-dot-round',
        idPrefix: 'SC',
        apiNamespace: 'feedbackComplaint',
        primaryKey: 'type',
        timeKey: 'submitTime',
        contentKey: 'content',
        contentLabel: '内容',
        cardFields: [
          { key: 'contactName', label: '联系人' },
          { key: 'submitTime', label: '提交时间' }
        ],
        defaultStatus: '待回复',
        statusOptions: ['待回复', '已回复'],
        replyMode: this.mode === 'admin',
        replyStatus: '已回复',
        editActionLabel: this.mode === 'admin' ? '回复' : '编辑',
        fields: [
          { key: 'companyId', label: '企业', required: true, hideInReplyForm: true },
          { key: 'contactName', label: '联系人', required: true, hideInReplyForm: true },
          { key: 'contactPhone', label: '联系电话', required: true, hideInReplyForm: true },
          { key: 'type', label: '类型', required: true, options: ['建议', '投诉'], hideInReplyForm: true },
          { key: 'submitTime', label: '提交时间', type: 'datetime', required: true, hideInReplyForm: true },
          { key: 'content', label: '内容', type: 'textarea', required: true, hideInReplyForm: true, wide: true },
          { key: 'reply', label: '回复内容', type: 'textarea', required: true, hideInCreateForm: true, hideInDetail: true, wide: true }
        ]
      }
    },
    permissions() {
      if (this.mode === 'admin') return { create: false, edit: true, delete: true, changeStatus: false }
      if (this.mode === 'readonly') return { create: false, edit: false, delete: false, changeStatus: false }
      return { create: true, edit: true, delete: true, changeStatus: false }
    }
  }
}
</script>

<style lang="scss" src="../../_shared/record-management/record-feature-page.scss"></style>
