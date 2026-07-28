<template>
  <div class="energy-page power-energy-page">
    <header class="page-header">
      <div>
        <div class="title-row">
          <h2>高低压配电能耗</h2>
          <span class="live-badge">实时采集中</span>
        </div>
        <p class="page-subtitle">分级计量、负荷分析、用能异常、定额预算与原始数据追溯</p>
      </div>
      <div class="header-actions">
        <el-button size="small" icon="el-icon-setting" @click="ruleDialog = true">异常规则</el-button>
        <el-button size="small" icon="el-icon-coin" @click="openQuotaDialog">定额预算</el-button>
        <el-button type="primary" size="small" icon="el-icon-document" @click="reportDialog = true">生成报表</el-button>
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

    <iot-workspace-nav v-model="activeTab" :items="workspaceNav" aria-label="配电能耗业务工作区" @change="handleWorkspaceChange" />

    <section v-show="activeTab === 'overview'" ref="overviewWorkspace" class="dashboard-grid" tabindex="-1">
      <article class="surface">
        <div class="surface-head">
          <div>
            <div class="surface-title"><i class="el-icon-office-building"></i>分级计量下钻</div>
            <div class="surface-subtitle">园区 → 变压器 → 楼栋 → 表计</div>
          </div>
          <el-button v-if="breadcrumbs.length > 1" type="text" size="mini" @click="goUp">返回上级</el-button>
        </div>
        <div class="surface-body">
          <el-breadcrumb separator-class="el-icon-arrow-right" class="meter-breadcrumb">
            <el-breadcrumb-item v-for="node in breadcrumbs" :key="node.id">{{ node.name }}</el-breadcrumb-item>
          </el-breadcrumb>
          <div class="summary-strip summary-strip--top">
            <div class="summary-box">
              <span>当前节点电量</span><strong>{{ formatNumber(currentNode.kwh) }} kWh</strong>
            </div>
            <div class="summary-box">
              <span>当前实时功率</span><strong>{{ currentNode.power }} kW</strong>
            </div>
          </div>
          <div class="selector-list">
            <div v-for="node in currentChildren" :key="node.id" tabindex="0" class="selector-item" @click="drillNode(node)" @keyup.enter="drillNode(node)">
              <div>
                <div class="item-name"><span :class="['status-dot', node.status === '正常' ? '' : 'warning']"></span>{{ node.name }}</div>
                <div class="item-meta">{{ node.level }} · {{ node.status }} · {{ node.power }} kW</div>
              </div>
              <div class="metric-value">{{ formatNumber(node.kwh) }}<small> kWh</small></div>
            </div>
            <div v-if="!currentChildren.length" class="empty-note">已到计量末级，可在下方查看对应表计原始数据</div>
          </div>
        </div>
      </article>

      <article class="surface">
        <div class="surface-head">
          <div>
            <div class="surface-title"><i class="el-icon-data-line"></i>{{ curveTitle }}</div>
            <div class="surface-subtitle">{{ curveSubtitle }}</div>
          </div>
          <el-radio-group v-model="curveRange" size="mini">
            <el-radio-button label="日"></el-radio-button>
            <el-radio-button label="月"></el-radio-button>
          </el-radio-group>
        </div>
        <div class="surface-body"><div ref="loadChart" class="chart"></div></div>
      </article>

      <article class="surface">
        <div class="surface-head">
          <div>
            <div class="surface-title"><i class="el-icon-share"></i>用电流向与变压器</div>
            <div class="surface-subtitle">流向单位 kWh，点击节点可辅助定位</div>
          </div>
        </div>
        <div class="surface-body">
          <div class="transformer-grid transformer-grid--top">
            <div v-for="item in dataSet.transformers" :key="item.name" class="transformer-card">
              <div class="transformer-top">
                <strong>{{ item.name }}</strong
                ><span :class="['status-dot', item.status === '正常' ? '' : 'warning']"></span>
              </div>
              <el-progress :percentage="item.load" :stroke-width="7" :color="item.load > 70 ? '#f0a12b' : '#2f80ed'"></el-progress>
              <div class="transformer-meta">损耗 {{ item.loss }}% · 不平衡 {{ item.imbalance }}%</div>
            </div>
          </div>
          <div ref="flowChart" class="chart mini-chart"></div>
        </div>
      </article>
    </section>

    <section v-show="activeTab !== 'overview'" ref="detailWorkspace" class="surface management-card workspace-detail" tabindex="-1">
      <iot-workspace-header :item="currentWorkspace" updated-at="10:52:18" @back="openWorkspace('overview')" />
      <el-tabs v-model="activeTab" class="workspace-tabs">
        <el-tab-pane name="meters">
          <span slot="label" class="tab-label"
            ><i class="el-icon-odometer"></i>分级表计 <b class="tab-count">{{ dataSet.meters.length }}</b></span
          >
          <div class="toolbar">
            <div class="toolbar-left">
              <el-input v-model.trim="meterKeyword" size="small" clearable prefix-icon="el-icon-search" placeholder="表计 / 楼栋 / 租户" style="width: 220px"></el-input>
              <el-select v-model="meterLevel" size="small" clearable placeholder="计量层级" style="width: 130px">
                <el-option v-for="item in meterLevels" :key="item" :label="item" :value="item"></el-option>
              </el-select>
              <el-select v-model="meterStatus" size="small" clearable placeholder="设备状态" style="width: 130px">
                <el-option v-for="item in meterStatuses" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </div>
            <div class="toolbar-note"><i class="el-icon-time"></i> 最近采集 2026-07-20 10:52:18</div>
          </div>
          <el-table :data="pagedMeters" size="small" stripe @row-click="openMeter">
            <el-table-column prop="id" label="表计编号" width="110"></el-table-column>
            <el-table-column prop="name" label="表计名称" min-width="155"></el-table-column>
            <el-table-column prop="level" label="层级" width="90"></el-table-column>
            <el-table-column prop="building" label="楼栋" width="90"></el-table-column>
            <el-table-column prop="tenant" label="租户 / 区域" min-width="110"></el-table-column>
            <el-table-column prop="kwh" label="今日电量(kWh)" width="112"></el-table-column>
            <el-table-column prop="power" label="功率(kW)" width="90"></el-table-column>
            <el-table-column prop="pf" label="功率因数" width="88"></el-table-column>
            <el-table-column label="状态" width="118">
              <template slot-scope="scope"
                ><span :class="['status-pill', statusClass(scope.row.status)]">{{ scope.row.status }}</span></template
              >
            </el-table-column>
            <el-table-column label="操作" width="86" fixed="right">
              <template slot-scope="scope"><el-button type="text" size="mini" @click.stop="openMeter(scope.row)">下钻 / 追溯</el-button></template>
            </el-table-column>
          </el-table>
          <div class="pagination-row"><el-pagination :current-page.sync="meterPage" :page-size="5" layout="total, prev, pager, next" :total="filteredMeters.length"></el-pagination></div>
        </el-tab-pane>

        <el-tab-pane name="anomalies">
          <span slot="label" class="tab-label"
            ><i class="el-icon-warning-outline"></i>异常用能 <b class="tab-count">{{ dataSet.anomalies.length }}</b></span
          >
          <div class="warning-note">覆盖线路损耗、三相不平衡、功率因数偏低、负荷突变、长期零值、计量倒退与表计离线；所有处置保留分析轨迹。</div>
          <el-table :data="dataSet.anomalies" size="small" stripe>
            <el-table-column prop="id" label="事件编号" width="132"></el-table-column>
            <el-table-column label="级别" width="80"
              ><template slot-scope="scope"
                ><span :class="['level-pill', scope.row.level === '紧急' ? 'danger' : scope.row.level === '关注' ? 'info' : '']">{{ scope.row.level }}</span></template
              ></el-table-column
            >
            <el-table-column prop="type" label="异常类型" width="135"></el-table-column>
            <el-table-column prop="meter" label="关联表计" width="105"></el-table-column>
            <el-table-column prop="detail" label="异常说明" min-width="240" show-overflow-tooltip></el-table-column>
            <el-table-column prop="time" label="发生时间" width="165"></el-table-column>
            <el-table-column prop="assignee" label="处理人" width="105"></el-table-column>
            <el-table-column label="状态" width="92"
              ><template slot-scope="scope"
                ><span :class="['status-pill', statusClass(scope.row.status)]">{{ scope.row.status }}</span></template
              ></el-table-column
            >
            <el-table-column label="操作" width="70" fixed="right"
              ><template slot-scope="scope"><el-button type="text" size="mini" @click="openAnomaly(scope.row)">处置</el-button></template></el-table-column
            >
          </el-table>
        </el-tab-pane>

        <el-tab-pane name="quota">
          <span slot="label" class="tab-label"
            ><i class="el-icon-coin"></i>定额预算与对标 <b class="tab-count">{{ dataSet.quotas.length }}</b></span
          >
          <div class="toolbar">
            <div class="toolbar-note">支持按面积、人数、产值或运行时长计算单位能耗</div>
            <el-button type="primary" size="small" @click="openQuotaDialog">新增定额</el-button>
          </div>
          <el-table :data="dataSet.quotas" size="small" stripe>
            <el-table-column prop="object" label="考核对象" min-width="145"></el-table-column>
            <el-table-column prop="dimension" label="对标维度" width="100"></el-table-column>
            <el-table-column prop="quota" label="月度定额" width="105"></el-table-column>
            <el-table-column label="执行进度" min-width="160"
              ><template slot-scope="scope"
                ><div class="progress-cell">
                  <el-progress :percentage="scope.row.progress" :show-text="false" :stroke-width="7" :color="scope.row.progress >= 80 ? '#f0a12b' : '#2f80ed'"></el-progress
                  ><span>{{ scope.row.progress }}%</span>
                </div></template
              ></el-table-column
            >
            <el-table-column label="预算 / 已用(万元)" width="145"
              ><template slot-scope="scope">{{ scope.row.budget }} / {{ scope.row.spent }}</template></el-table-column
            >
            <el-table-column prop="forecast" label="月末预测(万元)" width="125"></el-table-column>
            <el-table-column label="状态" width="105"
              ><template slot-scope="scope"
                ><span :class="['status-pill', statusClass(scope.row.status)]">{{ scope.row.status }}</span></template
              ></el-table-column
            >
          </el-table>
          <div class="benchmark-list">
            <div v-for="item in dataSet.benchmarks" :key="item.name" class="benchmark-item">
              <strong>{{ item.name }}</strong
              ><span>{{ item.value }} {{ item.unit }}</span
              ><small>同类均值 {{ item.average }} · 排名 {{ item.rank }}</small>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="reports">
          <span slot="label" class="tab-label"
            ><i class="el-icon-document"></i>用能报表 <b class="tab-count">{{ dataSet.reports.length }}</b></span
          >
          <div class="toolbar">
            <div class="toolbar-note">日、月、季、年报表均可追溯到表计原始采集值</div>
            <el-button type="primary" size="small" @click="reportDialog = true">生成报表</el-button>
          </div>
          <el-table :data="dataSet.reports" size="small" stripe>
            <el-table-column prop="id" label="报表编号" width="135"></el-table-column>
            <el-table-column prop="period" label="周期" width="75"></el-table-column>
            <el-table-column prop="range" label="统计范围" min-width="145"></el-table-column>
            <el-table-column prop="energy" label="用电(kWh)" width="110"></el-table-column>
            <el-table-column prop="cost" label="费用(万元)" width="105"></el-table-column>
            <el-table-column prop="peakRate" label="峰段占比(%)" width="110"></el-table-column>
            <el-table-column prop="anomaly" label="异常数" width="80"></el-table-column>
            <el-table-column prop="saving" label="节能量(kWh)" width="115"></el-table-column>
            <el-table-column prop="status" label="状态" width="100"></el-table-column>
            <el-table-column label="操作" width="130"
              ><template
                ><el-button type="text" size="mini" @click="simulateExport">预览</el-button><el-button type="text" size="mini" @click="simulateExport">导出</el-button></template
              ></el-table-column
            >
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </section>

    <el-dialog title="异常分析规则" :visible.sync="ruleDialog" width="680px" custom-class="energy-config-dialog">
      <div class="dialog-intro">规则按表计实时数据执行，达到阈值和持续时间后生成事件；原始点位值与规则版本一并存档。</div>
      <div class="rule-row rule-head"><b>异常类型</b><b>阈值</b><b>持续(分钟)</b><b>级别</b><b>启用</b></div>
      <div v-for="rule in ruleForm" :key="rule.type" class="rule-row">
        <span>{{ rule.type }}</span>
        <el-input v-model="rule.threshold" size="small"></el-input>
        <el-input-number v-model="rule.duration" :min="0" :controls="false" size="small" style="width: 100%"></el-input-number>
        <el-select v-model="rule.level" size="small"
          ><el-option label="紧急" value="紧急"></el-option><el-option label="一般" value="一般"></el-option><el-option label="关注" value="关注"></el-option
        ></el-select>
        <el-switch v-model="rule.enabled"></el-switch>
      </div>
      <span slot="footer"><el-button @click="ruleDialog = false">取消</el-button><el-button type="primary" @click="saveRules">保存并生效</el-button></span>
    </el-dialog>

    <el-dialog title="用电定额与费用预算" :visible.sync="quotaDialog" width="620px" custom-class="energy-config-dialog">
      <div class="dialog-intro">选择核算对象和对标维度，系统将结合历史负荷自动计算月末预测并提前触发预算预警。</div>
      <el-form :model="quotaForm" label-width="105px" size="small">
        <el-form-item label="核算对象"><el-cascader v-model="quotaForm.object" :options="quotaOptions" style="width: 100%"></el-cascader></el-form-item>
        <el-row :gutter="14"
          ><el-col :span="12"
            ><el-form-item label="对标维度"
              ><el-select v-model="quotaForm.dimension" style="width: 100%"
                ><el-option v-for="item in ['面积', '人数', '产值', '运行时长']" :key="item" :label="item" :value="item"></el-option></el-select></el-form-item></el-col
          ><el-col :span="12"
            ><el-form-item label="统计周期"
              ><el-select v-model="quotaForm.period" style="width: 100%"
                ><el-option label="月度" value="月度"></el-option><el-option label="季度" value="季度"></el-option><el-option label="年度" value="年度"></el-option></el-select></el-form-item></el-col
        ></el-row>
        <el-row :gutter="14"
          ><el-col :span="12"
            ><el-form-item label="能耗定额"
              ><el-input v-model="quotaForm.quota"><template slot="append">kWh</template></el-input></el-form-item
            ></el-col
          ><el-col :span="12"
            ><el-form-item label="费用预算"
              ><el-input v-model="quotaForm.budget"><template slot="append">万元</template></el-input></el-form-item
            ></el-col
          ></el-row
        >
        <el-form-item label="预警阈值"><el-slider v-model="quotaForm.warning" :marks="{ 80: '80%', 90: '90%', 100: '100%' }"></el-slider></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="quotaDialog = false">取消</el-button><el-button type="primary" @click="saveQuota">保存定额</el-button></span>
    </el-dialog>

    <el-dialog title="生成用电与费用报表" :visible.sync="reportDialog" width="560px" custom-class="energy-config-dialog">
      <el-form :model="reportForm" label-width="95px" size="small">
        <el-form-item label="报表周期"
          ><el-radio-group v-model="reportForm.period"
            ><el-radio-button label="日"></el-radio-button><el-radio-button label="月"></el-radio-button><el-radio-button label="季"></el-radio-button
            ><el-radio-button label="年"></el-radio-button></el-radio-group
        ></el-form-item>
        <el-form-item label="统计时间"><el-date-picker v-model="reportForm.date" type="date" value-format="yyyy-MM-dd" style="width: 100%"></el-date-picker></el-form-item>
        <el-form-item label="统计对象"
          ><el-select v-model="reportForm.scope" style="width: 100%"
            ><el-option label="全园区" value="全园区"></el-option><el-option label="按楼栋分项" value="按楼栋分项"></el-option><el-option label="按租户分项" value="按租户分项"></el-option></el-select
        ></el-form-item>
        <el-form-item label="报表内容"
          ><el-checkbox-group v-model="reportForm.contents"
            ><el-checkbox label="分项占比"></el-checkbox><el-checkbox label="异常用能"></el-checkbox><el-checkbox label="节能效果"></el-checkbox
            ><el-checkbox label="原始数据索引"></el-checkbox></el-checkbox-group
        ></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="reportDialog = false">取消</el-button><el-button type="primary" @click="createReport">生成报表</el-button></span>
    </el-dialog>

    <el-drawer :title="drawerMode === 'meter' ? '表计详情与原始数据' : '异常分析与处置'" :visible.sync="drawerVisible" size="480px" custom-class="energy-detail-drawer">
      <div v-if="drawerRecord" class="drawer-scroll">
        <div class="drawer-hero">
          <div class="drawer-title">{{ drawerMode === 'meter' ? drawerRecord.name : drawerRecord.type }}</div>
          <div class="drawer-id">{{ drawerRecord.id }} · {{ drawerMode === 'meter' ? drawerRecord.rawAt : drawerRecord.time }}</div>
        </div>
        <template v-if="drawerMode === 'meter'">
          <div class="detail-grid">
            <div class="detail-cell">
              <span>电压</span><strong>{{ drawerRecord.voltage }}</strong>
            </div>
            <div class="detail-cell">
              <span>电流</span><strong>{{ drawerRecord.current }}</strong>
            </div>
            <div class="detail-cell">
              <span>实时功率</span><strong>{{ drawerRecord.power }} kW</strong>
            </div>
            <div class="detail-cell">
              <span>最大需量</span><strong>{{ drawerRecord.demand }} kW</strong>
            </div>
            <div class="detail-cell">
              <span>功率因数</span><strong>{{ drawerRecord.pf }}</strong>
            </div>
            <div class="detail-cell">
              <span>采集状态</span><strong>{{ drawerRecord.status }}</strong>
            </div>
            <div class="detail-cell">
              <span>峰段电量</span><strong>{{ drawerRecord.peak }} kWh</strong>
            </div>
            <div class="detail-cell">
              <span>平 / 谷电量</span><strong>{{ drawerRecord.flat }} / {{ drawerRecord.valley }} kWh</strong>
            </div>
          </div>
          <div class="drawer-section-title">原始数据追溯</div>
          <el-table :data="rawSamples" size="mini" border
            ><el-table-column prop="time" label="采集时间"></el-table-column><el-table-column prop="value" label="功率(kW)"></el-table-column
            ><el-table-column prop="quality" label="质量码"></el-table-column
          ></el-table>
        </template>
        <template v-else>
          <div class="detail-grid">
            <div class="detail-cell">
              <span>关联表计</span><strong>{{ drawerRecord.meter }}</strong>
            </div>
            <div class="detail-cell">
              <span>告警级别</span><strong>{{ drawerRecord.level }}</strong>
            </div>
            <div class="detail-cell">
              <span>当前状态</span><strong>{{ drawerRecord.status }}</strong>
            </div>
            <div class="detail-cell">
              <span>处置人</span><strong>{{ drawerRecord.assignee }}</strong>
            </div>
          </div>
          <div class="drawer-section-title">分析结论</div>
          <div class="warning-note">{{ drawerRecord.detail }}</div>
          <div class="drawer-section-title">处置轨迹</div>
          <div v-for="(trace, index) in drawerRecord.traces" :key="index" class="trace-item">
            <div class="trace-time">{{ trace.time }} · {{ trace.user }}</div>
            <div class="trace-action">{{ trace.action }}</div>
            <div class="trace-remark">{{ trace.remark }}</div>
          </div>
        </template>
      </div>
      <div v-if="drawerRecord" class="drawer-actions">
        <el-button size="small" @click="drawerVisible = false">关闭</el-button>
        <template v-if="drawerMode === 'anomaly'"
          ><el-button size="small" @click="assignAnomaly">派发核查</el-button><el-button type="primary" size="small" @click="confirmAnomaly">确认并归档</el-button></template
        >
        <el-button v-else type="primary" size="small" @click="simulateExport">导出原始数据</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import IotWorkspaceHeader from '../components/IotWorkspaceHeader.vue'
import IotWorkspaceNav from '../components/IotWorkspaceNav.vue'
import { powerEnergy } from '../mock/energyMockData'

export default {
  name: 'SmartIOTPowerEnergy',
  components: { IotWorkspaceHeader, IotWorkspaceNav },
  data() {
    return {
      dataSet: powerEnergy,
      currentNodeId: 'PARK',
      curveRange: '日',
      activeTab: 'overview',
      meterKeyword: '',
      meterLevel: '',
      meterStatus: '',
      meterPage: 1,
      loadChart: null,
      flowChart: null,
      ruleDialog: false,
      quotaDialog: false,
      reportDialog: false,
      drawerVisible: false,
      drawerMode: 'meter',
      drawerRecord: null,
      ruleForm: powerEnergy.anomalyRules.map((item) => ({ ...item })),
      quotaForm: { object: ['全园区'], dimension: '面积', period: '月度', quota: '420000', budget: '120', warning: 90 },
      reportForm: { period: '月', date: '2026-07-20', scope: '全园区', contents: ['分项占比', '异常用能', '节能效果', '原始数据索引'] },
      quotaOptions: [
        { value: '全园区', label: '全园区' },
        { value: 'A栋', label: 'A栋研发楼', children: [{ value: '2F', label: '2F租户甲' }] },
        { value: 'B栋', label: 'B栋生产楼' }
      ]
    }
  },
  computed: {
    workspaceNav() {
      return [
        { key: 'overview', title: '用电总览', description: '流向、负荷与需量', detail: '查看分级计量、24小时负荷、最大需量和变压器运行态势。', icon: 'el-icon-data-analysis', count: null },
        { key: 'meters', title: '分级表计', description: '回路、表计与原始值', detail: '按园区、楼栋、租户、变压器和馈线下钻并追溯原始数据。', icon: 'el-icon-odometer', count: this.dataSet.meters.length },
        { key: 'anomalies', title: '异常用能', description: '分析、派单与归档', detail: '集中研判损耗、不平衡、低功率因数、负荷突变和表计离线。', icon: 'el-icon-warning-outline', count: this.dataSet.anomalies.length, danger: this.dataSet.anomalies.some((item) => item.status !== '已归档') },
        { key: 'quota', title: '定额预算', description: '预测、对标与预警', detail: '按面积、人数、产值或运行时长管理定额、预算和同类对标。', icon: 'el-icon-coin', count: this.dataSet.quotas.length },
        { key: 'reports', title: '用能报表', description: '周期报表与追溯', detail: '生成日、月、季、年用电及费用报表并追溯表计原始数据。', icon: 'el-icon-document', count: this.dataSet.reports.length }
      ]
    },
    currentWorkspace() {
      return this.workspaceNav.find((item) => item.key === this.activeTab) || this.workspaceNav[0]
    },
    currentNode() {
      return this.dataSet.hierarchy.find((item) => item.id === this.currentNodeId) || this.dataSet.hierarchy[0]
    },
    currentChildren() {
      return this.dataSet.hierarchy.filter((item) => item.parentId === this.currentNodeId)
    },
    curveTitle() {
      return this.curveRange === '日' ? '24小时负荷曲线' : '7月逐日用电量'
    },
    monthActualTotal() {
      return this.dataSet.monthlyLoadCurve.current.reduce((total, value) => total + (typeof value === 'number' ? value : 0), 0)
    },
    monthForecastTotal() {
      return this.dataSet.monthlyLoadCurve.forecast.reduce((total, value) => total + value, 0)
    },
    curveSubtitle() {
      if (this.curveRange === '日') return '最大需量 2,450 kW · 合同需量 2,800 kW'
      return `截至 07-20 累计 ${this.formatNumber(this.monthActualTotal)} kWh · 月末预测 ${this.formatNumber(this.monthForecastTotal)} kWh`
    },
    breadcrumbs() {
      const result = []
      let node = this.currentNode
      while (node) {
        result.unshift(node)
        node = this.dataSet.hierarchy.find((item) => item.id === node.parentId)
      }
      return result
    },
    meterLevels() {
      return [...new Set(this.dataSet.meters.map((item) => item.level))]
    },
    meterStatuses() {
      return [...new Set(this.dataSet.meters.map((item) => item.status))]
    },
    filteredMeters() {
      const keyword = this.meterKeyword.toLowerCase()
      return this.dataSet.meters.filter((item) => {
        const matchKeyword = !keyword || [item.id, item.name, item.building, item.tenant].join(' ').toLowerCase().includes(keyword)
        return matchKeyword && (!this.meterLevel || item.level === this.meterLevel) && (!this.meterStatus || item.status === this.meterStatus)
      })
    },
    pagedMeters() {
      const start = (this.meterPage - 1) * 5
      return this.filteredMeters.slice(start, start + 5)
    },
    rawSamples() {
      if (!this.drawerRecord || this.drawerMode !== 'meter') return []
      const power = Number(this.drawerRecord.power) || 0
      return ['10:50:00', '10:50:30', '10:51:00', '10:51:30', '10:52:00'].map((time, index) => ({
        time: `2026-07-20 ${time}`,
        value: Math.max(0, power + [-8, 3, -2, 5, 0][index]),
        quality: this.drawerRecord.status.includes('离线') ? '估算值' : '有效'
      }))
    }
  },
  watch: {
    meterKeyword() {
      this.meterPage = 1
    },
    meterLevel() {
      this.meterPage = 1
    },
    meterStatus() {
      this.meterPage = 1
    },
    curveRange() {
      this.renderLoadChart()
    }
  },
  mounted() {
    this.$nextTick(this.initCharts)
    window.addEventListener('resize', this.resizeCharts)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
    if (this.loadChart) this.loadChart.dispose()
    if (this.flowChart) this.flowChart.dispose()
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
    formatNumber(value) {
      return Number(value || 0).toLocaleString('zh-CN')
    },
    statusClass(status) {
      if (/离线|倒退|紧急|零值|未/.test(status)) return 'danger'
      if (/异常|突增|偏低|待|预警|分析/.test(status)) return 'warning'
      if (/关闭|归档/.test(status)) return 'info'
      return ''
    },
    drillNode(node) {
      this.currentNodeId = node.id
    },
    goUp() {
      if (this.currentNode.parentId) this.currentNodeId = this.currentNode.parentId
    },
    openMeter(row) {
      this.drawerMode = 'meter'
      this.drawerRecord = row
      this.drawerVisible = true
    },
    openAnomaly(row) {
      this.drawerMode = 'anomaly'
      this.drawerRecord = row
      this.drawerVisible = true
    },
    openQuotaDialog() {
      this.quotaDialog = true
    },
    saveRules() {
      this.ruleDialog = false
      this.$message.success('异常规则已保存并生成新版本')
    },
    saveQuota() {
      this.quotaDialog = false
      this.$message.success('定额与预算已保存，月末预测已重新计算')
    },
    createReport() {
      this.reportDialog = false
      this.openWorkspace('reports')
      this.$message.success('报表生成任务已完成，可在报表台账预览')
    },
    simulateExport() {
      this.$message.success('仿真环境：导出任务已加入下载队列')
    },
    assignAnomaly() {
      this.drawerRecord.status = '已派单'
      this.drawerRecord.assignee = '能源运维组'
      this.$message.success('已派发至能源运维组')
    },
    confirmAnomaly() {
      this.drawerRecord.status = '已归档'
      this.drawerVisible = false
      this.$message.success('异常已确认，分析结论和原始数据已归档')
    },
    initCharts() {
      if (!this.$echarts) return
      if (this.$refs.loadChart) this.loadChart = this.$echarts.init(this.$refs.loadChart)
      if (this.$refs.flowChart) this.flowChart = this.$echarts.init(this.$refs.flowChart)
      this.renderLoadChart()
      this.renderFlowChart()
    },
    renderLoadChart() {
      if (!this.loadChart) return
      const isMonth = this.curveRange === '月'
      const source = isMonth ? this.dataSet.monthlyLoadCurve : this.dataSet.loadCurve
      const categories = isMonth ? source.days : source.hours
      const current = isMonth ? source.current : source.today
      const comparison = isMonth ? source.previous : source.yesterday
      const forecast = source.forecast
      const seriesNames = isMonth ? ['本月用电', '上月同期', '预测用电'] : ['本期负荷', '同期负荷', '预测负荷']
      this.loadChart.setOption({
        color: ['#2f80ed', '#9aa8bc', '#31b889'],
        textStyle: { fontSize: 13 },
        tooltip: { trigger: 'axis', textStyle: { fontSize: 13 } },
        legend: { top: 0, textStyle: { fontSize: 12 }, data: seriesNames },
        grid: { left: 58, right: 22, top: 46, bottom: 32 },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: categories,
          axisLabel: {
            fontSize: 12,
            interval: isMonth ? 4 : 0,
            formatter: isMonth ? '{value}日' : '{value}'
          },
          axisLine: { lineStyle: { color: '#cfd7e3' } }
        },
        yAxis: { type: 'value', name: isMonth ? 'kWh' : 'kW', axisLabel: { fontSize: 12 }, nameTextStyle: { fontSize: 12 }, splitLine: { lineStyle: { color: '#edf1f6' } } },
        series: [
          {
            name: seriesNames[0],
            type: 'line',
            smooth: true,
            symbol: 'none',
            connectNulls: false,
            data: current,
            areaStyle: { color: 'rgba(47,128,237,.10)' },
            markPoint: { data: [{ type: 'max', name: isMonth ? '最高日' : '最大值' }] }
          },
          { name: seriesNames[1], type: 'line', smooth: true, symbol: 'none', lineStyle: { type: 'dashed' }, data: comparison },
          { name: seriesNames[2], type: 'line', smooth: true, symbol: 'none', data: forecast }
        ]
      }, true)
    },
    renderFlowChart() {
      if (!this.flowChart) return
      this.flowChart.setOption({
        textStyle: { fontSize: 13 },
        tooltip: { trigger: 'item', triggerOn: 'mousemove', textStyle: { fontSize: 13 } },
        series: [
          {
            type: 'sankey',
            left: 8,
            right: 86,
            top: 12,
            bottom: 12,
            nodeWidth: 10,
            nodeGap: 10,
            draggable: false,
            emphasis: { focus: 'adjacency' },
            data: this.dataSet.flow.nodes,
            links: this.dataSet.flow.links,
            label: { fontSize: 12, color: '#526078', distance: 6 },
            lineStyle: { color: 'gradient', opacity: 0.35 }
          }
        ]
      })
    },
    resizeCharts() {
      if (this.loadChart) this.loadChart.resize()
      if (this.flowChart) this.flowChart.resize()
    }
  }
}
</script>

<style lang="scss" scoped>
@import './energyCommon.scss';

.meter-breadcrumb {
  margin-bottom: 12px;
  font-size: 11px;
}
.metric-value small {
  color: #8a96a9;
  font-size: 10px;
  font-weight: 400;
}
.summary-strip--top {
  margin: 0 0 12px;
}
.transformer-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.transformer-grid--top {
  margin-bottom: 12px;
}
.transformer-card {
  padding: 9px;
  background: #f8fafc;
  border-radius: 5px;
}
.transformer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 7px;
  color: #304059;
  font-size: 12px;
}
.transformer-meta {
  margin-top: 5px;
  color: #8a96a9;
  font-size: 10px;
}
.rule-head {
  color: #8591a4;
  font-size: 11px;
}
.benchmark-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 9px;
  margin-top: 12px;
}
.benchmark-item {
  padding: 11px;
  background: #f7f9fc;
  border: 1px solid #edf1f5;
  border-radius: 5px;
}
.benchmark-item strong,
.benchmark-item span,
.benchmark-item small {
  display: block;
}
.benchmark-item strong {
  color: #2d3c54;
  font-size: 12px;
}
.benchmark-item span {
  margin-top: 7px;
  color: #2f80ed;
  font-size: 16px;
  font-weight: 700;
}
.benchmark-item small {
  margin-top: 4px;
  color: #8b97a9;
  font-size: 10px;
}
</style>
