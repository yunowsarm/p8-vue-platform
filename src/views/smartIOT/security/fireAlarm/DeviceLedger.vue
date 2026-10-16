<template>
  <div class="maintenance-list">
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input v-model.trim="keyword" size="small" clearable prefix-icon="el-icon-search" placeholder="设备编号 / 名称 / 位置" style="width: 260px" />
        <el-select v-model="typeId" size="small" clearable placeholder="设备类型" style="width: 150px">
          <el-option v-for="item in deviceTypes" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <el-select v-model="status" size="small" clearable placeholder="维保计划" style="width: 130px"><el-option v-for="item in deviceStatuses" :key="item" :label="item" :value="item" /></el-select>
      </div>
      <div class="toolbar-right">
        <el-button size="small" :disabled="saving" icon="el-icon-collection" @click="openTypeDialog">设备类型管理</el-button>
        <el-button type="primary" size="small" :disabled="saving || blocked" icon="el-icon-plus" @click="openDeviceDialog()">新增设备</el-button>
      </div>
    </div>
    <div class="maintenance-table-area">
      <el-table ref="table" :data="pagedRows" size="small" stripe height="100%" @row-click="$emit('detail', $event)">
        <el-table-column prop="deviceCode" label="设备编号" width="135" show-overflow-tooltip />
        <el-table-column prop="name" label="设备名称" min-width="170" show-overflow-tooltip />
        <el-table-column prop="category" label="设备类型" width="130" show-overflow-tooltip />
        <el-table-column prop="installLocation" label="安装位置" min-width="190" show-overflow-tooltip />
        <el-table-column label="品牌 / 型号" min-width="160" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.brand || '—' }} / {{ scope.row.model || '—' }}</template>
        </el-table-column>
        <el-table-column label="下次维保日期" width="135">
          <template slot-scope="scope">
            <el-tooltip v-if="nextPlan(scope.row.id)" :content="nextPlan(scope.row.id).name" placement="top">
              <span class="plan-date">{{ nextPlan(scope.row.id).plannedDate || '未设日期' }}</span>
            </el-tooltip>
            <span v-else class="muted-text">未安排计划</span>
          </template>
        </el-table-column>
        <el-table-column label="维保计划" width="110">
          <template slot-scope="scope">
            <span :class="['status-pill', statusClass(deviceMaintenanceStatus(scope.row))]">{{ deviceMaintenanceStatus(scope.row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" class-name="maintenance-actions-column" width="215" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click.stop="$emit('detail', scope.row)">详情</el-button>
            <el-button type="text" size="mini" :disabled="saving || blocked" @click.stop="openDeviceDialog(scope.row)">编辑</el-button>
            <el-button v-if="nextPlan(scope.row.id)" type="text" size="mini" @click.stop="$emit('view-plan', nextPlan(scope.row.id).id)">查看计划</el-button>
            <el-button v-else type="text" size="mini" :disabled="saving || blocked" @click.stop="$emit('schedule', scope.row)">安排计划</el-button>
            <el-tooltip :disabled="!hasHistory(scope.row.id)" content="已关联计划或历史记录，需保留设备档案" placement="top">
              <span class="action-wrapper" @click.stop>
                <el-button type="text" size="mini" :disabled="saving || blocked || hasHistory(scope.row.id)" @click.stop="$emit('delete-device', scope.row)">删除</el-button>
              </span>
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
      :title="deviceForm.id ? '编辑消防设备' : '新增消防设备'"
      :visible.sync="deviceDialog"
      width="650px"
      custom-class="maintenance-dialog fire-maintenance-dialog"
      :close-on-click-modal="false"
      :before-close="closeWhenIdle">
      <el-alert v-if="blocked" title="数据读取失败，可关闭弹窗或重新加载后继续填写" type="error" :closable="false" />
      <el-button v-if="blocked" size="mini" :disabled="saving" @click="$emit('reload')">重新加载</el-button>
      <div v-if="!deviceTypes.length && !blocked" class="dialog-intro">
        <span>尚未添加设备类型，请先添加类型后继续填写设备。</span>
        <el-button type="text" @click="openTypeDialog">添加设备类型</el-button>
      </div>
      <el-form ref="deviceForm" :model="deviceForm" :rules="deviceRules" label-width="95px" size="small" :disabled="saving || blocked">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="设备编号" prop="deviceCode"><el-input v-model.trim="deviceForm.deviceCode" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备类型" prop="typeId">
              <el-select v-model="deviceForm.typeId" filterable style="width: 100%"><el-option v-for="item in deviceTypes" :key="item.id" :label="item.name" :value="item.id" /></el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="设备名称" prop="name"><el-input v-model.trim="deviceForm.name" /></el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="品牌"><el-input v-model.trim="deviceForm.brand" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="型号"><el-input v-model.trim="deviceForm.model" /></el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="安装位置"><el-input v-model.trim="deviceForm.installLocation" placeholder="填写建筑、楼层及具体位置" /></el-form-item>
        <el-form-item label="安装日期"><el-date-picker v-model="deviceForm.installDate" type="date" value-format="yyyy-MM-dd" style="width: 100%" /></el-form-item>
      </el-form>
      <span slot="footer">
        <el-button :disabled="saving" @click="deviceDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" :disabled="blocked || !deviceTypes.length" @click="saveDevice">保存设备</el-button>
      </span>
    </el-dialog>
    <el-dialog append-to-body title="设备类型管理" :visible.sync="typeDialog" width="620px" custom-class="maintenance-dialog fire-maintenance-dialog" :before-close="closeWhenIdle">
      <el-alert v-if="blocked" title="页面数据读取失败，可重新加载或关闭弹窗" type="error" :closable="false" />
      <el-button v-if="blocked" size="mini" :disabled="saving" @click="$emit('reload')">重新加载页面数据</el-button>
      <el-alert v-if="typeError" :title="typeError" type="error" :closable="false" show-icon />
      <el-button v-if="typeError" size="mini" :disabled="typeLoading" @click="$emit('load-types')">重新加载类型</el-button>
      <div class="type-create">
        <el-input
          v-model.trim="newTypeName"
          size="small"
          maxlength="30"
          :disabled="saving || blocked || typeLoading || !!typeError"
          placeholder="输入设备类型名称"
          @keyup.enter.native="addDeviceType" />
        <el-button type="primary" size="small" :loading="saving" :disabled="blocked || typeLoading || !!typeError" @click="addDeviceType">添加类型</el-button>
      </div>
      <el-table v-loading="typeLoading" :data="typeError ? [] : categoryStats" size="small" max-height="320">
        <el-table-column prop="name" label="类型名称" min-width="180" />
        <el-table-column prop="total" label="设备数量" width="95" />
        <el-table-column label="操作" class-name="maintenance-actions-column" width="150">
          <template slot-scope="scope">
            <el-button type="text" size="mini" :disabled="saving || blocked || typeLoading" @click="$emit('rename-type', scope.row)">重命名</el-button>
            <el-tooltip :disabled="!scope.row.total" content="该类型下已有设备，无法删除" placement="top">
              <span class="action-wrapper">
                <el-button type="text" size="mini" :disabled="saving || blocked || typeLoading || !!scope.row.total" @click="$emit('remove-type', scope.row)">删除</el-button>
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer"><el-button :disabled="saving" @click="typeDialog = false">完成</el-button></span>
    </el-dialog>
  </div>
</template>
<script>
import { requestMaintenance, maintenanceToday } from '@/service/maintenance'
export default {
  name: 'DeviceLedger',
  props: {
    pageSize: { type: Number, required: true },
    active: Boolean,
    saving: Boolean,
    blocked: Boolean,
    hasHistory: { type: Function, default: () => false },
    refreshOptions: { type: Function, default: () => Promise.resolve(true) },
    typeLoading: Boolean,
    typeError: { type: String, default: '' },
    devices: { type: Array, required: true },
    deviceTypes: { type: Array, required: true },
    categoryStats: { type: Array, required: true },
    devicePlans: { type: Function, required: true },
    deviceMaintenanceStatus: { type: Function, required: true }
  },
  data() {
    return {
      page: 1,
      keyword: '',
      typeId: '',
      status: '',
      deviceDialog: false,
      detailLoading: false,
      deviceForm: {},
      typeDialog: false,
      newTypeName: '',
      deviceRules: {
        deviceCode: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
        name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
        typeId: [{ required: true, message: '请选择设备类型', trigger: 'change' }]
      }
    }
  },
  computed: {
    filteredRows() {
      const keyword = this.keyword.toLowerCase()
      return this.devices.filter(
        (item) =>
          (!keyword || [item.deviceCode, item.name, item.installLocation].join(' ').toLowerCase().includes(keyword)) &&
          (!this.typeId || item.typeId === this.typeId) &&
          (!this.status || this.deviceMaintenanceStatus(item) === this.status)
      )
    },
    deviceStatuses() {
      return [...new Set(this.devices.map((item) => this.deviceMaintenanceStatus(item)))]
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
      this.page = 1
    },
    typeId() {
      this.page = 1
    },
    status() {
      this.page = 1
    },
    deviceTypes() {
      if (this.typeId && !this.deviceTypes.some((item) => item.id === this.typeId)) this.typeId = ''
      if (this.deviceDialog && !this.deviceForm.typeId && this.deviceTypes.length === 1) this.deviceForm.typeId = this.deviceTypes[0].id
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
    nextPlan(id) {
      return this.devicePlans(id)[0] || null
    },
    statusClass(status) {
      return /逾期/.test(status) ? 'danger' : /即将|今日/.test(status) ? 'warning' : 'info'
    },
    closeWhenIdle(done) {
      if (!this.saving) done()
    },
    closeDeviceDialog() {
      this.deviceDialog = false
    },
    async openDeviceDialog(row) {
      if (this.detailLoading || this.saving || this.blocked) return
      this.detailLoading = true
      try {
        if (!(await this.refreshOptions('device'))) return
        this.deviceForm = { deviceCode: '', typeId: '', name: '', brand: '', model: '', installLocation: '', installDate: maintenanceToday() }
        if (row) {
          const value = await requestMaintenance(this.$api, 'device', 'queryById', { id: row.id })
          if (!value || !value.id) throw new Error('设备详情不存在')
          this.deviceForm = { ...value, id: String(value.id), typeId: String(value.typeId || ''), installDate: (value.installDate || '').slice(0, 10) || null }
        }
        this.deviceDialog = true
        this.$nextTick(() => this.$refs.deviceForm && this.$refs.deviceForm.clearValidate())
      } catch (error) {
        this.$message.error(error.message || '设备信息加载失败')
      } finally {
        this.detailLoading = false
      }
    },
    saveDevice() {
      if (!this.saving && !this.blocked)
        this.$refs.deviceForm.validate((valid) => {
          if (valid) this.$emit('save-device', { ...this.deviceForm })
        })
    },
    openTypeDialog() {
      this.newTypeName = ''
      this.typeDialog = true
      this.$emit('load-types')
    },
    addDeviceType() {
      if (this.saving || this.blocked || this.typeLoading || this.typeError) return
      const name = this.newTypeName.trim()
      if (!name) return this.$message.warning('请输入设备类型名称')
      if (this.deviceTypes.some((item) => item.name === name)) return this.$message.warning('该设备类型已存在')
      this.$emit('add-type', name)
    }
  }
}
</script>
