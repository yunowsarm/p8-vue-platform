<template>
  <main v-loading="loading" class="lead-analysis" :element-loading-text="progressText">
    <el-alert v-if="error" class="analysis-alert" type="error" :title="error" show-icon :closable="false" />
    <template v-if="ready && !error">
      <section class="filter-bar">
        <div class="filter-item">
          <label>线索创建时间</label>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            size="small"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            range-separator="至"
            :picker-options="dateOptions" />
        </div>
        <div class="filter-item">
          <label>渠道来源</label>
          <el-select v-model="channel" clearable placeholder="全部渠道" size="small"><el-option v-for="item in channels" :key="item" :label="item" :value="item" /></el-select>
        </div>
        <div class="filter-item">
          <label>负责人</label>
          <el-select v-model="owner" clearable filterable placeholder="全部负责人" size="small"><el-option v-for="item in owners" :key="item.key" :label="item.name" :value="item.key" /></el-select>
        </div>
        <el-button type="text" @click="resetFilters">重置筛选</el-button>
        <span class="filter-count">当前 {{ filtered.length }} / 全部 {{ leads.length }} 条</span>
        <div class="header-actions">
          <span v-if="updatedAt">更新于 {{ updatedAt }}</span>
          <el-button size="small" icon="el-icon-refresh" :loading="loading" @click="load">刷新数据</el-button>
        </div>
      </section>

      <section class="metric-grid">
        <article v-for="metric in metrics" :key="metric.label" class="metric-card" :class="metric.tone">
          <div class="metric-label">
            {{ metric.label }}
            <i :class="metric.icon" />
          </div>
          <strong>{{ metric.value }}</strong>
          <small>{{ metric.note }}</small>
        </article>
      </section>

      <section class="insight-strip">
        <i class="el-icon-bell" />
        <div>
          <b>行动提示</b>
          <span>{{ actionSummary }}</span>
        </div>
        <el-button type="text" @click="showOverdue">
          查看逾期明细
          <i class="el-icon-right" />
        </el-button>
      </section>
      <el-empty v-if="!filtered.length" description="当前筛选条件下暂无线索，可调整筛选条件" :image-size="80" />
      <template v-else>
        <section class="chart-grid">
          <article class="panel">
            <div class="panel-title">
              <h2>新增线索趋势</h2>
              <span>最近 12 个月 · 按创建月份</span>
            </div>
            <div ref="trend" class="chart" role="img" aria-label="每月新增线索数量" />
          </article>
          <article class="panel">
            <div class="panel-title">
              <h2>当前推进阶段</h2>
              <span>有效线索最新状态 · 非转化漏斗</span>
            </div>
            <div ref="stage" class="chart" role="img" aria-label="线索当前阶段分布" />
          </article>
          <article class="panel">
            <div class="panel-title">
              <h2>渠道获客与签约</h2>
              <span>同一渠道的线索总量与当前签约量</span>
            </div>
            <div ref="source" class="chart" role="img" aria-label="各渠道线索和签约数量" />
          </article>
          <article class="panel">
            <div class="panel-title">
              <h2>客户等级分布</h2>
              <span>有效线索 · 取最新跟进记录</span>
            </div>
            <div ref="level" class="chart" role="img" aria-label="客户等级分布" />
          </article>
          <article class="panel">
            <div class="panel-title">
              <h2>行业需求分布</h2>
              <span>按登记行业统计，含未填写</span>
            </div>
            <div ref="industry" class="chart" role="img" aria-label="行业需求分布" />
          </article>
          <article class="panel">
            <div class="panel-title">
              <h2>空间与面积偏好</h2>
              <el-radio-group v-model="demandType" size="mini">
                <el-radio-button label="areaLabel">需求面积</el-radio-button>
                <el-radio-button label="spaceLabel">意向空间</el-radio-button>
              </el-radio-group>
            </div>
            <div ref="demand" class="chart" role="img" aria-label="空间需求分布" />
          </article>
        </section>

        <section class="panel owner-panel">
          <div class="panel-title">
            <h2>负责人负荷与推进</h2>
            <span>按当前归属统计，不代表历史个人业绩</span>
          </div>
          <el-table :data="ownerRows" size="small" max-height="360" :default-sort="{ prop: 'total', order: 'descending' }">
            <el-table-column prop="name" label="负责人" min-width="160" />
            <el-table-column prop="total" label="线索总数" sortable min-width="110" />
            <el-table-column prop="active" label="待推进" sortable min-width="100" />
            <el-table-column prop="signed" label="已签约" sortable min-width="100" />
            <el-table-column label="签约占比" min-width="100">
              <template slot-scope="scope">{{ percent(scope.row.signed, scope.row.total) }}</template>
            </el-table-column>
            <el-table-column prop="follows" label="累计跟进次数" sortable min-width="140" />
            <el-table-column label="跟进覆盖率" min-width="110">
              <template slot-scope="scope">{{ percent(scope.row.followed, scope.row.total) }}</template>
            </el-table-column>
            <el-table-column prop="overdue" label="逾期线索" sortable min-width="110">
              <template slot-scope="scope">
                <span :class="{ 'danger-text': scope.row.overdue }">{{ scope.row.overdue }}</span>
              </template>
            </el-table-column>
          </el-table>
        </section>
      </template>

      <section ref="detailPanel" class="panel detail-panel">
        <div class="panel-title">
          <div>
            <h2>线索分析明细</h2>
            <span>点击表头排序，定位需要处理的线索</span>
          </div>
          <div class="detail-filters">
            <el-select v-model="risk" size="small"><el-option v-for="item in riskOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select>
            <el-input v-model.trim="keyword" clearable size="small" prefix-icon="el-icon-search" placeholder="搜索企业名称" />
          </div>
        </div>
        <el-table :data="detailRows.slice((page - 1) * 10, page * 10)" size="small" empty-text="暂无符合条件的线索" @sort-change="sortDetails">
          <el-table-column prop="enterprise" label="企业名称" min-width="180" show-overflow-tooltip />
          <el-table-column prop="channel" label="渠道" min-width="150" show-overflow-tooltip />
          <el-table-column prop="owner" label="负责人" min-width="130" />
          <el-table-column label="当前阶段" min-width="130">
            <template slot-scope="scope">{{ scope.row.invalid ? '无效线索' : stageLabel(scope.row.stage) }}</template>
          </el-table-column>
          <el-table-column label="等级" width="80">
            <template slot-scope="scope">{{ scope.row.level === 'UNKNOWN' ? '未记录' : scope.row.level }}</template>
          </el-table-column>
          <el-table-column prop="followCount" label="跟进次数" sortable="custom" min-width="110" />
          <el-table-column prop="due" label="下次跟进" sortable="custom" min-width="170">
            <template slot-scope="scope">
              <span :class="{ 'danger-text': scope.row.overdue }">{{ formatTime(scope.row.due) }}{{ scope.row.overdue ? ' · 逾期' : '' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="created" label="创建时间" sortable="custom" min-width="170">
            <template slot-scope="scope">{{ formatTime(scope.row.created) }}</template>
          </el-table-column>
        </el-table>
        <div class="pagination"><el-pagination background :current-page.sync="page" :total="detailRows.length" :page-size="10" layout="total, prev, pager, next" /></div>
      </section>

      <section class="method-note">
        <b>统计口径与数据质量</b>
        <p>
          所有图表、指标和明细共用上方筛选。签约占比 = 当前签约线索 / 线索总数；有效线索排除无效审批已通过的线索。待推进排除无效、已签约和 F
          级线索。逾期仅按最新跟进记录中明确填写的下次跟进时间判断，不推算工作日周期。
        </p>
        <p>
          当前筛选中：创建时间缺失 {{ quality.missingDate }} 条，渠道缺失 {{ quality.missingChannel }} 条，尚未跟进 {{ quality.unfollowed }} 条，待推进但未填写下次跟进时间
          {{ quality.noPlan }} 条。日期筛选会排除创建时间缺失的记录。面积为区间分类，不折算总面积；现有接口没有成本和合同金额，暂不计算获客成本、收入或投资回报。
        </p>
      </section>
    </template>
    <el-empty v-else-if="!loading" description="数据尚未就绪，请确认登录状态后重试"><el-button type="primary" size="small" @click="load">重新加载</el-button></el-empty>
  </main>
</template>

<script>
import * as echarts from 'echarts'
import { normalizeLead, fetchAllLeads, percentage, distribution, ownerSummary, STAGES, timestamp } from './analysisData'

const COLORS = ['#3578f6', '#22b7a0', '#8c6de9', '#f3b44c', '#ec7182', '#63b4e4', '#95a3b8', '#c5cdd8']
export default {
  name: 'IntentionInquiryAnalysis',
  data() {
    return {
      loading: false,
      ready: false,
      error: '',
      rawRows: [],
      now: Date.now(),
      updatedAt: '',
      progressText: '正在读取线索…',
      dateRange: [],
      channel: '',
      owner: '',
      demandType: 'areaLabel',
      keyword: '',
      risk: 'all',
      page: 1,
      sort: {},
      riskOptions: [
        { value: 'all', label: '全部线索' },
        { value: 'overdue', label: '跟进已逾期' },
        { value: 'unassigned', label: '待分配' },
        { value: 'unfollowed', label: '尚未跟进' },
        { value: 'highIntent', label: 'A / B 级待推进' },
        { value: 'invalid', label: '无效线索' }
      ],
      dateOptions: {
        shortcuts: [7, 30, 90].map((days) => ({
          text: `近 ${days} 天`,
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setDate(start.getDate() - days + 1)
            picker.$emit('pick', [start, end])
          }
        }))
      }
    }
  },
  computed: {
    leads() {
      return this.rawRows.map((row) => normalizeLead(row, this.now))
    },
    channels() {
      return Array.from(new Set(this.leads.map((row) => row.channel)))
    },
    owners() {
      return ownerSummary(this.leads)
    },
    filtered() {
      const start = this.dateRange && this.dateRange.length ? timestamp(`${this.dateRange[0]}T00:00:00`) : null
      const end = this.dateRange && this.dateRange.length ? timestamp(`${this.dateRange[1]}T23:59:59.999`) : null
      return this.leads.filter(
        (row) =>
          (!this.channel || row.channel === this.channel) && (!this.owner || row.ownerKey === this.owner) && (start === null || (row.created !== null && row.created >= start && row.created <= end))
      )
    },
    valid() {
      return this.filtered.filter((row) => !row.invalid)
    },
    metrics() {
      const rows = this.filtered
      const signed = rows.filter((row) => row.signed).length
      return [
        { label: '线索总量', value: rows.length, note: `有效 ${this.valid.length} 条 · 无效 ${rows.length - this.valid.length} 条`, tone: 'blue', icon: 'el-icon-data-line' },
        { label: '当前签约占比', value: percentage(signed, rows.length), note: `已签约 ${signed} 条 / 全部 ${rows.length} 条`, tone: 'green', icon: 'el-icon-circle-check' },
        { label: 'A / B 级待推进', value: rows.filter((row) => row.highIntent).length, note: '优先关注的高意向客户', tone: 'purple', icon: 'el-icon-star-off' },
        { label: '跟进已逾期', value: rows.filter((row) => row.overdue).length, note: '待推进且已超过明确的下次跟进时间', tone: 'orange', icon: 'el-icon-time' }
      ]
    },
    quality() {
      return {
        missingDate: this.filtered.filter((row) => row.created === null).length,
        missingChannel: this.filtered.filter((row) => row.channel === '未填写').length,
        unfollowed: this.filtered.filter((row) => !row.followCount).length,
        noPlan: this.filtered.filter((row) => row.active && row.due === null).length
      }
    },
    actionSummary() {
      return `有 ${this.valid.filter((row) => !row.allocated).length} 条有效线索待分配，${this.filtered.filter((row) => row.overdue).length} 条待推进线索已逾期；${
        this.quality.noPlan
      } 条待推进线索缺少下次跟进计划。`
    },
    ownerRows() {
      return ownerSummary(this.filtered)
    },
    detailRows() {
      const rows = this.filtered.filter((row) => {
        const matchesRisk = this.risk === 'all' || (this.risk === 'unassigned' ? !row.allocated && !row.invalid : this.risk === 'unfollowed' ? !row.followCount : Boolean(row[this.risk]))
        return (
          matchesRisk &&
          String(row.enterprise || '')
            .toLowerCase()
            .includes(this.keyword.toLowerCase())
        )
      })
      const prop = this.sort.prop || 'created'
      const direction = this.sort.order === 'ascending' ? 1 : -1
      return rows.slice().sort((a, b) => (a[prop] === b[prop] ? 0 : a[prop] == null ? 1 : b[prop] == null ? -1 : (a[prop] - b[prop]) * direction))
    }
  },
  watch: {
    filtered() {
      this.page = 1
      this.scheduleCharts()
    },
    demandType() {
      this.scheduleCharts()
    },
    risk() {
      this.page = 1
    },
    keyword() {
      this.page = 1
    }
  },
  mounted() {
    this._charts = {}
    this.load()
    window.addEventListener('resize', this.resizeCharts)
    if (typeof ResizeObserver !== 'undefined') {
      this._observer = new ResizeObserver(this.resizeCharts)
      this._observer.observe(this.$el)
    }
    this._timer = window.setInterval(() => {
      this.now = Date.now()
    }, 60000)
  },
  beforeDestroy() {
    this._cancelled = true
    window.removeEventListener('resize', this.resizeCharts)
    window.clearInterval(this._timer)
    if (this._observer) this._observer.disconnect()
    this.disposeCharts()
  },
  methods: {
    percent: percentage,
    stageLabel(value) {
      return STAGES[value] || value
    },
    formatTime(value) {
      if (value === null || value === undefined) return '未填写'
      const date = new Date(value)
      const pad = (n) => String(n).padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    },
    async load() {
      if (this.loading) return
      this.loading = true
      this.error = ''
      this.progressText = '正在读取线索…'
      this.disposeCharts()
      try {
        const api = this.$api && this.$api['reception.list']
        if (!api) throw new Error('线索查询接口未注册')
        const rows = await fetchAllLeads(
          api,
          (count, total) => {
            this.progressText = `已读取 ${count}${total === null ? '' : ` / ${total}`} 条线索…`
          },
          () => this._cancelled
        )
        if (this._cancelled) return
        this.rawRows = rows
        this.now = Date.now()
        this.updatedAt = this.formatTime(this.now)
        this.ready = true
      } catch (error) {
        if (!this._cancelled) this.error = error.message || '数据加载失败，请确认登录状态和查询权限后重试'
      } finally {
        if (!this._cancelled) {
          this.loading = false
          this.scheduleCharts()
        }
      }
    },
    resetFilters() {
      this.dateRange = []
      this.channel = ''
      this.owner = ''
      this.keyword = ''
      this.risk = 'all'
    },
    showOverdue() {
      this.risk = 'overdue'
      this.keyword = ''
      this.$refs.detailPanel.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    sortDetails(value) {
      this.sort = value
      this.page = 1
    },
    disposeCharts() {
      Object.values(this._charts || {}).forEach((chart) => chart.dispose())
      this._charts = {}
    },
    resizeCharts() {
      Object.values(this._charts || {}).forEach((chart) => chart.resize())
    },
    scheduleCharts() {
      this.$nextTick(() => {
        if (!this._cancelled && !this.loading && !this.error) this.renderCharts()
      })
    },
    renderCharts() {
      if (!this.filtered.length) {
        this.disposeCharts()
        return
      }
      const base = {
        color: COLORS,
        textStyle: { fontFamily: 'Microsoft YaHei, sans-serif', color: '#6b7c93', fontSize: 11 },
        tooltip: { trigger: 'axis', confine: true, renderMode: 'richText' },
        grid: { left: 16, right: 24, top: 36, bottom: 16, containLabel: true }
      }
      const draw = (key, option) => {
        const element = this.$refs[key]
        if (!element) return
        if (!this._charts[key]) this._charts[key] = echarts.init(element)
        this._charts[key].setOption({ ...base, ...option }, true)
      }
      const axis = { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: '#edf1f7', type: 'dashed' } } }
      const bars = (key, data) =>
        draw(key, {
          xAxis: axis,
          yAxis: { type: 'category', inverse: true, data: data.map((item) => item.name), axisTick: { show: false }, axisLine: { show: false }, axisLabel: { width: 120, overflow: 'truncate' } },
          series: [{ type: 'bar', data: data.map((item) => item.value), barMaxWidth: 22, itemStyle: { borderRadius: [0, 4, 4, 0] }, label: { show: true, position: 'right' } }]
        })
      const end = this.dateRange && this.dateRange.length ? new Date(`${this.dateRange[1]}T12:00:00`) : new Date(this.now)
      const months = Array.from({ length: 12 }, (_, index) => {
        const d = new Date(end.getFullYear(), end.getMonth() - 11 + index, 1)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      })
      const counts = months.map((month) => this.filtered.filter((row) => row.created !== null && this.formatTime(row.created).slice(0, 7) === month).length)
      draw('trend', {
        xAxis: { type: 'category', data: months, boundaryGap: false, axisLine: { lineStyle: { color: '#dce4ef' } }, axisLabel: { formatter: (value) => value.slice(2) } },
        yAxis: axis,
        series: [{ type: 'line', data: counts, smooth: true, symbolSize: 6, lineStyle: { width: 3 }, areaStyle: { color: 'rgba(53,120,246,.10)' } }]
      })
      bars(
        'stage',
        distribution(this.valid, 'stage').map((item) => ({ ...item, name: this.stageLabel(item.name) }))
      )
      const channels = distribution(this.filtered, 'channel')
      draw('source', {
        legend: { top: 0, right: 12, data: ['线索总量', '已签约'] },
        xAxis: axis,
        yAxis: { type: 'category', inverse: true, data: channels.map((item) => item.name), axisLabel: { width: 115, overflow: 'truncate' }, axisLine: { show: false }, axisTick: { show: false } },
        series: [
          { name: '线索总量', type: 'bar', barMaxWidth: 16, data: channels.map((item) => item.value) },
          { name: '已签约', type: 'bar', barMaxWidth: 16, data: channels.map((item) => this.filtered.filter((row) => row.channel === item.name && row.signed).length) }
        ],
        dataZoom:
          channels.length > 8
            ? [
                { type: 'inside', yAxisIndex: 0, startValue: 0, endValue: 7 },
                { type: 'slider', yAxisIndex: 0, width: 12, right: 0 }
              ]
            : []
      })
      draw('level', {
        tooltip: { trigger: 'item', confine: true, renderMode: 'richText' },
        legend: { bottom: 0, type: 'scroll' },
        series: [
          {
            type: 'pie',
            radius: ['43%', '68%'],
            center: ['50%', '44%'],
            label: { formatter: '{b}\n{c} 条 ({d}%)', fontSize: 11 },
            data: distribution(this.valid, 'level').map((item) => ({ ...item, name: item.name === 'UNKNOWN' ? '未记录' : `${item.name} 级` }))
          }
        ]
      })
      bars('industry', distribution(this.filtered, 'industryLabel'))
      bars('demand', distribution(this.filtered, this.demandType))
    }
  }
}
</script>

<style lang="scss" scoped>
.lead-analysis {
  min-height: 100%;
  padding: 24px;
  background: #f4f7fc;
  color: #24334b;
  box-sizing: border-box;
}
.header-actions,
.filter-bar,
.panel-title,
.insight-strip,
.detail-filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.header-actions {
  font-size: 12px;
  color: #8b97aa;
  flex-wrap: wrap;
}
.filter-bar {
  justify-content: flex-start;
  flex-wrap: wrap;
  padding: 16px 20px;
  background: white;
  border: 1px solid #e8edf5;
  border-radius: 10px;
  margin-bottom: 20px;
}
.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
  label {
    color: #66758c;
    font-size: 12px;
    white-space: nowrap;
  }
  .el-select {
    width: 155px;
  }
}
.filter-count {
  margin-left: auto;
  color: #8b97aa;
  font-size: 12px;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 20px;
}
.metric-card {
  background: white;
  border: 1px solid #e8edf5;
  border-radius: 10px;
  padding: 12px 20px;
  position: relative;
  overflow: hidden;
  strong {
    display: block;
    margin: 8px 0 6px;
    font-size: 30px;
    line-height: 1;
    font-weight: 650;
    font-variant-numeric: tabular-nums;
  }
  small {
    color: #8b97aa;
    font-size: 11px;
    line-height: 1.6;
  }
}
.metric-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #66758c;
  font-size: 13px;
  i {
    color: #3578f6;
    padding: 8px;
    background: #f0f5ff;
    border-radius: 8px;
    font-size: 18px;
  }
}
.insight-strip {
  padding: 14px 18px;
  border: 1px solid #dce8ff;
  background: #edf4ff;
  border-radius: 8px;
  margin-bottom: 20px;
  > i {
    color: #3578f6;
    font-size: 22px;
  }
  > div {
    flex: 1;
    font-size: 12px;
    line-height: 1.8;
    b {
      margin-right: 14px;
      color: #3578f6;
    }
  }
  .el-button {
    flex-shrink: 0;
  }
}
.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}
.panel {
  min-width: 0;
  background: white;
  border: 1px solid #e8edf5;
  border-radius: 10px;
  padding: 20px;
}
.panel-title {
  margin-bottom: 14px;
  flex-wrap: wrap;
  h2 {
    font-size: 15px;
    font-weight: 600;
    margin: 0;
    line-height: 1.8;
  }
  span {
    color: #8b97aa;
    font-size: 11px;
  }
}
.chart {
  width: 100%;
  height: 285px;
}
.owner-panel,
.detail-panel {
  margin-bottom: 20px;
}
.detail-filters {
  .el-select {
    width: 155px;
  }
  .el-input {
    width: 200px;
  }
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
  overflow: auto;
}
.danger-text {
  color: #df6c40;
  font-weight: 600;
}
.method-note {
  font-size: 12px;
  line-height: 1.9;
  color: #8b97aa;
  padding: 0 4px;
  b {
    color: #66758c;
  }
  p {
    margin: 5px 0;
  }
}
.analysis-alert {
  margin-bottom: 18px;
}
::v-deep .el-table th.el-table__cell {
  background: #f6f8fc;
  color: #718096;
  font-weight: 500;
}
@media (max-width: 1200px) {
  .metric-grid {
    gap: 12px;
  }
  .metric-card {
    padding: 12px 16px;
  }
}
@media (max-width: 850px) {
  .lead-analysis {
    padding: 16px;
  }
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .chart-grid {
    grid-template-columns: 1fr;
  }
  .insight-strip {
    flex-wrap: wrap;
  }
}
@media (max-width: 500px) {
  .filter-item {
    width: 100%;
    flex-wrap: wrap;
  }
  .filter-item .el-date-editor {
    width: 100%;
  }
  .detail-filters {
    flex-wrap: wrap;
  }
  .metric-card strong {
    font-size: 28px;
  }
}
</style>
