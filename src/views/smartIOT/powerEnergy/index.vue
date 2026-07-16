<template>
  <div class="iot-page">
    <div class="kpi-row">
      <div v-for="item in kpis" :key="item.title" class="kpi-card">
        <div class="kpi-title">{{ item.title }}</div>
        <div class="kpi-value">{{ item.value }}<span class="kpi-unit">{{ item.unit }}</span></div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-title">负荷曲线（峰/平/谷）</div>
      <div ref="loadChart" class="chart-body"></div>
    </div>

    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="14">
        <div class="panel">
          <div class="panel-title-row">
            <div class="panel-title">分级表计</div>
            <el-select v-model="levelFilter" size="mini" clearable placeholder="计量层级" style="width: 120px">
              <el-option v-for="l in levels" :key="l" :label="l" :value="l" />
            </el-select>
          </div>
          <el-table :data="filteredMeters" border size="small" max-height="360" @row-click="selectMeter">
            <el-table-column prop="name" label="表计" min-width="130" />
            <el-table-column prop="level" label="层级" width="80" />
            <el-table-column prop="building" label="建筑" width="90" />
            <el-table-column prop="floor" label="楼层" width="60" />
            <el-table-column prop="tenant" label="租户/区域" width="90" />
            <el-table-column prop="kwh" label="今日电量" width="90" />
            <el-table-column prop="power" label="功率(kW)" width="90" />
            <el-table-column prop="pf" label="功率因数" width="90" />
            <el-table-column prop="status" label="状态" width="110">
              <template slot-scope="{ row }">
                <el-tag :type="meterTag(row.status)" size="mini">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
          <p v-if="selectedMeter" class="drill-tip">当前下钻：{{ selectedMeter.name }}（{{ selectedMeter.id }}）</p>
        </div>
      </el-col>
      <el-col :span="10">
        <div class="panel">
          <div class="panel-title">异常用能</div>
          <el-table :data="anomalies" border size="small" max-height="400">
            <el-table-column prop="type" label="类型" width="110" />
            <el-table-column prop="meter" label="表计" width="80" />
            <el-table-column prop="level" label="级别" width="70">
              <template slot-scope="{ row }">
                <el-tag :type="row.level === '紧急' ? 'danger' : row.level === '一般' ? 'warning' : 'info'" size="mini">
                  {{ row.level }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="detail" label="说明" min-width="120" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="80" />
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { powerEnergy } from '../mock/iotMockData'

export default {
  name: 'SmartIOTPowerEnergy',
  data() {
    return {
      kpis: powerEnergy.kpis,
      meters: powerEnergy.meters,
      anomalies: powerEnergy.anomalies,
      loadCurve: powerEnergy.loadCurve,
      levelFilter: '',
      levels: ['变压器', '楼栋', '楼层', '租户', '馈线', '功能区域'],
      selectedMeter: null,
      chart: null
    }
  },
  computed: {
    filteredMeters() {
      if (!this.levelFilter) return this.meters
      return this.meters.filter((m) => m.level === this.levelFilter)
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
    window.addEventListener('resize', this.resizeChart)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeChart)
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    meterTag(s) {
      if (s === '正常') return 'success'
      if (s === '离线' || s === '长期零值') return 'danger'
      return 'warning'
    },
    selectMeter(row) {
      this.selectedMeter = row
    },
    initChart() {
      if (!this.$refs.loadChart || !this.$echarts) return
      this.chart = this.$echarts.init(this.$refs.loadChart)
      const { hours, power, peak, flat, valley } = this.loadCurve
      this.chart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['总功率', '峰', '平', '谷'] },
        grid: { left: 48, right: 24, top: 40, bottom: 28 },
        xAxis: { type: 'category', data: hours, boundaryGap: false },
        yAxis: { type: 'value', name: 'kW' },
        series: [
          { name: '总功率', type: 'line', smooth: true, data: power, areaStyle: { opacity: 0.08 } },
          { name: '峰', type: 'line', smooth: true, data: peak },
          { name: '平', type: 'line', smooth: true, data: flat },
          { name: '谷', type: 'line', smooth: true, data: valley }
        ]
      })
    },
    resizeChart() {
      if (this.chart) this.chart.resize()
    }
  }
}
</script>

<style lang="scss" scoped>
.iot-page {
  padding: 16px;
  background: #f5f7fa;
  min-height: 100%;
}
.kpi-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.kpi-card {
  flex: 1;
  min-width: 120px;
  background: #fff;
  border-radius: 4px;
  padding: 14px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.kpi-title {
  color: #909399;
  font-size: 13px;
}
.kpi-value {
  margin-top: 6px;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}
.kpi-unit {
  margin-left: 4px;
  font-size: 12px;
  font-weight: 400;
  color: #909399;
}
.panel {
  background: #fff;
  border-radius: 4px;
  padding: 12px 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.panel-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
}
.panel-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  .panel-title {
    margin-bottom: 0;
  }
}
.chart-body {
  height: 280px;
}
.drill-tip {
  margin: 10px 0 0;
  font-size: 12px;
  color: #409eff;
}
</style>
