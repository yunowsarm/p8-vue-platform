<template>
  <main class="policy-service-board">
    <section class="metric-grid" aria-label="当前业务统计">
      <article v-for="metric in metrics" :key="metric.label" class="metric-card" :class="metric.tone">
        <i :class="metric.icon"></i>
        <div>
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
          <small>{{ metric.hint }}</small>
        </div>
      </article>
    </section>

    <section class="surface policy-list-surface">
      <div class="toolbar">
        <el-input v-model="keyword" clearable prefix-icon="el-icon-search" :placeholder="`搜索${config.searchLabel || '编号、标题、联系人'}`" @clear="search" @keyup.enter.native="search" />
        <el-select v-if="config.typeKey" v-model="typeFilter" clearable :placeholder="`全部${config.typeLabel || '类型'}`" @change="search">
          <el-option v-for="option in config.typeOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
        <el-select v-if="config.statusKey" v-model="statusFilter" clearable placeholder="全部状态" @change="search">
          <el-option v-for="status in config.statusOptions" :key="status" :label="status" :value="status" />
        </el-select>
        <el-button v-if="hasFilters" icon="el-icon-refresh-left" @click="resetFilters">重置</el-button>
        <span class="toolbar-spacer"></span>
        <el-button v-if="selectedIds.length" type="danger" plain icon="el-icon-delete" @click="bulkRemove">批量删除（{{ selectedIds.length }}）</el-button>
        <el-button type="primary" icon="el-icon-plus" @click="openCreate">{{ config.createLabel || `新建${config.title}` }}</el-button>
      </div>

      <div v-loading="loading" class="cards-stage">
        <div v-if="records.length" class="policy-card-grid">
          <article v-for="record in records" :key="record.id" class="policy-card" @click="openDetail(record)">
            <div class="card-topline">
              <span class="record-id">
                <i class="el-icon-document"></i>
                {{ displayId(record) }}
              </span>
              <div class="card-state" @click.stop>
                <el-tag size="mini" :type="statusType(statusValue(record))">{{ statusValue(record) }}</el-tag>
                <el-checkbox :value="selectedIds.includes(record.id)" :aria-label="`选择${displayTitle(record)}`" @change="toggleSelected(record.id, $event)" />
              </div>
            </div>
            <div class="card-title-row">
              <h3>{{ displayTitle(record) }}</h3>
              <time>{{ displayTime(record) }}</time>
            </div>
            <p class="card-content">{{ displayContent(record) }}</p>
            <div class="card-meta">
              <span v-for="field in config.metaFields" :key="field.key">
                <i :class="field.icon || 'el-icon-user'"></i>
                {{ field.label }}：{{ formatValue(record[field.key], field) }}
              </span>
            </div>
            <div class="card-footer" @click.stop>
              <span class="flow-hint">{{ flowHint(record) }}</span>
              <div class="card-actions">
                <el-button type="text" @click="openDetail(record)">
                  查看详情
                </el-button>
                <el-button v-if="canAdvance(record)" type="text" @click="advanceStatus(record)">{{ advanceLabel(record) }}</el-button>
                <el-button type="text" @click="openEdit(record)">编辑</el-button>
                <el-button type="text" class="danger-action" @click="remove(record)">删除</el-button>
              </div>
            </div>
          </article>
        </div>
        <el-empty v-else description="暂无符合筛选条件的数据" :image-size="96" />
      </div>

      <footer class="pagination-bar">
        <span>共 {{ total }} 条</span>
        <el-pagination :current-page.sync="pageNo" :page-size="pageSize" layout="prev, pager, next" :total="total" @current-change="loadRecords" />
      </footer>
    </section>

    <el-dialog
      :title="editingId ? `编辑${config.title}` : config.createLabel || `新建${config.title}`"
      :visible.sync="formVisible"
      width="760px"
      custom-class="policy-form-dialog"
      :close-on-click-modal="false"
      append-to-body>
      <el-form ref="policyForm" :model="form" :rules="rules" label-position="top" class="policy-form">
        <div class="form-grid">
          <el-form-item v-for="field in config.fields" :key="field.key" :label="field.label" :prop="field.key" :class="{ 'is-wide': field.wide }">
            <el-select v-if="field.source === 'enterprise'" v-model="form[field.key]" filterable clearable placeholder="请选择企业" :loading="enterpriseLoading">
              <el-option v-for="option in enterpriseOptions" :key="option.id" :label="option.label" :value="option.id" />
            </el-select>
            <el-select v-else-if="field.source === 'policy'" v-model="form[field.key]" filterable clearable placeholder="请选择政策" :loading="policyLoading">
              <el-option v-for="option in policyOptions" :key="option.id" :label="option.label" :value="option.id" />
            </el-select>
            <el-select v-else-if="field.source === 'policySubscribe'" v-model="form[field.key]" filterable clearable placeholder="请选择订阅政策" :loading="policySubscribeLoading">
              <el-option v-for="option in policySubscribeOptions" :key="option.id" :label="option.label" :value="option.id" />
            </el-select>
            <el-select v-else-if="field.type === 'select'" v-model="form[field.key]" clearable :multiple="field.multiple" :collapse-tags="field.multiple" :placeholder="`请选择${field.label}`">
              <el-option v-for="option in field.options" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
            <el-date-picker
              v-else-if="field.type === 'datetime'"
              v-model="form[field.key]"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              format="yyyy-MM-dd HH:mm"
              :placeholder="`请选择${field.label}`" />
            <el-input-number
              v-else-if="field.type === 'number'"
              v-model="form[field.key]"
              :min="field.min || 0"
              :max="field.max || 100"
              :precision="field.precision || 0"
              :controls="false"
              :placeholder="`请输入${field.label}`" />
            <el-input
              v-else-if="field.type === 'textarea'"
              v-model.trim="form[field.key]"
              type="textarea"
              :rows="field.rows || 5"
              maxlength="1000"
              show-word-limit
              :placeholder="`请输入${field.label}`" />
            <el-input v-else v-model.trim="form[field.key]" :placeholder="`请输入${field.label}`" />
          </el-form-item>
        </div>
      </el-form>
      <span slot="footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">提交</el-button>
      </span>
    </el-dialog>

    <el-drawer :visible.sync="detailVisible" :title="`${config.title}详情`" size="500px" append-to-body custom-class="policy-detail-drawer">
      <div v-if="detailRecord" class="drawer-content">
        <div class="drawer-hero">
          <span class="hero-icon"><i :class="config.icon || 'el-icon-document'" /></span>
          <div>
            <strong>{{ displayTitle(detailRecord) }}</strong>
            <small>{{ displayId(detailRecord) }}</small>
          </div>
          <el-tag :type="statusType(statusValue(detailRecord))">{{ statusValue(detailRecord) }}</el-tag>
        </div>
        <dl class="detail-grid">
          <template v-for="field in config.fields">
            <dt :key="`${field.key}-label`">{{ field.label }}</dt>
            <dd :key="field.key" :class="{ content: field.type === 'textarea' }">{{ formatValue(detailRecord[field.key], field) || '-' }}</dd>
          </template>
        </dl>
        <div v-if="config.statusKey" class="status-track">
          <h4>办理进度</h4>
          <el-steps :active="statusIndex(detailRecord) + 1" finish-status="success" align-center>
            <el-step v-for="status in config.statusOptions" :key="status" :title="status" />
          </el-steps>
        </div>
      </div>
      <div class="drawer-footer">
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button v-if="canTransfer(detailRecord)" type="primary" @click="openTransfer">转项目申报</el-button>
        <el-button v-if="detailRecord && canAdvance(detailRecord)" type="primary" @click="advanceStatus(detailRecord)">{{ advanceLabel(detailRecord) }}</el-button>
      </div>
    </el-drawer>

    <el-dialog title="生成项目申报" :visible.sync="transferVisible" width="560px" append-to-body :close-on-click-modal="false">
      <el-form ref="transferForm" :model="transferForm" :rules="transferRules" label-position="top">
        <el-form-item label="项目名称" prop="projectName"><el-input v-model.trim="transferForm.projectName" /></el-form-item>
        <el-form-item label="联系人" prop="contactName"><el-input v-model.trim="transferForm.contactName" /></el-form-item>
        <el-form-item label="联系电话" prop="contactPhone"><el-input v-model.trim="transferForm.contactPhone" /></el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="transferVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitTransfer">生成申报</el-button>
      </span>
    </el-dialog>
  </main>
</template>

<script>
const statusTone = {
  草稿: 'info',
  待受理: 'warning',
  已受理: 'primary',
  审核中: 'warning',
  已立项: 'success',
  未通过: 'danger',
  已发布: 'success',
  已下架: 'info',
  待发送: 'warning',
  发送中: 'primary',
  已完成: 'success',
  生效中: 'success',
  已取消: 'info',
  已匹配: 'primary',
  已推荐: 'warning',
  已转申报: 'success'
}

export default {
  name: 'PolicyServiceBoard',
  props: { config: { type: Object, required: true } },
  data() {
    return {
      loading: false,
      submitting: false,
      enterpriseLoading: false,
      policyLoading: false,
      keyword: '',
      typeFilter: '',
      statusFilter: '',
      pageNo: 1,
      pageSize: 6,
      total: 0,
      records: [],
      selectedIds: [],
      formVisible: false,
      editingId: '',
      form: {},
      detailVisible: false,
      detailRecord: null,
      enterpriseOptions: [],
      policyOptions: [],
      policySubscribeLoading: false,
      policySubscribeOptions: [],
      transferVisible: false,
      transferForm: { projectName: '', contactName: '', contactPhone: '' }
    }
  },
  computed: {
    hasFilters() {
      return Boolean(this.keyword || this.typeFilter || this.statusFilter)
    },
    rules() {
      return this.config.fields.reduce((rules, field) => {
        if (field.required !== false)
          rules[field.key] = [{ required: true, message: `请${field.type === 'select' || field.source ? '选择' : '填写'}${field.label}`, trigger: field.type === 'textarea' ? 'blur' : 'change' }]
        return rules
      }, {})
    },
    transferRules() {
      return {
        projectName: [{ required: true, message: '请填写项目名称', trigger: 'blur' }],
        contactName: [{ required: true, message: '请填写联系人', trigger: 'blur' }],
        contactPhone: [{ required: true, message: '请填写联系电话', trigger: 'blur' }]
      }
    },
    metrics() {
      const statuses = this.config.statusKey ? this.records.map((record) => this.statusValue(record)) : []
      const initialStatus = this.config.statusOptions && this.config.statusOptions[0]
      return [
        { label: '当前记录', value: this.total, hint: '按当前查询条件统计', tone: 'blue', icon: 'el-icon-document' },
        { label: initialStatus || '待处理', value: statuses.filter((s) => s === initialStatus).length, hint: '需持续跟进', tone: 'orange', icon: 'el-icon-time' },
        { label: '办理中', value: statuses.filter((s) => /受理|审核|发送|推荐/.test(s)).length, hint: '流程持续推进', tone: 'cyan', icon: 'el-icon-s-operation' },
        { label: '已完成', value: statuses.filter((s) => /立项|发布|完成|生效|转申报/.test(s)).length, hint: '已形成业务留痕', tone: 'green', icon: 'el-icon-circle-check' }
      ]
    }
  },
  created() {
    this.loadRecords()
    this.loadEnterprises()
    this.loadPolicies()
    this.loadPolicySubscribes()
  },
  methods: {
    currentUserId() {
      try {
        return JSON.parse(window.sessionStorage.getItem('userInfo') || '{}').id || ''
      } catch (error) {
        return ''
      }
    },
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
        if (this.config.typeKey && this.typeFilter) params[this.config.typeKey] = this.typeFilter
        if (this.config.statusKey && this.statusFilter) params[this.config.statusKey] = this.statusFilter
        const raw = this.unwrap(await request(params))
        const records = this.recordsFrom(raw)
        this.records = records
        this.total = this.totalFrom(raw, records)
        this.selectedIds = this.selectedIds.filter((id) => records.some((item) => item.id === id))
      } catch (error) {
        this.$message.error('加载列表失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },
    search() {
      this.pageNo = 1
      this.loadRecords()
    },
    resetFilters() {
      this.keyword = ''
      this.typeFilter = ''
      this.statusFilter = ''
      this.search()
    },
    async loadEnterprises() {
      const request = this.$api && this.$api['enterprise.getEnterprise']
      if (!request) return
      this.enterpriseLoading = true
      try {
        const list = this.recordsFrom(this.unwrap(await request()))
        this.enterpriseOptions = list.map((item) => ({ id: item.id, label: item.enterpriseName || item.enterpriseFullname || item.enterpriseNo || item.id }))
      } catch (error) {
      } finally {
        this.enterpriseLoading = false
      }
    },
    async loadPolicies() {
      const request = this.$api && this.$api['togEnterprisePolicy.list']
      if (!request) return
      this.policyLoading = true
      try {
        const list = this.recordsFrom(this.unwrap(await request({ pageNo: 1, pageSize: 200, status: '已发布' })))
        this.policyOptions = list.map((item) => ({ id: item.id, label: item.title || item.policyName || item.id }))
      } catch (error) {
      } finally {
        this.policyLoading = false
      }
    },
    async loadPolicySubscribes() {
      const request = this.$api && this.$api['togPolicySubscribe.list']
      if (!request) return
      this.policySubscribeLoading = true
      try {
        const list = this.recordsFrom(this.unwrap(await request({ pageNo: 1, pageSize: 200 })))
        this.policySubscribeOptions = list.map((item) => ({ id: item.id, label: item.policyTypes || item.userId || item.id }))
      } catch (error) {
      } finally {
        this.policySubscribeLoading = false
      }
    },
    displayId(record) {
      return record.id || record.dataId || record.orderNo || '未编号'
    },
    displayTitle(record) {
      return record[this.config.titleKey] || record.title || record.name || record.projectName || '未命名记录'
    },
    displayContent(record) {
      return record[this.config.contentKey] || record.content || record.description || record.remark || '暂未填写说明内容'
    },
    displayTime(record) {
      const key = this.config.timeKey
      return key && record[key] ? record[key] : record.itemCreateTime || '-'
    },
    statusValue(record) {
      return this.config.statusKey ? (record && record[this.config.statusKey]) || this.config.defaultStatus || '待处理' : this.config.defaultStatus || '已登记'
    },
    statusType(status) {
      return statusTone[status] || 'info'
    },
    statusIndex(record) {
      return Math.max(0, (this.config.statusOptions || []).indexOf(this.statusValue(record)))
    },
    formatValue(value, field) {
      if (Array.isArray(value)) return value.join('、')
      if (field && field.type === 'number' && value !== undefined && value !== null) return `${value}${field.suffix || ''}`
      if (field && field.source === 'enterprise') {
        const found = this.enterpriseOptions.find((option) => option.id === value)
        return found ? found.label : value
      }
      if (field && field.source === 'policy') {
        const found = this.policyOptions.find((option) => option.id === value)
        return found ? found.label : value
      }
      if (field && field.source === 'policySubscribe') {
        const found = this.policySubscribeOptions.find((option) => option.id === value)
        return found ? found.label : value
      }
      const option = field && field.options && field.options.find((item) => item.value === value)
      return option ? option.label : value
    },
    flowHint(record) {
      return this.config.statusKey ? `当前：${this.statusValue(record)}` : '已纳入政策服务台账'
    },
    toggleSelected(id, checked) {
      this.selectedIds = checked ? [...new Set([...this.selectedIds, id])] : this.selectedIds.filter((item) => item !== id)
    },
    blankForm() {
      return this.config.fields.reduce((form, field) => {
        form[field.key] = field.multiple ? [] : ''
        return form
      }, {})
    },
    openCreate() {
      this.editingId = ''
      this.form = this.blankForm()
      if (this.config.statusKey) this.form[this.config.statusKey] = this.config.defaultStatus
      this.formVisible = true
      this.$nextTick(() => this.$refs.policyForm && this.$refs.policyForm.clearValidate())
    },
    openEdit(record) {
      this.editingId = record.id
      this.form = Object.assign(this.blankForm(), record)
      if (this.config.namespace === 'togPolicySubscribe' && typeof this.form.policyTypes === 'string') this.form.policyTypes = this.form.policyTypes ? this.form.policyTypes.split(',') : []
      this.formVisible = true
      this.$nextTick(() => this.$refs.policyForm && this.$refs.policyForm.clearValidate())
    },
    openDetail(record) {
      this.detailRecord = record
      this.detailVisible = true
      const request = this.api('queryById')
      if (request && record.id)
        request({ id: record.id })
          .then((response) => {
            const value = this.unwrap(response)
            if (value && !Array.isArray(value)) this.detailRecord = value
          })
          .catch(() => {})
    },
    async submitForm() {
      const valid = await new Promise((resolve) => this.$refs.policyForm.validate(resolve))
      if (!valid) return
      const request = this.api(this.editingId ? 'edit' : 'add')
      if (!request) return
      this.submitting = true
      try {
        const payload = Object.assign({}, this.form, this.editingId ? { updateBy: this.currentUserId(), itemUpdateTime: this.now() } : { createBy: this.currentUserId(), itemCreateTime: this.now() })
        if (this.config.namespace === 'togPolicySubscribe' && Array.isArray(payload.policyTypes)) payload.policyTypes = payload.policyTypes.join(',')
        await request(payload)
        this.$message.success(this.editingId ? '修改成功' : '提交成功')
        this.formVisible = false
        this.loadRecords()
        this.loadPolicies()
      } catch (error) {
        this.$message.error('操作失败，请稍后重试')
      } finally {
        this.submitting = false
      }
    },
    canAdvance(record) {
      if (!record || !this.config.statusKey) return false
      const index = this.statusIndex(record)
      const finalIndex = this.config.projectTransfer ? this.config.statusOptions.length - 2 : this.config.statusOptions.length - 1
      return index < finalIndex
    },
    advanceLabel(record) {
      const index = this.statusIndex(record)
      return (this.config.advanceLabels && this.config.advanceLabels[index]) || `推进至${this.config.statusOptions[index + 1]}`
    },
    async advanceStatus(record) {
      const next = this.config.statusOptions[this.statusIndex(record) + 1]
      if (!next) return
      try {
        await this.api('edit')(Object.assign({}, record, { [this.config.statusKey]: next, updateBy: this.currentUserId(), itemUpdateTime: this.now() }))
        this.$message.success(`已更新为${next}`)
        if (this.detailRecord && this.detailRecord.id === record.id) this.detailRecord = Object.assign({}, record, { [this.config.statusKey]: next })
        this.loadRecords()
      } catch (error) {
        this.$message.error('状态更新失败，请稍后重试')
      }
    },
    async remove(record) {
      try {
        await this.$confirm(`确定删除“${this.displayTitle(record)}”吗？`, '删除确认', { type: 'warning' })
        await this.api('delete')({ id: record.id })
        this.$message.success('已删除')
        this.loadRecords()
      } catch (error) {
        if (error !== 'cancel' && error !== 'close') this.$message.error('删除失败，请稍后重试')
      }
    },
    async bulkRemove() {
      try {
        await this.$confirm(`确定删除选中的 ${this.selectedIds.length} 条记录吗？`, '批量删除确认', { type: 'warning' })
        await Promise.all(this.selectedIds.map((id) => this.api('delete')({ id })))
        this.$message.success('已删除')
        this.selectedIds = []
        this.loadRecords()
      } catch (error) {
        if (error !== 'cancel' && error !== 'close') this.$message.error('删除失败，请稍后重试')
      }
    },
    canTransfer(record) {
      return Boolean(this.config.projectTransfer && record && this.statusValue(record) === '已推荐')
    },
    openTransfer() {
      const title = this.policyOptions.find((option) => option.id === this.detailRecord.policyId)
      this.transferForm = { projectName: `政策申报：${title ? title.label : this.detailRecord.policyId || ''}`, contactName: '', contactPhone: '' }
      this.transferVisible = true
    },
    async submitTransfer() {
      const valid = await new Promise((resolve) => this.$refs.transferForm.validate(resolve))
      if (!valid) return
      this.submitting = true
      try {
        await this.$api['togProjectApplication.add']({
          companyId: this.detailRecord.companyId,
          projectName: this.transferForm.projectName,
          applyTime: this.now(),
          contactName: this.transferForm.contactName,
          contactPhone: this.transferForm.contactPhone,
          approveStatus: '待受理',
          createBy: this.currentUserId(),
          itemCreateTime: this.now()
        })
        await this.api('edit')(Object.assign({}, this.detailRecord, { status: '已转申报', updateBy: this.currentUserId(), itemUpdateTime: this.now() }))
        this.detailRecord = Object.assign({}, this.detailRecord, { status: '已转申报' })
        this.transferVisible = false
        this.$message.success('项目申报已生成')
        this.loadRecords()
      } catch (error) {
        this.$message.error('生成项目申报失败，请稍后重试')
      } finally {
        this.submitting = false
      }
    },
    now() {
      const d = new Date()
      const p = (n) => `${n}`.padStart(2, '0')
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
    }
  }
}
</script>

<style scoped>
.policy-service-board {
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
  align-items: center;
  min-height: 96px;
  padding: 16px 18px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  gap: 14px;
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
  color: #0f172a;
  font-size: 25px;
  line-height: 1.1;
}
.metric-card.blue > i {
  color: #2563eb;
  background: #eff6ff;
}
.metric-card.orange > i {
  color: #d97706;
  background: #fff7ed;
}
.metric-card.cyan > i {
  color: #0891b2;
  background: #ecfeff;
}
.metric-card.green > i {
  color: #059669;
  background: #ecfdf5;
}
.surface {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
}
.policy-list-surface {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 224px);
  overflow: hidden;
}
.toolbar {
  display: flex;
  align-items: center;
  min-height: 62px;
  padding: 12px 14px;
  gap: 10px;
}
.toolbar .el-input {
  width: 300px;
}
.toolbar .el-select {
  width: 165px;
}
.toolbar-spacer {
  flex: 1;
}
.cards-stage {
  flex: 1;
  padding: 16px;
  min-height: 390px;
}
.policy-card-grid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  align-content: start;
}
.policy-card {
  display: flex;
  min-height: 236px;
  flex-direction: column;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}
.policy-card:hover {
  border-color: #0369a1;
}
.card-topline,
.card-title-row,
.card-footer,
.card-state,
.card-meta {
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
.card-title-row {
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
}
.card-title-row h3 {
  overflow: hidden;
  margin: 0;
  color: #1e3a5f;
  font-size: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-title-row time {
  flex: none;
  color: #94a3b8;
  font-size: 12px;
}
.card-content {
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
  gap: 7px 14px;
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
  min-height: 30px;
  margin-top: auto;
  padding-top: 9px;
}
.flow-hint {
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
.policy-form ::v-deep .el-form-item__label {
  padding-bottom: 7px;
  color: #334155;
  font-size: 14px;
}
.policy-form ::v-deep .el-input,
.policy-form ::v-deep .el-select,
.policy-form ::v-deep .el-date-editor,
.policy-form ::v-deep .el-input-number {
  width: 100%;
}
.drawer-content {
  padding: 0 20px 84px;
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
  min-width: 0;
}
.drawer-hero strong,
.drawer-hero small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.drawer-hero strong {
  color: #1e3a5f;
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
.detail-grid .content {
  grid-column: span 1;
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
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid #e2e8f0;
  background: #fff;
}
@media (max-width: 1180px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .policy-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 768px) {
  .policy-service-board {
    min-height: 100dvh;
    height: auto;
    padding: 10px 10px calc(84px + env(safe-area-inset-bottom));
    overflow: visible;
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
  .policy-list-surface {
    min-height: calc(100dvh - 24px);
  }
  .toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 8px;
    padding: 10px;
  }
  .toolbar .el-input {
    width: 100%;
    grid-column: 1 / -1;
  }
  .toolbar .el-select {
    width: 100%;
  }
  .toolbar-spacer {
    display: none;
  }
  .toolbar .el-button:last-child {
    width: 100%;
    min-height: 42px;
    margin-left: 0;
    grid-column: 1 / -1;
  }
  .cards-stage {
    min-height: 360px;
    padding: 10px;
  }
  .policy-card-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .policy-card {
    min-height: 214px;
  }
  .pagination-bar {
    min-height: 52px;
    padding: 0 10px;
  }
  .form-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .form-grid .is-wide {
    grid-column: auto;
  }
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .detail-grid .content {
    grid-column: auto;
  }
  .card-title-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }
  .card-title-row time {
    font-size: 11px;
  }
  .flow-hint {
    display: none;
  }
  ::v-deep .policy-detail-drawer {
    width: 100% !important;
    max-width: 100% !important;
  }
  ::v-deep .policy-detail-drawer .el-drawer__body {
    display: flex;
    min-height: 0;
    flex: 1 1 auto;
    overflow: hidden;
  }
  .drawer-layout {
    min-height: 0;
    height: 100%;
    width: 100%;
  }
  .drawer-scroll {
    min-height: 0;
    padding: 14px;
    -webkit-overflow-scrolling: touch;
  }
  .drawer-footer {
    padding: 12px 14px calc(12px + env(safe-area-inset-bottom));
  }
  ::v-deep .policy-form-dialog {
    width: 100% !important;
    min-width: 0;
    height: 100dvh;
    margin: 0 !important;
    display: flex;
    flex-direction: column;
    border-radius: 0;
  }
  ::v-deep .policy-form-dialog .el-dialog__body {
    min-height: 0;
    flex: 1 1 auto;
    overflow-y: auto;
    padding: 18px 16px;
    -webkit-overflow-scrolling: touch;
  }
  ::v-deep .policy-form-dialog .el-dialog__footer {
    flex: 0 0 auto;
    padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  }
  ::v-deep .policy-form-dialog .dialog-footer {
    display: flex;
    gap: 10px;
  }
  ::v-deep .policy-form-dialog .dialog-footer .el-button {
    flex: 1;
    margin: 0;
    min-height: 42px;
  }
}
@media (max-width: 420px) {
  .toolbar {
    grid-template-columns: minmax(0, 1fr);
  }
  .toolbar .el-select {
    grid-column: 1 / -1;
  }
}
@media (max-width: 768px) {
  .policy-service-board {
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
/* 与办事大厅卡片看板保持相同的密度与空间层级 */
.policy-service-board {
  display: block;
  height: auto;
  min-height: 100%;
  padding: 12px;
  box-sizing: border-box;
  overflow: visible;
  background: #f6f8fb;
}
.policy-service-board .metric-grid {
  gap: 12px;
  margin-bottom: 12px;
}
.policy-service-board .metric-card {
  min-height: 94px;
  padding: 16px 18px;
  border-color: #e5ebf2;
  border-radius: 10px;
}
.policy-list-surface {
  display: flex;
  min-height: clamp(660px, calc(100vh - 250px), 760px);
  border-color: #e5ebf2;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.035);
}
.policy-service-board .toolbar {
  min-height: 64px;
  padding: 14px 20px;
  gap: 10px;
}
.policy-service-board .toolbar .el-input {
  width: 300px;
}
.policy-service-board .toolbar .el-select {
  width: 160px;
}
.policy-service-board .cards-stage {
  display: flex;
  min-height: 0;
  padding: 2px 20px 18px;
}
.policy-card-grid {
  gap: 14px;
}
.policy-card {
  min-height: 252px;
  padding: 16px;
  border-color: #e6ecf3;
  border-radius: 10px;
}
.policy-card:hover {
  border-color: #a9caf7;
}
.policy-service-board .cards-stage > .el-empty {
  display: flex;
  min-height: 260px;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 24px 20px 48px;
  box-sizing: border-box;
}
.policy-service-board .pagination-bar {
  min-height: 0;
  margin-top: auto;
  padding: 12px 20px 16px;
}
@media (max-width: 760px) {
  .policy-service-board {
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
  .policy-service-board .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .policy-service-board .metric-card {
    min-height: 82px;
    padding: 12px;
  }
  .policy-list-surface {
    min-height: 440px;
  }
  .policy-service-board .toolbar {
    display: flex;
    flex-wrap: wrap;
    padding: 12px;
  }
  .policy-service-board .toolbar .el-input {
    width: 100%;
  }
  .policy-service-board .toolbar .el-select {
    width: calc(50% - 5px);
  }
  .policy-service-board .toolbar-spacer {
    display: none;
  }
  .policy-service-board .toolbar > .el-button {
    flex: 1 1 calc(50% - 5px);
    min-height: 38px;
    margin: 0;
  }
  .policy-service-board .cards-stage {
    padding: 2px 12px 14px;
  }
  .policy-card-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }
  .policy-card {
    min-height: 238px;
  }
  .policy-service-board .pagination-bar {
    justify-content: center;
    padding: 12px;
  }
}
</style>
