<template>
  <div class="electricity-summary">
    <div class="query-card">
      <div class="query-form">
        <el-date-picker
          v-model="query.monthRange"
          type="monthrange"
          value-format="yyyy-MM"
          range-separator="至"
          start-placeholder="开始月份"
          end-placeholder="结束月份"
          :clearable="false"
          class="month-range" />
        <!-- <el-select v-model="query.roomIds" multiple collapse-tags filterable placeholder="选择配电房" class="room-select" @change="handleRoomChange">
          <el-option v-for="room in roomList" :key="room.ID" :label="room.NAME" :value="room.ID" />
        </el-select>
        <span class="condition-separator">或</span>
        <el-input v-model.trim="query.code" clearable placeholder="请输入电表编号" class="code-input" @input="handleCodeInput" @keyup.enter.native="search" /> -->
        <el-button type="primary" :loading="loading" @click="search">查询</el-button>
      </div>
    </div>

    <div class="content" v-loading="loading">
      <div v-if="!rows.length && !loading" class="empty-wrap">
        <el-empty description="当前查询条件暂无用电数据" />
      </div>
      <template v-else>
        <div class="dashboard-grid">
          <div class="panel trend-panel">
            <div class="panel__head">
              <div>
                <h3>
                  实用电量趋势
                  <span style="font-size: 12px; color: gray">({{ dimension === 'room' ? '配电房按总表统计' : '电表按编号统计' }})</span>
                </h3>
              </div>
              <span>度 / 月</span>
            </div>
            <div class="trend-controls">
              <el-radio-group v-model="dimension" size="mini" @change="handleDimensionChange">
                <el-radio-button label="room">按配电房</el-radio-button>
                <el-radio-button label="meter">按电表</el-radio-button>
              </el-radio-group>
              <el-select v-model="selectedEntityKeys" multiple collapse-tags filterable reserve-keyword size="mini" placeholder="请选择配电房或输入电表编号" class="trend-entity-select">
                <el-option v-for="item in entityOptions" :key="item.key" :label="item.label" :value="item.key" />
              </el-select>
            </div>
            <div v-if="hasTrendData" ref="trendChart" class="trend-chart"></div>
            <div v-else class="chart-empty">暂无实用电量</div>
          </div>

          <div class="panel detail-panel">
            <div class="panel__head">
              <div>
                <h3>
                  当前选择明细
                  <span style="font-size: 12px; color: gray">({{ detailRows.length }} 条记录)</span>
                </h3>
              </div>
            </div>
            <div class="detail-table-wrap">
              <vxe-table
                :data="detailRows"
                :loading="false"
                size="mini"
                stripe
                border
                height="100%"
                align="center"
                header-align="center"
                show-overflow="tooltip"
                :scroll-y="{ enabled: true, gt: 20, oSize: 5 }"
                empty-text="暂无明细">
                <vxe-column field="month" title="月份" width="92" fixed="left" :formatter="formatMonthCell"></vxe-column>
                <vxe-column field="roomName" title="配电房" min-width="105"></vxe-column>
                <vxe-column field="meterCode" title="电表编号" min-width="105"></vxe-column>
                <vxe-column field="meterLocation" title="安装位置" min-width="100"></vxe-column>
                <vxe-column field="magnification" title="倍率" width="70" align="right" :formatter="formatNumberCell"></vxe-column>
                <vxe-column field="readingTotal3" title="实用度数" min-width="95" align="right" :formatter="formatNumberCell"></vxe-column>
                <vxe-column field="kva" title="KVA" width="75" align="right" :formatter="formatNumberCell"></vxe-column>
                <vxe-column field="kvaTotal" title="KVA总数" width="90" align="right" :formatter="formatNumberCell"></vxe-column>
              </vxe-table>
            </div>
          </div>
          <div class="panel">
            <div class="panel__head">
              <div>
                <h3>尖峰平谷构成</h3>
              </div>
              <span>度</span>
            </div>
            <div v-if="hasTouData" ref="touChart" class="bottom-chart"></div>
            <div v-else class="chart-empty">当前暂无尖峰平谷数据</div>
          </div>
          <div class="panel">
            <div class="panel__head">
              <div>
                <h3>用电量对比</h3>
              </div>
              <span>度</span>
            </div>
            <div v-if="hasComparisonData" ref="comparisonChart" class="bottom-chart"></div>
            <div v-else class="chart-empty">当前暂无实用电量</div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

const touPeriods = [
  { name: '尖', field: 'readingSharp3', color: '#e56863' },
  { name: '峰', field: 'readingPeak3', color: '#f2a23a' },
  { name: '平', field: 'readingFlat3', color: '#4c9dde' },
  { name: '谷', field: 'readingValley3', color: '#62b99c' }
]
const chartColors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']

function numberValue(value) {
  if (value === null || value === undefined || value === '') return null
  const result = Number(value)
  return Number.isFinite(result) ? result : null
}

function responseRows(response) {
  if (Array.isArray(response)) return response
  if (response && Array.isArray(response.records)) return response.records
  if (response && Array.isArray(response.data)) return response.data
  return []
}

function rowMonth(row) {
  return String(row.month || '').slice(0, 7)
}

function roomKey(row) {
  return String(row.roomId || row.roomName || '')
}

function meterKey(row) {
  return String(row.meterId || `${roomKey(row)}:${row.meterCode || ''}`)
}

function roomAnalysisRows(rows) {
  const rowsByMonth = rows.reduce((result, row) => {
    const month = rowMonth(row)
    if (!result[month]) result[month] = []
    result[month].push(row)
    return result
  }, Object.create(null))
  return Object.keys(rowsByMonth).reduce((result, month) => {
    const monthRows = rowsByMonth[month]
    const exactTotalRows = monthRows.filter((row) => String(row.meterLocation || '').trim() === '总表')
    if (exactTotalRows.length) return result.concat(exactTotalRows)
    const namedTotalRows = monthRows.filter((row) => String(row.meterLocation || '').includes('总表'))
    if (namedTotalRows.length) return result.concat(namedTotalRows)
    const meterCount = new Set(monthRows.map((row) => meterKey(row))).size
    return meterCount === 1 ? result.concat(monthRows) : result
  }, [])
}

export default {
  name: 'ElectricitySummary',
  data() {
    const now = new Date()
    const year = now.getFullYear()
    const currentMonth = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return {
      query: {
        monthRange: [`${year}-01`, currentMonth],
        roomIds: [],
        code: ''
      },
      appliedQuery: {
        dateStart: `${year}-01`,
        dateEnd: currentMonth,
        roomIds: [],
        code: ''
      },
      roomList: [],
      rows: [],
      loading: false,
      requestId: 0,
      dimension: 'room',
      selectedEntityKeys: [],
      chartFrame: null,
      resizeFrame: null,
      charts: {}
    }
  },
  computed: {
    months() {
      return this.createMonthRange(this.appliedQuery.dateStart, this.appliedQuery.dateEnd)
    },
    entityBuckets() {
      const buckets = Object.create(null)
      this.rows.forEach((row) => {
        const key = this.dimension === 'room' ? roomKey(row) : meterKey(row)
        if (!key) return
        if (!buckets[key]) {
          buckets[key] = {
            key,
            label: this.dimension === 'room' ? row.roomName || '未标注配电房' : `${row.roomName || '未标注配电房'} / ${row.meterCode || '未编号'} / ${row.meterLocation || '未标注位置'}`,
            rawRows: [],
            byMonth: Object.create(null),
            tou: Object.create(null),
            actualTotal: null
          }
        }
        buckets[key].rawRows.push(row)
      })
      Object.keys(buckets).forEach((key) => {
        const bucket = buckets[key]
        const analysisRows = this.dimension === 'room' && !this.appliedQuery.code ? roomAnalysisRows(bucket.rawRows) : bucket.rawRows
        let hasActual = false
        let actualTotal = 0
        analysisRows.forEach((row) => {
          const month = rowMonth(row)
          const actual = numberValue(row.readingTotal3)
          if (actual !== null) {
            hasActual = true
            actualTotal += actual
            bucket.byMonth[month] = (bucket.byMonth[month] || 0) + actual
          }
          touPeriods.forEach((period) => {
            const value = numberValue(row[period.field])
            if (value !== null) bucket.tou[period.field] = (bucket.tou[period.field] || 0) + value
          })
        })
        bucket.actualTotal = hasActual ? actualTotal : null
      })
      return buckets
    },
    entityOptions() {
      return Object.keys(this.entityBuckets).map((key) => ({ key, label: this.entityBuckets[key].label }))
    },
    selectedRows() {
      if (!this.selectedEntityKeys.length) return []
      const selected = new Set(this.selectedEntityKeys)
      return this.rows.filter((row) => selected.has(this.dimension === 'room' ? roomKey(row) : meterKey(row)))
    },
    detailRows() {
      return this.selectedRows
    },
    trendSeries() {
      return this.selectedEntityKeys.map((key, index) => ({
        name: this.entityLabel(key),
        type: 'line',
        smooth: true,
        connectNulls: false,
        symbolSize: 7,
        itemStyle: { color: chartColors[index % chartColors.length] },
        data: this.months.map((month) => {
          const bucket = this.entityBuckets[key]
          return bucket && Object.prototype.hasOwnProperty.call(bucket.byMonth, month) ? bucket.byMonth[month] : null
        })
      }))
    },
    hasTrendData() {
      return this.trendSeries.some((series) => series.data.some((value) => value !== null))
    },
    touSeries() {
      return touPeriods.map((period) => ({
        name: period.name,
        type: 'bar',
        stack: '分时',
        itemStyle: { color: period.color },
        data: this.selectedEntityKeys.map((key) => (this.entityBuckets[key] && this.entityBuckets[key].tou[period.field]) || 0)
      }))
    },
    hasTouData() {
      return this.selectedEntityKeys.some((key) => {
        const bucket = this.entityBuckets[key]
        return bucket && touPeriods.some((period) => Object.prototype.hasOwnProperty.call(bucket.tou, period.field))
      })
    },
    comparisonData() {
      return this.selectedEntityKeys.map((key) => ({ name: this.entityLabel(key), value: this.entityBuckets[key] ? this.entityBuckets[key].actualTotal : null })).filter((item) => item.value !== null)
    },
    hasComparisonData() {
      return this.comparisonData.length > 0
    }
  },
  watch: {
    selectedEntityKeys() {
      this.scheduleCharts()
    }
  },
  mounted() {
    window.addEventListener('resize', this.resizeCharts)
    this.loadRooms()
  },
  beforeDestroy() {
    this.requestId++
    if (this.chartFrame) window.cancelAnimationFrame(this.chartFrame)
    if (this.resizeFrame) window.cancelAnimationFrame(this.resizeFrame)
    window.removeEventListener('resize', this.resizeCharts)
    Object.keys(this.charts).forEach((key) => this.charts[key].dispose())
  },
  methods: {
    displayNumber(value) {
      return Number(value || 0).toLocaleString('zh-CN', { maximumFractionDigits: 2 })
    },
    displayValue(value) {
      const number = numberValue(value)
      return number === null ? '—' : this.displayNumber(number)
    },
    formatMonth(value) {
      const month = String(value || '').slice(0, 7)
      return /^\d{4}-\d{2}$/.test(month) ? month.replace('-', '年') + '月' : '—'
    },
    formatMonthCell({ cellValue }) {
      return this.formatMonth(cellValue)
    },
    formatNumberCell({ cellValue }) {
      return this.displayValue(cellValue)
    },
    createMonthRange(start, end) {
      if (!/^\d{4}-\d{2}$/.test(start || '') || !/^\d{4}-\d{2}$/.test(end || '')) return []
      const [startYear, startMonth] = start.split('-').map(Number)
      const [endYear, endMonth] = end.split('-').map(Number)
      const count = Math.min((endYear - startYear) * 12 + endMonth - startMonth + 1, 120)
      if (count < 1) return []
      return Array.from({ length: count }, (_, index) => {
        const date = new Date(startYear, startMonth - 1 + index, 1)
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      })
    },
    loadRooms() {
      const params = {
        sqlParam: {},
        reportId: 'a3321fd8d0bb50853a5005bd7e8fa4bd',
        reportParam: {},
        router: 'distributionRoomManagement',
        code: 'DistributionRoom',
        permissionVo: { router: 'distributionRoomManagement', resourceId: '' },
        page: { current: 1, size: '100', orders: [] }
      }
      this.$api['baseData.meterListSearch'](params)
        .then((response) => {
          this.roomList = response && Array.isArray(response.records) ? response.records : []
          this.query.roomIds = this.roomList.map((room) => room.ID)
          this.search()
        })
        .catch(() => this.$message.error('获取配电房失败'))
    },
    search() {
      const range = this.query.monthRange || []
      if (range.length !== 2) {
        this.$message.warning('请选择开始月份和结束月份')
        return
      }
      const code = String(this.query.code || '').trim()
      if (!code && !this.query.roomIds.length) {
        this.$message.warning('请选择配电房或输入电表编号')
        return
      }
      const payload = {
        dateStart: range[0],
        dateEnd: range[1]
      }
      if (code) payload.code = code
      else payload.roomIds = this.query.roomIds.slice()
      const requestId = ++this.requestId
      this.loading = true
      this.$api['baseData.searchByMonth'](payload)
        .then((response) => {
          if (requestId !== this.requestId) return
          this.appliedQuery = payload
          this.rows = responseRows(response)
            .slice()
            .sort((a, b) => {
              const monthCompare = rowMonth(b).localeCompare(rowMonth(a))
              return monthCompare || String(a.roomName || '').localeCompare(String(b.roomName || '')) || String(a.meterCode || '').localeCompare(String(b.meterCode || ''))
            })
          this.resetEntitySelection()
        })
        .catch(() => {
          if (requestId !== this.requestId) return
          this.rows = []
          this.selectedEntityKeys = []
          this.$message.error('获取用电分析数据失败')
        })
        .finally(() => {
          if (requestId === this.requestId) this.loading = false
        })
    },
    handleCodeInput(value) {
      if (String(value || '').trim()) {
        this.query.roomIds = []
      } else if (!this.query.roomIds.length) {
        this.query.roomIds = this.roomList.map((room) => room.ID)
      }
    },
    handleRoomChange(roomIds) {
      if (roomIds.length) this.query.code = ''
    },
    resetEntitySelection() {
      this.dimension = this.appliedQuery.code ? 'meter' : 'room'
      this.setDefaultEntitySelection()
      this.scheduleCharts()
    },
    handleDimensionChange() {
      this.setDefaultEntitySelection()
    },
    setDefaultEntitySelection() {
      const keys = this.entityOptions.map((item) => item.key)
      this.selectedEntityKeys = this.dimension === 'meter' ? keys.slice(0, 1) : keys
    },
    entityLabel(key) {
      return this.entityBuckets[key] ? this.entityBuckets[key].label : key
    },
    scheduleCharts() {
      if (this.chartFrame) window.cancelAnimationFrame(this.chartFrame)
      this.$nextTick(() => {
        this.chartFrame = window.requestAnimationFrame(() => {
          this.chartFrame = null
          this.drawCharts()
        })
      })
    },
    getChart(name, element) {
      if (!element) {
        if (this.charts[name]) {
          this.charts[name].dispose()
          delete this.charts[name]
        }
        return null
      }
      if (this.charts[name] && this.charts[name].getDom() !== element) {
        this.charts[name].dispose()
        delete this.charts[name]
      }
      if (!this.charts[name]) this.charts[name] = echarts.init(element)
      return this.charts[name]
    },
    drawCharts() {
      const trend = this.getChart('trend', this.$refs.trendChart)
      if (trend) {
        trend.setOption(
          {
            animation: false,
            tooltip: { trigger: 'item', valueFormatter: (value) => (value === null || value === undefined ? '暂无数据' : `${this.displayNumber(value)} 度`) },
            legend: { type: 'scroll', top: 0 },
            grid: { left: 62, right: 24, top: 48, bottom: 40 },
            xAxis: { type: 'category', boundaryGap: false, data: this.months, axisTick: { show: false } },
            yAxis: { type: 'value', min: 0, splitLine: { lineStyle: { color: '#edf1f6' } }, axisLabel: { formatter: (value) => this.displayNumber(value) } },
            series: this.trendSeries
          },
          true
        )
      }
      const tou = this.getChart('tou', this.$refs.touChart)
      if (tou) {
        tou.setOption(
          {
            animation: false,
            tooltip: { trigger: 'item', valueFormatter: (value) => `${this.displayNumber(value)} 度` },
            legend: { top: 0 },
            grid: { left: 62, right: 20, top: 42, bottom: 70 },
            xAxis: { type: 'category', data: this.selectedEntityKeys.map(this.entityLabel), axisLabel: { interval: 0, rotate: this.selectedEntityKeys.length > 3 ? 25 : 0 } },
            yAxis: { type: 'value', min: 0, splitLine: { lineStyle: { color: '#edf1f6' } } },
            series: this.touSeries
          },
          true
        )
      }
      const comparison = this.getChart('comparison', this.$refs.comparisonChart)
      if (comparison) {
        comparison.setOption(
          {
            animation: false,
            color: ['#5b8ff9'],
            tooltip: { trigger: 'item', valueFormatter: (value) => `${this.displayNumber(value)} 度` },
            grid: { left: 115, right: 45, top: 15, bottom: 28 },
            xAxis: { type: 'value', min: 0, splitLine: { lineStyle: { color: '#edf1f6' } } },
            yAxis: { type: 'category', data: this.comparisonData.map((item) => item.name).reverse(), axisLabel: { width: 105, overflow: 'truncate' } },
            series: [
              {
                type: 'bar',
                barMaxWidth: 22,
                data: this.comparisonData.map((item) => item.value).reverse(),
                label: { show: true, position: 'right', formatter: (params) => this.displayNumber(params.value) }
              }
            ]
          },
          true
        )
      }
      this.resizeCharts()
    },
    resizeCharts() {
      if (this.resizeFrame) window.cancelAnimationFrame(this.resizeFrame)
      this.resizeFrame = window.requestAnimationFrame(() => {
        this.resizeFrame = null
        Object.keys(this.charts).forEach((key) => this.charts[key].resize())
      })
    }
  }
}
</script>

<style scoped>
.electricity-summary {
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
  justify-content: flex-start;
  margin: 8px 10px 0;
  padding: 7px 12px;
  background: #fff;
  border: 1px solid #e7ebf1;
  border-radius: 8px;
}
h3,
p {
  margin: 0;
}
h3 {
  font-size: 15px;
}
.panel__head p {
  margin-top: 5px;
  color: #8793a3;
  font-size: 12px;
}
.query-form {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  flex-wrap: nowrap;
  width: 100%;
}
.month-range {
  width: 250px;
}
.room-select {
  width: 270px;
}
.code-input {
  width: 180px;
}
.condition-separator {
  color: #9aa5b5;
  font-size: 12px;
}
.content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 8px 10px 23px;
}
.empty-wrap {
  min-height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.panel {
  background: #fff;
  border: 1px solid #e7ebf1;
  border-radius: 10px;
  box-shadow: 0 3px 14px rgba(34, 54, 82, 0.035);
}
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  height: 100%;
  gap: 8px;
}
.panel {
  min-width: 0;
  min-height: 0;
  height: auto;
  padding: 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}
.panel__head > span {
  color: #99a4b3;
  font-size: 11px;
}
.trend-chart {
  width: 100%;
  flex: 1;
  min-height: 0;
}
.bottom-chart {
  width: 100%;
  flex: 1;
  min-height: 0;
}
.chart-empty {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a2acba;
  font-size: 12px;
}
.detail-panel ::v-deep .vxe-table {
  font-size: 12px;
}
.detail-table-wrap {
  flex: 1;
  min-width: 0;
  min-height: 0;
}
.trend-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.trend-entity-select {
  flex: 1;
  min-width: 0;
}
.data-note {
  margin: 4px 2px;
  color: #8b97a7;
  font-size: 11px;
  line-height: 1.6;
}
@media (max-width: 1250px) {
  .query-form {
    justify-content: flex-start;
  }
  .content {
    overflow: auto;
  }
  .dashboard-grid {
    grid-template-columns: 1fr;
    grid-template-rows: none;
    grid-auto-rows: 360px;
    height: auto;
  }
  .panel {
    height: 360px;
  }
}
@media (max-width: 700px) {
  .query-form,
  .query-form > * {
    width: 100%;
  }
  .month-range,
  .room-select,
  .code-input {
    width: 100%;
  }
}
</style>
