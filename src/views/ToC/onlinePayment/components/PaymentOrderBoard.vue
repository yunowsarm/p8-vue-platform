<template>
  <main class="payment-order-board">
    <section class="board-statistics" aria-label="订单统计">
      <article class="stat-card stat-card--primary">
        <span class="stat-icon"><i class="el-icon-document"></i></span>
        <div>
          <small>订单总数</small>
          <b>{{ paginationTotal }}</b>
          <em>当前查询结果</em>
        </div>
      </article>
      <article class="stat-card stat-card--warning">
        <span class="stat-icon"><i class="el-icon-time"></i></span>
        <div>
          <small>待支付</small>
          <b>{{ pendingCount }}</b>
          <em>当前页订单</em>
        </div>
      </article>
      <article class="stat-card stat-card--success">
        <span class="stat-icon"><i class="el-icon-circle-check"></i></span>
        <div>
          <small>支付成功</small>
          <b>{{ paidCount }}</b>
          <em>当前页订单</em>
        </div>
      </article>
      <article class="stat-card stat-card--info">
        <span class="stat-icon"><i class="el-icon-money"></i></span>
        <div>
          <small>当前页金额</small>
          <b>¥{{ displayAmount(currentPageAmount) }}</b>
          <em>{{ config.title }}</em>
        </div>
      </article>
    </section>
    <section v-loading="loading" class="payment-surface">
      <div class="list-toolbar">
        <el-input v-model.trim="keyword" clearable size="small" prefix-icon="el-icon-search" placeholder="搜索订单号、用户编号或业务信息" @input="resetPage" @clear="resetPage" />
        <el-select v-if="primaryOptions.length" v-model="typeFilter" clearable size="small" :placeholder="'全部' + config.primaryLabel" @change="resetPage" @clear="resetPage">
          <el-option v-for="item in primaryOptions" :key="item" :label="item" :value="item" />
        </el-select>
        <el-select v-model="statusFilter" clearable size="small" placeholder="全部状态" @change="resetPage" @clear="resetPage">
          <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
        </el-select>
        <div class="toolbar-actions">
          <el-button type="primary" size="small" icon="el-icon-plus" @click="openCreate">新建{{ config.title }}</el-button>
        </div>
      </div>

      <div v-if="pagedRecords.length" class="payment-grid">
        <article v-for="item in pagedRecords" :key="item.id" class="payment-card" tabindex="0" role="button" @click="openDetail(item)" @keydown.enter="openDetail(item)">
          <div class="card-head">
            <span class="order-no">
              <i class="el-icon-document"></i>
              {{ item.orderNo || item.id }}
            </span>
            <el-tag :type="statusType(statusText(item.status))" size="small" effect="light">{{ statusText(item.status) }}</el-tag>
          </div>
          <div class="card-amount">
            <span>{{ config.primaryLabel }}</span>
            <b>¥ {{ displayAmount(item.amount) }}</b>
          </div>
          <dl class="order-meta">
            <template v-for="field in cardFields">
              <dt :key="field.key + '-label'">{{ field.label }}</dt>
              <dd :key="field.key + '-value'">{{ formatValue(item[field.key]) }}</dd>
            </template>
          </dl>
          <div class="card-foot">
            <time>
              <i class="el-icon-time"></i>
              {{ paymentTime(item) }}
            </time>
            <div class="card-actions">
              <el-button type="text" size="mini" @click.stop="openDetail(item)">查看详情</el-button>
              <el-button v-if="isPending(item)" type="text" size="mini" class="pay-action" @click.stop="payRecord(item)">去支付</el-button>
              <el-button v-if="isPending(item)" type="text" size="mini" class="cancel-action" @click.stop="cancelRecord(item)">取消订单</el-button>
              <el-button v-else type="text" size="mini" @click.stop="openEdit(item)">编辑</el-button>
              <el-button type="text" size="mini" class="danger-action" @click.stop="removeRecord(item)">删除</el-button>
            </div>
          </div>
        </article>
      </div>
      <el-empty v-else class="empty-state" description="暂无符合筛选条件的数据" />
      <div v-if="paginationTotal" class="pagination-row">
        <span>每页 {{ pageSize }} 条</span>
        <el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="paginationTotal" layout="prev, pager, next" @current-change="loadRecords" />
      </div>
    </section>

    <el-dialog
      :title="editingId ? '编辑' + config.title : '新建' + config.title"
      :visible.sync="formVisible"
      top="4vh"
      append-to-body
      :close-on-click-modal="false"
      custom-class="payment-form-dialog"
      @closed="resetForm">
      <el-form ref="paymentForm" :model="form" :rules="rules" label-width="96px" @submit.native.prevent>
        <el-row :gutter="28">
          <el-col v-for="field in normalFields" :key="field.key" :xs="24" :sm="12">
            <el-form-item :label="field.label" :prop="field.key">
              <el-select v-if="field.options" v-model="form[field.key]" clearable filterable :placeholder="'请选择' + field.label" class="field-full">
                <el-option v-for="option in field.options" :key="option" :label="option" :value="option" />
              </el-select>
              <el-date-picker
                v-else-if="field.type === 'datetime'"
                v-model="form[field.key]"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                format="yyyy-MM-dd HH:mm"
                :placeholder="'请选择' + field.label"
                class="field-full" />
              <el-date-picker
                v-else-if="field.type === 'date'"
                v-model="form[field.key]"
                type="date"
                value-format="yyyy-MM-dd"
                format="yyyy-MM-dd"
                :placeholder="'请选择' + field.label"
                class="field-full" />
              <el-input-number v-else-if="field.type === 'amount'" v-model="form[field.key]" :min="0" :precision="2" :controls="false" class="field-full" />
              <el-input v-else v-model.trim="form[field.key]" :placeholder="'请输入' + field.label" maxlength="80" />
            </el-form-item>
          </el-col>
          <el-col v-for="field in textFields" :key="field.key" :span="24">
            <el-form-item :label="field.label" :prop="field.key">
              <el-input v-model.trim="form[field.key]" type="textarea" :rows="4" :maxlength="300" show-word-limit :placeholder="'请输入' + field.label" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="状态">
              <div class="readonly-status">
                <i class="el-icon-time"></i>
                {{ statusText(form.status) }}
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">{{ editingId ? '保存' : '创建订单' }}</el-button>
      </span>
    </el-dialog>

    <el-drawer :title="config.title + '详情'" :visible.sync="detailVisible" size="500px" append-to-body :lock-scroll="true" custom-class="payment-detail-drawer">
      <div v-if="selectedRecord" class="drawer-layout">
        <div class="drawer-scroll">
          <div class="detail-hero">
            <span class="hero-icon"><i :class="config.icon"></i></span>
            <div>
              <small>{{ selectedRecord.orderNo || selectedRecord.id }}</small>
              <h3>¥ {{ displayAmount(selectedRecord.amount) }}</h3>
            </div>
            <el-tag :type="statusType(statusText(selectedRecord.status))">{{ statusText(selectedRecord.status) }}</el-tag>
          </div>
          <div class="detail-grid">
            <span v-for="field in detailFields" :key="field.key">
              <small>{{ field.label }}</small>
              <b>{{ formatValue(selectedRecord[field.key]) }}</b>
            </span>
          </div>
          <section class="detail-section">
            <h4>订单流转</h4>
            <div class="timeline">
              <div class="timeline-item done">
                <span></span>
                <div>
                  <b>订单已创建</b>
                  <small>{{ creationTime(selectedRecord) }}</small>
                </div>
              </div>
              <div class="timeline-item" :class="{ done: !isPending(selectedRecord) }">
                <span></span>
                <div>
                  <b>{{ isPending(selectedRecord) ? '等待支付' : statusText(selectedRecord.status) }}</b>
                  <small>{{ isPending(selectedRecord) ? '请完成支付或取消订单' : paymentTime(selectedRecord) }}</small>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div class="drawer-actions">
          <el-button @click="detailVisible = false">关闭</el-button>
          <el-button v-if="isPending(selectedRecord)" type="primary" @click="payRecord(selectedRecord)">去支付</el-button>
        </div>
      </div>
    </el-drawer>
  </main>
</template>

<script>
const pad = (value) => String(value).padStart(2, '0')
const now = () => {
  const date = new Date()
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export default {
  name: 'PaymentOrderBoard',
  props: { config: { type: Object, required: true } },
  data() {
    return {
      keyword: '',
      typeFilter: '',
      statusFilter: '',
      currentPage: 1,
      pageSize: 6,
      total: 0,
      records: [],
      loading: false,
      submitting: false,
      usingMock: false,
      formVisible: false,
      detailVisible: false,
      editingId: '',
      selectedRecord: null,
      form: {}
    }
  },
  computed: {
    fields() {
      return this.config.fields || []
    },
    normalFields() {
      return this.fields.filter((item) => item.type !== 'textarea')
    },
    textFields() {
      return this.fields.filter((item) => item.type === 'textarea')
    },
    primaryOptions() {
      const field = this.fields.find((item) => item.key === this.config.primaryKey)
      return field && field.options ? field.options : []
    },
    statusOptions() {
      return ['待支付', '支付成功', '支付失败', '已取消', '已退款']
    },
    cardFields() {
      return this.fields.filter((item) => !['userId', 'amount', 'payTime', 'rechargeTime'].includes(item.key)).slice(0, 4)
    },
    detailFields() {
      return this.fields.filter((item) => item.key !== 'amount')
    },
    rules() {
      const result = {}
      this.fields
        .filter((field) => field.required)
        .forEach((field) => {
          result[field.key] = [{ required: true, message: `请填写${field.label}`, trigger: field.type === 'select' ? 'change' : 'blur' }]
        })
      return result
    },
    filteredRecords() {
      const keyword = this.keyword.toLowerCase()
      return this.records.filter((item) => {
        const matchesKeyword =
          !keyword ||
          Object.keys(item).some((key) =>
            String(item[key] || '')
              .toLowerCase()
              .includes(keyword)
          )
        const matchesType = !this.typeFilter || item[this.config.primaryKey] === this.typeFilter
        const matchesStatus = !this.statusFilter || this.statusText(item.status) === this.statusFilter
        return matchesKeyword && matchesType && matchesStatus
      })
    },
    paginationTotal() {
      return this.total || this.filteredRecords.length
    },
    pagedRecords() {
      if (this.total && !this.usingMock) return this.filteredRecords
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredRecords.slice(start, start + this.pageSize)
    },
    pendingCount() {
      return this.pagedRecords.filter((item) => this.statusText(item.status) === '待支付').length
    },
    paidCount() {
      return this.pagedRecords.filter((item) => this.statusText(item.status) === '支付成功').length
    },
    currentPageAmount() {
      return this.pagedRecords.reduce((total, item) => total + (Number(item.amount) || 0), 0)
    }
  },
  created() {
    this.loadRecords()
  },
  methods: {
    currentUserId() {
      try {
        return JSON.parse(window.sessionStorage.getItem('userInfo') || '{}').id || ''
      } catch (error) {
        return ''
      }
    },
    apiKey(action) {
      return `${this.config.apiNamespace}.${action}`
    },
    // 项目 Axios 拦截器已返回业务 data；只有未经过拦截器的响应才需要继续取 data。
    unwrap(response) {
      if (!response) return response
      if (response.data && response.data.head && response.data.data !== undefined) return response.data.data
      return response
    },
    recordsFrom(data) {
      if (Array.isArray(data)) return data
      if (Array.isArray(data && data.records)) return data.records
      if (Array.isArray(data && data.list)) return data.list
      return []
    },
    totalFrom(data) {
      return Number(data && (data.total || data.count || data.totalCount)) || 0
    },
    statusText(value) {
      if (value === undefined || value === null || value === '' || value === '0') return '待支付'
      const map = { 1: '支付成功', 2: '支付失败', 3: '已取消', 4: '已退款' }
      return map[value] || value
    },
    statusType(status) {
      if (status === '支付成功') return 'success'
      if (status === '待支付') return 'warning'
      if (status === '支付失败') return 'danger'
      return 'info'
    },
    isPending(item) {
      return this.statusText(item.status) === '待支付'
    },
    displayAmount(value) {
      const number = Number(value)
      return Number.isFinite(number) ? number.toFixed(2) : '0.00'
    },
    formatValue(value) {
      return value === undefined || value === null || value === '' ? '-' : value
    },
    paymentTime(item) {
      return item.payTime || item.rechargeTime || item.bookDate || '-'
    },
    creationTime(item) {
      return item.rechargeTime || item.bookDate || item.createTime || '-'
    },
    resetPage() {
      this.currentPage = 1
      if (!this.usingMock) this.loadRecords()
    },
    async loadRecords() {
      this.loading = true
      try {
        const result = this.unwrap(
          await this.$api[this.apiKey('list')]({ pageNo: this.currentPage, pageSize: this.pageSize, keyword: this.keyword || undefined, status: this.statusFilter || undefined })
        )
        this.records = this.recordsFrom(result)
        this.total = this.totalFrom(result)
        this.usingMock = false
      } catch (error) {
        this.records = this.config.records || []
        this.total = this.records.length
        this.usingMock = true
      } finally {
        this.loading = false
      }
    },
    resetForm() {
      this.editingId = ''
      this.form = this.emptyForm()
      this.$nextTick(() => this.$refs.paymentForm && this.$refs.paymentForm.clearValidate())
    },
    emptyForm() {
      const form = { status: '待支付' }
      this.fields.forEach((field) => {
        form[field.key] = field.type === 'amount' ? undefined : ''
      })
      return form
    },
    openCreate() {
      this.editingId = ''
      this.form = this.emptyForm()
      this.formVisible = true
    },
    openEdit(item) {
      this.editingId = item.id
      this.form = Object.assign(this.emptyForm(), item, { status: this.statusText(item.status) })
      this.formVisible = true
    },
    async submitForm() {
      const valid = await new Promise((resolve) => this.$refs.paymentForm.validate(resolve))
      if (!valid) return
      this.submitting = true
      const payload = Object.assign({}, this.form, this.editingId ? { id: this.editingId, updateBy: this.currentUserId(), itemUpdateTime: now() } : { createBy: this.currentUserId(), itemCreateTime: now() })
      try {
        await this.$api[this.apiKey(this.editingId ? 'edit' : 'add')](payload)
        this.$message.success(this.editingId ? '订单已更新' : '订单已创建')
        this.formVisible = false
        this.loadRecords()
      } catch (error) {
        this.$message.error(this.errorMessage(error))
      } finally {
        this.submitting = false
      }
    },
    async updateStatus(item, status) {
      const payload = Object.assign({}, item, { status, payTime: status === '支付成功' ? now() : item.payTime, updateBy: this.currentUserId(), itemUpdateTime: now() })
      try {
        await this.$api[this.apiKey('edit')](payload)
        this.$message.success(status === '支付成功' ? '支付成功' : '订单已取消')
        this.detailVisible = false
        this.loadRecords()
      } catch (error) {
        this.$message.error(this.errorMessage(error, '状态更新失败，请稍后重试'))
      }
    },
    payRecord(item) {
      this.$confirm('确认完成本笔订单支付？', '支付确认', { type: 'warning' })
        .then(() => this.updateStatus(item, '支付成功'))
        .catch(() => {})
    },
    cancelRecord(item) {
      this.$confirm('取消后不可恢复，确认取消该订单？', '取消订单', { type: 'warning' })
        .then(() => this.updateStatus(item, '已取消'))
        .catch(() => {})
    },
    async removeRecord(item) {
      try {
        await this.$confirm('确认删除该订单记录？', '删除确认', { type: 'warning' })
        await this.$api[this.apiKey('delete')]({ id: item.id })
        this.$message.success('已删除')
        this.loadRecords()
      } catch (error) {
        if (error !== 'cancel') this.$message.error(this.errorMessage(error, '删除失败，请稍后重试'))
      }
    },
    errorMessage(error, fallback = '操作失败，请稍后重试') {
      const payload = error && ((error.response && error.response.data) || error.data || error)
      return (payload && payload.head && payload.head.message) || (payload && payload.message) || fallback
    },
    async openDetail(item) {
      this.selectedRecord = item
      this.detailVisible = true
      try {
        const result = this.unwrap(await this.$api[this.apiKey('queryById')]({ id: item.id }))
        if (result) this.selectedRecord = Object.assign({}, item, result)
      } catch (error) {}
    }
  }
}
</script>

<style scoped>
.payment-order-board {
  min-height: 100%;
  padding: 12px;
  box-sizing: border-box;
  background: #f6f8fb;
}
.board-statistics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}
.stat-card {
  min-height: 94px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 13px;
  border: 1px solid #e7edf5;
  border-radius: 8px;
  background: #fff;
  box-sizing: border-box;
}
.stat-icon {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 18px;
}
.stat-card div {
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.stat-card small {
  color: #7f8da3;
  font-size: 13px;
  line-height: 18px;
}
.stat-card b {
  margin-top: 2px;
  color: #1f3858;
  font-size: 23px;
  line-height: 27px;
}
.stat-card em {
  overflow: hidden;
  color: #a2aec0;
  font-size: 12px;
  font-style: normal;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.stat-card--primary .stat-icon {
  color: #377ee8;
  background: #eaf2ff;
}
.stat-card--warning .stat-icon {
  color: #d99018;
  background: #fff4df;
}
.stat-card--success .stat-icon {
  color: #18a06d;
  background: #e7f8f0;
}
.stat-card--info .stat-icon {
  color: #2187b9;
  background: #e6f7fc;
}
.payment-surface {
  min-height: clamp(650px, calc(100vh - 256px), 780px);
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e7edf5;
  border-radius: 8px;
  overflow: hidden;
}
.list-toolbar {
  min-height: 64px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-sizing: border-box;
}
.list-toolbar .el-input {
  width: 270px;
}
.list-toolbar .el-select {
  width: 170px;
}
.toolbar-actions {
  margin-left: auto;
}
.payment-grid {
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(260px, 1fr));
  gap: 16px;
  align-content: start;
  padding: 18px 22px 28px;
}
.payment-card {
  min-height: 224px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  border: 1px solid #e4ebf4;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s ease;
  outline: none;
}
.payment-card:hover,
.payment-card:focus {
  border-color: #2f86ed;
}
.card-head,
.card-foot,
.card-actions {
  display: flex;
  align-items: center;
}
.card-head {
  justify-content: space-between;
  gap: 10px;
}
.order-no {
  color: #6d91c4;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.order-no i {
  margin-right: 7px;
  color: #409eff;
}
.card-amount {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin: 20px 0 13px;
}
.card-amount span {
  color: #52637a;
  font-size: 14px;
}
.card-amount b {
  color: #172d4d;
  font-size: 24px;
  line-height: 1;
}
.order-meta {
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr);
  gap: 8px 12px;
  margin: 0;
  padding: 12px 0;
  border-top: 1px solid #edf1f6;
  border-bottom: 1px solid #edf1f6;
  font-size: 13px;
}
.order-meta dt {
  color: #9aa8bb;
}
.order-meta dd {
  margin: 0;
  color: #50617a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-foot {
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 13px;
}
.card-foot time {
  color: #9aa8bb;
  font-size: 12px;
  white-space: nowrap;
}
.card-foot time i {
  margin-right: 5px;
}
.card-actions {
  margin-left: auto;
  gap: 4px;
  white-space: nowrap;
}
.card-actions .el-button {
  margin-left: 0;
}
.pay-action {
  color: #17a36b;
}
.cancel-action,
.danger-action {
  color: #f56c6c;
}
.empty-state {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  padding-bottom: 48px;
}
.pagination-row {
  flex: 0 0 auto;
  min-height: 66px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  border-top: 1px solid #edf1f6;
  color: #8b98aa;
  font-size: 13px;
}
.field-full {
  width: 100%;
}
.readonly-status {
  height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 13px;
  border: 1px solid #dfe6ef;
  border-radius: 4px;
  color: #ad7b24;
  background: #fffaf0;
  box-sizing: border-box;
}
.readonly-status i {
  color: #e6a23c;
}
.drawer-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.drawer-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
.detail-hero {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #eff6ff;
  border-radius: 8px;
}
.hero-icon {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #2f86ed;
  border-radius: 8px;
  color: #fff;
  font-size: 20px;
}
.detail-hero h3 {
  margin: 4px 0;
  color: #172d4d;
  font-size: 22px;
}
.detail-hero small {
  color: #7b8da7;
}
.detail-hero .el-tag {
  margin-left: auto;
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 16px;
  border: 1px solid #e7edf5;
  border-radius: 7px;
  overflow: hidden;
}
.detail-grid span {
  min-height: 66px;
  padding: 11px 13px;
  border-right: 1px solid #e7edf5;
  border-bottom: 1px solid #e7edf5;
  box-sizing: border-box;
}
.detail-grid span:nth-child(2n) {
  border-right: 0;
}
.detail-grid small,
.detail-grid b {
  display: block;
}
.detail-grid small {
  color: #93a2b7;
  font-size: 12px;
}
.detail-grid b {
  margin-top: 7px;
  color: #40536f;
  font-size: 14px;
  word-break: break-all;
}
.detail-section {
  margin-top: 20px;
}
.detail-section h4 {
  margin: 0 0 12px;
  color: #2e405d;
  font-size: 15px;
}
.timeline-item {
  position: relative;
  display: flex;
  gap: 12px;
  padding-bottom: 20px;
  color: #98a6b8;
}
.timeline-item > span {
  position: relative;
  z-index: 1;
  width: 10px;
  height: 10px;
  margin-top: 5px;
  border-radius: 50%;
  background: #dce4ee;
}
.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  top: 15px;
  left: 4px;
  width: 2px;
  height: calc(100% - 10px);
  background: #e6ebf2;
}
.timeline-item.done {
  color: #536780;
}
.timeline-item.done > span {
  background: #409eff;
}
.timeline-item b,
.timeline-item small {
  display: block;
}
.timeline-item small {
  margin-top: 5px;
  font-size: 12px;
}
.drawer-actions {
  flex: 0 0 auto;
  padding: 12px 16px;
  text-align: right;
  border-top: 1px solid #e8edf3;
}
.drawer-actions .el-button + .el-button {
  margin-left: 8px;
}
@media (max-width: 1100px) {
  .payment-grid {
    grid-template-columns: repeat(2, minmax(260px, 1fr));
  }
}
@media (max-width: 760px) {
  .payment-order-board {
    min-height: 100dvh;
    height: auto;
    padding: 8px 8px calc(84px + env(safe-area-inset-bottom));
    overflow: visible;
  }
  .board-statistics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-bottom: 8px;
  }
  .stat-card {
    min-height: 82px;
    padding: 12px;
    gap: 9px;
  }
  .stat-icon {
    width: 34px;
    height: 34px;
    flex-basis: 34px;
    font-size: 16px;
  }
  .stat-card b {
    font-size: 20px;
  }
  .payment-surface {
    min-height: calc(100dvh - 24px);
  }
  .list-toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    min-height: auto;
    padding: 12px;
    gap: 10px;
  }
  .list-toolbar .el-input {
    width: 100%;
    grid-column: 1 / -1;
  }
  .list-toolbar .el-select {
    width: 100%;
  }
  .toolbar-actions {
    grid-column: 1 / -1;
    width: 100%;
    margin-left: 0;
  }
  .toolbar-actions .el-button {
    width: 100%;
    min-height: 42px;
  }
  .payment-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
    padding: 12px;
  }
  .payment-card {
    min-height: 214px;
    padding: 16px;
  }
  .card-foot {
    display: block;
  }
  .card-actions {
    justify-content: flex-end;
    margin-top: 9px;
  }
  .pagination-row {
    min-height: 58px;
    padding: 0 12px;
    gap: 8px;
  }
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .detail-grid span,
  .detail-grid span:nth-child(2n) {
    border-right: 0;
  }
  .detail-grid span:last-child {
    border-bottom: 0;
  }
  ::v-deep .payment-detail-drawer { width: 100% !important; max-width: 100% !important; }
  ::v-deep .payment-detail-drawer .el-drawer__body { display: flex; min-height: 0; flex: 1 1 auto; overflow: hidden; }
  .drawer-layout { min-height: 0; height: 100%; width: 100%; }
  .drawer-scroll { min-height: 0; padding: 14px; -webkit-overflow-scrolling: touch; }
  .drawer-actions { padding: 12px 14px calc(12px + env(safe-area-inset-bottom)); }
  ::v-deep .payment-form-dialog { width: 100% !important; min-width: 0; height: 100dvh; margin: 0 !important; display: flex; flex-direction: column; border-radius: 0; }
  ::v-deep .payment-form-dialog .el-dialog__body { min-height: 0; flex: 1 1 auto; overflow-y: auto; padding: 18px 16px; -webkit-overflow-scrolling: touch; }
  ::v-deep .payment-form-dialog .el-dialog__footer { flex: 0 0 auto; padding: 12px 16px calc(12px + env(safe-area-inset-bottom)); }
  ::v-deep .payment-form-dialog .dialog-footer { display: flex; gap: 10px; }
  ::v-deep .payment-form-dialog .dialog-footer .el-button { flex: 1; margin: 0; min-height: 42px; }
}
@media (max-width: 420px) { .list-toolbar { grid-template-columns: minmax(0, 1fr); }.list-toolbar .el-select { grid-column: 1 / -1; } }
/* 仅本看板在移动端承载页面滚动，避免改动后台配置页的全局路由高度。 */
@media (max-width: 760px) {
  .payment-order-board {
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
/* 与办事大厅看板保持一致的列表基线 */
.payment-order-board { min-height: 100%; padding: 12px; box-sizing: border-box; background: #f6f8fb; }
.payment-order-board .board-statistics { gap: 12px; margin-bottom: 12px; }
.payment-order-board .stat-card { min-height: 94px; padding: 16px 18px; border-color: #e5ebf2; border-radius: 10px; box-shadow: none; }
.payment-surface { min-height: clamp(660px, calc(100vh - 250px), 760px); border-color: #e5ebf2; border-radius: 10px; box-shadow: 0 4px 14px rgba(15, 23, 42, .035); }
.payment-order-board .list-toolbar { min-height: 64px; padding: 14px 20px; gap: 10px; }
.payment-order-board .list-toolbar .el-input { width: 300px; }
.payment-order-board .list-toolbar .el-select { width: 160px; }
.payment-grid { gap: 14px; padding: 2px 20px 18px; }
.payment-card { min-height: 252px; padding: 16px; border-color: #e6ecf3; border-radius: 10px; }
.payment-card:hover { border-color: #a9caf7; }
.payment-order-board .empty-state { min-height: 260px; padding: 24px 20px 48px; box-sizing: border-box; }
.payment-order-board .pagination-row { min-height: 0; margin-top: auto; padding: 12px 20px 16px; }
@media (max-width: 760px) {
  .payment-order-board { height: 100% !important; min-height: 0; padding: 14px 12px calc(24px + env(safe-area-inset-bottom)); overflow-x: hidden; overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior-y: contain; touch-action: pan-y; }
  .payment-order-board .board-statistics { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .payment-order-board .stat-card { min-height: 82px; padding: 12px; }
  .payment-surface { min-height: 440px; }
  .payment-order-board .list-toolbar { padding: 12px; }
  .payment-order-board .list-toolbar .el-input { width: 100%; }
  .payment-order-board .list-toolbar .el-select { width: calc(50% - 5px); }
  .payment-grid { grid-template-columns: minmax(0, 1fr); gap: 12px; padding: 2px 12px 14px; }
  .payment-card { min-height: 238px; }
  .payment-order-board .pagination-row { justify-content: center; padding: 12px; }
}
</style>
