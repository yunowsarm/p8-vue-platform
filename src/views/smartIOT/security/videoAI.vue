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
          <div class="panel-title-row">
            <div class="panel-title">视频质量监测</div>
            <el-select v-model="qualityFilter" size="mini" clearable placeholder="异常类型" style="width: 140px">
              <el-option v-for="t in qualityTypes" :key="t" :label="t" :value="t" />
            </el-select>
          </div>
          <el-table :data="filteredQuality" border size="small">
            <el-table-column prop="id" label="摄像机" />
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="area" label="区域" />
            <el-table-column prop="issue" label="状态">
              <template slot-scope="{ row }">
                <el-tag :type="row.issue === '正常' ? 'success' : 'danger'" size="mini">{{ row.issue }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="updatedAt" label="更新时间" />
          </el-table>
        </div>
      </el-col>
      <el-col :span="14">
        <div class="panel">
          <div class="panel-title">点位算法配置（落到点位）</div>
          <el-table :data="configs" border size="small">
            <el-table-column prop="point" label="点位" />
            <el-table-column prop="camera" label="摄像机" />
            <el-table-column prop="algorithm" label="算法" />
            <el-table-column prop="region" label="检测区域" show-overflow-tooltip />
            <el-table-column prop="exclude" label="排除区域" show-overflow-tooltip />
            <el-table-column prop="period" label="生效时段" show-overflow-tooltip />
            <el-table-column prop="duration" label="目标持续" />
            <el-table-column prop="sensitivity" label="灵敏度" />
            <el-table-column prop="suppress" label="抑制时间" />
            <el-table-column prop="status" label="状态">
              <template slot-scope="{ row }">
                <el-tag :type="row.status === '启用' ? 'success' : 'info'" size="mini">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>

    <div class="panel" style="margin-top: 16px">
      <div class="panel-title-row">
        <div class="panel-title">智能分析事件 / 告警闭环</div>
        <el-select v-model="eventFilter" size="mini" clearable placeholder="处置状态" style="width: 140px">
          <el-option v-for="s in eventStatuses" :key="s" :label="s" :value="s" />
        </el-select>
      </div>
      <el-table :data="filteredEvents" border size="small">
        <el-table-column prop="id" label="事件号" />
        <el-table-column prop="algorithm" label="算法类型" />
        <el-table-column prop="point" label="位置" />
        <el-table-column prop="camera" label="摄像机" />
        <el-table-column prop="time" label="时间" />
        <el-table-column prop="snapshot" label="抓拍" />
        <el-table-column prop="video" label="事件录像" />
        <el-table-column prop="status" label="状态">
          <template slot-scope="{ row }">
            <el-tag :type="eventTag(row.status)" size="mini">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" @click="preview(row)">查看</el-button>
            <el-button type="text" size="mini" :disabled="!canAct(row)" @click="updateEvent(row, '处置中')">确认</el-button>
            <el-button type="text" size="mini" :disabled="!canAct(row)" @click="updateEvent(row, '误报')">误报</el-button>
            <el-button type="text" size="mini" :disabled="row.status === '已关闭'" @click="updateEvent(row, '已关闭')">关闭</el-button>
          </template>
        </el-table-column>
      </el-table>
      <p class="audit-tip">查看/导出实行分级授权、审计与水印；涉及人脸等敏感信息按最小必要原则采集使用（仿真提示）。</p>
    </div>

    <el-dialog :title="'事件预览 - ' + (current && current.id)" :visible.sync="previewVisible" width="560px">
      <div v-if="current" class="preview-body">
        <div class="preview-video">实时视频 / 事件录像（仿真占位）</div>
        <p>算法：{{ current.algorithm }}</p>
        <p>点位：{{ current.point }}（{{ current.camera }}）</p>
        <p>时间：{{ current.time }}</p>
        <p>抓拍：{{ current.snapshot }} · 录像：{{ current.video }}</p>
        <el-alert title="导出操作将记录审计日志并叠加水印（仿真）" type="info" :closable="false" show-icon />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { videoAI } from '../mock/iotMockData'

export default {
  name: 'SmartIOTVideoAI',
  data() {
    return {
      kpis: videoAI.kpis,
      quality: videoAI.quality,
      configs: videoAI.configs,
      events: JSON.parse(JSON.stringify(videoAI.events)),
      qualityFilter: '',
      eventFilter: '',
      qualityTypes: ['离线', '视频中断', '画面冻结', '画面遮挡', '角度偏移', '存储异常'],
      eventStatuses: ['待确认', '处置中', '派单中', '误报', '已关闭'],
      previewVisible: false,
      current: null
    }
  },
  computed: {
    filteredQuality() {
      if (!this.qualityFilter) return this.quality
      return this.quality.filter((q) => q.issue === this.qualityFilter)
    },
    filteredEvents() {
      if (!this.eventFilter) return this.events
      return this.events.filter((e) => e.status === this.eventFilter)
    }
  },
  methods: {
    eventTag(s) {
      const map = { 待确认: 'danger', 处置中: 'warning', 派单中: '', 误报: 'info', 已关闭: 'success' }
      return map[s] || ''
    },
    canAct(row) {
      return row.status === '待确认' || row.status === '处置中' || row.status === '派单中'
    },
    preview(row) {
      this.current = row
      this.previewVisible = true
    },
    updateEvent(row, status) {
      row.status = status
      this.$message.success(`事件 ${row.id} 已更新为「${status}」`)
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
.audit-tip {
  margin: 10px 0 0;
  font-size: 12px;
  color: #909399;
}
.preview-body p {
  margin: 6px 0;
  color: #606266;
  font-size: 13px;
}
.preview-video {
  height: 180px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1f2d3d;
  color: #c0c4cc;
  border-radius: 4px;
  font-size: 13px;
}
</style>
