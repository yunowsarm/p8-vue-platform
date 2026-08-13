<template>
  <main class="government-service-board">
    <section class="government-statistics" aria-label="政务服务统计">
      <article class="stat-card stat-card--primary"><span><i class="el-icon-document"></i></span><div><small>全部记录</small><b>{{ total }}</b><em>当前筛选结果</em></div></article>
      <article class="stat-card stat-card--warning"><span><i class="el-icon-time"></i></span><div><small>待处理</small><b>{{ pendingCount }}</b><em>等待流转处理</em></div></article>
      <article class="stat-card stat-card--process"><span><i class="el-icon-loading"></i></span><div><small>处理中</small><b>{{ processingCount }}</b><em>正在办理流转</em></div></article>
      <article class="stat-card stat-card--success"><span><i class="el-icon-circle-check"></i></span><div><small>已办结</small><b>{{ completedCount }}</b><em>已完成或归档</em></div></article>
    </section>

    <section v-loading="loading" class="government-surface">
      <div class="list-toolbar">
        <el-input v-model.trim="keyword" clearable size="small" prefix-icon="el-icon-search" :placeholder="`搜索编号、企业ID、${config.primaryLabel}`" @input="resetPage" @clear="resetPage" />
        <el-select v-model="typeFilter" clearable size="small" :placeholder="`全部${config.typeLabel}`" @change="resetPage" @clear="resetPage">
          <el-option v-for="item in config.typeOptions" :key="item" :label="item" :value="item" />
        </el-select>
        <el-select v-model="statusFilter" clearable size="small" placeholder="全部状态" @change="resetPage" @clear="resetPage">
          <el-option v-for="item in config.statusOptions" :key="item" :label="item" :value="item" />
        </el-select>
        <div class="toolbar-actions"><el-button type="primary" size="small" icon="el-icon-plus" @click="openCreate">新建{{ config.title }}</el-button></div>
      </div>

      <div v-if="records.length" class="government-grid">
        <article v-for="item in records" :key="item.id" class="government-card" tabindex="0" role="button" @click="openDetail(item)" @keydown.enter="openDetail(item)">
          <div class="card-head"><span><i class="el-icon-document"></i>{{ item.id || '-' }}</span><el-tag :type="statusType(statusValue(item))" size="small">{{ statusValue(item) }}</el-tag></div>
          <div class="card-title"><i :class="config.icon"></i><b>{{ item[config.primaryKey] || '-' }}</b><time>{{ formatValue(item[config.timeKey]) }}</time></div>
          <dl class="card-meta">
            <template v-for="field in cardFields"><dt :key="`${field.key}-dt`">{{ field.label }}</dt><dd :key="`${field.key}-dd`">{{ formatValue(item[field.key]) }}</dd></template>
          </dl>
          <div class="flow-steps"><span v-for="(step, index) in config.flow" :key="step" :class="{ active: index <= currentStep(item) }"><i>{{ index + 1 }}</i>{{ step }}</span></div>
          <div class="card-foot"><div class="card-actions"><el-button type="text" size="mini" @click.stop="openDetail(item)">查看详情</el-button><el-button v-if="canEdit(item)" type="text" size="mini" @click.stop="openEdit(item)">编辑</el-button><el-button v-if="nextStatus(item)" type="text" size="mini" class="advance-action" @click.stop="advance(item)">推进至{{ nextStatus(item) }}</el-button><el-button v-if="config.allowDelete && canDelete(item)" type="text" size="mini" class="danger-action" @click.stop="removeRecord(item)">删除</el-button></div></div>
        </article>
      </div>
      <el-empty v-else class="empty-state" description="暂无符合筛选条件的数据" />
      <div v-if="total" class="pagination-row"><span>每页 {{ pageSize }} 条</span><el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="total" layout="prev, pager, next" @current-change="loadRecords" /></div>
    </section>

    <el-dialog :title="editingId ? `编辑${config.title}` : `新建${config.title}`" :visible.sync="formVisible" top="4vh" append-to-body :close-on-click-modal="false" custom-class="government-form-dialog" @closed="resetForm">
      <el-form ref="governmentForm" :model="form" :rules="rules" label-width="104px" @submit.native.prevent>
        <el-row :gutter="28">
          <el-col v-for="field in normalFields" :key="field.key" :xs="24" :sm="12"><el-form-item :label="field.label" :prop="field.key"><el-select v-if="field.options" v-model="form[field.key]" clearable filterable class="field-full" :placeholder="`请选择${field.label}`"><el-option v-for="option in field.options" :key="option" :label="option" :value="option" /></el-select><el-date-picker v-else-if="field.type === 'datetime'" v-model="form[field.key]" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" format="yyyy-MM-dd HH:mm" class="field-full" :placeholder="`请选择${field.label}`" /><el-input v-else v-model.trim="form[field.key]" :placeholder="`请输入${field.label}`" maxlength="100" /></el-form-item></el-col>
          <el-col v-for="field in textFields" :key="field.key" :span="24"><el-form-item :label="field.label" :prop="field.key"><el-input v-model.trim="form[field.key]" type="textarea" :rows="5" :maxlength="1000" show-word-limit :placeholder="`请输入${field.label}`" /></el-form-item></el-col>
          <el-col :xs="24" :sm="12"><el-form-item label="当前状态"><div class="readonly-status"><el-tag :type="statusType(form[config.statusKey])">{{ form[config.statusKey] }}</el-tag><span>状态由办理流程推进</span></div></el-form-item></el-col>
        </el-row>
      </el-form>
      <span slot="footer"><el-button @click="formVisible = false">取消</el-button><el-button type="primary" :loading="submitting" @click="submitForm">{{ editingId ? '保存' : '提交' }}</el-button></span>
    </el-dialog>

    <el-drawer :title="`${config.title}详情`" :visible.sync="detailVisible" size="520px" append-to-body :lock-scroll="true" custom-class="government-detail-drawer">
      <div v-if="selectedRecord" class="drawer-layout"><div class="drawer-scroll"><div class="detail-hero"><span><i :class="config.icon"></i></span><div><small>{{ selectedRecord.id }}</small><h3>{{ selectedRecord[config.primaryKey] || '-' }}</h3></div><el-tag :type="statusType(statusValue(selectedRecord))">{{ statusValue(selectedRecord) }}</el-tag></div><div class="detail-flow"><span v-for="(step, index) in config.flow" :key="step" :class="{ active: index <= currentStep(selectedRecord) }"><i>{{ index + 1 }}</i><b>{{ step }}</b></span></div><div class="detail-grid"><span v-for="field in fields" :key="field.key"><small>{{ field.label }}</small><b>{{ formatValue(selectedRecord[field.key]) }}</b></span></div></div><div class="drawer-actions"><el-button @click="detailVisible = false">关闭</el-button><el-button v-if="nextStatus(selectedRecord)" type="primary" @click="advance(selectedRecord)">推进至{{ nextStatus(selectedRecord) }}</el-button></div></div>
    </el-drawer>
  </main>
</template>

<script>
export default {
  name: 'GovernmentServiceBoard',
  props: { config: { type: Object, required: true } },
  data() { return { keyword: '', typeFilter: '', statusFilter: '', currentPage: 1, pageSize: 6, total: 0, records: [], loading: false, submitting: false, formVisible: false, detailVisible: false, editingId: '', selectedRecord: null, form: {} } },
  computed: {
    fields() { return this.config.fields || [] },
    normalFields() { return this.fields.filter((field) => field.type !== 'textarea') },
    textFields() { return this.fields.filter((field) => field.type === 'textarea') },
    cardFields() { return this.fields.filter((field) => field.type !== 'textarea' && ![this.config.primaryKey, this.config.timeKey, this.config.statusKey].includes(field.key)).slice(0, 3) },
    rules() { const rules = {}; this.fields.filter((field) => field.required).forEach((field) => { rules[field.key] = [{ required: true, message: `请填写${field.label}`, trigger: field.options ? 'change' : 'blur' }] }); return rules },
    pendingCount() { return this.records.filter((item) => this.currentStep(item) === 0).length },
    processingCount() { return this.records.filter((item) => this.currentStep(item) > 0 && this.currentStep(item) < this.config.flow.length - 1).length },
    completedCount() { return this.records.filter((item) => this.currentStep(item) === this.config.flow.length - 1).length }
  },
  created() { this.loadRecords() },
  methods: {
    apiKey(action) { return `${this.config.apiNamespace}.${action}` },
    unwrap(response) { if (!response) return response; if (response.data && response.data.head && response.data.data !== undefined) return response.data.data; return response },
    recordsFrom(data) { if (Array.isArray(data)) return data; if (Array.isArray(data && data.records)) return data.records; if (Array.isArray(data && data.list)) return data.list; return [] },
    totalFrom(data) { return Number(data && (data.total || data.count || data.totalCount)) || 0 },
    resetPage() { this.currentPage = 1; this.loadRecords() },
    async loadRecords() { this.loading = true; try { const params = { pageNo: this.currentPage, pageSize: this.pageSize, keyword: this.keyword || undefined, status: this.statusFilter || undefined }; if (this.typeFilter) params[this.config.typeKey || this.config.primaryKey] = this.typeFilter; const result = this.unwrap(await this.$api[this.apiKey('list')](params)); this.records = this.recordsFrom(result); this.total = this.totalFrom(result); if (!this.total) this.total = this.records.length } catch (error) { this.records = []; this.total = 0; this.$message.error(this.errorMessage(error, '列表加载失败，请稍后重试')) } finally { this.loading = false } },
    emptyForm() { const form = {}; this.fields.forEach((field) => { form[field.key] = '' }); form[this.config.statusKey] = this.config.statusOptions[0]; return form },
    resetForm() { this.editingId = ''; this.form = this.emptyForm(); this.$nextTick(() => this.$refs.governmentForm && this.$refs.governmentForm.clearValidate()) },
    openCreate() { this.editingId = ''; this.form = this.emptyForm(); this.formVisible = true },
    openEdit(item) { this.editingId = item.id; this.form = Object.assign(this.emptyForm(), item); this.formVisible = true },
    async submitForm() { const valid = await new Promise((resolve) => this.$refs.governmentForm.validate(resolve)); if (!valid) return; this.submitting = true; try { const payload = Object.assign({}, this.form, this.editingId ? { id: this.editingId } : {}); await this.$api[this.apiKey(this.editingId ? 'edit' : 'add')](payload); this.$message.success(this.editingId ? '已保存' : '已提交'); this.formVisible = false; this.loadRecords() } catch (error) { this.$message.error(this.errorMessage(error)) } finally { this.submitting = false } },
    statusValue(item) { return (item && item[this.config.statusKey]) || this.config.statusOptions[0] },
    currentStep(item) { const index = this.config.statusOptions.indexOf(this.statusValue(item)); return index < 0 ? 0 : Math.min(index, this.config.flow.length - 1) },
    canEdit(item) { return this.currentStep(item) === 0 },
    canDelete(item) { return this.currentStep(item) === 0 },
    nextStatus(item) { const nextIndex = this.currentStep(item) + 1; return this.config.statusOptions[nextIndex] || '' },
    statusType(status) { if (/(已办结|已归档|已完成)/.test(status)) return 'success'; if (/(待|退回)/.test(status)) return 'warning'; if (/(关闭|取消)/.test(status)) return 'info'; return 'primary' },
    formatValue(value) { return value === undefined || value === null || value === '' ? '-' : value },
    async advance(item) { const next = this.nextStatus(item); if (!next) return; try { await this.$confirm(`确认将该记录推进至“${next}”？`, '流程确认', { type: 'warning' }); await this.$api[this.apiKey('edit')](Object.assign({}, item, { [this.config.statusKey]: next })); this.$message.success(`已推进至${next}`); this.detailVisible = false; this.loadRecords() } catch (error) { if (error !== 'cancel') this.$message.error(this.errorMessage(error)) } },
    async removeRecord(item) { try { await this.$confirm('确认删除该记录？', '删除确认', { type: 'warning' }); await this.$api[this.apiKey('delete')]({}, { params: { id: item.id } }); this.$message.success('已删除'); this.loadRecords() } catch (error) { if (error !== 'cancel') this.$message.error(this.errorMessage(error, '删除失败，请稍后重试')) } },
    async openDetail(item) { this.selectedRecord = item; this.detailVisible = true; try { const result = this.unwrap(await this.$api[this.apiKey('queryById')]({ id: item.id })); if (result) this.selectedRecord = Object.assign({}, item, result) } catch (error) {} },
    errorMessage(error, fallback = '操作失败，请稍后重试') { const payload = error && ((error.response && error.response.data) || error.data || error); return (payload && payload.head && payload.head.message) || (payload && payload.message) || fallback }
  }
}
</script>

<style scoped>
.government-service-board { min-height: 100%; padding: 12px; box-sizing: border-box; background: #f8fafc; color: #1e293b; }.government-statistics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 12px; }.stat-card { min-height: 94px; display: flex; align-items: center; gap: 13px; padding: 16px 18px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; box-sizing: border-box; }.stat-card > span { width: 38px; height: 38px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 18px; }.stat-card div { min-width: 0; display: flex; flex-direction: column; }.stat-card small { color: #64748b; font-size: 13px; }.stat-card b { margin-top: 2px; color: #0f172a; font-size: 24px; line-height: 29px; }.stat-card em { overflow: hidden; color: #94a3b8; font-size: 12px; font-style: normal; text-overflow: ellipsis; white-space: nowrap; }.stat-card--primary > span { color: #0369a1; background: #e0f2fe; }.stat-card--warning > span { color: #b45309; background: #fef3c7; }.stat-card--process > span { color: #075985; background: #dff4ff; }.stat-card--success > span { color: #047857; background: #d1fae5; }.government-surface { min-height: clamp(650px, calc(100vh - 256px), 790px); display: flex; flex-direction: column; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; overflow: hidden; }.list-toolbar { min-height: 64px; display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid #e8edf3; box-sizing: border-box; }.list-toolbar .el-input { width: 290px; }.list-toolbar .el-select { width: 166px; }.toolbar-actions { margin-left: auto; }.government-grid { flex: 1 1 auto; display: grid; grid-template-columns: repeat(3, minmax(270px, 1fr)); align-content: start; gap: 16px; padding: 18px 22px 28px; }.government-card { min-height: 238px; display: flex; flex-direction: column; padding: 18px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; cursor: pointer; outline: none; transition: border-color .2s ease; }.government-card:hover, .government-card:focus { border-color: #0369a1; }.card-head, .card-title, .card-foot, .card-actions { display: flex; align-items: center; }.card-head { justify-content: space-between; gap: 12px; }.card-head > span { max-width: 70%; overflow: hidden; color: #647fa8; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }.card-head i, .card-title i { margin-right: 7px; color: #0369a1; }.card-title { gap: 3px; margin-top: 16px; }.card-title b { min-width: 0; overflow: hidden; color: #1e3a5f; font-size: 16px; text-overflow: ellipsis; white-space: nowrap; }.card-title time { margin-left: auto; color: #94a3b8; font-size: 12px; white-space: nowrap; }.card-meta { display: grid; grid-template-columns: 88px minmax(0, 1fr); gap: 7px 12px; margin: 14px 0 0; padding: 11px 0; border-top: 1px solid #eef2f6; border-bottom: 1px solid #eef2f6; font-size: 13px; }.card-meta dt { color: #94a3b8; }.card-meta dd { margin: 0; overflow: hidden; color: #475569; text-overflow: ellipsis; white-space: nowrap; }.flow-steps { display: flex; gap: 0; margin-top: 14px; }.flow-steps span { flex: 1; position: relative; display: flex; align-items: center; color: #a3afbf; font-size: 12px; white-space: nowrap; }.flow-steps span::after { content: ''; height: 1px; flex: 1; margin: 0 5px; background: #dbe4ee; }.flow-steps span:last-child::after { display: none; }.flow-steps i { width: 16px; height: 16px; margin-right: 4px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; color: #fff; background: #cbd5e1; font-size: 10px; font-style: normal; }.flow-steps .active { color: #0369a1; }.flow-steps .active i { background: #0369a1; }.card-foot { margin-top: auto; padding-top: 12px; justify-content: flex-end; }.card-actions { gap: 5px; white-space: nowrap; }.card-actions .el-button { margin-left: 0; }.advance-action { color: #0369a1; }.danger-action { color: #dc2626; }.empty-state { flex: 1 1 auto; min-height: 280px; padding-bottom: 48px; display: flex; align-items: center; justify-content: center; }.pagination-row { min-height: 66px; flex: 0 0 auto; display: flex; align-items: center; justify-content: flex-end; gap: 16px; padding: 0 20px; border-top: 1px solid #e8edf3; color: #64748b; font-size: 13px; }.field-full { width: 100%; }.drawer-layout { height: 100%; display: flex; flex-direction: column; }.drawer-scroll { flex: 1; overflow-y: auto; padding: 16px; }.detail-hero { display: flex; align-items: center; gap: 12px; padding: 16px; border-radius: 8px; background: #eff6ff; }.detail-hero > span { width: 42px; height: 42px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; color: #fff; background: #0369a1; font-size: 20px; }.detail-hero h3 { max-width: 300px; margin: 4px 0; overflow: hidden; color: #0f172a; font-size: 18px; text-overflow: ellipsis; white-space: nowrap; }.detail-hero small { color: #64748b; }.detail-hero .el-tag { margin-left: auto; }.detail-flow { display: flex; padding: 22px 4px 10px; }.detail-flow span { flex: 1; display: flex; flex-direction: column; align-items: center; color: #94a3b8; font-size: 12px; text-align: center; }.detail-flow i { width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 8px; border-radius: 50%; color: #fff; background: #cbd5e1; font-style: normal; }.detail-flow .active { color: #0369a1; }.detail-flow .active i { background: #0369a1; }.detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); overflow: hidden; border: 1px solid #e2e8f0; border-radius: 7px; }.detail-grid span { min-height: 66px; padding: 11px 13px; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; box-sizing: border-box; }.detail-grid span:nth-child(2n) { border-right: 0; }.detail-grid small, .detail-grid b { display: block; }.detail-grid small { color: #94a3b8; font-size: 12px; }.detail-grid b { margin-top: 7px; color: #334155; font-size: 14px; word-break: break-all; }.drawer-actions { flex: 0 0 auto; padding: 12px 16px; border-top: 1px solid #e2e8f0; text-align: right; }
@media (max-width: 1100px) { .government-grid { grid-template-columns: repeat(2, minmax(270px, 1fr)); } } @media (max-width: 760px) { .government-service-board { min-height: 100dvh; height: auto; padding: 8px 8px calc(84px + env(safe-area-inset-bottom)); overflow: visible; }.government-statistics { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-bottom: 8px; }.stat-card { min-height: 82px; padding: 12px; gap: 9px; }.stat-card > span { width: 34px; height: 34px; font-size: 16px; }.stat-card b { font-size: 20px; }.government-surface { min-height: calc(100dvh - 24px); }.list-toolbar { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); min-height: auto; padding: 12px; }.list-toolbar .el-input { width: 100%; grid-column: 1 / -1; }.list-toolbar .el-select { width: 100%; }.toolbar-actions { width: 100%; margin-left: 0; grid-column: 1 / -1; }.toolbar-actions .el-button { width: 100%; min-height: 42px; }.government-grid { grid-template-columns: minmax(0, 1fr); gap: 12px; padding: 12px; }.government-card { min-height: 248px; padding: 16px; }.card-actions { flex-wrap: wrap; justify-content: flex-end; }.pagination-row { min-height: 58px; padding: 0 12px; gap: 8px; }.detail-grid { grid-template-columns: 1fr; }.detail-grid span, .detail-grid span:nth-child(2n) { border-right: 0; }.detail-grid span:last-child { border-bottom: 0; } ::v-deep .government-detail-drawer { width: 100% !important; max-width: 100% !important; } ::v-deep .government-detail-drawer .el-drawer__body { display: flex; min-height: 0; flex: 1 1 auto; overflow: hidden; }.drawer-layout { min-height: 0; height: 100%; width: 100%; }.drawer-scroll { min-height: 0; padding: 14px; -webkit-overflow-scrolling: touch; }.drawer-actions { padding: 12px 14px calc(12px + env(safe-area-inset-bottom)); } ::v-deep .government-form-dialog { width: 100% !important; min-width: 0; height: 100dvh; margin: 0 !important; display: flex; flex-direction: column; border-radius: 0; } ::v-deep .government-form-dialog .el-dialog__body { min-height: 0; flex: 1 1 auto; overflow-y: auto; padding: 18px 16px; -webkit-overflow-scrolling: touch; } ::v-deep .government-form-dialog .el-dialog__footer { flex: 0 0 auto; padding: 12px 16px calc(12px + env(safe-area-inset-bottom)); } ::v-deep .government-form-dialog .dialog-footer { display: flex; gap: 10px; } ::v-deep .government-form-dialog .dialog-footer .el-button { flex: 1; margin: 0; min-height: 42px; } } @media (max-width: 420px) { .list-toolbar { grid-template-columns: minmax(0, 1fr); }.list-toolbar .el-select { grid-column: 1 / -1; } }
.readonly-status { min-height: 40px; display: flex; align-items: center; gap: 9px; padding: 0 12px; border: 1px solid #dbe4ee; border-radius: 4px; background: #f8fafc; }.readonly-status span { color: #64748b; font-size: 12px; }
@media (max-width: 760px) {
  .government-service-board {
    height: 100% !important;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
    touch-action: pan-y;
  }
}
</style>
<style scoped>
/* 对齐办事大厅：统计、工具栏、卡片、空态与分页使用同一套间距 */
.government-service-board { min-height: 100%; padding: 12px; box-sizing: border-box; background: #f6f8fb; }
.government-statistics { gap: 12px; margin-bottom: 12px; }
.government-service-board .stat-card { min-height: 94px; padding: 16px 18px; border-color: #e5ebf2; border-radius: 10px; }
.government-surface { min-height: clamp(660px, calc(100vh - 250px), 760px); border-color: #e5ebf2; border-radius: 10px; box-shadow: 0 4px 14px rgba(15, 23, 42, .035); }
.government-service-board .list-toolbar { min-height: 64px; padding: 14px 20px; gap: 10px; }
.government-service-board .list-toolbar .el-input { width: 300px; }
.government-service-board .list-toolbar .el-select { width: 160px; }
.government-grid { gap: 14px; padding: 2px 20px 18px; }
.government-card { min-height: 252px; padding: 16px; border-color: #e6ecf3; border-radius: 10px; }
.government-card:hover, .government-card:focus { border-color: #a9caf7; }
.government-service-board .empty-state { min-height: 260px; padding: 24px 20px 48px; box-sizing: border-box; }
.government-service-board .pagination-row { min-height: 0; margin-top: auto; padding: 12px 20px 16px; }
@media (max-width: 760px) {
  .government-service-board { height: 100% !important; min-height: 0; padding: 14px 12px calc(24px + env(safe-area-inset-bottom)); overflow-x: hidden; overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior-y: contain; touch-action: pan-y; }
  .government-statistics { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .government-service-board .stat-card { min-height: 82px; padding: 12px; }
  .government-surface { min-height: 440px; }
  .government-service-board .list-toolbar { display: flex; flex-wrap: wrap; padding: 12px; }
  .government-service-board .list-toolbar .el-input { width: 100%; }
  .government-service-board .list-toolbar .el-select { width: calc(50% - 5px); }
  .toolbar-actions { width: 100%; margin-left: 0; }
  .toolbar-actions .el-button { width: 100%; min-height: 38px; }
  .government-grid { grid-template-columns: minmax(0, 1fr); gap: 12px; padding: 2px 12px 14px; }
  .government-card { min-height: 238px; }
  .government-service-board .pagination-row { justify-content: center; padding: 12px; }
}
</style>
