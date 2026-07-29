<template>
  <div class="passage-page parking-page">
    <header class="page-header">
      <div>
        <div class="title-line">
          <h2>智慧停车</h2>
          <span class="live-badge"><i></i> 停车数据实时同步</span>
        </div>
        <p>车位态势、出入口通行、违规停车、车辆权限及收费对账一体化管理</p>
      </div>
      <div class="header-actions">
        <el-button size="small" icon="el-icon-setting" @click="ruleDialogVisible = true">违停规则</el-button>
        <el-button size="small" icon="el-icon-unlock" @click="openManualPassage">人工处置</el-button>
        <el-button size="small" icon="el-icon-warning-outline" @click="emergencyDialogVisible = true">应急策略</el-button>
        <el-button type="primary" size="small" icon="el-icon-plus" @click="openVehicle()">新增车辆</el-button>
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

    <iot-workspace-nav v-model="managementTab" :items="workspaceNav" aria-label="智慧停车业务工作区" @change="handleWorkspaceChange" />

    <section v-if="managementTab === 'overview'" ref="workspaceContent" class="parking-overview" tabindex="-1">
      <article class="surface zone-board">
        <div class="surface-head">
          <div>
            <div class="surface-title"><i class="el-icon-office-building"></i> 车位分区态势</div>
            <span class="surface-subtitle">车位探测器与视频识别数据实时汇总 · 最近同步 2026-07-20 10:42:20</span>
          </div>
          <div class="surface-meta">
            <span><i class="dot online"></i>空余 214</span><span><i class="dot warning"></i>紧张分区 2</span><el-button size="mini" icon="el-icon-refresh" @click="refreshParking">刷新</el-button>
          </div>
        </div>
        <div class="zone-layout">
          <div class="zone-grid">
            <button
              v-for="zone in pagedZones"
              :key="zone.id"
              type="button"
              class="zone-card"
              :class="{ active: selectedZoneId === zone.id, warning: zone.violations || zone.status === '紧张' }"
              @click="selectedZoneId = zone.id"
            >
              <div class="zone-card-head">
                <span><i class="el-icon-location-outline"></i>{{ zone.name }}</span
                ><b>{{ zone.free }}<small>空余</small></b>
              </div>
              <div class="occupancy-track"><i :style="{ width: occupancy(zone) + '%' }"></i></div>
              <div class="zone-card-meta">
                <span>占用 {{ zone.occupied }}/{{ zone.total }}</span
                ><span>{{ occupancy(zone) }}%</span>
              </div>
              <div class="zone-card-foot">
                <span>预约 {{ zone.reserved }}</span
                ><span :class="{ danger: zone.violations }">违停 {{ zone.violations }}</span
                ><span>周转 {{ zone.turnover }}</span>
              </div>
            </button>
          </div>
          <div v-if="zonePageCount > 1" class="zone-pagination">
            <span>共 {{ zones.length }} 个分区</span>
            <div>
              <button type="button" :disabled="zonePagination.page === 1" @click="changeZonePage(zonePagination.page - 1)"><i class="el-icon-arrow-left"></i></button>
              <button v-for="page in zonePageCount" :key="page" type="button" :class="{ active: zonePagination.page === page }" @click="changeZonePage(page)">{{ page }}</button>
              <button type="button" :disabled="zonePagination.page === zonePageCount" @click="changeZonePage(zonePagination.page + 1)"><i class="el-icon-arrow-right"></i></button>
            </div>
          </div>
          <aside v-if="selectedZone" class="zone-detail">
            <div class="zone-detail-title">
              <span><i class="el-icon-place"></i></span>
              <div>
                <b>{{ selectedZone.name }}</b
                ><small>{{ selectedZone.id }} · {{ selectedZone.status }}</small>
              </div>
            </div>
            <div class="zone-ring" :style="{ '--rate': occupancy(selectedZone) * 3.6 + 'deg' }">
              <div>
                <b>{{ occupancy(selectedZone) }}%</b><span>占用率</span>
              </div>
            </div>
            <div class="zone-detail-grid">
              <span
                ><small>总车位</small><b>{{ selectedZone.total }}</b></span
              ><span
                ><small>空余</small><b class="green">{{ selectedZone.free }}</b></span
              ><span
                ><small>预约保留</small><b>{{ selectedZone.reserved }}</b></span
              ><span
                ><small>违规占用</small><b class="red">{{ selectedZone.violations }}</b></span
              >
            </div>
            <el-button type="primary" plain size="small" icon="el-icon-s-promotion" @click="$message.success(selectedZone.name + ' 空余车位已发布至诱导屏')">发布车位引导</el-button>
          </aside>
        </div>
      </article>

      <aside class="surface entrance-panel">
        <div class="surface-head">
          <div>
            <div class="surface-title"><i class="el-icon-sort"></i> 出入口实时通行</div>
            <span class="surface-subtitle">近 10 分钟通行 {{ entrances.length }} 辆</span>
          </div>
          <el-button type="text" size="mini" @click="openWorkspace('audit')">进入通行审计 <i class="el-icon-arrow-right"></i></el-button>
        </div>
        <div class="entrance-list">
          <button v-for="item in entrances.slice(0, 5)" :key="item.id" type="button" class="entrance-item" @click="showEntrance(item)">
            <span class="direction-icon" :class="item.direction === '入场' ? 'in' : 'out'"><i :class="item.direction === '入场' ? 'el-icon-bottom-left' : 'el-icon-top-right'"></i></span>
            <span class="entrance-main"
              ><b>{{ item.plate }}</b
              ><small>{{ item.gate }} · {{ item.vehicleType }}</small></span
            >
            <span class="entrance-result"
              ><b :class="{ danger: item.result === '已拦截', warning: item.result === '人工核验' }">{{ item.result }}</b
              ><small>{{ item.time }}</small></span
            >
          </button>
        </div>
        <div class="device-summary">
          <div class="summary-title">
            <b>设备健康</b><span>在线 {{ onlineDeviceCount }}/{{ devices.length }}</span>
          </div>
          <div class="device-chips">
            <button
              v-for="device in devices"
              :key="device.id"
              type="button"
              :class="device.status === '在线' ? 'online' : 'fault'"
              :title="device.name + ' · ' + device.status"
              @click="showDevice(device)"
            >
              <i :class="deviceIcon(device.type)"></i><span>{{ device.name }}</span>
            </button>
          </div>
        </div>
      </aside>
    </section>

    <section v-else ref="workspaceContent" class="surface management-card workspace-detail" tabindex="-1">
      <iot-workspace-header :item="currentWorkspace" updated-at="10:42:20" :show-back="false" @back="openWorkspace('overview')" />
      <el-tabs v-model="managementTab" class="workspace-tabs">
        <el-tab-pane name="violations"
          ><span slot="label"
            ><i class="el-icon-warning-outline"></i> 违停事件 <b class="tab-count danger">{{ activeViolationCount }}</b></span
          >
          <div class="table-toolbar">
            <div class="filter-group">
              <el-input v-model.trim="violationKeyword" size="small" clearable prefix-icon="el-icon-search" placeholder="事件号 / 车牌 / 位置" /><el-select
                v-model="violationType"
                size="small"
                clearable
                placeholder="违停类型"
                ><el-option v-for="item in violationTypes" :key="item" :label="item" :value="item" /></el-select
              ><el-select v-model="violationStatus" size="small" clearable placeholder="处置状态"><el-option v-for="item in violationStatuses" :key="item" :label="item" :value="item" /></el-select>
            </div>
            <div class="toolbar-note"><i class="el-icon-picture-outline"></i>车辆图、全景图及处置轨迹完整存证</div>
          </div>
          <el-table :data="pagedViolations" size="small"
            ><el-table-column prop="id" label="事件编号" min-width="140" /><el-table-column label="等级" width="72"
              ><template slot-scope="{ row }"
                ><span class="level-pill" :class="levelClass(row.level)">{{ row.level }}</span></template
              ></el-table-column
            ><el-table-column prop="plate" label="车牌" width="105" /><el-table-column prop="type" label="违规类型" min-width="120" /><el-table-column
              prop="area"
              label="位置"
              min-width="140"
            /><el-table-column prop="startTime" label="开始时间" min-width="150" /><el-table-column prop="duration" label="持续时间" width="95" /><el-table-column
              prop="assignee"
              label="处置人"
              width="90"
            /><el-table-column label="状态" width="90"
              ><template slot-scope="{ row }"
                ><el-tag :type="violationTag(row.status)" size="mini">{{ row.status }}</el-tag></template
              ></el-table-column
            ><el-table-column label="操作" width="98" fixed="right"
              ><template slot-scope="{ row }"><el-button type="text" size="mini" @click="openViolation(row)">详情 / 处置</el-button></template></el-table-column
            ></el-table
          >
          <div class="table-pagination">
            <el-pagination
              background
              :current-page.sync="pagination.violations.page"
              :page-size="pagination.violations.size"
              :page-sizes="[5, 10, 20]"
              :total="filteredViolations.length"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="changePageSize('violations', $event)"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane name="vehicles"
          ><span slot="label"
            ><i class="el-icon-truck"></i> 车辆与名单 <b class="tab-count">{{ vehicles.length }}</b></span
          >
          <div class="table-toolbar">
            <div class="filter-group">
              <el-input v-model.trim="vehicleKeyword" size="small" clearable prefix-icon="el-icon-search" placeholder="车牌 / 车主 / 单位" /><el-select
                v-model="vehicleType"
                size="small"
                clearable
                placeholder="车辆类型"
                ><el-option v-for="item in vehicleTypes" :key="item" :label="item" :value="item" /></el-select
              ><el-select v-model="vehicleList" size="small" clearable placeholder="名单类型"
                ><el-option label="白名单" value="白名单" /><el-option label="黑名单" value="黑名单" /><el-option label="临时" value="临时"
              /></el-select>
            </div>
            <el-button type="primary" size="small" icon="el-icon-plus" @click="openVehicle()">新增车辆权限</el-button>
          </div>
          <el-table :data="pagedVehicles" size="small"
            ><el-table-column prop="plate" label="车牌" width="110" /><el-table-column prop="type" label="车辆类型" width="95" /><el-table-column
              prop="owner"
              label="车主/单位"
              min-width="115"
            /><el-table-column label="有效期" min-width="170"
              ><template slot-scope="{ row }">{{ row.validFrom }} 至 {{ row.validTo }}</template></el-table-column
            ><el-table-column prop="areas" label="可进入区域" min-width="145" /><el-table-column prop="spaces" label="特殊车位范围" min-width="135" /><el-table-column label="名单" width="82"
              ><template slot-scope="{ row }"
                ><el-tag :type="row.list === '黑名单' ? 'danger' : row.list === '白名单' ? 'success' : 'info'" size="mini">{{ row.list }}</el-tag></template
              ></el-table-column
            ><el-table-column prop="status" label="状态" width="80" /><el-table-column label="操作" width="70" fixed="right"
              ><template slot-scope="{ row }"><el-button type="text" size="mini" @click="openVehicle(row)">编辑</el-button></template></el-table-column
            ></el-table
          >
          <div class="table-pagination">
            <el-pagination background :current-page.sync="pagination.vehicles.page" :page-size="pagination.vehicles.size" :total="filteredVehicles.length" layout="total, prev, pager, next" />
          </div>
        </el-tab-pane>

        <el-tab-pane name="finance"
          ><span slot="label"
            ><i class="el-icon-bank-card"></i> 收费与对账 <b class="tab-count">{{ payments.length }}</b></span
          >
          <div class="table-toolbar">
            <div class="filter-group">
              <el-input v-model.trim="paymentKeyword" size="small" clearable prefix-icon="el-icon-search" placeholder="订单号 / 车牌" /><el-select
                v-model="reconcileStatus"
                size="small"
                clearable
                placeholder="对账状态"
                ><el-option label="已对账" value="已对账" /><el-option label="待核对" value="待核对" /><el-option label="差异" value="差异" /><el-option label="已退款" value="已退款"
              /></el-select>
            </div>
            <el-button size="small" icon="el-icon-setting" @click="reconcileDialogVisible = true">对账口径</el-button>
          </div>
          <el-table :data="pagedPayments" size="small"
            ><el-table-column prop="id" label="停车订单" min-width="140" /><el-table-column prop="plate" label="车牌" width="105" /><el-table-column
              prop="entry"
              label="入场时间"
              min-width="135"
            /><el-table-column prop="exit" label="出场时间" min-width="135" /><el-table-column prop="duration" label="时长" width="90" /><el-table-column prop="receivable" label="应收" width="75"
              ><template slot-scope="{ row }">¥{{ row.receivable.toFixed(2) }}</template></el-table-column
            ><el-table-column prop="discount" label="减免" width="75"
              ><template slot-scope="{ row }">¥{{ row.discount.toFixed(2) }}</template></el-table-column
            ><el-table-column prop="paid" label="实收" width="75"
              ><template slot-scope="{ row }">¥{{ row.paid.toFixed(2) }}</template></el-table-column
            ><el-table-column prop="channel" label="支付渠道" width="90" /><el-table-column prop="invoice" label="发票" width="82" /><el-table-column label="对账" width="85"
              ><template slot-scope="{ row }"
                ><el-tag :type="row.reconcile === '差异' ? 'danger' : row.reconcile === '待核对' ? 'warning' : row.reconcile === '已对账' ? 'success' : 'info'" size="mini">{{
                  row.reconcile
                }}</el-tag></template
              ></el-table-column
            ><el-table-column label="操作" width="105" fixed="right"
              ><template slot-scope="{ row }"><el-button type="text" size="mini" @click="handleFinance(row)">发票 / 退款</el-button></template></el-table-column
            ></el-table
          >
          <div class="table-pagination">
            <el-pagination background :current-page.sync="pagination.finance.page" :page-size="pagination.finance.size" :total="filteredPayments.length" layout="total, prev, pager, next" />
          </div>
        </el-tab-pane>

        <el-tab-pane name="audit"
          ><span slot="label"
            ><i class="el-icon-document-checked"></i> 人工处置审计 <b class="tab-count">{{ audits.length }}</b></span
          >
          <div class="table-toolbar">
            <div class="toolbar-left">
              <el-input
                v-model.trim="auditKeyword"
                size="small"
                clearable
                prefix-icon="el-icon-search"
                placeholder="搜索审计编号 / 操作类型 / 对象 / 操作人 / 原因 / 结果"
              />
            </div>
            <el-button size="small" icon="el-icon-unlock" @click="openManualPassage">新增人工处置</el-button>
          </div>
          <el-table :data="filteredAudits" size="small"
            ><el-table-column prop="id" label="审计编号" width="110" /><el-table-column prop="time" label="操作时间" min-width="150" /><el-table-column
              prop="action"
              label="操作类型"
              min-width="125" /><el-table-column prop="target" label="对象" min-width="180" /><el-table-column prop="operator" label="操作人" width="90" /><el-table-column
              prop="reason"
              label="原因"
              min-width="260" /><el-table-column prop="approval" label="审批/复核" width="110" /><el-table-column prop="result" label="结果" width="90"
          /></el-table>
        </el-tab-pane>
      </el-tabs>
    </section>

    <el-dialog title="违停识别规则配置" :visible.sync="ruleDialogVisible" width="850px" top="6vh" custom-class="passage-config-dialog">
      <div class="dialog-intro">
        <i class="el-icon-setting"></i><span><b>按区域和时段配置</b>相机或车位设备提供车辆状态，平台按规则完成识别、提醒和升级。</span>
      </div>
      <el-table :data="violationRules" size="small"
        ><el-table-column prop="type" label="违规类型" width="105" /><el-table-column label="生效区域" min-width="170"
          ><template slot-scope="{ row }"
            ><el-select v-model="row.areas" multiple collapse-tags size="mini"><el-option v-for="item in areaOptions" :key="item" :label="item" :value="item" /></el-select></template></el-table-column
        ><el-table-column label="生效时段" width="145"
          ><template slot-scope="{ row }"
            ><el-select v-model="row.periods" multiple collapse-tags size="mini"
              ><el-option label="全天" value="全天" /><el-option label="工作日" value="工作日" /><el-option label="非装卸时段" value="非装卸时段" /></el-select></template></el-table-column
        ><el-table-column label="持续阈值" width="125"
          ><template slot-scope="{ row }"><el-input-number v-model="row.threshold" :min="0" :max="480" size="mini" /><small>分钟</small></template></el-table-column
        ><el-table-column prop="action" label="触发动作" min-width="140" /><el-table-column label="启用" width="65"
          ><template slot-scope="{ row }"><el-switch v-model="row.enabled" /></template></el-table-column
      ></el-table>
      <span slot="footer"><el-button @click="ruleDialogVisible = false">取消</el-button><el-button type="primary" @click="saveRules">保存规则</el-button></span>
    </el-dialog>

    <el-dialog :title="vehicleForm.editingId ? '编辑车辆权限' : '新增车辆权限'" :visible.sync="vehicleDialogVisible" width="680px" custom-class="passage-config-dialog">
      <div class="dialog-intro">
        <i class="el-icon-truck"></i><span><b>车辆分类与通行范围</b>设置有效期、可进入区域、特殊车位范围及黑白名单策略。</span>
      </div>
      <el-form :model="vehicleForm" label-width="96px" size="small" class="config-form"
        ><el-row :gutter="16"
          ><el-col :span="12"
            ><el-form-item label="车牌号码" required><el-input v-model.trim="vehicleForm.plate" placeholder="沪A·12345" /></el-form-item></el-col
          ><el-col :span="12"
            ><el-form-item label="车辆类型" required
              ><el-select v-model="vehicleForm.type"><el-option v-for="item in vehicleTypes" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col></el-row
        ><el-row :gutter="16"
          ><el-col :span="12"
            ><el-form-item label="车主/单位"><el-input v-model.trim="vehicleForm.owner" /></el-form-item></el-col
          ><el-col :span="12"
            ><el-form-item label="名单类型"
              ><el-radio-group v-model="vehicleForm.list"
                ><el-radio label="白名单">白名单</el-radio><el-radio label="临时">临时</el-radio><el-radio label="黑名单">黑名单</el-radio></el-radio-group
              ></el-form-item
            ></el-col
          ></el-row
        ><el-form-item label="有效期" required
          ><el-date-picker v-model="vehicleForm.validRange" type="daterange" value-format="yyyy-MM-dd" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" /></el-form-item
        ><el-form-item label="可进入区域"
          ><el-checkbox-group v-model="vehicleForm.areas"
            ><el-checkbox v-for="item in accessAreaOptions" :key="item" :label="item">{{ item }}</el-checkbox></el-checkbox-group
          ></el-form-item
        ><el-form-item label="特殊车位"
          ><el-checkbox-group v-model="vehicleForm.spaces"
            ><el-checkbox label="普通车位">普通车位</el-checkbox><el-checkbox label="访客车位">访客车位</el-checkbox><el-checkbox label="充电车位">充电车位</el-checkbox
            ><el-checkbox label="装卸车位">装卸车位</el-checkbox><el-checkbox label="残障车位">残障车位</el-checkbox></el-checkbox-group
          ></el-form-item
        ></el-form
      >
      <span slot="footer"><el-button @click="vehicleDialogVisible = false">取消</el-button><el-button type="primary" @click="saveVehicle">保存并下发</el-button></span>
    </el-dialog>

    <el-dialog title="人工处置与离线放行" :visible.sync="manualDialogVisible" width="620px" custom-class="passage-config-dialog">
      <div class="dialog-intro warning">
        <i class="el-icon-unlock"></i><span><b>操作必须留痕</b>适用于无牌车、车牌识别错误、网络中断和设备故障；人工改牌或抬杆须填写人员、原因和复核人。</span>
      </div>
      <el-form :model="manualForm" label-width="95px" size="small" class="config-form"
        ><el-form-item label="处置类型" required
          ><el-radio-group v-model="manualForm.action"
            ><el-radio label="人工改牌">人工改牌</el-radio><el-radio label="人工抬杆">人工抬杆</el-radio><el-radio label="离线放行">离线放行</el-radio></el-radio-group
          ></el-form-item
        ><el-form-item label="出入口" required
          ><el-select v-model="manualForm.gate"
            ><el-option label="南门入口" value="南门入口" /><el-option label="南门出口" value="南门出口" /><el-option label="北门入口" value="北门入口" /><el-option
              label="北门出口"
              value="北门出口" /><el-option label="物流入口" value="物流入口" /></el-select></el-form-item
        ><el-row v-if="manualForm.action === '人工改牌'" :gutter="16"
          ><el-col :span="12"
            ><el-form-item label="识别车牌"><el-input v-model.trim="manualForm.originalPlate" /></el-form-item></el-col
          ><el-col :span="12"
            ><el-form-item label="修正车牌"><el-input v-model.trim="manualForm.correctedPlate" /></el-form-item></el-col></el-row
        ><el-form-item label="车辆说明"><el-input v-model.trim="manualForm.target" placeholder="无牌施工车、摩托车或订单编号" /></el-form-item
        ><el-form-item label="处置原因" required><el-input v-model.trim="manualForm.reason" type="textarea" :rows="3" /></el-form-item
        ><el-form-item label="复核人" required
          ><el-select v-model="manualForm.approver"><el-option label="周班长" value="周班长" /><el-option label="李丽（值班负责人）" value="李丽（值班负责人）" /></el-select></el-form-item
      ></el-form>
      <span slot="footer"><el-button @click="manualDialogVisible = false">取消</el-button><el-button type="danger" @click="submitManualPassage">确认执行并留痕</el-button></span>
    </el-dialog>

    <el-dialog title="消防与紧急疏散道闸策略" :visible.sync="emergencyDialogVisible" width="680px" custom-class="passage-config-dialog">
      <div class="dialog-intro danger">
        <i class="el-icon-warning-outline"></i><span><b>仅限审批后启用</b>策略下发至道闸设备执行，人工启用需要值班负责人和安保负责人双重确认。</span>
      </div>
      <el-form :model="emergency" label-width="120px" size="small" class="config-form"
        ><el-form-item label="策略名称"><el-input v-model="emergency.name" /></el-form-item
        ><el-form-item label="联动道闸"
          ><el-checkbox-group v-model="emergency.gates"
            ><el-checkbox label="南门出口">南门出口</el-checkbox><el-checkbox label="北门出口">北门出口</el-checkbox><el-checkbox label="物流出口">物流出口</el-checkbox></el-checkbox-group
          ></el-form-item
        ><el-form-item label="自动触发条件"><el-input v-model="emergency.trigger" /></el-form-item><el-form-item label="通行方向"><el-input v-model="emergency.direction" /></el-form-item
        ><el-form-item label="策略有效时长"><el-input-number v-model="emergency.duration" :min="5" :max="180" /><span class="form-unit">分钟</span></el-form-item
        ><el-form-item label="审批要求"><el-input v-model="emergency.approval" disabled /></el-form-item
      ></el-form>
      <span slot="footer"
        ><el-button @click="emergencyDialogVisible = false">取消</el-button><el-button @click="saveEmergency">保存策略</el-button
        ><el-button type="danger" @click="requestEmergency">发起启用审批</el-button></span
      >
    </el-dialog>

    <el-dialog title="停车收费与财务对账口径" :visible.sync="reconcileDialogVisible" width="650px" custom-class="passage-config-dialog">
      <div class="dialog-intro">
        <i class="el-icon-bank-card"></i><span><b>统一账期归属与差异口径</b>停车平台负责订单、优惠、退款明细，财务系统按确认的截止时间和实收金额进行对账。</span>
      </div>
      <el-form :model="reconciliation" label-width="125px" size="small" class="config-form"
        ><el-form-item label="每日账期截止"><el-time-picker v-model="reconciliation.cutoff" value-format="HH:mm" format="HH:mm" /></el-form-item
        ><el-form-item label="订单归属口径"><el-input v-model="reconciliation.standard" /></el-form-item
        ><el-form-item label="参与对账渠道"
          ><el-checkbox-group v-model="reconciliation.channels"
            ><el-checkbox label="微信">微信</el-checkbox><el-checkbox label="支付宝">支付宝</el-checkbox><el-checkbox label="银联">银联</el-checkbox
            ><el-checkbox label="现金">现金</el-checkbox></el-checkbox-group
          ></el-form-item
        ><el-form-item label="允许差异"><el-input-number v-model="reconciliation.tolerance" :min="0" :max="10" :step="0.01" /><span class="form-unit">元</span></el-form-item
        ><el-form-item label="退款审批阈值"><el-input-number v-model="reconciliation.autoRefundApproval" :min="0" :max="5000" /><span class="form-unit">元</span></el-form-item></el-form
      >
      <span slot="footer"><el-button @click="reconcileDialogVisible = false">取消</el-button><el-button type="primary" @click="saveReconciliation">保存对账口径</el-button></span>
    </el-dialog>

    <el-drawer title="违停事件详情与处置" :visible.sync="violationDrawerVisible" size="520px" custom-class="passage-detail-drawer parking-detail-drawer" append-to-body>
      <div v-if="currentViolation" class="drawer-layout">
        <div class="drawer-scroll">
          <div class="violation-hero" :class="levelClass(currentViolation.level)">
            <span><i class="el-icon-warning-outline"></i></span>
            <div>
              <small>{{ currentViolation.level }}事件</small>
              <h3>{{ currentViolation.type }} · {{ currentViolation.plate }}</h3>
              <p>{{ currentViolation.id }}　{{ currentViolation.startTime }}</p>
            </div>
            <el-tag :type="violationTag(currentViolation.status)">{{ currentViolation.status }}</el-tag>
          </div>
          <div class="evidence-preview">
            <div>
              <i class="el-icon-picture-outline"></i><span>车辆抓拍</span><b>{{ currentViolation.vehicleImage }}</b>
            </div>
            <div>
              <i class="el-icon-camera"></i><span>现场全景</span><b>{{ currentViolation.panorama }}</b>
            </div>
          </div>
          <div class="detail-info-grid">
            <span
              ><small>发生位置</small><b>{{ currentViolation.area }} / {{ currentViolation.spot }}</b></span
            ><span
              ><small>持续时间</small><b>{{ currentViolation.duration }}</b></span
            ><span
              ><small>驶离时间</small><b>{{ currentViolation.leaveTime }}</b></span
            ><span
              ><small>处置人员</small><b>{{ currentViolation.assignee }}</b></span
            ><span
              ><small>语音提醒</small><b>{{ currentViolation.voice }}</b></span
            ><span
              ><small>关联工单</small><b>{{ currentViolation.workOrder }}</b></span
            >
          </div>
          <div class="response-box"><i class="el-icon-time"></i>{{ currentViolation.response }}</div>
          <div class="detail-section">
            <h4>处置记录</h4>
            <el-timeline
              ><el-timeline-item v-for="(trace, index) in currentViolation.traces" :key="index" :timestamp="trace.time" placement="top"
                ><div class="trace-card">
                  <b>{{ trace.action }}</b
                  ><span>{{ trace.user }}</span>
                  <p>{{ trace.remark }}</p>
                </div></el-timeline-item
              ></el-timeline
            >
          </div>
        </div>
        <div class="drawer-actions">
          <el-button v-if="currentViolation.voice === '未提醒'" @click="notifyViolation(currentViolation)">语音提醒</el-button
          ><el-button v-if="currentViolation.assignee === '未派单'" type="warning" @click="dispatchViolation(currentViolation)">通知巡查</el-button
          ><el-button v-if="currentViolation.workOrder === '-'" type="primary" @click="createViolationOrder(currentViolation)">转处置工单</el-button
          ><el-button v-if="currentViolation.status !== '已关闭'" type="success" @click="closeViolation(currentViolation)">确认关闭</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import IotWorkspaceHeader from '../components/IotWorkspaceHeader.vue'
import IotWorkspaceNav from '../components/IotWorkspaceNav.vue'
import { parking } from '../mock/passageMockData'

export default {
  name: 'SmartIOTParking',
  components: { IotWorkspaceHeader, IotWorkspaceNav },
  data() {
    return {
      kpis: parking.kpis,
      zones: JSON.parse(JSON.stringify(parking.zones)).concat([
        { id: 'PK-E1', name: '东侧临停车区', total: 56, free: 18, occupied: 38, reserved: 5, violations: 0, turnover: 4.2, status: '正常' },
        { id: 'PK-M1', name: '摩托车停车区', total: 72, free: 28, occupied: 44, reserved: 0, violations: 0, turnover: 5.8, status: '正常' },
        { id: 'PK-S1', name: '施工车辆区', total: 34, free: 9, occupied: 25, reserved: 7, violations: 1, turnover: 3.9, status: '绱у紶' }
      ]),
      entrances: JSON.parse(JSON.stringify(parking.entrances)),
      devices: JSON.parse(JSON.stringify(parking.devices)),
      violations: JSON.parse(JSON.stringify(parking.violations)),
      vehicles: JSON.parse(JSON.stringify(parking.vehicles)),
      payments: JSON.parse(JSON.stringify(parking.payments)),
      audits: JSON.parse(JSON.stringify(parking.audits)),
      violationRules: JSON.parse(JSON.stringify(parking.violationRules)),
      emergency: JSON.parse(JSON.stringify(parking.emergency)),
      reconciliation: JSON.parse(JSON.stringify(parking.reconciliation)),
      selectedZoneId: parking.zones[0].id,
      managementTab: 'overview',
      violationKeyword: '',
      violationType: '',
      violationStatus: '',
      vehicleKeyword: '',
      vehicleType: '',
      vehicleList: '',
      paymentKeyword: '',
      auditKeyword: '',
      reconcileStatus: '',
      pagination: { violations: { page: 1, size: 5 }, vehicles: { page: 1, size: 5 }, finance: { page: 1, size: 5 } },
      zonePagination: { page: 1, size: 8 },
      ruleDialogVisible: false,
      vehicleDialogVisible: false,
      manualDialogVisible: false,
      emergencyDialogVisible: false,
      reconcileDialogVisible: false,
      violationDrawerVisible: false,
      currentViolation: null,
      vehicleForm: {},
      manualForm: {},
      vehicleTypes: ['固定车', '临时车', '访客车', '预约车', '施工车', '应急车', '黑名单'],
      violationTypes: ['占用消防通道', '禁停区域', '占用残障车位', '占用充电车位', '跨车位', '超时停车', '逆行', '堵塞出入口'],
      violationStatuses: ['待确认', '待处理', '处置中', '巡查中', '已关闭'],
      areaOptions: ['消防通道', 'B栋装卸通道', '北门缓冲区', '残障车位', '充电区', '访客区', '装卸区', '地下车库', '出入口', '单行道'],
      accessAreaOptions: ['全园区', 'A/B地库', '地面访客区', '物流闸口', '装卸区', '临停区']
    }
  },
  computed: {
    workspaceNav() {
      return [
        { key: 'overview', title: '停车总览', description: '车位与出入口态势', detail: '查看车位余量、分区占用、出入口通行和设备在线情况。', icon: 'el-icon-data-analysis', count: null },
        { key: 'violations', title: '违停处置', description: '识别、派单与关闭', detail: '集中处置违停事件、语音提醒、巡查派发和处置工单。', icon: 'el-icon-warning-outline', count: this.activeViolationCount, danger: this.activeViolationCount > 0 },
        { key: 'vehicles', title: '车辆权限', description: '名单、区域与有效期', detail: '管理固定车、访客车、施工车和黑白名单通行权限。', icon: 'el-icon-truck', count: this.vehicles.length },
        { key: 'finance', title: '收费对账', description: '订单、退款与发票', detail: '核对停车订单、优惠、支付、退款及财务对账状态。', icon: 'el-icon-bank-card', count: this.payments.length },
        { key: 'audit', title: '操作审计', description: '抬杆、改牌与应急', detail: '追溯人工抬杆、车牌修正和应急策略等高风险操作。', icon: 'el-icon-document', count: this.audits.length }
      ]
    },
    currentWorkspace() {
      return this.workspaceNav.find((item) => item.key === this.managementTab) || this.workspaceNav[0]
    },
    selectedZone() {
      return this.zones.find((item) => item.id === this.selectedZoneId) || this.zones[0]
    },
    zonePageCount() {
      return Math.max(1, Math.ceil(this.zones.length / this.zonePagination.size))
    },
    pagedZones() {
      const start = (this.zonePagination.page - 1) * this.zonePagination.size
      return this.zones.slice(start, start + this.zonePagination.size)
    },
    onlineDeviceCount() {
      return this.devices.filter((item) => item.status === '在线').length
    },
    activeViolationCount() {
      return this.violations.filter((item) => item.status !== '已关闭').length
    },
    filteredViolations() {
      const key = this.violationKeyword.toLowerCase()
      return this.violations.filter(
        (item) =>
          (!key || [item.id, item.plate, item.area].join(' ').toLowerCase().indexOf(key) > -1) &&
          (!this.violationType || item.type === this.violationType) &&
          (!this.violationStatus || item.status === this.violationStatus)
      )
    },
    filteredVehicles() {
      const key = this.vehicleKeyword.toLowerCase()
      return this.vehicles.filter(
        (item) =>
          (!key || [item.plate, item.owner].join(' ').toLowerCase().indexOf(key) > -1) && (!this.vehicleType || item.type === this.vehicleType) && (!this.vehicleList || item.list === this.vehicleList)
      )
    },
    filteredPayments() {
      const key = this.paymentKeyword.toLowerCase()
      return this.payments.filter((item) => (!key || [item.id, item.plate].join(' ').toLowerCase().indexOf(key) > -1) && (!this.reconcileStatus || item.reconcile === this.reconcileStatus))
    },
    filteredAudits() {
      const key = this.auditKeyword.toLowerCase()
      if (!key) return this.audits
      return this.audits.filter((item) => {
        return [item.id, item.time, item.action, item.target, item.operator, item.reason, item.approval, item.result].join(' ').toLowerCase().indexOf(key) > -1
      })
    },
    pagedViolations() {
      return this.paginate(this.filteredViolations, 'violations')
    },
    pagedVehicles() {
      return this.paginate(this.filteredVehicles, 'vehicles')
    },
    pagedPayments() {
      return this.paginate(this.filteredPayments, 'finance')
    }
  },
  watch: {
    violationKeyword() {
      this.pagination.violations.page = 1
    },
    violationType() {
      this.pagination.violations.page = 1
    },
    violationStatus() {
      this.pagination.violations.page = 1
    },
    vehicleKeyword() {
      this.pagination.vehicles.page = 1
    },
    vehicleType() {
      this.pagination.vehicles.page = 1
    },
    vehicleList() {
      this.pagination.vehicles.page = 1
    },
    paymentKeyword() {
      this.pagination.finance.page = 1
    },
    reconcileStatus() {
      this.pagination.finance.page = 1
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
    occupancy(zone) {
      return Math.round((zone.occupied / zone.total) * 100)
    },
    changeZonePage(page) {
      const nextPage = Math.min(Math.max(page, 1), this.zonePageCount)
      this.zonePagination.page = nextPage
      const firstZone = this.pagedZones[0]
      if (firstZone && !this.pagedZones.some((item) => item.id === this.selectedZoneId)) {
        this.selectedZoneId = firstZone.id
      }
    },
    paginate(list, type) {
      const state = this.pagination[type]
      return list.slice((state.page - 1) * state.size, state.page * state.size)
    },
    changePageSize(type, size) {
      this.pagination[type].size = size
      this.pagination[type].page = 1
    },
    levelClass(level) {
      return level === '紧急' ? 'critical' : level === '重要' ? 'major' : 'normal'
    },
    violationTag(status) {
      const map = { 待确认: 'danger', 待处理: 'warning', 处置中: 'warning', 巡查中: '', 已关闭: 'success' }
      return map[status] || 'info'
    },
    deviceIcon(type) {
      const map = { 道闸: 'el-icon-switch-button', 相机: 'el-icon-camera', 诱导屏: 'el-icon-monitor', 车位设备: 'el-icon-cpu' }
      return map[type] || 'el-icon-connection'
    },
    refreshParking() {
      this.$message.success('车位、出入口和停车设备状态已同步')
    },
    showEntrance(item) {
      this.$message.info(item.plate + ' · ' + item.gate + ' · ' + item.result)
    },
    showDevice(device) {
      this.$message[device.status === '在线' ? 'success' : 'warning'](device.name + '：' + device.status + ' / ' + device.mode)
    },
    saveRules() {
      this.ruleDialogVisible = false
      this.$message.success('违停识别规则已保存并下发')
    },
    resetVehicleForm() {
      this.vehicleForm = { editingId: '', plate: '', type: '固定车', owner: '', list: '白名单', validRange: ['2026-07-20', '2026-12-31'], areas: ['A/B地库'], spaces: ['普通车位'] }
    },
    openVehicle(row) {
      this.resetVehicleForm()
      if (row)
        this.vehicleForm = {
          editingId: row.id,
          plate: row.plate,
          type: row.type,
          owner: row.owner,
          list: row.list,
          validRange: [row.validFrom === '-' ? '2026-07-20' : row.validFrom, row.validTo === '-' || row.validTo === '当日离场' ? '2026-07-20' : row.validTo],
          areas: row.areas.split('/'),
          spaces: row.spaces.split('/')
        }
      this.vehicleDialogVisible = true
    },
    saveVehicle() {
      if (!this.vehicleForm.plate || !this.vehicleForm.type || !this.vehicleForm.validRange) {
        this.$message.warning('请完善车牌、车辆类型和有效期')
        return
      }
      const row = {
        id: this.vehicleForm.editingId || 'VC' + String(this.vehicles.length + 1).padStart(3, '0'),
        plate: this.vehicleForm.plate,
        type: this.vehicleForm.type,
        owner: this.vehicleForm.owner || '-',
        validFrom: this.vehicleForm.validRange[0],
        validTo: this.vehicleForm.validRange[1],
        areas: this.vehicleForm.areas.join('/'),
        spaces: this.vehicleForm.spaces.join('/'),
        list: this.vehicleForm.list,
        status: this.vehicleForm.list === '黑名单' ? '拦截' : '有效'
      }
      const index = this.vehicles.findIndex((item) => item.id === row.id)
      if (index > -1) this.$set(this.vehicles, index, row)
      else this.vehicles.unshift(row)
      this.vehicleDialogVisible = false
      this.openWorkspace('vehicles')
      this.$message.success('车辆权限已保存并进入设备下发队列')
    },
    openManualPassage() {
      this.manualForm = { action: '人工抬杆', gate: '南门入口', originalPlate: '', correctedPlate: '', target: '', reason: '', approver: '' }
      this.manualDialogVisible = true
    },
    submitManualPassage() {
      if (!this.manualForm.gate || !this.manualForm.reason || !this.manualForm.approver) {
        this.$message.warning('请填写出入口、处置原因和复核人')
        return
      }
      this.audits.unshift({
        id: 'PAU' + String(this.audits.length + 1).padStart(3, '0'),
        time: '2026-07-20 10:45:18',
        action: this.manualForm.action,
        target: this.manualForm.gate + ' / ' + (this.manualForm.target || this.manualForm.correctedPlate || '现场车辆'),
        operator: '当前值班员',
        reason: this.manualForm.reason,
        approval: this.manualForm.approver,
        result: '已执行'
      })
      this.manualDialogVisible = false
      this.openWorkspace('audit')
      this.$message.success(this.manualForm.action + '已执行，审计记录不可删除')
    },
    saveEmergency() {
      this.emergencyDialogVisible = false
      this.$message.success('道闸应急策略已保存，尚未启用')
    },
    requestEmergency() {
      this.emergencyDialogVisible = false
      this.$message.success('应急策略启用申请已提交双人审批')
    },
    saveReconciliation() {
      this.reconcileDialogVisible = false
      this.$message.success('停车收费与财务对账口径已保存')
    },
    handleFinance(row) {
      this.$confirm('对订单 ' + row.id + ' 发起发票或退款业务？', '订单业务', { type: 'warning' })
        .then(() => this.$message.success('订单业务申请已提交，等待财务复核'))
        .catch(() => {})
    },
    openViolation(row) {
      this.currentViolation = row
      this.violationDrawerVisible = true
    },
    addViolationTrace(row, action, remark) {
      row.traces.push({ time: '10:45:20', action, user: '当前值班员', remark })
    },
    notifyViolation(row) {
      row.voice = '已提醒'
      row.status = row.status === '待确认' ? '待处理' : row.status
      this.addViolationTrace(row, '语音提醒', '已调用现场语音终端播报移车提醒')
      this.$message.success('现场语音提醒已下发')
    },
    dispatchViolation(row) {
      row.assignee = '周杰'
      row.status = '巡查中'
      row.response = '到场剩余 10:00'
      this.addViolationTrace(row, '通知巡查', '已派发至周杰移动端')
      this.$message.success('已通知巡查人员周杰')
    },
    createViolationOrder(row) {
      row.workOrder = 'PA-WO88' + String(this.violations.indexOf(row) + 30)
      row.status = '处置中'
      this.addViolationTrace(row, '生成工单', row.workOrder + ' 已进入处置队列')
      this.$message.success('违停事件已转处置工单')
    },
    closeViolation(row) {
      row.status = '已关闭'
      row.response = '已处置关闭'
      row.leaveTime = row.leaveTime === '-' ? '2026-07-20 10:45:28' : row.leaveTime
      this.addViolationTrace(row, '确认关闭', '现场复核完成，车辆已驶离或违规解除')
      this.$message.success('违停事件已关闭并保留完整记录')
    }
  }
}
</script>

<style lang="scss" scoped>
@import './passageCommon.scss';

.parking-overview {
  display: grid;
  grid-template-columns: minmax(680px, 1fr) 330px;
  height: var(--iot-overview-height);
  align-items: stretch;
  gap: 12px;
  margin-bottom: 18px;
}
.zone-board {
  display: flex;
  min-height: 0;
  flex-direction: column;
}
.zone-layout {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(320px, 2fr);
  grid-template-rows: minmax(0, 1fr) auto;
  min-height: 0;
  flex: 1 1 auto;
  overflow: hidden;
}
.zone-grid {
  display: grid;
  min-height: 0;
  align-content: start;
  grid-column: 1;
  grid-row: 1;
  grid-auto-rows: minmax(96px, auto);
  grid-template-columns: repeat(2, minmax(230px, 1fr));
  gap: 10px 12px;
  overflow: hidden;
  padding: 14px;
}
.zone-pagination {
  grid-column: 1;
  grid-row: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 0 14px 14px;
  padding: 8px 10px;
  color: #5d789b;
  background: linear-gradient(180deg, rgba(245, 249, 255, 0.72), #f5f9ff);
  border: 1px solid #dbe7f7;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.35;
}
.zone-pagination > span {
  color: #6d7d91;
}
.zone-pagination > div {
  display: flex;
  align-items: center;
  gap: 5px;
}
.zone-pagination button {
  display: inline-flex;
  min-width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  padding: 0 7px;
  color: #5d789b;
  background: #fff;
  border: 1px solid #dce6f2;
  border-radius: 5px;
  cursor: pointer;
}
.zone-pagination button.active {
  color: #fff;
  background: #3478e1;
  border-color: #3478e1;
}
.zone-pagination button:disabled {
  color: #b6c0cc;
  background: #eef2f7;
  cursor: not-allowed;
}
.zone-card {
  min-height: 96px;
  padding: 11px 13px;
  color: inherit;
  text-align: left;
  background: #fafbfc;
  border: 1px solid #e8edf2;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}
.zone-card:hover,
.zone-card.active {
  background: #f5f9ff;
  border-color: #bcd3f6;
  box-shadow: 0 2px 8px rgba(49, 98, 169, 0.08);
}
.zone-card.warning {
  border-left: 4px solid #e99a2d;
}
.zone-card-head,
.zone-card-meta,
.zone-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.zone-card-head > span {
  color: #44536a;
  font-size: 12px;
  font-weight: 600;
}
.zone-card-head > span i {
  margin-right: 5px;
  color: #3579df;
}
.zone-card-head > b {
  color: #1aa273;
  font-size: 22px;
}
.zone-card-head > b small {
  margin-left: 3px;
  color: #8d99a8;
  font-size: 10px;
  font-weight: 400;
}
.occupancy-track {
  height: 6px;
  margin: 10px 0 7px;
  overflow: hidden;
  background: #e8edf3;
  border-radius: 3px;
}
.occupancy-track i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #42b78a, #3478e1);
  border-radius: inherit;
}
.zone-card.warning .occupancy-track i {
  background: linear-gradient(90deg, #eab24d, #e9862b);
}
.zone-card-meta,
.zone-card-foot {
  color: #8a96a6;
  font-size: 10px;
}
.zone-card-foot {
  margin-top: 7px;
  padding-top: 7px;
  border-top: 1px dashed #e5e9ef;
}
.zone-card-foot .danger {
  color: #df4c4c;
}
.zone-detail {
  display: grid;
  grid-column: 2;
  grid-row: 1 / span 2;
  grid-template-columns: minmax(128px, 0.85fr) minmax(150px, 1.15fr);
  grid-template-rows: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px 16px;
  padding: 20px;
  background: #f8fafc;
  border-left: 1px solid #edf0f4;
}
.zone-detail-title {
  display: flex;
  grid-column: 1 / -1;
  width: 100%;
  align-items: center;
  gap: 8px;
}
.zone-detail-title > span {
  display: flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #3478e1;
  border-radius: 7px;
}
.zone-detail-title b,
.zone-detail-title small {
  display: block;
}
.zone-detail-title b {
  color: #38475c;
  font-size: 13px;
}
.zone-detail-title small {
  margin-top: 3px;
  color: #919cab;
  font-size: 10px;
}
.zone-ring {
  display: flex;
  grid-column: 1;
  grid-row: 2;
  width: 128px;
  height: 128px;
  align-items: center;
  justify-content: center;
  justify-self: center;
  margin: 0;
  background: conic-gradient(#3478e1 var(--rate), #e8edf3 0);
  border-radius: 50%;
}
.zone-ring::before {
  position: absolute;
  width: 98px;
  height: 98px;
  background: #f8fafc;
  border-radius: 50%;
  content: '';
}
.zone-ring > div {
  position: relative;
  z-index: 1;
  text-align: center;
}
.zone-ring b,
.zone-ring span {
  display: block;
}
.zone-ring b {
  color: #314158;
  font-size: 24px;
}
.zone-ring span {
  margin-top: 2px;
  color: #8c98a7;
  font-size: 11px;
}
.zone-detail-grid {
  display: grid;
  grid-column: 2;
  grid-row: 2;
  width: 100%;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
  margin: 0;
}
.zone-detail-grid span {
  padding: 9px;
  background: #fff;
  border: 1px solid #e8edf2;
  border-radius: 4px;
}
.zone-detail-grid small,
.zone-detail-grid b {
  display: block;
}
.zone-detail-grid small {
  color: #929dab;
  font-size: 10px;
}
.zone-detail-grid b {
  margin-top: 3px;
  color: #44536a;
  font-size: 13px;
}
.zone-detail-grid b.green {
  color: #1b9f6d;
}
.zone-detail-grid b.red {
  color: #df4d4d;
}
.zone-detail > .el-button {
  grid-column: 1 / -1;
  grid-row: 3;
  min-width: 142px;
  justify-self: center;
}
.entrance-panel {
  display: flex;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}
.entrance-panel .surface-title {
  font-size: 15px;
}
.entrance-panel .surface-subtitle {
  font-size: 12px;
}
.entrance-panel ::v-deep .el-button--text {
  font-size: 12px;
}
.entrance-list {
  min-height: 0;
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 8px 12px 4px;
}
.entrance-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  min-height: 62px;
  padding: 10px 5px;
  color: inherit;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
}
.entrance-item:hover {
  background: #f8fafc;
}
.direction-icon {
  display: flex;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  color: #1aa273;
  background: #eaf8f3;
  border-radius: 6px;
  font-size: 14px;
}
.direction-icon.out {
  color: #3478e1;
  background: #edf4ff;
}
.entrance-main {
  min-width: 0;
  flex: 1;
}
.entrance-main b,
.entrance-main small,
.entrance-result b,
.entrance-result small {
  display: block;
}
.entrance-main b {
  color: #3c4b61;
  font-size: 13px;
}
.entrance-main small,
.entrance-result small {
  margin-top: 3px;
  color: #929ead;
  font-size: 11px;
}
.entrance-result {
  text-align: right;
}
.entrance-result b {
  color: #1a9d6c;
  font-size: 12px;
}
.entrance-result b.warning {
  color: #d3821d;
}
.entrance-result b.danger {
  color: #df4b4b;
}
.device-summary {
  margin: 10px 12px 12px;
  padding: 12px;
  background: #f7f9fc;
  border-radius: 6px;
}
.summary-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #425168;
  font-size: 13px;
}
.summary-title span {
  color: #8794a6;
  font-size: 11px;
}
.device-chips {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
  margin-top: 10px;
}
.device-chips button {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 7px;
  min-height: 32px;
  padding: 7px 8px;
  color: #688075;
  text-align: left;
  background: #fff;
  border: 1px solid #dfebe6;
  border-radius: 4px;
  cursor: pointer;
}
.device-chips button.fault {
  color: #c85353;
  background: #fff8f8;
  border-color: #f1dcdc;
}
.device-chips span {
  overflow: hidden;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.violation-hero {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 -18px 14px;
  padding: 15px 18px;
  background: #fff0f0;
  border-top: 3px solid #e84e4e;
}
.violation-hero.major {
  background: #fff8ef;
  border-color: #ee9824;
}
.violation-hero.normal {
  background: #f2f7ff;
  border-color: #397fe4;
}
.violation-hero > span {
  display: flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #e84e4e;
  border-radius: 8px;
}
.violation-hero > div {
  min-width: 0;
  flex: 1;
}
.violation-hero small,
.violation-hero h3,
.violation-hero p {
  display: block;
  margin: 0;
}
.violation-hero h3 {
  margin: 4px 0;
  color: #344159;
  font-size: 15px;
}
.violation-hero small,
.violation-hero p {
  color: #8793a4;
  font-size: 9px;
}
.evidence-preview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}
.evidence-preview > div {
  display: flex;
  height: 92px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #dbe5eb;
  background: linear-gradient(135deg, #1d2c34, #344a54);
  border-radius: 6px;
}
.evidence-preview i {
  font-size: 23px;
}
.evidence-preview span {
  margin-top: 7px;
  font-size: 9px;
}
.evidence-preview b {
  margin-top: 3px;
  color: #9aadb6;
  font-size: 8px;
}
.response-box {
  margin-top: 12px;
  padding: 9px 10px;
  color: #886326;
  background: #fff8ed;
  border-radius: 4px;
  font-size: 10px;
}
.response-box i {
  margin-right: 5px;
}
@media (max-width: 1220px) {
  .parking-overview {
    grid-template-columns: 1fr;
    height: auto;
  }
  .zone-layout {
    min-height: clamp(380px, 52vh, 560px);
    min-height: clamp(380px, 52dvh, 560px);
    flex: none;
  }
}
@media (max-width: 760px) {
  .zone-layout {
    display: block;
    min-height: 0;
  }
  .zone-grid {
    grid-template-columns: 1fr;
  }
  .zone-detail {
    border-top: 1px solid #edf0f4;
    border-left: 0;
  }
}
</style>

<style lang="scss">
.passage-detail-drawer {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.passage-detail-drawer .el-drawer__header {
  flex: 0 0 auto;
  margin-bottom: 0;
  padding: 16px 18px;
  border-bottom: 1px solid #e7ebf1;
}
.passage-detail-drawer .el-drawer__body {
  min-height: 0;
  flex: 1 1 auto;
  overflow: hidden;
}
.parking-detail-drawer .el-drawer__header {
  color: #233248;
  font-size: 16px;
}
.parking-detail-drawer .violation-hero h3 {
  font-size: 18px;
  line-height: 24px;
}
.parking-detail-drawer .violation-hero small,
.parking-detail-drawer .violation-hero p {
  font-size: 12px;
  line-height: 18px;
}
.parking-detail-drawer .violation-hero > .el-tag {
  display: inline-flex;
  width: auto;
  min-width: 58px;
  height: 28px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  box-sizing: border-box;
}
.parking-detail-drawer .evidence-preview span {
  font-size: 12px;
  line-height: 18px;
}
.parking-detail-drawer .evidence-preview b {
  font-size: 11px;
  line-height: 16px;
}
.parking-detail-drawer .detail-info-grid > span {
  padding: 12px;
}
.parking-detail-drawer .detail-info-grid small {
  font-size: 12px;
  line-height: 18px;
}
.parking-detail-drawer .detail-info-grid b {
  font-size: 13px;
  line-height: 20px;
}
.parking-detail-drawer .response-box {
  padding: 11px 12px;
  font-size: 12px;
  line-height: 18px;
}
.parking-detail-drawer .detail-section h4 {
  font-size: 14px;
}
.parking-detail-drawer .el-timeline-item__timestamp {
  font-size: 12px;
}
.parking-detail-drawer .trace-card {
  padding: 11px 13px;
}
.parking-detail-drawer .trace-card b {
  font-size: 13px;
}
.parking-detail-drawer .trace-card span {
  font-size: 11px;
}
.parking-detail-drawer .trace-card p {
  font-size: 12px;
  line-height: 20px;
}
.parking-detail-drawer .drawer-actions .el-button {
  font-size: 13px;
}
.passage-config-dialog .el-dialog__body {
  max-height: calc(90vh - 125px);
  overflow-y: auto;
  box-sizing: border-box;
}
@media (max-width: 900px) {
  .passage-config-dialog {
    width: calc(100% - 24px) !important;
  }
}
</style>
