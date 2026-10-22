<template>
  <div class="trend-wrap">
    <div v-if="points.length" ref="chart" class="trend-chart" role="img" aria-label="按接收日期汇总的金额趋势图"></div>
    <div v-else class="chart-empty">暂无有效接收日期和金额数据</div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { numeric } from '../fields'

export default {
  name: 'SuperMarketSalesTrend',
  props: { rows: { type: Array, default: () => [] } },
  computed: {
    points() {
      const days = new Map()
      this.rows.forEach((row) => {
        const day = String(row.receivedAt || '').slice(0, 10)
        const amount = numeric(row.b00517)
        if (/^\d{4}-\d{2}-\d{2}$/.test(day) && amount !== null) days.set(day, (days.get(day) || 0) + amount)
      })
      return [...days.entries()].sort(([a], [b]) => a.localeCompare(b))
    }
  },
  watch: {
    points() {
      this.$nextTick(this.draw)
    }
  },
  mounted() {
    this.active = true
    this.draw()
    window.addEventListener('resize', this.resize)
    if (typeof ResizeObserver !== 'undefined') {
      this.observer = new ResizeObserver(this.resize)
      this.observer.observe(this.$el)
    }
  },
  activated() {
    this.active = true
    this.$nextTick(this.draw)
  },
  deactivated() {
    this.active = false
    this.dispose()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resize)
    if (this.observer) this.observer.disconnect()
    this.dispose()
  },
  methods: {
    dispose() {
      if (this.chart) this.chart.dispose()
      this.chart = null
    },
    resize() {
      if (this.active && this.chart) this.chart.resize()
    },
    draw() {
      if (!this.active) return
      this.dispose()
      if (!this.$refs.chart || !this.points.length) return
      this.chart = echarts.init(this.$refs.chart)
      this.chart.setOption({
        color: ['#5470c6'],
        tooltip: { trigger: 'axis', renderMode: 'richText', confine: true },
        grid: { left: 60, right: 20, top: 20, bottom: 38 },
        xAxis: { type: 'category', data: this.points.map(([day]) => day), axisTick: { show: false } },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: '#edf1f5' } } },
        series: [{ name: '金额合计', type: 'line', smooth: true, symbolSize: 7, data: this.points.map(([, amount]) => amount), areaStyle: { color: 'rgba(84,112,198,.08)' } }]
      })
    }
  }
}
</script>

<style scoped>
.trend-wrap {
  flex: 1;
  min-height: 0;
  position: relative;
}
.trend-chart {
  position: absolute;
  inset: 0;
}
.chart-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a2acba;
  font-size: 12px;
}
</style>
