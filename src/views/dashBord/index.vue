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
            {{ item.value }}
            <span class="kpi-unit">{{ item.unit }}</span>
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
      <el-col :xs="24" :sm="24" :md="8" :span="8">
        <div class="chart-card">
          <div class="chart-title">1. 园区企业数</div>
          <div ref="chartEnterprise" class="chart-body"></div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :md="8" :span="8">
        <div class="chart-card">
          <div class="chart-title">2. 每个企业面积变化情况 (Top 10)</div>
          <div ref="chartArea" class="chart-body"></div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :md="8" :span="8">
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
      <el-col :xs="24" :sm="24" :md="8" :span="8">
        <div class="chart-card">
          <div class="chart-title">4. 用水 / 用电数变化</div>
          <div ref="chartEnergy" class="chart-body"></div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :md="8" :span="8">
        <div class="chart-card chart-card--donut">
          <div class="chart-title">5. 招商引资 / 企业状态发展情况</div>
          <div class="donut-row" :class="{ 'donut-row--mobile': isMobile }">
            <div class="donut-block">
              <div v-if="isMobile" class="donut-block-title">招商引资 (本年)</div>
              <div ref="chartInvestment" class="donut-chart"></div>
            </div>
            <div class="donut-block">
              <div v-if="isMobile" class="donut-block-title">企业状态分布</div>
              <div ref="chartEnterpriseStatus" class="donut-chart"></div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :md="8" :span="8">
        <div class="chart-card chart-card--stat">
          <div class="chart-title">6. 安全 / 消防 / 环保 / 政策 / 统计数据</div>
          <div class="chart-card-body" :class="{ 'chart-card-body--mobile': isMobile }">
            <div class="safety-boxes">
              <div v-for="item in safetyList" :key="item.label" class="safety-box" :style="{ borderColor: item.color }">
                <div class="safety-label">{{ item.label }}</div>
                <div class="safety-value" :style="{ color: item.color }">
                  {{ item.value }}
                  <span class="safety-unit">{{ item.unit }}</span>
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
      <el-col :xs="24" :sm="24" :md="14" :span="14">
        <div class="chart-card">
          <div class="chart-title">园区综合趋势概览</div>
          <div ref="chartOverview" class="chart-body"></div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :md="10" :span="10">
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
const LINE_COLORS = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#9B59B6', '#1ABC9C', '#3498DB', '#E74C3C', '#2ECC71', '#F39C12']

export default {
  name: 'DataStatistics',
  data() {
    return {
      selectedEnterprise: 'all',
      charts: {},
      repairLoading: false,
      pendingRepairTotal: 0,
      pendingTaskAuthLoading: true,
      canViewPendingPropertyRepair: false,
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
  computed: {
    isMobile() {
      return this.$store.getters.isMobile
    },
    pendingRepairCount() {
      return this.pendingRepairTotal
    },
    pendingContentLoading() {
      return this.repairLoading || this.pendingTaskAuthLoading
    },
    hasVisiblePendingTasks() {
      return this.canViewPendingPropertyRepair && this.pendingRepairCount > 0
    },
    xAxisLabel() {
      return this.isMobile ? { interval: 1, fontSize: 9, rotate: 40 } : { interval: 0, fontSize: 10 }
    }
  },
  mounted() {
    this.loadPendingTaskAuth()
    this.loadPendingRepairs()
    this.$nextTick(() => {
      this.initAllCharts()
      if (this.isMobile) {
        setTimeout(this.handleResize, 300)
      }
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
    async loadPendingTaskAuth() {
      const resourceName = (this.$route && this.$route.name) || this.$options.name
      if (!resourceName) {
        this.pendingTaskAuthLoading = false
        return
      }
      try {
        const buttons = await this.$store.dispatch('getButtonAuth', {
          resourceName,
          parentUuid: '',
          permissionVo: { router: resourceName, resourceId: '' }
        })
        this.canViewPendingPropertyRepair =
          Array.isArray(buttons) &&
          buttons.some((button) => {
            return button && button.name === 'pending_property_repair_requests' && button.enable !== '0' && button.isAccredit !== 0 && button.isAccredit !== '0'
          })
      } catch (error) {
        this.canViewPendingPropertyRepair = false
      } finally {
        this.pendingTaskAuthLoading = false
      }
    },
    goToPropertyRepairHandle() {
      this.$router.push('/propertyRepairHand')
    },
    unwrap(response) {
      if (response && !response.id && response.result !== undefined && response.result !== null) return response.result
      if (response && response.data && !response.data.id && response.data.result !== undefined && response.data.result !== null) return response.data.result
      return response && response.data !== undefined ? response.data : response
    },
    async loadPendingRepairs() {
      if (!this.$api || !this.$api['reportRepair.searchStatus']) return
      this.repairLoading = true
      try {
        const result = this.unwrap(await this.$api['reportRepair.searchStatus']()) || {}
        const records = Array.isArray(result.records) ? result.records : Array.isArray(result.list) ? result.list : Array.isArray(result) ? result : []
        const total = typeof result === 'number' || typeof result === 'string' ? result : result.total || result.count || records.length
        this.pendingRepairTotal = Number(total) || 0
      } catch (error) {
        this.pendingRepairTotal = 0
      } finally {
        this.repairLoading = false
      }
    },
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
      return this.isMobile ? { left: 36, right: 10, top: 20, bottom: 28 } : { left: 50, right: 20, top: 20, bottom: 30 }
    },
    pieLegendConfig() {
      return this.isMobile
        ? {
            type: 'scroll',
            orient: 'horizontal',
            bottom: 2,
            left: 'center',
            width: '90%',
            icon: 'circle',
            itemWidth: 6,
            itemHeight: 6,
            itemGap: 6,
            textStyle: { fontSize: 9 }
          }
        : { orient: 'vertical', right: 0, top: 'middle', icon: 'circle', itemWidth: 8, textStyle: { fontSize: 10 } }
    },
    pieCenter() {
      return this.isMobile ? ['50%', '40%'] : ['35%', '55%']
    },
    pieRadius() {
      return this.isMobile ? ['36%', '50%'] : ['45%', '65%']
    },
    pieTitleConfig(text) {
      if (this.isMobile) return undefined
      return { text, left: 'center', top: 0, textStyle: { fontSize: 12, fontWeight: 'normal', color: '#606266' } }
    },
    getPieChartOption(title, centerFormatter, data, unit = '') {
      const tooltipFormatter = unit ? `{b}: {c}${unit} ({d}%)` : '{b}: {c} ({d}%)'
      return {
        title: this.pieTitleConfig(title),
        tooltip: { trigger: 'item', formatter: tooltipFormatter },
        legend: this.pieLegendConfig(),
        series: [
          {
            type: 'pie',
            radius: this.pieRadius(),
            center: this.pieCenter(),
            label: {
              show: true,
              position: 'center',
              formatter: centerFormatter,
              fontSize: this.isMobile ? 10 : 12,
              lineHeight: this.isMobile ? 14 : 18
            },
            data
          }
        ]
      }
    },
    initEnterpriseChart() {
      const chart = this.initChart('chartEnterprise')
      if (!chart) return
      chart.setOption({
        tooltip: { trigger: 'axis' },
        grid: this.baseGrid(),
        xAxis: { type: 'category', data: MONTHS, boundaryGap: false, axisLabel: this.xAxisLabel },
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
        grid: { ...this.baseGrid(), top: this.isMobile ? 56 : 48 },
        xAxis: { type: 'category', data: MONTHS, boundaryGap: false, axisLabel: this.xAxisLabel },
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
        grid: { ...this.baseGrid(), top: this.isMobile ? 56 : 48 },
        xAxis: { type: 'category', data: MONTHS, boundaryGap: false, axisLabel: this.xAxisLabel },
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
        grid: {
          ...this.baseGrid(),
          right: this.isMobile ? 36 : 50,
          top: this.isMobile ? 56 : 48
        },
        xAxis: { type: 'category', data: MONTHS, axisLabel: this.xAxisLabel },
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
      chart.setOption(
        this.getPieChartOption(
          '招商引资 (本年)',
          '签约项目\n48个',
          [
            { value: 18, name: '已签约', itemStyle: { color: '#409EFF' } },
            { value: 16, name: '在谈中', itemStyle: { color: '#67C23A' } },
            { value: 10, name: '意向洽谈', itemStyle: { color: '#E6A23C' } },
            { value: 4, name: '其他', itemStyle: { color: '#909399' } }
          ],
          '个'
        )
      )
    },
    initEnterpriseStatusChart() {
      const chart = this.initChart('chartEnterpriseStatus')
      if (!chart) return
      chart.setOption(
        this.getPieChartOption(
          '企业状态分布',
          '企业总数\n328家',
          [
            { value: 238, name: '正常经营', itemStyle: { color: '#409EFF' } },
            { value: 56, name: '稳步发展', itemStyle: { color: '#67C23A' } },
            { value: 24, name: '困难预警', itemStyle: { color: '#E6A23C' } },
            { value: 10, name: '停业/注销', itemStyle: { color: '#F56C6C' } }
          ],
          '家'
        )
      )
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
        grid: {
          left: this.isMobile ? 40 : 55,
          right: this.isMobile ? 40 : 55,
          top: this.isMobile ? 56 : 48,
          bottom: 30
        },
        xAxis: { type: 'category', data: MONTHS, boundaryGap: false, axisLabel: this.xAxisLabel },
        yAxis: [
          { type: 'value', name: '数量', position: 'left' },
          { type: 'value', name: '用量', position: 'right' }
        ],
        series: [
          { name: '企业数', type: 'line', smooth: true, data: [250, 258, 268, 278, 288, 298, 305, 310, 315, 320, 324, 328], lineStyle: { color: '#409EFF' }, itemStyle: { color: '#409EFF' } },
          {
            name: '员工数',
            type: 'line',
            smooth: true,
            data: [22000, 23000, 23800, 24500, 25200, 25800, 26200, 26800, 27200, 27800, 28200, 28560],
            lineStyle: { color: '#9B59B6' },
            itemStyle: { color: '#9B59B6' }
          },
          {
            name: '访客数',
            type: 'line',
            smooth: true,
            data: [38000, 40000, 42000, 45000, 48000, 50000, 52000, 53000, 54000, 55000, 55800, 56320],
            lineStyle: { color: '#67C23A' },
            itemStyle: { color: '#67C23A' }
          },
          {
            name: '车辆数',
            type: 'line',
            smooth: true,
            data: [12000, 13000, 14000, 15000, 15800, 16500, 17000, 17500, 18000, 18300, 18600, 18753],
            lineStyle: { color: '#E6A23C' },
            itemStyle: { color: '#E6A23C' }
          },
          {
            name: '用电量',
            type: 'line',
            smooth: true,
            yAxisIndex: 1,
            data: [980000, 1000000, 1020000, 1050000, 1080000, 1100000, 1120000, 1150000, 1180000, 1200000, 1225000, 1245630],
            lineStyle: { color: '#F39C12' },
            itemStyle: { color: '#F39C12' }
          },
          {
            name: '用水量',
            type: 'line',
            smooth: true,
            yAxisIndex: 1,
            data: [9000, 9200, 9500, 9800, 10000, 10200, 10500, 10800, 11000, 11200, 11800, 12560],
            lineStyle: { color: '#1ABC9C' },
            itemStyle: { color: '#1ABC9C' }
          }
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
        grid: { ...this.baseGrid(), top: this.isMobile ? 56 : 48 },
        xAxis: { type: 'category', data: MONTHS, axisLabel: this.xAxisLabel },
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

.pending-content {
  margin-bottom: 16px;
}

.pending-content__title {
  margin-bottom: 10px;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.notice-card-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 12px;
}

.notice-card {
  width: 100%;
  min-height: 76px;
  padding: 12px;
  font: inherit;
  text-align: center;
  background: #fff;
  border: 1px solid;
  border-radius: 5px;
  cursor: pointer;
  box-sizing: border-box;
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  &:focus-visible {
    outline: 2px solid #409eff;
    outline-offset: 2px;
  }
}

.notice-card--warning {
  border-color: #e6a23c;
}

.notice-card__label {
  margin-bottom: 6px;
  color: #606266;
  font-size: 13px;
}

.notice-card__value {
  color: #e6a23c;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;

  span {
    margin-left: 2px;
    font-size: 12px;
    font-weight: normal;
  }
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
.donut-row {
  height: 260px;
  flex-shrink: 0;
}

.chart-card-body {
  height: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.donut-row {
  display: flex;

  .donut-block {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .donut-chart {
    flex: 1;
    min-height: 0;
    width: 100%;
  }
}

.donut-row--mobile {
  height: auto;
  flex-direction: column;
  gap: 12px;

  .donut-block {
    background: #fafafa;
    border-radius: 4px;
    padding: 8px 8px 4px;
  }

  .donut-block-title {
    font-size: 12px;
    font-weight: 600;
    color: #606266;
    text-align: center;
    margin-bottom: 4px;
  }

  .donut-chart {
    flex: none;
    height: 200px;
  }
}

.chart-card-body--mobile {
  height: auto;
  flex-shrink: 1;
  justify-content: flex-start;
  gap: 12px;
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

@media (max-width: 768px) {
  .data-statistics {
    height: 100%;
    padding: 10px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }

  .pending-content {
    margin-bottom: 12px;
  }

  .pending-content__title {
    margin-bottom: 8px;
    font-size: 13px;
  }

  .notice-card-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .notice-card {
    min-height: 70px;
    padding: 10px 8px;
  }

  .notice-card__label {
    font-size: 12px;
  }

  .notice-card__value {
    font-size: 21px;
  }

  .kpi-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-bottom: 12px;
  }

  .kpi-card {
    padding: 10px 8px;

    .kpi-icon {
      width: 32px;
      height: 32px;

      i {
        font-size: 16px;
      }
    }

    .kpi-value {
      font-size: 15px;
    }
  }

  .chart-row {
    margin-bottom: 12px;

    ::v-deep > .el-col {
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .chart-card {
    padding: 12px;
  }

  .chart-title {
    min-height: auto;
    font-size: 13px;
    margin-bottom: 6px;
  }

  .chart-title-flex {
    flex-direction: column;
    align-items: stretch;
    min-height: auto;
    gap: 6px;

    span {
      font-size: 12px;
    }
  }

  .enterprise-select {
    width: 100%;
  }

  .chart-body {
    height: 220px;
  }

  .chart-card-body,
  .chart-card-body--mobile {
    height: auto;
  }

  .donut-row:not(.donut-row--mobile) {
    flex-direction: column;
    height: auto;

    .donut-chart {
      height: 200px;
    }
  }

  .donut-row--mobile .donut-chart {
    height: 200px;
  }

  .chart-card--stat {
    .safety-boxes {
      grid-template-columns: repeat(2, 1fr);
      margin-bottom: 0;
    }

    .stat-overview {
      padding-top: 8px;
    }

    .overview-item {
      padding: 8px;
    }

    .overview-label {
      font-size: 10px;
      line-height: 1.3;
    }

    .overview-compare {
      font-size: 9px;
      line-height: 1.3;
      word-break: break-all;
    }
  }

  .safety-box .safety-value {
    font-size: 16px;
  }

  .overview-value {
    font-size: 14px;
  }
}

@media (max-width: 375px) {
  .kpi-row {
    grid-template-columns: 1fr;
  }
}
</style>
