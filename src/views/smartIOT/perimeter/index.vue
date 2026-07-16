<template>
  <div class="iot-page">
    <div class="kpi-row">
      <div v-for="item in kpis" :key="item.title" class="kpi-card">
        <div class="kpi-title">{{ item.title }}</div>
        <div class="kpi-value">{{ item.value }}<span class="kpi-unit">{{ item.unit }}</span></div>
      </div>
    </div>

    <el-row :gutter="16">
      <el-col :span="10">
        <div class="panel">
          <div class="panel-title">园区周界示意</div>
          <div class="map-plane">
            <div class="map-fence"></div>
            <div
              v-for="z in zones"
              :key="z.id"
              class="map-dot"
              :class="{ armed: z.armed, disarmed: !z.armed }"
              :style="{ left: z.x + '%', top: z.y + '%' }"
              :title="z.name + (z.armed ? '（布防）' : '（撤防）')"
            >
              <span>{{ z.name }}</span>
            </div>
          </div>
          <div class="map-legend">
            <span><i class="dot armed"></i>布防</span>
            <span><i class="dot disarmed"></i>撤防</span>
          </div>
        </div>
      </el-col>
      <el-col :span="14">
        <div class="panel">
          <div class="panel-title">设备状态</div>
          <el-table :data="devices" border size="small" max-height="280">
            <el-table-column prop="id" label="编号" width="100" />
            <el-table-column prop="name" label="设备" min-width="120" />
            <el-table-column prop="type" label="类型" width="90" />
            <el-table-column prop="zone" label="防区" width="110" />
            <el-table-column prop="status" label="状态" width="80">
              <template slot-scope="{ row }">
                <el-tag :type="statusType(row.status)" size="mini">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="armed" label="布撤防" width="80" />
          </el-table>
        </div>
      </el-col>
    </el-row>

    <div class="panel" style="margin-top: 16px">
      <div class="panel-title-row">
        <div class="panel-title">告警处置</div>
        <el-select v-model="alarmFilter" size="mini" clearable placeholder="处置状态" style="width: 140px">
          <el-option v-for="s in alarmStatuses" :key="s" :label="s" :value="s" />
        </el-select>
      </div>
      <el-table :data="filteredAlarms" border size="small">
        <el-table-column prop="id" label="告警号" width="90" />
        <el-table-column prop="type" label="类型" width="110" />
        <el-table-column prop="zone" label="位置" width="120" />
        <el-table-column prop="device" label="设备" width="100" />
        <el-table-column prop="time" label="时间" width="160" />
        <el-table-column prop="snapshot" label="抓拍/录像" width="100" />
        <el-table-column prop="status" label="状态" width="90">
          <template slot-scope="{ row }">
            <el-tag :type="alarmTag(row.status)" size="mini">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="220" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" :disabled="!canAct(row)" @click="updateAlarm(row, '处置中')">确认</el-button>
            <el-button type="text" size="mini" :disabled="!canAct(row)" @click="updateAlarm(row, '误报')">误报</el-button>
            <el-button type="text" size="mini" :disabled="row.status === '已关闭'" @click="updateAlarm(row, '派单中')">派单</el-button>
            <el-button type="text" size="mini" :disabled="row.status === '已关闭'" @click="updateAlarm(row, '已关闭')">关闭</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { perimeter } from '../mock/iotMockData'

export default {
  name: 'SmartIOTPerimeter',
  data() {
    return {
      kpis: perimeter.kpis,
      zones: perimeter.zones,
      devices: perimeter.devices,
      alarms: JSON.parse(JSON.stringify(perimeter.alarms)),
      alarmFilter: '',
      alarmStatuses: ['待确认', '处置中', '派单中', '误报', '已关闭']
    }
  },
  computed: {
    filteredAlarms() {
      if (!this.alarmFilter) return this.alarms
      return this.alarms.filter((a) => a.status === this.alarmFilter)
    }
  },
  methods: {
    statusType(s) {
      if (s === '在线') return 'success'
      if (s === '离线') return 'info'
      return 'danger'
    },
    alarmTag(s) {
      const map = { 待确认: 'danger', 处置中: 'warning', 派单中: '', 误报: 'info', 已关闭: 'success' }
      return map[s] || ''
    },
    canAct(row) {
      return row.status === '待确认' || row.status === '处置中' || row.status === '派单中'
    },
    updateAlarm(row, status) {
      row.status = status
      this.$message.success(`告警 ${row.id} 已更新为「${status}」`)
    }
  }
}
</script>

<style lang="scss" scoped>
.iot-page {
  padding: 16px;
  background: #f5f7fa;
  min-height: 100%;
}
.kpi-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.kpi-card {
  flex: 1;
  min-width: 120px;
  background: #fff;
  border-radius: 4px;
  padding: 14px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.kpi-title {
  color: #909399;
  font-size: 13px;
}
.kpi-value {
  margin-top: 6px;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}
.kpi-unit {
  margin-left: 4px;
  font-size: 12px;
  font-weight: 400;
  color: #909399;
}
.panel {
  background: #fff;
  border-radius: 4px;
  padding: 12px 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.panel-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #303133;
}
.panel-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  .panel-title {
    margin-bottom: 0;
  }
}
.map-plane {
  position: relative;
  height: 260px;
  background: linear-gradient(135deg, #e8f3ec 0%, #dcebe3 100%);
  border: 1px solid #c5d9cb;
  border-radius: 4px;
  overflow: hidden;
}
.map-fence {
  position: absolute;
  inset: 18px;
  border: 2px dashed #67c23a;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.35);
}
.map-dot {
  position: absolute;
  transform: translate(-50%, -50%);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  color: #fff;
  white-space: nowrap;
  cursor: default;
  &.armed {
    background: #67c23a;
  }
  &.disarmed {
    background: #909399;
  }
}
.map-legend {
  margin-top: 8px;
  font-size: 12px;
  color: #606266;
  display: flex;
  gap: 16px;
  .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 4px;
    &.armed {
      background: #67c23a;
    }
    &.disarmed {
      background: #909399;
    }
  }
}
</style>
