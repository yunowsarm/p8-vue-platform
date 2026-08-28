<!-- 在线咨询业务组件：独立维护用户提问、管理端回复以及咨询详情展示。 -->
<template>
  <main class="record-feature-page">
    <header class="record-feature-hero">
      <div class="record-feature-hero__title">
        <span class="record-feature-hero__icon"><i class="el-icon-service"></i></span>
        <div>
          <h2>在线咨询</h2>
          <p>{{ mode === 'admin' ? '查看并回复用户提交的园区服务咨询。' : '提交园区服务问题，并随时查看专员回复。' }}</p>
        </div>
      </div>
      <el-button v-if="canCreate" type="primary" icon="el-icon-plus" @click="openCreate">发起咨询</el-button>
    </header>
    <section v-loading="loading" class="record-feature-surface">
      <div class="record-feature-toolbar">
        <el-input v-model.trim="keyword" clearable prefix-icon="el-icon-search" placeholder="搜索咨询编号、咨询人或内容" @input="resetPage" @clear="resetPage" />
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
          :aria-label="`查看咨询 ${record.id} 详情`"
          @click="openDetail(record)"
          @keydown.enter.self="openDetail(record)"
          @keydown.space.self.prevent="openDetail(record)">
          <div class="record-feature-card__head">
            <span class="record-feature-card__id">
              <i class="el-icon-chat-dot-round"></i>
              {{ record.id }}
            </span>
            <el-tag :type="statusType(statusText(record.status))" size="small">{{ statusText(record.status) }}</el-tag>
          </div>
          <h3 class="online-consultation-card__question" :title="record.content || '暂无咨询内容'">{{ record.content || '暂无咨询内容' }}</h3>
          <div class="online-consultation-card__meta">
            <div class="online-consultation-card__meta-item">
              <small>
                <i class="el-icon-user" aria-hidden="true"></i>
                咨询人
              </small>
              <span :title="record.userName || '-'">{{ record.userName || '-' }}</span>
            </div>
            <div class="online-consultation-card__meta-item">
              <small>
                <i class="el-icon-time" aria-hidden="true"></i>
                咨询时间
              </small>
              <span :title="record.consultTime || '-'">{{ record.consultTime || '-' }}</span>
            </div>
            <div class="online-consultation-card__meta-item">
              <small>
                <i class="el-icon-phone-outline" aria-hidden="true"></i>
                联系电话
              </small>
              <span :title="record.phone || '-'">{{ record.phone || '-' }}</span>
            </div>
          </div>
          <div v-if="hasRecordActions(record)" class="record-feature-card__actions">
            <div class="record-feature-card__actions-right">
              <el-button v-if="canEditRecord(record)" type="text" size="mini" @click.stop="openEdit(record)">{{ resource.editActionLabel }}</el-button>
              <el-button v-if="canDeleteRecord(record)" type="text" size="mini" class="danger-action" @click.stop="removeRecord(record)">删除</el-button>
            </div>
          </div>
        </article>
      </div>
      <el-empty v-else class="record-feature-empty" description="暂无在线咨询记录" />
      <div v-if="paginationTotal" class="record-feature-pagination">
        <span>共 {{ paginationTotal }} 条</span>
        <el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="paginationTotal" layout="prev, pager, next" @current-change="loadRecords" />
      </div>
    </section>

    <el-dialog :title="formDialogTitle" :visible.sync="formVisible" top="5vh" append-to-body :close-on-click-modal="false" custom-class="record-feature-form" @closed="resetForm">
      <el-form ref="recordForm" :model="form" :rules="rules" :label-width="mode === 'admin' ? '124px' : '96px'" @submit.native.prevent>
        <div class="record-feature-form-grid">
          <business-record-field
            v-for="field in formFields"
            :key="field.key"
            v-model="form[field.key]"
            :field="field"
            :class="{ 'record-feature-field--wide': field.wide || field.type === 'textarea' }" />
        </div>
      </el-form>
      <span slot="footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">{{ mode === 'admin' ? '提交回复' : '提交咨询' }}</el-button>
      </span>
    </el-dialog>

    <el-drawer title="在线咨询详情" :visible.sync="detailVisible" size="540px" append-to-body>
      <div v-if="selectedRecord" v-loading="detailLoading" class="record-feature-detail">
        <div class="record-feature-detail__hero">
          <i class="el-icon-service"></i>
          <div>
            <small>{{ selectedRecord.id }}</small>
            <h3>{{ selectedRecord.userName || '在线咨询' }}</h3>
          </div>
          <el-tag :type="statusType(statusText(selectedRecord.status))">{{ statusText(selectedRecord.status) }}</el-tag>
        </div>
        <div class="record-feature-detail__grid">
          <div class="record-feature-detail__item">
            <small>咨询人</small>
            <b>{{ selectedRecord.userName || '-' }}</b>
          </div>
          <div class="record-feature-detail__item">
            <small>咨询时间</small>
            <b>{{ selectedRecord.consultTime || '-' }}</b>
          </div>
          <div class="record-feature-detail__item">
            <small>联系电话</small>
            <b>{{ selectedRecord.phone || '-' }}</b>
          </div>
          <div class="record-feature-detail__item">
            <small>回复人</small>
            <b>{{ selectedRecord.replyUserName || '-' }}</b>
          </div>
        </div>
        <section class="record-feature-detail__section">
          <h4>咨询内容</h4>
          <p>{{ selectedRecord.content || '-' }}</p>
        </section>
        <section v-if="selectedRecord.replyContent" class="record-feature-detail__section">
          <h4>回复内容</h4>
          <p>{{ selectedRecord.replyContent }}</p>
        </section>
      </div>
    </el-drawer>
  </main>
</template>

<script>
import BusinessRecordField from '@/components/business/record-fields/BusinessRecordField'
import recordManager from '@/features/_shared/record-management/recordManager'

export default {
  name: 'OnlineConsultationPage',
  components: { BusinessRecordField },
  mixins: [recordManager],
  props: { mode: { type: String, default: 'user' } },
  computed: {
    resource() {
      const replyMode = this.mode === 'admin'
      return {
        title: '在线咨询',
        itemName: '咨询',
        icon: 'el-icon-service',
        idPrefix: 'OC',
        apiNamespace: 'tobOnlineConsult',
        primaryKey: 'id',
        timeKey: 'consultTime',
        contentKey: 'content',
        defaultStatus: '待回复',
        replyMode,
        replyStatus: '已回复',
        editActionLabel: replyMode ? '回复' : '编辑',
        autoFormFields: replyMode ? {} : { userName: 'currentUserName' },
        replyAutoFormFields: replyMode ? { replyUserName: 'currentUserName', replyTime: 'now' } : {},
        statusOptions: ['待回复', '处理中', '已回复', '已关闭'],
        fields: [
          { key: 'userName', label: '咨询人', hideInForm: true },
          { key: 'phone', label: '联系电话', required: true, hideInReplyForm: true },
          { key: 'consultTime', label: '咨询时间', type: 'datetime', required: true, hideInReplyForm: true },
          { key: 'content', label: '咨询内容', type: 'textarea', required: true, hideInReplyForm: true, wide: true },
          { key: 'replyPhone', label: '回复人联系方式', required: true, wide: true, hideInCreateForm: true },
          { key: 'replyUserName', label: '回复人', hideInForm: true },
          { key: 'replyTime', label: '回复时间', type: 'datetime', hideInForm: true },
          { key: 'replyContent', label: '回复内容', type: 'textarea', required: true, hideInCreateForm: true, wide: true }
        ]
      }
    },
    permissions() {
      return this.mode === 'admin' ? { create: false, edit: true, delete: true, changeStatus: false } : { create: true, edit: true, delete: true, changeStatus: false }
    }
  }
}
</script>

<style lang="scss" src="../../_shared/record-management/record-feature-page.scss"></style>

<style lang="scss" scoped>
.record-feature-card .online-consultation-card__question {
  display: -webkit-box;
  min-height: 72px;
  margin: 18px 0 16px;
  overflow: hidden;
  color: #22324a;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.online-consultation-card__meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 14px;
  border: 1px solid #edf1f6;
  border-radius: 8px;
  background: #f8fafc;
}

.online-consultation-card__meta-item {
  min-width: 0;

  small,
  span {
    display: block;
  }

  small {
    margin-bottom: 5px;
    color: #8a98aa;
    font-size: 12px;
    line-height: 1.4;

    i {
      width: 16px;
      margin-right: 4px;
      color: #7c91ad;
      text-align: center;
    }
  }

  span {
    overflow: hidden;
    color: #44546a;
    font-size: 13px;
    line-height: 1.5;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

@media (max-width: 760px) {
  .online-consultation-card__meta {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}
</style>
