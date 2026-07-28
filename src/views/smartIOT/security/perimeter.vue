<template>
  <div class="perimeter-page">
    <header class="page-header">
      <div>
        <div class="title-line">
          <h2>智能周界</h2>
          <span class="running-badge"><i></i> 实时监测中</span>
        </div>
        <p>园区周界态势、智能检测、联动响应与告警闭环处置</p>
      </div>
      <div class="header-actions">
        <el-button size="small" icon="el-icon-guide" @click="strategyDialogVisible = true">误报治理</el-button>
        <el-button size="small" icon="el-icon-unlock" @click="defenseDialogVisible = true">布撤防计划</el-button>
        <el-button type="primary" size="small" icon="el-icon-plus" @click="openRule()">新增检测规则</el-button>
      </div>
    </header>

    <section class="kpi-grid">
      <article v-for="item in kpis" :key="item.title" class="kpi-card" :class="'is-' + item.type">
        <div class="kpi-icon"><i :class="item.icon"></i></div>
        <div class="kpi-content">
          <span class="kpi-title">{{ item.title }}</span>
          <div class="kpi-number">{{ item.value }}<small>{{ item.unit }}</small></div>
          <span class="kpi-sub">{{ item.sub }}</span>
        </div>
      </article>
    </section>

    <iot-workspace-nav v-model="managementTab" :items="workspaceNav" aria-label="智能周界业务工作区" @change="handleWorkspaceChange" />

    <section v-if="managementTab === 'overview'" ref="workspaceContent" class="situation-grid" tabindex="-1">
      <article class="surface map-card">
        <div class="surface-head map-head">
          <div>
            <div class="surface-title"><i class="el-icon-map-location"></i> 园区周界态势</div>
            <span class="surface-subtitle">设备状态由前端硬件实时上报 · 数据延迟 1.2s</span>
          </div>
          <div class="map-tools">
            <el-checkbox-group v-model="mapLayers" size="mini">
              <el-checkbox-button label="设备">设备</el-checkbox-button>
              <el-checkbox-button label="告警">告警</el-checkbox-button>
            </el-checkbox-group>
            <el-button size="mini" icon="el-icon-refresh" @click="refreshMap">刷新</el-button>
          </div>
        </div>

        <div class="map-workbench">
          <aside class="zone-rail">
            <div class="rail-label">防区</div>
            <button class="zone-item" :class="{ active: activeZoneId === 'all' }" @click="selectZone('all')">
              <span class="zone-icon all"><i class="el-icon-menu"></i></span>
              <span class="zone-info"><b>全部防区</b><small>12 个防区</small></span>
              <i class="el-icon-arrow-right"></i>
            </button>
            <button
              v-for="zone in zones"
              :key="zone.id"
              class="zone-item"
              :class="{ active: activeZoneId === zone.id }"
              @click="selectZone(zone.id)"
            >
              <span class="zone-icon" :class="zoneStateClass(zone)"><i :class="zone.type === '出入口' ? 'el-icon-position' : 'el-icon-minus'"></i></span>
              <span class="zone-info">
                <b>{{ zone.name }}</b>
                <small>{{ zone.onlineCount }}/{{ zone.deviceCount }} 在线 · {{ zone.armed ? '布防' : '撤防' }}</small>
              </span>
              <i class="el-icon-arrow-right"></i>
            </button>
          </aside>

          <div class="campus-map" @click="selectedDevice = null">
            <div class="map-grid"></div>
            <div class="road road-horizontal"></div>
            <div class="road road-vertical"></div>
            <div
              v-for="building in buildings"
              :key="building.id"
              class="campus-building"
              :style="{ left: building.x + '%', top: building.y + '%', width: building.w + '%', height: building.h + '%' }"
            >
              <i class="el-icon-office-building"></i>
              <span>{{ building.name }}</span>
            </div>

            <div
              v-for="zone in zones"
              :key="'line-' + zone.id"
              class="fence-segment"
              :class="[zoneStateClass(zone), { muted: activeZoneId !== 'all' && activeZoneId !== zone.id }]"
              :style="zone.mapStyle"
            ></div>

            <button
              v-for="zone in zones"
              :key="'label-' + zone.id"
              class="zone-map-label"
              :class="[zoneStateClass(zone), { muted: activeZoneId !== 'all' && activeZoneId !== zone.id }]"
              :style="{ left: zone.x + '%', top: zone.y + '%' }"
              @click.stop="selectZone(zone.id)"
            >
              {{ zone.code }} · {{ zone.armed ? '布防' : '撤防' }}
            </button>

            <button
              v-for="device in filteredMapDevices"
              v-show="mapLayers.indexOf('设备') > -1"
              :key="device.id"
              class="device-marker"
              :class="[deviceStateClass(device), { selected: selectedDevice && selectedDevice.id === device.id }]"
              :style="{ left: device.x + '%', top: device.y + '%' }"
              :title="device.name + ' · ' + device.status"
              @click.stop="selectDevice(device)"
            >
              <i :class="deviceIcon(device.type)"></i>
            </button>

            <button
              v-for="alarm in mapAlarms"
              v-show="mapLayers.indexOf('告警') > -1"
              :key="alarm.id"
              class="alarm-marker"
              :style="{ left: alarm.x + '%', top: alarm.y + '%' }"
              :title="alarm.type + ' · ' + alarm.zone"
              @click.stop="openAlarm(alarm)"
            >
              <span></span><i class="el-icon-warning"></i>
            </button>

            <div v-if="selectedDevice" class="map-device-card" @click.stop>
              <button class="mini-close" @click="selectedDevice = null"><i class="el-icon-close"></i></button>
              <div class="device-card-title">
                <span class="device-avatar" :class="deviceStateClass(selectedDevice)"><i :class="deviceIcon(selectedDevice.type)"></i></span>
                <div><b>{{ selectedDevice.name }}</b><small>{{ selectedDevice.id }}</small></div>
              </div>
              <div class="device-card-grid">
                <span>运行状态<b :class="'text-' + deviceStateClass(selectedDevice)">{{ selectedDevice.status }}</b></span>
                <span>布撤防<b>{{ selectedDevice.armed }}</b></span>
                <span>健康诊断<b>{{ selectedDevice.health }}</b></span>
                <span>通信质量<b>{{ selectedDevice.signal }}%</b></span>
              </div>
              <div class="device-card-foot">最近心跳 {{ selectedDevice.updatedAt }}</div>
            </div>

            <div class="map-compass"><i class="el-icon-top"></i><b>N</b></div>
            <div class="map-scale"><i></i><span>100 m</span></div>
          </div>
        </div>

        <div class="map-legend">
          <span><i class="legend-dot online"></i>在线</span>
          <span><i class="legend-dot offline"></i>离线</span>
          <span><i class="legend-dot fault"></i>故障</span>
          <span><i class="legend-line armed"></i>已布防</span>
          <span><i class="legend-line disarmed"></i>已撤防</span>
          <span class="legend-right"><i class="el-icon-circle-check"></i> 最近同步：2026-07-20 10:28:35</span>
        </div>
      </article>

      <aside class="surface alarm-stream">
        <div class="surface-head alarm-head">
          <div>
            <div class="surface-title"><i class="el-icon-bell"></i> 实时告警</div>
            <span class="surface-subtitle">{{ liveAlarms.length }} 条处理中</span>
          </div>
          <el-button type="text" @click="openWorkspace('alarms')">进入告警处置 <i class="el-icon-arrow-right"></i></el-button>
        </div>
        <div class="alarm-list">
          <button
            v-for="alarm in liveAlarms"
            :key="alarm.id"
            class="alarm-item"
            :class="alarmLevelClass(alarm.level)"
            @click="openAlarm(alarm)"
          >
            <div class="alarm-item-top">
              <span class="alarm-type"><i class="el-icon-warning-outline"></i>{{ alarm.type }}</span>
              <span class="alarm-time">{{ alarm.time.slice(11) }}</span>
            </div>
            <div class="alarm-zone"><i class="el-icon-location-outline"></i>{{ alarm.zone }}</div>
            <div class="alarm-meta">
              <span>{{ alarm.target }} · {{ alarm.duration }}</span>
              <el-tag :type="alarmTag(alarm.status)" size="mini">{{ alarm.status }}</el-tag>
            </div>
            <div class="alarm-response" :class="{ overdue: alarm.response.indexOf('等待') > -1 }">
              <i class="el-icon-time"></i>{{ alarm.response }}
            </div>
          </button>
          <el-empty v-if="!liveAlarms.length" :image-size="64" description="当前防区暂无活动告警" />
        </div>
        <div class="alarm-stream-foot">
          <i class="el-icon-info"></i> 告警只能按流程关闭，不支持无记录删除
        </div>
      </aside>
    </section>

    <section v-else ref="workspaceContent" class="surface management-card workspace-detail" tabindex="-1">
      <iot-workspace-header :item="currentWorkspace" updated-at="10:28:35" @back="openWorkspace('overview')" />
      <el-tabs v-model="managementTab" class="workspace-tabs">
        <el-tab-pane name="alarms">
          <span slot="label"><i class="el-icon-tickets"></i> 告警处置台账 <b class="tab-count">{{ alarms.length }}</b></span>
          <div class="table-toolbar">
            <div class="filter-group">
              <el-input v-model.trim="alarmQuery.keyword" size="small" clearable prefix-icon="el-icon-search" placeholder="告警编号 / 位置 / 设备" />
              <el-select v-model="alarmQuery.type" size="small" clearable placeholder="告警类型">
                <el-option v-for="item in alarmTypes" :key="item" :label="item" :value="item" />
              </el-select>
              <el-select v-model="alarmQuery.status" size="small" clearable placeholder="处置状态">
                <el-option v-for="item in alarmStatuses" :key="item" :label="item" :value="item" />
              </el-select>
            </div>
            <div class="toolbar-note"><i class="el-icon-document-checked"></i> 全流程留痕 · 图片视频已关联存证</div>
          </div>
          <el-table :data="paginatedAlarms" size="small" class="data-table" max-height="360">
            <el-table-column prop="id" label="告警编号" min-width="142" />
            <el-table-column label="等级" width="76">
              <template slot-scope="{ row }"><span class="level-pill" :class="alarmLevelClass(row.level)">{{ row.level }}</span></template>
            </el-table-column>
            <el-table-column prop="type" label="类型" min-width="100" />
            <el-table-column prop="zone" label="位置" min-width="125" show-overflow-tooltip />
            <el-table-column prop="device" label="触发设备" min-width="150" show-overflow-tooltip />
            <el-table-column prop="time" label="发生时间" min-width="150" />
            <el-table-column label="证据" width="92">
              <template slot-scope="{ row }"><span class="evidence-link"><i class="el-icon-picture-outline"></i>{{ row.snapshot === '-' ? '-' : '已存证' }}</span></template>
            </el-table-column>
            <el-table-column prop="assignee" label="处置人" min-width="125" show-overflow-tooltip />
            <el-table-column label="状态" width="95">
              <template slot-scope="{ row }"><el-tag :type="alarmTag(row.status)" size="mini">{{ row.status }}</el-tag></template>
            </el-table-column>
            <el-table-column label="操作" width="106" fixed="right">
              <template slot-scope="{ row }"><el-button type="text" size="mini" @click="openAlarm(row)">详情 / 处置</el-button></template>
            </el-table-column>
          </el-table>
          <div class="table-pagination">
            <el-pagination
              background
              :current-page="pagination.alarms.page"
              :page-size="pagination.alarms.size"
              :page-sizes="pageSizeOptions"
              :total="filteredAlarms.length"
              layout="total, sizes, prev, pager, next, jumper"
              @current-change="pagination.alarms.page = $event"
              @size-change="changePageSize('alarms', $event)"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane name="rules">
          <span slot="label"><i class="el-icon-set-up"></i> 检测规则 <b class="tab-count">{{ rules.length }}</b></span>
          <div class="table-toolbar">
            <div class="toolbar-note primary-note"><i class="el-icon-info"></i> 每条规则可独立设置区域、时段、目标、停留时间和灵敏度</div>
            <el-button type="primary" size="small" icon="el-icon-plus" @click="openRule()">新增规则</el-button>
          </div>
          <el-table :data="paginatedRules" size="small" class="data-table" max-height="360">
            <el-table-column prop="name" label="规则名称" min-width="190" />
            <el-table-column label="检测行为" min-width="190">
              <template slot-scope="{ row }"><el-tag v-for="item in row.events" :key="item" size="mini" class="mini-tag">{{ item }}</el-tag></template>
            </el-table-column>
            <el-table-column label="生效防区" min-width="135">
              <template slot-scope="{ row }">{{ row.zones.join('、') }}</template>
            </el-table-column>
            <el-table-column label="目标" width="95">
              <template slot-scope="{ row }">{{ row.targets.join('、') }}</template>
            </el-table-column>
            <el-table-column prop="period" label="生效时段" min-width="120" />
            <el-table-column prop="duration" label="停留/持续" width="92" />
            <el-table-column label="灵敏度" width="110">
              <template slot-scope="{ row }"><el-progress :percentage="row.sensitivity" :show-text="false" :stroke-width="6" /><small class="progress-value">{{ row.sensitivity }}%</small></template>
            </el-table-column>
            <el-table-column prop="source" label="识别来源" min-width="115" />
            <el-table-column label="状态" width="76">
              <template slot-scope="{ row }"><el-tag :type="row.status === '启用' ? 'success' : 'info'" size="mini">{{ row.status }}</el-tag></template>
            </el-table-column>
            <el-table-column label="操作" width="86" fixed="right">
              <template slot-scope="{ row }"><el-button type="text" size="mini" @click="openRule(row)">编辑</el-button></template>
            </el-table-column>
          </el-table>
          <div class="table-pagination">
            <el-pagination
              background
              :current-page="pagination.rules.page"
              :page-size="pagination.rules.size"
              :page-sizes="pageSizeOptions"
              :total="rules.length"
              layout="total, sizes, prev, pager, next, jumper"
              @current-change="pagination.rules.page = $event"
              @size-change="changePageSize('rules', $event)"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane name="health">
          <span slot="label"><i class="el-icon-first-aid-kit"></i> 设备健康 <b class="tab-count danger-count">{{ abnormalDevices.length }}</b></span>
          <div class="table-toolbar">
            <div class="health-summary">
              <span><i class="summary-dot offline"></i>离线 1</span>
              <span><i class="summary-dot fault"></i>故障 2</span>
              <span><i class="summary-dot warning"></i>质量异常 1</span>
            </div>
            <el-button size="small" icon="el-icon-refresh" @click="runDeviceCheck">立即巡检</el-button>
          </div>
          <el-table :data="paginatedDevices" size="small" class="data-table" max-height="360">
            <el-table-column prop="id" label="设备编号" min-width="120" />
            <el-table-column prop="name" label="设备名称" min-width="180" />
            <el-table-column prop="type" label="类型" width="105" />
            <el-table-column prop="zone" label="所属防区" min-width="130" />
            <el-table-column label="在线状态" width="90">
              <template slot-scope="{ row }"><span class="device-status-text" :class="deviceStateClass(row)"><i></i>{{ row.status }}</span></template>
            </el-table-column>
            <el-table-column prop="health" label="健康诊断" min-width="125">
              <template slot-scope="{ row }"><span :class="{ 'health-error': row.health !== '正常' }">{{ row.health }}</span></template>
            </el-table-column>
            <el-table-column label="通信质量" width="140">
              <template slot-scope="{ row }"><el-progress :percentage="row.signal" :status="row.signal < 60 ? 'exception' : undefined" :stroke-width="6" /></template>
            </el-table-column>
            <el-table-column prop="armed" label="布撤防" width="76" />
            <el-table-column prop="updatedAt" label="最近心跳" min-width="150" />
          </el-table>
          <div class="table-pagination">
            <el-pagination
              background
              :current-page="pagination.devices.page"
              :page-size="pagination.devices.size"
              :page-sizes="pageSizeOptions"
              :total="devices.length"
              layout="total, sizes, prev, pager, next, jumper"
              @current-change="pagination.devices.page = $event"
              @size-change="changePageSize('devices', $event)"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </section>

    <el-drawer
      title="告警详情与处置"
      :visible.sync="alarmDrawerVisible"
      size="560px"
      custom-class="alarm-drawer smart-perimeter-alarm-drawer"
      :append-to-body="true"
    >
      <div v-if="currentAlarm" class="alarm-drawer-layout">
        <div class="alarm-detail">
          <div class="detail-hero" :class="alarmLevelClass(currentAlarm.level)">
          <div>
            <span class="detail-level">{{ currentAlarm.level }}告警</span>
            <h3>{{ currentAlarm.type }} · {{ currentAlarm.zone }}</h3>
            <p>{{ currentAlarm.id }}　{{ currentAlarm.time }}</p>
          </div>
          <el-tag :type="alarmTag(currentAlarm.status)">{{ currentAlarm.status }}</el-tag>
        </div>

          <div class="snapshot-box">
          <div class="camera-overlay"><span>CAM-E01　LIVE / EVENT</span><span>{{ currentAlarm.time }}</span></div>
          <div class="snapshot-scene">
            <div class="scene-fence"></div>
            <div class="scene-target"><span>{{ currentAlarm.target }}</span></div>
            <div class="scene-rule">警戒线</div>
          </div>
          <div class="video-controls">
            <i class="el-icon-video-play"></i>
            <div class="video-track"><span></span><b></b></div>
            <span>{{ currentAlarm.video }}</span>
          </div>
        </div>

          <div class="evidence-strip">
          <span><i class="el-icon-picture-outline"></i><b>目标抓拍</b>{{ currentAlarm.snapshot }}</span>
          <span><i class="el-icon-video-camera"></i><b>事件录像</b>{{ currentAlarm.video === '-' ? '无视频' : '前15秒 / 后30秒' }}</span>
          <span><i class="el-icon-link"></i><b>联动结果</b>{{ currentAlarm.linked.length }} 项已执行</span>
        </div>

          <div class="detail-section">
          <h4>告警信息</h4>
          <div class="detail-grid">
            <span><small>目标类型</small><b>{{ currentAlarm.target }}</b></span>
            <span><small>持续时间</small><b>{{ currentAlarm.duration }}</b></span>
            <span><small>触发设备</small><b>{{ currentAlarm.device }}</b></span>
            <span><small>当前处置人</small><b>{{ currentAlarm.assignee }}</b></span>
          </div>
        </div>

          <div class="detail-section">
          <h4>自动联动</h4>
          <div class="linkage-list">
            <span v-for="item in currentAlarm.linked" :key="item"><i class="el-icon-circle-check"></i>{{ item }}</span>
          </div>
        </div>

          <div class="detail-section trace-section">
            <h4>处置记录 <small>不可删除</small></h4>
            <el-timeline>
              <el-timeline-item v-for="(trace, index) in currentAlarm.traces" :key="index" :timestamp="trace.time" placement="top">
                <div class="trace-card"><b>{{ trace.action }}</b><span>{{ trace.user }}</span><p>{{ trace.remark }}</p></div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>

        <div class="drawer-actions">
          <el-button v-if="currentAlarm.status === '待确认'" type="primary" @click="confirmAlarm(currentAlarm)">确认告警</el-button>
          <el-button v-if="canDispatch(currentAlarm)" @click="openDispatch(currentAlarm)">派发任务</el-button>
          <el-button v-if="canHandle(currentAlarm)" @click="openProcess(currentAlarm, '现场处置')">现场处置</el-button>
          <el-button v-if="canMarkFalse(currentAlarm)" @click="openProcess(currentAlarm, '误报标记')">标记误报</el-button>
          <el-button v-if="currentAlarm.status === '待复核'" type="warning" @click="openProcess(currentAlarm, '复核')">复核</el-button>
          <el-button v-if="canClose(currentAlarm)" type="success" @click="openProcess(currentAlarm, '关闭')">关闭告警</el-button>
        </div>
      </div>
    </el-drawer>

    <el-dialog :title="ruleForm.editingId ? '编辑检测规则' : '新增检测规则'" :visible.sync="ruleDialogVisible" width="720px" top="6vh">
      <div class="dialog-intro"><i class="el-icon-set-up"></i><span><b>软件规则配置</b>检测数据由摄像机、雷达、红外对射等前端设备提供，平台完成规则编排、融合判断与告警接收。</span></div>
      <el-form ref="ruleForm" :model="ruleForm" label-width="98px" size="small" class="config-form">
        <el-form-item label="规则名称" required><el-input v-model.trim="ruleForm.name" placeholder="例如：东侧围墙夜间人员翻越" /></el-form-item>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="生效防区" required><el-select v-model="ruleForm.zones" multiple collapse-tags placeholder="选择防区"><el-option v-for="zone in zones" :key="zone.id" :label="zone.name" :value="zone.name" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="识别来源"><el-select v-model="ruleForm.source"><el-option v-for="item in sourceOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col>
        </el-row>
        <el-form-item label="检测行为" required><el-checkbox-group v-model="ruleForm.events"><el-checkbox v-for="item in alarmTypes.slice(0, 5)" :key="item" :label="item" border>{{ item }}</el-checkbox></el-checkbox-group></el-form-item>
        <el-form-item label="目标类型"><el-checkbox-group v-model="ruleForm.targets"><el-checkbox label="人">人</el-checkbox><el-checkbox label="车辆">车辆</el-checkbox><el-checkbox label="非机动车">非机动车</el-checkbox></el-checkbox-group></el-form-item>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="生效模式"><el-radio-group v-model="ruleForm.periodMode"><el-radio-button label="全天">全天</el-radio-button><el-radio-button label="自定义">自定义</el-radio-button></el-radio-group></el-form-item></el-col>
          <el-col :span="12"><el-form-item v-if="ruleForm.periodMode === '自定义'" label="生效时段"><el-time-picker v-model="ruleForm.timeRange" is-range range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="HH:mm" format="HH:mm" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12"><el-form-item label="停留/持续"><el-input-number v-model="ruleForm.duration" :min="1" :max="600" controls-position="right" /><span class="form-unit">秒</span></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="灵敏度"><el-slider v-model="ruleForm.sensitivity" :step="5" show-input input-size="mini" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="联动动作">
          <el-checkbox-group v-model="ruleForm.linkages">
            <el-checkbox label="附近摄像机预置位">附近摄像机预置位</el-checkbox>
            <el-checkbox label="声光/语音设备">声光/语音设备</el-checkbox>
            <el-checkbox label="安保移动端">安保移动端</el-checkbox>
            <el-checkbox label="自动派单">自动派单</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="规则状态"><el-switch v-model="ruleForm.enabled" active-text="启用" inactive-text="停用" /></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="ruleDialogVisible = false">取消</el-button><el-button type="primary" @click="saveRule">保存规则</el-button></span>
    </el-dialog>

    <el-dialog title="布撤防计划" :visible.sync="defenseDialogVisible" width="620px">
      <div class="dialog-intro warning-intro"><i class="el-icon-unlock"></i><span><b>布撤防必须可追溯</b>临时撤防需填写原因、有效时间，到期后系统自动恢复布防并通知值班人员。</span></div>
      <el-form :model="defenseForm" label-width="100px" size="small" class="config-form">
        <el-form-item label="选择防区" required><el-select v-model="defenseForm.zoneIds" multiple placeholder="可选择多个防区"><el-option v-for="zone in zones" :key="zone.id" :label="zone.name + '（' + (zone.armed ? '已布防' : '已撤防') + '）'" :value="zone.id" /></el-select></el-form-item>
        <el-form-item label="执行动作"><el-radio-group v-model="defenseForm.action"><el-radio-button label="布防">布防</el-radio-button><el-radio-button label="临时撤防">临时撤防</el-radio-button></el-radio-group></el-form-item>
        <el-form-item v-if="defenseForm.action === '临时撤防'" label="撤防时段" required><el-date-picker v-model="defenseForm.range" type="datetimerange" range-separator="至" start-placeholder="开始时间" end-placeholder="自动复布时间" value-format="yyyy-MM-dd HH:mm:ss" /></el-form-item>
        <el-form-item label="原因/依据" required><el-input v-model.trim="defenseForm.reason" type="textarea" :rows="3" placeholder="例如：北门道路施工，施工单 SG-20260720-04" /></el-form-item>
        <el-form-item label="通知人员"><el-select v-model="defenseForm.notifiers" multiple><el-option label="值班班长" value="值班班长" /><el-option label="园区安保组" value="园区安保组" /><el-option label="弱电运维" value="弱电运维" /></el-select></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="defenseDialogVisible = false">取消</el-button><el-button type="primary" @click="saveDefensePlan">确认下发</el-button></span>
    </el-dialog>

    <el-dialog title="误报治理策略" :visible.sync="strategyDialogVisible" width="760px" top="6vh">
      <div class="dialog-intro"><i class="el-icon-magic-stick"></i><span><b>按现场场景组合降噪</b>建议优先使用目标分类、排除区域与多传感器复核，避免仅通过大幅降低灵敏度压制告警。</span></div>
      <div class="strategy-list">
        <div v-for="item in strategies" :key="item.scene" class="strategy-item" :class="{ enabled: item.enabled }">
          <span class="strategy-icon"><i :class="item.icon"></i></span>
          <div class="strategy-main"><b>{{ item.scene }}</b><p>{{ item.summary }}</p><el-slider v-model="item.sensitivity" :disabled="!item.enabled" :show-tooltip="false" /></div>
          <div class="strategy-switch"><el-switch v-model="item.enabled" /><small>灵敏度 {{ item.sensitivity }}%</small></div>
        </div>
      </div>
      <el-alert title="当前建议：物流闸口启用“雨雪雾 + 视频雷达双鉴”；北门施工区设置限时排除区域并到期自动复布。" type="warning" :closable="false" show-icon />
      <span slot="footer"><el-button @click="strategyDialogVisible = false">取消</el-button><el-button type="primary" @click="saveStrategies">应用策略</el-button></span>
    </el-dialog>

    <el-dialog title="派发处置任务" :visible.sync="dispatchDialogVisible" width="520px">
      <el-form :model="dispatchForm" label-width="88px" size="small" class="config-form">
        <el-form-item label="告警编号"><span>{{ currentAlarm && currentAlarm.id }}</span></el-form-item>
        <el-form-item label="处置班组" required><el-select v-model="dispatchForm.team"><el-option label="园区安保一组" value="园区安保一组" /><el-option label="园区安保二组" value="园区安保二组" /><el-option label="弱电维保组" value="弱电维保组" /></el-select></el-form-item>
        <el-form-item label="处置人员" required><el-select v-model="dispatchForm.handler"><el-option label="张伟" value="张伟" /><el-option label="王强" value="王强" /><el-option label="赵峰" value="赵峰" /></el-select></el-form-item>
        <el-form-item label="到场时限"><el-input-number v-model="dispatchForm.deadline" :min="3" :max="60" /><span class="form-unit">分钟</span></el-form-item>
        <el-form-item label="处置要求"><el-input v-model="dispatchForm.note" type="textarea" :rows="3" placeholder="现场核实、上传照片并反馈处置结果" /></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="dispatchDialogVisible = false">取消</el-button><el-button type="primary" @click="submitDispatch">派发并推送移动端</el-button></span>
    </el-dialog>

    <el-dialog :title="processForm.action" :visible.sync="processDialogVisible" width="520px">
      <el-form :model="processForm" label-width="92px" size="small" class="config-form">
        <el-form-item label="告警编号"><span>{{ currentAlarm && currentAlarm.id }}</span></el-form-item>
        <el-form-item v-if="processForm.action === '误报标记'" label="误报场景" required><el-select v-model="processForm.result"><el-option v-for="item in falseAlarmReasons" :key="item" :label="item" :value="item" /></el-select></el-form-item>
        <el-form-item v-else-if="processForm.action === '复核'" label="复核结论" required><el-radio-group v-model="processForm.result"><el-radio label="通过">通过</el-radio><el-radio label="退回">退回补充处置</el-radio></el-radio-group></el-form-item>
        <el-form-item v-else-if="processForm.action === '关闭'" label="关闭依据"><span>已完成处置/误报标记及复核，记录完整</span></el-form-item>
        <el-form-item label="处置说明" required><el-input v-model.trim="processForm.remark" type="textarea" :rows="4" placeholder="请填写现场情况、处理动作、复核依据等，保存后不可删除" /></el-form-item>
        <el-form-item v-if="processForm.action === '现场处置'" label="现场凭证"><el-upload action="#" :auto-upload="false" :limit="3"><el-button size="small" icon="el-icon-upload2">上传照片/视频</el-button><div slot="tip" class="el-upload__tip">仿真模式：选择文件后仅展示文件名</div></el-upload></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="processDialogVisible = false">取消</el-button><el-button type="primary" @click="submitProcess">保存处置记录</el-button></span>
    </el-dialog>
  </div>
</template>

<script>
import IotWorkspaceHeader from '../components/IotWorkspaceHeader.vue'
import IotWorkspaceNav from '../components/IotWorkspaceNav.vue'
import { perimeter } from '../mock/iotMockData'

export default {
  name: 'SmartIOTPerimeter',
  components: { IotWorkspaceHeader, IotWorkspaceNav },
  data() {
    return {
      kpis: perimeter.kpis,
      buildings: perimeter.buildings,
      zones: JSON.parse(JSON.stringify(perimeter.zones)),
      devices: JSON.parse(JSON.stringify(perimeter.devices)),
      rules: JSON.parse(JSON.stringify(perimeter.rules)),
      strategies: JSON.parse(JSON.stringify(perimeter.strategies)),
      alarms: JSON.parse(JSON.stringify(perimeter.alarms)),
      activeZoneId: 'all',
      mapLayers: ['设备', '告警'],
      selectedDevice: null,
      managementTab: 'overview',
      alarmDrawerVisible: false,
      currentAlarm: null,
      alarmQuery: { keyword: '', type: '', status: '' },
      alarmTypes: ['越界', '攀爬', '翻越', '区域入侵', '长时间徘徊', '设备离线', '设备遮挡', '设备拆动', '通信故障'],
      alarmStatuses: ['待确认', '处置中', '派单中', '待复核', '复核通过', '误报', '已关闭'],
      sourceOptions: ['视频', '雷达', '红外', '视频+雷达', '雷达+红外', '视频+雷达+红外'],
      falseAlarmReasons: ['绿植摇摆', '小动物', '雨雪雾', '强光逆光', '施工人员/车辆', '设备抖动', '其他'],
      ruleDialogVisible: false,
      ruleForm: {
        editingId: '',
        name: '',
        zones: [],
        source: '视频+雷达',
        events: ['越界'],
        targets: ['人'],
        periodMode: '全天',
        timeRange: ['20:00', '07:00'],
        duration: 3,
        sensitivity: 80,
        linkages: ['附近摄像机预置位', '声光/语音设备', '安保移动端'],
        enabled: true
      },
      defenseDialogVisible: false,
      defenseForm: {
        zoneIds: [],
        action: '临时撤防',
        range: ['2026-07-20 11:00:00', '2026-07-20 18:00:00'],
        reason: '',
        notifiers: ['值班班长', '园区安保组']
      },
      strategyDialogVisible: false,
      dispatchDialogVisible: false,
      dispatchForm: { team: '园区安保一组', handler: '', deadline: 10, note: '现场核实告警目标，上传现场照片并反馈处置结果。' },
      processDialogVisible: false,
      processForm: { action: '', result: '', remark: '' },
      pageSizeOptions: [5, 10, 20],
      pagination: {
        alarms: { page: 1, size: 5 },
        rules: { page: 1, size: 5 },
        devices: { page: 1, size: 5 }
      }
    }
  },
  computed: {
    workspaceNav() {
      return [
        { key: 'overview', title: '周界总览', description: '防区、设备与告警', detail: '查看围墙、围栏、出入口、防区设备状态和实时告警位置。', icon: 'el-icon-data-analysis', count: null },
        { key: 'alarms', title: '告警处置', description: '确认、派单与复核', detail: '集中处置越界、攀爬、翻越、入侵、徘徊和设备异常告警。', icon: 'el-icon-warning-outline', count: this.liveAlarms.length, danger: this.liveAlarms.length > 0 },
        { key: 'rules', title: '检测规则', description: '区域、目标与联动', detail: '配置生效防区、时段、目标类型、停留时间、灵敏度和联动设备。', icon: 'el-icon-setting', count: this.rules.length },
        { key: 'health', title: '设备健康', description: '在线、故障与巡检', detail: '监测摄像机、雷达、红外和声光设备的在线及健康状态。', icon: 'el-icon-cpu', count: this.abnormalDevices.length, danger: this.abnormalDevices.length > 0 }
      ]
    },
    currentWorkspace() {
      return this.workspaceNav.find((item) => item.key === this.managementTab) || this.workspaceNav[0]
    },
    filteredMapDevices() {
      if (this.activeZoneId === 'all') return this.devices
      return this.devices.filter((item) => item.zoneId === this.activeZoneId)
    },
    mapAlarms() {
      return this.liveAlarms.filter((item) => this.activeZoneId === 'all' || item.zoneId === this.activeZoneId)
    },
    liveAlarms() {
      return this.alarms.filter((item) => ['已关闭', '误报'].indexOf(item.status) === -1)
    },
    filteredAlarms() {
      const keyword = this.alarmQuery.keyword.toLowerCase()
      return this.alarms.filter((item) => {
        const matchesKeyword = !keyword || [item.id, item.zone, item.device, item.type].join(' ').toLowerCase().indexOf(keyword) > -1
        const matchesType = !this.alarmQuery.type || item.type === this.alarmQuery.type
        const matchesStatus = !this.alarmQuery.status || item.status === this.alarmQuery.status
        return matchesKeyword && matchesType && matchesStatus
      })
    },
    paginatedAlarms() {
      const start = (this.pagination.alarms.page - 1) * this.pagination.alarms.size
      return this.filteredAlarms.slice(start, start + this.pagination.alarms.size)
    },
    paginatedRules() {
      const start = (this.pagination.rules.page - 1) * this.pagination.rules.size
      return this.rules.slice(start, start + this.pagination.rules.size)
    },
    paginatedDevices() {
      const start = (this.pagination.devices.page - 1) * this.pagination.devices.size
      return this.devices.slice(start, start + this.pagination.devices.size)
    },
    abnormalDevices() {
      return this.devices.filter((item) => item.status !== '在线' || item.health !== '正常')
    }
  },
  watch: {
    alarmQuery: {
      deep: true,
      handler() {
        this.pagination.alarms.page = 1
      }
    }
  },
  methods: {
    openWorkspace(view) {
      if (!this.workspaceNav.some((item) => item.key === view)) return
      this.managementTab = view
      this.handleWorkspaceChange()
    },
    handleWorkspaceChange() {
      this.$nextTick(() => {
        const content = this.$refs.workspaceContent
        if (content && typeof content.focus === 'function') content.focus({ preventScroll: true })
      })
    },
    zoneStateClass(zone) {
      if (!zone.armed) return 'disarmed'
      if (zone.status === '设备故障') return 'fault'
      return 'armed'
    },
    deviceStateClass(device) {
      if (device.status === '在线' && device.health === '正常') return 'online'
      if (device.status === '离线') return 'offline'
      if (device.status === '故障') return 'fault'
      return 'warning'
    },
    deviceIcon(type) {
      const icons = {
        摄像机: 'el-icon-video-camera',
        雷达: 'el-icon-aim',
        红外对射: 'el-icon-full-screen',
        声光报警器: 'el-icon-bell'
      }
      return icons[type] || 'el-icon-cpu'
    },
    alarmLevelClass(level) {
      const map = { 紧急: 'level-critical', 重要: 'level-major', 一般: 'level-normal', 故障: 'level-fault' }
      return map[level] || 'level-normal'
    },
    alarmTag(status) {
      const map = { 待确认: 'danger', 处置中: 'warning', 派单中: '', 待复核: 'warning', 复核通过: 'success', 误报: 'info', 已关闭: 'success' }
      return map[status] || ''
    },
    changePageSize(type, size) {
      this.pagination[type].size = size
      this.pagination[type].page = 1
    },
    selectZone(id) {
      this.activeZoneId = id
      this.selectedDevice = null
    },
    selectDevice(device) {
      this.selectedDevice = device
    },
    refreshMap() {
      this.$message.success('周界设备状态与告警位置已同步')
    },
    viewAllAlarms() {
      this.alarmQuery = { keyword: '', type: '', status: '' }
      this.openWorkspace('alarms')
    },
    openAlarm(alarm) {
      this.currentAlarm = alarm
      this.activeZoneId = alarm.zoneId
      this.alarmDrawerVisible = true
    },
    currentTime() {
      const date = new Date()
      return [date.getHours(), date.getMinutes(), date.getSeconds()].map((item) => String(item).padStart(2, '0')).join(':')
    },
    addTrace(alarm, action, remark) {
      alarm.traces.push({ time: this.currentTime(), action, user: '当前值班员', remark })
    },
    confirmAlarm(alarm) {
      alarm.status = '处置中'
      alarm.response = '已确认，等待派发任务'
      this.addTrace(alarm, '告警确认', '值班员已确认告警，进入处置流程')
      this.$message.success('告警已确认，处置记录已保存')
    },
    canDispatch(alarm) {
      return ['处置中', '派单中'].indexOf(alarm.status) > -1
    },
    canHandle(alarm) {
      return ['处置中', '派单中'].indexOf(alarm.status) > -1
    },
    canMarkFalse(alarm) {
      return ['待确认', '处置中', '派单中'].indexOf(alarm.status) > -1
    },
    canClose(alarm) {
      return ['复核通过', '误报'].indexOf(alarm.status) > -1
    },
    openDispatch(alarm) {
      this.currentAlarm = alarm
      this.dispatchForm = { team: '园区安保一组', handler: '', deadline: 10, note: '现场核实告警目标，上传现场照片并反馈处置结果。' }
      this.dispatchDialogVisible = true
    },
    submitDispatch() {
      if (!this.dispatchForm.team || !this.dispatchForm.handler) {
        this.$message.warning('请选择处置班组和处置人员')
        return
      }
      this.currentAlarm.status = '派单中'
      this.currentAlarm.assignee = this.dispatchForm.handler + '（' + this.dispatchForm.team + '）'
      this.currentAlarm.response = '到场剩余 ' + this.dispatchForm.deadline + ':00'
      this.addTrace(this.currentAlarm, '任务派发', '已派给' + this.currentAlarm.assignee + '；要求：' + this.dispatchForm.note)
      this.dispatchDialogVisible = false
      this.$message.success('处置任务已派发并推送至安保移动端')
    },
    openProcess(alarm, action) {
      this.currentAlarm = alarm
      this.processForm = { action, result: action === '复核' ? '通过' : '', remark: '' }
      this.processDialogVisible = true
    },
    submitProcess() {
      if (!this.processForm.remark) {
        this.$message.warning('请填写处置说明，确保告警全流程留痕')
        return
      }
      if (this.processForm.action === '误报标记' && !this.processForm.result) {
        this.$message.warning('请选择误报场景')
        return
      }
      const alarm = this.currentAlarm
      if (this.processForm.action === '现场处置') {
        alarm.status = '待复核'
        alarm.response = '现场处置完成，等待班长复核'
        this.addTrace(alarm, '现场处置', this.processForm.remark)
      } else if (this.processForm.action === '误报标记') {
        alarm.status = '误报'
        alarm.response = '已标记' + this.processForm.result + '误报'
        this.addTrace(alarm, '误报标记', this.processForm.result + '；' + this.processForm.remark + '；样本已进入算法优化池')
      } else if (this.processForm.action === '复核') {
        if (this.processForm.result === '通过') {
          alarm.status = '复核通过'
          alarm.response = '复核通过，可关闭告警'
        } else {
          alarm.status = '处置中'
          alarm.response = '复核退回，需补充现场处置'
        }
        this.addTrace(alarm, '处置复核', this.processForm.result + '；' + this.processForm.remark)
      } else if (this.processForm.action === '关闭') {
        alarm.status = '已关闭'
        alarm.response = '处置闭环完成'
        this.addTrace(alarm, '告警关闭', this.processForm.remark)
      }
      this.processDialogVisible = false
      this.$message.success(this.processForm.action + '已保存，审计记录不可删除')
    },
    resetRuleForm() {
      this.ruleForm = {
        editingId: '',
        name: '',
        zones: [],
        source: '视频+雷达',
        events: ['越界'],
        targets: ['人'],
        periodMode: '全天',
        timeRange: ['20:00', '07:00'],
        duration: 3,
        sensitivity: 80,
        linkages: ['附近摄像机预置位', '声光/语音设备', '安保移动端'],
        enabled: true
      }
    },
    openRule(row) {
      this.resetRuleForm()
      if (row) {
        this.ruleForm.editingId = row.id
        this.ruleForm.name = row.name
        this.ruleForm.zones = row.zones.slice()
        this.ruleForm.source = row.source
        this.ruleForm.events = row.events.slice()
        this.ruleForm.targets = row.targets.slice()
        this.ruleForm.periodMode = row.period === '全天' ? '全天' : '自定义'
        this.ruleForm.timeRange = row.period === '全天' ? ['20:00', '07:00'] : row.period.split(' - ')
        this.ruleForm.duration = parseInt(row.duration, 10)
        this.ruleForm.sensitivity = row.sensitivity
        this.ruleForm.enabled = row.status === '启用'
      }
      this.ruleDialogVisible = true
    },
    saveRule() {
      if (!this.ruleForm.name || !this.ruleForm.zones.length || !this.ruleForm.events.length) {
        this.$message.warning('请完善规则名称、生效防区和检测行为')
        return
      }
      const row = {
        id: this.ruleForm.editingId || 'R-' + String(this.rules.length + 1).padStart(3, '0'),
        name: this.ruleForm.name,
        zones: this.ruleForm.zones.slice(),
        events: this.ruleForm.events.slice(),
        targets: this.ruleForm.targets.slice(),
        period: this.ruleForm.periodMode === '全天' ? '全天' : this.ruleForm.timeRange.join(' - '),
        duration: this.ruleForm.duration + ' 秒',
        sensitivity: this.ruleForm.sensitivity,
        source: this.ruleForm.source,
        status: this.ruleForm.enabled ? '启用' : '暂停',
        updatedAt: '2026-07-20 10:30'
      }
      if (this.ruleForm.editingId) {
        const index = this.rules.findIndex((item) => item.id === this.ruleForm.editingId)
        this.$set(this.rules, index, row)
      } else {
        this.rules.unshift(row)
      }
      this.ruleDialogVisible = false
      this.openWorkspace('rules')
      this.$message.success('检测规则已保存并下发至对应前端设备')
    },
    saveDefensePlan() {
      if (!this.defenseForm.zoneIds.length || !this.defenseForm.reason) {
        this.$message.warning('请选择防区并填写布撤防原因')
        return
      }
      const armed = this.defenseForm.action === '布防'
      this.zones.forEach((zone) => {
        if (this.defenseForm.zoneIds.indexOf(zone.id) > -1) {
          zone.armed = armed
          zone.status = armed ? '正常' : '临时撤防'
        }
      })
      this.devices.forEach((device) => {
        if (this.defenseForm.zoneIds.indexOf(device.zoneId) > -1) device.armed = armed ? '布防' : '撤防'
      })
      this.defenseDialogVisible = false
      this.$message.success('布撤防计划已下发，并生成操作审计记录')
    },
    saveStrategies() {
      this.strategyDialogVisible = false
      this.$message.success('误报治理策略已应用，参数变更已记录')
    },
    runDeviceCheck() {
      this.$message.success('设备巡检任务已下发，预计 30 秒内返回结果')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../components/iotWorkspacePage.scss';
.perimeter-page {
  --primary: #2468f2;
  --primary-soft: #edf4ff;
  --text: #1d2a3b;
  --muted: #7c899b;
  --line: #e8edf4;
  min-height: 100%;
  padding: 18px;
  color: var(--text);
  background: #f2f5f9;
  box-sizing: border-box;
}

button {
  font-family: inherit;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.title-line {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-line h2 {
  margin: 0;
  font-size: 22px;
  line-height: 30px;
  letter-spacing: 0.5px;
}

.page-header p {
  margin: 3px 0 0;
  color: var(--muted);
  font-size: 13px;
}

.running-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  color: #16875d;
  background: #e9f8f2;
  border: 1px solid #c8ecde;
  border-radius: 12px;
  font-size: 12px;
}

.running-badge i {
  width: 6px;
  height: 6px;
  background: #20bf82;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(32, 191, 130, 0.12);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.kpi-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 88px;
  padding: 14px;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 8px;
  box-sizing: border-box;
}

.kpi-card::after {
  position: absolute;
  right: -17px;
  bottom: -26px;
  width: 70px;
  height: 70px;
  background: currentColor;
  border-radius: 50%;
  opacity: 0.04;
  content: '';
}

.kpi-icon {
  display: flex;
  flex: 0 0 38px;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  color: #2468f2;
  background: #edf4ff;
  border-radius: 9px;
  font-size: 19px;
}

.kpi-content {
  min-width: 0;
}

.kpi-title,
.kpi-sub {
  display: block;
  overflow: hidden;
  color: var(--muted);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kpi-number {
  margin: 3px 0 2px;
  color: #172235;
  font-size: 23px;
  font-weight: 700;
  line-height: 25px;
}

.kpi-number small {
  margin-left: 4px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 400;
}

.is-success .kpi-icon { color: #14a36f; background: #e9f8f2; }
.is-danger .kpi-icon { color: #ed4e4e; background: #fff0f0; }
.is-warning .kpi-icon { color: #e58a13; background: #fff6e8; }
.is-info .kpi-icon { color: #69778c; background: #f0f2f6; }
.is-cyan .kpi-icon { color: #168ba0; background: #e8f8fa; }

.surface {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(34, 52, 78, 0.03);
}

.situation-grid {
  display: grid;
  grid-template-columns: minmax(760px, 1fr) 315px;
  height: var(--iot-overview-height);
  align-items: stretch;
  gap: 12px;
  margin-bottom: 12px;
}

.surface-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 58px;
  padding: 0 16px;
  border-bottom: 1px solid var(--line);
  box-sizing: border-box;
}

.surface-title {
  color: #1a283c;
  font-size: 15px;
  font-weight: 600;
}

.surface-title > i {
  margin-right: 6px;
  color: var(--primary);
}

.surface-subtitle {
  display: block;
  margin-top: 3px;
  color: #92a0b2;
  font-size: 11px;
}

.map-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}

.map-workbench {
  display: grid;
  grid-template-columns: 188px minmax(560px, 1fr);
  min-height: 0;
  flex: 1 1 auto;
}
.map-card { display: flex; min-height: 0; flex-direction: column; }

.zone-rail {
  padding: 10px 8px;
  overflow-y: auto;
  background: #fbfcfe;
  border-right: 1px solid var(--line);
}

.rail-label {
  padding: 2px 8px 8px;
  color: #9aa6b7;
  font-size: 11px;
}

.zone-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 9px;
  padding: 9px 8px;
  color: #647287;
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.zone-item:hover,
.zone-item.active {
  color: var(--primary);
  background: var(--primary-soft);
}

.zone-icon {
  display: flex;
  flex: 0 0 27px;
  align-items: center;
  justify-content: center;
  width: 27px;
  height: 27px;
  color: #1aaa75;
  background: #e8f8f2;
  border-radius: 6px;
}

.zone-icon.disarmed { color: #8b98aa; background: #edf0f4; }
.zone-icon.fault { color: #e55151; background: #fff0f0; }
.zone-icon.all { color: #2468f2; background: #e9f1ff; }

.zone-info {
  display: block;
  min-width: 0;
  flex: 1;
}

.zone-info b,
.zone-info small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.zone-info b {
  color: #314057;
  font-size: 12px;
  font-weight: 600;
}

.zone-info small {
  margin-top: 3px;
  color: #9aa6b7;
  font-size: 10px;
}

.zone-item.active .zone-info b { color: var(--primary); }
.zone-item > .el-icon-arrow-right { font-size: 10px; }

.campus-map {
  position: relative;
  overflow: hidden;
  background: #eaf0ea;
}

.map-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(75, 111, 92, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(75, 111, 92, 0.06) 1px, transparent 1px);
  background-size: 24px 24px;
}

.road {
  position: absolute;
  z-index: 1;
  background: #d5ddd7;
  box-shadow: inset 0 0 0 1px rgba(92, 112, 99, 0.05);
}

.road::after {
  position: absolute;
  border-color: rgba(255, 255, 255, 0.85);
  border-style: dashed;
  content: '';
}

.road-horizontal { left: 7%; right: 6%; top: 51%; height: 8%; }
.road-horizontal::after { left: 0; right: 0; top: 50%; border-width: 1px 0 0; }
.road-vertical { top: 8%; bottom: 8%; left: 47%; width: 6%; }
.road-vertical::after { top: 0; bottom: 0; left: 50%; border-width: 0 0 0 1px; }

.campus-building {
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7a70;
  background: linear-gradient(145deg, #d2dbd5, #c5d0c9);
  border: 1px solid rgba(90, 112, 98, 0.16);
  border-radius: 4px;
  box-shadow: 5px 6px 0 rgba(88, 111, 96, 0.09);
  transform: translate(-50%, -50%);
}

.campus-building i {
  margin-right: 5px;
  font-size: 14px;
}

.campus-building span {
  font-size: 11px;
  font-weight: 600;
}

.fence-segment {
  position: absolute;
  z-index: 3;
  background: #1bb87c;
  border-radius: 3px;
  box-shadow: 0 0 0 3px rgba(27, 184, 124, 0.12);
  transition: opacity 0.2s;
}

.fence-segment.disarmed { background: #98a3b2; box-shadow: 0 0 0 3px rgba(152, 163, 178, 0.14); }
.fence-segment.fault { background: #ef5b5b; box-shadow: 0 0 0 3px rgba(239, 91, 91, 0.14); }
.fence-segment.muted { opacity: 0.2; }

.zone-map-label {
  position: absolute;
  z-index: 5;
  padding: 2px 6px;
  color: #147651;
  background: rgba(237, 252, 246, 0.9);
  border: 1px solid rgba(27, 184, 124, 0.25);
  border-radius: 3px;
  font-size: 9px;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: opacity 0.2s;
}

.zone-map-label.disarmed { color: #687589; background: #f3f5f7; border-color: #c8d0da; }
.zone-map-label.fault { color: #c13c3c; background: #fff2f2; border-color: #f2bdbd; }
.zone-map-label.muted { opacity: 0.25; }

.device-marker {
  position: absolute;
  z-index: 8;
  display: flex;
  width: 27px;
  height: 27px;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #1aaa75;
  border: 2px solid rgba(255, 255, 255, 0.94);
  border-radius: 50% 50% 50% 6px;
  box-shadow: 0 2px 7px rgba(28, 60, 44, 0.25);
  transform: translate(-50%, -50%) rotate(-45deg);
  cursor: pointer;
}

.device-marker i { font-size: 12px; transform: rotate(45deg); }
.device-marker.offline { background: #8895a6; }
.device-marker.fault { background: #e95050; }
.device-marker.warning { background: #e49a2a; }
.device-marker.selected { box-shadow: 0 0 0 5px rgba(36, 104, 242, 0.2), 0 2px 7px rgba(28, 60, 44, 0.25); }

.alarm-marker {
  position: absolute;
  z-index: 7;
  width: 34px;
  height: 34px;
  padding: 0;
  color: #fff;
  background: #ed4e4e;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 2px 9px rgba(208, 48, 48, 0.35);
  transform: translate(17px, -26px);
  cursor: pointer;
}

.alarm-marker span {
  position: absolute;
  inset: -7px;
  border: 2px solid rgba(237, 78, 78, 0.48);
  border-radius: 50%;
  animation: alarm-pulse 1.8s infinite;
}

@keyframes alarm-pulse {
  0% { opacity: 0.8; transform: scale(0.75); }
  100% { opacity: 0; transform: scale(1.35); }
}

.map-device-card {
  position: absolute;
  z-index: 20;
  right: 14px;
  top: 14px;
  width: 255px;
  padding: 13px;
  background: rgba(255, 255, 255, 0.97);
  border: 1px solid #dfe6ee;
  border-radius: 7px;
  box-shadow: 0 8px 22px rgba(35, 55, 76, 0.16);
  box-sizing: border-box;
}

.mini-close {
  position: absolute;
  right: 8px;
  top: 8px;
  color: #9ba6b5;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.device-card-title { display: flex; align-items: center; gap: 9px; padding-right: 18px; }
.device-card-title b, .device-card-title small { display: block; }
.device-card-title b { font-size: 12px; }
.device-card-title small { margin-top: 2px; color: #9aa6b7; font-size: 10px; }
.device-avatar { display: flex; width: 32px; height: 32px; align-items: center; justify-content: center; color: #fff; background: #1aaa75; border-radius: 7px; }
.device-avatar.offline { background: #8895a6; }
.device-avatar.fault { background: #e95050; }
.device-avatar.warning { background: #e49a2a; }
.device-card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
.device-card-grid span { color: #9aa6b7; font-size: 10px; }
.device-card-grid b { display: block; margin-top: 2px; color: #405069; font-size: 11px; }
.device-card-grid .text-online { color: #149767; }
.device-card-grid .text-offline, .device-card-grid .text-fault { color: #df4949; }
.device-card-foot { margin: 10px -13px -13px; padding: 8px 13px; color: #8c99aa; background: #f7f9fb; border-radius: 0 0 7px 7px; font-size: 9px; }

.map-compass { position: absolute; z-index: 4; right: 15px; bottom: 18px; display: flex; flex-direction: column; align-items: center; color: #607164; font-size: 11px; }
.map-compass i { color: #2e6d4a; font-size: 22px; }
.map-scale { position: absolute; z-index: 4; left: 16px; bottom: 17px; display: flex; align-items: flex-end; gap: 6px; color: #6f7c73; font-size: 9px; }
.map-scale i { display: inline-block; width: 50px; height: 5px; border: solid #64766a; border-width: 0 1px 1px; }

.map-legend {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 36px;
  padding: 0 14px;
  color: #7e8b9d;
  border-top: 1px solid var(--line);
  font-size: 10px;
}

.legend-dot,
.summary-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 5px;
  border-radius: 50%;
}

.legend-dot.online, .summary-dot.online { background: #1aaa75; }
.legend-dot.offline, .summary-dot.offline { background: #8c98a8; }
.legend-dot.fault, .summary-dot.fault { background: #e95050; }
.summary-dot.warning { background: #e39a29; }
.legend-line { display: inline-block; width: 16px; height: 3px; margin: 0 5px 2px 0; border-radius: 2px; }
.legend-line.armed { background: #1aaa75; }
.legend-line.disarmed { background: #98a3b2; }
.legend-right { margin-left: auto; color: #94a1b1; }
.legend-right i { margin-right: 4px; color: #1aaa75; }

.alarm-stream { display: flex; min-width: 0; min-height: 0; flex-direction: column; overflow: hidden; }
.alarm-head .el-button { padding: 0; font-size: 13px; }
.alarm-list { min-height: 0; flex: 1 1 auto; padding: 11px; overflow-y: auto; box-sizing: border-box; }
.alarm-item {
  position: relative;
  display: block;
  width: 100%;
  min-height: 112px;
  margin-bottom: 10px;
  padding: 13px 12px 11px 16px;
  color: #526178;
  text-align: left;
  background: #fbfcfe;
  border: 1px solid #edf0f5;
  border-radius: 6px;
  cursor: pointer;
}

.alarm-item::before { position: absolute; left: 0; top: 13px; bottom: 13px; width: 3px; background: #e95656; border-radius: 0 3px 3px 0; content: ''; }
.alarm-item:hover { background: #f7faff; border-color: #cbdaf5; }
.alarm-item.level-major::before { background: #ef9f28; }
.alarm-item.level-normal::before { background: #2e7aec; }
.alarm-item.level-fault::before { background: #8a96a7; }
.alarm-item-top, .alarm-meta { display: flex; align-items: center; justify-content: space-between; }
.alarm-type { color: #26364d; font-size: 14px; font-weight: 600; line-height: 22px; }
.alarm-type i { margin-right: 6px; color: #ea5050; }
.alarm-item.level-major .alarm-type i { color: #e99122; }
.alarm-time { color: #8997aa; font-size: 12px !important; line-height: 20px; font-variant-numeric: tabular-nums; }
.alarm-zone { margin: 9px 0 8px; color: #5f6f86; font-size: 13px; line-height: 20px; }
.alarm-zone i { margin-right: 5px; color: #8290a3; }
.alarm-meta { color: #7f8ca0; font-size: 12px; line-height: 22px; }
::v-deep .alarm-meta .el-tag { height: 24px; padding: 0 8px; font-size: 12px; line-height: 22px; }
.alarm-response { margin-top: 9px; padding-top: 8px; color: #66758c; border-top: 1px dashed #e5eaf0; font-size: 12px; line-height: 19px; }
.alarm-response i { margin-right: 6px; }
.alarm-response.overdue { color: #e34848; }
.alarm-stream-foot { display: flex; min-height: 44px; align-items: center; padding: 0 12px; color: #7f8da1; background: #fafbfd; border-top: 1px solid var(--line); font-size: 12px; line-height: 18px; }
.alarm-stream-foot i { margin-right: 6px; color: var(--primary); }

.management-card { padding: 0 16px 14px; overflow: hidden; }
.table-toolbar { display: flex; min-height: 48px; align-items: center; justify-content: space-between; gap: 12px; }
.table-pagination { display: flex; min-height: 50px; align-items: center; justify-content: flex-end; padding-top: 8px; overflow-x: auto; box-sizing: border-box; }
.filter-group { display: flex; gap: 8px; }
.filter-group .el-input { width: 230px; }
.filter-group .el-select { width: 130px; }
.toolbar-note { color: #8794a6; font-size: 11px; }
.toolbar-note i { margin-right: 5px; color: #1aaa75; }
.primary-note { color: #66758b; }
.primary-note i { color: var(--primary); }
.health-summary { display: flex; gap: 18px; color: #65748a; font-size: 12px; }
.tab-count { display: inline-block; min-width: 17px; height: 17px; margin-left: 3px; color: #65738a; line-height: 17px; text-align: center; background: #edf0f5; border-radius: 9px; font-size: 10px; }
.danger-count { color: #d74747; background: #fff0f0; }
.mini-tag { margin: 1px 3px 1px 0; }
.progress-value { float: right; margin-top: -14px; color: #78869a; font-size: 9px; }
.evidence-link { color: #3172dc; font-size: 11px; }
.evidence-link i { margin-right: 4px; }
.level-pill { display: inline-block; padding: 2px 7px; color: #2f74dc; background: #edf4ff; border-radius: 10px; font-size: 10px; }
.level-pill.level-critical { color: #d83d3d; background: #fff0f0; }
.level-pill.level-major { color: #cd7a12; background: #fff5e7; }
.level-pill.level-fault { color: #6f7b8d; background: #eef0f3; }
.device-status-text { color: #199a6a; font-size: 11px; }
.device-status-text i { display: inline-block; width: 6px; height: 6px; margin-right: 5px; background: currentColor; border-radius: 50%; }
.device-status-text.offline, .device-status-text.fault { color: #df4d4d; }
.device-status-text.warning { color: #d98d22; }
.health-error { color: #df4d4d; }

.dialog-intro { display: flex; align-items: flex-start; gap: 10px; margin: -4px 0 20px; padding: 11px 13px; color: #58708e; background: #f1f6ff; border: 1px solid #dce9ff; border-radius: 6px; font-size: 12px; line-height: 19px; }
.dialog-intro > i { margin-top: 2px; color: var(--primary); font-size: 17px; }
.dialog-intro b { display: block; color: #30496c; }
.warning-intro { background: #fff8ed; border-color: #f5dfbb; }
.warning-intro > i { color: #df8a1f; }
.warning-intro b { color: #8c5b1c; }
.config-form .el-select, .config-form .el-date-editor--datetimerange, .config-form .el-time-editor { width: 100%; }
.config-form .el-checkbox.is-bordered { margin: 0 6px 5px 0; }
.form-unit { margin-left: 7px; color: #8e9aac; font-size: 11px; }

.strategy-list { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
.strategy-item { display: grid; grid-template-columns: 35px 1fr 70px; gap: 10px; min-height: 96px; padding: 12px; background: #fafbfc; border: 1px solid #e9edf2; border-radius: 7px; box-sizing: border-box; }
.strategy-item.enabled { background: #f7faff; border-color: #d9e5fa; }
.strategy-icon { display: flex; width: 34px; height: 34px; align-items: center; justify-content: center; color: #63738b; background: #edf0f4; border-radius: 7px; }
.strategy-item.enabled .strategy-icon { color: var(--primary); background: #e9f1ff; }
.strategy-main b { color: #324159; font-size: 12px; }
.strategy-main p { min-height: 32px; margin: 4px 0 0; color: #8996a8; font-size: 10px; line-height: 16px; }
.strategy-main .el-slider { height: 18px; }
.strategy-switch { display: flex; flex-direction: column; align-items: flex-end; gap: 11px; }
.strategy-switch small { color: #929eae; font-size: 9px; white-space: nowrap; }

.alarm-drawer-layout { display: flex; height: 100%; min-height: 0; flex-direction: column; }
.alarm-detail { min-height: 0; flex: 1 1 auto; padding: 0 20px 28px; overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable; box-sizing: border-box; }
.detail-hero { display: flex; align-items: center; justify-content: space-between; margin: 0 -20px 14px; padding: 16px 20px; background: #fff5f5; border-top: 3px solid #e84e4e; }
.detail-hero.level-major { background: #fff8ef; border-color: #ee9824; }
.detail-hero.level-fault { background: #f5f6f8; border-color: #7d899a; }
.detail-hero h3 { margin: 5px 0; color: #26364d; font-size: 17px; }
.detail-hero p { margin: 0; color: #8996a8; font-size: 10px; }
.detail-level { color: #d93f3f; font-size: 11px; }
.snapshot-box { overflow: hidden; background: #19242d; border-radius: 7px; }
.camera-overlay { display: flex; align-items: center; justify-content: space-between; padding: 8px 11px; color: #9db4c4; background: #131c23; font-family: monospace; font-size: 9px; }
.snapshot-scene { position: relative; height: 210px; overflow: hidden; background: linear-gradient(165deg, #40565b 0%, #26373b 48%, #1e292c 100%); }
.snapshot-scene::before { position: absolute; inset: 20px 0 0; background-image: linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px); background-size: 100% 36px; content: ''; }
.scene-fence { position: absolute; left: 5%; right: 5%; bottom: 45px; height: 70px; border: solid rgba(185, 203, 199, 0.6); border-width: 2px 0; transform: skewY(-3deg); }
.scene-fence::after { position: absolute; inset: 0; background: repeating-linear-gradient(55deg, transparent 0 14px, rgba(190, 208, 204, 0.35) 15px 16px); content: ''; }
.scene-target { position: absolute; left: 63%; top: 37px; width: 46px; height: 118px; border: 2px solid #f15353; box-sizing: border-box; }
.scene-target::before { position: absolute; left: 12px; top: 7px; width: 17px; height: 17px; background: rgba(215, 225, 220, 0.75); border-radius: 50%; content: ''; }
.scene-target::after { position: absolute; left: 8px; top: 29px; width: 25px; height: 68px; background: rgba(195, 209, 204, 0.62); border-radius: 10px 10px 2px 2px; content: ''; }
.scene-target span { position: absolute; left: -2px; top: -19px; padding: 2px 5px; color: #fff; background: #ed4e4e; font-size: 9px; }
.scene-rule { position: absolute; left: 8%; right: 8%; bottom: 57px; color: #f5b747; border-top: 2px dashed rgba(245, 183, 71, 0.9); font-size: 9px; }
.video-controls { display: flex; align-items: center; gap: 10px; padding: 9px 11px; color: #b5c3cc; font-size: 9px; }
.video-controls > i { color: #fff; font-size: 18px; }
.video-track { position: relative; flex: 1; height: 3px; background: #4b5b66; border-radius: 2px; }
.video-track span { position: absolute; left: 0; top: 0; width: 55%; height: 3px; background: #2d7df0; }
.video-track b { position: absolute; left: 55%; top: 50%; width: 8px; height: 8px; background: #fff; border-radius: 50%; transform: translate(-50%, -50%); }
.evidence-strip { display: grid; grid-template-columns: repeat(3, 1fr); margin-top: 10px; border: 1px solid #e8edf3; border-radius: 6px; }
.evidence-strip span { padding: 10px; color: #8b98a9; border-right: 1px solid #edf0f4; font-size: 9px; }
.evidence-strip span:last-child { border: 0; }
.evidence-strip i { margin-right: 5px; color: var(--primary); }
.evidence-strip b { display: block; margin: 5px 0 3px; color: #405069; font-size: 11px; }
.detail-section { margin-top: 18px; }
.detail-section h4 { margin: 0 0 10px; color: #334159; font-size: 13px; }
.detail-section h4 small { margin-left: 5px; color: #ed5656; font-size: 9px; font-weight: 400; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; overflow: hidden; background: #e9edf2; border: 1px solid #e9edf2; border-radius: 5px; }
.detail-grid span { padding: 10px; background: #fafbfc; }
.detail-grid small, .detail-grid b { display: block; }
.detail-grid small { margin-bottom: 4px; color: #929ead; font-size: 9px; }
.detail-grid b { color: #44536a; font-size: 11px; }
.linkage-list { display: flex; flex-wrap: wrap; gap: 7px; }
.linkage-list span { padding: 6px 9px; color: #37765e; background: #edf9f4; border-radius: 4px; font-size: 10px; }
.linkage-list i { margin-right: 4px; color: #1aaa75; }
.trace-card { position: relative; padding: 9px 11px; background: #f8fafc; border-radius: 5px; }
.trace-card b { color: #3d4b61; font-size: 11px; }
.trace-card span { float: right; color: #8794a5; font-size: 9px; }
.trace-card p { margin: 5px 0 0; color: #7d899a; font-size: 10px; line-height: 16px; }
.drawer-actions { z-index: 30; display: flex; min-height: 68px; flex: 0 0 auto; align-items: center; justify-content: flex-end; padding: 12px 18px; background: #fff; border-top: 1px solid #e7ebf1; box-shadow: 0 -3px 10px rgba(35, 52, 73, 0.05); box-sizing: border-box; }

@media (max-width: 1450px) {
  .kpi-grid { grid-template-columns: repeat(3, 1fr); }
  .situation-grid { grid-template-columns: minmax(700px, 1fr) 285px; }
}

@media (max-width: 1120px) {
  .situation-grid { grid-template-columns: 1fr; height: auto; }
  .alarm-list { height: clamp(300px, 38vh, 420px); height: clamp(300px, 38dvh, 420px); flex: none; }
  .map-workbench { grid-template-columns: 175px minmax(520px, 1fr); height: clamp(430px, 55vh, 580px); height: clamp(430px, 55dvh, 580px); flex: none; }
}

@media (max-width: 760px) {
  .perimeter-page { padding: 12px; }
  .page-header { align-items: flex-start; gap: 12px; }
  .header-actions { flex-wrap: wrap; justify-content: flex-end; }
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .map-workbench { display: block; height: auto; }
  .zone-rail { display: flex; overflow-x: auto; border: 0; }
  .zone-item { min-width: 160px; }
  .campus-map { height: 390px; }
  .filter-group { flex-wrap: wrap; }
  .table-pagination { justify-content: flex-start; }
  .strategy-list { grid-template-columns: 1fr; }
}
</style>

<style lang="scss">
.smart-perimeter-alarm-drawer {
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .el-drawer__header {
    flex: 0 0 auto;
    margin-bottom: 0;
    padding: 16px 20px;
    border-bottom: 1px solid #e7ebf1;
  }

  .el-drawer__body {
    min-height: 0;
    flex: 1 1 auto;
    overflow: hidden;
  }
}
</style>
