<template>
  <div class="data-view">
    <div class="dashboard-grid">
      <section class="panel trend-panel">
        <div class="panel-head">
          <h3>明细金额趋势</h3>
          <span>元 / 接收日期</span>
        </div>
        <sales-trend :rows="rows" />
        <p class="data-note">按接收日期统计，接收时间可能晚于实际交易时间。</p>
      </section>
      <section class="panel detail-panel">
        <div class="panel-head">
          <h3>当前选择明细</h3>
          <span>{{ rows.length }} 条记录</span>
        </div>
        <div class="detail-table-wrap">
          <el-table :data="pageRows" stripe height="100%" size="mini" border class="sales-table" :empty-text="error ? '查询失败，请重试' : '当前筛选范围暂无销售明细'">
            <el-table-column align="center" header-align="center" label="单号" prop="o01329" show-overflow-tooltip>
              <template slot-scope="scope">
                <span class="order-number">{{ display(scope.row.o01329) }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" header-align="center" label="商品" show-overflow-tooltip>
              <template slot-scope="scope">
                <div class="product-name">{{ scope.row.productName || '未匹配商品名称' }}</div>
                <!-- <div class="secondary">标识：{{ display(scope.row.o01292) }}</div> -->
              </template>
            </el-table-column>
            <el-table-column align="center" header-align="center" label="规格 / 单位">
              <template slot-scope="scope">{{ display(scope.row.productSpec) }} / {{ display(scope.row.productUnit) }}</template>
            </el-table-column>
            <el-table-column align="center" header-align="center" label="业务类型">
              <template slot-scope="scope">
                <el-tag size="small" :type="typeInfo(scope.row.b01058).tag">{{ typeInfo(scope.row.b01058).label }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" header-align="center" label="数量">
              <template slot-scope="scope">{{ numberText(scope.row.b00741, 4) }}</template>
            </el-table-column>
            <el-table-column align="center" header-align="center" label="金额（元）">
              <template slot-scope="scope">
                <span class="amount">{{ numberText(scope.row.b00517) }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" header-align="center" prop="deviceId" label="设备编号" show-overflow-tooltip />
            <el-table-column align="center" header-align="center" prop="receivedAt" label="接收时间" width="175" />
            <el-table-column align="center" header-align="center" label="操作">
              <template slot-scope="scope"><el-button type="text" size="small" @click="$emit('detail', scope.row)">详情</el-button></template>
            </el-table-column>
          </el-table>
        </div>
        <div class="table-footer">
          <span>共 {{ filteredRows.length }} 条明细</span>
          <el-pagination :current-page.sync="pageNo" :page-size.sync="pageSize" :page-sizes="[20, 50, 100]" :total="filteredRows.length" layout="sizes, prev, pager, next" @size-change="pageNo = 1" />
        </div>
      </section>
      <section class="panel device-panel">
        <div class="panel-head">
          <h3>设备金额汇总</h3>
          <span>按设备编号 · 金额原值</span>
        </div>
        <el-table :data="deviceRows" size="mini" stripe border height="100%" empty-text="暂无设备数据">
          <el-table-column align="center" header-align="center" prop="name" label="设备编号" show-overflow-tooltip />
          <el-table-column align="center" header-align="center" prop="count" label="明细数" />
          <el-table-column align="center" header-align="center" label="金额（元）">
            <template slot-scope="scope">{{ numberText(scope.row.amount) }}</template>
          </el-table-column>
        </el-table>
      </section>
    </div>
  </div>
</template>
<script>
import SalesTrend from './SalesTrend.vue'
import { numberText, numeric, typeInfo } from '../fields'
export default {
  name: 'SuperMarketSalesDataView',
  components: { SalesTrend },
  props: { rows: { type: Array, default: () => [] }, error: { type: String, default: '' } },
  data() {
    return { pageNo: 1, pageSize: 20 }
  },
  computed: {
    filteredRows() {
      return this.rows
    },
    pageRows() {
      return this.rows.slice((this.pageNo - 1) * this.pageSize, this.pageNo * this.pageSize)
    },
    deviceRows() {
      const groups = new Map()
      this.rows.forEach((row) => {
        const key = row.deviceId || '未识别设备'
        if (!groups.has(key)) groups.set(key, { name: key, count: 0, amount: null })
        const item = groups.get(key)
        item.count++
        const amount = numeric(row.b00517)
        if (amount !== null) item.amount = (item.amount || 0) + amount
      })
      return [...groups.values()].sort((a, b) => (b.amount || 0) - (a.amount || 0))
    }
  },
  watch: {
    rows() {
      this.pageNo = 1
    }
  },
  methods: {
    numberText,
    typeInfo,
    display(value) {
      return value == null || value === '' ? '—' : String(value)
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
.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.4fr);
  grid-template-rows: repeat(2, minmax(0, 1fr));
  height: 100%;
  gap: 8px;
}
.panel {
  min-width: 0;
  min-height: 0;
  padding: 12px;
  box-sizing: border-box;
  background: #fff;
  border: 1px solid #e7ebf1;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 3px 14px rgba(34, 54, 82, 0.035);
}
.detail-panel {
  grid-column: 2;
  grid-row: 1 / 3;
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
h3 {
  margin: 0;
  font-size: 14px;
  color: #27364a;
}
.panel-head span,
.data-note,
.secondary {
  font-size: 11px;
  color: #8b97a7;
}
.data-note {
  margin: 4px 0 0;
  line-height: 1.6;
}
.detail-table-wrap {
  flex: 1;
  min-height: 0;
}
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 11px;
  color: #7b889a;
  padding-top: 10px;
}
.order-number {
  color: #365c9f;
}
.amount {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
@media (max-width: 1250px) {
  .data-view {
    overflow: auto;
  }
  .dashboard-grid {
    grid-template-columns: 1fr;
    grid-template-rows: none;
    height: auto;
  }
  .panel {
    min-height: 300px;
  }
  .detail-panel {
    grid-column: auto;
    grid-row: auto;
    height: 480px;
  }
  .device-panel {
    height: 300px;
  }
}
</style>
