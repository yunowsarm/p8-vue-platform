<template>
  <div class="passage-page access-page">
    <header class="page-header">
      <div>
        <div class="title-line">
          <h2>智能门禁</h2>
          <span class="live-badge"><i></i> 控制器实时在线</span>
        </div>
        <p>门区态势、通行认证、权限生命周期、异常联动与高风险操作审计</p>
      </div>
      <div class="header-actions">
        <el-button size="small" icon="el-icon-connection" @click="offlineDialogVisible = true">离线与消防策略</el-button
        ><el-button size="small" icon="el-icon-refresh" @click="batchSync">批量同步权限</el-button
        ><el-button size="small" icon="el-icon-warning-outline" @click="emergencyDialogVisible = true">紧急开门</el-button
        ><el-button type="primary" size="small" icon="el-icon-plus" @click="openPermission()">新增通行权限</el-button>
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

    <iot-workspace-nav v-model="managementTab" :items="workspaceNav" aria-label="智能门禁业务工作区" @change="handleWorkspaceChange" />

    <section v-if="managementTab === 'overview'" ref="workspaceContent" class="access-overview" tabindex="-1">
      <article class="surface door-board">
        <div class="surface-head">
          <div>
            <div class="surface-title"><i class="el-icon-key"></i> 门区实时态势</div>
            <span class="surface-subtitle">控制器状态、门磁模式和最近认证事件实时上报 · 最近同步 10:42:20</span>
          </div>
          <div class="surface-meta">
            <span><i class="dot online"></i>在线 96</span><span><i class="dot danger"></i>异常 4</span><el-button size="mini" icon="el-icon-refresh" @click="refreshDoors">刷新</el-button>
          </div>
        </div>
        <div class="door-workbench">
          <aside class="group-rail">
            <div class="rail-title">
              门区 <span>{{ doorGroups.length }}</span>
            </div>
            <button v-for="group in doorGroups" :key="group.id" type="button" :class="{ active: selectedGroupId === group.id, abnormal: group.abnormal }" @click="selectedGroupId = group.id">
              <i class="el-icon-folder-opened"></i
              ><span
                ><b>{{ group.name }}</b
                ><small>{{ group.online }}/{{ group.total }} 在线 · {{ group.mode }}</small></span
              ><em v-if="group.abnormal">{{ group.abnormal }}</em
              ><i class="el-icon-arrow-right"></i>
            </button>
          </aside>
          <div class="door-map">
            <div class="map-grid"></div>
            <div class="map-road road-horizontal"></div>
            <div class="map-road road-vertical"></div>
            <div class="building building-a"><i class="el-icon-office-building"></i><span>A栋公共区</span></div>
            <div class="building building-b"><i class="el-icon-office-building"></i><span>B栋生产区</span></div>
            <div class="building building-c"><i class="el-icon-cpu"></i><span>C栋重要机房</span></div>
            <div class="building building-d"><i class="el-icon-house"></i><span>宿舍生活区</span></div>
            <div class="building building-l"><i class="el-icon-box"></i><span>物流通道</span></div>
            <button
              v-for="door in doors"
              :key="door.id"
              type="button"
              class="door-point"
              :class="[doorStatusClass(door.status), { selected: selectedDoorId === door.id, dim: selectedGroupId && door.group !== selectedGroup.name }]"
              :style="{ left: door.x + '%', top: door.y + '%' }"
              :aria-label="door.name + '，' + door.status"
              @click="selectDoor(door)"
            >
              <i :class="door.status === '在线' ? 'el-icon-lock' : door.status === '离线' ? 'el-icon-connection' : 'el-icon-warning-outline'"></i>
            </button>
            <div v-if="selectedDoor" class="door-popover">
              <button type="button" aria-label="关闭门点信息" @click="selectedDoorId = ''"><i class="el-icon-close"></i></button>
              <div class="door-pop-title">
                <span :class="doorStatusClass(selectedDoor.status)"><i class="el-icon-key"></i></span>
                <div>
                  <b>{{ selectedDoor.name }}</b
                  ><small>{{ selectedDoor.id }} · {{ selectedDoor.group }}</small>
                </div>
                <el-tag :type="deviceTag(selectedDoor.status)" size="mini">{{ selectedDoor.status }}</el-tag>
              </div>
              <div class="door-pop-grid">
                <span
                  ><small>运行模式</small><b>{{ selectedDoor.mode }}</b></span
                ><span
                  ><small>控制器</small><b>{{ selectedDoor.controller }}</b></span
                ><span
                  ><small>最近事件</small><b>{{ selectedDoor.lastEvent }}</b></span
                ><span><small>离线能力</small><b>本地权限/缓存</b></span>
              </div>
              <div class="door-pop-actions">
                <el-button size="mini" @click="openDoorOperation(selectedDoor, '远程开门')">远程开门</el-button
                ><el-button type="primary" size="mini" @click="openWorkspace('events')">进入事件处置</el-button>
              </div>
            </div>
            <div class="map-legend">
              <span><i class="online"></i>在线</span><span><i class="offline"></i>离线</span><span><i class="alarm"></i>告警</span>
            </div>
          </div>
        </div>
      </article>

      <aside class="surface event-stream">
        <div class="surface-head">
          <div>
            <div class="surface-title"><i class="el-icon-bell"></i> 实时认证与异常</div>
            <span class="surface-subtitle">{{ abnormalCount }} 条异常待关注</span>
          </div>
          <el-checkbox v-model="streamOnlyAbnormal" size="mini">仅异常</el-checkbox>
        </div>
        <div class="stream-list">
          <button v-for="event in streamEvents" :key="event.id" type="button" :class="{ abnormal: event.abnormal }" @click="openEvent(event)">
            <span class="event-icon"><i :class="event.abnormal ? 'el-icon-warning-outline' : 'el-icon-circle-check'"></i></span
            ><span class="event-main"
              ><b>{{ event.result }}</b
              ><small>{{ event.person }} · {{ event.door }}</small
              ><em>{{ event.auth }}　{{ event.time.slice(11) }}</em></span
            ><el-tag :type="event.abnormal ? 'danger' : 'success'" size="mini">{{ event.status }}</el-tag>
          </button>
        </div>
        <div class="stream-footer"><i class="el-icon-camera"></i>异常事件自动联动门口视频抓拍与录像</div>
      </aside>
    </section>

    <section v-else ref="workspaceContent" class="surface management-card workspace-detail" tabindex="-1">
      <iot-workspace-header :item="currentWorkspace" updated-at="10:42:20" :show-back="false" @back="openWorkspace('overview')" />
      <el-tabs v-model="managementTab" class="workspace-tabs">
        <el-tab-pane name="events"
          ><span slot="label"
            ><i class="el-icon-data-line"></i> 通行与异常事件 <b class="tab-count danger">{{ abnormalCount }}</b></span
          >
          <div class="table-toolbar">
            <div class="filter-group">
              <el-input v-model.trim="eventKeyword" size="small" clearable prefix-icon="el-icon-search" placeholder="事件号 / 人员 / 门点" /><el-select
                v-model="eventResult"
                size="small"
                clearable
                placeholder="认证结果"
                ><el-option v-for="item in eventResults" :key="item" :label="item" :value="item" /></el-select
              ><el-checkbox v-model="onlyAbnormal">仅异常</el-checkbox>
            </div>
            <div class="toolbar-note"><i class="el-icon-camera"></i>异常视频和抓拍已关联存证</div>
          </div>
          <el-table :data="pagedEvents" size="small"
            ><el-table-column prop="id" label="事件编号" min-width="145" /><el-table-column prop="time" label="时间" min-width="150" /><el-table-column
              prop="person"
              label="人员"
              width="95"
            /><el-table-column prop="org" label="组织" width="100" /><el-table-column prop="door" label="门点" min-width="130" /><el-table-column
              prop="auth"
              label="认证方式"
              width="90"
            /><el-table-column prop="result" label="结果" min-width="110" /><el-table-column label="视频证据" width="95"
              ><template slot-scope="{ row }"
                ><span :class="row.snapshot === '-' ? 'muted-evidence' : 'evidence-link'"><i class="el-icon-picture-outline"></i>{{ row.snapshot }}</span></template
              ></el-table-column
            ><el-table-column label="状态" width="90"
              ><template slot-scope="{ row }"
                ><el-tag :type="eventStatusTag(row.status)" size="mini">{{ row.status }}</el-tag></template
              ></el-table-column
            ><el-table-column label="操作" width="88" fixed="right"
              ><template slot-scope="{ row }"><el-button type="text" size="mini" @click="openEvent(row)">详情 / 处置</el-button></template></el-table-column
            ></el-table
          >
          <div class="table-pagination">
            <el-pagination
              background
              :current-page.sync="pagination.events.page"
              :page-size="pagination.events.size"
              :page-sizes="[5, 10, 20]"
              :total="filteredEvents.length"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="changePageSize('events', $event)"
            /></div
        ></el-tab-pane>

        <el-tab-pane name="permissions"
          ><span slot="label"
            ><i class="el-icon-key"></i> 通行权限 <b class="tab-count">{{ permissions.length }}</b></span
          >
          <div class="table-toolbar">
            <div class="filter-group">
              <el-input v-model.trim="permissionKeyword" size="small" clearable prefix-icon="el-icon-search" placeholder="人员 / 组织 / 门区" /><el-select
                v-model="permissionSync"
                size="small"
                clearable
                placeholder="下发状态"
                ><el-option label="成功" value="成功" /><el-option label="失败" value="失败" /><el-option label="离线待同步" value="离线待同步" /><el-option label="已回收" value="已回收"
              /></el-select>
            </div>
            <el-button type="primary" size="small" icon="el-icon-plus" @click="openPermission()">新增权限</el-button>
          </div>
          <el-table :data="pagedPermissions" size="small"
            ><el-table-column prop="id" label="权限编号" width="90" /><el-table-column prop="person" label="人员/岗位" min-width="105" /><el-table-column
              prop="org"
              label="组织"
              width="95"
            /><el-table-column prop="credential" label="认证方式" min-width="105" /><el-table-column prop="doors" label="门区" min-width="145" /><el-table-column
              prop="week"
              label="星期"
              width="110"
            /><el-table-column prop="period" label="时段" width="110" /><el-table-column label="有效期" min-width="175"
              ><template slot-scope="{ row }">{{ row.validFrom }} 至 {{ row.validTo }}</template></el-table-column
            ><el-table-column prop="source" label="权限来源" width="105" /><el-table-column label="下发状态" width="105"
              ><template slot-scope="{ row }"
                ><el-tag :type="syncTag(row.sync)" size="mini">{{ row.sync }}</el-tag></template
              ></el-table-column
            ><el-table-column label="操作" width="75" fixed="right"
              ><template slot-scope="{ row }"><el-button type="text" size="mini" @click="openPermission(row)">编辑</el-button></template></el-table-column
            ></el-table
          >
          <div class="table-pagination">
            <el-pagination
              background
              :current-page.sync="pagination.permissions.page"
              :page-size="pagination.permissions.size"
              :total="filteredPermissions.length"
              layout="total, prev, pager, next"
            /></div
        ></el-tab-pane>

        <el-tab-pane name="sync"
          ><span slot="label"
            ><i class="el-icon-refresh"></i> 权限下发与回收 <b class="tab-count">{{ syncTasks.length }}</b></span
          >
          <div class="table-toolbar">
            <div class="toolbar-note"><i class="el-icon-connection"></i>入职、调岗、离职、挂失和黑名单流程均显示设备反馈状态</div>
            <el-button size="small" icon="el-icon-refresh" @click="batchSync">重试未完成任务</el-button>
          </div>
          <el-table :data="syncTasks" size="small"
            ><el-table-column prop="id" label="任务编号" width="130" /><el-table-column prop="type" label="变更类型" width="85" /><el-table-column
              prop="person"
              label="人员"
              width="95"
            /><el-table-column prop="change" label="权限变更" min-width="220" /><el-table-column prop="controllers" label="控制器" width="80" /><el-table-column
              prop="createdAt"
              label="发起时间"
              width="110"
            /><el-table-column prop="progress" label="下发进度" width="85" /><el-table-column label="结果" width="105"
              ><template slot-scope="{ row }"
                ><el-tag :type="syncTag(row.result)" size="mini">{{ row.result }}</el-tag></template
              ></el-table-column
            ><el-table-column prop="operator" label="来源" width="100" /><el-table-column label="操作" width="78"
              ><template slot-scope="{ row }"
                ><el-button v-if="row.result !== '成功'" type="text" size="mini" @click="retrySync(row)">重新同步</el-button><span v-else class="completed-text">已完成</span></template
              ></el-table-column
            ></el-table
          ></el-tab-pane
        >

        <el-tab-pane name="audit"
          ><span slot="label"
            ><i class="el-icon-document-checked"></i> 高风险操作审计 <b class="tab-count">{{ audits.length }}</b></span
          >
          <div class="table-toolbar">
            <div class="toolbar-note"><i class="el-icon-lock"></i>远程开门、常开、紧急开门和批量权限调整均需专门权限与完整审计</div>
            <el-button size="small" icon="el-icon-unlock" @click="openDoorOperation(selectedDoor || doors[0], '远程开门')">发起远程操作</el-button>
          </div>
          <el-table :data="audits" size="small"
            ><el-table-column prop="id" label="审计编号" width="130" /><el-table-column prop="time" label="操作时间" min-width="150" /><el-table-column
              prop="action"
              label="操作类型"
              min-width="135" /><el-table-column prop="target" label="操作对象" min-width="180" /><el-table-column prop="operator" label="操作人" width="90" /><el-table-column
              prop="reason"
              label="操作原因"
              min-width="230" /><el-table-column prop="approval" label="确认/审批" min-width="125" /><el-table-column prop="result" label="结果" width="110" /></el-table
        ></el-tab-pane>
      </el-tabs>
    </section>

    <el-dialog :title="permissionForm.editingId ? '编辑通行权限' : '新增通行权限'" :visible.sync="permissionDialogVisible" width="720px" top="6vh" custom-class="passage-config-dialog"
      ><div class="dialog-intro">
        <i class="el-icon-key"></i><span><b>人员、组织与门区精细授权</b>按星期、时段和有效期配置卡片、二维码、手机或生物识别权限。</span>
      </div>
      <el-form :model="permissionForm" label-width="95px" size="small" class="config-form"
        ><el-row :gutter="16"
          ><el-col :span="12"
            ><el-form-item label="授权对象" required><el-input v-model.trim="permissionForm.person" placeholder="人员或岗位名称" /></el-form-item></el-col
          ><el-col :span="12"
            ><el-form-item label="所属组织"
              ><el-select v-model="permissionForm.org"><el-option v-for="item in orgOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col></el-row
        ><el-form-item label="认证方式"
          ><el-checkbox-group v-model="permissionForm.credentials"
            ><el-checkbox label="卡片">卡片</el-checkbox><el-checkbox label="二维码">二维码</el-checkbox><el-checkbox label="手机">手机</el-checkbox><el-checkbox label="人脸">人脸</el-checkbox
            ><el-checkbox label="指纹">指纹</el-checkbox></el-checkbox-group
          ></el-form-item
        ><el-form-item label="授权门区" required
          ><el-checkbox-group v-model="permissionForm.doors"
            ><el-checkbox label="全部门禁">全部门禁</el-checkbox><el-checkbox label="全部禁止">全部禁止</el-checkbox
            ><el-checkbox v-for="item in doorGroups" :key="item.id" :label="item.name">{{ item.name }}</el-checkbox></el-checkbox-group
          ></el-form-item
        ><el-row :gutter="16"
          ><el-col :span="12"
            ><el-form-item label="有效星期"
              ><el-select v-model="permissionForm.week"
                ><el-option label="周一至周五" value="周一至周五" /><el-option label="全周" value="全周" /><el-option label="工作日" value="工作日" /><el-option
                  label="当日"
                  value="当日" /></el-select></el-form-item></el-col
          ><el-col :span="12"
            ><el-form-item label="通行时段"><el-time-picker v-model="permissionForm.period" is-range value-format="HH:mm" format="HH:mm" range-separator="至" /></el-form-item></el-col></el-row
        ><el-form-item label="有效日期"
          ><el-date-picker v-model="permissionForm.validRange" type="daterange" value-format="yyyy-MM-dd" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" /></el-form-item
        ><el-form-item label="权限来源"
          ><el-select v-model="permissionForm.source"
            ><el-option label="入职" value="入职" /><el-option label="岗位权限" value="岗位权限" /><el-option label="调岗调整" value="调岗调整" /><el-option
              label="外协申请"
              value="外协申请" /><el-option label="重要区域审批" value="重要区域审批" /></el-select></el-form-item
        ><el-form-item v-if="(permissionForm.doors || []).indexOf('C栋重要机房') > -1" label="双人复核"
          ><el-switch v-model="permissionForm.doubleReview" active-text="必须两名审批人通过" /></el-form-item></el-form
      ><span slot="footer"><el-button @click="permissionDialogVisible = false">取消</el-button><el-button type="primary" @click="savePermission">保存并下发</el-button></span></el-dialog
    >

    <el-dialog title="门禁远程操作" :visible.sync="operationDialogVisible" width="620px" custom-class="passage-config-dialog"
      ><div class="dialog-intro warning">
        <i class="el-icon-unlock"></i><span><b>高风险操作二次确认</b>远程开门、紧急开门、常开和锁定均记录操作人、原因、视频核验与审批信息。</span>
      </div>
      <el-form :model="operationForm" label-width="100px" size="small" class="config-form"
        ><el-form-item label="操作门点"><el-input v-model="operationForm.doorName" disabled /></el-form-item
        ><el-form-item label="操作类型" required
          ><el-radio-group v-model="operationForm.action"
            ><el-radio label="远程开门">远程开门</el-radio><el-radio label="临时常开">临时常开</el-radio><el-radio label="紧急开门">紧急开门</el-radio
            ><el-radio label="远程锁定">远程锁定</el-radio></el-radio-group
          ></el-form-item
        ><el-form-item v-if="operationForm.action === '临时常开'" label="常开时长"
          ><el-input-number v-model="operationForm.duration" :min="1" :max="120" /><span class="form-unit">分钟</span></el-form-item
        ><el-form-item label="视频核验"><el-switch v-model="operationForm.videoChecked" active-text="已核验门口实时视频" /></el-form-item
        ><el-form-item label="操作原因" required><el-input v-model.trim="operationForm.reason" type="textarea" :rows="3" /></el-form-item
        ><el-form-item label="复核/审批人" required
          ><el-select v-model="operationForm.approver"
            ><el-option label="李丽（值班负责人）" value="李丽（值班负责人）" /><el-option label="陈主任（安保负责人）" value="陈主任（安保负责人）" /></el-select></el-form-item></el-form
      ><span slot="footer"><el-button @click="operationDialogVisible = false">取消</el-button><el-button type="danger" @click="submitDoorOperation">确认执行并审计</el-button></span></el-dialog
    >

    <el-dialog title="控制器离线、断电与消防策略" :visible.sync="offlineDialogVisible" width="700px" custom-class="passage-config-dialog"
      ><div class="dialog-intro">
        <i class="el-icon-connection"></i><span><b>离线可用、恢复补传</b>断网时控制器按本地合法权限继续运行并缓存记录；网络恢复后自动补传并校验完整性。</span>
      </div>
      <el-form :model="offlinePolicy" label-width="135px" size="small" class="config-form"
        ><el-row :gutter="18"
          ><el-col :span="12"
            ><el-form-item label="本地权限运行"><el-switch v-model="offlinePolicy.localPermission" active-text="启用" /></el-form-item></el-col
          ><el-col :span="12"
            ><el-form-item label="离线事件缓存"><el-switch v-model="offlinePolicy.cacheRecords" active-text="启用" /></el-form-item></el-col></el-row
        ><el-row :gutter="18"
          ><el-col :span="12"
            ><el-form-item label="本地缓存时长"><el-input-number v-model="offlinePolicy.cacheDays" :min="1" :max="30" /><span class="form-unit">天</span></el-form-item></el-col
          ><el-col :span="12"
            ><el-form-item label="恢复重试间隔"><el-input-number v-model="offlinePolicy.retryInterval" :min="1" :max="60" /><span class="form-unit">分钟</span></el-form-item></el-col
          ></el-row
        ><el-form-item label="消防状态开门逻辑"><el-input v-model="offlinePolicy.fireMode" type="textarea" :rows="2" /></el-form-item
        ><el-form-item label="断电状态逻辑"><el-input v-model="offlinePolicy.powerFailure" type="textarea" :rows="2" /></el-form-item
        ><el-form-item label="已审批安全方案"><el-input v-model="offlinePolicy.approval" disabled /></el-form-item></el-form
      ><span slot="footer"><el-button @click="offlineDialogVisible = false">取消</el-button><el-button type="primary" @click="saveOfflinePolicy">保存策略</el-button></span></el-dialog
    >

    <el-dialog title="紧急开门策略审批" :visible.sync="emergencyDialogVisible" width="650px" custom-class="passage-config-dialog"
      ><div class="dialog-intro danger">
        <i class="el-icon-warning-outline"></i><span><b>不直接执行设备动作</b>选择疏散门区、有效时间和安全例外后提交双人审批，审批通过再由门禁设备执行。</span>
      </div>
      <el-form :model="emergencyForm" label-width="110px" size="small" class="config-form"
        ><el-form-item label="策略名称"><el-input v-model.trim="emergencyForm.name" /></el-form-item
        ><el-form-item label="疏散门区"
          ><el-checkbox-group v-model="emergencyForm.groups"
            ><el-checkbox v-for="item in doorGroups" :key="item.id" :label="item.name">{{ item.name }}</el-checkbox></el-checkbox-group
          ></el-form-item
        ><el-form-item label="安全例外"
          ><el-checkbox-group v-model="emergencyForm.exceptions"
            ><el-checkbox label="C栋重要机房">C栋重要机房保持锁闭</el-checkbox><el-checkbox label="财务档案室">财务档案室保持锁闭</el-checkbox></el-checkbox-group
          ></el-form-item
        ><el-form-item label="有效时长"><el-input-number v-model="emergencyForm.duration" :min="5" :max="180" /><span class="form-unit">分钟</span></el-form-item
        ><el-form-item label="双人审批"
          ><el-select v-model="emergencyForm.approvers" multiple
            ><el-option label="李丽（值班负责人）" value="李丽" /><el-option label="陈主任（安保负责人）" value="陈主任" /><el-option
              label="王主任（消防负责人）"
              value="王主任" /></el-select></el-form-item></el-form
      ><span slot="footer"><el-button @click="emergencyDialogVisible = false">取消</el-button><el-button type="danger" @click="requestEmergency">提交紧急开门审批</el-button></span></el-dialog
    >

    <el-drawer title="门禁事件详情与处置" :visible.sync="eventDrawerVisible" size="520px" custom-class="passage-detail-drawer access-detail-drawer" append-to-body
      ><div v-if="currentEvent" class="drawer-layout">
        <div class="drawer-scroll">
          <div class="event-hero" :class="{ abnormal: currentEvent.abnormal }">
            <span><i :class="currentEvent.abnormal ? 'el-icon-warning-outline' : 'el-icon-circle-check'"></i></span>
            <div>
              <small>{{ currentEvent.abnormal ? '门禁异常' : '正常通行' }}</small>
              <h3>{{ currentEvent.result }} · {{ currentEvent.door }}</h3>
              <p>{{ currentEvent.id }}　{{ currentEvent.time }}</p>
            </div>
            <el-tag :type="eventStatusTag(currentEvent.status)">{{ currentEvent.status }}</el-tag>
          </div>
          <div class="access-evidence">
            <div>
              <i class="el-icon-picture-outline"></i><span>门口抓拍</span><b>{{ currentEvent.snapshot }}</b>
            </div>
            <div>
              <i class="el-icon-video-camera"></i><span>关联录像</span><b>{{ currentEvent.video }}</b>
            </div>
          </div>
          <div class="detail-info-grid">
            <span
              ><small>认证人员</small><b>{{ currentEvent.person }}</b></span
            ><span
              ><small>所属组织</small><b>{{ currentEvent.org }}</b></span
            ><span
              ><small>认证方式</small><b>{{ currentEvent.auth }}</b></span
            ><span
              ><small>认证结果</small><b>{{ currentEvent.result }}</b></span
            >
          </div>
          <div class="detail-section">
            <h4>事件与处置记录</h4>
            <div v-if="!currentEvent.traces.length" class="normal-record"><i class="el-icon-circle-check"></i>合法权限认证通过，门禁设备正常执行。</div>
            <el-timeline v-else
              ><el-timeline-item v-for="(trace, index) in currentEvent.traces" :key="index" :timestamp="trace.time" placement="top"
                ><div class="trace-card">
                  <b>{{ trace.action }}</b
                  ><span>{{ trace.user }}</span>
                  <p>{{ trace.remark }}</p>
                </div></el-timeline-item
              ></el-timeline
            >
          </div>
        </div>
        <div v-if="currentEvent.abnormal" class="drawer-actions">
          <el-button v-if="currentEvent.status === '待确认'" type="primary" @click="confirmEvent(currentEvent)">确认异常</el-button
          ><el-button type="warning" @click="openDoorOperation(doorByName(currentEvent.door), '远程锁定')">远程锁定</el-button
          ><el-button v-if="currentEvent.status !== '已关闭'" type="success" @click="closeEvent(currentEvent)">处置关闭</el-button>
        </div>
      </div></el-drawer
    >
  </div>
</template>

<script>
import IotWorkspaceHeader from '../components/IotWorkspaceHeader.vue'
import IotWorkspaceNav from '../components/IotWorkspaceNav.vue'
import { accessControl } from '../mock/passageMockData'

export default {
  name: 'SmartIOTAccessControl',
  components: { IotWorkspaceHeader, IotWorkspaceNav },
  data() {
    return {
      kpis: accessControl.kpis,
      doorGroups: JSON.parse(JSON.stringify(accessControl.doorGroups)),
      doors: JSON.parse(JSON.stringify(accessControl.doors)),
      events: JSON.parse(JSON.stringify(accessControl.events)),
      permissions: JSON.parse(JSON.stringify(accessControl.permissions)),
      syncTasks: JSON.parse(JSON.stringify(accessControl.syncTasks)),
      audits: JSON.parse(JSON.stringify(accessControl.audits)),
      offlinePolicy: JSON.parse(JSON.stringify(accessControl.offlinePolicy)),
      selectedGroupId: accessControl.doorGroups[0].id,
      selectedDoorId: '',
      streamOnlyAbnormal: false,
      managementTab: 'overview',
      onlyAbnormal: false,
      eventKeyword: '',
      eventResult: '',
      permissionKeyword: '',
      permissionSync: '',
      pagination: { events: { page: 1, size: 5 }, permissions: { page: 1, size: 5 } },
      permissionDialogVisible: false,
      operationDialogVisible: false,
      offlineDialogVisible: false,
      emergencyDialogVisible: false,
      eventDrawerVisible: false,
      permissionForm: {
        editingId: '',
        person: '',
        org: '行政部',
        credentials: ['手机'],
        doors: ['A栋公共区'],
        week: '周一至周五',
        period: ['08:00', '20:00'],
        validRange: ['2026-07-20', '2026-12-31'],
        source: '岗位权限',
        doubleReview: false
      },
      operationForm: {},
      emergencyForm: { name: '消防应急疏散开门', groups: ['A栋公共区', 'B栋生产区', '宿舍生活区'], exceptions: ['C栋重要机房'], duration: 30, approvers: ['李丽', '陈主任'] },
      currentEvent: null,
      eventResults: ['非法认证', '权限过期', '连续失败', '强行开门', '门长时间未关', '设备离线'],
      orgOptions: ['行政部', '研发部', '生产部', '财务部', '市场部', '运维部', '安保部', '外协单位']
    }
  },
  computed: {
    workspaceNav() {
      return [
        { key: 'overview', title: '门禁总览', description: '门区、控制器与事件', detail: '查看门点在线状态、门磁模式、控制器状态和实时认证事件。', icon: 'el-icon-data-analysis', count: null },
        { key: 'events', title: '事件处置', description: '认证、异常与视频', detail: '集中核验非法认证、强行开门和门长时间未关等异常事件。', icon: 'el-icon-warning-outline', count: this.abnormalCount, danger: this.abnormalCount > 0 },
        { key: 'permissions', title: '权限管理', description: '人员、门区与时段', detail: '管理人员和组织的认证方式、门区、星期、时段及有效期。', icon: 'el-icon-key', count: this.permissions.length },
        { key: 'sync', title: '下发任务', description: '成功、失败与待同步', detail: '查看控制器权限下发进度、失败原因和离线待同步任务。', icon: 'el-icon-refresh', count: this.syncTasks.length },
        { key: 'audit', title: '操作审计', description: '远程开门与应急', detail: '追溯远程开门、临时常开、紧急开门及批量权限调整。', icon: 'el-icon-document', count: this.audits.length }
      ]
    },
    currentWorkspace() {
      return this.workspaceNav.find((item) => item.key === this.managementTab) || this.workspaceNav[0]
    },
    selectedGroup() {
      return this.doorGroups.find((item) => item.id === this.selectedGroupId) || this.doorGroups[0]
    },
    selectedDoor() {
      return this.doors.find((item) => item.id === this.selectedDoorId) || null
    },
    abnormalCount() {
      return this.events.filter((item) => item.abnormal && item.status !== '已关闭').length
    },
    streamEvents() {
      const list = this.streamOnlyAbnormal ? this.events.filter((item) => item.abnormal) : this.events
      return list.slice(0, 6)
    },
    filteredEvents() {
      const key = this.eventKeyword.toLowerCase()
      return this.events.filter(
        (item) =>
          (!key || [item.id, item.person, item.door].join(' ').toLowerCase().indexOf(key) > -1) && (!this.eventResult || item.result === this.eventResult) && (!this.onlyAbnormal || item.abnormal)
      )
    },
    filteredPermissions() {
      const key = this.permissionKeyword.toLowerCase()
      return this.permissions.filter((item) => (!key || [item.person, item.org, item.doors].join(' ').toLowerCase().indexOf(key) > -1) && (!this.permissionSync || item.sync === this.permissionSync))
    },
    pagedEvents() {
      return this.paginate(this.filteredEvents, 'events')
    },
    pagedPermissions() {
      return this.paginate(this.filteredPermissions, 'permissions')
    }
  },
  watch: {
    eventKeyword() {
      this.pagination.events.page = 1
    },
    eventResult() {
      this.pagination.events.page = 1
    },
    onlyAbnormal() {
      this.pagination.events.page = 1
    },
    permissionKeyword() {
      this.pagination.permissions.page = 1
    },
    permissionSync() {
      this.pagination.permissions.page = 1
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
    paginate(list, type) {
      const state = this.pagination[type]
      return list.slice((state.page - 1) * state.size, state.page * state.size)
    },
    changePageSize(type, size) {
      this.pagination[type].size = size
      this.pagination[type].page = 1
    },
    deviceTag(status) {
      return status === '在线' ? 'success' : status === '离线' ? 'info' : 'danger'
    },
    doorStatusClass(status) {
      return status === '在线' ? 'online' : status === '离线' ? 'offline' : 'alarm'
    },
    syncTag(status) {
      return status === '成功' ? 'success' : status === '失败' ? 'danger' : status === '离线待同步' ? 'warning' : 'info'
    },
    eventStatusTag(status) {
      const map = { 正常: 'success', 待确认: 'danger', 已拦截: 'warning', 处置中: 'warning', 已确认: '', 待复核: 'warning', 离线运行: 'info', 已关闭: 'success' }
      return map[status] || 'info'
    },
    selectDoor(door) {
      this.selectedDoorId = door.id
      const group = this.doorGroups.find((item) => item.name === door.group)
      if (group) this.selectedGroupId = group.id
    },
    refreshDoors() {
      this.$message.success('门禁控制器、门磁和事件状态已同步')
    },
    doorByName(name) {
      return this.doors.find((item) => item.name === name) || this.doors[0]
    },
    resetPermissionForm() {
      this.permissionForm = {
        editingId: '',
        person: '',
        org: '行政部',
        credentials: ['手机'],
        doors: ['A栋公共区'],
        week: '周一至周五',
        period: ['08:00', '20:00'],
        validRange: ['2026-07-20', '2026-12-31'],
        source: '岗位权限',
        doubleReview: false
      }
    },
    openPermission(row) {
      this.resetPermissionForm()
      if (row)
        this.permissionForm = {
          editingId: row.id,
          person: row.person,
          org: row.org,
          credentials: (row.credential || '手机').split('/'),
          doors: (row.doors || 'A栋公共区').split('/'),
          week: row.week,
          period: (row.period || '').indexOf('-') > -1 ? row.period.split('-') : ['08:00', '20:00'],
          validRange: [row.validFrom === '-' ? '2026-07-20' : row.validFrom, row.validTo === '-' ? '2026-12-31' : row.validTo],
          source: row.source,
          doubleReview: row.source === '重要区域审批'
        }
      this.permissionDialogVisible = true
    },
    savePermission() {
      if (
        !this.permissionForm.person ||
        !this.permissionForm.credentials.length ||
        !this.permissionForm.doors.length ||
        !Array.isArray(this.permissionForm.period) ||
        this.permissionForm.period.length !== 2 ||
        !Array.isArray(this.permissionForm.validRange) ||
        this.permissionForm.validRange.length !== 2
      ) {
        this.$message.warning('请完善授权对象、认证方式、门区、时段和有效期')
        return
      }
      if (this.permissionForm.doors.indexOf('C栋重要机房') > -1 && !this.permissionForm.doubleReview) {
        this.$message.warning('重要机房权限必须启用双人复核')
        return
      }
      const row = {
        id: this.permissionForm.editingId || 'P' + String(this.permissions.length + 1).padStart(3, '0'),
        person: this.permissionForm.person,
        org: this.permissionForm.org,
        credential: this.permissionForm.credentials.join('/'),
        doors: this.permissionForm.doors.join('/'),
        week: this.permissionForm.week,
        period: this.permissionForm.period.join('-'),
        validFrom: this.permissionForm.validRange[0],
        validTo: this.permissionForm.validRange[1],
        source: this.permissionForm.source,
        sync: '离线待同步'
      }
      const index = this.permissions.findIndex((item) => item.id === row.id)
      if (index > -1) this.$set(this.permissions, index, row)
      else this.permissions.unshift(row)
      this.syncTasks.unshift({
        id: 'PS20260720' + String(this.syncTasks.length + 10),
        type: this.permissionForm.editingId ? '权限调整' : '新增授权',
        person: row.person,
        change: row.doors,
        controllers: row.doors.split('/').length + '台',
        createdAt: '10:46:18',
        progress: '0/' + row.doors.split('/').length,
        result: '离线待同步',
        operator: '当前管理员'
      })
      this.permissionDialogVisible = false
      this.openWorkspace('sync')
      this.$message.success('通行权限已保存并进入控制器下发队列')
    },
    batchSync() {
      this.syncTasks
        .filter((item) => item.result !== '成功')
        .forEach((item) => {
          item.result = item.result === '失败' ? '离线待同步' : item.result
        })
      this.openWorkspace('sync')
      this.$message.success('未完成权限已重新进入同步队列')
    },
    retrySync(row) {
      row.result = '成功'
      const total = row.progress.split('/')[1]
      row.progress = total + '/' + total
      this.$message.success(row.id + ' 已同步成功')
    },
    openDoorOperation(door, action) {
      if (!door) return
      this.operationForm = { doorId: door.id, doorName: door.name, action: action || '远程开门', duration: 15, videoChecked: false, reason: '', approver: '' }
      this.operationDialogVisible = true
    },
    submitDoorOperation() {
      if (!this.operationForm.reason || !this.operationForm.approver || !this.operationForm.videoChecked) {
        this.$message.warning('请完成视频核验并填写原因和复核人')
        return
      }
      this.audits.unshift({
        id: 'AA20260720' + String(this.audits.length + 10),
        time: '2026-07-20 10:46:30',
        action: this.operationForm.action,
        target: this.operationForm.doorName,
        operator: '当前值班员',
        reason: this.operationForm.reason,
        approval: this.operationForm.approver + ' / 二次确认',
        result: '成功'
      })
      const door = this.doors.find((item) => item.id === this.operationForm.doorId)
      if (door) door.mode = this.operationForm.action === '临时常开' ? '常开' : this.operationForm.action === '远程锁定' ? '锁定' : door.mode
      this.operationDialogVisible = false
      this.openWorkspace('audit')
      this.$message.success(this.operationForm.action + '已执行并写入审计')
    },
    saveOfflinePolicy() {
      this.offlineDialogVisible = false
      this.$message.success('离线、断电与消防策略已保存')
    },
    requestEmergency() {
      if (this.emergencyForm.approvers.length < 2) {
        this.$message.warning('紧急开门至少需要两名审批人')
        return
      }
      this.emergencyDialogVisible = false
      this.$message.success('紧急开门策略已提交双人审批，尚未执行')
    },
    openEvent(event) {
      this.currentEvent = event
      this.eventDrawerVisible = true
    },
    confirmEvent(event) {
      event.status = '处置中'
      event.traces.push({ time: '10:46:32', action: '异常确认', user: '当前值班员', remark: '已核验门口实时视频并通知现场安保' })
      this.$message.success('门禁异常已确认')
    },
    closeEvent(event) {
      event.status = '已关闭'
      event.traces.push({ time: '10:47:02', action: '处置关闭', user: '当前值班员', remark: '现场核验完成，门点恢复正常' })
      this.$message.success('事件已关闭并保留处置记录')
    }
  }
}
</script>

<style lang="scss" scoped>
@import './passageCommon.scss';
.access-overview {
  display: grid;
  grid-template-columns: minmax(710px, 1fr) 330px;
  height: var(--iot-overview-height);
  align-items: stretch;
  gap: 12px;
  margin-bottom: 18px;
}
.door-board {
  display: flex;
  min-height: 0;
  flex-direction: column;
}
.door-workbench {
  display: grid;
  grid-template-columns: 204px minmax(0, 1fr);
  min-height: 0;
  flex: 1 1 auto;
}
.group-rail {
  padding: 8px;
  background: #f8fafc;
  border-right: 1px solid #edf0f4;
}
.rail-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 7px 8px;
  color: #8591a2;
  font-size: 12px;
}
.rail-title span {
  padding: 2px 6px;
  background: #e9eef5;
  border-radius: 8px;
}
.group-rail > button {
  display: flex;
  width: 100%;
  min-height: 58px;
  align-items: center;
  gap: 9px;
  margin-bottom: 4px;
  padding: 9px 8px;
  color: #68788d;
  text-align: left;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
}
.group-rail > button:hover,
.group-rail > button.active {
  color: #296dce;
  background: #eef5ff;
  border-color: #dbe8fb;
}
.group-rail > button.abnormal {
  border-left: 3px solid #e78531;
}
.group-rail > button > span {
  min-width: 0;
  flex: 1;
}
.group-rail b,
.group-rail small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.group-rail b {
  color: #435269;
  font-size: 13px;
  line-height: 1.35;
}
.group-rail small {
  margin-top: 4px;
  color: #939ead;
  font-size: 11px;
  line-height: 1.35;
}
.group-rail em {
  display: flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  color: #d84b4b;
  background: #fff0f0;
  border-radius: 50%;
  font-size: 11px;
  font-style: normal;
}
.door-map {
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
.map-road {
  position: absolute;
  z-index: 1;
  background: #d6ddd8;
}
.road-horizontal {
  left: 5%;
  right: 5%;
  top: 49%;
  height: 35px;
}
.road-vertical {
  top: 5%;
  bottom: 5%;
  left: 50%;
  width: 35px;
}
.building {
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #6f7d78;
  background: rgba(201, 211, 205, 0.88);
  border: 1px solid #bcc9c1;
  border-radius: 5px;
  font-size: 9px;
}
.building-a {
  left: 10%;
  top: 14%;
  width: 25%;
  height: 23%;
}
.building-b {
  right: 10%;
  top: 12%;
  width: 26%;
  height: 25%;
}
.building-c {
  left: 39%;
  bottom: 12%;
  width: 22%;
  height: 22%;
}
.building-d {
  left: 8%;
  bottom: 9%;
  width: 24%;
  height: 21%;
}
.building-l {
  right: 8%;
  bottom: 10%;
  width: 24%;
  height: 20%;
}
.door-point {
  position: absolute;
  z-index: 5;
  display: flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #fff;
  background: #1aaa75;
  border: 3px solid #fff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(45, 80, 65, 0.28);
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: opacity 160ms ease, transform 160ms ease;
}
.door-point.offline {
  background: #8896a8;
}
.door-point.alarm {
  background: #e34e4e;
}
.door-point.dim {
  opacity: 0.32;
}
.door-point:hover,
.door-point.selected {
  z-index: 7;
  box-shadow: 0 0 0 5px rgba(52, 120, 225, 0.18);
  transform: translate(-50%, -50%) scale(1.12);
}
.door-popover {
  position: absolute;
  z-index: 9;
  right: 12px;
  top: 12px;
  width: 245px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.97);
  border: 1px solid #dfe6ed;
  border-radius: 7px;
  box-shadow: 0 7px 24px rgba(41, 60, 80, 0.16);
}
.door-popover > button {
  position: absolute;
  right: 6px;
  top: 5px;
  color: #8e99a8;
  background: transparent;
  border: 0;
  cursor: pointer;
}
.door-pop-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 12px;
}
.door-pop-title > span {
  display: flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #1aaa75;
  border-radius: 6px;
}
.door-pop-title > span.offline {
  background: #8795a7;
}
.door-pop-title > span.alarm {
  background: #e34e4e;
}
.door-pop-title > div {
  min-width: 0;
  flex: 1;
}
.door-pop-title b,
.door-pop-title small {
  display: block;
}
.door-pop-title b {
  color: #3b4a60;
  font-size: 10px;
}
.door-pop-title small {
  margin-top: 3px;
  color: #909cab;
  font-size: 8px;
}
.door-pop-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  margin-top: 11px;
  overflow: hidden;
  background: #e8edf2;
  border-radius: 4px;
}
.door-pop-grid span {
  padding: 7px;
  background: #fafbfc;
}
.door-pop-grid small,
.door-pop-grid b {
  display: block;
}
.door-pop-grid small {
  color: #929eac;
  font-size: 8px;
}
.door-pop-grid b {
  margin-top: 3px;
  color: #47566b;
  font-size: 8px;
}
.door-pop-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 10px;
}
.map-legend {
  position: absolute;
  z-index: 8;
  left: 12px;
  bottom: 10px;
  display: flex;
  gap: 10px;
  padding: 5px 8px;
  color: #768598;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  font-size: 8px;
}
.map-legend i {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 4px;
  background: #1aaa75;
  border-radius: 50%;
}
.map-legend i.offline {
  background: #8896a8;
}
.map-legend i.alarm {
  background: #e34e4e;
}
.event-stream {
  display: flex;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}
.event-stream .surface-title {
  font-size: 15px;
  line-height: 1.35;
}
.event-stream .surface-subtitle {
  font-size: 12px;
  line-height: 1.4;
}
.event-stream :deep(.el-checkbox__label) {
  font-size: 12px;
}
.stream-list {
  min-height: 0;
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 8px 11px;
}
.stream-list > button {
  display: flex;
  width: 100%;
  min-height: 64px;
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
.stream-list > button:hover {
  background: #f8fafc;
}
.stream-list > button.abnormal {
  border-left: 2px solid #e65050;
}
.event-icon {
  display: flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  color: #1aa273;
  background: #eaf8f3;
  border-radius: 8px;
  font-size: 14px;
}
.abnormal .event-icon {
  color: #df4e4e;
  background: #fff0f0;
}
.event-main {
  min-width: 0;
  flex: 1;
}
.event-main b,
.event-main small,
.event-main em {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.event-main b {
  color: #405067;
  font-size: 13px;
  line-height: 1.35;
}
.event-main small {
  margin-top: 3px;
  color: #778598;
  font-size: 11px;
  line-height: 1.35;
}
.event-main em {
  margin-top: 3px;
  color: #a1aab7;
  font-size: 11px;
  line-height: 1.35;
  font-style: normal;
}
.event-stream :deep(.el-tag) {
  font-size: 12px;
}
.stream-footer {
  margin: 2px 10px 10px;
  padding: 9px 10px;
  color: #5d789b;
  background: #f0f5fb;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.45;
}
.stream-footer i {
  margin-right: 4px;
  color: #3478e1;
}
.evidence-link {
  color: #3478e1;
  font-size: 9px;
}
.evidence-link i,
.muted-evidence i {
  margin-right: 3px;
}
.muted-evidence {
  color: #a2acb9;
  font-size: 9px;
}
.completed-text {
  color: #1a9f6d;
  font-size: 9px;
}
.event-hero {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 -18px 14px;
  padding: 15px 18px;
  background: #edf9f4;
  border-top: 3px solid #1aaa75;
}
.event-hero.abnormal {
  background: #fff1f1;
  border-color: #e74e4e;
}
.event-hero > span {
  display: flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #1aaa75;
  border-radius: 8px;
}
.event-hero.abnormal > span {
  background: #e74e4e;
}
.event-hero > div {
  min-width: 0;
  flex: 1;
}
.event-hero small,
.event-hero h3,
.event-hero p {
  display: block;
  margin: 0;
}
.event-hero h3 {
  margin: 4px 0;
  color: #344159;
  font-size: 15px;
}
.event-hero small,
.event-hero p {
  color: #8793a4;
  font-size: 9px;
}
.access-evidence {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}
.access-evidence > div {
  display: flex;
  height: 95px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #dbe5eb;
  background: linear-gradient(135deg, #182933, #354b56);
  border-radius: 6px;
}
.access-evidence i {
  font-size: 23px;
}
.access-evidence span {
  margin-top: 7px;
  font-size: 9px;
}
.access-evidence b {
  margin-top: 3px;
  color: #9aadb6;
  font-size: 8px;
}
.normal-record {
  padding: 12px;
  color: #477560;
  background: #edf8f2;
  border-radius: 5px;
  font-size: 10px;
}
.normal-record i {
  margin-right: 5px;
  color: #1aa273;
}
@media (max-width: 1220px) {
  .access-overview {
    grid-template-columns: 1fr;
    height: auto;
  }
  .door-workbench {
    min-height: clamp(410px, 54vh, 580px);
    min-height: clamp(410px, 54dvh, 580px);
    flex: none;
  }
}
@media (max-width: 760px) {
  .door-workbench {
    display: block;
    min-height: 0;
  }
  .group-rail {
    display: flex;
    overflow-x: auto;
  }
  .group-rail > button {
    min-width: 185px;
  }
  .door-map {
    height: 430px;
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
.access-detail-drawer .el-drawer__header {
  font-size: 16px;
}
.access-detail-drawer .event-hero h3 {
  font-size: 18px;
  line-height: 24px;
}
.access-detail-drawer .event-hero small,
.access-detail-drawer .event-hero p {
  font-size: 12px;
  line-height: 18px;
}
.access-detail-drawer .event-hero > .el-tag {
  display: inline-flex;
  width: auto;
  min-width: 58px;
  height: 28px;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  padding: 0 10px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  box-sizing: border-box;
}
.access-detail-drawer .access-evidence span {
  font-size: 12px;
  line-height: 18px;
}
.access-detail-drawer .access-evidence b {
  font-size: 11px;
  line-height: 16px;
}
.access-detail-drawer .detail-info-grid small {
  font-size: 12px;
  line-height: 18px;
}
.access-detail-drawer .detail-info-grid b {
  font-size: 13px;
  line-height: 20px;
}
.access-detail-drawer .detail-section h4 {
  font-size: 14px;
}
.access-detail-drawer .el-timeline-item__timestamp {
  font-size: 12px;
}
.access-detail-drawer .trace-card b {
  font-size: 13px;
}
.access-detail-drawer .trace-card span {
  font-size: 11px;
}
.access-detail-drawer .trace-card p,
.access-detail-drawer .normal-record {
  font-size: 12px;
  line-height: 18px;
}
.access-detail-drawer .drawer-actions .el-button {
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
