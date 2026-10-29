<template>
  <div class="data-view">
    <div class="dashboard-grid">
      <div class="overview-column">
        <section class="panel overview-panel">
          <div class="panel-head">
            <h3>交易概览</h3>
            <span>当前筛选范围</span>
          </div>
          <div class="overview-metrics">
            <div v-for="item in overviewMetrics" :key="item.label" class="overview-metric">
              <span>{{ item.label }}</span>
              <strong>
                {{ item.value }}
                <small>{{ item.unit }}</small>
              </strong>
            </div>
          </div>
          <p class="data-note">金额按原值统计，销售与退货分别展示。</p>
        </section>
        <section class="panel trend-panel">
          <div class="panel-head">
            <h3>明细金额趋势</h3>
            <el-button size="mini" :loading="exportingDaily" :disabled="loading || !!error || !appliedRange || !rows.length" @click="exportDaily">按天导出明细</el-button>
            <span>元 / 交易日期</span>
          </div>
          <div class="trend-chart-wrap"><sales-trend :rows="rows" /></div>
          <p class="data-note">按交易日期汇总全部 {{ rows.length }} 条筛选明细，非表格当前页；缺少有效交易日期或金额的记录不计入趋势。</p>
        </section>
      </div>
      <section class="panel detail-panel">
        <div class="panel-head">
          <h3>当前选择明细</h3>
          <span>{{ rows.length }} 条记录</span>
        </div>
        <div class="detail-table-wrap">
          <el-table :data="pageRows" stripe height="100%" size="mini" border class="sales-table" :empty-text="error ? '查询失败，请重试' : '当前筛选范围暂无销售明细'">
            <el-table-column align="center" header-align="center" label="单号" prop="o01329" show-overflow-tooltip>
              <template slot-scope="scope">
                <span class="order-number">{{ display(scope.row.o01329) }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" header-align="center" label="商品" show-overflow-tooltip>
              <template slot-scope="scope">
                <div class="product-name">{{ scope.row.productName || '未匹配商品名称' }}</div>
                <!-- <div class="secondary">标识：{{ display(scope.row.o01292) }}</div> -->
              </template>
            </el-table-column>
            <el-table-column align="center" header-align="center" label="规格 / 单位">
              <template slot-scope="scope">{{ display(scope.row.productSpec) }} / {{ display(scope.row.productUnit) }}</template>
            </el-table-column>
            <el-table-column align="center" header-align="center" label="业务类型">
              <template slot-scope="scope">
                <el-tag size="small" :type="typeInfo(scope.row.b01058).tag">{{ typeInfo(scope.row.b01058).label }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" header-align="center" label="数量">
              <template slot-scope="scope">{{ numberText(scope.row.b00741) }}</template>
            </el-table-column>
            <el-table-column align="center" header-align="center" label="金额（元）">
              <template slot-scope="scope">
                <span class="amount">{{ numberText(scope.row.b00517) }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" header-align="center" prop="o00781" label="交易时间" width="175" />
            <el-table-column align="center" header-align="center" label="操作">
              <template slot-scope="scope"><el-button type="text" size="small" @click="$emit('detail', scope.row)">详情</el-button></template>
            </el-table-column>
          </el-table>
        </div>
        <div class="table-footer">
          <span>共 {{ filteredRows.length }} 条明细</span>
          <el-pagination :current-page.sync="pageNo" :page-size.sync="pageSize" :page-sizes="[20, 50, 100]" :total="filteredRows.length" layout="sizes, prev, pager, next" @size-change="pageNo = 1" />
        </div>
      </section>
    </div>
  </div>
</template>
<script>
import SalesTrend from './SalesTrend.vue'
import { numberText, typeInfo, summarize, isKnownType } from '../fields'
import { dailyAmountWorkbook } from '../dailyExport'
export default {
  name: 'SuperMarketSalesDataView',
  components: { SalesTrend },
  props: { rows: { type: Array, default: () => [] }, error: { type: String, default: '' }, appliedRange: { type: Array, default: null }, loading: Boolean },
  data() {
    return { pageNo: 1, pageSize: 20, exportingDaily: false }
  },
  computed: {
    overviewMetrics() {
      const report = summarize(this.rows)
      const hasAmount = this.rows.length > report.invalidAmount
      const knownType = this.rows.some((row) => isKnownType(row.b01058))
      return [
        { label: '明细金额合计', value: hasAmount ? numberText(report.amount) : '—', unit: '元' },
        { label: '交易单数', value: report.orders.size, unit: '单' },
        { label: '销售金额', value: knownType ? numberText(report.sales) : '—', unit: '元' },
        { label: '退货金额', value: knownType ? numberText(report.returns) : '—', unit: '元' }
      ]
    },
    filteredRows() {
      return this.rows
    },
    pageRows() {
      return this.rows.slice((this.pageNo - 1) * this.pageSize, this.pageNo * this.pageSize)
    }
  },
  watch: {
    rows() {
      this.pageNo = 1
    }
  },
  methods: {
    async exportDaily() {
      if (this.loading || this.error || this.exportingDaily || !this.appliedRange || !this.rows.length) return
      const rows = this.rows.slice()
      const range = this.appliedRange.slice()
      this.exportingDaily = true
      try {
        const XLSX = await import('xlsx')
        const workbook = dailyAmountWorkbook(XLSX, rows, range)
        XLSX.writeFile(workbook, `每日金额明细_${range[0].slice(0, 10)}_${range[1].slice(0, 10)}.xlsx`)
      } catch (error) {
        this.$message.error(error.message || '导出失败，请重试')
      } finally {
        this.exportingDaily = false
      }
    },
    numberText,
    typeInfo,
    display(value) {
      return value == null || value === '' ? '—' : String(value)
    }
  }
}
</script>
<style scoped>
.trend-panel .panel-head .el-button {
  margin-right: auto;
}
.data-view {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.7fr) minmax(0, 1.5fr);
  grid-template-rows: minmax(0, 1fr);
  height: 100%;
  gap: 8px;
}
.panel {
  min-width: 0;
  min-height: 0;
  padding: 12px;
  box-sizing: border-box;
  background: #fff;
  border: 1px solid #e7ebf1;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 3px 14px rgba(34, 54, 82, 0.035);
}
.overview-column {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
}
.overview-panel {
  flex: 0 0 auto;
}
.trend-panel {
  flex: 1;
  min-height: 240px;
}
.overview-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: 4px 0 8px;
}
.overview-metric {
  padding: 10px 12px;
  background: #f7f9fd;
  border: 1px solid #edf1f7;
  border-radius: 8px;
  min-width: 0;
}
.overview-metric > span {
  color: #7b889a;
  font-size: 12px;
}
.overview-metric strong {
  display: block;
  margin-top: 5px;
  font-size: 20px;
  line-height: 1.4;
  color: #365c9f;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.overview-metric small {
  margin-left: 5px;
  font-size: 12px;
  font-weight: normal;
  color: #8b97a7;
}
.trend-chart-wrap {
  display: flex;
  flex: 1;
  min-height: 0;
}
.detail-panel {
  grid-column: 2;
  grid-row: 1;
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
h3 {
  margin: 0;
  font-size: 14px;
  color: #27364a;
}
.panel-head span,
.data-note,
.secondary {
  font-size: 11px;
  color: #8b97a7;
}
.data-note {
  margin: 4px 0 0;
  line-height: 1.6;
}
.detail-table-wrap {
  flex: 1;
  min-height: 0;
}
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 11px;
  color: #7b889a;
  padding-top: 10px;
}
.order-number {
  color: #365c9f;
}
.amount {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
@media (max-width: 1250px) {
  .data-view {
    overflow: auto;
  }
  .dashboard-grid {
    grid-template-columns: 1fr;
    grid-template-rows: none;
    height: auto;
  }
  .overview-column {
    overflow: visible;
  }
  .trend-panel {
    flex: none;
  }
  .trend-chart-wrap {
    flex: none;
    height: 300px;
  }
  .detail-panel {
    grid-column: auto;
    grid-row: auto;
    height: 480px;
  }
}
</style>
