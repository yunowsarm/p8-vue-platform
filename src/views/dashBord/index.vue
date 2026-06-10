<template>
  <div class="data-statistics">
    <!-- 顶部 KPI 指标卡 -->
    <div class="kpi-row">
      <div v-for="item in kpiList" :key="item.title" class="kpi-card">
        <div class="kpi-icon" :style="{ background: item.iconBg }">
          <i :class="item.icon"></i>
        </div>
        <div class="kpi-content">
          <div class="kpi-title">{{ item.title }}</div>
          <div class="kpi-value">
            {{ item.value }}<span class="kpi-unit">{{ item.unit }}</span>
          </div>
          <div class="kpi-compare">
            环比
            <span class="up">↑ {{ item.changeValue }}</span>
            <span class="up">({{ item.changeRate }})</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 第二行：趋势图表 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="8">
        <div class="chart-card">
          <div class="chart-title">1. 园区企业数</div>
          <div ref="chartEnterprise" class="chart-body"></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-card">
          <div class="chart-title">2. 每个企业面积变化情况 (Top 10)</div>
          <div ref="chartArea" class="chart-body"></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-card">
          <div class="chart-title chart-title-flex">
            <span>3. 每个企业的员工 访客 车辆进出 变化情况</span>
            <el-select v-model="selectedEnterprise" size="mini" class="enterprise-select">
              <el-option label="全部企业" value="all" />
              <el-option v-for="n in 10" :key="n" :label="'企业' + String.fromCharCode(64 + n)" :value="'ent' + n" />
            </el-select>
          </div>
          <div ref="chartPersonnel" class="chart-body"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 第三行 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="8">
        <div class="chart-card">
          <div class="chart-title">4. 用水 / 用电数变化</div>
          <div ref="chartEnergy" class="chart-body"></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-card">
          <div class="chart-title">5. 招商引资 / 企业状态发展情况</div>
          <div class="donut-row">
            <div ref="chartInvestment" class="donut-chart"></div>
            <div ref="chartEnterpriseStatus" class="donut-chart"></div>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-card">
          <div class="chart-title">6. 安全 / 消防 / 环保 / 政策 / 统计数据</div>
          <div class="chart-card-body">
          <div class="safety-boxes">
            <div v-for="item in safetyList" :key="item.label" class="safety-box" :style="{ borderColor: item.color }">
              <div class="safety-label">{{ item.label }}</div>
              <div class="safety-value" :style="{ color: item.color }">
                {{ item.value }}<span class="safety-unit">{{ item.unit }}</span>
              </div>
            </div>
          </div>
          <div class="stat-overview">
            <div class="stat-overview-title">统计概览</div>
            <div class="stat-overview-grid">
              <div v-for="item in overviewList" :key="item.label" class="overview-item">
                <div class="overview-label">{{ item.label }}</div>
                <div class="overview-value">{{ item.value }}</div>
                <div class="overview-compare up">{{ item.compare }}</div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 第四行：综合趋势 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="14">
        <div class="chart-card">
          <div class="chart-title">园区综合趋势概览</div>
          <div ref="chartOverview" class="chart-body"></div>
        </div>
      </el-col>
      <el-col :span="10">
        <div class="chart-card">
          <div class="chart-title">企业成长趋势 (按企业状态)</div>
          <div ref="chartGrowth" class="chart-body"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const X_AXIS_LABEL = { interval: 0, fontSize: 10 }
const LINE_COLORS = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#9B59B6', '#1ABC9C', '#3498DB', '#E74C3C', '#2ECC71', '#F39C12']

export default {
  name: 'DataStatistics',
  data() {
    return {
      selectedEnterprise: 'all',
      charts: {},
      kpiList: [
        { title: '园区企业总数', value: '328', unit: '家', changeValue: '12 家', changeRate: '+3.80%', icon: 'el-icon-office-building', iconBg: 'rgba(64,158,255,0.12)' },
        { title: '园区总面积', value: '3,560,000', unit: 'm²', changeValue: '20,000 m²', changeRate: '+0.56%', icon: 'el-icon-map-location', iconBg: 'rgba(64,158,255,0.12)' },
        { title: '员工总数', value: '28,560', unit: '人', changeValue: '1,250 人', changeRate: '+4.58%', icon: 'el-icon-user', iconBg: 'rgba(155,89,182,0.12)' },
        { title: '访客总数', value: '56,320', unit: '人次', changeValue: '2,340 人次', changeRate: '+4.34%', icon: 'el-icon-user-solid', iconBg: 'rgba(103,194,58,0.12)' },
        { title: '车辆进出总数', value: '18,753', unit: '辆次', changeValue: '1,126 辆次', changeRate: '+6.38%', icon: 'el-icon-truck', iconBg: 'rgba(230,162,60,0.12)' },
        { title: '当月用电总量', value: '1,245,630', unit: 'kWh', changeValue: '56,230 kWh', changeRate: '+4.72%', icon: 'el-icon-lightning', iconBg: 'rgba(230,162,60,0.12)' },
        { title: '当月用水总量', value: '12,560', unit: '吨', changeValue: '760 吨', changeRate: '+6.44%', icon: 'el-icon-heavy-rain', iconBg: 'rgba(64,158,255,0.12)' }
      ],
      safetyList: [
        { label: '安全事件', value: '5', unit: '起', color: '#F56C6C' },
        { label: '消防事件', value: '2', unit: '起', color: '#E6A23C' },
        { label: '环保事件', value: '1', unit: '起', color: '#67C23A' },
        { label: '政策申报', value: '38', unit: '项', color: '#409EFF' }
      ],
      overviewList: [
        { label: '隐患排查数', value: '156次', compare: '环比 ↑ 12次 (+8.33%)' },
        { label: '隐患整改数', value: '142次', compare: '环比 ↑ 10次 (+7.58%)' },
        { label: '环保监测达标率', value: '98.6%', compare: '环比 ↑ 0.3% (+0.31%)' },
        { label: '政策兑现金额', value: '2,560万元', compare: '环比 ↑ 180万元 (+7.56%)' }
      ]
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initAllCharts()
    })
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    Object.values(this.charts).forEach((chart) => {
      if (chart) chart.dispose()
    })
  },
  methods: {
    handleResize() {
      Object.values(this.charts).forEach((chart) => {
        if (chart) chart.resize()
      })
    },
    initChart(refName) {
      const el = this.$refs[refName]
      if (!el) return null
      const chart = this.$echarts.init(el)
      this.charts[refName] = chart
      return chart
    },
    initAllCharts() {
      this.initEnterpriseChart()
      this.initAreaChart()
      this.initPersonnelChart()
      this.initEnergyChart()
      this.initInvestmentChart()
      this.initEnterpriseStatusChart()
      this.initOverviewChart()
      this.initGrowthChart()
    },
    baseGrid() {
      return { left: 50, right: 20, top: 20, bottom: 30 }
    },
    initEnterpriseChart() {
      const chart = this.initChart('chartEnterprise')
      if (!chart) return
      chart.setOption({
        tooltip: { trigger: 'axis' },
        grid: this.baseGrid(),
        xAxis: { type: 'category', data: MONTHS, boundaryGap: false, axisLabel: X_AXIS_LABEL },
        yAxis: { type: 'value', min: 220, max: 350 },
        series: [
          {
            name: '园区企业数',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            data: [250, 258, 268, 278, 288, 298, 305, 310, 315, 320, 324, 328],
            lineStyle: { color: '#409EFF', width: 2 },
            itemStyle: { color: '#409EFF' },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(64,158,255,0.35)' },
                  { offset: 1, color: 'rgba(64,158,255,0.02)' }
                ]
              }
            }
          }
        ]
      })
    },
    initAreaChart() {
      const chart = this.initChart('chartArea')
      if (!chart) return
      const areaOffsets = [0, 800, 1600, 2400, 1200, 2000, 2800, 1000, 1800, 2600]
      const baseData = [12000, 12500, 13000, 13500, 13800, 14200, 14500, 14800, 15200, 15500, 16000, 16500]
      const series = Array.from({ length: 10 }, (_, i) => ({
        name: '企业' + String.fromCharCode(65 + i),
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: baseData.map((v) => v + areaOffsets[i]),
        lineStyle: { width: 1.5, color: LINE_COLORS[i] },
        itemStyle: { color: LINE_COLORS[i] }
      }))
      chart.setOption({
        tooltip: { trigger: 'axis' },
        legend: {
          type: 'scroll',
          top: 0,
          left: 'center',
          icon: 'circle',
          itemWidth: 8,
          itemHeight: 8,
          textStyle: { fontSize: 10 }
        },
        grid: { left: 50, right: 20, top: 48, bottom: 30 },
        xAxis: { type: 'category', data: MONTHS, boundaryGap: false, axisLabel: X_AXIS_LABEL },
        yAxis: { type: 'value', name: 'm²' },
        series
      })
    },
    initPersonnelChart() {
      const chart = this.initChart('chartPersonnel')
      if (!chart) return
      chart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['员工进出', '访客进出', '车辆进出'], top: 0, textStyle: { fontSize: 11 } },
        grid: { left: 50, right: 20, top: 48, bottom: 30 },
        xAxis: { type: 'category', data: MONTHS, boundaryGap: false, axisLabel: X_AXIS_LABEL },
        yAxis: { type: 'value' },
        series: [
          {
            name: '员工进出',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 5,
            data: [380, 400, 420, 450, 480, 500, 510, 520, 530, 545, 552, 560],
            lineStyle: { color: '#409EFF', width: 2 },
            itemStyle: { color: '#409EFF' }
          },
          {
            name: '访客进出',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 5,
            data: [720, 760, 800, 850, 900, 950, 980, 1000, 1020, 1050, 1065, 1080],
            lineStyle: { color: '#67C23A', width: 2 },
            itemStyle: { color: '#67C23A' }
          },
          {
            name: '车辆进出',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 5,
            data: [240, 260, 280, 300, 315, 330, 340, 350, 360, 370, 375, 380],
            lineStyle: { color: '#E6A23C', width: 2 },
            itemStyle: { color: '#E6A23C' }
          }
        ]
      })
    },
    initEnergyChart() {
      const chart = this.initChart('chartEnergy')
      if (!chart) return
      chart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['用电量 (kWh)', '用水量 (吨)'], top: 0 },
        grid: { left: 50, right: 50, top: 48, bottom: 30 },
        xAxis: { type: 'category', data: MONTHS, axisLabel: X_AXIS_LABEL },
        yAxis: [
          { type: 'value', name: 'kWh', position: 'left' },
          { type: 'value', name: '吨', position: 'right' }
        ],
        series: [
          {
            name: '用电量 (kWh)',
            type: 'bar',
            yAxisIndex: 0,
            barMaxWidth: 14,
            barGap: '30%',
            data: [980000, 1000000, 1020000, 1050000, 1080000, 1100000, 1120000, 1150000, 1180000, 1200000, 1225000, 1245630],
            itemStyle: { color: '#409EFF', borderRadius: [4, 4, 0, 0] }
          },
          {
            name: '用水量 (吨)',
            type: 'bar',
            yAxisIndex: 1,
            barMaxWidth: 14,
            data: [9000, 9200, 9500, 9800, 10000, 10200, 10500, 10800, 11000, 11200, 11800, 12560],
            itemStyle: { color: '#67C23A', borderRadius: [4, 4, 0, 0] }
          }
        ]
      })
    },
    initInvestmentChart() {
      const chart = this.initChart('chartInvestment')
      if (!chart) return
      chart.setOption({
        title: { text: '招商引资 (本年)', left: 'center', top: 0, textStyle: { fontSize: 12, fontWeight: 'normal', color: '#606266' } },
        tooltip: { trigger: 'item', formatter: '{b}: {c}个 ({d}%)' },
        legend: { orient: 'vertical', right: 0, top: 'middle', icon: 'circle', itemWidth: 8, textStyle: { fontSize: 10 } },
        series: [
          {
            type: 'pie',
            radius: ['45%', '65%'],
            center: ['35%', '55%'],
            label: { show: true, position: 'center', formatter: '签约项目\n48个', fontSize: 12, lineHeight: 18 },
            data: [
              { value: 18, name: '已签约', itemStyle: { color: '#409EFF' } },
              { value: 16, name: '在谈中', itemStyle: { color: '#67C23A' } },
              { value: 10, name: '意向洽谈', itemStyle: { color: '#E6A23C' } },
              { value: 4, name: '其他', itemStyle: { color: '#909399' } }
            ]
          }
        ]
      })
    },
    initEnterpriseStatusChart() {
      const chart = this.initChart('chartEnterpriseStatus')
      if (!chart) return
      chart.setOption({
        title: { text: '企业状态分布', left: 'center', top: 0, textStyle: { fontSize: 12, fontWeight: 'normal', color: '#606266' } },
        tooltip: { trigger: 'item', formatter: '{b}: {c}家 ({d}%)' },
        legend: { orient: 'vertical', right: 0, top: 'middle', icon: 'circle', itemWidth: 8, textStyle: { fontSize: 10 } },
        series: [
          {
            type: 'pie',
            radius: ['45%', '65%'],
            center: ['35%', '55%'],
            label: { show: true, position: 'center', formatter: '企业总数\n328家', fontSize: 12, lineHeight: 18 },
            data: [
              { value: 238, name: '正常经营', itemStyle: { color: '#409EFF' } },
              { value: 56, name: '稳步发展', itemStyle: { color: '#67C23A' } },
              { value: 24, name: '困难预警', itemStyle: { color: '#E6A23C' } },
              { value: 10, name: '停业/注销', itemStyle: { color: '#F56C6C' } }
            ]
          }
        ]
      })
    },
    initOverviewChart() {
      const chart = this.initChart('chartOverview')
      if (!chart) return
      chart.setOption({
        tooltip: { trigger: 'axis' },
        legend: {
          data: ['企业数', '员工数', '访客数', '车辆数', '用电量', '用水量'],
          top: 0,
          type: 'scroll',
          textStyle: { fontSize: 11 }
        },
        grid: { left: 55, right: 55, top: 48, bottom: 30 },
        xAxis: { type: 'category', data: MONTHS, boundaryGap: false, axisLabel: X_AXIS_LABEL },
        yAxis: [
          { type: 'value', name: '数量', position: 'left' },
          { type: 'value', name: '用量', position: 'right' }
        ],
        series: [
          { name: '企业数', type: 'line', smooth: true, data: [250, 258, 268, 278, 288, 298, 305, 310, 315, 320, 324, 328], lineStyle: { color: '#409EFF' }, itemStyle: { color: '#409EFF' } },
          { name: '员工数', type: 'line', smooth: true, data: [22000, 23000, 23800, 24500, 25200, 25800, 26200, 26800, 27200, 27800, 28200, 28560], lineStyle: { color: '#9B59B6' }, itemStyle: { color: '#9B59B6' } },
          { name: '访客数', type: 'line', smooth: true, data: [38000, 40000, 42000, 45000, 48000, 50000, 52000, 53000, 54000, 55000, 55800, 56320], lineStyle: { color: '#67C23A' }, itemStyle: { color: '#67C23A' } },
          { name: '车辆数', type: 'line', smooth: true, data: [12000, 13000, 14000, 15000, 15800, 16500, 17000, 17500, 18000, 18300, 18600, 18753], lineStyle: { color: '#E6A23C' }, itemStyle: { color: '#E6A23C' } },
          { name: '用电量', type: 'line', smooth: true, yAxisIndex: 1, data: [980000, 1000000, 1020000, 1050000, 1080000, 1100000, 1120000, 1150000, 1180000, 1200000, 1225000, 1245630], lineStyle: { color: '#F39C12' }, itemStyle: { color: '#F39C12' } },
          { name: '用水量', type: 'line', smooth: true, yAxisIndex: 1, data: [9000, 9200, 9500, 9800, 10000, 10200, 10500, 10800, 11000, 11200, 11800, 12560], lineStyle: { color: '#1ABC9C' }, itemStyle: { color: '#1ABC9C' } }
        ]
      })
    },
    initGrowthChart() {
      const chart = this.initChart('chartGrowth')
      if (!chart) return
      chart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: {
          data: ['正常经营', '稳步发展', '困难预警', '停业/注销'],
          top: 0,
          textStyle: { fontSize: 11 }
        },
        grid: { left: 50, right: 20, top: 48, bottom: 30 },
        xAxis: { type: 'category', data: MONTHS, axisLabel: X_AXIS_LABEL },
        yAxis: { type: 'value', name: '家' },
        series: [
          { name: '正常经营', type: 'bar', stack: 'total', barMaxWidth: 22, data: [175, 182, 188, 195, 200, 205, 210, 215, 220, 225, 232, 238], itemStyle: { color: '#409EFF' } },
          { name: '稳步发展', type: 'bar', stack: 'total', data: [38, 40, 41, 42, 43, 44, 45, 47, 48, 50, 53, 56], itemStyle: { color: '#67C23A' } },
          { name: '困难预警', type: 'bar', stack: 'total', data: [20, 21, 21, 22, 22, 22, 23, 23, 24, 24, 24, 24], itemStyle: { color: '#E6A23C' } },
          { name: '停业/注销', type: 'bar', stack: 'total', data: [12, 11, 10, 11, 10, 11, 9, 10, 11, 12, 11, 10], itemStyle: { color: '#F56C6C' } }
        ]
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.data-statistics {
  padding: 16px;
  background: #f0f2f5;
  min-height: 100%;
  box-sizing: border-box;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.kpi-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #fff;
  border-radius: 6px;
  padding: 14px 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  min-width: 0;

  .kpi-icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;

    i {
      font-size: 20px;
      color: #409eff;
    }
  }

  .kpi-content {
    flex: 1;
    min-width: 0;
  }

  .kpi-title {
    font-size: 12px;
    color: #909399;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .kpi-value {
    font-size: 18px;
    font-weight: bold;
    color: #303133;
    margin: 4px 0;
    white-space: nowrap;

    .kpi-unit {
      font-size: 12px;
      font-weight: normal;
      margin-left: 2px;
    }
  }

  .kpi-compare {
    font-size: 11px;
    color: #909399;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.up {
  color: #f56c6c;
}

.chart-row {
  margin-bottom: 16px;

  ::v-deep > .el-col {
    display: flex;
  }
}

.chart-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  background: #fff;
  border-radius: 6px;
  padding: 14px 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  min-height: 48px;
  line-height: 1.4;
  flex-shrink: 0;
}

.chart-title-flex {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  min-height: 48px;
  margin-bottom: 8px;
  flex-shrink: 0;

  span {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    line-height: 1.4;
  }
}

.enterprise-select {
  width: 100px;
  flex-shrink: 0;
}

.chart-body,
.chart-card-body,
.donut-row {
  height: 260px;
  flex-shrink: 0;
}

.donut-row {
  display: flex;

  .donut-chart {
    flex: 1;
    height: 100%;
  }
}

.chart-card-body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.safety-boxes {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.safety-box {
  border: 1px solid;
  border-radius: 4px;
  padding: 8px;
  text-align: center;
  background: #fafafa;

  .safety-label {
    font-size: 11px;
    color: #909399;
    margin-bottom: 4px;
  }

  .safety-value {
    font-size: 18px;
    font-weight: bold;

    .safety-unit {
      font-size: 11px;
      font-weight: normal;
    }
  }
}

.stat-overview {
  border-top: 1px solid #ebeef5;
  padding-top: 10px;

  .stat-overview-title {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }
}

.stat-overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.overview-item {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 8px 10px;

  .overview-label {
    font-size: 11px;
    color: #909399;
  }

  .overview-value {
    font-size: 16px;
    font-weight: bold;
    color: #303133;
    margin: 2px 0;
  }

  .overview-compare {
    font-size: 10px;
  }
}

@media (max-width: 1600px) {
  .kpi-row {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1200px) {
  .kpi-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
