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
          <div class="panel-title">分区车位占用</div>
          <el-table :data="spaces" border size="small" max-height="280">
            <el-table-column prop="area" label="区域" min-width="120" />
            <el-table-column prop="total" label="总数" width="70" />
            <el-table-column prop="free" label="空余" width="70" />
            <el-table-column prop="occupied" label="占用" width="70" />
            <el-table-column label="占用率" width="90">
              <template slot-scope="{ row }">
                {{ ((row.occupied / row.total) * 100).toFixed(1) }}%
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :span="14">
        <div class="panel">
          <div class="panel-title">道闸 / 相机 / 诱导屏</div>
          <el-table :data="devices" border size="small" max-height="280">
            <el-table-column prop="id" label="编号" width="100" />
            <el-table-column prop="name" label="设备" min-width="140" />
            <el-table-column prop="type" label="类型" width="90" />
            <el-table-column prop="status" label="状态" width="90">
              <template slot-scope="{ row }">
                <el-tag :type="row.status === '正常' ? 'success' : row.status === '故障' ? 'danger' : 'info'" size="mini">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>

    <div class="panel" style="margin-top: 16px">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="违停事件" name="violation">
          <el-table :data="violations" border size="small">
            <el-table-column prop="id" label="事件号" width="80" />
            <el-table-column prop="plate" label="车牌" width="100" />
            <el-table-column prop="type" label="违停类型" width="120" />
            <el-table-column prop="area" label="位置" min-width="140" />
            <el-table-column prop="startTime" label="开始时间" width="150" />
            <el-table-column prop="duration" label="持续时间" width="90" />
            <el-table-column prop="image" label="图片" width="80" />
            <el-table-column prop="status" label="状态" width="100" />
            <el-table-column label="操作" width="160" fixed="right">
              <template slot-scope="{ row }">
                <el-button type="text" size="mini" @click="notify(row)">语音提醒</el-button>
                <el-button type="text" size="mini" @click="toWorkOrder(row)">转工单</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="车辆 / 黑白名单" name="vehicle">
          <el-table :data="vehicles" border size="small">
            <el-table-column prop="plate" label="车牌" width="100" />
            <el-table-column prop="type" label="车辆类型" width="90" />
            <el-table-column prop="owner" label="车主" width="100" />
            <el-table-column prop="validTo" label="有效期" width="110" />
            <el-table-column prop="areas" label="可进入区域" min-width="140" />
            <el-table-column prop="list" label="名单" width="90">
              <template slot-scope="{ row }">
                <el-tag
                  :type="row.list === '黑名单' ? 'danger' : row.list === '白名单' ? 'success' : 'info'"
                  size="mini"
                >
                  {{ row.list }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="90" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { parking } from '../mock/iotMockData'

export default {
  name: 'SmartIOTParking',
  data() {
    return {
      kpis: parking.kpis,
      spaces: parking.spaces,
      devices: parking.devices,
      violations: JSON.parse(JSON.stringify(parking.violations)),
      vehicles: parking.vehicles,
      activeTab: 'violation'
    }
  },
  methods: {
    notify(row) {
      row.status = '语音提醒'
      this.$message.success(`已向 ${row.plate} 推送语音提醒`)
    },
    toWorkOrder(row) {
      row.status = '转工单'
      this.$message.success(`违停 ${row.id} 已转处置工单`)
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
</style>
