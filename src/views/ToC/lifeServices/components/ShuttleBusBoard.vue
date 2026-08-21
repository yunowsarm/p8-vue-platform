<template>
  <main class="shuttle-bus-board">
    <section class="bus-statistics" aria-label="班车运营统计">
      <article class="stat-card primary">
        <i class="el-icon-truck"></i>
        <div>
          <small>班车总数</small>
          <b>{{ records.length }}</b>
          <em>当前已配置线路</em>
        </div>
      </article>
      <article class="stat-card success">
        <i class="el-icon-video-play"></i>
        <div>
          <small>运营中</small>
          <b>{{ operatingCount }}</b>
          <em>当前处于发车时段</em>
        </div>
      </article>
      <article class="stat-card info">
        <i class="el-icon-time"></i>
        <div>
          <small>休息中</small>
          <b>{{ restingCount }}</b>
          <em>当前不在运营时段</em>
        </div>
      </article>
    </section>

    <section v-loading="loading" class="bus-surface">
      <div class="list-toolbar">
        <el-input v-model.trim="keyword" clearable size="small" prefix-icon="el-icon-search" placeholder="搜索线路、起点或终点" @input="resetPage" @clear="resetPage" />
        <div class="toolbar-actions"><el-button v-if="!readOnly" type="primary" size="small" icon="el-icon-plus" @click="openCreate">新增班车</el-button></div>
      </div>
      <div v-if="pagedRecords.length" class="bus-grid">
        <article v-for="item in pagedRecords" :key="item.id" class="bus-card" tabindex="0" role="button" @click="openDetail(item)" @keydown.enter="openDetail(item)">
          <div class="bus-card__head">
            <span class="record-id">
              <i class="el-icon-truck"></i>
              {{ item.id }}
            </span>
            <el-tag :type="isOperating(item) ? 'success' : 'info'" size="small">{{ isOperating(item) ? '运营中' : '休息中' }}</el-tag>
          </div>
          <h3>{{ item.lineName || '未命名线路' }}</h3>
          <div class="route-line">
            <span>
              <small>起点</small>
              <b>{{ formatValue(item.startPoint) }}</b>
            </span>
            <i class="el-icon-right"></i>
            <span>
              <small>终点</small>
              <b>{{ formatValue(item.endPoint) }}</b>
            </span>
          </div>
          <dl class="bus-card__meta">
            <dt>运营时段</dt>
            <dd>{{ scheduleText(item) }}</dd>
            <dt>发车间隔</dt>
            <dd>{{ intervalText(item.interval) }}</dd>
          </dl>
          <div class="bus-card__foot">
            <el-button type="text" size="mini" @click.stop="openDetail(item)">查看详情</el-button>
            <span v-if="!readOnly">
              <el-button type="text" size="mini" @click.stop="openEdit(item)">编辑</el-button>
              <el-button type="text" size="mini" class="danger-action" @click.stop="removeRecord(item)">删除</el-button>
            </span>
          </div>
        </article>
      </div>
      <el-empty v-else-if="!loading" class="empty-state" description="暂无符合条件的班车线路" />
      <div v-if="filteredRecords.length" class="pagination-row">
        <span>共 {{ filteredRecords.length }} 条</span>
        <el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="filteredRecords.length" layout="prev, pager, next" />
      </div>
    </section>

    <el-dialog :title="editingId ? '编辑班车' : '新增班车'" :visible.sync="formVisible" top="4vh" append-to-body :close-on-click-modal="false" custom-class="shuttle-bus-form" @closed="resetForm">
      <el-form ref="busForm" :model="form" :rules="rules" label-width="128px" @submit.native.prevent>
        <el-row :gutter="24" class="bus-form-row">
          <el-col :xs="24" :sm="12">
            <el-form-item label="线路名称" prop="lineName"><el-input v-model.trim="form.lineName" maxlength="80" placeholder="请输入线路名称" /></el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="发车间隔(分钟)" prop="interval">
              <el-input-number v-model="form.interval" :min="1" :precision="0" controls-position="right" class="field-full" @input="handleIntervalInput" @change="validateIntervalField" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24" class="bus-form-row">
          <el-col :xs="24" :sm="12">
            <el-form-item label="起点" prop="startPoint"><el-input v-model.trim="form.startPoint" maxlength="100" placeholder="请输入起点" /></el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="终点" prop="endPoint"><el-input v-model.trim="form.endPoint" maxlength="100" placeholder="请输入终点" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24" class="bus-form-row">
          <el-col :xs="24" :sm="12">
            <el-form-item label="首班车时间" prop="startTime">
              <el-time-picker v-model="form.startTime" value-format="HH:mm:ss" format="HH:mm" placeholder="请选择首班车时间" arrow-control class="field-full" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="末班车时间" prop="endTime">
              <el-time-picker v-model="form.endTime" value-format="HH:mm:ss" format="HH:mm" placeholder="请选择末班车时间" arrow-control class="field-full" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24" class="bus-form-row">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="3" maxlength="500" show-word-limit resize="none" placeholder="请输入备注（选填）" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">{{ editingId ? '保存' : '提交' }}</el-button>
      </span>
    </el-dialog>

    <el-drawer title="班车详情" :visible.sync="detailVisible" size="500px" append-to-body custom-class="shuttle-bus-detail">
      <div v-if="selectedRecord" class="drawer-layout">
        <div class="drawer-scroll">
          <div class="detail-hero">
            <i class="el-icon-truck"></i>
            <div>
              <small>{{ selectedRecord.id }}</small>
              <h3>{{ selectedRecord.lineName || '未命名线路' }}</h3>
            </div>
            <el-tag :type="isOperating(selectedRecord) ? 'success' : 'info'">{{ isOperating(selectedRecord) ? '运营中' : '休息中' }}</el-tag>
          </div>
          <div class="detail-grid">
            <span>
              <small>起点</small>
              <b>{{ formatValue(selectedRecord.startPoint) }}</b>
            </span>
            <span>
              <small>终点</small>
              <b>{{ formatValue(selectedRecord.endPoint) }}</b>
            </span>
            <span>
              <small>首班车时间</small>
              <b>{{ timeText(selectedRecord.startTime) }}</b>
            </span>
            <span>
              <small>末班车时间</small>
              <b>{{ timeText(selectedRecord.endTime) }}</b>
            </span>
            <span>
              <small>发车间隔</small>
              <b>{{ intervalText(selectedRecord.interval) }}</b>
            </span>
            <span>
              <small>当前状态</small>
              <b>{{ isOperating(selectedRecord) ? '运营中' : '休息中' }}</b>
            </span>
            <span class="detail-remark">
              <small>备注</small>
              <b>{{ formatValue(selectedRecord.remark) }}</b>
            </span>
          </div>
        </div>
        <div class="drawer-actions"><el-button @click="detailVisible = false">关闭</el-button></div>
      </div>
    </el-drawer>
  </main>
</template>

<script>
export default {
  name: 'ShuttleBusBoard',
  props: { readOnly: { type: Boolean, default: false } },
  data() {
    return {
      keyword: '',
      currentPage: 1,
      pageSize: 6,
      records: [],
      loading: false,
      submitting: false,
      formVisible: false,
      detailVisible: false,
      editingId: '',
      selectedRecord: null,
      form: {},
      clock: Date.now(),
      clockTimer: null
    }
  },
  computed: {
    filteredRecords() {
      const keyword = this.keyword.toLowerCase()
      return this.records.filter(
        (item) =>
          !keyword ||
          [item.id, item.lineName, item.startPoint, item.endPoint].some((value) =>
            String(value || '')
              .toLowerCase()
              .includes(keyword)
          )
      )
    },
    pagedRecords() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredRecords.slice(start, start + this.pageSize)
    },
    operatingCount() {
      this.clock
      return this.records.filter((item) => this.isOperating(item)).length
    },
    restingCount() {
      return this.records.length - this.operatingCount
    },
    rules() {
      return {
        lineName: [{ required: true, message: '请输入线路名称', trigger: 'blur' }],
        startPoint: [{ required: true, message: '请输入起点', trigger: 'blur' }],
        endPoint: [{ required: true, message: '请输入终点', trigger: 'blur' }],
        startTime: [{ required: true, message: '请选择首班车时间', trigger: 'change' }],
        endTime: [{ required: true, message: '请选择末班车时间', trigger: 'change' }],
        interval: [{ validator: this.validateInterval, trigger: ['change', 'blur'] }]
      }
    }
  },
  created() {
    this.loadRecords()
    this.clockTimer = window.setInterval(() => {
      this.clock = Date.now()
    }, 60000)
  },
  beforeDestroy() {
    window.clearInterval(this.clockTimer)
  },
  methods: {
    apiKey(action) {
      return `tocShuttleBus.${action}`
    },
    unwrap(response) {
      if (response && response.data && response.data.head && response.data.data !== undefined) return response.data.data
      if (response && response.result !== undefined) return response.result
      if (response && response.data && response.data.result !== undefined) return response.data.result
      return response && response.data !== undefined ? response.data : response
    },
    recordsFrom(data) {
      return Array.isArray(data) ? data : (data && (data.records || data.list)) || []
    },
    async loadRecords() {
      if (!this.$api || !this.$api[this.apiKey('list')]) return
      this.loading = true
      try {
        this.records = this.recordsFrom(this.unwrap(await this.$api[this.apiKey('list')]({ pageNo: 1, pageSize: 1000 })))
      } catch (error) {
        this.records = []
      } finally {
        this.loading = false
      }
    },
    resetPage() {
      this.currentPage = 1
    },
    timeToMinutes(value) {
      const match = String(value || '').match(/(\d{1,2}):(\d{2})(?::\d{2})?/)
      return match ? Number(match[1]) * 60 + Number(match[2]) : null
    },
    isOperating(item) {
      const start = this.timeToMinutes(item && item.startTime)
      const end = this.timeToMinutes(item && item.endTime)
      if (start === null || end === null) return false
      const now = new Date(this.clock)
      const current = now.getHours() * 60 + now.getMinutes()
      return start <= end ? current >= start && current <= end : current >= start || current <= end
    },
    timeText(value) {
      const match = String(value || '').match(/(\d{1,2}:\d{2})/)
      return match ? match[1] : '-'
    },
    timeValue(value) {
      const match = String(value || '').match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/)
      if (!match) return ''
      return `${String(match[1]).padStart(2, '0')}:${match[2]}:${match[3] || '00'}`
    },
    scheduleText(item) {
      return `${this.timeText(item.startTime)} - ${this.timeText(item.endTime)}`
    },
    intervalText(value) {
      return value === undefined || value === null || value === '' ? '-' : `${value} 分钟`
    },
    formatValue(value) {
      return value === undefined || value === null || value === '' ? '-' : value
    },
    validateInterval(rule, value, callback) {
      const interval = Number(value)
      if (!Number.isInteger(interval) || interval < 1) {
        callback(new Error('请输入大于 0 的发车间隔'))
        return
      }
      callback()
    },
    handleIntervalInput(value) {
      const interval = Number(value)
      if (Number.isInteger(interval) && interval >= 1 && this.$refs.busForm) {
        this.$refs.busForm.clearValidate('interval')
      }
    },
    validateIntervalField() {
      this.$nextTick(() => {
        if (this.$refs.busForm) this.$refs.busForm.validateField('interval', () => {})
      })
    },
    now() {
      const date = new Date()
      const pad = (value) => String(value).padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    },
    currentUserId() {
      const storeUser = this.$store && this.$store.getters && this.$store.getters.userInfo
      if (storeUser && storeUser.id) return storeUser.id
      try {
        return JSON.parse(window.sessionStorage.getItem('userInfo') || '{}').id || ''
      } catch (error) {
        return ''
      }
    },
    emptyForm() {
      return { lineName: '', startPoint: '', endPoint: '', startTime: '', endTime: '', interval: undefined, remark: '' }
    },
    resetForm() {
      this.editingId = ''
      this.form = this.emptyForm()
      this.$nextTick(() => this.$refs.busForm && this.$refs.busForm.clearValidate())
    },
    openCreate() {
      this.editingId = ''
      this.form = this.emptyForm()
      this.formVisible = true
    },
    openEdit(item) {
      this.editingId = item.id
      this.form = Object.assign(this.emptyForm(), item, { startTime: this.timeValue(item.startTime), endTime: this.timeValue(item.endTime) })
      this.formVisible = true
    },
    async submitForm() {
      const valid = await new Promise((resolve) => this.$refs.busForm.validate(resolve))
      if (!valid) return
      this.submitting = true
      const payload = Object.assign(
        {},
        this.form,
        this.editingId ? { id: this.editingId, updateBy: this.currentUserId(), itemUpdateTime: this.now() } : { createBy: this.currentUserId(), itemCreateTime: this.now() }
      )
      try {
        await this.$api[this.apiKey(this.editingId ? 'edit' : 'add')](payload)
        this.$message.success(this.editingId ? '班车已更新' : '班车已新增')
        this.formVisible = false
        await this.loadRecords()
      } catch (error) {
        this.$message.error('保存失败，请稍后重试')
      } finally {
        this.submitting = false
      }
    },
    async removeRecord(item) {
      try {
        await this.$confirm(`确认删除“${item.lineName || '该班车线路'}”吗？`, '删除确认', { type: 'warning' })
        await this.$api[this.apiKey('delete')]({ id: item.id })
        this.$message.success('班车已删除')
        await this.loadRecords()
      } catch (error) {
        if (error !== 'cancel' && error !== 'close') this.$message.error('删除失败，请稍后重试')
      }
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
.shuttle-bus-board {
  min-height: 100%;
  padding: 12px;
  box-sizing: border-box;
  background: #f6f8fb;
}
.bus-statistics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}
.stat-card {
  min-height: 94px;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 16px 18px;
  border: 1px solid #e5ebf2;
  border-radius: 10px;
  background: #fff;
  box-sizing: border-box;
}
.stat-card > i {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
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
.primary > i {
  color: #377ee8;
  background: #eaf2ff;
}
.success > i {
  color: #18a06d;
  background: #e7f8f0;
}
.info > i {
  color: #2187b9;
  background: #e6f7fc;
}
.bus-surface {
  min-height: clamp(660px, calc(100vh - 218px), 760px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e5ebf2;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.035);
}
.list-toolbar {
  min-height: 64px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  box-sizing: border-box;
}
.list-toolbar .el-input {
  width: 300px;
}
.toolbar-actions {
  margin-left: auto;
}
.bus-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(260px, 1fr));
  gap: 14px;
  align-content: start;
  padding: 2px 20px 18px;
}
.bus-card {
  min-height: 238px;
  display: flex;
  flex-direction: column;
  padding: 16px;
  border: 1px solid #e6ecf3;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s ease;
}
.bus-card:hover,
.bus-card:focus {
  border-color: #a9caf7;
}
.bus-card__head,
.bus-card__foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}
.record-id {
  overflow: hidden;
  color: #6d91c4;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.record-id i {
  margin-right: 6px;
  color: #409eff;
}
.bus-card h3 {
  margin: 13px 0 12px;
  overflow: hidden;
  color: #29486e;
  font-size: 17px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.route-line {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 26px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  padding: 11px 12px;
  border-radius: 8px;
  background: #f5f9ff;
}
.route-line span {
  min-width: 0;
}
.route-line small,
.route-line b {
  display: block;
}
.route-line small {
  margin-bottom: 4px;
  color: #8b9ab0;
  font-size: 12px;
}
.route-line b {
  overflow: hidden;
  color: #29486e;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.route-line i {
  color: #5b9cf1;
  font-size: 18px;
  text-align: center;
}
.bus-card__meta {
  display: grid;
  grid-template-columns: 74px minmax(0, 1fr);
  gap: 7px 12px;
  margin: 14px 0 0;
  padding: 11px 0;
  border-top: 1px solid #edf1f6;
  border-bottom: 1px solid #edf1f6;
  font-size: 13px;
}
.bus-card__meta dt {
  color: #9aa8bb;
}
.bus-card__meta dd {
  margin: 0;
  overflow: hidden;
  color: #50617a;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bus-card__foot {
  margin-top: auto;
  padding-top: 10px;
}
.bus-card__foot .el-button {
  margin-left: 4px;
}
.danger-action {
  color: #f56c6c;
}
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 260px;
}
.pagination-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  padding: 12px 20px 16px;
  border-top: 1px solid #edf1f6;
  color: #8b98aa;
  font-size: 13px;
}
.field-full {
  width: 100%;
}
.field-unit {
  margin-left: 8px;
  color: #7f8da3;
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
  border-radius: 8px;
  background: #eff6ff;
}
.detail-hero > i {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #2f86ed;
  color: #fff;
  font-size: 20px;
}
.detail-hero div {
  min-width: 0;
  flex: 1;
}
.detail-hero small {
  color: #7b8da7;
}
.detail-hero h3 {
  margin: 4px 0;
  overflow: hidden;
  color: #172d4d;
  font-size: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 16px;
  overflow: hidden;
  border: 1px solid #e7edf5;
  border-radius: 7px;
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
.detail-grid .detail-remark {
  grid-column: 1 / -1;
  border-bottom: 0;
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
.drawer-actions {
  padding: 12px 16px;
  border-top: 1px solid #e8edf3;
  text-align: right;
}
@media (max-width: 1100px) {
  .bus-grid {
    grid-template-columns: repeat(2, minmax(260px, 1fr));
  }
}
@media (max-width: 760px) {
  .shuttle-bus-board {
    min-height: 0;
    height: 100%;
    padding: 12px;
    overflow-y: auto;
  }
  .bus-statistics {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .stat-card {
    min-height: 76px;
    padding: 12px;
  }
  .bus-surface {
    min-height: 440px;
  }
  .list-toolbar {
    display: grid;
    padding: 12px;
  }
  .list-toolbar .el-input,
  .toolbar-actions,
  .toolbar-actions .el-button {
    width: 100%;
  }
  .bus-grid {
    grid-template-columns: 1fr;
    padding: 2px 12px 14px;
  }
  .pagination-row {
    justify-content: center;
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
  ::v-deep .shuttle-bus-detail {
    width: 100% !important;
    max-width: 100% !important;
  }
  ::v-deep .shuttle-bus-form {
    width: 100% !important;
    min-width: 0;
    margin: 0 !important;
  }
}
</style>
