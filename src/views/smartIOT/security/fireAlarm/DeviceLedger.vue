<template>
  <div class="maintenance-list">
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input v-model.trim="deviceKeyword" size="small" clearable prefix-icon="el-icon-search" placeholder="设备编号 / 名称 / 位置" style="width: 230px"></el-input>
        <el-select v-model="deviceCategory" size="small" clearable placeholder="设备类型" style="width: 150px">
          <el-option v-for="item in categories" :key="item" :label="item" :value="item"></el-option>
        </el-select>
        <el-select v-model="deviceStatus" size="small" clearable placeholder="维保状态" style="width: 130px">
          <el-option v-for="item in deviceStatuses" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button size="small" icon="el-icon-collection" @click="openTypeDialog()">设备类型管理</el-button>
        <el-button type="primary" size="small" icon="el-icon-plus" @click="openDeviceDialog()">新增设备</el-button>
      </div>
    </div>
    <div class="maintenance-table-area">
      <el-table ref="table" :data="pagedRows" size="small" stripe height="100%" @row-click="$emit('detail', $event)">
        <el-table-column prop="id" label="设备编号" width="112"></el-table-column>
        <el-table-column prop="name" label="设备名称" min-width="170" show-overflow-tooltip></el-table-column>
        <el-table-column prop="category" label="设备类型" width="112" show-overflow-tooltip></el-table-column>
        <el-table-column label="安装位置" min-width="170" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.building }} / {{ scope.row.floor }} / {{ scope.row.location }}</template>
        </el-table-column>
        <el-table-column label="品牌 / 型号" min-width="150" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.brand || '—' }} / {{ scope.row.model || '—' }}</template>
        </el-table-column>
        <el-table-column label="下次维保日期" width="125">
          <template slot-scope="scope">
            <el-tooltip v-if="nextPlan(scope.row.id)" :content="nextPlan(scope.row.id).name" placement="top">
              <span class="plan-date">{{ nextPlan(scope.row.id).plannedDate }}</span>
            </el-tooltip>
            <span v-else class="muted-text">未安排计划</span>
          </template>
        </el-table-column>
        <el-table-column prop="owner" label="责任人" width="75"></el-table-column>
        <el-table-column label="维保状态" width="100">
          <template slot-scope="scope">
            <span :class="['status-pill', statusClass(deviceMaintenanceStatus(scope.row))]">{{ deviceMaintenanceStatus(scope.row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click.stop="$emit('detail', scope.row)">详情</el-button>
            <el-button type="text" size="mini" @click.stop="openDeviceDialog(scope.row)">编辑</el-button>
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
    <el-dialog append-to-body :title="deviceForm.editingId ? '编辑消防设备' : '新增消防设备'" :visible.sync="deviceDialog" width="720px" custom-class="maintenance-dialog fire-maintenance-dialog">
      <div class="dialog-intro">
        <i class="el-icon-info"></i>
        台账维护设备基础信息；维保频次、执行日期与负责人统一在维保计划中安排。
      </div>
      <el-form ref="deviceForm" :model="deviceForm" :rules="deviceRules" label-width="105px" size="small">
        <div class="form-section-title">基础信息</div>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="设备编号" prop="id"><el-input v-model.trim="deviceForm.id" :disabled="!!deviceForm.editingId"></el-input></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备类型" prop="category">
              <el-select v-model="deviceForm.category" style="width: 100%"><el-option v-for="item in categories" :key="item" :label="item" :value="item"></el-option></el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="设备名称" prop="name"><el-input v-model.trim="deviceForm.name"></el-input></el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="品牌"><el-input v-model.trim="deviceForm.brand"></el-input></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格型号"><el-input v-model.trim="deviceForm.model"></el-input></el-form-item>
          </el-col>
        </el-row>
        <div class="form-section-title">安装与责任信息</div>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="建筑" prop="building">
              <el-select v-model="deviceForm.building" style="width: 100%"><el-option v-for="item in buildings" :key="item" :label="item" :value="item"></el-option></el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="楼层"><el-input v-model.trim="deviceForm.floor"></el-input></el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="具体位置" prop="location"><el-input v-model.trim="deviceForm.location"></el-input></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="责任部门"><el-input v-model.trim="deviceForm.department"></el-input></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="责任人" prop="owner"><el-input v-model.trim="deviceForm.owner"></el-input></el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="安装日期"><el-date-picker v-model="deviceForm.installDate" type="date" value-format="yyyy-MM-dd" style="width: 100%"></el-date-picker></el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="deviceDialog = false">取消</el-button>
        <el-button type="primary" @click="saveDevice">保存设备档案</el-button>
      </span>
    </el-dialog>
    <el-dialog append-to-body title="设备类型管理" :visible.sync="typeDialog" width="620px" custom-class="maintenance-dialog fire-maintenance-dialog">
      <div class="dialog-intro">
        <i class="el-icon-info"></i>
        类型用于台账分类和计划筛选，已被设备使用的类型不能删除。
      </div>
      <div class="type-create">
        <el-input v-model.trim="newTypeName" size="small" maxlength="30" placeholder="输入设备类型名称" @keyup.enter.native="addDeviceType" />
        <el-button type="primary" size="small" @click="addDeviceType">添加类型</el-button>
      </div>
      <el-table :data="categoryStats" size="small" max-height="320">
        <el-table-column prop="name" label="类型名称" min-width="180" />
        <el-table-column prop="total" label="设备数量" width="95" />
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="$emit('rename-type', scope.row.name)">重命名</el-button>
            <el-tooltip :disabled="!scope.row.total" content="该类型下已有设备，无法删除" placement="top">
              <span class="action-wrapper"><el-button type="text" size="mini" :disabled="!!scope.row.total" @click="$emit('remove-type', scope.row.name)">删除</el-button></span>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer"><el-button @click="typeDialog = false">完成</el-button></span>
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
  name: 'DeviceLedger',
  props: {
    pageSize: { type: Number, required: true },
    active: Boolean,
    devices: { type: Array, required: true },
    plans: { type: Array, required: true },
    categories: { type: Array, required: true },
    buildings: { type: Array, required: true },
    categoryStats: { type: Array, required: true },
    devicePlans: { type: Function, required: true },
    deviceMaintenanceStatus: { type: Function, required: true }
  },
  data() {
    return {
      page: 1,
      deviceKeyword: '',
      deviceCategory: '',
      deviceStatus: '',
      deviceDialog: false,
      deviceForm: {},
      deviceRules: {
        id: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
        name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
        category: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
        building: [{ required: true, message: '请选择建筑', trigger: 'change' }],
        location: [{ required: true, message: '请输入具体位置', trigger: 'blur' }],
        owner: [{ required: true, message: '请输入责任人', trigger: 'blur' }]
      },
      typeDialog: false,
      newTypeName: ''
    }
  },
  computed: {
    pagedRows() {
      const start = (this.page - 1) * this.pageSize
      return this.filteredRows.slice(start, start + this.pageSize)
    },
    deviceStatuses() {
      return [...new Set(this.devices.map((item) => this.deviceMaintenanceStatus(item)))]
    },
    filteredRows() {
      const keyword = this.deviceKeyword.toLowerCase()
      return this.devices.filter(
        (item) =>
          (!keyword || [item.id, item.name, item.building, item.floor, item.location].join(' ').toLowerCase().includes(keyword)) &&
          (!this.deviceCategory || item.category === this.deviceCategory) &&
          (!this.deviceStatus || this.deviceMaintenanceStatus(item) === this.deviceStatus)
      )
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
    deviceKeyword() {
      this.page = 1
    },
    deviceCategory() {
      this.page = 1
    },
    deviceStatus() {
      this.page = 1
    },
    categories() {
      this.watchCategories()
    }
  },
  methods: {
    refreshLayout() {
      this.$nextTick(() => {
        if (this.$refs.table) this.$refs.table.doLayout()
      })
    },
    watchCategories() {
      if (this.deviceCategory && !this.categories.includes(this.deviceCategory)) this.deviceCategory = ''
    },
    nextPlan(id) {
      return this.devicePlans(id)[0] || null
    },
    statusClass(status) {
      if (/逾期|故障/.test(status)) return 'danger'
      if (/即将|今日|执行中/.test(status)) return 'warning'
      if (/完成|正常/.test(status)) return 'success'
      return 'info'
    },
    closeDeviceDialog() {
      this.deviceDialog = false
    },
    resetDeviceForm() {
      this.deviceForm = {
        editingId: '',
        id: '',
        name: '',
        category: '',
        building: '',
        floor: '1F',
        location: '',
        brand: '',
        model: '',
        installDate: localDateTime().slice(0, 10),
        lastDate: '-',
        owner: '',
        department: '园区工程部',
        status: '正常',
        qrCode: ''
      }
    },
    openDeviceDialog(row) {
      this.resetDeviceForm()
      if (row) this.deviceForm = { ...JSON.parse(JSON.stringify(row)), editingId: row.id }
      this.deviceDialog = true
      this.$nextTick(() => this.$refs.deviceForm && this.$refs.deviceForm.clearValidate())
    },
    saveDevice() {
      this.$refs.deviceForm.validate((valid) => {
        if (valid) this.$emit('save-device', JSON.parse(JSON.stringify(this.deviceForm)))
      })
    },
    openTypeDialog() {
      this.newTypeName = ''
      this.typeDialog = true
    },
    addDeviceType() {
      const name = this.newTypeName.trim()
      if (!name) return this.$message.warning('请输入设备类型名称')
      if (this.categoryStats.some((item) => item.name === name)) return this.$message.warning('该设备类型已存在')
      this.$emit('add-type', name)
      this.newTypeName = ''
    }
  },
  mounted() {
    if (this.active) this.refreshLayout()
  },
  created() {
    this.resetDeviceForm()
  }
}
</script>
