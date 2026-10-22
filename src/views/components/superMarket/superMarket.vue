<template>
  <div class="super-market">
    <div class="query-card">
      <div class="query-form">
        <el-date-picker
          v-model="range"
          type="datetimerange"
          unlink-panels
          value-format="yyyy-MM-dd HH:mm:ss"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          :clearable="false"
          size="small"
          class="date-range" />
        <el-button type="primary" size="small" :loading="loading" @click="search">查询</el-button>
        <el-button size="small" @click="reset">重置</el-button>
        <el-dropdown trigger="click" @command="setRange">
          <el-button size="small">
            快捷时间
            <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="item in quickRanges" :key="item.value" :command="item.value">{{ item.label }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="view-actions" role="group" aria-label="数据展示方式">
        <el-tooltip content="数据视图" placement="bottom">
          <button
            type="button"
            class="view-action"
            :class="{ 'view-action--active': activeView === 'details' }"
            aria-label="数据视图"
            :aria-pressed="activeView === 'details'"
            @click="activeView = 'details'">
            <img src="./icons/data-view.svg" alt="" />
          </button>
        </el-tooltip>
        <el-tooltip content="数据分析" placement="bottom">
          <button
            type="button"
            class="view-action"
            :class="{ 'view-action--active': activeView === 'analysis' }"
            aria-label="数据分析"
            :aria-pressed="activeView === 'analysis'"
            @click="activeView = 'analysis'">
            <img src="./icons/data-analysis.svg" alt="" />
          </button>
        </el-tooltip>
      </div>
    </div>
    <div class="filter-card">
      <el-input v-model="keyword" size="mini" clearable prefix-icon="el-icon-search" placeholder="搜索单号、商品名称或商品标识" />
      <el-select v-model="device" size="mini" clearable placeholder="全部设备"><el-option v-for="item in devices" :key="item" :label="item" :value="item" /></el-select>
      <el-select v-model="businessType" size="mini" clearable placeholder="全部业务类型">
        <el-option label="销售" value="A" />
        <el-option label="退货" value="B" />
        <el-option label="未识别" value="unknown" />
      </el-select>
      <span class="filter-scope">
        {{ rows.length }} 条已加载
        <span v-if="updatedAt">· {{ updatedAt }} 更新</span>
      </span>
      <!-- <el-button size="mini" @click="mappingVisible = true">字段映射</el-button> -->
      <el-button type="primary" size="mini" :disabled="loading || !filteredRows.length" :loading="exporting" @click="exportRows">导出明细</el-button>
    </div>
    <el-alert v-if="error" class="status-alert" :title="error" type="error" :closable="false" show-icon />
    <div v-if="hasData && (report.unknown || report.invalidAmount)" class="quality-note">
      <span v-if="report.unknown">{{ report.unknown }} 条明细业务类型未识别，销售 / 退货统计仅包含已识别记录。</span>
      <span v-if="report.invalidAmount">{{ report.invalidAmount }} 条明细缺少有效金额，已从金额统计中排除。</span>
    </div>
    <div class="content" v-loading="loading" element-loading-text="正在加载查询范围内的全部明细…">
      <keep-alive>
        <sales-data-view v-if="activeView === 'details'" :rows="filteredRows" :error="error" @detail="selectedRow = $event" />
        <sales-analysis v-else :rows="filteredRows" />
      </keep-alive>
    </div>
    <el-dialog title="销售明细详情" :visible="!!selectedRow" width="min(760px, 94vw)" @close="selectedRow = null">
      <template v-if="selectedRow">
        <div class="sale-detail-body">
          <p class="dialog-note">以下信息按前端字段字典展示，缺少的数据标记为“未提供”。</p>
          <dl class="sale-detail-grid">
            <div v-for="item in detail.fields" :key="item.key" class="sale-detail-item">
              <dt>{{ item.label }}</dt>
              <dd>{{ item.value }}</dd>
            </div>
          </dl>
        </div>
      </template>
    </el-dialog>
    <el-dialog title="前端字段映射" :visible.sync="mappingVisible" width="min(900px, 94vw)">
      <el-alert title="业务类型：A = 销售，B = 退货；支付方式名称需由 aaa025 提供，当前未配置具体码值。" type="info" :closable="false" show-icon />
      <el-table :data="mappingRows" size="small" max-height="420" stripe>
        <el-table-column align="center" header-align="center" prop="table" label="来源表" />
        <el-table-column align="center" header-align="center" prop="key" label="字段编码" />
        <el-table-column align="center" header-align="center" prop="label" label="业务含义" />
      </el-table>
      <p class="dialog-note">o01292 与商品条码 o80044 的关联尚待确认。o00781 的时间口径、销售接口 b00495 的成本口径尚待确认，不据此计算交易趋势或毛利。</p>
    </el-dialog>
  </div>
</template>

<script>
import SalesAnalysis from './components/SalesAnalysis.vue'
import SalesDataView from './components/SalesDataView.vue'
import { fetchSalesDetails } from '@/service/superMarket'
import { TABLE_FIELDS, RESPONSE_FIELDS, isKnownType, typeInfo, numberText, summarize, saleDetails } from './fields.js'

function dayRange(days = 0, week = false) {
  const end = new Date()
  if (!week) end.setDate(end.getDate() - days)
  const start = new Date(end)
  if (week) start.setDate(start.getDate() - 6)
  const date = (value) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
  return [`${date(start)} 00:00:00`, `${date(end)} 23:59:59`]
}

export default {
  name: 'SuperMarket',
  components: { SalesAnalysis, SalesDataView },
  data() {
    return {
      activeView: 'details',
      range: dayRange(),
      appliedRange: null,
      quickRanges: [
        { label: '今天', value: 'today' },
        { label: '昨天', value: 'yesterday' },
        { label: '近 7 天', value: 'week' }
      ],
      rows: [],
      keyword: '',
      device: '',
      businessType: '',
      pageNo: 1,
      pageSize: 20,
      loading: false,
      exporting: false,
      error: '',
      updatedAt: '',
      requestId: 0,
      mappingVisible: false,
      selectedRow: null
    }
  },
  computed: {
    devices() {
      return [...new Set(this.rows.map((row) => row.deviceId).filter(Boolean))].sort()
    },
    filteredRows() {
      const keyword = this.keyword.trim().toLowerCase()
      return this.rows.filter((row) => {
        const matchKeyword =
          !keyword ||
          [row.o01329, row.productName, row.o01292].some((value) =>
            String(value || '')
              .toLowerCase()
              .includes(keyword)
          )
        const matchType = !this.businessType || (this.businessType === 'unknown' ? !isKnownType(row.b01058) : row.b01058 === this.businessType)
        return matchKeyword && matchType && (!this.device || row.deviceId === this.device)
      })
    },
    pageRows() {
      return this.filteredRows.slice((this.pageNo - 1) * this.pageSize, this.pageNo * this.pageSize)
    },
    report() {
      return summarize(this.filteredRows)
    },
    hasData() {
      return !!this.filteredRows.length
    },
    knownType() {
      return this.filteredRows.some((row) => isKnownType(row.b01058))
    },
    detail() {
      const detail = saleDetails(this.selectedRow)
      return { fields: detail.fields.filter((item) => !item.label.includes('待确认')) }
    },
    mappingRows() {
      return Object.entries(TABLE_FIELDS).flatMap(([key, table]) =>
        Object.keys(table.fields).length
          ? Object.entries(table.fields).map(([field, label]) => ({ table: `${key} · ${table.label}`, key: field, label }))
          : [{ table: `${key} · ${table.label}`, key: '—', label: '字段结构待补充' }]
      )
    }
  },
  watch: {
    keyword() {
      this.pageNo = 1
    },
    device() {
      this.pageNo = 1
    },
    businessType() {
      this.pageNo = 1
    }
  },
  mounted() {
    this.search()
  },
  beforeDestroy() {
    this.requestId++
  },
  methods: {
    typeInfo,
    numberText,
    display(value) {
      return value === null || value === undefined || value === '' ? '—' : typeof value === 'object' ? JSON.stringify(value) : String(value)
    },
    setRange(value) {
      this.range = dayRange(value === 'yesterday' ? 1 : 0, value === 'week')
      this.search()
    },
    reset() {
      this.keyword = ''
      this.device = ''
      this.businessType = ''
      this.range = dayRange()
      this.search()
    },
    async search() {
      if (!this.range || this.range.length !== 2 || this.range[0] > this.range[1]) {
        this.$message.warning('请选择有效的起止时间')
        return
      }
      const requestId = ++this.requestId
      const range = [...this.range]
      this.loading = true
      this.error = ''
      this.rows = []
      this.appliedRange = null
      this.updatedAt = ''
      this.pageNo = 1
      try {
        const rows = await fetchSalesDetails(this.$api, range, () => requestId === this.requestId)
        if (requestId !== this.requestId) return
        this.rows = rows
        this.appliedRange = range
        this.updatedAt = new Date().toLocaleTimeString('zh-CN', { hour12: false })
      } catch (error) {
        if (requestId === this.requestId) {
          this.error =
            error.message === 'Network Error'
              ? '无法连接销售数据服务，请检查网络后重新查询'
              : error.code === 'ECONNABORTED'
              ? '查询超时，请缩小时间范围后重试'
              : (error.head && error.head.message) || error.message || '销售明细加载失败，请稍后重试'
        }
      } finally {
        if (requestId === this.requestId) this.loading = false
      }
    },
    async exportRows() {
      this.exporting = true
      const rows = this.filteredRows.slice()
      const range = this.appliedRange.slice()
      const filters = { keyword: this.keyword, device: this.device, type: this.businessType }
      try {
        const XLSX = await import('xlsx')
        const columns = ['o01329', 'productName', 'o01292', 'productSpec', 'productUnit', 'b01058', 'b00741', 'b00517', 'deviceId', 'receivedAt']
        const data = [columns.map((key) => RESPONSE_FIELDS[key]), ...rows.map((row) => columns.map((key) => (key === 'b01058' ? typeInfo(row[key]).label : row[key] == null ? '' : row[key])))]
        // aoa_to_sheet 将接口字符串写为文本单元格，保留前导零，不生成公式。
        const sheet = XLSX.utils.aoa_to_sheet(data)
        sheet['!cols'] = columns.map(() => ({ wch: 24 }))
        const book = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(book, sheet, '销售明细')
        const scope = XLSX.utils.aoa_to_sheet([
          ['开始时间', range[0]],
          ['结束时间', range[1]],
          ['搜索关键词', filters.keyword || '全部'],
          ['设备编号', filters.device || '全部'],
          ['业务类型', filters.type === 'unknown' ? '未识别' : filters.type ? typeInfo(filters.type).label : '全部'],
          ['导出明细数', rows.length],
          ['统计口径', '金额按接口原值；业务类型 A 销售、B 退货；未识别类型不推算净额']
        ])
        XLSX.utils.book_append_sheet(book, scope, '查询范围')
        XLSX.writeFile(book, `超市销售明细_${range[0].slice(0, 10)}.xlsx`)
      } catch (error) {
        this.$message.error('导出失败，请重试')
      } finally {
        this.exporting = false
      }
    }
  }
}
</script>

<style scoped>
.super-market {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  background: #f5f7fa;
  color: #27364a;
}
.query-card {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
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
  min-width: 0;
}
.date-range {
  width: 360px;
}
.view-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}
.view-action-wrapper {
  display: inline-flex;
}
.view-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 7px;
  background: #fff;
  border: 1px solid #dce3ed;
  border-radius: 6px;
  cursor: pointer;
}
.view-action img {
  width: 20px;
  height: 20px;
}
.view-action--active {
  background: #ecf5ff;
  border-color: #409eff;
}
.view-action--active img {
  filter: invert(49%) sepia(81%) saturate(1418%) hue-rotate(186deg) brightness(105%) contrast(101%);
}
.view-action:focus-visible {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}
.view-action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 8px 10px 23px;
}
@media (max-width: 700px) {
  .query-card {
    flex-wrap: wrap;
  }
  .query-form {
    flex-wrap: wrap;
  }
  .date-range {
    max-width: 100%;
  }
  .view-actions {
    margin-left: auto;
  }
}
.filter-card {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 8px 10px 0;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #e7ebf1;
  border-radius: 8px;
}
.filter-card > .el-input {
  width: 260px;
}
.filter-card > .el-select {
  width: 150px;
}
.filter-card .el-button + .el-button {
  margin-left: 0;
}
.filter-scope {
  margin-left: auto;
  color: #7b889a;
  font-size: 11px;
}
.status-alert {
  flex-shrink: 0;
  width: auto;
  margin: 8px 10px 0;
}
.quality-note {
  flex-shrink: 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 8px 10px 0;
  padding: 7px 12px;
  background: #fdf6ec;
  color: #a06d2d;
  border-radius: 6px;
  font-size: 11px;
  line-height: 1.6;
}
.dialog-note {
  font-size: 12px;
  color: #7b889a;
  line-height: 1.7;
}
.sale-detail-body {
  max-height: 65vh;
  overflow: auto;
}
.sale-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0 0 18px;
}
.sale-detail-item {
  padding: 12px;
  border: 1px solid #e7ebf1;
  border-radius: 6px;
  text-align: center;
  min-width: 0;
}
.sale-detail-item dt {
  color: #7b889a;
  font-size: 12px;
  margin-bottom: 8px;
}
.sale-detail-item dd {
  margin: 0;
  color: #27364a;
  overflow-wrap: anywhere;
  line-height: 1.6;
  font-size: 14px;
}
@media (max-width: 700px) {
  .sale-detail-grid {
    grid-template-columns: 1fr;
  }
  .filter-scope {
    width: 100%;
    margin-left: 0;
  }
  .query-form .date-range {
    max-width: 100%;
  }
}
</style>
