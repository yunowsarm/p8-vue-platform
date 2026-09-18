<template>
  <div class="park-manage">
    <public-table
      :columns="columns"
      :data="parkList"
      :loading="loading"
      :total="total"
      :current-page.sync="pageNo"
      :page-size.sync="pageSize"
      searchable
      search-placeholder="请输入园区名称搜索"
      @search="handleSearch"
      @page-change="getParkList"
      @size-change="handleSizeChange">
      <template #toolbar>
        <el-button type="primary" @click="handleCreate">新建</el-button>
        <el-input v-model.trim="keyword" class="park-manage__search" clearable placeholder="请输入园区名称搜索" prefix-icon="el-icon-search" @input="handleSearch" @clear="handleSearch" />
      </template>
      <template #actions="{ row }">
        <el-button type="text" size="mini" @click="handleView(row)">查看</el-button>
        <el-button type="text" size="mini" @click="handleEdit(row)">修改</el-button>
      </template>
    </public-table>
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" :width="dialogWidth" :close-on-click-modal="false" v-dialogDrag custom-class="park-manage__dialog">
      <template #title>
        <div class="park-manage__dialog-header">
          <span class="park-manage__dialog-title">{{ dialogTitle }}</span>
          <i :class="dialogFullscreen ? 'el-icon-news' : 'el-icon-full-screen'" class="park-manage__dialog-toggle" :title="dialogFullscreen ? '还原' : '放大'" @click.stop="toggleDialogFullscreen" />
        </div>
      </template>
      <el-form ref="parkForm" :model="parkForm" :rules="parkRules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="园区名称" prop="parkName">
              <el-input v-model.trim="parkForm.parkName" placeholder="请输入园区名称" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所在城市" prop="city">
              <el-input v-model.trim="parkForm.city" placeholder="请输入所在城市" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model.trim="parkForm.address" placeholder="请输入详细地址" clearable />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="总建筑面积(㎡)" prop="totalBuildingArea">
              <el-input v-model="parkForm.totalBuildingArea" placeholder="请输入总建筑面积" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="可租面积(㎡)" prop="rentableArea">
              <el-input v-model="parkForm.rentableArea" placeholder="请输入可租面积" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="租金标准" prop="priceStandard">
              <el-input v-model.trim="parkForm.priceStandard" placeholder="请输入租金标准" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="园区状态" prop="parkStatus">
              <el-select v-model="parkForm.parkStatus" placeholder="请选择园区状态" clearable style="width: 100%">
                <el-option label="运营中" value="运营中" />
                <el-option label="招商中" value="招商中" />
                <el-option label="已停用" value="已停用" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="园区定位" prop="parkPositioning">
          <el-select v-model="parkForm.parkPositioning" multiple collapse-tags placeholder="请选择园区定位" clearable style="width: 100%">
            <el-option v-for="item in positioningOptions" :key="item.id" :label="item.meaning" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="配套设施" prop="supportingFacilities">
          <div class="park-manage__facility-row">
            <el-select v-model="parkForm.supportingFacilities" multiple collapse-tags placeholder="请选择配套设施" clearable style="width: calc(100% - 40px)">
              <el-option v-for="item in supportingFacilitiesOptions" :key="item.id" :label="item.meaning" :value="item.id" />
            </el-select>
            <el-button class="park-manage__facility-add" icon="el-icon-plus" :loading="addFacilityLoading" @click="handleAddFacility" />
          </div>
        </el-form-item>
        <el-form-item label="交付标准" prop="deliveryStandard">
          <el-input v-model.trim="parkForm.deliveryStandard" type="textarea" :rows="2" placeholder="请输入交付标准" clearable />
        </el-form-item>
        <el-form-item label="政策支持" prop="policySupport">
          <el-select v-model="parkForm.policySupport" multiple collapse-tags placeholder="请选择政策支持" clearable style="width: 100%" @change="handlePolicySupportChange">
            <el-option v-for="item in policySupportOptions" :key="item.id" :label="item.meaning" :value="item.id" />
          </el-select>
        </el-form-item>
        <div v-if="parkForm.policySupportDetail.length" class="park-manage__policy-detail">
          <div v-for="row in parkForm.policySupportDetail" :key="row.id" class="park-manage__policy-detail-row">
            <div class="park-manage__policy-detail-label">
              {{ row.name }}
              <span class="park-manage__policy-detail-required">（具体内容）</span>
            </div>
            <el-input v-model="row.remark" type="textarea" :rows="2" maxlength="500" placeholder="请输入具体内容" clearable />
          </div>
        </div>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确 定</el-button>
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
  </div>
</template>

<script>
import PublicTable from './components/zdy_table'

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
        { prop: 'policySupportDetail', label: '政策详情', minWidth: 200, formatter: (row) => this.formatPolicySupportDetail(row.policySupportDetail) },
        { prop: 'parkStatus', label: '园区状态', minWidth: 100 }
      ],
      parkList: [],
      dialogVisible: false,
      isEdit: false,
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
      dialogWidth: '680px'
    }
  },
  created() {
    this.getParkList()
    this.getPositioningOptions()
    this.getSupportingFacilitiesOptions()
    this.getPolicySupportOptions()
  },
  watch: {
    newFacilityName(val) {
      this.newFacilityForm.name = val
    }
  },
  methods: {
    parsePolicySupportDetail(val) {
      const mapItem = (it) => ({
        id: it.id || it.policyId || '',
        name: it.name || it.policyName || '',
        remark: it.remark || it.content || it.policyContent || ''
      })
      // 说明：remark 为历史保存的手动填写内容，字典中的 remark 不再参与取值
      if (Array.isArray(val)) {
        return val.map(mapItem)
      }
      if (typeof val === 'string' && val) {
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
    formatPolicySupportDetail(detail) {
      if (!Array.isArray(detail) || !detail.length) return ''
      return detail
        .map((it) => it.remark || it.content || '')
        .filter(Boolean)
        .join('；')
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
          remark: (old && old.remark) || ''
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
            parkStatus: item.parkStatus || item.PARKSTATUS || ''
          }))
          this.total = Number(data.total || data.totalCount || data.count || this.parkList.length) || 0
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
    openDialog(row) {
      this.isEdit = !!row
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
        // 已填写的详情优先回填，未填写的项补空行由用户手动填写
        const savedDetails = this.parsePolicySupportDetail(row.policySupportDetail || [])
        this.parkForm.policySupportDetail = this.parkForm.policySupport.map((id) => {
          const saved = savedDetails.find((it) => String(it.id) === String(id))
          return saved || { id, name: this.getPolicySupportName(id), remark: '' }
        })
      } else {
        this.resetParkForm()
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.parkForm && this.$refs.parkForm.clearValidate()
      })
    },
    handleCreate() {
      this.openDialog()
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
      this.openDialog(row)
      this.dialogTitle = '查看园区'
    },
    handleEdit(row) {
      this.openDialog(row)
      this.dialogTitle = '修改园区'
    },
    handleSubmit() {
      this.$refs.parkForm.validate((valid) => {
        if (!valid) return
        this.submitting = true
        const apiName = this.isEdit ? 'yqRequestApi.editParkApi' : 'yqRequestApi.addParkApi'
        const formData = {
          ...this.parkForm,
          parkPositioning: Array.isArray(this.parkForm.parkPositioning) ? this.parkForm.parkPositioning.join(',') : this.parkForm.parkPositioning,
          supportingFacilities: Array.isArray(this.parkForm.supportingFacilities) ? this.parkForm.supportingFacilities.join(',') : this.parkForm.supportingFacilities,
          policySupport: Array.isArray(this.parkForm.policySupport) ? this.parkForm.policySupport.join(',') : this.parkForm.policySupport,
          policySupportDetail: (this.parkForm.policySupportDetail || []).map((it) => ({
            id: it.id,
            name: it.name,
            remark: it.remark
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
  overflow: hidden;

  &.main-router,
  &.main-router--no-bg {
    background: #f5f7fa !important;
    border-radius: 0 !important;
  }

  &__search {
    width: 300px;
    margin-left: auto;
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
  }
}
</style>
