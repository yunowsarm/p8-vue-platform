<template>
  <section class="forecast-panel">
    <div class="forecast-heading">
      <div>
        <h3>企业用电预测与运营活跃度</h3>
        <p>每个配电房独立预测 · 已结束月份 · 近三月日均活跃度基准 = 100</p>
      </div>
      <el-select v-model="selectedKey" size="mini" filterable placeholder="选择配电房 / 企业">
        <el-option v-for="item in forecasts" :key="item.key" :label="item.name" :value="item.key" />
      </el-select>
      <el-radio-group :value="horizon" size="mini" @input="$emit('horizon-change', $event)">
        <el-radio-button :label="3">预测 3 个月</el-radio-button>
        <el-radio-button :label="6">预测 6 个月</el-radio-button>
      </el-radio-group>
    </div>
    <template v-if="selected">
      <div class="forecast-summary">
        <div>
          <span>用电代理判断</span>
          <strong>{{ selected.activity }}</strong>
          <small>需结合订单、产量、开工率判断运营</small>
        </div>
        <div>
          <span>首月预测电量</span>
          <strong>{{ selected.ready ? number(selected.future[0].value) + ' 度' : '—' }}</strong>
          <small>{{ selected.ready ? selected.future[0].month : '补齐数据后预测' }}</small>
        </div>
        <div>
          <span>预测活跃度指数</span>
          <strong>{{ number(selected.index) }}</strong>
          <small>预测日均较近三月 {{ percent(selected.change) }}</small>
        </div>
        <div>
          <span>参考可靠度：{{ selected.reliability }}</span>
          <strong>{{ selected.wape === null ? '回测不足' : '误差 ' + percent(selected.wape) }}</strong>
          <small>{{ selected.history.length }} 个连续完整月 · {{ selected.model }}</small>
        </div>
      </div>
      <p v-for="reason in selected.reasons" :key="reason" class="forecast-warning">{{ reason }}</p>
      <div v-if="selected.ready" ref="chart" class="forecast-chart"></div>
      <el-empty v-else :description="selected.reasons[0] || '请先选择配电房'" :image-size="70" />
      <p class="forecast-note">虚线为预测，阴影为历史误差参考区间，不保证实际电量落在区间内；无足够回测样本时不展示区间。用电增加或下降也可能由天气、节假日、设备及节能措施造成。</p>
      <div v-if="selected.ready" class="forecast-months">
        <div v-for="item in selected.future" :key="item.month">
          <span>{{ item.month }}</span>
          <strong>{{ number(item.value) }} 度</strong>
          <small>{{ item.lower === null ? '区间样本不足' : `${number(item.lower)}～${number(item.upper)}` }}</small>
        </div>
      </div>
    </template>
    <h3 class="overview-title">各企业 / 配电房预测概览</h3>
    <vxe-table :data="forecasts" height="220" size="mini" border stripe align="center" header-align="center" show-overflow="tooltip" :scroll-y="{ enabled: true, gt: 20, oSize: 5 }">
      <vxe-column field="name" title="配电房 / 企业" min-width="150" />
      <vxe-column field="activity" title="用电活跃度趋势" min-width="200" />
      <vxe-column title="首月预测（度）" min-width="150">
        <template #default="{ row }">{{ row.ready ? `${row.future[0].month} / ${number(row.future[0].value)}` : '—' }}</template>
      </vxe-column>
      <vxe-column field="index" title="活跃度指数" :formatter="numberCell" min-width="120" />
      <vxe-column field="reliability" title="参考可靠度" width="110" />
      <vxe-column field="wape" title="回测误差" :formatter="percentCell" width="120" />
      <vxe-column title="详情" width="80">
        <template #default="{ row }"><el-button type="text" size="mini" @click="selectedKey = row.key">查看</el-button></template>
      </vxe-column>
    </vxe-table>
  </section>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'ElectricityForecast',
  props: { forecasts: { type: Array, default: () => [] }, horizon: { type: Number, default: 3 } },
  data() {
    return { selectedKey: '', frame: null }
  },
  computed: {
    selected() {
      return this.forecasts.find((item) => item.key === this.selectedKey)
    }
  },
  watch: {
    forecasts: {
      immediate: true,
      handler(value) {
        if (!value.some((item) => item.key === this.selectedKey)) this.selectedKey = (value.find((item) => item.ready) || value[0] || {}).key || ''
        this.schedule()
      }
    },
    selectedKey() {
      this.schedule()
    }
  },
  created() {
    this.forecastChart = null
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
    if (this.forecastChart) this.forecastChart.dispose()
  },
  methods: {
    number(value) {
      return value === null || value === undefined ? '—' : Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 2 })
    },
    percent(value) {
      return value === null || value === undefined ? '—' : this.number(value) + '%'
    },
    numberCell({ cellValue }) {
      return this.number(cellValue)
    },
    percentCell({ cellValue }) {
      return this.percent(cellValue)
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
    draw() {
      const dom = this.$refs.chart
      const item = this.selected
      if (!dom || !item || !item.ready) {
        if (this.forecastChart) this.forecastChart.dispose()
        this.forecastChart = null
        return
      }
      if (this.forecastChart && this.forecastChart.getDom() !== dom) {
        this.forecastChart.dispose()
        this.forecastChart = null
      }
      if (!this.forecastChart) this.forecastChart = echarts.init(dom)
      const count = item.history.length
      const months = [...item.history.map((row) => row.month), ...item.future.map((row) => row.month)]
      const pad = Array(count).fill(null)
      const line = [...Array(count - 1).fill(null), item.history[count - 1].value, ...item.future.map((row) => row.value)]
      this.forecastChart.setOption(
        {
          animation: false,
          tooltip: { trigger: 'item', valueFormatter: (value) => this.number(value) + ' 度' },
          legend: { top: 0, data: ['历史完整电量', '预测电量'] },
          grid: { left: 80, right: 30, top: 40, bottom: 35 },
          xAxis: { type: 'category', data: months, boundaryGap: false },
          yAxis: { type: 'value', name: '度' },
          series: [
            { name: '历史完整电量', type: 'line', connectNulls: false, data: [...item.history.map((row) => row.value), ...Array(item.future.length).fill(null)], itemStyle: { color: '#5470c6' } },
            { name: '预测电量', type: 'line', data: line, lineStyle: { type: 'dashed', color: '#f2a23a' }, itemStyle: { color: '#f2a23a' } },
            { type: 'line', stack: 'range', silent: true, symbol: 'none', lineStyle: { opacity: 0 }, data: [...pad, ...item.future.map((row) => row.lower)] },
            {
              type: 'line',
              stack: 'range',
              silent: true,
              symbol: 'none',
              lineStyle: { opacity: 0 },
              areaStyle: { color: '#f2a23a', opacity: 0.16 },
              data: [...pad, ...item.future.map((row) => (row.upper === null ? null : row.upper - row.lower))]
            }
          ]
        },
        true
      )
      this.forecastChart.resize()
    },
    exportChart() {
      this.draw()
      return this.forecastChart ? { title: `${this.selected.name} · 用电预测`, image: this.forecastChart.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#fff' }) } : null
    }
  }
}
</script>

<style scoped>
.forecast-panel {
  padding: 16px;
  margin: 12px 0;
  background: #fff;
  border: 1px solid #e2e8f1;
  border-radius: 8px;
  color: #27364a;
}
h3,
p {
  margin: 0;
}
h3 {
  font-size: 14px;
}
.forecast-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}
.forecast-heading > div:first-child {
  flex: 1;
}
.forecast-heading p,
.forecast-note {
  font-size: 12px;
  color: #7b889a;
  margin-top: 6px;
}
.forecast-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin: 14px 0;
}
.forecast-summary > div {
  padding: 12px;
  background: #f4f7fc;
  border-radius: 6px;
}
.forecast-summary span,
.forecast-months span {
  font-size: 12px;
  color: #718096;
}
.forecast-summary strong {
  display: block;
  margin: 8px 0;
  font-size: 18px;
  color: #365c9f;
}
.forecast-summary small,
.forecast-months small {
  display: block;
  font-size: 12px;
  color: #7b889a;
}
.forecast-warning {
  font-size: 12px;
  color: #a36c20;
  background: #fff8e9;
  padding: 7px 10px;
  margin-top: 6px;
  border-radius: 4px;
}
.forecast-chart {
  height: 300px;
}
.forecast-months {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 14px;
}
.forecast-months > div {
  flex: 1;
  min-width: 120px;
  padding: 10px;
  border: 1px solid #e7edf5;
  border-radius: 5px;
}
.forecast-months strong {
  display: block;
  margin: 6px 0;
  font-size: 14px;
}
.overview-title {
  margin: 18px 0 10px;
}
@media (max-width: 1100px) {
  .forecast-heading {
    flex-wrap: wrap;
  }
  .forecast-heading > div:first-child {
    flex-basis: 100%;
  }
  .forecast-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 600px) {
  .forecast-summary {
    grid-template-columns: 1fr;
  }
}
</style>
