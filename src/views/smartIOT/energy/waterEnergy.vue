<template>
  <div class="energy-page water-energy-page">
    <header class="page-header">
      <div>
        <div class="title-row">
          <h2>给排水能耗</h2>
          <span class="live-badge">实时平衡计算</span>
        </div>
        <p class="page-subtitle">分级水计量、水量平衡、跑冒滴漏研判、泵组单耗与用水预算</p>
      </div>
      <div class="header-actions">
        <el-button size="small" icon="el-icon-setting" @click="ruleDialog = true">泄漏规则</el-button><el-button size="small" icon="el-icon-coin" @click="quotaDialog = true">用水定额</el-button
        ><el-button type="primary" size="small" icon="el-icon-warning-outline" @click="activeTab = 'leaks'">泄漏处置台</el-button>
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

    <section class="dashboard-grid water-dashboard">
      <article class="surface">
        <div class="surface-head">
          <div>
            <div class="surface-title"><i class="el-icon-set-up"></i>园区水量平衡</div>
            <div class="surface-subtitle">入口总量与分区表计差额实时核算</div>
          </div>
          <span :class="['balance-badge', dataSet.balance.rate > 4 ? 'warning' : '']">差额 {{ dataSet.balance.rate }}%</span>
        </div>
        <div class="surface-body">
          <div class="balance-flow">
            <div class="balance-source">
              <i class="el-icon-water-cup"></i><strong>{{ dataSet.balance.input }}</strong
              ><span>总进水 m³</span>
            </div>
            <div class="balance-line"></div>
            <div class="balance-branches">
              <div v-for="item in dataSet.balance.branches" :key="item.name" class="balance-branch">
                <span>{{ item.name }}</span
                ><strong>{{ item.value }} m³</strong><small>{{ item.rate }}%</small>
              </div>
            </div>
          </div>
          <div class="balance-result">
            <div>
              <span>分表合计</span><strong>{{ dataSet.balance.metered }} m³</strong>
            </div>
            <i class="el-icon-minus"></i>
            <div>
              <span>未计量 / 差额</span><strong class="warning-text">{{ dataSet.balance.difference }} m³</strong>
            </div>
          </div>
        </div>
      </article>

      <article class="surface">
        <div class="surface-head">
          <div>
            <div class="surface-title"><i class="el-icon-data-line"></i>瞬时流量与泄漏阈值</div>
            <div class="surface-subtitle">重点关注夜间最小流量和持续小流量</div>
          </div>
          <el-tag size="mini" type="warning">夜间异常 18.2 m³/h</el-tag>
        </div>
        <div class="surface-body"><div ref="flowChart" class="chart"></div></div>
      </article>

      <article class="surface">
        <div class="surface-head">
          <div>
            <div class="surface-title"><i class="el-icon-cpu"></i>泵组效率排行</div>
            <div class="surface-subtitle">单位输水电耗 kWh/m³</div>
          </div>
        </div>
        <div class="surface-body">
          <div ref="pumpChart" class="chart mini-chart"></div>
          <div class="pump-highlight">
            <div><span>综合泵效</span><strong>76.0%</strong></div>
            <div><span>综合单耗</span><strong>0.364 kWh/m³</strong></div>
          </div>
        </div>
      </article>
    </section>

    <section class="surface management-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane name="meters"
          ><span slot="label" class="tab-label"
            ><i class="el-icon-odometer"></i>分级水表 <b class="tab-count">{{ dataSet.meters.length }}</b></span
          >
          <div class="toolbar">
            <div class="toolbar-left">
              <el-input v-model.trim="keyword" clearable size="small" prefix-icon="el-icon-search" placeholder="水表 / 楼栋 / 租户 / 用途" style="width: 235px"></el-input
              ><el-select v-model="meterLevel" clearable size="small" placeholder="计量层级" style="width: 135px"
                ><el-option v-for="item in meterLevels" :key="item" :label="item" :value="item"></el-option
              ></el-select>
            </div>
            <div class="toolbar-note"><i class="el-icon-time"></i> 最近采集 2026-07-20 10:52:20</div>
          </div>
          <el-table :data="pagedMeters" size="small" stripe @row-click="openMeter"
            ><el-table-column prop="id" label="水表编号" width="105"></el-table-column><el-table-column prop="name" label="表计名称" min-width="150"></el-table-column
            ><el-table-column prop="level" label="层级" width="100"></el-table-column><el-table-column prop="building" label="楼栋" width="95"></el-table-column
            ><el-table-column prop="tenant" label="租户" width="100"></el-table-column><el-table-column prop="purpose" label="主要用途" width="110"></el-table-column
            ><el-table-column prop="instant" label="瞬时流量(m³/h)" width="125"></el-table-column><el-table-column prop="today" label="今日用水(m³)" width="112"></el-table-column
            ><el-table-column prop="direction" label="方向" width="70"></el-table-column
            ><el-table-column label="状态" width="115"
              ><template slot-scope="scope"
                ><span :class="['status-pill', statusClass(scope.row.status)]">{{ scope.row.status }}</span></template
              ></el-table-column
            ><el-table-column label="操作" width="70" fixed="right"
              ><template slot-scope="scope"><el-button type="text" size="mini" @click.stop="openMeter(scope.row)">追溯</el-button></template></el-table-column
            ></el-table
          >
          <div class="pagination-row"><el-pagination :current-page.sync="meterPage" :page-size="5" layout="total, prev, pager, next" :total="filteredMeters.length"></el-pagination></div>
        </el-tab-pane>

        <el-tab-pane name="leaks"
          ><span slot="label" class="tab-label"
            ><i class="el-icon-warning-outline"></i>泄漏告警 <b class="tab-count">{{ dataSet.leaks.length }}</b></span
          >
          <div class="warning-note"><b>闭环原则：</b>严重泄漏自动生成设备工单；任何关阀动作均须人工确认。涉及消防、应急或重要生产用水时，系统禁止远程关阀，只允许现场核查与派单。</div>
          <el-table :data="dataSet.leaks" size="small" stripe
            ><el-table-column prop="id" label="事件编号" width="137"></el-table-column
            ><el-table-column label="级别" width="80"
              ><template slot-scope="scope"
                ><span :class="['level-pill', scope.row.level === '紧急' ? 'danger' : '']">{{ scope.row.level }}</span></template
              ></el-table-column
            ><el-table-column prop="type" label="研判类型" width="140"></el-table-column><el-table-column prop="area" label="位置" min-width="135"></el-table-column
            ><el-table-column prop="duration" label="持续时间" width="100"></el-table-column><el-table-column prop="estimate" label="影响估算" min-width="135"></el-table-column
            ><el-table-column prop="workOrder" label="关联工单" width="95"></el-table-column
            ><el-table-column label="供水保护" width="90"
              ><template slot-scope="scope"
                ><el-tag v-if="scope.row.protectedSupply" size="mini" type="danger">禁止关阀</el-tag><el-tag v-else size="mini" type="success">可申请</el-tag></template
              ></el-table-column
            ><el-table-column prop="status" label="状态" width="90"></el-table-column
            ><el-table-column label="操作" width="70" fixed="right"
              ><template slot-scope="scope"><el-button type="text" size="mini" @click="openLeak(scope.row)">处置</el-button></template></el-table-column
            ></el-table
          >
        </el-tab-pane>

        <el-tab-pane name="pumps"
          ><span slot="label" class="tab-label"
            ><i class="el-icon-cpu"></i>泵组效率 <b class="tab-count">{{ dataSet.pumps.length }}</b></span
          >
          <div class="toolbar">
            <div class="toolbar-note">同步水表、电表与泵控运行数据，计算每立方米输水电耗并按时段比较</div>
            <el-date-picker v-model="pumpDate" type="date" size="small" value-format="yyyy-MM-dd"></el-date-picker>
          </div>
          <el-table :data="dataSet.pumps" size="small" stripe
            ><el-table-column prop="id" label="泵组编号" width="100"></el-table-column><el-table-column prop="name" label="泵组名称" min-width="145"></el-table-column
            ><el-table-column prop="area" label="泵房" width="110"></el-table-column><el-table-column prop="flow" label="流量(m³/h)" width="105"></el-table-column
            ><el-table-column prop="power" label="功率(kW)" width="95"></el-table-column><el-table-column prop="energyPerM3" label="单耗(kWh/m³)" width="118"></el-table-column
            ><el-table-column prop="runtime" label="运行(h)" width="85"></el-table-column
            ><el-table-column label="效率" width="145"
              ><template slot-scope="scope"
                ><div v-if="typeof scope.row.efficiency === 'number'" class="progress-cell">
                  <el-progress :percentage="scope.row.efficiency" :show-text="false" :stroke-width="7" :color="scope.row.efficiency < 70 ? '#f0a12b' : '#27ad83'"></el-progress
                  ><span>{{ scope.row.efficiency }}%</span>
                </div>
                <span v-else>-</span></template
              ></el-table-column
            ><el-table-column prop="period" label="运行时段" width="110"></el-table-column
            ><el-table-column label="状态" width="100"
              ><template slot-scope="scope"
                ><span :class="['status-pill', statusClass(scope.row.status)]">{{ scope.row.status }}</span></template
              ></el-table-column
            ></el-table
          >
        </el-tab-pane>

        <el-tab-pane name="quota"
          ><span slot="label" class="tab-label"
            ><i class="el-icon-coin"></i>定额预算 <b class="tab-count">{{ dataSet.quotas.length }}</b></span
          >
          <div class="toolbar">
            <div class="toolbar-note">按面积、人数或产值进行用水对标，自动预测月末执行结果</div>
            <el-button type="primary" size="small" @click="quotaDialog = true">新增定额</el-button>
          </div>
          <el-table :data="dataSet.quotas" size="small" stripe
            ><el-table-column prop="object" label="考核对象" min-width="145"></el-table-column><el-table-column prop="dimension" label="对标维度" width="95"></el-table-column
            ><el-table-column prop="quota" label="月度定额(m³)" width="120"></el-table-column><el-table-column prop="actual" label="实际用量(m³)" width="120"></el-table-column
            ><el-table-column label="执行进度" min-width="170"
              ><template slot-scope="scope"
                ><div class="progress-cell">
                  <el-progress :percentage="scope.row.progress" :show-text="false" :stroke-width="7" :color="scope.row.progress > 80 ? '#f0a12b' : '#2f80ed'"></el-progress
                  ><span>{{ scope.row.progress }}%</span>
                </div></template
              ></el-table-column
            ><el-table-column label="预算 / 已用(万元)" width="145"
              ><template slot-scope="scope">{{ scope.row.budget }} / {{ scope.row.spent }}</template></el-table-column
            ><el-table-column prop="forecast" label="月末预测(万元)" width="125"></el-table-column
            ><el-table-column label="状态" width="105"
              ><template slot-scope="scope"
                ><span :class="['status-pill', statusClass(scope.row.status)]">{{ scope.row.status }}</span></template
              ></el-table-column
            ></el-table
          >
        </el-tab-pane>
      </el-tabs>
    </section>

    <el-dialog title="疑似泄漏识别规则" :visible.sync="ruleDialog" width="720px" custom-class="energy-config-dialog"
      ><div class="dialog-intro">规则基于瞬时流量、方向、设备状态、时间窗口与历史基线综合判断。达到严重度时可自动生成设备工单，但不会自动关阀。</div>
      <div class="water-rule-row rule-head"><b>识别类型</b><b>阈值</b><b>持续(分钟)</b><b>级别</b><b>自动工单</b><b>启用</b></div>
      <div v-for="item in ruleForm" :key="item.type" class="water-rule-row">
        <span>{{ item.type }}</span
        ><el-input v-model="item.threshold" size="small"></el-input><el-input-number v-model="item.duration" :min="0" :controls="false" size="small" style="width: 100%"></el-input-number
        ><el-select v-model="item.level" size="small"
          ><el-option label="紧急" value="紧急"></el-option><el-option label="重要" value="重要"></el-option><el-option label="一般" value="一般"></el-option></el-select
        ><el-switch v-model="item.autoOrder"></el-switch><el-switch v-model="item.enabled"></el-switch>
      </div>
      <span slot="footer"><el-button @click="ruleDialog = false">取消</el-button><el-button type="primary" @click="saveRules">保存并生效</el-button></span></el-dialog
    >

    <el-dialog title="用水定额与预算" :visible.sync="quotaDialog" width="600px" custom-class="energy-config-dialog"
      ><div class="dialog-intro">新增定额后，系统按实时用量更新执行进度、月末预测和预算预警。</div>
      <el-form :model="quotaForm" label-width="100px" size="small"
        ><el-form-item label="考核对象"
          ><el-select v-model="quotaForm.object" style="width: 100%"
            ><el-option v-for="item in ['园区总用水', 'A栋办公区', 'B栋生产区', '绿化灌溉']" :key="item" :label="item" :value="item"></el-option></el-select></el-form-item
        ><el-row :gutter="14"
          ><el-col :span="12"
            ><el-form-item label="对标维度"
              ><el-select v-model="quotaForm.dimension" style="width: 100%"
                ><el-option v-for="item in ['面积', '人数', '产值', '运行时长']" :key="item" :label="item" :value="item"></el-option></el-select></el-form-item></el-col
          ><el-col :span="12"
            ><el-form-item label="月度定额"
              ><el-input v-model="quotaForm.quota"><template slot="append">m³</template></el-input></el-form-item
            ></el-col
          ></el-row
        ><el-row :gutter="14"
          ><el-col :span="12"
            ><el-form-item label="费用预算"
              ><el-input v-model="quotaForm.budget"><template slot="append">万元</template></el-input></el-form-item
            ></el-col
          ><el-col :span="12"
            ><el-form-item label="预警阈值"><el-input-number v-model="quotaForm.warning" :min="50" :max="100" style="width: 100%"></el-input-number></el-form-item></el-col></el-row></el-form
      ><span slot="footer"><el-button @click="quotaDialog = false">取消</el-button><el-button type="primary" @click="saveQuota">保存定额</el-button></span></el-dialog
    >

    <el-dialog title="关阀操作人工确认" :visible.sync="valveDialog" width="620px" custom-class="energy-config-dialog" :close-on-click-modal="false"
      ><div v-if="selectedLeak && selectedLeak.protectedSupply" class="protected-block">
        <i class="el-icon-lock"></i><strong>该供水回路受保护，禁止远程关阀</strong>
        <p>可能影响消防、应急或重要生产用水。请生成现场核查工单，由授权人员按审批方案处置。</p>
      </div>
      <template v-else
        ><div class="warning-note"><b>高风险操作：</b>下发前必须核对阀门、影响范围和现场条件；系统只下发已审批动作，并记录操作人和原因。</div>
        <el-form :model="valveForm" label-width="105px" size="small"
          ><el-form-item label="目标阀门"><el-input :value="selectedLeak ? selectedLeak.valve : ''" disabled></el-input></el-form-item
          ><el-form-item label="关阀原因"><el-input v-model="valveForm.reason" type="textarea" :rows="2"></el-input></el-form-item
          ><el-form-item label="审批单号"><el-input v-model="valveForm.approval"></el-input></el-form-item
          ><el-form-item label="安全核验"
            ><el-checkbox-group v-model="valveForm.checks"
              ><el-checkbox label="已核对供水范围"></el-checkbox><el-checkbox label="不影响消防应急"></el-checkbox><el-checkbox label="现场人员已确认"></el-checkbox></el-checkbox-group></el-form-item
          ><el-form-item label="操作方式"
            ><el-radio-group v-model="valveForm.mode"><el-radio label="关闭后保持"></el-radio><el-radio label="关闭30分钟后复开"></el-radio></el-radio-group></el-form-item></el-form></template
      ><span slot="footer"
        ><el-button @click="valveDialog = false">取消</el-button><el-button v-if="selectedLeak && selectedLeak.protectedSupply" type="primary" @click="createProtectedOrder">生成现场核查工单</el-button
        ><el-button v-else type="danger" @click="submitValve">二次确认并下发</el-button></span
      ></el-dialog
    >

    <el-drawer :title="drawerMode === 'meter' ? '水表详情与原始流量' : '泄漏研判与处置'" :visible.sync="drawerVisible" size="490px" custom-class="energy-detail-drawer"
      ><div v-if="drawerRecord" class="drawer-scroll">
        <div class="drawer-hero">
          <div class="drawer-title">{{ drawerMode === 'meter' ? drawerRecord.name : drawerRecord.type }}</div>
          <div class="drawer-id">{{ drawerRecord.id }} · {{ drawerMode === 'meter' ? drawerRecord.rawAt : drawerRecord.time }}</div>
        </div>
        <template v-if="drawerMode === 'meter'"
          ><div class="detail-grid">
            <div class="detail-cell">
              <span>计量层级</span><strong>{{ drawerRecord.level }}</strong>
            </div>
            <div class="detail-cell">
              <span>主要用途</span><strong>{{ drawerRecord.purpose }}</strong>
            </div>
            <div class="detail-cell">
              <span>瞬时流量</span><strong>{{ drawerRecord.instant }} m³/h</strong>
            </div>
            <div class="detail-cell">
              <span>今日累计</span><strong>{{ drawerRecord.today }} m³</strong>
            </div>
            <div class="detail-cell">
              <span>本月累计</span><strong>{{ drawerRecord.month }} m³</strong>
            </div>
            <div class="detail-cell">
              <span>流向 / 状态</span><strong>{{ drawerRecord.direction }} / {{ drawerRecord.status }}</strong>
            </div>
          </div>
          <div class="drawer-section-title">原始数据追溯</div>
          <el-table :data="rawSamples" size="mini" border
            ><el-table-column prop="time" label="采集时间"></el-table-column><el-table-column prop="flow" label="流量(m³/h)"></el-table-column
            ><el-table-column prop="quality" label="质量码"></el-table-column></el-table></template
        ><template v-else
          ><div class="detail-grid">
            <div class="detail-cell">
              <span>位置 / 表计</span><strong>{{ drawerRecord.area }} / {{ drawerRecord.meter }}</strong>
            </div>
            <div class="detail-cell">
              <span>持续时间</span><strong>{{ drawerRecord.duration }}</strong>
            </div>
            <div class="detail-cell">
              <span>影响估算</span><strong>{{ drawerRecord.estimate }}</strong>
            </div>
            <div class="detail-cell">
              <span>关联工单</span><strong>{{ drawerRecord.workOrder }}</strong>
            </div>
          </div>
          <div class="warning-note">{{ drawerRecord.detail }}</div>
          <div v-if="drawerRecord.protectedSupply" class="protected-tip"><i class="el-icon-lock"></i> 该回路涉及重要供水，系统禁止直接关阀。</div>
          <div class="drawer-section-title">研判与处置轨迹</div>
          <div v-for="(trace, index) in drawerRecord.traces" :key="index" class="trace-item">
            <div class="trace-time">{{ trace.time }} · {{ trace.user }}</div>
            <div class="trace-action">{{ trace.action }}</div>
            <div class="trace-remark">{{ trace.remark }}</div>
          </div></template
        >
      </div>
      <div v-if="drawerRecord" class="drawer-actions">
        <el-button size="small" @click="drawerVisible = false">关闭</el-button
        ><template v-if="drawerMode === 'leak'"
          ><el-button size="small" @click="createOrder">生成工单</el-button><el-button type="danger" plain size="small" @click="requestValve(drawerRecord)">申请关阀</el-button
          ><el-button type="primary" size="small" @click="closeLeak">确认研判</el-button></template
        >
      </div></el-drawer
    >
  </div>
</template>

<script>
import { waterEnergy } from '../mock/energyMockData'

export default {
  name: 'SmartIOTWaterEnergy',
  data() {
    return {
      dataSet: waterEnergy,
      activeTab: 'meters',
      keyword: '',
      meterLevel: '',
      meterPage: 1,
      pumpDate: '2026-07-20',
      flowChart: null,
      pumpChart: null,
      ruleDialog: false,
      quotaDialog: false,
      valveDialog: false,
      drawerVisible: false,
      drawerRecord: null,
      drawerMode: 'meter',
      selectedLeak: null,
      ruleForm: waterEnergy.leakRules.map((item) => ({ ...item })),
      quotaForm: { object: '园区总用水', dimension: '面积', quota: '39000', budget: '18.6', warning: 90 },
      valveForm: { reason: '疑似管网泄漏，需隔离排查', approval: 'AP-20260720-018', checks: [], mode: '关闭30分钟后复开' }
    }
  },
  computed: {
    meterLevels() {
      return [...new Set(this.dataSet.meters.map((item) => item.level))]
    },
    filteredMeters() {
      const key = this.keyword.toLowerCase()
      return this.dataSet.meters.filter(
        (item) => (!this.meterLevel || item.level === this.meterLevel) && (!key || [item.id, item.name, item.building, item.tenant, item.purpose].join(' ').toLowerCase().includes(key))
      )
    },
    pagedMeters() {
      const start = (this.meterPage - 1) * 5
      return this.filteredMeters.slice(start, start + 5)
    },
    rawSamples() {
      if (!this.drawerRecord || this.drawerMode !== 'meter') return []
      const flow = Number(this.drawerRecord.instant) || 0
      return ['10:50:00', '10:50:30', '10:51:00', '10:51:30', '10:52:00'].map((time, index) => ({
        time: `2026-07-20 ${time}`,
        flow: Math.max(0, flow + [-0.6, 0.2, -0.1, 0.4, 0][index]).toFixed(1),
        quality: this.drawerRecord.status.includes('离线') ? '估算值' : '有效'
      }))
    }
  },
  watch: {
    keyword() {
      this.meterPage = 1
    },
    meterLevel() {
      this.meterPage = 1
    }
  },
  mounted() {
    this.$nextTick(this.initCharts)
    window.addEventListener('resize', this.resizeCharts)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
    if (this.flowChart) this.flowChart.dispose()
    if (this.pumpChart) this.pumpChart.dispose()
  },
  methods: {
    statusClass(status) {
      if (/离线|紧急|禁止|异常/.test(status)) return 'danger'
      if (/小流量|补水|偏低|待|预警|分析/.test(status)) return 'warning'
      if (/保护|关闭/.test(status)) return 'info'
      return ''
    },
    openMeter(row) {
      this.drawerMode = 'meter'
      this.drawerRecord = row
      this.drawerVisible = true
    },
    openLeak(row) {
      this.drawerMode = 'leak'
      this.drawerRecord = row
      this.drawerVisible = true
    },
    saveRules() {
      this.ruleDialog = false
      this.$message.success('泄漏识别规则已保存，新规则版本开始生效')
    },
    saveQuota() {
      this.quotaDialog = false
      this.$message.success('用水定额已保存，预算预测已更新')
    },
    createOrder() {
      if (this.drawerRecord.workOrder === '-') this.drawerRecord.workOrder = 'WO-8912'
      this.drawerRecord.status = '已派单'
      this.$message.success(`已生成设备工单 ${this.drawerRecord.workOrder}`)
    },
    requestValve(row) {
      this.selectedLeak = row
      this.drawerVisible = false
      this.valveForm.checks = []
      this.valveDialog = true
    },
    createProtectedOrder() {
      if (this.selectedLeak) {
        this.selectedLeak.workOrder = 'WO-8913'
        this.selectedLeak.status = '已派单'
      }
      this.valveDialog = false
      this.$message.success('已生成重要供水现场核查工单，未下发关阀动作')
    },
    submitValve() {
      if (!this.valveForm.reason || !this.valveForm.approval || this.valveForm.checks.length < 3) return this.$message.warning('请填写原因、审批单号并完成全部安全核验')
      this.valveDialog = false
      if (this.selectedLeak) this.selectedLeak.status = '关阀执行中'
      this.$message.success('经二次确认，关阀指令已下发并写入审计')
    },
    closeLeak() {
      this.drawerRecord.status = '已确认'
      this.drawerVisible = false
      this.$message.success('研判结果已确认，相关数据不可删除')
    },
    initCharts() {
      if (!this.$echarts) return
      this.flowChart = this.$echarts.init(this.$refs.flowChart)
      this.pumpChart = this.$echarts.init(this.$refs.pumpChart)
      this.renderCharts()
    },
    renderCharts() {
      const c = this.dataSet.flowCurve
      this.flowChart.setOption({
        color: ['#2587e8', '#9ba9bc', '#ed9d26'],
        tooltip: { trigger: 'axis' },
        legend: { top: 0, data: ['今日流量', '昨日流量', '预警阈值'] },
        grid: { left: 50, right: 18, top: 42, bottom: 28 },
        xAxis: { type: 'category', boundaryGap: false, data: c.hours },
        yAxis: { type: 'value', name: 'm³/h', splitLine: { lineStyle: { color: '#edf1f6' } } },
        series: [
          {
            name: '今日流量',
            type: 'line',
            smooth: true,
            symbol: 'none',
            areaStyle: { color: 'rgba(37,135,232,.1)' },
            data: c.today,
            markArea: { silent: true, itemStyle: { color: 'rgba(237,157,38,.07)' }, data: [[{ xAxis: '00' }, { xAxis: '06' }]] }
          },
          { name: '昨日流量', type: 'line', smooth: true, symbol: 'none', lineStyle: { type: 'dashed' }, data: c.yesterday },
          { name: '预警阈值', type: 'line', smooth: true, symbol: 'none', lineStyle: { type: 'dotted' }, data: c.threshold }
        ]
      })
      const pumps = this.dataSet.pumps.filter((item) => typeof item.efficiency === 'number')
      this.pumpChart.setOption({
        color: ['#31b889'],
        tooltip: { trigger: 'axis' },
        grid: { left: 76, right: 24, top: 12, bottom: 24 },
        xAxis: { type: 'value', max: 100, splitLine: { lineStyle: { color: '#edf1f6' } } },
        yAxis: { type: 'category', data: pumps.map((item) => item.name), axisLabel: { fontSize: 10 } },
        series: [
          {
            type: 'bar',
            barWidth: 13,
            data: pumps.map((item) => ({ value: item.efficiency, itemStyle: { color: item.efficiency < 70 ? '#eda032' : '#31b889' }, label: { show: true, position: 'right', formatter: '{c}%' } }))
          }
        ]
      })
    },
    resizeCharts() {
      if (this.flowChart) this.flowChart.resize()
      if (this.pumpChart) this.pumpChart.resize()
    }
  }
}
</script>

<style lang="scss" scoped>
@import './energyCommon.scss';
.water-dashboard {
  grid-template-columns: minmax(300px, 1fr) minmax(420px, 1.45fr) minmax(280px, 0.92fr);
}
.balance-badge {
  padding: 4px 8px;
  color: #178967;
  background: #eaf8f2;
  border-radius: 11px;
  font-size: 11px;
}
.balance-badge.warning {
  color: #d77b11;
  background: #fff3df;
}
.balance-flow {
  display: flex;
  align-items: center;
  height: 222px;
}
.balance-source {
  flex: 0 0 105px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 105px;
  color: #fff;
  background: linear-gradient(145deg, #2785e4, #18a5bd);
  border-radius: 53px;
  box-shadow: 0 8px 22px rgba(39, 133, 228, 0.2);
}
.balance-source i {
  font-size: 20px;
}
.balance-source strong {
  margin-top: 4px;
  font-size: 22px;
}
.balance-source span {
  font-size: 10px;
}
.balance-line {
  flex: 0 0 26px;
  height: 3px;
  background: #88b8e9;
}
.balance-branches {
  flex: 1;
}
.balance-branch {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto 35px;
  gap: 5px;
  align-items: center;
  margin: 7px 0;
  padding: 7px 8px;
  color: #526078;
  background: #f5f9fd;
  border-left: 3px solid #5ba1e6;
  border-radius: 3px;
  font-size: 10px;
}
.balance-branch strong {
  color: #2f4664;
}
.balance-branch small {
  color: #8a96a8;
  text-align: right;
}
.balance-result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 5px;
}
.balance-result div {
  flex: 1;
}
.balance-result span,
.balance-result strong {
  display: block;
}
.balance-result span {
  color: #929db0;
  font-size: 10px;
}
.balance-result strong {
  margin-top: 3px;
  color: #2b3c55;
  font-size: 14px;
}
.balance-result i {
  color: #a6b1c1;
}
.balance-result .warning-text {
  color: #e18b1d;
}
.pump-highlight {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 8px;
}
.pump-highlight div {
  padding: 9px;
  background: #f7fafc;
  border-radius: 5px;
}
.pump-highlight span,
.pump-highlight strong {
  display: block;
}
.pump-highlight span {
  color: #919caf;
  font-size: 10px;
}
.pump-highlight strong {
  margin-top: 3px;
  color: #268bc0;
  font-size: 13px;
}
.water-rule-row {
  display: grid;
  grid-template-columns: minmax(140px, 1.2fr) 88px 96px 85px 76px 48px;
  gap: 8px;
  align-items: center;
  margin-bottom: 9px;
}
.rule-head {
  color: #8591a4;
  font-size: 11px;
}
.protected-block {
  padding: 28px 24px;
  text-align: center;
  color: #bf3942;
  background: #fff2f3;
  border: 1px solid #ffd5d8;
  border-radius: 7px;
}
.protected-block i {
  display: block;
  margin-bottom: 10px;
  font-size: 30px;
}
.protected-block strong {
  font-size: 15px;
}
.protected-block p {
  margin: 9px auto 0;
  max-width: 430px;
  color: #7e5b60;
  font-size: 12px;
  line-height: 20px;
}
.protected-tip {
  margin-bottom: 14px;
  padding: 10px;
  color: #cc3e47;
  background: #fff0f1;
  border-radius: 5px;
  font-size: 12px;
}
@media (max-width: 1280px) {
  .water-dashboard {
    grid-template-columns: minmax(300px, 0.9fr) minmax(420px, 1.3fr);
  }
  .water-dashboard > :last-child {
    grid-column: 1/-1;
  }
}
</style>
