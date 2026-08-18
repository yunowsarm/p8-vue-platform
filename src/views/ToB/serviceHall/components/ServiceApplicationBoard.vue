<template>
  <main class="application-board">
    <section class="summary-grid">
      <article v-for="item in summaryCards" :key="item.title" class="summary-card">
        <span class="summary-icon" :class="item.color"><i :class="item.icon"></i></span>
        <div>
          <small>{{ item.title }}</small>
          <b>
            {{ item.value }}
            <em>条</em>
          </b>
          <p v-if="config.showSummaryNote !== false">{{ item.note }}</p>
        </div>
      </article>
    </section>

    <section v-loading="loading" class="application-surface">
      <div class="list-toolbar">
        <el-input v-model.trim="keyword" clearable size="small" prefix-icon="el-icon-search" :placeholder="'搜索编号、企业名称、' + config.primaryLabel" @input="resetPage" @clear="resetPage" />
        <el-select v-if="primaryOptions.length" v-model="typeFilter" clearable size="small" :placeholder="'全部' + config.primaryLabel" @change="resetPage" @clear="resetPage">
          <el-option v-for="item in primaryOptions" :key="item" :label="item" :value="item" />
        </el-select>
        <el-select v-model="statusFilter" clearable size="small" placeholder="全部状态" @change="resetPage" @clear="resetPage">
          <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
        </el-select>
        <div class="toolbar-actions">
          <el-button v-if="selectedIds.length" type="danger" plain size="small" @click="removeSelected">批量删除（{{ selectedIds.length }}）</el-button>
          <el-button type="primary" size="small" icon="el-icon-plus" @click="openCreate">新增{{ config.title }}</el-button>
        </div>
      </div>

      <div v-if="pagedRecords.length" class="record-grid">
        <article
          v-for="item in pagedRecords"
          :key="item.id"
          class="record-card"
          tabindex="0"
          role="button"
          @click="openDetail(item)"
          @keydown.enter="openDetail(item)"
          @keydown.space.prevent="openDetail(item)">
          <div class="record-head">
            <span class="record-id">
              <i class="el-icon-document"></i>
              {{ item.id }}
            </span>
            <div class="record-status">
              <el-tag :type="statusType(statusText(item.status))" size="small" effect="light">{{ statusText(item.status) }}</el-tag>
              <el-checkbox v-model="selectedIds" :label="item.id" @click.stop @click.native.stop @mousedown.native.stop @keydown.stop @keydown.native.stop>
                <span class="selection-label">选择</span>
              </el-checkbox>
            </div>
          </div>
          <div class="record-title">
            <span>
              <i :class="config.icon"></i>
              {{ config.cardTitleText || item[config.cardTitleKey || config.primaryKey] }}
            </span>
            <time>{{ item[config.timeKey] }}</time>
          </div>
          <p class="record-content">{{ item[config.contentKey] }}</p>
          <div class="record-info">
            <span>
              <i class="el-icon-office-building"></i>
              {{ companyLabel(item.companyId) }}
            </span>
            <span v-if="item[config.contactNameKey || 'contactName']">
              <i class="el-icon-user"></i>
              {{ item[config.contactNameKey || 'contactName'] }}
            </span>
            <span v-if="item[config.contactPhoneKey || 'contactPhone']">
              <i class="el-icon-phone-outline"></i>
              {{ item[config.contactPhoneKey || 'contactPhone'] }}
            </span>
          </div>
          <div class="record-foot">
            <span v-if="item.remark" class="remark">
              <i class="el-icon-chat-line-round"></i>
              {{ item.remark }}
            </span>
            <div class="record-actions">
              <el-button type="text" size="mini" @click.stop="openDetail(item)">查看详情</el-button>
              <el-button type="text" size="mini" @click.stop="openEdit(item)">编辑</el-button>
              <el-button type="text" size="mini" class="danger-action" @click.stop="removeRecord(item)">删除</el-button>
            </div>
          </div>
        </article>
      </div>
      <el-empty v-else class="empty-state" description="暂无符合筛选条件的数据">
        <!-- <el-button type="primary" size="small" @click="openCreate">新增{{ config.title }}</el-button> -->
      </el-empty>
      <div v-if="paginationTotal" class="pagination-row">
        <span>每页 {{ pageSize }} 条</span>
        <el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="paginationTotal" layout="prev, pager, next" @current-change="loadRecords" />
      </div>
    </section>

    <el-dialog :title="'新建' + config.title" :visible.sync="createVisible" top="4vh" append-to-body :close-on-click-modal="false" custom-class="application-create-dialog" @closed="resetForm">
      <el-form ref="applicationForm" :model="form" :rules="rules" label-width="88px" @submit.native.prevent>
        <el-row :gutter="32">
          <el-col v-for="field in normalFields" :key="field.key" :xs="24" :sm="12" :lg="field.wide ? 24 : 8">
            <el-form-item :label="field.label" :prop="field.key">
              <el-select v-if="field.key === 'companyId'" v-model="form[field.key]" clearable filterable :loading="enterpriseLoading" placeholder="请选择企业" class="field-full">
                <el-option v-for="enterprise in enterpriseOptions" :key="enterprise.id" :label="enterprise.label" :value="enterprise.id" />
              </el-select>
              <el-select v-else-if="field.options" v-model="form[field.key]" clearable filterable :placeholder="'请选择' + field.label" class="field-full">
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
              <el-input v-else v-model.trim="form[field.key]" :placeholder="'请输入' + field.label" maxlength="80" />
            </el-form-item>
          </el-col>
          <el-col v-for="field in textFields" :key="field.key" :span="24">
            <el-form-item :label="field.label" :prop="field.key">
              <el-input
                v-model.trim="form[field.key]"
                type="textarea"
                :rows="field.key === config.contentKey ? 6 : 3"
                :maxlength="field.key === config.contentKey ? 500 : 200"
                show-word-limit
                :placeholder="'请填写' + field.label" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="状态">
              <div class="readonly-status">
                <i class="el-icon-time"></i>
                <span>{{ config.defaultStatus || '待受理' }}</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">提交</el-button>
      </span>
    </el-dialog>

    <el-drawer :title="config.title + '详情'" :visible.sync="detailVisible" size="500px" append-to-body :modal-append-to-body="true" :lock-scroll="true" custom-class="application-detail-drawer">
      <div v-if="selectedRecord" class="drawer-layout">
        <div class="drawer-scroll">
          <div class="detail-hero">
            <span class="hero-icon"><i :class="config.icon"></i></span>
            <div>
              <small>{{ selectedRecord.id }}</small>
              <h3>{{ selectedRecord[config.primaryKey] }}</h3>
              <p>{{ companyLabel(selectedRecord.companyId) }}</p>
            </div>
            <el-tag :type="statusType(selectedRecord.status)">{{ selectedRecord.status }}</el-tag>
          </div>
          <div class="detail-grid">
            <span v-for="field in detailFields" :key="field.key">
              <small>{{ field.label }}</small>
              <b>{{ selectedRecord[field.key] || '-' }}</b>
            </span>
          </div>
          <section v-for="field in supplementalTextFields" :key="field.key" class="detail-section">
            <h4>{{ field.label }}</h4>
            <p>{{ selectedRecord[field.key] || '-' }}</p>
          </section>
          <section class="detail-section">
            <h4>{{ config.contentLabel }}</h4>
            <p>{{ selectedRecord[config.contentKey] }}</p>
          </section>
          <section v-if="selectedRecord.remark" class="detail-section">
            <h4>备注</h4>
            <p>{{ selectedRecord.remark }}</p>
          </section>
          <section class="detail-section">
            <h4>处理进度</h4>
            <div class="timeline">
              <div class="timeline-item done">
                <span></span>
                <div>
                  <b>已提交</b>
                  <small>{{ selectedRecord[config.timeKey] }} · 系统已记录{{ config.title }}</small>
                </div>
              </div>
              <div class="timeline-item" :class="{ done: selectedRecord.status !== '待受理' && selectedRecord.status !== '待审核' }">
                <span></span>
                <div>
                  <b>业务受理</b>
                  <small>{{ selectedRecord.status === '待受理' || selectedRecord.status === '待审核' ? '等待专员审核或受理' : '正在跟进处理' }}</small>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div class="drawer-actions">
          <el-button @click="detailVisible = false">关闭</el-button>
        </div>
      </div>
    </el-drawer>
  </main>
</template>

<script>
const now = () => {
  const date = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export default {
  name: 'ServiceApplicationBoard',
  props: { config: { type: Object, required: true } },
  data() {
    return {
      keyword: '',
      typeFilter: '',
      statusFilter: '',
      currentPage: 1,
      pageSize: 6,
      createVisible: false,
      detailVisible: false,
      submitting: false,
      detailLoading: false,
      loading: false,
      usingMock: false,
      editingId: '',
      total: 0,
      selectedRecord: null,
      selectedIds: [],
      records: [],
      enterpriseOptions: [],
      enterpriseLoading: false,
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
    detailFields() {
      return this.fields.filter((item) => item.type !== 'textarea' && item.key !== 'remark').slice(0, 6)
    },
    supplementalTextFields() {
      return this.textFields.filter((item) => item.key !== this.config.contentKey && item.key !== 'remark')
    },
    primaryOptions() {
      const field = this.fields.find((item) => item.key === this.config.primaryKey)
      return field && field.options ? field.options : []
    },
    statusOptions() {
      return this.config.statusOptions || ['待受理', '待审核', '处理中', '已完成', '已通过', '已关闭']
    },
    filteredRecords() {
      const keyword = this.keyword.toLowerCase()
      return this.records.filter(
        (item) =>
          (!keyword ||
            Object.keys(item).some((key) =>
              String(item[key] || '')
                .toLowerCase()
                .includes(keyword)
            )) &&
          (!this.typeFilter || item[this.config.primaryKey] === this.typeFilter) &&
          (!this.statusFilter || this.statusText(item.status) === this.statusFilter)
      )
    },
    pagedRecords() {
      if (!this.usingMock) return this.filteredRecords
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredRecords.slice(start, start + this.pageSize)
    },
    paginationTotal() {
      return this.usingMock ? this.filteredRecords.length : this.total
    },
    summaryCards() {
      const count = (statuses) => this.records.filter((item) => statuses.indexOf(this.statusText(item.status)) > -1).length
      const definitions = this.config.summaryDefinitions || [
        { title: `全部${this.config.title}`, value: this.records.length, note: '服务事项统一归集', icon: 'el-icon-document', color: 'blue' },
        { title: '待受理', statuses: ['待受理', '待审核'], note: '等待专员审核确认', icon: 'el-icon-time', color: 'orange' },
        { title: '处理中', statuses: ['处理中'], note: '服务专员持续跟进', icon: 'el-icon-s-operation', color: 'cyan' },
        { title: '本月完成', statuses: ['已完成', '已通过'], note: '已完成服务反馈', icon: 'el-icon-circle-check', color: 'green' }
      ]
      return definitions.map((item) => Object.assign({}, item, { value: item.all ? this.records.length : item.value !== undefined ? item.value : count(item.statuses || []) }))
    },
    rules() {
      const rules = {}
      this.fields
        .filter((item) => item.required)
        .forEach((item) => {
          const isSelect = item.type === 'select' || item.key === 'companyId'
          rules[item.key] = [{ required: true, message: `请${isSelect ? '选择' : '填写'}${item.label}`, trigger: isSelect ? 'change' : 'blur' }]
        })
      return rules
    }
  },
  created() {
    this.loadRecords()
    this.loadEnterprises()
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
      const namespaces = {
        DR: 'tobDataReport', SR: 'tobServiceRequest', MP: 'tobMediaPromotion', QR: 'tobQualificationCert', RC: 'tobResourceConnection',
        NA: 'tobPublicNotice', PA: 'tobEventActivity', OC: 'tobOnlineConsult', BP: 'tobEnterprisePolicy', DD: 'tobResourceDownload',
        SC: 'tobSafetyArticle', PN: 'tobParkNews', EN: 'tobCompanyNews',
        BO: 'tobBusinessOpportunity', CD: 'tobCompanyDemand', IA: 'tobIndustryAssociation', SM: 'tobStartupMentor',
        SO: 'tobServiceOrg', MR: 'tobMeetingRoomBook', FR: 'tobFacilityRental'
      }
      return `${this.config.apiNamespace || namespaces[this.config.idPrefix]}.${action}`
    },
    unwrap(response) {
      if (response && response.result !== undefined) return response.result
      if (response && response.data && response.data.result !== undefined) return response.data.result
      return response && response.data !== undefined ? response.data : response
    },
    async loadEnterprises() {
      if (!this.$api || !this.$api['enterprise.getEnterprise']) return
      this.enterpriseLoading = true
      try {
        const result = this.unwrap(await this.$api['enterprise.getEnterprise']())
        const list = Array.isArray(result) ? result : result && Array.isArray(result.data) ? result.data : []
        this.enterpriseOptions = list.map((item) => ({
          id: item.id,
          label: item.enterpriseName || item.enterpriseFullname || item.enterpriseNo || item.id,
          fullName: item.enterpriseFullname || ''
        }))
      } catch (error) {
        this.enterpriseOptions = []
      } finally {
        this.enterpriseLoading = false
      }
    },
    companyLabel(companyId) {
      const enterprise = this.enterpriseOptions.find((item) => String(item.id) === String(companyId))
      return enterprise ? enterprise.label : companyId || '-'
    },
    useMockRecords() {
      this.records = (this.config.records || []).map((item) => Object.assign({}, item))
      this.total = this.records.length
      this.usingMock = true
    },
    async loadRecords() {
      if (!this.$api || !this.$api[this.apiKey('list')]) {
        this.useMockRecords()
        return
      }
      this.loading = true
      try {
        const params = { pageNo: this.currentPage, pageSize: this.pageSize }
        if (this.keyword) params.keyword = this.keyword
        if (this.typeFilter) params[this.config.primaryKey] = this.typeFilter
        if (this.statusFilter) params.status = this.statusFilter
        const result = this.unwrap(await this.$api[this.apiKey('list')](params)) || {}
        this.records = Array.isArray(result.records) ? result.records : Array.isArray(result) ? result : []
        this.total = Number(result.total || this.records.length)
        this.usingMock = false
      } catch (error) {
        this.useMockRecords()
      } finally {
        this.loading = false
      }
    },
    resetPage() {
      this.currentPage = 1
      this.loadRecords()
    },
    statusType(status) {
      return { 待受理: 'warning', 待审核: 'warning', 待回复: 'warning', 处理中: '', 已完成: 'success', 已通过: 'success', 已回复: 'success', 已发布: 'success', 正常: 'success', 已拒绝: 'danger', 已关闭: 'info', 已下线: 'info', 已取消: 'info', 停用: 'info', 草稿: 'info' }[status] || 'info'
    },
    statusText(status) {
      if (status === 0 || status === '0') return this.config.defaultStatus || '待受理'
      return status || this.config.defaultStatus || '待受理'
    },
    emptyForm() {
      const form = {}
      this.fields.forEach((item) => {
        form[item.key] = item.key === this.config.timeKey ? now() : ''
      })
      return form
    },
    openCreate() {
      this.editingId = ''
      this.form = this.emptyForm()
      this.createVisible = true
      this.$nextTick(() => this.$refs.applicationForm && this.$refs.applicationForm.clearValidate())
    },
    resetForm() {
      this.form = this.emptyForm()
      this.submitting = false
      this.editingId = ''
    },
    submitForm() {
      this.$refs.applicationForm.validate((valid) => {
        if (!valid) return
        this.saveRecord()
      })
    },
    async saveRecord() {
      this.submitting = true
      const payload = Object.assign({}, this.form)
      if (!payload.status) payload.status = this.config.defaultStatus || '待受理'
      if (this.editingId) payload.id = this.editingId
      Object.assign(payload, this.editingId ? { updateBy: this.currentUserId(), itemUpdateTime: now() } : { createBy: this.currentUserId(), itemCreateTime: now() })
      try {
        if (this.usingMock || !this.$api || !this.$api[this.apiKey(this.editingId ? 'edit' : 'add')]) {
          this.saveMockRecord(payload)
        } else {
          await this.$api[this.apiKey(this.editingId ? 'edit' : 'add')](payload)
        }
        this.$message.success(this.editingId ? '修改成功' : `${this.config.title}已提交`)
        this.createVisible = false
        this.currentPage = 1
        if (!this.usingMock) await this.loadRecords()
      } catch (error) {
        this.$message.error('提交失败，请稍后重试')
      } finally {
        this.submitting = false
      }
    },
    saveMockRecord(payload) {
      if (this.editingId) {
        const index = this.records.findIndex((item) => String(item.id) === String(this.editingId))
        if (index > -1) this.$set(this.records, index, Object.assign({}, this.records[index], payload))
        return
      }
      this.records.unshift(Object.assign({}, payload, { id: `${this.config.idPrefix}${Date.now().toString().slice(-8)}` }))
      this.total = this.records.length
    },
    async openDetail(item) {
      this.selectedRecord = item
      this.detailVisible = true
      if (this.usingMock || !this.$api || !this.$api[this.apiKey('queryById')]) return
      this.detailLoading = true
      try {
        const result = this.unwrap(await this.$api[this.apiKey('queryById')]({ id: item.id }))
        if (result) this.selectedRecord = result
      } catch (error) {
        // 保留卡片中的数据，详情仍可查看。
      } finally {
        this.detailLoading = false
      }
    },
    openEdit(record) {
      const target = record || this.selectedRecord
      if (!target) return
      this.selectedRecord = target
      this.editingId = target.id
      this.form = Object.assign(this.emptyForm(), target)
      this.detailVisible = false
      this.createVisible = true
      this.$nextTick(() => this.$refs.applicationForm && this.$refs.applicationForm.clearValidate())
    },
    removeRecord(record) {
      const target = record || this.selectedRecord
      if (!target) return
      this.$confirm('删除后不可恢复，是否继续？', '确认删除', { type: 'warning' })
        .then(async () => {
          try {
            if (this.usingMock || !this.$api || !this.$api[this.apiKey('delete')]) {
              this.records = this.records.filter((item) => String(item.id) !== String(target.id))
              this.total = this.records.length
            } else {
              await this.$api[this.apiKey('delete')]({ id: target.id })
              await this.loadRecords()
            }
            this.detailVisible = false
            this.$message.success('删除成功')
          } catch (error) {
            this.$message.error('删除失败，请稍后重试')
          }
        })
        .catch(() => {})
    },
    removeSelected() {
      const ids = this.selectedIds.slice()
      if (!ids.length) return
      this.$confirm(`确定删除已选的 ${ids.length} 条记录吗？删除后不可恢复。`, '确认批量删除', { type: 'warning' })
        .then(async () => {
          try {
            if (this.usingMock || !this.$api || !this.$api[this.apiKey('delete')]) {
              this.records = this.records.filter((item) => !ids.includes(item.id))
              this.total = this.records.length
            } else {
              await Promise.all(ids.map((id) => this.$api[this.apiKey('delete')]({ id })))
              await this.loadRecords()
            }
            this.selectedIds = []
            this.$message.success('批量删除成功')
          } catch (error) {
            this.$message.error('批量删除失败，请稍后重试')
          }
        })
        .catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.application-board {
  min-height: 100%;
  padding: 20px 18px 34px;
  box-sizing: border-box;
  background: #f6f8fb;
  color: #263a55;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}
.summary-card {
  display: flex;
  align-items: center;
  min-height: 94px;
  padding: 16px 18px;
  gap: 12px;
  border: 1px solid #e5ebf2;
  border-radius: 10px;
  background: #fff;
  box-sizing: border-box;
}
.summary-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  border-radius: 12px;
  font-size: 18px;
}
.summary-icon.blue {
  background: #e8f0ff;
  color: #2d78df;
}
.summary-icon.orange {
  background: #fff1df;
  color: #e99524;
}
.summary-icon.cyan {
  background: #e5f8fb;
  color: #129fb6;
}
.summary-icon.green {
  background: #e6f8ef;
  color: #20a36b;
}
.summary-card small {
  display: block;
  color: #8190a3;
  font-size: 13px;
}
.summary-card b {
  display: block;
  margin-top: 3px;
  color: #24364d;
  font-size: 23px;
  line-height: 1.1;
}
.summary-card em {
  margin-left: 3px;
  color: #7b899c;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
}
.summary-card p {
  margin: 5px 0 0;
  color: #99a5b4;
  font-size: 12px;
}
.application-surface {
  display: flex;
  min-height: clamp(660px, calc(100vh - 250px), 760px);
  border: 1px solid #e5ebf2;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 4px 14px rgba(44, 69, 101, 0.035);
  flex-direction: column;
}
.list-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
}
.list-toolbar .el-input {
  width: 300px;
}
.list-toolbar .el-select {
  width: 160px;
}
.toolbar-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}
.record-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  padding: 2px 20px 18px;
}
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  padding: 24px 20px 48px;
  box-sizing: border-box;
  flex: 1 1 auto;
}
.record-card {
  display: flex;
  min-width: 0;
  min-height: 252px;
  padding: 16px;
  border: 1px solid #e6ecf3;
  border-radius: 10px;
  background: #fff;
  box-sizing: border-box;
  cursor: pointer;
  flex-direction: column;
  transition: border-color 0.2s ease;
}
.record-card:hover {
  border-color: #a9caf7;
}
.record-card:focus-visible {
  outline: 3px solid rgba(46, 120, 223, 0.28);
  outline-offset: 2px;
}
.record-head,
.record-title,
.record-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.record-status,
.record-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}
.record-status .el-tag {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  line-height: 22px;
  white-space: nowrap;
}
.record-status .el-checkbox {
  display: flex;
  align-items: center;
  margin: 0;
}
.selection-label {
  display: none;
}
.record-id {
  color: #69809c;
  font-size: 12px;
}
.record-id i,
.record-title i {
  margin-right: 4px;
  color: #2e7cdf;
}
.record-title {
  align-items: flex-start;
  margin-top: 12px;
  color: #3b5678;
  font-size: 13px;
  font-weight: 600;
}
.record-title time {
  max-width: 142px;
  color: #98a4b3;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.45;
  text-align: right;
}
.record-content {
  display: -webkit-box;
  overflow: hidden;
  margin: 11px 0;
  color: #485d77;
  font-size: 14px;
  line-height: 1.65;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
.record-info {
  display: flex;
  flex-wrap: wrap;
  gap: 7px 12px;
  margin-top: auto;
  padding-top: 11px;
  border-top: 1px solid #eef2f6;
  color: #7b8a9c;
  font-size: 12px;
}
.record-info i {
  margin-right: 3px;
  color: #97a9bd;
}
.record-foot {
  min-height: 22px;
  margin-top: 11px;
}
.remark {
  display: block;
  overflow: hidden;
  max-width: 72%;
  color: #9a7a43;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.remark i {
  margin-right: 4px;
}
.detail-link {
  color: #2878df;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}
.record-actions {
  margin-left: auto;
  white-space: nowrap;
}
.record-actions .el-button {
  margin-left: 0;
  padding: 4px 3px;
}
.danger-action {
  color: #f56c6c;
}
.pagination-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: auto;
  padding: 12px 20px 16px;
  border-top: 1px solid #eef2f6;
  background: #fff;
  color: #8996a6;
  font-size: 12px;
  flex: 0 0 auto;
}
.field-full {
  width: 100%;
}
@media (max-width: 1200px) {
  .record-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 760px) {
  .application-surface {
    min-height: 440px;
  }
  .application-board {
    height: 100%;
    min-height: 0;
    padding: 14px 12px 24px;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 12px;
  }
  .summary-card {
    min-height: 88px;
    padding: 13px 12px;
    gap: 9px;
  }
  .summary-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    font-size: 16px;
  }
  .summary-card b {
    font-size: 21px;
  }
  .list-toolbar {
    align-items: stretch;
    flex-wrap: wrap;
    gap: 9px;
    padding: 12px;
  }
  .list-toolbar .el-input {
    width: 100%;
  }
  .list-toolbar .el-select {
    width: calc(50% - 5px);
  }
  .toolbar-actions {
    width: 100%;
  }
  .toolbar-actions .el-button {
    flex: 1;
    min-height: 38px;
  }
  .record-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 0 12px 14px;
  }
  .record-card {
    min-height: 238px;
    padding: 15px;
  }
  .record-content {
    -webkit-line-clamp: 4;
  }
  .pagination-row {
    justify-content: center;
    padding: 12px;
  }
}
@media (max-width: 460px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
  .summary-card {
    min-height: 76px;
  }
  .list-toolbar .el-select {
    width: 100%;
  }
  .record-id {
    max-width: calc(100% - 64px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .remark {
    max-width: 62%;
  }
}
@media (prefers-reduced-motion: reduce) {
  .record-card {
    transition: none;
  }
}
</style>

<style lang="scss">
.application-create-dialog {
  min-width: 760px;
  margin-bottom: 0;
}
.application-create-dialog .el-dialog__header {
  padding: 17px 20px;
  border-bottom: 1px solid #e5e9ef;
}
.application-create-dialog .el-dialog__title {
  color: #24364d;
  font-size: 17px;
  font-weight: 600;
}
.application-create-dialog .el-dialog__body {
  min-height: 50vh;
  padding: 26px 36px 32px;
}
.application-create-dialog .el-dialog__footer {
  padding: 14px 20px;
  border-top: 1px solid #e5e9ef;
}
.application-create-dialog .el-form-item {
  margin-bottom: 24px;
}
.application-create-dialog .el-form-item__label {
  color: #354b68;
  font-size: 14px;
}
.application-create-dialog .el-input__inner {
  height: 40px;
}
.application-create-dialog .el-textarea__inner {
  line-height: 1.6;
  resize: vertical;
}
.readonly-status {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #dce3ec;
  border-radius: 4px;
  background: #f7f9fc;
  color: #516780;
  box-sizing: border-box;
}
.readonly-status i {
  margin-right: 7px;
  color: #e59d2c;
}
.application-detail-drawer .el-drawer__header {
  margin-bottom: 0;
  padding: 18px 20px;
  border-bottom: 1px solid #e8edf3;
  color: #273b56;
}
.drawer-layout {
  display: flex;
  height: calc(100vh - 62px);
  flex-direction: column;
}
.drawer-scroll {
  overflow-y: auto;
  flex: 1;
  padding: 18px;
}
.detail-hero {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 9px;
  background: #eff5ff;
}
.hero-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 9px;
  background: #2f7cdf;
  color: #fff;
  font-size: 18px;
}
.detail-hero div {
  min-width: 0;
  flex: 1;
}
.detail-hero small {
  color: #7d91aa;
  font-size: 12px;
}
.detail-hero h3 {
  margin: 3px 0;
  color: #294260;
  font-size: 16px;
}
.detail-hero p {
  margin: 0;
  color: #6f829a;
  font-size: 12px;
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 14px;
  border-top: 1px solid #e4eaf1;
  border-left: 1px solid #e4eaf1;
  border-radius: 6px;
  overflow: hidden;
}
.detail-grid span {
  min-height: 67px;
  padding: 12px;
  border-right: 1px solid #e4eaf1;
  border-bottom: 1px solid #e4eaf1;
  box-sizing: border-box;
}
.detail-grid small,
.detail-grid b {
  display: block;
}
.detail-grid small {
  color: #8795a7;
  font-size: 12px;
}
.detail-grid b {
  margin-top: 5px;
  color: #3a4f6a;
  font-size: 13px;
  font-weight: 600;
}
.detail-section {
  margin-top: 20px;
}
.detail-section h4 {
  margin: 0 0 10px;
  color: #304660;
  font-size: 14px;
}
.detail-section p {
  margin: 0;
  padding: 13px;
  border-radius: 6px;
  background: #f7f9fc;
  color: #556a84;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-line;
}
.timeline {
  padding: 2px 0 0;
}
.timeline-item {
  position: relative;
  display: flex;
  gap: 11px;
  padding-bottom: 18px;
}
.timeline-item > span {
  position: relative;
  z-index: 1;
  width: 11px;
  height: 11px;
  margin-top: 3px;
  border: 2px solid #c6d0dd;
  border-radius: 50%;
  background: #fff;
  box-sizing: border-box;
}
.timeline-item:not(:last-child)::after {
  position: absolute;
  top: 13px;
  left: 5px;
  width: 1px;
  height: calc(100% - 8px);
  background: #dbe3ec;
  content: '';
}
.timeline-item.done > span {
  border-color: #2f7cdf;
  background: #2f7cdf;
}
.timeline-item b,
.timeline-item small {
  display: block;
}
.timeline-item b {
  color: #435971;
  font-size: 13px;
}
.timeline-item small {
  margin-top: 4px;
  color: #8d9aaa;
  font-size: 12px;
}
.drawer-actions {
  padding: 13px 20px;
  border-top: 1px solid #e7edf3;
  text-align: right;
}
@media (max-width: 760px) {
  .application-create-dialog {
    width: 100% !important;
    min-width: 0;
    height: 100vh;
    height: 100dvh;
    margin: 0 !important;
    border-radius: 0;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }
  .application-create-dialog .el-dialog__header,
  .application-create-dialog .el-dialog__footer {
    flex: 0 0 auto;
  }
  .application-create-dialog .el-dialog__body {
    min-height: 0;
    flex: 1 1 auto;
    padding: 20px 16px;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .application-create-dialog .el-form-item {
    margin-bottom: 16px;
  }
  .application-create-dialog .el-form-item__label {
    float: none;
    display: block;
    width: auto !important;
    margin-bottom: 8px;
    line-height: 1.2;
    text-align: left;
  }
  .application-create-dialog .el-form-item__content {
    margin-left: 0 !important;
    line-height: normal;
  }
  .application-create-dialog .el-row {
    margin-right: 0 !important;
    margin-left: 0 !important;
  }
  .application-create-dialog .el-col {
    padding-right: 0 !important;
    padding-left: 0 !important;
  }
  .application-create-dialog .el-textarea__inner {
    min-height: 132px !important;
  }
  .application-create-dialog .el-dialog__footer {
    padding: 12px 16px;
  }
  .application-create-dialog .dialog-footer {
    display: flex;
    gap: 10px;
    width: 100%;
  }
  .application-create-dialog .dialog-footer .el-button {
    flex: 1;
    min-height: 40px;
    margin: 0;
  }
  .application-detail-drawer {
    width: 100% !important;
  }
  .drawer-layout {
    height: calc(100vh - 58px);
  }
  .drawer-scroll {
    padding: 14px;
  }
  .drawer-actions {
    display: flex;
    gap: 10px;
    padding: 12px 14px;
  }
  .drawer-actions .el-button {
    flex: 1;
    min-height: 40px;
    margin: 0;
  }
}
</style>
