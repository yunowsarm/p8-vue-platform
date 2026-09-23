<template>
  <div class="park-manage">
    <!-- 顶部搜索与工具栏 -->
    <div class="park-manage__toolbar">
      <div class="park-manage__filters">
        <el-input v-model="searchForm.parkName" placeholder="园区名称" clearable style="width: 180px" />
        <el-select v-model="searchForm.type" placeholder="类型" clearable style="width: 160px">
          <el-option label="运营中" value="运营中" />
          <el-option label="招商中" value="招商中" />
          <el-option label="已停用" value="已停用" />
        </el-select>
        <el-input v-model="searchForm.region" placeholder="所属区域" clearable style="width: 180px" />
        <el-input v-model="searchForm.priceStandard" placeholder="租金/售价标准" clearable style="width: 180px" />
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
        <el-button icon="el-icon-refresh-right" @click="handleSearchReset">重置</el-button>
      </div>
      <div class="park-manage__actions">
        <el-button type="primary" icon="el-icon-plus" @click="handleCreate">新建园区</el-button>
        <el-radio-group v-model="viewMode" size="small" class="park-manage__view-switch">
          <el-radio-button label="grid"><i class="el-icon-s-grid" /> 网格</el-radio-button>
          <el-radio-button label="list"><i class="el-icon-s-fold" /> 列表</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 主体：左侧统计区 + 右侧内容区 -->
    <div class="park-manage__body">
      <!-- 左侧统计区 -->
      <div class="park-manage__stats">
        <div class="park-manage__gauge-wrap">
          <div class="park-manage__gauge-title">招商率</div>
          <div class="park-manage__gauge-value">{{ formatNumber(parkStats.occupancyRate, 2) }}%</div>
          <div ref="gaugeChart" class="park-manage__gauge-chart" />
        </div>
        <div class="park-manage__stat-items">
          <div class="park-manage__stat-item">
            <div class="park-manage__stat-label">总招商面积(㎡)</div>
            <div class="park-manage__stat-num">{{ formatNumber(parkStats.totalArea, 2) }}</div>
          </div>
          <div class="park-manage__stat-item">
            <div class="park-manage__stat-label">剩余可招商面积(㎡)</div>
            <div class="park-manage__stat-num">{{ formatNumber(parkStats.remainingArea, 2) }}</div>
          </div>
          <div class="park-manage__stat-item">
            <div class="park-manage__stat-label">已招商面积(㎡)</div>
            <div class="park-manage__stat-num">{{ formatNumber(parkStats.rentedArea, 2) }}</div>
          </div>
          <div class="park-manage__stat-item">
            <div class="park-manage__stat-label">园区总数</div>
            <div class="park-manage__stat-num">{{ parkStats.totalCount }}</div>
          </div>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div class="park-manage__content">
        <!-- 网格视图（默认） -->
        <div v-if="viewMode === 'grid'" v-loading="loading" class="park-manage__grid">
          <el-row :gutter="20">
            <el-col v-for="item in parkList" :key="item.id" :xs="24" :sm="12" :md="12" :lg="12" :xl="8">
              <div class="park-manage__card">
                <div class="park-manage__card-header">
                  <div class="park-manage__card-title">{{ item.parkName || '未命名园区' }}</div>
                  <el-tag v-if="item.parkStatus" size="mini" :type="item.parkStatus === '运营中' ? 'success' : item.parkStatus === '招商中' ? 'primary' : 'info'">{{ item.parkStatus }}</el-tag>
                </div>
                <div class="park-manage__card-body">
                  <div class="park-manage__card-row">
                    <span class="park-manage__card-label">所属区域</span>
                    <span class="park-manage__card-value" :title="item.city">{{ item.city || '--' }}</span>
                  </div>
                  <div class="park-manage__card-row">
                    <span class="park-manage__card-label">地址</span>
                    <span class="park-manage__card-value" :title="item.address">{{ item.address || '--' }}</span>
                  </div>
                  <div class="park-manage__card-row">
                    <span class="park-manage__card-label">总建筑面积</span>
                    <span class="park-manage__card-value">{{ item.totalBuildingArea || '--' }}㎡</span>
                  </div>
                  <div class="park-manage__card-row">
                    <span class="park-manage__card-label">可招商面积</span>
                    <span class="park-manage__card-value">{{ item.rentableArea || '--' }}㎡</span>
                  </div>
                  <div class="park-manage__card-row">
                    <span class="park-manage__card-label">租金/售价标准</span>
                    <span class="park-manage__card-value">{{ item.priceStandard || '--' }}</span>
                  </div>
                  <div class="park-manage__card-row">
                    <span class="park-manage__card-label">产品定位</span>
                    <span class="park-manage__card-value">{{ formatDictLabels(item.parkPositioning, positioningOptions) || '--' }}</span>
                  </div>
                  <div class="park-manage__card-row">
                    <span class="park-manage__card-label">配套设施</span>
                    <span class="park-manage__card-value">{{ formatDictLabels(item.supportingFacilities, supportingFacilitiesOptions) || '--' }}</span>
                  </div>
                  <div class="park-manage__card-row">
                    <span class="park-manage__card-label">政策支持</span>
                    <span class="park-manage__card-value">
                      <template v-if="getPolicySupportList(item).length">
                        <span
                          v-for="(policy, idx) in getPolicySupportList(item)"
                          :key="idx"
                          class="park-manage__policy-link"
                          :title="policy.name"
                          @click="handleShowPolicyDetail(policy)">
                          {{ policy.name }}<i v-if="idx < getPolicySupportList(item).length - 1">、</i>
                        </span>
                      </template>
                      <template v-else>--</template>
                    </span>
                  </div>
                  <div class="park-manage__card-row">
                    <span class="park-manage__card-label">入驻企业类型</span>
                    <span class="park-manage__card-value">--</span>
                  </div>
                </div>
                <div class="park-manage__card-footer">
                  <el-button size="mini" @click="handleView(item)">查看</el-button>
                  <el-button size="mini" type="primary" plain @click="handleEdit(item)">修改</el-button>
                  <el-button size="mini" type="danger" plain @click="deletePark(item)">删除</el-button>
                  <el-button size="mini" type="primary" @click="handleViewControl(item)">查看销控图</el-button>
                </div>
              </div>
            </el-col>
          </el-row>
          <el-empty v-if="!loading && !parkList.length" description="暂无园区数据" />
        </div>

        <!-- 列表视图 -->
        <public-table
          v-else
          :columns="columns"
          :data="parkList"
          :loading="loading"
          :total="total"
          :current-page.sync="pageNo"
          :page-size.sync="pageSize"
          @search="handleSearch"
          @page-change="getParkList"
          @size-change="handleSizeChange">
          <template #cell-parkPositioning="{ row }">
            <span>{{ formatDictLabels(row.parkPositioning, positioningOptions) || '-' }}</span>
          </template>
          <template #cell-supportingFacilities="{ row }">
            <span>{{ formatDictLabels(row.supportingFacilities, supportingFacilitiesOptions) || '-' }}</span>
          </template>
          <template #cell-policySupport="{ row }">
            <template v-if="getPolicySupportList(row).length">
              <span
                v-for="(item, idx) in getPolicySupportList(row)"
                :key="idx"
                class="park-manage__policy-link"
                @click="handleShowPolicyDetail(item)">
                {{ item.name }}<i v-if="idx < getPolicySupportList(row).length - 1">、</i>
              </span>
            </template>
            <span v-else>-</span>
          </template>
          <template #actions="{ row }">
            <el-button type="text" size="mini" @click="handleView(row)">查看</el-button>
            <el-button type="text" size="mini" @click="handleEdit(row)">修改</el-button>
            <el-button type="text" size="mini" @click="deletePark(row)">删除</el-button>
          </template>
        </public-table>
      </div>
    </div>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" :width="dialogWidth" :close-on-click-modal="false" v-dialogDrag custom-class="park-manage__dialog">
      <template #title>
        <div class="park-manage__dialog-header">
          <span class="park-manage__dialog-title">{{ dialogTitle }}</span>
          <i :class="dialogFullscreen ? 'el-icon-news' : 'el-icon-full-screen'" class="park-manage__dialog-toggle" :title="dialogFullscreen ? '还原' : '放大'" @click.stop="toggleDialogFullscreen" />
        </div>
      </template>
      <el-form ref="parkForm" :model="parkForm" :rules="parkRules" label-width="120px" :class="{ 'is-view': isView }">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="园区名称" prop="parkName">
              <el-input v-model.trim="parkForm.parkName" placeholder="请输入园区名称" clearable :disabled="isView" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所在城市" prop="city">
              <el-input v-model.trim="parkForm.city" placeholder="请输入所在城市" clearable :disabled="isView" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model.trim="parkForm.address" placeholder="请输入详细地址" clearable :disabled="isView" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="总建筑面积(㎡)" prop="totalBuildingArea">
              <el-input v-model="parkForm.totalBuildingArea" placeholder="请输入总建筑面积" clearable :disabled="isView" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="可租面积(㎡)" prop="rentableArea">
              <el-input v-model="parkForm.rentableArea" placeholder="请输入可租面积" clearable :disabled="isView" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="租金标准" prop="priceStandard">
              <el-input v-model.trim="parkForm.priceStandard" placeholder="请输入租金标准" clearable :disabled="isView" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="园区状态" prop="parkStatus">
              <el-select v-model="parkForm.parkStatus" placeholder="请选择园区状态" clearable style="width: 100%" :disabled="isView">
                <el-option label="运营中" value="运营中" />
                <el-option label="招商中" value="招商中" />
                <el-option label="已停用" value="已停用" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="园区定位" prop="parkPositioning">
          <el-select v-model="parkForm.parkPositioning" multiple placeholder="请选择园区定位" clearable style="width: 100%" :disabled="isView">
            <el-option v-for="item in positioningOptions" :key="item.id" :label="item.meaning" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="配套设施" prop="supportingFacilities">
          <div class="park-manage__facility-row">
            <el-select v-model="parkForm.supportingFacilities" multiple placeholder="请选择配套设施" clearable style="width: 100%" :disabled="isView">
              <el-option v-for="item in supportingFacilitiesOptions" :key="item.id" :label="item.meaning" :value="item.id" />
            </el-select>
            <el-button v-if="!isView" class="park-manage__facility-add" icon="el-icon-plus" :loading="addFacilityLoading" @click="handleAddFacility" />
          </div>
        </el-form-item>
        <el-form-item label="交付标准" prop="deliveryStandard">
          <el-input v-model.trim="parkForm.deliveryStandard" type="textarea" :rows="2" placeholder="请输入交付标准" clearable :disabled="isView" />
        </el-form-item>
        <el-form-item label="政策支持" prop="policySupport">
          <el-select v-model="parkForm.policySupport" multiple placeholder="请选择政策支持" clearable style="width: 100%" :disabled="isView" @change="handlePolicySupportChange">
            <el-option v-for="item in policySupportOptions" :key="item.id" :label="item.meaning" :value="item.id" />
          </el-select>
        </el-form-item>
        <div v-if="parkForm.policySupportDetail.length" class="park-manage__policy-detail">
          <div v-for="row in parkForm.policySupportDetail" :key="row.id" class="park-manage__policy-detail-row">
            <div class="park-manage__policy-detail-label">
              {{ row.name }}
              <span class="park-manage__policy-detail-required">（具体内容）</span>
            </div>
            <el-input v-if="!isView" v-model="row.policyContent" type="textarea" :rows="2" maxlength="500" placeholder="请输入具体内容" clearable />
            <div v-else class="park-manage__policy-detail-view">{{ row.policyContent || '-' }}</div>
          </div>
        </div>
      </el-form>
      <div slot="footer">
        <el-button v-if="!isView" @click="dialogVisible = false">取 消</el-button>
        <el-button v-if="!isView" type="primary" :loading="submitting" @click="handleSubmit">确 定</el-button>
        <el-button v-if="isView" @click="dialogVisible = false">关 闭</el-button>
      </div>
    </el-dialog>

    <el-dialog title="新增设施" :visible.sync="addFacilityDialogVisible" width="420px" :close-on-click-modal="false" append-to-body>
      <el-form ref="newFacilityForm" :model="newFacilityForm" :rules="newFacilityRules" label-width="80px" @submit.native.prevent>
        <el-form-item label="设施名称" prop="name">
          <el-input ref="newFacilityInput" v-model.trim="newFacilityName" placeholder="请输入设施名称" maxlength="50" clearable @keyup.enter.native="handleAddFacilityConfirm" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="handleAddFacilityCancel">取 消</el-button>
        <el-button type="primary" :loading="addFacilityLoading" @click="handleAddFacilityConfirm">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 政策支持详情 -->
    <el-dialog title="政策支持详情" :visible.sync="policyDetailVisible" width="560px" :close-on-click-modal="false" append-to-body>
      <div class="park-manage__policy-detail-item">
        <div class="park-manage__policy-detail-name">{{ policyDetail.name }}</div>
        <div class="park-manage__policy-detail-content">{{ policyDetail.policyContent || '暂无具体内容' }}</div>
      </div>
      <div slot="footer">
        <el-button type="primary" @click="policyDetailVisible = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import PublicTable from './components/zdy_table'
import * as echarts from 'echarts'

export default {
  name: 'ParkManage',
  components: { PublicTable },
  data() {
    return {
      keyword: '',
      loading: false,
      pageNo: 1,
      pageSize: 10,
      total: 0,
      dialogTitle: '',
      viewMode: 'grid', // grid | list
      searchForm: {
        parkName: '',
        type: '',
        region: '',
        priceStandard: ''
      },
      parkStats: {
        occupancyRate: 0,
        totalArea: 0,
        remainingArea: 0,
        rentedArea: 0,
        totalCount: 0
      },
      chartInstance: null,
      columns: [
        { prop: 'parkName', label: '园区名称', minWidth: 160 },
        { prop: 'city', label: '所在城市', minWidth: 100 },
        { prop: 'address', label: '详细地址', minWidth: 200 },
        { prop: 'totalBuildingArea', label: '总建筑面积(㎡)', minWidth: 130 },
        { prop: 'rentableArea', label: '可租面积(㎡)', minWidth: 120 },
        { prop: 'priceStandard', label: '租金标准', minWidth: 120 },
        { prop: 'parkPositioning', label: '园区定位', minWidth: 160 },
        { prop: 'supportingFacilities', label: '配套设施', minWidth: 160 },
        { prop: 'deliveryStandard', label: '交付标准', minWidth: 160 },
        { prop: 'policySupport', label: '政策支持', minWidth: 160 },
        { prop: 'parkStatus', label: '园区状态', minWidth: 100 }
      ],
      parkList: [],
      dialogVisible: false,
      isEdit: false,
      isView: false,
      currentRow: null,
      submitting: false,
      positioningOptions: [],
      supportingFacilitiesOptions: [],
      policySupportOptions: [],
      parkForm: {
        parkName: '',
        city: '',
        address: '',
        totalBuildingArea: '',
        rentableArea: '',
        priceStandard: '',
        parkPositioning: [],
        supportingFacilities: [],
        deliveryStandard: '',
        policySupport: [],
        policySupportDetail: [],
        parkStatus: ''
      },
      parkRules: {
        parkName: [{ required: true, message: '请输入园区名称', trigger: 'blur' }]
      },
      addFacilityDialogVisible: false,
      addFacilityLoading: false,
      newFacilityName: '',
      newFacilityForm: { name: '' },
      newFacilityRules: {
        name: [{ required: true, message: '请输入设施名称', trigger: 'blur' }]
      },
      dialogFullscreen: false,
      dialogWidth: '680px',
      policyDetailVisible: false,
      policyDetail: { name: '', policyContent: '' }
    }
  },
  created() {
    this.getParkList()
    this.getPositioningOptions()
    this.getSupportingFacilitiesOptions()
    this.getPolicySupportOptions()
  },
  mounted() {
    this.$nextTick(() => {
      this.renderGauge()
    })
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.chartInstance) {
      this.chartInstance.dispose()
      this.chartInstance = null
    }
  },
  watch: {
    newFacilityName(val) {
      this.newFacilityForm.name = val
    }
  },
  methods: {
    // 政策详情分隔符：用于多条政策的 policyContent 拼接与回显拆分
    POLICY_CONTENT_SEPARATOR: '###|||###',
    parsePolicySupportDetail(val) {
      const mapItem = (it) => ({
        id: it.id || it.policyId || '',
        name: it.name || it.policyName || '',
        policyContent: it.policyContent || it.remark || it.content || ''
      })
      // 说明：policyContent 为历史保存的手动填写内容（多条以 POLICY_CONTENT_SEPARATOR 拼接），字典中的 remark 不再参与取值
      if (Array.isArray(val)) {
        return val.map(mapItem)
      }
      if (typeof val === 'string' && val) {
        // 先尝试 JSON 解析（兼容旧数组格式）
        try {
          const arr = JSON.parse(val)
          if (Array.isArray(arr)) {
            return arr.map(mapItem)
          }
        } catch (e) {
          /* ignore */
        }
      }
      return []
    },
    parsePolicySupportDetailByPolicy(val, selectedIds) {
      // 按选中 id 顺序拆分 policyContent（拼接串）回显到每项
      const ids = (selectedIds || []).map((x) => String(x))
      if (!val || typeof val !== 'string' || !ids.length) {
        return ids.map((id) => ({ id, name: this.getPolicySupportName(id), policyContent: '' }))
      }
      const parts = String(val).split(this.POLICY_CONTENT_SEPARATOR)
      return ids.map((id, idx) => ({
        id,
        name: this.getPolicySupportName(id),
        policyContent: parts[idx] !== undefined ? parts[idx] : ''
      }))
    },
    formatPolicySupportDetail(detail) {
      if (!Array.isArray(detail) || !detail.length) return ''
      return detail
        .map((it) => it.policyContent || it.remark || it.content || '')
        .filter(Boolean)
        .join('；')
    },
    formatNumber(val, digits = 2) {
      const num = Number(val)
      if (Number.isNaN(num)) return '0.00'
      return num.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits })
    },
    formatDictLabels(values, options) {
      if (!Array.isArray(values) || !values.length || !Array.isArray(options)) return ''
      return values
        .map((v) => {
          const opt = options.find((o) => String(o.id) === String(v))
          return opt ? (opt.meaning || opt.label) : v
        })
        .filter(Boolean)
        .join('，')
    },
    handleResize() {
      if (this.chartInstance) {
        this.chartInstance.resize()
      }
    },
    renderGauge() {
      if (!this.$refs.gaugeChart) return
      if (this.chartInstance) {
        this.chartInstance.dispose()
      }
      this.chartInstance = echarts.init(this.$refs.gaugeChart)
      const value = Number(this.parkStats.occupancyRate) || 0
      this.chartInstance.setOption({
        series: [
          {
            type: 'gauge',
            startAngle: 200,
            endAngle: -20,
            min: 0,
            max: 100,
            splitNumber: 10,
            radius: '100%',
            center: ['50%', '70%'],
            axisLine: {
              lineStyle: {
                width: 10,
                color: [
                  [0.3, '#67e0e3'],
                  [0.7, '#37a2da'],
                  [1, '#fd666d']
                ]
              }
            },
            pointer: {
              itemStyle: { color: 'auto' }
            },
            axisTick: {
              distance: -10,
              length: 6,
              lineStyle: { color: '#fff', width: 1 }
            },
            splitLine: {
              distance: -10,
              length: 12,
              lineStyle: { color: '#fff', width: 2 }
            },
            axisLabel: {
              color: '#606266',
              distance: 18,
              fontSize: 10
            },
            detail: { show: false },
            data: [{ value }]
          }
        ]
      })
    },
    calculateStats() {
      const totalArea = this.parkList.reduce((sum, item) => sum + (Number(item.totalBuildingArea) || 0), 0)
      const remainingArea = this.parkList.reduce((sum, item) => sum + (Number(item.rentableArea) || 0), 0)
      const rentedArea = totalArea - remainingArea
      const occupancyRate = totalArea > 0 ? (rentedArea / totalArea) * 100 : 0
      this.parkStats = {
        totalArea,
        remainingArea,
        rentedArea,
        occupancyRate,
        totalCount: this.total || this.parkList.length
      }
      this.$nextTick(() => {
        this.renderGauge()
      })
    },
    getPolicySupportName(id) {
      const opt = (this.policySupportOptions || []).find((o) => String(o.id) === String(id))
      return (opt && (opt.meaning || opt.label)) || ''
    },
    handlePolicySupportChange(selected) {
      const existed = this.parkForm.policySupportDetail || []
      // 具体内容完全由用户手动填写，仅保留已填写内容，不取字典 remark
      const next = (selected || []).map((id) => {
        const old = existed.find((it) => String(it.id) === String(id))
        const opt = (this.policySupportOptions || []).find((o) => String(o.id) === String(id))
        return {
          id,
          name: (old && old.name) || (opt && (opt.meaning || opt.label)) || '',
          policyContent: (old && old.policyContent) || ''
        }
      })
      this.parkForm.policySupportDetail = next
    },
    getParkList() {
      const params = {
        pageNo: this.pageNo,
        pageSize: this.pageSize
      }
      this.loading = true
      this.$api['yqRequestApi.parkTableApi'](params)
        .then((res) => {
          const data = res || {}
          const records = data.records || data.list || data.rows || (Array.isArray(data) ? data : [])
          this.parkList = (records || []).map((item) => ({
            id: item.id || item.ID || '',
            parkName: item.parkName || item.PARKNAME || '',
            city: item.city || item.CITY || '',
            address: item.address || item.ADDRESS || '',
            totalBuildingArea: item.totalBuildingArea || item.TOTALBUILDINGAREA || '',
            rentableArea: item.rentableArea || item.RENTABLEAREA || '',
            priceStandard: item.priceStandard || item.PRICESTANDARD || '',
            parkPositioning: Array.isArray(item.parkPositioning) ? item.parkPositioning : (item.parkPositioning || item.PARKPOSITIONING || '').split(',').filter(Boolean),
            supportingFacilities: Array.isArray(item.supportingFacilities) ? item.supportingFacilities : (item.supportingFacilities || item.SUPPORTINGFACILITIES || '').split(',').filter(Boolean),
            deliveryStandard: item.deliveryStandard || item.DELIVERYSTANDARD || '',
            policySupport: Array.isArray(item.policySupport) ? item.policySupport : (item.policySupport || item.POLICYSUPPORT || '').split(',').filter(Boolean),
            policySupportDetailRaw: this.parsePolicySupportDetail(item.policySupportDetail || item.POLICYSUPPORTDETAIL || []),
            policySupportDetail: this.parsePolicySupportDetail(item.policySupportDetail || item.POLICYSUPPORTDETAIL || []),
            policyContentRaw: item.policyContent || item.POLICYCONTENT || '',
            parkStatus: item.parkStatus || item.PARKSTATUS || ''
          }))
          this.total = Number(data.total || data.totalCount || data.count || this.parkList.length) || 0
          this.calculateStats()
        })
        .catch(() => {
          this.parkList = []
          this.total = 0
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleSearch() {
      this.pageNo = 1
      this.keyword = this.searchForm.parkName
      this.getParkList()
    },
    handleSearchReset() {
      this.searchForm = {
        parkName: '',
        type: '',
        region: '',
        priceStandard: ''
      }
      this.keyword = ''
      this.pageNo = 1
      this.getParkList()
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.pageNo = 1
      this.getParkList()
    },
    resetParkForm() {
      this.parkForm = {
        parkName: '',
        city: '',
        address: '',
        totalBuildingArea: '',
        rentableArea: '',
        priceStandard: '',
        parkPositioning: [],
        supportingFacilities: [],
        deliveryStandard: '',
        policySupport: [],
        policySupportDetail: [],
        parkStatus: ''
      }
    },
    getPositioningOptions() {
      const params = {
        dicType: 'parkPositioning'
      }
      this.$api['yqRequestApi.platGetDicApi'](params).then((res) => {
        this.positioningOptions = res || []
      })
    },
    getSupportingFacilitiesOptions() {
      const params = {
        dicType: 'supportingFacilities'
      }
      this.$api['yqRequestApi.platGetDicApi'](params).then((res) => {
        console.log('res', res)
        this.supportingFacilitiesOptions = res || []
      })
    },
    getPolicySupportOptions() {
      const params = {
        dicType: 'policySupport'
      }
      this.$api['yqRequestApi.platGetDicApi'](params).then((res) => {
        this.policySupportOptions = res || []
        console.log('政策支持接口数据', this.policySupportOptions)
      })
    },
    handleAddFacility() {
      this.newFacilityName = ''
      this.addFacilityDialogVisible = true
      this.$nextTick(() => {
        this.$refs.newFacilityForm && this.$refs.newFacilityForm.clearValidate()
      })
    },
    handleAddFacilityCancel() {
      this.addFacilityDialogVisible = false
      this.newFacilityName = ''
    },
    handleAddFacilityConfirm() {
      const name = (this.newFacilityName || '').trim()
      if (!name) {
        this.$message.warning('请输入设施名称')
        return
      }
      this.$refs.newFacilityForm.validate((valid) => {
        if (!valid) return
        this.addFacilityLoading = true
        const lastOption = this.supportingFacilitiesOptions[this.supportingFacilitiesOptions.length - 1] || {}
        const lastMinorCode = lastOption.minorcode || lastOption.minorCode || ''
        const lastOrderNo = Number(lastOption.orderNo || lastOption.orderno || 0)
        // minorcode 形如 "supportingFacilities005"，拆分前缀与数字，数字 +1 后按原位数补零重组
        const prefixMatch = String(lastMinorCode).match(/^(.*?)(\d+)$/)
        const minorCodePrefix = prefixMatch ? prefixMatch[1] : ''
        const minorCodeNum = prefixMatch ? Number(prefixMatch[2]) : 0
        const minorCodePad = prefixMatch ? prefixMatch[2].length : 3
        const newMinorCode = `${minorCodePrefix}${String(minorCodeNum + 1).padStart(minorCodePad, '0')}`
        const params = {
          dictCategoryId: '7dadeaa7b2acab92ae132d3c703bc349',
          isDelete: '0',
          meaning: name,
          minorcode: newMinorCode,
          orderNo: lastOrderNo + 1
        }
        this.$api['yqRequestApi.platAddDicApi'](params)
          .then((res) => {
            this.$message.success('新增成功')
            this.addFacilityDialogVisible = false
            this.newFacilityName = ''
            this.getSupportingFacilitiesOptions()
            const newOption = {
              value: (res && (res.value || res.minorcode)) || newMinorCode,
              label: (res && (res.label || res.meaning)) || name,
              minorcode: (res && res.minorcode) || newMinorCode,
              orderNo: lastOrderNo + 1
            }
            this.supportingFacilitiesOptions.push(newOption)
            if (!this.parkForm.supportingFacilities.includes(newOption.value)) {
              this.parkForm.supportingFacilities.push(newOption.value)
            }
          })
          .catch(() => {
            this.$message.error('新增失败')
          })
          .finally(() => {
            this.addFacilityLoading = false
          })
      })
    },
    openDialog(row, mode = 'edit') {
      this.isEdit = !!row
      this.isView = mode === 'view'
      this.currentRow = row || null
      this.dialogFullscreen = false
      this.$nextTick(() => {
        const inner = document.querySelector('.park-manage__dialog')
        if (inner) {
          inner.classList.remove('is-fullscreen')
          inner.style.width = ''
          inner.style.height = ''
          inner.style.marginTop = ''
          inner.style.marginLeft = ''
          inner.style.left = ''
          inner.style.top = ''
        }
      })
      if (row) {
        this.parkForm = { ...this.parkForm, ...row }
        this.parkForm.policySupport = Array.isArray(row.policySupport) ? row.policySupport : []
        // 优先从 policyContent 字符串按分隔符拆分回显；缺失或空时回退到旧 policySupportDetail 数组
        const rawContent = row.policyContentRaw || row.policyContent || ''
        if (rawContent) {
          this.parkForm.policySupportDetail = this.parsePolicySupportDetailByPolicy(rawContent, this.parkForm.policySupport)
        } else {
          const savedDetails = this.parsePolicySupportDetail(row.policySupportDetail || [])
          this.parkForm.policySupportDetail = this.parkForm.policySupport.map((id) => {
            const saved = savedDetails.find((it) => String(it.id) === String(id))
            return saved || { id, name: this.getPolicySupportName(id), policyContent: '' }
          })
        }
      } else {
        this.resetParkForm()
      }
      if (!row) {
        this.isView = false
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.parkForm && this.$refs.parkForm.clearValidate()
      })
    },
    handleCreate() {
      this.openDialog(null, 'create')
      this.dialogTitle = '新建园区'
    },
    toggleDialogFullscreen() {
      this.dialogFullscreen = !this.dialogFullscreen
      this.$nextTick(() => {
        const inner = document.querySelector('.park-manage__dialog')
        if (!inner) return
        if (this.dialogFullscreen) {
          inner.classList.add('is-fullscreen')
          // 清掉 v-dialogDrag 指令注入的内联宽高/位置样式，避免覆盖全屏
          inner.style.width = ''
          inner.style.height = ''
          inner.style.marginTop = ''
          inner.style.marginLeft = ''
          inner.style.left = ''
          inner.style.top = ''
        } else {
          inner.classList.remove('is-fullscreen')
        }
      })
    },
    handleView(row) {
      this.openDialog(row, 'view')
      this.dialogTitle = '查看园区'
    },
    handleEdit(row) {
      this.openDialog(row, 'edit')
      this.dialogTitle = '修改园区'
    },
    handleViewControl(row) {
      this.$router.push({
        path: '/fangyuanxinxiguanli',
        query: { id: row.id }
      })
    },
    getPolicySupportList(row) {
      const ids = Array.isArray(row.policySupport)
        ? row.policySupport
        : String(row.policySupport || '').split(',').filter(Boolean)
      const rawContent = row.policyContentRaw || row.policyContent || ''
      let list = []
      if (rawContent) {
        list = this.parsePolicySupportDetailByPolicy(rawContent, ids)
      } else {
        const saved = this.parsePolicySupportDetail(row.policySupportDetail || [])
        list = ids.map((id) => {
          const hit = saved.find((it) => String(it.id) === String(id))
          return hit || { id, name: this.getPolicySupportName(id), policyContent: '' }
        })
      }
      return list.map((it) => ({
        id: it.id,
        name: it.name || this.getPolicySupportName(it.id) || '政策支持',
        policyContent: it.policyContent || ''
      }))
    },
    handleShowPolicyDetail(item) {
      this.policyDetail = {
        name: item.name || '政策支持',
        policyContent: item.policyContent || ''
      }
      this.policyDetailVisible = true
    },
    deletePark(row) {
      console.log('删除园区', row)
      this.$confirm('确定要删除该园区吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = { id: row.id }
        this.$api['yqRequestApi.deleteParkApi'](params)
          .then(() => {
            this.$message.success('删除成功')
            this.getParkList()
          })
          .catch(() => {
            this.$message.error('删除失败')
          })
      }).catch(() => {
        // 用户取消删除
      })
    },
    handleSubmit() {
      this.$refs.parkForm.validate((valid) => {
        if (!valid) return
        this.submitting = true
        const apiName = this.isEdit ? 'yqRequestApi.editParkApi' : 'yqRequestApi.addParkApi'
        // 政策具体内容按分隔符拼接为单个字符串存入
        const policyContentJoined = (this.parkForm.policySupportDetail || [])
          .map((it) => it.policyContent || '')
          .join(this.POLICY_CONTENT_SEPARATOR)
        const formData = {
          ...this.parkForm,
          parkPositioning: Array.isArray(this.parkForm.parkPositioning) ? this.parkForm.parkPositioning.join(',') : this.parkForm.parkPositioning,
          supportingFacilities: Array.isArray(this.parkForm.supportingFacilities) ? this.parkForm.supportingFacilities.join(',') : this.parkForm.supportingFacilities,
          policySupport: Array.isArray(this.parkForm.policySupport) ? this.parkForm.policySupport.join(',') : this.parkForm.policySupport,
          policyContent: policyContentJoined,
          policySupportDetail: (this.parkForm.policySupportDetail || []).map((it) => ({
            id: it.id,
            name: it.name,
            policyContent: it.policyContent
          }))
        }
        const params = this.isEdit ? { ...formData, id: this.currentRow.id } : formData
        this.$api[apiName](params)
          .then(() => {
            this.$message.success(this.isEdit ? '修改成功' : '新增成功')
            this.dialogVisible = false
            this.getParkList()
          })
          .catch(() => {
            this.$message.error(this.isEdit ? '修改失败' : '新增失败')
          })
          .finally(() => {
            this.submitting = false
          })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.park-manage {
  height: calc(100% - 30px);
  margin: 14px;
  overflow: auto;
  background: #f5f7fa;

  &.main-router,
  &.main-router--no-bg {
    background: #f5f7fa !important;
    border-radius: 0 !important;
  }

  // 主体：左侧统计 + 右侧内容
  &__body {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  // 左侧统计区
  &__stats {
    display: flex;
    flex: 0 0 300px;
    flex-direction: column;
    width: 300px;
    min-width: 300px;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__gauge-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  &__gauge-title {
    margin-bottom: 4px;
    color: #909399;
    font-size: 14px;
  }

  &__gauge-value {
    color: #303133;
    font-size: 28px;
    font-weight: 600;
  }

  &__gauge-chart {
    width: 100%;
    height: 150px;
  }

  &__stat-items {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    margin-top: 16px;
  }

  &__stat-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }

  &__stat-label {
    color: #909399;
    font-size: 13px;
  }

  &__stat-num {
    color: #303133;
    font-size: 16px;
    font-weight: 600;
  }

  // 工具栏
  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }

  &__filters {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__view-switch {
    :deep(.el-radio-button__inner) {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
  }

  // 网格卡片
  &__grid {
    .el-row {
      margin-bottom: 0;
    }
  }

  &__card {
    display: flex;
    flex-direction: column;
    height: 100%;
    margin-bottom: 20px;
    padding: 18px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
  }

  &__card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
  }

  &__card-title {
    color: #303133;
    font-size: 16px;
    font-weight: 600;
  }

  &__card-body {
    flex: 1;
  }

  &__card-row {
    display: flex;
    margin-bottom: 10px;
    font-size: 13px;
    line-height: 1.5;
  }

  &__card-label {
    flex: 0 0 92px;
    color: #909399;
  }

  &__card-value {
    flex: 1;
    color: #606266;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__card-footer {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;

    .el-button {
      flex: 1;
      min-width: 70px;
    }

    .el-button + .el-button {
      margin-left: 0;
    }
  }

  &__search {
    width: 300px;
    margin-left: auto;
  }

  &__policy-link {
    color: #409eff;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  &__policy-detail-list {
    max-height: 460px;
    overflow: auto;
  }

  &__policy-detail-item {
    margin-bottom: 14px;
    padding: 12px 14px;
    background: #f5f7fa;
    border-radius: 6px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__policy-detail-name {
    margin-bottom: 8px;
    color: #303133;
    font-size: 14px;
    font-weight: 600;
  }

  &__policy-detail-content {
    color: #606266;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
  }

  &__facility-row {
    display: flex;
    align-items: center;
    width: 100%;
  }

  &__facility-add {
    margin-left: 8px;
    padding: 12px;
  }

  &__dialog {
    :deep(.el-dialog__header) {
      position: relative;
      padding-right: 56px;
    }

    :deep(.el-dialog__title) {
      display: block;
      padding-right: 76px;
    }

    :deep(.el-dialog__headerbtn) {
      right: 42px !important;
      z-index: 2;
    }

    :deep(.el-dialog.is-fullscreen) {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100% !important;
      max-width: 100% !important;
      height: 100% !important;
      max-height: 100% !important;
      margin: 0 !important;
      border-radius: 0 !important;
    }
  }

  &__dialog-header {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }

  &__dialog-title {
    font-size: 16px;
    line-height: 1.4;
  }

  &__dialog-toggle {
    position: absolute !important;
    top: 54% !important;
    right: 34px !important;
    transform: translateY(-50%) !important;
    display: inline-block !important;
    width: 24px !important;
    height: 24px !important;
    line-height: 24px !important;
    text-align: center !important;
    font-size: 16px !important;
    color: #909399 !important;
    cursor: pointer !important;
    background: transparent !important;
    border: none !important;
    outline: none !important;
    transition: color 0.2s !important;
    user-select: none !important;
    z-index: 3 !important;

    &:hover {
      color: #409eff !important;
    }
  }

  &__policy-detail {
    margin-bottom: 18px;

    &-row {
      margin-bottom: 12px;
    }

    &-label {
      margin-bottom: 6px;
      color: #606266;
      font-size: 14px;
      font-weight: 500;
    }

    &-required {
      margin-left: 4px;
      color: #909399;
      font-weight: normal;
      font-size: 12px;
    }

    :deep(.el-textarea__inner) {
      font-size: 14px;
      line-height: 1.5;
    }

    &-view {
      padding: 8px 12px;
      color: #606266;
      font-size: 14px;
      line-height: 1.5;
      background: #f5f7fa;
      border: 1px solid #ebeef5;
      border-radius: 4px;
      word-break: break-all;
    }
  }

  // 查看模式：禁用输入框并模拟纯文本展示
  .is-view {
    :deep(.el-input.is-disabled .el-input__inner),
    :deep(.el-textarea.is-disabled .el-textarea__inner),
    :deep(.el-select .el-input.is-disabled .el-input__inner) {
      color: #606266;
      background-color: transparent;
      border-color: transparent;
      cursor: default;
    }

    :deep(.el-input__suffix),
    :deep(.el-select__caret),
    :deep(.el-textarea .el-input__count) {
      display: none;
    }

    :deep(.el-form-item) {
      margin-bottom: 18px;
    }
  }
}
</style>
