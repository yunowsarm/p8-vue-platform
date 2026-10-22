<template>
  <div class="car-ownership-manage">
    <div class="query-card">
      <div class="query-form">
        <el-input v-model.trim="query.plateNumber" clearable placeholder="搜索车牌号" size="small" @keyup.enter.native="search" />
        <el-select v-model="query.companyName" filterable clearable placeholder="全部企业" size="small"><el-option v-for="name in companyNames" :key="name" :label="name" :value="name" /></el-select>
        <el-button type="primary" size="small" :loading="loading" @click="search">查询</el-button>
        <el-button size="small" @click="resetFilters">重置</el-button>
      </div>
      <el-button size="small" icon="el-icon-refresh" :loading="loading" :disabled="mutating || saving" @click="loadData">刷新</el-button>
      <el-button type="primary" size="small" icon="el-icon-plus" :disabled="loading || !vehiclesReady || mutating" @click="openVehicle()">登记车辆</el-button>
    </div>
    <el-alert v-if="loadError" :title="loadError" type="error" :closable="false" show-icon />
    <div v-loading="loading || mutating" class="content">
      <div class="table-panel">
        <div class="panel-head">
          <h3>车辆信息</h3>
          <span>共 {{ filteredVehicles.length }} 辆 · 按车牌关联出入记录</span>
        </div>
        <div class="table-wrap">
          <vxe-table
            :scroll-y="{ enabled: true, gt: 20, oSize: 5 }"
            :scroll-x="{ enabled: true, gt: 8, oSize: 2 }"
            show-overflow="tooltip"
            align="center"
            header-align="center"
            :data="filteredVehicles"
            stripe
            border
            size="small"
            height="100%"
            empty-text="暂无车辆，请点击“登记车辆”添加">
            <vxe-column field="plateNumber" title="车牌号" min-width="130" fixed="left" />
            <vxe-column field="companyName" title="关联企业" min-width="190" show-overflow="tooltip" />
            <vxe-column v-for="field in vehicleFields" :key="field.key" :field="field.key" :title="field.label" min-width="125" show-overflow="tooltip" />
            <vxe-column title="创建时间" width="170">
              <template slot-scope="scope">{{ formatDate(scope.row.createTime) }}</template>
            </vxe-column>
            <vxe-column title="更新时间" width="170">
              <template slot-scope="scope">{{ formatDate(scope.row.updateTime) }}</template>
            </vxe-column>
            <vxe-column title="操作" width="120" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" size="small" :disabled="mutating" @click="openVehicle(scope.row)">编辑</el-button>
                <el-button type="text" size="small" class="danger" :disabled="mutating" @click="deleteVehicle(scope.row)">删除</el-button>
              </template>
            </vxe-column>
          </vxe-table>
        </div>
      </div>
    </div>
    <el-dialog :title="vehicleForm.id ? '编辑车辆' : '登记车辆'" :visible.sync="vehicleVisible" width="620px" append-to-body :close-on-click-modal="false" :before-close="closeVehicle">
      <el-form ref="vehicleForm" :model="vehicleForm" :rules="vehicleRules" label-width="100px" size="small" :disabled="saving">
        <el-form-item label="车牌号" prop="plateNumber"><el-input v-model.trim="vehicleForm.plateNumber" maxlength="20" placeholder="请输入车牌号" /></el-form-item>
        <el-form-item label="关联企业" prop="companyName">
          <el-select v-model="vehicleForm.companyName" filterable allow-create default-first-option clearable placeholder="选择企业或输入企业全称" class="full-width">
            <el-option v-for="name in companyNames" :key="name" :label="name" :value="name" />
          </el-select>
          <div class="field-tip">按企业名称保存关联，个人车辆可留空。</div>
        </el-form-item>
        <el-form-item v-for="field in vehicleFields" :key="field.key" :label="field.label" :prop="field.key">
          <el-input v-model.trim="vehicleForm[field.key]" :maxlength="field.key === 'ownerPhone' ? 30 : 80" :placeholder="`请输入${field.label}`" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button :disabled="saving" @click="closeVehicle()">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveVehicle">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { fetchAll, parkingRequest } from '@/service/barrierGate'
import { clean, plateKey, dateLabel } from './data'
const blankVehicle = () => ({ plateNumber: '', companyName: '', ownerName: '', ownerPhone: '', plateColor: '', vehicleType: '', parkingSpaceNumber: '' })
const vehicleFields = [
  { key: 'ownerName', label: '车主姓名' },
  { key: 'ownerPhone', label: '车主电话' },
  { key: 'plateColor', label: '车牌颜色' },
  { key: 'vehicleType', label: '车辆类型' },
  { key: 'parkingSpaceNumber', label: '车位号' }
]

export default {
  name: 'CarOwnershipManage',
  data() {
    return {
      query: { plateNumber: '', companyName: '' },
      filters: { plateNumber: '', companyName: '' },
      vehicles: [],
      enterpriseNames: [],
      loading: false,
      loadError: '',
      requestId: 0,
      mutating: false,
      saving: false,
      vehiclesReady: false,
      vehicleVisible: false,
      vehicleForm: blankVehicle(),
      vehicleFields,
      vehicleRules: { plateNumber: [{ required: true, message: '请输入车牌号', trigger: 'blur' }] }
    }
  },
  computed: {
    companyNames() {
      return [...new Set([...this.enterpriseNames, ...this.vehicles.map((v) => clean(v.companyName))].filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-CN'))
    },
    filteredVehicles() {
      return Object.freeze(
        this.vehicles.filter((v) => plateKey(v.plateNumber).includes(plateKey(this.filters.plateNumber)) && (!this.filters.companyName || clean(v.companyName) === this.filters.companyName))
      )
    }
  },
  mounted() {
    this.loadData()
    this.loadCompanies()
  },
  activated() {
    if (this.vehiclesReady) this.loadData()
  },
  beforeDestroy() {
    this.requestId++
  },
  methods: {
    formatDate: dateLabel,
    errorText(error, fallback) {
      return (error && (error.message || error.msg || (error.head && error.head.message))) || fallback
    },
    search() {
      this.filters = { ...this.query }
    },
    resetFilters() {
      this.query = { plateNumber: '', companyName: '' }
      this.search()
    },
    async loadData() {
      const id = ++this.requestId
      this.loading = true
      this.loadError = ''
      try {
        const rows = await fetchAll(this.$api, 'parkingVehicleInfo.list', () => id === this.requestId)
        if (id !== this.requestId) return
        this.vehicles = Object.freeze(rows)
        this.vehiclesReady = true
      } catch (error) {
        if (id === this.requestId) {
          this.loadError = this.errorText(error, '车辆列表加载失败')
          this.vehicles = []
          this.vehiclesReady = false
        }
      } finally {
        if (id === this.requestId) this.loading = false
      }
    },
    async loadCompanies() {
      if (!this.$api || !this.$api['baseData.EnterpriseName']) return
      try {
        const names = []
        for (let current = 1; current <= 100; current++) {
          const response = await this.$api['baseData.EnterpriseName']({
            sqlParam: {},
            reportId: '70ea54fff5864756956d',
            reportParam: {},
            router: 'EnterpriseDirectory',
            code: 'enterpriseDirectoryList',
            permissionVo: { router: 'EnterpriseDirectory', resourceId: '' },
            page: { current, size: 200, orders: [] }
          })
          if (this._isDestroyed) return
          if (!response || !Array.isArray(response.records)) throw new Error('企业列表格式异常')
          names.push(...response.records.map((row) => clean(row.ENTERPRISE_FULLNAME)))
          if (!response.records.length || (response.total !== undefined ? current * 200 >= Number(response.total) : response.records.length < 200)) break
        }
        this.enterpriseNames = names
      } catch (error) {
        if (!this._isDestroyed) this.$message.warning('企业目录加载失败，仍可手动输入企业全称')
      }
    },
    async openVehicle(row) {
      if (this.mutating || !this.vehiclesReady) return
      this.mutating = true
      try {
        let values = blankVehicle()
        if (row) {
          if (!row.id) throw new Error('车辆缺少 ID，无法编辑')
          const detail = await parkingRequest(this.$api, 'parkingVehicleInfo.queryById', { id: row.id })
          if (!detail || typeof detail !== 'object' || !detail.id) throw new Error('车辆详情返回异常')
          values = { ...values, ...detail }
        }
        this.vehicleForm = values
        this.vehicleVisible = true
        this.$nextTick(() => {
          if (this.$refs.vehicleForm) this.$refs.vehicleForm.clearValidate()
        })
      } catch (error) {
        this.$message.error(this.errorText(error, '获取车辆详情失败'))
      } finally {
        this.mutating = false
      }
    },
    closeVehicle(done) {
      if (this.saving) return
      this.vehicleVisible = false
      if (done) done()
    },
    async saveVehicle() {
      if (this.saving) return
      const valid = await this.$refs.vehicleForm.validate().catch(() => false)
      if (!valid) return
      const plate = plateKey(this.vehicleForm.plateNumber)
      if (this.vehicles.some((v) => plateKey(v.plateNumber) === plate && v.id !== this.vehicleForm.id)) {
        this.$message.warning('该车牌已登记，请编辑现有车辆')
        return
      }
      const payload = { plateNumber: plate, companyName: clean(this.vehicleForm.companyName) }
      vehicleFields.forEach((field) => {
        payload[field.key] = clean(this.vehicleForm[field.key])
      })
      if (this.vehicleForm.id) payload.id = this.vehicleForm.id
      this.saving = true
      try {
        await parkingRequest(this.$api, payload.id ? 'parkingVehicleInfo.edit' : 'parkingVehicleInfo.add', payload)
        this.vehicleVisible = false
        this.$message.success('车辆信息已保存')
        await this.loadData()
      } catch (error) {
        this.$message.error(this.errorText(error, '保存车辆失败'))
      } finally {
        this.saving = false
      }
    },
    async deleteVehicle(row) {
      if (this.mutating) return
      if (!row.id) {
        this.$message.error('车辆缺少 ID，无法删除')
        return
      }
      try {
        await this.$confirm(`确认删除车辆 ${row.plateNumber} 的登记信息？关联企业分析将同步更新。`, '删除车辆', { type: 'warning' })
      } catch (error) {
        return
      }
      this.mutating = true
      try {
        await parkingRequest(this.$api, 'parkingVehicleInfo.delete', { id: row.id })
        this.$message.success('车辆登记已删除')
        await this.loadData()
      } catch (error) {
        this.$message.error(this.errorText(error, '删除车辆失败'))
      } finally {
        this.mutating = false
      }
    }
  }
}
</script>
<style scoped>
.car-ownership-manage {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  color: #27364a;
  overflow: hidden;
}
.query-card {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin: 8px 10px 0;
  padding: 7px 12px;
  background: #fff;
  border: 1px solid #e7ebf1;
  border-radius: 8px;
}
.query-form {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  flex-wrap: wrap;
}
.query-form .el-input {
  width: 180px;
}
.query-form .el-select {
  width: 220px;
}
.content {
  flex: 1;
  min-height: 0;
  padding: 8px 10px 23px;
}
.table-panel {
  height: 100%;
  box-sizing: border-box;
  background: #fff;
  border: 1px solid #e7ebf1;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.table-wrap {
  flex: 1;
  min-height: 0;
  min-width: 0;
}
.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
}
h3 {
  font-size: 15px;
  margin: 0;
}
.panel-head span,
.field-tip {
  color: #8b97a7;
  font-size: 12px;
}
.full-width {
  width: 100%;
}
.danger {
  color: #f56c6c;
}
.el-alert {
  width: auto;
  margin: 8px 10px 0;
}
</style>
