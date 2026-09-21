<template>
  <section class="attendance-report">
    <header class="page-header">
      <div>
        <h2>考勤报表</h2>
        <p>查看成员打卡明细、排班时间及异常情况</p>
      </div>
      <el-button icon="el-icon-download" :disabled="!filteredRecords.length" @click="handleExport">导出当前数据</el-button>
    </header>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filters" class="filter-form" @submit.native.prevent>
        <el-form-item label="日期范围">
          <el-date-picker v-model="filters.dateRange" type="daterange" value-format="yyyy-MM-dd" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :clearable="false" />
        </el-form-item>
        <el-form-item label="成员">
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
      <p v-if="!apiConfigured" class="api-hint">
        <i class="el-icon-info" />
        当前为页面预览数据；后端接口路径尚未配置，接入时只需填写本文件中的
        <code>ATTENDANCE_REPORT_API</code>
        。
      </p>
    </el-card>

    <div class="summary-grid" aria-label="考勤汇总">
      <div v-for="item in summaryCards" :key="item.key" class="summary-card" :class="item.key">
        <span class="summary-label">{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <span class="summary-unit">条</span>
      </div>
    </div>

    <el-card class="table-card" shadow="never">
      <div slot="header" class="table-heading">
        <div>
          <span class="table-title">打卡明细</span>
          <span class="table-count">共 {{ filteredRecords.length }} 条</span>
        </div>
        <el-tooltip content="数据字段兼容企业微信 checkindata 返回结构" placement="top">
          <i class="el-icon-question help-icon" aria-label="字段说明" />
        </el-tooltip>
      </div>

      <el-table v-loading="loading" :data="pagedRecords" border stripe row-key="record_id" empty-text="暂无符合条件的打卡记录" :default-sort="{ prop: 'checkin_time', order: 'descending' }">
        <el-table-column label="成员" min-width="160">
          <template slot-scope="scope">
            <div class="member-cell">
              <span class="member-name">{{ scope.row.user_name || scope.row.userid }}</span>
              <span class="member-id">{{ scope.row.userid }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="groupname" label="考勤组" min-width="130" show-overflow-tooltip />
        <el-table-column prop="checkin_type" label="打卡类型" width="100">
          <template slot-scope="scope">{{ checkinTypeText(scope.row.checkin_type) }}</template>
        </el-table-column>
        <el-table-column prop="checkin_time" label="实际打卡时间" min-width="165" sortable>
          <template slot-scope="scope">{{ formatTime(scope.row.checkin_time) }}</template>
        </el-table-column>
        <el-table-column prop="sch_checkin_time" label="应打卡时间" min-width="165">
          <template slot-scope="scope">{{ formatTime(scope.row.sch_checkin_time) }}</template>
        </el-table-column>
        <el-table-column prop="exception_type" label="考勤结果" width="105">
          <template slot-scope="scope">
            <el-tag size="mini" :type="exceptionTagType(scope.row.exception_type)">{{ exceptionText(scope.row.exception_type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="打卡地点" min-width="220" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ locationText(scope.row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="150" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.notes || '—' }}</template>
        </el-table-column>
        <el-table-column type="expand" width="52">
          <template slot-scope="scope">
            <div class="record-detail">
              <span>
                <b>考勤组 ID：</b>
                {{ scope.row.groupid || '—' }}
              </span>
              <span>
                <b>排班 ID：</b>
                {{ scope.row.schedule_id || '—' }}
              </span>
              <span>
                <b>Wi-Fi：</b>
                {{ scope.row.wifiname || '—' }}
              </span>
              <span>
                <b>媒体附件：</b>
                {{ mediaCount(scope.row) }} 个
              </span>
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
import axios from '@/plugins/axios'

// 企业微信月度考勤数据查询接口
const ATTENDANCE_REPORT_API = '/api/qywechat/checkin/monthdata'

const exceptionOptions = [
  { value: 'normal', label: '正常' },
  { value: 'late', label: '迟到' },
  { value: 'early', label: '早退' },
  { value: 'missingcard', label: '缺卡' },
  { value: 'outside_loc', label: '外勤打卡' },
  { value: 'not_signed_in', label: '未打卡' }
]

export default {
  name: 'AttendanceReport',
  data() {
    return {
      loading: false,
      apiConfigured: Boolean(ATTENDANCE_REPORT_API),
      filters: {
        dateRange: this.currentMonthRange(),
        keyword: '',
        exceptionType: ''
      },
      records: this.createPreviewRecords(),
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
      const dateRange = this.filters.dateRange || []
      return this.records.filter((item) => {
        const date = this.formatTime(item.checkin_time, 'date')
        const matchesDate = !dateRange.length || (date >= dateRange[0] && date <= dateRange[1])
        const matchesKeyword =
          !keyword ||
          [item.user_name, item.userid].some((value) =>
            String(value || '')
              .toLowerCase()
              .includes(keyword)
          )
        const matchesException = !this.filters.exceptionType || item.exception_type === this.filters.exceptionType
        return matchesDate && matchesKeyword && matchesException
      })
    },
    pagedRecords() {
      const start = (this.pagination.page - 1) * this.pagination.size
      return this.filteredRecords.slice(start, start + this.pagination.size)
    },
    summaryCards() {
      return [
        { key: 'total', label: '打卡总数', value: this.filteredRecords.length },
        { key: 'normal', label: '正常打卡', value: this.filteredRecords.filter((item) => item.exception_type === 'normal').length },
        { key: 'warning', label: '异常打卡', value: this.filteredRecords.filter((item) => !['normal', 'outside_loc'].includes(item.exception_type)).length },
        { key: 'outside', label: '外勤打卡', value: this.filteredRecords.filter((item) => item.exception_type === 'outside_loc').length }
      ]
    }
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
      if (!ATTENDANCE_REPORT_API) {
        return
      }
      this.loading = true
      try {
        const response = await axios.post(ATTENDANCE_REPORT_API, {
          startdate: this.filters.dateRange[0],
          enddate: this.filters.dateRange[1],
          userid: this.filters.keyword || undefined
        })
        this.records = this.normalizeRecords(response)
      } catch (error) {
        this.$message.error('考勤数据加载失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },
    normalizeRecords(response) {
      const payload = response && response.data ? response.data : response
      const records = payload.checkindata || (payload.data && payload.data.checkindata) || []
      return Array.isArray(records) ? records : []
    },
    handleReset() {
      this.filters = { dateRange: this.currentMonthRange(), keyword: '', exceptionType: '' }
      this.pagination.page = 1
    },
    handlePageSizeChange() {
      this.pagination.page = 1
    },
    checkinTypeText(value) {
      const map = { 上午上班: '上班', 下午下班: '下班' }
      return map[value] || value || '—'
    },
    exceptionText(value) {
      return (this.exceptionOptions.find((item) => item.value === value) || {}).label || value || '—'
    },
    exceptionTagType(value) {
      const map = { normal: 'success', late: 'warning', early: 'warning', missingcard: 'danger', not_signed_in: 'danger', outside_loc: 'info' }
      return map[value] || 'info'
    },
    formatTime(timestamp, mode) {
      if (!timestamp) return '—'
      const date = new Date(Number(timestamp) * 1000)
      const format = (value) => String(value).padStart(2, '0')
      const day = `${date.getFullYear()}-${format(date.getMonth() + 1)}-${format(date.getDate())}`
      return mode === 'date' ? day : `${day} ${format(date.getHours())}:${format(date.getMinutes())}`
    },
    locationText(record) {
      return [record.location_title, record.location_detail].filter(Boolean).join(' · ') || '—'
    },
    mediaCount(record) {
      return (record.mediaids || record.imgs || []).length
    },
    handleExport() {
      this.$message.info('导出功能待后端接口提供后接入')
    }
  }
}
</script>

<style lang="scss" scoped>
.attendance-report {
  min-height: 100%;
  padding: 20px;
  background: #f5f7fa;
}

.page-header,
.table-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-header {
  margin-bottom: 16px;

  h2 {
    margin: 0 0 6px;
    color: #303133;
    font-size: 20px;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: #909399;
    font-size: 13px;
  }
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

.api-hint {
  margin: 14px 0 0;
  color: #909399;
  font-size: 12px;

  i {
    color: #409eff;
  }

  code {
    padding: 1px 4px;
    color: #606266;
    background: #f4f4f5;
    border-radius: 2px;
  }
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.summary-card {
  position: relative;
  padding: 18px 20px;
  overflow: hidden;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 6%);

  &::before {
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    content: '';
    background: #409eff;
  }

  &.normal::before {
    background: #67c23a;
  }

  &.warning::before {
    background: #e6a23c;
  }

  &.outside::before {
    background: #909399;
  }
}

.summary-label,
.summary-unit {
  color: #909399;
  font-size: 13px;
}

.summary-card strong {
  margin: 0 6px 0 10px;
  color: #303133;
  font-size: 26px;
  font-weight: 600;
}

.table-title {
  color: #303133;
  font-weight: 600;
}

.table-count {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}

.help-icon {
  color: #909399;
  cursor: help;
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

.record-detail {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 24px;
  padding: 8px 18px;
  color: #606266;
  font-size: 13px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

@media screen and (max-width: 960px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media screen and (max-width: 640px) {
  .attendance-report {
    padding: 12px;
  }

  .page-header {
    align-items: flex-start;
    gap: 12px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .filter-form .el-input,
  .filter-form .el-select {
    width: 100%;
  }

  .record-detail {
    grid-template-columns: 1fr;
  }
}
</style>
