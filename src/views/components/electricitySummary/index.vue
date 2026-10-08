<template>
  <div class="electricity-summary">
    <div class="query-card">
      <div class="query-form">
        <el-date-picker
          v-model="query.monthRange"
          type="monthrange"
          value-format="yyyy-MM"
          range-separator="至"
          start-placeholder="开始月份"
          end-placeholder="结束月份"
          :clearable="false"
          class="month-range" />
        <el-button type="primary" :loading="loading" @click="search">查询</el-button>
      </div>
      <div class="view-actions" role="group" aria-label="数据展示方式">
        <el-tooltip content="数据视图" placement="bottom">
          <button type="button" class="view-action" :class="{ 'view-action--active': activeView === 'data' }" aria-label="数据视图" :aria-pressed="activeView === 'data'" @click="activeView = 'data'">
            <img src="./icons/data-view.svg" alt="" />
          </button>
        </el-tooltip>
        <el-tooltip content="数据分析" placement="bottom">
          <button
            type="button"
            class="view-action"
            :class="{ 'view-action--active': activeView === 'analysis' }"
            aria-label="数据分析"
            :aria-pressed="activeView === 'analysis'"
            @click="activeView = 'analysis'">
            <img src="./icons/data-analysis.svg" alt="" />
          </button>
        </el-tooltip>
      </div>
    </div>
    <div class="content" v-loading="loading">
      <keep-alive>
        <electricity-data-view v-if="activeView === 'data'" :rows="rows" :applied-query="appliedQuery" :loading="loading" />
        <electricity-analysis v-else :rows="rows" :room-list="roomList" :applied-query="appliedQuery" :loading="loading" />
      </keep-alive>
    </div>
  </div>
</template>

<script>
import ElectricityDataView from './ElectricityDataView.vue'
import ElectricityAnalysis from './ElectricityAnalysis.vue'

function responseRows(response) {
  if (Array.isArray(response)) return response
  if (response && Array.isArray(response.records)) return response.records
  if (response && Array.isArray(response.data)) return response.data
  return []
}

function rowMonth(row) {
  return String(row.month || '').slice(0, 7)
}

export default {
  name: 'ElectricitySummary',
  components: { ElectricityDataView, ElectricityAnalysis },
  data() {
    const now = new Date()
    const year = now.getFullYear()
    const currentMonth = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return {
      activeView: 'data',
      query: {
        monthRange: [`${year}-01`, currentMonth],
        roomIds: [],
        code: ''
      },
      appliedQuery: {
        dateStart: `${year}-01`,
        dateEnd: currentMonth,
        roomIds: [],
        code: ''
      },
      roomList: [],
      rows: [],
      loading: false,
      requestId: 0
    }
  },
  mounted() {
    this.loadRooms()
  },
  beforeDestroy() {
    this.requestId++
  },
  methods: {
    loadRooms() {
      const params = {
        sqlParam: {},
        reportId: 'a3321fd8d0bb50853a5005bd7e8fa4bd',
        reportParam: {},
        router: 'distributionRoomManagement',
        code: 'DistributionRoom',
        permissionVo: { router: 'distributionRoomManagement', resourceId: '' },
        page: { current: 1, size: '100', orders: [] }
      }
      this.$api['baseData.meterListSearch'](params)
        .then((response) => {
          this.roomList = response && Array.isArray(response.records) ? response.records : []
          this.query.roomIds = this.roomList.map((room) => room.ID)
          this.search()
        })
        .catch(() => this.$message.error('获取配电房失败'))
    },
    search() {
      const range = this.query.monthRange || []
      if (range.length !== 2) {
        this.$message.warning('请选择开始月份和结束月份')
        return
      }
      const code = String(this.query.code || '').trim()
      if (!code && !this.query.roomIds.length) {
        this.$message.warning('请选择配电房或输入电表编号')
        return
      }
      const payload = {
        dateStart: range[0],
        dateEnd: range[1]
      }
      if (code) payload.code = code
      else payload.roomIds = this.query.roomIds.slice()
      const requestId = ++this.requestId
      this.loading = true
      this.$api['baseData.searchByMonth'](payload)
        .then((response) => {
          if (requestId !== this.requestId) return
          this.appliedQuery = payload
          this.rows = responseRows(response)
            .slice()
            .sort((a, b) => {
              const monthCompare = rowMonth(b).localeCompare(rowMonth(a))
              return monthCompare || String(a.roomName || '').localeCompare(String(b.roomName || '')) || String(a.meterCode || '').localeCompare(String(b.meterCode || ''))
            })
        })
        .catch(() => {
          if (requestId !== this.requestId) return
          this.rows = []
          this.$message.error('获取用电分析数据失败')
        })
        .finally(() => {
          if (requestId === this.requestId) this.loading = false
        })
    },
    handleCodeInput(value) {
      if (String(value || '').trim()) {
        this.query.roomIds = []
      } else if (!this.query.roomIds.length) {
        this.query.roomIds = this.roomList.map((room) => room.ID)
      }
    },
    handleRoomChange(roomIds) {
      if (roomIds.length) this.query.code = ''
    }
  }
}
</script>

<style scoped>
.electricity-summary {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  background: #f5f7fa;
  color: #27364a;
}
.query-card {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 10px 0;
  padding: 7px 12px;
  background: #fff;
  border: 1px solid #e7ebf1;
  border-radius: 8px;
}
.query-form {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}
.month-range {
  width: 250px;
}
.view-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}
.view-action-wrapper {
  display: inline-flex;
}
.view-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 7px;
  background: #fff;
  border: 1px solid #dce3ed;
  border-radius: 6px;
  cursor: pointer;
}
.view-action img {
  width: 20px;
  height: 20px;
}
.view-action--active {
  background: #ecf5ff;
  border-color: #409eff;
}
.view-action--active img {
  filter: invert(49%) sepia(81%) saturate(1418%) hue-rotate(186deg) brightness(105%) contrast(101%);
}
.view-action:focus-visible {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}
.view-action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 8px 10px 23px;
}
@media (max-width: 700px) {
  .query-card {
    flex-wrap: wrap;
  }
  .query-form {
    flex-wrap: wrap;
  }
  .month-range {
    max-width: 100%;
  }
  .view-actions {
    margin-left: auto;
  }
}
</style>
