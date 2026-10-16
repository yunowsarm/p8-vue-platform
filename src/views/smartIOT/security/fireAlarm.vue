<!-- 消防维保入口：五个工作区共享后端数据和关联规则。 -->
<template>
  <div v-loading="loading" class="fire-maintenance-page">
    <div v-if="loadError" class="maintenance-load-error" role="alert">
      <span>{{ loadError }}</span>
      <el-button size="mini" :disabled="loading || saving" @click="loadData">重新加载</el-button>
    </div>
    <section class="kpi-grid">
      <article v-for="item in kpis" :key="item.title" class="kpi-card">
        <i :class="[item.icon, 'kpi-icon', item.type]"></i>
        <div class="kpi-label">{{ item.title }}</div>
        <div class="kpi-number">
          {{ item.value }}
          <small>{{ item.unit }}</small>
        </div>
        <div class="kpi-sub">{{ item.sub }}</div>
      </article>
    </section>
    <iot-workspace-nav v-model="activeTab" :items="workspaceNav" aria-label="消防设备维保业务工作区" @change="handleWorkspaceChange" />
    <maintenance-overview
      v-show="activeTab === 'overview'"
      ref="overview"
      :category-stats="categoryStats"
      :month-progress="monthProgress"
      :reminders="reminders"
      :unplanned-count="devices.filter((item) => !nextPlan(item.id)).length"
      :record-count="records.length"
      @navigate="openWorkspace"
      @view-plan="viewPlan" />
    <section v-show="activeTab !== 'overview'" ref="workspaceContent" class="surface ledger-card workspace-detail" tabindex="-1">
      <div class="workspace-tabs">
        <device-ledger
          v-show="activeTab === 'devices'"
          ref="devices"
          :active="activeTab === 'devices'"
          :devices="devices"
          :device-types="deviceTypes"
          :refresh-options="refreshEditorOptions"
          :category-stats="categoryStats"
          :device-plans="devicePlans"
          :device-maintenance-status="deviceMaintenanceStatus"
          :has-history="deviceHasHistory"
          :page-size="pageSize"
          :saving="saving || loading"
          :blocked="!ready || !!loadError"
          :type-loading="typeLoading"
          :type-error="typeError"
          @size-change="pageSize = $event"
          @save-device="saveDevice"
          @add-type="addDeviceType"
          @load-types="loadTypes"
          @rename-type="renameDeviceType"
          @remove-type="removeDeviceType"
          @delete-device="deleteDevice"
          @schedule="scheduleDevice"
          @view-plan="viewPlan"
          @reload="loadData"
          @detail="openDeviceDetail" />
        <plan-list
          v-show="activeTab === 'plans'"
          ref="plans"
          :active="activeTab === 'plans'"
          :plans="plans"
          :devices="devices"
          :refresh-options="refreshEditorOptions"
          :device-plans="devicePlans"
          :page-size="pageSize"
          :saving="saving || loading"
          :blocked="!ready || !!loadError"
          @reload="loadData"
          @create-device="createDeviceFromPlan"
          @view-records="showPlanRecords"
          @size-change="pageSize = $event"
          @save-plan="savePlan"
          @delete-plan="deletePlan"
          @execute="executePlan" />
        <record-list
          v-show="activeTab === 'records'"
          ref="records"
          :active="activeTab === 'records'"
          :records="records"
          :devices="devices"
          :plans="plans"
          :page-size="pageSize"
          :saving="saving || loading"
          :blocked="!ready || !!loadError"
          @reload="loadData"
          @view-records="showPlanRecords"
          @size-change="pageSize = $event"
          @save-record="saveRecord"
          @detail="openRecordDetail" />
        <reminder-list
          v-show="activeTab === 'reminders'"
          ref="reminders"
          :active="activeTab === 'reminders'"
          :reminders="reminders"
          :page-size="pageSize"
          @size-change="pageSize = $event"
          @view-plan="viewPlan" />
      </div>
    </section>
    <el-drawer :title="drawerMode === 'device' ? '消防设备维保档案' : '维保记录详情'" :visible.sync="drawerVisible" size="500px" custom-class="maintenance-drawer">
      <div v-loading="detailLoading" class="drawer-scroll">
        <div v-if="detailError" class="empty-history">{{ detailError }}</div>
        <template v-if="currentRecord">
          <div class="drawer-hero">
            <div class="hero-icon"><i :class="drawerMode === 'device' ? 'el-icon-cpu' : 'el-icon-document-checked'"></i></div>
            <div>
              <h3>{{ drawerMode === 'device' ? currentRecord.name : currentRecord.recordName }}</h3>
              <p>{{ drawerMode === 'device' ? currentRecord.deviceCode : currentRecord.device }}</p>
            </div>
            <span :class="['status-pill', drawerMode === 'device' ? statusClass(deviceMaintenanceStatus(currentRecord)) : resultClass(currentRecord.status)]">
              {{ drawerMode === 'device' ? deviceMaintenanceStatus(currentRecord) : currentRecord.status || '未填写结果' }}
            </span>
          </div>
          <template v-if="drawerMode === 'device'">
            <div class="detail-grid">
              <div>
                <span>设备类型</span>
                <b>{{ currentRecord.category }}</b>
              </div>
              <div>
                <span>品牌 / 型号</span>
                <b>{{ currentRecord.brand || '—' }} / {{ currentRecord.model || '—' }}</b>
              </div>
              <div>
                <span>安装位置</span>
                <b>{{ currentRecord.installLocation || '—' }}</b>
              </div>
              <div>
                <span>最近待执行计划</span>
                <b>{{ nextPlan(currentRecord.id) ? nextPlan(currentRecord.id).name : '未安排计划' }}</b>
              </div>
              <div>
                <span>下次维保</span>
                <b>{{ nextPlan(currentRecord.id) ? nextPlan(currentRecord.id).plannedDate || '未设日期' : '未安排计划' }}</b>
              </div>
              <div>
                <span>安装日期</span>
                <b>{{ currentRecord.installDate || '—' }}</b>
              </div>
            </div>
            <div class="drawer-section-title">
              历史维保记录
              <small>{{ deviceHistory.length }} 条</small>
            </div>
            <div v-if="deviceHistory.length" class="history-list">
              <button v-for="item in deviceHistory" :key="item.id" type="button" @click="openRecordDetail(item, currentId)">
                <i :class="['history-mark', resultClass(item.status)]"></i>
                <span>
                  <b>{{ item.recordName }} · {{ item.status }}</b>
                  <small>{{ item.date || '未填日期' }} · {{ item.responsiblePerson || '未填负责人' }}</small>
                  <em>{{ item.remark }}</em>
                </span>
                <i class="el-icon-arrow-right"></i>
              </button>
            </div>
            <div v-else class="empty-history">暂无维保记录</div>
          </template>
          <template v-else>
            <div class="detail-grid">
              <div>
                <span>设备编号</span>
                <b>{{ currentRecord.deviceCode || '—' }}</b>
              </div>
              <div>
                <span>关联计划</span>
                <b>{{ currentPlanName }}</b>
              </div>
              <div>
                <span>实际养护日期</span>
                <b>{{ currentRecord.date || '—' }}</b>
              </div>
              <div>
                <span>计划负责人</span>
                <b>{{ currentRecord.responsiblePerson || '—' }}</b>
              </div>
              <div>
                <span>维保结果</span>
                <b>{{ currentRecord.status || '—' }}</b>
              </div>
            </div>
            <div class="drawer-section-title">备注</div>
            <p class="detail-description">{{ currentRecord.remark || '无' }}</p>
            <div class="drawer-section-title">
              附件
              <small>{{ currentRecord.uploadFiles.length }} 个</small>
            </div>
            <ul v-if="currentRecord.uploadFiles.length" class="record-attachment-list">
              <li v-for="(file, index) in currentRecord.uploadFiles" :key="file.id || index">
                <el-link
                  type="primary"
                  icon="el-icon-link"
                  :title="file.name || '附件' + (index + 1)"
                  role="link"
                  tabindex="0"
                  @click="downloadAttachment(file)"
                  @keydown.enter.native.prevent="downloadAttachment(file)">
                  {{ file.name || '附件' + (index + 1) }}
                </el-link>
              </li>
            </ul>
            <div v-else class="empty-history">暂无附件</div>
          </template>
        </template>
      </div>
      <div v-if="currentRecord || recordReturnDeviceId" class="drawer-actions">
        <el-button v-if="drawerMode === 'record' && recordReturnDeviceId" size="small" icon="el-icon-back" @click="backToDeviceDetail">返回设备档案</el-button>
        <el-button v-if="drawerMode === 'device' && currentRecord" size="small" :disabled="writeDisabled" @click="openDeviceDialog(currentRecord)">编辑设备</el-button>
        <el-button v-if="drawerMode === 'device' && currentRecord && nextPlan(currentRecord.id)" type="primary" size="small" @click="viewPlan(nextPlan(currentRecord.id).id)">查看计划</el-button>
        <el-button v-if="drawerMode === 'device' && currentRecord && !nextPlan(currentRecord.id)" type="primary" size="small" :disabled="writeDisabled" @click="scheduleDevice(currentRecord)">
          安排维保计划
        </el-button>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import IotWorkspaceNav from '../components/IotWorkspaceNav.vue'
import MaintenanceOverview from './fireAlarm/MaintenanceOverview.vue'
import DeviceLedger from './fireAlarm/DeviceLedger.vue'
import PlanList from './fireAlarm/PlanList.vue'
import RecordList from './fireAlarm/RecordList.vue'
import ReminderList from './fireAlarm/ReminderList.vue'
import {
  requestMaintenance,
  loadMaintenanceCollection,
  maintenanceDevicePayload,
  maintenancePlanPayload,
  maintenanceRecordPayload,
  normalizeMaintenanceData,
  maintenanceToday,
  maintenanceDueDays,
  fetchMaintenanceAttachment,
  isMaintenanceDate,
  maintenanceIntervalMonths,
  maintenanceMonthProgress,
  buildMaintenanceReminders
} from '@/service/maintenance'
const COLORS = ['#3281f7', '#20ad85', '#13a6bd', '#f5a11a', '#8065d9', '#ef5365']
export default {
  name: 'SmartIOTFireAlarm',
  components: { IotWorkspaceNav, MaintenanceOverview, DeviceLedger, PlanList, RecordList, ReminderList },
  data() {
    return {
      devices: [],
      deviceTypes: [],
      plans: [],
      records: [],
      activeTab: 'overview',
      pageSize: 10,
      loading: false,
      pendingLoads: 0,
      saving: false,
      ready: false,
      loadError: '',
      typeLoading: false,
      typeError: '',
      drawerVisible: false,
      drawerMode: 'device',
      currentId: '',
      recordReturnDeviceId: '',
      detailRecord: null,
      detailLoading: false,
      detailError: '',
      detailSequence: 0
    }
  },
  computed: {
    writeDisabled() {
      return this.loading || this.saving || !this.ready || !!this.loadError
    },
    categoryStats() {
      return this.deviceTypes.map((type, index) => {
        const devices = this.devices.filter((item) => item.typeId === type.id)
        return { ...type, total: devices.length, maintained: devices.filter((item) => this.nextPlan(item.id)).length, color: COLORS[index % COLORS.length] }
      })
    },
    monthProgress() {
      return maintenanceMonthProgress(this.plans)
    },
    kpis() {
      const covered = this.devices.filter((item) => this.nextPlan(item.id)).length
      return [
        { title: '消防设备', value: this.devices.length, unit: '台', sub: '共 ' + this.deviceTypes.length + ' 种设备类型', icon: 'el-icon-cpu', type: 'blue' },
        { title: '已安排计划', value: covered, unit: '台', sub: '关联待执行维保计划', icon: 'el-icon-circle-check', type: 'green' },
        { title: '待安排计划', value: this.devices.length - covered, unit: '台', sub: '请在计划管理中安排', icon: 'el-icon-date', type: 'orange' },
        { title: '逾期计划', value: this.reminders.filter((item) => item.overdueDays > 0).length, unit: '项', sub: '按待执行计划日期统计', icon: 'el-icon-warning-outline', type: 'red' },
        {
          title: '本月已维保',
          value: this.records.filter((item) => item.date.slice(0, 7) === maintenanceToday().slice(0, 7)).length,
          unit: '次',
          sub: '本月计划完成率 ' + this.monthProgress.percent + '%',
          icon: 'el-icon-finished',
          type: 'cyan'
        },
        { title: '不合格记录', value: this.records.filter((item) => item.status === '不合格').length, unit: '条', sub: '历史登记结果统计', icon: 'el-icon-document-delete', type: 'purple' }
      ]
    },
    reminders() {
      return buildMaintenanceReminders(this.plans, this.devices)
    },
    workspaceNav() {
      return [
        { key: 'overview', title: '维保总览', description: '分类、进度与到期', icon: 'el-icon-data-analysis', count: null },
        { key: 'devices', title: '设备台账', description: '设备档案与类型管理', icon: 'el-icon-cpu', count: this.devices.length },
        { key: 'plans', title: '维保计划', description: '设备、频率与执行', icon: 'el-icon-date', count: this.plans.length },
        { key: 'records', title: '维保记录', description: '结果、备注与附件', icon: 'el-icon-document-checked', count: this.records.length },
        { key: 'reminders', title: '到期提醒', description: '即将到期与逾期', icon: 'el-icon-alarm-clock', count: this.reminders.length, danger: this.reminders.some((item) => item.overdueDays >= 0) }
      ]
    },
    currentRecord() {
      return this.detailRecord
    },
    deviceHistory() {
      return this.records
        .filter((item) => item.deviceId === this.currentId)
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
    },
    currentPlanName() {
      const plan = this.currentRecord && this.plans.find((item) => item.id === this.currentRecord.planId)
      return plan ? plan.planName : '未关联或计划已移除'
    }
  },
  created() {
    this.loadData().then((loaded) => {
      if (loaded) this.openRoutePlan()
    })
  },
  watch: {
    '$route.query.planId'() {
      if (this.ready) this.openRoutePlan()
    }
  },
  activated() {
    if (this.ready) this.openRoutePlan()
  },
  methods: {
    async openRoutePlan() {
      const id = this.$route && this.$route.query && this.$route.query.planId
      if (typeof id !== 'string' || !id) return
      await this.$nextTick()
      await this.viewPlan(id)
    },
    async refreshResources(resources) {
      // 类型弹窗、编辑候选和保存后刷新共用一个队列，避免较早的响应覆盖刚保存的数据。
      const previous = this._maintenanceRefresh || Promise.resolve()
      const task = previous
        .catch(() => {})
        .then(async () => {
          const results = await Promise.allSettled(resources.map((resource) => loadMaintenanceCollection(this.$api, resource)))
          const failed = results.filter((item) => item.status === 'rejected')
          if (failed.length) throw failed[0].reason
          const collections = { deviceType: this.deviceTypes, device: this.devices, plan: this.plans, record: this.records }
          resources.forEach((resource, index) => {
            collections[resource] = results[index].value
          })
          Object.assign(this, normalizeMaintenanceData(collections.deviceType, collections.device, collections.plan, collections.record))
        })
      this._maintenanceRefresh = task
      try {
        await task
      } finally {
        if (this._maintenanceRefresh === task) this._maintenanceRefresh = null
      }
    },
    async loadTypes() {
      if (this.typeLoading) return false
      this.typeLoading = true
      this.typeError = ''
      try {
        await this.refreshResources(['deviceType'])
        return true
      } catch (error) {
        this.typeError = error.message || '设备类型加载失败，请重试'
        return false
      } finally {
        this.typeLoading = false
      }
    },
    async loadData(resources) {
      const selected = Array.isArray(resources) ? resources : ['deviceType', 'device', 'plan', 'record']
      this.pendingLoads++
      this.loading = true
      try {
        await this.refreshResources(selected)
        this.ready = true
        this.loadError = ''
        return true
      } catch (error) {
        this.loadError = error.message || '养护数据加载失败，请重新加载'
        return false
      } finally {
        this.pendingLoads--
        this.loading = this.pendingLoads > 0
      }
    },
    refreshEditorOptions(resource) {
      return this.loadData(resource === 'device' ? ['deviceType'] : ['deviceType', 'device', 'plan', 'record'])
    },
    devicePlans(id, excludedId) {
      return this.plans
        .filter((item) => item.deviceId === id && item.id !== excludedId)
        .slice()
        .sort((a, b) => (a.plannedDate || '9999').localeCompare(b.plannedDate || '9999') || a.id.localeCompare(b.id))
    },
    nextPlan(id) {
      return this.devicePlans(id)[0] || null
    },
    deviceHasHistory(id) {
      return this.plans.some((item) => item.deviceId === id) || this.records.some((item) => item.deviceId === id)
    },
    deviceMaintenanceStatus(device) {
      const plan = this.nextPlan(device.id)
      if (!plan) return '未安排计划'
      if (!maintenanceIntervalMonths(plan.frequency)) return '待设置周期'
      const days = maintenanceDueDays(plan.plannedDate)
      return days == null ? '待定日期' : days > 0 ? '已逾期' : days === 0 ? '今日到期' : days >= -plan.advanceDays ? '即将到期' : '已安排'
    },
    openWorkspace(view) {
      if (!this.workspaceNav.some((item) => item.key === view)) return
      this.activeTab = view
      return this.handleWorkspaceChange()
    },
    handleWorkspaceChange() {
      this.$nextTick(() => {
        const view = this.activeTab === 'overview' ? this.$refs.overview : this.$refs.workspaceContent
        const content = view && (view.$el || view)
        if (content && typeof content.focus === 'function') content.focus({ preventScroll: true })
      })
      if (this.ready && !this.saving && !this.loading) {
        const resources = { devices: ['deviceType', 'device', 'plan', 'record'], plans: ['device', 'plan', 'record'], records: ['device', 'plan', 'record'], reminders: ['device', 'plan', 'record'] }
        return this.loadData(resources[this.activeTab])
      }
    },
    async viewPlan(id) {
      if (!this.plans.some((item) => item.id === id)) return this.$message.warning('关联计划不存在，请重新加载')
      this.drawerVisible = false
      await this.openWorkspace('plans')
      if (!this.plans.some((item) => item.id === id)) return this.$message.warning('关联计划已移除')
      this.$refs.plans.focusPlan(id)
    },
    openDeviceDialog(row) {
      this.$refs.devices.openDeviceDialog(row)
    },
    async createDeviceFromPlan() {
      await this.openWorkspace('devices')
      if (!this.writeDisabled) await this.$refs.devices.openDeviceDialog()
    },
    async scheduleDevice(device) {
      await this.openWorkspace('plans')
      if (this.writeDisabled) return
      const existing = this.nextPlan(device.id)
      if (existing) this.$refs.plans.focusPlan(existing.id)
      else await this.$refs.plans.openPlanDialog(null, device.id)
      this.drawerVisible = false
    },
    async showPlanRecords(plan) {
      const id = typeof plan === 'string' ? plan : plan.id
      await this.openWorkspace('records')
      this.$refs.records.focusPlanRecords(id)
    },
    async loadDetail(resource, id, fromDeviceId = '') {
      const sequence = ++this.detailSequence
      this.drawerMode = resource === 'device' ? 'device' : 'record'
      this.currentId = id
      this.recordReturnDeviceId = fromDeviceId
      this.detailRecord = null
      this.detailError = ''
      this.detailLoading = true
      this.drawerVisible = true
      try {
        const value = await requestMaintenance(this.$api, resource, 'queryById', { id })
        if (!value || !value.id) throw new Error('详情不存在')
        if (sequence !== this.detailSequence) return
        const data =
          resource === 'device' ? normalizeMaintenanceData(this.deviceTypes, [value], [], []).devices[0] : normalizeMaintenanceData(this.deviceTypes, this.devices, this.plans, [value]).records[0]
        this.detailRecord = data
        if (resource === 'device') {
          const index = this.devices.findIndex((item) => item.id === id)
          if (index >= 0) this.$set(this.devices, index, data)
        }
      } catch (error) {
        if (sequence === this.detailSequence) this.detailError = error.message || '详情加载失败'
      } finally {
        if (sequence === this.detailSequence) this.detailLoading = false
      }
    },
    openDeviceDetail(row) {
      return this.loadDetail('device', row.id)
    },
    openRecordDetail(row, fromDeviceId = '') {
      return this.loadDetail('record', row.id, typeof fromDeviceId === 'string' ? fromDeviceId : '')
    },
    backToDeviceDetail() {
      const device = this.devices.find((item) => item.id === this.recordReturnDeviceId)
      if (device) this.openDeviceDetail(device)
      else this.$message.warning('原设备已移除')
    },
    async persist(resource, action, payload, onSaved) {
      if (this.writeDisabled) return
      this.saving = true
      let committed = false
      try {
        await requestMaintenance(this.$api, resource, action, payload)
        committed = true
        if (onSaved) onSaved()
        const refreshed = resource === 'deviceType' ? await this.loadTypes() : await this.loadData([resource])
        if (refreshed) this.$message.success(action === 'delete' ? '删除成功' : '保存成功')
        else this.$message.warning('操作已成功，但列表刷新失败，请重新加载；无需重复提交')
      } catch (error) {
        if (committed) {
          this.loadError = '数据已保存，但页面同步失败，请重新加载核对'
          this.$message.warning('操作已成功，但页面同步失败；请重新加载，无需重复提交')
        } else this.$message.error(error.message || '操作失败，请稍后重试')
      } finally {
        this.saving = false
      }
    },
    saveDevice(form) {
      return this.persist('device', form.id ? 'edit' : 'add', maintenanceDevicePayload(form), () => {
        this.$refs.devices.closeDeviceDialog()
        if (this.drawerMode === 'device' && this.currentId === form.id) this.drawerVisible = false
      })
    },
    async savePlan(form) {
      if (this.writeDisabled) return
      if (!(await this.loadData(['device', 'plan', 'record']))) return
      if (!this.devices.some((item) => item.id === form.deviceId)) return this.$message.warning('请选择台账中存在的设备')
      if (!isMaintenanceDate(form.planDate)) return this.$message.warning('请设置有效的第一次维保时间')
      if (!maintenanceIntervalMonths(form.frequency)) return this.$message.warning('请选择有效的养护频率')
      const current = form.id && this.plans.find((item) => item.id === form.id)
      if (form.id && !current) return this.$message.warning('计划已移除，请关闭弹窗并刷新后重试')
      // 旧数据可能已有多个计划，允许原设备上的资料编辑，但不再新增重复关联。
      if ((!current || current.deviceId !== form.deviceId) && this.devicePlans(form.deviceId, form.id).length) return this.$message.warning('该设备已有维保计划，请查看或编辑已有计划，不能重复安排')
      if (
        current &&
        current.recordCount > 0 &&
        (current.deviceId !== form.deviceId ||
          (isMaintenanceDate(current.firstMaintenanceDate) && current.firstMaintenanceDate !== form.planDate) ||
          (maintenanceIntervalMonths(current.frequency) && maintenanceIntervalMonths(current.frequency) !== maintenanceIntervalMonths(form.frequency)))
      )
        return this.$message.warning('已有维保记录，不能修改设备、首次时间或周期，以免影响历史安排')
      return this.persist('plan', form.id ? 'edit' : 'add', maintenancePlanPayload(form), () => this.$refs.plans.closePlanDialog())
    },
    async saveRecord(form) {
      if (this.writeDisabled) return
      // 登记弹窗可能打开很久，提交前核对最新记录，避免按旧状态再次登记。
      if (!(await this.loadData(['device', 'plan', 'record']))) return
      const plan = this.plans.find((item) => item.id === form.planId)
      if (!plan || plan.deviceId !== form.deviceId || !['合格', '不合格'].includes(form.status)) return this.$message.warning('计划或维保结果无效，请重新打开登记')
      if (plan.cycleNo !== form.cycleNo || plan.plannedDate !== form.scheduledDate) return this.$message.warning('本期已登记或计划已变更，请核对记录后重新进入登记')
      if (!plan.canRegister) return this.$message.warning('本次维保时间前7天开放登记，到期及逾期仍可登记；请核对本期时间和周期')
      if (!(form.recordName || '').trim()) return this.$message.warning('请输入记录名称')
      if (!isMaintenanceDate(form.actualDate) || form.actualDate > maintenanceToday()) return this.$message.warning('实际养护日期无效或晚于今天')
      if (form.status === '不合格' && !(form.remark || '').trim()) return this.$message.warning('不合格时请填写问题及处理说明')
      return this.persist(
        'record',
        'add',
        maintenanceRecordPayload({
          ...form,
          recordName: form.recordName.trim(),
          responsiblePerson: plan.responsiblePerson || ''
        }),
        () => {
          this.$refs.records.closeRecordDialog()
        }
      )
    },
    addDeviceType(name) {
      return this.persist('deviceType', 'add', { name }, () => {
        this.$refs.devices.newTypeName = ''
      })
    },
    async renameDeviceType(type) {
      if (this.writeDisabled) return
      try {
        const { value } = await this.$prompt('请输入新的设备类型名称', '重命名设备类型', {
          inputValue: type.name,
          inputValidator: (value) => {
            const next = (value || '').trim()
            return !next ? '请输入类型名称' : next.length > 30 ? '最多30个字' : this.deviceTypes.some((item) => item.id !== type.id && item.name === next) ? '类型名称已存在' : true
          }
        })
        if (value.trim() !== type.name) await this.persist('deviceType', 'edit', { id: type.id, name: value.trim() })
      } catch (error) {
        if (error !== 'cancel' && error !== 'close') this.$message.error(error.message || '修改失败')
      }
    },
    async confirmDelete(resource, row, label) {
      if (this.writeDisabled) return
      try {
        await this.$confirm('确定删除“' + label + '”？', '删除确认', { type: 'warning' })
        await this.persist(resource, 'delete', { id: row.id }, () => {
          this.drawerVisible = false
        })
      } catch (error) {
        if (error !== 'cancel' && error !== 'close') this.$message.error(error.message || '删除失败')
      }
    },
    removeDeviceType(type) {
      if (this.devices.some((item) => item.typeId === type.id)) return this.$message.warning('该类型下已有设备，不能删除')
      return this.confirmDelete('deviceType', type, type.name)
    },
    deleteDevice(device) {
      if (this.plans.some((item) => item.deviceId === device.id) || this.records.some((item) => item.deviceId === device.id)) return this.$message.warning('该设备已关联计划或历史记录，请保留设备档案')
      return this.confirmDelete('device', device, device.name)
    },
    deletePlan(plan) {
      if (plan.recordCount > 0) return this.$message.warning('已登记计划需保留历史')
      return this.confirmDelete('plan', plan, plan.planName)
    },
    async executePlan(plan) {
      if (this.writeDisabled) return
      if (!(await this.loadData(['device', 'plan', 'record']))) return
      await this.$nextTick()
      const current = this.plans.find((item) => item.id === plan.id)
      const device = current && this.devices.find((item) => item.id === current.deviceId)
      if (!device) return this.$message.warning('计划或设备不存在')
      if (!isMaintenanceDate(current.plannedDate)) return this.$message.warning('请先编辑计划，补齐第一次维保时间及养护频率')
      if (!current.canRegister) return this.$message.info('本次维保时间为' + current.plannedDate + '，提前7天开放登记，到期及逾期仍可登记')
      this.$refs.records.openRecordDialog(device, current)
    },
    statusClass(status) {
      return /逾期/.test(status) ? 'danger' : /今日|即将/.test(status) ? 'warning' : 'info'
    },
    resultClass(result) {
      return result === '合格' ? 'success' : result === '不合格' ? 'danger' : 'info'
    },
    async downloadAttachment(file) {
      try {
        if (file.id && this.$api['attachment.download']) {
          const blob = await fetchMaintenanceAttachment(this.$api, file.id)
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = file.name || '附件'
          link.click()
          setTimeout(() => URL.revokeObjectURL(url), 1000)
        } else {
          const url = new URL(file.url || '', window.location.href)
          if (!file.url || !['http:', 'https:'].includes(url.protocol)) throw new Error('附件缺少有效下载地址')
          window.open(url.href, '_blank', 'noopener,noreferrer')
        }
      } catch (error) {
        this.$message.error(error.message || '附件下载失败')
      }
    }
  }
}
</script>

<style lang="scss">
.fire-maintenance-page .maintenance-load-error {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding: 10px 14px;
  border: 1px solid #f3d1d4;
  border-radius: 7px;
  color: #bd414a;
  background: #fff1f2;
}

.maintenance-drawer .drawer-scroll {
  min-height: 140px;
}

// 弹窗挂在 body 下，跨工作区登记时也能正常显示，并沿用页面字体与配色。
.fire-maintenance-dialog {
  --primary: #2f78d7;
  --text: #1e2c42;
  --muted: #8793a6;
  --line: #e5eaf1;
  --iot-font-caption: 11px;
  --iot-font-secondary: 12px;
  --iot-font-body: 13px;
  --iot-font-title: 15px;
  font-size: var(--iot-font-body);
  line-height: 1.5;
}
// 仅作用于消防维保页面；下拉框挂在 body 下，单独使用专属类名。

.fire-plan-device-options .el-select-dropdown__item {
  height: auto;
  min-height: 54px;
  padding-top: 8px;
  padding-bottom: 8px;
  line-height: 20px;
}
.fire-plan-device-options .plan-device-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.fire-plan-device-options .plan-device-option small {
  display: block;
  color: #8793a6;
  font-size: 11px;
}

.fire-maintenance-page {
  --iot-font-caption: 11px;
  --iot-font-secondary: 12px;
  --iot-font-body: 13px;
  --iot-font-title: 15px;
  --iot-font-page-title: 24px;
  font-size: var(--iot-font-body);
  line-height: 1.5;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .page-header h2 {
  font-size: var(--iot-font-page-title) !important;
  line-height: 34px !important;
}
:is(.fire-maintenance-page, .fire-maintenance-dialog) .page-header p,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .page-subtitle {
  font-size: var(--iot-font-body) !important;
  line-height: 20px !important;
}
:is(.fire-maintenance-page, .fire-maintenance-dialog) .surface-title,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .surface-head h3,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .panel-title {
  font-size: var(--iot-font-title) !important;
  line-height: 22px !important;
}
:is(.fire-maintenance-page, .fire-maintenance-dialog) .kpi-label,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .kpi-title,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .item-name {
  font-size: var(--iot-font-body) !important;
}
:is(.fire-maintenance-page, .fire-maintenance-dialog) .kpi-sub,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .surface-subtitle,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .surface-head p,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .toolbar-note,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .head-note,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .muted,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .item-meta {
  font-size: var(--iot-font-secondary) !important;
  line-height: 18px !important;
}
:is(.fire-maintenance-page, .fire-maintenance-dialog) .surface-meta,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .map-legend,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .rail-title,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .summary-title,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .task-card-meta,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .task-current,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .alarm-time,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .zone-info {
  font-size: var(--iot-font-secondary) !important;
}
:is(.fire-maintenance-page, .fire-maintenance-dialog) .status-pill,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .level-pill,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .method-pill,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .tab-count,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .reminder-status,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .date-box,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .mini-tag {
  font-size: var(--iot-font-caption) !important;
}
:is(.fire-maintenance-page, .fire-maintenance-dialog) small {
  font-size: var(--iot-font-caption) !important;
  line-height: 1.45 !important;
}
:is(.fire-maintenance-page, .fire-maintenance-dialog) button:not(.el-button) {
  font-size: var(--iot-font-secondary);
}
:is(.fire-maintenance-page, .fire-maintenance-dialog) .el-table {
  font-size: var(--iot-font-body);
}
:is(.fire-maintenance-page, .fire-maintenance-dialog) .el-table th {
  font-size: var(--iot-font-body);
}
:is(.fire-maintenance-page, .fire-maintenance-dialog) .el-table th,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .el-table td {
  padding-top: 9px;
  padding-bottom: 9px;
}
:is(.fire-maintenance-page, .fire-maintenance-dialog) .el-input__inner,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .el-textarea__inner,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .el-form-item__label,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .el-radio__label,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .el-checkbox__label,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .el-button--small,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .el-button--mini,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .el-tag {
  font-size: var(--iot-font-body);
}
:is(.fire-maintenance-page, .fire-maintenance-dialog) .el-pagination,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .el-pagination button,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .el-pager li {
  font-size: var(--iot-font-body);
}
:is(.fire-maintenance-page, .fire-maintenance-dialog) .el-input__inner {
  min-height: 34px;
}

@media (max-width: 760px) {
  .fire-maintenance-page {
    --iot-font-caption: 11px;
    --iot-font-secondary: 12px;
    --iot-font-body: 13px;
    --iot-font-title: 15px;
    --iot-font-page-title: 22px;
  }
}
.fire-maintenance-page {
  --iot-overview-height: clamp(430px, calc(100vh - 430px), 720px);
  --iot-overview-height: clamp(430px, calc(100dvh - 430px), 720px);
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .workspace-detail {
  margin-top: 0;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .workspace-detail > .iot-workspace-header {
  margin: 0 -16px;
}

@media (min-width: 1451px) {
  .fire-maintenance-page {
    --iot-overview-height: clamp(460px, calc(100vh - 330px), 720px);
    --iot-overview-height: clamp(460px, calc(100dvh - 330px), 720px);
  }
}
.fire-maintenance-page {
  --primary: #2f78d7;
  --green: #20a77a;
  --amber: #e79a27;
  --red: #e4545c;
  --text: #1e2c42;
  --muted: #8793a6;
  --line: #e5eaf1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 16px;
  color: var(--text);
  background: #f4f7fb;
  box-sizing: border-box;
  overflow: hidden;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) * {
  box-sizing: border-box;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .title-row h2 {
  margin: 0;
  font-size: 22px;
  line-height: 30px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .page-header p {
  margin: 3px 0 0;
  color: #7c899d;
  font-size: 12px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .scope-badge {
  display: inline-flex;
  height: 24px;
  align-items: center;
  gap: 5px;
  padding: 0 9px;
  color: #177f5f;
  background: #e9f7f1;
  border: 1px solid #c8eadf;
  border-radius: 12px;
  font-size: 11px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .toolbar,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .toolbar-left,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
  flex-shrink: 0;
  margin-top: 0;
  margin-bottom: 12px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .kpi-card {
  position: relative;
  min-height: 92px;
  padding: 14px 12px 12px 51px;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 7px;
  box-shadow: 0 2px 8px rgba(30, 49, 79, 0.035);
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .kpi-icon {
  position: absolute;
  left: 13px;
  top: 17px;
  display: flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  color: #2f78d7;
  background: #edf4ff;
  border-radius: 8px;
  font-size: 16px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .kpi-icon.green {
  color: #16946b;
  background: #e9f8f2;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .kpi-icon.orange {
  color: #dd891d;
  background: #fff4e5;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .kpi-icon.red {
  color: #df4b54;
  background: #ffedef;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .kpi-icon.cyan {
  color: #1095a1;
  background: #e9f8fa;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .kpi-icon.purple {
  color: #7257ce;
  background: #f2effd;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .kpi-label {
  color: #758198;
  font-size: 12px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .kpi-number {
  margin-top: 3px;
  color: #17253b;
  font-size: 23px;
  line-height: 28px;
  font-weight: 700;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .kpi-number small {
  margin-left: 4px;
  color: #77849a;
  font-size: 11px;
  font-weight: 400;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .kpi-sub {
  margin-top: 2px;
  color: #99a3b3;
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .ledger-card {
  padding: 0 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) > .iot-workspace-nav,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .ledger-card > .iot-workspace-header {
  flex-shrink: 0;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) > .iot-workspace-nav .workspace-item.active {
  box-shadow: none;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .workspace-tabs {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .workspace-tabs .el-table {
  flex: 1;
  min-height: 0;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .workspace-tabs .toolbar,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .workspace-tabs .pagination-row {
  flex-shrink: 0;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .workspace-tabs .toolbar {
  padding: 12px 0;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .action-wrapper {
  display: inline-flex;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .maintenance-actions-column > .cell {
  display: flex;
  align-items: center;
  gap: 14px;
  white-space: nowrap;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .maintenance-actions-column > .cell > .el-button {
  margin: 0;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .muted-text {
  color: #97a2b2;
  font-size: 12px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .plan-date {
  color: var(--primary);
  cursor: default;
  font-variant-numeric: tabular-nums;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .type-create {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .ledger-card.workspace-detail > .iot-workspace-header {
  margin: 0 -14px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .toolbar {
  display: flex;
  justify-content: space-between;
  min-height: 49px;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .toolbar-left,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .toolbar-right {
  min-height: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .toolbar-note {
  display: inline-flex;
  min-height: 32px;
  align-items: center;
  gap: 4px;
  color: #8995a7;
  font-size: 10px;
  line-height: 18px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .toolbar-note i {
  color: #3c81d9;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .toolbar .el-input__inner {
  height: 32px;
  line-height: 32px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .toolbar .el-button--small {
  display: inline-flex;
  height: 32px;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .toolbar .el-button--small span {
  display: inline-flex;
  align-items: center;
  line-height: 1;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .pagination-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 64px;
  padding: 12px 0;
  border-top: 1px solid var(--line);
  background: #fff;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .pagination-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--muted);
  font-size: 12px;
  white-space: nowrap;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .pagination-summary b {
  margin: 0 3px;
  color: var(--text);
  font-weight: 600;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .pagination-row .el-pagination {
  display: flex;
  align-items: center;
  padding: 0;
  white-space: nowrap;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .pagination-row .el-pagination .el-input__inner {
  height: 32px;
  min-height: 32px;
  line-height: 32px;
  border-color: var(--line);
  border-radius: 6px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .pagination-row .el-pagination__sizes {
  height: 32px;
  margin: 0 12px 0 0;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .pagination-row .el-pagination__jump {
  height: 32px;
  margin-left: 12px;
  color: #758198;
  line-height: 32px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .pagination-row .el-pagination__editor {
  height: 32px;
  padding: 0;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .pagination-row .el-pagination.is-background .el-pager li,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .pagination-row .el-pagination.is-background .btn-prev,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .pagination-row .el-pagination.is-background .btn-next {
  min-width: 32px;
  height: 32px;
  margin: 0 4px;
  color: #607089;
  background: #f3f6fa;
  border-radius: 6px;
  line-height: 32px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .pagination-row .el-pagination.is-background .el-pager li:not(.disabled).active {
  color: #fff;
  background: var(--primary);
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .pagination-row .el-pagination.is-background button:disabled {
  color: #bcc5d2;
  background: #f8fafc;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .status-pill,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .result-pill {
  display: inline-flex;
  height: 21px;
  align-items: center;
  padding: 0 8px;
  border-radius: 11px;
  white-space: nowrap;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .status-pill.success,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .result-pill.success {
  color: #158660;
  background: #e8f7f1;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .status-pill.warning,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .result-pill.warning {
  color: #d47b16;
  background: #fff2df;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .status-pill.danger,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .result-pill.danger {
  color: #dc414a;
  background: #ffebed;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .status-pill.info {
  color: #68758a;
  background: #edf1f5;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .evidence-link {
  color: #2f78d7;
  font-size: 10px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .evidence-link i {
  margin-right: 4px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .table-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .table-progress .el-progress {
  flex: 1;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .table-progress span {
  width: 34px;
  color: #748198;
  font-size: 9px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .reminder-tip {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 11px;
  padding: 10px 12px;
  color: #51708d;
  background: #f1f7fd;
  border: 1px solid #dcebf9;
  border-radius: 5px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .reminder-tip > i {
  color: #2f78d7;
  font-size: 20px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .reminder-tip > div {
  flex: 1;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .reminder-tip b,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .reminder-tip span {
  display: block;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .reminder-tip b {
  color: #315172;
  font-size: 11px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .reminder-tip span {
  margin-top: 3px;
  font-size: 9px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .urgency-mark {
  display: inline-flex;
  align-items: center;
  color: #d38520;
  font-size: 9px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .urgency-mark i {
  width: 6px;
  height: 6px;
  margin-right: 5px;
  background: #e4a13e;
  border-radius: 50%;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .urgency-mark.danger {
  color: #db414a;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .urgency-mark.danger i {
  background: #e4545c;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .urgency-mark.today {
  color: #d77b17;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .urgency-mark.today i {
  background: #ec9b29;
}

.fire-maintenance-dialog .el-dialog__body {
  max-height: 66vh;
  padding: 18px 22px 8px;
  overflow-y: auto;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .dialog-intro {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
  padding: 10px 12px;
  color: #58718f;
  background: #f2f7fd;
  border-radius: 4px;
  font-size: 11px;
  line-height: 18px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .dialog-intro i {
  margin-top: 2px;
  color: #3c83dc;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .form-section-title {
  margin: 14px 0 11px;
  color: #33445d;
  font-size: 12px;
  font-weight: 700;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .form-section-title::before {
  display: inline-block;
  width: 3px;
  height: 12px;
  margin-right: 6px;
  vertical-align: -2px;
  background: #3b80d8;
  border-radius: 2px;
  content: '';
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .template-preview {
  display: flex;
  min-height: 55px;
  align-items: flex-start;
  gap: 6px;
  flex-wrap: wrap;
  padding: 9px;
  background: #f8fafc;
  border: 1px solid #e5eaf0;
  border-radius: 4px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .template-preview span {
  padding: 3px 7px;
  color: #52708f;
  background: #eef5fd;
  border-radius: 10px;
  font-size: 9px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .template-preview span i {
  margin-right: 3px;
  color: #279774;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .template-preview small {
  color: #9aa4b4;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .device-summary {
  clear: both;
  display: grid;
  grid-template-columns: minmax(120px, 0.8fr) minmax(0, 1.7fr) minmax(110px, 0.7fr);
  gap: 8px;
  width: calc(100% - 105px);
  min-width: 0;
  margin: 4px 0 16px 105px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .device-summary span {
  min-width: 0;
  padding: 10px 12px;
  background: #f7f9fc;
  border: 1px solid #e9eef5;
  border-radius: 6px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .device-summary small,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .device-summary b {
  display: block;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .device-summary small {
  color: #7d899b;
  font-size: 11px;
  line-height: 1.4;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .device-summary b {
  margin-top: 4px;
  color: #40516a;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .checklist-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 0 0 14px 105px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .checklist-grid .el-checkbox {
  width: auto;
  margin: 0;
  padding: 8px 10px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .checklist-grid .el-checkbox.is-bordered + .el-checkbox.is-bordered {
  margin-left: 0;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .checklist-grid .el-checkbox__label {
  padding-left: 6px;
  font-size: 10px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .checklist-empty {
  margin: 0 0 14px 105px;
  padding: 18px;
  color: #9aa4b3;
  text-align: center;
  background: #f8fafc;
  border-radius: 4px;
  font-size: 10px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .evidence-uploader {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .evidence-uploader > button {
  display: flex;
  width: 112px;
  height: 58px;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-direction: column;
  color: #5279a7;
  background: #f4f8fd;
  border: 1px dashed #a9c4e4;
  border-radius: 5px;
  cursor: pointer;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .evidence-uploader > button:hover {
  color: #2d72cc;
  border-color: #4385d7;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .evidence-uploader > button i {
  font-size: 17px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .evidence-uploader > button span {
  font-size: 9px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .evidence-chip {
  position: relative;
  display: flex;
  width: 112px;
  height: 58px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #5b6b80;
  background: #f7f9fc;
  border: 1px solid #e2e7ee;
  border-radius: 5px;
  font-size: 8px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .evidence-chip > i {
  color: #3880d7;
  font-size: 16px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .evidence-chip button {
  position: absolute;
  right: 2px;
  top: 2px;
  color: #8c98a8;
  background: transparent;
  border: 0;
  cursor: pointer;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .form-help {
  margin-top: 5px;
  color: #96a1b1;
  font-size: 9px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .form-help.inline {
  margin-left: 8px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .form-unit {
  margin-left: 6px;
  color: #7f8b9c;
  font-size: 10px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .maintenance-drawer .el-drawer__header {
  flex: 0 0 auto;
  margin: 0;
  padding: 17px 20px;
  border-bottom: 1px solid #e8edf3;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .maintenance-drawer .el-drawer__title {
  color: #293b55;
  font-size: 16px;
  font-weight: 600;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .maintenance-drawer .el-drawer__body {
  display: flex;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .drawer-scroll {
  min-height: 0;
  flex: 1;
  padding: 18px 20px;
  overflow-y: auto;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .drawer-actions {
  display: flex;
  flex: 0 0 auto;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  background: #fff;
  border-top: 1px solid #e8edf3;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .maintenance-drawer .drawer-actions .el-button {
  min-width: 68px;
  font-size: 12px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .drawer-hero {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 16px;
  padding: 14px;
  background: linear-gradient(135deg, #eff6ff, #f9fbfe);
  border: 1px solid #dce9f8;
  border-radius: 7px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .hero-icon {
  display: flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #357ed8;
  border-radius: 8px;
  font-size: 18px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .drawer-hero > div:nth-child(2) {
  min-width: 0;
  flex: 1;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .drawer-hero h3,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .drawer-hero p {
  margin: 0;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .drawer-hero h3 {
  overflow: hidden;
  color: #293b55;
  font-size: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .drawer-hero p {
  margin-top: 4px;
  color: #8c98a9;
  font-family: Consolas, monospace;
  font-size: 11px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid #e6ebf2;
  border-left: 1px solid #e6ebf2;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .detail-grid > div {
  min-height: 68px;
  padding: 10px 12px;
  border-right: 1px solid #e6ebf2;
  border-bottom: 1px solid #e6ebf2;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .detail-grid span,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .detail-grid b {
  display: block;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .detail-grid span {
  color: #98a2b2;
  font-size: 11px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .detail-grid b {
  margin-top: 6px;
  color: #3e4f67;
  font-size: 12px;
  line-height: 18px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .drawer-section-title {
  margin: 19px 0 10px;
  color: #34455e;
  font-size: 13px;
  font-weight: 700;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .drawer-section-title small {
  margin-left: 4px;
  color: #8d99aa;
  font-size: 11px;
  font-weight: 400;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .history-list button {
  display: flex;
  width: 100%;
  align-items: flex-start;
  gap: 9px;
  padding: 10px 5px;
  color: inherit;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid #edf0f4;
  cursor: pointer;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .history-list button:hover {
  background: #f7faff;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .history-mark {
  width: 9px;
  height: 9px;
  flex: 0 0 9px;
  margin-top: 3px;
  background: #25a87a;
  border-radius: 50%;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .history-mark.warning {
  background: #e99a25;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .history-mark.danger {
  background: #e4545c;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .history-list button > span {
  min-width: 0;
  flex: 1;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .history-list b,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .history-list small,
:is(.fire-maintenance-page, .fire-maintenance-dialog) .history-list em {
  display: block;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .history-list b {
  color: #3a4b64;
  font-size: 12px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .history-list small {
  margin-top: 3px;
  color: #929dac;
  font-size: 10px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .history-list em {
  margin-top: 4px;
  overflow: hidden;
  color: #778497;
  font-size: 10px;
  font-style: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .history-list button > i:last-child {
  margin-top: 12px;
  color: #a5afbd;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .empty-history {
  padding: 26px;
  color: #99a3b2;
  text-align: center;
  background: #f8fafc;
  font-size: 11px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .detail-description {
  margin: 0;
  padding: 10px 12px;
  color: #56667c;
  background: #f7f9fc;
  border-radius: 5px;
  font-size: 12px;
  line-height: 20px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .detail-description.warning {
  color: #a65f12;
  background: #fff6e8;
}

.maintenance-drawer .record-attachment-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.maintenance-drawer .record-attachment-list li + li {
  margin-top: 10px;
}

.maintenance-drawer .record-attachment-list .el-link {
  max-width: 100%;
  align-items: baseline;
  font-size: 14px;
  line-height: 24px;
  text-align: left;
}

.maintenance-drawer .record-attachment-list .el-link--inner {
  min-width: 0;
  overflow-wrap: anywhere;
}

.maintenance-drawer .record-attachment-list .el-icon-link {
  flex-shrink: 0;
  margin-right: 6px;
}

.fire-maintenance-page .trace-timeline {
  margin: 12px 0 2px;
  padding: 0;
  list-style: none;
}

.fire-maintenance-page .trace-item {
  position: relative;
  padding: 0 0 14px 26px;
}

.fire-maintenance-page .trace-item::before {
  position: absolute;
  z-index: 1;
  left: 0;
  top: 19px;
  width: 10px;
  height: 10px;
  background: #fff;
  border: 2px solid #a9bfdc;
  border-radius: 50%;
  content: '';
  box-shadow: 0 0 0 4px #fff;
}

.fire-maintenance-page .trace-item::after {
  position: absolute;
  top: 29px;
  bottom: -19px;
  left: 4px;
  width: 1px;
  background: #e0e8f2;
  content: '';
}

.fire-maintenance-page .trace-item:last-child {
  padding-bottom: 0;
}

.fire-maintenance-page .trace-item:last-child::after {
  display: none;
}

.fire-maintenance-page .trace-item.is-latest::before {
  background: var(--primary);
  border-color: var(--primary);
  box-shadow: 0 0 0 4px #edf4ff;
}

.fire-maintenance-page .trace-card {
  min-width: 0;
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e8edf4;
  border-radius: 8px;
}

.fire-maintenance-page .trace-item.is-latest .trace-card {
  background: #f5f9ff;
  border-color: #dce8fa;
}

.fire-maintenance-page .trace-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px 12px;
}

.fire-maintenance-page .trace-head b {
  min-width: 0;
  color: #34465f;
  font-size: 13px;
  font-weight: 600;
  line-height: 21px;
  overflow-wrap: anywhere;
}

.fire-maintenance-page .trace-time {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #8b98aa;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  line-height: 20px;
  white-space: nowrap;
}

.fire-maintenance-page .trace-actor {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
  max-width: 100%;
  margin-top: 7px;
  padding: 2px 7px;
  color: #60748f;
  background: #fff;
  border-radius: 4px;
  font-size: 12px;
  line-height: 18px;
  overflow-wrap: anywhere;
}

.fire-maintenance-page .trace-remark {
  margin: 7px 0 0;
  color: #77869b;
  font-size: 12px;
  line-height: 20px;
  overflow-wrap: anywhere;
}

.fire-maintenance-page .trace-empty {
  padding: 18px;
  color: var(--muted);
  background: #f8fafc;
  border-radius: 8px;
  font-size: 12px;
  text-align: center;
}

@media (max-width: 1000px) {
  :is(.fire-maintenance-page, .fire-maintenance-dialog) .kpi-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (min-width: 901px) and (max-width: 1250px) {
  :is(.fire-maintenance-page, .fire-maintenance-dialog) .toolbar-note {
    display: none;
  }
}
@media (min-width: 901px) {
  :is(.fire-maintenance-page, .fire-maintenance-dialog) > .iot-workspace-nav {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
@media (min-width: 1281px) {
  :is(.fire-maintenance-page, .fire-maintenance-dialog) .category-list {
    display: grid;
    grid-auto-rows: minmax(45px, 1fr);
    overflow: auto;
    justify-content: stretch;
  }
  :is(.fire-maintenance-page, .fire-maintenance-dialog) .category-row {
    align-self: center;
    margin-bottom: 0;
  }
  :is(.fire-maintenance-page, .fire-maintenance-dialog) .reminder-list {
    display: grid;
    grid-auto-rows: minmax(58px, 1fr);
    overflow: auto;
  }
  :is(.fire-maintenance-page, .fire-maintenance-dialog) .reminder-item {
    min-height: 0;
  }
}
@media (max-width: 900px) {
  .fire-maintenance-page {
    padding: 12px;
    height: auto;
    min-height: 100%;
    overflow: visible;
  }
  :is(.fire-maintenance-page, .fire-maintenance-dialog) .page-header {
    flex-direction: column;
  }
  :is(.fire-maintenance-page, .fire-maintenance-dialog) .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  :is(.fire-maintenance-page, .fire-maintenance-dialog) .overview-grid {
    grid-template-columns: 1fr;
    min-height: 0;
  }
  :is(.fire-maintenance-page, .fire-maintenance-dialog) .ledger-card,
  :is(.fire-maintenance-page, .fire-maintenance-dialog) .workspace-tabs,
  :is(.fire-maintenance-page, .fire-maintenance-dialog) .workspace-tabs .el-tabs__content {
    flex: auto;
    overflow: visible;
  }
  :is(.fire-maintenance-page, .fire-maintenance-dialog) .el-dialog {
    width: calc(100% - 24px) !important;
  }
  :is(.fire-maintenance-page, .fire-maintenance-dialog) .pagination-row {
    flex-wrap: wrap;
    gap: 10px;
  }
  :is(.fire-maintenance-page, .fire-maintenance-dialog) .pagination-summary {
    flex-wrap: wrap;
    gap: 8px;
  }
  :is(.fire-maintenance-page, .fire-maintenance-dialog) .pagination-row .el-pagination {
    flex-wrap: wrap;
    row-gap: 8px;
    margin-left: auto;
  }
  :is(.fire-maintenance-page, .fire-maintenance-dialog) .reminder-panel {
    grid-column: auto;
  }
  :is(.fire-maintenance-page, .fire-maintenance-dialog) .reminder-list {
    display: block;
  }
  :is(.fire-maintenance-page, .fire-maintenance-dialog) .checklist-grid {
    grid-template-columns: 1fr;
    margin-left: 0;
  }
  :is(.fire-maintenance-page, .fire-maintenance-dialog) .device-summary {
    width: 100%;
    margin-left: 0;
  }
  :is(.fire-maintenance-page, .fire-maintenance-dialog) .toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
}
:is(.fire-maintenance-page, .fire-maintenance-dialog) .workspace-tabs > .maintenance-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-height: 0;
}
@media (max-width: 900px) {
  :is(.fire-maintenance-page, .fire-maintenance-dialog) .workspace-tabs > .maintenance-list {
    flex: auto;
    height: 620px;
  }
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .maintenance-table-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding-bottom: 12px;
}
:is(.fire-maintenance-page, .fire-maintenance-dialog) .maintenance-table-area > .el-table {
  flex: 1;
  min-height: 0;
}

// 固定操作列的伪元素会在表格空白区底部留下短线，分隔线由分页底栏统一提供。
.fire-maintenance-page .maintenance-table-area .el-table__fixed::before,
.fire-maintenance-page .maintenance-table-area .el-table__fixed-right::before {
  display: none;
}
</style>
