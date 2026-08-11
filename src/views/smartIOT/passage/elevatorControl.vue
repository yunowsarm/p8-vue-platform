<template>
  <div class="passage-page elevator-page">
    <header class="page-header">
      <div>
        <div class="title-line">
          <h2>智能梯控</h2>
          <span class="live-badge"><i></i> 控制器实时在线</span>
        </div>
        <p>统一查看电梯运行、楼层位置、故障告警、每日运行与维保状态</p>
      </div>
      <div class="header-actions">
        <el-button size="small" icon="el-icon-setting" @click="$message.info('运行策略配置已进入接口联调清单')">运行策略</el-button>
        <el-button size="small" icon="el-icon-refresh" @click="refreshElevators">同步状态</el-button>
        <el-button v-if="canCreateElevator" type="primary" size="small" icon="el-icon-plus" @click="openCreateDialog">新增电梯</el-button>
      </div>
    </header>

    <section class="kpi-grid">
      <article v-for="item in kpis" :key="item.title" class="kpi-card" :class="'is-' + item.type">
        <div class="kpi-icon"><i :class="item.icon"></i></div>
        <div class="kpi-content">
          <span class="kpi-title">{{ item.title }}</span>
          <div class="kpi-number">
            {{ item.value }}<small>{{ item.unit }}</small>
          </div>
          <span class="kpi-sub">{{ item.sub }}</span>
        </div>
      </article>
    </section>

    <iot-workspace-nav v-model="activeWorkspace" :items="workspaceNav" aria-label="智能梯控业务工作区" @change="handleWorkspaceChange" />

    <section v-if="activeWorkspace === 'overview'" ref="workspaceContent" class="surface elevator-overview" tabindex="-1">
      <div class="surface-head elevator-head">
        <div>
          <div class="surface-title"><i class="el-icon-office-building"></i> 电梯实时总览</div>
          <span class="surface-subtitle">一梯一卡；点击卡片查看设备档案、今日运行曲线和近 7 日日报</span>
        </div>
        <div class="surface-meta">
          <span><i class="dot online"></i>运行 {{ runningCount }}</span>
          <span><i class="dot warning"></i>异常 {{ abnormalCount }}</span>
          <span>更新 {{ updatedAt }}</span>
        </div>
      </div>

      <div class="elevator-toolbar">
        <div class="filter-group">
          <el-input v-model.trim="keyword" size="small" clearable prefix-icon="el-icon-search" placeholder="搜索电梯名称 / 编号 / 楼栋" @input="resetCardPage" />
          <el-select v-model="buildingFilter" size="small" clearable placeholder="全部楼栋" @change="resetCardPage">
            <el-option v-for="item in buildingOptions" :key="item" :label="item" :value="item" />
          </el-select>
          <el-select v-model="statusFilter" size="small" clearable placeholder="全部状态" @change="resetCardPage">
            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </div>
        <span class="card-result">共 {{ filteredElevators.length }} 台，当前第 {{ cardPage }}/{{ cardPageCount }} 页</span>
      </div>

      <div v-if="pagedElevators.length" class="elevator-grid">
        <article
          v-for="item in pagedElevators"
          :key="item.id"
          class="elevator-card"
          :class="statusClass(item.status)"
          role="button"
          tabindex="0"
          :aria-label="'查看' + item.name + '详情与今日运行'"
          @click="openElevator(item)"
          @keydown.enter="openElevator(item)"
          @keydown.space.prevent="openElevator(item)"
        >
          <div class="elevator-card-head">
            <div class="elevator-name">
              <span class="elevator-symbol"><i class="el-icon-sort"></i></span>
              <div>
                <b>{{ item.name }}</b
                ><small>{{ item.id }} · {{ item.building }}</small>
              </div>
            </div>
            <el-tag :type="statusTag(item.status)" size="small" effect="light">{{ item.status }}</el-tag>
          </div>

          <div class="elevator-live">
            <div class="shaft" :class="directionClass(item.direction)">
              <span class="shaft-arrow"><i :class="directionIcon(item.direction)"></i></span>
              <strong>{{ item.currentFloor }}</strong>
              <small>{{ item.direction }}</small>
            </div>
            <div class="live-metrics">
              <span
                ><small>今日运行</small><b>{{ item.trips }}<em>次</em></b></span
              >
              <span
                ><small>载客量</small><b>{{ item.passengers }}<em>人次</em></b></span
              >
              <span
                ><small>运行时长</small><b>{{ formatMinutes(item.runMinutes) }}</b></span
              >
              <span
                ><small>平均候梯</small><b>{{ item.waitSeconds }}<em>秒</em></b></span
              >
            </div>
          </div>

          <div class="availability-row">
            <span>今日可用率</span>
            <div class="availability-track"><i :style="{ width: item.availability + '%' }"></i></div>
            <b>{{ item.availability }}%</b>
          </div>

          <div class="elevator-card-foot">
            <span><i class="el-icon-location-outline"></i>{{ item.location }}</span>
            <span v-if="item.alarmCount" class="alarm-text"><i class="el-icon-warning-outline"></i>{{ item.alarmCount }} 条告警</span>
            <span v-else class="healthy-text"><i class="el-icon-circle-check"></i>运行正常</span>
          </div>
          <div class="card-link">查看详情与今日运行 <i class="el-icon-arrow-right"></i></div>
        </article>
      </div>

      <div v-else class="empty-state"><i class="el-icon-search"></i><span>没有符合当前筛选条件的电梯</span><el-button type="text" @click="clearFilters">清除筛选</el-button></div>

      <div v-if="filteredElevators.length" class="card-pagination">
        <span>每页 {{ cardPageSize }} 台</span>
        <el-pagination background :current-page.sync="cardPage" :page-size="cardPageSize" :total="filteredElevators.length" layout="prev, pager, next" />
      </div>
    </section>

    <section v-else ref="workspaceContent" class="surface management-card workspace-detail" tabindex="-1">
      <iot-workspace-header :item="currentWorkspace" :updated-at="updatedAt" :show-back="false" />
      <div v-if="activeWorkspace === 'reports'" class="workspace-body">
        <div class="table-toolbar">
          <div class="filter-group">
            <el-input v-model.trim="reportKeyword" size="small" clearable prefix-icon="el-icon-search" placeholder="搜索电梯 / 楼栋" />
            <el-date-picker v-model="reportDate" size="small" type="date" value-format="yyyy-MM-dd" placeholder="运行日期" />
          </div>
          <el-button size="small" icon="el-icon-download" @click="$message.success('运行日报已生成（仿真）')">导出日报</el-button>
        </div>
        <el-table :data="reportRows" size="small">
          <el-table-column prop="name" label="电梯" min-width="145" />
          <el-table-column prop="building" label="楼栋" min-width="130" />
          <el-table-column prop="trips" label="运行次数" width="95" />
          <el-table-column prop="doorCycles" label="开关门" width="90" />
          <el-table-column prop="mileage" label="里程(km)" width="90" />
          <el-table-column label="运行时长" width="105"
            ><template slot-scope="{ row }">{{ formatMinutes(row.runMinutes) }}</template></el-table-column
          >
          <el-table-column prop="waitSeconds" label="平均候梯(秒)" width="115" />
          <el-table-column label="可用率" min-width="145">
            <template slot-scope="{ row }"
              ><div class="table-progress">
                <i :style="{ width: row.availability + '%' }"></i><span>{{ row.availability }}%</span>
              </div></template
            >
          </el-table-column>
          <el-table-column label="操作" width="82" fixed="right"
            ><template slot-scope="{ row }"><el-button type="text" size="mini" @click="openElevator(row)">详情</el-button></template></el-table-column
          >
        </el-table>
      </div>

      <div v-else-if="activeWorkspace === 'alarms'" class="workspace-body">
        <div class="table-toolbar">
          <div class="filter-group"><el-input v-model.trim="alarmKeyword" size="small" clearable prefix-icon="el-icon-search" placeholder="搜索告警编号 / 电梯 / 类型" /></div>
          <span class="toolbar-note"><i class="el-icon-warning-outline"></i>告警确认、派单、处置和关闭全过程留痕</span>
        </div>
        <el-table :data="filteredAlarms" size="small">
          <el-table-column prop="id" label="告警编号" min-width="145" />
          <el-table-column label="等级" width="78"
            ><template slot-scope="{ row }"
              ><span class="level-pill" :class="alarmLevelClass(row.level)">{{ row.level }}</span></template
            ></el-table-column
          >
          <el-table-column prop="elevator" label="电梯" min-width="145" />
          <el-table-column prop="type" label="告警类型" min-width="140" />
          <el-table-column prop="time" label="发生时间" width="112" />
          <el-table-column prop="duration" label="持续时间" width="90" />
          <el-table-column prop="workOrder" label="关联工单" min-width="130" />
          <el-table-column prop="assignee" label="处置人" width="90" />
          <el-table-column label="状态" width="90"
            ><template slot-scope="{ row }"
              ><el-tag :type="alarmStatusTag(row.status)" size="mini">{{ row.status }}</el-tag></template
            ></el-table-column
          >
          <el-table-column label="操作" width="90" fixed="right"
            ><template slot-scope="{ row }"><el-button type="text" size="mini" @click="openAlarmElevator(row)">查看电梯</el-button></template></el-table-column
          >
        </el-table>
      </div>

      <div v-else class="workspace-body">
        <div class="table-toolbar">
          <div class="filter-group"><el-input v-model.trim="maintenanceKeyword" size="small" clearable prefix-icon="el-icon-search" placeholder="搜索计划 / 电梯 / 维保单位" /></div>
          <el-button type="primary" size="small" plain icon="el-icon-plus" @click="$message.info('维保计划配置已进入接口联调清单')">新增计划</el-button>
        </div>
        <el-table :data="filteredMaintenance" size="small">
          <el-table-column prop="id" label="计划编号" min-width="145" />
          <el-table-column prop="elevator" label="电梯" min-width="150" />
          <el-table-column prop="type" label="维保类型" width="105" />
          <el-table-column prop="planDate" label="计划日期" width="110" />
          <el-table-column prop="company" label="维保单位" min-width="140" />
          <el-table-column prop="owner" label="责任人" width="90" />
          <el-table-column label="状态" width="90"
            ><template slot-scope="{ row }"
              ><el-tag :type="row.status === '执行中' ? 'warning' : ''" size="mini">{{ row.status }}</el-tag></template
            ></el-table-column
          >
          <el-table-column prop="result" label="结果" min-width="110" />
          <el-table-column label="操作" width="82" fixed="right"
            ><template slot-scope="{ row }"><el-button type="text" size="mini" @click="openMaintenanceElevator(row)">详情</el-button></template></el-table-column
          >
        </el-table>
      </div>
    </section>

    <el-drawer
      title="电梯详情与运行日报"
      :visible.sync="detailVisible"
      size="540px"
      custom-class="passage-detail-drawer elevator-detail-drawer"
      append-to-body
      :modal-append-to-body="true"
      :lock-scroll="true"
      destroy-on-close
      @opened="renderDailyChart"
      @closed="disposeDailyChart"
    >
      <div v-if="currentElevator" class="drawer-layout">
        <div class="drawer-scroll">
          <div class="elevator-hero" :class="statusClass(currentElevator.status)">
            <span class="hero-icon"><i class="el-icon-sort"></i></span>
            <div class="hero-copy">
              <small>{{ currentElevator.id }} · {{ currentElevator.building }}</small>
              <h3>{{ currentElevator.name }}</h3>
              <p>{{ currentElevator.location }}</p>
            </div>
            <el-tag :type="statusTag(currentElevator.status)" effect="dark">{{ currentElevator.status }}</el-tag>
          </div>

          <div class="current-state">
            <div class="floor-state">
              <small>当前楼层</small><b>{{ currentElevator.currentFloor }}</b
              ><span><i :class="directionIcon(currentElevator.direction)"></i>{{ currentElevator.direction }}</span>
            </div>
            <div class="state-copy">
              <span
                ><small>控制器</small><b>{{ currentElevator.controllerStatus }}</b></span
              ><span
                ><small>服务楼层</small><b>{{ currentElevator.floors.join('、') }}</b></span
              ><span
                ><small>下次维保</small><b>{{ currentElevator.nextMaintenance }}</b></span
              >
            </div>
          </div>

          <div class="detail-section">
            <h4>设备档案</h4>
            <div class="detail-info-grid elevator-info-grid">
              <span
                ><small>品牌 / 型号</small><b>{{ currentElevator.brand }} / {{ currentElevator.model }}</b></span
              >
              <span
                ><small>设备序列号</small><b>{{ currentElevator.serial }}</b></span
              >
              <span
                ><small>额定载重</small><b>{{ currentElevator.load }} kg</b></span
              >
              <span
                ><small>额定速度</small><b>{{ currentElevator.speed }} m/s</b></span
              >
              <span
                ><small>责任人</small><b>{{ currentElevator.manager }} · {{ currentElevator.phone }}</b></span
              >
              <span
                ><small>维保单位</small><b>{{ currentElevator.maintainer }}</b></span
              >
            </div>
          </div>

          <div class="detail-section daily-section">
            <div class="section-heading">
              <h4>每日运行状况</h4>
              <el-date-picker v-model="detailDate" size="mini" type="date" value-format="yyyy-MM-dd" :clearable="false" @change="renderDailyChart" />
            </div>
            <div class="daily-summary">
              <span
                ><small>运行次数</small><b>{{ currentElevator.trips }} 次</b></span
              >
              <span
                ><small>开关门</small><b>{{ currentElevator.doorCycles }} 次</b></span
              >
              <span
                ><small>运行里程</small><b>{{ currentElevator.mileage }} km</b></span
              >
              <span
                ><small>可用率</small><b>{{ currentElevator.availability }}%</b></span
              >
            </div>
            <div ref="dailyChart" class="daily-chart" role="img" :aria-label="currentElevator.name + '当日分时运行次数和平均候梯时长图表'"></div>
            <p class="chart-insight"><i class="el-icon-data-line"></i>{{ dailyInsight }}</p>
          </div>

          <div class="detail-section">
            <h4>近 7 日运行记录</h4>
            <el-table :data="recentDailyRows" size="mini" class="drawer-table">
              <el-table-column prop="date" label="日期" min-width="92" />
              <el-table-column prop="trips" label="次数" width="62" />
              <el-table-column prop="runTime" label="运行" width="72" />
              <el-table-column prop="availability" label="可用率" width="72" />
              <el-table-column prop="alarms" label="故障" width="58" />
            </el-table>
          </div>
        </div>
        <div class="drawer-actions">
          <el-button @click="detailVisible = false">关闭</el-button
          ><el-button type="primary" icon="el-icon-document" @click="$message.success('已生成 ' + currentElevator.name + ' 运行日报（仿真）')">生成运行日报</el-button>
        </div>
      </div>
    </el-drawer>

    <el-dialog title="新增电梯" :visible.sync="createVisible" width="760px" append-to-body :close-on-click-modal="false" custom-class="elevator-create-dialog">
      <div class="dialog-intro">
        <i class="el-icon-document-add"></i>
        <div><b>建立电梯设备卡片</b>保存后将加入总览；控制器编号用于后续对接梯控网关实时数据。</div>
      </div>
      <el-form ref="elevatorForm" :model="elevatorForm" :rules="elevatorRules" label-width="92px" class="config-form" size="small">
        <el-row :gutter="18">
          <el-col :span="12"
            ><el-form-item label="电梯名称" prop="name"><el-input v-model.trim="elevatorForm.name" placeholder="如 A栋客梯 3#" /></el-form-item
          ></el-col>
          <el-col :span="12"
            ><el-form-item label="设备编号" prop="id"><el-input v-model.trim="elevatorForm.id" placeholder="如 EL-A03" /></el-form-item
          ></el-col>
          <el-col :span="12"
            ><el-form-item label="所属楼栋" prop="building"><el-input v-model.trim="elevatorForm.building" placeholder="请输入楼栋名称" /></el-form-item
          ></el-col>
          <el-col :span="12"
            ><el-form-item label="安装位置" prop="location"><el-input v-model.trim="elevatorForm.location" placeholder="请输入电梯厅或核心筒位置" /></el-form-item
          ></el-col>
          <el-col :span="12"
            ><el-form-item label="控制器编号" prop="controller"><el-input v-model.trim="elevatorForm.controller" placeholder="梯控网关/控制器编号" /></el-form-item
          ></el-col>
          <el-col :span="12"
            ><el-form-item label="服务楼层" prop="floorValues"
              ><el-select v-model="elevatorForm.floorValues" multiple collapse-tags filterable placeholder="请选择服务楼层"
                ><el-option v-for="floor in floorOptions" :key="floor.value" :label="floor.label" :value="floor.value" /></el-select></el-form-item
          ></el-col>
          <el-col :span="12"
            ><el-form-item label="品牌"><el-input v-model.trim="elevatorForm.brand" placeholder="电梯品牌" /></el-form-item
          ></el-col>
          <el-col :span="12"
            ><el-form-item label="型号"><el-input v-model.trim="elevatorForm.model" placeholder="设备型号" /></el-form-item
          ></el-col>
          <el-col :span="12"
            ><el-form-item label="额定载重"
              ><el-input-number v-model="elevatorForm.load" :min="320" :max="5000" :step="50" controls-position="right" /><span class="form-unit">kg</span></el-form-item
            ></el-col
          >
          <el-col :span="12"
            ><el-form-item label="额定速度"
              ><el-input-number v-model="elevatorForm.speed" :min="0.5" :max="8" :step="0.25" :precision="2" controls-position="right" /><span class="form-unit">m/s</span></el-form-item
            ></el-col
          >
          <el-col :span="12"
            ><el-form-item label="责任人" prop="manager"><el-input v-model.trim="elevatorForm.manager" placeholder="请输入园区责任人" /></el-form-item
          ></el-col>
          <el-col :span="12"
            ><el-form-item label="维保单位"><el-input v-model.trim="elevatorForm.maintainer" placeholder="请输入维保单位" /></el-form-item
          ></el-col>
        </el-row>
      </el-form>
      <span slot="footer"><el-button @click="createVisible = false">取消</el-button><el-button v-if="canCreateElevator" type="primary" @click="saveElevator">保存并新增卡片</el-button></span>
    </el-dialog>
  </div>
</template>

<script>
import IotWorkspaceHeader from '../components/IotWorkspaceHeader.vue'
import IotWorkspaceNav from '../components/IotWorkspaceNav.vue'
import { elevatorControl } from '../mock/elevatorMockData'

export default {
  name: 'SmartIOTElevatorControl',
  components: { IotWorkspaceHeader, IotWorkspaceNav },
  data() {
    return {
      elevators: JSON.parse(JSON.stringify(elevatorControl.elevators)),
      alarms: JSON.parse(JSON.stringify(elevatorControl.alarms)),
      maintenance: JSON.parse(JSON.stringify(elevatorControl.maintenance)),
      activeWorkspace: 'overview',
      keyword: '',
      buildingFilter: '',
      statusFilter: '',
      reportKeyword: '',
      reportDate: '2026-08-10',
      alarmKeyword: '',
      maintenanceKeyword: '',
      cardPage: 1,
      cardPageSize: 6,
      updatedAt: '10:52:20',
      detailVisible: false,
      currentElevator: null,
      detailDate: '2026-08-10',
      dailyChart: null,
      createVisible: false,
      canCreateElevator: false,
      elevatorForm: {},
      elevatorRules: {
        name: [{ required: true, message: '请输入电梯名称', trigger: 'blur' }],
        id: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
        building: [{ required: true, message: '请输入所属楼栋', trigger: 'blur' }],
        location: [{ required: true, message: '请输入安装位置', trigger: 'blur' }],
        controller: [{ required: true, message: '请输入控制器编号', trigger: 'blur' }],
        floorValues: [{ type: 'array', required: true, min: 1, message: '至少选择一个服务楼层', trigger: 'change' }],
        manager: [{ required: true, message: '请输入责任人', trigger: 'blur' }]
      }
    }
  },
  computed: {
    runningCount() {
      return this.elevators.filter((item) => item.status === '运行中').length
    },
    abnormalCount() {
      return this.elevators.filter((item) => item.status !== '运行中').length
    },
    activeAlarmCount() {
      return this.alarms.filter((item) => item.status !== '已关闭').length
    },
    averageAvailability() {
      if (!this.elevators.length) return 0
      return (this.elevators.reduce((sum, item) => sum + item.availability, 0) / this.elevators.length).toFixed(1)
    },
    kpis() {
      return [
        { title: '电梯总数', value: this.elevators.length, unit: '台', sub: this.buildingOptions.length + ' 个楼栋区域', icon: 'el-icon-sort', type: 'primary' },
        { title: '运行中', value: this.runningCount, unit: '台', sub: '控制器在线并正常服务', icon: 'el-icon-circle-check', type: 'green' },
        {
          title: '今日运行',
          value: this.elevators.reduce((sum, item) => sum + item.trips, 0).toLocaleString(),
          unit: '次',
          sub: '累计载客 ' + this.elevators.reduce((sum, item) => sum + item.passengers, 0).toLocaleString() + ' 人次',
          icon: 'el-icon-data-line',
          type: 'cyan'
        },
        { title: '检修 / 故障', value: this.abnormalCount, unit: '台', sub: '故障、离线及检修模式', icon: 'el-icon-warning-outline', type: 'orange' },
        { title: '待处置告警', value: this.activeAlarmCount, unit: '条', sub: this.alarms.filter((item) => item.workOrder !== '-').length + ' 条已生成工单', icon: 'el-icon-bell', type: 'red' },
        { title: '平均可用率', value: this.averageAvailability, unit: '%', sub: '目标 ≥ 98.0%', icon: 'el-icon-s-data', type: 'purple' }
      ]
    },
    workspaceNav() {
      return [
        { key: 'overview', title: '梯控总览', description: '一梯一卡与实时状态', detail: '查看全部电梯卡片、当前楼层、方向、运行量和可用率。', icon: 'el-icon-data-analysis', count: null },
        { key: 'reports', title: '运行日报', description: '次数、里程与可用率', detail: '按日汇总运行次数、开关门、里程、时长和候梯情况。', icon: 'el-icon-date', count: this.elevators.length },
        {
          key: 'alarms',
          title: '故障告警',
          description: '识别、派单与处置',
          detail: '查看故障、离线和运行异常，并跟踪关联工单。',
          icon: 'el-icon-warning-outline',
          count: this.activeAlarmCount,
          danger: this.activeAlarmCount > 0
        },
        {
          key: 'maintenance',
          title: '维保计划',
          description: '计划、执行与结果',
          detail: '查看电梯维保计划、执行单位、责任人和完成结果。',
          icon: 'el-icon-document-checked',
          count: this.maintenance.length
        }
      ]
    },
    currentWorkspace() {
      return this.workspaceNav.find((item) => item.key === this.activeWorkspace) || this.workspaceNav[0]
    },
    buildingOptions() {
      return Array.from(new Set(this.elevators.map((item) => item.building)))
    },
    statusOptions() {
      return ['运行中', '检修中', '故障', '离线']
    },
    filteredElevators() {
      const key = this.keyword.toLowerCase()
      return this.elevators.filter((item) => {
        const matchKey = !key || [item.name, item.id, item.building, item.location].join(' ').toLowerCase().indexOf(key) > -1
        return matchKey && (!this.buildingFilter || item.building === this.buildingFilter) && (!this.statusFilter || item.status === this.statusFilter)
      })
    },
    cardPageCount() {
      return Math.max(1, Math.ceil(this.filteredElevators.length / this.cardPageSize))
    },
    pagedElevators() {
      const start = (this.cardPage - 1) * this.cardPageSize
      return this.filteredElevators.slice(start, start + this.cardPageSize)
    },
    reportRows() {
      const key = this.reportKeyword.toLowerCase()
      return this.elevators.filter((item) => !key || [item.name, item.id, item.building].join(' ').toLowerCase().indexOf(key) > -1)
    },
    filteredAlarms() {
      const key = this.alarmKeyword.toLowerCase()
      return this.alarms.filter((item) => !key || [item.id, item.elevator, item.type].join(' ').toLowerCase().indexOf(key) > -1)
    },
    filteredMaintenance() {
      const key = this.maintenanceKeyword.toLowerCase()
      return this.maintenance.filter((item) => !key || [item.id, item.elevator, item.company].join(' ').toLowerCase().indexOf(key) > -1)
    },
    floorOptions() {
      const options = []
      for (let floor = -3; floor <= 30; floor += 1) {
        if (floor === 0) continue
        options.push({ value: floor, label: floor < 0 ? 'B' + Math.abs(floor) : floor + 'F' })
      }
      return options
    },
    dailyInsight() {
      if (!this.currentElevator) return ''
      const prefix = this.currentElevator.status === '运行中' ? '运行平稳' : '当前处于' + this.currentElevator.status + '状态'
      return prefix + '；高峰集中在 08:00-10:00、17:00-19:00，平均候梯 ' + this.currentElevator.waitSeconds + ' 秒。'
    },
    recentDailyRows() {
      if (!this.currentElevator) return []
      return Array.from({ length: 7 }).map((_, index) => {
        const day = 10 - index
        const factor = 1 - index * 0.025
        return {
          date: '08-' + String(day).padStart(2, '0'),
          trips: Math.max(0, Math.round(this.currentElevator.trips * factor)),
          runTime: Math.max(0, Math.round((this.currentElevator.runMinutes * factor) / 60)) + 'h',
          availability: Math.max(78, this.currentElevator.availability - index * 0.1).toFixed(1) + '%',
          alarms: index === 0 ? this.currentElevator.alarmCount : 0
        }
      })
    }
  },
  watch: {
    cardPageCount(value) {
      if (this.cardPage > value) this.cardPage = value
    }
  },
  created() {
    this.loadButtonAuth()
  },
  beforeDestroy() {
    this.disposeDailyChart()
    window.removeEventListener('resize', this.resizeDailyChart)
  },
  methods: {
    loadButtonAuth() {
      const resourceName = (this.$route && this.$route.name) || this.$options.name
      this.$api['button.info']({
        resourceName,
        parentUuid: '',
        permissionVo: { router: resourceName, resourceId: '' }
      })
        .then((buttons) => {
          this.canCreateElevator =
            Array.isArray(buttons) &&
            buttons.some((button) => {
              return button.name === 'elevatorControl_add' && button.enable !== '0' && button.isAccredit !== 0 && button.isAccredit !== '0'
            })
        })
        .catch(() => {
          this.canCreateElevator = false
        })
    },
    handleWorkspaceChange() {
      this.$nextTick(() => {
        if (this.$refs.workspaceContent) this.$refs.workspaceContent.focus({ preventScroll: true })
      })
    },
    resetCardPage() {
      this.cardPage = 1
    },
    clearFilters() {
      this.keyword = ''
      this.buildingFilter = ''
      this.statusFilter = ''
      this.cardPage = 1
    },
    refreshElevators() {
      this.updatedAt = new Date().toLocaleTimeString('zh-CN', { hour12: false })
      this.$message.success('电梯状态已同步')
    },
    statusClass(status) {
      return { running: status === '运行中', maintenance: status === '检修中', fault: status === '故障', offline: status === '离线' }
    },
    statusTag(status) {
      return { 运行中: 'success', 检修中: 'warning', 故障: 'danger', 离线: 'info' }[status] || 'info'
    },
    directionClass(direction) {
      return { up: direction === '上行', down: direction === '下行', stopped: direction === '停梯' || direction === '未知' }
    },
    directionIcon(direction) {
      if (direction === '上行') return 'el-icon-top'
      if (direction === '下行') return 'el-icon-bottom'
      if (direction === '待机') return 'el-icon-minus'
      return 'el-icon-close'
    },
    formatMinutes(value) {
      const hours = Math.floor(value / 60)
      const minutes = value % 60
      return hours ? hours + 'h ' + minutes + 'm' : minutes + 'm'
    },
    openElevator(item) {
      this.currentElevator = item
      this.detailVisible = true
    },
    openAlarmElevator(row) {
      const item = this.elevators.find((elevator) => elevator.id === row.elevatorId)
      if (item) this.openElevator(item)
    },
    openMaintenanceElevator(row) {
      const item = this.elevators.find((elevator) => elevator.id === row.elevatorId)
      if (item) this.openElevator(item)
    },
    renderDailyChart() {
      if (!this.currentElevator || !this.$refs.dailyChart || !this.$echarts) return
      this.disposeDailyChart()
      this.dailyChart = this.$echarts.init(this.$refs.dailyChart)
      const base = Math.max(5, Math.round(this.currentElevator.trips / 45))
      const trips = [2, 1, 1, 2, 4, 7, 14, 24, 34, 29, 21, 18, 22, 19, 20, 25, 31, 38, 36, 25, 16, 10, 6, 3].map((value) => Math.max(0, Math.round((value * base) / 8)))
      const waits = [8, 7, 6, 6, 7, 9, 13, 18, 25, 22, 17, 15, 16, 15, 16, 18, 21, 27, 24, 19, 15, 12, 10, 9].map((value) => value + Math.max(0, this.currentElevator.waitSeconds - 18))
      this.dailyChart.setOption({
        animationDuration: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 260,
        color: ['#3478df', '#20a879'],
        legend: { top: 2, itemWidth: 14, itemHeight: 7, textStyle: { color: '#66758a', fontSize: 11 }, data: ['运行次数', '平均候梯'] },
        tooltip: {
          trigger: 'axis',
          formatter: (params) =>
            params[0].axisValue + ':00<br>' + params.map((item) => item.marker + item.seriesName + '：' + item.value + (item.seriesName === '运行次数' ? ' 次' : ' 秒')).join('<br>')
        },
        grid: { left: 36, right: 38, top: 36, bottom: 28 },
        xAxis: {
          type: 'category',
          data: Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0')),
          axisLine: { lineStyle: { color: '#dce3ec' } },
          axisTick: { show: false },
          axisLabel: { color: '#8592a4', fontSize: 10, interval: 2 }
        },
        yAxis: [
          { type: 'value', name: '次', nameTextStyle: { color: '#8c98a9' }, splitLine: { lineStyle: { color: '#edf1f5' } }, axisLabel: { color: '#8c98a9', fontSize: 10 } },
          { type: 'value', name: '秒', nameTextStyle: { color: '#8c98a9' }, splitLine: { show: false }, axisLabel: { color: '#8c98a9', fontSize: 10 } }
        ],
        series: [
          { name: '运行次数', type: 'bar', barMaxWidth: 12, data: trips, itemStyle: { borderRadius: [3, 3, 0, 0] } },
          { name: '平均候梯', type: 'line', yAxisIndex: 1, smooth: true, symbol: 'circle', symbolSize: 4, data: waits, lineStyle: { width: 2 }, areaStyle: { color: 'rgba(32,168,121,0.08)' } }
        ]
      })
      window.removeEventListener('resize', this.resizeDailyChart)
      window.addEventListener('resize', this.resizeDailyChart)
    },
    resizeDailyChart() {
      if (this.dailyChart) this.dailyChart.resize()
    },
    disposeDailyChart() {
      if (this.dailyChart) {
        this.dailyChart.dispose()
        this.dailyChart = null
      }
      window.removeEventListener('resize', this.resizeDailyChart)
    },
    alarmLevelClass(level) {
      return level === '紧急' ? 'critical' : level === '重要' ? 'major' : 'normal'
    },
    alarmStatusTag(status) {
      return status === '已关闭' ? 'success' : status === '待确认' ? 'danger' : 'warning'
    },
    createEmptyForm() {
      return { name: '', id: '', building: '', location: '', controller: '', floorValues: [], brand: '', model: '', load: 1000, speed: 1.5, manager: '', maintainer: '' }
    },
    openCreateDialog() {
      if (!this.canCreateElevator) return
      this.elevatorForm = this.createEmptyForm()
      this.createVisible = true
      this.$nextTick(() => {
        if (this.$refs.elevatorForm) this.$refs.elevatorForm.clearValidate()
      })
    },
    saveElevator() {
      if (!this.canCreateElevator) return
      this.$refs.elevatorForm.validate((valid) => {
        if (!valid) return
        if (this.elevators.some((item) => item.id.toLowerCase() === this.elevatorForm.id.toLowerCase())) {
          this.$message.error('设备编号已存在，请更换后保存')
          return
        }
        const selectedFloorLabels = this.floorOptions.filter((item) => this.elevatorForm.floorValues.indexOf(item.value) > -1).map((item) => item.label)
        this.elevators.push({
          ...JSON.parse(JSON.stringify(this.elevatorForm)),
          floors: [selectedFloorLabels.join('、')],
          status: '运行中',
          direction: '待机',
          currentFloor: selectedFloorLabels[0],
          controllerStatus: '在线',
          serial: 'NEW-' + Date.now().toString().slice(-8),
          trips: 0,
          doorCycles: 0,
          mileage: 0,
          runMinutes: 0,
          waitSeconds: 0,
          availability: 100,
          alarmCount: 0,
          passengers: 0,
          phone: '-',
          nextMaintenance: '待制定',
          lastUpdate: this.updatedAt
        })
        this.keyword = ''
        this.buildingFilter = ''
        this.statusFilter = ''
        this.cardPage = Math.ceil(this.elevators.length / this.cardPageSize)
        this.createVisible = false
        this.activeWorkspace = 'overview'
        this.$message.success('电梯卡片已新增')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import './passageCommon.scss';

.elevator-overview {
  min-height: var(--iot-overview-height);
  padding-bottom: 12px;
  overflow: hidden;
}
.elevator-head {
  min-height: 54px;
}
.elevator-toolbar {
  display: flex;
  min-height: 52px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 14px;
  background: #fbfcfe;
  border-bottom: 1px solid #edf0f4;
  box-sizing: border-box;
}
.elevator-toolbar .el-input {
  width: 250px;
}
.elevator-toolbar .el-select {
  width: 145px;
}
.card-result {
  color: #7b899d;
  font-size: 12px;
  white-space: nowrap;
}
.elevator-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(260px, 1fr));
  gap: 12px;
  padding: 14px;
}
.elevator-card {
  position: relative;
  min-width: 0;
  padding: 14px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e3e9f1;
  border-top: 3px solid #20a879;
  border-radius: 9px;
  box-shadow: 0 2px 7px rgba(42, 63, 91, 0.045);
  cursor: pointer;
  outline: none;
  transition: border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
  box-sizing: border-box;
}
.elevator-card:hover {
  border-color: #b9d1f5;
  box-shadow: 0 7px 18px rgba(49, 91, 148, 0.12);
}
.elevator-card:focus-visible {
  box-shadow: 0 0 0 3px rgba(36, 104, 242, 0.2), 0 7px 18px rgba(49, 91, 148, 0.12);
}
.elevator-card.maintenance {
  border-top-color: #e69a2d;
}
.elevator-card.fault {
  border-top-color: #e55757;
  background: #fffafa;
}
.elevator-card.offline {
  border-top-color: #8996a8;
  background: #fafbfc;
}
.elevator-card-head,
.elevator-name,
.elevator-live,
.elevator-card-foot,
.availability-row {
  display: flex;
  align-items: center;
}
.elevator-card-head {
  justify-content: space-between;
  gap: 10px;
}
.elevator-name {
  min-width: 0;
  gap: 10px;
}
.elevator-symbol {
  display: flex;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #3478df;
  border-radius: 8px;
  font-size: 18px;
}
.elevator-name div {
  min-width: 0;
}
.elevator-name b,
.elevator-name small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.elevator-name b {
  color: #26364c;
  font-size: 15px;
  line-height: 22px;
}
.elevator-name small {
  margin-top: 2px;
  color: #8a97a8;
  font-size: 12px;
}
.elevator-live {
  gap: 14px;
  margin-top: 14px;
  padding: 12px;
  background: #f7f9fc;
  border-radius: 8px;
}
.shaft {
  display: flex;
  width: 72px;
  height: 90px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #2468f2;
  background: linear-gradient(180deg, #e8f1ff, #f3f7fd);
  border: 1px solid #d8e6f9;
  border-radius: 8px;
}
.shaft-arrow {
  display: flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #3478df;
  border-radius: 50%;
  font-size: 12px;
}
.shaft.down .shaft-arrow {
  background: #18a873;
}
.shaft.stopped .shaft-arrow {
  background: #8996a8;
}
.shaft strong {
  margin-top: 5px;
  color: #24354b;
  font-size: 23px;
  line-height: 27px;
}
.shaft small {
  color: #7e8c9e;
  font-size: 11px;
}
.live-metrics {
  display: grid;
  min-width: 0;
  flex: 1;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 12px;
}
.live-metrics span {
  min-width: 0;
}
.live-metrics small,
.live-metrics b {
  display: block;
}
.live-metrics small {
  color: #8693a5;
  font-size: 11px;
}
.live-metrics b {
  margin-top: 3px;
  color: #2d3c51;
  font-size: 15px;
  font-variant-numeric: tabular-nums;
}
.live-metrics em {
  margin-left: 3px;
  color: #8996a8;
  font-size: 10px;
  font-style: normal;
  font-weight: 400;
}
.availability-row {
  gap: 9px;
  margin-top: 12px;
  color: #7c899b;
  font-size: 11px;
}
.availability-track {
  height: 6px;
  flex: 1;
  overflow: hidden;
  background: #e7edf4;
  border-radius: 4px;
}
.availability-track i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #27b581, #3478df);
  border-radius: inherit;
}
.availability-row b {
  color: #40526a;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.elevator-card-foot {
  justify-content: space-between;
  gap: 8px;
  margin-top: 12px;
  padding-top: 11px;
  color: #78869a;
  border-top: 1px dashed #e4e9f0;
  font-size: 11px;
}
.elevator-card-foot > span:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.elevator-card-foot i {
  margin-right: 4px;
}
.alarm-text {
  color: #da4848;
  white-space: nowrap;
}
.healthy-text {
  color: #16875d;
  white-space: nowrap;
}
.card-link {
  margin-top: 10px;
  color: #2f74dc;
  font-size: 12px;
  font-weight: 600;
  text-align: right;
}
.card-pagination {
  display: flex;
  min-height: 48px;
  align-items: center;
  justify-content: space-between;
  margin: 0 14px;
  padding: 0 4px;
  color: #7b899c;
  border-top: 1px solid #edf0f4;
  font-size: 11px;
}
.workspace-body {
  min-height: 300px;
}
.workspace-body .table-toolbar {
  padding-top: 6px;
}
.table-progress {
  position: relative;
  display: flex;
  align-items: center;
  gap: 7px;
}
.table-progress::before {
  width: 78px;
  height: 6px;
  flex: 0 0 auto;
  background: #e7edf4;
  border-radius: 4px;
  content: '';
}
.table-progress i {
  position: absolute;
  top: 50%;
  left: 0;
  max-width: 78px;
  height: 6px;
  transform: translateY(-50%);
  background: #3478df;
  border-radius: 4px;
}
.table-progress span {
  color: #627187;
  font-size: 11px;
}
@media (max-width: 1300px) {
  .elevator-grid {
    grid-template-columns: repeat(2, minmax(260px, 1fr));
  }
}
@media (max-width: 860px) {
  .elevator-toolbar {
    align-items: flex-start;
    flex-direction: column;
    padding: 10px 12px;
  }
  .elevator-toolbar .filter-group {
    width: 100%;
  }
  .elevator-toolbar .el-input,
  .elevator-toolbar .el-select {
    width: 100%;
  }
  .elevator-grid {
    grid-template-columns: 1fr;
  }
}
@media (prefers-reduced-motion: reduce) {
  .elevator-card {
    transition: none;
  }
}
</style>

<style lang="scss">
.elevator-detail-drawer {
  display: flex;
  flex-direction: column;
}
.elevator-detail-drawer .el-drawer__header {
  min-height: 54px;
  margin: 0;
  padding: 0 18px;
  color: #26354a;
  border-bottom: 1px solid #e7ebf1;
  font-size: 16px;
  font-weight: 600;
}
.elevator-detail-drawer .el-drawer__body {
  min-height: 0;
  flex: 1;
  overflow: hidden;
}
.elevator-detail-drawer .drawer-scroll {
  padding: 14px 18px 24px;
}
.elevator-hero {
  display: flex;
  min-height: 78px;
  align-items: center;
  gap: 12px;
  padding: 13px;
  background: #f1f7ff;
  border-left: 3px solid #20a879;
  border-radius: 8px;
  box-sizing: border-box;
}
.elevator-hero.maintenance {
  background: #fff8ee;
  border-left-color: #e69a2d;
}
.elevator-hero.fault {
  background: #fff2f2;
  border-left-color: #e55757;
}
.elevator-hero.offline {
  background: #f3f5f8;
  border-left-color: #8996a8;
}
.hero-icon {
  display: flex;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #3478df;
  border-radius: 9px;
  font-size: 20px;
}
.hero-copy {
  min-width: 0;
  flex: 1;
}
.hero-copy h3,
.hero-copy p,
.hero-copy small {
  display: block;
  margin: 0;
}
.hero-copy h3 {
  margin: 2px 0;
  color: #27384f;
  font-size: 17px;
}
.hero-copy p,
.hero-copy small {
  color: #7c8a9e;
  font-size: 11px;
}
.current-state {
  display: grid;
  grid-template-columns: 118px 1fr;
  gap: 10px;
  margin-top: 12px;
}
.floor-state,
.state-copy {
  background: #f8fafc;
  border: 1px solid #e8edf3;
  border-radius: 8px;
}
.floor-state {
  display: flex;
  min-height: 112px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.floor-state small {
  color: #8895a7;
  font-size: 11px;
}
.floor-state b {
  margin: 3px 0;
  color: #2468f2;
  font-size: 32px;
  line-height: 38px;
}
.floor-state span {
  color: #617187;
  font-size: 12px;
}
.floor-state span i {
  margin-right: 4px;
}
.state-copy {
  display: grid;
  grid-template-columns: 1fr;
}
.state-copy span {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 12px;
  border-bottom: 1px solid #e8edf3;
}
.state-copy span:last-child {
  border-bottom: 0;
}
.state-copy small {
  color: #8996a8;
  font-size: 11px;
}
.state-copy b {
  color: #3c4d64;
  font-size: 12px;
  text-align: right;
}
.elevator-detail-drawer .detail-section {
  margin-top: 18px;
}
.elevator-detail-drawer .detail-section h4 {
  margin-bottom: 10px;
  font-size: 14px;
}
.elevator-info-grid small {
  font-size: 10px;
}
.elevator-info-grid b {
  font-size: 12px;
}
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.section-heading .el-date-editor {
  width: 138px;
}
.daily-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.daily-summary span {
  padding: 9px;
  background: #f6f8fb;
  border-radius: 6px;
}
.daily-summary small,
.daily-summary b {
  display: block;
}
.daily-summary small {
  color: #8a97a9;
  font-size: 10px;
}
.daily-summary b {
  margin-top: 4px;
  color: #34465d;
  font-size: 13px;
}
.daily-chart {
  width: 100%;
  height: 245px;
  margin-top: 8px;
}
.chart-insight {
  margin: 4px 0 0;
  padding: 9px 11px;
  color: #55708f;
  background: #f1f6ff;
  border-radius: 6px;
  font-size: 11px;
  line-height: 18px;
}
.chart-insight i {
  margin-right: 6px;
  color: #3478df;
}
.drawer-table .el-table__cell {
  padding: 7px 0;
}
.drawer-table .cell {
  font-size: 11px;
}
.elevator-create-dialog .el-dialog__body {
  padding-top: 18px;
  padding-bottom: 8px;
}
.elevator-create-dialog .el-input-number {
  width: calc(100% - 30px);
}
@media (max-width: 760px) {
  .elevator-detail-drawer {
    width: 100% !important;
  }
  .daily-summary {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
