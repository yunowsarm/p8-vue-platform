<template>
  <div class="analysis-page">
    <el-empty v-if="!rows.length && !loading" description="当前查询范围暂无数据" />
    <template v-else>
      <div class="analysis-toolbar">
        <h3>道闸数据分析</h3>
        <span>{{ rows.length }} 条停车记录</span>
        <el-dropdown trigger="click" @command="exportReport">
          <el-button type="primary" size="mini" :disabled="loading || !rows.length" :loading="exporting">
            导出报告
            <i class="el-icon-arrow-down el-icon--right" />
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="html">导出 HTML 报告</el-dropdown-item>
            <el-dropdown-item command="pdf">打印 / 保存 PDF</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="metrics">
        <div v-for="metric in metrics" :key="metric.label" class="metric panel">
          <span>{{ metric.label }}</span>
          <strong>
            {{ metric.value }}
            <small>{{ metric.unit }}</small>
          </strong>
        </div>
      </div>
      <p class="scope-note">
        {{ scopeText }}；一条记录为一次停车。企业按当前登记车牌关联，未关联及登记冲突单独统计。{{
          stats.missingTimes ? `有 ${stats.missingTimes} 条时间缺失或异常，不计入平均停留；无效时间不计入进出分布。` : ''
        }}
      </p>

      <div class="conclusions">
        <strong>
          <i class="el-icon-data-analysis" />
          分析结论
        </strong>
        <p v-for="text in findings" :key="text">{{ text }}</p>
      </div>
      <div class="analysis-grid">
        <div class="panel chart-panel">
          <div class="panel-head">
            <h3>每日进出趋势</h3>
            <span>次</span>
          </div>
          <div ref="dailyChart" class="chart" />
        </div>
        <div class="panel chart-panel">
          <div class="panel-head">
            <h3>24 小时进出分布</h3>
            <span>按发生时间统计</span>
          </div>
          <div ref="hourChart" class="chart" />
        </div>
        <div class="panel chart-panel">
          <div class="panel-head">
            <h3>停留时长分布</h3>
            <span>仅统计进出时间有效的记录</span>
          </div>
          <div ref="durationChart" class="chart" />
        </div>
        <div class="panel chart-panel">
          <div class="panel-head">
            <h3>通道通行量</h3>
            <span>前 10 个通道 / 次</span>
          </div>
          <div ref="channelChart" class="chart" />
        </div>
      </div>

      <div class="panel detail-panel">
        <div class="panel-head">
          <h3>企业车辆出入分析</h3>
          <span>按停车记录数排序</span>
        </div>
        <vxe-table
          ref="detailTable"
          :scroll-y="{ enabled: true, gt: 20, oSize: 5 }"
          :scroll-x="{ enabled: true, gt: 8, oSize: 2 }"
          show-overflow="tooltip"
          header-align="center"
          :data="stats.companies"
          size="small"
          stripe
          border
          height="280"
          empty-text="暂无可分析的数据">
          <vxe-column field="name" title="企业" min-width="180" show-overflow="tooltip" />
          <vxe-column field="vehicles" title="去重车辆数" min-width="100" />
          <vxe-column field="count" title="停车记录数" min-width="100" />
          <vxe-column field="entry" title="进场次数" min-width="100" />
          <vxe-column field="exit" title="出场次数" min-width="100" />
          <vxe-column title="记录占比" min-width="100">
            <template slot-scope="scope">{{ percent(scope.row.count, rows.length) }}%</template>
          </vxe-column>
        </vxe-table>
      </div>
    </template>
  </div>
</template>
<script>
import charts from '../charts'
import { decimalText } from '@/utils/numberFormat'
import { buildBarrierReport } from '../report'
export default {
  name: 'BarrierAnalysis',
  mixins: [charts],
  props: { rows: { type: Array, default: () => [] }, stats: { type: Object, required: true }, appliedQuery: { type: Object, required: true }, loading: Boolean },
  data() {
    return { exporting: false }
  },
  computed: {
    metrics() {
      return [
        { label: '进场次数', value: this.stats.entries, unit: '次' },
        { label: '出场次数', value: this.stats.exits, unit: '次' },
        { label: '去重车辆', value: this.stats.vehicles, unit: '辆' },
        { label: '平均停留', value: decimalText(this.stats.averageStay), unit: '分钟' },
        { label: '实收金额（所选记录）', value: this.stats.amountCount ? decimalText(this.stats.amount) : '—', unit: '元' },
        { label: '企业关联记录占比', value: this.percent(this.stats.linked, this.rows.length), unit: '%' }
      ]
    },
    scopeText() {
      return this.appliedQuery.dateRange && this.appliedQuery.dateRange.length === 2
        ? `${this.appliedQuery.dateRange.join(' 至 ')}，筛选期内进入或离开的停车记录，进出次数分别按发生日期统计`
        : '当前已加载全部记录，进出次数分别按发生日期统计'
    },
    findings() {
      const peak = this.stats.hours.reduce((best, hour) => (hour.entry + hour.exit > best.entry + best.exit ? hour : best), this.stats.hours[0])
      const top = this.stats.companies.find((company) => !['未关联企业', '登记冲突'].includes(company.name))
      return [
        '当前范围共有 ' + this.rows.length + ' 条停车记录，涉及 ' + this.stats.vehicles + ' 辆车，进场 ' + this.stats.entries + ' 次、出场 ' + this.stats.exits + ' 次。',
        peak.entry + peak.exit ? '通行高峰为 ' + peak.name + ' 时段，共 ' + (peak.entry + peak.exit) + ' 次进出。' : '当前范围暂无有效进出时间，无法判断通行高峰。',
        top ? top.name + ' 的停车记录最多，共 ' + top.count + ' 条，涉及 ' + top.vehicles + ' 辆车。' : '当前记录尚未关联企业，可在车辆登记页面维护所属企业。',
        '企业关联记录占比为 ' + this.percent(this.stats.linked, this.rows.length) + '%；企业归属按当前车辆登记信息匹配。'
      ]
    }
  },
  methods: {
    exportReport(format) {
      if (this.loading || this.exporting || !this.rows.length || !['html', 'pdf'].includes(format)) return
      const popup = format === 'pdf' ? window.open('', '_blank') : null
      if (format === 'pdf' && !popup) {
        this.$message.warning('浏览器拦截了打印窗口，请允许弹出窗口后重试')
        return
      }
      this.exporting = true
      try {
        this.renderCharts()
        const titles = { dailyChart: '每日进出趋势', hourChart: '24 小时进出分布', durationChart: '停留时长分布', channelChart: '通道通行量 · 前 10 个通道' }
        const charts = Object.entries(titles)
          .filter(([key]) => this.charts[key])
          .map(([key, title]) => {
            const chart = this.charts[key]
            chart.setOption({ animation: false })
            return { title, image: chart.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#fff' }) }
          })
        const html = buildBarrierReport({
          stats: this.stats,
          query: this.appliedQuery,
          recordCount: this.rows.length,
          metrics: this.metrics,
          findings: this.findings,
          scopeText: this.scopeText,
          charts,
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
          const range = this.appliedQuery.dateRange || []
          link.download = `道闸出入分析_${range.length === 2 ? range.join('_') : '全部日期'}.html`
          document.body.appendChild(link)
          link.click()
          link.remove()
          setTimeout(() => URL.revokeObjectURL(url), 1000)
        }
      } catch (error) {
        if (popup) popup.close()
        this.$message.error('报告导出失败，请稍后重试')
      } finally {
        this.exporting = false
      }
    },
    percent(value, total) {
      return decimalText(total ? (value / total) * 100 : 0)
    }
  }
}
</script>
<style scoped>
.analysis-page {
  height: 100%;
  min-height: 0;
  overflow: auto;
}
.analysis-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin: 0 0 10px;
}
.analysis-toolbar h3 {
  flex: 1;
  margin: 0;
  font-size: 16px;
}
.analysis-toolbar span {
  font-size: 12px;
  color: #8b97a7;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
}
.metric {
  padding: 16px;
}
.metric > span {
  display: block;
  color: #7b8798;
  font-size: 12px;
  margin-bottom: 12px;
}
.metric strong {
  font-size: 25px;
  color: #364c78;
  word-break: break-all;
}
.metric small {
  margin-left: 5px;
  color: #8895a7;
  font-size: 12px;
  font-weight: 400;
}
.panel {
  background: #fff;
  border: 1px solid #e7ebf1;
  border-radius: 10px;
  box-shadow: 0 3px 14px rgba(34, 54, 82, 0.035);
  min-width: 0;
}
.chart-panel,
.detail-panel {
  padding: 12px;
}
.analysis-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 10px;
}
.chart {
  height: 280px;
  width: 100%;
}
.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.panel-head h3 {
  font-size: 15px;
  margin: 0;
}
.panel-head span {
  color: #99a4b3;
  font-size: 11px;
}
.scope-note {
  color: #8895a7;
  font-size: 12px;
  line-height: 1.8;
  margin: 10px 2px;
}
.conclusions {
  border: 1px solid #dce7fa;
  background: #eef4ff;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 10px;
  font-size: 12px;
  color: #496389;
}
.conclusions strong {
  color: #304b78;
  font-size: 14px;
}
.conclusions p {
  margin: 7px 0 0;
  line-height: 1.7;
}
@media (max-width: 1200px) {
  .metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 760px) {
  .analysis-grid {
    grid-template-columns: 1fr;
  }
  .metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
