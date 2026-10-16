<template>
  <div class="maintenance-list">
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input v-model.trim="keyword" size="small" clearable prefix-icon="el-icon-search" placeholder="计划名称 / 设备编号 / 名称 / 负责人" style="width: 280px" />
        <el-select v-model="status" size="small" clearable placeholder="当前期状态" style="width: 140px">
          <el-option v-for="item in ['待定日期', '待设置周期', '待首次维保', '待下期维保', '即将到期', '今日到期', '已逾期']" :key="item" :label="item" :value="item" />
        </el-select>
        <el-button v-if="focusedPlanId" size="small" @click="focusedPlanId = ''">查看全部计划</el-button>
      </div>
      <el-button type="primary" size="small" :disabled="saving || blocked" icon="el-icon-plus" @click="openPlanDialog()">新建计划</el-button>
    </div>
    <div class="maintenance-table-area">
      <el-table ref="table" :data="pagedRows" size="small" stripe height="100%">
        <div slot="empty">
          <span>暂无符合条件的计划</span>
          <el-button v-if="!devices.length" type="text" :disabled="saving || blocked" @click="$emit('create-device')">先去添加设备</el-button>
        </div>
        <el-table-column prop="planName" label="计划名称" min-width="210" show-overflow-tooltip />
        <el-table-column label="关联设备" min-width="200" show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.deviceName }}</div>
            <small class="muted-text">{{ scope.row.deviceCode }}</small>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="安装位置" min-width="180" show-overflow-tooltip />
        <el-table-column prop="frequency" label="养护频率" width="105" />
        <el-table-column label="第一次维保时间" width="145">
          <template slot-scope="scope">{{ scope.row.firstMaintenanceDate || '未设日期' }}</template>
        </el-table-column>
        <el-table-column label="下次维保时间" width="140">
          <template slot-scope="scope">
            <span class="plan-date">{{ scope.row.plannedDate || '请完善计划' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="recordCount" label="已维保次数" width="105" />
        <el-table-column prop="responsiblePerson" label="负责人" width="90" />
        <el-table-column label="当前期状态" width="120">
          <template slot-scope="scope">
            <span :class="['status-pill', scope.row.status === '已逾期' ? 'danger' : ['今日到期', '即将到期'].includes(scope.row.status) ? 'warning' : 'info']">{{ scope.row.status }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" class-name="maintenance-actions-column" width="260" fixed="right">
          <template slot-scope="scope">
            <el-tooltip
              :disabled="scope.row.canRegister"
              :content="scope.row.plannedDate ? '本次维保时间为' + scope.row.plannedDate + '，提前7天开放登记，到期及逾期仍可登记' : '请先设置有效的首次时间和养护频率'"
              placement="top">
              <span class="action-wrapper">
                <el-button
                  type="text"
                  size="mini"
                  :disabled="saving || blocked || !scope.row.canRegister || !devices.some((device) => device.id === scope.row.deviceId)"
                  @click="$emit('execute', scope.row)">
                  执行登记
                </el-button>
              </span>
            </el-tooltip>
            <el-button type="text" size="mini" :disabled="!scope.row.recordCount" @click="$emit('view-records', scope.row)">查看记录</el-button>
            <el-button type="text" size="mini" :disabled="saving || blocked" @click="openPlanDialog(scope.row)">编辑</el-button>
            <el-tooltip :disabled="!scope.row.recordCount" content="已有维保记录，需保留计划历史" placement="top">
              <span class="action-wrapper"><el-button type="text" size="mini" :disabled="saving || blocked || !!scope.row.recordCount" @click="$emit('delete-plan', scope.row)">删除</el-button></span>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-row">
      <div class="pagination-summary">
        <span>
          共
          <b>{{ filteredRows.length }}</b>
          条
        </span>
        <span>{{ pageRange }}</span>
      </div>
      <el-pagination
        :current-page="page"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        background
        :pager-count="5"
        layout="sizes, prev, pager, next, jumper"
        :total="filteredRows.length"
        @current-change="page = $event"
        @size-change="$emit('size-change', $event)" />
    </div>
    <el-dialog
      append-to-body
      :title="planForm.id ? '编辑维保计划' : '新建维保计划'"
      :visible.sync="planDialog"
      width="660px"
      custom-class="maintenance-dialog fire-maintenance-dialog"
      :close-on-click-modal="false"
      :before-close="closeWhenIdle">
      <el-alert v-if="blocked" title="数据读取失败，可关闭弹窗或重新加载后继续填写" type="error" :closable="false" />
      <el-button v-if="blocked" size="mini" :disabled="saving" @click="$emit('reload')">重新加载</el-button>
      <div v-if="!devices.length && !blocked" class="dialog-intro">
        <span>请先在设备台账中添加设备。</span>
        <el-button
          type="text"
          @click="
            planDialog = false
            $emit('create-device')
          ">
          去添加设备
        </el-button>
      </div>
      <div v-if="!planForm.id && devices.length && !availableDeviceCount && !blocked" class="dialog-intro">所有设备均已安排计划，请在计划列表查看或编辑已有计划。</div>
      <el-form ref="planForm" :model="planForm" :rules="planRules" label-width="120px" size="small" :disabled="saving || blocked">
        <el-form-item label="计划名称" prop="planName"><el-input v-model.trim="planForm.planName" /></el-form-item>
        <el-form-item label="选择设备" prop="deviceId">
          <el-select
            v-model="planForm.deviceId"
            :disabled="planHasRecords"
            @change="onDeviceChange"
            filterable
            :filter-method="filterDevices"
            placeholder="搜索设备编号、名称或位置"
            style="width: 100%"
            popper-class="fire-plan-device-options"
            @visible-change="deviceKeyword = ''">
            <el-option v-for="item in deviceOptions" :key="item.id" :value="item.id" :disabled="deviceUnavailable(item.id)" :label="item.name + '（' + item.deviceCode + '）'">
              <div class="plan-device-option">
                <span>
                  {{ item.name }}
                  <small>{{ item.deviceCode }} · {{ item.installLocation || '未填写位置' }}</small>
                </span>
                <el-tag v-if="devicePlans(item.id, planForm.id).length" size="mini" type="warning">已有计划</el-tag>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="养护频率" prop="frequency">
              <el-select v-model="planForm.frequency" :disabled="frequencyLocked" style="width: 100%">
                <el-option v-for="item in ['每月', '每季度', '每半年', '每年']" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="第一次维保时间" prop="planDate">
              <el-date-picker v-model="planForm.planDate" :disabled="firstDateLocked" type="date" value-format="yyyy-MM-dd" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="负责人"><el-input v-model.trim="planForm.responsiblePerson" /></el-form-item>
        <div class="form-help">每台设备只安排一个周期维保计划；已有计划的设备不可重复选择。</div>
        <div class="form-help">本次维保时间前7天可登记，到期及逾期仍可登记；登记后按周期计算下一次时间，首次时间保持不变，月底按当月最后一天处理。</div>
        <div v-if="planHasRecords" class="form-help">已有维保记录，设备、首次时间和频率保持固定，可修改名称及负责人。</div>
      </el-form>
      <span slot="footer">
        <el-button :disabled="saving" @click="planDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" :disabled="blocked || !devices.length || (!planForm.id && !availableDeviceCount)" @click="savePlan">保存计划</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { requestMaintenance, maintenanceToday, maintenanceIntervalMonths, isMaintenanceDate } from '@/service/maintenance'
export default {
  name: 'PlanList',
  props: {
    refreshOptions: { type: Function, default: () => Promise.resolve(true) },
    pageSize: { type: Number, required: true },
    active: Boolean,
    saving: Boolean,
    blocked: Boolean,
    plans: { type: Array, required: true },
    devices: { type: Array, required: true },
    devicePlans: { type: Function, required: true }
  },
  data() {
    return {
      page: 1,
      keyword: '',
      status: '',
      focusedPlanId: '',
      planDialog: false,
      detailLoading: false,
      planHasRecords: false,
      firstDateLocked: false,
      frequencyLocked: false,
      planForm: {},
      originalDeviceId: '',
      deviceKeyword: '',
      planRules: {
        frequency: [{ required: true, validator: (rule, value, callback) => (maintenanceIntervalMonths(value) ? callback() : callback(new Error('请选择有效的养护频率'))), trigger: 'change' }],
        planDate: [{ required: true, message: '请设置第一次维保时间', trigger: 'change' }],
        planName: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
        deviceId: [{ required: true, message: '请从台账选择设备', trigger: 'change' }]
      }
    }
  },
  computed: {
    availableDeviceCount() {
      return this.devices.filter((item) => !this.deviceUnavailable(item.id)).length
    },
    filteredRows() {
      const keyword = this.keyword.toLowerCase()
      return this.plans.filter(
        (item) =>
          (!this.focusedPlanId || item.id === this.focusedPlanId) &&
          (!keyword || [item.planName, item.deviceCode, item.deviceName, item.responsiblePerson].join(' ').toLowerCase().includes(keyword)) &&
          (!this.status || item.status === this.status)
      )
    },
    deviceOptions() {
      const keyword = this.deviceKeyword.toLowerCase()
      return this.devices.filter((item) => item.id === this.planForm.deviceId || !keyword || [item.deviceCode, item.name, item.installLocation].join(' ').toLowerCase().includes(keyword))
    },
    pagedRows() {
      const start = (this.page - 1) * this.pageSize
      return this.filteredRows.slice(start, start + this.pageSize)
    },
    pageRange() {
      return this.filteredRows.length ? '当前显示 ' + ((this.page - 1) * this.pageSize + 1) + '–' + Math.min(this.page * this.pageSize, this.filteredRows.length) + ' 条' : '暂无数据'
    }
  },
  watch: {
    pageSize() {
      this.page = 1
    },
    'filteredRows.length'() {
      this.page = Math.min(this.page, Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize)))
    },
    active(value) {
      if (value) this.refreshLayout()
    },
    keyword() {
      this.focusedPlanId = ''
      this.page = 1
    },
    status() {
      this.focusedPlanId = ''
      this.page = 1
    }
  },
  mounted() {
    if (this.active) this.refreshLayout()
  },
  methods: {
    refreshLayout() {
      this.$nextTick(() => {
        if (this.$refs.table) this.$refs.table.doLayout()
      })
    },
    focusPlan(id) {
      this.keyword = ''
      this.status = ''
      this.$nextTick(() => {
        this.focusedPlanId = id
        this.page = 1
        this.refreshLayout()
      })
    },
    closeWhenIdle(done) {
      if (!this.saving) done()
    },
    closePlanDialog() {
      this.planDialog = false
    },
    filterDevices(value) {
      this.deviceKeyword = value
    },
    deviceUnavailable(id) {
      if (this.planForm.id && id === this.originalDeviceId) return false
      return this.devicePlans(id, this.planForm.id).length > 0
    },
    onDeviceChange(id) {
      const device = this.devices.find((item) => item.id === id)
      if (!device) return
      if (!this.planForm.planName) this.planForm.planName = device.name + '养护计划'
    },
    async openPlanDialog(row, deviceId = '') {
      if (this.detailLoading || this.saving || this.blocked) return
      this.detailLoading = true
      try {
        if (!(await this.refreshOptions('plan'))) return
        await this.$nextTick()
        this.deviceKeyword = ''
        this.planHasRecords = false
        this.firstDateLocked = false
        this.frequencyLocked = false
        this.originalDeviceId = ''
        this.planForm = { planName: '', deviceId: '', frequency: '每季度', planDate: maintenanceToday(), responsiblePerson: '' }
        if (!row && deviceId) {
          const device = this.devices.find((item) => item.id === deviceId)
          if (!device) return this.$message.warning('该设备已移除，请先检查台账')
          if (this.deviceUnavailable(device.id)) {
            this.planDialog = false
            this.focusPlan(this.devicePlans(device.id)[0].id)
            return this.$message.info('该设备已有维保计划，已定位到已有计划')
          }
          this.planForm.deviceId = device.id
        }
        if (row) {
          const current = this.plans.find((item) => item.id === row.id)
          if (!current) return this.$message.warning('计划已移除，请刷新后查看')
          this.planHasRecords = current.recordCount > 0
          this.firstDateLocked = this.planHasRecords && isMaintenanceDate(current.firstMaintenanceDate)
          this.frequencyLocked = this.planHasRecords && !!maintenanceIntervalMonths(current.frequency)
          const value = await requestMaintenance(this.$api, 'plan', 'queryById', { id: row.id })
          if (!value || !value.id) throw new Error('计划详情不存在')
          this.planForm = { ...value, id: String(value.id), deviceId: String(value.deviceId || ''), planDate: (value.planDate || '').slice(0, 10) || null }
          this.originalDeviceId = this.planForm.deviceId
        }
        this.planDialog = true
        this.$nextTick(() => this.$refs.planForm && this.$refs.planForm.clearValidate())
      } catch (error) {
        this.$message.error(error.message || '计划信息加载失败')
      } finally {
        this.detailLoading = false
      }
    },
    savePlan() {
      if (this.deviceUnavailable(this.planForm.deviceId)) return this.$message.warning('该设备已有维保计划，请查看或编辑已有计划')
      if (!this.saving && !this.blocked)
        this.$refs.planForm.validate((valid) => {
          if (valid) this.$emit('save-plan', { ...this.planForm })
        })
    }
  }
}
</script>
