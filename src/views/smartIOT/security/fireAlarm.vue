<!-- 消防设备维保页面：负责设备档案、维保记录、详情操作与提醒配置。 -->
<template>
  <div class="fire-maintenance-page">
    <header class="page-header">
      <div>
        <div class="title-row">
          <h2>消防设备维保登记</h2>
          <span class="scope-badge">
            <i class="el-icon-document-checked"></i>
            当前仅管理维保业务
          </span>
        </div>
        <p>统一管理消防设备台账、维保计划、执行登记、现场凭证和到期提醒</p>
      </div>
    </header>

    <section class="kpi-grid">
      <article v-for="item in dataSet.kpis" :key="item.title" class="kpi-card">
        <i :class="[item.icon, 'kpi-icon', item.type]"></i>
        <div class="kpi-label">{{ item.title }}</div>
        <div class="kpi-number">
          {{ item.value }}
          <small>{{ item.unit }}</small>
        </div>
        <div class="kpi-sub">{{ item.sub }}</div>
      </article>
    </section>

    <iot-workspace-nav v-model="activeTab" :items="workspaceNav" aria-label="消防设备维保业务工作区" @change="handleWorkspaceChange" />

    <section v-if="activeTab === 'overview'" ref="workspaceContent" class="overview-grid" tabindex="-1">
      <article class="surface category-panel">
        <div class="surface-head">
          <div>
            <h3>
              <i class="el-icon-pie-chart"></i>
              设备分类与本年维保
            </h3>
            <p>按设备类型统计计划覆盖情况</p>
          </div>
          <span class="head-note">共 6 类</span>
        </div>
        <div class="category-list">
          <div v-for="item in dataSet.categories" :key="item.name" class="category-row">
            <div class="category-meta">
              <span>
                <i :style="{ background: item.color }"></i>
                {{ item.name }}
              </span>
              <b>{{ item.maintained }}/{{ item.total }}</b>
            </div>
            <div class="category-progress"><i :style="{ width: Math.round((item.maintained / item.total) * 100) + '%', background: item.color }"></i></div>
          </div>
        </div>
      </article>

      <article class="surface progress-panel">
        <div class="surface-head">
          <div>
            <h3>
              <i class="el-icon-data-line"></i>
              本月维保进度
            </h3>
            <p>计划 32 次，已完成 26 次</p>
          </div>
          <el-button type="text" size="mini" @click="openWorkspace('plans')">
            进入计划管理
            <i class="el-icon-arrow-right"></i>
          </el-button>
        </div>
        <div class="progress-layout">
          <div class="progress-ring">
            <div>
              <strong>81.3%</strong>
              <span>本月完成率</span>
            </div>
          </div>
          <div class="progress-stats">
            <div>
              <span>
                <i class="dot completed"></i>
                已完成
              </span>
              <strong>
                26
                <small>次</small>
              </strong>
            </div>
            <div>
              <span>
                <i class="dot pending"></i>
                待执行
              </span>
              <strong>
                6
                <small>次</small>
              </strong>
            </div>
            <div>
              <span>
                <i class="dot overdue"></i>
                其中逾期
              </span>
              <strong>
                4
                <small>次</small>
              </strong>
            </div>
          </div>
        </div>
        <div class="month-summary">
          <span>
            内部维保
            <b>21 次</b>
          </span>
          <span>
            外委维保
            <b>5 次</b>
          </span>
          <span>
            一次合格率
            <b>92.3%</b>
          </span>
        </div>
      </article>

      <article class="surface reminder-panel">
        <div class="surface-head">
          <div>
            <h3>
              <i class="el-icon-alarm-clock"></i>
              近期维保提醒
            </h3>
            <p>按到期紧急程度自动排序</p>
          </div>
          <el-button type="text" size="mini" @click="openWorkspace('reminders')">
            进入提醒管理
            <i class="el-icon-arrow-right"></i>
          </el-button>
        </div>
        <div class="reminder-list">
          <button v-for="item in dataSet.reminders.slice(0, 5)" :key="item.id" type="button" class="reminder-item" @click="openReminder(item)">
            <span :class="['date-box', item.overdueDays > 0 ? 'overdue' : item.overdueDays === 0 ? 'today' : 'upcoming']">
              <b>{{ item.dueDate.slice(8) }}</b>
              <small>07月</small>
            </span>
            <span class="reminder-info">
              <b>{{ item.device }}</b>
              <small>{{ item.location }}</small>
            </span>
            <span :class="['reminder-status', item.overdueDays >= 0 ? 'danger' : 'warning']">{{ item.status }}</span>
          </button>
        </div>
      </article>
    </section>

    <section v-else ref="workspaceContent" class="surface ledger-card workspace-detail" tabindex="-1">
      <iot-workspace-header :item="currentWorkspace" updated-at="10:42:14" @back="openWorkspace('overview')" />
      <el-tabs v-model="activeTab" class="workspace-tabs">
        <el-tab-pane name="devices">
          <span slot="label" class="tab-label">
            <i class="el-icon-cpu"></i>
            设备台账
            <b>{{ devices.length }}</b>
          </span>
          <div class="toolbar">
            <div class="toolbar-left">
              <el-input v-model.trim="deviceKeyword" size="small" clearable prefix-icon="el-icon-search" placeholder="设备编号 / 名称 / 位置" style="width: 230px"></el-input>
              <el-select v-model="deviceCategory" size="small" clearable placeholder="设备类型" style="width: 150px">
                <el-option v-for="item in categories" :key="item" :label="item" :value="item"></el-option>
              </el-select>
              <el-select v-model="deviceStatus" size="small" clearable placeholder="维保状态" style="width: 130px">
                <el-option v-for="item in deviceStatuses" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </div>
            <div class="toolbar-right">
              <span class="toolbar-note">
                <i class="el-icon-info"></i>
                点击设备行可查看完整维保履历
              </span>
              <el-button type="primary" size="small" icon="el-icon-plus" @click="openDeviceDialog()">新增设备</el-button>
            </div>
          </div>
          <el-table :data="pagedDevices" size="small" stripe @row-click="openDeviceDetail">
            <el-table-column prop="id" label="设备编号" width="118"></el-table-column>
            <el-table-column prop="name" label="设备名称" min-width="180"></el-table-column>
            <el-table-column prop="category" label="设备类型" width="125"></el-table-column>
            <el-table-column label="安装位置" min-width="190">
              <template slot-scope="scope">{{ scope.row.building }} / {{ scope.row.floor }} / {{ scope.row.location }}</template>
            </el-table-column>
            <el-table-column prop="cycle" label="周期" width="78">
              <template slot-scope="scope">{{ scope.row.cycle }}个月</template>
            </el-table-column>
            <el-table-column prop="lastDate" label="上次维保" width="105"></el-table-column>
            <el-table-column prop="nextDate" label="下次维保" width="105"></el-table-column>
            <el-table-column prop="owner" label="责任人" width="82"></el-table-column>
            <el-table-column label="状态" width="105">
              <template slot-scope="scope">
                <span :class="['status-pill', statusClass(scope.row.status)]">{{ scope.row.status }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="145" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" size="mini" @click.stop="openRecordDialog(scope.row)">登记维保</el-button>
                <el-button type="text" size="mini" @click.stop="openDeviceDialog(scope.row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-row"><el-pagination :current-page.sync="devicePage" :page-size="6" layout="total, prev, pager, next" :total="filteredDevices.length"></el-pagination></div>
        </el-tab-pane>

        <el-tab-pane name="plans">
          <span slot="label" class="tab-label">
            <i class="el-icon-date"></i>
            维保计划
            <b>{{ plans.length }}</b>
          </span>
          <div class="toolbar">
            <div class="toolbar-left">
              <el-input v-model.trim="planKeyword" size="small" clearable prefix-icon="el-icon-search" placeholder="计划编号 / 名称 / 范围" style="width: 240px"></el-input>
              <el-select v-model="planStatus" size="small" clearable placeholder="计划状态" style="width: 130px">
                <el-option v-for="item in ['待执行', '执行中', '已完成']" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </div>
            <el-button type="primary" size="small" icon="el-icon-plus" @click="openPlanDialog()">新建计划</el-button>
          </div>
          <el-table :data="pagedPlans" size="small" stripe>
            <el-table-column prop="id" label="计划编号" width="125"></el-table-column>
            <el-table-column prop="name" label="计划名称" min-width="190"></el-table-column>
            <el-table-column prop="scope" label="维保范围" min-width="220"></el-table-column>
            <el-table-column prop="frequency" label="频次" width="88"></el-table-column>
            <el-table-column prop="plannedDate" label="计划日期" width="105"></el-table-column>
            <el-table-column label="完成进度" width="170">
              <template slot-scope="scope">
                <div class="table-progress">
                  <el-progress :percentage="planProgress(scope.row)" :show-text="false" :stroke-width="7"></el-progress>
                  <span>{{ scope.row.completed }}/{{ scope.row.devices }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="serviceType" label="维保方式" width="95"></el-table-column>
            <el-table-column prop="owner" label="负责人" width="82"></el-table-column>
            <el-table-column label="状态" width="90">
              <template slot-scope="scope">
                <span :class="['status-pill', statusClass(scope.row.status)]">{{ scope.row.status }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="145" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" size="mini" @click="executePlan(scope.row)">执行登记</el-button>
                <el-button type="text" size="mini" @click="openPlanDialog(scope.row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-row"><el-pagination :current-page.sync="planPage" :page-size="6" layout="total, prev, pager, next" :total="filteredPlans.length"></el-pagination></div>
        </el-tab-pane>

        <el-tab-pane name="records">
          <span slot="label" class="tab-label">
            <i class="el-icon-document-checked"></i>
            维保记录
            <b>{{ records.length }}</b>
          </span>
          <div class="toolbar">
            <div class="toolbar-left">
              <el-input v-model.trim="recordKeyword" size="small" clearable prefix-icon="el-icon-search" placeholder="记录编号 / 设备 / 执行人" style="width: 240px"></el-input>
              <el-select v-model="recordResult" size="small" clearable placeholder="维保结果" style="width: 130px">
                <el-option v-for="item in ['合格', '需维修', '不合格']" :key="item" :label="item" :value="item"></el-option>
              </el-select>
              <el-date-picker v-model="recordDate" type="date" size="small" value-format="yyyy-MM-dd" placeholder="维保日期" style="width: 150px"></el-date-picker>
            </div>
            <el-button type="primary" size="small" icon="el-icon-edit-outline" @click="openRecordDialog()">新增登记</el-button>
          </div>
          <el-table :data="pagedRecords" size="small" stripe @row-click="openRecordDetail">
            <el-table-column prop="id" label="记录编号" width="140"></el-table-column>
            <el-table-column prop="device" label="设备名称" min-width="180"></el-table-column>
            <el-table-column prop="category" label="设备类型" width="120"></el-table-column>
            <el-table-column prop="date" label="维保时间" width="145"></el-table-column>
            <el-table-column prop="type" label="维保类型" width="95"></el-table-column>
            <el-table-column prop="executor" label="执行人" width="90"></el-table-column>
            <el-table-column prop="company" label="执行单位" min-width="145"></el-table-column>
            <el-table-column label="结果" width="88">
              <template slot-scope="scope">
                <span :class="['result-pill', resultClass(scope.row.result)]">{{ scope.row.result }}</span>
              </template>
            </el-table-column>
            <el-table-column label="现场凭证" width="90">
              <template slot-scope="scope">
                <span class="evidence-link">
                  <i class="el-icon-picture-outline"></i>
                  {{ scope.row.photos.length }}项
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="nextDate" label="下次维保" width="110"></el-table-column>
            <el-table-column label="操作" width="70" fixed="right">
              <template slot-scope="scope"><el-button type="text" size="mini" @click.stop="openRecordDetail(scope.row)">详情</el-button></template>
            </el-table-column>
          </el-table>
          <div class="pagination-row"><el-pagination :current-page.sync="recordPage" :page-size="6" layout="total, prev, pager, next" :total="filteredRecords.length"></el-pagination></div>
        </el-tab-pane>

        <el-tab-pane name="reminders">
          <span slot="label" class="tab-label">
            <i class="el-icon-alarm-clock"></i>
            到期提醒
            <b class="danger-count">{{ reminders.length }}</b>
          </span>
          <div class="toolbar">
            <div class="toolbar-left">
              <el-input
                v-model.trim="reminderKeyword"
                size="small"
                clearable
                prefix-icon="el-icon-search"
                placeholder="设备编号 / 设备名称 / 类型 / 位置 / 责任人 / 计划"
                style="width: 300px"></el-input>
            </div>
            <el-button size="small" @click="reminderRuleDialog = true">提醒规则</el-button>
          </div>
          <el-table :data="pagedReminders" size="small" stripe>
            <el-table-column label="紧急程度" width="100">
              <template slot-scope="scope">
                <span :class="['urgency-mark', scope.row.overdueDays > 0 ? 'danger' : scope.row.overdueDays === 0 ? 'today' : 'warning']">
                  <i></i>
                  {{ scope.row.status }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="deviceId" label="设备编号" width="118"></el-table-column>
            <el-table-column prop="device" label="设备名称" min-width="180"></el-table-column>
            <el-table-column prop="category" label="设备类型" width="120"></el-table-column>
            <el-table-column prop="location" label="安装位置" min-width="220"></el-table-column>
            <el-table-column prop="dueDate" label="到期日期" width="105"></el-table-column>
            <el-table-column prop="owner" label="责任人" width="85"></el-table-column>
            <el-table-column prop="plan" label="关联计划" min-width="190"></el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template slot-scope="scope"><el-button type="primary" plain size="mini" @click="openReminder(scope.row)">立即登记</el-button></template>
            </el-table-column>
          </el-table>
          <div class="pagination-row"><el-pagination :current-page.sync="reminderPage" :page-size="6" layout="total, prev, pager, next" :total="filteredReminders.length"></el-pagination></div>
        </el-tab-pane>
      </el-tabs>
    </section>

    <el-dialog :title="deviceForm.editingId ? '编辑消防设备' : '新增消防设备'" :visible.sync="deviceDialog" width="720px" custom-class="maintenance-dialog">
      <div class="dialog-intro">
        <i class="el-icon-info"></i>
        建立设备基础档案后，系统将按维保周期自动计算到期时间并生成提醒。
      </div>
      <el-form ref="deviceForm" :model="deviceForm" :rules="deviceRules" label-width="105px" size="small">
        <div class="form-section-title">基础信息</div>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="设备编号" prop="id"><el-input v-model.trim="deviceForm.id" :disabled="!!deviceForm.editingId"></el-input></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备类型" prop="category">
              <el-select v-model="deviceForm.category" style="width: 100%"><el-option v-for="item in categories" :key="item" :label="item" :value="item"></el-option></el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="设备名称" prop="name"><el-input v-model.trim="deviceForm.name"></el-input></el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="品牌"><el-input v-model.trim="deviceForm.brand"></el-input></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格型号"><el-input v-model.trim="deviceForm.model"></el-input></el-form-item>
          </el-col>
        </el-row>
        <div class="form-section-title">安装与责任信息</div>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="建筑" prop="building">
              <el-select v-model="deviceForm.building" style="width: 100%"><el-option v-for="item in buildings" :key="item" :label="item" :value="item"></el-option></el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="楼层"><el-input v-model.trim="deviceForm.floor"></el-input></el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="具体位置" prop="location"><el-input v-model.trim="deviceForm.location"></el-input></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="责任部门"><el-input v-model.trim="deviceForm.department"></el-input></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="责任人" prop="owner"><el-input v-model.trim="deviceForm.owner"></el-input></el-form-item>
          </el-col>
        </el-row>
        <div class="form-section-title">维保周期</div>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="安装日期"><el-date-picker v-model="deviceForm.installDate" type="date" value-format="yyyy-MM-dd" style="width: 100%"></el-date-picker></el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="维保周期" prop="cycle">
              <el-select v-model="deviceForm.cycle" style="width: 100%"><el-option v-for="item in [1, 3, 6, 12]" :key="item" :label="item + '个月'" :value="item"></el-option></el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="下次维保" prop="nextDate"><el-date-picker v-model="deviceForm.nextDate" type="date" value-format="yyyy-MM-dd" style="width: 100%"></el-date-picker></el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer">
        <el-button @click="deviceDialog = false">取消</el-button>
        <el-button type="primary" @click="saveDevice">保存设备档案</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="planForm.editingId ? '编辑维保计划' : '新建维保计划'" :visible.sync="planDialog" width="720px" custom-class="maintenance-dialog">
      <div class="dialog-intro">
        <i class="el-icon-date"></i>
        计划保存后按设备范围生成待办；责任人将在设定的提前天数收到到期提醒。
      </div>
      <el-form ref="planForm" :model="planForm" :rules="planRules" label-width="105px" size="small">
        <el-form-item label="计划名称" prop="name"><el-input v-model.trim="planForm.name"></el-input></el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="建筑范围" prop="building">
              <el-select v-model="planForm.building" multiple collapse-tags style="width: 100%"><el-option v-for="item in buildings" :key="item" :label="item" :value="item"></el-option></el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备类型" prop="categories">
              <el-select v-model="planForm.categories" multiple collapse-tags style="width: 100%"><el-option v-for="item in categories" :key="item" :label="item" :value="item"></el-option></el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="执行频次">
              <el-select v-model="planForm.frequency" style="width: 100%">
                <el-option v-for="item in ['每月', '每3个月', '每6个月', '每年']" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="计划日期" prop="plannedDate"><el-date-picker v-model="planForm.plannedDate" type="date" value-format="yyyy-MM-dd" style="width: 100%"></el-date-picker></el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="提前提醒"><el-input-number v-model="planForm.advanceDays" :min="1" :max="30" style="width: 100%"></el-input-number></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="10">
            <el-form-item label="维保方式">
              <el-radio-group v-model="planForm.serviceType">
                <el-radio label="内部维保"></el-radio>
                <el-radio label="外委维保"></el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <el-form-item label="负责人" prop="owner"><el-input v-model.trim="planForm.owner"></el-input></el-form-item>
          </el-col>
        </el-row>
        <el-form-item v-if="planForm.serviceType === '外委维保'" label="维保单位" prop="vendor">
          <el-input v-model.trim="planForm.vendor" placeholder="填写具备相应资质的维保单位"></el-input>
        </el-form-item>
        <el-form-item label="检查模板">
          <div class="template-preview">
            <span v-for="item in planChecklist" :key="item">
              <i class="el-icon-check"></i>
              {{ item }}
            </span>
            <small v-if="!planChecklist.length">选择设备类型后自动带出检查项目</small>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="planDialog = false">取消</el-button>
        <el-button type="primary" @click="savePlan">保存并生成维保任务</el-button>
      </span>
    </el-dialog>

    <el-dialog title="消防设备维保执行登记" :visible.sync="recordDialog" width="780px" custom-class="maintenance-dialog record-dialog" :close-on-click-modal="false">
      <div class="dialog-intro">
        <i class="el-icon-edit-outline"></i>
        维保记录提交后不可直接删除；如需更正，应通过补充记录保留修改原因和人员。
      </div>
      <el-form ref="recordForm" :model="recordForm" :rules="recordRules" label-width="105px" size="small">
        <div class="form-section-title">执行对象</div>
        <el-row :gutter="16">
          <el-col :span="14">
            <el-form-item label="消防设备" prop="deviceId">
              <el-select v-model="recordForm.deviceId" filterable style="width: 100%" @change="onRecordDeviceChange">
                <el-option v-for="item in devices" :key="item.id" :label="item.name + '（' + item.id + '）'" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="维保类型">
              <el-select v-model="recordForm.type" style="width: 100%">
                <el-option v-for="item in ['定期维保', '功能测试', '试运行', '故障检查', '逾期补检']" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <div v-if="recordDevice" class="device-summary">
          <span>
            <small>设备类型</small>
            <b>{{ recordDevice.category }}</b>
          </span>
          <span>
            <small>安装位置</small>
            <b>{{ recordDevice.building }} / {{ recordDevice.floor }} / {{ recordDevice.location }}</b>
          </span>
          <span>
            <small>当前状态</small>
            <b>{{ recordDevice.status }}</b>
          </span>
        </div>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="维保时间" prop="date"><el-date-picker v-model="recordForm.date" type="datetime" value-format="yyyy-MM-dd HH:mm" style="width: 100%"></el-date-picker></el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="执行人" prop="executor"><el-input v-model.trim="recordForm.executor"></el-input></el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="执行单位" prop="company"><el-input v-model.trim="recordForm.company"></el-input></el-form-item>
          </el-col>
        </el-row>
        <div class="form-section-title">检查项目</div>
        <div v-if="recordChecklist.length" class="checklist-grid">
          <el-checkbox v-for="item in recordChecklist" :key="item" v-model="recordForm.checkedItems" :label="item" border>{{ item }}</el-checkbox>
        </div>
        <div v-else class="checklist-empty">请先选择消防设备</div>
        <div class="form-section-title">维保结论与凭证</div>
        <el-row :gutter="16">
          <el-col :span="10">
            <el-form-item label="维保结果" prop="result">
              <el-radio-group v-model="recordForm.result">
                <el-radio label="合格"></el-radio>
                <el-radio label="需维修"></el-radio>
                <el-radio label="不合格"></el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <el-form-item label="下次维保" prop="nextDate"><el-date-picker v-model="recordForm.nextDate" type="date" value-format="yyyy-MM-dd" style="width: 100%"></el-date-picker></el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="问题说明">
          <el-input v-model.trim="recordForm.issue" type="textarea" :rows="2" :placeholder="recordForm.result === '合格' ? '可填写现场调整情况' : '请填写缺陷、影响和后续处理要求'"></el-input>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="更换部件"><el-input v-model.trim="recordForm.parts"></el-input></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="维保费用"><el-input-number v-model="recordForm.cost" :min="0" :precision="2" style="width: 100%"></el-input-number></el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="现场凭证" required>
          <div class="evidence-uploader">
            <button type="button" @click="addEvidence">
              <i class="el-icon-plus"></i>
              <span>添加图片或视频</span>
            </button>
            <span v-for="(item, index) in recordForm.photos" :key="item" class="evidence-chip">
              <i :class="item.indexOf('视频') > -1 ? 'el-icon-video-camera' : 'el-icon-picture-outline'"></i>
              {{ item }}
              <button type="button" aria-label="移除凭证" @click="recordForm.photos.splice(index, 1)"><i class="el-icon-close"></i></button>
            </span>
          </div>
          <div class="form-help">仿真环境使用文件占位；正式系统应上传原图、拍摄时间和定位信息。</div>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="recordDialog = false">取消</el-button>
        <el-button type="primary" @click="saveRecord">提交维保记录</el-button>
      </span>
    </el-dialog>

    <el-dialog title="到期提醒规则" :visible.sync="reminderRuleDialog" width="560px" custom-class="maintenance-dialog">
      <el-form :model="reminderRule" label-width="115px" size="small">
        <el-form-item label="默认提前提醒">
          <el-input-number v-model="reminderRule.advanceDays" :min="1" :max="30"></el-input-number>
          <span class="form-unit">天</span>
        </el-form-item>
        <el-form-item label="提醒对象">
          <el-checkbox-group v-model="reminderRule.receivers">
            <el-checkbox label="设备责任人"></el-checkbox>
            <el-checkbox label="部门负责人"></el-checkbox>
            <el-checkbox label="消防管理员"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="提醒方式">
          <el-checkbox-group v-model="reminderRule.channels">
            <el-checkbox label="系统消息"></el-checkbox>
            <el-checkbox label="移动端"></el-checkbox>
            <el-checkbox label="短信"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="逾期升级">
          <el-switch v-model="reminderRule.escalate"></el-switch>
          <span class="form-help inline">逾期超过3天升级至园区工程负责人</span>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="reminderRuleDialog = false">取消</el-button>
        <el-button type="primary" @click="saveReminderRule">保存规则</el-button>
      </span>
    </el-dialog>

    <el-drawer :title="drawerMode === 'device' ? '消防设备维保档案' : '维保记录详情'" :visible.sync="drawerVisible" size="500px" custom-class="maintenance-drawer">
      <div v-if="currentRecord" class="drawer-scroll">
        <div class="drawer-hero">
          <div class="hero-icon"><i :class="drawerMode === 'device' ? 'el-icon-cpu' : 'el-icon-document-checked'"></i></div>
          <div>
            <h3>{{ drawerMode === 'device' ? currentRecord.name : currentRecord.device }}</h3>
            <p>{{ currentRecord.id }}</p>
          </div>
          <span :class="['status-pill', drawerMode === 'device' ? statusClass(currentRecord.status) : resultClass(currentRecord.result)]">
            {{ drawerMode === 'device' ? currentRecord.status : currentRecord.result }}
          </span>
        </div>
        <template v-if="drawerMode === 'device'">
          <div class="detail-grid">
            <div>
              <span>设备类型</span>
              <b>{{ currentRecord.category }}</b>
            </div>
            <div>
              <span>品牌型号</span>
              <b>{{ currentRecord.brand }} / {{ currentRecord.model }}</b>
            </div>
            <div>
              <span>安装位置</span>
              <b>{{ currentRecord.building }} / {{ currentRecord.floor }} / {{ currentRecord.location }}</b>
            </div>
            <div>
              <span>责任单位</span>
              <b>{{ currentRecord.department }} / {{ currentRecord.owner }}</b>
            </div>
            <div>
              <span>维保周期</span>
              <b>{{ currentRecord.cycle }}个月</b>
            </div>
            <div>
              <span>下次维保</span>
              <b>{{ currentRecord.nextDate }}</b>
            </div>
            <div>
              <span>设备二维码</span>
              <b>{{ currentRecord.qrCode }}</b>
            </div>
            <div>
              <span>安装日期</span>
              <b>{{ currentRecord.installDate }}</b>
            </div>
          </div>
          <div class="drawer-section-title">
            历次维保记录
            <small>{{ deviceHistory.length }} 条</small>
          </div>
          <div v-if="deviceHistory.length" class="history-list">
            <button v-for="item in deviceHistory" :key="item.id" type="button" @click="openRecordDetail(item)">
              <i :class="['history-mark', resultClass(item.result)]"></i>
              <span>
                <b>{{ item.type }} · {{ item.result }}</b>
                <small>{{ item.date }} · {{ item.executor }}</small>
                <em>{{ item.content }}</em>
              </span>
              <i class="el-icon-arrow-right"></i>
            </button>
          </div>
          <div v-else class="empty-history">暂无维保记录</div>
        </template>
        <template v-else>
          <div class="detail-grid">
            <div>
              <span>维保类型</span>
              <b>{{ currentRecord.type }}</b>
            </div>
            <div>
              <span>维保时间</span>
              <b>{{ currentRecord.date }}</b>
            </div>
            <div>
              <span>执行人员</span>
              <b>{{ currentRecord.executor }}</b>
            </div>
            <div>
              <span>执行单位</span>
              <b>{{ currentRecord.company }}</b>
            </div>
            <div>
              <span>维保费用</span>
              <b>{{ currentRecord.cost }} 元</b>
            </div>
            <div>
              <span>下次维保</span>
              <b>{{ currentRecord.nextDate }}</b>
            </div>
          </div>
          <div class="drawer-section-title">维保内容</div>
          <p class="detail-description">{{ currentRecord.content }}</p>
          <div class="drawer-section-title">发现问题</div>
          <p :class="['detail-description', currentRecord.issue !== '无' ? 'warning' : '']">{{ currentRecord.issue }}</p>
          <div class="drawer-section-title">现场凭证</div>
          <div class="drawer-evidence">
            <span v-for="item in currentRecord.photos" :key="item">
              <i :class="item.indexOf('视频') > -1 ? 'el-icon-video-camera' : 'el-icon-picture-outline'"></i>
              {{ item }}
            </span>
          </div>
          <div class="drawer-section-title">登记留痕</div>
          <div v-for="(trace, index) in currentRecord.traces" :key="index" class="trace-item">
            <span>{{ trace.time }}</span>
            <div>
              <b>{{ trace.action }}</b>
              <small>{{ trace.user }} · {{ trace.remark }}</small>
            </div>
          </div>
        </template>
      </div>
      <div v-if="currentRecord" class="drawer-actions">
        <el-button v-if="drawerMode === 'device'" size="small" @click="openDeviceDialog(currentRecord)">编辑设备</el-button>
        <el-button v-if="drawerMode === 'device'" type="primary" size="small" @click="openRecordFromDrawer">登记维保</el-button>
        <el-button v-else type="primary" size="small" @click="simulatePrint">打印维保单</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import IotWorkspaceHeader from '../components/IotWorkspaceHeader.vue'
import IotWorkspaceNav from '../components/IotWorkspaceNav.vue'
import { fireMaintenance } from '../mock/fireMaintenanceMockData'

export default {
  name: 'SmartIOTFireAlarm',
  components: { IotWorkspaceHeader, IotWorkspaceNav },
  data() {
    return {
      dataSet: fireMaintenance,
      devices: JSON.parse(JSON.stringify(fireMaintenance.devices)),
      plans: JSON.parse(JSON.stringify(fireMaintenance.plans)),
      records: JSON.parse(JSON.stringify(fireMaintenance.records)),
      reminders: JSON.parse(JSON.stringify(fireMaintenance.reminders)),
      activeTab: 'overview',
      deviceKeyword: '',
      deviceCategory: '',
      deviceStatus: '',
      devicePage: 1,
      planKeyword: '',
      planStatus: '',
      planPage: 1,
      recordKeyword: '',
      recordResult: '',
      recordDate: '',
      recordPage: 1,
      reminderKeyword: '',
      reminderPage: 1,
      deviceDialog: false,
      planDialog: false,
      recordDialog: false,
      reminderRuleDialog: false,
      drawerVisible: false,
      drawerMode: 'device',
      currentRecord: null,
      deviceForm: {},
      planForm: {},
      recordForm: {},
      reminderRule: { advanceDays: 7, receivers: ['设备责任人', '消防管理员'], channels: ['系统消息', '移动端'], escalate: true },
      deviceRules: {
        id: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
        name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
        category: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
        building: [{ required: true, message: '请选择建筑', trigger: 'change' }],
        location: [{ required: true, message: '请输入具体位置', trigger: 'blur' }],
        owner: [{ required: true, message: '请输入责任人', trigger: 'blur' }],
        cycle: [{ required: true, message: '请选择维保周期', trigger: 'change' }],
        nextDate: [{ required: true, message: '请选择下次维保日期', trigger: 'change' }]
      },
      planRules: {
        name: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
        building: [{ type: 'array', required: true, message: '请选择建筑范围', trigger: 'change' }],
        categories: [{ type: 'array', required: true, message: '请选择设备类型', trigger: 'change' }],
        plannedDate: [{ required: true, message: '请选择计划日期', trigger: 'change' }],
        owner: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
        vendor: [
          {
            validator: (rule, value, callback) => {
              if (this.planForm.serviceType === '外委维保' && !value) callback(new Error('请填写维保单位'))
              else callback()
            },
            trigger: 'blur'
          }
        ]
      },
      recordRules: {
        deviceId: [{ required: true, message: '请选择消防设备', trigger: 'change' }],
        date: [{ required: true, message: '请选择维保时间', trigger: 'change' }],
        executor: [{ required: true, message: '请输入执行人', trigger: 'blur' }],
        company: [{ required: true, message: '请输入执行单位', trigger: 'blur' }],
        result: [{ required: true, message: '请选择维保结果', trigger: 'change' }],
        nextDate: [{ required: true, message: '请选择下次维保日期', trigger: 'change' }]
      }
    }
  },
  computed: {
    workspaceNav() {
      return [
        { key: 'overview', title: '维保总览', description: '分类、进度与到期', detail: '查看消防设备分类、本月维保进度和近期到期提醒。', icon: 'el-icon-data-analysis', count: null },
        { key: 'devices', title: '设备台账', description: '档案、位置与周期', detail: '管理消防设备编码、安装位置、责任人、维保周期和设备状态。', icon: 'el-icon-cpu', count: this.devices.length },
        { key: 'plans', title: '维保计划', description: '范围、频次与执行', detail: '编排设备维保范围、计划日期、执行单位、负责人和提醒周期。', icon: 'el-icon-date', count: this.plans.length },
        {
          key: 'records',
          title: '维保记录',
          description: '检查、凭证与结论',
          detail: '登记检查项目、现场图片视频、维保结果、费用和下次维保日期。',
          icon: 'el-icon-document-checked',
          count: this.records.length
        },
        {
          key: 'reminders',
          title: '到期提醒',
          description: '即将到期与逾期',
          detail: '集中处理即将到期、今日到期和已经逾期的消防设备维保任务。',
          icon: 'el-icon-alarm-clock',
          count: this.reminders.length,
          danger: this.reminders.some((item) => item.overdueDays >= 0)
        }
      ]
    },
    currentWorkspace() {
      return this.workspaceNav.find((item) => item.key === this.activeTab) || this.workspaceNav[0]
    },
    categories() {
      return this.dataSet.categories.map((item) => item.name)
    },
    buildings() {
      return ['A栋研发楼', 'B栋生产楼', '综合服务中心', '物流仓储', '宿舍1号楼', '园区室外']
    },
    deviceStatuses() {
      return [...new Set(this.devices.map((item) => item.status))]
    },
    filteredDevices() {
      const keyword = this.deviceKeyword.toLowerCase()
      return this.devices.filter(
        (item) =>
          (!keyword || [item.id, item.name, item.building, item.floor, item.location].join(' ').toLowerCase().includes(keyword)) &&
          (!this.deviceCategory || item.category === this.deviceCategory) &&
          (!this.deviceStatus || item.status === this.deviceStatus)
      )
    },
    pagedDevices() {
      const start = (this.devicePage - 1) * 6
      return this.filteredDevices.slice(start, start + 6)
    },
    filteredPlans() {
      const keyword = this.planKeyword.toLowerCase()
      return this.plans.filter((item) => (!keyword || [item.id, item.name, item.scope].join(' ').toLowerCase().includes(keyword)) && (!this.planStatus || item.status === this.planStatus))
    },
    pagedPlans() {
      const start = (this.planPage - 1) * 6
      return this.filteredPlans.slice(start, start + 6)
    },
    filteredRecords() {
      const keyword = this.recordKeyword.toLowerCase()
      return this.records.filter(
        (item) =>
          (!keyword || [item.id, item.device, item.executor, item.company].join(' ').toLowerCase().includes(keyword)) &&
          (!this.recordResult || item.result === this.recordResult) &&
          (!this.recordDate || item.date.indexOf(this.recordDate) === 0)
      )
    },
    pagedRecords() {
      const start = (this.recordPage - 1) * 6
      return this.filteredRecords.slice(start, start + 6)
    },
    pagedReminders() {
      const start = (this.reminderPage - 1) * 6
      return this.filteredReminders.slice(start, start + 6)
    },
    filteredReminders() {
      const keyword = this.reminderKeyword.toLowerCase()
      if (!keyword) return this.reminders
      return this.reminders.filter((item) => [item.deviceId, item.device, item.category, item.location, item.owner, item.plan, item.status, item.dueDate].join(' ').toLowerCase().includes(keyword))
    },
    recordDevice() {
      return this.devices.find((item) => item.id === this.recordForm.deviceId) || null
    },
    recordChecklist() {
      return this.recordDevice ? this.dataSet.checkTemplates[this.recordDevice.category] || [] : []
    },
    planChecklist() {
      const list = []
      this.planForm.categories &&
        this.planForm.categories.forEach((category) =>
          (this.dataSet.checkTemplates[category] || []).forEach((item) => {
            if (!list.includes(item)) list.push(item)
          })
        )
      return list.slice(0, 10)
    },
    deviceHistory() {
      if (!this.currentRecord || this.drawerMode !== 'device') return []
      return this.records.filter((item) => item.deviceId === this.currentRecord.id)
    }
  },
  watch: {
    deviceKeyword() {
      this.devicePage = 1
    },
    deviceCategory() {
      this.devicePage = 1
    },
    deviceStatus() {
      this.devicePage = 1
    },
    planKeyword() {
      this.planPage = 1
    },
    planStatus() {
      this.planPage = 1
    },
    recordKeyword() {
      this.recordPage = 1
    },
    recordResult() {
      this.recordPage = 1
    },
    recordDate() {
      this.recordPage = 1
    },
    reminderKeyword() {
      this.reminderPage = 1
    }
  },
  created() {
    this.resetDeviceForm()
    this.resetPlanForm()
    this.resetRecordForm()
  },
  methods: {
    openWorkspace(view) {
      if (!this.workspaceNav.some((item) => item.key === view)) return
      this.activeTab = view
      this.handleWorkspaceChange()
    },
    handleWorkspaceChange() {
      this.$nextTick(() => {
        const content = this.$refs.workspaceContent
        if (content && typeof content.focus === 'function') content.focus({ preventScroll: true })
      })
    },
    statusClass(status) {
      if (/逾期|故障/.test(status)) return 'danger'
      if (/即将|今日|执行中/.test(status)) return 'warning'
      if (/完成|正常/.test(status)) return 'success'
      return 'info'
    },
    resultClass(result) {
      if (result === '合格') return 'success'
      if (result === '需维修') return 'warning'
      return 'danger'
    },
    planProgress(row) {
      return row.devices ? Math.round((row.completed / row.devices) * 100) : 0
    },
    resetDeviceForm() {
      this.deviceForm = {
        editingId: '',
        id: '',
        name: '',
        category: '',
        building: '',
        floor: '1F',
        location: '',
        brand: '',
        model: '',
        installDate: '2026-07-20',
        cycle: 3,
        lastDate: '-',
        nextDate: '2026-10-20',
        owner: '',
        department: '园区工程部',
        status: '正常',
        qrCode: ''
      }
    },
    resetPlanForm() {
      this.planForm = { editingId: '', name: '', building: [], categories: [], frequency: '每3个月', plannedDate: '2026-07-25', serviceType: '内部维保', vendor: '', owner: '', advanceDays: 7 }
    },
    resetRecordForm() {
      this.recordForm = {
        deviceId: '',
        type: '定期维保',
        date: '2026-07-20 10:30',
        executor: '',
        company: '园区工程部',
        checkedItems: [],
        result: '合格',
        issue: '',
        parts: '',
        cost: 0,
        nextDate: '2026-10-20',
        photos: []
      }
    },
    openDeviceDialog(row) {
      this.resetDeviceForm()
      if (row) this.deviceForm = { ...JSON.parse(JSON.stringify(row)), editingId: row.id }
      this.deviceDialog = true
      this.$nextTick(() => this.$refs.deviceForm && this.$refs.deviceForm.clearValidate())
    },
    openPlanDialog(row) {
      this.resetPlanForm()
      if (row) {
        const building = row.scope.split(' · ')[0]
        const categoryPart = row.scope.split(' · ')[1] || ''
        this.planForm = {
          editingId: row.id,
          name: row.name,
          building: building === '全园区' ? this.buildings.slice() : [building],
          categories: categoryPart.split('/').filter(Boolean),
          frequency: row.frequency,
          plannedDate: row.plannedDate,
          serviceType: row.serviceType,
          vendor: row.vendor === '-' ? '' : row.vendor,
          owner: row.owner,
          advanceDays: row.advanceDays
        }
      }
      this.planDialog = true
      this.$nextTick(() => this.$refs.planForm && this.$refs.planForm.clearValidate())
    },
    openRecordDialog(device) {
      this.resetRecordForm()
      if (device) {
        this.recordForm.deviceId = device.id
        this.onRecordDeviceChange(device.id)
      }
      this.recordDialog = true
      this.$nextTick(() => this.$refs.recordForm && this.$refs.recordForm.clearValidate())
    },
    openReminder(item) {
      const device = this.devices.find((row) => row.id === item.deviceId)
      this.openRecordDialog(device)
      this.recordForm.type = item.overdueDays > 0 ? '逾期补检' : '定期维保'
    },
    openDeviceDetail(row) {
      this.drawerMode = 'device'
      this.currentRecord = row
      this.drawerVisible = true
    },
    openRecordDetail(row) {
      this.drawerMode = 'record'
      this.currentRecord = row
      this.drawerVisible = true
    },
    openRecordFromDrawer() {
      const device = this.currentRecord
      this.drawerVisible = false
      this.openRecordDialog(device)
    },
    onRecordDeviceChange() {
      this.recordForm.checkedItems = []
      const device = this.recordDevice
      if (!device) return
      this.recordForm.executor = device.owner
      this.recordForm.company = device.department
      const nextDate = new Date(2026, 6, 20)
      nextDate.setMonth(nextDate.getMonth() + device.cycle)
      const year = nextDate.getFullYear()
      const month = String(nextDate.getMonth() + 1).padStart(2, '0')
      const day = String(nextDate.getDate()).padStart(2, '0')
      this.recordForm.nextDate = `${year}-${month}-${day}`
    },
    saveDevice() {
      this.$refs.deviceForm.validate((valid) => {
        if (!valid) return
        const payload = { ...JSON.parse(JSON.stringify(this.deviceForm)), qrCode: this.deviceForm.qrCode || 'QR-' + this.deviceForm.id }
        delete payload.editingId
        if (this.deviceForm.editingId) {
          const index = this.devices.findIndex((item) => item.id === this.deviceForm.editingId)
          this.$set(this.devices, index, payload)
        } else this.devices.unshift(payload)
        this.deviceDialog = false
        this.$message.success('消防设备档案已保存')
      })
    },
    savePlan() {
      this.$refs.planForm.validate((valid) => {
        if (!valid) return
        const payload = {
          id: this.planForm.editingId || 'MP202607' + String(this.plans.length + 1).padStart(2, '0'),
          name: this.planForm.name,
          scope: (this.planForm.building.length === this.buildings.length ? '全园区' : this.planForm.building.join('、')) + ' · ' + this.planForm.categories.join('/'),
          frequency: this.planForm.frequency,
          plannedDate: this.planForm.plannedDate,
          devices: this.devices.filter((item) => this.planForm.building.includes(item.building) && this.planForm.categories.includes(item.category)).length,
          completed: 0,
          serviceType: this.planForm.serviceType,
          vendor: this.planForm.vendor || '-',
          owner: this.planForm.owner,
          advanceDays: this.planForm.advanceDays,
          status: '待执行'
        }
        if (this.planForm.editingId) {
          const index = this.plans.findIndex((item) => item.id === this.planForm.editingId)
          payload.completed = this.plans[index].completed
          payload.status = this.plans[index].status
          this.$set(this.plans, index, payload)
        } else this.plans.unshift(payload)
        this.planDialog = false
        this.openWorkspace('plans')
        this.$message.success('维保计划已保存，相关设备任务已生成')
      })
    },
    executePlan(row) {
      const categoryText = row.scope.split(' · ')[1] || ''
      const device = this.devices.find((item) => categoryText.indexOf(item.category) > -1) || this.devices[0]
      this.openRecordDialog(device)
    },
    addEvidence() {
      const index = this.recordForm.photos.length + 1
      this.recordForm.photos.push(index === 3 ? `现场视频${index}.mp4` : `现场照片${index}.jpg`)
    },
    saveRecord() {
      this.$refs.recordForm.validate((valid) => {
        if (!valid) return
        if (this.recordForm.checkedItems.length !== this.recordChecklist.length) return this.$message.warning('请完成全部检查项目后再提交')
        if (!this.recordForm.photos.length) return this.$message.warning('请至少添加一项现场图片或视频凭证')
        if (this.recordForm.result !== '合格' && !this.recordForm.issue) return this.$message.warning('非合格结果必须填写问题说明')
        const device = this.recordDevice
        const record = {
          id: 'MR20260720' + String(this.records.length + 19).padStart(3, '0'),
          deviceId: device.id,
          device: device.name,
          category: device.category,
          date: this.recordForm.date,
          executor: this.recordForm.executor,
          company: this.recordForm.company,
          type: this.recordForm.type,
          content: this.recordForm.checkedItems.join('、'),
          result: this.recordForm.result,
          issue: this.recordForm.issue || '无',
          parts: this.recordForm.parts || '-',
          cost: this.recordForm.cost,
          nextDate: this.recordForm.nextDate,
          photos: this.recordForm.photos.slice(),
          traces: [
            { time: this.recordForm.date.slice(11), action: '开始维保登记', user: this.recordForm.executor, remark: '设备身份与台账信息已核对' },
            { time: '当前', action: '提交维保记录', user: this.recordForm.executor, remark: `完成${this.recordForm.checkedItems.length}项检查，结果：${this.recordForm.result}` }
          ]
        }
        this.records.unshift(record)
        device.lastDate = this.recordForm.date.slice(0, 10)
        device.nextDate = this.recordForm.nextDate
        device.status = this.recordForm.result === '合格' ? '正常' : '故障待修'
        this.reminders = this.reminders.filter((item) => item.deviceId !== device.id)
        this.recordDialog = false
        this.openWorkspace('records')
        this.$message.success('维保记录已提交，设备下次维保日期已更新')
      })
    },
    saveReminderRule() {
      this.reminderRuleDialog = false
      this.$message.success('维保到期提醒规则已保存')
    },
    simulatePrint() {
      this.$message.success('仿真环境：维保单已生成打印预览')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../components/iotWorkspacePage.scss';

.fire-maintenance-page {
  --iot-overview-height: clamp(500px, calc(100vh - 400px), 580px);
  --iot-overview-height: clamp(500px, calc(100dvh - 400px), 580px);
}
.fire-maintenance-page {
  --primary: #2f78d7;
  --green: #20a77a;
  --amber: #e79a27;
  --red: #e4545c;
  --text: #1e2c42;
  --muted: #8793a6;
  --line: #e5eaf1;
  min-height: 100%;
  padding: 16px;
  color: var(--text);
  background: #f4f7fb;
  box-sizing: border-box;
}
.fire-maintenance-page * {
  box-sizing: border-box;
}
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}
.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.title-row h2 {
  margin: 0;
  font-size: 22px;
  line-height: 30px;
}
.page-header p {
  margin: 3px 0 0;
  color: #7c899d;
  font-size: 12px;
}
.scope-badge {
  display: inline-flex;
  height: 24px;
  align-items: center;
  gap: 5px;
  padding: 0 9px;
  color: #177f5f;
  background: #e9f7f1;
  border: 1px solid #c8eadf;
  border-radius: 12px;
  font-size: 11px;
}
.toolbar,
.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
  margin-bottom: 12px;
}
.kpi-card {
  position: relative;
  min-height: 92px;
  padding: 14px 12px 12px 51px;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 7px;
  box-shadow: 0 2px 8px rgba(30, 49, 79, 0.035);
}
.kpi-icon {
  position: absolute;
  left: 13px;
  top: 17px;
  display: flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  color: #2f78d7;
  background: #edf4ff;
  border-radius: 8px;
  font-size: 16px;
}
.kpi-icon.green {
  color: #16946b;
  background: #e9f8f2;
}
.kpi-icon.orange {
  color: #dd891d;
  background: #fff4e5;
}
.kpi-icon.red {
  color: #df4b54;
  background: #ffedef;
}
.kpi-icon.cyan {
  color: #1095a1;
  background: #e9f8fa;
}
.kpi-icon.purple {
  color: #7257ce;
  background: #f2effd;
}
.kpi-label {
  color: #758198;
  font-size: 12px;
}
.kpi-number {
  margin-top: 3px;
  color: #17253b;
  font-size: 23px;
  line-height: 28px;
  font-weight: 700;
}
.kpi-number small {
  margin-left: 4px;
  color: #77849a;
  font-size: 11px;
  font-weight: 400;
}
.kpi-sub {
  margin-top: 2px;
  color: #99a3b3;
  font-size: 10px;
  white-space: nowrap;
}
.overview-grid {
  display: grid;
  grid-template-columns: minmax(320px, 1.05fr) minmax(340px, 1fr) minmax(430px, 1.3fr);
  min-height: var(--iot-overview-height);
  align-items: stretch;
  gap: 12px;
  margin-bottom: 12px;
}
.overview-grid > .surface {
  display: flex;
  min-height: 0;
  flex-direction: column;
}
.surface {
  min-width: 0;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 7px;
  box-shadow: 0 2px 9px rgba(30, 49, 79, 0.035);
}
.surface-head {
  display: flex;
  min-height: 58px;
  align-items: center;
  justify-content: space-between;
  padding: 9px 14px;
  border-bottom: 1px solid #edf1f5;
}
.surface-head h3,
.surface-head p {
  margin: 0;
}
.surface-head h3 {
  color: #26364d;
  font-size: 13px;
}
.surface-head h3 i {
  margin-right: 6px;
  color: var(--primary);
}
.surface-head p {
  margin-top: 3px;
  color: #98a2b2;
  font-size: 10px;
}
.head-note {
  color: #8996a9;
  font-size: 10px;
}
.category-list {
  display: flex;
  min-height: 0;
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: space-evenly;
  padding: 16px 16px 18px;
}
.category-row {
  margin-bottom: 12px;
}
.category-row:last-child {
  margin-bottom: 0;
}
.category-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #5c6a7f;
  font-size: 13px;
  line-height: 20px;
}
.category-meta span {
  display: flex;
  align-items: center;
}
.category-meta i {
  width: 8px;
  height: 8px;
  margin-right: 8px;
  border-radius: 2px;
}
.category-meta b {
  color: #34445c;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
.category-progress {
  height: 8px;
  overflow: hidden;
  background: #edf1f5;
  border-radius: 4px;
}
.category-progress i {
  display: block;
  height: 100%;
  border-radius: 3px;
}
.progress-layout {
  display: flex;
  min-height: 0;
  flex: 1 1 auto;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 26px;
  padding: 24px 22px 16px;
}
.progress-ring {
  position: relative;
  display: flex;
  width: 200px;
  height: 200px;
  flex: 0 0 200px;
  align-items: center;
  justify-content: center;
  background: conic-gradient(#2f78d7 0 81.3%, #e8eef6 81.3% 100%);
  border-radius: 50%;
  box-shadow: 0 12px 28px rgba(47, 120, 215, 0.13);
}
.progress-ring::before {
  position: absolute;
  width: 154px;
  height: 154px;
  background: #fff;
  border-radius: 50%;
  content: '';
}
.progress-ring div {
  position: relative;
  z-index: 1;
  text-align: center;
}
.progress-ring strong,
.progress-ring span {
  display: block;
}
.progress-ring strong {
  color: #254267;
  font-size: 34px;
  line-height: 42px;
  font-variant-numeric: tabular-nums;
}
.progress-ring span {
  margin-top: 4px;
  color: #8b97a9;
  font-size: 12px;
  line-height: 18px;
}
.progress-stats {
  display: grid;
  width: 100%;
  order: -1;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.progress-stats > div {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  margin: 0;
  padding: 0 8px;
  color: #68768a;
  font-size: 13px;
  line-height: 20px;
  border-right: 1px solid #edf1f6;
}
.progress-stats > div:last-child {
  border-right: 0;
}
.progress-stats strong {
  color: #2a3d58;
  font-size: 22px;
  line-height: 28px;
  font-variant-numeric: tabular-nums;
}
.progress-stats small {
  margin-left: 4px;
  color: #8a96a8;
  font-size: 12px;
  font-weight: 400;
}
.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 7px;
  border-radius: 50%;
}
.dot.completed {
  background: #2f78d7;
}
.dot.pending {
  background: #b7c3d1;
}
.dot.overdue {
  background: #e4545c;
}
.month-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 0 14px 12px;
  padding: 12px 9px;
  background: #f7f9fc;
  border-radius: 5px;
}
.month-summary span {
  color: #8a96a8;
  text-align: center;
  font-size: 12px;
  line-height: 18px;
}
.month-summary b {
  display: block;
  margin-top: 4px;
  color: #3f5067;
  font-size: 14px;
  line-height: 20px;
  font-variant-numeric: tabular-nums;
}
.reminder-list {
  min-height: 0;
  flex: 1 1 auto;
  padding: 10px 14px 14px;
}
.reminder-item {
  display: flex;
  width: 100%;
  min-height: 58px;
  align-items: center;
  gap: 12px;
  padding: 10px 6px;
  color: inherit;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid #f0f2f6;
  cursor: pointer;
  transition: background 0.18s;
}
.reminder-item:hover {
  background: #f7faff;
}
.reminder-item:focus-visible {
  outline: 2px solid #409eff;
  outline-offset: -2px;
}
.date-box {
  display: flex;
  width: 46px;
  height: 42px;
  flex: 0 0 46px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: #f1f5fa;
  border-radius: 5px;
}
.date-box b {
  color: #486078;
  font-size: 16px;
  line-height: 18px;
  font-variant-numeric: tabular-nums;
}
.date-box small {
  color: #8e99a9;
  font-size: 11px !important;
  line-height: 15px !important;
}
.date-box.overdue {
  background: #ffebed;
}
.date-box.overdue b {
  color: #d9434c;
}
.date-box.today {
  background: #fff2df;
}
.date-box.today b {
  color: #db861d;
}
.date-box.upcoming {
  background: #edf4ff;
}
.date-box.upcoming b {
  color: #2f78d7;
}
.reminder-info {
  min-width: 0;
  flex: 1;
}
.reminder-info b,
.reminder-info small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.reminder-info b {
  color: #35455c;
  font-size: 13px;
  line-height: 20px;
}
.reminder-info small {
  margin-top: 4px;
  color: #929dae;
  font-size: 12px !important;
  line-height: 18px !important;
}
.fire-maintenance-page .reminder-status {
  flex: 0 0 auto;
  padding: 3px 8px;
  font-size: 12px !important;
  line-height: 18px;
  background: #fff7f7;
  border-radius: 10px;
}
.reminder-status.danger {
  color: #d94750;
}
.reminder-status.warning {
  color: #db891f;
  background: #fff8ec;
}
.ledger-card {
  padding: 0 14px 12px;
}
.ledger-card.workspace-detail > .iot-workspace-header {
  margin: 0 -14px;
}
::v-deep .ledger-card .el-tabs__header {
  margin-bottom: 12px;
}
::v-deep .ledger-card .el-tabs__item {
  height: 48px;
  line-height: 48px;
}
.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.tab-label b {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  color: #68758a;
  background: #edf1f5;
  border-radius: 9px;
  line-height: 18px;
  text-align: center;
  font-size: 9px;
}
.tab-label b.danger-count {
  color: #d7474f;
  background: #ffedef;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  min-height: 49px;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.toolbar-left,
.toolbar-right {
  min-height: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.toolbar-note {
  display: inline-flex;
  min-height: 32px;
  align-items: center;
  gap: 4px;
  color: #8995a7;
  font-size: 10px;
  line-height: 18px;
}
.toolbar-note i {
  color: #3c81d9;
}
::v-deep .toolbar .el-input__inner {
  height: 32px;
  line-height: 32px;
}
::v-deep .toolbar .el-button--small {
  display: inline-flex;
  height: 32px;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
::v-deep .toolbar .el-button--small span {
  display: inline-flex;
  align-items: center;
  line-height: 1;
}
.pagination-row {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
}
.status-pill,
.result-pill {
  display: inline-flex;
  height: 21px;
  align-items: center;
  padding: 0 8px;
  border-radius: 11px;
  white-space: nowrap;
}
.status-pill.success,
.result-pill.success {
  color: #158660;
  background: #e8f7f1;
}
.status-pill.warning,
.result-pill.warning {
  color: #d47b16;
  background: #fff2df;
}
.status-pill.danger,
.result-pill.danger {
  color: #dc414a;
  background: #ffebed;
}
.status-pill.info {
  color: #68758a;
  background: #edf1f5;
}
.evidence-link {
  color: #2f78d7;
  font-size: 10px;
}
.evidence-link i {
  margin-right: 4px;
}
.table-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}
::v-deep .table-progress .el-progress {
  flex: 1;
}
.table-progress span {
  width: 34px;
  color: #748198;
  font-size: 9px;
}
.reminder-tip {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 11px;
  padding: 10px 12px;
  color: #51708d;
  background: #f1f7fd;
  border: 1px solid #dcebf9;
  border-radius: 5px;
}
.reminder-tip > i {
  color: #2f78d7;
  font-size: 20px;
}
.reminder-tip > div {
  flex: 1;
}
.reminder-tip b,
.reminder-tip span {
  display: block;
}
.reminder-tip b {
  color: #315172;
  font-size: 11px;
}
.reminder-tip span {
  margin-top: 3px;
  font-size: 9px;
}
.urgency-mark {
  display: inline-flex;
  align-items: center;
  color: #d38520;
  font-size: 9px;
}
.urgency-mark i {
  width: 6px;
  height: 6px;
  margin-right: 5px;
  background: #e4a13e;
  border-radius: 50%;
}
.urgency-mark.danger {
  color: #db414a;
}
.urgency-mark.danger i {
  background: #e4545c;
}
.urgency-mark.today {
  color: #d77b17;
}
.urgency-mark.today i {
  background: #ec9b29;
}

::v-deep .maintenance-dialog .el-dialog__body {
  max-height: 66vh;
  padding: 18px 22px 8px;
  overflow-y: auto;
}
.dialog-intro {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
  padding: 10px 12px;
  color: #58718f;
  background: #f2f7fd;
  border-left: 3px solid #3c83dc;
  border-radius: 4px;
  font-size: 11px;
  line-height: 18px;
}
.dialog-intro i {
  margin-top: 2px;
  color: #3c83dc;
}
.form-section-title {
  margin: 14px 0 11px;
  color: #33445d;
  font-size: 12px;
  font-weight: 700;
}
.form-section-title::before {
  display: inline-block;
  width: 3px;
  height: 12px;
  margin-right: 6px;
  vertical-align: -2px;
  background: #3b80d8;
  border-radius: 2px;
  content: '';
}
.template-preview {
  display: flex;
  min-height: 55px;
  align-items: flex-start;
  gap: 6px;
  flex-wrap: wrap;
  padding: 9px;
  background: #f8fafc;
  border: 1px solid #e5eaf0;
  border-radius: 4px;
}
.template-preview span {
  padding: 3px 7px;
  color: #52708f;
  background: #eef5fd;
  border-radius: 10px;
  font-size: 9px;
}
.template-preview span i {
  margin-right: 3px;
  color: #279774;
}
.template-preview small {
  color: #9aa4b4;
}
.device-summary {
  clear: both;
  display: grid;
  grid-template-columns: minmax(120px, 0.8fr) minmax(0, 1.7fr) minmax(110px, 0.7fr);
  gap: 8px;
  width: calc(100% - 105px);
  min-width: 0;
  margin: 4px 0 16px 105px;
}
.device-summary span {
  min-width: 0;
  padding: 10px 12px;
  background: #f7f9fc;
  border: 1px solid #e9eef5;
  border-radius: 6px;
}
.device-summary small,
.device-summary b {
  display: block;
}
.device-summary small {
  color: #7d899b;
  font-size: 11px;
  line-height: 1.4;
}
.device-summary b {
  margin-top: 4px;
  color: #40516a;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.45;
  overflow-wrap: anywhere;
}
.checklist-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 0 0 14px 105px;
}
::v-deep .checklist-grid .el-checkbox {
  width: auto;
  margin: 0;
  padding: 8px 10px;
}
::v-deep .checklist-grid .el-checkbox.is-bordered + .el-checkbox.is-bordered {
  margin-left: 0;
}
::v-deep .checklist-grid .el-checkbox__label {
  padding-left: 6px;
  font-size: 10px;
}
.checklist-empty {
  margin: 0 0 14px 105px;
  padding: 18px;
  color: #9aa4b3;
  text-align: center;
  background: #f8fafc;
  border-radius: 4px;
  font-size: 10px;
}
.evidence-uploader {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}
.evidence-uploader > button {
  display: flex;
  width: 112px;
  height: 58px;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-direction: column;
  color: #5279a7;
  background: #f4f8fd;
  border: 1px dashed #a9c4e4;
  border-radius: 5px;
  cursor: pointer;
}
.evidence-uploader > button:hover {
  color: #2d72cc;
  border-color: #4385d7;
}
.evidence-uploader > button i {
  font-size: 17px;
}
.evidence-uploader > button span {
  font-size: 9px;
}
.evidence-chip {
  position: relative;
  display: flex;
  width: 112px;
  height: 58px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #5b6b80;
  background: #f7f9fc;
  border: 1px solid #e2e7ee;
  border-radius: 5px;
  font-size: 8px;
}
.evidence-chip > i {
  color: #3880d7;
  font-size: 16px;
}
.evidence-chip button {
  position: absolute;
  right: 2px;
  top: 2px;
  color: #8c98a8;
  background: transparent;
  border: 0;
  cursor: pointer;
}
.form-help {
  margin-top: 5px;
  color: #96a1b1;
  font-size: 9px;
}
.form-help.inline {
  margin-left: 8px;
}
.form-unit {
  margin-left: 6px;
  color: #7f8b9c;
  font-size: 10px;
}

::v-deep .maintenance-drawer .el-drawer__header {
  flex: 0 0 auto;
  margin: 0;
  padding: 17px 20px;
  border-bottom: 1px solid #e8edf3;
}
::v-deep .maintenance-drawer .el-drawer__title {
  color: #293b55;
  font-size: 16px;
  font-weight: 600;
}
::v-deep .maintenance-drawer .el-drawer__body {
  display: flex;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}
.drawer-scroll {
  min-height: 0;
  flex: 1;
  padding: 18px 20px;
  overflow-y: auto;
}
.drawer-actions {
  display: flex;
  flex: 0 0 auto;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  background: #fff;
  border-top: 1px solid #e8edf3;
}
::v-deep .maintenance-drawer .drawer-actions .el-button {
  min-width: 68px;
  font-size: 12px;
}
.drawer-hero {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 16px;
  padding: 14px;
  background: linear-gradient(135deg, #eff6ff, #f9fbfe);
  border: 1px solid #dce9f8;
  border-radius: 7px;
}
.hero-icon {
  display: flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #357ed8;
  border-radius: 8px;
  font-size: 18px;
}
.drawer-hero > div:nth-child(2) {
  min-width: 0;
  flex: 1;
}
.drawer-hero h3,
.drawer-hero p {
  margin: 0;
}
.drawer-hero h3 {
  overflow: hidden;
  color: #293b55;
  font-size: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.drawer-hero p {
  margin-top: 4px;
  color: #8c98a9;
  font-family: Consolas, monospace;
  font-size: 11px;
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid #e6ebf2;
  border-left: 1px solid #e6ebf2;
}
.detail-grid > div {
  min-height: 68px;
  padding: 10px 12px;
  border-right: 1px solid #e6ebf2;
  border-bottom: 1px solid #e6ebf2;
}
.detail-grid span,
.detail-grid b {
  display: block;
}
.detail-grid span {
  color: #98a2b2;
  font-size: 11px;
}
.detail-grid b {
  margin-top: 6px;
  color: #3e4f67;
  font-size: 12px;
  line-height: 18px;
}
.drawer-section-title {
  margin: 19px 0 10px;
  color: #34455e;
  font-size: 13px;
  font-weight: 700;
}
.drawer-section-title small {
  margin-left: 4px;
  color: #8d99aa;
  font-size: 11px;
  font-weight: 400;
}
.history-list button {
  display: flex;
  width: 100%;
  align-items: flex-start;
  gap: 9px;
  padding: 10px 5px;
  color: inherit;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid #edf0f4;
  cursor: pointer;
}
.history-list button:hover {
  background: #f7faff;
}
.history-mark {
  width: 9px;
  height: 9px;
  flex: 0 0 9px;
  margin-top: 3px;
  background: #25a87a;
  border-radius: 50%;
}
.history-mark.warning {
  background: #e99a25;
}
.history-mark.danger {
  background: #e4545c;
}
.history-list button > span {
  min-width: 0;
  flex: 1;
}
.history-list b,
.history-list small,
.history-list em {
  display: block;
}
.history-list b {
  color: #3a4b64;
  font-size: 12px;
}
.history-list small {
  margin-top: 3px;
  color: #929dac;
  font-size: 10px;
}
.history-list em {
  margin-top: 4px;
  overflow: hidden;
  color: #778497;
  font-size: 10px;
  font-style: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.history-list button > i:last-child {
  margin-top: 12px;
  color: #a5afbd;
}
.empty-history {
  padding: 26px;
  color: #99a3b2;
  text-align: center;
  background: #f8fafc;
  font-size: 11px;
}
.detail-description {
  margin: 0;
  padding: 10px 12px;
  color: #56667c;
  background: #f7f9fc;
  border-radius: 5px;
  font-size: 12px;
  line-height: 20px;
}
.detail-description.warning {
  color: #a65f12;
  background: #fff6e8;
}
.drawer-evidence {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
}
.drawer-evidence span {
  display: flex;
  min-width: 132px;
  height: 56px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #55708e;
  background: #f2f7fd;
  border: 1px solid #dce9f8;
  border-radius: 5px;
  font-size: 11px;
}
.drawer-evidence span i {
  color: #337dd5;
  font-size: 16px;
}
.trace-item {
  position: relative;
  display: flex;
  gap: 12px;
  margin-left: 5px;
  padding: 0 0 17px 16px;
  border-left: 1px solid #dce3ec;
}
.trace-item::before {
  position: absolute;
  left: -5px;
  top: 2px;
  width: 9px;
  height: 9px;
  background: #347ed8;
  border: 2px solid #fff;
  border-radius: 50%;
  content: '';
  box-shadow: 0 0 0 1px #bad0ec;
}
.trace-item > span {
  width: 38px;
  flex: 0 0 38px;
  color: #8f9aaa;
  font-size: 10px;
}
.trace-item b,
.trace-item small {
  display: block;
}
.trace-item b {
  color: #3b4d65;
  font-size: 12px;
}
.trace-item small {
  margin-top: 3px;
  color: #7f8b9c;
  font-size: 10px;
  line-height: 16px;
}
@media (max-width: 1280px) {
  .kpi-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .reminder-panel {
    grid-column: 1 / -1;
  }
  .reminder-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 12px;
  }
}
@media (min-width: 1281px) {
  .category-list {
    display: grid;
    grid-template-rows: repeat(6, minmax(58px, 1fr));
    justify-content: stretch;
  }
  .category-row {
    align-self: center;
    margin-bottom: 0;
  }
  .reminder-list {
    display: grid;
    grid-template-rows: repeat(5, minmax(64px, 1fr));
  }
  .reminder-item {
    min-height: 0;
  }
}
@media (max-width: 900px) {
  .fire-maintenance-page {
    padding: 12px;
  }
  .page-header {
    flex-direction: column;
  }
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .overview-grid {
    grid-template-columns: 1fr;
    min-height: 0;
  }
  .reminder-panel {
    grid-column: auto;
  }
  .reminder-list {
    display: block;
  }
  .checklist-grid {
    grid-template-columns: 1fr;
    margin-left: 0;
  }
  .device-summary {
    width: 100%;
    margin-left: 0;
  }
  .toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
