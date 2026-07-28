<template>
  <div class="iot-page">
    <div class="kpi-row">
      <div v-for="item in kpis" :key="item.title" class="kpi-card">
        <div class="kpi-title">{{ item.title }}</div>
        <div class="kpi-value">{{ item.value }}<span class="kpi-unit">{{ item.unit }}</span></div>
      </div>
    </div>

    <el-row :gutter="16">
      <el-col :span="14">
        <div class="panel">
          <div class="panel-title">终端 / 人员状态</div>
          <el-table :data="terminals" border size="small">
            <el-table-column prop="id" label="终端编号" />
            <el-table-column prop="name" label="终端" />
            <el-table-column prop="person" label="人员" />
            <el-table-column prop="group" label="群组" />
            <el-table-column prop="channel" label="频道" />
            <el-table-column prop="status" label="状态">
              <template slot-scope="{ row }">
                <el-tag :type="termTag(row.status)" size="mini">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="battery" label="电量">
              <template slot-scope="{ row }">
                <span :class="{ low: row.battery < 20 }">{{ row.battery }}%</span>
              </template>
            </el-table-column>
            <el-table-column prop="fault" label="故障" />
            <el-table-column label="呼叫">
              <template slot-scope="{ row }">
                <el-button type="text" size="mini" :disabled="row.status !== '在线'" @click="mockCall('单呼', row)">单呼</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :span="10">
        <div class="panel">
          <div class="panel-title-row">
            <div class="panel-title">群组 / 频道</div>
            <div>
              <el-button type="text" size="mini" @click="mockCall('组呼')">组呼</el-button>
              <el-button type="text" size="mini" @click="mockCall('全呼')">全呼</el-button>
              <el-button type="text" size="mini" @click="mockCall('调度台呼叫')">调度台</el-button>
            </div>
          </div>
          <el-table :data="groups" border size="small">
            <el-table-column prop="name" label="群组" />
            <el-table-column prop="members" label="人数" />
            <el-table-column prop="channel" label="频道" />
            <el-table-column prop="remark" label="说明" />
          </el-table>
        </div>
      </el-col>
    </el-row>

    <div class="panel" style="margin-top: 16px">
      <div class="panel-title">一键求助（联动摄像机 / 处置）</div>
      <el-table :data="sos" border size="small">
        <el-table-column prop="id" label="求助号" />
        <el-table-column prop="person" label="求助人员" />
        <el-table-column prop="terminal" label="终端编号" />
        <el-table-column prop="area" label="所在区域" />
        <el-table-column prop="time" label="时间" />
        <el-table-column prop="cameras" label="联动摄像机" />
        <el-table-column prop="remark" label="说明" show-overflow-tooltip />
        <el-table-column prop="status" label="状态">
          <template slot-scope="{ row }">
            <el-tag :type="row.status === '已关闭' ? 'success' : 'danger'" size="mini">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" :disabled="row.status === '已关闭'" @click="closeSos(row)">关闭</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="14">
        <div class="panel">
          <div class="panel-title-row">
            <div class="panel-title">呼叫记录</div>
            <el-select v-model="callFilter" size="mini" clearable placeholder="呼叫类型" style="width: 140px">
              <el-option v-for="t in callTypes" :key="t" :label="t" :value="t" />
            </el-select>
          </div>
          <el-table :data="filteredCalls" border size="small">
            <el-table-column prop="id" label="记录号" />
            <el-table-column prop="type" label="类型">
              <template slot-scope="{ row }">
                <el-tag :type="row.type === '紧急呼叫' ? 'danger' : ''" size="mini">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="from" label="主叫" />
            <el-table-column prop="to" label="被叫" />
            <el-table-column prop="start" label="开始时间" />
            <el-table-column prop="end" label="结束时间" />
            <el-table-column prop="result" label="结果" />
            <el-table-column prop="record" label="录音" />
          </el-table>
          <p class="audit-tip">录音需明确授权、告知、查看权限与保存周期（仿真提示）。</p>
        </div>
      </el-col>
      <el-col :span="10">
        <div class="panel">
          <div class="panel-title">重点区域覆盖测试</div>
          <el-table :data="coverage" border size="small">
            <el-table-column prop="area" label="区域" />
            <el-table-column prop="testResult" label="测试结果">
              <template slot-scope="{ row }">
                <el-tag :type="coverTag(row.testResult)" size="mini">{{ row.testResult }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="offlinePlan" label="断网保障" show-overflow-tooltip />
            <el-table-column prop="interference" label="干扰" />
            <el-table-column prop="lowBattery" label="低电量保障" show-overflow-tooltip />
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { intercom } from '../mock/iotMockData'

export default {
  name: 'SmartIOTIntercom',
  data() {
    return {
      kpis: intercom.kpis,
      terminals: intercom.terminals,
      groups: intercom.groups,
      calls: JSON.parse(JSON.stringify(intercom.calls)),
      sos: JSON.parse(JSON.stringify(intercom.sos)),
      coverage: intercom.coverage,
      callFilter: '',
      callTypes: ['单呼', '组呼', '全呼', '调度台呼叫', '紧急呼叫']
    }
  },
  computed: {
    filteredCalls() {
      if (!this.callFilter) return this.calls
      return this.calls.filter((c) => c.type === this.callFilter)
    }
  },
  methods: {
    termTag(s) {
      if (s === '在线') return 'success'
      if (s === '离线') return 'info'
      return 'danger'
    },
    coverTag(s) {
      if (s === '合格') return 'success'
      if (s === '弱覆盖' || s === '干扰偏高') return 'warning'
      return 'info'
    },
    mockCall(type, row) {
      const target = row ? row.name : type === '全呼' ? '全部终端' : '目标群组'
      this.$message.success(`${type}已发起（仿真）：${target}`)
    },
    closeSos(row) {
      row.status = '已关闭'
      this.$message.success(`求助 ${row.id} 已关闭并进入事件处置闭环`)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../components/iotTypography.scss';

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
.low {
  color: #f56c6c;
  font-weight: 600;
}
.audit-tip {
  margin: 10px 0 0;
  font-size: 12px;
  color: #909399;
}
</style>
