<template>
  <div class="passage-page visitor-page">
    <header class="page-header">
      <div>
        <div class="title-line">
          <h2>智能访客</h2>
          <span class="live-badge"><i></i> 跨系统权限实时联动</span>
        </div>
        <p>预约审批、现场核验、临时凭证、在园访客与停车/门禁/梯控联动管理</p>
      </div>
      <div class="header-actions">
        <el-button size="small" icon="el-icon-lock" @click="policyDialogVisible = true">数据与隐私策略</el-button
        ><el-button size="small" icon="el-icon-user-solid" @click="evacuationDialogVisible = true">在园疏散清单</el-button
        ><el-button size="small" icon="el-icon-suitcase" @click="openGroupVisit">团体 / 外协登记</el-button
        ><el-button type="primary" size="small" icon="el-icon-plus" @click="openReservation()">新建访客预约</el-button>
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

    <iot-workspace-nav v-model="managementTab" :items="workspaceNav" aria-label="智能访客业务工作区" @change="handleWorkspaceChange" />

    <section v-if="managementTab === 'overview'" ref="workspaceContent" class="visitor-overview" tabindex="-1">
      <article class="surface visitor-board">
        <div class="surface-head">
          <div>
            <div class="surface-title"><i class="el-icon-data-analysis"></i> 今日到访态势</div>
            <span class="surface-subtitle">预约、审批、核验、在园与离场数据由各通行设备实时回传</span>
          </div>
          <div class="surface-meta">
            <span><i class="dot online"></i>联动正常 45</span><span><i class="dot warning"></i>待审批 {{ pendingReservations.length }}</span
            ><span class="sync-time">更新 {{ lastSyncTime }}</span
            ><el-button size="mini" icon="el-icon-refresh" :loading="refreshing" :disabled="refreshing" @click="refreshVisitor">刷新</el-button>
          </div>
        </div>
        <div class="process-flow">
          <div v-for="(item, index) in process" :key="item.key" class="process-step">
            <div class="process-node" :style="{ '--step-color': item.color }">
              <i :class="processIcon(item.key)"></i><b>{{ item.value }}</b>
            </div>
            <span>{{ item.name }}</span
            ><i v-if="index < process.length - 1" class="el-icon-arrow-right flow-arrow"></i>
          </div>
        </div>
        <div class="visitor-live-layout">
          <div class="visitor-map">
            <div class="map-grid"></div>
            <div class="campus-road road-h"></div>
            <div class="campus-road road-v"></div>
            <div v-for="zone in visitorZones" :key="zone.name" class="visitor-zone" :class="zone.className">
              <i :class="zone.icon"></i><b>{{ zone.name }}</b
              ><span>{{ zone.count }} 人</span><small>{{ zone.note }}</small>
            </div>
            <div class="map-legend">
              <span><i class="normal"></i>正常</span><span><i class="warning"></i>即将超时</span><span><i class="danger"></i>异常</span>
            </div>
          </div>
          <aside class="inpark-preview">
            <div class="preview-head">
              <b>当前在园访客</b
              ><el-button type="text" size="mini" aria-label="进入当前在园访客管理" @click="openWorkspace('inpark')">进入在园管理 <i class="el-icon-arrow-right"></i></el-button>
            </div>
            <button v-for="item in inPark.slice(0, 4)" :key="item.id" type="button" @click="openInPark(item)">
              <span class="visitor-avatar">{{ visitorInitial(item.visitor) }}</span
              ><span class="visitor-info"
                ><b>{{ item.visitor }}</b
                ><small>{{ item.company }} · 被访人 {{ item.host }}</small
                ><em><i class="el-icon-location-outline"></i>{{ item.lastLocation }}</em></span
              ><el-tag :type="inParkTag(item.status)" size="mini">{{ item.status }}</el-tag>
            </button>
          </aside>
        </div>
      </article>

      <aside class="surface approval-panel">
        <div class="surface-head">
          <div>
            <div class="surface-title"><i class="el-icon-s-check"></i> 待办与异常提醒</div>
            <span class="surface-subtitle">{{ pendingCount }} 项需要处理</span>
          </div>
          <el-button type="text" size="mini" aria-label="进入访客预约审批工作区" @click="openWorkspace('reservations')">进入预约审批 <i class="el-icon-arrow-right"></i></el-button>
        </div>
        <div class="approval-list">
          <button v-for="item in pendingReservations.slice(0, 3)" :key="item.id" type="button" class="approval-item" @click="openReservationDetail(item)">
            <span class="approval-icon"><i :class="item.type === '团体施工' ? 'el-icon-suitcase' : 'el-icon-user'"></i></span
            ><span
              ><b>{{ item.visitor }}</b
              ><small>{{ item.reason }} · 被访人 {{ item.host }}</small
              ><em>{{ item.window }}　{{ item.type }}</em></span
            ><el-tag type="warning" size="mini">{{ item.status }}</el-tag></button
          ><button v-for="alert in alerts.slice(0, 3)" :key="alert.id" type="button" class="approval-item alert" @click="openAlert(alert)">
            <span class="approval-icon"><i class="el-icon-warning-outline"></i></span
            ><span
              ><b>{{ alert.type }}</b
              ><small>{{ alert.visitor }} · {{ alert.location }}</small
              ><em>{{ alert.detail }}</em></span
            ><el-tag :type="alert.level === '紧急' ? 'danger' : 'warning'" size="mini">{{ alert.status }}</el-tag>
          </button>
        </div>
        <div class="approval-footer"><i class="el-icon-bell"></i>超时待审批将自动提醒被访人和访客管理员</div>
      </aside>
    </section>

    <section v-else ref="workspaceContent" class="surface management-card workspace-detail" tabindex="-1">
      <iot-workspace-header :item="currentWorkspace" :updated-at="lastSyncTime" :show-back="false" @back="openWorkspace('overview')" />
      <el-tabs v-model="managementTab" class="workspace-tabs">
        <el-tab-pane name="reservations"
          ><span slot="label"
            ><i class="el-icon-date"></i> 访客预约 <b class="tab-count">{{ reservations.length }}</b></span
          >
          <div class="table-toolbar">
            <div class="filter-group">
              <el-input v-model.trim="reservationKeyword" size="small" clearable prefix-icon="el-icon-search" placeholder="预约号 / 访客 / 被访人" /><el-select
                v-model="reservationType"
                size="small"
                clearable
                placeholder="访客类型"
                ><el-option v-for="item in visitorTypes" :key="item" :label="item" :value="item" /></el-select
              ><el-select v-model="reservationStatus" size="small" clearable placeholder="预约状态"
                ><el-option v-for="item in reservationStatuses" :key="item" :label="item" :value="item"
              /></el-select>
            </div>
            <el-button type="primary" size="small" icon="el-icon-plus" @click="openReservation()">新建预约</el-button>
          </div>
          <el-table :data="pagedReservations" size="small"
            ><el-table-column prop="id" label="预约编号" min-width="140" /><el-table-column prop="visitor" label="访客/团体" min-width="120" /><el-table-column
              prop="company"
              label="单位"
              min-width="115"
            /><el-table-column prop="host" label="被访人" width="85" /><el-table-column prop="reason" label="来访事由" min-width="115" /><el-table-column
              prop="type"
              label="类型"
              width="95"
            /><el-table-column label="访问时间" min-width="160"
              ><template slot-scope="{ row }">{{ row.visitDate }} {{ row.window }}</template></el-table-column
            ><el-table-column label="访问范围" min-width="160" show-overflow-tooltip
              ><template slot-scope="{ row }">{{ row.areas.join('、') }}</template></el-table-column
            ><el-table-column prop="plate" label="车辆" min-width="110" /><el-table-column prop="credential" label="凭证" width="110" /><el-table-column label="状态" width="90"
              ><template slot-scope="{ row }"
                ><el-tag :type="reservationTag(row.status)" size="mini">{{ row.status }}</el-tag></template
              ></el-table-column
            ><el-table-column label="操作" width="90" fixed="right"
              ><template slot-scope="{ row }"><el-button type="text" size="mini" @click="openReservationDetail(row)">详情 / 审批</el-button></template></el-table-column
            ></el-table
          >
          <div class="table-pagination">
            <el-pagination
              background
              :current-page.sync="pagination.reservations.page"
              :page-size="pagination.reservations.size"
              :page-sizes="[5, 10, 20]"
              :total="filteredReservations.length"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="changePageSize('reservations', $event)"
            /></div
        ></el-tab-pane>

        <el-tab-pane name="inpark"
          ><span slot="label"
            ><i class="el-icon-user"></i> 当前在园清单 <b class="tab-count">{{ inPark.length }}</b></span
          >
          <div class="table-toolbar">
            <div class="filter-group">
              <el-input v-model.trim="inParkKeyword" size="small" clearable prefix-icon="el-icon-search" placeholder="访客 / 单位 / 被访人" /><el-select
                v-model="inParkStatus"
                size="small"
                clearable
                placeholder="在园状态"
                ><el-option label="正常" value="正常" /><el-option label="即将超时" value="即将超时" /><el-option label="超时未离场" value="超时未离场"
              /></el-select>
            </div>
            <el-button size="small" icon="el-icon-user-solid" @click="evacuationDialogVisible = true">紧急疏散清单</el-button>
          </div>
          <el-table :data="pagedInPark" size="small"
            ><el-table-column prop="id" label="在园编号" min-width="140" /><el-table-column prop="visitor" label="访客/团体" min-width="120" /><el-table-column
              prop="company"
              label="单位"
              min-width="115"
            /><el-table-column prop="host" label="被访人" width="85" /><el-table-column prop="type" label="类型" width="95" /><el-table-column
              prop="entryTime"
              label="入园时间"
              width="90"
            /><el-table-column prop="expectedLeave" label="应离场" width="85" /><el-table-column prop="lastLocation" label="最近位置" min-width="150" /><el-table-column
              prop="plate"
              label="车辆"
              min-width="110"
            /><el-table-column prop="credential" label="凭证" min-width="110" /><el-table-column label="状态" width="100"
              ><template slot-scope="{ row }"
                ><el-tag :type="inParkTag(row.status)" size="mini">{{ row.status }}</el-tag></template
              ></el-table-column
            ><el-table-column label="操作" width="105" fixed="right"
              ><template slot-scope="{ row }"
                ><el-button type="text" size="mini" @click="openInPark(row)">详情</el-button><el-button type="text" size="mini" @click="confirmLeave(row)">确认离场</el-button></template
              ></el-table-column
            ></el-table
          >
          <div class="table-pagination">
            <el-pagination background :current-page.sync="pagination.inpark.page" :page-size="pagination.inpark.size" :total="filteredInPark.length" layout="total, prev, pager, next" /></div
        ></el-tab-pane>

        <el-tab-pane name="alerts"
          ><span slot="label"
            ><i class="el-icon-warning-outline"></i> 访客异常 <b class="tab-count danger">{{ activeAlertCount }}</b></span
          >
          <div class="table-toolbar">
            <div class="filter-group">
              <el-input v-model.trim="alertKeyword" size="small" clearable prefix-icon="el-icon-search" placeholder="告警号 / 访客 / 位置" /><el-select
                v-model="alertType"
                size="small"
                clearable
                placeholder="异常类型"
                ><el-option v-for="item in alertTypes" :key="item" :label="item" :value="item" /></el-select
              ><el-select v-model="alertStatus" size="small" clearable placeholder="处置状态"
                ><el-option label="待处理" value="待处理" /><el-option label="已升级" value="已升级" /><el-option label="已确认" value="已确认" /><el-option label="已拦截" value="已拦截" /><el-option
                  label="已关闭"
                  value="已关闭"
              /></el-select>
            </div>
            <div class="toolbar-note"><i class="el-icon-connection"></i>停车、门禁和梯控记录联合判断</div>
          </div>
          <el-table :data="pagedAlerts" size="small"
            ><el-table-column prop="id" label="告警编号" min-width="140" /><el-table-column label="等级" width="72"
              ><template slot-scope="{ row }"
                ><span class="level-pill" :class="row.level === '紧急' ? 'critical' : row.level === '重要' ? 'major' : 'normal'">{{ row.level }}</span></template
              ></el-table-column
            ><el-table-column prop="type" label="异常类型" min-width="125" /><el-table-column prop="visitor" label="访客" width="105" /><el-table-column
              prop="location"
              label="位置"
              min-width="160"
            /><el-table-column prop="time" label="时间" width="95" /><el-table-column prop="detail" label="异常说明" min-width="240" show-overflow-tooltip /><el-table-column
              prop="linked"
              label="联动结果"
              min-width="145"
            /><el-table-column label="状态" width="88"
              ><template slot-scope="{ row }"
                ><el-tag :type="alertTag(row.status)" size="mini">{{ row.status }}</el-tag></template
              ></el-table-column
            ><el-table-column label="操作" width="88" fixed="right"
              ><template slot-scope="{ row }"><el-button type="text" size="mini" @click="openAlert(row)">详情 / 处置</el-button></template></el-table-column
            ></el-table
          >
          <div class="table-pagination">
            <el-pagination background :current-page.sync="pagination.alerts.page" :page-size="pagination.alerts.size" :total="filteredAlerts.length" layout="total, prev, pager, next" /></div
        ></el-tab-pane>

        <el-tab-pane name="linkage"
          ><span slot="label"
            ><i class="el-icon-connection"></i> 权限联动 <b class="tab-count">{{ linkages.length }}</b></span
          >
          <div class="table-toolbar">
            <div class="toolbar-note"><i class="el-icon-lock"></i>仅开放审批通过的车辆、门区与楼层，到期、取消或离场自动回收</div>
            <el-button size="small" icon="el-icon-refresh" @click="retryLinkage">重试异常联动</el-button>
          </div>
          <el-table :data="linkages" size="small"
            ><el-table-column prop="reservation" label="预约编号" min-width="140" /><el-table-column prop="visitor" label="访客" min-width="105" /><el-table-column
              prop="parking"
              label="停车权限"
              min-width="180"
            /><el-table-column prop="access" label="门禁权限" min-width="200" /><el-table-column prop="elevator" label="梯控权限" min-width="180" /><el-table-column
              prop="credential"
              label="临时凭证"
              min-width="120"
            /><el-table-column prop="valid" label="有效时间" width="120" /><el-table-column label="联动状态" width="95"
              ><template slot-scope="{ row }"
                ><el-tag :type="row.status === '生效中' ? 'success' : row.status === '已取消' ? 'info' : 'warning'" size="mini">{{ row.status }}</el-tag></template
              ></el-table-column
            ><el-table-column label="操作" width="80"
              ><template slot-scope="{ row }"><el-button type="text" size="mini" @click="showLinkage(row)">联动详情</el-button></template></el-table-column
            ></el-table
          ></el-tab-pane
        >
      </el-tabs>
    </section>

    <el-dialog title="新建访客预约" :visible.sync="reservationDialogVisible" width="740px" top="5vh" custom-class="passage-config-dialog"
      ><div class="dialog-intro">
        <i class="el-icon-date"></i><span><b>预约、审批与权限联动</b>记录来访事由、被访人、访问范围、车辆和有效时间，审批通过后生成临时凭证。</span>
      </div>
      <el-form :model="reservationForm" label-width="95px" size="small" class="config-form"
        ><el-row :gutter="16"
          ><el-col :span="12"
            ><el-form-item label="访客姓名" required><el-input v-model.trim="reservationForm.visitor" /></el-form-item></el-col
          ><el-col :span="12"
            ><el-form-item label="手机号码" required><el-input v-model.trim="reservationForm.phone" /></el-form-item></el-col></el-row
        ><el-row :gutter="16"
          ><el-col :span="12"
            ><el-form-item label="访客单位"><el-input v-model.trim="reservationForm.company" /></el-form-item></el-col
          ><el-col :span="12"
            ><el-form-item label="访客类型"
              ><el-select v-model="reservationForm.type"><el-option v-for="item in visitorTypes" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col></el-row
        ><el-row :gutter="16"
          ><el-col :span="12"
            ><el-form-item label="被访人" required
              ><el-select v-model="reservationForm.host"
                ><el-option v-for="item in hostOptions" :key="item.name" :label="item.name + ' · ' + item.org" :value="item.name" /></el-select></el-form-item></el-col
          ><el-col :span="12"
            ><el-form-item label="来访事由" required><el-input v-model.trim="reservationForm.reason" /></el-form-item></el-col></el-row
        ><el-row :gutter="16"
          ><el-col :span="10"
            ><el-form-item label="到访日期"><el-date-picker v-model="reservationForm.visitDate" value-format="yyyy-MM-dd" /></el-form-item></el-col
          ><el-col :span="14"
            ><el-form-item label="有效时段"><el-time-picker v-model="reservationForm.window" is-range value-format="HH:mm" format="HH:mm" range-separator="至" /></el-form-item></el-col></el-row
        ><el-form-item label="访问门区" required
          ><el-checkbox-group v-model="reservationForm.areas"
            ><el-checkbox v-for="item in areaOptions" :key="item" :label="item">{{ item }}</el-checkbox></el-checkbox-group
          ></el-form-item
        ><el-form-item label="开放楼层"
          ><el-checkbox-group v-model="reservationForm.floors"
            ><el-checkbox label="1层">1层</el-checkbox><el-checkbox label="2层">2层</el-checkbox><el-checkbox label="3层">3层</el-checkbox><el-checkbox label="5层">5层</el-checkbox></el-checkbox-group
          ></el-form-item
        ><el-form-item label="来访车辆"><el-input v-model.trim="reservationForm.plate" placeholder="无车辆可不填" /></el-form-item
        ><el-form-item label="凭证方式"
          ><el-radio-group v-model="reservationForm.credential"
            ><el-radio label="动态二维码">动态二维码</el-radio><el-radio label="身份证核验">身份证核验</el-radio><el-radio label="现场临时卡">现场临时卡</el-radio></el-radio-group
          ></el-form-item
        ><el-form-item label="隐私授权"><el-checkbox v-model="reservationForm.privacy">已向访客告知采集目的、访问范围和保存期限</el-checkbox></el-form-item></el-form
      ><span slot="footer"><el-button @click="reservationDialogVisible = false">取消</el-button><el-button type="primary" @click="submitReservation">提交被访人审批</el-button></span></el-dialog
    >

    <el-dialog title="团体访客 / 外协施工登记" :visible.sync="groupDialogVisible" width="720px" custom-class="passage-config-dialog"
      ><div class="dialog-intro warning">
        <i class="el-icon-suitcase"></i><span><b>批量实名与负责人制</b>支持团体访客、外协施工和送货人员，主联系人负责名单确认，重要区域需增加安保复核。</span>
      </div>
      <el-form :model="groupForm" label-width="105px" size="small" class="config-form"
        ><el-row :gutter="16"
          ><el-col :span="12"
            ><el-form-item label="团体/单位名称" required><el-input v-model.trim="groupForm.name" /></el-form-item></el-col
          ><el-col :span="12"
            ><el-form-item label="访问类型"
              ><el-select v-model="groupForm.type"
                ><el-option label="团体访客" value="团体访客" /><el-option label="外协施工" value="外协施工" /><el-option
                  label="送货人员"
                  value="送货人员" /></el-select></el-form-item></el-col></el-row
        ><el-row :gutter="16"
          ><el-col :span="12"
            ><el-form-item label="主联系人"><el-input v-model.trim="groupForm.contact" /></el-form-item></el-col
          ><el-col :span="12"
            ><el-form-item label="预计人数"><el-input-number v-model="groupForm.count" :min="2" :max="200" /></el-form-item></el-col></el-row
        ><el-form-item label="被访/负责人"
          ><el-select v-model="groupForm.host"><el-option v-for="item in hostOptions" :key="item.name" :label="item.name + ' · ' + item.org" :value="item.name" /></el-select></el-form-item
        ><el-form-item label="访问事由"><el-input v-model.trim="groupForm.reason" type="textarea" :rows="2" /></el-form-item
        ><el-form-item label="实名名单"
          ><el-upload action="#" :auto-upload="false"
            ><el-button size="small" icon="el-icon-upload2">上传访客名单</el-button>
            <div slot="tip" class="el-upload__tip">仿真模式：支持姓名、脱敏证件号、联系电话和工种模板</div></el-upload
          ></el-form-item
        ><el-form-item label="访问区域"
          ><el-checkbox-group v-model="groupForm.areas"
            ><el-checkbox v-for="item in areaOptions" :key="item" :label="item">{{ item }}</el-checkbox></el-checkbox-group
          ></el-form-item
        ><el-form-item label="施工车辆"><el-input v-model.trim="groupForm.plates" placeholder="多个车牌用顿号分隔" /></el-form-item></el-form
      ><span slot="footer"><el-button @click="groupDialogVisible = false">取消</el-button><el-button type="primary" @click="submitGroupVisit">提交团体审批</el-button></span></el-dialog
    >

    <el-dialog title="当前在园访客疏散清单" :visible.sync="evacuationDialogVisible" width="820px" top="6vh" custom-class="passage-config-dialog"
      ><div class="dialog-intro danger">
        <i class="el-icon-user-solid"></i><span><b>紧急疏散使用</b>清单依据停车、门禁和梯控最新通行记录实时生成，导出文件带操作者、时间和用途水印。</span>
      </div>
      <div class="evacuation-summary">
        <span
          ><small>当前在园</small><b>{{ inPark.length }}</b></span
        ><span
          ><small>A栋</small><b>{{ evacuationCount('A栋') }}</b></span
        ><span
          ><small>B栋</small><b>{{ evacuationCount('B栋') }}</b></span
        ><span
          ><small>东区</small><b>{{ evacuationCount('东区') }}</b></span
        ><span
          ><small>物流区</small><b>{{ evacuationCount('物流区') }}</b></span
        >
      </div>
      <el-table :data="inPark" size="small" max-height="340"
        ><el-table-column prop="visitor" label="访客/团体" min-width="120" /><el-table-column prop="company" label="单位" min-width="120" /><el-table-column
          prop="host"
          label="被访人"
          width="85"
        /><el-table-column prop="lastLocation" label="最近位置" min-width="160" /><el-table-column prop="entryTime" label="入园时间" width="90" /><el-table-column
          prop="plate"
          label="车辆"
          min-width="105"
        /><el-table-column prop="emergencyGroup" label="疏散分组" width="90" /><el-table-column label="状态" width="100"
          ><template slot-scope="{ row }"
            ><el-tag :type="inParkTag(row.status)" size="mini">{{ row.status }}</el-tag></template
          ></el-table-column
        ></el-table
      ><span slot="footer"
        ><el-button @click="evacuationDialogVisible = false">关闭</el-button><el-button type="danger" icon="el-icon-download" @click="exportEvacuation">限权导出疏散清单</el-button></span
      ></el-dialog
    >

    <el-dialog title="访客数据最小化与保存策略" :visible.sync="policyDialogVisible" width="700px" custom-class="passage-config-dialog"
      ><div class="dialog-intro">
        <i class="el-icon-lock"></i><span><b>最小采集、脱敏展示、限权导出</b>仅采集访客通行所需字段，并按确定周期自动归档或删除。</span>
      </div>
      <el-form :model="dataPolicy" label-width="130px" size="small" class="config-form"
        ><el-form-item label="允许采集字段"
          ><el-checkbox-group v-model="dataPolicy.collectFields"
            ><el-checkbox label="姓名">姓名</el-checkbox><el-checkbox label="脱敏手机号">脱敏手机号</el-checkbox><el-checkbox label="证件核验结果">证件核验结果</el-checkbox
            ><el-checkbox label="来访事由">来访事由</el-checkbox><el-checkbox label="被访人">被访人</el-checkbox><el-checkbox label="访问范围">访问范围</el-checkbox
            ><el-checkbox label="车辆">车辆</el-checkbox></el-checkbox-group
          ></el-form-item
        ><el-row :gutter="16"
          ><el-col :span="12"
            ><el-form-item label="手机号脱敏"><el-switch v-model="dataPolicy.maskMobile" /></el-form-item></el-col
          ><el-col :span="12"
            ><el-form-item label="证件号脱敏"><el-switch v-model="dataPolicy.maskDocument" /></el-form-item></el-col></el-row
        ><el-form-item label="允许导出角色"
          ><el-checkbox-group v-model="dataPolicy.exportRoles"
            ><el-checkbox label="访客管理员">访客管理员</el-checkbox><el-checkbox label="安保负责人">安保负责人</el-checkbox><el-checkbox label="普通前台">普通前台</el-checkbox></el-checkbox-group
          ></el-form-item
        ><el-form-item label="导出审批"><el-switch v-model="dataPolicy.exportApproval" active-text="导出需审批并加水印" /></el-form-item
        ><el-row :gutter="16"
          ><el-col :span="12"
            ><el-form-item label="在线保存周期"><el-input-number v-model="dataPolicy.archiveDays" :min="30" :max="365" /><span class="form-unit">天</span></el-form-item></el-col
          ><el-col :span="12"
            ><el-form-item label="总保存周期"><el-input-number v-model="dataPolicy.retentionDays" :min="30" :max="1095" /><span class="form-unit">天</span></el-form-item></el-col
          ></el-row
        ><el-form-item label="到期自动删除"><el-switch v-model="dataPolicy.autoDelete" active-text="启用不可恢复删除任务" /></el-form-item></el-form
      ><span slot="footer"><el-button @click="policyDialogVisible = false">取消</el-button><el-button type="primary" @click="savePolicy">保存数据策略</el-button></span></el-dialog
    >

    <el-drawer title="访客预约详情" :visible.sync="reservationDrawerVisible" size="520px" custom-class="passage-detail-drawer visitor-detail-drawer" append-to-body
      ><div v-if="currentReservation" class="drawer-layout">
        <div class="drawer-scroll">
          <div class="visitor-hero">
            <span>{{ visitorInitial(currentReservation.visitor) }}</span>
            <div>
              <small>{{ currentReservation.type }}</small>
              <h3>{{ currentReservation.visitor }}</h3>
              <p>{{ currentReservation.id }}　{{ currentReservation.visitDate }} {{ currentReservation.window }}</p>
            </div>
            <el-tag :type="reservationTag(currentReservation.status)">{{ currentReservation.status }}</el-tag>
          </div>
          <div class="detail-info-grid">
            <span
              ><small>访客单位</small><b>{{ currentReservation.company }}</b></span
            ><span
              ><small>被访人</small><b>{{ currentReservation.host }} / {{ currentReservation.hostOrg }}</b></span
            ><span
              ><small>来访事由</small><b>{{ currentReservation.reason }}</b></span
            ><span
              ><small>来访车辆</small><b>{{ currentReservation.plate }}</b></span
            ><span
              ><small>临时凭证</small><b>{{ currentReservation.credential }}</b></span
            ><span
              ><small>使用次数</small><b>{{ currentReservation.times }}</b></span
            >
          </div>
          <div class="detail-section">
            <h4>审批通过的通行范围</h4>
            <div class="scope-tags">
              <span v-for="item in currentReservation.areas" :key="item"><i class="el-icon-key"></i>{{ item }}</span
              ><span v-for="item in currentReservation.floors" :key="'floor-' + item"><i class="el-icon-s-operation"></i>{{ item }}</span>
            </div>
          </div>
          <div class="credential-card" :class="{ disabled: currentReservation.credential === '已失效' || currentReservation.credential === '未发放' }">
            <div class="qr-simulation"><i class="el-icon-full-screen"></i></div>
            <div>
              <b>{{ currentReservation.credential }}</b
              ><span>有效期 {{ currentReservation.visitDate }} {{ currentReservation.window }}</span
              ><small>限定区域 · 限定次数 · 动态防复制</small>
            </div>
          </div>
          <div class="linkage-summary">
            <span
              ><i class="el-icon-truck"></i><b>停车权限</b><small>{{ currentReservation.plate === '-' ? '无车辆' : currentReservation.plate + ' 已关联' }}</small></span
            ><span
              ><i class="el-icon-key"></i><b>门禁权限</b><small>{{ currentReservation.areas.join('、') }}</small></span
            ><span
              ><i class="el-icon-s-operation"></i><b>梯控权限</b><small>{{ currentReservation.floors.join('、') }}</small></span
            >
          </div>
        </div>
        <div class="drawer-actions">
          <el-button v-if="currentReservation.status === '待审批'" type="danger" @click="rejectReservation(currentReservation)">驳回</el-button
          ><el-button v-if="currentReservation.status === '待审批'" type="primary" @click="approveReservation(currentReservation)">审批通过</el-button
          ><el-button v-if="currentReservation.status === '审批通过' && currentReservation.credential === '未发放'" type="primary" @click="issueCredential(currentReservation)">发放凭证</el-button
          ><el-button v-if="['待审批', '审批通过'].indexOf(currentReservation.status) > -1" @click="cancelReservation(currentReservation)">取消预约</el-button>
        </div>
      </div></el-drawer
    >

    <el-drawer title="访客异常详情与处置" :visible.sync="alertDrawerVisible" size="500px" custom-class="passage-detail-drawer visitor-detail-drawer" append-to-body
      ><div v-if="currentAlert" class="drawer-layout">
        <div class="drawer-scroll">
          <div class="alert-hero" :class="{ critical: currentAlert.level === '紧急' }">
            <span><i class="el-icon-warning-outline"></i></span>
            <div>
              <small>{{ currentAlert.level }}提醒</small>
              <h3>{{ currentAlert.type }} · {{ currentAlert.visitor }}</h3>
              <p>{{ currentAlert.id }}　{{ currentAlert.time }}</p>
            </div>
            <el-tag :type="alertTag(currentAlert.status)">{{ currentAlert.status }}</el-tag>
          </div>
          <div class="detail-info-grid">
            <span
              ><small>发生位置</small><b>{{ currentAlert.location }}</b></span
            ><span
              ><small>联动结果</small><b>{{ currentAlert.linked }}</b></span
            >
          </div>
          <div class="alert-detail">
            <i class="el-icon-info"></i>
            <div>
              <b>异常判断</b>
              <p>{{ currentAlert.detail }}</p>
            </div>
          </div>
          <div class="detail-section">
            <h4>处置轨迹</h4>
            <el-timeline
              ><el-timeline-item v-for="(trace, index) in currentAlert.traces" :key="index" :timestamp="trace.time" placement="top"
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
          <el-button v-if="currentAlert.status === '待处理'" type="primary" @click="confirmAlert(currentAlert)">确认告警</el-button
          ><el-button v-if="currentAlert.status !== '已升级' && currentAlert.status !== '已关闭'" type="warning" @click="escalateAlert(currentAlert)">升级安保</el-button
          ><el-button v-if="currentAlert.status !== '已关闭'" type="success" @click="closeAlert(currentAlert)">处置关闭</el-button>
        </div>
      </div></el-drawer
    >
  </div>
</template>

<script>
import IotWorkspaceHeader from '../components/IotWorkspaceHeader.vue'
import IotWorkspaceNav from '../components/IotWorkspaceNav.vue'
import { visitor } from '../mock/passageMockData'

export default {
  name: 'SmartIOTVisitor',
  components: { IotWorkspaceHeader, IotWorkspaceNav },
  data() {
    return {
      kpis: visitor.kpis,
      process: visitor.process,
      reservations: JSON.parse(JSON.stringify(visitor.reservations)),
      inPark: JSON.parse(JSON.stringify(visitor.inPark)),
      alerts: JSON.parse(JSON.stringify(visitor.alerts)),
      linkages: JSON.parse(JSON.stringify(visitor.linkages)),
      dataPolicy: JSON.parse(JSON.stringify(visitor.dataPolicy)),
      visitorZones: [
        { name: 'A栋', count: 9, note: '访客 7 / 外协 2', className: 'zone-a', icon: 'el-icon-office-building' },
        { name: 'B栋', count: 6, note: '访客 2 / 外协 4', className: 'zone-b', icon: 'el-icon-office-building' },
        { name: '东区施工区', count: 16, note: '施工团体 12 / 车辆4', className: 'zone-c', icon: 'el-icon-suitcase' },
        { name: '物流区', count: 5, note: '送货 3 / 外协 2', className: 'zone-d', icon: 'el-icon-box' },
        { name: '公共区域', count: 2, note: '前台核验中', className: 'zone-e', icon: 'el-icon-place' }
      ],
      managementTab: 'overview',
      refreshing: false,
      refreshTimer: null,
      lastSyncTime: '10:48:06',
      reservationKeyword: '',
      reservationType: '',
      reservationStatus: '',
      inParkKeyword: '',
      inParkStatus: '',
      alertKeyword: '',
      alertType: '',
      alertStatus: '',
      pagination: { reservations: { page: 1, size: 5 }, inpark: { page: 1, size: 5 }, alerts: { page: 1, size: 5 } },
      reservationDialogVisible: false,
      groupDialogVisible: false,
      evacuationDialogVisible: false,
      policyDialogVisible: false,
      reservationDrawerVisible: false,
      alertDrawerVisible: false,
      reservationForm: {},
      groupForm: {},
      currentReservation: null,
      currentAlert: null,
      visitorTypes: ['普通访客', '团体访客', '外协人员', '团体施工', '送货人员'],
      reservationStatuses: ['待审批', '审批通过', '已入园', '已离场', '已取消', '已驳回'],
      alertTypes: ['未审批到访', '黑名单命中', '证件异常', '二维码重复使用', '超范围通行', '超时未离场'],
      areaOptions: ['南门', '北门', '物流门', 'A栋大厅', 'A栋3层', 'B栋大厅', 'B栋2层', '东区施工区', '装卸区'],
      hostOptions: [
        { name: '张伟', org: '行政部' },
        { name: '李娜', org: '研发部' },
        { name: '赵敏', org: '财务部' },
        { name: '周杰', org: '工程部' },
        { name: '刘安', org: '仓储部' },
        { name: '陈静', org: '市场部' }
      ]
    }
  },
  computed: {
    workspaceNav() {
      return [
        { key: 'overview', title: '业务总览', description: '到访态势与待办', detail: '查看今日到访流转、园区分布以及需要优先处理的任务。', icon: 'el-icon-data-analysis', count: null },
        { key: 'reservations', title: '预约审批', description: '申请、核验与发证', detail: '集中处理访客预约、被访人审批、临时凭证发放和预约取消。', icon: 'el-icon-date', count: this.reservations.length },
        { key: 'inpark', title: '在园管理', description: '位置、超时与离场', detail: '查看当前在园访客、最近通行位置、应离场时间以及凭证状态。', icon: 'el-icon-user', count: this.inPark.length },
        { key: 'alerts', title: '异常处置', description: '核验、升级与关闭', detail: '统一处置未审批到访、重复凭证、超范围通行和超时未离场事件。', icon: 'el-icon-warning-outline', count: this.activeAlertCount },
        { key: 'linkage', title: '权限联动', description: '停车、门禁与梯控', detail: '核对停车、门禁和梯控权限的下发、回收及异常重试状态。', icon: 'el-icon-connection', count: this.linkages.length }
      ]
    },
    currentWorkspace() {
      return this.workspaceNav.find((item) => item.key === this.managementTab) || this.workspaceNav[0]
    },
    pendingReservations() {
      return this.reservations.filter((item) => item.status === '待审批')
    },
    pendingCount() {
      return this.pendingReservations.length + this.alerts.filter((item) => ['待处理', '已升级'].indexOf(item.status) > -1).length
    },
    activeAlertCount() {
      return this.alerts.filter((item) => item.status !== '已关闭').length
    },
    filteredReservations() {
      const key = this.reservationKeyword.toLowerCase()
      return this.reservations.filter(
        (item) =>
          (!key || [item.id, item.visitor, item.host].join(' ').toLowerCase().indexOf(key) > -1) &&
          (!this.reservationType || item.type === this.reservationType) &&
          (!this.reservationStatus || item.status === this.reservationStatus)
      )
    },
    filteredInPark() {
      const key = this.inParkKeyword.toLowerCase()
      return this.inPark.filter((item) => (!key || [item.visitor, item.company, item.host].join(' ').toLowerCase().indexOf(key) > -1) && (!this.inParkStatus || item.status === this.inParkStatus))
    },
    filteredAlerts() {
      const key = this.alertKeyword.toLowerCase()
      return this.alerts.filter(
        (item) =>
          (!key || [item.id, item.visitor, item.location].join(' ').toLowerCase().indexOf(key) > -1) &&
          (!this.alertType || item.type === this.alertType) &&
          (!this.alertStatus || item.status === this.alertStatus)
      )
    },
    pagedReservations() {
      return this.paginate(this.filteredReservations, 'reservations')
    },
    pagedInPark() {
      return this.paginate(this.filteredInPark, 'inpark')
    },
    pagedAlerts() {
      return this.paginate(this.filteredAlerts, 'alerts')
    }
  },
  watch: {
    reservationKeyword() {
      this.pagination.reservations.page = 1
    },
    reservationType() {
      this.pagination.reservations.page = 1
    },
    reservationStatus() {
      this.pagination.reservations.page = 1
    },
    inParkKeyword() {
      this.pagination.inpark.page = 1
    },
    inParkStatus() {
      this.pagination.inpark.page = 1
    },
    alertKeyword() {
      this.pagination.alerts.page = 1
    },
    alertType() {
      this.pagination.alerts.page = 1
    },
    alertStatus() {
      this.pagination.alerts.page = 1
    }
  },
  beforeDestroy() {
    if (this.refreshTimer) clearTimeout(this.refreshTimer)
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
      return list.slice((state.page - 1) * state.size, state.page * state.size)
    },
    changePageSize(type, size) {
      this.pagination[type].size = size
      this.pagination[type].page = 1
    },
    processIcon(key) {
      const map = { reserved: 'el-icon-date', approved: 'el-icon-s-check', arrived: 'el-icon-place', inPark: 'el-icon-user', left: 'el-icon-circle-check' }
      return map[key] || 'el-icon-more'
    },
    visitorInitial(name) {
      return name ? name.replace(/（.*$/, '').slice(0, 1) : '访'
    },
    reservationTag(status) {
      const map = { 待审批: 'warning', 审批通过: '', 已入园: 'success', 已离场: 'info', 已取消: 'info', 已驳回: 'danger' }
      return map[status] || 'info'
    },
    inParkTag(status) {
      return status === '正常' ? 'success' : status === '即将超时' ? 'warning' : 'danger'
    },
    alertTag(status) {
      const map = { 待处理: 'danger', 已升级: 'danger', 已确认: 'warning', 已拦截: 'warning', 已关闭: 'success' }
      return map[status] || 'info'
    },
    refreshVisitor() {
      if (this.refreshing) return
      this.refreshing = true
      this.refreshTimer = setTimeout(() => {
        const date = new Date()
        this.lastSyncTime = [date.getHours(), date.getMinutes(), date.getSeconds()].map((item) => String(item).padStart(2, '0')).join(':')
        this.refreshing = false
        this.refreshTimer = null
        this.$message.success('访客预约、通行设备和在园清单已同步')
      }, 600)
    },
    resetReservationForm() {
      this.reservationForm = {
        visitor: '',
        phone: '',
        company: '',
        type: '普通访客',
        host: '',
        reason: '',
        visitDate: '2026-07-20',
        window: ['13:00', '15:00'],
        areas: ['南门', 'A栋大厅'],
        floors: ['1层'],
        plate: '',
        credential: '动态二维码',
        privacy: false
      }
    },
    openReservation() {
      this.resetReservationForm()
      this.reservationDialogVisible = true
    },
    submitReservation() {
      if (
        !this.reservationForm.visitor ||
        !this.reservationForm.phone ||
        !this.reservationForm.host ||
        !this.reservationForm.reason ||
        !this.reservationForm.visitDate ||
        !Array.isArray(this.reservationForm.window) ||
        this.reservationForm.window.length !== 2 ||
        !this.reservationForm.areas.length ||
        !this.reservationForm.privacy
      ) {
        this.$message.warning('请完善访客、被访人、访问时间、范围并确认隐私告知')
        return
      }
      const host = this.hostOptions.find((item) => item.name === this.reservationForm.host)
      this.reservations.unshift({
        id: 'VR20260720' + String(this.reservations.length + 20),
        visitor: this.reservationForm.visitor,
        phone: this.reservationForm.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
        company: this.reservationForm.company || '个人',
        host: this.reservationForm.host,
        hostOrg: host ? host.org : '-',
        reason: this.reservationForm.reason,
        type: this.reservationForm.type,
        visitDate: this.reservationForm.visitDate,
        window: this.reservationForm.window.join('-'),
        areas: this.reservationForm.areas.slice(),
        floors: this.reservationForm.floors.slice(),
        plate: this.reservationForm.plate || '-',
        status: '待审批',
        credential: '未发放',
        times: '0/2',
        approver: this.reservationForm.host,
        privacy: '已授权'
      })
      this.pagination.reservations.page = 1
      this.reservationDialogVisible = false
      this.openWorkspace('reservations')
      this.$message.success('访客预约已提交被访人审批')
    },
    openGroupVisit() {
      this.groupForm = { name: '', type: '外协施工', contact: '', count: 5, host: '周杰', reason: '', areas: ['物流门', '东区施工区'], plates: '' }
      this.groupDialogVisible = true
    },
    submitGroupVisit() {
      if (!this.groupForm.name || !this.groupForm.contact || !this.groupForm.reason || !this.groupForm.areas.length) {
        this.$message.warning('请完善团体名称、联系人、事由和访问区域')
        return
      }
      const host = this.hostOptions.find((item) => item.name === this.groupForm.host)
      this.reservations.unshift({
        id: 'VR20260720' + String(this.reservations.length + 20),
        visitor: this.groupForm.name + '（' + this.groupForm.count + '人）',
        phone: '待名单导入',
        company: this.groupForm.name,
        host: this.groupForm.host,
        hostOrg: host ? host.org : '-',
        reason: this.groupForm.reason,
        type: this.groupForm.type === '外协施工' ? '团体施工' : this.groupForm.type,
        visitDate: '2026-07-20',
        window: '08:00-18:00',
        areas: this.groupForm.areas.slice(),
        floors: ['无'],
        plate: this.groupForm.plates || '-',
        status: '待审批',
        credential: '未发放',
        times: '0/' + this.groupForm.count * 4,
        approver: this.groupForm.host,
        privacy: '待名单确认'
      })
      this.groupDialogVisible = false
      this.openWorkspace('reservations')
      this.$message.success('团体访问申请已提交，等待名单核验和审批')
    },
    openReservationDetail(row) {
      this.currentReservation = row
      this.reservationDrawerVisible = true
    },
    approveReservation(row) {
      row.status = '审批通过'
      row.credential = '动态二维码'
      this.issueLinkage(row)
      this.$message.success('预约已审批通过，停车、门禁和梯控权限正在下发')
    },
    rejectReservation(row) {
      row.status = '已驳回'
      row.credential = '已失效'
      this.$message.success('预约已驳回并通知申请人')
    },
    issueCredential(row) {
      row.credential = '动态二维码'
      this.issueLinkage(row)
      this.$message.success('临时凭证已发放')
    },
    cancelReservation(row) {
      row.status = '已取消'
      row.credential = '已失效'
      const linkage = this.linkages.find((item) => item.reservation === row.id)
      if (linkage) {
        linkage.parking = '已回收'
        linkage.access = '已回收'
        linkage.elevator = '已回收'
        linkage.status = '已取消'
      }
      this.$message.success('预约已取消，关联权限已进入回收队列')
    },
    issueLinkage(row) {
      if (this.linkages.some((item) => item.reservation === row.id)) return
      this.linkages.unshift({
        id: 'VL' + String(this.linkages.length + 1).padStart(3, '0'),
        reservation: row.id,
        visitor: row.visitor,
        parking: row.plate === '-' ? '无车辆' : row.plate + ' / 待下发',
        access: row.areas.join('、') + ' / 待下发',
        elevator: row.floors.join('、') + ' / 待下发',
        credential: row.credential,
        valid: row.window,
        status: '待到访'
      })
    },
    openInPark(row) {
      const reservation = this.reservations.find((item) => item.visitor.indexOf(row.visitor.replace(/（.*$/, '')) > -1)
      if (reservation) this.openReservationDetail(reservation)
      else this.$message.info(row.visitor + ' · 最近位置：' + row.lastLocation)
    },
    confirmLeave(row) {
      this.$confirm('确认 ' + row.visitor + ' 已离场？凭证及关联权限将立即失效。', '确认离场', { type: 'warning' })
        .then(() => {
          this.inPark.splice(this.inPark.indexOf(row), 1)
          const reservation = this.reservations.find((item) => item.visitor.indexOf(row.visitor.replace(/（.*$/, '')) > -1)
          if (reservation) {
            reservation.status = '已离场'
            reservation.credential = '已失效'
          }
          this.$message.success('访客已离场，停车、门禁和梯控权限已回收')
        })
        .catch(() => {})
    },
    openAlert(row) {
      this.currentAlert = row
      this.alertDrawerVisible = true
    },
    confirmAlert(row) {
      row.status = '已确认'
      row.traces.push({ time: '10:48:12', action: '人工确认', user: '当前访客管理员', remark: '已联系被访人核实现场情况' })
      this.$message.success('访客异常已确认')
    },
    escalateAlert(row) {
      row.status = '已升级'
      row.linked = '已通知安保班长'
      row.traces.push({ time: '10:48:30', action: '升级安保', user: '当前访客管理员', remark: '已推送安保移动端并通知现场核查' })
      this.$message.success('异常已升级至安保班长')
    },
    closeAlert(row) {
      row.status = '已关闭'
      row.traces.push({ time: '10:49:02', action: '处置关闭', user: '当前访客管理员', remark: '现场核验及权限处置完成' })
      this.$message.success('异常已关闭并保留处置记录')
    },
    retryLinkage() {
      this.linkages
        .filter((item) => item.status === '待到访')
        .forEach((item) => {
          item.parking = item.parking.replace('待下发', '成功')
          item.access = item.access.replace('待下发', '成功')
          item.elevator = item.elevator.replace('待下发', '成功')
        })
      this.$message.success('异常联动任务已重新下发')
    },
    showLinkage(row) {
      this.$message.info(row.visitor + '：' + row.parking + '；' + row.access + '；' + row.elevator)
    },
    evacuationCount(group) {
      return this.inPark.filter((item) => item.emergencyGroup === group).length
    },
    exportEvacuation() {
      this.$message.success('疏散清单已按权限导出，并添加操作者与用途水印')
    },
    savePolicy() {
      if (this.dataPolicy.retentionDays < this.dataPolicy.archiveDays) {
        this.$message.warning('总保存周期不能短于在线保存周期')
        return
      }
      this.policyDialogVisible = false
      this.$message.success('访客数据最小化、脱敏及归档删除策略已保存')
    }
  }
}
</script>

<style lang="scss" scoped>
@import './passageCommon.scss';
.sync-time {
  color: #919cac;
}
.visitor-overview {
  display: grid;
  grid-template-columns: minmax(720px, 1fr) 335px;
  height: var(--iot-overview-height);
  align-items: stretch;
  gap: 12px;
  margin-bottom: 18px;
}
.visitor-board {
  display: flex;
  min-height: 0;
  flex-direction: column;
}
.visitor-overview .surface-title {
  font-size: 16px;
}
.visitor-overview .surface-subtitle,
.visitor-overview .surface-meta {
  font-size: 12px;
}
.process-flow {
  display: flex;
  align-items: flex-start;
  justify-content: space-around;
  padding: 14px 20px 11px;
  border-bottom: 1px solid #edf0f4;
}
.process-step {
  position: relative;
  display: flex;
  min-width: 100px;
  align-items: center;
  flex-direction: column;
}
.process-node {
  display: flex;
  width: 54px;
  height: 54px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #fff;
  background: var(--step-color);
  border: 5px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--step-color) 25%, transparent);
}
.process-node i {
  font-size: 13px;
}
.process-node b {
  margin-top: 2px;
  font-size: 16px;
}
.process-step > span {
  margin-top: 6px;
  color: #5d6c80;
  font-size: 11px;
}
.flow-arrow {
  position: absolute;
  left: calc(50% + 40px);
  top: 20px;
  color: #b3bdc8;
  font-size: 18px;
}
.visitor-live-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 310px;
  min-height: 0;
  flex: 1 1 auto;
}
.visitor-map {
  position: relative;
  min-width: 0;
  overflow: hidden;
  background: #edf3ee;
}
.map-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(75, 111, 92, 0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(75, 111, 92, 0.055) 1px, transparent 1px);
  background-size: 24px 24px;
}
.campus-road {
  position: absolute;
  z-index: 1;
  background: #d6ddd8;
}
.road-h {
  left: 4%;
  right: 4%;
  top: 48%;
  height: 31px;
}
.road-v {
  top: 4%;
  bottom: 4%;
  left: 50%;
  width: 31px;
}
.visitor-zone {
  position: absolute;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #66776f;
  background: rgba(208, 218, 212, 0.92);
  border: 1px solid #bdcbc3;
  border-radius: 6px;
}
.visitor-zone i {
  margin-bottom: 3px;
  color: #5b776a;
  font-size: 9px;
}
.visitor-zone b {
  font-size: 9px;
}
.visitor-zone span {
  margin-top: 5px;
  padding: 2px 7px;
  color: #fff;
  background: #1aa273;
  border-radius: 9px;
  font-size: 9px;
  font-weight: 600;
}
.visitor-zone small {
  margin-top: 4px;
  color: #839189;
  font-size: 9px;
}
.zone-a {
  left: 8%;
  top: 10%;
  width: 30%;
  height: 29%;
}
.zone-b {
  right: 8%;
  top: 10%;
  width: 30%;
  height: 29%;
}
.zone-c {
  left: 7%;
  bottom: 8%;
  width: 29%;
  height: 25%;
}
.zone-d {
  right: 7%;
  bottom: 8%;
  width: 28%;
  height: 25%;
}
.zone-e {
  left: 43%;
  top: 39%;
  width: 16%;
  height: 19%;
}
.zone-e span {
  background: #e29126;
}
.map-legend {
  position: absolute;
  z-index: 6;
  left: 10px;
  bottom: 8px;
  display: flex;
  gap: 9px;
  padding: 5px 7px;
  color: #778598;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  font-size: 12px;
}
.map-legend i {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 4px;
  background: #1aa273;
  border-radius: 50%;
}
.map-legend i.warning {
  background: #e29126;
}
.map-legend i.danger {
  background: #e34e4e;
}
.inpark-preview {
  padding: 8px 10px;
  border-left: 1px solid #edf0f4;
}
.preview-head {
  display: flex;
  min-height: 34px;
  align-items: center;
  justify-content: space-between;
}
.preview-head b {
  color: #3c4b61;
  font-size: 14px;
}
.preview-head ::v-deep .el-button {
  font-size: 13px;
}
.inpark-preview > button {
  display: flex;
  width: 100%;
  min-height: 76px;
  align-items: center;
  gap: 10px;
  padding: 9px 4px;
  color: inherit;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
}
.inpark-preview > button:hover {
  background: #f8fafc;
}
.visitor-avatar {
  display: flex;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #3478e1;
  border-radius: 7px;
  font-size: 15px;
  font-weight: 600;
}
.visitor-info {
  min-width: 0;
  flex: 1;
}
.visitor-info b,
.visitor-info small,
.visitor-info em {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.visitor-info b {
  color: #3f4e64;
  font-size: 14px;
}
.visitor-info small {
  margin-top: 3px;
  color: #8794a5;
  font-size: 12px;
}
.visitor-info em {
  margin-top: 4px;
  color: #9aa4b2;
  font-size: 11px;
  font-style: normal;
}
.visitor-info em i {
  margin-right: 3px;
  color: #3c7ede;
}
.approval-panel {
  display: flex;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}
.approval-list {
  min-height: 0;
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 6px 9px 2px;
}
.approval-item {
  display: flex;
  width: 100%;
  min-height: 78px;
  align-items: center;
  gap: 10px;
  padding: 9px 5px;
  color: inherit;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
}
.approval-item:hover {
  background: #f8fafc;
}
.approval-icon {
  display: flex;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  color: #3378dd;
  background: #edf4ff;
  border-radius: 6px;
  font-size: 15px;
}
.approval-item.alert .approval-icon {
  color: #df4d4d;
  background: #fff0f0;
}
.approval-item > span:nth-child(2) {
  min-width: 0;
  flex: 1;
}
.approval-item b,
.approval-item small,
.approval-item em {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.approval-item b {
  color: #3f4e64;
  font-size: 14px;
}
.approval-item small {
  margin-top: 3px;
  color: #7f8c9e;
  font-size: 12px;
}
.approval-item em {
  margin-top: 4px;
  color: #9aa5b3;
  font-size: 11px;
  font-style: normal;
}
.inpark-preview ::v-deep .el-tag,
.approval-panel ::v-deep .el-tag {
  font-size: 12px;
}
.approval-footer {
  margin: 2px 10px 10px;
  padding: 9px 10px;
  color: #80612d;
  background: #fff8ec;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.45;
}
.approval-footer i {
  margin-right: 4px;
  color: #df8d22;
}
.visitor-page .visitor-overview .visitor-info small,
.visitor-page .visitor-overview .approval-item small {
  font-size: 12px;
}

.evacuation-summary {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}
.evacuation-summary span {
  padding: 9px;
  text-align: center;
  background: #f7f9fc;
  border: 1px solid #e8edf2;
  border-radius: 5px;
}
.evacuation-summary small,
.evacuation-summary b {
  display: block;
}
.evacuation-summary small {
  color: #8d99a9;
  font-size: 8px;
}
.evacuation-summary b {
  margin-top: 4px;
  color: #35445a;
  font-size: 16px;
}
.visitor-hero {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 -18px 14px;
  padding: 15px 18px;
  background: #edf4ff;
  border-top: 3px solid #397fe4;
}
.visitor-hero > span {
  display: flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #397fe4;
  border-radius: 9px;
  font-size: 15px;
}
.visitor-hero > div {
  min-width: 0;
  flex: 1;
}
.visitor-hero small,
.visitor-hero h3,
.visitor-hero p {
  display: block;
  margin: 0;
}
.visitor-hero h3 {
  margin: 4px 0;
  color: #344159;
  font-size: 15px;
}
.visitor-hero small,
.visitor-hero p {
  color: #8793a4;
  font-size: 9px;
}
.scope-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.scope-tags span {
  padding: 6px 8px;
  color: #49719f;
  background: #eff5fb;
  border-radius: 4px;
  font-size: 9px;
}
.scope-tags i {
  margin-right: 4px;
  color: #3478e1;
}
.credential-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px;
  background: #edf8f3;
  border: 1px solid #d4ecdf;
  border-radius: 6px;
}
.credential-card.disabled {
  filter: grayscale(1);
  opacity: 0.62;
}
.qr-simulation {
  display: flex;
  width: 54px;
  height: 54px;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #253444;
  border-radius: 5px;
}
.qr-simulation i {
  font-size: 29px;
}
.credential-card b,
.credential-card span,
.credential-card small {
  display: block;
}
.credential-card b {
  color: #386c58;
  font-size: 11px;
}
.credential-card span {
  margin-top: 4px;
  color: #5f8174;
  font-size: 9px;
}
.credential-card small {
  margin-top: 3px;
  color: #84a095;
  font-size: 8px;
}
.linkage-summary {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px;
  margin-top: 12px;
}
.linkage-summary > span {
  padding: 9px;
  background: #f8fafc;
  border-radius: 5px;
}
.linkage-summary i,
.linkage-summary b,
.linkage-summary small {
  display: block;
}
.linkage-summary i {
  margin-bottom: 5px;
  color: #3478e1;
}
.linkage-summary b {
  color: #46556a;
  font-size: 9px;
}
.linkage-summary small {
  margin-top: 3px;
  overflow: hidden;
  color: #8a96a5;
  font-size: 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.alert-hero {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 -18px 14px;
  padding: 15px 18px;
  background: #fff8ed;
  border-top: 3px solid #e89725;
}
.alert-hero.critical {
  background: #fff0f0;
  border-color: #e64e4e;
}
.alert-hero > span {
  display: flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #e89725;
  border-radius: 8px;
}
.alert-hero.critical > span {
  background: #e64e4e;
}
.alert-hero > div {
  min-width: 0;
  flex: 1;
}
.alert-hero small,
.alert-hero h3,
.alert-hero p {
  display: block;
  margin: 0;
}
.alert-hero h3 {
  margin: 4px 0;
  color: #344159;
  font-size: 15px;
}
.alert-hero small,
.alert-hero p {
  color: #8793a4;
  font-size: 9px;
}
.alert-detail {
  display: flex;
  gap: 9px;
  margin-top: 12px;
  padding: 11px;
  color: #7d5b29;
  background: #fff8ed;
  border-radius: 5px;
}
.alert-detail b {
  font-size: 10px;
}
.alert-detail p {
  margin: 4px 0 0;
  font-size: 9px;
  line-height: 15px;
}
@media (max-width: 1250px) {
  .visitor-overview {
    grid-template-columns: 1fr;
    height: auto;
  }
  .visitor-live-layout {
    min-height: clamp(380px, 52vh, 560px);
    min-height: clamp(380px, 52dvh, 560px);
    flex: none;
  }
}
@media (max-width: 760px) {
  .process-flow {
    overflow-x: auto;
    justify-content: flex-start;
    gap: 35px;
  }
  .process-step {
    min-width: 80px;
  }
  .visitor-live-layout {
    display: block;
    min-height: 0;
  }
  .visitor-map {
    height: 380px;
  }
  .inpark-preview {
    border-top: 1px solid #edf0f4;
    border-left: 0;
  }
  .evacuation-summary {
    grid-template-columns: repeat(2, 1fr);
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
.visitor-detail-drawer .el-drawer__header {
  color: #233248;
  font-size: 16px;
}
.visitor-detail-drawer .alert-hero h3 {
  font-size: 18px;
  line-height: 24px;
}
.visitor-detail-drawer .visitor-hero .el-tag,
.visitor-detail-drawer .alert-hero .el-tag {
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
  line-height: 1;
  box-sizing: border-box;
}
.visitor-detail-drawer .visitor-hero h3 {
  font-size: 18px;
  line-height: 24px;
}
.visitor-detail-drawer .visitor-hero small,
.visitor-detail-drawer .visitor-hero p {
  font-size: 12px;
  line-height: 18px;
}
.visitor-detail-drawer .alert-hero small,
.visitor-detail-drawer .alert-hero p {
  font-size: 12px;
  line-height: 18px;
}
.visitor-detail-drawer .scope-tags {
  gap: 8px;
}
.visitor-detail-drawer .scope-tags span {
  padding: 5px 9px;
  font-size: 12px;
}
.visitor-detail-drawer .credential-card {
  padding: 14px;
}
.visitor-detail-drawer .credential-card b {
  font-size: 13px;
}
.visitor-detail-drawer .credential-card span {
  font-size: 12px;
  line-height: 18px;
}
.visitor-detail-drawer .credential-card small {
  font-size: 11px;
  line-height: 16px;
}
.visitor-detail-drawer .linkage-summary > span {
  padding: 11px;
}
.visitor-detail-drawer .linkage-summary b {
  font-size: 12px;
}
.visitor-detail-drawer .linkage-summary small {
  font-size: 11px;
  line-height: 16px;
}
.visitor-detail-drawer .detail-info-grid > span {
  padding: 12px;
}
.visitor-detail-drawer .detail-info-grid small {
  font-size: 12px;
}
.visitor-detail-drawer .detail-info-grid b {
  margin-top: 4px;
  font-size: 13px;
  line-height: 18px;
}
.visitor-detail-drawer .alert-detail {
  padding: 13px;
}
.visitor-detail-drawer .alert-detail b {
  font-size: 13px;
}
.visitor-detail-drawer .alert-detail p {
  font-size: 12px;
  line-height: 20px;
}
.visitor-detail-drawer .detail-section h4 {
  font-size: 14px;
}
.visitor-detail-drawer .el-timeline-item__timestamp {
  font-size: 12px;
}
.visitor-detail-drawer .trace-card {
  padding: 11px 13px;
}
.visitor-detail-drawer .trace-card b {
  font-size: 13px;
}
.visitor-detail-drawer .trace-card span {
  font-size: 11px;
}
.visitor-detail-drawer .trace-card p {
  font-size: 12px;
  line-height: 20px;
}
.visitor-detail-drawer .drawer-actions .el-button {
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
