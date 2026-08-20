<template>
  <main class="communication-board">
    <section class="board-statistics" :class="{ 'board-statistics--compact': config.hasStatus === false }" aria-label="信息统计">
      <article class="stat-card stat-card--primary">
        <span class="stat-icon"><i class="el-icon-document"></i></span>
        <div>
          <small>记录总数</small>
          <b>{{ paginationTotal }}</b>
          <em>当前查询结果</em>
        </div>
      </article>
      <article v-if="config.hasStatus !== false" class="stat-card stat-card--warning">
        <span class="stat-icon"><i class="el-icon-time"></i></span>
        <div>
          <small>待处理</small>
          <b>{{ pendingCount }}</b>
          <em>当前页记录</em>
        </div>
      </article>
      <article v-if="config.hasStatus !== false" class="stat-card stat-card--success">
        <span class="stat-icon"><i class="el-icon-circle-check"></i></span>
        <div>
          <small>已处理</small>
          <b>{{ handledCount }}</b>
          <em>当前页记录</em>
        </div>
      </article>
      <article class="stat-card stat-card--info">
        <span class="stat-icon"><i :class="config.icon"></i></span>
        <div>
          <small>{{ config.title }}</small>
          <b>{{ pagedRecords.length }}</b>
          <em>当前页展示</em>
        </div>
      </article>
    </section>
    <section v-loading="loading" class="communication-surface">
      <div class="list-toolbar">
        <el-input v-model.trim="keyword" clearable size="small" prefix-icon="el-icon-search" placeholder="搜索编号、标题、名称或内容" @input="resetPage" @clear="resetPage" />
        <el-select v-if="typeOptions.length" v-model="typeFilter" clearable size="small" :placeholder="'全部' + config.primaryLabel" @change="resetPage" @clear="resetPage">
          <el-option v-for="item in typeOptions" :key="item" :label="item" :value="item" />
        </el-select>
        <el-select v-if="config.hasStatus !== false" v-model="statusFilter" clearable size="small" placeholder="全部状态" @change="resetPage" @clear="resetPage">
          <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
        </el-select>
        <el-checkbox v-if="config.showMineFilter" v-model="onlyMine" class="mine-filter" @change="resetPage">只看我发布的</el-checkbox>
        <div class="toolbar-actions">
          <el-button type="primary" size="small" icon="el-icon-plus" @click="openCreate">新建{{ config.title }}</el-button>
        </div>
      </div>

      <div v-if="pagedRecords.length" class="communication-grid">
        <article v-for="item in pagedRecords" :key="item.id" class="communication-card" tabindex="0" role="button" @click="openDetail(item)" @keydown.enter="openDetail(item)">
          <div class="card-head">
            <span class="record-id">
              <i class="el-icon-document"></i>
              {{ item.id }}
            </span>
            <el-tag v-if="config.hasStatus !== false" :type="statusType(statusText(item.status, item))" size="small" effect="light">{{ statusText(item.status, item) }}</el-tag>
          </div>
          <div class="card-title">
            <i :class="config.icon"></i>
            <b>{{ item[config.primaryKey] || '-' }}</b>
            <time v-if="item[config.timeKey]">{{ item[config.timeKey] }}</time>
          </div>
          <p class="card-content">{{ item[config.contentKey] || '暂无描述' }}</p>
          <dl class="card-meta">
            <template v-for="field in cardFields">
              <dt :key="field.key + '-label'">{{ field.label }}</dt>
              <dd :key="field.key + '-value'">{{ formatValue(item[field.key]) }}</dd>
            </template>
          </dl>
          <div class="card-foot">
            <span v-if="config.counterFields" class="record-counts">
              <template v-for="field in config.counterFields">
                <i :key="field.key" :class="field.icon"></i>
                <b :key="field.key + '-value'">{{ item[field.key] || 0 }}</b>
              </template>
            </span>
            <div class="card-actions">
              <el-button type="text" size="mini" @click.stop="openDetail(item)">查看详情</el-button>
              <el-button v-if="canAdvanceStatus(item)" type="text" size="mini" @click.stop="advanceStatus(item)">推进至{{ nextStatus(item) }}</el-button>
              <el-button v-if="canManageRecord(item)" type="text" size="mini" @click.stop="openEdit(item)">编辑</el-button>
              <el-button v-if="canManageRecord(item)" type="text" size="mini" class="danger-action" @click.stop="removeRecord(item)">删除</el-button>
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
      custom-class="communication-form-dialog"
      @closed="resetForm">
      <el-form ref="communicationForm" :model="form" :rules="rules" label-width="92px" @submit.native.prevent>
        <el-row :gutter="28">
          <el-col v-for="field in normalFields" :key="field.key" :xs="24" :sm="12">
            <el-form-item :label="field.label" :prop="field.key">
              <el-select v-if="field.options" v-model="form[field.key]" clearable filterable :placeholder="'请选择' + field.label" class="field-full" @change="handleFormFieldChange(field.key)">
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
              <el-input-number
                v-else-if="field.type === 'number' || field.type === 'amount'"
                v-model="form[field.key]"
                :min="0"
                :precision="field.type === 'amount' ? 2 : 0"
                controls-position="right"
                class="field-full" />
              <el-input v-else v-model.trim="form[field.key]" :placeholder="'请输入' + field.label" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col v-for="field in textFields" :key="field.key" :span="24">
            <el-form-item :label="field.label" :prop="field.key">
              <el-input v-model.trim="form[field.key]" type="textarea" :rows="field.key === config.contentKey ? 6 : 4" :maxlength="500" show-word-limit :placeholder="'请输入' + field.label" />
            </el-form-item>
          </el-col>
          <el-col v-if="config.hasStatus !== false" :xs="24" :sm="12">
            <el-form-item label="状态">
              <div class="readonly-status">
                <i class="el-icon-time"></i>
                {{ statusText(form.status, form) }}
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">{{ editingId ? '保存' : '提交' }}</el-button>
      </span>
    </el-dialog>

    <el-drawer :title="config.title + '详情'" :visible.sync="detailVisible" size="500px" append-to-body :lock-scroll="true" custom-class="communication-detail-drawer">
      <div v-if="selectedRecord" class="drawer-layout">
        <div class="drawer-scroll">
          <div class="detail-hero">
            <span class="hero-icon"><i :class="config.icon"></i></span>
            <div>
              <small>{{ selectedRecord.id }}</small>
              <h3>{{ selectedRecord[config.primaryKey] || '-' }}</h3>
            </div>
            <el-tag v-if="config.hasStatus !== false" :type="statusType(statusText(selectedRecord.status, selectedRecord))">{{ statusText(selectedRecord.status, selectedRecord) }}</el-tag>
          </div>
          <div class="detail-grid">
            <span v-for="field in detailFields" :key="field.key">
              <small>{{ field.label }}</small>
              <b>{{ formatValue(selectedRecord[field.key]) }}</b>
            </span>
          </div>
          <section v-if="selectedRecord[config.contentKey]" class="detail-section">
            <h4>{{ config.contentLabel || '内容' }}</h4>
            <p>{{ selectedRecord[config.contentKey] }}</p>
          </section>
        </div>
        <div class="drawer-actions"><el-button @click="detailVisible = false">关闭</el-button></div>
      </div>
    </el-drawer>
  </main>
</template>

<script>
export default {
  name: 'LostFoundBoard',
  props: { config: { type: Object, required: true } },
  data() {
    return {
      keyword: '',
      typeFilter: '',
      statusFilter: '',
      onlyMine: false,
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
      return this.fields.filter((field) => field.type !== 'textarea')
    },
    textFields() {
      return this.fields.filter((field) => field.type === 'textarea')
    },
    typeOptions() {
      const field = this.fields.find((field) => field.key === this.config.filterKey)
      return field && field.options ? field.options : []
    },
    statusOptions() {
      if (this.config.typeStatusOptions) return this.statusOptionsForType(this.typeFilter)
      return this.config.statusOptions || ['正常', '待审核', '已发布', '已关闭', '已下线']
    },
    cardFields() {
      return this.fields.filter((field) => ![this.config.primaryKey, this.config.contentKey, this.config.timeKey, 'status', 'userId'].includes(field.key)).slice(0, 3)
    },
    detailFields() {
      return this.fields.filter((field) => field.key !== this.config.contentKey)
    },
    rules() {
      const rules = {}
      this.fields
        .filter((field) => field.required)
        .forEach((field) => {
          rules[field.key] = [{ required: true, message: `请填写${field.label}`, trigger: field.options ? 'change' : 'blur' }]
        })
      return rules
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
        const matchesType = !this.typeFilter || item[this.config.filterKey] === this.typeFilter
        const matchesStatus = !this.statusFilter || this.statusText(item.status, item) === this.statusFilter
        const matchesMine = !this.onlyMine || this.canManageRecord(item)
        return matchesKeyword && matchesType && matchesStatus && matchesMine
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
      return this.pagedRecords.filter((item) => this.isPendingStatus(item.status, item)).length
    },
    handledCount() {
      return this.pagedRecords.filter((item) => !this.isPendingStatus(item.status, item)).length
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
    creatorId(item) {
      if (!item) return ''
      return item[this.config.creatorKey || 'createBy'] || item.createBy || item.userId || ''
    },
    canManageRecord(item) {
      const currentUserId = this.currentUserId()
      const creatorId = this.creatorId(item)
      return Boolean(currentUserId && creatorId && String(currentUserId) === String(creatorId))
    },
    now() {
      const date = new Date()
      const pad = (value) => String(value).padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
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
    statusOptionsForType(type) {
      const statusByType = this.config.typeStatusOptions
      if (!statusByType) return this.config.statusOptions || []
      if (type && statusByType[type]) return statusByType[type]
      return [...new Set(Object.keys(statusByType).reduce((options, key) => options.concat(statusByType[key]), []))]
    },
    defaultStatusFor(record) {
      const options = this.statusOptionsForType(record && record[this.config.filterKey])
      return options[0] || this.config.defaultStatus || '正常'
    },
    statusText(value, record) {
      if (value === undefined || value === null || value === '' || value === '0') return this.defaultStatusFor(record)
      const map = { 1: '待审核', 2: '已发布', 3: '已关闭', 4: '已下线' }
      return map[value] || value
    },
    isPendingStatus(value, record) {
      return ['待审核', '待认领', '寻找中', '待拼车'].includes(this.statusText(value, record))
    },
    nextStatus(item) {
      const options = this.statusOptionsForType(item && item[this.config.filterKey])
      const index = options.indexOf(this.statusText(item && item.status, item))
      return index >= 0 ? options[index + 1] || '' : ''
    },
    canAdvanceStatus(item) {
      return Boolean(this.config.canAdvanceStatus && this.canManageRecord(item) && this.nextStatus(item))
    },
    statusType(status) {
      if (['正常', '已发布', '已认领', '已找到'].includes(status)) return 'success'
      if (['待审核', '待认领', '寻找中', '待拼车'].includes(status)) return 'warning'
      if (['已关闭', '已下线'].includes(status)) return 'info'
      return 'danger'
    },
    formatValue(value) {
      return value === undefined || value === null || value === '' ? '-' : value
    },
    resetPage() {
      this.currentPage = 1
      if (this.statusFilter && !this.statusOptions.includes(this.statusFilter)) this.statusFilter = ''
      if (!this.usingMock) this.loadRecords()
    },
    async loadRecords() {
      this.loading = true
      try {
        const result = this.unwrap(
          await this.$api[this.apiKey('list')]({
            pageNo: this.currentPage,
            pageSize: this.pageSize,
            keyword: this.keyword || undefined,
            status: this.statusFilter || undefined,
            createBy: this.onlyMine ? this.currentUserId() : undefined
          })
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
    emptyForm() {
      const form = {}
      this.fields.forEach((field) => {
        form[field.key] = ''
      })
      if (this.config.hasStatus !== false) form.status = this.defaultStatusFor(form)
      return form
    },
    resetForm() {
      this.editingId = ''
      this.form = this.emptyForm()
      this.$nextTick(() => this.$refs.communicationForm && this.$refs.communicationForm.clearValidate())
    },
    openCreate() {
      this.editingId = ''
      this.form = this.emptyForm()
      this.formVisible = true
    },
    openEdit(item) {
      if (!this.canManageRecord(item)) {
        this.$message.warning('仅创建人可以编辑该记录')
        return
      }
      this.editingId = item.id
      this.form = Object.assign(this.emptyForm(), item, { status: this.statusText(item.status, item) })
      this.formVisible = true
    },
    handleFormFieldChange(key) {
      if (key !== this.config.filterKey || this.config.hasStatus === false) return
      this.form.status = this.defaultStatusFor(this.form)
    },
    async submitForm() {
      const valid = await new Promise((resolve) => this.$refs.communicationForm.validate(resolve))
      if (!valid) return
      this.submitting = true
      const payload = Object.assign(
        {},
        this.form,
        this.editingId ? { id: this.editingId, updateBy: this.currentUserId(), itemUpdateTime: this.now() } : { createBy: this.currentUserId(), itemCreateTime: this.now() }
      )
      try {
        await this.$api[this.apiKey(this.editingId ? 'edit' : 'add')](payload)
        this.$message.success(this.editingId ? '已更新' : '已提交')
        this.formVisible = false
        this.loadRecords()
      } catch (error) {
        this.$message.error(this.errorMessage(error))
      } finally {
        this.submitting = false
      }
    },
    async removeRecord(item) {
      if (!this.canManageRecord(item)) {
        this.$message.warning('仅创建人可以删除该记录')
        return
      }
      try {
        await this.$confirm('确认删除该条记录？', '删除确认', { type: 'warning' })
        await this.$api[this.apiKey('delete')]({ id: item.id })
        this.$message.success('已删除')
        this.loadRecords()
      } catch (error) {
        if (error !== 'cancel') this.$message.error(this.errorMessage(error, '删除失败，请稍后重试'))
      }
    },
    async advanceStatus(item) {
      if (!this.canAdvanceStatus(item)) {
        this.$message.warning('仅创建人可以推进状态')
        return
      }
      const next = this.nextStatus(item)
      try {
        await this.$confirm(`确认将状态推进至“${next}”？`, '状态推进确认', { type: 'warning' })
        await this.$api[this.apiKey('edit')](Object.assign({}, item, { status: next, updateBy: this.currentUserId(), itemUpdateTime: this.now() }))
        this.$message.success(`状态已更新为“${next}”`)
        this.loadRecords()
      } catch (error) {
        if (error !== 'cancel') this.$message.error(this.errorMessage(error, '状态推进失败，请稍后重试'))
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
.communication-board {
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
.board-statistics--compact {
  grid-template-columns: repeat(2, minmax(0, 1fr));
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
.communication-surface {
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
.communication-grid {
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(260px, 1fr));
  gap: 16px;
  align-content: start;
  padding: 18px 22px 28px;
}
.communication-card {
  min-height: 236px;
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
.communication-card:hover,
.communication-card:focus {
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
.record-id {
  color: #6d91c4;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.record-id i,
.card-title i {
  margin-right: 7px;
  color: #409eff;
}
.card-title {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 16px;
  color: #29486e;
}
.card-title b {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 16px;
}
.card-title time {
  margin-left: auto;
  color: #9aa8bb;
  font-size: 12px;
  white-space: nowrap;
}
.card-content {
  display: -webkit-box;
  min-height: 42px;
  margin: 13px 0;
  overflow: hidden;
  color: #50617a;
  font-size: 14px;
  line-height: 21px;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.card-meta {
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr);
  gap: 7px 12px;
  margin: 0;
  padding: 11px 0;
  border-top: 1px solid #edf1f6;
  border-bottom: 1px solid #edf1f6;
  font-size: 13px;
}
.card-meta dt {
  color: #9aa8bb;
}
.card-meta dd {
  margin: 0;
  overflow: hidden;
  color: #50617a;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-foot {
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 12px;
}
.record-counts {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #8b9ab0;
  font-size: 12px;
}
.record-counts i {
  margin-left: 6px;
}
.record-counts b {
  color: #627996;
  font-weight: 500;
}
.card-actions {
  margin-left: auto;
  gap: 4px;
  white-space: nowrap;
}
.card-actions .el-button {
  margin-left: 0;
}
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
  color: #4d8567;
  background: #f1fbf5;
  box-sizing: border-box;
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
  max-width: 290px;
  margin: 4px 0;
  overflow: hidden;
  color: #172d4d;
  font-size: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
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
.detail-section p {
  margin: 0;
  padding: 14px;
  color: #536780;
  line-height: 22px;
  white-space: pre-wrap;
  background: #f8fafc;
  border-radius: 6px;
}
.drawer-actions {
  flex: 0 0 auto;
  padding: 12px 16px;
  text-align: right;
  border-top: 1px solid #e8edf3;
}
@media (max-width: 1100px) {
  .communication-grid {
    grid-template-columns: repeat(2, minmax(260px, 1fr));
  }
}
@media (max-width: 760px) {
  .communication-board {
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
  .communication-surface {
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
  .communication-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
    padding: 12px;
  }
  .communication-card {
    min-height: 224px;
    padding: 16px;
  }
  .card-foot {
    display: block;
  }
  .card-actions {
    justify-content: flex-end;
    margin-top: 8px;
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
  ::v-deep .communication-detail-drawer {
    width: 100% !important;
    max-width: 100% !important;
  }
  ::v-deep .communication-detail-drawer .el-drawer__body {
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
  .drawer-actions {
    padding: 12px 14px calc(12px + env(safe-area-inset-bottom));
  }
  ::v-deep .communication-form-dialog {
    width: 100% !important;
    min-width: 0;
    height: 100dvh;
    margin: 0 !important;
    display: flex;
    flex-direction: column;
    border-radius: 0;
  }
  ::v-deep .communication-form-dialog .el-dialog__body {
    min-height: 0;
    flex: 1 1 auto;
    overflow-y: auto;
    padding: 18px 16px;
    -webkit-overflow-scrolling: touch;
  }
  ::v-deep .communication-form-dialog .el-dialog__footer {
    flex: 0 0 auto;
    padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  }
  ::v-deep .communication-form-dialog .dialog-footer {
    display: flex;
    gap: 10px;
  }
  ::v-deep .communication-form-dialog .dialog-footer .el-button {
    flex: 1;
    margin: 0;
    min-height: 42px;
  }
}
@media (max-width: 420px) {
  .list-toolbar {
    grid-template-columns: minmax(0, 1fr);
  }
  .list-toolbar .el-select {
    grid-column: 1 / -1;
  }
}
/* 仅本看板在移动端承载页面滚动，避免改动后台配置页的全局路由高度。 */
@media (max-width: 760px) {
  .communication-board {
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
.communication-board {
  min-height: 100%;
  padding: 12px;
  box-sizing: border-box;
  background: #f6f8fb;
}
.communication-board .board-statistics {
  gap: 12px;
  margin-bottom: 12px;
}
.communication-board .stat-card {
  min-height: 94px;
  padding: 16px 18px;
  border-color: #e5ebf2;
  border-radius: 10px;
  box-shadow: none;
}
.communication-surface {
  min-height: clamp(660px, calc(100vh - 250px), 760px);
  border-color: #e5ebf2;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.035);
}
.communication-board .list-toolbar {
  min-height: 64px;
  padding: 14px 20px;
  gap: 10px;
}
.communication-board .list-toolbar .el-input {
  width: 300px;
}
.communication-board .list-toolbar .el-select {
  width: 160px;
}
.communication-grid {
  gap: 14px;
  padding: 2px 20px 18px;
}
.communication-card {
  min-height: 252px;
  padding: 16px;
  border-color: #e6ecf3;
  border-radius: 10px;
}
.communication-card:hover {
  border-color: #a9caf7;
}
.communication-board .empty-state {
  min-height: 260px;
  padding: 24px 20px 48px;
  box-sizing: border-box;
}
.communication-board .pagination-row {
  min-height: 0;
  margin-top: auto;
  padding: 12px 20px 16px;
}
@media (max-width: 760px) {
  .communication-board {
    height: 100% !important;
    min-height: 0;
    padding: 14px 12px calc(24px + env(safe-area-inset-bottom));
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
    touch-action: pan-y;
  }
  .communication-board .board-statistics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .communication-board .stat-card {
    min-height: 82px;
    padding: 12px;
  }
  .communication-surface {
    min-height: 440px;
  }
  .communication-board .list-toolbar {
    padding: 12px;
  }
  .communication-board .list-toolbar .el-input {
    width: 100%;
  }
  .communication-board .list-toolbar .el-select {
    width: calc(50% - 5px);
  }
  .communication-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
    padding: 2px 12px 14px;
  }
  .communication-card {
    min-height: 238px;
  }
  .communication-board .pagination-row {
    justify-content: center;
    padding: 12px;
  }
}
</style>

