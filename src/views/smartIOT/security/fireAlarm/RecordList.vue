<template>
  <div class="maintenance-list">
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input v-model.trim="recordKeyword" size="small" clearable prefix-icon="el-icon-search" placeholder="记录编号 / 设备 / 执行人" style="width: 240px"></el-input>
        <el-select v-model="recordResult" size="small" clearable placeholder="维保结果" style="width: 130px">
          <el-option v-for="item in ['合格', '需维修', '不合格']" :key="item" :label="item" :value="item"></el-option>
        </el-select>
        <el-date-picker v-model="recordDate" type="date" size="small" value-format="yyyy-MM-dd" placeholder="维保日期" style="width: 150px"></el-date-picker>
      </div>
    </div>
    <div class="maintenance-table-area">
      <el-table ref="table" :data="pagedRows" size="small" stripe height="100%" @row-click="$emit('detail', $event)">
        <el-table-column prop="id" label="记录编号" width="140"></el-table-column>
        <el-table-column label="设备信息" min-width="180" show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.device }}</div>
            <small class="muted-text">{{ scope.row.category }}</small>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="维保时间" width="145"></el-table-column>
        <el-table-column prop="type" label="维保类型" width="95"></el-table-column>
        <el-table-column prop="executor" label="执行人" width="90"></el-table-column>
        <el-table-column prop="company" label="执行单位" min-width="145" show-overflow-tooltip></el-table-column>
        <el-table-column label="结果" width="88">
          <template slot-scope="scope">
            <span :class="['result-pill', resultClass(scope.row.result)]">{{ scope.row.result }}</span>
          </template>
        </el-table-column>
        <el-table-column label="现场凭证" width="90">
          <template slot-scope="scope">
            <span class="evidence-link">
              <i class="el-icon-picture-outline"></i>
              {{ scope.row.photos.length }}项
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="70" fixed="right">
          <template slot-scope="scope"><el-button type="text" size="mini" @click.stop="$emit('detail', scope.row)">详情</el-button></template>
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
      title="消防设备维保执行登记"
      :visible.sync="recordDialog"
      width="780px"
      custom-class="maintenance-dialog fire-maintenance-dialog record-dialog"
      :close-on-click-modal="false">
      <div class="dialog-intro">
        <i class="el-icon-edit-outline"></i>
        维保记录提交后不可直接删除；如需更正，应通过补充记录保留修改原因和人员。
      </div>
      <el-form ref="recordForm" :model="recordForm" :rules="recordRules" label-width="105px" size="small">
        <div class="form-section-title">执行对象</div>
        <el-row :gutter="16">
          <el-col :span="14">
            <el-form-item label="消防设备" prop="deviceId">
              <el-select v-model="recordForm.deviceId" filterable style="width: 100%" @change="onRecordDeviceChange">
                <el-option v-for="item in executionDevices" :key="item.id" :label="item.name + '（' + item.id + '）'" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="维保类型">
              <el-select v-model="recordForm.type" style="width: 100%">
                <el-option v-for="item in ['定期维保', '功能测试', '试运行', '故障检查', '逾期补检']" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="关联计划" prop="planId">
          <el-input :value="executionPlan ? executionPlan.name + ' · ' + executionPlan.plannedDate : ''" readonly />
        </el-form-item>
        <div v-if="recordDevice" class="device-summary">
          <span>
            <small>设备类型</small>
            <b>{{ recordDevice.category }}</b>
          </span>
          <span>
            <small>安装位置</small>
            <b>{{ recordDevice.building }} / {{ recordDevice.floor }} / {{ recordDevice.location }}</b>
          </span>
          <span>
            <small>当前状态</small>
            <b>{{ deviceMaintenanceStatus(recordDevice) }}</b>
          </span>
        </div>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="维保时间" prop="date"><el-date-picker v-model="recordForm.date" type="datetime" value-format="yyyy-MM-dd HH:mm" style="width: 100%"></el-date-picker></el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="执行人" prop="executor"><el-input v-model.trim="recordForm.executor"></el-input></el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="执行单位" prop="company"><el-input v-model.trim="recordForm.company"></el-input></el-form-item>
          </el-col>
        </el-row>
        <div class="form-section-title">检查项目</div>
        <div v-if="recordChecklist.length" class="checklist-grid">
          <el-checkbox v-for="item in recordChecklist" :key="item" v-model="recordForm.checkedItems" :label="item" border>{{ item }}</el-checkbox>
        </div>
        <div v-else class="checklist-empty">请先选择消防设备</div>
        <div class="form-section-title">维保结论与凭证</div>
        <el-row :gutter="16">
          <el-col :span="10">
            <el-form-item label="维保结果" prop="result">
              <el-radio-group v-model="recordForm.result">
                <el-radio label="合格"></el-radio>
                <el-radio label="需维修"></el-radio>
                <el-radio label="不合格"></el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <el-form-item label="后续维保">
              <span class="form-help">{{ followingPlan ? followingPlan.plannedDate + '（' + followingPlan.name + '）' : '暂无后续计划，请在计划管理中安排' }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="问题说明">
          <el-input v-model.trim="recordForm.issue" type="textarea" :rows="2" :placeholder="recordForm.result === '合格' ? '可填写现场调整情况' : '请填写缺陷、影响和后续处理要求'"></el-input>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="更换部件"><el-input v-model.trim="recordForm.parts"></el-input></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="维保费用"><el-input-number v-model="recordForm.cost" :min="0" :precision="2" style="width: 100%"></el-input-number></el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="现场凭证" required>
          <div class="evidence-uploader">
            <button type="button" @click="addEvidence">
              <i class="el-icon-plus"></i>
              <span>添加图片或视频</span>
            </button>
            <span v-for="(item, index) in recordForm.photos" :key="item" class="evidence-chip">
              <i :class="item.indexOf('视频') > -1 ? 'el-icon-video-camera' : 'el-icon-picture-outline'"></i>
              {{ item }}
              <button type="button" aria-label="移除凭证" @click="recordForm.photos.splice(index, 1)"><i class="el-icon-close"></i></button>
            </span>
          </div>
          <div class="form-help">仿真环境使用文件占位；正式系统应上传原图、拍摄时间和定位信息。</div>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="recordDialog = false">取消</el-button>
        <el-button type="primary" @click="saveRecord">提交维保记录</el-button>
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
  name: 'RecordList',
  props: {
    pageSize: { type: Number, required: true },
    active: Boolean,
    records: { type: Array, required: true },
    devices: { type: Array, required: true },
    plans: { type: Array, required: true },
    checkTemplates: { type: Object, required: true },
    devicePlans: { type: Function, required: true },
    deviceMaintenanceStatus: { type: Function, required: true }
  },
  data() {
    return {
      page: 1,
      recordKeyword: '',
      recordResult: '',
      recordDate: '',
      recordDialog: false,
      executionPlanId: '',
      recordForm: {},
      recordRules: {
        deviceId: [{ required: true, message: '请选择消防设备', trigger: 'change' }],
        planId: [{ required: true, message: '请选择关联维保计划', trigger: 'change' }],
        date: [{ required: true, message: '请选择维保时间', trigger: 'change' }],
        executor: [{ required: true, message: '请输入执行人', trigger: 'blur' }],
        company: [{ required: true, message: '请输入执行单位', trigger: 'blur' }],
        result: [{ required: true, message: '请选择维保结果', trigger: 'change' }]
      }
    }
  },
  computed: {
    executionPlan() {
      return this.plans.find((plan) => plan.id === this.executionPlanId) || null
    },
    executionDevices() {
      const plan = this.executionPlan
      return plan && plan.status !== '已完成' ? this.devices.filter((device) => plan.deviceIds.includes(device.id) && !plan.completedDeviceIds.includes(device.id)) : []
    },
    pagedRows() {
      const start = (this.page - 1) * this.pageSize
      return this.filteredRows.slice(start, start + this.pageSize)
    },
    filteredRows() {
      const keyword = this.recordKeyword.toLowerCase()
      return this.records.filter(
        (item) =>
          (!keyword || [item.id, item.device, item.executor, item.company].join(' ').toLowerCase().includes(keyword)) &&
          (!this.recordResult || item.result === this.recordResult) &&
          (!this.recordDate || item.date.indexOf(this.recordDate) === 0)
      )
    },
    pageRange() {
      return this.filteredRows.length ? '当前显示 ' + ((this.page - 1) * this.pageSize + 1) + '–' + Math.min(this.page * this.pageSize, this.filteredRows.length) + ' 条' : '暂无数据'
    },
    recordDevice() {
      return this.devices.find((item) => item.id === this.recordForm.deviceId) || null
    },
    recordChecklist() {
      return this.recordDevice ? this.checkTemplates[this.recordDevice.category] || ['外观与安装检查', '功能测试', '运行状态检查'] : []
    },
    followingPlan() {
      return this.devicePlans(this.recordForm.deviceId, this.recordForm.planId)[0] || null
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
    recordKeyword() {
      this.page = 1
    },
    recordResult() {
      this.page = 1
    },
    recordDate() {
      this.page = 1
    }
  },
  methods: {
    refreshLayout() {
      this.$nextTick(() => {
        if (this.$refs.table) this.$refs.table.doLayout()
      })
    },
    resultClass(result) {
      if (result === '合格') return 'success'
      if (result === '需维修') return 'warning'
      return 'danger'
    },
    closeRecordDialog() {
      this.recordDialog = false
    },
    resetRecordForm() {
      this.recordForm = {
        deviceId: '',
        planId: '',
        type: '定期维保',
        date: localDateTime(),
        executor: '',
        company: '园区工程部',
        checkedItems: [],
        result: '合格',
        issue: '',
        parts: '',
        cost: 0,
        photos: []
      }
    },
    openRecordDialog(device, plan, type = '定期维保') {
      if (!plan || !this.plans.some((item) => item.id === plan.id)) return this.$message.warning('请从维保计划的执行登记入口操作')
      if (!device || plan.status === '已完成' || !plan.deviceIds.includes(device.id) || plan.completedDeviceIds.includes(device.id)) return this.$message.warning('该计划暂无待登记设备')
      this.resetRecordForm()
      this.executionPlanId = plan.id
      this.recordForm.type = type
      this.recordForm.deviceId = device.id
      this.onRecordDeviceChange()
      this.recordDialog = true
      this.$nextTick(() => this.$refs.recordForm && this.$refs.recordForm.clearValidate())
    },
    onRecordDeviceChange() {
      this.recordForm.checkedItems = []
      this.recordForm.planId = this.executionPlanId
      this.onRecordPlanChange()
    },
    onRecordPlanChange() {
      const plan = this.plans.find((item) => item.id === this.recordForm.planId)
      this.recordForm.executor = plan ? plan.owner : ''
      this.recordForm.company = plan ? (plan.serviceType === '外委维保' ? plan.vendor : (this.recordDevice && this.recordDevice.department) || '园区工程部') : ''
    },
    addEvidence() {
      const index = this.recordForm.photos.length + 1
      this.recordForm.photos.push(index === 3 ? `现场视频${index}.mp4` : `现场照片${index}.jpg`)
    },
    saveRecord() {
      if (this.recordForm.planId !== this.executionPlanId || !this.executionDevices.some((device) => device.id === this.recordForm.deviceId))
        return this.$message.warning('该设备不属于当前计划或已完成登记，请重新选择')
      this.$refs.recordForm.validate((valid) => {
        if (valid) this.$emit('save-record', JSON.parse(JSON.stringify(this.recordForm)))
      })
    }
  },
  mounted() {
    if (this.active) this.refreshLayout()
  },
  created() {
    this.resetRecordForm()
  }
}
</script>
