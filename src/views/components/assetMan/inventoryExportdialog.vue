<!-- 库存导出弹窗：按月份区间导出库存数据（布局参考 product/ContractManage/index.vue） -->
<template>
  <list-layout :header-visible="false">
    <template #center>
      <div class="inventory-export-container">
        <el-form ref="exportForm" :model="exportForm" :rules="formRules" label-width="100px" class="export-form">
          <el-form-item label="开始时间" prop="startMonth">
            <el-date-picker
              v-model="exportForm.startMonth"
              type="month"
              placeholder="请选择开始月份"
              value-format="yyyy-MM"
              format="yyyy-MM"
              clearable
              style="width: 100%" />
          </el-form-item>
          <el-form-item label="结束时间" prop="endMonth">
            <el-date-picker
              v-model="exportForm.endMonth"
              type="month"
              placeholder="请选择结束月份"
              value-format="yyyy-MM"
              format="yyyy-MM"
              :picker-options="endMonthPickerOptions"
              clearable
              style="width: 100%" />
          </el-form-item>
          <el-form-item>
            <el-button :disabled="exporting" @click="handleCancel">取消</el-button>
            <el-button type="primary" :loading="exporting" @click="handleExport">导出</el-button>
          </el-form-item>
        </el-form>
      </div>
    </template>
  </list-layout>
</template>

<script>
import { P8ListLayout as ListLayout } from 'p8-components-ui'

const createEmptyForm = () => ({
  startMonth: '',
  endMonth: ''
})

// yyyy-MM 字符串可直接比较大小
const monthValue = (month) => (month ? String(month).slice(0, 7) : '')

export default {
  name: 'InventoryExportDialog',
  components: {
    ListLayout
  },
  props: {
    // 页面 / 自定义组件可直接传入仓库主键
    storehouseId: {
      type: [String, Number],
      default: ''
    },
    // 兼容平台自定义组件约定：业务主键通过 businessKey 传入
    businessKey: {
      type: [String, Number],
      default: ''
    },
    // 平台传入的行数据（vxe 为大写字段）
    row: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      exporting: false,
      exportForm: createEmptyForm()
    }
  },
  computed: {
    resolvedStorehouseId() {
      const row = this.row[0] || {}
      const id = this.storehouseId || this.businessKey || row.ID || row.id || row.STOREHOUSE_ID || row.storehouseId
      return id == null ? '' : String(id)
    },
    // 当前月（yyyy-MM），结束时间不允许超过该月
    currentMonth() {
      const now = new Date()
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    },
    // 结束时间月份选择器：禁用当前月之后的月份
    endMonthPickerOptions() {
      const maxMonth = this.currentMonth
      return {
        disabledDate(time) {
          const value = `${time.getFullYear()}-${String(time.getMonth() + 1).padStart(2, '0')}`
          return value > maxMonth
        }
      }
    },
    formRules() {
      const validateStart = (rule, value, callback) => {
        if (!value) return callback(new Error('请选择开始时间'))
        const endMonth = monthValue(this.exportForm.endMonth)
        if (endMonth && value > endMonth) return callback(new Error('开始时间不能晚于结束时间'))
        return callback()
      }
      const validateEnd = (rule, value, callback) => {
        if (!value) return callback(new Error('请选择结束时间'))
        if (value > this.currentMonth) return callback(new Error('结束时间不能晚于当前月'))
        const startMonth = monthValue(this.exportForm.startMonth)
        if (startMonth && value < startMonth) return callback(new Error('结束时间不能早于开始时间'))
        return callback()
      }
      return {
        startMonth: [{ required: true, validator: validateStart, trigger: 'change' }],
        endMonth: [{ required: true, validator: validateEnd, trigger: 'change' }]
      }
    }
  },
  methods: {
    handleCancel() {
      if (this.exporting) return
      this.exportForm = createEmptyForm()
      this.$nextTick(() => {
        if (this.$refs.exportForm) this.$refs.exportForm.clearValidate()
      })
      this.$emit('cancel')
    },
    async readBlobError(blob) {
      try {
        const text = await blob.text()
        const parsed = JSON.parse(text)
        return (parsed && (parsed.message || parsed.msg || (parsed.head && parsed.head.message))) || ''
      } catch (error) {
        return ''
      }
    },
    saveBlob(blob, fileName) {
      const objectUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = fileName
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000)
    },
    handleExport() {
      if (this.exporting) return
      const form = this.$refs.exportForm
      if (!form) {
        this.$message.error('导出表单未初始化，请刷新页面重试')
        return
      }
      form.validate(async (valid) => {
        if (!valid) return
        const api = this.$api && this.$api['yqRequestApi.exportInventoryApi']
        if (!api) {
          this.$message.error('未找到库存导出接口')
          return
        }
        const params = {
          storehouseId: this.resolvedStorehouseId,
          startMonth: monthValue(this.exportForm.startMonth),
          endMonth: monthValue(this.exportForm.endMonth)
        }
        if (!params.storehouseId) {
          this.$message.error('缺少仓库ID，无法导出')
          return
        }
        this.exporting = true
        try {
          const response = await api(params, { responseType: 'blob' })
          const responseData = response && response.data !== undefined ? response.data : response
          const blob = responseData instanceof Blob ? responseData : new Blob([responseData], { type: 'application/vnd.ms-excel' })
          // 接口异常时返回 JSON 错误体，提示而不是下载成损坏文件
          if (blob.type && blob.type.indexOf('application/json') !== -1) {
            const errorMessage = await this.readBlobError(blob)
            throw new Error(errorMessage || '库存导出失败')
          }
          this.saveBlob(blob, `库存导出_${params.startMonth}_${params.endMonth}.xlsx`)
          this.$message.success('导出成功')
          this.$emit('success', params)
        } catch (error) {
          this.$message.error(error.message || '库存导出失败，请稍后重试')
        } finally {
          this.exporting = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
// 与合同管理页面保持一致：清除 list-layout 默认外边距
::v-deep .list-layout {
  margin: 0px !important;
}

.inventory-export-container {
  height: 100%;
  padding: 12px 0;
  overflow-y: auto;
}

.export-form {
  width: 520px;
  padding: 10px 10px 0 0;
}
</style>
