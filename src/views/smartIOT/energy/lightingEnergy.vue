<template>
  <div class="energy-page lighting-energy-page">
    <header class="page-header">
      <div>
        <div class="title-row">
          <h2>照明能耗</h2>
          <span class="live-badge">策略执行中</span>
        </div>
        <p class="page-subtitle">照明回路、人员与光照联动分析，节能策略效果和人工控制全程留痕</p>
      </div>
      <div class="header-actions">
        <el-button size="small" icon="el-icon-set-up" @click="openStrategy()">策略配置</el-button>
        <el-button size="small" icon="el-icon-thumb" @click="openManual">人工现场控制</el-button>
        <el-button type="primary" size="small" icon="el-icon-data-analysis" @click="openWorkspace('savings')">节能分析</el-button>
      </div>
    </header>

    <section class="kpi-grid">
      <article v-for="item in dataSet.kpis" :key="item.title" class="kpi-card">
        <i :class="[item.icon, 'kpi-icon', item.type]"></i>
        <div class="kpi-label">{{ item.title }}</div>
        <div class="kpi-number">
          {{ item.value }}<span class="kpi-unit">{{ item.unit }}</span>
        </div>
        <div class="kpi-sub">{{ item.sub }}</div>
      </article>
    </section>

    <iot-workspace-nav v-model="activeTab" :items="workspaceNav" aria-label="照明能耗业务工作区" @change="handleWorkspaceChange" />

    <section v-show="activeTab === 'overview'" ref="overviewWorkspace" class="dashboard-grid lighting-dashboard" tabindex="-1">
      <article class="surface">
        <div class="surface-head">
          <div>
            <div class="surface-title"><i class="el-icon-map-location"></i>分区运行态势</div>
            <div class="surface-subtitle">点击分区筛选下方回路台账</div>
          </div>
        </div>
        <div class="surface-body">
          <div class="summary-strip summary-strip--top">
            <div class="summary-box">
              <span>当前分区策略</span><strong>{{ selectedAreaInfo.strategy }}</strong>
            </div>
            <div class="summary-box">
              <span>单位能耗</span><strong>{{ selectedAreaInfo.density }} kWh/㎡</strong>
            </div>
          </div>
          <div class="selector-list area-list">
            <div
              v-for="item in dataSet.areas"
              :key="item.id"
              tabindex="0"
              :class="['selector-item', selectedArea === item.name ? 'active' : '']"
              @click="selectArea(item)"
              @keyup.enter="selectArea(item)"
            >
              <div>
                <div class="item-name"><span :class="['status-dot', item.status === '正常' ? '' : item.status === '受保护' ? 'offline' : 'warning']"></span>{{ item.name }}</div>
                <div class="item-meta">开启 {{ item.on }}/{{ item.circuits }} · 调光 {{ item.dimming }}%</div>
              </div>
              <div class="metric-value">{{ item.kwh }}<small> kWh</small></div>
            </div>
          </div>
        </div>
      </article>

      <article class="surface">
        <div class="surface-head">
          <div>
            <div class="surface-title"><i class="el-icon-sunny"></i>策略执行与环境关联</div>
            <div class="surface-subtitle">照明功率对比基线，并叠加人员存在比例</div>
          </div>
          <span class="chart-legend-note">当前照度 18,600 lx</span>
        </div>
        <div class="surface-body"><div ref="lightingChart" class="chart"></div></div>
      </article>

      <article class="surface">
        <div class="surface-head">
          <div>
            <div class="surface-title"><i class="el-icon-data-analysis"></i>策略节能对比</div>
            <div class="surface-subtitle">实施前后月度用电量（kWh）</div>
          </div>
        </div>
        <div class="surface-body">
          <div class="saving-summary saving-summary--top">
            <div><span>本月节电量</span><strong>4,720 kWh</strong></div>
            <div><span>节省费用</span><strong>3.55 万元</strong></div>
            <div><span>综合节电率</span><strong>17.1%</strong></div>
          </div>
          <div ref="savingChart" class="chart mini-chart"></div>
        </div>
      </article>
    </section>

    <section v-show="activeTab !== 'overview'" ref="detailWorkspace" class="surface management-card workspace-detail" tabindex="-1">
      <iot-workspace-header :item="currentWorkspace" updated-at="10:52:19" @back="openWorkspace('overview')" />
      <el-tabs v-model="activeTab" class="workspace-tabs">
        <el-tab-pane name="circuits">
          <span slot="label" class="tab-label"
            ><i class="el-icon-switch-button"></i>回路与表计 <b class="tab-count">{{ dataSet.circuits.length }}</b></span
          >
          <div class="toolbar">
            <div class="toolbar-left">
              <el-input v-model.trim="keyword" clearable size="small" prefix-icon="el-icon-search" placeholder="回路 / 配电箱 / 分区" style="width: 220px"></el-input
              ><el-select v-model="selectedArea" clearable size="small" placeholder="全部区域" style="width: 155px"
                ><el-option v-for="item in dataSet.areas" :key="item.id" :label="item.name" :value="item.name"></el-option
              ></el-select>
            </div>
            <div class="toolbar-note"><i class="el-icon-info"></i> 消防应急照明仅展示，不参与普通节能控制</div>
          </div>
          <el-table :data="pagedCircuits" size="small" stripe @row-click="openCircuit">
            <el-table-column prop="id" label="回路编号" width="105"></el-table-column><el-table-column prop="name" label="回路名称" min-width="150"></el-table-column
            ><el-table-column prop="area" label="分区" min-width="130"></el-table-column><el-table-column prop="box" label="配电箱" width="95"></el-table-column>
            <el-table-column label="开关 / 调光" width="115"
              ><template slot-scope="scope">{{ scope.row.state }} / {{ scope.row.dimming }}%</template></el-table-column
            ><el-table-column prop="power" label="功率(kW)" width="90"></el-table-column><el-table-column prop="runtime" label="运行(h)" width="82"></el-table-column
            ><el-table-column prop="occupancy" label="人员存在" width="85"></el-table-column><el-table-column prop="control" label="控制来源" min-width="115"></el-table-column>
            <el-table-column label="状态" width="130"
              ><template slot-scope="scope"
                ><span :class="['status-pill', statusClass(scope.row.status)]">{{ scope.row.status }}</span></template
              ></el-table-column
            ><el-table-column label="操作" width="70" fixed="right"
              ><template slot-scope="scope"><el-button type="text" size="mini" @click.stop="openCircuit(scope.row)">详情</el-button></template></el-table-column
            >
          </el-table>
          <div class="pagination-row"><el-pagination :current-page.sync="circuitPage" :page-size="5" layout="total, prev, pager, next" :total="filteredCircuits.length"></el-pagination></div>
        </el-tab-pane>

        <el-tab-pane name="anomalies"
          ><span slot="label" class="tab-label"
            ><i class="el-icon-warning-outline"></i>异常照明 <b class="tab-count">{{ dataSet.anomalies.length }}</b></span
          >
          <div class="toolbar">
            <div class="toolbar-left">
              <el-input
                v-model.trim="anomalyKeyword"
                size="small"
                clearable
                prefix-icon="el-icon-search"
                placeholder="搜索事件编号 / 异常类型 / 位置 / 判断依据 / 状态"
                style="width: 340px"
              ></el-input>
            </div>
          </div>
          <el-table :data="filteredAnomalies" size="small" stripe
            ><el-table-column prop="id" label="事件编号" width="135"></el-table-column
            ><el-table-column label="级别" width="80"
              ><template slot-scope="scope"
                ><span :class="['level-pill', scope.row.level === '重要' ? 'danger' : '']">{{ scope.row.level }}</span></template
              ></el-table-column
            ><el-table-column prop="type" label="异常类型" width="145"></el-table-column><el-table-column prop="area" label="位置" min-width="135"></el-table-column
            ><el-table-column prop="detail" label="判断依据" min-width="260" show-overflow-tooltip></el-table-column><el-table-column prop="time" label="发生时间" width="105"></el-table-column
            ><el-table-column prop="status" label="状态" width="90"></el-table-column
            ><el-table-column label="操作" width="70"
              ><template slot-scope="scope"><el-button type="text" size="mini" @click="openAnomaly(scope.row)">处置</el-button></template></el-table-column
            ></el-table
          >
        </el-tab-pane>

        <el-tab-pane name="savings"
          ><span slot="label" class="tab-label"
            ><i class="el-icon-data-analysis"></i>策略与节能效果 <b class="tab-count">{{ dataSet.strategies.length }}</b></span
          >
          <div class="toolbar">
            <div class="toolbar-left">
              <el-input
                v-model.trim="strategyKeyword"
                size="small"
                clearable
                prefix-icon="el-icon-search"
                placeholder="搜索策略名称 / 区域 / 日历 / 时段 / 条件 / 状态"
                style="width: 340px"
              ></el-input>
            </div>
            <el-button type="primary" size="small" @click="openStrategy()">新增策略</el-button>
          </div>
          <el-table :data="filteredStrategies" size="small" stripe
            ><el-table-column prop="name" label="策略名称" min-width="160"></el-table-column
            ><el-table-column label="执行区域" min-width="175"
              ><template slot-scope="scope">{{ scope.row.areas.join('、') }}</template></el-table-column
            ><el-table-column prop="calendar" label="日历" width="90"></el-table-column><el-table-column prop="time" label="执行时段" min-width="140"></el-table-column
            ><el-table-column prop="condition" label="执行条件" min-width="145"></el-table-column><el-table-column prop="dimming" label="调光策略" min-width="145"></el-table-column
            ><el-table-column label="节电率" width="85"
              ><template slot-scope="scope">{{ scope.row.savingRate }}%</template></el-table-column
            ><el-table-column label="状态" width="95"
              ><template slot-scope="scope"
                ><span :class="['status-pill', statusClass(scope.row.status)]">{{ scope.row.status }}</span></template
              ></el-table-column
            ><el-table-column label="操作" width="70"
              ><template slot-scope="scope"><el-button type="text" size="mini" :disabled="scope.row.protected" @click="openStrategy(scope.row)">编辑</el-button></template></el-table-column
            ></el-table
          >
          <div class="savings-cards">
            <div v-for="item in dataSet.savings" :key="item.strategy" class="saving-card">
              <span>{{ item.strategy }}</span
              ><strong>{{ item.saved }} kWh</strong><small>节电 {{ item.rate }}% · 节省 {{ item.cost }} 万元</small>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="audits"
          ><span slot="label" class="tab-label"
            ><i class="el-icon-document-checked"></i>控制审计 <b class="tab-count">{{ dataSet.audits.length }}</b></span
          >
          <div class="toolbar">
            <div class="toolbar-left">
              <el-input
                v-model.trim="auditKeyword"
                size="small"
                clearable
                prefix-icon="el-icon-search"
                placeholder="搜索时间 / 动作 / 控制对象 / 操作人 / 原因 / 优先级 / 结果"
                style="width: 360px"
              ></el-input>
            </div>
          </div>
          <el-table :data="filteredAudits" size="small" stripe
            ><el-table-column prop="time" label="时间" width="165"></el-table-column><el-table-column prop="action" label="动作" width="120"></el-table-column
            ><el-table-column prop="target" label="控制对象" min-width="160"></el-table-column><el-table-column prop="operator" label="操作人" width="110"></el-table-column
            ><el-table-column prop="reason" label="原因" min-width="180"></el-table-column><el-table-column prop="priority" label="优先级" width="130"></el-table-column
            ><el-table-column prop="expires" label="失效时间" width="95"></el-table-column
            ><el-table-column label="结果" width="90"
              ><template slot-scope="scope"
                ><span :class="['status-pill', statusClass(scope.row.result)]">{{ scope.row.result }}</span></template
              ></el-table-column
            ></el-table
          >
        </el-tab-pane>
      </el-tabs>
    </section>

    <el-dialog title="照明节能策略配置" :visible.sync="strategyDialog" width="680px" custom-class="energy-config-dialog">
      <div class="dialog-intro">策略可结合工作日、节假日、日出日落、人员存在和照度执行。消防应急照明不会出现在可选区域内。</div>
      <el-form :model="strategyForm" label-width="105px" size="small">
        <el-form-item label="策略名称"><el-input v-model="strategyForm.name"></el-input></el-form-item>
        <el-form-item label="执行区域"
          ><el-select v-model="strategyForm.areas" multiple style="width: 100%"
            ><el-option v-for="item in controllableAreas" :key="item.id" :label="item.name" :value="item.name"></el-option></el-select
        ></el-form-item>
        <el-row :gutter="14"
          ><el-col :span="12"
            ><el-form-item label="日历"
              ><el-select v-model="strategyForm.calendar" style="width: 100%"
                ><el-option label="工作日" value="工作日"></el-option><el-option label="节假日" value="节假日"></el-option><el-option label="生产日历" value="生产日历"></el-option
                ><el-option label="全周" value="全周"></el-option></el-select></el-form-item></el-col
          ><el-col :span="12"
            ><el-form-item label="执行时段"
              ><el-time-picker
                v-model="strategyForm.time"
                is-range
                value-format="HH:mm"
                range-separator="至"
                start-placeholder="开始"
                end-placeholder="结束"
                style="width: 100%"
              ></el-time-picker></el-form-item></el-col
        ></el-row>
        <el-form-item label="触发条件"
          ><el-checkbox-group v-model="strategyForm.conditions"
            ><el-checkbox label="人员存在"></el-checkbox><el-checkbox label="照度阈值"></el-checkbox><el-checkbox label="日出日落"></el-checkbox></el-checkbox-group
        ></el-form-item>
        <el-row :gutter="14"
          ><el-col :span="12"
            ><el-form-item label="照度阈值"><el-input-number v-model="strategyForm.lux" :min="0" :max="1000" style="width: 100%"></el-input-number></el-form-item></el-col
          ><el-col :span="12"
            ><el-form-item label="目标调光"><el-slider v-model="strategyForm.dimming" show-input input-size="mini"></el-slider></el-form-item></el-col
        ></el-row>
        <el-form-item label="无人延时"><el-input-number v-model="strategyForm.delay" :min="1" :max="120"></el-input-number><span class="form-suffix"> 分钟后关闭</span></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="strategyDialog = false">取消</el-button><el-button type="primary" @click="saveStrategy">保存并测算节能效果</el-button></span>
    </el-dialog>

    <el-dialog title="人工现场控制" :visible.sync="manualDialog" width="600px" custom-class="energy-config-dialog">
      <div class="warning-note"><i class="el-icon-warning-outline"></i> 人工控制优先于自动策略，但不得控制消防应急回路；到期后自动恢复原策略并写入审计记录。</div>
      <el-form :model="manualForm" label-width="100px" size="small"
        ><el-form-item label="控制回路"
          ><el-select v-model="manualForm.circuit" filterable style="width: 100%"
            ><el-option v-for="item in controllableCircuits" :key="item.id" :label="`${item.name}（${item.id}）`" :value="item.id"></el-option></el-select></el-form-item
        ><el-row :gutter="14"
          ><el-col :span="12"
            ><el-form-item label="控制动作"
              ><el-radio-group v-model="manualForm.action"><el-radio label="开启"></el-radio><el-radio label="关闭"></el-radio></el-radio-group></el-form-item></el-col
          ><el-col :span="12"
            ><el-form-item label="调光比例"><el-input-number v-model="manualForm.dimming" :min="0" :max="100" style="width: 100%"></el-input-number></el-form-item></el-col></el-row
        ><el-form-item label="覆盖至"><el-time-picker v-model="manualForm.expires" value-format="HH:mm" style="width: 100%"></el-time-picker></el-form-item
        ><el-form-item label="控制原因"><el-input v-model="manualForm.reason" type="textarea" :rows="2"></el-input></el-form-item
        ><el-form-item label="审批单号"><el-input v-model="manualForm.approval" placeholder="非现场硬件控制时必填"></el-input></el-form-item
      ></el-form>
      <span slot="footer"><el-button @click="manualDialog = false">取消</el-button><el-button type="primary" @click="submitManual">二次确认并下发</el-button></span>
    </el-dialog>

    <el-drawer title="照明对象详情" :visible.sync="drawerVisible" size="470px" custom-class="energy-detail-drawer">
      <div v-if="drawerRecord" class="drawer-scroll">
        <div class="drawer-hero">
          <div class="drawer-title">{{ drawerRecord.name || drawerRecord.type }}</div>
          <div class="drawer-id">{{ drawerRecord.id }} · {{ drawerMode === 'circuit' ? drawerRecord.area : drawerRecord.time }}</div>
        </div>
        <template v-if="drawerMode === 'circuit'"
          ><div class="detail-grid">
            <div class="detail-cell">
              <span>开关状态</span><strong>{{ drawerRecord.state }}</strong>
            </div>
            <div class="detail-cell">
              <span>调光比例</span><strong>{{ drawerRecord.dimming }}%</strong>
            </div>
            <div class="detail-cell">
              <span>实时功率</span><strong>{{ drawerRecord.power }} kW</strong>
            </div>
            <div class="detail-cell">
              <span>今日用电</span><strong>{{ drawerRecord.kwh }} kWh</strong>
            </div>
            <div class="detail-cell">
              <span>人员存在</span><strong>{{ drawerRecord.occupancy }}</strong>
            </div>
            <div class="detail-cell">
              <span>现场照度</span><strong>{{ drawerRecord.lux }} lx</strong>
            </div>
            <div class="detail-cell">
              <span>控制来源</span><strong>{{ drawerRecord.control }}</strong>
            </div>
            <div class="detail-cell">
              <span>运行状态</span><strong>{{ drawerRecord.status }}</strong>
            </div>
          </div>
          <div v-if="drawerRecord.emergency" class="warning-note">该回路属于消防应急照明，系统仅监测，不提供普通节能或人工远程控制。</div></template
        >
        <template v-else
          ><div class="warning-note">{{ drawerRecord.detail }}</div>
          <div class="drawer-section-title">判断与处置轨迹</div>
          <div v-for="(trace, index) in drawerRecord.traces" :key="index" class="trace-item">
            <div class="trace-time">{{ trace.time }} · {{ trace.user }}</div>
            <div class="trace-action">{{ trace.action }}</div>
            <div class="trace-remark">{{ trace.remark }}</div>
          </div></template
        >
      </div>
      <div v-if="drawerRecord" class="drawer-actions">
        <el-button size="small" @click="drawerVisible = false">关闭</el-button
        ><template v-if="drawerMode === 'anomaly'"
          ><el-button size="small" @click="createWorkOrder">转维修工单</el-button><el-button type="primary" size="small" @click="closeAnomaly">确认处置</el-button></template
        ><el-button v-else-if="!drawerRecord.emergency" type="primary" size="small" @click="openManualFor(drawerRecord)">人工控制</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import IotWorkspaceHeader from '../components/IotWorkspaceHeader.vue'
import IotWorkspaceNav from '../components/IotWorkspaceNav.vue'
import { lightingEnergy } from '../mock/energyMockData'

export default {
  name: 'SmartIOTLightingEnergy',
  components: { IotWorkspaceHeader, IotWorkspaceNav },
  data() {
    return {
      dataSet: lightingEnergy,
      activeTab: 'overview',
      selectedArea: '',
      keyword: '',
      anomalyKeyword: '',
      strategyKeyword: '',
      auditKeyword: '',
      circuitPage: 1,
      lightingChart: null,
      savingChart: null,
      strategyDialog: false,
      manualDialog: false,
      drawerVisible: false,
      drawerRecord: null,
      drawerMode: 'circuit',
      strategyForm: { name: '办公区工作日节能策略', areas: ['A栋办公区'], calendar: '工作日', time: ['07:30', '20:30'], conditions: ['人员存在', '照度阈值'], lux: 500, dimming: 70, delay: 15 },
      manualForm: { circuit: '', action: '开启', dimming: 70, expires: '12:00', reason: '', approval: '' }
    }
  },
  computed: {
    workspaceNav() {
      return [
        { key: 'overview', title: '照明总览', description: '分区、功率与环境', detail: '查看分区运行、照明功率、人员存在、照度和策略节能趋势。', icon: 'el-icon-data-analysis', count: null },
        { key: 'circuits', title: '回路表计', description: '开关、调光与时长', detail: '管理照明回路、配电箱、开关状态、调光比例和运行时长。', icon: 'el-icon-switch-button', count: this.dataSet.circuits.length },
        { key: 'anomalies', title: '异常照明', description: '识别、派单与关闭', detail: '处置非使用时段亮灯、无人长亮、能耗突增和状态电量不一致。', icon: 'el-icon-warning-outline', count: this.dataSet.anomalies.length, danger: this.dataSet.anomalies.some((item) => item.status !== '已关闭') },
        { key: 'savings', title: '策略节能', description: '配置、基线与效果', detail: '管理分区、定时、调光和人感策略，并比较实施前后节能效果。', icon: 'el-icon-sunny', count: this.dataSet.strategies.length },
        { key: 'audits', title: '控制审计', description: '人工覆盖与优先级', detail: '追溯人工控制、策略覆盖、消防保护拒绝和自动恢复记录。', icon: 'el-icon-document-checked', count: this.dataSet.audits.length }
      ]
    },
    currentWorkspace() {
      return this.workspaceNav.find((item) => item.key === this.activeTab) || this.workspaceNav[0]
    },
    selectedAreaInfo() {
      return this.dataSet.areas.find((item) => item.name === this.selectedArea) || this.dataSet.areas[0]
    },
    controllableAreas() {
      return this.dataSet.areas.filter((item) => item.status !== '受保护')
    },
    controllableCircuits() {
      return this.dataSet.circuits.filter((item) => !item.emergency)
    },
    filteredCircuits() {
      const key = this.keyword.toLowerCase()
      return this.dataSet.circuits.filter(
        (item) => (!this.selectedArea || item.area === this.selectedArea) && (!key || [item.id, item.name, item.box, item.area].join(' ').toLowerCase().includes(key))
      )
    },
    pagedCircuits() {
      const start = (this.circuitPage - 1) * 5
      return this.filteredCircuits.slice(start, start + 5)
    },
    filteredAnomalies() {
      const key = this.anomalyKeyword.toLowerCase()
      if (!key) return this.dataSet.anomalies
      return this.dataSet.anomalies.filter((item) => [item.id, item.level, item.type, item.area, item.detail, item.time, item.status].join(' ').toLowerCase().includes(key))
    },
    filteredStrategies() {
      const key = this.strategyKeyword.toLowerCase()
      if (!key) return this.dataSet.strategies
      return this.dataSet.strategies.filter((item) => {
        return [item.name, item.areas.join(' '), item.calendar, item.time, item.condition, item.dimming, item.savingRate, item.status].join(' ').toLowerCase().includes(key)
      })
    },
    filteredAudits() {
      const key = this.auditKeyword.toLowerCase()
      if (!key) return this.dataSet.audits
      return this.dataSet.audits.filter((item) => {
        return [item.time, item.action, item.target, item.operator, item.reason, item.priority, item.expires, item.result].join(' ').toLowerCase().includes(key)
      })
    }
  },
  watch: {
    keyword() {
      this.circuitPage = 1
    },
    selectedArea() {
      this.circuitPage = 1
    }
  },
  mounted() {
    this.$nextTick(this.initCharts)
    window.addEventListener('resize', this.resizeCharts)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
    if (this.lightingChart) this.lightingChart.dispose()
    if (this.savingChart) this.savingChart.dispose()
  },
  methods: {
    openWorkspace(view) {
      if (!this.workspaceNav.some((item) => item.key === view)) return
      this.activeTab = view
      this.handleWorkspaceChange()
    },
    handleWorkspaceChange() {
      this.$nextTick(() => {
        const content = this.activeTab === 'overview' ? this.$refs.overviewWorkspace : this.$refs.detailWorkspace
        if (content && typeof content.focus === 'function') content.focus({ preventScroll: true })
        if (this.activeTab === 'overview') this.resizeCharts()
      })
    },
    statusClass(status) {
      if (/异常|拒绝|不一致/.test(status)) return 'danger'
      if (/长亮|突增|待|覆盖|非使用/.test(status)) return 'warning'
      if (/保护|关闭/.test(status)) return 'info'
      return ''
    },
    selectArea(item) {
      this.selectedArea = this.selectedArea === item.name ? '' : item.name
    },
    openCircuit(row) {
      this.drawerMode = 'circuit'
      this.drawerRecord = row
      this.drawerVisible = true
    },
    openAnomaly(row) {
      this.drawerMode = 'anomaly'
      this.drawerRecord = row
      this.drawerVisible = true
    },
    openStrategy(row) {
      if (row && row.protected) return
      if (row) this.strategyForm = { name: row.name, areas: [...row.areas], calendar: row.calendar, time: ['07:30', '20:30'], conditions: ['人员存在', '照度阈值'], lux: 500, dimming: 70, delay: 15 }
      this.strategyDialog = true
    },
    openManual() {
      this.manualForm.circuit = this.controllableCircuits[0].id
      this.manualDialog = true
    },
    openManualFor(row) {
      this.drawerVisible = false
      this.manualForm.circuit = row.id
      this.manualForm.dimming = row.dimming
      this.manualDialog = true
    },
    saveStrategy() {
      if (!this.strategyForm.name || !this.strategyForm.areas.length) return this.$message.warning('请填写策略名称并选择区域')
      this.strategyDialog = false
      this.$message.success('策略已保存，预计节电率 16.8%')
    },
    submitManual() {
      if (!this.manualForm.circuit || !this.manualForm.reason) return this.$message.warning('请选择回路并填写控制原因')
      this.manualDialog = false
      this.openWorkspace('audits')
      this.$message.success('人工控制已下发，到期后自动恢复策略')
    },
    createWorkOrder() {
      this.drawerRecord.status = '已派单'
      this.$message.success('已生成照明维修工单 WO-8906')
    },
    closeAnomaly() {
      this.drawerRecord.status = '已关闭'
      this.drawerVisible = false
      this.$message.success('异常已确认并保留完整记录')
    },
    initCharts() {
      if (!this.$echarts) return
      this.lightingChart = this.$echarts.init(this.$refs.lightingChart)
      this.savingChart = this.$echarts.init(this.$refs.savingChart)
      this.renderCharts()
    },
    renderCharts() {
      const curve = this.dataSet.loadCurve
      this.lightingChart.setOption({
        color: ['#2f80ed', '#aab5c5', '#31b889'],
        textStyle: { fontSize: 13 },
        tooltip: { trigger: 'axis', textStyle: { fontSize: 13 } },
        legend: { top: 0, textStyle: { fontSize: 12 }, data: ['实际功率', '基线功率', '人员存在'] },
        grid: { left: 56, right: 52, top: 46, bottom: 32 },
        xAxis: { type: 'category', boundaryGap: false, data: curve.hours, axisLabel: { fontSize: 12 } },
        yAxis: [
          { type: 'value', name: 'kW', axisLabel: { fontSize: 12 }, nameTextStyle: { fontSize: 12 }, splitLine: { lineStyle: { color: '#edf1f6' } } },
          { type: 'value', name: '%', max: 100, axisLabel: { fontSize: 12 }, nameTextStyle: { fontSize: 12 }, splitLine: { show: false } }
        ],
        series: [
          { name: '实际功率', type: 'line', smooth: true, symbol: 'none', areaStyle: { color: 'rgba(47,128,237,.1)' }, data: curve.actual },
          { name: '基线功率', type: 'line', smooth: true, symbol: 'none', lineStyle: { type: 'dashed' }, data: curve.baseline },
          { name: '人员存在', type: 'line', yAxisIndex: 1, smooth: true, symbol: 'none', data: curve.occupancy }
        ]
      })
      this.savingChart.setOption({
        color: ['#b8c8dc', '#35b78b'],
        textStyle: { fontSize: 13 },
        tooltip: { trigger: 'axis', textStyle: { fontSize: 13 } },
        legend: { top: 0, textStyle: { fontSize: 12 }, data: ['实施前', '实施后'] },
        grid: { left: 58, right: 18, top: 46, bottom: 54 },
        xAxis: { type: 'category', data: this.dataSet.savings.map((item) => item.strategy), axisLabel: { interval: 0, rotate: 18, fontSize: 12 } },
        yAxis: { type: 'value', axisLabel: { fontSize: 12 }, splitLine: { lineStyle: { color: '#edf1f6' } } },
        series: [
          { name: '实施前', type: 'bar', barMaxWidth: 20, data: this.dataSet.savings.map((item) => item.before) },
          { name: '实施后', type: 'bar', barMaxWidth: 20, data: this.dataSet.savings.map((item) => item.after) }
        ]
      })
    },
    resizeCharts() {
      if (this.lightingChart) this.lightingChart.resize()
      if (this.savingChart) this.savingChart.resize()
    }
  }
}
</script>

<style lang="scss" scoped>
@import './energyCommon.scss';
.lighting-dashboard {
  grid-template-columns: minmax(300px, 0.82fr) minmax(500px, 1.58fr) minmax(340px, 1.05fr);
}
.area-list {
  height: clamp(260px, 34vh, 360px);
  height: clamp(260px, 34dvh, 360px);
}
.metric-value small {
  color: #8a96a9;
  font-size: 10px;
  font-weight: 400;
}
.summary-strip--top {
  margin: 0 0 12px;
}
.chart-legend-note {
  color: #dda032;
  font-size: 11px;
}
.saving-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}
.saving-summary--top {
  margin-bottom: 12px;
}
.saving-summary div {
  padding: 10px;
  background: #f7fafc;
  border-radius: 5px;
}
.saving-summary span,
.saving-summary strong {
  display: block;
}
.saving-summary span {
  color: #909bae;
  font-size: 12px;
}
.saving-summary strong {
  margin-top: 4px;
  color: #26405e;
  font-size: 15px;
}
.savings-cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 9px;
  margin-top: 12px;
}
.saving-card {
  padding: 12px;
  background: #f7fafc;
  border: 1px solid #edf1f5;
  border-radius: 5px;
}
.saving-card span,
.saving-card strong,
.saving-card small {
  display: block;
}
.saving-card span {
  color: #6f7d91;
  font-size: 11px;
}
.saving-card strong {
  margin-top: 5px;
  color: #19a579;
  font-size: 17px;
}
.saving-card small {
  margin-top: 4px;
  color: #909bae;
  font-size: 10px;
}
.form-suffix {
  margin-left: 7px;
  color: #8995a7;
  font-size: 12px;
}
@media (max-width: 1280px) {
  .lighting-dashboard {
    grid-template-columns: minmax(250px, 0.8fr) minmax(400px, 1.3fr);
  }
  .lighting-dashboard > :last-child {
    grid-column: 1/-1;
  }
}
</style>
