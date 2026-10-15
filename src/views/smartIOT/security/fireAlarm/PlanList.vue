<template>
  <div class="maintenance-list">
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input v-model.trim="planKeyword" size="small" clearable prefix-icon="el-icon-search" placeholder="计划编号 / 名称 / 范围" style="width: 240px"></el-input>
        <el-select v-model="planStatus" size="small" clearable placeholder="计划状态" style="width: 130px">
          <el-option v-for="item in ['待执行', '执行中', '已完成']" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </div>
      <el-button type="primary" size="small" icon="el-icon-plus" @click="openPlanDialog()">新建计划</el-button>
    </div>
    <div class="maintenance-table-area">
      <el-table ref="table" :data="pagedRows" size="small" stripe height="100%">
        <el-table-column label="维保计划" min-width="200" show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.name }}</div>
            <small class="muted-text">{{ scope.row.id }}</small>
          </template>
        </el-table-column>
        <el-table-column prop="scope" label="维保范围" min-width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="frequency" label="频次" width="88"></el-table-column>
        <el-table-column prop="plannedDate" label="计划日期" width="105"></el-table-column>
        <el-table-column label="完成进度" width="140">
          <template slot-scope="scope">
            <div class="table-progress">
              <el-progress :percentage="planProgress(scope.row)" :show-text="false" :stroke-width="7"></el-progress>
              <span>{{ scope.row.completed }}/{{ scope.row.devices }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="serviceType" label="维保方式" width="95"></el-table-column>
        <el-table-column prop="owner" label="负责人" width="75"></el-table-column>
        <el-table-column label="状态" width="90">
          <template slot-scope="scope">
            <span :class="['status-pill', statusClass(scope.row.status)]">{{ scope.row.status }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="145" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" :disabled="!pendingPlanDevices(scope.row).length" @click="$emit('execute', scope.row)">执行登记</el-button>
            <el-button type="text" size="mini" @click="openPlanDialog(scope.row)">编辑</el-button>
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
    <el-dialog append-to-body :title="planForm.editingId ? '编辑维保计划' : '新建维保计划'" :visible.sync="planDialog" width="720px" custom-class="maintenance-dialog fire-maintenance-dialog">
      <div class="dialog-intro">
        <i class="el-icon-date"></i>
        从设备台账选择执行对象；“已有计划”设备可按实际需要加入，台账显示最近一次待执行日期。
      </div>
      <el-form ref="planForm" :model="planForm" :rules="planRules" label-width="105px" size="small">
        <el-form-item label="计划名称" prop="name"><el-input v-model.trim="planForm.name"></el-input></el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="筛选建筑">
              <el-select v-model="planDeviceBuilding" clearable placeholder="全部建筑" style="width: 100%">
                <el-option v-for="item in buildings" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="筛选类型">
              <el-select v-model="planDeviceCategory" clearable placeholder="全部类型" style="width: 100%">
                <el-option v-for="item in categories" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="选择设备" prop="deviceIds">
          <el-select
            v-model="planForm.deviceIds"
            multiple
            filterable
            :filter-method="filterPlanDevices"
            @planDialog-change="resetPlanDeviceKeyword"
            placeholder="从设备台账选择，可搜索编号、名称或位置"
            style="width: 100%"
            popper-class="fire-plan-device-options">
            <el-option v-for="item in planDeviceOptions" :key="item.id" :value="item.id" :label="item.name + '（' + item.id + '）'" :disabled="planForm.completedDeviceIds.includes(item.id)">
              <div class="plan-device-option">
                <span>
                  {{ item.name }}
                  <small>{{ item.id }} · {{ item.building }} / {{ item.location }}</small>
                </span>
                <el-tag v-if="planForm.completedDeviceIds.includes(item.id)" size="mini" type="success">已完成</el-tag>
                <el-tag v-else-if="devicePlans(item.id, planForm.editingId).length" size="mini" type="warning">已有计划</el-tag>
              </div>
            </el-option>
          </el-select>
          <div class="form-help">已选 {{ planForm.deviceIds.length }} 台设备；筛选条件只缩小候选范围，已选设备会保留。</div>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="执行频次">
              <el-select v-model="planForm.frequency" style="width: 100%">
                <el-option v-for="item in ['每月', '每3个月', '每6个月', '每年']" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="计划日期" prop="plannedDate"><el-date-picker v-model="planForm.plannedDate" type="date" value-format="yyyy-MM-dd" style="width: 100%"></el-date-picker></el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="提前提醒"><el-input-number v-model="planForm.advanceDays" :min="1" :max="30" style="width: 100%"></el-input-number></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="10">
            <el-form-item label="维保方式">
              <el-radio-group v-model="planForm.serviceType">
                <el-radio label="内部维保"></el-radio>
                <el-radio label="外委维保"></el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <el-form-item label="负责人" prop="owner"><el-input v-model.trim="planForm.owner"></el-input></el-form-item>
          </el-col>
        </el-row>
        <el-form-item v-if="planForm.serviceType === '外委维保'" label="维保单位" prop="vendor">
          <el-input v-model.trim="planForm.vendor" placeholder="填写具备相应资质的维保单位"></el-input>
        </el-form-item>
        <el-form-item label="检查模板">
          <div class="template-preview">
            <span v-for="item in planChecklist" :key="item">
              <i class="el-icon-check"></i>
              {{ item }}
            </span>
            <small v-if="!planChecklist.length">选择设备后自动带出检查项目</small>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="planDialog = false">取消</el-button>
        <el-button type="primary" @click="savePlan">保存并生成维保任务</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
function localDateTime() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
    2,
    '0'
  )}`
}
export default {
  name: 'PlanList',
  props: {
    pageSize: { type: Number, required: true },
    active: Boolean,
    plans: { type: Array, required: true },
    devices: { type: Array, required: true },
    categories: { type: Array, required: true },
    buildings: { type: Array, required: true },
    checkTemplates: { type: Object, required: true },
    devicePlans: { type: Function, required: true },
    pendingPlanDevices: { type: Function, required: true }
  },
  data() {
    return {
      page: 1,
      planKeyword: '',
      planStatus: '',
      planDialog: false,
      planForm: { deviceIds: [], completedDeviceIds: [] },
      planRules: {
        name: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
        deviceIds: [{ type: 'array', required: true, message: '请从设备台账选择至少一台设备', trigger: 'change' }],
        plannedDate: [{ required: true, message: '请选择计划日期', trigger: 'change' }],
        owner: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
        vendor: [
          {
            validator: (rule, value, callback) => {
              if (this.planForm.serviceType === '外委维保' && !value) callback(new Error('请填写维保单位'))
              else callback()
            },
            trigger: 'blur'
          }
        ]
      },
      planDeviceKeyword: '',
      planDeviceBuilding: '',
      planDeviceCategory: ''
    }
  },
  computed: {
    pagedRows() {
      const start = (this.page - 1) * this.pageSize
      return this.filteredRows.slice(start, start + this.pageSize)
    },
    filteredRows() {
      const keyword = this.planKeyword.toLowerCase()
      return this.plans.filter((item) => (!keyword || [item.id, item.name, item.scope].join(' ').toLowerCase().includes(keyword)) && (!this.planStatus || item.status === this.planStatus))
    },
    pageRange() {
      return this.filteredRows.length ? '当前显示 ' + ((this.page - 1) * this.pageSize + 1) + '–' + Math.min(this.page * this.pageSize, this.filteredRows.length) + ' 条' : '暂无数据'
    },
    planDeviceOptions() {
      const keyword = this.planDeviceKeyword.toLowerCase()
      return this.devices.filter(
        (device) =>
          this.planForm.deviceIds.includes(device.id) ||
          ((!this.planDeviceBuilding || device.building === this.planDeviceBuilding) &&
            (!this.planDeviceCategory || device.category === this.planDeviceCategory) &&
            (!keyword || [device.id, device.name, device.building, device.location].join(' ').toLowerCase().includes(keyword)))
      )
    },
    planChecklist() {
      const list = []
      const categories = [...new Set(this.devices.filter((device) => this.planForm.deviceIds.includes(device.id)).map((device) => device.category))]
      categories.forEach((category) =>
        (this.checkTemplates[category] || ['外观与安装检查', '功能测试', '运行状态检查']).forEach((item) => {
          if (!list.includes(item)) list.push(item)
        })
      )
      return list.slice(0, 10)
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
    planKeyword() {
      this.page = 1
    },
    planStatus() {
      this.page = 1
    }
  },
  methods: {
    focusPlan(planId) {
      this.planStatus = ''
      this.planKeyword = planId
      this.page = 1
      this.refreshLayout()
    },
    refreshLayout() {
      this.$nextTick(() => {
        if (this.$refs.table) this.$refs.table.doLayout()
      })
    },
    statusClass(status) {
      if (/逾期|故障/.test(status)) return 'danger'
      if (/即将|今日|执行中/.test(status)) return 'warning'
      if (/完成|正常/.test(status)) return 'success'
      return 'info'
    },
    planProgress(row) {
      return row.devices ? Math.round((row.completed / row.devices) * 100) : 0
    },
    closePlanDialog() {
      this.planDialog = false
    },
    resetPlanForm() {
      this.planDeviceBuilding = ''
      this.planDeviceCategory = ''
      this.planDeviceKeyword = ''
      this.planForm = {
        editingId: '',
        name: '',
        deviceIds: [],
        completedDeviceIds: [],
        frequency: '每3个月',
        plannedDate: localDateTime().slice(0, 10),
        serviceType: '内部维保',
        vendor: '',
        owner: '',
        advanceDays: 7
      }
    },
    openPlanDialog(row) {
      this.resetPlanForm()
      if (row) {
        this.planForm = {
          editingId: row.id,
          name: row.name,
          deviceIds: row.deviceIds.slice(),
          completedDeviceIds: row.completedDeviceIds.slice(),
          frequency: row.frequency,
          plannedDate: row.plannedDate,
          serviceType: row.serviceType,
          vendor: row.vendor === '-' ? '' : row.vendor,
          owner: row.owner,
          advanceDays: row.advanceDays
        }
      }
      this.planDialog = true
      this.$nextTick(() => this.$refs.planForm && this.$refs.planForm.clearValidate())
    },
    filterPlanDevices(keyword) {
      this.planDeviceKeyword = keyword
    },
    resetPlanDeviceKeyword() {
      this.planDeviceKeyword = ''
    },
    savePlan() {
      this.$refs.planForm.validate((valid) => {
        if (valid) this.$emit('save-plan', JSON.parse(JSON.stringify(this.planForm)))
      })
    }
  },
  mounted() {
    if (this.active) this.refreshLayout()
  },
  created() {
    this.resetPlanForm()
  }
}
</script>
