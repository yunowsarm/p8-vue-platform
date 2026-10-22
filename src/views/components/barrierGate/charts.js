import * as echarts from 'echarts'
export default {
  mounted() {
    this.charts = {}
    this.resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => this.scheduleCharts()) : null
    if (this.resizeObserver) this.resizeObserver.observe(this.$el)
    window.addEventListener('resize', this.scheduleCharts)
    this.scheduleCharts()
  },
  activated() {
    this.scheduleCharts()
    this.$nextTick(() => {
      Object.values(this.$refs).forEach((ref) => {
        if (ref && ref.recalculate) ref.recalculate(true)
      })
    })
  },
  deactivated() {
    cancelAnimationFrame(this.chartFrame)
    this.disposeCharts()
  },
  beforeDestroy() {
    cancelAnimationFrame(this.chartFrame)
    if (this.resizeObserver) this.resizeObserver.disconnect()
    window.removeEventListener('resize', this.scheduleCharts)
    this.disposeCharts()
  },
  watch: {
    loading() {
      this.scheduleCharts()
    },
    stats() {
      this.scheduleCharts()
    }
  },
  methods: {
    scheduleCharts() {
      if (this._isDestroyed || this._inactive) return
      this.$nextTick(() => {
        if (this._isDestroyed || this._inactive) return
        cancelAnimationFrame(this.chartFrame)
        this.chartFrame = requestAnimationFrame(() => this.renderCharts())
      })
    },
    renderCharts() {
      if (this._isDestroyed || this._inactive) return
      const axisOption = (rows, bar = false) => ({
        color: ['#5470c6', '#62b99c'],
        tooltip: { trigger: 'axis', renderMode: 'richText' },
        legend: { data: ['进场', '出场'], bottom: 0 },
        grid: { top: 20, left: 45, right: 20, bottom: 65, containLabel: true },
        xAxis: { type: 'category', data: rows.map((r) => r.name) },
        yAxis: { type: 'value', minInterval: 1 },
        dataZoom: rows.length > 35 ? [{ type: 'inside' }] : [],
        series: ['entry', 'exit'].map((key, i) => ({ name: i ? '出场' : '进场', type: bar ? 'bar' : 'line', smooth: true, data: rows.map((r) => r[key]) }))
      })
      const options = { dailyChart: axisOption(this.stats.days) }
      options.hourChart = axisOption(this.stats.hours, true)
      options.durationChart = {
        color: ['#5470c6', '#62b99c', '#fac858', '#ee8666', '#9a60b4'],
        tooltip: { trigger: 'item', renderMode: 'richText' },
        legend: { bottom: 0 },
        series: [{ type: 'pie', radius: ['40%', '65%'], center: ['50%', '43%'], label: { show: false }, data: this.stats.duration }]
      }
      const channels = this.stats.channels.slice(0, 10).reverse()
      options.channelChart = {
        color: ['#5470c6'],
        tooltip: { trigger: 'axis', renderMode: 'richText' },
        grid: { left: 15, right: 30, top: 10, bottom: 20, containLabel: true },
        xAxis: { type: 'value', minInterval: 1 },
        yAxis: { type: 'category', data: channels.map((r) => r.name), axisLabel: { width: 100, overflow: 'truncate' } },
        series: [{ type: 'bar', barMaxWidth: 24, data: channels.map((r) => r.value) }]
      }
      Object.keys(options).forEach((key) => {
        const element = this.$refs[key]
        if (!element) {
          if (this.charts[key]) this.charts[key].dispose()
          delete this.charts[key]
          return
        }
        if (!element.clientWidth) return
        if (this.charts[key] && this.charts[key].getDom() !== element) {
          this.charts[key].dispose()
          delete this.charts[key]
        }
        const chart = this.charts[key] || (this.charts[key] = echarts.init(element))
        chart.setOption(
          { ...options[key], title: this.rows.length ? [] : [{ text: '暂无数据', left: 'center', top: 'center', textStyle: { color: '#909399', fontSize: 14, fontWeight: 'normal' } }] },
          true
        )
        chart.resize()
      })
    },
    disposeCharts() {
      Object.values(this.charts || {}).forEach((chart) => chart.dispose())
      this.charts = {}
    }
  }
}
