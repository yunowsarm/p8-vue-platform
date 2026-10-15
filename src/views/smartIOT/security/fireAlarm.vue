<!-- 消防维保入口：五个工作区共享业务数据和关联规则。 -->
<template>
  <div class="fire-maintenance-page">
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
          ref="devices"
          :buildings="buildings"
          :category-stats="categoryStats"
          :device-plans="devicePlans"
          :device-maintenance-status="deviceMaintenanceStatus"
          @save-device="saveDevice"
          @add-type="addDeviceType"
          @rename-type="renameDeviceType"
          @remove-type="removeDeviceType"
          v-show="activeTab === 'devices'"
          :active="activeTab === 'devices'"
          :devices="devices"
          :plans="plans"
          :categories="categories"
          :page-size="pageSize"
          @size-change="pageSize = $event"
          @detail="openDeviceDetail" />
        <plan-list
          ref="plans"
          :categories="categories"
          :buildings="buildings"
          :check-templates="checkTemplates"
          :device-plans="devicePlans"
          :pending-plan-devices="pendingPlanDevices"
          @save-plan="savePlan"
          v-show="activeTab === 'plans'"
          :active="activeTab === 'plans'"
          :plans="plans"
          :devices="devices"
          :page-size="pageSize"
          @size-change="pageSize = $event"
          @execute="executePlan" />
        <record-list
          ref="records"
          :devices="devices"
          :plans="plans"
          :check-templates="checkTemplates"
          :device-plans="devicePlans"
          :device-maintenance-status="deviceMaintenanceStatus"
          @save-record="saveRecord"
          v-show="activeTab === 'records'"
          :active="activeTab === 'records'"
          :records="records"
          :page-size="pageSize"
          @size-change="pageSize = $event"
          @detail="openRecordDetail" />
        <reminder-list
          ref="reminders"
          :initial-rule="reminderRule"
          @save-rule="saveReminderRule"
          v-show="activeTab === 'reminders'"
          :active="activeTab === 'reminders'"
          :reminders="reminders"
          :page-size="pageSize"
          @size-change="pageSize = $event"
          @view-plan="viewPlan" />
      </div>
    </section>
    <el-drawer :title="drawerMode === 'device' ? '消防设备维保档案' : '维保记录详情'" :visible.sync="drawerVisible" size="500px" custom-class="maintenance-drawer">
      <div v-if="currentRecord" class="drawer-scroll">
        <div class="drawer-hero">
          <div class="hero-icon"><i :class="drawerMode === 'device' ? 'el-icon-cpu' : 'el-icon-document-checked'"></i></div>
          <div>
            <h3>{{ drawerMode === 'device' ? currentRecord.name : currentRecord.device }}</h3>
            <p>{{ currentRecord.id }}</p>
          </div>
          <span :class="['status-pill', drawerMode === 'device' ? statusClass(deviceMaintenanceStatus(currentRecord)) : resultClass(currentRecord.result)]">
            {{ drawerMode === 'device' ? deviceMaintenanceStatus(currentRecord) : currentRecord.result }}
          </span>
        </div>
        <template v-if="drawerMode === 'device'">
          <div class="detail-grid">
            <div>
              <span>设备类型</span>
              <b>{{ currentRecord.category }}</b>
            </div>
            <div>
              <span>品牌型号</span>
              <b>{{ currentRecord.brand }} / {{ currentRecord.model }}</b>
            </div>
            <div>
              <span>安装位置</span>
              <b>{{ currentRecord.building }} / {{ currentRecord.floor }} / {{ currentRecord.location }}</b>
            </div>
            <div>
              <span>责任单位</span>
              <b>{{ currentRecord.department }} / {{ currentRecord.owner }}</b>
            </div>
            <div>
              <span>最近待执行计划</span>
              <b>{{ nextPlan(currentRecord.id) ? nextPlan(currentRecord.id).name : '未安排计划' }}</b>
            </div>
            <div>
              <span>下次维保</span>
              <b>{{ nextPlan(currentRecord.id) ? nextPlan(currentRecord.id).plannedDate : '未安排计划' }}</b>
            </div>
            <div>
              <span>设备二维码</span>
              <b>{{ currentRecord.qrCode }}</b>
            </div>
            <div>
              <span>安装日期</span>
              <b>{{ currentRecord.installDate }}</b>
            </div>
          </div>
          <div class="drawer-section-title">
            历次维保记录
            <small>{{ deviceHistory.length }} 条</small>
          </div>
          <div v-if="deviceHistory.length" class="history-list">
            <button v-for="item in deviceHistory" :key="item.id" type="button" @click="openRecordDetail(item, currentId)">
              <i :class="['history-mark', resultClass(item.result)]"></i>
              <span>
                <b>{{ item.type }} · {{ item.result }}</b>
                <small>{{ item.date }} · {{ item.executor }}</small>
                <em>{{ item.content }}</em>
              </span>
              <i class="el-icon-arrow-right"></i>
            </button>
          </div>
          <div v-else class="empty-history">暂无维保记录</div>
        </template>
        <template v-else>
          <div class="detail-grid">
            <div>
              <span>维保类型</span>
              <b>{{ currentRecord.type }}</b>
            </div>
            <div>
              <span>维保时间</span>
              <b>{{ currentRecord.date }}</b>
            </div>
            <div>
              <span>执行人员</span>
              <b>{{ currentRecord.executor }}</b>
            </div>
            <div>
              <span>执行单位</span>
              <b>{{ currentRecord.company }}</b>
            </div>
            <div>
              <span>维保费用</span>
              <b>{{ currentRecord.cost }} 元</b>
            </div>
            <div>
              <span>下次维保</span>
              <b>{{ currentRecord.nextDate }}</b>
            </div>
          </div>
          <div class="drawer-section-title">维保内容</div>
          <p class="detail-description">{{ currentRecord.content }}</p>
          <div class="drawer-section-title">发现问题</div>
          <p :class="['detail-description', currentRecord.issue !== '无' ? 'warning' : '']">{{ currentRecord.issue }}</p>
          <div class="drawer-section-title">现场凭证</div>
          <div class="drawer-evidence">
            <span v-for="item in currentRecord.photos" :key="item">
              <i :class="item.indexOf('视频') > -1 ? 'el-icon-video-camera' : 'el-icon-picture-outline'"></i>
              {{ item }}
            </span>
          </div>
          <div class="drawer-section-title">
            登记留痕
            <small>{{ (currentRecord.traces || []).length }} 条</small>
          </div>
          <ol v-if="(currentRecord.traces || []).length" class="trace-timeline" aria-label="登记留痕时间线">
            <li v-for="(trace, index) in currentRecord.traces" :key="index" class="trace-item" :class="{ 'is-latest': index === currentRecord.traces.length - 1 }">
              <div class="trace-card">
                <div class="trace-head">
                  <b>{{ trace.action }}</b>
                  <time class="trace-time">
                    <i class="el-icon-time" aria-hidden="true"></i>
                    {{ trace.time }}
                  </time>
                </div>
                <div class="trace-actor">
                  <i class="el-icon-user" aria-hidden="true"></i>
                  {{ trace.user }}
                </div>
                <p v-if="trace.remark" class="trace-remark">{{ trace.remark }}</p>
              </div>
            </li>
          </ol>
          <div v-else class="trace-empty">暂无登记留痕</div>
        </template>
      </div>
      <div v-if="currentRecord" class="drawer-actions">
        <el-button v-if="drawerMode === 'record' && recordReturnDeviceId" size="small" icon="el-icon-back" @click="backToDeviceDetail">返回设备档案</el-button>
        <el-button v-if="drawerMode === 'device'" size="small" @click="openDeviceDialog(currentRecord)">编辑设备</el-button>
        <el-button v-if="drawerMode === 'device' && nextPlan(currentRecord.id)" type="primary" size="small" @click="viewPlan(nextPlan(currentRecord.id).id)">查看计划</el-button>
        <el-button v-if="drawerMode === 'record'" type="primary" size="small" @click="simulatePrint">打印维保单</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import IotWorkspaceNav from '../components/IotWorkspaceNav.vue'
import { fireMaintenance } from '../mock/fireMaintenanceMockData'
import MaintenanceOverview from './fireAlarm/MaintenanceOverview.vue'
import DeviceLedger from './fireAlarm/DeviceLedger.vue'
import PlanList from './fireAlarm/PlanList.vue'
import RecordList from './fireAlarm/RecordList.vue'
import ReminderList from './fireAlarm/ReminderList.vue'
function initialPlans(fireMaintenance) {
  const aliases = { 报警按钮: '手动报警按钮', 消火栓: '消火栓箱' }
  return fireMaintenance.plans.map((plan) => {
    const [building, categoryText = ''] = plan.scope.split(' · ')
    const categories = categoryText.split('/').map((item) => aliases[item] || item)
    const deviceIds = fireMaintenance.devices
      .filter((device) => (building === '全园区' || device.building === building || (building === '宿舍区' && device.building.startsWith('宿舍'))) && categories.includes(device.category))
      .map((device) => device.id)
    const completedDeviceIds = plan.status === '已完成' ? deviceIds.slice() : []
    return { ...plan, deviceIds, completedDeviceIds, devices: deviceIds.length, completed: completedDeviceIds.length, status: plan.status === '已完成' ? '已完成' : '待执行' }
  })
}
function localDateTime() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
    2,
    '0'
  )}`
}
function dueDays(date) {
  return Math.round((new Date(localDateTime().slice(0, 10) + 'T00:00:00') - new Date(date + 'T00:00:00')) / 86400000)
}
function devicePlans(plans, deviceId, excludedId) {
  return plans
    .filter((plan) => plan.id !== excludedId && plan.status !== '已完成' && plan.deviceIds.includes(deviceId) && !plan.completedDeviceIds.includes(deviceId))
    .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate))
}
function pendingPlanDevices(devices, plan) {
  return devices.filter((device) => plan.status !== '已完成' && plan.deviceIds.includes(device.id) && !plan.completedDeviceIds.includes(device.id))
}
function deviceMaintenanceStatus(device, plans) {
  if (/故障/.test(device.status)) return '故障待修'
  const plan = devicePlans(plans, device.id)[0]
  if (!plan) return '未安排计划'
  const days = dueDays(plan.plannedDate)
  return days > 0 ? '已逾期' : days === 0 ? '今日到期' : days >= -plan.advanceDays ? '即将到期' : '已安排'
}
function planScope(devices, ids) {
  const selected = devices.filter((device) => ids.includes(device.id))
  return [...new Set(selected.map((device) => device.building))].join('、') + ' · ' + [...new Set(selected.map((device) => device.category))].join('/')
}
export default {
  components: { IotWorkspaceNav, MaintenanceOverview, DeviceLedger, PlanList, RecordList, ReminderList },
  name: 'SmartIOTFireAlarm',
  data() {
    return {
      dataSet: fireMaintenance,
      devices: JSON.parse(JSON.stringify(fireMaintenance.devices)),
      plans: initialPlans(fireMaintenance),
      records: JSON.parse(JSON.stringify(fireMaintenance.records)),
      deviceTypes: fireMaintenance.categories.map((item) => item.name),
      checkTemplates: JSON.parse(JSON.stringify(fireMaintenance.checkTemplates)),
      activeTab: 'overview',
      pageSize: 10,
      reminderRule: { advanceDays: 7, receivers: ['设备责任人', '消防管理员'], channels: ['系统消息', '移动端'], escalate: true },
      drawerVisible: false,
      drawerMode: 'device',
      currentId: '',
      recordReturnDeviceId: ''
    }
  },
  computed: {
    categoryStats() {
      return this.categories.map((name, index) => {
        const devices = this.devices.filter((device) => device.category === name)
        return { name, total: devices.length, maintained: devices.filter((device) => this.nextPlan(device.id)).length, color: this.dataSet.categories[index % this.dataSet.categories.length].color }
      })
    },
    monthProgress() {
      const plans = this.plans.filter((plan) => plan.plannedDate.slice(0, 7) === localDateTime().slice(0, 7))
      const total = plans.reduce((sum, plan) => sum + plan.devices, 0)
      const completed = plans.reduce((sum, plan) => sum + plan.completed, 0)
      return { total, completed, plans: plans.length, percent: total ? Math.round((completed / total) * 1000) / 10 : 0 }
    },
    kpis() {
      const covered = this.devices.filter((device) => this.nextPlan(device.id)).length
      return [
        { title: '消防设备', value: this.devices.length, unit: '台', sub: `共 ${this.categories.length} 种设备类型`, icon: 'el-icon-cpu', type: 'blue' },
        { title: '已安排计划', value: covered, unit: '台', sub: '已关联待执行维保计划', icon: 'el-icon-circle-check', type: 'green' },
        { title: '待安排计划', value: this.devices.length - covered, unit: '台', sub: '请在计划管理中安排', icon: 'el-icon-date', type: 'orange' },
        { title: '逾期任务', value: this.reminders.filter((item) => item.overdueDays > 0).length, unit: '项', sub: '按计划日期自动统计', icon: 'el-icon-warning-outline', type: 'red' },
        {
          title: '本月已维保',
          value: this.records.filter((item) => item.date.slice(0, 7) === localDateTime().slice(0, 7)).length,
          unit: '次',
          sub: `本月计划完成率 ${this.monthProgress.percent}%`,
          icon: 'el-icon-finished',
          type: 'cyan'
        },
        { title: '故障待修', value: this.devices.filter((item) => /故障/.test(item.status)).length, unit: '台', sub: '设备异常需跟进处理', icon: 'el-icon-setting', type: 'purple' }
      ]
    },
    reminders() {
      const list = []
      this.plans.forEach((plan) => {
        const overdueDays = this.dueDays(plan.plannedDate)
        if (overdueDays < -plan.advanceDays) return
        this.pendingPlanDevices(plan).forEach((device) => {
          list.push({
            id: `${plan.id}-${device.id}`,
            planId: plan.id,
            deviceId: device.id,
            device: device.name,
            category: device.category,
            location: `${device.building} / ${device.floor} / ${device.location}`,
            dueDate: plan.plannedDate,
            owner: plan.owner,
            plan: plan.name,
            overdueDays,
            status: overdueDays > 0 ? `逾期${overdueDays}天` : overdueDays === 0 ? '今日到期' : `${-overdueDays}天后到期`
          })
        })
      })
      return list.sort((a, b) => b.overdueDays - a.overdueDays)
    },
    workspaceNav() {
      return [
        { key: 'overview', title: '维保总览', description: '分类、进度与到期', detail: '查看消防设备分类、本月维保进度和近期到期提醒。', icon: 'el-icon-data-analysis', count: null },
        { key: 'devices', title: '设备台账', description: '设备档案与类型管理', detail: '维护设备基础信息和类型；下次维保日期随关联计划自动同步。', icon: 'el-icon-cpu', count: this.devices.length },
        { key: 'plans', title: '维保计划', description: '范围、频次与执行', detail: '编排设备维保范围、计划日期、执行单位、负责人和提醒周期。', icon: 'el-icon-date', count: this.plans.length },
        {
          key: 'records',
          title: '维保记录',
          description: '检查、凭证与结论',
          detail: '按计划登记检查项目、现场凭证、维保结果和费用，保留完整履历。',
          icon: 'el-icon-document-checked',
          count: this.records.length
        },
        {
          key: 'reminders',
          title: '到期提醒',
          description: '即将到期与逾期',
          detail: '集中处理即将到期、今日到期和已经逾期的消防设备维保任务。',
          icon: 'el-icon-alarm-clock',
          count: this.reminders.length,
          danger: this.reminders.some((item) => item.overdueDays >= 0)
        }
      ]
    },
    categories() {
      return this.deviceTypes
    },
    buildings() {
      return ['A栋研发楼', 'B栋生产楼', '综合服务中心', '物流仓储', '宿舍1号楼', '园区室外']
    },
    currentRecord() {
      return (this.drawerMode === 'device' ? this.devices : this.records).find((item) => item.id === this.currentId) || null
    },
    deviceHistory() {
      if (!this.currentRecord || this.drawerMode !== 'device') return []
      return this.records.filter((item) => item.deviceId === this.currentRecord.id)
    }
  },
  methods: {
    dueDays,
    devicePlans(id, excludedId) {
      return devicePlans(this.plans, id, excludedId)
    },
    nextPlan(id) {
      return this.devicePlans(id)[0] || null
    },
    pendingPlanDevices(plan) {
      return pendingPlanDevices(this.devices, plan)
    },
    planScope(ids) {
      return planScope(this.devices, ids)
    },
    openWorkspace(view) {
      if (!this.workspaceNav.some((item) => item.key === view)) return
      this.activeTab = view
      this.handleWorkspaceChange()
    },
    handleWorkspaceChange() {
      this.$nextTick(() => {
        const view = this.activeTab === 'overview' ? this.$refs.overview : this.$refs.workspaceContent
        const content = view && (view.$el || view)
        if (content && typeof content.focus === 'function') content.focus({ preventScroll: true })
      })
    },
    openDeviceDialog(row) {
      this.$refs.devices.openDeviceDialog(row)
    },
    openPlanDialog(row) {
      this.$refs.plans.openPlanDialog(row)
    },
    openRecordDialog(device, plan, type) {
      this.$refs.records.openRecordDialog(device, plan, type)
    },
    viewPlan(planId) {
      if (!this.plans.some((plan) => plan.id === planId)) return this.$message.warning('关联计划不存在，请刷新后重试')
      this.drawerVisible = false
      this.openWorkspace('plans')
      this.$refs.plans.focusPlan(planId)
    },
    openDeviceDetail(row) {
      this.recordReturnDeviceId = ''
      this.drawerMode = 'device'
      this.currentId = row.id
      this.drawerVisible = true
    },
    openRecordDetail(row, fromDeviceId = '') {
      this.recordReturnDeviceId = fromDeviceId
      this.drawerMode = 'record'
      this.currentId = row.id
      this.drawerVisible = true
    },
    backToDeviceDetail() {
      const device = this.devices.find((item) => item.id === this.recordReturnDeviceId)
      if (!device) return this.$message.warning('原设备档案不存在，请重新选择设备')
      this.openDeviceDetail(device)
    },
    saveDevice(form) {
      if (this.devices.some((item) => item.id === form.id && item.id !== form.editingId)) return this.$message.warning('设备编号已存在，请使用唯一编号')
      const payload = { ...JSON.parse(JSON.stringify(form)), qrCode: form.qrCode || 'QR-' + form.id }
      delete payload.editingId
      if (form.editingId) {
        const index = this.devices.findIndex((item) => item.id === form.editingId)
        this.$set(this.devices, index, payload)
      } else this.devices.unshift(payload)
      this.plans.forEach((plan) => {
        plan.scope = this.planScope(plan.deviceIds)
      })
      this.$refs.devices.closeDeviceDialog()
      this.$message.success('消防设备档案已保存')
    },
    savePlan(form) {
      if (form.completedDeviceIds.some((id) => !form.deviceIds.includes(id))) return this.$message.warning('已完成登记的设备需要保留在原计划中')
      if (form.deviceIds.some((id) => !this.devices.some((device) => device.id === id))) return this.$message.warning('部分设备已不在台账中，请重新选择')
      const payload = {
        id: form.editingId || 'MP' + Date.now() + this.plans.length,
        name: form.name,
        scope: this.planScope(form.deviceIds),
        deviceIds: form.deviceIds.slice(),
        completedDeviceIds: form.completedDeviceIds.slice(),
        frequency: form.frequency,
        plannedDate: form.plannedDate,
        devices: form.deviceIds.length,
        completed: form.completedDeviceIds.length,
        serviceType: form.serviceType,
        vendor: form.vendor || '-',
        owner: form.owner,
        advanceDays: form.advanceDays,
        status: form.completedDeviceIds.length === form.deviceIds.length ? '已完成' : form.completedDeviceIds.length ? '执行中' : '待执行'
      }
      if (form.editingId) {
        const index = this.plans.findIndex((item) => item.id === form.editingId)
        this.$set(this.plans, index, payload)
      } else this.plans.unshift(payload)
      this.$refs.plans.closePlanDialog()
      this.openWorkspace('plans')
      this.$message.success('维保计划已保存，相关设备任务已生成')
    },
    saveRecord(form) {
      const device = this.devices.find((item) => item.id === form.deviceId)
      const checklist = device ? this.checkTemplates[device.category] || ['外观与安装检查', '功能测试', '运行状态检查'] : []
      const followingPlan = this.devicePlans(form.deviceId, form.planId)[0] || null
      if (form.checkedItems.length !== checklist.length) return this.$message.warning('请完成全部检查项目后再提交')
      if (!form.photos.length) return this.$message.warning('请至少添加一项现场图片或视频凭证')
      if (form.result !== '合格' && !form.issue) return this.$message.warning('非合格结果必须填写问题说明')

      const plan = this.plans.find((item) => item.id === form.planId)
      if (!device || !plan || !this.pendingPlanDevices(plan).some((item) => item.id === device.id)) return this.$message.warning('设备不属于该计划或已完成登记，请重新选择')
      const record = {
        id: 'MR' + Date.now() + this.records.length,
        planId: plan.id,
        planName: plan.name,
        deviceId: device.id,
        device: device.name,
        category: device.category,
        date: form.date,
        executor: form.executor,
        company: form.company,
        type: form.type,
        content: form.checkedItems.join('、'),
        result: form.result,
        issue: form.issue || '无',
        parts: form.parts || '-',
        cost: form.cost,
        nextDate: followingPlan ? followingPlan.plannedDate : '未安排计划',
        photos: form.photos.slice(),
        traces: [
          { time: form.date.slice(11), action: '开始维保登记', user: form.executor, remark: '设备身份与台账信息已核对' },
          { time: '当前', action: '提交维保记录', user: form.executor, remark: `完成${form.checkedItems.length}项检查，结果：${form.result}` }
        ]
      }
      this.records.unshift(record)
      device.lastDate = form.date.slice(0, 10)
      device.status = form.result === '合格' ? '正常' : '故障待修'
      plan.completedDeviceIds.push(device.id)
      plan.completed = plan.completedDeviceIds.length
      plan.status = plan.completed === plan.devices ? '已完成' : '执行中'
      this.$refs.records.closeRecordDialog()
      this.openWorkspace('records')
      this.$message.success('维保记录已提交，计划进度与台账日期已同步')
    },
    addDeviceType(name) {
      if (!name || this.deviceTypes.includes(name)) return
      this.deviceTypes.push(name)
      this.$message.success('设备类型已添加')
    },
    renameDeviceType(name) {
      this.$prompt('请输入新的设备类型名称', '重命名设备类型', {
        inputValue: name,
        inputValidator: (value) => {
          const next = (value || '').trim()
          return !next ? '请输入设备类型名称' : next.length > 30 ? '类型名称最多30个字' : next !== name && this.deviceTypes.includes(next) ? '该设备类型已存在' : true
        }
      })
        .then(({ value }) => {
          const next = value.trim()
          if (next === name) return
          this.$set(this.deviceTypes, this.deviceTypes.indexOf(name), next)
          this.devices.forEach((device) => {
            if (device.category === name) device.category = next
          })
          if (this.checkTemplates[name]) {
            this.$set(this.checkTemplates, next, this.checkTemplates[name])
            this.$delete(this.checkTemplates, name)
          }
          this.plans.forEach((plan) => {
            plan.scope = this.planScope(plan.deviceIds)
          })
          this.$message.success('类型名称已更新，相关设备已同步')
        })
        .catch(() => {})
    },
    removeDeviceType(name) {
      if (this.devices.some((device) => device.category === name)) return
      this.deviceTypes.splice(this.deviceTypes.indexOf(name), 1)
      this.$delete(this.checkTemplates, name)
      this.$message.success('设备类型已删除')
    },
    executePlan(row) {
      const device = this.pendingPlanDevices(row)[0]
      if (!device) return this.$message.info('该计划暂无待执行设备')
      this.openRecordDialog(device, row, this.dueDays(row.plannedDate) > 0 ? '逾期补检' : '定期维保')
    },
    saveReminderRule(rule) {
      this.reminderRule = rule
      this.$message.success('维保到期提醒规则已保存')
    },
    simulatePrint() {
      this.$message.success('仿真环境：维保单已生成打印预览')
    },
    deviceMaintenanceStatus(device) {
      return deviceMaintenanceStatus(device, this.plans)
    },
    statusClass(status) {
      if (/逾期|故障/.test(status)) return 'danger'
      if (/即将|今日|执行中/.test(status)) return 'warning'
      if (/完成|正常/.test(status)) return 'success'
      return 'info'
    },
    resultClass(result) {
      if (result === '合格') return 'success'
      if (result === '需维修') return 'warning'
      return 'danger'
    }
  }
}
</script>

<style lang="scss">
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

:is(.fire-maintenance-page, .fire-maintenance-dialog) .muted-text {
  color: #97a2b2;
  font-size: 12px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .plan-date {
  color: var(--primary);
  cursor: help;
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

:is(.fire-maintenance-page, .fire-maintenance-dialog) .drawer-evidence {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .drawer-evidence span {
  display: flex;
  min-width: 132px;
  height: 56px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #55708e;
  background: #f2f7fd;
  border: 1px solid #dce9f8;
  border-radius: 5px;
  font-size: 11px;
}

:is(.fire-maintenance-page, .fire-maintenance-dialog) .drawer-evidence span i {
  color: #337dd5;
  font-size: 16px;
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
