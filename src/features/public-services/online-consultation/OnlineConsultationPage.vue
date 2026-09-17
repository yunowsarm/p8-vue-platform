<!-- 在线咨询业务组件：独立维护用户提问、管理端回复以及咨询详情展示。 -->
<template>
  <main class="record-feature-page" :class="{ 'record-feature-page--compact': compact, 'record-feature-page--read-only': readOnly || !showCreate }">
    <header v-if="!compact || (!readOnly && showCreate)" class="record-feature-hero" :class="{ 'record-feature-hero--compact': compact }">
      <div v-if="!compact" class="record-feature-hero__title">
        <span class="record-feature-hero__icon"><i class="el-icon-service"></i></span>
        <div>
          <h2>{{ pageTitle }}</h2>
          <p>{{ consultationDescription }}</p>
        </div>
      </div>
      <el-button v-if="showCreate && canCreate && !readOnly" type="primary" icon="el-icon-plus" @click="openCreate">{{ createActionLabel }}</el-button>
    </header>
    <section v-loading="loading" class="record-feature-surface">
      <div class="record-feature-toolbar">
        <el-input v-model.trim="keyword" clearable prefix-icon="el-icon-search" :placeholder="searchPlaceholder" @input="resetPage" @clear="resetPage" />
        <el-select v-if="!compact" v-model="statusFilter" clearable placeholder="全部状态" @change="resetPage" @clear="resetPage">
          <el-option v-for="status in statusOptions" :key="status" :label="status" :value="status" />
        </el-select>
      </div>
      <el-table v-if="compact && pagedRecords.length" :data="pagedRecords" stripe class="record-feature-table record-feature-table--compact" @row-click="openDetail">
        <el-table-column prop="enterprise" label="企业名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="contactName" label="联系人" min-width="120" show-overflow-tooltip />
        <el-table-column prop="contactPhone" label="联系电话" min-width="140" show-overflow-tooltip />
        <el-table-column prop="referrerName" label="推荐人" min-width="120" show-overflow-tooltip />
        <el-table-column label="所属行业" min-width="110" show-overflow-tooltip>
          <template slot-scope="scope">{{ formatValue(scope.row.industry, 'industry') }}</template>
        </el-table-column>
        <el-table-column label="团队规模" min-width="110" show-overflow-tooltip>
          <template slot-scope="scope">{{ formatValue(scope.row.teamSize, 'teamSize') }}</template>
        </el-table-column>
        <el-table-column label="意向空间" min-width="110" show-overflow-tooltip>
          <template slot-scope="scope">{{ formatValue(scope.row.intendedSpace, 'intendedSpace') }}</template>
        </el-table-column>
        <el-table-column label="需求面积" min-width="110" show-overflow-tooltip>
          <template slot-scope="scope">{{ formatValue(scope.row.requiredArea, 'requiredArea') }}</template>
        </el-table-column>
        <el-table-column label="计划入住时间" width="170">
          <template slot-scope="scope">{{ formatDateOnly(scope.row.checkinTime) }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="提交时间" width="170" />
        <el-table-column v-if="allocationEnabled" label="分配状态" width="110">
          <template slot-scope="scope">
            <el-tag :type="isAllocated(scope.row) ? 'success' : 'warning'" size="mini">{{ isAllocated(scope.row) ? '已分配' : '待分配' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="allocationEnabled" prop="responsiblePersonName" label="分配人" min-width="120" show-overflow-tooltip />
        <el-table-column v-else-if="allowConfirm" label="确认状态" width="110">
          <template slot-scope="scope">
            <el-tag :type="isConfirmed(scope.row) ? 'success' : 'warning'" size="mini">{{ isConfirmed(scope.row) ? '已确认' : '待确认' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="allocationEnabled || allowConfirm" label="操作" width="120" fixed="right">
          <template slot-scope="scope">
            <div class="record-feature-table__actions">
              <el-button v-if="allocationEnabled" type="text" size="mini" :loading="allocatingId === scope.row.id" @click.stop="openAllocation(scope.row)">
                {{ isAllocated(scope.row) ? '重新分配' : '分配' }}
              </el-button>
              <el-button v-else type="text" size="mini" :loading="confirmingId === scope.row.id" :disabled="isConfirmed(scope.row)" @click.stop="confirmRecord(scope.row)">
                {{ isConfirmed(scope.row) ? '已确认' : '标记为确认' }}
              </el-button>
              <el-button v-if="!readOnly && canEditRecord(scope.row)" type="text" size="mini" @click.stop="openEdit(scope.row)">{{ resource.editActionLabel }}</el-button>
              <el-button v-if="!readOnly && canDeleteRecord(scope.row)" type="text" size="mini" class="danger-action" @click.stop="removeRecord(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div v-else-if="pagedRecords.length" class="record-feature-grid">
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
      <el-empty v-else class="record-feature-empty" :description="`暂无${pageTitle}记录`" />
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

    <el-drawer :title="`${pageTitle}详情`" :visible.sync="detailVisible" size="540px" append-to-body>
      <div v-if="selectedRecord" v-loading="detailLoading" class="record-feature-detail">
        <div class="record-feature-detail__hero">
          <i class="el-icon-service"></i>
          <div>
            <small>{{ selectedRecord.id }}</small>
            <h3>{{ compact ? selectedRecord.enterprise || pageTitle : selectedRecord.userName || '在线咨询' }}</h3>
          </div>
          <el-tag v-if="!compact" :type="statusType(statusText(selectedRecord.status))">{{ statusText(selectedRecord.status) }}</el-tag>
        </div>
        <div v-if="compact" class="record-feature-detail__grid">
          <div v-for="field in compactDetailFields" :key="field.key" class="record-feature-detail__item">
            <small>{{ field.label }}</small>
            <b>{{ formatCompactDetailValue(selectedRecord[field.key], field.key) }}</b>
          </div>
        </div>
        <div v-else class="record-feature-detail__grid">
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
        <section v-if="!compact" class="record-feature-detail__section">
          <h4>咨询内容</h4>
          <p>{{ selectedRecord.content || '-' }}</p>
        </section>
        <section v-if="!compact && selectedRecord.replyContent" class="record-feature-detail__section">
          <h4>回复内容</h4>
          <p>{{ selectedRecord.replyContent }}</p>
        </section>
      </div>
    </el-drawer>

    <el-dialog
      :title="allocationRecord && isAllocated(allocationRecord) ? '重新分配' : '分配'"
      :visible.sync="allocationVisible"
      width="900px"
      top="8vh"
      append-to-body
      :close-on-click-modal="false"
      @closed="resetAllocation">
      <el-form label-width="80px">
        <el-form-item label="分配人员">
          <el-select v-model="allocationUserId" filterable placeholder="请选择分配人员" :loading="allocationUsersLoading" style="width: 100%">
            <el-option v-for="user in allocationUsers" :key="allocationUserIdOf(user)" :label="allocationUserLabel(user)" :value="allocationUserIdOf(user)" />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="allocationVisible = false">取消</el-button>
        <el-button type="primary" :loading="allocatingId !== ''" :disabled="!allocationUserId" @click="submitAllocation">确认</el-button>
      </span>
    </el-dialog>
  </main>
</template>

<script>
import BusinessRecordField from '@/components/business/record-fields/BusinessRecordField'
import recordManager from '@/features/_shared/record-management/recordManager'

export default {
  name: 'OnlineConsultationPage',
  components: { BusinessRecordField },
  mixins: [recordManager],
  props: {
    mode: { type: String, default: 'user' },
    apiNamespace: { type: String, default: 'tobOnlineConsult' },
    pageTitle: { type: String, default: '在线咨询' },
    pageDescription: { type: String, default: '' },
    createActionLabel: { type: String, default: '发起咨询' },
    showCreate: { type: Boolean, default: true },
    compact: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    searchPlaceholder: { type: String, default: '搜索咨询编号、咨询人或内容' },
    listParams: { type: Object, default: () => ({}) },
    allowConfirm: { type: Boolean, default: false },
    allocationEnabled: { type: Boolean, default: false },
    confirmStatus: { type: [String, Number], default: 1 }
  },
  data() {
    return {
      confirmingId: '',
      allocatingId: '',
      allocationVisible: false,
      allocationRecord: null,
      allocationUserId: '',
      allocationUsers: [],
      allocationUsersLoading: false
    }
  },
  computed: {
    consultationDescription() {
      if (this.pageDescription) return this.pageDescription
      return this.mode === 'admin' ? '查看并回复用户提交的园区服务咨询。' : '提交园区服务问题，并随时查看专员回复。'
    },
    compactDetailFields() {
      return [
        { key: 'contactName', label: '联系人' },
        { key: 'contactPhone', label: '联系电话' },
        { key: 'industry', label: '所属行业' },
        { key: 'teamSize', label: '团队规模' },
        { key: 'intendedSpace', label: '意向空间' },
        { key: 'requiredArea', label: '需求面积' },
        { key: 'checkinTime', label: '计划入住时间' },
        { key: 'other', label: '其他需求' },
        { key: 'referrerName', label: '推荐人' },
        { key: 'createTime', label: '提交时间' }
      ]
    },
    resource() {
      const replyMode = this.mode === 'admin'
      return {
        title: this.pageTitle,
        itemName: '咨询',
        icon: 'el-icon-service',
        idPrefix: 'OC',
        apiNamespace: this.apiNamespace,
        listParams: this.listParams,
        preserveListFields: this.compact ? ['referrerName'] : [],
        primaryKey: 'id',
        timeKey: 'consultTime',
        contentKey: 'content',
        defaultStatus: this.allocationEnabled ? 0 : '待回复',
        statusMap: this.allocationEnabled ? { 0: '待分配', 1: '已分配' } : {},
        valueLabelMaps: {
          industry: { 1: '智能制造', 2: '医疗科技', 3: '数字经济', 4: '互联网', 5: '新材料', 6: '其他' },
          teamSize: { 1: '20 人以内', 2: '20–50 人', 3: '51–100 人', 4: '100 人以上' },
          intendedSpace: { 1: '独立办公室', 2: '研发办公', 3: '企业总部', 4: '轻型生产', 5: '配套商业' },
          requiredArea: { 1: '100㎡以内', 2: '100–200㎡', 3: '201–500㎡以内', 4: '500–1,000㎡', 5: '1,000㎡以上' }
        },
        replyMode,
        replyStatus: '已回复',
        editActionLabel: replyMode ? '回复' : '编辑',
        autoFormFields: replyMode ? {} : { userName: 'currentUserName' },
        replyAutoFormFields: replyMode ? { replyUserName: 'currentUserName', replyTime: 'now' } : {},
        statusOptions: this.allocationEnabled ? ['待分配', '已分配'] : ['待回复', '处理中', '已回复', '已关闭'],
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
      if (this.readOnly) return { create: false, edit: false, delete: false, changeStatus: false }
      return this.mode === 'admin' ? { create: false, edit: true, delete: true, changeStatus: false } : { create: true, edit: true, delete: true, changeStatus: false }
    }
  },
  methods: {
    formatDateOnly(value) {
      return value ? String(value).slice(0, 10) : '-'
    },
    formatCompactDetailValue(value, key) {
      return key === 'checkinTime' ? this.formatDateOnly(value) : this.formatValue(value, key)
    },
    isConfirmed(record) {
      return String(record && record.status) === String(this.confirmStatus) || ['已确认', '确认'].includes(record && record.status)
    },
    isAllocated(record) {
      return Number(record && record.status) === 1
    },
    async openAllocation(record) {
      this.allocationRecord = record
      this.allocationUserId = record.responsiblePerson || ''
      this.allocationUsers = []
      this.allocationVisible = true
      const userListApi = this.api('getUserList')
      if (!userListApi) return
      this.allocationUsersLoading = true
      try {
        const result = this.unwrap(await userListApi())
        this.allocationUsers = this.allocationUsersFrom(result)
      } catch (error) {
        this.$message.error('人员列表加载失败，请稍后重试')
      } finally {
        this.allocationUsersLoading = false
      }
    },
    resetAllocation() {
      this.allocationRecord = null
      this.allocationUserId = ''
      this.allocationUsers = []
      this.allocatingId = ''
    },
    allocationUsersFrom(result) {
      if (Array.isArray(result)) return result
      return result && (result.records || result.list || result.rows || result.userList || result.data) ? result.records || result.list || result.rows || result.userList || result.data : []
    },
    allocationUserIdOf(user) {
      return user && (user.id || user.userId)
    },
    allocationUserLabel(user) {
      return (user && (user.realName || user.userName || user.nickName || user.name)) || this.allocationUserIdOf(user)
    },
    async submitAllocation() {
      const record = this.allocationRecord
      const userId = this.allocationUserId
      const allocationApi = this.api('allocation')
      const editApi = this.api('edit')
      if (!record || !userId || !allocationApi || !editApi) return
      this.allocatingId = record.id
      try {
        await allocationApi({ id: record.id, userId })
        await editApi({ id: record.id, status: 1 })
        this.$message.success(this.isAllocated(record) ? '重新分配成功' : '分配成功')
        this.allocationVisible = false
        await this.loadRecords()
      } catch (error) {
        this.$message.error(this.isAllocated(record) ? '重新分配失败，请稍后重试' : '分配失败，请稍后重试')
      } finally {
        this.allocatingId = ''
      }
    },
    async confirmRecord(record) {
      if (!record || this.isConfirmed(record) || this.confirmingId) return
      try {
        await this.$confirm('确认后将无法撤销，是否继续？', '二次确认', { type: 'warning' })
        const editApi = this.api('edit')
        if (!editApi) throw new Error('missing edit api')
        this.confirmingId = record.id
        await editApi({ id: record.id, status: this.confirmStatus })
        this.$message.success('已标记为确认')
        await this.loadRecords()
      } catch (error) {
        if (error !== 'cancel' && error !== 'close') this.$message.error('标记确认失败，请稍后重试')
      } finally {
        this.confirmingId = ''
      }
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
