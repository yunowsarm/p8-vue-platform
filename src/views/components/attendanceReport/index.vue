<template>
  <section class="attendance-report">
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filters" class="filter-form" @submit.native.prevent>
        <el-form-item label="日期范围">
          <el-date-picker v-model="filters.dateRange" type="daterange" value-format="yyyy-MM-dd" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :clearable="false" />
        </el-form-item>
        <el-form-item label="表内搜索">
          <el-input v-model.trim="filters.keyword" clearable placeholder="姓名或 UserID" @keyup.enter.native="handleSearch" />
        </el-form-item>
        <el-form-item label="考勤状态">
          <el-select v-model="filters.exceptionType" clearable placeholder="全部状态">
            <el-option v-for="item in exceptionOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" :loading="loading" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table v-loading="loading" :data="pagedRecords" border stripe row-key="record_id" empty-text="暂无符合条件的月度考勤数据">
        <el-table-column label="成员" min-width="160">
          <template slot-scope="scope">
            <div class="member-cell">
              <span class="member-name">{{ scope.row.user_name || scope.row.userid }}</span>
              <span class="member-id">{{ scope.row.userid }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="departments" label="部门" min-width="230" show-overflow-tooltip />
        <el-table-column prop="groupname" label="考勤组" min-width="150" show-overflow-tooltip />
        <el-table-column label="正常 / 应出勤" width="125" align="center">
          <template slot-scope="scope">
            <span class="attendance-days">
              <strong>{{ scope.row.regular_days }}</strong>
              / {{ scope.row.work_days }} 天
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="except_days" label="异常天数" width="90" align="center">
          <template slot-scope="scope">
            <el-tag size="mini" :type="scope.row.except_days ? 'warning' : 'success'">{{ scope.row.except_days }} 天</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="实际 / 标准工时" min-width="180" align="center">
          <template slot-scope="scope">
            <div class="work-hours">
              <span>{{ formatDuration(scope.row.regular_work_sec) }} / {{ formatDuration(scope.row.standard_work_sec) }}</span>
              <small :class="workHourDifference(scope.row).type">{{ workHourDifference(scope.row).text }}</small>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="异常情况" min-width="210">
          <template slot-scope="scope">
            <span v-if="!scope.row.exception_infos.length" class="empty-value">无异常</span>
            <el-tag v-for="item in scope.row.exception_infos" v-else :key="item.exception" size="mini" type="warning" class="exception-tag">
              {{ exceptionText(item.exception) }} {{ item.count }} 次
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="假勤 / 补卡" min-width="180" show-overflow-tooltip>
          <template slot-scope="scope">{{ specialItemText(scope.row.sp_items) }}</template>
        </el-table-column>
        <el-table-column type="expand" label="明细" width="72">
          <template slot-scope="scope">
            <div class="attendance-detail">
              <div class="attendance-equation">
                <span>
                  应出勤
                  <strong>{{ scope.row.work_days }}</strong>
                  天
                </span>
                <i>=</i>
                <span>
                  正常出勤
                  <strong>{{ scope.row.regular_days }}</strong>
                  天
                </span>
                <i>+</i>
                <span>
                  异常
                  <strong class="warning-text">{{ scope.row.except_days }}</strong>
                  天
                </span>
                <span class="rest-days">
                  休息日
                  <strong>{{ scope.row.rest_days }}</strong>
                  天
                </span>
              </div>

              <div class="detail-columns">
                <section class="detail-section">
                  <h4>异常明细</h4>
                  <p v-if="!scope.row.exception_infos.length" class="empty-value">本月无考勤异常</p>
                  <div v-for="item in scope.row.exception_infos" v-else :key="item.exception" class="detail-item">
                    <strong>{{ exceptionText(item.exception) }}</strong>
                    <span>{{ item.count }} 次</span>
                    <span v-if="shouldShowExceptionDuration(item)">累计 {{ formatDuration(item.duration) }}</span>
                  </div>
                </section>

                <section class="detail-section">
                  <h4>假勤及补卡</h4>
                  <p v-if="!activeSpecialItems(scope.row.sp_items).length" class="empty-value">本月无请假、补卡、出差或外出</p>
                  <div v-for="item in activeSpecialItems(scope.row.sp_items)" v-else :key="`${item.type}-${item.vacation_id}`" class="detail-item">
                    <strong>{{ item.name }}</strong>
                    <span>{{ specialItemValue(item) }}</span>
                  </div>
                </section>

                <section class="detail-section">
                  <h4>加班情况</h4>
                  <p v-if="!overworkItems(scope.row).length" class="empty-value">本月无加班记录</p>
                  <div v-for="item in overworkItems(scope.row)" v-else :key="item.label" class="detail-item">
                    <strong>{{ item.label }}</strong>
                    <span>{{ item.value }}</span>
                  </div>
                </section>
              </div>

              <div class="detail-meta">
                <span>考勤类型：{{ recordTypeText(scope.row.record_type) }}</span>
                <span>员工 ID：{{ scope.row.userid || '—' }}</span>
                <span>考勤组 ID：{{ scope.row.groupid || '—' }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="filteredRecords.length"
        class="pagination"
        background
        layout="total, sizes, prev, pager, next"
        :current-page.sync="pagination.page"
        :page-sizes="[10, 20, 50]"
        :page-size.sync="pagination.size"
        :total="filteredRecords.length"
        @size-change="handlePageSizeChange" />
    </el-card>
  </section>
</template>

<script>
const exceptionOptions = [
  { value: 'normal', label: '无异常' },
  { value: 'exception', label: '存在异常' }
]

// 后端联调阶段使用的企业微信成员 UserID。
const TEST_USER_IDS = ['100124', '100003', '000235', '100100', '000190', '000072', 'LN0013', '000266', '100144', '000013', '100161']

export default {
  name: 'AttendanceReport',
  data() {
    return {
      loading: false,
      filters: {
        dateRange: this.currentMonthRange(),
        keyword: '',
        exceptionType: ''
      },
      records: [],
      pagination: {
        page: 1,
        size: 10
      },
      exceptionOptions
    }
  },
  computed: {
    filteredRecords() {
      const keyword = this.filters.keyword.toLowerCase()
      return this.records.filter((item) => {
        const matchesKeyword =
          !keyword ||
          [item.user_name, item.userid].some((value) =>
            String(value || '')
              .toLowerCase()
              .includes(keyword)
          )
        const hasException = Number(item.except_days || 0) > 0 || item.exception_infos.length > 0
        const matchesException = !this.filters.exceptionType || (this.filters.exceptionType === 'exception' ? hasException : !hasException)
        return matchesKeyword && matchesException
      })
    },
    pagedRecords() {
      const start = (this.pagination.page - 1) * this.pagination.size
      return this.filteredRecords.slice(start, start + this.pagination.size)
    }
  },
  mounted() {
    this.handleSearch()
  },
  methods: {
    currentMonthRange() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const lastDay = new Date(year, now.getMonth() + 1, 0).getDate()
      return [`${year}-${month}-01`, `${year}-${month}-${lastDay}`]
    },
    createPreviewRecords() {
      const base = new Date()
      base.setDate(Math.min(18, new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate()))
      const timestamp = (hour, minute) => Math.floor(new Date(base.getFullYear(), base.getMonth(), base.getDate(), hour, minute).getTime() / 1000)
      return [
        {
          record_id: 'preview-1',
          userid: 'zhangsan',
          user_name: '张三',
          groupname: '总部标准班',
          groupid: 'group-001',
          checkin_type: '上午上班',
          exception_type: 'normal',
          checkin_time: timestamp(8, 55),
          sch_checkin_time: timestamp(9, 0),
          location_title: '总部办公区',
          location_detail: 'A 座 12 层',
          schedule_id: 'schedule-001',
          wifiname: 'P8-Office',
          notes: ''
        },
        {
          record_id: 'preview-2',
          userid: 'zhangsan',
          user_name: '张三',
          groupname: '总部标准班',
          groupid: 'group-001',
          checkin_type: '下午下班',
          exception_type: 'normal',
          checkin_time: timestamp(18, 3),
          sch_checkin_time: timestamp(18, 0),
          location_title: '总部办公区',
          location_detail: 'A 座 12 层',
          schedule_id: 'schedule-001',
          wifiname: 'P8-Office',
          notes: ''
        },
        {
          record_id: 'preview-3',
          userid: 'lisi',
          user_name: '李四',
          groupname: '总部标准班',
          groupid: 'group-001',
          checkin_type: '上午上班',
          exception_type: 'late',
          checkin_time: timestamp(9, 18),
          sch_checkin_time: timestamp(9, 0),
          location_title: '总部办公区',
          location_detail: 'A 座 12 层',
          schedule_id: 'schedule-001',
          wifiname: 'P8-Office',
          notes: '交通拥堵'
        },
        {
          record_id: 'preview-4',
          userid: 'wangwu',
          user_name: '王五',
          groupname: '销售弹性班',
          groupid: 'group-002',
          checkin_type: '上午上班',
          exception_type: 'outside_loc',
          checkin_time: timestamp(8, 47),
          sch_checkin_time: timestamp(9, 0),
          location_title: '客户现场',
          location_detail: '高新区科技路 88 号',
          schedule_id: 'schedule-002',
          wifiname: '',
          notes: '拜访客户',
          mediaids: ['media-001']
        },
        {
          record_id: 'preview-5',
          userid: 'zhaoliu',
          user_name: '赵六',
          groupname: '总部标准班',
          groupid: 'group-001',
          checkin_type: '下午下班',
          exception_type: 'early',
          checkin_time: timestamp(17, 35),
          sch_checkin_time: timestamp(18, 0),
          location_title: '总部办公区',
          location_detail: 'A 座 12 层',
          schedule_id: 'schedule-001',
          wifiname: 'P8-Office',
          notes: '外出办事'
        },
        {
          record_id: 'preview-6',
          userid: 'qianqi',
          user_name: '钱七',
          groupname: '总部标准班',
          groupid: 'group-001',
          checkin_type: '下午下班',
          exception_type: 'missingcard',
          checkin_time: 0,
          sch_checkin_time: timestamp(18, 0),
          location_title: '',
          location_detail: '',
          schedule_id: 'schedule-001',
          wifiname: '',
          notes: ''
        }
      ]
    },
    async handleSearch() {
      this.pagination.page = 1
      this.loading = true
      try {
        const response = await this.$api['qywechatCheckin.monthData']({
          useridlist: TEST_USER_IDS,
          starttime: this.toUnixTimestamp(this.filters.dateRange[0]),
          endtime: this.toUnixTimestamp(this.filters.dateRange[1])
        })
        if (response && response.errcode !== undefined && response.errcode !== 0) throw new Error(response.errmsg || '接口返回失败')
        this.records = this.normalizeRecords(response)
      } catch (error) {
        this.$message.error((error && error.message) || '考勤数据加载失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },
    normalizeRecords(response) {
      const payload = response && response.data ? response.data : response
      const records = payload.datas || (payload.data && payload.data.datas) || []
      if (!Array.isArray(records)) return []
      return records.map((item, index) => {
        const baseInfo = item.base_info || {}
        const summaryInfo = item.summary_info || {}
        const overworkInfo = item.overwork_info || {}
        const exceptionInfos = Array.isArray(item.exception_infos) ? item.exception_infos.filter((value) => Number(value.count || 0) > 0 || Number(value.duration || 0) > 0) : []
        return {
          record_id: baseInfo.acctid || index,
          record_type: baseInfo.record_type,
          user_name: baseInfo.name || baseInfo.name_ex || baseInfo.acctid,
          userid: baseInfo.acctid || '',
          departments: baseInfo.departs_name || '—',
          groupid: (baseInfo.rule_info || {}).groupid,
          groupname: (baseInfo.rule_info || {}).groupname || '—',
          work_days: summaryInfo.work_days || 0,
          regular_days: summaryInfo.regular_days || 0,
          rest_days: summaryInfo.rest_days || 0,
          except_days: summaryInfo.except_days || 0,
          regular_work_sec: summaryInfo.regular_work_sec || 0,
          standard_work_sec: summaryInfo.standard_work_sec || 0,
          exception_infos: exceptionInfos,
          exception_duration: exceptionInfos.reduce((total, value) => total + Number(value.duration || 0), 0),
          sp_items: Array.isArray(item.sp_items) ? item.sp_items : [],
          overwork_info: overworkInfo
        }
      })
    },
    toUnixTimestamp(dateString) {
      return Math.floor(new Date(`${dateString}T00:00:00`).getTime() / 1000)
    },
    handleReset() {
      this.filters = { dateRange: this.currentMonthRange(), keyword: '', exceptionType: '' }
      this.pagination.page = 1
    },
    handlePageSizeChange() {
      this.pagination.page = 1
    },
    exceptionText(value) {
      const labels = { 1: '迟到', 2: '早退', 3: '缺卡', 4: '旷工', 5: '地点异常', 6: '设备异常' }
      return labels[value] || `其他异常（类型 ${value}）`
    },
    shouldShowExceptionDuration(item) {
      return [1, 2, 4].includes(Number(item.exception)) && Number(item.duration || 0) > 0
    },
    recordTypeText(value) {
      const labels = { 1: '固定上下班', 2: '外出', 3: '按班次上下班', 4: '自由签到', 5: '加班', 7: '无规则' }
      return labels[value] || `其他类型（${value || '—'}）`
    },
    formatDuration(seconds) {
      const totalMinutes = Math.floor(Number(seconds || 0) / 60)
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      return minutes ? `${hours}小时${minutes}分` : `${hours}小时`
    },
    workHourDifference(record) {
      const difference = Number(record.regular_work_sec || 0) - Number(record.standard_work_sec || 0)
      if (difference === 0) return { text: '达到标准', type: 'normal' }
      return difference > 0 ? { text: `多 ${this.formatDuration(difference)}`, type: 'surplus' } : { text: `少 ${this.formatDuration(Math.abs(difference))}`, type: 'shortage' }
    },
    activeSpecialItems(items) {
      return (items || []).filter((item) => Number(item.count || 0) > 0 || Number(item.duration || 0) > 0)
    },
    specialItemText(items) {
      const values = this.activeSpecialItems(items).map((item) => this.formatSpecialItem(item))
      return values.length ? values.join('、') : '—'
    },
    formatSpecialItem(item) {
      return `${item.name} ${this.specialItemValue(item)}`
    },
    specialItemValue(item) {
      if ([2, 15, 100].includes(Number(item.type))) return `${item.count}次`
      const divisor = Number(item.time_type) === 0 ? 86400 : 3600
      const unit = Number(item.time_type) === 0 ? '天' : '小时'
      const amount = Number(item.duration || 0) / divisor
      return amount ? `${Number(amount.toFixed(2))}${unit}` : `${item.count}次`
    },
    overworkItems(record) {
      const info = record.overwork_info || {}
      const definitions = [
        { label: '工作日加班', total: 'workday_over_sec', vacation: 'workdays_over_as_vacation', money: 'workdays_over_as_money' },
        { label: '休息日加班', total: 'restdays_over_sec', vacation: 'restdays_over_as_vacation', money: 'restdays_over_as_money' },
        { label: '节假日加班', total: 'holidays_over_sec', vacation: 'holidays_over_as_vacation', money: 'holidays_over_as_money' }
      ]
      return definitions
        .filter((item) => Number(info[item.total] || 0) > 0 || Number(info[item.vacation] || 0) > 0 || Number(info[item.money] || 0) > 0)
        .map((item) => {
          const details = []
          if (Number(info[item.total] || 0) > 0) details.push(`共 ${this.formatDuration(info[item.total])}`)
          if (Number(info[item.vacation] || 0) > 0) details.push(`转调休 ${this.formatDuration(info[item.vacation])}`)
          if (Number(info[item.money] || 0) > 0) details.push(`计加班费 ${this.formatDuration(info[item.money])}`)
          return { label: item.label, value: details.join('，') }
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.attendance-report {
  box-sizing: border-box;
  min-height: 100%;
  padding: 20px;
  background: #f5f7fa;
}

.filter-card,
.table-card {
  margin-bottom: 16px;
  border: 0;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: -18px;

  .el-input,
  .el-select {
    width: 180px;
  }
}

.member-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.member-name {
  color: #303133;
}

.member-id {
  color: #909399;
  font-size: 12px;
}

.attendance-days strong {
  color: #303133;
  font-size: 15px;
}

.work-hours {
  display: flex;
  flex-direction: column;
  gap: 3px;

  small {
    font-size: 12px;

    &.normal,
    &.surplus {
      color: #67c23a;
    }

    &.shortage {
      color: #e6a23c;
    }
  }
}

.exception-tag {
  margin: 2px 4px 2px 0;
}

.empty-value {
  margin: 0;
  color: #909399;
}

.attendance-detail {
  padding: 4px 20px 2px;
  color: #606266;
}

.attendance-equation {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 0 14px;
  border-bottom: 1px solid #ebeef5;

  strong {
    color: #303133;
    font-size: 16px;
  }

  i {
    color: #c0c4cc;
    font-style: normal;
  }

  .warning-text {
    color: #e6a23c;
  }

  .rest-days {
    margin-left: auto;
    padding-left: 14px;
    border-left: 1px solid #ebeef5;
  }
}

.detail-columns {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  padding: 16px 0;
}

.detail-section {
  min-height: 76px;
  padding: 0 20px;
  border-right: 1px solid #ebeef5;

  &:first-child {
    padding-left: 0;
  }

  &:last-child {
    padding-right: 0;
    border-right: 0;
  }

  h4 {
    margin: 0 0 10px;
    color: #303133;
    font-size: 13px;
    font-weight: 600;
  }
}

.detail-item {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-bottom: 8px;
  font-size: 13px;

  strong {
    min-width: 64px;
    color: #606266;
    font-weight: 500;
  }
}

.detail-meta {
  display: flex;
  gap: 24px;
  padding-top: 10px;
  color: #909399;
  font-size: 12px;
  border-top: 1px solid #ebeef5;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

@media screen and (max-width: 640px) {
  .attendance-report {
    padding: 12px;
  }

  .filter-form .el-input,
  .filter-form .el-select {
    width: 100%;
  }

  .detail-columns {
    grid-template-columns: 1fr;
  }

  .detail-section {
    min-height: 0;
    padding: 12px 0;
    border-right: 0;
    border-bottom: 1px solid #ebeef5;

    &:last-child {
      border-bottom: 0;
    }
  }

  .attendance-equation,
  .detail-meta {
    flex-wrap: wrap;
    gap: 8px 14px;
  }

  .attendance-equation .rest-days {
    width: 100%;
    margin-left: 0;
    padding: 8px 0 0;
    border-top: 1px dashed #ebeef5;
    border-left: 0;
  }
}
</style>
