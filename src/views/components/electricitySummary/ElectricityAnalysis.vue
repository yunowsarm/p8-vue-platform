<template>
  <div class="analysis-page">
    <el-empty v-if="!roomOptions.length" description="当前查询范围暂无数据" />
    <template v-else>
      <div class="analysis-toolbar">
        <div>
          <h3>用电数据分析</h3>
          <!-- <span>{{ appliedQuery.dateStart }} 至 {{ appliedQuery.dateEnd }} · {{ report.recordCount }} 条记录</span> -->
        </div>
        <el-select v-model="selectedRooms" multiple collapse-tags filterable reserve-keyword size="mini" placeholder="选择分析配电房" class="room-filter">
          <el-option v-for="room in roomOptions" :key="room.key" :label="room.name" :value="room.key" />
        </el-select>
        <el-button size="mini" @click="selectAll">全部配电房</el-button>
        <el-dropdown trigger="click" @command="exportReport">
          <el-button size="mini" type="primary" :disabled="loading || !report.recordCount">
            导出报告
            <i class="el-icon-arrow-down"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="html">导出 HTML</el-dropdown-item>
            <el-dropdown-item command="pdf">打印 / 保存 PDF</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="metrics">
        <div>
          <span>累计实用电量</span>
          <strong>
            {{ number(report.total) }}
            <small>度</small>
          </strong>
          <p>{{ report.roomCount }} 个配电房 · {{ report.meterCount }} 块电表</p>
        </div>
        <div>
          <span>月均实用电量</span>
          <strong>
            {{ number(report.average) }}
            <small>度</small>
          </strong>
          <p>按有统计数据的月份计算</p>
        </div>
        <div>
          <span>最近有效月环比</span>
          <strong :class="report.latest && report.latest.change > 0 ? 'warning' : ''">{{ report.latest ? percent(report.latest.change) : '—' }}</strong>
          <p>{{ report.latest ? `${report.latest.month} · ${report.latest.comparable} 个可比配电房` : '暂无可比月份' }}</p>
        </div>
        <div>
          <span>总实用度数完整率</span>
          <strong>{{ percent(report.completeness) }}</strong>
          <p>统计覆盖率 {{ percent(report.coverage) }}</p>
        </div>
      </div>
      <div class="conclusions">
        <strong>
          <i class="el-icon-data-analysis"></i>
          分析结论
        </strong>
        <p v-for="text in findings" :key="text">{{ text }}</p>
      </div>
      <p class="scope-note">
        {{ scopeNote }}
      </p>
      <electricity-forecast ref="forecast" :forecasts="forecasts" :horizon="forecastHorizon" @horizon-change="forecastHorizon = $event" />
      <div class="charts-grid">
        <section class="chart-panel">
          <div class="panel-heading">
            <h3>月度用电趋势</h3>
            <span>度</span>
          </div>
          <div ref="trend" class="chart"></div>
        </section>
        <section class="chart-panel">
          <div class="panel-heading">
            <h3>相邻月份变化</h3>
            <span>同口径环比 %</span>
          </div>
          <div ref="change" class="chart"></div>
        </section>
        <section class="chart-panel">
          <div class="panel-heading">
            <h3>用电排名</h3>
            <el-radio-group v-model="rankingMode" size="mini">
              <el-radio-button label="room">配电房</el-radio-button>
              <el-radio-button label="meter">电表</el-radio-button>
            </el-radio-group>
          </div>
          <div ref="ranking" class="chart"></div>
          <p class="chart-note">
            共 {{ rankingData.length }} 个对象，滚轮或拖动右侧滑块查看全部排名。
            <el-button type="text" size="mini" @click="detailTab = 'ranking'">查看电量及统计电表明细</el-button>
          </p>
          <p class="chart-note">
            {{ rankingMode === 'room' ? '所有所选配电房均保留；累计已有电量，数据不完整对象的累计值可能偏低，详见排名明细。' : '按各电表独立累计，总表与分表可能重叠，不应直接相加。' }}
          </p>
        </section>
        <section class="chart-panel">
          <div class="panel-heading">
            <h3>尖峰平谷用电结构</h3>
            <span>{{ report.touRecords }} 条有分时数据 · {{ report.touCompleteRecords }} 条四时段完整</span>
          </div>
          <div ref="tou" class="chart"></div>
          <p class="chart-note">已知分时合计 {{ number(report.touTotal) }} 度；{{ report.tou.map((item) => `${item.name}：${item.records} 条`).join('，') }}。缺失时段不按零处理。</p>
          <p v-if="report.touFallbackGroups" class="chart-note">{{ report.touFallbackGroups }} 个配电房月份无总表分时数据，采用有数据电表参考，可能存在总分表重叠；此占比与配电房累计总量口径不同。</p>
        </section>
      </div>
      <section class="table-panel">
        <el-tabs v-model="detailTab">
          <el-tab-pane :label="`数据质量 · ${report.anomalies.length} 条待核对`" name="quality" />
          <el-tab-pane label="月度统计明细" name="monthly" />
          <el-tab-pane :label="`用电排名明细 · ${rankingData.length} 个`" name="ranking" />
        </el-tabs>
        <vxe-table
          v-if="detailTab === 'quality'"
          :data="report.anomalies"
          height="260"
          size="mini"
          border
          stripe
          align="center"
          header-align="center"
          show-overflow="tooltip"
          :scroll-y="{ enabled: true, gt: 20, oSize: 5 }"
          empty-text="当前范围未发现可校验异常">
          <vxe-column field="month" title="月份" width="100" />
          <vxe-column field="roomName" title="配电房" min-width="120" />
          <vxe-column field="meterCode" title="电表编号" width="120" />
          <vxe-column field="type" title="核对项目" width="150" />
          <vxe-column field="description" title="说明" min-width="300" />
        </vxe-table>
        <vxe-table v-else-if="detailTab === 'monthly'" :data="report.monthly" height="260" size="mini" border stripe align="center" header-align="center" show-overflow="tooltip">
          <vxe-column field="month" title="月份" width="110" />
          <vxe-column field="value" title="实用电量（度）" :formatter="numberCell" min-width="150" />
          <vxe-column field="coverage" title="有统计数据配电房" min-width="140" />
          <vxe-column field="expected" title="范围内配电房数" min-width="140" />
          <vxe-column field="comparable" title="环比可比配电房" min-width="140" />
          <vxe-column field="change" title="环比" :formatter="percentCell" min-width="110" />
        </vxe-table>
        <vxe-table v-else :data="rankingData" height="260" size="mini" border stripe align="center" header-align="center" show-overflow="tooltip" :scroll-y="{ enabled: true, gt: 20, oSize: 5 }">
          <vxe-column title="排名" width="80">
            <template #default="{ row, rowIndex }">{{ row.value === null ? '—' : rowIndex + 1 }}</template>
          </vxe-column>
          <vxe-column field="name" :title="rankingMode === 'room' ? '配电房' : '电表'" min-width="260" />
          <vxe-column field="value" title="累计实用度数" :formatter="numberCell" min-width="150" />
          <vxe-column v-if="rankingMode === 'room'" field="knownValue" title="已知统计电量（参考）" :formatter="numberCell" min-width="180" />
          <vxe-column v-if="rankingMode === 'room'" field="status" title="数据状态" min-width="180" />
          <vxe-column v-if="rankingMode === 'room'" field="statisticMeters" title="参与统计的电表" min-width="240" />
        </vxe-table>
        <p class="chart-note">核对结果是数据一致性提示，换表、回零、冲抵等业务情况需结合实际确认；同一条记录可能有多个核对项目。</p>
      </section>
    </template>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { analyze, analysisRoomOptions } from './analysis'
import { buildReportHtml } from './exportReport'
import { forecastRoom } from './forecast'
import ElectricityForecast from './ElectricityForecast.vue'

export default {
  name: 'ElectricityAnalysis',
  components: { ElectricityForecast },
  props: { rows: { type: Array, default: () => [] }, roomList: { type: Array, default: () => [] }, appliedQuery: { type: Object, required: true }, loading: Boolean },
  data() {
    return {
      selectedRooms: [],
      rankingMode: 'room',
      detailTab: 'quality',
      charts: {},
      frame: null,
      forecastHorizon: 3,
      currentMonth: new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit' }).format(new Date())
    }
  },
  computed: {
    roomOptions() {
      return analysisRoomOptions(this.rows, this.roomList, this.appliedQuery)
    },
    report() {
      return analyze(this.rows, this.appliedQuery, this.selectedRooms, this.roomOptions)
    },
    forecasts() {
      return this.report.roomRanking.map((room) => forecastRoom(room, { horizon: this.forecastHorizon, currentMonth: this.currentMonth }))
    },
    rankingData() {
      return this.rankingMode === 'room' ? this.report.roomRanking : this.report.meterRanking
    },
    scopeNote() {
      return '统计口径：配电房优先取总表，其次取名称含“总表”的电表，再取当月唯一电表；多表且无总表时无法确定总量；按与数据视图相同的规则累计已知电量，缺失或重复电表记录不计入，部分累计会标注数据不完整。空值不补零。环比仅使用相邻月统计电表数据均完整的同一批配电房。分时结构按已知时段统计，优先总表，无总表分时数据时采用有数据电表参考，占比不代表完整总用电结构。覆盖率以所选配电房名录和查询月份为基数。无可用总量的配电房保留显示，不参与数值排名；数据不完整对象的累计值仅代表已知电量。电表排名包含总表和分表，不应直接相加。'
    },
    findings() {
      const r = this.report
      const result = []
      if (!r.recordCount) return [this.selectedRooms.length ? '当前所选配电房在查询月份范围内暂无记录。' : '请选择至少一个配电房查看分析。']
      if (r.peak) result.push(`${r.peak.month}为当前范围用电最高月份，累计 ${this.number(r.peak.value)} 度，覆盖 ${r.peak.coverage} 个配电房。`)
      const top = r.roomRanking.find((item) => item.value !== null)
      if (top)
        result.push(
          `${top.name}累计用电最高，为 ${this.number(top.value)} 度${r.total > 0 && top.value >= 0 ? `，占已统计总量的 ${this.percent((top.value / r.total) * 100)}` : ''}，有数据月份 ${
            top.validMonths
          } 个。`
        )
      if (r.latest && r.latest.change !== null)
        result.push(`${r.latest.month}同口径环比${r.latest.change >= 0 ? '增长' : '下降'} ${this.percent(Math.abs(r.latest.change))}；可比配电房 ${r.latest.comparable} 个。`)
      if (r.coverage < 100) result.push(`统计覆盖率 ${this.percent(r.coverage)}，部分配电房月份缺报或无法确定总表，趋势及排名需结合覆盖情况查看。`)
      if (r.unresolvedRooms.length) result.push(`以下配电房暂无可用总量：${r.unresolvedRooms.join('、')}。`)
      result.push(`发现 ${r.anomalies.length} 条待核对项目，涉及 ${r.affectedMeters} 块电表；总实用度数完整率 ${this.percent(r.completeness)}。`)
      return result
    }
  },
  watch: {
    roomOptions: {
      immediate: true,
      handler() {
        this.selectAll()
      }
    },
    report() {
      this.schedule()
    },
    rankingMode() {
      this.schedule()
    }
  },
  mounted() {
    window.addEventListener('resize', this.schedule)
    this.schedule()
  },
  activated() {
    this.schedule()
  },
  deactivated() {
    if (this.frame) cancelAnimationFrame(this.frame)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.schedule)
    if (this.frame) cancelAnimationFrame(this.frame)
    Object.values(this.charts).forEach((chart) => chart.dispose())
  },
  methods: {
    exportReport(format) {
      if (this.loading || !this.report.recordCount) return
      const popup = format === 'pdf' ? window.open('', '_blank') : null
      if (format === 'pdf' && !popup) {
        this.$message.warning('浏览器拦截了打印窗口，请允许弹出窗口后重试')
        return
      }
      try {
        this.draw()
        const titles = { trend: '月度用电趋势', change: '相邻月份变化', ranking: '用电排名（当前图表窗口，完整名单见下方）', tou: '尖峰平谷用电结构（已知数据）' }
        const charts = Object.keys(titles)
          .filter((name) => this.charts[name])
          .map((name) => ({ title: titles[name], image: this.charts[name].getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#fff' }) }))
        const forecastChart = this.$refs.forecast && this.$refs.forecast.exportChart()
        if (forecastChart) charts.unshift(forecastChart)
        const html = buildReportHtml({
          report: this.report,
          forecasts: this.forecasts,
          query: this.appliedQuery,
          roomNames: this.roomOptions.filter((room) => this.selectedRooms.includes(room.key)).map((room) => room.name),
          findings: this.findings,
          charts,
          scopeNote: this.scopeNote,
          autoPrint: format === 'pdf'
        })
        if (popup) {
          popup.opener = null
          popup.document.open()
          popup.document.write(html)
          popup.document.close()
        } else {
          const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }))
          const link = document.createElement('a')
          link.href = url
          link.download = `用电分析_${this.appliedQuery.dateStart}_${this.appliedQuery.dateEnd}.html`
          document.body.appendChild(link)
          link.click()
          link.remove()
          setTimeout(() => URL.revokeObjectURL(url), 1000)
        }
      } catch (error) {
        if (popup) popup.close()
        this.$message.error('报告导出失败，请稍后重试')
      }
    },
    number(value) {
      return value === null || value === undefined ? '—' : Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 2 })
    },
    percent(value) {
      return value === null || value === undefined ? '—' : `${this.number(value)}%`
    },
    numberCell({ cellValue }) {
      return this.number(cellValue)
    },
    percentCell({ cellValue }) {
      return this.percent(cellValue)
    },
    selectAll() {
      this.selectedRooms = this.roomOptions.map((room) => room.key)
    },
    schedule() {
      this.$nextTick(() => {
        if (this._isDestroyed || this._inactive) return
        if (this.frame) cancelAnimationFrame(this.frame)
        this.frame = requestAnimationFrame(() => {
          this.frame = null
          this.draw()
        })
      })
    },
    setChart(name, option) {
      const element = this.$refs[name]
      if (!element) {
        if (this.charts[name]) {
          this.charts[name].dispose()
          delete this.charts[name]
        }
        return
      }
      if (this.charts[name] && this.charts[name].getDom() !== element) {
        this.charts[name].dispose()
        delete this.charts[name]
      }
      if (!this.charts[name]) this.charts[name] = echarts.init(element)
      this.charts[name].setOption({ animation: false, ...option }, true)
      this.charts[name].resize()
    },
    draw() {
      const r = this.report
      const grid = { left: 65, right: 25, top: 25, bottom: 35 }
      const tooltip = { trigger: 'item', valueFormatter: (value) => `${this.number(value)} 度` }
      const axis = { type: 'category', data: r.monthly.map((item) => item.month), axisTick: { show: false } }
      this.setChart('trend', {
        tooltip,
        grid,
        xAxis: axis,
        yAxis: { type: 'value' },
        series: [{ name: '实用电量', type: 'line', connectNulls: false, symbolSize: 6, itemStyle: { color: '#5470c6' }, areaStyle: { opacity: 0.08 }, data: r.monthly.map((item) => item.value) }]
      })
      this.setChart('change', {
        tooltip: { trigger: 'item', valueFormatter: this.percent },
        grid,
        xAxis: axis,
        yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
        series: [{ name: '同口径环比', type: 'bar', barMaxWidth: 30, data: r.monthly.map((item) => ({ value: item.change, itemStyle: { color: item.change > 0 ? '#e58a63' : '#62b99c' } })) }]
      })
      const ranking = this.rankingData
      this.setChart('ranking', {
        tooltip,
        grid: { left: 155, right: 110, top: 12, bottom: 30 },
        xAxis: { type: 'value' },
        yAxis: { type: 'category', inverse: true, data: ranking.map((item) => (item.value === null ? `${item.name}（数据不完整）` : item.name)), axisLabel: { width: 140, overflow: 'truncate' } },
        dataZoom:
          ranking.length > 12
            ? [
                { type: 'slider', yAxisIndex: 0, right: 5, width: 12, startValue: 0, endValue: 11, filterMode: 'empty', showDetail: false },
                { type: 'inside', yAxisIndex: 0, startValue: 0, endValue: 11, filterMode: 'empty', zoomOnMouseWheel: false, moveOnMouseWheel: true, moveOnMouseMove: true }
              ]
            : [],
        series: [
          {
            type: 'bar',
            barMaxWidth: 20,
            barMinHeight: 3,
            label: { show: true, position: 'right', formatter: ({ dataIndex }) => this.number(ranking[dataIndex].value) },
            itemStyle: { color: '#5b8ff9' },
            data: ranking.map((item) => item.value)
          }
        ]
      })
      this.setChart('tou', {
        tooltip,
        legend: { bottom: 0 },
        title:
          r.touTotal > 0
            ? undefined
            : { text: r.touRecords ? '已知分时用电合计为 0' : '暂无分时示数，请核对填报', left: 'center', top: 'center', textStyle: { fontSize: 13, fontWeight: 'normal', color: '#8793a3' } },
        series: [
          {
            type: 'pie',
            radius: ['42%', '68%'],
            center: ['50%', '44%'],
            label: { formatter: '{b} {d}%' },
            data: r.touTotal > 0 ? r.tou.filter((item) => item.records > 0).map((item) => ({ name: item.name, value: item.value, itemStyle: { color: item.color } })) : []
          }
        ]
      })
    }
  }
}
</script>

<style scoped>
.analysis-page {
  height: 100%;
  overflow: auto;
  padding-right: 3px;
  color: #27364a;
}
h3,
p {
  margin: 0;
}
h3 {
  font-size: 14px;
}
.analysis-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.analysis-toolbar > div:first-child {
  flex: 1;
}
.analysis-toolbar span {
  color: #7b889a;
  font-size: 12px;
}
.room-filter {
  width: 300px;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}
.metrics > div {
  padding: 14px;
  background: #fff;
  border: 1px solid #e2e8f1;
  border-radius: 8px;
}
.metrics span {
  font-size: 12px;
  color: #718096;
}
.metrics strong {
  display: block;
  margin: 8px 0;
  color: #365c9f;
  font-size: 23px;
}
.metrics small {
  font-size: 12px;
  font-weight: normal;
}
.metrics p {
  font-size: 11px;
  color: #7b889a;
}
.metrics .warning {
  color: #bd6b43;
}
.conclusions {
  margin-top: 10px;
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
  margin-top: 5px;
  color: #53657f;
  font-size: 12px;
  line-height: 1.6;
}
.scope-note {
  margin: 8px 2px;
  color: #7b889a;
  font-size: 11px;
  line-height: 1.6;
}
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.chart-panel,
.table-panel {
  min-width: 0;
  padding: 12px;
  background: #fff;
  border: 1px solid #e2e8f1;
  border-radius: 8px;
}
.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 30px;
}
.panel-heading span {
  color: #7b889a;
  font-size: 11px;
}
.chart {
  height: 235px;
  width: 100%;
}
.chart-note {
  margin-top: 7px;
  color: #7b889a;
  font-size: 11px;
  line-height: 1.5;
}
.table-panel {
  margin-top: 10px;
}
@media (max-width: 1000px) {
  .metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .charts-grid {
    grid-template-columns: 1fr;
  }
  .analysis-toolbar {
    flex-wrap: wrap;
  }
}
@media (max-width: 600px) {
  .metrics {
    grid-template-columns: 1fr;
  }
  .room-filter {
    width: 100%;
  }
}
</style>
