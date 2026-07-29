<template>
  <div class="patrol-page">
    <header class="page-header">
      <div>
        <div class="title-line">
          <h2>智能巡更</h2>
          <span class="running-badge"><i></i> 3 项任务执行中</span>
        </div>
        <p>巡更计划编排、可信签到、异常升级与现场问题闭环</p>
      </div>
      <div class="header-actions">
        <el-button size="small" icon="el-icon-guide" @click="openRouteBuilder()">路线管理</el-button>
        <el-button size="small" icon="el-icon-lock" @click="signDialogVisible = true">签到校验配置</el-button>
        <el-button size="small" icon="el-icon-top-right" @click="escalationDialogVisible = true">异常升级规则</el-button>
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

    <iot-workspace-nav v-model="managementTab" :items="workspaceNav" aria-label="智能巡更业务工作区" @change="handleWorkspaceChange" />

    <section v-if="managementTab === 'overview'" ref="workspaceContent" class="operations-grid" tabindex="-1">
      <article class="surface route-board">
        <div class="surface-head">
          <div>
            <div class="surface-title"><i class="el-icon-map-location"></i> 今日巡更执行态势</div>
            <span class="surface-subtitle">终端位置与签到数据实时上报 · 最近同步 2026-07-20 22:28:35</span>
          </div>
          <div class="route-head-meta">
            <span><i class="dot online"></i>在线终端 18</span>
            <span><i class="dot offline"></i>离线终端 2</span>
            <el-button size="mini" icon="el-icon-refresh" @click="refreshTasks">刷新</el-button>
          </div>
        </div>

        <div class="route-workbench">
          <aside class="task-rail">
            <div class="rail-title">执行任务 <span>{{ activeTasks.length }}</span></div>
            <button
              v-for="task in activeTasks"
              :key="task.id"
              class="task-card"
              :class="[{ active: selectedTaskId === task.id }, taskStatusClass(task.status)]"
              @click="selectTask(task)"
            >
              <div class="task-card-top">
                <span class="person-avatar">{{ task.avatar }}</span>
                <span class="task-name"><b>{{ task.plan }}</b><small>{{ task.person }} · {{ task.shift }}</small></span>
                <i class="el-icon-arrow-right"></i>
              </div>
              <div class="task-progress"><i :style="{ width: task.progress + '%' }"></i></div>
              <div class="task-card-meta"><span>{{ task.completed }}/{{ task.total }} 点</span><span>{{ task.progress }}%</span></div>
              <div class="task-current"><i class="el-icon-location-outline"></i>{{ task.currentPoint }}</div>
            </button>
          </aside>

          <div class="route-map">
            <div class="map-grid"></div>
            <div class="map-building building-a"><i class="el-icon-office-building"></i><span>A 栋研发楼</span></div>
            <div class="map-building building-b"><i class="el-icon-office-building"></i><span>B 栋生产楼</span></div>
            <div class="map-building building-c"><i class="el-icon-office-building"></i><span>综合服务中心</span></div>
            <div class="map-building building-d"><i class="el-icon-box"></i><span>物流仓储</span></div>

            <button
              v-for="(point, index) in selectedRoute.points"
              :key="point.id"
              class="route-point"
              :class="[pointStatusClass(point.status), { selected: selectedPoint && selectedPoint.id === point.id }]"
              :style="{ left: point.x + '%', top: point.y + '%' }"
              :title="point.name + ' · ' + point.status"
              @click.stop="selectedPoint = point"
            >
              <span>{{ index + 1 }}</span>
            </button>

            <div v-if="selectedPoint" class="point-popover">
              <button aria-label="关闭点位信息" @click="selectedPoint = null"><i class="el-icon-close"></i></button>
              <div class="point-title"><span :class="pointStatusClass(selectedPoint.status)"><i class="el-icon-location"></i></span><div><b>{{ selectedPoint.name }}</b><small>{{ selectedPoint.id }}</small></div></div>
              <div class="point-info"><span>签到方式<b>{{ selectedPoint.method }}</b></span><span>执行状态<b>{{ selectedPoint.status }}</b></span><span>计划/实际<b>{{ selectedPoint.time }}</b></span><span>检查要求<b>必检 · 异常必拍</b></span></div>
            </div>

            <div class="route-map-title">
              <b>{{ selectedRoute.name }}</b>
              <span>{{ selectedRoute.area }} · {{ selectedRoute.distance }} · 预计 {{ selectedRoute.expected }}</span>
            </div>
            <div class="map-legend">
              <span><i class="point-legend completed"></i>已完成</span>
              <span><i class="point-legend current"></i>当前点位</span>
              <span><i class="point-legend pending"></i>待巡</span>
              <span><i class="point-legend abnormal"></i>异常</span>
            </div>
          </div>
        </div>
      </article>

      <aside class="surface execution-panel">
        <div class="surface-head compact-head">
          <div>
            <div class="surface-title"><i class="el-icon-user"></i> 当前执行</div>
            <span class="surface-subtitle">{{ selectedTask.id }}</span>
          </div>
          <el-tag :type="selectedTask.status === '有异常' ? 'warning' : 'success'" size="mini">{{ selectedTask.status }}</el-tag>
        </div>
        <div class="executor-card">
          <span class="executor-avatar">{{ selectedTask.avatar }}</span>
          <div class="executor-info"><b>{{ selectedTask.person }}</b><span>{{ selectedTask.shift }} · {{ selectedTask.terminal }}</span><small><i></i>{{ selectedTask.signal }}</small></div>
          <el-progress type="circle" :percentage="selectedTask.progress" :width="78" :stroke-width="7" />
        </div>
        <div class="execution-grid">
          <span><small>执行窗口</small><b>{{ selectedTask.window }}</b></span>
          <span><small>开始时间</small><b>{{ selectedTask.startTime }}</b></span>
          <span><small>已完成点位</small><b>{{ selectedTask.completed }}/{{ selectedTask.total }}</b></span>
          <span><small>预计剩余</small><b>{{ selectedTask.remaining }}</b></span>
        </div>
        <div class="point-flow">
          <div class="flow-item current"><i class="el-icon-location"></i><span><small>当前点位</small><b>{{ selectedTask.currentPoint }}</b></span></div>
          <div class="flow-line"><i></i><i></i><i></i></div>
          <div class="flow-item next"><i class="el-icon-right"></i><span><small>下一点位</small><b>{{ selectedTask.nextPoint }}</b></span></div>
        </div>
        <div class="trust-checks">
          <div class="checks-title">本次签到可信校验</div>
          <span><i class="el-icon-circle-check"></i>绑定终端</span>
          <span><i class="el-icon-circle-check"></i>连续轨迹</span>
          <span><i class="el-icon-circle-check"></i>位置偏差 &lt; 30m</span>
          <span><i class="el-icon-circle-check"></i>时间窗口有效</span>
        </div>
        <div class="execution-actions">
          <el-button size="small" icon="el-icon-phone" @click="$message.success('已向 ' + selectedTask.person + ' 发起呼叫')">联系人员</el-button>
          <el-button type="primary" size="small" icon="el-icon-upload2" @click="openIssueReport()">上报问题</el-button>
        </div>
      </aside>
    </section>

    <section v-else ref="workspaceContent" class="surface management-card workspace-detail" tabindex="-1">
      <iot-workspace-header :item="currentWorkspace" updated-at="22:28:35" @back="openWorkspace('overview')" />
      <el-tabs v-model="managementTab" class="workspace-tabs">
        <el-tab-pane name="plans">
          <span slot="label"><i class="el-icon-date"></i> 巡更计划 <b class="tab-count">{{ plans.length }}</b></span>
          <div class="table-toolbar">
            <div class="filter-group">
              <el-input v-model.trim="planKeyword" size="small" clearable prefix-icon="el-icon-search" placeholder="计划名称 / 路线 / 人员" />
              <el-select v-model="planStatus" size="small" clearable placeholder="计划状态"><el-option label="启用" value="启用" /><el-option label="停用" value="停用" /></el-select>
            </div>
            <el-button type="primary" size="small" icon="el-icon-plus" @click="openPlan()">新建计划</el-button>
          </div>
          <el-table :data="paginatedPlans" size="small" class="data-table">
            <el-table-column prop="id" label="计划编号" width="105" />
            <el-table-column prop="name" label="计划名称" min-width="155" />
            <el-table-column prop="route" label="路线" min-width="130" />
            <el-table-column prop="points" label="点位" width="65"><template slot-scope="{ row }">{{ row.points }} 个</template></el-table-column>
            <el-table-column prop="shift" label="班次" width="72" />
            <el-table-column label="人员" min-width="110"><template slot-scope="{ row }">{{ row.persons.join('、') }}</template></el-table-column>
            <el-table-column prop="window" label="时间窗口" min-width="110" />
            <el-table-column label="检查内容" min-width="160" show-overflow-tooltip><template slot-scope="{ row }">{{ row.checkItems.join('、') }}</template></el-table-column>
            <el-table-column label="采集要求" min-width="115"><template slot-scope="{ row }"><el-tag v-for="item in row.requiredMedia" :key="item" size="mini" class="mini-tag">{{ item }}</el-tag></template></el-table-column>
            <el-table-column label="状态" width="76"><template slot-scope="{ row }"><el-tag :type="row.status === '启用' ? 'success' : 'info'" size="mini">{{ row.status }}</el-tag></template></el-table-column>
            <el-table-column label="操作" width="128" fixed="right"><template slot-scope="{ row }"><el-button type="text" size="mini" @click="showPlanRoute(row)">路线</el-button><el-button type="text" size="mini" @click="openPlan(row)">编辑</el-button></template></el-table-column>
          </el-table>
          <patrol-pagination :total="filteredPlans.length" :state="pagination.plans" @size-change="changePageSize('plans', $event)" />
        </el-tab-pane>

        <el-tab-pane name="records">
          <span slot="label"><i class="el-icon-circle-check"></i> 签到记录 <b class="tab-count">{{ records.length }}</b></span>
          <div class="table-toolbar">
            <div class="filter-group">
              <el-input v-model.trim="recordKeyword" size="small" clearable prefix-icon="el-icon-search" placeholder="人员 / 点位 / 设备" />
              <el-select v-model="recordMethod" size="small" clearable placeholder="签到方式"><el-option v-for="item in signMethodOptions" :key="item" :label="item" :value="item" /></el-select>
              <el-checkbox v-model="onlyOffline">仅离线补传</el-checkbox>
            </div>
            <div class="toolbar-note"><i class="el-icon-lock"></i> 动态码、设备绑定、轨迹和时间窗口联合校验</div>
          </div>
          <el-table :data="paginatedRecords" size="small" class="data-table">
            <el-table-column prop="id" label="签到编号" min-width="138" />
            <el-table-column prop="person" label="人员" width="72" />
            <el-table-column prop="point" label="点位" min-width="125" />
            <el-table-column label="方式" width="90"><template slot-scope="{ row }"><span class="method-pill" :class="methodClass(row.method)">{{ row.method }}</span></template></el-table-column>
            <el-table-column prop="location" label="签到位置" min-width="135" show-overflow-tooltip />
            <el-table-column prop="distance" label="位置偏差" width="86" />
            <el-table-column prop="device" label="终端" width="85" />
            <el-table-column prop="collectTime" label="采集时间" min-width="150" />
            <el-table-column label="校验" width="90"><template slot-scope="{ row }"><el-tag :type="row.antiProxy.indexOf('通过') > -1 || row.antiProxy === '轨迹连续' ? 'success' : 'warning'" size="mini">{{ row.antiProxy }}</el-tag></template></el-table-column>
            <el-table-column label="结果" width="95"><template slot-scope="{ row }"><el-tag :type="row.result === '正常' ? 'success' : 'warning'" size="mini">{{ row.result }}</el-tag></template></el-table-column>
            <el-table-column label="操作" width="88" fixed="right"><template slot-scope="{ row }"><el-button type="text" size="mini" @click="openRecord(row)">验证详情</el-button></template></el-table-column>
          </el-table>
          <patrol-pagination :total="filteredRecords.length" :state="pagination.records" @size-change="changePageSize('records', $event)" />
        </el-tab-pane>

        <el-tab-pane name="alarms">
          <span slot="label"><i class="el-icon-warning-outline"></i> 异常告警 <b class="tab-count danger-count">{{ activeAlarmCount }}</b></span>
          <div class="table-toolbar">
            <div class="filter-group">
              <el-input v-model.trim="alarmKeyword" size="small" clearable prefix-icon="el-icon-search" placeholder="告警编号 / 人员 / 点位" />
              <el-select v-model="alarmFilter" size="small" clearable placeholder="告警类型"><el-option v-for="item in alarmTypes" :key="item" :label="item" :value="item" /></el-select>
              <el-select v-model="alarmStatus" size="small" clearable placeholder="处置状态"><el-option v-for="item in alarmStatuses" :key="item" :label="item" :value="item" /></el-select>
            </div>
            <el-button size="small" icon="el-icon-setting" @click="escalationDialogVisible = true">升级规则</el-button>
          </div>
          <el-table :data="paginatedAlarms" size="small" class="data-table">
            <el-table-column prop="id" label="告警编号" min-width="135" />
            <el-table-column label="等级" width="74"><template slot-scope="{ row }"><span class="level-pill" :class="alarmLevelClass(row.level)">{{ row.level }}</span></template></el-table-column>
            <el-table-column prop="type" label="类型" width="92" />
            <el-table-column prop="plan" label="计划" min-width="140" />
            <el-table-column prop="person" label="人员" width="72" />
            <el-table-column prop="point" label="异常点位" min-width="120" />
            <el-table-column prop="time" label="发生时间" min-width="150" />
            <el-table-column prop="detail" label="异常说明" min-width="180" show-overflow-tooltip />
            <el-table-column prop="escalate" label="升级对象" min-width="105" />
            <el-table-column label="状态" width="88"><template slot-scope="{ row }"><el-tag :type="alarmTag(row.status)" size="mini">{{ row.status }}</el-tag></template></el-table-column>
            <el-table-column label="操作" width="92" fixed="right"><template slot-scope="{ row }"><el-button type="text" size="mini" @click="openAlarm(row)">详情 / 处置</el-button></template></el-table-column>
          </el-table>
          <patrol-pagination :total="filteredAlarms.length" :state="pagination.alarms" @size-change="changePageSize('alarms', $event)" />
        </el-tab-pane>

        <el-tab-pane name="issues">
          <span slot="label"><i class="el-icon-document-checked"></i> 问题工单 <b class="tab-count">{{ issues.length }}</b></span>
          <div class="table-toolbar">
            <div class="filter-group"><el-input v-model.trim="issueKeyword" size="small" clearable prefix-icon="el-icon-search" placeholder="问题编号 / 位置 / 内容" /><el-select v-model="issueStatus" size="small" clearable placeholder="闭环状态"><el-option v-for="item in issueStatuses" :key="item" :label="item" :value="item" /></el-select></div>
            <el-button type="primary" size="small" icon="el-icon-upload2" @click="openIssueReport()">现场问题上报</el-button>
          </div>
          <el-table :data="paginatedIssues" size="small" class="data-table">
            <el-table-column prop="id" label="问题编号" min-width="135" />
            <el-table-column prop="time" label="上报时间" min-width="145" />
            <el-table-column prop="person" label="上报人" width="76" />
            <el-table-column prop="location" label="位置" min-width="120" />
            <el-table-column prop="category" label="分类" width="95" />
            <el-table-column prop="content" label="问题描述" min-width="185" show-overflow-tooltip />
            <el-table-column label="现场资料" min-width="120"><template slot-scope="{ row }">{{ row.media.join('、') }}</template></el-table-column>
            <el-table-column prop="workOrder" label="关联工单" min-width="125" />
            <el-table-column label="进度" width="115"><template slot-scope="{ row }"><el-progress :percentage="row.progress" :stroke-width="6" /></template></el-table-column>
            <el-table-column label="状态" width="88"><template slot-scope="{ row }"><el-tag :type="issueTag(row.status)" size="mini">{{ row.status }}</el-tag></template></el-table-column>
            <el-table-column label="操作" width="78" fixed="right"><template slot-scope="{ row }"><el-button type="text" size="mini" @click="openIssue(row)">查看</el-button></template></el-table-column>
          </el-table>
          <patrol-pagination :total="filteredIssues.length" :state="pagination.issues" @size-change="changePageSize('issues', $event)" />
        </el-tab-pane>
      </el-tabs>
    </section>

    <el-dialog title="巡逻路线管理" :visible.sync="routeDialogVisible" width="980px" top="4vh" custom-class="route-builder-dialog" append-to-body>
      <div class="route-builder-head">
        <div class="dialog-intro route-intro"><i class="el-icon-guide"></i><span><b>自定义路线</b>在园区底图上依次点击添加点位，再配置签到方式、检查内容和现场采集要求。</span></div>
        <div class="route-library">
          <span>编辑已有路线</span>
          <el-select v-model="routeForm.editingId" size="small" clearable placeholder="选择路线" @change="loadRouteForEdit">
            <el-option v-for="route in routes" :key="route.id" :label="route.name + '（' + route.points.length + '点）'" :value="route.id" />
          </el-select>
          <el-button size="small" icon="el-icon-plus" @click="resetRouteForm">新建空白路线</el-button>
        </div>
      </div>
      <el-form :model="routeForm" label-width="72px" size="small" class="route-base-form">
        <el-row :gutter="14">
          <el-col :span="8"><el-form-item label="路线名称" required><el-input v-model.trim="routeForm.name" placeholder="例如：仓储夜间巡逻线" /></el-form-item></el-col>
          <el-col :span="6"><el-form-item label="所属区域" required><el-input v-model.trim="routeForm.area" placeholder="例如：物流仓储区" /></el-form-item></el-col>
          <el-col :span="5"><el-form-item label="路线里程"><el-input v-model.trim="routeForm.distance" placeholder="1.5 km" /></el-form-item></el-col>
          <el-col :span="5"><el-form-item label="预计用时"><el-input v-model.trim="routeForm.expected" placeholder="45 分钟" /></el-form-item></el-col>
        </el-row>
      </el-form>
      <div class="route-builder-layout">
        <div class="route-editor-map" @click="addPointFromMap">
          <div class="map-grid"></div>
          <div class="map-building building-a"><i class="el-icon-office-building"></i><span>A 栋研发楼</span></div>
          <div class="map-building building-b"><i class="el-icon-office-building"></i><span>B 栋生产楼</span></div>
          <div class="map-building building-c"><i class="el-icon-office-building"></i><span>综合服务中心</span></div>
          <div class="map-building building-d"><i class="el-icon-box"></i><span>物流仓储</span></div>
          <button
            v-for="(point, index) in routeForm.points"
            :key="point.id"
            type="button"
            class="route-editor-point"
            :class="{ selected: selectedRoutePointIndex === index }"
            :style="{ left: point.x + '%', top: point.y + '%' }"
            :aria-label="'编辑第' + (index + 1) + '个点位：' + point.name"
            @click.stop="selectedRoutePointIndex = index"
          >
            <span>{{ index + 1 }}</span><small>{{ point.name }}</small>
          </button>
          <div v-if="!routeForm.points.length" class="route-map-empty"><i class="el-icon-mouse"></i><b>点击底图开始绘制</b><span>请按实际巡逻顺序依次添加至少 2 个点位</span></div>
          <div class="route-map-hint"><i class="el-icon-info"></i>点击空白处添加点位，可在右侧调整巡更顺序</div>
        </div>

        <aside class="route-point-panel">
          <div class="point-panel-head"><div><b>点位顺序</b><span>{{ routeForm.points.length }} 个点位</span></div><el-button type="text" size="mini" icon="el-icon-delete" :disabled="!routeForm.points.length" @click="clearRoutePoints">清空</el-button></div>
          <div v-if="routeForm.points.length" class="route-sequence-list">
            <div v-for="(point, index) in routeForm.points" :key="point.id" class="route-sequence-item" :class="{ active: selectedRoutePointIndex === index }" @click="selectedRoutePointIndex = index">
              <i>{{ index + 1 }}</i>
              <span><b>{{ point.name }}</b><small>{{ point.method }} · 半径 {{ point.radius }}m</small></span>
              <div class="sequence-actions">
                <button type="button" title="上移" :aria-label="point.name + '上移'" :disabled="index === 0" @click.stop="moveRoutePoint(index, -1)"><i class="el-icon-top"></i></button>
                <button type="button" title="下移" :aria-label="point.name + '下移'" :disabled="index === routeForm.points.length - 1" @click.stop="moveRoutePoint(index, 1)"><i class="el-icon-bottom"></i></button>
                <button type="button" title="删除" :aria-label="'删除' + point.name" @click.stop="removeRoutePoint(index)"><i class="el-icon-close"></i></button>
              </div>
            </div>
          </div>
          <div v-else class="sequence-empty"><i class="el-icon-location-outline"></i><span>尚未添加巡逻点位</span></div>

          <div v-if="selectedRoutePoint" class="route-point-editor">
            <div class="point-editor-title"><b>点位 {{ selectedRoutePointIndex + 1 }} 配置</b><span>{{ selectedRoutePoint.id }}</span></div>
            <el-form :model="selectedRoutePoint" label-width="70px" size="mini">
              <el-form-item label="点位名称"><el-input v-model.trim="selectedRoutePoint.name" /></el-form-item>
              <el-form-item label="签到方式"><el-select v-model="selectedRoutePoint.method"><el-option v-for="item in signMethodOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item>
              <el-form-item label="有效半径"><el-input-number v-model="selectedRoutePoint.radius" :min="5" :max="200" /><span class="form-unit">米</span></el-form-item>
              <el-form-item label="检查内容"><el-select v-model="selectedRoutePoint.checkItems" multiple collapse-tags><el-option v-for="item in checkItemOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item>
              <el-form-item label="现场采集"><el-checkbox-group v-model="selectedRoutePoint.requiredMedia"><el-checkbox label="必拍照片">必拍照片</el-checkbox><el-checkbox label="异常必拍">异常必拍</el-checkbox></el-checkbox-group></el-form-item>
            </el-form>
          </div>
        </aside>
      </div>
      <div class="route-save-note"><i class="el-icon-connection"></i>保存后，该路线会立即出现在“新建巡更计划”的路线列表中；计划发布后再生成巡更任务。</div>
      <span slot="footer"><el-button @click="routeDialogVisible = false">取消</el-button><el-button type="primary" @click="saveRoute">保存路线</el-button></span>
    </el-dialog>

    <el-dialog :title="planForm.editingId ? '编辑巡更计划' : '新建巡更计划'" :visible.sync="planDialogVisible" width="760px" top="5vh">
      <div class="dialog-intro"><i class="el-icon-date"></i><span><b>计划编排</b>按路线配置点位顺序、班次人员、执行窗口、检查内容和现场采集要求。</span></div>
      <el-form :model="planForm" label-width="96px" size="small" class="config-form">
        <el-form-item label="计划名称" required><el-input v-model.trim="planForm.name" placeholder="例如：东区夜间巡更" /></el-form-item>
        <el-row :gutter="16"><el-col :span="12"><el-form-item label="巡更路线" required><div class="route-select-control"><el-select v-model="planForm.routeId"><el-option v-for="route in routes" :key="route.id" :label="route.name + '（' + route.points.length + '点）'" :value="route.id" /></el-select><el-button type="text" icon="el-icon-plus" @click="openRouteBuilder()">自定义</el-button></div></el-form-item></el-col><el-col :span="12"><el-form-item label="执行频次"><el-select v-model="planForm.frequency"><el-option v-for="item in frequencyOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col></el-row>
        <div class="plan-route-points"><span v-for="(point, index) in planRoutePoints" :key="point.id"><i>{{ index + 1 }}</i>{{ point.name }}<small>{{ point.method }}</small></span></div>
        <el-row :gutter="16"><el-col :span="8"><el-form-item label="班次"><el-select v-model="planForm.shift"><el-option v-for="item in shiftOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col><el-col :span="16"><el-form-item label="巡更人员" required><el-select v-model="planForm.persons" multiple collapse-tags><el-option v-for="item in personOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col></el-row>
        <el-row :gutter="16"><el-col :span="12"><el-form-item label="时间窗口"><el-time-picker v-model="planForm.window" is-range range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="HH:mm" format="HH:mm" /></el-form-item></el-col><el-col :span="12"><el-form-item label="允许偏差"><el-input-number v-model="planForm.tolerance" :min="0" :max="30" /><span class="form-unit">分钟</span></el-form-item></el-col></el-row>
        <el-form-item label="检查内容"><el-checkbox-group v-model="planForm.checkItems"><el-checkbox v-for="item in checkItemOptions" :key="item" :label="item">{{ item }}</el-checkbox></el-checkbox-group></el-form-item>
        <el-form-item label="签到方式"><el-checkbox-group v-model="planForm.signMethods"><el-checkbox v-for="item in signMethodOptions" :key="item" :label="item" border>{{ item }}</el-checkbox></el-checkbox-group></el-form-item>
        <el-form-item label="现场采集"><el-checkbox-group v-model="planForm.requiredMedia"><el-checkbox label="必拍照片">必拍照片</el-checkbox><el-checkbox label="异常必拍">异常必拍</el-checkbox><el-checkbox label="异常语音">异常语音</el-checkbox><el-checkbox label="异常视频">异常视频</el-checkbox></el-checkbox-group></el-form-item>
        <el-form-item label="计划状态"><el-switch v-model="planForm.enabled" active-text="启用" inactive-text="停用" /></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="planDialogVisible = false">取消</el-button><el-button type="primary" @click="savePlan">保存并生成任务</el-button></span>
    </el-dialog>

    <el-dialog title="可信签到校验配置" :visible.sync="signDialogVisible" width="700px" top="6vh">
      <div class="dialog-intro"><i class="el-icon-lock"></i><span><b>防代扫与防补签</b>终端提供扫码、NFC、蓝牙及定位原始数据，平台联合校验设备、人员、时间、位置和连续轨迹。</span></div>
      <div class="sign-method-grid">
        <label v-for="item in signMethodOptions" :key="item" class="sign-method-card" :class="{ enabled: signConfig.methods.indexOf(item) > -1 }"><el-checkbox v-model="signConfig.methods" :label="item"><span class="method-icon"><i :class="signMethodIcon(item)"></i></span><b>{{ item }}</b><small>{{ signMethodDescription(item) }}</small></el-checkbox></label>
      </div>
      <el-form :model="signConfig" label-width="125px" size="small" class="config-form sign-form">
        <el-row :gutter="20"><el-col :span="12"><el-form-item label="动态二维码"><el-switch v-model="signConfig.dynamicQr" active-text="防截图复用" /></el-form-item></el-col><el-col :span="12"><el-form-item label="人员终端绑定"><el-switch v-model="signConfig.bindDevice" active-text="一人一机" /></el-form-item></el-col></el-row>
        <el-row :gutter="20"><el-col :span="12"><el-form-item label="连续轨迹校验"><el-switch v-model="signConfig.requireTrack" active-text="防远程代扫" /></el-form-item></el-col><el-col :span="12"><el-form-item label="禁止人工补签"><el-switch v-model="signConfig.forbidManualSupplement" active-text="仅原始采集有效" /></el-form-item></el-col></el-row>
        <el-row :gutter="20"><el-col :span="12"><el-form-item label="定位有效半径"><el-input-number v-model="signConfig.locationRadius" :min="5" :max="200" /><span class="form-unit">米</span></el-form-item></el-col><el-col :span="12"><el-form-item label="前后时间容差"><el-input-number v-model="signConfig.lateMinutes" :min="0" :max="60" /><span class="form-unit">分钟</span></el-form-item></el-col></el-row>
        <el-form-item label="离线签到"><el-switch v-model="signConfig.offlineEnabled" /><span class="inline-tip">允许终端本地签名缓存，须在 <el-input-number v-model="signConfig.offlineUploadMinutes" :min="5" :max="120" size="mini" /> 分钟内补传原始时间戳</span></el-form-item>
      </el-form>
      <el-alert title="事后手工录入不计为有效签到；离线补传以终端可信时间戳和设备签名为准。" type="warning" :closable="false" show-icon />
      <span slot="footer"><el-button @click="signDialogVisible = false">取消</el-button><el-button type="primary" @click="saveSignConfig">应用校验策略</el-button></span>
    </el-dialog>

    <el-dialog title="异常告警与升级规则" :visible.sync="escalationDialogVisible" width="780px" top="6vh">
      <div class="dialog-intro warning-intro"><i class="el-icon-top-right"></i><span><b>自动识别、分级升级</b>系统按计划窗口、点位顺序和人员轨迹自动判断异常，超时未确认时继续升级。</span></div>
      <el-table :data="escalationRules" size="small" class="rule-table">
        <el-table-column prop="type" label="异常类型" width="95" />
        <el-table-column prop="threshold" label="触发条件" min-width="145" />
        <el-table-column label="首次通知" width="125"><template slot-scope="{ row }"><el-select v-model="row.firstTarget" size="mini"><el-option v-for="item in escalationTargets" :key="item" :label="item" :value="item" /></el-select></template></el-table-column>
        <el-table-column label="升级等待" width="145">
          <template slot-scope="{ row }">
            <div class="delay-cell">
              <el-input-number v-model="row.secondDelay" :min="1" :max="60" size="mini" controls-position="right" />
              <small>分钟</small>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="升级对象" width="130"><template slot-scope="{ row }"><el-select v-model="row.secondTarget" size="mini"><el-option v-for="item in escalationTargets" :key="item" :label="item" :value="item" /></el-select></template></el-table-column>
        <el-table-column label="启用" width="65"><template slot-scope="{ row }"><el-switch v-model="row.enabled" /></template></el-table-column>
      </el-table>
      <span slot="footer"><el-button @click="escalationDialogVisible = false">取消</el-button><el-button type="primary" @click="saveEscalationRules">保存升级规则</el-button></span>
    </el-dialog>

    <el-dialog title="签到验证详情" :visible.sync="recordDialogVisible" width="600px">
      <div v-if="currentRecord" class="record-detail">
        <div class="record-result"><span :class="currentRecord.result === '正常' ? 'success' : 'warning'"><i :class="currentRecord.result === '正常' ? 'el-icon-circle-check' : 'el-icon-warning-outline'"></i></span><div><b>{{ currentRecord.result }}</b><small>{{ currentRecord.id }} · {{ currentRecord.collectTime }}</small></div></div>
        <div class="record-info-grid"><span><small>巡更人员</small><b>{{ currentRecord.person }}</b></span><span><small>签到点位</small><b>{{ currentRecord.point }}</b></span><span><small>签到方式</small><b>{{ currentRecord.method }}</b></span><span><small>终端设备</small><b>{{ currentRecord.device }}</b></span><span><small>现场位置</small><b>{{ currentRecord.location }}</b></span><span><small>位置偏差</small><b>{{ currentRecord.distance }}</b></span></div>
        <div class="validation-list"><div><i class="el-icon-circle-check"></i><span><b>设备绑定校验</b><small>{{ currentRecord.deviceBound }} · 人员与终端绑定关系有效</small></span></div><div><i class="el-icon-circle-check"></i><span><b>签到时间校验</b><small>{{ currentRecord.timeValid }} · 原始采集 {{ currentRecord.collectTime }}</small></span></div><div><i class="el-icon-circle-check"></i><span><b>防代扫校验</b><small>{{ currentRecord.antiProxy }} · 终端签名与人员轨迹一致</small></span></div><div :class="{ warning: currentRecord.offline }"><i :class="currentRecord.offline ? 'el-icon-warning-outline' : 'el-icon-circle-check'"></i><span><b>数据上传校验</b><small>{{ currentRecord.offline ? '离线补传' : '实时上传' }} · {{ currentRecord.uploadTime }}</small></span></div></div>
        <el-alert title="原始采集时间、设备签名和定位数据已留存，后台不提供无痕补签入口。" type="info" :closable="false" show-icon />
      </div>
    </el-dialog>

    <el-dialog title="现场问题上报" :visible.sync="issueReportVisible" width="620px">
      <div class="dialog-intro"><i class="el-icon-upload2"></i><span><b>移动端现场采集</b>支持文字、图片、语音和视频，提交时可直接生成安保或维修工单。</span></div>
      <el-form :model="issueForm" label-width="90px" size="small" class="config-form">
        <el-row :gutter="16"><el-col :span="12"><el-form-item label="关联任务"><el-select v-model="issueForm.taskId"><el-option v-for="task in tasks" :key="task.id" :label="task.plan + ' · ' + task.person" :value="task.id" /></el-select></el-form-item></el-col><el-col :span="12"><el-form-item label="现场位置" required><el-input v-model.trim="issueForm.location" /></el-form-item></el-col></el-row>
        <el-row :gutter="16"><el-col :span="12"><el-form-item label="问题分类"><el-select v-model="issueForm.category"><el-option label="安全隐患" value="安全隐患" /><el-option label="设施故障" value="设施故障" /><el-option label="环境问题" value="环境问题" /></el-select></el-form-item></el-col><el-col :span="12"><el-form-item label="问题等级"><el-radio-group v-model="issueForm.level"><el-radio label="一般">一般</el-radio><el-radio label="重要">重要</el-radio><el-radio label="紧急">紧急</el-radio></el-radio-group></el-form-item></el-col></el-row>
        <el-form-item label="问题描述" required><el-input v-model.trim="issueForm.content" type="textarea" :rows="3" placeholder="请描述现场问题、影响范围和临时处置情况" /></el-form-item>
        <el-form-item label="现场资料"><el-upload action="#" :auto-upload="false" multiple :limit="6"><el-button size="small" icon="el-icon-upload2">选择图片 / 语音 / 视频</el-button><div slot="tip" class="el-upload__tip">仿真模式：文件仅展示名称，不实际上传</div></el-upload></el-form-item>
        <el-form-item label="生成工单"><el-switch v-model="issueForm.createWorkOrder" /></el-form-item>
        <el-form-item v-if="issueForm.createWorkOrder" label="处置班组"><el-select v-model="issueForm.team"><el-option label="园区安保组" value="园区安保组" /><el-option label="弱电维保组" value="弱电维保组" /><el-option label="消防维保" value="消防维保" /><el-option label="绿化维保组" value="绿化维保组" /></el-select></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="issueReportVisible = false">取消</el-button><el-button type="primary" @click="submitIssue">提交问题</el-button></span>
    </el-dialog>

    <el-dialog title="问题与工单闭环" :visible.sync="issueDetailVisible" width="620px">
      <div v-if="currentIssue" class="issue-detail">
        <div class="issue-hero"><span :class="currentIssue.level === '重要' ? 'major' : 'normal'"><i class="el-icon-warning-outline"></i></span><div><b>{{ currentIssue.content }}</b><small>{{ currentIssue.id }} · {{ currentIssue.location }}</small></div><el-tag :type="issueTag(currentIssue.status)">{{ currentIssue.status }}</el-tag></div>
        <div class="issue-meta"><span><small>上报人</small><b>{{ currentIssue.person }}</b></span><span><small>关联签到</small><b>{{ currentIssue.record }}</b></span><span><small>关联工单</small><b>{{ currentIssue.workOrder }}</b></span><span><small>处置人</small><b>{{ currentIssue.assignee }}</b></span></div>
        <div class="media-list"><span v-for="item in currentIssue.media" :key="item"><i :class="item.indexOf('视频') > -1 ? 'el-icon-video-camera' : item.indexOf('语音') > -1 ? 'el-icon-microphone' : 'el-icon-picture-outline'"></i>{{ item }}</span></div>
        <div class="work-progress"><div><b>闭环进度</b><span>{{ currentIssue.progress }}%</span></div><el-progress :percentage="currentIssue.progress" :show-text="false" :stroke-width="8" /></div>
        <el-timeline><el-timeline-item v-for="(trace, index) in currentIssue.traces" :key="index" :timestamp="trace.time" placement="top"><div class="trace-card"><b>{{ trace.action }}</b><span>{{ trace.user }}</span><p>{{ trace.remark }}</p></div></el-timeline-item></el-timeline>
      </div>
      <span v-if="currentIssue" slot="footer"><el-button v-if="currentIssue.workOrder === '-'" type="primary" @click="convertWorkOrder(currentIssue)">生成工单</el-button><el-button v-if="currentIssue.status !== '已闭环'" type="success" @click="closeIssue(currentIssue)">确认闭环</el-button></span>
    </el-dialog>

    <el-drawer title="巡更异常详情" :visible.sync="alarmDrawerVisible" size="520px" custom-class="patrol-alarm-drawer" :append-to-body="true">
      <div v-if="currentAlarm" class="alarm-drawer-layout">
        <div class="alarm-detail">
          <div class="alarm-hero" :class="alarmLevelClass(currentAlarm.level)"><span><i class="el-icon-warning-outline"></i></span><div><small>{{ currentAlarm.level }}告警</small><h3>{{ currentAlarm.type }} · {{ currentAlarm.point }}</h3><p>{{ currentAlarm.id }}　{{ currentAlarm.time }}</p></div><el-tag :type="alarmTag(currentAlarm.status)">{{ currentAlarm.status }}</el-tag></div>
          <div class="alarm-info-grid"><span><small>巡更计划</small><b>{{ currentAlarm.plan }}</b></span><span><small>巡更人员</small><b>{{ currentAlarm.person }}</b></span><span><small>升级对象</small><b>{{ currentAlarm.escalate }}</b></span><span><small>当前处置人</small><b>{{ currentAlarm.assignee }}</b></span></div>
          <div class="alarm-description"><i class="el-icon-info"></i><div><b>异常判定</b><p>{{ currentAlarm.detail }}</p></div></div>
          <div class="detail-section"><h4>处理时效</h4><div class="response-clock" :class="{ overdue: currentAlarm.response.indexOf('超时') > -1 || currentAlarm.response.indexOf('等待') > -1 }"><i class="el-icon-time"></i>{{ currentAlarm.response }}</div></div>
          <div class="detail-section"><h4>告警记录 <small>不可删除</small></h4><el-timeline><el-timeline-item v-for="(trace, index) in currentAlarm.traces" :key="index" :timestamp="trace.time" placement="top"><div class="trace-card"><b>{{ trace.action }}</b><span>{{ trace.user }}</span><p>{{ trace.remark }}</p></div></el-timeline-item></el-timeline></div>
        </div>
        <div class="drawer-actions"><el-button v-if="currentAlarm.status === '待确认'" type="primary" @click="confirmAlarm(currentAlarm)">确认告警</el-button><el-button v-if="currentAlarm.status !== '已关闭' && currentAlarm.status !== '误报'" type="warning" @click="escalateAlarm(currentAlarm)">立即升级</el-button><el-button v-if="currentAlarm.status === '处置中' || currentAlarm.status === '已升级'" type="success" @click="closeAlarm(currentAlarm)">处置并关闭</el-button></div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import IotWorkspaceHeader from '../components/IotWorkspaceHeader.vue'
import IotWorkspaceNav from '../components/IotWorkspaceNav.vue'
import { patrol } from '../mock/iotMockData'

const PatrolPagination = {
  name: 'PatrolPagination',
  props: {
    total: { type: Number, default: 0 },
    state: { type: Object, required: true }
  },
  render(h) {
    return h('div', { class: 'table-pagination' }, [
      h('el-pagination', {
        props: {
          background: true,
          currentPage: this.state.page,
          pageSize: this.state.size,
          pageSizes: [5, 10, 20],
          total: this.total,
          layout: 'total, sizes, prev, pager, next, jumper'
        },
        on: {
          'current-change': (page) => { this.state.page = page },
          'size-change': (size) => { this.$emit('size-change', size) }
        }
      })
    ])
  }
}

export default {
  name: 'SmartIOTPatrol',
  components: { IotWorkspaceHeader, IotWorkspaceNav, PatrolPagination },
  data() {
    return {
      kpis: patrol.kpis,
      routes: JSON.parse(JSON.stringify(patrol.routes)),
      tasks: JSON.parse(JSON.stringify(patrol.tasks)),
      plans: JSON.parse(JSON.stringify(patrol.plans)),
      records: JSON.parse(JSON.stringify(patrol.records)),
      alarms: JSON.parse(JSON.stringify(patrol.alarms)),
      issues: JSON.parse(JSON.stringify(patrol.issues)),
      escalationRules: JSON.parse(JSON.stringify(patrol.escalationRules)),
      signConfig: JSON.parse(JSON.stringify(patrol.signConfig)),
      selectedTaskId: patrol.tasks[0].id,
      selectedRouteId: patrol.tasks[0].routeId,
      selectedPoint: null,
      managementTab: 'overview',
      planKeyword: '',
      planStatus: '',
      recordKeyword: '',
      recordMethod: '',
      onlyOffline: false,
      alarmKeyword: '',
      alarmFilter: '',
      alarmStatus: '',
      issueKeyword: '',
      issueStatus: '',
      alarmTypes: ['漏巡', '迟巡', '提前巡', '越序巡', '异常停留'],
      alarmStatuses: ['待确认', '处置中', '已升级', '误报', '已关闭'],
      issueStatuses: ['待转工单', '待派单', '处理中', '已闭环'],
      signMethodOptions: ['二维码', 'NFC', '蓝牙', '定位'],
      personOptions: ['周杰', '张伟', '李娜', '刘安', '陈峰', '王强', '陈静', '赵磊'],
      shiftOptions: ['白班', '晚班', '夜班', '全天'],
      frequencyOptions: ['每日', '工作日', '每周一/三/五', '法定节假日'],
      checkItemOptions: ['门窗状态', '消防箱', '周界照明', '消防通道', '充电桩', '门禁设备', '监控设备', '环境卫生'],
      escalationTargets: ['班组长', '值班负责人', '安保负责人'],
      pagination: {
        plans: { page: 1, size: 5 },
        records: { page: 1, size: 5 },
        alarms: { page: 1, size: 5 },
        issues: { page: 1, size: 5 }
      },
      routeDialogVisible: false,
      routeForm: { editingId: '', name: '', area: '', distance: '', expected: '', points: [] },
      selectedRoutePointIndex: -1,
      routePointSeed: 30,
      planDialogVisible: false,
      signDialogVisible: false,
      escalationDialogVisible: false,
      recordDialogVisible: false,
      issueReportVisible: false,
      issueDetailVisible: false,
      alarmDrawerVisible: false,
      currentRecord: null,
      currentIssue: null,
      currentAlarm: null,
      planForm: {},
      issueForm: {}
    }
  },
  computed: {
    workspaceNav() {
      return [
        { key: 'overview', title: '执行总览', description: '路线、人员与进度', detail: '查看今日巡更路线、执行人员、实时点位、签到进度和可信校验。', icon: 'el-icon-data-analysis', count: null },
        { key: 'plans', title: '巡更计划', description: '路线、班次与人员', detail: '配置巡更路线、点位、班次、人员、时间窗口和检查要求。', icon: 'el-icon-date', count: this.plans.length },
        { key: 'records', title: '签到记录', description: '终端、位置与校验', detail: '核对二维码、NFC、蓝牙和定位签到记录及防代扫校验结果。', icon: 'el-icon-circle-check', count: this.records.length },
        { key: 'alarms', title: '异常告警', description: '识别、升级与关闭', detail: '处置漏巡、迟巡、提前巡、越序巡和异常停留告警。', icon: 'el-icon-warning-outline', count: this.activeAlarmCount, danger: this.activeAlarmCount > 0 },
        { key: 'issues', title: '问题工单', description: '上报、派单与闭环', detail: '跟踪巡更现场问题、图片视频凭证、安保维修工单和闭环状态。', icon: 'el-icon-tickets', count: this.issues.length }
      ]
    },
    currentWorkspace() {
      return this.workspaceNav.find((item) => item.key === this.managementTab) || this.workspaceNav[0]
    },
    activeTasks() {
      return this.tasks.filter((item) => item.status !== '已完成')
    },
    selectedTask() {
      return this.tasks.find((item) => item.id === this.selectedTaskId) || this.tasks[0]
    },
    selectedRoute() {
      return this.routes.find((item) => item.id === this.selectedRouteId) || this.routes[0]
    },
    planRoutePoints() {
      const route = this.routes.find((item) => item.id === this.planForm.routeId)
      return route ? route.points : []
    },
    selectedRoutePoint() {
      return this.routeForm.points[this.selectedRoutePointIndex] || null
    },
    filteredPlans() {
      const keyword = this.planKeyword.toLowerCase()
      return this.plans.filter((item) => {
        const matchesKeyword = !keyword || [item.name, item.route, item.persons.join(' ')].join(' ').toLowerCase().indexOf(keyword) > -1
        return matchesKeyword && (!this.planStatus || item.status === this.planStatus)
      })
    },
    filteredRecords() {
      const keyword = this.recordKeyword.toLowerCase()
      return this.records.filter((item) => {
        const matchesKeyword = !keyword || [item.id, item.person, item.point, item.device].join(' ').toLowerCase().indexOf(keyword) > -1
        return matchesKeyword && (!this.recordMethod || item.method === this.recordMethod) && (!this.onlyOffline || item.offline)
      })
    },
    filteredAlarms() {
      const keyword = this.alarmKeyword.toLowerCase()
      return this.alarms.filter((item) => {
        const matchesKeyword = !keyword || [item.id, item.person, item.point, item.plan].join(' ').toLowerCase().indexOf(keyword) > -1
        return matchesKeyword && (!this.alarmFilter || item.type === this.alarmFilter) && (!this.alarmStatus || item.status === this.alarmStatus)
      })
    },
    filteredIssues() {
      const keyword = this.issueKeyword.toLowerCase()
      return this.issues.filter((item) => {
        const matchesKeyword = !keyword || [item.id, item.location, item.content].join(' ').toLowerCase().indexOf(keyword) > -1
        return matchesKeyword && (!this.issueStatus || item.status === this.issueStatus)
      })
    },
    paginatedPlans() { return this.paginate(this.filteredPlans, 'plans') },
    paginatedRecords() { return this.paginate(this.filteredRecords, 'records') },
    paginatedAlarms() { return this.paginate(this.filteredAlarms, 'alarms') },
    paginatedIssues() { return this.paginate(this.filteredIssues, 'issues') },
    activeAlarmCount() {
      return this.alarms.filter((item) => ['已关闭', '误报'].indexOf(item.status) === -1).length
    }
  },
  watch: {
    planKeyword() { this.pagination.plans.page = 1 },
    planStatus() { this.pagination.plans.page = 1 },
    recordKeyword() { this.pagination.records.page = 1 },
    recordMethod() { this.pagination.records.page = 1 },
    onlyOffline() { this.pagination.records.page = 1 },
    alarmKeyword() { this.pagination.alarms.page = 1 },
    alarmFilter() { this.pagination.alarms.page = 1 },
    alarmStatus() { this.pagination.alarms.page = 1 },
    issueKeyword() { this.pagination.issues.page = 1 },
    issueStatus() { this.pagination.issues.page = 1 }
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
    paginate(list, type) {
      const state = this.pagination[type]
      const start = (state.page - 1) * state.size
      return list.slice(start, start + state.size)
    },
    changePageSize(type, size) {
      this.pagination[type].size = size
      this.pagination[type].page = 1
    },
    taskStatusClass(status) {
      if (status === '有异常') return 'abnormal'
      return status === '执行中' ? 'running' : 'completed'
    },
    pointStatusClass(status) {
      if (status === '已完成') return 'completed'
      if (status === '当前点位') return 'current'
      if (status === '越序') return 'abnormal'
      return 'pending'
    },
    methodClass(method) {
      const map = { 二维码: 'qr', NFC: 'nfc', 蓝牙: 'bluetooth', 定位: 'location' }
      return map[method] || ''
    },
    signMethodIcon(method) {
      const map = { 二维码: 'el-icon-full-screen', NFC: 'el-icon-postcard', 蓝牙: 'el-icon-connection', 定位: 'el-icon-location-outline' }
      return map[method] || 'el-icon-circle-check'
    },
    signMethodDescription(method) {
      const map = { 二维码: '动态码防截图复用', NFC: '近场芯片唯一标识', 蓝牙: 'Beacon距离校验', 定位: 'GPS/北斗轨迹校验' }
      return map[method]
    },
    alarmLevelClass(level) {
      const map = { 紧急: 'level-critical', 重要: 'level-major', 一般: 'level-normal' }
      return map[level] || 'level-normal'
    },
    alarmTag(status) {
      const map = { 待确认: 'danger', 处置中: 'warning', 已升级: 'danger', 误报: 'info', 已关闭: 'success' }
      return map[status] || ''
    },
    issueTag(status) {
      const map = { 待转工单: 'info', 待派单: 'warning', 处理中: '', 已闭环: 'success' }
      return map[status] || ''
    },
    selectTask(task) {
      this.selectedTaskId = task.id
      this.selectedRouteId = task.routeId
      this.selectedPoint = null
    },
    refreshTasks() {
      this.$message.success('巡更终端位置、任务进度和签到记录已同步')
    },
    resetRouteForm() {
      this.routeForm = { editingId: '', name: '', area: '', distance: '', expected: '', points: [] }
      this.selectedRoutePointIndex = -1
    },
    openRouteBuilder(route) {
      if (route) {
        this.loadRouteForEdit(route.id)
      } else {
        this.resetRouteForm()
      }
      this.routeDialogVisible = true
    },
    loadRouteForEdit(routeId) {
      if (!routeId) {
        this.resetRouteForm()
        return
      }
      const route = this.routes.find((item) => item.id === routeId)
      if (!route) return
      this.routeForm = {
        editingId: route.id,
        name: route.name,
        area: route.area,
        distance: route.distance,
        expected: route.expected,
        points: route.points.map((point) => ({
          ...point,
          radius: point.radius || 30,
          checkItems: point.checkItems ? point.checkItems.slice() : ['门窗状态'],
          requiredMedia: point.requiredMedia ? point.requiredMedia.slice() : ['异常必拍']
        }))
      }
      this.selectedRoutePointIndex = this.routeForm.points.length ? 0 : -1
    },
    addPointFromMap(event) {
      const rect = event.currentTarget.getBoundingClientRect()
      const x = Math.max(4, Math.min(96, Math.round((event.clientX - rect.left) / rect.width * 100)))
      const y = Math.max(6, Math.min(94, Math.round((event.clientY - rect.top) / rect.height * 100)))
      this.routePointSeed += 1
      this.routeForm.points.push({
        id: 'CP' + String(this.routePointSeed).padStart(2, '0'),
        name: '新建点位 ' + (this.routeForm.points.length + 1),
        x,
        y,
        method: '二维码',
        radius: 30,
        checkItems: ['门窗状态'],
        requiredMedia: ['异常必拍'],
        status: '待巡',
        time: '-'
      })
      this.selectedRoutePointIndex = this.routeForm.points.length - 1
    },
    moveRoutePoint(index, offset) {
      const target = index + offset
      if (target < 0 || target >= this.routeForm.points.length) return
      const points = this.routeForm.points.slice()
      const current = points[index]
      this.$set(points, index, points[target])
      this.$set(points, target, current)
      this.routeForm.points = points
      this.selectedRoutePointIndex = target
    },
    removeRoutePoint(index) {
      this.routeForm.points.splice(index, 1)
      if (!this.routeForm.points.length) {
        this.selectedRoutePointIndex = -1
      } else {
        this.selectedRoutePointIndex = Math.min(index, this.routeForm.points.length - 1)
      }
    },
    clearRoutePoints() {
      this.$confirm('确定清空当前路线的全部点位吗？', '清空点位', { type: 'warning' }).then(() => {
        this.routeForm.points = []
        this.selectedRoutePointIndex = -1
      }).catch(() => {})
    },
    saveRoute() {
      if (!this.routeForm.name || !this.routeForm.area) {
        this.$message.warning('请填写路线名称和所属区域')
        return
      }
      if (this.routeForm.points.length < 2) {
        this.$message.warning('一条巡逻路线至少需要 2 个点位')
        return
      }
      if (this.routeForm.points.some((point) => !point.name || !point.method)) {
        this.$message.warning('请完善每个点位的名称和签到方式')
        return
      }
      const duplicateIds = this.routeForm.points.some((point, index, points) => points.findIndex((item) => item.id === point.id) !== index)
      if (duplicateIds) {
        this.$message.warning('点位编号不能重复')
        return
      }
      const routeId = this.routeForm.editingId || 'RT' + String(this.routes.length + 1).padStart(2, '0')
      const route = {
        id: routeId,
        name: this.routeForm.name,
        area: this.routeForm.area,
        distance: this.routeForm.distance || Math.max(0.5, this.routeForm.points.length * 0.25).toFixed(1) + ' km',
        expected: this.routeForm.expected || Math.max(15, this.routeForm.points.length * 7) + ' 分钟',
        points: JSON.parse(JSON.stringify(this.routeForm.points))
      }
      const index = this.routes.findIndex((item) => item.id === routeId)
      if (index > -1) {
        this.$set(this.routes, index, route)
        this.plans.filter((item) => item.routeId === routeId).forEach((plan) => {
          plan.route = route.name
          plan.points = route.points.length
        })
      } else {
        this.routes.push(route)
      }
      if (this.planDialogVisible) this.planForm.routeId = routeId
      this.routeDialogVisible = false
      this.$message.success(index > -1 ? '巡逻路线已更新' : '自定义路线已保存，可继续配置巡更计划')
    },
    resetPlanForm() {
      this.planForm = { editingId: '', name: '', routeId: this.routes[0].id, frequency: '每日', shift: '夜班', persons: [], window: ['22:00', '23:00'], tolerance: 10, checkItems: ['门窗状态', '消防箱'], signMethods: ['二维码', 'NFC', '定位'], requiredMedia: ['异常必拍'], enabled: true }
    },
    openPlan(row) {
      this.resetPlanForm()
      if (row) {
        this.planForm = { editingId: row.id, name: row.name, routeId: row.routeId, frequency: row.frequency, shift: row.shift, persons: row.persons.slice(), window: row.window.indexOf('-') > -1 ? row.window.split('-') : ['08:00', '10:00'], tolerance: 10, checkItems: row.checkItems.slice(), signMethods: row.signMethods.slice(), requiredMedia: row.requiredMedia.slice(), enabled: row.status === '启用' }
      }
      this.planDialogVisible = true
    },
    savePlan() {
      if (!this.planForm.name || !this.planForm.persons.length || !this.planForm.routeId || !Array.isArray(this.planForm.window) || this.planForm.window.length !== 2) {
        this.$message.warning('请完善计划名称、巡更路线、人员和时间窗口')
        return
      }
      const route = this.routes.find((item) => item.id === this.planForm.routeId)
      const row = { id: this.planForm.editingId || 'PL' + String(this.plans.length + 1).padStart(2, '0'), name: this.planForm.name, routeId: route.id, route: route.name, points: route.points.length, shift: this.planForm.shift, persons: this.planForm.persons.slice(), window: this.planForm.window.join('-'), frequency: this.planForm.frequency, checkItems: this.planForm.checkItems.slice(), requiredMedia: this.planForm.requiredMedia.slice(), signMethods: this.planForm.signMethods.slice(), status: this.planForm.enabled ? '启用' : '停用', updatedAt: '2026-07-20 22:30' }
      if (this.planForm.editingId) {
        const index = this.plans.findIndex((item) => item.id === this.planForm.editingId)
        this.$set(this.plans, index, row)
      } else {
        this.plans.unshift(row)
      }
      this.pagination.plans.page = 1
      this.planDialogVisible = false
      this.openWorkspace('plans')
      this.$message.success('巡更计划已保存，任务将按时间窗口自动生成')
    },
    showPlanRoute(row) {
      this.selectedRouteId = row.routeId
      this.selectedPoint = null
      const task = this.tasks.find((item) => item.routeId === row.routeId)
      if (task) this.selectedTaskId = task.id
      this.openWorkspace('overview')
    },
    saveSignConfig() {
      if (!this.signConfig.methods.length) {
        this.$message.warning('至少启用一种签到方式')
        return
      }
      this.signDialogVisible = false
      this.$message.success('可信签到校验策略已应用，变更记录已保存')
    },
    saveEscalationRules() {
      this.escalationDialogVisible = false
      this.$message.success('异常识别与升级规则已保存')
    },
    openRecord(row) {
      this.currentRecord = row
      this.recordDialogVisible = true
    },
    resetIssueForm() {
      this.issueForm = { taskId: this.selectedTask.id, location: this.selectedTask.currentPoint, category: '安全隐患', level: '一般', content: '', createWorkOrder: true, team: '园区安保组' }
    },
    openIssueReport() {
      this.resetIssueForm()
      this.issueReportVisible = true
    },
    submitIssue() {
      if (!this.issueForm.location || !this.issueForm.content) {
        this.$message.warning('请填写现场位置和问题描述')
        return
      }
      const task = this.tasks.find((item) => item.id === this.issueForm.taskId) || this.selectedTask
      const sequence = String(this.issues.length + 1).padStart(2, '0')
      const row = { id: 'PI20260720' + sequence, record: '-', person: task.person, location: this.issueForm.location, time: '2026-07-20 22:31:08', category: this.issueForm.category, level: this.issueForm.level, content: this.issueForm.content, media: ['图片1张'], workOrder: this.issueForm.createWorkOrder ? (this.issueForm.category === '设施故障' ? '维修-' : '安保-') + 'WO88' + sequence : '-', team: this.issueForm.createWorkOrder ? this.issueForm.team : '-', assignee: '未分配', status: this.issueForm.createWorkOrder ? '待派单' : '待转工单', progress: this.issueForm.createWorkOrder ? 10 : 0, traces: [{ time: '22:31', action: '问题上报', user: task.person, remark: '移动端上传文字和现场图片' }] }
      if (this.issueForm.createWorkOrder) row.traces.push({ time: '22:31', action: '生成工单', user: '系统', remark: row.workOrder + ' 已生成，等待派发' })
      this.issues.unshift(row)
      this.pagination.issues.page = 1
      this.openWorkspace('issues')
      this.issueReportVisible = false
      this.$message.success(this.issueForm.createWorkOrder ? '问题已上报并生成处置工单' : '现场问题已保存')
    },
    openIssue(row) {
      this.currentIssue = row
      this.issueDetailVisible = true
    },
    convertWorkOrder(row) {
      row.workOrder = '安保-WO8890'
      row.team = '园区安保组'
      row.status = '待派单'
      row.progress = 10
      row.traces.push({ time: '22:32', action: '生成工单', user: '当前值班员', remark: '安保-WO8890 已生成' })
      this.$message.success('已生成安保工单并进入派单队列')
    },
    closeIssue(row) {
      row.status = '已闭环'
      row.progress = 100
      row.traces.push({ time: '22:33', action: '确认闭环', user: '当前值班员', remark: '现场复核通过，问题已关闭' })
      this.$message.success('问题及关联工单已闭环')
    },
    openAlarm(row) {
      this.currentAlarm = row
      this.alarmDrawerVisible = true
    },
    addAlarmTrace(row, action, remark) {
      row.traces.push({ time: '22:32:18', action, user: '当前值班员', remark })
    },
    confirmAlarm(row) {
      row.status = '处置中'
      row.assignee = '当前值班员'
      row.response = '处置剩余 10:00'
      this.addAlarmTrace(row, '告警确认', '已联系巡更人员核查异常原因')
      this.$message.success('异常告警已确认')
    },
    escalateAlarm(row) {
      row.status = '已升级'
      row.escalate = '值班负责人'
      row.response = '已通知值班负责人'
      this.addAlarmTrace(row, '人工升级', '已升级至值班负责人并推送移动端')
      this.$message.success('告警已升级至值班负责人')
    },
    closeAlarm(row) {
      row.status = '已关闭'
      row.response = '已处置关闭'
      this.addAlarmTrace(row, '处置关闭', '异常已核实并完成处置')
      this.$message.success('告警已完成处置并关闭')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../components/iotWorkspacePage.scss';
.patrol-page {
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

button { font-family: inherit; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.title-line { display: flex; align-items: center; gap: 12px; }
.title-line h2 { margin: 0; font-size: 22px; line-height: 30px; letter-spacing: 0.5px; }
.page-header p { margin: 3px 0 0; color: var(--muted); font-size: 13px; }
.running-badge { display: inline-flex; align-items: center; gap: 6px; padding: 3px 9px; color: #16875d; background: #e9f8f2; border: 1px solid #c8ecde; border-radius: 12px; font-size: 12px; }
.running-badge i { width: 6px; height: 6px; background: #20bf82; border-radius: 50%; box-shadow: 0 0 0 4px rgba(32, 191, 130, 0.12); }
.header-actions { display: flex; gap: 8px; }

.kpi-grid { display: grid; grid-template-columns: repeat(6, minmax(140px, 1fr)); gap: 12px; margin-bottom: 12px; }
.kpi-card { position: relative; display: flex; min-height: 88px; align-items: center; gap: 12px; padding: 14px; overflow: hidden; color: #2468f2; background: #fff; border: 1px solid var(--line); border-radius: 8px; box-sizing: border-box; }
.kpi-card::after { position: absolute; right: -17px; bottom: -26px; width: 70px; height: 70px; background: currentColor; border-radius: 50%; opacity: 0.04; content: ''; }
.kpi-icon { display: flex; flex: 0 0 38px; width: 38px; height: 38px; align-items: center; justify-content: center; color: #2468f2; background: #edf4ff; border-radius: 9px; font-size: 19px; }
.kpi-content { min-width: 0; }
.kpi-title, .kpi-sub { display: block; overflow: hidden; color: var(--muted); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.kpi-number { margin: 3px 0 2px; color: #172235; font-size: 23px; font-weight: 700; line-height: 25px; }
.kpi-number small { margin-left: 4px; color: var(--muted); font-size: 12px; font-weight: 400; }
.is-success .kpi-icon { color: #14a36f; background: #e9f8f2; }
.is-danger .kpi-icon { color: #ed4e4e; background: #fff0f0; }
.is-warning .kpi-icon { color: #e58a13; background: #fff6e8; }
.is-info .kpi-icon { color: #69778c; background: #f0f2f6; }
.is-cyan .kpi-icon { color: #168ba0; background: #e8f8fa; }

.surface { background: #fff; border: 1px solid var(--line); border-radius: 8px; box-shadow: 0 2px 8px rgba(34, 52, 78, 0.03); }
.surface-head { display: flex; min-height: 58px; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid var(--line); box-sizing: border-box; }
.surface-title { color: #1a283c; font-size: 15px; font-weight: 600; }
.surface-title > i { margin-right: 6px; color: var(--primary); }
.surface-subtitle { display: block; margin-top: 3px; color: #92a0b2; font-size: 11px; }
.compact-head { min-height: 58px; }

.operations-grid { display: grid; grid-template-columns: minmax(760px, 1fr) 305px; height: var(--iot-overview-height); align-items: stretch; gap: 12px; margin-bottom: 12px; }
.patrol-page .operations-grid .surface-subtitle { font-size: 13px !important; line-height: 20px !important; }
.route-head-meta { display: flex; align-items: center; gap: 14px; color: #6f7e92; font-size: 12px; line-height: 20px; }
.dot { display: inline-block; width: 8px; height: 8px; margin-right: 6px; border-radius: 50%; }
.dot.online { background: #19aa76; }
.dot.offline { background: #98a3b2; }
.route-board { display: flex; min-height: 0; flex-direction: column; }
.route-workbench { display: grid; grid-template-columns: 235px minmax(520px, 1fr); min-height: 0; flex: 1 1 auto; }
.task-rail { padding: 14px 11px; overflow-y: auto; background: #fbfcfe; border-right: 1px solid var(--line); }
.patrol-page .rail-title { display: flex; align-items: center; justify-content: space-between; padding: 0 7px 11px; color: #607087; font-size: 13px !important; line-height: 20px; }
.rail-title span { display: inline-flex; min-width: 22px; height: 22px; align-items: center; justify-content: center; color: #326dc9; background: #eaf2ff; border-radius: 11px; font-size: 12px; }
.task-card { display: block; width: 100%; margin-bottom: 10px; padding: 12px; color: #607087; text-align: left; background: #fff; border: 1px solid #e7ebf1; border-radius: 7px; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s; }
.task-card:hover, .task-card.active { border-color: #b9cef3; box-shadow: 0 3px 10px rgba(51, 91, 153, 0.08); }
.task-card.active { background: #f7faff; }
.task-card.abnormal { border-left: 3px solid #eda137; }
.task-card-top { display: flex; align-items: center; gap: 10px; }
.person-avatar { display: flex; flex: 0 0 34px; width: 34px; height: 34px; align-items: center; justify-content: center; color: #fff; background: #3275df; border-radius: 8px; font-size: 14px; }
.task-card.abnormal .person-avatar { background: #e79b2a; }
.task-name { min-width: 0; flex: 1; }
.task-name b, .task-name small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.task-name b { color: #334159; font-size: 13px; line-height: 20px; }
.patrol-page .task-name small { margin-top: 3px; color: #8794a6; font-size: 12px !important; line-height: 18px !important; }
.task-card-top > i { color: #a1abb9; font-size: 12px; }
.task-progress { height: 6px; margin-top: 11px; overflow: hidden; background: #e8edf3; border-radius: 3px; }
.task-progress i { display: block; height: 6px; background: #2f78e5; border-radius: 3px; }
.task-card.abnormal .task-progress i { background: #e59b2a; }
.patrol-page .task-card-meta { display: flex; justify-content: space-between; margin-top: 6px; color: #7d899b; font-size: 12px !important; line-height: 18px; }
.patrol-page .task-current { margin-top: 9px; padding: 7px 8px; overflow: hidden; color: #5e6f86; background: #f3f6f9; border-radius: 4px; font-size: 12px !important; line-height: 18px; text-overflow: ellipsis; white-space: nowrap; }
.task-current i { margin-right: 5px; color: #2f77df; }

.route-map { position: relative; overflow: hidden; background: #eef3ee; }
.map-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(75, 111, 92, 0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(75, 111, 92, 0.055) 1px, transparent 1px); background-size: 24px 24px; }
.map-building { position: absolute; z-index: 1; display: flex; align-items: center; justify-content: center; color: #68776f; background: linear-gradient(145deg, #d8e0db, #cbd5ce); border: 1px solid rgba(90, 112, 98, 0.13); border-radius: 4px; box-shadow: 5px 6px 0 rgba(88, 111, 96, 0.08); font-size: 12px; line-height: 20px; }
.map-building i { margin-right: 6px; }
.building-a { left: 27%; top: 28%; width: 21%; height: 21%; }
.building-b { left: 54%; top: 27%; width: 23%; height: 22%; }
.building-c { left: 31%; top: 61%; width: 21%; height: 17%; }
.building-d { left: 59%; top: 60%; width: 20%; height: 18%; }
.route-point { position: absolute; z-index: 6; display: flex; width: 32px; height: 32px; align-items: center; justify-content: center; color: #fff; background: #99a6b7; border: 3px solid rgba(255, 255, 255, 0.95); border-radius: 50%; box-shadow: 0 2px 7px rgba(45, 63, 83, 0.25); transform: translate(-50%, -50%); cursor: pointer; }
.route-point span { font-size: 11px; font-weight: 600; }
.route-point.completed { background: #1aaa75; }
.route-point.current { background: #2e75df; box-shadow: 0 0 0 6px rgba(46, 117, 223, 0.17), 0 2px 7px rgba(45, 63, 83, 0.25); }
.route-point.abnormal { background: #ed5757; }
.route-point.selected { outline: 2px solid #204f9a; outline-offset: 3px; }
.point-popover { position: absolute; z-index: 20; right: 14px; top: 14px; width: 250px; padding: 13px; background: rgba(255, 255, 255, 0.98); border: 1px solid #dfe6ee; border-radius: 7px; box-shadow: 0 8px 22px rgba(35, 55, 76, 0.16); box-sizing: border-box; }
.point-popover > button { position: absolute; right: 7px; top: 7px; color: #8d99a9; background: transparent; border: 0; cursor: pointer; }
.point-title { display: flex; align-items: center; gap: 9px; padding-right: 18px; }
.point-title > span { display: flex; width: 31px; height: 31px; align-items: center; justify-content: center; color: #fff; background: #98a3b2; border-radius: 7px; }
.point-title > span.completed { background: #1aaa75; }
.point-title > span.current { background: #2e75df; }
.point-title > span.abnormal { background: #ed5757; }
.point-title b, .point-title small { display: block; }
.point-title b { color: #34435a; font-size: 14px; line-height: 21px; }
.patrol-page .point-title small { margin-top: 2px; color: #8b98a9; font-size: 12px !important; line-height: 18px !important; }
.point-info { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-top: 12px; }
.point-info span { color: #8794a5; font-size: 12px; line-height: 18px; }
.point-info b { display: block; margin-top: 3px; color: #46556b; font-size: 13px; line-height: 20px; }
.route-map-title { position: absolute; z-index: 5; left: 14px; top: 13px; padding: 9px 12px; background: rgba(255, 255, 255, 0.92); border-radius: 5px; }
.route-map-title b, .route-map-title span { display: block; }
.route-map-title b { color: #34435a; font-size: 14px; line-height: 21px; }
.route-map-title span { margin-top: 3px; color: #78879a; font-size: 12px; line-height: 18px; }
.patrol-page .map-legend { position: absolute; z-index: 5; left: 14px; bottom: 11px; display: flex; gap: 14px; padding: 7px 10px; color: #68778a; background: rgba(255, 255, 255, 0.9); border-radius: 4px; font-size: 12px !important; line-height: 18px; }
.point-legend { display: inline-block; width: 8px; height: 8px; margin-right: 5px; border-radius: 50%; }
.point-legend.completed { background: #1aaa75; }
.point-legend.current { background: #2e75df; }
.point-legend.pending { background: #98a3b2; }
.point-legend.abnormal { background: #ed5757; }

.execution-panel { display: flex; min-width: 0; min-height: 0; flex-direction: column; overflow-y: auto; }
.executor-card { display: flex; align-items: center; gap: 12px; padding: 17px 15px; border-bottom: 1px solid var(--line); }
.executor-avatar { display: flex; flex: 0 0 46px; width: 46px; height: 46px; align-items: center; justify-content: center; color: #fff; background: linear-gradient(135deg, #2e77e1, #52a4ed); border-radius: 10px; font-size: 17px; }
.executor-info { min-width: 0; flex: 1; }
.executor-info b, .executor-info span, .executor-info small { display: block; }
.executor-info b { color: #2f3e55; font-size: 16px; line-height: 23px; }
.executor-info span { margin-top: 3px; color: #7f8da0; font-size: 12px; line-height: 18px; }
.patrol-page .executor-info small { margin-top: 6px; color: #1a8f64; font-size: 12px !important; line-height: 18px !important; }
.executor-info small i { display: inline-block; width: 6px; height: 6px; margin-right: 4px; background: #1aab75; border-radius: 50%; }
.execution-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; margin: 0 15px; overflow: hidden; background: #e9edf2; border: 1px solid #e9edf2; border-radius: 5px; }
.execution-grid span { padding: 11px 10px; background: #fafbfc; }
.execution-grid small, .execution-grid b { display: block; }
.patrol-page .execution-grid small { margin-bottom: 4px; color: #8491a3; font-size: 12px !important; line-height: 18px !important; }
.execution-grid b { color: #3d4d64; font-size: 13px; line-height: 20px; }
.point-flow { margin: 15px 15px 0; padding: 12px; background: #f7f9fc; border-radius: 6px; }
.flow-item { display: flex; align-items: center; gap: 10px; }
.flow-item > i { display: flex; width: 30px; height: 30px; align-items: center; justify-content: center; color: #fff; background: #2f78e5; border-radius: 7px; }
.flow-item.next > i { color: #69778b; background: #e8edf3; }
.flow-item span small, .flow-item span b { display: block; }
.patrol-page .flow-item span small { color: #8794a5; font-size: 12px !important; line-height: 18px !important; }
.flow-item span b { margin-top: 2px; color: #3f4e65; font-size: 13px; line-height: 20px; }
.flow-line { display: flex; width: 30px; height: 20px; flex-direction: column; align-items: center; justify-content: space-around; }
.flow-line i { width: 3px; height: 3px; background: #aeb8c5; border-radius: 50%; }
.trust-checks { margin: 14px 15px 0; padding: 12px; background: #edf9f4; border: 1px solid #d6eee4; border-radius: 6px; }
.checks-title { margin-bottom: 8px; color: #356854; font-size: 13px; line-height: 20px; font-weight: 600; }
.trust-checks span { display: inline-block; width: 49%; margin: 4px 0; color: #557a69; font-size: 12px; line-height: 18px; }
.trust-checks i { margin-right: 5px; color: #1aaa75; }
.execution-actions { display: flex; justify-content: flex-end; gap: 7px; margin-top: auto; padding: 15px; }

.management-card { padding: 0 16px 14px; overflow: hidden; }
.table-toolbar { display: flex; min-height: 49px; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.filter-group { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; min-height: 32px; }
.filter-group .el-input { width: 220px; }
.filter-group .el-select { width: 125px; }
.toolbar-note { display: inline-flex; min-height: 32px; align-items: center; gap: 4px; color: #8794a6; font-size: 10px; line-height: 18px; }
.toolbar-note i { color: #1aa273; }
.tab-count { display: inline-block; min-width: 17px; height: 17px; margin-left: 3px; color: #65738a; line-height: 17px; text-align: center; background: #edf0f5; border-radius: 9px; font-size: 10px; }
.danger-count { color: #d74747; background: #fff0f0; }
.mini-tag { margin: 1px 3px 1px 0; }
.method-pill { display: inline-block; padding: 2px 7px; color: #2f71d5; background: #edf4ff; border-radius: 9px; font-size: 9px; }
.method-pill.nfc { color: #8a64c1; background: #f3edfb; }
.method-pill.bluetooth { color: #1688a0; background: #e9f8fa; }
.method-pill.location { color: #16875d; background: #e9f8f2; }
.level-pill { display: inline-block; padding: 2px 7px; color: #2f74dc; background: #edf4ff; border-radius: 10px; font-size: 10px; }
.level-pill.level-critical { color: #d83d3d; background: #fff0f0; }
.level-pill.level-major { color: #cd7a12; background: #fff5e7; }

.route-builder-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; }
.route-intro { flex: 1; margin-bottom: 12px !important; }
.route-library { display: flex; flex: 0 0 auto; align-items: center; gap: 7px; }
.route-library > span { color: #7d8999; font-size: 10px; }
.route-library .el-select { width: 190px; }
.route-base-form { padding: 10px 12px 0; background: #f7f9fc; border: 1px solid #e7ecf2; border-radius: 6px; }
.route-base-form .el-form-item { margin-bottom: 10px; }
.route-builder-layout { display: grid; grid-template-columns: minmax(0, 1fr) 330px; height: 440px; margin-top: 12px; overflow: hidden; border: 1px solid #e4e9ef; border-radius: 7px; }
.route-editor-map { position: relative; min-width: 0; overflow: hidden; background: #edf3ee; cursor: crosshair; }
.route-editor-map .map-building { opacity: 0.76; pointer-events: none; }
.route-editor-point { position: absolute; z-index: 5; display: flex; width: 28px; height: 28px; align-items: center; justify-content: center; padding: 0; color: #fff; background: #3478e1; border: 3px solid #fff; border-radius: 50%; box-shadow: 0 2px 9px rgba(41, 86, 151, 0.34); transform: translate(-50%, -50%); cursor: pointer; transition: transform 160ms ease, box-shadow 160ms ease; }
.route-editor-point > span { font-size: 10px; font-weight: 700; }
.route-editor-point > small { position: absolute; left: 50%; top: 29px; min-width: 66px; padding: 3px 5px; overflow: hidden; color: #40516a; background: rgba(255, 255, 255, 0.94); border: 1px solid #dde5ed; border-radius: 3px; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; transform: translateX(-50%); }
.route-editor-point:hover, .route-editor-point.selected { z-index: 7; background: #165fcf; box-shadow: 0 0 0 5px rgba(52, 120, 225, 0.18), 0 3px 12px rgba(41, 86, 151, 0.36); transform: translate(-50%, -50%) scale(1.12); }
.route-editor-point.selected > small { color: #1d63c7; border-color: #a9c8f4; }
.route-map-empty { position: absolute; z-index: 4; left: 50%; top: 50%; display: flex; align-items: center; flex-direction: column; color: #81909f; transform: translate(-50%, -50%); pointer-events: none; }
.route-map-empty > i { margin-bottom: 8px; color: #4d85d4; font-size: 28px; }
.route-map-empty > b { color: #52647b; font-size: 13px; }
.route-map-empty > span { margin-top: 5px; font-size: 10px; }
.route-map-hint { position: absolute; z-index: 8; left: 12px; bottom: 11px; padding: 6px 9px; color: #5f728a; background: rgba(255, 255, 255, 0.91); border-radius: 4px; font-size: 9px; pointer-events: none; }
.route-map-hint i { margin-right: 4px; color: #3478e1; }
.route-point-panel { display: flex; min-width: 0; flex-direction: column; background: #fff; border-left: 1px solid #e4e9ef; }
.point-panel-head { display: flex; min-height: 48px; flex: 0 0 auto; align-items: center; justify-content: space-between; padding: 0 12px; border-bottom: 1px solid #edf0f4; }
.point-panel-head > div { display: flex; align-items: center; gap: 7px; }
.point-panel-head b { color: #34435a; font-size: 11px; }
.point-panel-head span { padding: 2px 6px; color: #55739d; background: #edf4ff; border-radius: 8px; font-size: 8px; }
.route-sequence-list { min-height: 90px; max-height: 174px; flex: 0 0 auto; padding: 6px 7px; overflow-y: auto; border-bottom: 1px solid #edf0f4; }
.route-sequence-item { display: flex; min-height: 39px; align-items: center; gap: 8px; padding: 5px 4px 5px 7px; border: 1px solid transparent; border-radius: 5px; cursor: pointer; box-sizing: border-box; }
.route-sequence-item:hover { background: #f7f9fc; }
.route-sequence-item.active { background: #f1f6ff; border-color: #d7e5fa; }
.route-sequence-item > i { display: flex; width: 20px; height: 20px; flex: 0 0 auto; align-items: center; justify-content: center; color: #fff; background: #3478e1; border-radius: 50%; font-size: 8px; font-style: normal; }
.route-sequence-item > span { min-width: 0; flex: 1; }
.route-sequence-item b, .route-sequence-item small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.route-sequence-item b { color: #435269; font-size: 10px; }
.route-sequence-item small { margin-top: 2px; color: #929dab; font-size: 8px; }
.sequence-actions { display: none; flex: 0 0 auto; align-items: center; }
.route-sequence-item:hover .sequence-actions, .route-sequence-item.active .sequence-actions { display: flex; }
.sequence-actions button { display: flex; width: 25px; height: 25px; align-items: center; justify-content: center; padding: 0; color: #6c7a8d; background: transparent; border: 0; border-radius: 3px; cursor: pointer; }
.sequence-actions button:hover:not(:disabled) { color: #2468f2; background: #e7f0ff; }
.sequence-actions button:disabled { color: #c7ced8; cursor: not-allowed; }
.sequence-empty { display: flex; min-height: 105px; align-items: center; justify-content: center; flex-direction: column; gap: 7px; color: #9ba6b5; border-bottom: 1px solid #edf0f4; font-size: 9px; }
.sequence-empty i { font-size: 22px; }
.route-point-editor { min-height: 0; flex: 1 1 auto; padding: 10px 12px 4px; overflow-y: auto; }
.point-editor-title { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.point-editor-title b { color: #35445b; font-size: 10px; }
.point-editor-title span { color: #8795a8; font-family: Consolas, monospace; font-size: 8px; }
.route-point-editor .el-form-item { margin-bottom: 9px; }
.route-point-editor .el-select { width: 100%; }
.route-point-editor .el-input-number { width: 115px; }
.route-save-note { margin-top: 10px; padding: 8px 10px; color: #527260; background: #edf8f2; border-radius: 4px; font-size: 9px; }
.route-save-note i { margin-right: 5px; color: #1b9c6b; }
.route-select-control { display: flex; align-items: center; gap: 8px; }
.route-select-control .el-select { min-width: 0; flex: 1; }
.route-select-control .el-button { flex: 0 0 auto; }

.dialog-intro { display: flex; align-items: flex-start; gap: 10px; margin: -4px 0 18px; padding: 11px 13px; color: #58708e; background: #f1f6ff; border: 1px solid #dce9ff; border-radius: 6px; font-size: 12px; line-height: 19px; }
.dialog-intro > i { margin-top: 2px; color: var(--primary); font-size: 17px; }
.dialog-intro b { display: block; color: #30496c; }
.warning-intro { background: #fff8ed; border-color: #f5dfbb; }
.warning-intro > i { color: #df8a1f; }
.warning-intro b { color: #8c5b1c; }
.config-form .el-select, .config-form .el-date-editor, .config-form .el-time-editor { width: 100%; }
.config-form .el-checkbox.is-bordered { margin: 0 6px 5px 0; }
.form-unit { margin-left: 6px; color: #8e9aac; font-size: 10px; }
.inline-tip { margin-left: 12px; color: #7d8999; font-size: 10px; }
.inline-tip .el-input-number { width: 90px; }
.plan-route-points { display: flex; gap: 5px; margin: -5px 0 16px 96px; overflow-x: auto; }
.plan-route-points span { position: relative; min-width: 98px; padding: 8px 8px 8px 27px; color: #4e5d72; background: #f6f8fb; border: 1px solid #e5eaf0; border-radius: 5px; font-size: 9px; box-sizing: border-box; }
.plan-route-points i { position: absolute; left: 7px; top: 8px; display: flex; width: 15px; height: 15px; align-items: center; justify-content: center; color: #fff; background: #3176df; border-radius: 50%; font-size: 8px; font-style: normal; }
.plan-route-points small { display: block; margin-top: 3px; color: #96a1af; font-size: 8px; }
.sign-method-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 18px; }
.sign-method-card { padding: 10px; background: #fafbfc; border: 1px solid #e7ebf0; border-radius: 6px; cursor: pointer; }
.sign-method-card.enabled { background: #f4f8ff; border-color: #cbdcf9; }
.sign-method-card .el-checkbox { display: block; }
.sign-method-card .el-checkbox__label { display: grid; grid-template-columns: 30px 1fr; gap: 0 7px; width: calc(100% - 20px); vertical-align: top; }
.method-icon { display: flex; grid-row: 1 / 3; width: 30px; height: 30px; align-items: center; justify-content: center; color: #2f75df; background: #e8f1ff; border-radius: 6px; }
.sign-method-card b { color: #3c4a60; font-size: 11px; }
.sign-method-card small { margin-top: 3px; color: #8d99aa; font-size: 8px; }
.sign-form { padding: 12px 0 2px; border-top: 1px solid #edf0f4; }
.rule-table small { margin-left: 3px; color: #8996a7; font-size: 8px; }
.delay-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.delay-cell .el-input-number {
  width: 78px;
}
.delay-cell small {
  margin-left: 0;
  font-size: 11px;
  line-height: 28px;
}
::v-deep .delay-cell .el-input-number--mini .el-input__inner {
  padding-left: 8px;
  padding-right: 30px;
  text-align: left;
}

.record-result { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; padding: 12px; background: #f7faf8; border-radius: 6px; }
.record-result > span { display: flex; width: 36px; height: 36px; align-items: center; justify-content: center; color: #fff; background: #1aaa75; border-radius: 8px; font-size: 18px; }
.record-result > span.warning { background: #e69a2b; }
.record-result b, .record-result small { display: block; }
.record-result b { color: #334159; font-size: 14px; }
.record-result small { margin-top: 3px; color: #8d99a9; font-size: 9px; }
.record-info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1px; overflow: hidden; background: #e8edf2; border: 1px solid #e8edf2; border-radius: 5px; }
.record-info-grid span { padding: 9px; background: #fafbfc; }
.record-info-grid small, .record-info-grid b { display: block; }
.record-info-grid small { margin-bottom: 4px; color: #929ead; font-size: 8px; }
.record-info-grid b { color: #44536a; font-size: 10px; }
.validation-list { margin: 15px 0; }
.validation-list > div { display: flex; gap: 9px; margin-bottom: 7px; padding: 9px 10px; background: #f3faf7; border-radius: 5px; }
.validation-list > div > i { margin-top: 2px; color: #18a673; }
.validation-list > div.warning { background: #fff8ed; }
.validation-list > div.warning > i { color: #e29325; }
.validation-list b, .validation-list small { display: block; }
.validation-list b { color: #435168; font-size: 10px; }
.validation-list small { margin-top: 3px; color: #8491a2; font-size: 9px; }

.issue-hero { display: flex; align-items: center; gap: 10px; margin-bottom: 13px; }
.issue-hero > span { display: flex; width: 36px; height: 36px; align-items: center; justify-content: center; color: #2f74dc; background: #edf4ff; border-radius: 8px; }
.issue-hero > span.major { color: #d78117; background: #fff4e4; }
.issue-hero > div { min-width: 0; flex: 1; }
.issue-hero b, .issue-hero small { display: block; }
.issue-hero b { overflow: hidden; color: #334159; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.issue-hero small { margin-top: 4px; color: #8b97a8; font-size: 9px; }
.issue-meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; overflow: hidden; background: #e8edf2; border: 1px solid #e8edf2; border-radius: 5px; }
.issue-meta span { padding: 9px; background: #fafbfc; }
.issue-meta small, .issue-meta b { display: block; }
.issue-meta small { color: #929ead; font-size: 8px; }
.issue-meta b { margin-top: 4px; color: #44536a; font-size: 9px; }
.media-list { display: flex; gap: 7px; margin: 12px 0; }
.media-list span { padding: 6px 9px; color: #55749d; background: #f0f5fb; border-radius: 4px; font-size: 9px; }
.media-list i { margin-right: 4px; color: #2f74dc; }
.work-progress { margin: 13px 0 18px; }
.work-progress > div { display: flex; justify-content: space-between; margin-bottom: 6px; color: #526178; font-size: 10px; }

.alarm-drawer-layout { display: flex; height: 100%; min-height: 0; flex-direction: column; }
.alarm-detail { min-height: 0; flex: 1 1 auto; padding: 0 18px 25px; overflow-y: auto; box-sizing: border-box; }
.alarm-hero { display: flex; align-items: center; gap: 10px; margin: 0 -18px 14px; padding: 15px 18px; background: #fff0f0; border-top: 3px solid #e84e4e; }
.alarm-hero.level-major { background: #fff8ef; border-color: #ee9824; }
.alarm-hero.level-normal { background: #f2f7ff; border-color: #397fe4; }
.alarm-hero > span { display: flex; width: 34px; height: 34px; align-items: center; justify-content: center; color: #fff; background: #e84e4e; border-radius: 8px; }
.alarm-hero.level-major > span { background: #e89a29; }
.alarm-hero.level-normal > span { background: #397fe4; }
.alarm-hero > div { min-width: 0; flex: 1; }
.alarm-hero small { color: #d74343; font-size: 9px; }
.alarm-hero h3 { margin: 4px 0; color: #344159; font-size: 15px; }
.alarm-hero p { margin: 0; color: #8793a4; font-size: 9px; }
.alarm-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; overflow: hidden; background: #e8edf2; border: 1px solid #e8edf2; border-radius: 5px; }
.alarm-info-grid span { padding: 10px; background: #fafbfc; }
.alarm-info-grid small, .alarm-info-grid b { display: block; }
.alarm-info-grid small { margin-bottom: 4px; color: #919dac; font-size: 8px; }
.alarm-info-grid b { color: #45536a; font-size: 10px; }
.alarm-description { display: flex; gap: 9px; margin-top: 13px; padding: 11px; color: #855d22; background: #fff8ed; border-radius: 5px; }
.alarm-description > i { margin-top: 2px; }
.alarm-description b { font-size: 10px; }
.alarm-description p { margin: 4px 0 0; font-size: 9px; line-height: 15px; }
.detail-section { margin-top: 17px; }
.detail-section h4 { margin: 0 0 9px; color: #344159; font-size: 12px; }
.detail-section h4 small { margin-left: 4px; color: #e34e4e; font-size: 8px; font-weight: 400; }
.response-clock { padding: 9px 10px; color: #47715e; background: #edf9f4; border-radius: 4px; font-size: 10px; }
.response-clock.overdue { color: #c54646; background: #fff1f1; }
.response-clock i { margin-right: 5px; }
.trace-card { position: relative; padding: 9px 11px; background: #f8fafc; border-radius: 5px; }
.trace-card b { color: #3d4b61; font-size: 10px; }
.trace-card span { float: right; color: #8794a5; font-size: 8px; }
.trace-card p { margin: 5px 0 0; color: #7d899a; font-size: 9px; line-height: 15px; }
.drawer-actions { display: flex; min-height: 66px; flex: 0 0 auto; align-items: center; justify-content: flex-end; padding: 11px 16px; background: #fff; border-top: 1px solid #e7ebf1; box-shadow: 0 -3px 10px rgba(35, 52, 73, 0.05); box-sizing: border-box; }

@media (max-width: 1450px) {
  .kpi-grid { grid-template-columns: repeat(3, 1fr); }
  .operations-grid { grid-template-columns: minmax(700px, 1fr) 285px; }
}

@media (max-width: 1120px) {
  .operations-grid { grid-template-columns: 1fr; height: auto; }
  .route-workbench { grid-template-columns: 200px minmax(500px, 1fr); height: clamp(430px, 55vh, 580px); height: clamp(430px, 55dvh, 580px); flex: none; }
  .route-builder-layout { grid-template-columns: minmax(0, 1fr) 310px; }
}

@media (max-width: 760px) {
  .patrol-page { padding: 12px; }
  .page-header { align-items: flex-start; gap: 12px; }
  .header-actions { flex-wrap: wrap; justify-content: flex-end; }
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .route-workbench { display: block; height: auto; }
  .task-rail { display: flex; overflow-x: auto; border: 0; }
  .task-card { min-width: 190px; margin-right: 8px; }
  .route-map { height: 400px; }
  .route-builder-head { display: block; }
  .route-library { margin-bottom: 10px; flex-wrap: wrap; }
  .route-builder-layout { display: block; height: auto; overflow: visible; }
  .route-editor-map { height: 390px; }
  .route-point-panel { min-height: 390px; border-top: 1px solid #e4e9ef; border-left: 0; }
  .filter-group { flex-wrap: wrap; }
  .sign-method-grid { grid-template-columns: 1fr 1fr; }
}
</style>

<style lang="scss">
.patrol-page .table-pagination { display: flex; min-height: 50px; align-items: center; justify-content: flex-end; padding-top: 8px; overflow-x: auto; box-sizing: border-box; }
.patrol-alarm-drawer { display: flex; flex-direction: column; overflow: hidden; }
.patrol-alarm-drawer .el-drawer__header { flex: 0 0 auto; margin-bottom: 0; padding: 16px 18px; border-bottom: 1px solid #e7ebf1; }
.patrol-alarm-drawer .el-drawer__body { min-height: 0; flex: 1 1 auto; overflow: hidden; }
.route-builder-dialog .el-dialog__body { max-height: calc(92vh - 120px); padding: 12px 20px 10px; overflow-y: auto; box-sizing: border-box; }
@media (max-width: 1050px) {
  .route-builder-dialog { width: calc(100% - 24px) !important; }
}
</style>
