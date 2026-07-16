<template>
  <div class="iot-page">
    <div class="kpi-row">
      <div v-for="item in kpis" :key="item.title" class="kpi-card" :style="{ border: item.color }">
        <div class="kpi-title">{{ item.title }}</div>
        <div class="kpi-value" :style="{ color: item.color }">
          {{ item.value }}<span class="kpi-unit">{{ item.unit }}</span>
        </div>
      </div>
    </div>

    <el-row :gutter="16">
      <el-col :span="8">
        <div class="panel">
          <div class="panel-title">消防点位状态</div>
          <el-table :data="devices" border size="small">
            <el-table-column prop="name" label="点位" min-width="120" />
            <el-table-column prop="building" label="建筑" width="80" />
            <el-table-column prop="floor" label="楼层" width="60" />
            <el-table-column prop="status" label="状态" width="70">
              <template slot-scope="{ row }">
                <el-tag :type="deviceTag(row.status)" size="mini">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :span="16">
        <div class="panel">
          <div class="panel-title-row">
            <div class="panel-title">消防事件</div>
            <el-select v-model="levelFilter" size="mini" clearable placeholder="等级" style="width: 120px">
              <el-option label="火警" value="火警" />
              <el-option label="预警" value="预警" />
              <el-option label="故障" value="故障" />
            </el-select>
          </div>
          <el-table :data="filteredEvents" border size="small">
            <el-table-column prop="id" label="事件号" />
            <el-table-column prop="level" label="等级">
              <template slot-scope="{ row }">
                <el-tag :type="levelTag(row.level)" size="mini">{{ row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" />
            <el-table-column prop="building" label="建筑" />
            <el-table-column prop="floor" label="楼层" />
            <el-table-column prop="zone" label="防火分区" />
            <el-table-column prop="device" label="设备" />
            <el-table-column prop="time" label="时间" />
            <el-table-column prop="status" label="状态" />
            <el-table-column label="操作" width="90">
              <template slot-scope="{ row }">
                <el-button type="text" size="mini" @click="openTrace(row)">留痕</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>

    <el-drawer :title="'处置留痕 - ' + (current && current.id)" :visible.sync="drawerVisible" size="420px">
      <div v-if="current" class="trace-wrap">
        <p class="trace-meta">{{ current.building }} / {{ current.floor }} / {{ current.zone }} · {{ current.type }}</p>
        <el-timeline>
          <el-timeline-item v-for="(t, i) in current.traces" :key="i" :timestamp="t.time" placement="top">
            <p>
              <b>{{ t.action }}</b> · {{ t.user }}
            </p>
            <p class="trace-remark">{{ t.remark || '—' }}</p>
          </el-timeline-item>
        </el-timeline>
        <el-alert title="火警不得由普通用户屏蔽、删除或远程复位；全过程均须留痕。" type="warning" :closable="false" show-icon />
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { fireAlarm } from '../mock/iotMockData'

export default {
  name: 'SmartIOTFireAlarm',
  data() {
    return {
      kpis: fireAlarm.kpis,
      devices: fireAlarm.devices,
      events: fireAlarm.events,
      levelFilter: '',
      drawerVisible: false,
      current: null
    }
  },
  computed: {
    filteredEvents() {
      if (!this.levelFilter) return this.events
      return this.events.filter((e) => e.level === this.levelFilter)
    }
  },
  methods: {
    deviceTag(s) {
      const map = { 正常: 'success', 火警: 'danger', 预警: 'warning', 故障: 'info', 屏蔽: '', 离线: 'info' }
      return map[s] || ''
    },
    levelTag(s) {
      if (s === '火警') return 'danger'
      if (s === '预警') return 'warning'
      return 'info'
    },
    openTrace(row) {
      this.current = row
      this.drawerVisible = true
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
  min-width: 100px;
  background: #fff;
  border-radius: 4px;
  padding: 14px 16px;
  border-top: 3px solid #409eff;
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
.trace-wrap {
  padding: 0 20px 20px;
}
.trace-meta {
  color: #606266;
  font-size: 13px;
  margin-bottom: 16px;
}
.trace-remark {
  color: #909399;
  font-size: 12px;
  margin: 4px 0 0;
}
</style>
