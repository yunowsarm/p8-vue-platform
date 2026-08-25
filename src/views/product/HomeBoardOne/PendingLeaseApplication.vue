<template>
  <section class="pending-lease-application" aria-label="租赁申请待办">
    <header>
      <div>
        <i class="el-icon-office-building" />
        <span>租赁申请待办</span>
        <el-badge :value="pendingRecords.length + processingRecords.length" :hidden="!pendingRecords.length && !processingRecords.length" type="danger" />
      </div>
    </header>
    <div class="status-columns">
      <section v-for="column in statusColumns" :key="column.key" class="status-column">
        <div class="column-title">
          <span>{{ column.label }}</span>
          <el-badge :value="column.records.length" :hidden="!column.records.length" :type="column.badgeType" />
        </div>
        <div v-if="column.records.length" class="lease-list">
          <article v-for="item in column.records" :key="item.id" class="lease-item" tabindex="0" role="link" @click="goToLeaseManage" @keydown.enter="goToLeaseManage">
            <span :class="['lease-icon', item.applyType]"><i :class="typeIcon(item.applyType)" /></span>
            <div class="lease-content">
              <b>{{ applyTypeText(item.applyType) }} · {{ item.companyName }}</b>
              <small>{{ item.currentLocation }} · {{ item.applyDate }}</small>
            </div>
            <el-tag :type="column.tagType" size="mini">{{ column.label }}</el-tag>
          </article>
        </div>
        <p v-else class="column-empty">暂无{{ column.label }}申请</p>
      </section>
    </div>
  </section>
</template>

<script>
export default {
  name: 'PendingLeaseApplication',
  data() {
    return { pendingRecords: [], processingRecords: [] }
  },
  computed: {
    statusColumns() {
      return [
        { key: 'pending', label: '待处理', records: this.pendingRecords, tagType: 'warning', badgeType: 'danger' },
        { key: 'processing', label: '处理中', records: this.processingRecords, tagType: '', badgeType: 'primary' }
      ]
    }
  },
  created() {
    this.loadRecords()
  },
  methods: {
    async loadRecords() {
      try {
        if (!this.$api || !this.$api['tobLeaseApplication.list']) throw new Error('API unavailable')
        const [pending, processing] = await Promise.all([this.queryByStatus(0), this.queryByStatus(3)])
        this.pendingRecords = pending
        this.processingRecords = processing
      } catch (error) {
        const records = this.mockRecords()
        this.pendingRecords = records.filter((item) => String(item.status) === '0')
        this.processingRecords = records.filter((item) => String(item.status) === '3')
      }
    },
    async queryByStatus(status) {
      const result = this.unwrapResponse(await this.$api['tobLeaseApplication.list']({ pageNo: 1, pageSize: 3, type: 1, status }))
      const list = result.records || result.list || result.rows || result
      return (Array.isArray(list) ? list : []).filter((item) => String(item.status) === String(status)).slice(0, 3)
    },
    mockRecords() {
      return [
        { id: 'LA20260824001', applyType: 'renew', companyName: '淳通智惠科技有限公司', currentLocation: 'A 座 501 室', applyDate: '08-22 10:30', status: '0' },
        { id: 'LA20260818002', applyType: 'expand', companyName: '星河数据服务有限公司', currentLocation: 'B 座 803 室', applyDate: '08-18 15:20', status: '0' },
        { id: 'LA20260821003', applyType: 'vacate', companyName: '新域创意设计工作室', currentLocation: 'C 座 306 室', applyDate: '08-21 09:40', status: '3' }
      ]
    },
    goToLeaseManage() {
      this.$router.push({ name: 'toOManage_leaseApplicationManage' })
    },
    typeIcon(type) {
      return { renew: 'el-icon-refresh-right', vacate: 'el-icon-switch-button', expand: 'el-icon-full-screen' }[type] || 'el-icon-office-building'
    },
    applyTypeText(type) {
      return { renew: '续租申请', vacate: '退租申请', expand: '扩租申请' }[type] || type || '-'
    },
    unwrapResponse(response) {
      if (response && response.result !== undefined) return response.result
      if (response && response.data && response.data.result !== undefined) return response.data.result
      return response && response.data !== undefined ? response.data : response
    }
  }
}
</script>

<style lang="scss" scoped>
.pending-lease-application {
  min-height: 0;
  padding: 16px;
  box-sizing: border-box;
  align-self: start;
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #334b69;
  font-size: 14px;
  font-weight: 600;
}
header i {
  margin-right: 6px;
  color: #2e7cdf;
}
::v-deep .el-badge {
  margin-left: 8px;
}
::v-deep .el-badge__content {
  top: 1px;
}
.lease-list {
  margin-top: 4px;
}
.status-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}
.status-column {
  min-width: 0;
  padding: 10px 12px 12px;
  border-radius: 8px;
  background: #fff;
}
.column-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #52667e;
  font-size: 12px;
  font-weight: 600;
}
.column-title::before {
  width: 3px;
  height: 13px;
  border-radius: 2px;
  background: #f5ad42;
  content: '';
}
.status-column:nth-child(2) .column-title::before {
  background: #398bf3;
}
.column-empty {
  margin: 8px 0 0;
  padding: 8px 0 2px;
  color: #a3afbd;
  font-size: 12px;
  line-height: 28px;
}
.lease-item {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  margin-top: 7px;
  padding: 9px 10px;
  border: 1px solid #edf1f5;
  border-radius: 6px;
  background: #fafafa;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.lease-item:hover {
  border-color: #cfe2fb;
  background: #f7faff;
}
.lease-item:focus {
  outline: 2px solid #8bbbf6;
  outline-offset: 2px;
}
.lease-icon {
  display: inline-flex;
  width: 25px;
  height: 25px;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  background: #eaf3ff;
  color: #2f7cdf;
  font-size: 13px;
  flex: 0 0 auto;
}
.lease-icon.expand {
  background: #e9f8f0;
  color: #28a36b;
}
.lease-icon.vacate {
  background: #fff1e8;
  color: #dd8a32;
}
.lease-content {
  min-width: 0;
  flex: 1;
}
.lease-content b,
.lease-content small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lease-content b {
  color: #52667e;
  font-size: 12px;
}
.lease-content small {
  margin-top: 3px;
  color: #9aa6b5;
  font-size: 11px;
}
@media (max-width: 760px) {
  .status-columns {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}
</style>
