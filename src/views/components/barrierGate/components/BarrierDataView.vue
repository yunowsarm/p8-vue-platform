<template>
  <div class="data-view">
    <div v-if="!rows.length && !loading" class="empty-wrap"><el-empty description="当前查询条件暂无道闸数据" /></div>
    <div v-else class="dashboard-grid">
      <div class="panel chart-panel">
        <div class="panel-head">
          <h3>车辆进出趋势</h3>
          <span>次 / 日</span>
        </div>
        <div ref="dailyChart" class="chart" />
      </div>
      <div class="panel detail-panel">
        <div class="panel-head">
          <h3>当前出入明细</h3>
          <span>{{ rows.length }} 条记录</span>
        </div>
        <div class="table-wrap">
          <vxe-table
            ref="detailTable"
            :scroll-y="{ enabled: true, gt: 20, oSize: 5 }"
            :scroll-x="{ enabled: true, gt: 8, oSize: 2 }"
            show-overflow="tooltip"
            header-align="center"
            :data="rows"
            size="mini"
            stripe
            border
            height="100%"
            empty-text="暂无记录，请导入 Excel 或调整筛选条件">
            <vxe-column type="seq" title="序号" width="60" />
            <vxe-column field="plateNumber" title="车牌号" min-width="120" fixed="left" />
            <vxe-column title="关联企业" min-width="170" show-overflow="tooltip">
              <template slot-scope="scope">{{ companyLabel(scope.row) }}</template>
            </vxe-column>
            <vxe-column title="登记状态" width="100">
              <template slot-scope="scope">
                <el-tag size="mini" :type="scope.row.registered ? 'success' : 'info'">{{ scope.row.conflicting ? '登记冲突' : scope.row.registered ? '已登记' : '未登记' }}</el-tag>
              </template>
            </vxe-column>
            <vxe-column title="进入时间" width="170">
              <template slot-scope="scope">{{ formatDate(scope.row.entryTime) }}</template>
            </vxe-column>
            <vxe-column title="离开时间" width="170">
              <template slot-scope="scope">{{ formatDate(scope.row.exitTime) }}</template>
            </vxe-column>
            <vxe-column v-for="column in recordColumns" :key="column.key" :field="column.key" :title="column.label" :min-width="column.width || 110" show-overflow="tooltip" />
          </vxe-table>
        </div>
      </div>
      <div class="panel chart-panel">
        <div class="panel-head">
          <h3>停留时长分布</h3>
          <span>仅统计有效完整记录</span>
        </div>
        <div ref="durationChart" class="chart" />
      </div>
      <div class="panel chart-panel">
        <div class="panel-head">
          <h3>通道通行量</h3>
          <span>前 10 个通道 / 次</span>
        </div>
        <div ref="channelChart" class="chart" />
      </div>
    </div>
  </div>
</template>
<script>
import charts from '../charts'
import { dateLabel } from '../data'
export default {
  name: 'BarrierDataView',
  mixins: [charts],
  props: { rows: { type: Array, default: () => [] }, stats: { type: Object, required: true }, loading: Boolean },
  data() {
    return {
      recordColumns: [
        { key: 'parkingDuration', label: '停车时长', width: 150 },
        { key: 'entryChannel', label: '进入通道' },
        { key: 'exitChannel', label: '离开通道' },
        { key: 'cardCode', label: '卡片内码' },
        { key: 'serialNumber', label: '自编号' },
        { key: 'receivableAmount', label: '应收费(元)' },
        { key: 'actualAmount', label: '实收费(元)' },
        { key: 'discountAmount', label: '优惠(元)' },
        { key: 'boothAmount', label: '岗亭实收费(元)', width: 130 },
        { key: 'onlineAmount', label: '网络付费(元)' },
        { key: 'centralAmount', label: '中央实收费(元)', width: 130 },
        { key: 'cardType', label: '卡片类别' },
        { key: 'chargeType', label: '收费类型' },
        { key: 'operator', label: '操作员' },
        { key: 'ownerName', label: '车主姓名' },
        { key: 'parkingSpaceNumber', label: '车位号' },
        { key: 'plateColor', label: '车牌颜色' },
        { key: 'entryRemark', label: '进入备注', width: 180 },
        { key: 'exitRemark', label: '离开备注', width: 180 }
      ]
    }
  },
  methods: {
    formatDate: dateLabel,
    companyLabel(row) {
      return row.companyName || (row.conflicting ? '登记冲突' : '未关联企业')
    }
  }
}
</script>
<style scoped>
.data-view {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
.empty-wrap {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  height: 100%;
  gap: 8px;
}
.panel {
  background: #fff;
  border: 1px solid #e7ebf1;
  border-radius: 10px;
  box-shadow: 0 3px 14px rgba(34, 54, 82, 0.035);
  padding: 12px;
  box-sizing: border-box;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
.panel-head h3 {
  font-size: 15px;
  margin: 0;
}
.panel-head span {
  color: #99a4b3;
  font-size: 11px;
}
.chart,
.table-wrap {
  flex: 1;
  min-height: 0;
  min-width: 0;
  width: 100%;
}
@media (max-width: 1250px) {
  .data-view {
    overflow: auto;
  }
  .dashboard-grid {
    grid-template-columns: 1fr;
    grid-template-rows: none;
    grid-auto-rows: 360px;
    height: auto;
  }
}
</style>
