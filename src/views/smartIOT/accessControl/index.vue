<template>
  <div class="iot-page">
    <div class="kpi-row">
      <div v-for="item in kpis" :key="item.title" class="kpi-card">
        <div class="kpi-title">{{ item.title }}</div>
        <div class="kpi-value">{{ item.value }}<span class="kpi-unit">{{ item.unit }}</span></div>
      </div>
    </div>

    <el-row :gutter="16">
      <el-col :span="8">
        <div class="panel">
          <div class="panel-title-row">
            <div class="panel-title">门禁设备</div>
          </div>
          <el-table :data="devices" border size="small" max-height="300">
            <el-table-column prop="name" label="门点" min-width="120" />
            <el-table-column prop="status" label="状态" width="90">
              <template slot-scope="{ row }">
                <el-tag :type="deviceTag(row.status)" size="mini">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="mode" label="模式" width="90" />
            <el-table-column label="操作" width="90">
              <template slot-scope="{ row }">
                <el-button type="text" size="mini" @click="remoteOpen(row)">远程开门</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :span="16">
        <div class="panel">
          <div class="panel-title-row">
            <div class="panel-title">通行 / 异常事件</div>
            <el-checkbox v-model="onlyAbnormal" size="mini">仅异常</el-checkbox>
          </div>
          <el-table :data="filteredEvents" border size="small" max-height="300">
            <el-table-column prop="time" label="时间" width="150" />
            <el-table-column prop="person" label="人员" width="90" />
            <el-table-column prop="org" label="组织" width="90" />
            <el-table-column prop="door" label="门点" min-width="120" />
            <el-table-column prop="auth" label="认证" width="80" />
            <el-table-column prop="result" label="结果" width="110">
              <template slot-scope="{ row }">
                <el-tag :type="row.abnormal ? 'danger' : 'success'" size="mini">{{ row.result }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>

    <div class="panel" style="margin-top: 16px">
      <div class="panel-title">通行权限</div>
      <el-table :data="permissions" border size="small">
        <el-table-column prop="person" label="人员" width="110" />
        <el-table-column prop="org" label="组织" width="90" />
        <el-table-column prop="doors" label="门区" min-width="140" />
        <el-table-column prop="week" label="星期" width="110" />
        <el-table-column prop="period" label="时段" width="120" />
        <el-table-column prop="validTo" label="有效期" width="110" />
        <el-table-column prop="sync" label="下发状态" width="110">
          <template slot-scope="{ row }">
            <el-tag :type="syncTag(row.sync)" size="mini">{{ row.sync }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-if="openLogs.length" class="panel" style="margin-top: 16px">
      <div class="panel-title">远程开门审计（本地仿真）</div>
      <el-table :data="openLogs" border size="small" max-height="180">
        <el-table-column prop="time" label="时间" width="160" />
        <el-table-column prop="door" label="门点" min-width="140" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="reason" label="原因" min-width="160" />
      </el-table>
    </div>
  </div>
</template>

<script>
import { accessControl } from '../mock/iotMockData'

export default {
  name: 'SmartIOTAccessControl',
  data() {
    return {
      kpis: accessControl.kpis,
      devices: accessControl.devices,
      events: accessControl.events,
      permissions: accessControl.permissions,
      onlyAbnormal: false,
      openLogs: []
    }
  },
  computed: {
    filteredEvents() {
      if (!this.onlyAbnormal) return this.events
      return this.events.filter((e) => e.abnormal)
    }
  },
  methods: {
    deviceTag(s) {
      if (s === '在线') return 'success'
      if (s === '离线') return 'info'
      return 'danger'
    },
    syncTag(s) {
      if (s === '成功') return 'success'
      if (s === '失败') return 'danger'
      if (s === '离线待同步') return 'warning'
      return 'info'
    },
    remoteOpen(row) {
      this.$confirm(`确认为「${row.name}」执行远程开门？该操作将记入审计。`, '二次确认', {
        type: 'warning',
        confirmButtonText: '确认开门',
        cancelButtonText: '取消'
      })
        .then(() => {
          const now = this.formatNow()
          this.openLogs.unshift({
            time: now,
            door: row.name,
            operator: '当前用户',
            reason: '值班远程开门'
          })
          this.$message.success(`已远程开启 ${row.name}，并写入审计记录`)
        })
        .catch(() => {})
    },
    formatNow() {
      const d = new Date()
      const p = (n) => (n < 10 ? '0' + n : '' + n)
      return (
        d.getFullYear() +
        '-' +
        p(d.getMonth() + 1) +
        '-' +
        p(d.getDate()) +
        ' ' +
        p(d.getHours()) +
        ':' +
        p(d.getMinutes()) +
        ':' +
        p(d.getSeconds())
      )
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
</style>
