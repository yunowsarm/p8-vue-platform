<template>
  <div class="market-analysis">
    <div class="analysis-toolbar">
      <span>当前筛选范围 · {{ rows.length }} 条明细</span>
    </div>
    <sales-metrics :rows="rows" />
    <div v-if="rows.length" class="conclusions">
      <strong>
        <i class="el-icon-data-analysis"></i>
        分析结论
      </strong>
      <p>本次包含 {{ report.orders.size }} 个交易单、{{ report.devices.size }} 台设备，已知金额合计 {{ numberText(report.amount) }} 元。</p>
      <p v-if="report.unknown">{{ report.unknown }} 条明细业务类型未识别，暂无法形成完整的销售与退货对比。</p>
      <p v-if="products.length">当前商品金额排行第一：{{ products[0].name }}，{{ numberText(products[0].amount) }} 元。</p>
    </div>
    <el-alert title="统计口径：金额按接口原值汇总；销售与退货按 A / B 分组，不推算净销售额或毛利。" type="info" :closable="false" show-icon />
    <el-empty v-if="!rows.length" description="当前筛选范围暂无销售明细" />
    <template v-else>
      <div class="analysis-grid">
        <section class="analysis-panel wide">
          <div class="panel-title">
            <h3>金额趋势</h3>
            <span>按接收日期 · receivedAt</span>
          </div>
          <div ref="trend" class="chart" role="img" aria-label="按接收日期汇总金额的趋势图"></div>
          <p class="chart-note">接收时间可能晚于实际交易时间；缺少有效接收日期或金额的记录不计入趋势。</p>
        </section>
        <section class="analysis-panel">
          <div class="panel-title">
            <h3>业务类型分布</h3>
            <span>按明细条数</span>
          </div>
          <div ref="types" class="chart" role="img" aria-label="销售、退货及未识别类型的明细条数分布图"></div>
        </section>
        <section class="analysis-panel wide">
          <div class="panel-title">
            <h3>商品金额排行</h3>
            <span>前 10 名 · 金额原值合计</span>
          </div>
          <el-table :data="products" size="small" stripe style="margin-top: 30px">
            <el-table-column align="center" header-align="center" type="index" label="排名" />
            <el-table-column align="center" header-align="center" prop="name" label="商品 / 商品标识" show-overflow-tooltip />
            <el-table-column align="center" header-align="center" prop="count" label="明细数" />
            <el-table-column align="center" header-align="center" label="金额合计">
              <template slot-scope="scope">{{ numberText(scope.row.amount) }}</template>
            </el-table-column>
          </el-table>
        </section>
        <section class="analysis-panel">
          <div class="panel-title">
            <h3>设备贡献</h3>
            <span>前 10 台 · 金额原值合计</span>
          </div>
          <div ref="devices" class="chart" role="img" aria-label="设备金额排行柱状图"></div>
        </section>
      </div>
      <div class="data-note">
        <i class="el-icon-info"></i>
        商品分类、支付方式和库存接口尚未接入；当前不生成这些维度的统计。商品名称为空时显示接口商品标识。
      </div>
    </template>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import SalesMetrics from './SalesMetrics.vue'
import { numberText, numeric, typeInfo, summarize } from '../fields'

function ranking(rows, getKey, getName) {
  const groups = new Map()
  rows.forEach((row) => {
    const key = getKey(row)
    if (!groups.has(key)) groups.set(key, { name: getName(row), count: 0, amount: 0 })
    const group = groups.get(key)
    group.count++
    group.amount += numeric(row.b00517) || 0
  })
  return [...groups.values()].sort((a, b) => b.amount - a.amount).slice(0, 10)
}

export default {
  name: 'SuperMarketSalesAnalysis',
  components: { SalesMetrics },
  props: { rows: { type: Array, default: () => [] } },
  computed: {
    report() {
      return summarize(this.rows)
    },
    products() {
      return ranking(
        this.rows,
        (row) => row.o01292 || row.productName || 'unknown',
        (row) => row.productName || (row.o01292 ? `标识 ${row.o01292}` : '未识别商品')
      )
    }
  },
  watch: {
    rows() {
      this.$nextTick(this.renderCharts)
    }
  },
  mounted() {
    this.active = true
    this.charts = []
    this.renderCharts()
    window.addEventListener('resize', this.resizeCharts)
    if (typeof ResizeObserver !== 'undefined') {
      this.observer = new ResizeObserver(this.resizeCharts)
      this.observer.observe(this.$el)
    }
  },
  activated() {
    this.active = true
    this.$nextTick(this.renderCharts)
  },
  deactivated() {
    this.active = false
    this.disposeCharts()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
    if (this.observer) this.observer.disconnect()
    this.disposeCharts()
  },
  methods: {
    numberText,
    resizeCharts() {
      if (!this.active) return
      ;(this.charts || []).forEach((chart) => chart.resize())
    },
    disposeCharts() {
      ;(this.charts || []).forEach((chart) => chart.dispose())
      this.charts = []
    },
    renderCharts() {
      if (!this.active) return
      this.disposeCharts()
      if (!this.rows.length) return
      const common = {
        color: ['#5470c6', '#91cc75', '#fac858'],
        textStyle: { fontFamily: 'Microsoft YaHei, sans-serif', color: '#69768b' },
        tooltip: { trigger: 'axis', renderMode: 'richText', confine: true, valueFormatter: (value) => numberText(value) }
      }
      const draw = (ref, option) => {
        if (!this.$refs[ref]) return
        const chart = echarts.init(this.$refs[ref])
        chart.setOption({ ...common, ...option })
        this.charts.push(chart)
      }
      const days = new Map()
      this.rows.forEach((row) => {
        const date = String(row.receivedAt || '').slice(0, 10)
        const amount = numeric(row.b00517)
        if (/^\d{4}-\d{2}-\d{2}$/.test(date) && amount !== null) days.set(date, (days.get(date) || 0) + amount)
      })
      const dates = [...days.keys()].sort()
      draw('trend', {
        grid: { left: 65, right: 25, top: 30, bottom: 40 },
        xAxis: { type: 'category', data: dates, boundaryGap: true, axisTick: { show: false } },
        yAxis: { type: 'value', axisLabel: { formatter: (value) => numberText(value) }, splitLine: { lineStyle: { color: '#edf1f5' } } },
        series: [{ name: '金额合计', type: 'line', data: dates.map((date) => days.get(date)), smooth: true, symbolSize: 9, areaStyle: { color: 'rgba(84,112,198,.08)' } }]
      })
      const counts = { A: 0, B: 0, unknown: 0 }
      this.rows.forEach((row) => {
        counts[row.b01058 === 'A' || row.b01058 === 'B' ? row.b01058 : 'unknown']++
      })
      draw('types', {
        tooltip: { trigger: 'item', renderMode: 'richText', confine: true },
        legend: { bottom: 4 },
        series: [
          {
            type: 'pie',
            radius: ['48%', '70%'],
            center: ['50%', '43%'],
            label: { formatter: '{b}\n{c} 条' },
            data: Object.keys(counts)
              .map((key) => ({ name: typeInfo(key === 'unknown' ? '' : key).label, value: counts[key], itemStyle: { color: { A: '#5470c6', B: '#ee6666', unknown: '#a3adbd' }[key] } }))
              .filter((item) => item.value)
          }
        ]
      })
      const devices = ranking(
        this.rows,
        (row) => row.deviceId || 'unknown',
        (row) => row.deviceId || '未识别设备'
      ).reverse()
      draw('devices', {
        grid: { left: 120, right: 30, top: 20, bottom: 35 },
        xAxis: { type: 'value', axisLabel: { formatter: (value) => numberText(value) }, splitLine: { lineStyle: { color: '#edf1f5' } } },
        yAxis: { type: 'category', data: devices.map((item) => item.name), axisLabel: { width: 100, overflow: 'truncate' }, axisTick: { show: false } },
        series: [{ name: '金额合计', type: 'bar', barMaxWidth: 22, itemStyle: { borderRadius: [0, 4, 4, 0] }, data: devices.map((item) => item.amount) }]
      })
    }
  }
}
</script>

<style scoped>
.market-analysis {
  height: 100%;
  box-sizing: border-box;
  overflow: auto;
  padding-right: 3px;
  color: #27364a;
}
.analysis-toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}
.analysis-toolbar h3 {
  margin: 0;
  font-size: 14px;
  flex: 1;
}
.analysis-toolbar span {
  color: #7b889a;
  font-size: 12px;
}
.conclusions {
  margin: 10px 0;
  padding: 12px 16px;
  background: #eef4ff;
  border: 1px solid #dce6f8;
  border-radius: 8px;
}
.conclusions strong {
  font-size: 13px;
  color: #365c9f;
}
.conclusions p {
  margin: 5px 0 0;
  color: #53657f;
  font-size: 12px;
  line-height: 1.6;
}
.analysis-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 10px;
}
.analysis-panel {
  background: #fff;
  border: 1px solid #e6ebf0;
  border-radius: 10px;
  padding: 12px;
  min-width: 0;
}
.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.panel-title h3 {
  margin: 0;
  font-size: 14px;
  color: #253449;
}
.panel-title span,
.chart-note,
.data-note {
  font-size: 12px;
  color: #6d7a8e;
}
.chart {
  height: 235px;
  margin-top: 12px;
}
.chart-note {
  line-height: 1.6;
  margin: 0;
}
.data-note {
  margin-top: 18px;
  line-height: 1.8;
}
@media (max-width: 1050px) {
  .analysis-grid {
    grid-template-columns: 1fr;
  }
}
</style>
