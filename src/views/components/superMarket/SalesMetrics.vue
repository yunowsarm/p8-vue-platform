<template>
  <section class="summary-grid">
    <article class="metric">
      <span>明细金额合计</span>
      <strong>
        {{ hasData && report.invalidAmount < filteredRows.length ? numberText(report.amount) : '—' }}
        <small>元</small>
      </strong>
      <p>接口金额原值汇总</p>
      <i class="el-icon-coin"></i>
    </article>
    <article class="metric">
      <span>交易单数</span>
      <strong>
        {{ hasData ? report.orders.size : '—' }}
        <small>单</small>
      </strong>
      <p>按设备与单号去重</p>
      <i class="el-icon-tickets"></i>
    </article>
    <article class="metric">
      <span>销售 / 退货金额</span>
      <strong class="split-value">
        {{ knownType ? numberText(report.sales) : '—' }}
        <em>/</em>
        {{ knownType ? numberText(report.returns) : '—' }}
      </strong>
      <p>仅统计业务类型 A / B · 元</p>
      <i class="el-icon-sort"></i>
    </article>
    <article class="metric">
      <span>有交易的设备</span>
      <strong>
        {{ hasData ? report.devices.size : '—' }}
        <small>台</small>
      </strong>
      <p>{{ filteredRows.length }} 条筛选结果 · {{ rows.length }} 条已加载</p>
      <i class="el-icon-monitor"></i>
    </article>
  </section>
</template>
<script>
import { summarize, numberText, isKnownType } from './fields'
export default {
  name: 'SuperMarketMetrics',
  props: { rows: { type: Array, default: () => [] } },
  computed: {
    report() {
      return summarize(this.rows)
    },
    filteredRows() {
      return this.rows
    },
    hasData() {
      return !!this.rows.length
    },
    knownType() {
      return this.rows.some((row) => isKnownType(row.b01058))
    }
  },
  methods: { numberText }
}
</script>
<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin: 0 0 10px;
}
.metric {
  padding: 14px;
  background: #fff;
  border: 1px solid #e2e8f1;
  border-radius: 8px;
  position: relative;
  min-width: 0;
}
.metric > span {
  font-size: 12px;
  color: #718096;
}
.metric strong {
  display: block;
  margin: 8px 0;
  color: #365c9f;
  font-size: 23px;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.metric small {
  font-size: 12px;
  font-weight: normal;
  margin-left: 5px;
}
.metric p {
  font-size: 11px;
  color: #7b889a;
  margin: 0;
}
.metric > i {
  position: absolute;
  right: 14px;
  top: 14px;
  color: #9aaecb;
  font-size: 18px;
}
.split-value em {
  font-style: normal;
  color: #a2acba;
  margin: 0 6px;
}
@media (max-width: 1000px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 600px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
