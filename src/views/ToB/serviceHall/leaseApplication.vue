<template>
  <main class="lease-application">
    <section class="application-surface" v-loading="loading">
      <div class="list-toolbar">
        <el-radio-group v-model="typeFilter" size="small">
          <el-radio-button label="">全部申请</el-radio-button>
          <el-radio-button v-for="item in applicationTypes" :key="item.value" :label="item.value">{{ item.label }}</el-radio-button>
        </el-radio-group>
        <el-select v-model="statusFilter" clearable size="small" placeholder="全部状态">
          <el-option v-for="status in statusOptions" :key="status" :label="status" :value="status" />
        </el-select>
        <el-button type="primary" size="small" icon="el-icon-plus" @click="openCreate">发起申请</el-button>
      </div>

      <div v-if="pagedRecords.length" class="record-grid">
        <article v-for="item in pagedRecords" :key="item.id" class="record-card" @click="openDetail(item)">
          <div class="record-head">
            <span class="record-id">
              <i class="el-icon-document" />
              {{ item.id }}
            </span>
            <el-tag :type="statusType(statusText(item.status))" size="small" effect="light">{{ statusText(item.status) }}</el-tag>
          </div>
          <div class="record-title">
            <span :class="['type-icon', item.applyType]"><i :class="typeIcon(item.applyType)" /></span>
            <div>
              <h3>{{ applyTypeText(item.applyType) }}</h3>
              <p>{{ item.companyName }}</p>
            </div>
          </div>
          <div class="record-info">
            <span>
              <i class="el-icon-location-outline" />
              {{ item.currentLocation }}
            </span>
            <span>
              <i class="el-icon-date" />
              提交于 {{ item.applyDate }}
            </span>
          </div>
          <p class="record-reason">{{ reasonValue(item) }}</p>
          <div class="record-foot">
            <span>联系人：{{ item.contactPerson }} {{ item.contactPhone }}</span>
            <span class="record-actions">
              <el-button v-if="canEditRecord(item)" type="text" size="mini" @click.stop="openEdit(item)">编辑</el-button>
              <el-button type="text" size="mini" @click.stop="openDetail(item)">
                查看详情
                <i class="el-icon-arrow-right" />
              </el-button>
            </span>
          </div>
        </article>
      </div>
      <el-empty v-else description="暂无租赁申请记录" />
      <div v-if="paginationTotal" class="pagination-row">
        <span>共 {{ paginationTotal }} 条</span>
        <el-pagination background :current-page="currentPage" :page-size="pageSize" :total="paginationTotal" layout="prev, pager, next" @current-change="handlePageChange" />
      </div>
    </section>

    <el-dialog
      :title="editingId ? '编辑租赁申请' : '发起租赁申请'"
      :visible.sync="formVisible"
      top="5vh"
      append-to-body
      :close-on-click-modal="false"
      custom-class="lease-application-dialog"
      @closed="resetForm">
      <div class="dialog-tip">
        <i class="el-icon-info" />
        请根据实际租赁需求填写
      </div>
      <el-form ref="leaseForm" :model="form" :rules="rules" :validate-on-rule-change="false" label-width="108px" @submit.native.prevent>
        <el-divider content-position="left">申请类型</el-divider>
        <el-form-item label="申请类型" prop="applyType">
          <el-radio-group v-model="form.applyType" class="type-selector" @change="onTypeChange">
            <el-radio-button v-for="item in applicationTypes" :key="item.value" :label="item.value">
              <i :class="item.icon" />
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-divider content-position="left">租户与租约信息</el-divider>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12">
            <el-form-item label="企业名称" prop="companyName"><el-input v-model.trim="form.companyName" placeholder="请输入企业名称" /></el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="租赁合同编号" prop="contractNo"><el-input v-model.trim="form.contractNo" placeholder="请输入合同编号" /></el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="现租赁位置" prop="currentLocation"><el-input v-model.trim="form.currentLocation" placeholder="如：A座 501 室" /></el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="联系人" prop="contactPerson"><el-input v-model.trim="form.contactPerson" placeholder="请输入联系人姓名" /></el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="联系电话" prop="contactPhone"><el-input v-model.trim="form.contactPhone" placeholder="请输入联系电话" /></el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="申请日期"><el-input :value="form.applyDate" disabled /></el-form-item>
          </el-col>
        </el-row>

        <template v-if="form.applyType === 'renew'">
          <el-divider content-position="left">续租信息</el-divider>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12">
              <el-form-item label="当前到期日" prop="currentExpireDate">
                <el-date-picker v-model="form.currentExpireDate" type="date" value-format="yyyy-MM-dd" placeholder="选择当前合同到期日" class="field-full" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="续租期限" prop="renewalPeriodMonths">
                <el-select v-model="form.renewalPeriodMonths" class="field-full" placeholder="请选择续租期限">
                  <el-option label="12 个月" :value="12" />
                  <el-option label="24 个月" :value="24" />
                  <el-option label="36 个月" :value="36" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="续租起始日" prop="renewalStartDate">
                <el-date-picker v-model="form.renewalStartDate" type="date" value-format="yyyy-MM-dd" placeholder="选择续租起始日" class="field-full" />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
        <template v-else-if="form.applyType === 'vacate'">
          <el-divider content-position="left">退租信息</el-divider>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12">
              <el-form-item label="计划退租日" prop="plannedVacateDate">
                <el-date-picker v-model="form.plannedVacateDate" type="date" value-format="yyyy-MM-dd" placeholder="选择计划退租日" class="field-full" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="交接负责人" prop="handoverPerson"><el-input v-model.trim="form.handoverPerson" placeholder="请输入交接负责人" /></el-form-item>
            </el-col>
          </el-row>
        </template>
        <template v-else>
          <el-divider content-position="left">扩租信息</el-divider>
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12">
              <el-form-item label="现租赁面积" prop="currentArea"><el-input v-model.trim="form.currentArea" type="number" placeholder="如：120" /></el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="拟扩租面积" prop="expansionArea"><el-input v-model.trim="form.expansionArea" type="number" placeholder="如：60" /></el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="期望启用日期" prop="expectedStartDate">
                <el-date-picker v-model="form.expectedStartDate" type="date" value-format="yyyy-MM-dd" placeholder="选择期望启用日期" class="field-full" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="意向位置"><el-input v-model.trim="form.intendedLocation" placeholder="可填写意向楼栋或区域" /></el-form-item>
            </el-col>
          </el-row>
        </template>
        <el-form-item :label="reasonLabel" prop="applicationReason">
          <el-input v-model.trim="form.applicationReason" type="textarea" :rows="4" maxlength="500" show-word-limit :placeholder="'请填写' + reasonLabel" />
        </el-form-item>
        <el-form-item label="补充说明"><el-input v-model.trim="form.remark" type="textarea" :rows="3" maxlength="300" show-word-limit placeholder="可补充说明特殊需求或交接安排" /></el-form-item>
        <el-form-item label="附件">
          <el-upload ref="leaseUpload" action="#" :auto-upload="false" :file-list="form.uploadFiles" :on-change="handleUploadChange" :on-remove="handleUploadRemove">
            <el-button size="small" type="primary" icon="el-icon-upload2">上传附件</el-button>
            <div slot="tip" class="el-upload__tip">支持上传相关证明材料，单个文件不超过 10MB。</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">提交申请</el-button>
      </span>
    </el-dialog>

    <el-drawer title="租赁申请详情" :visible.sync="detailVisible" size="500px" append-to-body custom-class="lease-detail-drawer">
      <div v-if="selectedRecord" v-loading="detailLoading" class="detail-wrap">
        <section class="detail-hero">
          <span :class="['type-icon', selectedRecord.applyType]"><i :class="typeIcon(selectedRecord.applyType)" /></span>
          <div>
            <small>{{ selectedRecord.id }}</small>
            <h3>{{ applyTypeText(selectedRecord.applyType) }}</h3>
            <p>{{ selectedRecord.companyName }}</p>
          </div>
          <el-tag :type="statusType(statusText(selectedRecord.status))">{{ statusText(selectedRecord.status) }}</el-tag>
        </section>
        <section class="detail-grid">
          <template v-for="field in detailFields">
            <span :key="field.key">
              <small>{{ field.label }}</small>
              <b>{{ selectedRecord[field.key] || '-' }}</b>
            </span>
          </template>
        </section>
        <section class="detail-section">
          <h4>{{ reasonLabelFor(selectedRecord.applyType) }}</h4>
          <p>{{ reasonValue(selectedRecord) || '-' }}</p>
        </section>
        <section v-if="selectedRecord.remark" class="detail-section">
          <h4>补充说明</h4>
          <p>{{ selectedRecord.remark }}</p>
        </section>
        <section v-if="detailUploadFiles.length" class="detail-section">
          <h4>附件</h4>
          <div class="detail-files">
            <el-button v-for="file in detailUploadFiles" :key="file.url || file.name" type="text" @click="openUploadFile(file)">
              <i class="el-icon-document" />
              {{ file.name }}
            </el-button>
          </div>
        </section>
        <section class="detail-section">
          <h4>处理进度</h4>
          <div class="progress-timeline">
            <article v-for="(step, index) in progressSteps" :key="step.key" :class="['progress-step', { done: step.done, active: step.active, rejected: step.rejected }]">
              <span class="progress-node">
                <i v-if="step.done" class="el-icon-check" />
                <b v-else>{{ index + 1 }}</b>
              </span>
              <div class="progress-content">
                <b>{{ step.title }}</b>
                <small>{{ step.note }}</small>
              </div>
            </article>
          </div>
        </section>
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

const auditTime = () => {
  const date = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const baseForm = () => ({
  applyType: 'renew',
  companyName: '',
  contractNo: '',
  currentLocation: '',
  currentArea: '',
  contactPerson: '',
  contactPhone: '',
  applyDate: now(),
  currentExpireDate: '',
  renewalPeriodMonths: '',
  renewalStartDate: '',
  plannedVacateDate: '',
  handoverPerson: '',
  expansionArea: '',
  expectedStartDate: '',
  intendedLocation: '',
  applicationReason: '',
  remark: '',
  uploadFiles: []
})

export default {
  name: 'LeaseApplication',
  data() {
    return {
      loading: false,
      submitting: false,
      detailLoading: false,
      formVisible: false,
      detailVisible: false,
      editingId: '',
      selectedRecord: null,
      typeFilter: '',
      statusFilter: '',
      currentPage: 1,
      pageSize: 4,
      total: 0,
      usingMock: false,
      statusOptions: ['待处理', '处理中', '已完成', '已驳回'],
      applicationTypes: [
        { label: '续租申请', value: 'renew', icon: 'el-icon-refresh-right' },
        { label: '退租申请', value: 'vacate', icon: 'el-icon-switch-button' },
        { label: '扩租申请', value: 'expand', icon: 'el-icon-full-screen' }
      ],
      form: baseForm(),
      records: []
    }
  },
  computed: {
    filteredRecords() {
      return this.records.filter((item) => (!this.typeFilter || item.applyType === this.typeFilter) && (!this.statusFilter || this.statusText(item.status) === this.statusFilter))
    },
    pagedRecords() {
      if (!this.usingMock) return this.filteredRecords
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredRecords.slice(start, start + this.pageSize)
    },
    paginationTotal() {
      return this.usingMock ? this.filteredRecords.length : this.total
    },
    detailUploadFiles() {
      return this.selectedRecord ? this.normalizeUploadFiles(this.selectedRecord.uploadFiles) : []
    },
    reasonLabel() {
      return this.reasonLabelFor(this.form.applyType)
    },
    detailFields() {
      const common = [
        { key: 'contractNo', label: '租赁合同编号' },
        { key: 'currentLocation', label: '现租赁位置' },
        { key: 'contactPerson', label: '联系人' },
        { key: 'contactPhone', label: '联系电话' },
        { key: 'applyDate', label: '申请日期' }
      ]
      const fields = {
        renew: [
          { key: 'currentExpireDate', label: '当前到期日' },
          { key: 'renewalPeriodMonths', label: '续租期限（月）' },
          { key: 'renewalStartDate', label: '续租起始日' }
        ],
        vacate: [
          { key: 'plannedVacateDate', label: '计划退租日' },
          { key: 'handoverPerson', label: '交接负责人' }
        ],
        expand: [
          { key: 'currentArea', label: '现租赁面积' },
          { key: 'expansionArea', label: '拟扩租面积' },
          { key: 'expectedStartDate', label: '期望启用日期' },
          { key: 'intendedLocation', label: '意向位置' }
        ]
      }
      return common.concat(fields[this.selectedRecord.applyType] || [])
    },
    progressSteps() {
      const record = this.selectedRecord || {}
      const status = this.statusText(record.status)
      const pending = status === '待处理'
      const processing = status === '处理中'
      const finished = !pending && !processing
      return [
        { key: 'submitted', title: '已提交', note: record.applyDate || record.itemCreateTime || '-', done: true, active: false },
        {
          key: 'processing',
          title: '园区处理',
          note: pending ? '等待园区工作人员受理' : processing ? '园区工作人员正在处理申请' : '申请已完成园区处理',
          done: finished,
          active: pending || processing
        },
        {
          key: 'result',
          title: pending || processing ? '处理结果' : status,
          note: pending || processing ? '处理完成后将展示最终结果' : record.itemUpdateTime || '处理状态已更新',
          done: finished,
          active: false,
          rejected: status === '已驳回'
        }
      ]
    },
    rules() {
      const required = ['applyType', 'companyName', 'contractNo', 'currentLocation', 'contactPerson', 'contactPhone', 'applicationReason']
      const fields = {
        renew: ['currentExpireDate', 'renewalPeriodMonths', 'renewalStartDate'],
        vacate: ['plannedVacateDate', 'handoverPerson'],
        expand: ['currentArea', 'expansionArea', 'expectedStartDate']
      }
      return required.concat(fields[this.form.applyType] || []).reduce((rules, key) => {
        rules[key] = [
          {
            required: true,
            message: `请${key === 'applyType' || key === 'renewalPeriodMonths' ? '选择' : '填写'}${this.fieldLabel(key)}`,
            trigger: key === 'applyType' || key === 'renewalPeriodMonths' ? 'change' : 'blur'
          }
        ]
        return rules
      }, {})
    }
  },
  created() {
    this.loadRecords()
  },
  watch: {
    typeFilter() {
      this.resetPage()
    },
    statusFilter() {
      this.resetPage()
    }
  },
  methods: {
    async loadRecords() {
      this.loading = true
      try {
        if (!this.$api || !this.$api['tobLeaseApplication.list']) throw new Error('API unavailable')
        const params = { pageNo: this.currentPage, pageSize: this.pageSize }
        params.type = 0
        if (this.typeFilter) params.applyType = this.typeFilter
        if (this.statusFilter) params.status = this.statusValue(this.statusFilter)
        const result = this.unwrapResponse(await this.$api['tobLeaseApplication.list'](params))
        const records = result.records || result.list || result.rows || result
        this.records = Array.isArray(records) ? records.map((item) => this.normalizeRecord(item)) : []
        this.total = Number(result.total || this.records.length)
        this.usingMock = false
      } catch (error) {
        this.records = this.mockRecords()
        this.total = this.records.length
        this.usingMock = true
      } finally {
        this.loading = false
      }
    },
    mockRecords() {
      return [
        {
          id: 'LA20260824001',
          applyType: 'renew',
          companyName: '淳通智惠科技有限公司',
          contractNo: 'CTZH-2024-018',
          currentLocation: 'A 座 501 室',
          contactPerson: '张女士',
          contactPhone: '138****2468',
          applyDate: '2026-08-22 10:30',
          currentExpireDate: '2026-09-30',
          renewalPeriodMonths: 24,
          renewalStartDate: '2026-10-01',
          applyReason: '经营稳定，申请续租现有办公场地。',
          status: '0'
        },
        {
          id: 'LA20260818002',
          applyType: 'expand',
          companyName: '星河数据服务有限公司',
          contractNo: 'XH-2025-006',
          currentLocation: 'B 座 803 室',
          contactPerson: '李先生',
          contactPhone: '139****9812',
          applyDate: '2026-08-18 15:20',
          currentArea: 180,
          expansionArea: 90,
          expectedStartDate: '2026-10-15',
          intendedLocation: 'B 座相邻楼层',
          expansionPurposeReason: '团队扩充，现有办公面积无法满足使用需求。',
          status: '0'
        },
        {
          id: 'LA20260726003',
          applyType: 'vacate',
          companyName: '新域创意设计工作室',
          contractNo: 'XY-2025-021',
          currentLocation: 'C 座 306 室',
          contactPerson: '王女士',
          contactPhone: '137****5226',
          applyDate: '2026-07-26 09:40',
          plannedVacateDate: '2026-08-31',
          handoverPerson: '王女士',
          vacateReason: '业务调整，申请按约定办理退租及场地交接。',
          status: '1',
          itemUpdateTime: '2026-08-02 14:20'
        }
      ]
    },
    openCreate() {
      this.editingId = ''
      this.form = baseForm()
      this.formVisible = true
      this.$nextTick(() => this.$refs.leaseForm && this.$refs.leaseForm.clearValidate())
    },
    resetPage() {
      this.currentPage = 1
      this.loadRecords()
    },
    handlePageChange(page) {
      this.currentPage = page
      if (!this.usingMock) this.loadRecords()
    },
    async openDetail(item) {
      this.selectedRecord = item
      this.detailVisible = true
      if (!this.$api || !this.$api['tobLeaseApplication.queryById']) return
      this.detailLoading = true
      try {
        const detail = this.unwrapResponse(await this.$api['tobLeaseApplication.queryById']({ id: item.id }))
        if (detail && !Array.isArray(detail)) this.selectedRecord = Object.assign({}, item, detail)
      } catch (error) {
        // 详情接口未就绪时保留列表数据，保证演示与查看流程可用。
      } finally {
        this.detailLoading = false
      }
    },
    canEditRecord(record) {
      const status = this.statusText(record && record.status)
      return !['已完成', '已驳回'].includes(status)
    },
    async openEdit(record) {
      if (!this.canEditRecord(record)) return
      let target = record
      if (this.$api && this.$api['tobLeaseApplication.queryById']) {
        try {
          const detail = this.unwrapResponse(await this.$api['tobLeaseApplication.queryById']({ id: record.id }))
          if (detail && !Array.isArray(detail)) target = Object.assign({}, record, this.normalizeRecord(detail))
        } catch (error) {
          this.$message.warning('申请详情加载失败，已展示基础信息')
        }
      }
      this.editingId = target.id
      this.form = Object.assign(baseForm(), target, {
        applicationReason: this.reasonValue(target),
        uploadFiles: this.normalizeUploadFiles(target.uploadFiles)
      })
      this.detailVisible = false
      this.formVisible = true
      this.$nextTick(() => this.$refs.leaseForm && this.$refs.leaseForm.clearValidate())
    },
    onTypeChange() {
      this.$nextTick(() => this.$refs.leaseForm && this.$refs.leaseForm.clearValidate())
    },
    async handleUploadChange(file, fileList) {
      if (!file.raw || file.url) {
        this.$set(this.form, 'uploadFiles', fileList)
        return
      }
      if (file.raw.size > 10 * 1024 * 1024) {
        this.$message.error('单个附件不能超过 10MB')
        this.$refs.leaseUpload && this.$refs.leaseUpload.handleRemove(file)
        return
      }
      if (!this.$api || !this.$api['attachment.upload']) {
        this.$message.error('未找到附件上传接口')
        this.$refs.leaseUpload && this.$refs.leaseUpload.handleRemove(file)
        return
      }
      try {
        const formData = new FormData()
        formData.append('thefile', file.raw)
        const response = this.unwrapResponse(await this.$api['attachment.upload'](formData))
        const uploaded = Array.isArray(response) ? response[0] || {} : response || {}
        const url = uploaded.url || uploaded.fileUrl || uploaded.filePath
        if (!url) throw new Error('missing upload url')
        const originalName = file.name || file.raw.name || uploaded.originalName || uploaded.originalFileName || uploaded.fileName
        Object.assign(file, { name: originalName, fileName: originalName, url, size: file.raw.size, status: 'success' })
        this.$set(this.form, 'uploadFiles', fileList)
      } catch (error) {
        this.$message.error('附件上传失败，请重试')
        this.$refs.leaseUpload && this.$refs.leaseUpload.handleRemove(file)
      }
    },
    handleUploadRemove(file, fileList) {
      this.$set(this.form, 'uploadFiles', fileList)
    },
    normalizeUploadFiles(files) {
      let list = files
      if (typeof list === 'string') {
        try {
          list = JSON.parse(list)
        } catch (error) {
          list = []
        }
      }
      if (!Array.isArray(list)) list = list ? [list] : []
      return list.filter(Boolean).map((item) => {
        const file = typeof item === 'string' ? { name: item, url: item } : item
        const url = file.url || file.fileUrl || file.filePath || ''
        const fallbackName = String(url).split('?')[0].split('/').pop()
        return {
          name: file.name || file.originalName || file.originalFileName || file.fileName || fallbackName || '未命名附件',
          fileName: file.name || file.originalName || file.originalFileName || file.fileName || fallbackName || '未命名附件',
          url,
          size: file.size || 0
        }
      })
    },
    openUploadFile(file) {
      if (file.url) window.open(file.url, '_blank', 'noopener,noreferrer')
      else this.$message.warning('该附件暂无访问地址')
    },
    resetForm() {
      this.form = baseForm()
      this.editingId = ''
      this.$nextTick(() => this.$refs.leaseForm && this.$refs.leaseForm.clearValidate())
    },
    async submitForm() {
      const valid = await this.$refs.leaseForm.validate().catch(() => false)
      if (!valid) return
      this.submitting = true
      const payload = this.buildSubmitPayload()
      const action = this.editingId ? 'edit' : 'add'
      try {
        if (this.$api && this.$api[`tobLeaseApplication.${action}`]) await this.$api[`tobLeaseApplication.${action}`](payload)
        else if (this.editingId) {
          const index = this.records.findIndex((item) => String(item.id) === String(this.editingId))
          if (index > -1) this.$set(this.records, index, Object.assign({}, this.records[index], payload))
        } else this.records.unshift(Object.assign({ id: `LA${Date.now()}` }, payload))
        this.$message.success(this.editingId ? '申请已更新' : '申请已提交，请等待园区处理')
        this.formVisible = false
        this.currentPage = 1
        if (this.$api && this.$api[`tobLeaseApplication.${action}`]) await this.loadRecords()
      } catch (error) {
        this.$message.error('提交失败，请稍后重试')
      } finally {
        this.submitting = false
      }
    },
    fieldLabel(key) {
      return (
        {
          applyType: '申请类型',
          companyName: '企业名称',
          contractNo: '租赁合同编号',
          currentLocation: '现租赁位置',
          contactPerson: '联系人',
          contactPhone: '联系电话',
          applicationReason: this.reasonLabel,
          currentExpireDate: '当前到期日',
          renewalPeriodMonths: '续租期限',
          renewalStartDate: '续租起始日',
          plannedVacateDate: '计划退租日',
          handoverPerson: '交接负责人',
          currentArea: '现租赁面积',
          expansionArea: '拟扩租面积',
          expectedStartDate: '期望启用日期'
        }[key] || key
      )
    },
    reasonLabelFor(type) {
      return type === 'vacate' ? '退租原因' : type === 'expand' ? '扩租用途及原因' : '续租原因'
    },
    typeIcon(type) {
      const item = this.applicationTypes.find((item) => item.value === type)
      return item ? item.icon : 'el-icon-office-building'
    },
    applyTypeText(type) {
      const item = this.applicationTypes.find((item) => item.value === type)
      return item ? item.label : type || '-'
    },
    statusText(status) {
      if (status === undefined || status === null || status === '' || String(status) === '0') return '待处理'
      if (String(status) === '1') return '已完成'
      if (String(status) === '2') return '已驳回'
      if (String(status) === '3') return '处理中'
      return status
    },
    statusValue(status) {
      return { 待处理: '0', 处理中: '3', 已完成: '1', 已驳回: '2' }[status] || status
    },
    reasonValue(record) {
      return record.applyReason || record.vacateReason || record.expansionPurposeReason || ''
    },
    normalizeRecord(record) {
      const item = Object.assign({}, record)
      if (item.applyType === '续租申请') item.applyType = 'renew'
      if (item.applyType === '退租申请') item.applyType = 'vacate'
      if (item.applyType === '扩租申请') item.applyType = 'expand'
      return item
    },
    currentUser() {
      const storeUser = this.$store && this.$store.getters && this.$store.getters.userInfo
      if (storeUser) return storeUser
      try {
        return JSON.parse(window.sessionStorage.getItem('userInfo') || '{}')
      } catch (error) {
        return {}
      }
    },
    currentUserId() {
      const user = this.currentUser()
      return user.id || user.userId || user.userCode || ''
    },
    buildSubmitPayload() {
      const payload = Object.assign({}, this.form)
      delete payload.applicationReason
      payload.uploadFiles = this.normalizeUploadFiles(payload.uploadFiles)
      payload.applyReason = this.form.applicationReason
      if (payload.applyType === 'vacate') payload.vacateReason = this.form.applicationReason
      if (payload.applyType === 'expand') payload.expansionPurposeReason = this.form.applicationReason
      ;['applyDate', 'currentExpireDate', 'renewalStartDate', 'plannedVacateDate', 'expectedStartDate'].forEach((key) => {
        if (payload[key]) payload[key] = this.formatDateTime(payload[key])
      })
      if (this.editingId) Object.assign(payload, { id: this.editingId, updateBy: this.currentUserId(), itemUpdateTime: auditTime() })
      else Object.assign(payload, { createBy: this.currentUserId(), itemCreateTime: auditTime() })
      return payload
    },
    formatDateTime(value) {
      const text = String(value).replace('T', ' ').trim()
      if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return `${text} 00:00:00`
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(text)) return `${text}:00`
      return text
    },
    statusType(status) {
      return { 待处理: 'warning', 已完成: 'success', 已驳回: 'danger' }[status] || 'info'
    },
    unwrapResponse(response) {
      if (response && response.result !== undefined) return response.result
      if (response && response.data && response.data.result !== undefined) return response.data.result
      return response && response.data !== undefined ? response.data : response
    }
  }
}
</script>

<style lang="scss" scoped>
.lease-application {
  min-height: 100%;
  padding: 20px 18px 34px;
  background: #f6f8fb;
  box-sizing: border-box;
  color: #263a55;
}
.application-surface {
  border: 1px solid #e5ebf2;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 4px 14px rgba(44, 69, 101, 0.035);
}
.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #edf1f5;
}
.list-toolbar .el-select {
  width: 130px;
}
.list-toolbar .el-button {
  margin-left: auto;
}
.record-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  padding: 18px 20px;
}
.record-card {
  min-width: 0;
  min-height: 248px;
  padding: 16px;
  border: 1px solid #e6ecf3;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.record-card:hover {
  border-color: #a9caf7;
}
.record-head,
.record-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.record-id {
  color: #7890aa;
  font-size: 12px;
}
.record-id i {
  color: #2e7cdf;
}
.record-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
}
.type-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #eaf3ff;
  color: #2f7cdf;
  font-size: 18px;
  flex: 0 0 auto;
}
.type-icon.vacate {
  background: #fff1e8;
  color: #dd8a32;
}
.type-icon.expand {
  background: #e9f8f0;
  color: #28a36b;
}
.record-title h3 {
  margin: 0;
  color: #354b68;
  font-size: 15px;
}
.record-title p {
  margin: 4px 0 0;
  overflow: hidden;
  color: #7d8da2;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.record-info {
  display: grid;
  gap: 7px;
  margin: 15px 0 11px;
  padding: 10px 0;
  border-top: 1px solid #eef2f6;
  border-bottom: 1px solid #eef2f6;
  color: #73859b;
  font-size: 12px;
}
.record-info i {
  margin-right: 5px;
  color: #9aacc1;
}
.record-reason {
  display: -webkit-box;
  min-height: 40px;
  margin: 0 0 12px;
  overflow: hidden;
  color: #50647c;
  font-size: 13px;
  line-height: 1.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.record-foot {
  color: #8997a8;
  font-size: 12px;
}
.pagination-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 20px 16px;
  border-top: 1px solid #eef2f6;
  color: #8996a6;
  font-size: 12px;
}
.dialog-tip {
  padding: 10px 12px;
  margin-bottom: 18px;
  border-radius: 5px;
  background: #f1f7ff;
  color: #6381a5;
  font-size: 13px;
}
.dialog-tip i {
  margin-right: 5px;
  color: #2f7cdf;
}
.field-full {
  width: 100%;
}
.type-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.type-selector ::v-deep .el-radio-button__inner {
  border-left: 1px solid #dcdfe6;
  border-radius: 4px !important;
  box-shadow: none;
}
.detail-wrap {
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
.detail-hero div {
  min-width: 0;
  flex: 1;
}
.detail-hero small,
.detail-hero p {
  color: #7d91aa;
  font-size: 12px;
}
.detail-hero h3 {
  margin: 3px 0;
  color: #294260;
  font-size: 16px;
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 14px;
  border-top: 1px solid #e4eaf1;
  border-left: 1px solid #e4eaf1;
}
.detail-grid span {
  min-height: 65px;
  padding: 11px;
  border-right: 1px solid #e4eaf1;
  border-bottom: 1px solid #e4eaf1;
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
.detail-files {
  display: flex;
  flex-direction: column;
  padding: 5px 12px;
  border-radius: 6px;
  background: #f7f9fc;
}
.detail-files .el-button {
  justify-content: flex-start;
  margin: 0;
  padding: 7px 0;
  text-align: left;
}
.detail-files .el-button + .el-button {
  border-top: 1px solid #e8edf3;
}
.progress-timeline {
  padding: 2px 2px 0;
}
.progress-step {
  position: relative;
  display: flex;
  gap: 11px;
  min-height: 54px;
}
.progress-step:not(:last-child)::after {
  position: absolute;
  top: 28px;
  bottom: 2px;
  left: 13px;
  width: 1px;
  background: #dfe7f0;
  content: '';
}
.progress-node {
  z-index: 1;
  display: inline-flex;
  width: 27px;
  height: 27px;
  align-items: center;
  justify-content: center;
  border: 1px solid #c5d1de;
  border-radius: 50%;
  background: #fff;
  color: #92a2b4;
  box-sizing: border-box;
  flex: 0 0 27px;
  font-size: 11px;
}
.progress-node b {
  font-size: 12px;
  line-height: 1;
}
.progress-content {
  min-width: 0;
  padding: 3px 0 15px;
}
.progress-content > b,
.progress-content > small {
  display: block;
}
.progress-content > b {
  color: #5b6d82;
  font-size: 13px;
  font-weight: 600;
}
.progress-content > small {
  margin-top: 5px;
  color: #92a0b0;
  font-size: 12px;
  line-height: 1.45;
}
.progress-step.done .progress-node {
  border-color: #67c23a;
  background: #f0f9eb;
  color: #67c23a;
}
.progress-step.done .progress-content > b {
  color: #4ba52b;
}
.progress-step.done:not(:last-child)::after {
  background: #b7dfaa;
}
.progress-step.active .progress-node {
  border-color: #409eff;
  background: #ecf5ff;
  color: #2f7cdf;
}
.progress-step.active .progress-content > b {
  color: #2f7cdf;
}
.progress-step.rejected .progress-node {
  border-color: #f56c6c;
  background: #fef0f0;
  color: #f56c6c;
}
.progress-step.rejected .progress-content > b {
  color: #e25757;
}
@media (max-width: 1200px) {
  .record-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 760px) {
  .lease-application {
    padding: 14px 12px 24px;
  }
  .list-toolbar {
    align-items: stretch;
    flex-direction: column;
  }
  .list-toolbar .el-select {
    width: 100%;
  }
  .list-toolbar .el-button {
    width: 100%;
    margin-left: 0;
  }
  .type-selector {
    display: grid;
    grid-template-columns: 1fr;
  }
  .record-grid {
    grid-template-columns: 1fr;
    padding: 12px;
  }
  .pagination-row {
    justify-content: center;
    padding: 12px;
  }
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<style lang="scss">
.lease-application-dialog {
  min-width: 760px;
}
.lease-application-dialog .el-dialog__header {
  border-bottom: 1px solid #e5e9ef;
}
.lease-application-dialog .el-dialog__body {
  max-height: calc(100vh - 180px);
  padding: 22px 32px;
  overflow-y: auto;
}
.lease-application-dialog .el-dialog__footer {
  border-top: 1px solid #e5e9ef;
}
@media (max-width: 760px) {
  .lease-application-dialog {
    width: 100% !important;
    min-width: 0;
    height: 100vh;
    margin: 0 !important;
    border-radius: 0;
    display: flex;
    flex-direction: column;
  }
  .lease-application-dialog .el-dialog__body {
    max-height: none;
    flex: 1;
    padding: 18px 16px;
  }
  .lease-application-dialog .el-form-item__label {
    float: none;
    display: block;
    width: auto !important;
    text-align: left;
  }
  .lease-application-dialog .el-form-item__content {
    margin-left: 0 !important;
  }
  .lease-detail-drawer {
    width: 100% !important;
  }
}
</style>
