<template>
  <main class="enterprise-care-board">
    <section class="metric-grid" aria-label="惠企服务状态统计">
      <article v-for="metric in metrics" :key="metric.label" class="metric-card" :class="metric.tone">
        <i :class="metric.icon"></i>
        <div>
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
          <small>{{ metric.hint }}</small>
        </div>
      </article>
    </section>

    <section class="surface service-list-surface">
      <div class="toolbar">
        <el-input v-model="keyword" clearable prefix-icon="el-icon-search" placeholder="搜索服务编号、企业、联系人或服务内容" @clear="search" @keyup.enter.native="search" />
        <el-select v-model="statusFilter" clearable placeholder="全部状态" @change="search">
          <el-option v-for="status in config.statusOptions" :key="status" :label="status" :value="status" />
        </el-select>
        <el-button v-if="keyword || statusFilter" icon="el-icon-refresh-left" @click="resetFilters">重置</el-button>
        <span class="toolbar-spacer"></span>
        <el-button v-if="selectedIds.length" type="danger" plain icon="el-icon-delete" @click="bulkRemove">批量删除（{{ selectedIds.length }}）</el-button>
        <el-button type="primary" icon="el-icon-plus" @click="openCreate">新建{{ config.title }}申请</el-button>
      </div>

      <div v-loading="loading" class="cards-stage">
        <div v-if="records.length" class="service-card-grid">
          <article v-for="record in records" :key="record.id" class="service-card" @click="openDetail(record)">
            <div class="card-topline">
              <span class="record-id">
                <i class="el-icon-document"></i>
                {{ record.id || record.dataId || '未编号' }}
              </span>
              <div class="card-state" @click.stop>
                <el-tag size="mini" :type="statusType(statusValue(record))">{{ statusValue(record) }}</el-tag>
                <el-checkbox :value="selectedIds.includes(record.id)" :aria-label="`选择${record.id || '服务申请'}`" @change="toggleSelected(record.id, $event)" />
              </div>
            </div>
            <div class="service-title">
              <i :class="config.icon"></i>
              <h3>{{ config.title }}</h3>
              <time>{{ record.applyTime || record.itemCreateTime || '-' }}</time>
            </div>
            <p>{{ record.serviceContent || '暂未填写服务诉求' }}</p>
            <div class="card-meta">
              <span>
                <i class="el-icon-office-building"></i>
                {{ enterpriseName(record.companyId) }}
              </span>
              <span>
                <i class="el-icon-user"></i>
                {{ record.contactName || '-' }}
              </span>
              <span>
                <i class="el-icon-phone-outline"></i>
                {{ record.contactPhone || '-' }}
              </span>
            </div>
            <div class="card-footer" @click.stop>
              <span class="handler-text">{{ record.handlerId ? `处理人：${record.handlerId}` : '尚未指派处理人' }}</span>
              <div class="card-actions">
                <el-button type="text" @click="openDetail(record)">
                  查看详情
                  <i class="el-icon-arrow-right"></i>
                </el-button>
                <el-button v-if="canAdvance(record)" type="text" @click="openHandle(record)">{{ advanceLabel(record) }}</el-button>
                <el-button type="text" @click="openEdit(record)">编辑</el-button>
                <el-button type="text" class="danger-action" @click="remove(record)">删除</el-button>
              </div>
            </div>
          </article>
        </div>
        <el-empty v-else class="empty-state" description="暂无符合筛选条件的服务申请" :image-size="96" />
      </div>
      <footer class="pagination-bar">
        <span>共 {{ total }} 条</span>
        <el-pagination :current-page.sync="pageNo" :page-size="pageSize" layout="prev, pager, next" :total="total" @current-change="loadRecords" />
      </footer>
    </section>

    <el-dialog
      :title="editingId ? `编辑${config.title}申请` : `新建${config.title}申请`"
      :visible.sync="formVisible"
      width="720px"
      custom-class="care-form-dialog"
      :close-on-click-modal="false"
      append-to-body>
      <el-form ref="serviceForm" :model="form" :rules="formRules" label-position="top">
        <div class="form-grid">
          <el-form-item label="申请企业" prop="companyId">
            <el-select v-model="form.companyId" filterable clearable placeholder="请选择企业" :loading="enterpriseLoading">
              <el-option v-for="option in enterpriseOptions" :key="option.id" :label="option.label" :value="option.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="申请时间" prop="applyTime">
            <el-date-picker v-model="form.applyTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" format="yyyy-MM-dd HH:mm" placeholder="请选择申请时间" />
          </el-form-item>
          <el-form-item label="联系人" prop="contactName"><el-input v-model.trim="form.contactName" placeholder="请输入联系人" /></el-form-item>
          <el-form-item label="联系电话" prop="contactPhone"><el-input v-model.trim="form.contactPhone" placeholder="请输入联系电话" /></el-form-item>
          <el-form-item class="is-wide" label="服务内容" prop="serviceContent">
            <el-input v-model.trim="form.serviceContent" type="textarea" :rows="6" maxlength="1000" show-word-limit placeholder="请说明需要的服务内容、期望协助事项及时间要求" />
          </el-form-item>
        </div>
      </el-form>
      <span slot="footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">提交申请</el-button>
      </span>
    </el-dialog>

    <el-drawer :visible.sync="detailVisible" :title="`${config.title}详情`" size="500px" append-to-body custom-class="care-detail-drawer">
      <div v-if="detailRecord" class="drawer-content">
        <div class="drawer-hero">
          <span class="hero-icon"><i :class="config.icon" /></span>
          <div>
            <strong>{{ config.title }}申请</strong>
            <small>{{ detailRecord.id || detailRecord.dataId || '-' }}</small>
          </div>
          <el-tag :type="statusType(statusValue(detailRecord))">{{ statusValue(detailRecord) }}</el-tag>
        </div>
        <dl class="detail-grid">
          <dt>申请企业</dt>
          <dd>{{ enterpriseName(detailRecord.companyId) }}</dd>
          <dt>申请时间</dt>
          <dd>{{ detailRecord.applyTime || '-' }}</dd>
          <dt>联系人</dt>
          <dd>{{ detailRecord.contactName || '-' }}</dd>
          <dt>联系电话</dt>
          <dd>{{ detailRecord.contactPhone || '-' }}</dd>
          <dt>当前处理人</dt>
          <dd>{{ detailRecord.handlerId || '尚未指派' }}</dd>
          <dt>处理时间</dt>
          <dd>{{ detailRecord.handleTime || '-' }}</dd>
          <dt class="wide-label">服务内容</dt>
          <dd class="wide-content">{{ detailRecord.serviceContent || '-' }}</dd>
        </dl>
        <section class="status-track">
          <h4>服务流转</h4>
          <el-steps :active="statusIndex(detailRecord) + 1" finish-status="success" align-center><el-step v-for="status in config.statusOptions" :key="status" :title="status" /></el-steps>
        </section>
      </div>
      <div class="drawer-footer">
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button v-if="canAdvance(detailRecord)" type="primary" @click="openHandle(detailRecord)">{{ advanceLabel(detailRecord) }}</el-button>
      </div>
    </el-drawer>

    <el-dialog :title="advanceLabel(handleRecord)" :visible.sync="handleVisible" width="520px" append-to-body :close-on-click-modal="false" custom-class="care-handle-dialog">
      <el-form ref="handleForm" :model="handleForm" :rules="handleRules" label-position="top">
        <el-form-item v-if="statusValue(handleRecord) === '待受理'" label="处理人ID" prop="handlerId">
          <el-input v-model.trim="handleForm.handlerId" placeholder="请输入负责办理的人员ID" />
        </el-form-item>
        <el-form-item v-if="statusValue(handleRecord) === '待受理'" label="受理时间" prop="handleTime">
          <el-date-picker v-model="handleForm.handleTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" format="yyyy-MM-dd HH:mm" placeholder="请选择受理时间" />
        </el-form-item>
        <el-form-item v-if="statusValue(handleRecord) === '办理中'" label="办结时间" prop="handleTime">
          <el-date-picker v-model="handleForm.handleTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" format="yyyy-MM-dd HH:mm" placeholder="请选择办结时间" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="handleVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitHandle">确认</el-button>
      </span>
    </el-dialog>
  </main>
</template>

<script>
const tones = { 待受理: 'warning', 办理中: 'primary', 已办结: 'success', 已退回: 'danger' }
export default {
  name: 'EnterpriseCareBoard',
  props: { config: { type: Object, required: true } },
  data() {
    return {
      loading: false,
      submitting: false,
      enterpriseLoading: false,
      keyword: '',
      statusFilter: '',
      pageNo: 1,
      pageSize: 6,
      total: 0,
      records: [],
      selectedIds: [],
      enterpriseOptions: [],
      formVisible: false,
      editingId: '',
      form: {},
      detailVisible: false,
      detailRecord: null,
      handleVisible: false,
      handleRecord: null,
      handleForm: { handlerId: '', handleTime: '' }
    }
  },
  computed: {
    formRules() {
      return {
        companyId: [{ required: true, message: '请选择申请企业', trigger: 'change' }],
        contactName: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
        contactPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
        serviceContent: [{ required: true, message: '请输入服务内容', trigger: 'blur' }],
        applyTime: [{ required: true, message: '请选择申请时间', trigger: 'change' }]
      }
    },
    handleRules() {
      return {
        handlerId: [{ required: statusValue(this.handleRecord) === '待受理', message: '请输入处理人ID', trigger: 'blur' }],
        handleTime: [{ required: true, message: '请选择处理时间', trigger: 'change' }]
      }
    },
    metrics() {
      const statuses = this.records.map((record) => this.statusValue(record))
      return [
        { label: '服务申请', value: this.total, hint: '当前查询条件下的记录', tone: 'blue', icon: 'el-icon-document' },
        { label: '待受理', value: statuses.filter((status) => status === '待受理').length, hint: '等待指派办理人员', tone: 'orange', icon: 'el-icon-time' },
        { label: '办理中', value: statuses.filter((status) => status === '办理中').length, hint: '正在持续跟进', tone: 'cyan', icon: 'el-icon-s-operation' },
        { label: '已办结', value: statuses.filter((status) => status === '已办结').length, hint: '服务全程已留痕', tone: 'green', icon: 'el-icon-circle-check' }
      ]
    }
  },
  created() {
    this.loadRecords()
    this.loadEnterprises()
  },
  methods: {
    unwrap(response) {
      return response && response.data && response.data.data !== undefined ? response.data.data : response
    },
    recordsFrom(payload) {
      if (Array.isArray(payload)) return payload
      return (payload && (payload.records || payload.list || payload.rows || (payload.data && (payload.data.records || payload.data.list)))) || []
    },
    totalFrom(payload, records) {
      return Number(payload && (payload.total || (payload.data && payload.data.total))) || records.length
    },
    api(name) {
      return this.$api && this.$api[`${this.config.namespace}.${name}`]
    },
    async loadRecords() {
      const request = this.api('list')
      if (!request) return
      this.loading = true
      try {
        const params = { pageNo: this.pageNo, pageSize: this.pageSize }
        if (this.keyword) params.keyword = this.keyword
        if (this.statusFilter) params.status = this.statusFilter
        const raw = this.unwrap(await request(params))
        const records = this.recordsFrom(raw)
        this.records = records
        this.total = this.totalFrom(raw, records)
        this.selectedIds = this.selectedIds.filter((id) => records.some((record) => record.id === id))
      } catch (error) {
        this.$message.error('加载服务申请失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },
    async loadEnterprises() {
      const request = this.$api && this.$api['enterprise.getEnterprise']
      if (!request) return
      this.enterpriseLoading = true
      try {
        const records = this.recordsFrom(this.unwrap(await request()))
        this.enterpriseOptions = records.map((item) => ({ id: item.id, label: item.enterpriseName || item.enterpriseFullname || item.enterpriseNo || item.id }))
      } catch (error) {
      } finally {
        this.enterpriseLoading = false
      }
    },
    search() {
      this.pageNo = 1
      this.loadRecords()
    },
    resetFilters() {
      this.keyword = ''
      this.statusFilter = ''
      this.search()
    },
    statusValue(record) {
      return (record && record.status) || '待受理'
    },
    statusType(status) {
      return tones[status] || 'info'
    },
    statusIndex(record) {
      return Math.max(0, this.config.statusOptions.indexOf(this.statusValue(record)))
    },
    enterpriseName(id) {
      const found = this.enterpriseOptions.find((item) => item.id === id)
      return found ? found.label : id || '-'
    },
    toggleSelected(id, checked) {
      this.selectedIds = checked ? [...new Set([...this.selectedIds, id])] : this.selectedIds.filter((item) => item !== id)
    },
    newForm() {
      return { companyId: '', contactName: '', contactPhone: '', serviceContent: '', applyTime: '', status: '待受理', handlerId: '', handleTime: '' }
    },
    openCreate() {
      this.editingId = ''
      this.form = this.newForm()
      this.formVisible = true
      this.$nextTick(() => this.$refs.serviceForm && this.$refs.serviceForm.clearValidate())
    },
    openEdit(record) {
      this.editingId = record.id
      this.form = Object.assign(this.newForm(), record)
      this.formVisible = true
      this.$nextTick(() => this.$refs.serviceForm && this.$refs.serviceForm.clearValidate())
    },
    openDetail(record) {
      this.detailRecord = record
      this.detailVisible = true
      const request = this.api('queryById')
      if (request && record.id)
        request({ id: record.id })
          .then((response) => {
            const detail = this.unwrap(response)
            if (detail && !Array.isArray(detail)) this.detailRecord = detail
          })
          .catch(() => {})
    },
    async submitForm() {
      const valid = await new Promise((resolve) => this.$refs.serviceForm.validate(resolve))
      if (!valid) return
      this.submitting = true
      try {
        await this.api(this.editingId ? 'edit' : 'add')(this.form)
        this.$message.success(this.editingId ? '修改成功' : '申请已提交')
        this.formVisible = false
        this.loadRecords()
      } catch (error) {
        this.$message.error('操作失败，请稍后重试')
      } finally {
        this.submitting = false
      }
    },
    canAdvance(record) {
      return this.statusIndex(record) < this.config.statusOptions.length - 1
    },
    advanceLabel(record) {
      return this.statusValue(record) === '待受理' ? '受理并派单' : '确认办结'
    },
    openHandle(record) {
      this.handleRecord = record
      this.handleForm = { handlerId: record.handlerId || '', handleTime: this.now() }
      this.handleVisible = true
      this.$nextTick(() => this.$refs.handleForm && this.$refs.handleForm.clearValidate())
    },
    async submitHandle() {
      const valid = await new Promise((resolve) => this.$refs.handleForm.validate(resolve))
      if (!valid) return
      const nextStatus = this.statusValue(this.handleRecord) === '待受理' ? '办理中' : '已办结'
      this.submitting = true
      try {
        const payload = Object.assign({}, this.handleRecord, this.handleForm, { status: nextStatus })
        await this.api('edit')(payload)
        this.$message.success(nextStatus === '办理中' ? '已受理并派单' : '服务已办结')
        this.handleVisible = false
        if (this.detailRecord && this.detailRecord.id === this.handleRecord.id) this.detailRecord = payload
        this.loadRecords()
      } catch (error) {
        this.$message.error('状态更新失败，请稍后重试')
      } finally {
        this.submitting = false
      }
    },
    async remove(record) {
      try {
        await this.$confirm('确定删除该服务申请吗？', '删除确认', { type: 'warning' })
        await this.api('delete')({ id: record.id })
        this.$message.success('已删除')
        this.loadRecords()
      } catch (error) {
        if (error !== 'cancel' && error !== 'close') this.$message.error('删除失败，请稍后重试')
      }
    },
    async bulkRemove() {
      try {
        await this.$confirm(`确定删除选中的 ${this.selectedIds.length} 条服务申请吗？`, '批量删除确认', { type: 'warning' })
        await Promise.all(this.selectedIds.map((id) => this.api('delete')({ id })))
        this.selectedIds = []
        this.$message.success('已删除')
        this.loadRecords()
      } catch (error) {
        if (error !== 'cancel' && error !== 'close') this.$message.error('删除失败，请稍后重试')
      }
    },
    now() {
      const d = new Date()
      const p = (n) => `${n}`.padStart(2, '0')
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
    }
  }
}

function statusValue(record) {
  return (record && record.status) || '待受理'
}
</script>

<style scoped>
.enterprise-care-board {
  min-height: calc(100vh - 86px);
  padding: 16px;
  background: #f8fafc;
  color: #0f172a;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}
.metric-card {
  display: flex;
  box-sizing: border-box;
  min-height: 96px;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
}
.metric-card > i {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 10px;
  font-size: 19px;
}
.metric-card span,
.metric-card small {
  display: block;
  color: #64748b;
  font-size: 13px;
  line-height: 1.45;
}
.metric-card strong {
  display: block;
  margin: 1px 0;
  font-size: 25px;
  line-height: 1.1;
}
.blue > i {
  color: #2563eb;
  background: #eff6ff;
}
.orange > i {
  color: #d97706;
  background: #fff7ed;
}
.cyan > i {
  color: #0891b2;
  background: #ecfeff;
}
.green > i {
  color: #059669;
  background: #ecfdf5;
}
.surface {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
}
.service-list-surface {
  display: flex;
  min-height: calc(100vh - 224px);
  flex-direction: column;
  overflow: hidden;
}
.toolbar {
  display: flex;
  box-sizing: border-box;
  min-height: 62px;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid #e2e8f0;
}
.toolbar .el-input {
  width: 340px;
}
.toolbar .el-select {
  width: 165px;
}
.toolbar-spacer {
  flex: 1;
}
.cards-stage {
  display: flex;
  flex: 1;
  min-height: 390px;
  flex-direction: column;
  padding: 16px;
}
.service-card-grid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  align-content: start;
}
.empty-state {
  display: flex;
  min-height: 0;
  flex: 1 1 auto;
  align-items: center;
  justify-content: center;
}
.service-card {
  display: flex;
  min-height: 246px;
  flex-direction: column;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}
.service-card:hover {
  border-color: #0369a1;
}
.card-topline,
.card-state,
.service-title,
.card-meta,
.card-footer {
  display: flex;
  align-items: center;
}
.card-topline {
  justify-content: space-between;
}
.record-id {
  color: #64748b;
  font-size: 13px;
}
.record-id i {
  margin-right: 6px;
  color: #2563eb;
}
.card-state {
  gap: 8px;
}
.card-state .el-checkbox {
  margin: 0;
}
.service-title {
  gap: 7px;
  margin-top: 12px;
}
.service-title > i {
  color: #0369a1;
}
.service-title h3 {
  margin: 0;
  color: #1e3a5f;
  font-size: 16px;
}
.service-title time {
  margin-left: auto;
  color: #94a3b8;
  font-size: 12px;
}
.service-card p {
  display: -webkit-box;
  overflow: hidden;
  margin: 12px 0;
  color: #475569;
  font-size: 14px;
  line-height: 1.65;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
.card-meta {
  flex-wrap: wrap;
  gap: 7px 13px;
  padding-top: 11px;
  border-top: 1px solid #eef2f7;
  color: #64748b;
  font-size: 12px;
}
.card-meta i {
  margin-right: 4px;
  color: #94a3b8;
}
.card-footer {
  justify-content: space-between;
  margin-top: auto;
  padding-top: 9px;
}
.handler-text {
  color: #94a3b8;
  font-size: 12px;
}
.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-actions .el-button {
  margin: 0;
  padding: 4px 0;
}
.card-actions .el-button i {
  margin-left: 3px;
}
.danger-action {
  color: #dc2626;
}
.pagination-bar {
  display: flex;
  min-height: 58px;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  padding: 0 16px;
  border-top: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 13px;
}
.pagination-bar .el-pagination {
  padding: 0;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 20px;
}
.form-grid .is-wide {
  grid-column: 1 / -1;
}
::v-deep .el-select,
::v-deep .el-date-editor {
  width: 100%;
}
::v-deep .care-detail-drawer .el-drawer__body {
  display: flex;
  min-height: 0;
  flex: 1 1 auto;
  flex-direction: column;
  overflow: hidden;
}
.drawer-content {
  min-height: 0;
  flex: 1 1 auto;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0 20px 24px;
}
.drawer-hero {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #dbeafe;
  border-radius: 10px;
  background: #eff6ff;
}
.hero-icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 9px;
  background: #0369a1;
  color: #fff;
  font-size: 18px;
}
.drawer-hero div {
  flex: 1;
}
.drawer-hero strong,
.drawer-hero small {
  display: block;
}
.drawer-hero small {
  margin-top: 3px;
  color: #64748b;
  font-size: 12px;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin: 16px 0;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}
.detail-grid dt,
.detail-grid dd {
  min-height: 58px;
  margin: 0;
  padding: 10px 12px;
  border-bottom: 1px solid #e2e8f0;
}
.detail-grid dt {
  color: #64748b;
  font-size: 12px;
  background: #f8fafc;
}
.detail-grid dd {
  color: #1e293b;
  font-size: 14px;
  word-break: break-word;
}
.wide-label {
  grid-column: 1 / -1;
  border-bottom: 0 !important;
}
.wide-content {
  grid-column: 1 / -1;
  min-height: 98px !important;
  white-space: pre-wrap;
}
.status-track {
  padding: 14px 0;
}
.status-track h4 {
  margin: 0 0 18px;
  font-size: 15px;
}
.status-track ::v-deep .el-step__title {
  font-size: 12px;
}
.drawer-footer {
  flex: 0 0 auto;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid #e2e8f0;
  background: #fff;
}
.enterprise-care-board {
  display: flex;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  flex-direction: column;
  overflow: hidden;
}
.metric-grid {
  flex: 0 0 auto;
}
.service-list-surface {
  min-height: 0;
  flex: 1 1 auto;
}
.cards-stage {
  min-height: 0;
  flex: 1 1 auto;
}
@media (max-width: 1180px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .service-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 768px) {
  .enterprise-care-board {
    height: auto;
    min-height: 100%;
    overflow: visible;
    padding: 10px;
  }
  .metric-grid {
    gap: 10px;
    margin-bottom: 10px;
  }
  .metric-card {
    min-height: 82px;
    padding: 12px;
    gap: 9px;
  }
  .metric-card > i {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
  .metric-card strong {
    font-size: 21px;
  }
  .metric-card span,
  .metric-card small {
    font-size: 12px;
  }
  .service-list-surface {
    min-height: calc(100vh - 205px);
  }
  .toolbar {
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px;
  }
  .toolbar .el-input,
  .toolbar .el-select {
    width: calc(50% - 4px);
  }
  .toolbar-spacer {
    display: none;
  }
  .toolbar .el-button:last-child {
    margin-left: auto;
  }
  .cards-stage {
    min-height: 360px;
    padding: 10px;
  }
  .service-card-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .service-card {
    min-height: 224px;
  }
  .handler-text {
    display: none;
  }
  .pagination-bar {
    min-height: 52px;
    padding: 0 10px;
  }
  .form-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .form-grid .is-wide {
    grid-column: auto;
  }
  .care-form-dialog {
    width: calc(100vw - 24px) !important;
  }
}
/* 移动端：让页面本身承担纵向滚动，避免桌面端的固定高度裁切列表内容。 */
@media (max-width: 768px) {
  .enterprise-care-board {
    display: block;
    height: 100% !important;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
    touch-action: pan-y;
    padding: 10px 10px calc(84px + env(safe-area-inset-bottom));
  }

  .service-list-surface {
    display: block;
    min-height: 0;
    overflow: visible;
  }

  .toolbar {
    display: flex;
    min-height: 0;
    align-items: center;
  }

  .toolbar .el-button:last-child {
    flex: 0 0 100%;
    width: 100%;
    min-height: 40px;
    margin: 2px 0 0;
  }

  .cards-stage {
    display: block;
    min-height: 0;
    padding: 10px;
  }

  .empty-state {
    display: flex;
    min-height: 360px;
  }

  .pagination-bar {
    min-height: 56px;
  }

  ::v-deep .care-detail-drawer {
    width: 100vw !important;
    max-width: 100vw !important;
  }

  ::v-deep .care-detail-drawer .el-drawer__header {
    flex: 0 0 auto;
    margin: 0;
    padding: 16px;
    border-bottom: 1px solid #e2e8f0;
  }

  .drawer-content {
    padding: 14px 14px 20px;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
  }

  .drawer-hero {
    padding: 12px;
  }

  .detail-grid {
    grid-template-columns: 108px minmax(0, 1fr);
    margin: 12px 0;
  }

  .detail-grid dt,
  .detail-grid dd {
    min-height: 52px;
    padding: 10px;
  }

  .detail-grid dt {
    border-right: 1px solid #e2e8f0;
  }

  .wide-label,
  .wide-content {
    grid-column: 1 / -1 !important;
  }

  .wide-content {
    min-height: 116px !important;
  }

  .drawer-footer {
    padding: 12px 14px calc(12px + env(safe-area-inset-bottom));
  }

  ::v-deep .care-form-dialog {
    display: flex;
    width: calc(100vw - 24px) !important;
    height: calc(100vh - 24px);
    max-height: calc(100vh - 24px);
    margin: 12px auto !important;
    flex-direction: column;
  }

  ::v-deep .care-form-dialog .el-dialog__header {
    flex: 0 0 auto;
    padding: 16px;
    border-bottom: 1px solid #e2e8f0;
  }

  ::v-deep .care-form-dialog .el-dialog__body {
    min-height: 0;
    flex: 1 1 auto;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
    padding: 14px 20px;
  }

  ::v-deep .care-form-dialog .el-dialog__footer {
    flex: 0 0 auto;
    padding: 12px 20px calc(12px + env(safe-area-inset-bottom));
    border-top: 1px solid #e2e8f0;
    background: #fff;
  }

  ::v-deep .care-form-dialog .dialog-footer {
    display: flex;
    gap: 10px;
  }

  ::v-deep .care-form-dialog .dialog-footer .el-button {
    flex: 1;
    min-height: 42px;
    margin: 0;
  }

  ::v-deep .care-handle-dialog {
    display: flex;
    width: calc(100vw - 24px) !important;
    max-height: calc(100dvh - 24px);
    margin: 12px auto !important;
    flex-direction: column;
  }

  ::v-deep .care-handle-dialog .el-dialog__body {
    overflow-y: auto;
    padding: 16px 20px;
  }

  ::v-deep .care-handle-dialog .el-dialog__footer {
    padding: 12px 20px calc(12px + env(safe-area-inset-bottom));
  }
}

@media (max-width: 420px) {
  .toolbar .el-input,
  .toolbar .el-select {
    width: 100%;
  }
}
</style>
<style scoped>
/* 与办事大厅的卡片申请看板保持一致，避免固定高度造成滚动条或空态偏移 */
.enterprise-care-board {
  display: block;
  height: auto;
  min-height: 100%;
  padding: 12px;
  box-sizing: border-box;
  overflow: visible;
  background: #f6f8fb;
}
.enterprise-care-board .metric-grid {
  gap: 12px;
  margin-bottom: 12px;
}
.enterprise-care-board .metric-card {
  min-height: 94px;
  padding: 16px 18px;
  border-color: #e5ebf2;
  border-radius: 10px;
}
.enterprise-care-board .service-list-surface {
  display: flex;
  min-height: clamp(660px, calc(100vh - 250px), 760px);
  border-color: #e5ebf2;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.035);
}
.enterprise-care-board .toolbar {
  min-height: 64px;
  padding: 14px 20px;
  gap: 10px;
}
.enterprise-care-board .toolbar .el-input {
  width: 300px;
}
.enterprise-care-board .toolbar .el-select {
  width: 160px;
}
.enterprise-care-board .cards-stage {
  min-height: 0;
  padding: 2px 20px 18px;
}
.enterprise-care-board .service-card-grid {
  gap: 14px;
}
.enterprise-care-board .service-card {
  min-height: 252px;
  padding: 16px;
  border-color: #e6ecf3;
  border-radius: 10px;
}
.enterprise-care-board .service-card:hover {
  border-color: #a9caf7;
}
.enterprise-care-board .empty-state {
  min-height: 260px;
  padding: 24px 20px 48px;
  box-sizing: border-box;
}
.enterprise-care-board .pagination-bar {
  min-height: 0;
  margin-top: auto;
  padding: 12px 20px 16px;
}
@media (max-width: 760px) {
  .enterprise-care-board {
    display: block;
    height: 100% !important;
    min-height: 0;
    padding: 14px 12px calc(24px + env(safe-area-inset-bottom));
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
    touch-action: pan-y;
  }
  .enterprise-care-board .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .enterprise-care-board .metric-card {
    min-height: 82px;
    padding: 12px;
  }
  .enterprise-care-board .service-list-surface {
    min-height: 440px;
  }
  .enterprise-care-board .toolbar {
    display: flex;
    flex-wrap: wrap;
    padding: 12px;
  }
  .enterprise-care-board .toolbar .el-input {
    width: 100%;
  }
  .enterprise-care-board .toolbar .el-select {
    width: calc(50% - 5px);
  }
  .enterprise-care-board .toolbar-spacer {
    display: none;
  }
  .enterprise-care-board .toolbar > .el-button {
    flex: 1 1 calc(50% - 5px);
    min-height: 38px;
    margin: 0;
  }
  .enterprise-care-board .cards-stage {
    padding: 2px 12px 14px;
  }
  .enterprise-care-board .service-card-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }
  .enterprise-care-board .service-card {
    min-height: 238px;
  }
  .enterprise-care-board .pagination-bar {
    justify-content: center;
    padding: 12px;
  }
}
</style>
